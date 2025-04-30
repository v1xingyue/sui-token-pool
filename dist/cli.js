#!/usr/bin/env node
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
const commander_1 = require("commander");
const utils_1 = require("./utils");
const config_1 = require("./config");
const package_1 = require("./commands/package");
const token_1 = require("./commands/token");
const cetus_1 = __importDefault(require("./commands/cetus"));
const account_1 = __importDefault(require("./commands/account"));
// Check for sui installation
if (!config_1.isDevelopment) {
    const suiPath = (0, utils_1.getSuiPath)();
    if (!suiPath) {
        config_1.logger.error("sui not found, please install sui first, https://docs.sui.io/guides/developer/getting-started/sui-install");
        process.exit(1);
    }
}
// Ensure required directories exist
(0, config_1.ensureDirectories)();
const program = new commander_1.Command();
program.version("1.0.0").option("-s, --start-path <path>", "move start path");
program
    .command("new-package")
    .option("-n, --name <name>", "move package name")
    .description("new move package")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, package_1.handleNewPackage)(options, config_1.paths.start);
    }
    catch (error) {
        process.exit(1);
    }
}));
program
    .command("build")
    .description("build move project")
    .option("-p, --package <package>", "move package name")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, package_1.handleBuildPackage)(options, config_1.paths.start);
    }
    catch (error) {
        process.exit(1);
    }
}));
program
    .command("publish")
    .option("-p, --package <package>", "move package name")
    .option("-b, --build", "build move project before publish")
    .description("publish move project")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, package_1.handlePublishPackage)(options, config_1.paths.start);
    }
    catch (error) {
        process.exit(1);
    }
}));
program
    .command("upgrade")
    .option("-p, --package <package>", "move package name")
    .option("-b, --build", "build move project before upgrade")
    .description("upgrade move project")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, package_1.handleUpgradePackage)(options, config_1.paths.start);
    }
    catch (error) {
        process.exit(1);
    }
}));
program
    .command("new-token")
    .description("new token")
    .option("-n, --name <name>", "token name")
    .option("-d, --decimals <number>", "token decimals")
    .option("-i, --initialSupply <number>", "token initial supply")
    .option("-p, --package <package>", "move package name")
    .option("--token-symbol <tokenSymbol>", "token symbol")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, token_1.handleNewToken)(options, config_1.paths.start);
    }
    catch (error) {
        process.exit(1);
    }
}));
program.addCommand(cetus_1.default);
program.addCommand(account_1.default);
// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
    config_1.logger.error("Unhandled promise rejection:", error);
    process.exit(1);
});
program.parse(process.argv);
