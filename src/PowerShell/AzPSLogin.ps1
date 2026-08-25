[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('azurecloud', 'azurechinacloud', 'azureusgovernment', 'azuregermancloud', 'azurestack')]
    [string]$Environment,

    [Parameter(Mandatory)]
    [ValidateSet('SERVICE_PRINCIPAL', 'IDENTITY')]
    [string]$AuthType,

    [string]$Tenant,

    [string]$Subscription,

    [string]$ApplicationId,

    [string]$ArmEndpoint
)

$ErrorActionPreference = 'Stop'
$WarningPreference = 'SilentlyContinue'

try {
    if ($Environment -eq 'azurestack') {
        if ([string]::IsNullOrEmpty($ArmEndpoint)) {
            throw "ArmEndpoint is required when Environment is 'azurestack'."
        }
        Add-AzEnvironment -Name $Environment -ARMEndpoint $ArmEndpoint | Out-Null
    }

    $connectArgs = @{
        Environment       = $Environment
        InformationAction = 'Ignore'
    }
    if ($Tenant)       { $connectArgs['Tenant']       = $Tenant }
    if ($Subscription) { $connectArgs['Subscription'] = $Subscription }

    if ($AuthType -eq 'SERVICE_PRINCIPAL') {
        $connectArgs['ServicePrincipal'] = $true

        if ($env:AZURE_LOGIN_ACTION__SP_SECRET) {
            $secure = ConvertTo-SecureString $env:AZURE_LOGIN_ACTION__SP_SECRET -AsPlainText -Force
            $connectArgs['Credential'] = New-Object System.Management.Automation.PSCredential($ApplicationId, $secure)
            Remove-Item Env:AZURE_LOGIN_ACTION__SP_SECRET -ErrorAction SilentlyContinue
        }
        elseif ($env:AZURE_LOGIN_ACTION__FEDERATED_TOKEN) {
            $connectArgs['ApplicationId']  = $ApplicationId
            $connectArgs['FederatedToken'] = $env:AZURE_LOGIN_ACTION__FEDERATED_TOKEN
            Remove-Item Env:AZURE_LOGIN_ACTION__FEDERATED_TOKEN -ErrorAction SilentlyContinue
        }
        else {
            throw "SERVICE_PRINCIPAL auth requires either AZURE_LOGIN_ACTION__SP_SECRET or AZURE_LOGIN_ACTION__FEDERATED_TOKEN in the environment."
        }
    }
    else {
        $connectArgs['Identity'] = $true
        if ($ApplicationId) {
            $connectArgs['AccountId'] = $ApplicationId
        }
    }

    Connect-AzAccount @connectArgs | Out-Null

    $output = @{ Success = $true; Result = '' }
}
catch {
    $output = @{ Success = $false; Error = $_.Exception.Message }
}
finally {
    Remove-Item Env:AZURE_LOGIN_ACTION__SP_SECRET -ErrorAction SilentlyContinue
    Remove-Item Env:AZURE_LOGIN_ACTION__FEDERATED_TOKEN -ErrorAction SilentlyContinue
}

ConvertTo-Json $output
