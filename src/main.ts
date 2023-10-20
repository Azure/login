import * as core from '@actions/core';
import { AzPSLogin } from './PowerShell/AzPSLogin';
import { LoginConfig } from './common/LoginConfig';
import { AzureCliLogin } from './Cli/AzureCliLogin';

var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
var azPSHostEnv = !!process.env.AZUREPS_HOST_ENVIRONMENT ? `${process.env.AZUREPS_HOST_ENVIRONMENT}` : "";

async function main() {
    try {
        let usrAgentRepo = `${process.env.GITHUB_REPOSITORY}`;
        let actionName = 'AzureLogin';
        let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        let azurePSHostEnv = (!!azPSHostEnv ? `${azPSHostEnv}+` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
        core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azurePSHostEnv);

        // prepare the login configuration
        var loginConfig = new LoginConfig();
        await loginConfig.initialize();
        await loginConfig.validate();

        // login to Azure CLI
        var cliLogin = new AzureCliLogin(loginConfig);
        await cliLogin.login();

        //login to Azure PowerShell
        if (loginConfig.enableAzPSSession) {
            var psLogin: AzPSLogin = new AzPSLogin(loginConfig);
            await psLogin.login();
        }
    }
    catch (error) {
        core.setFailed(`Login failed with ${error}. Make sure 'az' is installed on the runner. If 'enable-AzPSSession' is true, make sure 'pwsh' is installed on the runner together with Azure PowerShell module. Double check if the 'auth-type' is correct. Refer to https://github.com/Azure/login#readme for more information.`);
        core.debug(error.stack);
    }
    finally {
        // Reset AZURE_HTTP_USER_AGENT
        core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
        core.exportVariable('AZUREPS_HOST_ENVIRONMENT', azPSHostEnv);
    }
}

main();

