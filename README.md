# GitHub Actions for deploying to Azure

## Automate your GitHub workflows using Azure Actions

[GitHub Actions](https://help.github.com/en/articles/about-github-actions)  gives you the flexibility to build an automated software development lifecycle workflow. 

With [GitHub Actions for Azure](https://github.com/Azure/actions/) you can create workflows that you can set up in your repository to build, test, package, release and **deploy** to Azure. 

# GitHub Action for Azure Login

With the [Azure Login](https://github.com/Azure/login/blob/master/action.yml) Action, you can automate your workflow to do an Azure login using [Azure service principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals) and run Az CLI and Azure PowerShell scripts.

- By default, the action only logs in with the Azure CLI (using the `az login` command). To log in with the Az PowerShell module, set `enable-AzPSSession` to true. To login to Azure tenants without any subscriptions, set the optional parameter `allow-no-subscriptions` to true. 

- To login into one of the Azure Government clouds or Azure Stack, set the optional parameter `environment` with one of the supported values `AzureUSGovernment` or `AzureChinaCloud` or `AzureStack`. If this parameter is not specified, it takes the default value `AzureCloud` and connects to the Azure Public Cloud. Additionally the parameter `creds` takes the Azure service principal created in the particular cloud to connect (Refer to [this](#configure-a-service-principal-with-a-secret)  section below for details).

- The Action supports two different ways of authentication with Azure. One using the Azure Service Principal with secrets. The other is OpenID connect (OIDC) method of authentication using Azure Service Principal with a Federated Identity Credential. 
- To login using Azure Service Principal with a secret, follow [this](#configure-a-service-principal-with-a-secret) guidance.
- To login using **OpenID Connect (OIDC) based Federated Identity Credentials**, 
   1. Follow [this](#configure-a-service-principal-with-a-federated-credential-to-use-oidc-based-authentication) guidance to create a Federated Credential associated with your AD App (Service Principal). This is needed to establish OIDC trust between GitHub deployment workflows and the specific Azure resources scoped by the service principal.
   2. In your GitHub workflow, Set `permissions:` with `id-token: write` at workflow level or job level based on whether the OIDC token needs to be auto-generated for all Jobs or a specific Job. 
   3. Within the Job deploying to Azure, add Azure/login action and pass the `client-id`, `tenant-id` and `subscription-id` of the Azure service principal associated with an OIDC Federated Identity Credential credeted in step (i). You can also pass a JSON object to the `creds` property that contains OIDC settings as follows:
   ```json
   { 
     "clientId": "<clientId>",
     "subscriptionId": "<subscriptionId>",
     "tenantId": "<tenantId>",
     ...
   }
   ```
   
Note: 
   - Ensure the CLI version is 2.30 or above to use OIDC support.
   - OIDC support in Azure is in Public Preview and is supported only for public clouds. Support for other clouds like Government clouds, Azure Stacks would be added soon. 
   - GitHub runners will soon be updating the with the Az CLI and PowerShell versions that support with OIDC. Hence the below sample workflows include explicit instructions to download the same during workflow execution. 
   - By default, Azure access tokens issued during OIDC based login could have limited validity. This expiration time is configurable in Azure.
   - If the `creds` property contains a `clientSecret` property, the task will log in using credentials. If there is no `clientSecret`, the task will use OIDC.


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
Users can also specify `audience` field for access-token in the input parameters of the action. If not specified, it is defaulted to `api://AzureADTokenExchange`. This action supports login az powershell as well for both windows and linux runners by setting an input parameter `enable-AzPSSession: true`. Below is the sample workflow for the same using the windows runner. Please note that powershell login is not supported in Macos runners.

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

Refer [Azure PowerShell](https://github.com/azure/powershell) Github action to run your Azure PowerShell scripts.

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

Refer to the [Azure PowerShell](https://github.com/azure/powershell) Github action to run your Azure PowerShell scripts.

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
Refer to the [Azure Stack Hub Login Action Tutorial](https://docs.microsoft.com/en-us/azure-stack/user/ci-cd-github-action-login-cli?view=azs-2008) for more detailed instructions.

## Configure deployment credentials:
  
### Configure a service principal with a secret:

For using any credentials like Azure Service Principal, Publish Profile etc add them as [secrets](https://help.github.com/en/articles/virtual-environments-for-github-actions#creating-and-using-secrets-encrypted-variables) in the GitHub repository and then use them in the workflow.


Follow the steps to configure Azure Service Principal with a secret:
  * Define a new secret under your repository settings, Add secret menu
  * Store the output of the below [az cli](https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest) command as the value of secret variable, for example 'AZURE_CREDENTIALS'
```bash  

   az ad sp create-for-rbac --name "myApp" --role contributor \
                            --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
                            --sdk-auth
                            
  # Replace {subscription-id}, {resource-group} with the subscription, resource group details

  # The command should output a JSON object similar to this:

  {
    "clientId": "<GUID>",
    "clientSecret": "<GUID>",
    "subscriptionId": "<GUID>",
    "tenantId": "<GUID>",
    (...)
  }
  
```
  * Now in the workflow file in your branch: `.github/workflows/workflow.yml` replace the secret in Azure login action with your secret (Refer to the example above)

### Configure a service principal with a Federated Credential to use OIDC based authentication:


You can add federated credentials in the Azure portal or with the Microsoft Graph REST API.

#### Azure portal
1. [Register an application](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) in Azure Portal
2. Within the registered application, Go to **Certificates & secrets**.  
3. In the **Federated credentials** tab, select **Add credential**.  
4. The **Add a credential** blade opens.
5. In the **Federated credential scenario** box select **GitHub actions deploying Azure resources**.
6. Specify the **Organization** and **Repository** for your GitHub Actions workflow which needs to access the Azure resources scoped by this App (Service Principal) 
7. For **Entity type**, select **Environment**, **Branch**, **Pull request**, or **Tag** and specify the value, based on how you have configured the trigger for your GitHub workflow. For a more detailed overview, see [GitHub OIDC guidance]( https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#defining-[…]dc-claims). 
8. Add a **Name** for the federated credential.
9. Click **Add** to configure the federated credential.

For a more detailed overview, see more guidance around [Azure Federated Credentials](https://docs.microsoft.com/en-us/azure/active-directory/develop/workload-identity-federation-create-trust-github). 

#### Microsoft Graph

1. Launch [Azure Cloud Shell](https://portal.azure.com/#cloudshell/) and sign in to your tenant.
1. Create a federated identity credential

    Run the following command to [create a new federated identity credential](https://docs.microsoft.com/en-us/graph/api/application-post-federatedidentitycredentials?view=graph-rest-beta&preserve-view=true) on your app (specified by the object ID of the app). Substitute the values `APPLICATION-OBJECT-ID`, `CREDENTIAL-NAME`, `SUBJECT`. The options for subject refer to your request filter. These are the conditions that OpenID Connect uses to determine when to issue an authentication token.  
    * specific environment
        ```azurecli
        az rest --method POST --uri 'https://graph.microsoft.com/beta/applications/<APPLICATION-OBJECT-ID>/federatedIdentityCredentials' --body '{"name":"<CREDENTIAL-NAME>","issuer":"https://token.actions.githubusercontent.com","subject":"repo:octo-org/octo-repo:environment:Production","description":"Testing","audiences":["api://AzureADTokenExchange"]}' 
        ```
    * pull_request events
       ```azurecli
        az rest --method POST --uri 'https://graph.microsoft.com/beta/applications/<APPLICATION-OBJECT-ID>/federatedIdentityCredentials' --body '{"name":"<CREDENTIAL-NAME>","issuer":"https://token.actions.githubusercontent.com","subject":"repo:octo-org/octo-repo:pull_request","description":"Testing","audiences":["api://AzureADTokenExchange"]}' 
        ```
    * specific branch
       ```azurecli
        az rest --method POST --uri 'https://graph.microsoft.com/beta/applications/<APPLICATION-OBJECT-ID>/federatedIdentityCredentials' --body '{"name":"<CREDENTIAL-NAME>","issuer":"https://token.actions.githubusercontent.com","subject":"repo:octo-org/octo-repo:ref:refs/heads/{Branch}","description":"Testing","audiences":["api://AzureADTokenExchange"]}' 
        ```
    * specific tag
       ```azurecli
        az rest --method POST --uri 'https://graph.microsoft.com/beta/applications/<APPLICATION-OBJECT-ID>/federatedIdentityCredentials' --body '{"name":"<CREDENTIAL-NAME>","issuer":"https://token.actions.githubusercontent.com","subject":"repo:octo-org/octo-repo:ref:refs/heads/{Tag}","description":"Testing","audiences":["api://AzureADTokenExchange"]}' 
        ```

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

This action doesn't implement ```az logout``` by default at the end of execution. However there is no way of tampering the credentials or account information because the github hosted runner is on a VM that will get reimaged for every customer run which gets everything deleted. But if the runner is self-hosted which is not github provided it is recommended to manually logout at the end of the workflow as shown below. More details on security of the runners can be found [here](https://docs.github.com/en/actions/learn-github-actions/security-hardening-for-github-actions#hardening-for-self-hosted-runners).
```
- name: Azure CLI script
  uses: azure/CLI@v1
  with:
    azcliversion: 2.0.72
    inlineScript: |
      az logout
      az cache purge
      az account clear
```

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
