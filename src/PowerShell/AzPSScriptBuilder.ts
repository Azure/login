import AzPSConstants from "./AzPSConstants";
import { LoginConfig } from '../common/LoginConfig';

export default class AzPSScriptBuilder {

    static getLatestModulePathScript(moduleName: string): string {
        let script = `try {
            $ErrorActionPreference = "Stop"
            $WarningPreference = "SilentlyContinue"
            $output = @{}
            $latestModulePath = (Get-Module -Name '${moduleName}' -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1).ModuleBase
            $latestModulePath = Join-Path $latestModulePath ".." | Resolve-Path
            $output['${AzPSConstants.Result}'] = $latestModulePath.ToString()
            $output['${AzPSConstants.Success}'] = "true"
        }
        catch {
            $output['${AzPSConstants.Error}'] = $_.exception.Message
        }
        return ConvertTo-Json $output`;

        return script;
    }

    static async getAzPSLoginScript(loginConfig: LoginConfig) {
        let loginMethodName = "";
        let commands = 'Clear-AzContext -Scope Process; ';
        commands += 'Clear-AzContext -Scope CurrentUser -Force -ErrorAction SilentlyContinue; ';

        if (loginConfig.environment.toLowerCase() == "azurestack") {
            commands += `Add-AzEnvironment -Name '${loginConfig.environment}' -ARMEndpoint '${loginConfig.resourceManagerEndpointUrl}' | out-null;`;
        }
        if (loginConfig.authType === "service_principal") {
            if (loginConfig.servicePrincipalKey) {
                let servicePrincipalKey: string = loginConfig.servicePrincipalKey.split("'").join("''");
                commands += AzPSScriptBuilder.loginWithSecret(loginConfig.environment, loginConfig.tenantId, loginConfig.servicePrincipalId, servicePrincipalKey);
                loginMethodName = 'service principal with secret';
            } else {
                await loginConfig.getFederatedToken();
                commands += AzPSScriptBuilder.loginWithOIDC(loginConfig.environment, loginConfig.tenantId, loginConfig.servicePrincipalId, loginConfig.federatedToken);
                loginMethodName = "OIDC";
            }
        } else {
            if (loginConfig.servicePrincipalId) {
                commands += AzPSScriptBuilder.loginWithUserAssignedIdentity(loginConfig.environment, loginConfig.servicePrincipalId);
                loginMethodName = 'user-assigned managed identity';
            } else {
                commands += AzPSScriptBuilder.loginWithSystemAssignedIdentity(loginConfig.environment);
                loginMethodName = 'system-assigned managed identity';
            }
        }

        commands += AzPSScriptBuilder.setSubscription(loginConfig.allowNoSubscriptionsLogin, loginConfig.subscriptionId, loginConfig.tenantId);

        let script = `try {
            $ErrorActionPreference = "Stop"
            $WarningPreference = "SilentlyContinue"
            $output = @{}
            ${commands}
            $output['${AzPSConstants.Success}'] = "true"
            $output['${AzPSConstants.Result}'] = ""
        }
        catch {
            $output['${AzPSConstants.Error}'] = $_.exception.Message
        }
        return ConvertTo-Json $output`;

        return [loginMethodName, script];
    }

    private static setSubscription(allowNoSubscriptionsLogin:boolean, subscriptionId:string, tenantId:string) {
        if (!allowNoSubscriptionsLogin && subscriptionId) {
            if (tenantId) {
                return `Set-AzContext -SubscriptionId '${subscriptionId}' -TenantId '${tenantId}' | out-null;`;
            } else {
                return `Set-AzContext -SubscriptionId '${subscriptionId}' | out-null;`;
            }
        }
        return "";
    }

    private static loginWithSecret(environment: string, tenantId: string, servicePrincipalId: string, servicePrincipalKey: string): string {
        let loginCmdlet = `$psLoginSecrets = ConvertTo-SecureString '${servicePrincipalKey}' -AsPlainText -Force; `;
        loginCmdlet += `$psLoginCredential = New-Object System.Management.Automation.PSCredential('${servicePrincipalId}', $psLoginSecrets); `;
        loginCmdlet += `Connect-AzAccount -ServicePrincipal -Environment '${environment}' -Tenant '${tenantId}' -Credential $psLoginCredential | out-null; `; //TODO: why not set environment
        return loginCmdlet;
    }

    private static loginWithOIDC(environment: string, tenantId: string, servicePrincipalId: string, federatedToken: string) {
        let loginCmdlet = `Connect-AzAccount -ServicePrincipal -ApplicationId '${servicePrincipalId}' -Tenant '${tenantId}' -FederatedToken '${federatedToken}' -Environment '${environment}' | out-null;`;
        return loginCmdlet;
    }

    private static loginWithSystemAssignedIdentity(environment: string): string {
        let loginCmdlet = `Connect-AzAccount -Identity -Environment '${environment}' | out-null;`;
        return loginCmdlet;
    }

    static loginWithUserAssignedIdentity(environment: string, servicePrincipalId: string): string {
        let loginCmdlet = `Connect-AzAccount -Identity -Environment '${environment}' -AccountId '${servicePrincipalId}' | out-null;`;
        return loginCmdlet;
    }
}