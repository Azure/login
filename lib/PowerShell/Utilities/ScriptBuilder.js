"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const Constants_1 = __importDefault(require("../Constants"));
class ScriptBuilder {
    constructor() {
        this.script = "";
    }
    getAzPSLoginScript(scheme, tenantId, args) {
        let command = `Clear-AzContext -Scope Process;
             Clear-AzContext -Scope CurrentUser -Force -ErrorAction SilentlyContinue;`;
        if (scheme === Constants_1.default.ServicePrincipal) {
            if (args.environment.toLowerCase() == "azurestack") {
                command += `Add-AzEnvironment -Name ${args.environment} -ARMEndpoint ${args.resourceManagerEndpointUrl} | out-null;`;
            }
            // Separate command script for OIDC and non-OIDC
            if (!!args.federatedToken) {
                command += `Connect-AzAccount -ServicePrincipal -ApplicationId '${args.servicePrincipalId}' -Tenant '${tenantId}' -FederatedToken '${args.federatedToken}'  \
                    -Environment '${args.environment}' | out-null;`;
            }
            else {
                command += `Connect-AzAccount -ServicePrincipal -Tenant '${tenantId}' -Credential \
                (New-Object System.Management.Automation.PSCredential('${args.servicePrincipalId}',(ConvertTo-SecureString '${args.servicePrincipalKey.replace("'", "''")}' -AsPlainText -Force))) \
                    -Environment '${args.environment}' | out-null;`;
            }
            // command to set the subscription
            if (args.scopeLevel === Constants_1.default.Subscription && !args.allowNoSubscriptionsLogin) {
                command += `Set-AzContext -SubscriptionId '${args.subscriptionId}' -TenantId '${tenantId}' | out-null;`;
            }
        }
        this.script += `try {
            $ErrorActionPreference = "Stop"
            $WarningPreference = "SilentlyContinue"
            $output = @{}
            ${command}
            $output['${Constants_1.default.Success}'] = "true"
        }
        catch {
            $output['${Constants_1.default.Error}'] = $_.exception.Message
        }
        return ConvertTo-Json $output`;
        core.debug(`Azure PowerShell Login Script: ${this.script}`);
        return this.script;
    }
    getLatestModuleScript(moduleName) {
        const command = `Get-Module -Name ${moduleName} -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1`;
        this.script += `try {
            $ErrorActionPreference = "Stop"
            $WarningPreference = "SilentlyContinue"
            $output = @{}
            $data = ${command}
            $output['${Constants_1.default.AzVersion}'] = $data.Version.ToString()
            $output['${Constants_1.default.Success}'] = "true"
        }
        catch {
            $output['${Constants_1.default.Error}'] = $_.exception.Message
        }
        return ConvertTo-Json $output`;
        core.debug(`GetLatestModuleScript: ${this.script}`);
        return this.script;
    }
}
exports.default = ScriptBuilder;
