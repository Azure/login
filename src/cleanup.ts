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
        core.warning(`Login cleanup failed with ${error}. Cleanup will be skipped.`);
        core.debug(error.stack);
    }
}

cleanup();

