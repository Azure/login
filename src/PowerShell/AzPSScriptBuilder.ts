import * as path from 'path';
import { LoginConfig } from '../common/LoginConfig';

export interface AzPSLoginInvocation {
    methodName: string;
    args: string[];
    env: Record<string, string>;
}

export default class AzPSScriptBuilder {

    static readonly ENV_SP_SECRET        = 'AZURE_LOGIN_ACTION__SP_SECRET';
    static readonly ENV_FEDERATED_TOKEN  = 'AZURE_LOGIN_ACTION__FEDERATED_TOKEN';

    static getScriptPath(): string {
        return path.join(__dirname, 'AzPSLogin.ps1');
    }

    static getImportLatestModuleScript(moduleName: string): string {
        let script = `try {
            $ErrorActionPreference = "Stop"
            $WarningPreference = "SilentlyContinue"
            $output = @{}
            $latestModulePath = (Get-Module -Name '${moduleName}' -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1).Path
            Import-Module -Name $latestModulePath
            $output['Success'] = $true
            $output['Result'] = $latestModulePath
        }
        catch {
            $output['Success'] = $false
            $output['Error'] = $_.exception.Message
        }
        return ConvertTo-Json $output`;

        return script;
    }

    static async getAzPSLoginInvocation(loginConfig: LoginConfig): Promise<AzPSLoginInvocation> {
        const args: string[] = [
            '-File',        AzPSScriptBuilder.getScriptPath(),
            '-Environment', loginConfig.environment,
            '-AuthType',    loginConfig.authType,
        ];
        const env: Record<string, string> = {};
        let methodName: string;

        if (loginConfig.tenantId) {
            args.push('-Tenant', loginConfig.tenantId);
        }
        if (loginConfig.subscriptionId) {
            args.push('-Subscription', loginConfig.subscriptionId);
        }
        if (loginConfig.environment.toLowerCase() === 'azurestack') {
            args.push('-ArmEndpoint', loginConfig.resourceManagerEndpointUrl);
        }

        if (loginConfig.authType === LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL) {
            args.push('-ApplicationId', loginConfig.servicePrincipalId);
            if (loginConfig.servicePrincipalSecret) {
                env[AzPSScriptBuilder.ENV_SP_SECRET] = loginConfig.servicePrincipalSecret;
                methodName = 'service principal with secret';
            } else {
                await loginConfig.getFederatedToken();
                env[AzPSScriptBuilder.ENV_FEDERATED_TOKEN] = loginConfig.federatedToken;
                methodName = 'OIDC';
            }
        } else {
            if (loginConfig.servicePrincipalId) {
                args.push('-ApplicationId', loginConfig.servicePrincipalId);
                methodName = 'user-assigned managed identity';
            } else {
                methodName = 'system-assigned managed identity';
            }
        }

        return { methodName, args, env };
    }
}

