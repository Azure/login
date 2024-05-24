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

    test('getImportLatestModuleScript', () => {
        expect(AzPSSCriptBuilder.getImportLatestModuleScript("TestModule")).toContain("(Get-Module -Name 'TestModule' -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1).Path");
        expect(AzPSSCriptBuilder.getImportLatestModuleScript("TestModule")).toContain("Import-Module -Name $latestModulePath");
    });

    test('getAzPSLoginScript for SP+secret with allowNoSubscriptionsLogin=true', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        let creds = {
            'clientId': 'client-id',
            'clientSecret': "client-secret",
            'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id'
        }
        setEnv('creds', JSON.stringify(creds));

        let loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSSCriptBuilder.getAzPSLoginScript(loginConfig).then(([loginMethod, loginScript]) => {
            expect(loginScript.includes("$psLoginSecrets = ConvertTo-SecureString 'client-secret' -AsPlainText -Force; $psLoginCredential = New-Object System.Management.Automation.PSCredential('client-id', $psLoginSecrets); Connect-AzAccount -ServicePrincipal -Environment 'azurecloud' -Tenant 'tenant-id' -Subscription 'subscription-id' -Credential $psLoginCredential -InformationAction Ignore | out-null;")).toBeTruthy();
            expect(loginMethod).toBe('service principal with secret');
        });
    });

    test('getAzPSLoginScript for SP+secret with allowNoSubscriptionsLogin=true, secret with single-quote', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        let creds = {
            'clientId': 'client-id',
            'clientSecret': "client-se'cret",
            'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id'
        }
        setEnv('creds', JSON.stringify(creds));

        let loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSSCriptBuilder.getAzPSLoginScript(loginConfig).then(([loginMethod, loginScript]) => {
            expect(loginScript.includes("$psLoginSecrets = ConvertTo-SecureString 'client-se''cret' -AsPlainText -Force; $psLoginCredential = New-Object System.Management.Automation.PSCredential('client-id', $psLoginSecrets); Connect-AzAccount -ServicePrincipal -Environment 'azurecloud' -Tenant 'tenant-id' -Subscription 'subscription-id' -Credential $psLoginCredential -InformationAction Ignore | out-null;")).toBeTruthy();
            expect(loginMethod).toBe('service principal with secret');
        });
    });

    test('getAzPSLoginScript for SP+secret with allowNoSubscriptionsLogin=false', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'false'); // same as true
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
            expect(loginScript.includes("$psLoginSecrets = ConvertTo-SecureString 'client-secret' -AsPlainText -Force; $psLoginCredential = New-Object System.Management.Automation.PSCredential('client-id', $psLoginSecrets); Connect-AzAccount -ServicePrincipal -Environment 'azurecloud' -Tenant 'tenant-id' -Subscription 'subscription-id' -Credential $psLoginCredential -InformationAction Ignore | out-null;")).toBeTruthy();
            expect(loginMethod).toBe('service principal with secret');
        });
    });

    test('getAzPSLoginScript for OIDC', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'false');
        setEnv('tenant-id', 'tenant-id');
        setEnv('subscription-id', 'subscription-id');
        setEnv('client-id', 'client-id');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');

        let loginConfig = new LoginConfig();
        loginConfig.initialize();
        jest.spyOn(loginConfig, 'getFederatedToken').mockImplementation(async () => {loginConfig.federatedToken = "fake-token";});
        return AzPSSCriptBuilder.getAzPSLoginScript(loginConfig).then(([loginMethod, loginScript]) => {
            expect(loginScript.includes("Connect-AzAccount -ServicePrincipal -Environment 'azurecloud' -Tenant 'tenant-id' -Subscription 'subscription-id' -ApplicationId 'client-id' -FederatedToken 'fake-token' -InformationAction Ignore | out-null;")).toBeTruthy();
            expect(loginMethod).toBe('OIDC');
        });
    });

    test('getAzPSLoginScript for System MI', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'false');
        setEnv('subscription-id', 'subscription-id');
        setEnv('auth-type', 'IDENTITY');

        let loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSSCriptBuilder.getAzPSLoginScript(loginConfig).then(([loginMethod, loginScript]) => {
            expect(loginScript.includes("Connect-AzAccount -Identity -Environment 'azurecloud' -Subscription 'subscription-id'  -InformationAction Ignore | out-null;")).toBeTruthy();
            expect(loginMethod).toBe('system-assigned managed identity');
        });
    });

    test('getAzPSLoginScript for System MI without subscription id', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'false');
        // setEnv('subscription-id', 'subscription-id');
        setEnv('auth-type', 'IDENTITY');

        let loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSSCriptBuilder.getAzPSLoginScript(loginConfig).then(([loginMethod, loginScript]) => {
            expect(loginScript.includes("Connect-AzAccount -Identity -Environment 'azurecloud'  -InformationAction Ignore | out-null;")).toBeTruthy();
            expect(loginMethod).toBe('system-assigned managed identity');
        });
    });

    test('getAzPSLoginScript for user-assigned MI', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'IDENTITY');
        setEnv('client-id', 'client-id');

        let loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSSCriptBuilder.getAzPSLoginScript(loginConfig).then(([loginMethod, loginScript]) => {
            expect(loginScript.includes("Connect-AzAccount -Identity -Environment 'azurecloud' -AccountId 'client-id' -InformationAction Ignore | out-null;")).toBeTruthy();
            expect(loginMethod).toBe('user-assigned managed identity');
        });
    });

});