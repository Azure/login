import { LoginConfig } from "../src/common/LoginConfig";

describe("LoginConfig Test", () => {

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

    async function testCreds(creds:any){
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'false');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        setEnv('creds', JSON.stringify(creds));
        let loginConfig = new LoginConfig();
        try{
            await loginConfig.initialize();
            throw new Error("The last step should fail.");
        }catch(error){
            expect(error.message.includes("Not all parameters are provided in 'creds'.")).toBeTruthy();
        }
    }

    function testValidateWithErrorMessage(loginConfig:LoginConfig, errorMessage:string){
        try{
            loginConfig.validate();
            throw new Error("The last step should fail.");
        }catch(error){
            expect(error.message.includes(errorMessage)).toBeTruthy();
        }
    }

    beforeEach(() => {
        cleanEnv();
    });

    test('initialize with creds, lack of clientId', async () => {
        let creds1 = {
            // 'clientId': 'client-id',
            'clientSecret': 'client-secret',
            'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id'
        }
        await testCreds(creds1);

    });

    test('initialize with creds, lack of clientSecret', async () => {
        let creds1 = {
            'clientId': 'client-id',
            // 'clientSecret': 'client-secret',
            'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id'
        }
        await testCreds(creds1);

    });

    test('initialize with creds, lack of tenantId', async () => {
        let creds1 = {
            'clientId': 'client-id',
            'clientSecret': 'client-secret',
            // 'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id'
        }
        await testCreds(creds1);

    });
   
    test('initialize with creds, lack of subscriptionId, but allowNoSubscriptionsLogin=true', async () => {
        let creds1 = {
            'clientId': 'client-id',
            'clientSecret': 'client-secret',
            'tenantId': 'tenant-id',
            // 'subscriptionId': 'subscription-id'
        }
        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        setEnv('creds', JSON.stringify(creds1));
        let loginConfig = new LoginConfig();
        await loginConfig.initialize();
        expect(loginConfig.environment).toBe("azurecloud");
        expect(loginConfig.enableAzPSSession).toBeTruthy();
        expect(loginConfig.allowNoSubscriptionsLogin).toBeTruthy();
        expect(loginConfig.authType).toBe("SERVICE_PRINCIPAL");
        expect(loginConfig.servicePrincipalId).toBe("client-id");
        expect(loginConfig.servicePrincipalSecret).toBe("client-secret");
        expect(loginConfig.tenantId).toBe("tenant-id");
        expect(loginConfig.subscriptionId).toBe(undefined);
    });

    test('initialize with creds', async () => {
        let creds = {
            'clientId': 'client-id',
            'clientSecret': 'client-secret',
            'tenantId': 'tenant-id',
            'subscriptionId': 'subscription-id'
        }

        setEnv('environment', 'azurecloud');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'false');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        setEnv('creds', JSON.stringify(creds));

        let loginConfig = new LoginConfig();
        await loginConfig.initialize();
        expect(loginConfig.environment).toBe("azurecloud");
        expect(loginConfig.enableAzPSSession).toBeTruthy();
        expect(loginConfig.allowNoSubscriptionsLogin).toBeFalsy();
        expect(loginConfig.authType).toBe("SERVICE_PRINCIPAL");
        expect(loginConfig.servicePrincipalId).toBe("client-id");
        expect(loginConfig.servicePrincipalSecret).toBe("client-secret");
        expect(loginConfig.tenantId).toBe("tenant-id");
        expect(loginConfig.subscriptionId).toBe("subscription-id");
    });

    test('initialize with individual parameters', async () => {
        setEnv('environment', 'azureusgovernment');
        setEnv('enable-AzPSSession', 'false');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');
        setEnv('tenant-id', 'tenant-id');
        setEnv('subscription-id', 'subscription-id');
        setEnv('client-id', 'client-id');

        let loginConfig = new LoginConfig();
        await loginConfig.initialize();
        expect(loginConfig.environment).toBe("azureusgovernment");
        expect(loginConfig.enableAzPSSession).toBeFalsy();
        expect(loginConfig.allowNoSubscriptionsLogin).toBeTruthy();
        expect(loginConfig.authType).toBe("SERVICE_PRINCIPAL");
        expect(loginConfig.servicePrincipalId).toBe("client-id");
        expect(loginConfig.tenantId).toBe("tenant-id");
        expect(loginConfig.subscriptionId).toBe("subscription-id");
    });

    test('initialize with both creds and individual parameters', async () => {
        setEnv('environment', 'azureusgovernment');
        setEnv('enable-AzPSSession', 'false');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');

        setEnv('tenant-id', 'tenant-id-aa');
        setEnv('subscription-id', 'subscription-id-aa');
        setEnv('client-id', 'client-id-aa');

        let creds = {
            'clientId': 'client-id-bb',
            'clientSecret': 'client-secret-bb',
            'tenantId': 'tenant-id-bb',
            'subscriptionId': 'subscription-id-bb'
        }
        setEnv('creds', JSON.stringify(creds));

        let loginConfig = new LoginConfig();
        await loginConfig.initialize();
        expect(loginConfig.environment).toBe("azureusgovernment");
        expect(loginConfig.enableAzPSSession).toBeFalsy();
        expect(loginConfig.allowNoSubscriptionsLogin).toBeTruthy();
        expect(loginConfig.authType).toBe("SERVICE_PRINCIPAL");
        expect(loginConfig.servicePrincipalId).toBe("client-id-aa");
        expect(loginConfig.servicePrincipalSecret).toBeNull();
        expect(loginConfig.tenantId).toBe("tenant-id-aa");
        expect(loginConfig.subscriptionId).toBe("subscription-id-aa");
    });

    test('validate with wrong environment', async () => {
        setEnv('environment', 'aWrongCloud');
        setEnv('enable-AzPSSession', 'false');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');

        setEnv('tenant-id', 'tenant-id');
        setEnv('subscription-id', 'subscription-id');
        setEnv('client-id', 'client-id');

        let loginConfig = new LoginConfig();
        await loginConfig.initialize();
        testValidateWithErrorMessage(loginConfig, "Unsupported value 'awrongcloud' for environment is passed.");
    });

    test('validate with wrong authType', async () => {
        setEnv('environment', 'azurestack');
        setEnv('enable-AzPSSession', 'false');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE-PRINCIPAL');

        setEnv('tenant-id', 'tenant-id');
        setEnv('subscription-id', 'subscription-id');
        setEnv('client-id', 'client-id');

        let loginConfig = new LoginConfig();
        await loginConfig.initialize();
        testValidateWithErrorMessage(loginConfig, "Unsupported value 'SERVICE-PRINCIPAL' for authentication type is passed.");
    });

    test('validate with SERVICE_PRINCIPAL, lack of tenant id', async () => {
        setEnv('environment', 'azurestack');
        setEnv('enable-AzPSSession', 'false');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');

        // setEnv('tenant-id', 'tenant-id');
        setEnv('subscription-id', 'subscription-id');
        setEnv('client-id', 'client-id');

        let loginConfig = new LoginConfig();
        await loginConfig.initialize();
        testValidateWithErrorMessage(loginConfig, "Using auth-type: SERVICE_PRINCIPAL. Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied.");
    });

    test('validate with SERVICE_PRINCIPAL, lack of client id', async () => {
        setEnv('environment', 'azurestack');
        setEnv('enable-AzPSSession', 'false');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'SERVICE_PRINCIPAL');

        setEnv('tenant-id', 'tenant-id');
        setEnv('subscription-id', 'subscription-id');
        // setEnv('client-id', 'client-id');

        let loginConfig = new LoginConfig();
        await loginConfig.initialize();
        testValidateWithErrorMessage(loginConfig, "Using auth-type: SERVICE_PRINCIPAL. Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied.");
    });

    test('validate without subscriptionId and allowNoSubscriptionsLogin=false', async () => {
        setEnv('environment', 'azurestack');
        setEnv('enable-AzPSSession', 'false');
        setEnv('allow-no-subscriptions', 'false');
        setEnv('auth-type', 'IDENTITY');

        // setEnv('subscription-id', 'subscription-id');

        let loginConfig = new LoginConfig();
        await loginConfig.initialize();
        testValidateWithErrorMessage(loginConfig, "Ensure 'subscription-id' is supplied or 'allow-no-subscriptions' is 'true'.");
    });

    test('validate without subscriptionId and allowNoSubscriptionsLogin=true', async () => {
        setEnv('environment', 'azurestack');
        setEnv('enable-AzPSSession', 'true');
        setEnv('allow-no-subscriptions', 'true');
        setEnv('auth-type', 'IDENTITY');

        // setEnv('subscription-id', 'subscription-id');

        let loginConfig = new LoginConfig();
        await loginConfig.initialize();
        loginConfig.validate();
        expect(loginConfig.environment).toBe("azurestack");
        expect(loginConfig.enableAzPSSession).toBeTruthy();
        expect(loginConfig.allowNoSubscriptionsLogin).toBeTruthy();
        expect(loginConfig.authType).toBe("IDENTITY");
        expect(loginConfig.servicePrincipalId).toBe("");
        expect(loginConfig.servicePrincipalSecret).toBeNull();
        expect(loginConfig.tenantId).toBe("");
        expect(loginConfig.subscriptionId).toBe("");
    });

});