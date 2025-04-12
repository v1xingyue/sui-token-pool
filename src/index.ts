#!/usr/bin/env node

import { Command } from "commander";
import {
  publishNew,
  upgradeCurrent,
  buildMove,
  getUpgradeInfo,
  newToken,
  newPackage,
  getSuiPath,
} from "./utils";
import fs from "fs";
import path from "path";

const startPath = "./move";

const suiPath = getSuiPath();
if (!suiPath) {
  console.error(
    "sui not found, please install sui first, https://docs.sui.io/guides/developer/getting-started/sui-install"
  );
  process.exit(1);
}

if (!fs.existsSync(startPath)) {
  fs.mkdirSync(startPath);
}

const program = new Command();

program.version("1.0.0").option("-s, --start-path <path>", "move start path");

program
  .command("new-package")
  .option("-n, --name <name>", "move package name")
  .description("new move package")
  .action(async ({ name }) => {
    await newPackage(name, "./move");
  });

program
  .command("build")
  .description("build move project")
  .option("-p, --package <package>", "move package name")
  .action(async ({ package: packageName }) => {
    console.log(`you will build move package: ${packageName}`);
    const packagePath = path.join(startPath, packageName);
    await buildMove(packagePath);
  });

program
  .command("publish")
  .option("-p, --package <package>", "move package name")
  .option("-b, --build", "build move project before publish")
  .description("publish move project")
  .action(async ({ package: packageName, build }) => {
    console.log(`you will publish move package: ${packageName}`);
    const packagePath = path.join(startPath, packageName);
    if (build) {
      console.log("you will build project before publish");
      await buildMove(packagePath);
    }
    await publishNew(packagePath);
  });

program
  .command("upgrade")
  .option("-p, --package <package>", "move package name")
  .option("-b, --build", "build move project before upgrade")
  .description("upgrade move project")
  .action(async ({ package: packageName, build }) => {
    console.log(`you will upgrade move package: ${packageName}`);
    const packagePath = path.join(startPath, packageName);
    if (build) {
      console.log("you will build project before upgrade");
      await buildMove(packagePath);
    }
    await upgradeCurrent(packagePath);
    console.log("upgrade move project done");
    const upgradeInfo = getUpgradeInfo(packagePath);
    console.log(upgradeInfo);
  });

program
  .command("new-token")
  .description("new token")
  .option("-n, --name <name>", "token name")
  .option("-s, --symbol <symbol>", "token symbol")
  .option("-d, --decimals <decimals>", "token decimals")
  .option("-i, --initialSupply <initialSupply>", "token initial supply")
  .option("-p, --package <package>", "move package name")
  .action(
    async ({ name, symbol, decimals, initialSupply, package: packagePath }) => {
      console.log(`you will create new token: ${name}`);
      await newToken(
        {
          name,
          symbol,
          decimals,
          initialSupply,
        },
        startPath
      );
    }
  );

program.parse(process.argv);
