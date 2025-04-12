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
  console.log("publish new move package: ", packagePath);
  const output = execSync(
    `sui client publish --gas-budget 100000000 --skip-dependency-verification --json`,
    {
      cwd: packagePath,
      stdio: "pipe",
    }
  );
  fs.writeFileSync(path.join(packagePath, "deploy.json"), output);
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

  const output = execSync(
    `sui client upgrade --gas-budget 100000000 --upgrade-capability ${info.updateCap.objectId} --skip-dependency-verification --json`,
    {
      cwd: packagePath,
      stdio: ["pipe", "inherit"],
    }
  );
  fs.writeFileSync(path.join(packagePath, "upgrade.json"), output);
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
  console.log(`You will create new token: ${options.name}`);

  execSync(`sui move new ${options.name.toLowerCase()}`, {
    cwd: startPath,
    stdio: "inherit",
  });
  const tokenPath = path.join(startPath, options.name.toLowerCase());

  const newTokenMoveCode = `
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
  const suiPath = execSync(`which sui`).toString().trim();
  return suiPath;
};
