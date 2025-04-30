import path from "path";
import { execSync } from "child_process";
import fs from "fs";

interface UpgradeInfo {
  digest: string;
  objectChanges: [
    {
      type: string;
      sender: string;
      owner: {
        AddressOwner: string;
      };
    }
  ];
}

interface DeployInfo {
  digest: string;
  objectChanges: [
    {
      type: string;
      sender: string;
      owner: {
        AddressOwner: string;
      };
      objectType: string;
      objectId: string;
      version: string;
      previousVersion: string;
      digest: string;
      modules: string[];
      packageId: string;
    }
  ];
}

interface PublishInfo {
  type: string;
  packageId: string;
  version: string;
  digest: string;
  modules: string[];
}

export const buildMove = async (packagePath: string) => {
  console.log("build move package: ", packagePath);
  execSync(`sui move build --skip-fetch-latest-git-deps`, {
    cwd: packagePath,
    stdio: "inherit",
  });
};

export const buildMoveAsJson = async (buildPath: string) => {
  const p = buildPath;
  const output = execSync(
    `sui move build --path ${p} --dump-bytecode-as-base64 --skip-fetch-latest-git-deps`,
    {
      cwd: p,
      stdio: "pipe",
    }
  );
  fs.writeFileSync(path.join(p, "build.json"), output);
};

export const publishNew = async (packagePath: string) => {
  const output = execSync(
    `sui client publish --gas-budget 100000000 --skip-dependency-verification --json`,
    {
      cwd: packagePath,
      stdio: "pipe", // capture all output
    }
  );
  if (output) {
    const outputStr = output.toString();
    console.log("Publishing output:", outputStr);
    fs.writeFileSync(path.join(packagePath, "deploy.json"), outputStr);
  }
};

export const getPublishedPackage = (deploy: DeployInfo) => {
  const info = deploy.objectChanges.filter(
    (change) => change.type === "published"
  )[0];
  return {
    packageId: info.packageId,
    version: info.version,
    digest: info.digest,
    modules: info.modules,
  };
};

export const getUpdateCap = (deploy: DeployInfo) => {
  const info = getPublishedPackage(deploy);
  const packageId = info.packageId;
  const updateCap = deploy.objectChanges.filter(
    (change) =>
      change.type === "created" &&
      change.objectType === "0x2::package::UpgradeCap"
  )[0];
  return {
    packageId,
    updateCap,
  };
};

export const upgradeCurrent = async (packagePath: string) => {
  const deploy = JSON.parse(
    fs.readFileSync(path.join(packagePath, "deploy.json"), "utf-8")
  ) as DeployInfo;
  const info = getUpdateCap(deploy);

  console.log(`update cap : ${JSON.stringify(info.updateCap)}`);

  try {
    const output = execSync(
      `sui client upgrade --gas-budget 100000000 --upgrade-capability ${info.updateCap.objectId} --skip-dependency-verification --json 2>&1`, // Redirect stderr to stdout
      {
        cwd: packagePath,
        encoding: "utf-8",
      }
    );

    if (output && output.trim()) {
      // Try to parse the output to get the JSON part
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        console.log("Found JSON output");
        fs.writeFileSync(path.join(packagePath, "upgrade.json"), jsonStr);
      } else {
        console.log("No JSON found in output");
        fs.writeFileSync(path.join(packagePath, "upgrade.json"), output);
      }
    } else {
      console.log("No output received from upgrade command");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during upgrade:", error.message);
      // Try to extract JSON from error output if available
      const errorOutput = error.message || "";
      const jsonMatch = errorOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        console.log("Found JSON in error output");
        fs.writeFileSync(path.join(packagePath, "upgrade.json"), jsonStr);
      }
    }
    throw error;
  }
};

export const getUpgradeInfo = (packagePath: string) => {
  const upgrade = JSON.parse(
    fs.readFileSync(path.join(packagePath, "upgrade.json"), "utf-8")
  ) as UpgradeInfo;
  return upgrade;
};

export interface NewTokenOptions {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
}

export const newToken = async (options: NewTokenOptions, startPath: string) => {
  console.log(`You will create new token: ${JSON.stringify(options)}`);

  execSync(`sui move new ${options.name.toLowerCase()}`, {
    cwd: startPath,
    stdio: "inherit",
  });
  const tokenPath = path.join(startPath, options.name.toLowerCase());

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

  fs.writeFileSync(
    path.join(tokenPath, `sources/${options.name.toLowerCase()}.move`),
    newTokenMoveCode
  );

  await buildMove(tokenPath);
  await publishNew(tokenPath);
};

export const newPackage = async (packageName: string, startPath: string) => {
  console.log(
    `You will create new move package: ${packageName} ,path is ${startPath}/${packageName}`
  );
  execSync(`sui move new ${packageName}`, {
    cwd: startPath,
    stdio: "inherit",
  });
};

export const getSuiPath = () => {
  try {
    const output = execSync("which sui", { stdio: "pipe" });
    return output.toString().trim();
  } catch (error) {
    return null;
  }
};
