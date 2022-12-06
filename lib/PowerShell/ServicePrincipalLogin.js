"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicePrincipalLogin = void 0;
const core = __importStar(require("@actions/core"));
const Utils_1 = __importDefault(require("./Utilities/Utils"));
const PowerShellToolRunner_1 = __importDefault(require("./Utilities/PowerShellToolRunner"));
const ScriptBuilder_1 = __importDefault(require("./Utilities/ScriptBuilder"));
const Constants_1 = __importDefault(require("./Constants"));
class ServicePrincipalLogin {
    constructor(servicePrincipalId, servicePrincipalKey, federatedToken, tenantId, subscriptionId, allowNoSubscriptionsLogin, environment, resourceManagerEndpointUrl) {
        this.servicePrincipalId = servicePrincipalId;
        this.servicePrincipalKey = servicePrincipalKey;
        this.federatedToken = federatedToken;
        this.tenantId = tenantId;
        this.subscriptionId = subscriptionId;
        this.environment = environment;
        this.resourceManagerEndpointUrl = resourceManagerEndpointUrl;
        this.allowNoSubscriptionsLogin = allowNoSubscriptionsLogin;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            Utils_1.default.setPSModulePath();
            const azLatestVersion = yield Utils_1.default.getLatestModule(Constants_1.default.moduleName);
            core.debug(`Az Module version used: ${azLatestVersion}`);
            Utils_1.default.setPSModulePath(`${Constants_1.default.prefix}${azLatestVersion}`);
        });
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            let output = "";
            let commandStdErr = false;
            const options = {
                listeners: {
                    stdout: (data) => {
                        output += data.toString();
                    },
                    stderr: (data) => {
                        let error = data.toString();
                        if (error && error.trim().length !== 0) {
                            commandStdErr = true;
                            core.error(error);
                        }
                    }
                }
            };
            const args = {
                servicePrincipalId: this.servicePrincipalId,
                servicePrincipalKey: this.servicePrincipalKey,
                federatedToken: this.federatedToken,
                subscriptionId: this.subscriptionId,
                environment: this.environment,
                scopeLevel: ServicePrincipalLogin.scopeLevel,
                allowNoSubscriptionsLogin: this.allowNoSubscriptionsLogin,
                resourceManagerEndpointUrl: this.resourceManagerEndpointUrl
            };
            const script = new ScriptBuilder_1.default().getAzPSLoginScript(ServicePrincipalLogin.scheme, this.tenantId, args);
            yield PowerShellToolRunner_1.default.init();
            yield PowerShellToolRunner_1.default.executePowerShellScriptBlock(script, options);
            const result = JSON.parse(output.trim());
            if (!(Constants_1.default.Success in result)) {
                throw new Error(`Azure PowerShell login failed with error: ${result[Constants_1.default.Error]}`);
            }
            console.log(`Azure PowerShell session successfully initialized`);
        });
    }
}
exports.ServicePrincipalLogin = ServicePrincipalLogin;
ServicePrincipalLogin.scopeLevel = Constants_1.default.Subscription;
ServicePrincipalLogin.scheme = Constants_1.default.ServicePrincipal;
