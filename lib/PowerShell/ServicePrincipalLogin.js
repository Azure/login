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
const Utils_1 = __importDefault(require("PowerShell/Utilities/Utils"));
const PowerShellToolRunner_1 = __importDefault(require("PowerShell/Utilities/PowerShellToolRunner"));
const ScriptBuilder_1 = __importDefault(require("PowerShell/Utilities/ScriptBuilder"));
const Constants_1 = __importDefault(require("PowerShell/Constants"));
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
            const azLatestVersion = yield Utils_1.default.getLatestModule(Constants_1.default.moduleName);
            core.debug(`Az Module version used: ${azLatestVersion}`);
            Utils_1.default.setPSModulePath(`${Constants_1.default.prefix}${azLatestVersion}`);
        });
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            yield PowerShellToolRunner_1.default.init();
            const scriptBuilder = new ScriptBuilder_1.default();
            const script = scriptBuilder.getScript(ServicePrincipalLogin.scheme, this.tenantId, this.servicePrincipalId, this.servicePrincipalKey, this.subscriptionId, ServicePrincipalLogin.environment, ServicePrincipalLogin.scopeLevel);
            PowerShellToolRunner_1.default.executePowerShellCommand(script);
        });
    }
}
exports.default = ServicePrincipalLogin;
ServicePrincipalLogin.environment = Constants_1.default.environment;
ServicePrincipalLogin.scopeLevel = Constants_1.default.scopeLevel;
ServicePrincipalLogin.scheme = Constants_1.default.scheme;
