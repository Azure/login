import * as core from '@actions/core';

import Utils from './Utilities/Utils';
import PowerShellToolRunner from './Utilities/PowerShellToolRunner';
import ScriptBuilder from './Utilities/ScriptBuilder';
import Constants from './Constants';

export class ServicePrincipalLogin implements IAzurePowerShellSession {
    static readonly scopeLevel: string = Constants.Subscription;
    static readonly scheme: string = Constants.ServicePrincipal;
    environment: string;
    servicePrincipalId: string;
    servicePrincipalKey: string;
    tenantId: string;
    subscriptionId: string;
    resourceManagerEndpointUrl: string;
    allowNoSubscriptionsLogin: boolean;
    federatedToken: string;

    constructor(servicePrincipalId: string,
        servicePrincipalKey: string,
        federatedToken: string,
        tenantId: string,
        subscriptionId: string,
        allowNoSubscriptionsLogin: boolean,
        environment: string,
        resourceManagerEndpointUrl: string) {

        this.servicePrincipalId = servicePrincipalId;
        this.servicePrincipalKey = servicePrincipalKey;
        this.federatedToken = federatedToken;
        this.tenantId = tenantId;
        this.subscriptionId = subscriptionId;
        this.environment = environment;
        this.resourceManagerEndpointUrl = resourceManagerEndpointUrl;
        this.allowNoSubscriptionsLogin = allowNoSubscriptionsLogin;
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
                    if (error && error.trim().length !== 0)
                    {
                        commandStdErr = true;
                        core.error(error);
                    }
                }
            }
        };
        const args: any = {
            servicePrincipalId: this.servicePrincipalId,
            servicePrincipalKey: this.servicePrincipalKey,
            federatedToken: this.federatedToken,
            subscriptionId: this.subscriptionId,
            environment: this.environment,
            scopeLevel: ServicePrincipalLogin.scopeLevel,
            allowNoSubscriptionsLogin: this.allowNoSubscriptionsLogin,
            resourceManagerEndpointUrl: this.resourceManagerEndpointUrl
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