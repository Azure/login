# GitHub Actions for deploying to Azure

## Automate your GitHub workflows using Azure Actions

[GitHub Actions](https://help.github.com/en/articles/about-github-actions) gives you the flexibility to build an automated software development lifecycle workflow. 

With [GitHub Actions for Azure](https://github.com/Azure/actions/) you can create workflows that you can set up in your repository to build, test, package, release and **deploy** to Azure.

NOTE: you must have write permissions to the repository in question. If you're using a sample repository from Microsoft, be sure to first fork the repository to your own GitHub account.

Get started today with a [free Azure account](https://azure.com/free/open-source).

# GitHub Action for Azure Login

With the Azure login Action, you can automate your workflow to do an Azure login using [Azure service principal](https://docs.microsoft.com/azure/active-directory/develop/app-objects-and-service-principals) and run Azure CLI and Azure PowerShell scripts.

By default, the action only logs in with the Azure CLI (using the `az login` command). To log in with the Az PowerShell module, set `enable-AzPSSession` to true.

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

name: AzurePowerShellSample

jobs:

  build-and-deploy:
    runs-on: ubuntu-latest
    steps:

    - name: Login via Az module
      uses: azure/login@v1
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

Refer to the [Azure PowerShell](https://github.com/azure/powershell) Github action to run your Azure PowerShell scripts.

## Configure deployment credentials:

The previous sample workflows depend on a [secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets) named `AZURE_CREDENTIALS` in your repository. The value of this secret is expected to be a JSON object that represents a service principal (an identifer for an application or process) that authenticates the workflow with Azure.

To function correctly, this service principal must be assigned the [Contributor]((https://docs.microsoft.com/azure/role-based-access-control/built-in-roles#contributor)) role for the web app or the resource group that contains the web app.

The following steps describe how to create the service principal, assign the role, and create a secret in your repository with the resulting credentials.

1. Open the Azure Cloud Shell at [https://shell.azure.com](https://shell.azure.com). You can alternately use the [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli?view=azure-cli-latest) if you've installed it locally. (For more information on Cloud Shell, see the [Cloud Shell Overview](https://docs.microsoft.com/azure/cloud-shell/overview).)
  
2. Use the [az ad dp create-for-rbac](https://docs.microsoft.com/cli/azure/ad/sp?view=azure-cli-latest#az_ad_sp_create_for_rbac) command to create a service principal and assign a Contributor role:

    ```azurecli
    az ad sp create-for-rbac --name "{sp-name}" --sdk-auth --role contributor \
        --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.Web/sites/{app-name}
    ```

    Replace the following:
      * `{sp-name}` with a suitable name for your service principal, such as the name of the app itself. The name must be unique within your organization.
      * `{subscription-id}` with the subscription you want to use
      * `{resource-group}` the resource group containing the web app.
      * `{app-name}` with the name of the web app.

    This command invokes Azure Active Directory (via the `ad` part of the command) to create a service principal (via `sp`) specifically for [Role-Based Access Control (RBAC)](https://docs.microsoft.com/azure/role-based-access-control/overview) (via `create-for-rbac`).

    The `--role` argument specifies the permissions to grant to the service principal at the specified `--scope`. In this case, you grant the built-in [Contributor](https://docs.microsoft.com/azure/role-based-access-control/built-in-roles#contributor) role at the scope of the web app in the specified resource group in the specified subscription.

    If desired, you can omit the part of the scope starting with `/providers/...` to grant the service principal the Contributor role for the entire resource group:

    ```azurecli  
    az ad sp create-for-rbac --name "{sp-name}" --sdk-auth --role contributor \
        --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}
    ```

    For security purposes, however, it's always preferable to grant permissions at the most restrictive scope possible.

3. When complete, the `az ad sp create-for-rbac` command displays JSON output in the following form (which is specified by the `--sdk-auth` argument):

    ```json
    {
      "clientId": "<GUID>",
      "clientSecret": "<GUID>",
      "subscriptionId": "<GUID>",
      "tenantId": "<GUID>",
      (...)
    }
    ```

4. In your repository, use **Add secret** to create a new secret named `AZURE_CREDENTIALS` (as shown in the example workflow), or using whatever name is in your workflow file.

5. Paste the entire JSON object produced by the `az ad sp create-for-rbac` command as the secret value and save the secret.

NOTE: to manage service principals created with `az ad sp create-for-rbac`, visit the [Azure portal](https://portal.azure.com), navigate to your Azure Active Directory, then select **Manage** > **App registrations** on the left-hand menu. Your service principal should appear in the list. Select a principal to navigate to its properties. You can also manage role assignments using the [az role assignment](https://docs.microsoft.com/cli/azure/role/assignment?view=azure-cli-latest) command.

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
