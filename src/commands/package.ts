import path from "path";
import {
  BuildOptions,
  PackageOptions,
  PublishOptions,
  UpgradeOptions,
} from "./types";
import { logger, validateRequiredParams } from "../config";
import { spinner } from "../config/spinner";
import {
  buildMove,
  publishNew,
  upgradeCurrent,
  getUpgradeInfo,
  newPackage,
} from "../utils";

export async function handleNewPackage(
  options: PackageOptions,
  defaultPath: string
): Promise<void> {
  try {
    spinner.start("Validating package parameters...");
    validateRequiredParams({ name: options.name }, ["name"]);

    spinner.update(`Creating new package: ${options.name}`);
    await newPackage(options.name, options.path || defaultPath);

    spinner.succeed(`Successfully created package: ${options.name}`);
  } catch (error) {
    spinner.fail("Failed to create new package");
    logger.error("Error details:", error);
    throw error;
  }
}

export async function handleBuildPackage(
  options: BuildOptions,
  startPath: string
): Promise<void> {
  try {
    spinner.start("Validating build parameters...");
    validateRequiredParams({ package: options.package }, ["package"]);

    spinner.update(`Building move package: ${options.package}`);
    const packagePath = path.join(startPath, options.package);
    await buildMove(packagePath);

    spinner.succeed(`Successfully built package: ${options.package}`);
  } catch (error) {
    spinner.fail("Failed to build package");
    logger.error("Error details:", error);
    throw error;
  }
}

export async function handlePublishPackage(
  options: PublishOptions,
  startPath: string
): Promise<void> {
  try {
    spinner.start("Validating publish parameters...");
    validateRequiredParams({ package: options.package }, ["package"]);

    const packagePath = path.join(startPath, options.package);
    if (options.build) {
      spinner.update("Building project before publish...");
      await buildMove(packagePath);
    }

    spinner.update(`Publishing move package: ${options.package}`);
    await publishNew(packagePath);

    spinner.succeed(`Successfully published package: ${options.package}`);
  } catch (error) {
    spinner.fail("Failed to publish package");
    logger.error("Error details:", error);
    throw error;
  }
}

export async function handleUpgradePackage(
  options: UpgradeOptions,
  startPath: string
): Promise<void> {
  try {
    spinner.start("Validating upgrade parameters...");
    validateRequiredParams({ package: options.package }, ["package"]);

    const packagePath = path.join(startPath, options.package);
    if (options.build) {
      spinner.update("Building project before upgrade...");
      await buildMove(packagePath);
    }

    spinner.update(`Upgrading move package: ${options.package}`);
    await upgradeCurrent(packagePath);

    const upgradeInfo = getUpgradeInfo(packagePath);
    spinner.succeed("Upgrade completed successfully");
    logger.info("Upgrade details:", upgradeInfo);
  } catch (error) {
    spinner.fail("Failed to upgrade package");
    logger.error("Error details:", error);
    throw error;
  }
}
