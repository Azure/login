# GitHub Actions for deploying to Azure

## Automate your GitHub workflows using Azure Actions

[GitHub Actions](https://help.github.com/en/articles/about-github-actions)  gives you the flexibility to build an automated software development lifecycle workflow. 

With [GitHub Actions for Azure](https://github.com/Azure/actions/) you can create workflows that you can set up in your repository to build, test, package, release and **deploy** to Azure. 

# GitHub Action for Azure Login
With the Azure login Action, you can automate your workflow to do an Azure login using [Azure service principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals) and run Az CLI and Azure PowerShell scripts.

- By default, the action only logs in with the Azure CLI (using the `az login` command). To log in with the Az PowerShell module, set `enable-AzPSSession` to true. To login to Azure tenants without any subscriptions, set the optional parameter `allow-no-subscriptions` to true. 

- To login into one of the Azure Government clouds, set the optional parameter environment with supported cloud names AzureUSGovernment or AzureChinaCloud. If this parameter is not specified, it takes the default value AzureCloud and connect to the Azure Public Cloud. Additionally the parameter creds takes the Azure service principal created in the particular cloud to connect (Refer to Configure deployment credentials section below for details).

- The Action supports two different ways of authentication with Azure. One using the Azure Service Principal with secrets. Other is to use Azure Service Principal with Federated Identity Credentials that use OpenID connect (OIDC) method of authentication. 
- To login using Azure Service Principal with a secret, follow [this](#configure-a-service-principal-with-a-secret) guidance.
- To login using **OpenID Connect (OIDC) based Federated Identity Credentials**, 
   1. Follow [this](#configure-a-service-principal-with-a-federated-credential-to-use-oidc-based-authentication) guidance to create a Federated Credential associated with your AD App (Service Principal)
   2. In your GitHub workflow, Set `permissions:` with `id-token: write` at job level or workflow level based on whether the OIDC token needs to be auto-generated for all Jobs or a specific Job. 
   3. Within the Job deploying to Azure, add Azure/login action with OIDC support and pass the `client-id`, `tenant-id` and `subscription-id` of the Azure service principal associated with an OIDC Federated Identity Credential credeted in step (i)

Follow <this> guidance, to create a new service principal and then to create a Federated credential in Azure portal needed to establish OIDC trust between GitHub deployment workflows and the specific Azure resources scoped by the service principal. Configure the Federated Credential with appropriate values of the GitHub Org, Repo and Environments based on the context used in the GitHub deployment workflows targeting Azure.

Note: Currently OIDC login is supported for public clouds. Support for other clouds like Government clouds, Azure Stacks would be added soon. 

This repository contains GitHub Action for [Azure Login](https://github.com/Azure/login/blob/master/action.yml).

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
      
jobs: 
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
        
      # ubuntu Az CLI installation 
      - name: Install CLI-beta
        run: |
           cd ../..
           CWD="$(pwd)"
           python3 -m venv oidc-venv
           . oidc-venv/bin/activate
           echo "activated environment" 
           python3 -m pip install --upgrade pip
           echo "started installing cli beta" 
           pip install -q --extra-index-url https://azcliprod.blob.core.windows.net/beta/simple/ azure-cli
           echo "installed cli beta"    
           echo "$CWD/oidc-venv/bin" >> $GITHUB_PATH   
  
      - name: 'Az CLI login'
        uses: azure/login@releases/v1
        with:
          client-id: ${{ secrets.AZURE_CLIENTID }}
          tenant-id: ${{ secrets.AZURE_TENANTID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTIONID }}
  
      - name: 'Run az commands'
        run: |
          az account show
          az group list
          pwd 
```
  
## Sample workflow that uses Azure login action using OIDC to run az PowerShell (Windows)

```yaml
# File: .github/workflows/OIDC_workflow.yml

name: Run Azure Login with OIDC
on: [push]

permissions:
      id-token: write
      
jobs: 
  Windows-latest:
      runs-on: windows-latest
      steps:

        # windows Az CLI installation 
        - name: Install CLI-beta
          run: |
              cd ../..
              $CWD = Convert-Path .
              echo $CWD
              python --version
              python -m venv oidc-venv
              . .\oidc-venv\Scripts\Activate.ps1
              python -m pip install -q --upgrade pip
              echo "started installing cli beta" 
              pip install -q --extra-index-url https://azcliprod.blob.core.windows.net/beta/simple/ azure-cli
              echo "installed cli beta" 
              echo "$CWD\oidc-venv\Scripts" >> $env:GITHUB_PATH

        - name: Installing preview Az.accounts for powershell
          shell: pwsh
          run: |
            cd ../../oidc-venv
            Invoke-WebRequest -Uri https://azposhpreview.blob.core.windows.net/public/Az.Accounts.2.6.0.nupkg -outfile "Az.Accounts.2.6.0.nupkg"
            Register-PSRepository -Name LocalPSRepo -SourceLocation "$(pwd)" -ScriptSourceLocation "$(pwd)" -InstallationPolicy Trusted
            Install-Module Az.Accounts -Repository LocalPSRepo
  
        - name: OIDC Login to Azure Public Cloud with AzPowershell (enableAzPSSession true)
          uses: 'azure/login@releases/v1'
          with:
            client-id: ${{ secrets.AZURE_CLIENTID }}
            tenant-id: ${{ secrets.AZURE_TENANTID }}
            subscription-id: ${{ secrets.AZURE_SUBSCRIPTIONID }} 
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
1. Go to **Certificates and secrets**.  In the **Federated credentials** tab, select **Add credential**.  
1. The **Add a credential** blade opens.
1. In the **Federated credential scenario** box select **GitHub actions deploying Azure resources**.
1. Specify the **Organization** and **Repository** for your GitHub Actions workflow which needs to access the Azure resources scoped by this App (Service Principal) 
1. For **Entity type**, select **Environment**, **Branch**, **Pull request**, or **Tag** and specify the value, based on how you have configured the trigger for your GitHub workflow. For a more detailed overview, see [GitHub OIDC guidance](). 
1. Add a **Name** for the federated credential.
1. Click **Add** to configure the federated credential.

For a more detailed overview, see more guidance around [Azure Federated Credentials](). 

#### Microsoft Graph

1. Launch [Azure Cloud Shell](https://portal.azure.com/#cloudshell/) and sign in to your tenant.
1. reate a federated identity credential

    Run the following command to [create a new federated identity credential](/graph/api/application-post-federatedidentitycredentials?view=graph-rest-beta&preserve-view=true) on your app (specified by the object ID of the app). Substitute the values `APPLICATION-ID`, `CREDENTIAL-NAME`, `SUBJECT`. The options for subject refer to your request filter. These are the conditions that OpenID Connect uses to determine when to issue an authentication token.  
    * specific environment
    * pull_request events
    * specific branch
    * specific tag

        ```azurecli
        az rest --method POST --uri 'https://graph.microsoft.com/beta/applications/<APPLICATION-ID>/federatedIdentityCredentials' --body '{"name":"<CREDENTIAL-NAME>","issuer":"https://token.actions.githubusercontent.com/","subject":"repo:octo-org/octo-repo:environment:Production","description":"Testing","audiences":["api://AzureADTokenExchange"]}' 
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
