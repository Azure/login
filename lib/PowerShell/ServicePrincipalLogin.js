"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const Utils_1 = __importDefault(require("./Utilities/Utils"));
const PowerShellToolRunner_1 = __importDefault(require("./Utilities/PowerShellToolRunner"));
const ScriptBuilder_1 = __importDefault(require("./Utilities/ScriptBuilder"));
const Constants_1 = __importDefault(require("./Constants"));
class ServicePrincipalLogin {
    constructor(servicePrincipalId, servicePrincipalKey, tenantId, subscriptionId) {
        this.servicePrincipalId = servicePrincipalId;
        this.servicePrincipalKey = servicePrincipalKey;
        this.tenantId = tenantId;
        this.subscriptionId = subscriptionId;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            Utils_1.default.setPSModulePath();
            const script = new ScriptBuilder_1.default().getLatestModuleScript(Constants_1.default.moduleName);
            const outputJson = yield this.getLatestModule(script);
            const azLatestVersion = outputJson.Constants.AzPSVersion;
            if (!(Constants_1.default.Success in outputJson) || !Utils_1.default.isValidVersion(azLatestVersion)) {
                throw new Error(`Invalid AzPSVersion: ${azLatestVersion}`);
            }
            core.debug(`Az Module version used: ${azLatestVersion}`);
            Utils_1.default.setPSModulePath(`${Constants_1.default.prefix}${azLatestVersion}`);
        });
    }
    getLatestModule(script) {
        return __awaiter(this, void 0, void 0, function* () {
            let output = "";
            const options = {
                listeners: {
                    stdout: (data) => {
                        output += data.toString();
                    }
                }
            };
            yield PowerShellToolRunner_1.default.init();
            yield PowerShellToolRunner_1.default.executePowerShellCommand(script, options);
            return JSON.parse(output.trim());
        });
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            let output = "";
            const options = {
                listeners: {
                    stdout: (data) => {
                        output += data.toString();
                    }
                }
            };
            const args = {
                servicePrincipalId: this.servicePrincipalId,
                servicePrincipalKey: this.servicePrincipalKey,
                subscriptionId: this.subscriptionId,
                environment: ServicePrincipalLogin.environment,
                scopeLevel: ServicePrincipalLogin.scopeLevel
            };
            const script = new ScriptBuilder_1.default().getAzPSLoginScript(ServicePrincipalLogin.scheme, this.tenantId, args);
            yield PowerShellToolRunner_1.default.init();
            yield PowerShellToolRunner_1.default.executePowerShellCommand(script, options);
            const outputJson = JSON.parse(output.trim());
            if (!(Constants_1.default.Success in outputJson)) {
                throw new Error(`Azure PowerShell login failed with error: ${outputJson.Constants.Error}`);
            }
        });
    }
}
exports.ServicePrincipalLogin = ServicePrincipalLogin;
ServicePrincipalLogin.environment = Constants_1.default.AzureCloud;
ServicePrincipalLogin.scopeLevel = Constants_1.default.Subscription;
ServicePrincipalLogin.scheme = Constants_1.default.ServicePrincipal;
