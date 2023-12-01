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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzPSLogin = void 0;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const AzPSScriptBuilder_1 = __importDefault(require("./AzPSScriptBuilder"));
const AzPSConstants_1 = __importDefault(require("./AzPSConstants"));
class AzPSLogin {
    constructor(loginConfig) {
        this.loginConfig = loginConfig;
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            core.info(`Running Azure PowerShell Login.`);
            this.setPSModulePathForGitHubRunner();
            yield this.importLatestAzAccounts();
            const [loginMethod, loginScript] = yield AzPSScriptBuilder_1.default.getAzPSLoginScript(this.loginConfig);
            core.info(`Attempting Azure PowerShell login by using ${loginMethod}...`);
            core.debug(`Azure PowerShell Login Script: ${loginScript}`);
            yield AzPSLogin.runPSScript(loginScript);
            console.log(`Running Azure PowerShell Login successfully.`);
        });
    }
    setPSModulePathForGitHubRunner() {
        const runner = process.env.RUNNER_OS || os.type();
        switch (runner.toLowerCase()) {
            case "linux":
                this.pushPSModulePath(AzPSConstants_1.default.DEFAULT_AZ_PATH_ON_LINUX);
                break;
            case "windows":
            case "windows_nt":
                this.pushPSModulePath(AzPSConstants_1.default.DEFAULT_AZ_PATH_ON_WINDOWS);
                break;
            case "macos":
            case "darwin":
                core.warning(`Skip setting the default PowerShell module path for OS ${runner.toLowerCase()}.`);
                break;
            default:
                core.warning(`Skip setting the default PowerShell module path for unknown OS ${runner.toLowerCase()}.`);
                break;
        }
    }
    pushPSModulePath(psModulePath) {
        process.env.PSModulePath = `${psModulePath}${path.delimiter}${process.env.PSModulePath}`;
        core.debug(`Set PSModulePath as ${process.env.PSModulePath}`);
    }
    importLatestAzAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            let importLatestAccountsScript = AzPSScriptBuilder_1.default.getImportLatestModuleScript(AzPSConstants_1.default.AzAccounts);
            core.debug(`The script to import the latest Az.Accounts: ${importLatestAccountsScript}`);
            let azAccountsPath = yield AzPSLogin.runPSScript(importLatestAccountsScript);
            core.debug(`The latest Az.Accounts used: ${azAccountsPath}`);
        });
    }
    static runPSScript(psScript) {
        return __awaiter(this, void 0, void 0, function* () {
            let outputString = "";
            let commandStdErr = false;
            const options = {
                silent: true,
                listeners: {
                    stdout: (data) => {
                        outputString += data.toString();
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
            let psPath = yield io.which(AzPSConstants_1.default.PowerShell_CmdName, true);
            yield exec.exec(`"${psPath}"`, ["-Command", psScript], options);
            if (commandStdErr) {
                throw new Error('Azure PowerShell login failed with errors.');
            }
            const result = JSON.parse(outputString.trim());
            console.log(result);
            if (!(result.Success)) {
                throw new Error(`Azure PowerShell login failed with error: ${result.Error}`);
            }
            return result.Result;
        });
    }
}
exports.AzPSLogin = AzPSLogin;
