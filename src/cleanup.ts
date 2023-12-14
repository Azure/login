import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

async function cleanup() {
    try {
        let azPath = await io.which("az", true);
        core.info("Clearing accounts from the local cache.")
        await exec.exec(`"${azPath}"`, ["account", "clear"]);
    }
    catch (error) {
        core.setFailed(`Login cleanup failed with ${error}.`);
        core.debug(error.stack);
    }
}

cleanup();