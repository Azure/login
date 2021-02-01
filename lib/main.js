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
            let usrAgentRepo = `${process.env.GITHUB_REPOSITORY}`;
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
            let azureSupportedCloudName = new Set([
                "azureusgovernment",
                "azurechinacloud",
                "azuregermancloud",
                "azurecloud",
                "azurestack"
            ]);
            let output = "";
            const execOptions = {
                listeners: {
                    stdout: (data) => {
                        output += data.toString();
                    }
                }
            };
            yield executeAzCliCommand("--version", true, execOptions);
            core.debug(`az cli version used:\n${output}`);
            let creds = core.getInput('creds', { required: true });
            let secrets = new actions_secret_parser_1.SecretParser(creds, actions_secret_parser_1.FormatType.JSON);
            let servicePrincipalId = secrets.getSecret("$.clientId", false);
            let servicePrincipalKey = secrets.getSecret("$.clientSecret", true);
            let tenantId = secrets.getSecret("$.tenantId", false);
            let subscriptionId = secrets.getSecret("$.subscriptionId", false);
            let resourceManagerEndpointUrl = secrets.getSecret("$.resourceManagerEndpointUrl", false);
            let environment = core.getInput("environment").toLowerCase();
            const enableAzPSSession = core.getInput('enable-AzPSSession').toLowerCase() === "true";
            const allowNoSubscriptionsLogin = core.getInput('allow-no-subscriptions').toLowerCase() === "true";
            if (!servicePrincipalId || !servicePrincipalKey || !tenantId) {
                throw new Error("Not all values are present in the creds object. Ensure clientId, clientSecret and tenantId are supplied.");
            }
            if (!subscriptionId && !allowNoSubscriptionsLogin) {
                throw new Error("Not all values are present in the creds object. Ensure subscriptionId is supplied.");
            }
            if (!azureSupportedCloudName.has(environment)) {
                throw new Error("Unsupported value for environment is passed.The list of supported values for environment are ‘azureusgovernment', ‘azurechinacloud’, ‘azuregermancloud’, ‘azurecloud’ or ’azurestack’");
            }
            // Attempting Az cli login
            if (environment == "azurestack") {
                if (!resourceManagerEndpointUrl) {
                    throw new Error("resourceManagerEndpointUrl is a required parameter when environment is defined.");
                }
                console.log(`Unregistering cloud: "${environment}" first if it exists`);
                try {
                    yield executeAzCliCommand(`cloud set -n AzureCloud`, true);
                    yield executeAzCliCommand(`cloud unregister -n "${environment}"`, false);
                }
                catch (error) {
                    console.log(`Ignore cloud not registered error: "${error}"`);
                }
                console.log(`Registering cloud: "${environment}" with ARM endpoint: "${resourceManagerEndpointUrl}"`);
                try {
                    let baseUri = resourceManagerEndpointUrl;
                    if (baseUri.endsWith('/')) {
                        baseUri = baseUri.substring(0, baseUri.length - 1); // need to remove trailing / from resourceManagerEndpointUrl to correctly derive suffixes below
                    }
                    let suffixKeyvault = ".vault" + baseUri.substring(baseUri.indexOf('.')); // keyvault suffix starts with .
                    let suffixStorage = baseUri.substring(baseUri.indexOf('.') + 1); // storage suffix starts without .
                    let profileVersion = "2019-03-01-hybrid";
                    yield executeAzCliCommand(`cloud register -n "${environment}" --endpoint-resource-manager "${resourceManagerEndpointUrl}" --suffix-keyvault-dns "${suffixKeyvault}" --suffix-storage-endpoint "${suffixStorage}" --profile "${profileVersion}"`, false);
                }
                catch (error) {
                    core.error(`Error while trying to register cloud "${environment}": "${error}"`);
                }
                console.log(`Done registering cloud: "${environment}"`);
            }
            yield executeAzCliCommand(`cloud set -n "${environment}"`, false);
            console.log(`Done setting cloud: "${environment}"`);
            // Attempting Az cli login
            if (allowNoSubscriptionsLogin) {
                let args = [
                    "--allow-no-subscriptions",
                    "--service-principal",
                    "-u", servicePrincipalId,
                    "-p", servicePrincipalKey,
                    "--tenant", tenantId
                ];
                yield executeAzCliCommand(`login`, true, {}, args);
            }
            else {
                let args = [
                    "--service-principal",
                    "-u", servicePrincipalId,
                    "-p", servicePrincipalKey,
                    "--tenant", tenantId
                ];
                yield executeAzCliCommand(`login`, true, {}, args);
                args = [
                    "--subscription",
                    subscriptionId
                ];
                yield executeAzCliCommand(`account set`, true, {}, args);
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
                const spnlogin = new ServicePrincipalLogin_1.ServicePrincipalLogin(servicePrincipalId, servicePrincipalKey, tenantId, subscriptionId, allowNoSubscriptionsLogin, environment, resourceManagerEndpointUrl);
                yield spnlogin.initialize();
                yield spnlogin.login();
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
function executeAzCliCommand(command, silent, execOptions = {}, args = []) {
    return __awaiter(this, void 0, void 0, function* () {
        execOptions.silent = !!silent;
        try {
            yield exec.exec(`"${azPath}" ${command}`, args, execOptions);
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
main();
