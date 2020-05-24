# GitHub Actions for deploying to Azure

## Automate your GitHub workflows using Azure Actions

[GitHub Actions](https://help.github.com/en/articles/about-github-actions)  gives you the flexibility to build an automated software development lifecycle workflow. 

With [GitHub Actions for Azure](https://github.com/Azure/actions/) you can create workflows that you can set up in your repository to build, test, package, release and **deploy** to Azure. 

# GitHub Action for Azure Login
With the Azure login Action, you can automate your workflow to do an Azure login using [Azure service principal](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals) and run Az CLI and Azure PowerShell scripts.

By default, only az cli login will be done. In addition to az cli, you can login using Az module to run Azure PowerShell scripts by setting enable-AzPSSession to true.

Get started today with a [free Azure account](https://azure.com/free/open-source)!

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
    
    - uses: azure/login@v1.1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - run: |
        az webapp list --query "[?state=='Running']"

```

## Sample workflow that uses Azure login action to run Azure PowerShell

```yaml

# File: .github/workflows/workflow.yml

on: [push]

name: AzurePowerShellSample

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    
    - name: Login via Az module
      uses: azure/login@v1.1
      with:
        creds: ${{secrets.AZURE_CREDENTIALS}}
        enable-AzPSSession: true 
    
    - name: Run Az CLI script
      run: |
        az webapp list --query "[?state=='Running']"
   
    - name: Run Azure PowerShell script
      uses: azure/powershell@v1
      with:
        azPSVersion: '3.1.0'
        inlineScript: |
          Get-AzVM -ResourceGroupName "ActionsDemo"
        
     
        
```

Refer [Azure PowerShell](https://github.com/azure/powershell) Github action to run your Azure PowerShell scripts.

## Configure deployment credentials:

For any credentials like Azure Service Principal, Publish Profile etc add them as [secrets](https://help.github.com/en/articles/virtual-environments-for-github-actions#creating-and-using-secrets-encrypted-variables) in the GitHub repository and then use them in the workflow.

The above example uses user-level credentials i.e., Azure Service Principal for deployment. 

Follow the steps to configure the secret:
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


# Azure Login metadata file

```yaml

# action.yml

# Login to Azure subscription
name: 'Azure Login'
description: 'Authenticate to Azure and run your Az CLI or Az PowerShell based Actions or scripts. github.com/Azure/Actions'
inputs: 
  creds:
    description: 'Paste output of `az ad sp create-for-rbac` as value of secret variable: AZURE_CREDENTIALS'
    required: true
  enable-AzPSSession: 
    description: 'Set this value to true to enable Azure PowerShell Login in addition to Az CLI login'
    required: false
    default: false
branding:
  icon: 'login.svg'
  color: 'blue'
runs:
  using: 'node12'
  main: 'lib/main.js'
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
