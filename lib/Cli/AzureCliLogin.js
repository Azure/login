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
exports.AzureCliLogin = void 0;
const exec = __importStar(require("@actions/exec"));
const LoginConfig_1 = require("../common/LoginConfig");
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
class AzureCliLogin {
    constructor(loginConfig) {
        this.loginConfig = loginConfig;
        this.loginOptions = defaultExecOptions();
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            core.info(`Running Azure CLI Login.`);
            this.azPath = yield io.which("az", true);
            core.debug(`Azure CLI path: ${this.azPath}`);
            let output = "";
            const execOptions = {
                listeners: {
                    stdout: (data) => {
                        output += data.toString();
                    }
                }
            };
            yield this.executeAzCliCommand(["--version"], true, execOptions);
            core.debug(`Azure CLI version used:\n${output}`);
            this.setAzurestackEnvIfNecessary();
            yield this.executeAzCliCommand(["cloud", "set", "-n", this.loginConfig.environment], false);
            core.info(`Done setting cloud: "${this.loginConfig.environment}"`);
            if (this.loginConfig.authType === LoginConfig_1.LoginConfig.AUTH_TYPE_SERVICE_PRINCIPAL) {
                let args = ["--service-principal",
                    "--username", this.loginConfig.servicePrincipalId,
                    "--tenant", this.loginConfig.tenantId
                ];
                if (this.loginConfig.servicePrincipalSecret) {
                    yield this.loginWithSecret(args);
                }
                else {
                    yield this.loginWithOIDC(args);
                }
            }
            else {
                let args = ["--identity"];
                if (this.loginConfig.servicePrincipalId) {
                    yield this.loginWithUserAssignedIdentity(args);
                }
                else {
                    yield this.loginWithSystemAssignedIdentity(args);
                }
            }
        });
    }
    setAzurestackEnvIfNecessary() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.loginConfig.environment != "azurestack") {
                return;
            }
            if (!this.loginConfig.resourceManagerEndpointUrl) {
                throw new Error("resourceManagerEndpointUrl is a required parameter when environment is defined.");
            }
            core.info(`Unregistering cloud: "${this.loginConfig.environment}" first if it exists`);
            try {
                yield this.executeAzCliCommand(["cloud", "set", "-n", "AzureCloud"], true);
                yield this.executeAzCliCommand(["cloud", "unregister", "-n", this.loginConfig.environment], false);
            }
            catch (error) {
                core.info(`Ignore cloud not registered error: "${error}"`);
            }
            core.info(`Registering cloud: "${this.loginConfig.environment}" with ARM endpoint: "${this.loginConfig.resourceManagerEndpointUrl}"`);
            try {
                let baseUri = this.loginConfig.resourceManagerEndpointUrl;
                if (baseUri.endsWith('/')) {
                    baseUri = baseUri.substring(0, baseUri.length - 1); // need to remove trailing / from resourceManagerEndpointUrl to correctly derive suffixes below
                }
                let suffixKeyvault = ".vault" + baseUri.substring(baseUri.indexOf('.')); // keyvault suffix starts with .
                let suffixStorage = baseUri.substring(baseUri.indexOf('.') + 1); // storage suffix starts without .
                let profileVersion = "2019-03-01-hybrid";
                yield this.executeAzCliCommand(["cloud", "register", "-n", this.loginConfig.environment, "--endpoint-resource-manager", `"${this.loginConfig.resourceManagerEndpointUrl}"`, "--suffix-keyvault-dns", `"${suffixKeyvault}"`, "--suffix-storage-endpoint", `"${suffixStorage}"`, "--profile", `"${profileVersion}"`], false);
            }
            catch (error) {
                core.error(`Error while trying to register cloud "${this.loginConfig.environment}"`);
                throw error;
            }
            core.info(`Done registering cloud: "${this.loginConfig.environment}"`);
        });
    }
    loginWithSecret(args) {
        return __awaiter(this, void 0, void 0, function* () {
            core.info("Note: Azure/login action also supports OIDC login mechanism. Refer https://github.com/azure/login#configure-a-service-principal-with-a-federated-credential-to-use-oidc-based-authentication for more details.");
            args.push(`--password=${this.loginConfig.servicePrincipalSecret}`);
            yield this.callCliLogin(args, 'service principal with secret');
        });
    }
    loginWithOIDC(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loginConfig.getFederatedToken();
            args.push("--federated-token", this.loginConfig.federatedToken);
            yield this.callCliLogin(args, 'OIDC');
        });
    }
    loginWithUserAssignedIdentity(args) {
        return __awaiter(this, void 0, void 0, function* () {
            args.push("--username", this.loginConfig.servicePrincipalId);
            yield this.callCliLogin(args, 'user-assigned managed identity');
        });
    }
    loginWithSystemAssignedIdentity(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.callCliLogin(args, 'system-assigned managed identity');
        });
    }
    callCliLogin(args, methodName) {
        return __awaiter(this, void 0, void 0, function* () {
            core.info(`Attempting Azure CLI login by using ${methodName}...`);
            args.unshift("login");
            if (this.loginConfig.allowNoSubscriptionsLogin) {
                args.push("--allow-no-subscriptions");
            }
            yield this.executeAzCliCommand(args, true, this.loginOptions);
            if (this.loginConfig.subscriptionId) {
                yield this.setSubscription();
            }
            core.info(`Azure CLI login succeeds by using ${methodName}.`);
        });
    }
    setSubscription() {
        return __awaiter(this, void 0, void 0, function* () {
            let args = ["account", "set", "--subscription", this.loginConfig.subscriptionId];
            yield this.executeAzCliCommand(args, true, this.loginOptions);
            core.info("Subscription is set successfully.");
        });
    }
    executeAzCliCommand(args, silent, execOptions = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            execOptions.silent = !!silent;
            yield exec.exec(`"${this.azPath}"`, args, execOptions);
        });
    }
}
exports.AzureCliLogin = AzureCliLogin;
function defaultExecOptions() {
    return {
        silent: true,
        listeners: {
            stderr: (data) => {
                let error = data.toString();
                let startsWithWarning = error.toLowerCase().startsWith('warning');
                let startsWithError = error.toLowerCase().startsWith('error');
                // printing ERROR
                if (error && error.trim().length !== 0 && !startsWithWarning) {
                    if (startsWithError) {
                        //removing the keyword 'ERROR' to avoid duplicates while throwing error
                        error = error.slice(7);
                    }
                    core.error(error);
                }
            }
        }
    };
}
