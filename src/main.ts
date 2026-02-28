import * as core from '@actions/core';
import { cleanupAzCLIAccounts, cleanupAzPSAccounts, setUserAgent } from './common/Utils';
import { AzPSLogin } from './PowerShell/AzPSLogin';
import { LoginConfig } from './common/LoginConfig';
import { AzureCliLogin } from './Cli/AzureCliLogin';

async function main() {
    try {
        setUserAgent();
        const preCleanup: string = process.env.AZURE_LOGIN_PRE_CLEANUP;
        if ('true' == preCleanup) {
            await cleanupAzCLIAccounts();
            if (core.getInput('enable-AzPSSession').toLowerCase() === "true") {
                await cleanupAzPSAccounts();
            }
        }

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
        core.setFailed(`Login failed with ${error}. Double check if the 'auth-type' is correct. Refer to https://github.com/Azure/login#readme for more information.`);
        core.debug(error.stack);
    }
}

main();

