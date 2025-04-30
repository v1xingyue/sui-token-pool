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
exports.getSuiPath = exports.newPackage = exports.newToken = exports.getUpgradeInfo = exports.upgradeCurrent = exports.getUpdateCap = exports.getPublishedPackage = exports.publishNew = exports.buildMoveAsJson = exports.buildMove = void 0;
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const buildMove = (packagePath) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("build move package: ", packagePath);
    (0, child_process_1.execSync)(`sui move build --skip-fetch-latest-git-deps`, {
        cwd: packagePath,
        stdio: "inherit",
    });
});
exports.buildMove = buildMove;
const buildMoveAsJson = (buildPath) => __awaiter(void 0, void 0, void 0, function* () {
    const p = buildPath;
    const output = (0, child_process_1.execSync)(`sui move build --path ${p} --dump-bytecode-as-base64 --skip-fetch-latest-git-deps`, {
        cwd: p,
        stdio: "pipe",
    });
    fs_1.default.writeFileSync(path_1.default.join(p, "build.json"), output);
});
exports.buildMoveAsJson = buildMoveAsJson;
const publishNew = (packagePath) => __awaiter(void 0, void 0, void 0, function* () {
    const output = (0, child_process_1.execSync)(`sui client publish --gas-budget 100000000 --skip-dependency-verification --json`, {
        cwd: packagePath,
        stdio: "pipe", // capture all output
    });
    if (output) {
        const outputStr = output.toString();
        console.log("Publishing output:", outputStr);
        fs_1.default.writeFileSync(path_1.default.join(packagePath, "deploy.json"), outputStr);
    }
});
exports.publishNew = publishNew;
const getPublishedPackage = (deploy) => {
    const info = deploy.objectChanges.filter((change) => change.type === "published")[0];
    return {
        packageId: info.packageId,
        version: info.version,
        digest: info.digest,
        modules: info.modules,
    };
};
exports.getPublishedPackage = getPublishedPackage;
const getUpdateCap = (deploy) => {
    const info = (0, exports.getPublishedPackage)(deploy);
    const packageId = info.packageId;
    const updateCap = deploy.objectChanges.filter((change) => change.type === "created" &&
        change.objectType === "0x2::package::UpgradeCap")[0];
    return {
        packageId,
        updateCap,
    };
};
exports.getUpdateCap = getUpdateCap;
const upgradeCurrent = (packagePath) => __awaiter(void 0, void 0, void 0, function* () {
    const deploy = JSON.parse(fs_1.default.readFileSync(path_1.default.join(packagePath, "deploy.json"), "utf-8"));
    const info = (0, exports.getUpdateCap)(deploy);
    console.log(`update cap : ${JSON.stringify(info.updateCap)}`);
    try {
        const output = (0, child_process_1.execSync)(`sui client upgrade --gas-budget 100000000 --upgrade-capability ${info.updateCap.objectId} --skip-dependency-verification --json 2>&1`, // Redirect stderr to stdout
        {
            cwd: packagePath,
            encoding: "utf-8",
        });
        if (output && output.trim()) {
            // Try to parse the output to get the JSON part
            const jsonMatch = output.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                console.log("Found JSON output");
                fs_1.default.writeFileSync(path_1.default.join(packagePath, "upgrade.json"), jsonStr);
            }
            else {
                console.log("No JSON found in output");
                fs_1.default.writeFileSync(path_1.default.join(packagePath, "upgrade.json"), output);
            }
        }
        else {
            console.log("No output received from upgrade command");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error during upgrade:", error.message);
            // Try to extract JSON from error output if available
            const errorOutput = error.message || "";
            const jsonMatch = errorOutput.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonStr = jsonMatch[0];
                console.log("Found JSON in error output");
                fs_1.default.writeFileSync(path_1.default.join(packagePath, "upgrade.json"), jsonStr);
            }
        }
        throw error;
    }
});
exports.upgradeCurrent = upgradeCurrent;
const getUpgradeInfo = (packagePath) => {
    const upgrade = JSON.parse(fs_1.default.readFileSync(path_1.default.join(packagePath, "upgrade.json"), "utf-8"));
    return upgrade;
};
exports.getUpgradeInfo = getUpgradeInfo;
const newToken = (options, startPath) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`You will create new token: ${JSON.stringify(options)}`);
    (0, child_process_1.execSync)(`sui move new ${options.name.toLowerCase()}`, {
        cwd: startPath,
        stdio: "inherit",
    });
    const tokenPath = path_1.default.join(startPath, options.name.toLowerCase());
    const newTokenMoveCode = `

// this is auto generated code to create a new token

module ${options.name.toLowerCase()}::token;
use sui::coin::{Self, TreasuryCap};

public struct AdminCap has key {
    id: UID,
}

public struct TOKEN has drop {}

fun init(witness: TOKEN, ctx: &mut TxContext) {
    let sender = ctx.sender();
    let (mut treasury, metadata) = coin::create_currency(
        witness,
        ${options.decimals},
        b"${options.symbol}",
        b"${options.symbol}",
        b"${options.symbol}",
        option::none(),
        ctx,
	);
	
  let admin_cap = AdminCap {
      id: object::new(ctx),
  };

  transfer::transfer(admin_cap, sender);

  mint_once(&mut treasury, ${options.initialSupply}, sender, ctx);
  transfer::public_freeze_object(metadata);
	transfer::public_transfer(treasury, sender);
}

fun mint_once(
    treasury_cap: &mut TreasuryCap<TOKEN>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
	let coin = coin::mint(treasury_cap, amount, ctx);
	transfer::public_transfer(coin, recipient)
}

`;
    fs_1.default.writeFileSync(path_1.default.join(tokenPath, `sources/${options.name.toLowerCase()}.move`), newTokenMoveCode);
    yield (0, exports.buildMove)(tokenPath);
    yield (0, exports.publishNew)(tokenPath);
});
exports.newToken = newToken;
const newPackage = (packageName, startPath) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`You will create new move package: ${packageName} ,path is ${startPath}/${packageName}`);
    (0, child_process_1.execSync)(`sui move new ${packageName}`, {
        cwd: startPath,
        stdio: "inherit",
    });
});
exports.newPackage = newPackage;
const getSuiPath = () => {
    try {
        const output = (0, child_process_1.execSync)("which sui", { stdio: "pipe" });
        return output.toString().trim();
    }
    catch (error) {
        return null;
    }
};
exports.getSuiPath = getSuiPath;
