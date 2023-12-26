import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as os from 'os';
import * as path from 'path';

import AzPSScriptBuilder from './AzPSScriptBuilder';
import AzPSConstants from './AzPSConstants';
import { LoginConfig } from '../common/LoginConfig';

interface PSResultType {
    Result: string;
    Success: boolean;
    Error: string;
}

export class AzPSLogin {
    loginConfig: LoginConfig;

    constructor(loginConfig: LoginConfig) {
        this.loginConfig = loginConfig;
    }

    async login() {
        core.info(`Running Azure PowerShell Login.`);
        setPSModulePathForGitHubRunner();
        await importLatestAzAccounts();
        const [loginMethod, loginScript] = await AzPSScriptBuilder.getAzPSLoginScript(this.loginConfig);
        core.info(`Attempting Azure PowerShell login by using ${loginMethod}...`);
        core.debug(`Azure PowerShell Login Script: ${loginScript}`);
        await AzPSLogin.runPSScript(loginScript);
        console.log(`Running Azure PowerShell Login successfully.`);
    }

    static async runPSScript(psScript: string): Promise<string> {
        let outputString: string = "";
        let commandStdErr = false;
        const options: any = {
            silent: true,
            listeners: {
                stdout: (data: Buffer) => {
                    outputString += data.toString();
                },
                stderr: (data: Buffer) => {
                    let error = data.toString();
                    if (error && error.trim().length !== 0) {
                        commandStdErr = true;
                        core.error(error);
                    }
                }
            }
        };

        let psPath: string = await io.which(AzPSConstants.PowerShell_CmdName, true);
        await exec.exec(`"${psPath}"`, ["-Command", psScript], options)
        if (commandStdErr) {
            throw new Error('Azure PowerShell login failed with errors.');
        }
        const result: PSResultType = JSON.parse(outputString.trim());
        console.log(result);
        if (!(result.Success)) {
            throw new Error(`Azure PowerShell login failed with error: ${result.Error}`);
        }
        return result.Result;
    }
}

export function setPSModulePathForGitHubRunner() {
    const runner: string = process.env.RUNNER_OS || os.type();
    switch (runner.toLowerCase()) {
        case "linux":
            pushPSModulePath(AzPSConstants.DEFAULT_AZ_PATH_ON_LINUX);
            break;
        case "windows":
        case "windows_nt":
            pushPSModulePath(AzPSConstants.DEFAULT_AZ_PATH_ON_WINDOWS);
            break;
        case "macos":
        case "darwin":
            core.warning(`Skip setting the default PowerShell module path for OS ${runner.toLowerCase()}.`);
            break;
        default:
            core.warning(`Skip setting the default PowerShell module path for unknown OS ${runner.toLowerCase()}.`);
            break;
    }
}

async function pushPSModulePath(psModulePath: string) {
    process.env.PSModulePath = `${psModulePath}${path.delimiter}${process.env.PSModulePath}`;
    core.debug(`Set PSModulePath as ${process.env.PSModulePath}`);
}

export async function importLatestAzAccounts() {
    let importLatestAccountsScript: string = AzPSScriptBuilder.getImportLatestModuleScript(AzPSConstants.AzAccounts);
    core.debug(`The script to import the latest Az.Accounts: ${importLatestAccountsScript}`);
    let azAccountsPath: string = await AzPSLogin.runPSScript(importLatestAccountsScript);
    core.debug(`The latest Az.Accounts used: ${azAccountsPath}`);
}
