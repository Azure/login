import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as crypto from 'crypto';
import { setPSModulePathForGitHubRunner, importLatestAzAccounts } from './PowerShell/AzPSLogin';
import AzPSConstants from './PowerShell/AzPSConstants';

async function cleanup() {
    try {
        let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
        let actionName = 'AzureLogin';
        process.env.AZURE_HTTP_USER_AGENT = (!!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT} ` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        process.env.AZUREPS_HOST_ENVIRONMENT = (!!process.env.AZUREPS_HOST_ENVIRONMENT ? `${process.env.AZUREPS_HOST_ENVIRONMENT} ` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;

        if(core.getInput('enable-AzPSSession').toLowerCase() === "true"){
            let psPath = await io.which(AzPSConstants.PowerShell_CmdName, true);
            core.debug("Importing Azure PowerShell module.");
            setPSModulePathForGitHubRunner();
            await importLatestAzAccounts();
            core.info("Clearing azure powershell accounts from the local cache.");
            await exec.exec(`"${psPath}"`, ["-Command", "Clear-AzContext", "-Scope", "Process"]);
            await exec.exec(`"${psPath}"`, ["-Command", "Clear-AzContext", "-Scope", "CurrentUser", "-Force", "-ErrorAction", "SilentlyContinue"]);
        }
    }
    catch (error) {
        core.setFailed(`Login cleanup failed with ${error}.`);
        core.debug(error.stack);
    }
}

cleanup();

