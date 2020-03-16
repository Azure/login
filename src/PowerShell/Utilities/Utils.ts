import * as os from 'os';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

import Constants from '../Constants';
import PowerShellToolRunner from './PowerShellToolRunner';

export default class Utils {
    static async getLatestModule(moduleName: string): Promise<string> {
        let output: string = "";
        let error: string = "";
        const options: any = {
            listeners: {
                stdout: (data: Buffer) => {
                    output += data.toString();
                },
                stderr: (data: Buffer) => {
                    error += data.toString();
                }
            }
        };
        await PowerShellToolRunner.init();
        await PowerShellToolRunner.executePowerShellCommand(`(Get-Module -Name ${moduleName} -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1).Version.ToString()`, options);
        if(!Utils.isValidVersion(output.trim())) {
            return "";
        }
        return output.trim();
    }

    private static isValidVersion(version: string): boolean {
        return !!version.match(Constants.versionPattern);
    }
    
    static setPSModulePath(azPSVersion: string = "") {
        let modulePath: string = "";
        const RUNNER: string = process.env.RUNNER_OS || os.type();
        switch (RUNNER) {
            case "Linux":
                modulePath = `/usr/share/${azPSVersion}:`;
                break;
            case "Windows":
            case "Windows_NT":
                modulePath = `C:\\Modules\\${azPSVersion};`;
                break;
            case "macOS":
            case "Darwin":
                // TODO: add modulepath
                break;
            default:
                throw new Error("Unknown os");
        }
        process.env.PSModulePath = `${modulePath}${process.env.PSModulePath}`;
    }
}

