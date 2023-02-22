"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
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
            //Options for error handling
            const loginOptions = {
                silent: true,
                listeners: {
                    stderr: (data) => {
                        let error = data.toString();
                        let startsWithWarning = error.toLowerCase().startsWith('warning');
                        let startsWithError = error.toLowerCase().startsWith('error');
                        // printing ERROR
                        if (error && error.trim().length !== 0 && !startsWithWarning) {
                            if (startsWithError) {
                                //removing the keyword 'ERROR' to avoid duplicates while throwing error
                                error = error.slice(5);
                            }
                            core.setFailed(error);
                        }
                    }
                }
            };
            // Set user agent variable
            var isAzCLISuccess = false;
            let usrAgentRepo = `${process.env.GITHUB_REPOSITORY}`;
            let actionName = 'AzureLogin';
            let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
            let azurePSHostEnv = (!!azPSHostEnv ? `${azPSHostEnv}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
            core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
            core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azurePSHostEnv);
            azPath = yield io.which("az", true);
            core.debug(`az cli path: ${azPath}`);
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
            let creds = core.getInput('creds', { required: false });
            let secrets = creds ? new actions_secret_parser_1.SecretParser(creds, actions_secret_parser_1.FormatType.JSON) : null;
            let environment = core.getInput("environment").toLowerCase();
            const enableAzPSSession = core.getInput('enable-AzPSSession').toLowerCase() === "true";
            const allowNoSubscriptionsLogin = core.getInput('allow-no-subscriptions').toLowerCase() === "true";
            //Check for the credentials in individual parameters in the workflow.
            var servicePrincipalId = core.getInput('client-id', { required: false });
            var servicePrincipalKey = null;
            var tenantId = core.getInput('tenant-id', { required: false });
            var subscriptionId = core.getInput('subscription-id', { required: false });
            var resourceManagerEndpointUrl = "https://management.azure.com/";
            var enableOIDC = true;
            var federatedToken = null;
            // If any of the individual credentials (clent_id, tenat_id, subscription_id) is present.
            if (servicePrincipalId || tenantId || subscriptionId) {
                //If few of the individual credentials (clent_id, tenat_id, subscription_id) are missing in action inputs.
                if (!(servicePrincipalId && tenantId && (subscriptionId || allowNoSubscriptionsLogin)))
                    throw new Error("Few credentials are missing. ClientId, tenantId are mandatory. SubscriptionId is also mandatory if allow-no-subscriptions is not set.");
            }
            else {
                if (creds) {
                    core.debug('using creds JSON...');
                    enableOIDC = false;
                    servicePrincipalId = secrets.getSecret("$.clientId", true);
                    servicePrincipalKey = secrets.getSecret("$.clientSecret", true);
                    tenantId = secrets.getSecret("$.tenantId", true);
                    subscriptionId = secrets.getSecret("$.subscriptionId", true);
                    resourceManagerEndpointUrl = secrets.getSecret("$.resourceManagerEndpointUrl", false);
                }
                else {
                    throw new Error("Credentials are not passed for Login action.");
                }
            }
            //generic checks 
            //servicePrincipalKey is only required in non-oidc scenario.
            if (!servicePrincipalId || !tenantId || !(servicePrincipalKey || enableOIDC)) {
                throw new Error("Not all values are present in the credentials. Ensure clientId, clientSecret and tenantId are supplied.");
            }
            if (!subscriptionId && !allowNoSubscriptionsLogin) {
                throw new Error("Not all values are present in the credentials. Ensure subscriptionId is supplied.");
            }
            if (!azureSupportedCloudName.has(environment)) {
                throw new Error("Unsupported value for environment is passed.The list of supported values for environment are ‘azureusgovernment', ‘azurechinacloud’, ‘azuregermancloud’, ‘azurecloud’ or ’azurestack’");
            }
            // OIDC specific checks
            if (enableOIDC) {
                console.log('Using OIDC authentication...');
                try {
                    //generating ID-token
                    let audience = core.getInput('audience', { required: false });
                    federatedToken = yield core.getIDToken(audience);
                    if (!!federatedToken) {
                        if (environment != "azurecloud")
                            throw new Error(`Your current environment - "${environment}" is not supported for OIDC login.`);
                        let [issuer, subjectClaim] = yield jwtParser(federatedToken);
                        console.log("Federated token details: \n issuer - " + issuer + " \n subject claim - " + subjectClaim);
                    }
                }
                catch (error) {
                    core.error(`${error.message.split(':')[1]}. Please make sure to give write permissions to id-token in the workflow.`);
                }
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
            var commonArgs = ["--service-principal",
                "-u", servicePrincipalId,
                "--tenant", tenantId
            ];
            if (allowNoSubscriptionsLogin) {
                commonArgs = commonArgs.concat("--allow-no-subscriptions");
            }
            if (enableOIDC) {
                commonArgs = commonArgs.concat("--federated-token", federatedToken);
            }
            else {
                console.log("Note: Azure/login action also supports OIDC login mechanism. Refer https://github.com/azure/login#configure-a-service-principal-with-a-federated-credential-to-use-oidc-based-authentication for more details.");
                commonArgs = commonArgs.concat("-p", servicePrincipalKey);
            }
            yield executeAzCliCommand(`login`, true, loginOptions, commonArgs);
            if (!allowNoSubscriptionsLogin) {
                var args = [
                    "--subscription",
                    subscriptionId
                ];
                yield executeAzCliCommand(`account set`, true, loginOptions, args);
            }
            isAzCLISuccess = true;
            if (enableAzPSSession) {
                // Attempting Az PS login
                console.log(`Running Azure PS Login`);
                var spnlogin;
                spnlogin = new ServicePrincipalLogin_1.ServicePrincipalLogin(servicePrincipalId, servicePrincipalKey, federatedToken, tenantId, subscriptionId, allowNoSubscriptionsLogin, environment, resourceManagerEndpointUrl);
                yield spnlogin.initialize();
                yield spnlogin.login();
            }
            console.log("Login successful.");
        }
        catch (error) {
            if (!isAzCLISuccess) {
                core.setFailed(`Az CLI Login failed with ${error}. Please check the credentials and make sure az is installed on the runner. For more information refer https://aka.ms/create-secrets-for-GitHub-workflows`);
            }
            else {
                core.setFailed(`Azure PowerShell Login failed with ${error}. Please check the credentials and make sure az is installed on the runner. For more information refer https://aka.ms/create-secrets-for-GitHub-workflows"`);
            }
        }
        finally {
            // Reset AZURE_HTTP_USER_AGENT
            core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
            core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azPSHostEnv);
        }
    });
}
function executeAzCliCommand(command, silent, execOptions = {}, args = []) {
    return __awaiter(this, void 0, void 0, function* () {
        execOptions.silent = !!silent;
        yield exec.exec(`"${azPath}" ${command}`, args, execOptions);
    });
}
function jwtParser(federatedToken) {
    return __awaiter(this, void 0, void 0, function* () {
        let tokenPayload = federatedToken.split('.')[1];
        let bufferObj = Buffer.from(tokenPayload, "base64");
        let decodedPayload = JSON.parse(bufferObj.toString("utf8"));
        return [decodedPayload['iss'], decodedPayload['sub']];
    });
}
main();
