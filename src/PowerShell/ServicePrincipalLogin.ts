import * as core from '@actions/core';

import Utils from './Utilities/Utils';
import PowerShellToolRunner from './Utilities/PowerShellToolRunner';
import ScriptBuilder from './Utilities/ScriptBuilder';
import Constants from './Constants';

export class ServicePrincipalLogin implements IAzurePowerShellSession {
    static readonly environment: string = Constants.AzureCloud;
    static readonly scopeLevel: string = Constants.Subscription;
    static readonly scheme: string = Constants.ServicePrincipal;
    servicePrincipalId: string;
    servicePrincipalKey: string;
    tenantId: string;
    subscriptionId: string;

    constructor(servicePrincipalId: string, servicePrincipalKey: string, tenantId: string, subscriptionId: string) {
        this.servicePrincipalId = servicePrincipalId;
        this.servicePrincipalKey = servicePrincipalKey;
        this.tenantId = tenantId;
        this.subscriptionId = subscriptionId;
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
        const args: any = {
            servicePrincipalId: this.servicePrincipalId,
            servicePrincipalKey: this.servicePrincipalKey,
            subscriptionId: this.subscriptionId,
            environment: ServicePrincipalLogin.environment,
            scopeLevel: ServicePrincipalLogin.scopeLevel
        }
        const script: string = new ScriptBuilder().getAzPSLoginScript(ServicePrincipalLogin.scheme, this.tenantId, args);
        await PowerShellToolRunner.init();
        await PowerShellToolRunner.executePowerShellScriptBlock(script, options);
        const result: any = JSON.parse(output.trim());
        if (!(Constants.Success in result)) {
            throw new Error(`Azure PowerShell login failed with error: ${result[Constants.Error]}`);
        }
        console.log(`Azure PowerShell session successfully initialized`);
    }

}