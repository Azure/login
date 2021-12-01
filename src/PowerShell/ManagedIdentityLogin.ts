import * as core from '@actions/core';
import Utils from './Utilities/Utils';
import PowerShellToolRunner from './Utilities/PowerShellToolRunner';
import ScriptBuilder from './Utilities/ScriptBuilder';
import Constants from './Constants';


export class ManagedIdentityLogin implements IAzurePowerShellSession {
    readonly scheme: string;
    userManagedIdentityResourceId: string;

    constructor(userManagedIdentityResourceId?: string) {
        this.scheme = Constants.SystemManagedIdentity;
        this.userManagedIdentityResourceId = userManagedIdentityResourceId;
        if (userManagedIdentityResourceId) {
            this.scheme = Constants.UserManagedIdentity;
        }
    }
    async initialize() {
        Utils.setPSModulePath();
        const azLatestVersion: string = await Utils.getLatestModule(Constants.moduleName);
        core.debug(`Az Module version used: ${azLatestVersion}`);
        Utils.setPSModulePath(`${Constants.prefix}${azLatestVersion}`);
    }

    async login() {
        let output: string = "";
        const options: any = {
            listeners: {
                stdout: (data: Buffer) => {
                    output += data.toString();
                }
            }
        };
        const args: any = {};

        const script: string = new ScriptBuilder().getAzPSLoginScript(this.scheme, null, args, this.userManagedIdentityResourceId);

        await PowerShellToolRunner.init();
        await PowerShellToolRunner.executePowerShellScriptBlock(script, options);
        const result: any = JSON.parse(output.trim());
        if (!(Constants.Success in result)) {
            throw new Error(`Azure PowerShell login failed with error: ${result[Constants.Error]}`);
        }
        console.log(`Azure PowerShell session successfully initialized`);
    }
}