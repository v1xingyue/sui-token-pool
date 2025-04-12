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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const startPath = "./move";
const suiPath = (0, utils_1.getSuiPath)();
if (!suiPath) {
    console.error("sui not found, please install sui first, https://docs.sui.io/guides/developer/getting-started/sui-install");
    process.exit(1);
}
if (!fs_1.default.existsSync(startPath)) {
    fs_1.default.mkdirSync(startPath);
}
const program = new commander_1.Command();
program.version("1.0.0").option("-s, --start-path <path>", "move start path");
program
    .command("new-package")
    .option("-n, --name <name>", "move package name")
    .description("new move package")
    .action((_a) => __awaiter(void 0, [_a], void 0, function* ({ name }) {
    yield (0, utils_1.newPackage)(name, "./move");
}));
program
    .command("build")
    .description("build move project")
    .option("-p, --package <package>", "move package name")
    .action((_a) => __awaiter(void 0, [_a], void 0, function* ({ package: packageName }) {
    console.log(`you will build move package: ${packageName}`);
    const packagePath = path_1.default.join(startPath, packageName);
    yield (0, utils_1.buildMove)(packagePath);
}));
program
    .command("publish")
    .option("-p, --package <package>", "move package name")
    .option("-b, --build", "build move project before publish")
    .description("publish move project")
    .action((_a) => __awaiter(void 0, [_a], void 0, function* ({ package: packageName, build }) {
    console.log(`you will publish move package: ${packageName}`);
    const packagePath = path_1.default.join(startPath, packageName);
    if (build) {
        console.log("you will build project before publish");
        yield (0, utils_1.buildMove)(packagePath);
    }
    yield (0, utils_1.publishNew)(packagePath);
}));
program
    .command("upgrade")
    .option("-p, --package <package>", "move package name")
    .option("-b, --build", "build move project before upgrade")
    .description("upgrade move project")
    .action((_a) => __awaiter(void 0, [_a], void 0, function* ({ package: packageName, build }) {
    console.log(`you will upgrade move package: ${packageName}`);
    const packagePath = path_1.default.join(startPath, packageName);
    if (build) {
        console.log("you will build project before upgrade");
        yield (0, utils_1.buildMove)(packagePath);
    }
    yield (0, utils_1.upgradeCurrent)(packagePath);
    console.log("upgrade move project done");
    const upgradeInfo = (0, utils_1.getUpgradeInfo)(packagePath);
    console.log(upgradeInfo);
}));
program
    .command("new-token")
    .description("new token")
    .option("-n, --name <name>", "token name")
    .option("-s, --symbol <symbol>", "token symbol")
    .option("-d, --decimals <decimals>", "token decimals")
    .option("-i, --initialSupply <initialSupply>", "token initial supply")
    .option("-p, --package <package>", "move package name")
    .action((_a) => __awaiter(void 0, [_a], void 0, function* ({ name, symbol, decimals, initialSupply, package: packagePath }) {
    console.log(`you will create new token: ${name}`);
    yield (0, utils_1.newToken)({
        name,
        symbol,
        decimals,
        initialSupply,
    }, startPath);
}));
program.parse(process.argv);
