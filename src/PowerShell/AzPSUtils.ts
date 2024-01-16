import * as core from '@actions/core';
import * as os from 'os';
import * as path from 'path';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import AzPSScriptBuilder from './AzPSScriptBuilder';

interface PSResultType {
    Result: string;
    Success: boolean;
    Error: string;
}

export class AzPSConstants {
    static readonly DEFAULT_AZ_PATH_ON_LINUX: string = '/usr/share';
    static readonly DEFAULT_AZ_PATH_ON_WINDOWS: string = 'C:\\Modules';
    static readonly AzAccounts: string = "Az.Accounts";
    static readonly PowerShell_CmdName = "pwsh";
}

export class AzPSUtils {
    static async setPSModulePathForGitHubRunner() {
        const runner: string = process.env.RUNNER_OS || os.type();
        switch (runner.toLowerCase()) {
            case "linux":
                AzPSUtils.pushPSModulePath(AzPSConstants.DEFAULT_AZ_PATH_ON_LINUX);
                break;
            case "windows":
            case "windows_nt":
                AzPSUtils.pushPSModulePath(AzPSConstants.DEFAULT_AZ_PATH_ON_WINDOWS);
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
    
    private static pushPSModulePath(psModulePath: string) {
        process.env.PSModulePath = `${psModulePath}${path.delimiter}${process.env.PSModulePath}`;
        core.debug(`Set PSModulePath as ${process.env.PSModulePath}`);
    }
    
    static async importLatestAzAccounts() {
        let importLatestAccountsScript: string = AzPSScriptBuilder.getImportLatestModuleScript(AzPSConstants.AzAccounts);
        core.debug(`The script to import the latest Az.Accounts: ${importLatestAccountsScript}`);
        let azAccountsPath: string = await AzPSUtils.runPSScript(importLatestAccountsScript);
        core.debug(`The latest Az.Accounts used: ${azAccountsPath}`);
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
        if (!psPath) {
            throw new Error("PowerShell is not found in the runner.");
        }
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
