# Azure Login Action

- [Azure Login Action](#azure-login-action)
  - [Input Parameters](#input-parameters)
    - [`client-id`](#client-id)
    - [`subscription-id`](#subscription-id)
    - [`tenant-id`](#tenant-id)
    - [`creds`](#creds)
    - [`enable-AzPSSession`](#enable-azpssession)
    - [`environment`](#environment)
    - [`allow-no-subscriptions`](#allow-no-subscriptions)
    - [`audience`](#audience)
    - [`auth-type`](#auth-type)
  - [Workflow Examples](#workflow-examples)
    - [Login With OpenID Connect (OIDC) \[Recommended\]](#login-with-openid-connect-oidc-recommended)
    - [Login With a Service Principal Secret](#login-with-a-service-principal-secret)
    - [Login With System-assigned Managed Identity](#login-with-system-assigned-managed-identity)
    - [Login With User-assigned Managed Identity](#login-with-user-assigned-managed-identity)
    - [Login to Azure US Government cloud](#login-to-azure-us-government-cloud)
    - [Login to Azure Stack Hub](#login-to-azure-stack-hub)
    - [Login without subscription](#login-without-subscription)
    - [Enable/Disable the cleanup steps](#enabledisable-the-cleanup-steps)
  - [Security hardening](#security-hardening)
  - [Azure CLI dependency](#azure-cli-dependency)
  - [Reference](#reference)
    - [GitHub Action](#github-action)
    - [GitHub Actions for deploying to Azure](#github-actions-for-deploying-to-azure)
    - [Azure CLI Action](#azure-cli-action)
    - [Azure PowerShell Action](#azure-powershell-action)
  - [Contributing](#contributing)

With the [Azure Login Action](https://github.com/Azure/login), you can login to Azure and run [Azure CLI](https://learn.microsoft.com/cli/azure/) and [Azure PowerShell](https://learn.microsoft.com/powershell/azure) scripts.

Azure Login Action supports different ways of authentication with Azure.

- Login with OpenID Connect (OIDC)
- Login with a Service Principal Secret
- Login with System-assigned Managed Identity
- Login with User-assigned Managed Identity

**We recommend using OIDC based authentication for increased security.**

> [!WARNING]
> By default, the output of Azure CLI commands is printed to the stdout stream. Without redirecting the stdout stream, contents in it will be stored in the build log of the action. Configure Azure CLI to _not_ show output in the console screen or print in the log by setting the environment variable `AZURE_CORE_OUTPUT` to `none`. If you need the output of a specific command, override the default setting using the argument `--output` with your format of choice. For more information on output options with the Azure CLI, see [Format output](https://learn.microsoft.com/cli/azure/format-output-azure-cli).

** **

> [!WARNING]
> Avoid using managed identity login on self-hosted runners in public repositories. Managed identities enable secure authentication with Azure resources and obtain Microsoft Entra ID tokens without the need for explicit credential management. Any user can open pull requests against your repository and access your self-hosted runners without credentials. See more details in [self-hosted runner security](https://docs.github.com/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners#self-hosted-runner-security).

## Input Parameters

|Parameter Name|Required?|Type|Default Value|Description|
|---|---|---|---|---|
|client-id|false|UUID||the client id of a service principal or a user-assigned managed identity|
|subscription-id|false|UUID||the login subscription id|
|tenant-id|false|UUID||the login tenant id|
|creds|false|string||a json string for login with an Azure service principal|
|enable-AzPSSession|false|boolean|false|if Azure PowerShell login is enabled|
|environment|false|string|azurecloud|the Azure Cloud environment. For cloud environments other than the public cloud, the `audience` will also need to be updated.|
|allow-no-subscriptions|false|boolean|false|if login without subscription is allowed|
|audience|false|string|api://AzureADTokenExchange|the audience to get the JWT ID token from GitHub OIDC provider|
|auth-type|false|string|SERVICE_PRINCIPAL|the auth type|

### `client-id`

The input parameter `client-id` specifies the login client id. It could be the client id of a service principal or a user-assigned managed identity.

It's used in login with OpenID Connect (OIDC) and user-assigned managed identity.

It's better to create a GitHub Action secret for this parameter when using it. Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).

Refer to [Login With OpenID Connect (OIDC)](#login-with-openid-connect-oidc-recommended) and [Login With User-assigned Managed Identity](#login-with-user-assigned-managed-identity) for its usage.

### `subscription-id`

The input parameter `subscription-id` specifies the login subscription id.

It's used in login with OpenID Connect (OIDC) and managed identity.

It's better to create a GitHub Action secret for this parameter when using it. Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).

Refer to [Login With OpenID Connect (OIDC)](#login-with-openid-connect-oidc-recommended), [Login With System-assigned Managed Identity](#login-with-system-assigned-managed-identity) and [Login With User-assigned Managed Identity](#login-with-user-assigned-managed-identity) for its usage.

### `tenant-id`

The input parameter `tenant-id` specifies the login tenant id.

It's used in login with OpenID Connect (OIDC) and managed identity.

It's better to create a GitHub Action secret for this parameter when using it. Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).

Refer to [Login With OpenID Connect (OIDC)](#login-with-openid-connect-oidc-recommended), [Login With System-assigned Managed Identity](#login-with-system-assigned-managed-identity) and [Login With User-assigned Managed Identity](#login-with-user-assigned-managed-identity) for its usage.

### `creds`

> [!NOTE]
>
> If one of `client-id` and `subscription-id` and `tenant-id` is set, `creds` will be ignored.

The value of input parameter `creds` is a string in json format, including the following values:

```json
{
    "clientSecret":  "******",
    "subscriptionId":  "******",
    "tenantId":  "******",
    "clientId":  "******"
}
```

It's used in login with an Azure service principal.

It's better to create a GitHub Action secret for this parameter when using it. Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).

Refer to [Login With a Service Principal Secret](#login-with-a-service-principal-secret) for its usage.

### `enable-AzPSSession`

By default, Azure Login Action only logs in with the Azure CLI. To log in with the Azure PowerShell module, set `enable-AzPSSession` to true.

Refer to [Login With OpenID Connect (OIDC)](#login-with-openid-connect-oidc-recommended) for its usage.

### `environment`

By default, Azure Login Action connects to the Azure Public Cloud (`AzureCloud`).

To login to one of the Azure Government clouds or Azure Stack, set `environment` to one of the supported values `AzureUSGovernment` or `AzureChinaCloud` or `AzureGermanCloud` or `AzureStack`.

The default [`audience`](#audience) for each of these clouds is different and will also need to be set if using anything other than the public environment.

Refer to [Login to Azure US Government cloud](#login-to-azure-us-government-cloud) for its usage.

### `allow-no-subscriptions`

By default, Azure Login Action requires a `subscription-id`. To login to Azure tenants without any subscriptions, set `allow-no-subscriptions` to true.

Refer to [Login without subscription](#login-without-subscription) for its usage.

### `audience`

Azure Login Action gets the JWT ID token from GitHub OIDC provider when login with OIDC. The default `audience` is `api://AzureADTokenExchange`. Users can specify a custom `audience`.

### `auth-type`

The input parameter `auth-type` specifies the type of authentication. The default value is `SERVICE_PRINCIPAL`. Users can specify it as `IDENTITY` for login with Managed Identity.

Refer to [Login With System-assigned Managed Identity](#login-with-system-assigned-managed-identity) and [Login With User-assigned Managed Identity](#login-with-user-assigned-managed-identity) for its usage.

## Workflow Examples

### Login With OpenID Connect (OIDC) [Recommended]

> [!NOTE]
>
> - Ensure the CLI version is 2.30 or above to support login with OIDC.
> - By default, Azure access tokens issued during OIDC based login could have limited validity. Azure access token issued by Service Principal is expected to have an expiration of 1 hour by default. And with Managed Identities, it would be 24 hours. This expiration time is further configurable in Azure. Refer to [access-token lifetime](https://learn.microsoft.com/azure/active-directory/develop/access-tokens#access-token-lifetime) for more details.

Before you use Azure Login Action with OIDC, you need to configure a federated identity credential on a service principal or a managed identity.

- Prepare a service principal for Login with OIDC
  - [Create a service principal and assign a role to it](https://learn.microsoft.com/entra/identity-platform/howto-create-service-principal-portal)
  - [Configure a federated identity credential on an service principal](https://learn.microsoft.com/entra/workload-id/workload-identity-federation-create-trust?pivots=identity-wif-apps-methods-azp#github-actions)
- Prepare a user-assigned managed identity for Login with OIDC
  - [Create a user-assigned managed identity and assign a role to it](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/how-manage-user-assigned-managed-identities?pivots=identity-mi-methods-azp#create-a-user-assigned-managed-identity)
  - [Configure a federated identity credential on a user-assigned managed identity](https://learn.microsoft.com/entra/workload-id/workload-identity-federation-create-trust-user-assigned-managed-identity?pivots=identity-wif-mi-methods-azp#github-actions-deploying-azure-resources)

After it, create GitHub Action secrets for following values: (Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).)

- AZURE_CLIENT_ID: the service principal client ID or user-assigned managed identity client ID
- AZURE_SUBSCRIPTION_ID: the subscription ID
- AZURE_TENANT_ID: the tenant ID

Now you can try the workflow to login with OIDC.

> [!NOTE]
>
> In GitHub workflow, you should set `permissions:` with `id-token: write` at workflow level or job level based on whether the OIDC token is allowed be generated for all Jobs or a specific Job.

- **The workflow sample to only run Azure CLI**

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
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Azure CLI script
        uses: azure/cli@v2
        with:
          azcliversion: latest
          inlineScript: |
            az account show
```

- **The workflow sample to run both Azure CLI and Azure PowerShell**

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
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          enable-AzPSSession: true

      - name: Azure CLI script
        uses: azure/cli@v2
        with:
          azcliversion: latest
          inlineScript: |
            az account show

      - name: Azure PowerShell script
        uses: azure/powershell@v2
        with:
          azPSVersion: "latest"
          inlineScript: |
            Get-AzContext
```

### Login With a Service Principal Secret

Before you login a service principal secret, you need to prepare a service principal with a secret.

- [Create a service principal and assign a role to it](https://learn.microsoft.com/entra/identity-platform/howto-create-service-principal-portal)
- [Create a new service principal client secret](https://learn.microsoft.com/entra/identity-platform/howto-create-service-principal-portal#option-3-create-a-new-client-secret)

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
- subscriptionId: the subscription ID
- tenantId: the tenant ID
- clientId: the service principal client ID

Now you can try the workflow to login with a service principal secret.

- **The workflow sample to only run Azure CLI**

```yaml
# File: .github/workflows/workflow.yml

on: [push]

name: Run Azure Login With a Service Principal Secret

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:

    - uses: azure/login@v2
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}

    - name: Azure CLI script
      uses: azure/cli@v2
      with:
        azcliversion: latest
        inlineScript: |
          az account show
```

- **The workflow sample to run both Azure CLI and Azure PowerShell**

```yaml
# File: .github/workflows/workflow.yml

on: [push]

name: Run Azure Login With a Service Principal Secret

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:

    - uses: azure/login@v2
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
        enable-AzPSSession: true

    - name: Azure CLI script
      uses: azure/cli@v2
      with:
        azcliversion: latest
        inlineScript: |
          az account show

    - name: Azure PowerShell script
      uses: azure/powershell@v2
      with:
        azPSVersion: "latest"
        inlineScript: |
          Get-AzWebApp
```

If you want to pass subscription ID, tenant ID, client ID, and client secret as individual parameters instead of bundling them in a single JSON object to address the [security concerns](https://docs.github.com/actions/security-guides/encrypted-secrets), below snippet can help with the same.

```yaml
  - uses: azure/login@v2
    with:
      creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ secrets.AZURE_SUBSCRIPTION_ID }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}"}'
```

### Login With System-assigned Managed Identity

> [!NOTE]
>
> "Login With System-assigned Managed Identity" is only supported on GitHub self-hosted runners and the self-hosted runners need to be hosted by Azure virtual machines.

Before you login with system-assigned managed identity, you need to create an Azure virtual machine to host the GitHub self-hosted runner.

- Create an Azure virtual machine
  - [Create a Windows virtual machine](https://learn.microsoft.com/azure/virtual-machines/windows/quick-create-portal)
  - [Create a Linux virtual machine](https://learn.microsoft.com/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu)
- [Configure system-assigned managed identity on the Azure virtual machine](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/qs-configure-portal-windows-vm#system-assigned-managed-identity)
- Install required softwares on the Azure virtual machine
  - [Install PowerShell](https://learn.microsoft.com/powershell/scripting/install/installing-powershell)
  - [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
    - If you want to run Azure CLI Action, [Install Docker](https://docs.docker.com/engine/install/).
  - [Install Azure PowerShell](https://learn.microsoft.com/powershell/azure/install-azure-powershell)
- [Configure the Azure virtual machine as a GitHub self-hosted runner](https://docs.github.com/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners)

After it, create GitHub Action secrets for following values: (Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).)

- AZURE_SUBSCRIPTION_ID: the Subscription ID
- AZURE_TENANT_ID: the Tenant ID

Now you can try the workflow to login with system-assigned managed identity.

- **The workflow sample to run both Azure CLI and Azure PowerShell**

```yaml
# File: .github/workflows/workflow.yml

name: Run Azure Login with System-assigned Managed Identity
on: [push]

jobs:
  build-and-deploy:
    runs-on: self-hosted
    steps:
      - name: Azure login
        uses: azure/login@v2
        with:
          auth-type: IDENTITY
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          enable-AzPSSession: true

      # Azure CLI Action only supports linux self-hosted runners for now.
      # If you want to execute the Azure CLI script on a windows self-hosted runner, you can execute it directly in `run`.
      - name: Azure CLI script
        uses: azure/cli@v2
        with:
          azcliversion: latest
          inlineScript: |
            az account show

      - name: Azure PowerShell script
        uses: azure/powershell@v2
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

Before you login with User-assigned managed identity, you need to create an Azure virtual machine to host the GitHub self-hosted runner.

- Create an Azure virtual machine
  - [Create a Windows virtual machine](https://learn.microsoft.com/azure/virtual-machines/windows/quick-create-portal)
  - [Create a Linux virtual machine](https://learn.microsoft.com/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu)
- [Create a user-assigned managed identity and assign a role to it](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/how-manage-user-assigned-managed-identities?pivots=identity-mi-methods-azp#create-a-user-assigned-managed-identity)
- [Configure user-assigned managed identity on the Azure virtual machine](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/qs-configure-portal-windows-vm#user-assigned-managed-identity)
- Install required softwares on the Azure virtual machine
  - [Install PowerShell](https://learn.microsoft.com/powershell/scripting/install/installing-powershell)
  - [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
    - If you want to run Azure CLI Action, [Install Docker](https://docs.docker.com/engine/install/).
  - [Install Azure PowerShell](https://learn.microsoft.com/powershell/azure/install-azure-powershell)
- [Configure the Azure virtual machine as a GitHub self-hosted runner](https://docs.github.com/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners)

After it, create GitHub Action secrets for following values: (Refer to [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).)

- AZURE_CLIENT_ID: the user-assigned managed identity client ID
- AZURE_SUBSCRIPTION_ID: the subscription ID
- AZURE_TENANT_ID: the tenant ID

Now you can try the workflow to login with user-assigned managed identity.

- **The workflow sample to run both Azure CLI and Azure PowerShell**

```yaml
# File: .github/workflows/workflow.yml

name: Run Azure Login with User-assigned Managed Identity
on: [push]

jobs:
  build-and-deploy:
    runs-on: self-hosted
    steps:
      - name: Azure login
        uses: azure/login@v2
        with:
          auth-type: IDENTITY
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          enable-AzPSSession: true

      # Azure CLI Action only supports linux self-hosted runners for now.
      # If you want to execute the Azure CLI script on a windows self-hosted runner, you can execute it directly in `run`.
      - name: Azure CLI script
        uses: azure/cli@v2
        with:
          azcliversion: latest
          inlineScript: |
            az account show

      - name: Azure PowerShell script
        uses: azure/powershell@v2
        with:
          azPSVersion: "latest"
          inlineScript: |
            Get-AzContext
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

    - uses: azure/login@v2
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

    - uses: azure/login@v2
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
        environment: 'AzureStack'
        enable-AzPSSession: true
```

Refer to the [Azure Stack Hub Login Action Tutorial](https://learn.microsoft.com/azure-stack/user/ci-cd-github-action-login-cli) for more detailed instructions.

### Login without subscription

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
      uses: azure/login@v2
      with:
        client-id: ${{ secrets.AZURE_CLIENT_ID }}
        tenant-id: ${{ secrets.AZURE_TENANT_ID }}
        allow-no-subscriptions: true
        enable-AzPSSession: true

    - name: Azure CLI script
      uses: azure/cli@v2
      with:
        azcliversion: latest
        inlineScript: |
          az account show

    - name: Run Azure PowerShell
      uses: azure/powershell@v2
      with:
        azPSVersion: "latest"
        inlineScript: |
          Get-AzContext
```

### Enable/Disable the cleanup steps

In Azure Login Action, "cleanup" means cleaning up the login context. For security reasons, we recommend users run cleanup every time. But in some scenarios, users need flexible control over cleanup.

Referring to [`runs` for JavaScript actions](https://docs.github.com/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions#runs-for-javascript-actions), there are 3 steps in an action: `pre:`, `main:` and `post:`. Azure Login Action only implement 2 steps: `main:` and `post:`.

There are 2 "cleanup" steps in Azure Login Action:

- cleanup in `main:`
  - It's **disabled** by default.
  - Users can enable it by setting an env variable `AZURE_LOGIN_PRE_CLEANUP` to `true`.
- cleanup in `post:`
  - It's **enabled** by default.
  - Users can disable it by setting an env variable `AZURE_LOGIN_POST_CLEANUP` to `false`.

Azure Login Action use env variables to enable or disable cleanup steps. In GitHub Actions, there are three valid scopes for env variables.

- [env](https://docs.github.com/actions/writing-workflows/workflow-syntax-for-github-actions#env)
  - valid for all jobs in this workflow.
- [jobs.<job_id>.env](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idenv)
  - valid for all the steps in the job.
- [jobs.<job_id>.steps[*].env](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsenv)
  - only valid for the step in a job.

We set `jobs.<job_id>.steps[*].env` for example. Users can set `env` or `jobs.<job_id>.env` for a wider scope.

```yaml
# File: .github/workflows/workflow.yml

on: [push]

name: Cleanup examples for Multiple Azure Login

jobs:

  deploy:
    runs-on: ubuntu-latest
    steps:

    # enable cleanup for the 1st Azure Login
    - name: Azure Login
      uses: azure/login@v2
      env:
        AZURE_LOGIN_PRE_CLEANUP: true
        AZURE_LOGIN_POST_CLEANUP: true
      with:
        client-id: ${{ secrets.AZURE_CLIENT_ID }}
        tenant-id: ${{ secrets.AZURE_TENANT_ID }}
        subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
        enable-AzPSSession: true    

    # run some actions

    # disable cleanup for all other Azure Login
    - name: Azure Login 2
      uses: azure/login@v2
      env:
        AZURE_LOGIN_PRE_CLEANUP: false
        AZURE_LOGIN_POST_CLEANUP: false
      with:
        client-id: ${{ secrets.AZURE_CLIENT_ID_2 }}
        tenant-id: ${{ secrets.AZURE_TENANT_ID_2 }}
        subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID_2 }}
        enable-AzPSSession: true   

    # run other actions

    # disable cleanup for all other Azure Login
    - name: Azure Login 3
      uses: azure/login@v2
      env:
        AZURE_LOGIN_PRE_CLEANUP: false
        AZURE_LOGIN_POST_CLEANUP: false
      with:
        client-id: ${{ secrets.AZURE_CLIENT_ID_3 }}
        tenant-id: ${{ secrets.AZURE_TENANT_ID_3 }}
        subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID_3 }}
        enable-AzPSSession: true   

    # run other actions
```

```yaml
# File: .github/workflows/workflow.yml

on: [push]

name: Disable cleanup for GitHub Hosted Runners

jobs:

  deploy:
    runs-on: [ubuntu-latest, self-hosted]
    steps:

    - name: Azure Login
      uses: azure/login@v2
      env:
        AZURE_LOGIN_PRE_CLEANUP: ${{ startsWith(runner.name, 'GitHub Actions') }}
        AZURE_LOGIN_POST_CLEANUP: ${{ startsWith(runner.name, 'GitHub Actions') }}
      with:
        client-id: ${{ secrets.AZURE_CLIENT_ID }}
        tenant-id: ${{ secrets.AZURE_TENANT_ID }}
        subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
        enable-AzPSSession: true    

    # run some actions

```

## Security hardening

> [!WARNING]
> When using self hosted runners it is possible to have multiple runners on a single VM. Currently if your runners share a single user on the VM each runner will share the same credentials. That means in detail that each runner is able to change the permissions of another run. As a workaround we propose to use one single VM user per runner. If you start the runner as a service, do not forget to add the [optional user argument](https://docs.github.com/actions/hosting-your-own-runners/managing-self-hosted-runners/configuring-the-self-hosted-runner-application-as-a-service#installing-the-service)

## Azure CLI dependency

Internally in this action, we use azure CLI and execute `az login` with the credentials provided through secrets. In order to validate the new azure CLI releases for this action, [canary test workflow](.github/workflows/azure-login-canary.yml) is written which will execute the action on [azure CLI's edge build](https://github.com/Azure/azure-cli#edge-builds) which will fail incase of any breaking change is being introduced in the new upcoming release. The test results can be posted on a slack or teams channel using the corresponding integrations. Incase of a failure, the concern will be raised to [azure-cli](https://github.com/Azure/azure-cli) for taking a necessary action and also the latest CLI installation will be postponed in [Runner VMs](https://github.com/actions/virtual-environments) as well for hosted runner to prevent the workflows failing due to the new CLI changes.

## Reference

### GitHub Action

[GitHub Actions](https://docs.github.com/actions) gives you the flexibility to build an automated software development lifecycle workflow.

### GitHub Actions for deploying to Azure

With [GitHub Actions for Azure](https://github.com/Azure/actions/), you can create workflows that you can set up in your repository to build, test, package, release and **deploy** to Azure.

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
