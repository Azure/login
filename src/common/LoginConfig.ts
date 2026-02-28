import * as core from '@actions/core';

export class LoginConfig {
    static readonly AUTH_TYPE_SERVICE_PRINCIPAL = "SERVICE_PRINCIPAL";
    static readonly AUTH_TYPE_IDENTITY = "IDENTITY";
    static readonly azureSupportedCloudName = new Set([
        "azureusgovernment",
        "azurechinacloud",
        "azuregermancloud",
        "azurecloud",
        "azurestack"]);

    static readonly azureSupportedAuthType = new Set([
        LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL,
        LoginConfig.AUTH_TYPE_IDENTITY]);

    authType: string;
    servicePrincipalId: string;
    servicePrincipalSecret: string;
    tenantId: string;
    subscriptionId: string;
    resourceManagerEndpointUrl: string;
    allowNoSubscriptionsLogin: boolean;
    environment: string;
    enableAzPSSession: boolean;
    audience: string;
    federatedToken: string;

    async initialize() {
        this.environment = core.getInput("environment").toLowerCase();
        this.enableAzPSSession = core.getInput('enable-AzPSSession').toLowerCase() === "true";
        this.allowNoSubscriptionsLogin = core.getInput('allow-no-subscriptions').toLowerCase() === "true";
        this.authType = core.getInput('auth-type').toUpperCase();

        this.servicePrincipalId = core.getInput('client-id', { required: false });
        this.servicePrincipalSecret = null;
        this.tenantId = core.getInput('tenant-id', { required: false });
        this.subscriptionId = core.getInput('subscription-id', { required: false });

        this.readParametersFromCreds();

        this.audience = core.getInput('audience', { required: false });
        this.federatedToken = null;

        this.mask(this.servicePrincipalId);
        this.mask(this.servicePrincipalSecret);
    }

    private readParametersFromCreds() {
        let creds = core.getInput('creds', { required: false });
        if (!creds) {
            return;
        }
        let secrets = JSON.parse(creds);

        if(this.authType != LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL){
            return;
        }

        if (this.servicePrincipalId || this.tenantId || this.subscriptionId) {
            core.warning("At least one of the parameters 'client-id', 'subscription-id' or 'tenant-id' is set. 'creds' will be ignored.");
            return;
        }

        core.debug('Reading creds in JSON...');
        this.servicePrincipalId = this.servicePrincipalId ? this.servicePrincipalId : secrets.clientId;
        this.servicePrincipalSecret = secrets.clientSecret;
        this.tenantId = this.tenantId ? this.tenantId : secrets.tenantId; 
        this.subscriptionId = this.subscriptionId ? this.subscriptionId : secrets.subscriptionId;
        this.resourceManagerEndpointUrl = secrets.resourceManagerEndpointUrl;
        if (!this.servicePrincipalId || !this.servicePrincipalSecret || !this.tenantId) {
            throw new Error("Not all parameters are provided in 'creds'. Double-check if all keys are defined in 'creds': 'clientId', 'clientSecret', 'tenantId'.");
        }
    }

    async getFederatedToken() {
        try {
            this.federatedToken = await core.getIDToken(this.audience);
            this.mask(this.federatedToken);
        }
        catch (error) {
            core.error("Failed to fetch federated token from GitHub. Please make sure to give write permissions to id-token in the workflow.");
            throw error;
        }
        try {
            let [issuer, subjectClaim, audience, jobWorkflowRef] = await jwtParser(this.federatedToken);
            core.info("Federated token details:\n issuer - " + issuer + "\n subject claim - " + subjectClaim + "\n audience - " + audience + "\n job_workflow_ref - " + jobWorkflowRef);
        }
        catch (error) {
            core.warning(`Failed to parse the federated token. Error: ${error}`);
        }
    }

    validate() {
        if (!LoginConfig.azureSupportedCloudName.has(this.environment)) {
            throw new Error(`Unsupported value '${this.environment}' for environment is passed. The list of supported values for environment are '${Array.from(LoginConfig.azureSupportedCloudName).join("', '")}'. `);
        }
        if (!LoginConfig.azureSupportedAuthType.has(this.authType)) {
            throw new Error(`Unsupported value '${this.authType}' for authentication type is passed. The list of supported values for auth-type are '${Array.from(LoginConfig.azureSupportedAuthType).join("', '")}'.`);
        }
        if (this.authType === LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL) {
            if (!this.servicePrincipalId || !this.tenantId) {
                throw new Error(`Using auth-type: ${LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL}. Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied.`);
            }
        }
        if (!this.subscriptionId && !this.allowNoSubscriptionsLogin) {
            throw new Error("Ensure 'subscription-id' is supplied or 'allow-no-subscriptions' is 'true'.");
        }
    }

    mask(parameterValue: string) {
        if (parameterValue) {
            core.setSecret(parameterValue);
        }
    }
}

async function jwtParser(federatedToken: string) {
    let tokenPayload = federatedToken.split('.')[1];
    let bufferObj = Buffer.from(tokenPayload, "base64");
    let decodedPayload = JSON.parse(bufferObj.toString("utf8"));
    const JWT_CLAIM_ISSUER = 'iss';
    const JWT_CLAIM_SUBJECT = 'sub';
    const JWT_CLAIM_AUDIENCE = 'aud';
    const JWT_CLAIM_JOB_WORKFLOW_REF = 'job_workflow_ref';
    const requiredClaims = [
        JWT_CLAIM_ISSUER,
        JWT_CLAIM_SUBJECT,
        JWT_CLAIM_AUDIENCE,
        JWT_CLAIM_JOB_WORKFLOW_REF
    ];
    for (const claim of requiredClaims) {
        if (!decodedPayload[claim]) {
            throw new Error(`The claim '${claim}' is missing from the token payload`);
        }
    }
    return [decodedPayload[JWT_CLAIM_ISSUER], decodedPayload[JWT_CLAIM_SUBJECT], decodedPayload[JWT_CLAIM_AUDIENCE], decodedPayload[JWT_CLAIM_JOB_WORKFLOW_REF]];   
}   
