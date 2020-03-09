import * as os from 'os';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

var psPath: string;

export const initializeAz = async (servicePrincipalId: string, servicePrincipalKey: string, tenantId: string, subscriptionId: string) => {
    psPath = await io.which("pwsh", true);
    const prefix = "az_";
    setPSModulePath();
    const azLatestVersion: string = await getLatestAzModule();
    setPSModulePath(`${prefix}${azLatestVersion}`);
    await loginToAzure(servicePrincipalId, servicePrincipalKey, tenantId, subscriptionId);
}

function setPSModulePath(azPSVersion: string = "") {
    let modulePath: string = "";
    const RUNNER: string = process.env.RUNNER_OS || os.type();
    switch (RUNNER) {
        case "Linux":
            modulePath = `/usr/share/${azPSVersion}:`;
            break;
        case "Windows":
        case "Windows_NT":
            modulePath = `C:\\Modules\\${azPSVersion};`;
            break;
        case "macOS":
        case "Darwin":
            // TODO: add modulepath
            break;
    }
    process.env.PSModulePath = `${modulePath}${process.env.PSModulePath}`;
}

async function getLatestAzModule() {
    const moduleName: string = "Az.Accounts";
    let output: string = "";
    let error: string = "";
    let options: any = {
        listeners: {
            stdout: (data: Buffer) => {
                output += data.toString();
            },
            stderr: (data: Buffer) => {
                error += data.toString();
            }
        }
    };
    await executePowerShellCommand(`(Get-Module -Name ${moduleName} -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1).Version.ToString()`, options);
    core.debug(`Az Module version used: ${output}`);
    return output;
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

async function executePowerShellCommand(command: string, options: any = {}) {
    try {
        await exec.exec(`"${psPath}" -Command "${command}"`, [], options);
    } catch (error) {
        throw new Error(error);
    }
}
