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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNewPackage = handleNewPackage;
exports.handleBuildPackage = handleBuildPackage;
exports.handlePublishPackage = handlePublishPackage;
exports.handleUpgradePackage = handleUpgradePackage;
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const spinner_1 = require("../config/spinner");
const utils_1 = require("../utils");
function handleNewPackage(options, defaultPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            spinner_1.spinner.start("Validating package parameters...");
            (0, config_1.validateRequiredParams)({ name: options.name }, ["name"]);
            spinner_1.spinner.update(`Creating new package: ${options.name}`);
            yield (0, utils_1.newPackage)(options.name, options.path || defaultPath);
            spinner_1.spinner.succeed(`Successfully created package: ${options.name}`);
        }
        catch (error) {
            spinner_1.spinner.fail("Failed to create new package");
            config_1.logger.error("Error details:", error);
            throw error;
        }
    });
}
function handleBuildPackage(options, startPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            spinner_1.spinner.start("Validating build parameters...");
            (0, config_1.validateRequiredParams)({ package: options.package }, ["package"]);
            spinner_1.spinner.update(`Building move package: ${options.package}`);
            const packagePath = path_1.default.join(startPath, options.package);
            yield (0, utils_1.buildMove)(packagePath);
            spinner_1.spinner.succeed(`Successfully built package: ${options.package}`);
        }
        catch (error) {
            spinner_1.spinner.fail("Failed to build package");
            config_1.logger.error("Error details:", error);
            throw error;
        }
    });
}
function handlePublishPackage(options, startPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            spinner_1.spinner.start("Validating publish parameters...");
            (0, config_1.validateRequiredParams)({ package: options.package }, ["package"]);
            const packagePath = path_1.default.join(startPath, options.package);
            if (options.build) {
                spinner_1.spinner.update("Building project before publish...");
                yield (0, utils_1.buildMove)(packagePath);
            }
            spinner_1.spinner.update(`Publishing move package: ${options.package}`);
            yield (0, utils_1.publishNew)(packagePath);
            spinner_1.spinner.succeed(`Successfully published package: ${options.package}`);
        }
        catch (error) {
            spinner_1.spinner.fail("Failed to publish package");
            config_1.logger.error("Error details:", error);
            throw error;
        }
    });
}
function handleUpgradePackage(options, startPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            spinner_1.spinner.start("Validating upgrade parameters...");
            (0, config_1.validateRequiredParams)({ package: options.package }, ["package"]);
            const packagePath = path_1.default.join(startPath, options.package);
            if (options.build) {
                spinner_1.spinner.update("Building project before upgrade...");
                yield (0, utils_1.buildMove)(packagePath);
            }
            spinner_1.spinner.update(`Upgrading move package: ${options.package}`);
            yield (0, utils_1.upgradeCurrent)(packagePath);
            const upgradeInfo = (0, utils_1.getUpgradeInfo)(packagePath);
            spinner_1.spinner.succeed("Upgrade completed successfully");
            config_1.logger.info("Upgrade details:", upgradeInfo);
        }
        catch (error) {
            spinner_1.spinner.fail("Failed to upgrade package");
            config_1.logger.error("Error details:", error);
            throw error;
        }
    });
}
