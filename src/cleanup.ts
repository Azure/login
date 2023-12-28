import * as core from '@actions/core';
import { setUserAgent } from './common/Utils'; 
import { cleanupAccounts } from './common/Utils';

async function cleanup() {
    try {
        setUserAgent();
        cleanupAccounts();
    }
    catch (error) {
        core.setFailed(`Login cleanup failed with ${error}.`);
        core.debug(error.stack);
    }
}

cleanup();

