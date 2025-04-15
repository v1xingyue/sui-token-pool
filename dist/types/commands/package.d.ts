import { BuildOptions, PackageOptions, PublishOptions, UpgradeOptions } from "./types";
export declare function handleNewPackage(options: PackageOptions, defaultPath: string): Promise<void>;
export declare function handleBuildPackage(options: BuildOptions, startPath: string): Promise<void>;
export declare function handlePublishPackage(options: PublishOptions, startPath: string): Promise<void>;
export declare function handleUpgradePackage(options: UpgradeOptions, startPath: string): Promise<void>;
