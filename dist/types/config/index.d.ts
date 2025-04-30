import winston from "winston";
export declare const isDevelopment: boolean;
export declare const logger: winston.Logger;
export declare const paths: {
    start: string;
    logs: string;
};
export declare function ensureDirectories(): void;
export declare function mockAsyncOperation(ms?: number): Promise<void>;
export declare function validateRequiredParams(params: Record<string, any>, requiredFields: string[]): void;
export declare function validateNumber(value: any, fieldName: string, options?: {
    min?: number;
    max?: number;
}): void;
export declare const network = "testnet";
