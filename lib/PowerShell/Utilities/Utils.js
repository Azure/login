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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var os = require("os");
var Constants_1 = require("../Constants");
var ScriptBuilder_1 = require("./ScriptBuilder");
var PowerShellToolRunner_1 = require("./PowerShellToolRunner");
var Utils = /** @class */ (function () {
    function Utils() {
    }
    /**
     * Add the folder path where Az modules are present to PSModulePath based on runner
     *
     * @param azPSVersion
     *
     * If azPSVersion is empty, folder path in which all Az modules are present are set
     * If azPSVersion is not empty, folder path of exact Az module version is set
     *
     */
    Utils.setPSModulePath = function (azPSVersion) {
        if (azPSVersion === void 0) { azPSVersion = ""; }
        var modulePath = "";
        var runner = process.env.RUNNER_OS || os.type();
        switch (runner.toLowerCase()) {
            case "linux":
                modulePath = "/usr/share/" + azPSVersion + ":";
                break;
            case "windows":
            case "windows_nt":
                modulePath = "C:\\Modules\\" + azPSVersion + ";";
                break;
            case "macos":
            case "darwin":
                throw new Error("OS not supported");
            default:
                throw new Error("Unknown os: " + runner.toLowerCase());
        }
        process.env.PSModulePath = "" + modulePath + process.env.PSModulePath;
    };
    Utils.getLatestModule = function (moduleName) {
        return __awaiter(this, void 0, void 0, function () {
            var output, options, result, azLatestVersion;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        output = "";
                        options = {
                            listeners: {
                                stdout: function (data) {
                                    output += data.toString();
                                }
                            }
                        };
                        return [4 /*yield*/, PowerShellToolRunner_1["default"].init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, PowerShellToolRunner_1["default"].executePowerShellScriptBlock(new ScriptBuilder_1["default"]()
                                .getLatestModuleScript(moduleName), options)];
                    case 2:
                        _a.sent();
                        result = JSON.parse(output.trim());
                        if (!(Constants_1["default"].Success in result)) {
                            throw new Error(result[Constants_1["default"].Error]);
                        }
                        azLatestVersion = result[Constants_1["default"].AzVersion];
                        if (!Utils.isValidVersion(azLatestVersion)) {
                            throw new Error("Invalid AzPSVersion: " + azLatestVersion);
                        }
                        return [2 /*return*/, azLatestVersion];
                }
            });
        });
    };
    Utils.isValidVersion = function (version) {
        return !!version.match(Constants_1["default"].versionPattern);
    };
    return Utils;
}());
exports["default"] = Utils;
