import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as crypto from 'crypto';
import { setPSModulePathForGitHubRunner, importLatestAzAccounts } from './PowerShell/AzPSLogin';
import AzPSConstants from './PowerShell/AzPSConstants';

async function setup() {
    try {
        let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
        let actionName = 'AzureLogin';
        process.env.AZURE_HTTP_USER_AGENT = (!!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT} ` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
        process.env.AZUREPS_HOST_ENVIRONMENT = (!!process.env.AZUREPS_HOST_ENVIRONMENT ? `${process.env.AZUREPS_HOST_ENVIRONMENT} ` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;

        let azPath = await io.which("az", true);
        if (!azPath) {
            throw new Error("Azure CLI is not found in the runner.");
        }
        core.debug(`Azure CLI path: ${azPath}`);
        core.info("Clearing azure cli accounts from the local cache.");
        await exec.exec(`"${azPath}"`, ["account", "clear"]);

        if(core.getInput('enable-AzPSSession').toLowerCase() === "true"){
            let psPath: string = await io.which(AzPSConstants.PowerShell_CmdName, true);
            if (!psPath) {
                throw new Error("PowerShell is not found in the runner.");
            }
            core.debug(`PowerShell path: ${psPath}`);
            core.debug("Importing Azure PowerShell module.");
            setPSModulePathForGitHubRunner();
            await importLatestAzAccounts();
            core.info("Clearing azure powershell accounts from the local cache.");
            await exec.exec(`"${psPath}"`, ["-Command", "Clear-AzContext", "-Scope", "Process"]);
            await exec.exec(`"${psPath}"`, ["-Command", "Clear-AzContext", "-Scope", "CurrentUser", "-Force", "-ErrorAction", "SilentlyContinue"]);
        }
    }
    catch (error) {
        core.setFailed(`Login setup failed with ${error}. Make sure 'az' is installed on the runner. If 'enable-AzPSSession' is true, make sure 'pwsh' is installed on the runner together with Azure PowerShell module.`);
        core.debug(error.stack);
    }
}

setup();

