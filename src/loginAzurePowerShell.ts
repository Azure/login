import * as exec from '@actions/exec';
import * as io from '@actions/io';

var psPath: string;

export const initializeAz = async (servicePrincipalId: string, servicePrincipalKey: string, tenantId: string, subscriptionId: string) => {
    psPath = await io.which("pwsh", true);
    setPSModulePath();
    await loginToAzure(servicePrincipalId, servicePrincipalKey, tenantId, subscriptionId);
}

function setPSModulePath() {
    // TODO: get latest module/setup action
    let azPSVersion: string = "2.6.0";
    let modulePath: string = "";
    switch (process.env.RUNNER_OS) {
        case "Linux":
            modulePath = `/usr/share/az_${azPSVersion}:`;
            break;
        case "Windows":
            modulePath = `C:\\Modules\\az_${azPSVersion};`;
            break;
        case "macOS":
            // TODO: add modulepath
            break;
    }
    process.env.PSModulePath = `${modulePath}${process.env.PSModulePath}`;
}

async function loginToAzure(servicePrincipalId: string, servicePrincipalKey: string, tenantId: string, subscriptionId: string) {
    const environment: string = "AzureCloud";
    await executePowerShellCommand(`Clear-AzContext -Scope Process`);
    await executePowerShellCommand(`Clear-AzContext -Scope CurrentUser -Force -ErrorAction SilentlyContinue`);
    await executePowerShellCommand(`Connect-AzAccount -ServicePrincipal -Tenant ${tenantId} -Credential \
                (New-Object System.Management.Automation.PSCredential('${servicePrincipalId}',(ConvertTo-SecureString ${servicePrincipalKey} -AsPlainText -Force))) \
                    -Environment ${environment}`);
    await executePowerShellCommand(`Set-AzContext -SubscriptionId ${subscriptionId} -TenantId ${tenantId}`);
    await executePowerShellCommand(`Get-AzContext`);
}

async function executePowerShellCommand(command: string) {
    try {
        await exec.exec(`"${psPath}" -Command "${command}"`, [], {})
    } catch (error) {
        throw new Error(error);
    }
}