import * as os from 'os';

import Constants from '../Constants';

export default class Utils {
    static setPSModulePath(azPSVersion: string = "") {
        let modulePath: string = "";
        const runner: string = process.env.RUNNER_OS || os.type();
        switch (runner.toLowerCase()) {
            case "linux":
                modulePath = `/usr/share/${azPSVersion}:`;
                break;
            case "windows":
            case "windows_nt":
                modulePath = `C:\\Modules\\${azPSVersion};`;
                break;
            case "macos":
            case "darwin":
                throw new Error(`OS not supported`);
            default:
                throw new Error(`Unknown os: ${runner.toLowerCase()}`);
        }
        process.env.PSModulePath = `${modulePath}${process.env.PSModulePath}`;
    }

    static isValidVersion(version: string): boolean {
        return !!version.match(Constants.versionPattern);
    }
}

