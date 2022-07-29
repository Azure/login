import * as core from '@actions/core';

import Constants from "../Constants";

export default class ScriptBuilder {
    script: string = "";

    getAzPSLoginScript(scheme: string, tenantId: string, args: any): string {
        let command = `Clear-AzContext -Scope Process;
             Clear-AzContext -Scope CurrentUser -Force -ErrorAction SilentlyContinue;`;

        if (scheme === Constants.ServicePrincipal) {

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
            if (args.scopeLevel === Constants.Subscription && !args.allowNoSubscriptionsLogin) {
                command += `Set-AzContext -SubscriptionId '${args.subscriptionId}' -TenantId '${tenantId}' | out-null;`;
            }
        }

        this.script += `try {
            $ErrorActionPreference = "Stop"
            $WarningPreference = "SilentlyContinue"
            $output = @{}
            ${command}
            $output['${Constants.Success}'] = "true"
        }
        catch {
            $output['${Constants.Error}'] = $_.exception.Message
        }
        return ConvertTo-Json $output`;

        core.debug(`Azure PowerShell Login Script: ${this.script}`);
        return this.script;
    }

    getLatestModuleScript(moduleName: string): string {
        const command: string = `Get-Module -Name ${moduleName} -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1`;
        this.script += `try {
            $ErrorActionPreference = "Stop"
            $WarningPreference = "SilentlyContinue"
            $output = @{}
            $data = ${command}
            $output['${Constants.AzVersion}'] = $data.Version.ToString()
            $output['${Constants.Success}'] = "true"
        }
        catch {
            $output['${Constants.Error}'] = $_.exception.Message
        }
        return ConvertTo-Json $output`;
        core.debug(`GetLatestModuleScript: ${this.script}`);
        return this.script;
    }

}