"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const LoginConfig_1 = require("../common/LoginConfig");
class AzPSScriptBuilder {
    static getImportLatestModuleScript(moduleName) {
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
    static getAzPSLoginScript(loginConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            let loginMethodName = "";
            let commands = "";
            if (loginConfig.environment.toLowerCase() == "azurestack") {
                commands += `Add-AzEnvironment -Name '${loginConfig.environment}' -ARMEndpoint '${loginConfig.resourceManagerEndpointUrl}' | out-null;`;
            }
            if (loginConfig.authType === LoginConfig_1.LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL) {
                if (loginConfig.servicePrincipalSecret) {
                    commands += AzPSScriptBuilder.loginWithSecret(loginConfig);
                    loginMethodName = 'service principal with secret';
                }
                else {
                    commands += yield AzPSScriptBuilder.loginWithOIDC(loginConfig);
                    loginMethodName = "OIDC";
                }
            }
            else {
                if (loginConfig.servicePrincipalId) {
                    commands += AzPSScriptBuilder.loginWithUserAssignedIdentity(loginConfig);
                    loginMethodName = 'user-assigned managed identity';
                }
                else {
                    commands += AzPSScriptBuilder.loginWithSystemAssignedIdentity(loginConfig);
                    loginMethodName = 'system-assigned managed identity';
                }
            }
            let script = `try {
            $ErrorActionPreference = "Stop"
            $WarningPreference = "SilentlyContinue"
            $output = @{}
            ${commands}
            $output['Success'] = $true
            $output['Result'] = ""
        }
        catch {
            $output['Success'] = $false
            $output['Error'] = $_.exception.Message
        }
        return ConvertTo-Json $output`;
            return [loginMethodName, script];
        });
    }
    static loginWithSecret(loginConfig) {
        let servicePrincipalSecret = loginConfig.servicePrincipalSecret.split("'").join("''");
        let loginCmdlet = `$psLoginSecrets = ConvertTo-SecureString '${servicePrincipalSecret}' -AsPlainText -Force; `;
        loginCmdlet += `$psLoginCredential = New-Object System.Management.Automation.PSCredential('${loginConfig.servicePrincipalId}', $psLoginSecrets); `;
        let cmdletSuffix = "-Credential $psLoginCredential";
        loginCmdlet += AzPSScriptBuilder.psLoginCmdlet(loginConfig.authType, loginConfig.environment, loginConfig.tenantId, loginConfig.subscriptionId, cmdletSuffix);
        return loginCmdlet;
    }
    static loginWithOIDC(loginConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            yield loginConfig.getFederatedToken();
            let cmdletSuffix = `-ApplicationId '${loginConfig.servicePrincipalId}' -FederatedToken '${loginConfig.federatedToken}'`;
            return AzPSScriptBuilder.psLoginCmdlet(loginConfig.authType, loginConfig.environment, loginConfig.tenantId, loginConfig.subscriptionId, cmdletSuffix);
        });
    }
    static loginWithSystemAssignedIdentity(loginConfig) {
        let cmdletSuffix = "";
        return AzPSScriptBuilder.psLoginCmdlet(loginConfig.authType, loginConfig.environment, loginConfig.tenantId, loginConfig.subscriptionId, cmdletSuffix);
    }
    static loginWithUserAssignedIdentity(loginConfig) {
        let cmdletSuffix = `-AccountId '${loginConfig.servicePrincipalId}'`;
        return AzPSScriptBuilder.psLoginCmdlet(loginConfig.authType, loginConfig.environment, loginConfig.tenantId, loginConfig.subscriptionId, cmdletSuffix);
    }
    static psLoginCmdlet(authType, environment, tenantId, subscriptionId, cmdletSuffix) {
        let loginCmdlet = `Connect-AzAccount `;
        if (authType === LoginConfig_1.LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL) {
            loginCmdlet += "-ServicePrincipal ";
        }
        else {
            loginCmdlet += "-Identity ";
        }
        loginCmdlet += `-Environment '${environment}' `;
        if (tenantId) {
            loginCmdlet += `-Tenant '${tenantId}' `;
        }
        if (subscriptionId) {
            loginCmdlet += `-Subscription '${subscriptionId}' `;
        }
        loginCmdlet += `${cmdletSuffix} | out-null;`;
        return loginCmdlet;
    }
}
exports.default = AzPSScriptBuilder;
