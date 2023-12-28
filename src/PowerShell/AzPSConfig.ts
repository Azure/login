import * as core from '@actions/core';
import * as os from 'os';
import * as path from 'path';
import AzPSConstants from './AzPSConstants';
import AzPSScriptBuilder from './AzPSScriptBuilder';
import { AzPSLogin } from './AzPSLogin';

export default class AzPSConfig {
    static async setPSModulePathForGitHubRunner() {
        const runner: string = process.env.RUNNER_OS || os.type();
        switch (runner.toLowerCase()) {
            case "linux":
                AzPSConfig.pushPSModulePath(AzPSConstants.DEFAULT_AZ_PATH_ON_LINUX);
                break;
            case "windows":
            case "windows_nt":
                AzPSConfig.pushPSModulePath(AzPSConstants.DEFAULT_AZ_PATH_ON_WINDOWS);
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
        let azAccountsPath: string = await AzPSLogin.runPSScript(importLatestAccountsScript);
        core.debug(`The latest Az.Accounts used: ${azAccountsPath}`);
    }
}