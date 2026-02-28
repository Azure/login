import * as exec from '@actions/exec';
import { LoginConfig } from "../common/LoginConfig";
import { ExecOptions } from '@actions/exec/lib/interfaces';
import * as core from '@actions/core';
import * as io from '@actions/io';

export class AzureCliLogin {
    loginConfig: LoginConfig;
    azPath: string;
    loginOptions: ExecOptions;
    azVersion: string;

    constructor(loginConfig: LoginConfig) {
        this.loginConfig = loginConfig;
        this.loginOptions = defaultExecOptions();
    }

    async login() {
        core.info(`Running Azure CLI Login.`);
        this.azPath = await io.which("az", true);
        core.debug(`Azure CLI path: ${this.azPath}`);

        let output: string = "";
        const execOptions: any = {
            listeners: {
                stdout: (data: Buffer) => {
                    output += data.toString();
                }
            }
        };

        await this.executeAzCliCommand(["version"], true, execOptions);
        core.debug(`Azure CLI version used:\n${output}`);
        try {
            this.azVersion = JSON.parse(output)["azure-cli"];
        }
        catch (error) {
            core.warning("Failed to parse Azure CLI version.");
        }
        await this.registerAzurestackEnvIfNecessary();

        await this.executeAzCliCommand(["cloud", "set", "-n", this.loginConfig.environment], false);
        core.info(`Done setting cloud: "${this.loginConfig.environment}"`);

        if (this.loginConfig.authType === LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL) {
            let args = ["--service-principal",
                "--username", this.loginConfig.servicePrincipalId,
                "--tenant", this.loginConfig.tenantId
            ];
            if (this.loginConfig.servicePrincipalSecret) {
                await this.loginWithSecret(args);
            }
            else {
                await this.loginWithOIDC(args);
            }
        }
        else {
            let args = ["--identity"];
            if (this.loginConfig.servicePrincipalId) {
                await this.loginWithUserAssignedIdentity(args);
            }
            else {
                await this.loginWithSystemAssignedIdentity(args);
            }
        }
    }

    async registerAzurestackEnvIfNecessary() {
        if (this.loginConfig.environment != "azurestack") {
            return;
        }
        if (!this.loginConfig.resourceManagerEndpointUrl) {
            throw new Error("resourceManagerEndpointUrl is a required parameter when environment is defined.");
        }

        core.info(`Unregistering cloud: "${this.loginConfig.environment}" first if it exists`);
        try {
            await this.executeAzCliCommand(["cloud", "set", "-n", "AzureCloud"], true);
            await this.executeAzCliCommand(["cloud", "unregister", "-n", this.loginConfig.environment], false);
        }
        catch (error) {
            core.info(`Ignore cloud not registered error: "${error}"`);
        }

        core.info(`Registering cloud: "${this.loginConfig.environment}" with ARM endpoint: "${this.loginConfig.resourceManagerEndpointUrl}"`);
        try {
            let baseUri = this.loginConfig.resourceManagerEndpointUrl;
            if (baseUri.endsWith('/')) {
                baseUri = baseUri.substring(0, baseUri.length - 1); // need to remove trailing / from resourceManagerEndpointUrl to correctly derive suffixes below
            }
            let suffixKeyvault = ".vault" + baseUri.substring(baseUri.indexOf('.')); // keyvault suffix starts with .
            let suffixStorage = baseUri.substring(baseUri.indexOf('.') + 1); // storage suffix starts without .
            let profileVersion = "2019-03-01-hybrid";
            await this.executeAzCliCommand(["cloud", "register", "-n", this.loginConfig.environment, "--endpoint-resource-manager", this.loginConfig.resourceManagerEndpointUrl, "--suffix-keyvault-dns", suffixKeyvault, "--suffix-storage-endpoint", suffixStorage, "--profile", profileVersion], false);
        }
        catch (error) {
            core.error(`Error while trying to register cloud "${this.loginConfig.environment}"`);
            throw error;
        }

        core.info(`Done registering cloud: "${this.loginConfig.environment}"`)
    }

    async loginWithSecret(args: string[]) {
        core.info("Note: Azure/login action also supports OIDC login mechanism. Refer https://github.com/azure/login#configure-a-service-principal-with-a-federated-credential-to-use-oidc-based-authentication for more details.")
        args.push(`--password=${this.loginConfig.servicePrincipalSecret}`);
        await this.callCliLogin(args, 'service principal with secret');
    }

    async loginWithOIDC(args: string[]) {
        await this.loginConfig.getFederatedToken();
        args.push("--federated-token", this.loginConfig.federatedToken);
        await this.callCliLogin(args, 'OIDC');
    }

    async loginWithUserAssignedIdentity(args: string[]) {
        let azcliMinorVersion = 0;
        try {
            azcliMinorVersion = parseInt(this.azVersion.split('.')[1], 10);
        }
        catch (error) {
            core.warning("Failed to parse the minor version of Azure CLI. Assuming the version is less than 2.69.0");
        }
        //From Azure-cli v2.69.0, `--username` is replaced with `--client-id`, `--object-id` or `--resource-id`: https://github.com/Azure/azure-cli/pull/30525
        if (azcliMinorVersion < 69) {
            args.push("--username", this.loginConfig.servicePrincipalId);
        }
        else {
            args.push("--client-id", this.loginConfig.servicePrincipalId);
        }
        await this.callCliLogin(args, 'user-assigned managed identity');
    }

    async loginWithSystemAssignedIdentity(args: string[]) {
        await this.callCliLogin(args, 'system-assigned managed identity');
    }

    async callCliLogin(args: string[], methodName: string) {
        core.info(`Attempting Azure CLI login by using ${methodName}...`);
        args.unshift("login");
        if (this.loginConfig.allowNoSubscriptionsLogin) {
            args.push("--allow-no-subscriptions");
        }
        await this.executeAzCliCommand(args, true, this.loginOptions);
        if (this.loginConfig.subscriptionId) {
            await this.setSubscription();
        }
        core.info(`Azure CLI login succeeds by using ${methodName}.`);
    }

    async setSubscription() {
        let args = ["account", "set", "--subscription", this.loginConfig.subscriptionId];
        await this.executeAzCliCommand(args, true, this.loginOptions);
        core.info("Subscription is set successfully.");
    }

    async executeAzCliCommand(
        args: string[],
        silent?: boolean,
        execOptions: any = {}) {
        execOptions.silent = !!silent;
        await exec.exec(`"${this.azPath}"`, args, execOptions);
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
                        error = error.slice(7);
                    }
                    core.error(error);
                }
            }
        }
    };
}

