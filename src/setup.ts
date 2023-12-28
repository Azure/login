import * as core from '@actions/core';
import { setUserAgent } from './common/Utils'; 
import { cleanupAccounts } from './common/Utils';

async function setup() {
    try {
        setUserAgent();
        cleanupAccounts();
    }
    catch (error) {
        core.setFailed(`Login setup failed with ${error}. Make sure 'az' is installed on the runner. If 'enable-AzPSSession' is true, make sure 'pwsh' is installed on the runner together with Azure PowerShell module.`);
        core.debug(error.stack);
    }
}

setup();

