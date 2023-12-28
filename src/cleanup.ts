import * as core from '@actions/core';
import { setUserAgent } from './common/Utils'; 
import { cleanupAzCLIAccounts, cleanupAzPSAccounts } from './common/Utils';

async function cleanup() {
    try {
        setUserAgent();
        await cleanupAzCLIAccounts();
        if(core.getInput('enable-AzPSSession').toLowerCase() === "true"){
            await cleanupAzPSAccounts();
        }
    }
    catch (error) {
        core.setFailed(`Login cleanup failed with ${error}.`);
        core.debug(error.stack);
    }
}

cleanup();

