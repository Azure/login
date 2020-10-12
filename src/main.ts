import * as core from '@actions/core';
import * as crypto from "crypto";
import * as exec from '@actions/exec';
import * as io from '@actions/io';

import { FormatType, SecretParser } from 'actions-secret-parser';
import { ServicePrincipalLogin } from './PowerShell/ServicePrincipalLogin';
import { ManagedIdentityLogin } from "./PowerShell/ManagedIdentityLogin";

var azPath: string;
var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
var azPSHostEnv = !!process.env.AZUREPS_HOST_ENVIRONMENT ? `${process.env.AZUREPS_HOST_ENVIRONMENT}` : "";

async function main() {
    try {
        // Set user agent variable
        var isAzCLISuccess = false;
        let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
        let actionName = 'AzureLogin';
        let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        let azurePSHostEnv = (!!azPSHostEnv ? `${azPSHostEnv}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
        core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azurePSHostEnv);

        azPath = await io.which("az", true);
        await executeAzCliCommand("--version");

        let creds = core.getInput('creds');
        const useManagedIdentity = core.getInput('enable-managed-identity').toLowerCase() === "true";
        const useUserManagedIdentity = core.getInput('user-managed-identity-client-id');
        const userManagedIdentityResourceId = core.getInput('user-managed-identity-resource-id');
        const enableAzPSSession = core.getInput('enable-AzPSSession').toLowerCase() === "true";
        let azLoginCommand = `login --identity`;
        let subscriptionId = core.getInput("managed-identity-subscription-id");
        let azPwshLogin: IAzurePowerShellSession;
        console.log(`Preparing to login. Managed identity: ${useManagedIdentity}; userManaged: ${userManagedIdentityResourceId ? true : false}; enablePs: ${enableAzPSSession}`);
        if (!useManagedIdentity && !creds) {
            throw new Error("Managed identity is not enabled. Service principal authentication requires a creds object, which was not supplied.");
        }
        if (!useManagedIdentity) { // use service principal defined in creds object
        let secrets = new SecretParser(creds, FormatType.JSON);
        let servicePrincipalId = secrets.getSecret("$.clientId", false);
        let servicePrincipalKey = secrets.getSecret("$.clientSecret", true);
        let tenantId = secrets.getSecret("$.tenantId", false);
            subscriptionId = secrets.getSecret("$.subscriptionId", false);
        if (!servicePrincipalId || !servicePrincipalKey || !tenantId || !subscriptionId) {
            throw new Error("Not all values are present in the creds object. Ensure clientId, clientSecret, tenantId and subscriptionId are supplied.");
            }
            azLoginCommand = `login --service-principal -u "${servicePrincipalId}" -p "${servicePrincipalKey}" --tenant "${tenantId}"`
            if (enableAzPSSession) {
                azPwshLogin = new ServicePrincipalLogin(servicePrincipalId, servicePrincipalKey, tenantId, subscriptionId);
            }
        }
        if (useManagedIdentity && useUserManagedIdentity && userManagedIdentityResourceId) {
            console.log("using user assigned managed identity");
            azLoginCommand += ` -u "${userManagedIdentityResourceId}`
        }
        if (!subscriptionId) { // no subscription supplied. Not a hard error, but could cause unexpected behavior.
            console.log("When using Managed Identity, subscriptionId is not required. However, consider setting subscriptionId explicitly, especially if the managed identity has permission in multiple subscriptions.")
        }
        // Attempting Az cli login
        console.log(`Attempting login: ${azLoginCommand}`);
        await executeAzCliCommand(azLoginCommand, true);
        if (subscriptionId) {
        await executeAzCliCommand(`account set --subscription "${subscriptionId}"`, true);
        }
        isAzCLISuccess = true;
        if (enableAzPSSession) {
            // Attempting Az PS login
            console.log(`Running Azure PS Login`);
            if (useManagedIdentity) {
                if (useUserManagedIdentity && userManagedIdentityResourceId) {
                    console.log(`Using user managed identity for powershell login`);
                    azPwshLogin = new ManagedIdentityLogin(userManagedIdentityResourceId);
                } else {
                    console.log(`Using system managed identity for powershell login`);
                    azPwshLogin = new ManagedIdentityLogin();
                }
            }
            await azPwshLogin.initialize();
            await azPwshLogin.login();
        }
        console.log("Login successful.");    
    } catch (error) {
        if (!isAzCLISuccess) {
            core.error("Az CLI Login failed. Please check the credentials. For more information refer https://aka.ms/create-secrets-for-GitHub-workflows");
        } else {
            core.error(`Azure PowerShell Login failed. Please check the credentials. For more information refer https://aka.ms/create-secrets-for-GitHub-workflows"`);
        }
        core.setFailed(error);
    } finally {
        // Reset AZURE_HTTP_USER_AGENT
        core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
        core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azPSHostEnv);
    }
}

async function executeAzCliCommand(command: string, silent?: boolean) {
    try {
        await exec.exec(`"${azPath}" ${command}`, [],  {silent: !!silent}); 
    }
    catch(error) {
        throw new Error(error);
    }
}

main();