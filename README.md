# GitHub Actions for deploying to Azure

[GitHub Actions](https://help.github.com/articles/about-github-actions) gives you the flexibility to build an automated software development lifecycle workflow.

With [GitHub Actions for Azure](https://github.com/Azure/actions/), you can create workflows that you can set up in your repository to build, test, package, release and **deploy** to Azure.

With the [Azure Login Action](https://github.com/Azure/login), you can login to Azure and run Azure CLI and Azure PowerShell scripts.

Azure Login Action support different ways of authentication with Azure.

- Login with OpenID Connect (OIDC)
- Login with a Service Principal Secret
- Login with System-assigned Managed Identity
- Login with User-assigned Managed Identity

**We recommend using OIDC based authentication for increased security.**

> [!WARNING]
> By default, the output of Azure CLI commands is printed to the stdout stream. Without redirecting the stdout stream, contents in it will be stored in the build log of the action. Configure Azure CLI to _not_ show output in the console screen or print in the log by setting the environment variable `AZURE_CORE_OUTPUT` to `none`. If you need the output of a specific command, override the default setting using the argument `--output` with your format of choice. For more information on output options with the Azure CLI, see [Format output](https://learn.microsoft.com/cli/azure/format-output-azure-cli).

## Input Parameters

### Parameter `client-id`

The input parameter `client-id` specifies the login client id. It could be the client id of a service principal or a user-assigned managed identity.

It's used in login with OpenID Connect (OIDC) and user-assigned managed identity.

It's better to create a GitHub Action secret for this parameter when using it. Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).

### Parameter `subscription-id`

The input parameter `subscription-id` specifies the login subscription id.

It's used in login with OpenID Connect (OIDC) and managed identity.

It's better to create a GitHub Action secret for this parameter when using it. Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).

### Parameter `tenant-id`

The input parameter `tenant-id` specifies the login tenant id.

It's used in login with OpenID Connect (OIDC) and managed identity.

It's better to create a GitHub Action secret for this parameter when using it. Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).

### Parameter `creds`

The value of input parameter `creds` is a string in json format, including the following values:

```json
{
    "clientSecret":  "******",
    "subscriptionId":  "******",
    "tenantId":  "******",
    "clientId":  "******"
}
```

It's used in login with a Azure service principal secret.

It's better to create a GitHub Action secret for this parameter when using it. Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).

> [!NOTE]
>
> If one of `client-id` and `subscription-id` and `tenant-id` is set, `creds` will be ignored.

### Parameter `enable-AzPSSession`

By default, Azure Login Action only logs in with the Azure CLI. To log in with the Azure PowerShell module, set `enable-AzPSSession` to true.

### Parameter `environment`

By default, Azure Login Action connects to the Azure Public Cloud (`AzureCloud`).

To login to one of the Azure Government clouds or Azure Stack, set `environment` to one of the supported values `AzureUSGovernment` or `AzureChinaCloud` or `AzureGermanCloud` or `AzureStack`.

### Parameter `allow-no-subscriptions`

By default, Azure Login Action requires a `subscription-id`. To login to Azure tenants without any subscriptions, set `allow-no-subscriptions` to true.

### Parameter `audience`

Azure Login Action gets the JWT ID token from GitHub OIDC provider when login with OIDC. The default `audience` is `api://AzureADTokenExchange`. Users can specify a custom `audience`.

### Parameter `auth-type`

The input parameter `auth-type` specifies the type of authentication. The default value is `SERVICE_PRINCIPAL`. Users can specify it as `IDENTITY` for login with Managed Identity.

## Workflow Examples

### Login With OpenID Connect (OIDC)

> [!NOTE]
>
> - Ensure the CLI version is 2.30 or above to support login with OIDC.
> - By default, Azure access tokens issued during OIDC based login could have limited validity. Azure access token issued by Service Principal is expected to have an expiration of 1 hour by default. And with Managed Identities, it would be 24 hours. This expiration time is further configurable in Azure. Refer to [access-token lifetime](https://learn.microsoft.com/azure/active-directory/develop/access-tokens#access-token-lifetime) for more details.

Before your use Azure Login Action with OIDC, you need to configure a federated identity credential on an service principal or a managed identity.

- Prepare a service principal for Login with OIDC
  - [Create a service principal and assign a role to it](https://learn.microsoft.com/entra/identity-platform/howto-create-service-principal-portal)
  - [Configure a federated identity credential on an service principal](https://learn.microsoft.com/entra/workload-id/workload-identity-federation-create-trust?pivots=identity-wif-apps-methods-azp#github-actions)
- Prepare a user-assigned managed identity for Login with OIDC
  - [Create a user-assigned managed identity and assign a role to it](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/how-manage-user-assigned-managed-identities?pivots=identity-mi-methods-azp#create-a-user-assigned-managed-identity)
  - [Configure a federated identity credential on a user-assigned managed identity](https://learn.microsoft.com/entra/workload-id/workload-identity-federation-create-trust-user-assigned-managed-identity?pivots=identity-wif-mi-methods-azp#github-actions-deploying-azure-resources)

After it, create GitHub Action secrets for following values: (Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).)

- AZURE_CLIENT_ID: the service principal client ID or user-assigned managed identity client ID
- AZURE_SUBSCRIPTION_ID: the subscription ID.
- AZURE_TENANT_ID: the tenant ID.

Now you can try the workflow to login with OIDC.

> [!NOTE]
>
> In GitHub workflow, Set `permissions:` with `id-token: write` at workflow level or job level based on whether the OIDC token needs to be auto-generated for all Jobs or a specific Job.

**The worklfow sample to only run Azure CLI**

```yaml
# File: .github/workflows/workflow.yml

name: Run Azure Login with OIDC
on: [push]

permissions:
      id-token: write
      contents: read
jobs: 
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Azure login
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
  
      - name: Azure CLI script
        uses: azure/CLI@v1
        with:
          azcliversion: latest
          inlineScript: |
            az account show
            az group list
```

**The worklfow sample to run both Azure CLI and Azure PowerShell**

```yaml
# File: .github/workflows/workflow.yml

name: Run Azure Login with OIDC
on: [push]

permissions:
      id-token: write
      contents: read
jobs: 
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Azure login
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          enable-AzPSSession: true
  
      - name: Azure CLI script
        uses: azure/CLI@v1
        with:
          azcliversion: latest
          inlineScript: |
            az account show
            az group list

      - name: Azure PowerShell script
        uses: azure/powershell@v1.2.0
        with:
          azPSVersion: "latest"
          inlineScript: |
            Get-AzContext
            Get-AzResourceGroup
```

### Login With a Service Principal Secret

Before your login a service principal secret, you need to prepare a service principal with a secret.

- [Create a service principal and assign a role to it](https://learn.microsoft.com/entra/identity-platform/howto-create-service-principal-portal)
- [Create a new service principal client secret](https://learn.microsoft.com/entra/identity-platform/howto-create-service-principal-portal#option-3-create-a-new-client-secret).

After it, create a GitHub Action secret `AZURE_CREDENTIALS` with the value like below: (Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).)

```json
{
    "clientSecret":  "******",
    "subscriptionId":  "******",
    "tenantId":  "******",
    "clientId":  "******"
}
```

- clientSecret: the service principal client secret
- subscriptionId: the subscription ID.
- tenantId: the tenant ID.
- clientId: the service principal client ID.

Now you can try the workflow to login with a service principal secret.

**The worklfow sample to only run Azure CLI**

```yaml
# File: .github/workflows/workflow.yml

on: [push]

name: Run Azure Login With a Service Principal Secret

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    
    - uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - run: |
        az webapp list --query "[?state=='Running']"

```

**The worklfow sample to run both Azure CLI and Azure PowerShell**

```yaml
# File: .github/workflows/workflow.yml

on: [push]

name: Run Azure Login With a Service Principal Secret

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    
    - uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
        enable-AzPSSession: true
    
    - run: |
        az webapp list --query "[?state=='Running']"

      - name: Azure PowerShell script
        uses: azure/powershell@v1.2.0
        with:
          azPSVersion: "latest"
          inlineScript: |
            Get-AzWebApp
```

If you want to pass subscription ID, tenant ID, client ID, and client secret as individual parameters instead of bundling them in a single JSON object to address the [security concerns](https://docs.github.com/actions/security-guides/encrypted-secrets), below snippet can help with the same.

```yaml
  - uses: Azure/login@v1
    with:
      creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ secrets.AZURE_SUBSCRIPTION_ID }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}"}'
```

### Login With System-assigned Managed Identity

> [!NOTE]
>
> "Login With System-assigned Managed Identity" is only supported on GitHub self-hosted runners and the self-hosted runners need to be hosted by Azure virtual machines.

Before your login with system-assigned managed identity, you need to create an Azure virtual machine to host the GitHub self-hosted runner.

- Create an Azure virtual machine
  - [Create a Windows virtual machine](https://learn.microsoft.com/azure/virtual-machines/windows/quick-create-portal)
  - [Create a Linux virtual machine](https://learn.microsoft.com/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu)
- [Configure system-assigned managed identity on the Azure virtual machine](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/qs-configure-portal-windows-vm#system-assigned-managed-identity)
- Install required softwares on the Azure virtual machine
  - [Install PowerShell](https://learn.microsoft.com/powershell/scripting/install/installing-powershell)
  - [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
  - [Install Azure PowerShell](https://learn.microsoft.com/powershell/azure/install-azure-powershell)
- [Configure the Azure virtual machine as a GitHub self-hosted runner](https://docs.github.com/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners)

After it, create GitHub Action secrets for following values: (Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).)

- AZURE_SUBSCRIPTION_ID: the Subscription ID.
- AZURE_TENANT_ID: the Tenant ID.

**The worklfow sample to run both Azure CLI and Azure PowerShell**

```yaml
# File: .github/workflows/workflow.yml

name: Run Azure Login with System-assigned Managed Identity
on: [push]

jobs: 
  build-and-deploy:
    runs-on: self-hosted
    steps:
      - name: Azure login
        uses: azure/login@v1
        with:
          auth-type: IDENTITY          
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          enable-AzPSSession: true
  
      - name: Azure CLI script
        uses: azure/CLI@v1
        with:
          azcliversion: latest
          inlineScript: |
            az account show
            az group list

      - name: Azure PowerShell script
        uses: azure/powershell@v1.2.0
        with:
          azPSVersion: "latest"
          inlineScript: |
            Get-AzContext
            Get-AzResourceGroup
```

### Login With User-assigned Managed Identity

> [!NOTE]
>
> "Login With User-assigned Managed Identity" is only supported on GitHub self-hosted runners and the self-hosted runners need to be hosted by Azure virtual machines.

Before your login with User-assigned managed identity, you need to create an Azure virtual machine to host the GitHub self-hosted runner.

- Create an Azure virtual machine
  - [Create a Windows virtual machine](https://learn.microsoft.com/azure/virtual-machines/windows/quick-create-portal)
  - [Create a Linux virtual machine](https://learn.microsoft.com/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu)
- [Create a user-assigned managed identity and assign a role to it](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/how-manage-user-assigned-managed-identities?pivots=identity-mi-methods-azp#create-a-user-assigned-managed-identity)
- [Configure user-assigned managed identity on the Azure virtual machine](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/qs-configure-portal-windows-vm#user-assigned-managed-identity)
- Install required softwares on the Azure virtual machine
  - [Install PowerShell](https://learn.microsoft.com/powershell/scripting/install/installing-powershell)
  - [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
  - [Install Azure PowerShell](https://learn.microsoft.com/powershell/azure/install-azure-powershell)
- [Configure the Azure virtual machine as a GitHub self-hosted runner](https://docs.github.com/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners)

After it, create GitHub Action secrets for following values: (Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).)

- AZURE_CLIENT_ID: the user-assigned managed identity client ID
- AZURE_SUBSCRIPTION_ID: the subscription ID.
- AZURE_TENANT_ID: the tenant ID.

**The worklfow sample to run both Azure CLI and Azure PowerShell**

```yaml
# File: .github/workflows/workflow.yml

name: Run Azure Login with User-assigned Managed Identity
on: [push]

jobs: 
  build-and-deploy:
    runs-on: self-hosted
    steps:
      - name: Azure login
        uses: azure/login@v1
        with:
          auth-type: IDENTITY
          client-id: ${{ secrets.AZURE_CLIENT_ID }}          
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          enable-AzPSSession: true
  
      - name: Azure CLI script
        uses: azure/CLI@v1
        with:
          azcliversion: latest
          inlineScript: |
            az account show
            az group list

      - name: Azure PowerShell script
        uses: azure/powershell@v1.2.0
        with:
          azPSVersion: "latest"
          inlineScript: |
            Get-AzContext
            Get-AzResourceGroup
```

### Login to Azure US Government cloud

```yaml
# File: .github/workflows/workflow.yml

on: [push]

name: Login to Azure US Government cloud

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    
    - uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
        environment: 'AzureUSGovernment'
        enable-AzPSSession: true
    
```

### Login to Azure Stack Hub

```yaml
# File: .github/workflows/workflow.yml

on: [push]

name: Login to Azure Stack Hub cloud

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    
    - uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
        environment: 'AzureStack'
        enable-AzPSSession: true
    
```

Refer to the [Azure Stack Hub Login Action Tutorial](https://learn.microsoft.com/azure-stack/user/ci-cd-github-action-login-cli) for more detailed instructions.

### Support for using `allow-no-subscriptions` flag with az login

Capability has been added to support access to tenants without subscriptions for both OIDC and non-OIDC. This can be useful to run tenant level commands, such as `az ad`. The action accepts an optional parameter `allow-no-subscriptions` which is `false` by default.

```yaml
# File: .github/workflows/workflow.yml

on: [push]

name: Run Azure Login without subscription

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:

    - name: Azure Login
      uses: azure/login@v1
      with:
        client-id: ${{ secrets.AZURE_CLIENT_ID }}
        tenant-id: ${{ secrets.AZURE_TENANT_ID }}
        allow-no-subscriptions: true
        enable-AzPSSession: true

    - name: Run Azure ClI
      run: |
        az account show

    - name: Run Azure PowerShell
      uses: azure/powershell@v1.2.0
      with:
        azPSVersion: "latest"
        inlineScript: |
          Get-AzContext
```

## Az logout and security hardening

This action doesn't implement ```az logout``` by default at the end of execution. However there is no way of tampering the credentials or account information because the github hosted runner is on a VM that will get re-imaged for every customer run which gets everything deleted. But if the runner is self-hosted which is not github provided it is recommended to manually logout at the end of the workflow as shown below. More details on security of the runners can be found [here](https://docs.github.com/actions/learn-github-actions/security-hardening-for-github-actions#hardening-for-self-hosted-runners).

```yaml
- name: Azure CLI script
  uses: azure/CLI@v1
  with:
    inlineScript: |
      az logout
      az cache purge
      az account clear

- name: Azure PowerShell script
  uses: azure/powershell@v1.2.0
  with:
    azPSVersion: "latest"
    inlineScript: |
      Clear-AzContext -Scope Process
      Clear-AzContext -Scope CurrentUser
```

## Azure CLI dependency

Internally in this action, we use azure CLI and execute `az login` with the credentials provided through secrets. In order to validate the new azure CLI releases for this action, [canary test workflow](.github/workflows/azure-login-canary.yml) is written which will execute the action on [azure CLI's edge build](https://github.com/Azure/azure-cli#edge-builds) which will fail incase of any breaking change is being introduced in the new upcoming release. The test results can be posted on a slack or teams channel using the corresponding integrations. Incase of a failure, the concern will be raised to [azure-cli](https://github.com/Azure/azure-cli) for taking a necessary action and also the latest CLI installation will be postponed in [Runner VMs](https://github.com/actions/virtual-environments) as well for hosted runner to prevent the workflows failing due to the new CLI changes.

## Reference

### Azure CLI Action

Refer to the [Azure CLI](https://github.com/azure/cli) GitHub Action to run your Azure CLI scripts.

### Azure PowerShell Action

Refer to the [Azure PowerShell](https://github.com/azure/powershell) GitHub Action to run your Azure PowerShell scripts.

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit <https://cla.opensource.microsoft.com>.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
