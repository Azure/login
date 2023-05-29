import * as exec from '@actions/exec';
import { LoginConfig } from "../common/LoginConfig";
import { ExecOptions } from '@actions/exec/lib/interfaces';
import * as core from '@actions/core';
import * as io from '@actions/io';

export class AzureCliLogin {
    loginConfig: LoginConfig;
    azPath: string;
    
    constructor(loginConfig: LoginConfig) {
        this.loginConfig = loginConfig;
    }

    async login() {
        this.azPath = await io.which("az", true);
        core.debug(`az cli path: ${this.azPath}`);

        let output: string = "";
        const execOptions: any = {
            listeners: {
                stdout: (data: Buffer) => {
                    output += data.toString();
                }
            }
        };
        await this.executeAzCliCommand("--version", true, execOptions);
        core.debug(`az cli version used:\n${output}`);
        
        if (this.loginConfig.environment == "azurestack") {
            this.setAzurestackEnv();
        }

        await this.executeAzCliCommand(`cloud set -n "${this.loginConfig.environment}"`, false);
        console.log(`Done setting cloud: "${this.loginConfig.environment}"`);

        // Attempting Az cli login
        var commonArgs = ["--service-principal",
            "-u", this.loginConfig.servicePrincipalId,
            "--tenant", this.loginConfig.tenantId
        ];
        if (this.loginConfig.allowNoSubscriptionsLogin) {
            commonArgs = commonArgs.concat("--allow-no-subscriptions");
        }
        if (this.loginConfig.servicePrincipalKey) {
            console.log("Note: Azure/login action also supports OIDC login mechanism. Refer https://github.com/azure/login#configure-a-service-principal-with-a-federated-credential-to-use-oidc-based-authentication for more details.")
            commonArgs = commonArgs.concat("-p", this.loginConfig.servicePrincipalKey);
        }
        else {
            commonArgs = commonArgs.concat("--federated-token", this.loginConfig.federatedToken);
        }

        const loginOptions: ExecOptions = defaultExecOptions();
        await this.executeAzCliCommand(`login`, true, loginOptions, commonArgs);

        if (!this.loginConfig.allowNoSubscriptionsLogin) {
            var args = [
                "--subscription",
                this.loginConfig.subscriptionId
            ];
            await this.executeAzCliCommand(`account set`, true, loginOptions, args);
        }
    }

    async setAzurestackEnv() {
        if (!this.loginConfig.resourceManagerEndpointUrl) {
            throw new Error("resourceManagerEndpointUrl is a required parameter when environment is defined.");
        }

        console.log(`Unregistering cloud: "${this.loginConfig.environment}" first if it exists`);
        try {
            await this.executeAzCliCommand(`cloud set -n AzureCloud`, true);
            await this.executeAzCliCommand(`cloud unregister -n "${this.loginConfig.environment}"`, false);
        }
        catch (error) {
            console.log(`Ignore cloud not registered error: "${error}"`);
        }

        console.log(`Registering cloud: "${this.loginConfig.environment}" with ARM endpoint: "${this.loginConfig.resourceManagerEndpointUrl}"`);
        try {
            let baseUri = this.loginConfig.resourceManagerEndpointUrl;
            if (baseUri.endsWith('/')) {
                baseUri = baseUri.substring(0, baseUri.length - 1); // need to remove trailing / from resourceManagerEndpointUrl to correctly derive suffixes below
            }
            let suffixKeyvault = ".vault" + baseUri.substring(baseUri.indexOf('.')); // keyvault suffix starts with .
            let suffixStorage = baseUri.substring(baseUri.indexOf('.') + 1); // storage suffix starts without .
            let profileVersion = "2019-03-01-hybrid";
            await this.executeAzCliCommand(`cloud register -n "${this.loginConfig.environment}" --endpoint-resource-manager "${this.loginConfig.resourceManagerEndpointUrl}" --suffix-keyvault-dns "${suffixKeyvault}" --suffix-storage-endpoint "${suffixStorage}" --profile "${profileVersion}"`, false);
        }
        catch (error) {
            core.error(`Error while trying to register cloud "${this.loginConfig.environment}": "${error}"`);
        }

        console.log(`Done registering cloud: "${this.loginConfig.environment}"`)
    }

    async executeAzCliCommand(
        command: string,
        silent?: boolean,
        execOptions: any = {},
        args: any = []) {
        execOptions.silent = !!silent;
        await exec.exec(`"${this.azPath}" ${command}`, args, execOptions);
    }
}

function defaultExecOptions(): exec.ExecOptions {
    return {
        silent: true,
        listeners: {
            stderr: (data: Buffer) => {
                let error = data.toString();
                let startsWithWarning = error.toLowerCase().startsWith('warning');
                let startsWithError = error.toLowerCase().startsWith('error');
                // printing ERROR
                if (error && error.trim().length !== 0 && !startsWithWarning) {
                    if (startsWithError) {
                        //removing the keyword 'ERROR' to avoid duplicates while throwing error
                        error = error.slice(5);
                    }
                    core.setFailed(error);
                }
            }
        }
    };
}

