import AzPSSCriptBuilder from "../../src/PowerShell/AzPSScriptBuilder";
import { LoginConfig } from "../../src/common/LoginConfig";

describe("Getting AzLogin PS script", () => {

    function setEnv(name: string, value: string) {
        process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value;
    }

    function cleanEnv() {
        for (const envKey in process.env) {
            if (envKey.startsWith('INPUT_')) {
                delete process.env[envKey]
            }
        }
    }

    beforeEach(() => {
        cleanEnv();
    });

    test('PS script to get latest module path should work', () => {
        expect(AzPSSCriptBuilder.getLatestModulePathScript("TestModule")).toContain("(Get-Module -Name 'TestModule' -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1).ModuleBase");
    });

    test('PS script should not set context while passing allowNoSubscriptionsLogin as true', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        let creds = {
            'clientId': 'client-id',
            'clientSecret': 'client-secret',
            'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id'
        }
        setEnv('creds', JSON.stringify(creds));

        let loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSSCriptBuilder.getAzPSLoginScript(loginConfig).then(([loginMethod, loginScript]) => {
            expect(loginScript.includes("Connect-AzAccount -ServicePrincipal -Environment 'azurecloud' -Tenant 'tenant-id' -Credential")).toBeTruthy();
            expect(loginScript.includes("Set-AzContext -SubscriptionId")).toBeFalsy;
        });
    });

    test('PS script should set context while passing allowNoSubscriptionsLogin as false', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'false');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        let creds = {
            'clientId': 'client-id',
            'clientSecret': 'client-secret',
            'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id'
        }
        setEnv('creds', JSON.stringify(creds));

        let loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSSCriptBuilder.getAzPSLoginScript(loginConfig).then(([loginMethod, loginScript]) => {
            expect(loginScript.includes("Connect-AzAccount -ServicePrincipal -Environment 'azurecloud' -Tenant 'tenant-id' -Credential")).toBeTruthy();
            expect(loginScript.includes("Set-AzContext -SubscriptionId")).toBeTruthy();
        });
    });

    test('PS script should use system managed identity to login when auth-type is IDENTITY', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'false');
        setEnv('subscription-id', 'subscription-id');
        setEnv('auth-type', 'IDENTITY');

        let loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSSCriptBuilder.getAzPSLoginScript(loginConfig).then(([loginMethod, loginScript]) => {
            expect(loginScript.includes("Connect-AzAccount -Identity -Environment 'azurecloud'")).toBeTruthy();
            expect(loginScript.includes("Connect-AzAccount -Identity -Environment 'azurecloud' -AccountId 'client-id'")).toBeFalsy();
            expect(loginScript.includes("Set-AzContext -SubscriptionId")).toBeTruthy();
        });
    });

    test('PS script should use user managed identity to login when auth-type is IDENTITY', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'IDENTITY');
        setEnv('client-id', 'client-id');

        let loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSSCriptBuilder.getAzPSLoginScript(loginConfig).then(([loginMethod, loginScript]) => {
            expect(loginScript.includes("Connect-AzAccount -Identity -Environment 'azurecloud' -AccountId 'client-id'")).toBeTruthy();
            expect(loginScript.includes("Set-AzContext -SubscriptionId")).toBeFalsy();
        });
    });

});