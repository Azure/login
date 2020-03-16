import * as core from '@actions/core';

import Utils from './Utils';
import PowerShellToolRunner from './PowerShellToolRunner';
import ScriptBuilder from './ScriptBuilder';
import { Constants } from './Constants';

export class ServicePrincipalLogin implements IAzurePowerShellSession {
    static readonly environment: string = Constants.environment;
    static readonly scopeLevel: string = Constants.scopeLevel;
    static readonly scheme: string = Constants.scheme;
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
        PowerShellToolRunner.init();
        const scriptBuilder: ScriptBuilder = new ScriptBuilder();
        const script: string = scriptBuilder.getScript(ServicePrincipalLogin.scheme, this.tenantId, this.servicePrincipalId, this.servicePrincipalKey, 
            this.subscriptionId, ServicePrincipalLogin.environment, ServicePrincipalLogin.scopeLevel);
        PowerShellToolRunner.executePowerShellCommand(script);
    }

}