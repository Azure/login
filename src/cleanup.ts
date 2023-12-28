import * as core from '@actions/core';
import { setUserAgent, cleanupAzCLIAccounts, cleanupAzPSAccounts } from './common/Utils'; 

async function cleanup() {
    try {
        setUserAgent();
        await cleanupAzCLIAccounts();
        if(core.getInput('enable-AzPSSession').toLowerCase() === "true"){
            await cleanupAzPSAccounts();
        }
    }
    catch (error) {
        core.setFailed(`Login cleanup failed with ${error}. Make sure 'az' is installed on the runner. If 'enable-AzPSSession' is true, make sure 'pwsh' is installed on the runner together with Azure PowerShell module.`);
        core.debug(error.stack);
    }
}

cleanup();

