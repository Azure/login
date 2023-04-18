# GitHub Actions for deploying to Azure

## Automate your GitHub workflows using Azure Actions

[GitHub Actions](https://help.github.com/articles/about-github-actions) gives you the flexibility to build an automated software development lifecycle workflow.

With [GitHub Actions for Azure](https://github.com/Azure/actions/), you can create workflows that you can set up in your repository to build, test, package, release and **deploy** to Azure.

## GitHub Action for Azure Login

With the [Azure Login](https://github.com/Azure/login/blob/master/action.yml) Action, you can do an Azure login using [Azure Managed Identities and Azure service principal](https://learn.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview#managed-identity-types) to run Az CLI and Azure PowerShell scripts.

- By default, the action only logs in with the Azure CLI (using the `az login` command). To log in with the Az PowerShell module, set `enable-AzPSSession` to true. To login to Azure tenants without any subscriptions, set the optional parameter `allow-no-subscriptions` to true.

- To login into one of the Azure Government clouds or Azure Stack, set the optional parameter `environment` with one of the supported values `AzureUSGovernment` or `AzureChinaCloud` or `AzureStack`. If this parameter is not specified, it takes the default value `AzureCloud` and connects to the Azure Public Cloud. Additionally, the parameter `creds` takes the Azure service principal created in the particular cloud to connect (Refer to the [Configure a service principal with a secret](#configure-a-service-principal-with-a-secret) section below for details).
- The Action supports two different ways of authentication with Azure. One using the Azure Service Principal with secrets. The other is OpenID connect (OIDC) method of authentication using Azure [Workload Identity Federation](https://learn.microsoft.com/en-us/azure/active-directory/develop/workload-identity-federation). **We recommend using OIDC based authentication for increased security.**
- To login using Azure Service Principal with a secret, follow [this](#configure-a-service-principal-with-a-secret) guidance.
- To login using **OpenID Connect (OIDC) based Federated Identity Credentials**, you need to first configure trust between GitHub workflow and an Azure Managed Identity or an Azure AD App (Service Principal)
   1. Follow [this](#configure-a-federated-credential-to-use-oidc-based-authentication) guidance to create a Federated Credential associated with your Azure Managed Identity or AD App (Service Principal). This is needed to establish OIDC trust between GitHub deployment workflows and the specific Azure resources scoped by the Managed Identity/service principal.
   2. In your GitHub workflow, Set `permissions:` with `id-token: write` at workflow level or job level based on whether the OIDC token needs to be auto-generated for all Jobs or a specific Job.
   3. Within the Job deploying to Azure, add Azure/login action and pass the `client-id` and `tenant-id` of the Azure Managed Identity/service principal associated with an OIDC Federated Identity Credential created in step (i). You also need to pass `subscription-id` or set `allow-no-subscriptions` to true.

Note:

- Ensure the CLI version is 2.30 or above to use OIDC support.
- OIDC support in Azure is supported only for public clouds. Support for other clouds like Government clouds, Azure Stacks would be added soon.
- By default, Azure access tokens issued during OIDC based login could have limited validity. Azure access token issued by AD App (Service Principal) is expected to have an expiration of 1 hour by default. And with Managed Identities, it would be 24 hrs. This expiration time is further configurable in Azure. Refger to [access-token lifetime](https://learn.microsoft.com/en-us/azure/active-directory/develop/access-tokens#access-token-lifetime) for more details.

## Sample workflow that uses Azure login action to run az cli

```yaml

# File: .github/workflows/workflow.yml

on: [push]

name: AzureLoginSample

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

## Sample workflow that uses Azure login action to run Azure PowerShell

```yaml

# File: .github/workflows/workflow.yml

on: [push]

name: AzurePowerShellLoginSample

jobs:

  build:
    runs-on: ubuntu-latest
    steps:
    
    - name: Login via Az module
      uses: azure/login@v1
      with:
        creds: ${{secrets.AZURE_CREDENTIALS}}
        enable-AzPSSession: true 
     
     - run: |
        Get-AzVM -ResourceGroupName "ResourceGroup11"
        
```

## Sample workflow that uses Azure login action using OIDC to run az cli (Linux)

```yaml
# File: .github/workflows/OIDC_workflow.yml

name: Run Azure Login with OIDC
on: [push]

permissions:
      id-token: write
      contents: read
jobs: 
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: 'Az CLI login'
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
  
      - name: 'Run az commands'
        run: |
          az account show
          az group list
          pwd 
```

Users can also specify `audience` field for access-token in the input parameters of the action. If not specified, it is defaulted to `api://AzureADTokenExchange`. This action supports login az powershell as well for both Windows and Linux runners by setting an input parameter `enable-AzPSSession: true`. Below is the sample workflow for the same using the Windows runner. Please note that powershell login is not supported in macOS runners.

## Sample workflow that uses Azure login action using OIDC to run az PowerShell (Windows)

```yaml
# File: .github/workflows/OIDC_workflow.yml

name: Run Azure Login with OIDC
on: [push]

permissions:
      id-token: write
      contents: read
      
jobs: 
  Windows-latest:
      runs-on: windows-latest
      steps:
        - name: OIDC Login to Azure Public Cloud with AzPowershell (enableAzPSSession true)
          uses: azure/login@v1
          with:
            client-id: ${{ secrets.AZURE_CLIENT_ID }}
            tenant-id: ${{ secrets.AZURE_TENANT_ID }}
            subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }} 
            enable-AzPSSession: true

        - name: 'Get RG with powershell action'
          uses: azure/powershell@v1
          with:
             inlineScript: |
               Get-AzResourceGroup
             azPSVersion: "latest"

```

Refer to the [Azure PowerShell](https://github.com/azure/powershell) GitHub Action to run your Azure PowerShell scripts.

## Sample to connect to Azure US Government cloud

```yaml
    - name: Login to Azure US Gov Cloud with CLI
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_US_GOV_CREDENTIALS }}
        environment: 'AzureUSGovernment'
        enable-AzPSSession: false
    - name: Login to Azure US Gov Cloud with Az Powershell
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_US_GOV_CREDENTIALS }}
        environment: 'AzureUSGovernment'
        enable-AzPSSession: true
```

Refer to the [Azure PowerShell](https://github.com/azure/powershell) GitHub Action to run your Azure PowerShell scripts.

## Sample Azure Login workflow that to run az cli on Azure Stack Hub

```yaml

# File: .github/workflows/workflow.yml

on: [push]

name: AzureLoginSample

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
        environment: 'AzureStack'

    - run: |
        az webapp list --query "[?state=='Running']"

```

Refer to the [Azure Stack Hub Login Action Tutorial](https://learn.microsoft.com/azure-stack/user/ci-cd-github-action-login-cli?view=azs-2008) for more detailed instructions.

## Configure deployment credentials
  
### Configure a service principal with a secret

For using any credentials like Azure Service Principal, Publish Profile etc add them as [secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) in the GitHub repository and then use them in the workflow.

Follow the following steps to configure Azure Service Principal with a secret:

- Define a new secret under your repository settings, Add secret menu
- Store the output of the below [az cli](https://learn.microsoft.com/cli/azure/?view=azure-cli-latest) command as the value of secret variable, for example 'AZURE_CREDENTIALS'

```bash  

   az ad sp create-for-rbac --name "myApp" --role contributor \
                            --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
                            --sdk-auth
```

Replace `{subscription-id}` and `{resource-group}` with the subscription and resource group details, respectively.

The command should output a JSON object similar to this:

 ```bash
  {
    "clientId": "<GUID>",
    "clientSecret": "<STRING>",
    "subscriptionId": "<GUID>",
    "tenantId": "<GUID>",
    "resourceManagerEndpointUrl": "<URL>"
    (...)
  }
  
```

- Now in the workflow file in your branch: `.github/workflows/workflow.yml` replace the secret in Azure login action with your secret (Refer to the example above)
- Note: The above `az ad sp create-for-rbac` command will give you the `--sdk-auth` deprecation warning. As we are working with CLI for this deprecation process, we strongly recommend users to use this `--sdk-auth` flag as the result dictionary output changes and not accepted by login action if `--sdk-auth` is not used.
- If you want to pass Subscription ID, Tenant ID, Client ID, and Client Secret as individual parameters instead of bundling them in a single JSON object (creds) to address the [security concerns](https://docs.github.com/actions/security-guides/encrypted-secrets) for Non-OIDC login, below snippet can help with the same.

```yaml
  - uses: Azure/login@v1
    with:
      creds: '{"clientId":"${{ secrets.CLIENT_ID }}","clientSecret":"${{ secrets.CLIENT_SECRET }}","subscriptionId":"${{ secrets.SUBSCRIPTION_ID }}","tenantId":"${{ secrets.TENANT_ID }}"}'
```

In a similar way, any additional parameter can be added to creds such as resourceManagerEndpointUrl for Azure Stack, for example.

### Manually creating the Credentials object

If you already created and assigned a Service Principal in Azure you can manually create the .json object above by finding the `clientId` and `clientSecret` on the Service Principal, and your `subscriptionId` and `tenantId` of the subscription and tenant respectively. The `resourceManagerEndpointUrl` will be `https://management.azure.com/` if you are using the public Azure cloud.

### Configure a Federated Credential to use OIDC based authentication

Please refer to Microsoft's documentation at ["Configure a federated identity credential on an app”](https://learn.microsoft.com/en-us/azure/active-directory/develop/workload-identity-federation-create-trust?pivots=identity-wif-apps-methods-azp#github-actions) and ["Configure a user-assigned managed identity"](https://learn.microsoft.com/en-us/azure/active-directory/develop/workload-identity-federation-create-trust-user-assigned-managed-identity?pivots=identity-wif-mi-methods-azp#github-actions-deploying-azure-resources) to trust an external identity provider (preview) which has more details about the Azure Workload Identity Federation (OIDC) support.

You can add federated credentials in the Azure portal or with the Microsoft Graph REST API.

## Support for using `allow-no-subscriptions` flag with az login

Capability has been added to support access to tenants without subscriptions for both OIDC and non-OIDC. This can be useful to run tenant level commands, such as `az ad`. The action accepts an optional parameter `allow-no-subscriptions` which is `false` by default.

```yaml
# File: .github/workflows/workflow.yml

on: [push]

name: AzureLoginWithNoSubscriptions

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:

    - uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
        allow-no-subscriptions: true
```

## Az logout and security hardening

This action doesn't implement ```az logout``` by default at the end of execution. However there is no way of tampering the credentials or account information because the github hosted runner is on a VM that will get reimaged for every customer run which gets everything deleted. But if the runner is self-hosted which is not github provided it is recommended to manually logout at the end of the workflow as shown below. More details on security of the runners can be found [here](https://docs.github.com/actions/learn-github-actions/security-hardening-for-github-actions#hardening-for-self-hosted-runners).

```yaml
- name: Azure CLI script
  uses: azure/CLI@v1
  with:
    inlineScript: |
      az logout
      az cache purge
      az account clear
```

## Az CLI dependency

Internally in this action, we use azure CLI and execute `az login` with the credentials provided through secrets. In order to validate the new az CLI releases for this action, [canary test workflow](.github/workflows/azure-login-canary.yml) is written which will execute the action on [az CLI's edge build](https://github.com/Azure/azure-cli#edge-builds) which will fail incase of any breaking change is being introduced in the new upcoming release. The test results can be posted on a slack or teams channel using the corresponding integrations. Incase of a failure, the concern will be raised to [azure-cli](https://github.com/Azure/azure-cli) for taking a necessary action and also the latest CLI installation will be postponed in [Runner VMs](https://github.com/actions/virtual-environments) as well for hosted runner to prevent the workflows failing due to the new CLI changes.

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
