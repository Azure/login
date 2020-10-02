import * as os from 'os';

import Constants from '../Constants';
import ScriptBuilder from './ScriptBuilder';
import PowerShellToolRunner from './PowerShellToolRunner';

export default class Utils {
    /**
     * Add the folder path where Az modules are present to PSModulePath based on runner
     * @param azPSVersion
     * Obtain specified version, otherwise use latest version installed
     * @returns Az Powershell version added to path
     */
    static async setPSModulePath(azPSVersion: string = "latest"): Promise<string> {
        let modulePath: string = "";
        let modulePathRoot: string = "";
        let modulePathSeparator: string = "";
        let modulePathPrefix: string = "";
        const runner: string = process.env.RUNNER_OS || os.type();

        switch (runner.toLowerCase()) {
            case "linux":
                modulePathRoot = '/usr/share/';
                modulePathSeparator = ':';
                break;
            case "windows":
            case "windows_nt":
                modulePathRoot = 'C:\\Modules\\';
                modulePathSeparator = ';';
                break;
            case "macos":
            case "darwin":
                throw new Error(`OS not supported`);
            default:
                throw new Error(`Unknown os: ${runner.toLowerCase()}`);
        }

        modulePathPrefix = `${modulePathRoot}${Constants.prefix}`;
        
        if(azPSVersion === "latest") { // transform to latest version
            azPSVersion = await Utils.getLatestAzModule(modulePathPrefix);
        }
        
        modulePath = `${modulePathPrefix}${azPSVersion}${modulePathSeparator}`;
        process.env.PSModulePath = `${modulePath}${process.env.PSModulePath}`;

        return azPSVersion;
    }

    static async getLatestAzModule(azPathPrefix: string): Promise<string> {
        let output: string = "";
        const options: any = {
            listeners: {
                stdout: (data: Buffer) => {
                    output += data.toString();
                }
            }
        };
        await PowerShellToolRunner.init();
        await PowerShellToolRunner.executePowerShellScriptBlock(new ScriptBuilder()
                                .getLatestAzModuleScript(azPathPrefix), options);
        const result = JSON.parse(output.trim());
        if (!(Constants.Success in result)) {
            throw new Error(result[Constants.Error]);
        }
        const azLatestVersion: string = result[Constants.AzVersion];
        if (!Utils.isValidVersion(azLatestVersion)) {
            throw new Error(`Invalid AzPSVersion: ${azLatestVersion}`);
        }
        return azLatestVersion;
    }

    static isValidVersion(version: string): boolean {
        return !!version.match(Constants.versionPattern);
    }
}

