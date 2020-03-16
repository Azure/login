export default class ScriptBuilder {
    script: string;
    getScript(scheme: string, tenantId: string, servicePrincipalId: string, servicePrincipalKey: string, subscriptionId: string, environment: string, scopeLevel: string): string {
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