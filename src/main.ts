import * as core from '@actions/core';
import { ServicePrincipalLogin } from './PowerShell/ServicePrincipalLogin';
import { LoginConfig } from './common/LoginConfig';
import { AzureCliLogin } from './Cli/AzureCliLogin';

var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
var azPSHostEnv = !!process.env.AZUREPS_HOST_ENVIRONMENT ? `${process.env.AZUREPS_HOST_ENVIRONMENT}` : "";

async function main() {
    var isAzCLISuccess = false;
    try {
        let usrAgentRepo = `${process.env.GITHUB_REPOSITORY}`;
        let actionName = 'AzureLogin';
        let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        let azurePSHostEnv = (!!azPSHostEnv ? `${azPSHostEnv}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
        core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azurePSHostEnv);

        // perpare the login configuration
        var loginConfig = new LoginConfig();
        await loginConfig.initialize();
        await loginConfig.validate();

        // login to Azure Cli
        var cliLogin = new AzureCliLogin(loginConfig);
        await cliLogin.login();
        isAzCLISuccess = true;

        //login to Azure PowerShell
        if (loginConfig.enableAzPSSession) {
            console.log(`Running Azure PS Login`);
            var spnlogin: ServicePrincipalLogin = new ServicePrincipalLogin(loginConfig);
            await spnlogin.initialize();
            await spnlogin.login();
        }

        console.log("Login successful.");
    }
    catch (error) {
        if (!isAzCLISuccess) {
            core.setFailed(`Az CLI Login failed with ${error}. Please check the credentials and make sure az is installed on the runner. For more information refer https://aka.ms/create-secrets-for-GitHub-workflows`);
        }
        else {
            core.setFailed(`Azure PowerShell Login failed with ${error}. Please check the credentials and make sure az is installed on the runner. For more information refer https://aka.ms/create-secrets-for-GitHub-workflows`);
        }
    }
    finally {
        // Reset AZURE_HTTP_USER_AGENT
        core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
        core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azPSHostEnv);
    }
}

main();
