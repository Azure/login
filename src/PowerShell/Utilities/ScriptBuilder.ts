import * as core from '@actions/core';

import Constants from "../Constants";

export default class ScriptBuilder {
    script: string = "";

    getAzPSLoginScript(scheme: string, tenantId: string, args: any): string {
        let command = `Clear-AzContext -Scope Process;
             Clear-AzContext -Scope CurrentUser -Force -ErrorAction SilentlyContinue;`;
        if (scheme === Constants.ServicePrincipal) {
            command += `Connect-AzAccount -ServicePrincipal -Tenant '${tenantId}' -Credential \
            (New-Object System.Management.Automation.PSCredential('${args.servicePrincipalId}',(ConvertTo-SecureString '${args.servicePrincipalKey.replace("'", "''")}' -AsPlainText -Force))) \
                -Environment '${args.environment}' | out-null;`;
            if (args.scopeLevel === Constants.Subscription) {
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

    getLatestAzModuleScript(azPathPrefix: string): string {        
        const command: string = `$(if (Test-Path ${azPathPrefix}*) { \`
                                   (Get-ChildItem ${azPathPrefix}* -Directory -Name \`
                                       | Sort-Object -Descending \`
                                       | Select-Object -First 1 \`
                                   ).Substring(${Constants.prefix.length}) \`
                                 } else {  \` 
                                    (Get-Module -Name ${Constants.moduleName} -ListAvailable \`
                                       | Sort-Object Version -Descending \`
                                       | Select-Object -First 1 -ExpandProperty Version \`
                                    ).ToString() \`
                                 })`;

        this.script += `try {
            $ErrorActionPreference = "Stop"
            $WarningPreference = "SilentlyContinue"
            $output = @{}
            $data = ${command}
            $output['${Constants.AzVersion}'] = $data
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
