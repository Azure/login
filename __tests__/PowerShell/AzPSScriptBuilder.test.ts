import AzPSScriptBuilder from "../../src/PowerShell/AzPSScriptBuilder";
import { LoginConfig } from "../../src/common/LoginConfig";

describe("Building the Az PS login invocation", () => {

    function setEnv(name: string, value: string) {
        process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value;
    }

    function cleanEnv() {
        for (const envKey in process.env) {
            if (envKey.startsWith('INPUT_')) {
                delete process.env[envKey];
            }
        }
    }

    beforeEach(() => {
        cleanEnv();
    });

    test('getImportLatestModuleScript still emits the interpolated module-import script', () => {
        expect(AzPSScriptBuilder.getImportLatestModuleScript("TestModule")).toContain("(Get-Module -Name 'TestModule' -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1).Path");
        expect(AzPSScriptBuilder.getImportLatestModuleScript("TestModule")).toContain("Import-Module -Name $latestModulePath");
    });

    test('getScriptPath resolves to AzPSLogin.ps1 next to the compiled module', () => {
        expect(AzPSScriptBuilder.getScriptPath()).toMatch(/AzPSLogin\.ps1$/);
    });

    test('SP + secret: values ride as pwsh params; secret rides via env var', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        const creds = {
            'clientId': 'client-id',
            'clientSecret': 'client-secret',
            'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id'
        };
        setEnv('creds', JSON.stringify(creds));

        const loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSScriptBuilder.getAzPSLoginInvocation(loginConfig).then(({ methodName, args, env }) => {
            expect(methodName).toBe('service principal with secret');
            expect(args[0]).toBe('-File');
            expect(args[1]).toMatch(/AzPSLogin\.ps1$/);
            expect(args).toEqual(expect.arrayContaining([
                '-Environment', 'azurecloud',
                '-AuthType', 'SERVICE_PRINCIPAL',
                '-Tenant', 'tenant-id',
                '-Subscription', 'subscription-id',
                '-ApplicationId', 'client-id',
            ]));
            expect(env[AzPSScriptBuilder.ENV_SP_SECRET]).toBe('client-secret');
            expect(env[AzPSScriptBuilder.ENV_FEDERATED_TOKEN]).toBeUndefined();
        });
    });

    test('SP + OIDC: federated token rides via env var; no client secret', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'false');
        setEnv('tenant-id', 'tenant-id');
        setEnv('subscription-id', 'subscription-id');
        setEnv('client-id', 'client-id');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');

        const loginConfig = new LoginConfig();
        loginConfig.initialize();
        jest.spyOn(loginConfig, 'getFederatedToken').mockImplementation(async () => { loginConfig.federatedToken = "fake-token"; });

        return AzPSScriptBuilder.getAzPSLoginInvocation(loginConfig).then(({ methodName, args, env }) => {
            expect(methodName).toBe('OIDC');
            expect(args).toEqual(expect.arrayContaining([
                '-Tenant', 'tenant-id',
                '-Subscription', 'subscription-id',
                '-ApplicationId', 'client-id',
            ]));
            expect(env[AzPSScriptBuilder.ENV_FEDERATED_TOKEN]).toBe('fake-token');
            expect(env[AzPSScriptBuilder.ENV_SP_SECRET]).toBeUndefined();
        });
    });

    test('system-assigned MI: no ApplicationId param, no env vars', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'false');
        setEnv('subscription-id', 'subscription-id');
        setEnv('auth-type', 'IDENTITY');

        const loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSScriptBuilder.getAzPSLoginInvocation(loginConfig).then(({ methodName, args, env }) => {
            expect(methodName).toBe('system-assigned managed identity');
            expect(args).toEqual(expect.arrayContaining([
                '-AuthType', 'IDENTITY',
                '-Subscription', 'subscription-id',
            ]));
            expect(args).not.toContain('-ApplicationId');
            expect(Object.keys(env)).toHaveLength(0);
        });
    });

    test('system-assigned MI without subscription id: subscription param omitted', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'false');
        setEnv('auth-type', 'IDENTITY');

        const loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSScriptBuilder.getAzPSLoginInvocation(loginConfig).then(({ methodName, args }) => {
            expect(methodName).toBe('system-assigned managed identity');
            expect(args).not.toContain('-Subscription');
        });
    });

    test('user-assigned MI: ApplicationId param present, no env vars', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'IDENTITY');
        setEnv('client-id', 'client-id');

        const loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSScriptBuilder.getAzPSLoginInvocation(loginConfig).then(({ methodName, args, env }) => {
            expect(methodName).toBe('user-assigned managed identity');
            expect(args).toEqual(expect.arrayContaining([
                '-AuthType', 'IDENTITY',
                '-ApplicationId', 'client-id',
            ]));
            expect(Object.keys(env)).toHaveLength(0);
        });
    });

    test('AzureStack: ArmEndpoint passed as param', () => {
        setEnv('environment', 'azurestack');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        const creds = {
            'clientId': 'client-id',
            'clientSecret': 'client-secret',
            'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id',
            'resourceManagerEndpointUrl': 'https://management.azurestack.local/'
        };
        setEnv('creds', JSON.stringify(creds));

        const loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSScriptBuilder.getAzPSLoginInvocation(loginConfig).then(({ args }) => {
            expect(args).toEqual(expect.arrayContaining([
                '-ArmEndpoint', 'https://management.azurestack.local/',
            ]));
        });
    });

    test('SECURITY: adversarial ArmEndpoint travels as a discrete argv element', () => {
        setEnv('environment', 'azurestack');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        const nasty = "https://mgmt.local/' ; Start-Process calc ; $x='";
        const creds = {
            'clientId': 'client-id',
            'clientSecret': 'client-secret',
            'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id',
            'resourceManagerEndpointUrl': nasty
        };
        setEnv('creds', JSON.stringify(creds));

        const loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSScriptBuilder.getAzPSLoginInvocation(loginConfig).then(({ args }) => {
            const armIndex = args.indexOf('-ArmEndpoint');
            expect(armIndex).toBeGreaterThan(-1);
            expect(args[armIndex + 1]).toBe(nasty);
            const otherArgs = args.filter((_, i) => i !== armIndex + 1);
            expect(otherArgs.some(a => a.includes(nasty))).toBe(false);
        });
    });

    // Structural safety: no matter how nasty a value is, it can never be re-parsed
    // as PowerShell code because it's a distinct argv element / env var, not a
    // substring inside a script literal.
    const NASTY_VALUES = [
        "abc' ; Start-Process calc ; $x='",
        'abc"; whoami ; #',
        "abc\nStart-Process calc",
    ];

    test.each(NASTY_VALUES)('SECURITY: adversarial tenant value %j travels as a discrete argv element', (nasty) => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        const creds = {
            'clientId': 'client-id',
            'clientSecret': 'client-secret',
            'tenantId': nasty,
            'subscriptionId': 'subscription-id'
        };
        setEnv('creds', JSON.stringify(creds));

        const loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSScriptBuilder.getAzPSLoginInvocation(loginConfig).then(({ args }) => {
            const tenantIndex = args.indexOf('-Tenant');
            expect(tenantIndex).toBeGreaterThan(-1);
            expect(args[tenantIndex + 1]).toBe(nasty);
            const otherArgs = args.filter((_, i) => i !== tenantIndex + 1);
            expect(otherArgs.some(a => a.includes(nasty))).toBe(false);
        });
    });

    test('SECURITY: adversarial client-secret rides in env var only, never in argv', () => {
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        const nasty = "abc' ; Start-Process calc ; $x='";
        const creds = {
            'clientId': 'client-id',
            'clientSecret': nasty,
            'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id'
        };
        setEnv('creds', JSON.stringify(creds));

        const loginConfig = new LoginConfig();
        loginConfig.initialize();
        return AzPSScriptBuilder.getAzPSLoginInvocation(loginConfig).then(({ args, env }) => {
            expect(env[AzPSScriptBuilder.ENV_SP_SECRET]).toBe(nasty);
            expect(args.some(a => a.includes(nasty))).toBe(false);
        });
    });

});
