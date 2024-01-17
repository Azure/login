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
exports.cleanupAzPSAccounts = exports.cleanupAzCLIAccounts = exports.setUserAgent = void 0;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const crypto = __importStar(require("crypto"));
const AzPSUtils_1 = require("../PowerShell/AzPSUtils");
function setUserAgent() {
    let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
    let actionName = 'AzureLogin';
    process.env.AZURE_HTTP_USER_AGENT = (!!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT} ` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
    process.env.AZUREPS_HOST_ENVIRONMENT = (!!process.env.AZUREPS_HOST_ENVIRONMENT ? `${process.env.AZUREPS_HOST_ENVIRONMENT} ` : '') + `GITHUBACTIONS/${actionName}@v1_${usrAgentRepo}`;
}
exports.setUserAgent = setUserAgent;
function cleanupAzCLIAccounts() {
    return __awaiter(this, void 0, void 0, function* () {
        let azPath = yield io.which("az", true);
        core.debug(`Azure CLI path: ${azPath}`);
        core.info("Clearing azure cli accounts from the local cache.");
        yield exec.exec(`"${azPath}"`, ["account", "clear"]);
    });
}
exports.cleanupAzCLIAccounts = cleanupAzCLIAccounts;
function cleanupAzPSAccounts() {
    return __awaiter(this, void 0, void 0, function* () {
        let psPath = yield io.which(AzPSUtils_1.AzPSConstants.PowerShell_CmdName, true);
        core.debug(`PowerShell path: ${psPath}`);
        core.debug("Importing Azure PowerShell module.");
        AzPSUtils_1.AzPSUtils.setPSModulePathForGitHubRunner();
        yield AzPSUtils_1.AzPSUtils.importLatestAzAccounts();
        core.info("Clearing azure powershell accounts from the local cache.");
        yield exec.exec(`"${psPath}"`, ["-Command", "Clear-AzContext", "-Scope", "Process"]);
        yield exec.exec(`"${psPath}"`, ["-Command", "Clear-AzContext", "-Scope", "CurrentUser", "-Force", "-ErrorAction", "SilentlyContinue"]);
    });
}
exports.cleanupAzPSAccounts = cleanupAzPSAccounts;
