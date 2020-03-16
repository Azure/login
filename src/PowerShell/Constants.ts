export default class Constants {
    static readonly prefix: string = "az_";
    static readonly moduleName: string = "Az.Accounts";
    static readonly versionPattern = /[0-9]\.[0-9]\.[0-9]/;

    static readonly environment: string = "AzureCloud";
    static readonly scopeLevel: string = "Subscription";
    static readonly scheme: string = "ServicePrincipal";
}