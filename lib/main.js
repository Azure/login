"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const crypto = __importStar(require("crypto"));
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const actions_secret_parser_1 = require("actions-secret-parser");
const ServicePrincipalLogin_1 = require("./PowerShell/ServicePrincipalLogin");
const ManagedIdentityLogin_1 = require("./PowerShell/ManagedIdentityLogin");
var azPath;
var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
var azPSHostEnv = !!process.env.AZUREPS_HOST_ENVIRONMENT ? `${process.env.AZUREPS_HOST_ENVIRONMENT}` : "";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Set user agent variable
            var isAzCLISuccess = false;
            let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
            let actionName = 'AzureLogin';
            let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
            let azurePSHostEnv = (!!azPSHostEnv ? `${azPSHostEnv}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
            core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
            core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azurePSHostEnv);
            azPath = yield io.which("az", true);
            yield executeAzCliCommand("--version");
            let creds = core.getInput('creds');
            const useManagedIdentity = core.getInput('enable-managed-identity').toLowerCase() === "true";
            const useUserManagedIdentity = core.getInput('user-managed-identity-client-id');
            const userManagedIdentityResourceId = core.getInput('user-managed-identity-resource-id');
            const enableAzPSSession = core.getInput('enable-AzPSSession').toLowerCase() === "true";
            let azLoginCommand = `login --identity`;
            let subscriptionId = core.getInput("managed-identity-subscription-id");
            let azPwshLogin;
            console.log(`Preparing to login. Managed identity: ${useManagedIdentity}; userManaged: ${userManagedIdentityResourceId ? true : false}; enablePs: ${enableAzPSSession}`);
            if (!useManagedIdentity && !creds) {
                throw new Error("Managed identity is not enabled. Service principal authentication requires a creds object, which was not supplied.");
            }
            if (!useManagedIdentity) { // use service principal defined in creds object
                let secrets = new actions_secret_parser_1.SecretParser(creds, actions_secret_parser_1.FormatType.JSON);
                let servicePrincipalId = secrets.getSecret("$.clientId", false);
                let servicePrincipalKey = secrets.getSecret("$.clientSecret", true);
                let tenantId = secrets.getSecret("$.tenantId", false);
                subscriptionId = secrets.getSecret("$.subscriptionId", false);
                if (!servicePrincipalId || !servicePrincipalKey || !tenantId || !subscriptionId) {
                    throw new Error("Not all values are present in the creds object. Ensure clientId, clientSecret, tenantId and subscriptionId are supplied.");
                }
                azLoginCommand = `login --service-principal -u "${servicePrincipalId}" -p "${servicePrincipalKey}" --tenant "${tenantId}"`;
                if (enableAzPSSession) {
                    azPwshLogin = new ServicePrincipalLogin_1.ServicePrincipalLogin(servicePrincipalId, servicePrincipalKey, tenantId, subscriptionId);
                }
            }
            if (useManagedIdentity && useUserManagedIdentity && userManagedIdentityResourceId) {
                console.log("using user assigned managed identity");
                azLoginCommand += ` -u "${userManagedIdentityResourceId}`;
            }
            if (!subscriptionId) { // no subscription supplied. Not a hard error, but could cause unexpected behavior.
                console.log("When using Managed Identity, subscriptionId is not required. However, consider setting subscriptionId explicitly, especially if the managed identity has permission in multiple subscriptions.");
            }
            // Attempting Az cli login
            console.log(`Attempting login: ${azLoginCommand}`);
            yield executeAzCliCommand(azLoginCommand, true);
            if (subscriptionId) {
                yield executeAzCliCommand(`account set --subscription "${subscriptionId}"`, true);
            }
            isAzCLISuccess = true;
            if (enableAzPSSession) {
                // Attempting Az PS login
                console.log(`Running Azure PS Login`);
                if (useManagedIdentity) {
                    if (useUserManagedIdentity && userManagedIdentityResourceId) {
                        console.log(`Using user managed identity for powershell login`);
                        azPwshLogin = new ManagedIdentityLogin_1.ManagedIdentityLogin(userManagedIdentityResourceId);
                    }
                    else {
                        console.log(`Using system managed identity for powershell login`);
                        azPwshLogin = new ManagedIdentityLogin_1.ManagedIdentityLogin();
                    }
                }
                yield azPwshLogin.initialize();
                yield azPwshLogin.login();
            }
            console.log("Login successful.");
        }
        catch (error) {
            if (!isAzCLISuccess) {
                core.error("Az CLI Login failed. Please check the credentials. For more information refer https://aka.ms/create-secrets-for-GitHub-workflows");
            }
            else {
                core.error(`Azure PowerShell Login failed. Please check the credentials. For more information refer https://aka.ms/create-secrets-for-GitHub-workflows"`);
            }
            core.setFailed(error);
        }
        finally {
            // Reset AZURE_HTTP_USER_AGENT
            core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
            core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azPSHostEnv);
        }
    });
}
function executeAzCliCommand(command, silent) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exec.exec(`"${azPath}" ${command}`, [], { silent: !!silent });
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
main();
