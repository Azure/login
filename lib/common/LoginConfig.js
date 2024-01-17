"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginConfig = void 0;
const core = __importStar(require("@actions/core"));
const actions_secret_parser_1 = require("actions-secret-parser");
class LoginConfig {
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    readParametersFromCreds() {
        let creds = core.getInput('creds', { required: false });
        let secrets = creds ? new actions_secret_parser_1.SecretParser(creds, actions_secret_parser_1.FormatType.JSON) : null;
        if (!secrets) {
            return;
        }
        if (this.authType != LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL) {
            return;
        }
        if (this.servicePrincipalId || this.tenantId || this.subscriptionId) {
            core.warning("At least one of the parameters 'client-id', 'subscription-id' or 'tenant-id' is set. 'creds' will be ignored.");
            return;
        }
        core.debug('Reading creds in JSON...');
        this.servicePrincipalId = this.servicePrincipalId ? this.servicePrincipalId : secrets.getSecret("$.clientId", false);
        this.servicePrincipalSecret = secrets.getSecret("$.clientSecret", false);
        this.tenantId = this.tenantId ? this.tenantId : secrets.getSecret("$.tenantId", false);
        this.subscriptionId = this.subscriptionId ? this.subscriptionId : secrets.getSecret("$.subscriptionId", false);
        this.resourceManagerEndpointUrl = secrets.getSecret("$.resourceManagerEndpointUrl", false);
        if (!this.servicePrincipalId || !this.servicePrincipalSecret || !this.tenantId) {
            throw new Error("Not all parameters are provided in 'creds'. Double-check if all keys are defined in 'creds': 'clientId', 'clientSecret', 'tenantId'.");
        }
    }
    getFederatedToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.federatedToken = yield core.getIDToken(this.audience);
                this.mask(this.federatedToken);
            }
            catch (error) {
                core.error(`Please make sure to give write permissions to id-token in the workflow.`);
                throw error;
            }
            let [issuer, subjectClaim] = yield jwtParser(this.federatedToken);
            core.info("Federated token details:\n issuer - " + issuer + "\n subject claim - " + subjectClaim);
        });
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
            throw new Error("Ensure subscriptionId is supplied.");
        }
    }
    mask(parameterValue) {
        if (parameterValue) {
            core.setSecret(parameterValue);
        }
    }
}
exports.LoginConfig = LoginConfig;
LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL = "SERVICE_PRINCIPAL";
LoginConfig.AUTH_TYPE_IDENTITY = "IDENTITY";
LoginConfig.azureSupportedCloudName = new Set([
    "azureusgovernment",
    "azurechinacloud",
    "azuregermancloud",
    "azurecloud",
    "azurestack"
]);
LoginConfig.azureSupportedAuthType = new Set([
    LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL,
    LoginConfig.AUTH_TYPE_IDENTITY
]);
function jwtParser(federatedToken) {
    return __awaiter(this, void 0, void 0, function* () {
        let tokenPayload = federatedToken.split('.')[1];
        let bufferObj = Buffer.from(tokenPayload, "base64");
        let decodedPayload = JSON.parse(bufferObj.toString("utf8"));
        return [decodedPayload['iss'], decodedPayload['sub']];
    });
}
