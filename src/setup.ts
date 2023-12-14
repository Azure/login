import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

async function setup() {
    try {
        let azPath = await io.which("az", true);
        if (!azPath) {
            throw new Error("Azure CLI is not found in the runner.");
        }
        core.debug(`Azure CLI path: ${azPath}`);

        core.info("Clearing accounts from the local cache.")
        await exec.exec(`"${azPath}"`, ["account", "clear"]);
    }
    catch (error) {
        core.setFailed(`Login setup failed with ${error}. Make sure 'az' is installed on the runner.`);
        core.debug(error.stack);
    }
}

setup();