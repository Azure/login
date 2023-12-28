import * as core from '@actions/core';
import { setUserAgent } from './common/Utils'; 
import { cleanupAzCLIAccounts, cleanupAzPSAccounts } from './common/Utils';

async function setup() {
    try {
        setUserAgent();
        await cleanupAzCLIAccounts();
        if(core.getInput('enable-AzPSSession').toLowerCase() === "true"){
            await cleanupAzPSAccounts();
        }
    }
    catch (error) {
        core.setFailed(`Login setup failed with ${error}. Make sure 'az' is installed on the runner. If 'enable-AzPSSession' is true, make sure 'pwsh' is installed on the runner together with Azure PowerShell module.`);
        core.debug(error.stack);
    }
}

setup();

