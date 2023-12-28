import * as core from '@actions/core';

import AzPSScriptBuilder from './AzPSScriptBuilder';
import AzPSConfig from './AzPSConfig';
import { LoginConfig } from '../common/LoginConfig';

export class AzPSLogin {
    loginConfig: LoginConfig;

    constructor(loginConfig: LoginConfig) {
        this.loginConfig = loginConfig;
    }

    async login() {
        core.info(`Running Azure PowerShell Login.`);
        AzPSConfig.setPSModulePathForGitHubRunner();
        await AzPSConfig.importLatestAzAccounts();
        const [loginMethod, loginScript] = await AzPSScriptBuilder.getAzPSLoginScript(this.loginConfig);
        core.info(`Attempting Azure PowerShell login by using ${loginMethod}...`);
        core.debug(`Azure PowerShell Login Script: ${loginScript}`);
        await AzPSConfig.runPSScript(loginScript);
        console.log(`Running Azure PowerShell Login successfully.`);
    }
}
