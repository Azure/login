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
        const { methodName, args, env } = await AzPSScriptBuilder.getAzPSLoginInvocation(this.loginConfig);
        core.info(`Attempting Azure PowerShell login by using ${methodName}...`);
        core.debug(`Azure PowerShell login invocation: pwsh ${JSON.stringify(args)}`);
        await AzPSUtils.runPSFile(args, env);
        console.log(`Running Azure PowerShell Login successfully.`);
    }
}
