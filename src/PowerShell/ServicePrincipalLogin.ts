import * as core from '@actions/core';

import Utils from './Utilities/Utils';
import PowerShellToolRunner from './Utilities/PowerShellToolRunner';
import ScriptBuilder from './Utilities/ScriptBuilder';
import Constants from './Constants';
import { LoginConfig } from '../common/LoginConfig';

export class ServicePrincipalLogin implements IAzurePowerShellSession {
    static readonly scopeLevel: string = Constants.Subscription;
    static readonly scheme: string = Constants.ServicePrincipal;
    loginConfig: LoginConfig;

    constructor(loginConfig: LoginConfig) {
        this.loginConfig = loginConfig;
    }

    async initialize() {
        Utils.setPSModulePath();
        const azLatestVersion: string = await Utils.getLatestModule(Constants.moduleName);
        core.debug(`Az Module version used: ${azLatestVersion}`);
        Utils.setPSModulePath(`${Constants.prefix}${azLatestVersion}`);
    }

    async login() {
        let output: string = "";
        let commandStdErr = false;
        const options: any = {
            listeners: {
                stdout: (data: Buffer) => {
                    output += data.toString();
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
        const args: any = {
            servicePrincipalId: this.loginConfig.servicePrincipalId,
            servicePrincipalKey: this.loginConfig.servicePrincipalKey,
            federatedToken: this.loginConfig.federatedToken,
            subscriptionId: this.loginConfig.subscriptionId,
            environment: this.loginConfig.environment,
            scopeLevel: ServicePrincipalLogin.scopeLevel,
            allowNoSubscriptionsLogin: this.loginConfig.allowNoSubscriptionsLogin,
            resourceManagerEndpointUrl: this.loginConfig.resourceManagerEndpointUrl
        }
        const script: string = new ScriptBuilder().getAzPSLoginScript(ServicePrincipalLogin.scheme, this.loginConfig.tenantId, args);
        await PowerShellToolRunner.init();
        await PowerShellToolRunner.executePowerShellScriptBlock(script, options);
        const result: any = JSON.parse(output.trim());
        if (!(Constants.Success in result)) {
            throw new Error(`Azure PowerShell login failed with error: ${result[Constants.Error]}`);
        }
        console.log(`Azure PowerShell session successfully initialized`);
    }

}