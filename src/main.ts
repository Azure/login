import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import { FormatType, SecretParser } from 'actions-secret-parser';
import { ServicePrincipalLogin } from './PowerShell/ServicePrincipalLogin';

var azPath: string;
var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
var azPSHostEnv = !!process.env.AZUREPS_HOST_ENVIRONMENT ? `${process.env.AZUREPS_HOST_ENVIRONMENT}` : "";

async function main() {
    try {
        // Set user agent variable
        var isAzCLISuccess = false;
        let usrAgentRepo = `${process.env.GITHUB_REPOSITORY}`;
        let actionName = 'AzureLogin';
        let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        let azurePSHostEnv = (!!azPSHostEnv ? `${azPSHostEnv}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
        core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azurePSHostEnv);

        azPath = await io.which("az", true);
        azPath= '/Users/balaga-gayatri/actions-runner/_work/azure-login-action-tests/azure-login-action-tests/oidc-venv/bin/az';
        console.log(azPath);
        let idToken = await core.getIDToken();
        console.log(idToken);
        let azureSupportedCloudName = new Set([
            "azureusgovernment", 
            "azurechinacloud", 
            "azuregermancloud",
            "azurecloud",
            "azurestack"]);

        let output: string = "";
        const execOptions: any = {
            listeners: {
                stdout: (data: Buffer) => {
                    output += data.toString();
                }
            }
        };
        await executeAzCliCommand("--version", true, execOptions);
        core.debug(`az cli version used:\n${output}`);
    
        let creds = core.getInput('creds', { required: true });
        let secrets = new SecretParser(creds, FormatType.JSON);
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
        
       if (!azureSupportedCloudName.has(environment)){
            throw new Error("Unsupported value for environment is passed.The list of supported values for environment are ‘azureusgovernment', ‘azurechinacloud’, ‘azuregermancloud’, ‘azurecloud’ or ’azurestack’");
       }
    

        // TODO: refactor this into an Azure stack specific utility.
        // Attempting Az cli login
        if (environment == "azurestack") {
            if (!resourceManagerEndpointUrl) {
                throw new Error("resourceManagerEndpointUrl is a required parameter when environment is defined.");
            }

            console.log(`Unregistering cloud: "${environment}" first if it exists`);
            try {
                await executeAzCliCommand(`cloud set -n AzureCloud`, true);
                await executeAzCliCommand(`cloud unregister -n "${environment}"`, false);
            }
            catch (error) {
                console.log(`Ignore cloud not registered error: "${error}"`);
            }

            console.log(`Registering cloud: "${environment}" with ARM endpoint: "${resourceManagerEndpointUrl}"`);
            try {
                let baseUri = resourceManagerEndpointUrl;
                if (baseUri.endsWith('/')) {
                    baseUri = baseUri.substring(0, baseUri.length-1); // need to remove trailing / from resourceManagerEndpointUrl to correctly derive suffixes below
                }
                let suffixKeyvault = ".vault" + baseUri.substring(baseUri.indexOf('.')); // keyvault suffix starts with .
                let suffixStorage = baseUri.substring(baseUri.indexOf('.')+1); // storage suffix starts without .
                let profileVersion = "2019-03-01-hybrid";
                await executeAzCliCommand(`cloud register -n "${environment}" --endpoint-resource-manager "${resourceManagerEndpointUrl}" --suffix-keyvault-dns "${suffixKeyvault}" --suffix-storage-endpoint "${suffixStorage}" --profile "${profileVersion}"`, false);
            } 
            catch (error) {
                core.error(`Error while trying to register cloud "${environment}": "${error}"`);
            }

            console.log(`Done registering cloud: "${environment}"`)
        }
    
        await executeAzCliCommand(`cloud set -n "${environment}"`, false);
        console.log(`Done setting cloud: "${environment}"`);

        // Attempting Az cli login
        if (allowNoSubscriptionsLogin) {
            let args = [
                "--allow-no-subscriptions",
                "--service-principal",
                "--username", servicePrincipalId,
                // "-p", servicePrincipalKey,
                "--federated-token", idToken,
                "--tenant", tenantId
            ];
            await executeAzCliCommand(`login`, true, {}, args);
        }
        else {
            let args = [
                "--service-principal",
                "-u", servicePrincipalId,
                // "-p", servicePrincipalKey,
                "--federated-token", idToken,
                "--tenant", tenantId
            ];
            await executeAzCliCommand(`login`, true, {}, args);
            args = [
                "--subscription",
                subscriptionId
            ];
            await executeAzCliCommand(`account set`, true, {}, args);
        }

        isAzCLISuccess = true;
        if (enableAzPSSession) {
            // Attempting Az PS login
            console.log(`Running Azure PS Login`);
            const spnlogin: ServicePrincipalLogin = new ServicePrincipalLogin(
                servicePrincipalId, 
                servicePrincipalKey, 
                tenantId, 
                subscriptionId, 
                allowNoSubscriptionsLogin,
                environment, 
                resourceManagerEndpointUrl);
            await spnlogin.initialize();
            await spnlogin.login();
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
}

async function executeAzCliCommand(
    command: string, 
    silent?: boolean, 
    execOptions: any = {}, 
    args: any = []) {
    
    execOptions.silent = !!silent;
    try {
        await exec.exec(`"${azPath}" ${command}`, args,  execOptions); 
    }
    catch (error) {
        throw new Error(error);
    }
}

main();