import * as exec from '@actions/exec';
import { LoginConfig } from "../common/LoginConfig";
import { ExecOptions } from '@actions/exec/lib/interfaces';
import * as core from '@actions/core';
import * as io from '@actions/io';

export class AzureCliLogin {
    loginConfig: LoginConfig;
    azPath: string;
    loginOptions: ExecOptions;
    isSuccess: boolean;

    constructor(loginConfig: LoginConfig) {
        this.loginConfig = loginConfig;
        this.loginOptions = defaultExecOptions();
        this.isSuccess = false;
    }

    async login() {
        this.azPath = await io.which("az", true);
        if (!this.azPath) {
            throw new Error("az cli is not found in the runner.");
        }
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

        this.setAzurestackEnvIfNecessary();

        await this.executeAzCliCommand(`cloud set -n "${this.loginConfig.environment}"`, false);
        console.log(`Done setting cloud: "${this.loginConfig.environment}"`);

        await this.loginWithSecret();
        await this.loginWithOIDC();
        await this.loginWithUserManagedIdentity();
        await this.loginWithSystemManagedIdentity();
    }

    async setAzurestackEnvIfNecessary() {
        if (this.loginConfig.environment != "azurestack") {
            return;
        }
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

    async loginWithSecret() {
        if (!(this.loginConfig.servicePrincipalId && this.loginConfig.tenantId && this.loginConfig.servicePrincipalKey) || this.isSuccess) {
            return;
        }
        console.log(`Attempting az cli login by using service principal with secret...\nNote: Azure/login action also supports OIDC login mechanism. If you want to use OIDC login, please do not input ClientSecret. Refer https://github.com/azure/login#configure-a-service-principal-with-a-federated-credential-to-use-oidc-based-authentication for more details.`);
        var commonArgs = ["--service-principal",
            "-u", this.loginConfig.servicePrincipalId,
            "--tenant", this.loginConfig.tenantId,
            "-p", this.loginConfig.servicePrincipalKey
        ];
        if (this.loginConfig.allowNoSubscriptionsLogin) {
            commonArgs = commonArgs.concat("--allow-no-subscriptions");
        }
        try {
            await this.executeAzCliCommand(`login`, true, this.loginOptions, commonArgs);
            await this.setSubscription();
            this.isSuccess = true;
        }
        catch (error) {
            core.error(`Failed with error: ${error}.\nStop login by using service principal with secret.`);
        }
    }

    async loginWithOIDC() {
        if (!(this.loginConfig.servicePrincipalId && this.loginConfig.tenantId) || this.isSuccess) {
            return;
        }
        console.log(`Attempting az cli login by using OIDC...`);
        var commonArgs = ["--service-principal",
            "-u", this.loginConfig.servicePrincipalId,
            "--tenant", this.loginConfig.tenantId,
            "--federated-token", this.loginConfig.federatedToken
        ];
        if (this.loginConfig.allowNoSubscriptionsLogin) {
            commonArgs = commonArgs.concat("--allow-no-subscriptions");
        }
        try {
            await this.executeAzCliCommand(`login`, true, this.loginOptions, commonArgs);
            await this.setSubscription();
            this.isSuccess = true;
        }
        catch (error) {
            core.error(`Failed with error: ${error}.\nStop login by using OIDC.`);
        }
    }

    async loginWithUserManagedIdentity() {
        if (!this.loginConfig.servicePrincipalId || this.isSuccess) {
            return;
        }
        console.log(`Attempting az cli login by using user-assigned managed identity...`);
        var commonArgs = ["--identity",
            "-u", this.loginConfig.servicePrincipalId];
        if (this.loginConfig.allowNoSubscriptionsLogin) {
            commonArgs = commonArgs.concat("--allow-no-subscriptions");
        }
        await this.executeAzCliCommand(`login`, true, this.loginOptions, commonArgs);
        await this.setSubscription();
        try {
            await this.executeAzCliCommand(`login`, true, this.loginOptions, commonArgs);
            await this.setSubscription();
            this.isSuccess = true;
        }
        catch (error) {
            core.error(`Failed with error: ${error}.\nStop login by using user-assigned managed identity.`);
        }
    }

    async loginWithSystemManagedIdentity() {
        if (this.isSuccess) {
            return;
        }
        console.log(`Attempting az cli login by using system-assigned managed identity...`);
        var commonArgs = ["--identity"];
        if (this.loginConfig.allowNoSubscriptionsLogin) {
            commonArgs = commonArgs.concat("--allow-no-subscriptions");
        }
        try {
            await this.executeAzCliCommand(`login`, true, this.loginOptions, commonArgs);
            await this.setSubscription();
            this.isSuccess = true;
        }
        catch (error) {
            core.error(`Failed with error: ${error}.\nStop login by using system-assigned managed identity.`);
        }
    }

    async setSubscription() {
        if (!this.loginConfig.subscriptionId) {
            if (!this.loginConfig.allowNoSubscriptionsLogin) {
                core.warning(`No subscription-id is given. Skip setting subscription...\nIf there are mutiple subscriptions under the tenant, please input subscription-id to specify which subscription to use.`);
            }
            return;
        }
        var args = ["--subscription", this.loginConfig.subscriptionId];
        await this.executeAzCliCommand(`account set`, true, this.loginOptions, args);
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

