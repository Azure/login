import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function cleanup() {
    try {
        core.info("Clearing accounts from the local cache.")
        await exec.exec("az", ["account", "clear"]);
    }
    catch (error) {
        core.setFailed(`Login cleanup failed with ${error}.`);
        core.debug(error.stack);
    }
}

cleanup();