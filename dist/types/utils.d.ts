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
export declare const buildMove: (packagePath: string) => Promise<void>;
export declare const buildMoveAsJson: (buildPath: string) => Promise<void>;
export declare const publishNew: (packagePath: string) => Promise<void>;
export declare const getPublishedPackage: (deploy: DeployInfo) => {
    packageId: string;
    version: string;
    digest: string;
    modules: string[];
};
export declare const getUpdateCap: (deploy: DeployInfo) => {
    packageId: string;
    updateCap: {
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
    };
};
export declare const upgradeCurrent: (packagePath: string) => Promise<void>;
export declare const getUpgradeInfo: (packagePath: string) => UpgradeInfo;
export interface NewTokenOptions {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: number;
}
export declare const newToken: (options: NewTokenOptions, startPath: string) => Promise<void>;
export declare const newPackage: (packageName: string, startPath: string) => Promise<void>;
export declare const getSuiPath: () => string | null;
export {};
