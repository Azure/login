"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ScriptBuilder {
    getScript(scheme, tenantId, servicePrincipalId, servicePrincipalKey, subscriptionId, environment, scopeLevel) {
        this.script += `Clear-AzContext -Scope Process; Clear-AzContext -Scope CurrentUser -Force -ErrorAction SilentlyContinue;`;
        if (scheme === "ServicePrincipal") {
            this.script += `Connect-AzAccount -ServicePrincipal -Tenant ${tenantId} -Credential \
            (New-Object System.Management.Automation.PSCredential('${servicePrincipalId}',(ConvertTo-SecureString ${servicePrincipalKey} -AsPlainText -Force))) \
                -Environment ${environment};`;
            if (scopeLevel === "Subscription") {
                this.script += `Set-AzContext -SubscriptionId ${subscriptionId} -TenantId ${tenantId};`;
            }
        }
        this.script += `Get-AzContext`;
        return this.script;
    }
}
exports.default = ScriptBuilder;
