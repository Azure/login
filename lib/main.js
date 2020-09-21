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
            let creds = core.getInput('creds', { required: true });
            let secrets = new actions_secret_parser_1.SecretParser(creds, actions_secret_parser_1.FormatType.JSON);
            let servicePrincipalId = secrets.getSecret("$.clientId", false);
            let servicePrincipalKey = secrets.getSecret("$.clientSecret", true);
            let tenantId = secrets.getSecret("$.tenantId", false);
            let subscriptionId = secrets.getSecret("$.subscriptionId", false);
            let resourceManagerEndpointUrl = secrets.getSecret("$.resourceManagerEndpointUrl", false);
            let environment = core.getInput("environment");
            const enableAzPSSession = core.getInput('enable-AzPSSession').toLowerCase() === "true";
            if (!servicePrincipalId || !servicePrincipalKey || !tenantId || !subscriptionId) {
                throw new Error("Not all values are present in the creds object. Ensure clientId, clientSecret, tenantId and subscriptionId are supplied.");
            }
            // Attempting Az cli login
            if (environment.toLowerCase() == "azurestack") {
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
                yield executeAzCliCommand(`cloud set -n "${environment}"`, false);
                console.log(`Done registering cloud: "${environment}"`);
            }
            yield executeAzCliCommand(`login --service-principal -u "${servicePrincipalId}" -p "${servicePrincipalKey}" --tenant "${tenantId}"`, true);
            yield executeAzCliCommand(`account set --subscription "${subscriptionId}"`, true);
            isAzCLISuccess = true;
            if (enableAzPSSession) {
                // Attempting Az PS login
                console.log(`Running Azure PS Login`);
                const spnlogin = new ServicePrincipalLogin_1.ServicePrincipalLogin(servicePrincipalId, servicePrincipalKey, tenantId, subscriptionId, environment, resourceManagerEndpointUrl);
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
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
main();
