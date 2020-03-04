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
Object.defineProperty(exports, "__esModule", { value: true });
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
var psPath;
exports.initializeAz = (servicePrincipalId, servicePrincipalKey, tenantId, subscriptionId) => __awaiter(void 0, void 0, void 0, function* () {
    psPath = yield io.which("pwsh", true);
    setPSModulePath();
    yield loginToAzure(servicePrincipalId, servicePrincipalKey, tenantId, subscriptionId);
});
function setPSModulePath() {
    // TODO: get latest module/setup action
    let azPSVersion = "2.6.0";
    let modulePath = "";
    const runner = JSON.parse(process.env.RUNNER_CONTEXT);
    switch (runner.os) {
        case "Linux":
            modulePath = `/usr/share/az_${azPSVersion}:`;
            break;
        case "Windows":
            modulePath = `C:\\Modules\\az_${azPSVersion};`;
            break;
        case "macOS":
            // TODO: add modulepath
            break;
    }
    process.env.PSModulePath = `${modulePath}${process.env.PSModulePath}`;
}
function loginToAzure(servicePrincipalId, servicePrincipalKey, tenantId, subscriptionId) {
    return __awaiter(this, void 0, void 0, function* () {
        const environment = "AzureCloud";
        yield executePowerShellCommand(`Clear-AzContext -Scope Process`);
        yield executePowerShellCommand(`Clear-AzContext -Scope CurrentUser -Force -ErrorAction SilentlyContinue`);
        yield executePowerShellCommand(`Connect-AzAccount -ServicePrincipal -Tenant ${tenantId} -Credential \
                (New-Object System.Management.Automation.PSCredential('${servicePrincipalId}',(ConvertTo-SecureString ${servicePrincipalKey} -AsPlainText -Force))) \
                    -Environment ${environment}`);
        yield executePowerShellCommand(`Set-AzContext -SubscriptionId ${subscriptionId} -TenantId ${tenantId}`);
        yield executePowerShellCommand(`Get-AzContext`);
    });
}
function executePowerShellCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exec.exec(`"${psPath}" -Command "${command}"`, [], {});
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
