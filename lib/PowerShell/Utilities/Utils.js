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
const os = __importStar(require("os"));
const Constants_1 = __importDefault(require("../Constants"));
const PowerShellToolRunner_1 = __importDefault(require("./PowerShellToolRunner"));
class Utils {
    static getLatestModule(moduleName) {
        return __awaiter(this, void 0, void 0, function* () {
            let output = "";
            let error = "";
            const options = {
                listeners: {
                    stdout: (data) => {
                        output += data.toString();
                    },
                    stderr: (data) => {
                        error += data.toString();
                    }
                }
            };
            yield PowerShellToolRunner_1.default.init();
            yield PowerShellToolRunner_1.default.executePowerShellCommand(`(Get-Module -Name ${moduleName} -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1).Version.ToString()`, options);
            if (!Utils.isValidVersion(output.trim())) {
                return "";
            }
            return output.trim();
        });
    }
    static isValidVersion(version) {
        return !!version.match(Constants_1.default.versionPattern);
    }
    static setPSModulePath(azPSVersion = "") {
        let modulePath = "";
        const runner = process.env.RUNNER_OS || os.type();
        switch (runner.toLowerCase()) {
            case "linux":
                modulePath = `/usr/share/${azPSVersion}:`;
                break;
            case "windows":
            case "windows_nt":
                modulePath = `C:\\Modules\\${azPSVersion};`;
                break;
            case "macos":
            case "darwin":
                // TODO: add modulepath
                break;
            default:
                throw new Error("Unknown os");
        }
        process.env.PSModulePath = `${modulePath}${process.env.PSModulePath}`;
    }
}
exports.default = Utils;
