import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import { setPSModulePathForGitHubRunner, importLatestAzAccounts } from './PowerShell/AzPSLogin';
import AzPSConstants from './PowerShell/AzPSConstants';

async function cleanup() {
    try {
        let azPath = await io.which("az", true);
        core.info("Clearing azure cli accounts from the local cache.")
        await exec.exec(`"${azPath}"`, ["account", "clear"]);

        let psPath = await io.which(AzPSConstants.PowerShell_CmdName, true);
        core.debug("Importing Azure PowerShell module.");
        setPSModulePathForGitHubRunner();
        await importLatestAzAccounts();
        core.info("Clearing azure powershell accounts from the local cache.");
        await exec.exec(`"${psPath}"`, ["-Command", "Clear-AzContext", "-Scope", "Process"]);
        await exec.exec(`"${psPath}"`, ["-Command", "Clear-AzContext", "-Scope", "CurrentUser", "-Force", "-ErrorAction", "SilentlyContinue"]);
    }
    catch (error) {
        core.setFailed(`Login cleanup failed with ${error}.`);
        core.debug(error.stack);
    }
}

cleanup();

