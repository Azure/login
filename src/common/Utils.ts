import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as crypto from 'crypto';
import { AzPSConstants, AzPSUtils } from '../PowerShell/AzPSUtils';

export function setUserAgent(): void {
    let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
    let actionName = 'AzureLogin';
    process.env.AZURE_HTTP_USER_AGENT = (!!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT} ` : '') + `GITHUBACTIONS/${actionName}@v2_${usrAgentRepo}_${process.env.RUNNER_ENVIRONMENT}_${process.env.GITHUB_RUN_ID}`;
    process.env.AZUREPS_HOST_ENVIRONMENT = (!!process.env.AZUREPS_HOST_ENVIRONMENT ? `${process.env.AZUREPS_HOST_ENVIRONMENT} ` : '') + `GITHUBACTIONS/${actionName}@v2_${usrAgentRepo}_${process.env.RUNNER_ENVIRONMENT}_${process.env.GITHUB_RUN_ID}`;
}

export async function cleanupAzCLIAccounts(): Promise<void> {
    let azPath = await io.which("az", true);
    core.debug(`Azure CLI path: ${azPath}`);
    core.info("Clearing azure cli accounts from the local cache.");
    await exec.exec(`"${azPath}"`, ["account", "clear"]);  
}

export async function cleanupAzPSAccounts(): Promise<void> {
    let psPath: string = await io.which(AzPSConstants.PowerShell_CmdName, true);
    core.debug(`PowerShell path: ${psPath}`);
    core.debug("Importing Azure PowerShell module.");
    AzPSUtils.setPSModulePathForGitHubRunner();
    await AzPSUtils.importLatestAzAccounts();
    core.info("Clearing azure powershell accounts from the local cache.");
    await exec.exec(`"${psPath}"`, ["-Command", "Clear-AzContext", "-Scope", "Process"]);
    await exec.exec(`"${psPath}"`, ["-Command", "Clear-AzContext", "-Scope", "CurrentUser", "-Force", "-ErrorAction", "SilentlyContinue"]);
}
