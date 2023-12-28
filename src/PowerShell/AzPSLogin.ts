import * as core from '@actions/core';

import AzPSScriptBuilder from './AzPSScriptBuilder';
import { AzPSUtils } from './AzPSUtils';
import { LoginConfig } from '../common/LoginConfig';

export class AzPSLogin {
    loginConfig: LoginConfig;

    constructor(loginConfig: LoginConfig) {
        this.loginConfig = loginConfig;
    }

    async login() {
        core.info(`Running Azure PowerShell Login.`);
        AzPSUtils.setPSModulePathForGitHubRunner();
        await AzPSUtils.importLatestAzAccounts();
        const [loginMethod, loginScript] = await AzPSScriptBuilder.getAzPSLoginScript(this.loginConfig);
        core.info(`Attempting Azure PowerShell login by using ${loginMethod}...`);
        core.debug(`Azure PowerShell Login Script: ${loginScript}`);
        await AzPSUtils.runPSScript(loginScript);
        console.log(`Running Azure PowerShell Login successfully.`);
    }
}
