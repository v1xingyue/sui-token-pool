"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paths = exports.logger = exports.isDevelopment = void 0;
exports.ensureDirectories = ensureDirectories;
exports.mockAsyncOperation = mockAsyncOperation;
exports.validateRequiredParams = validateRequiredParams;
exports.validateNumber = validateNumber;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Environment configuration
exports.isDevelopment = process.env.NODE_ENV === "development";
// Logger configuration
exports.logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.colorize(), winston_1.default.format.simple()),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: "error.log", level: "error" }),
        new winston_1.default.transports.File({ filename: "combined.log" }),
    ],
});
// Path configuration
exports.paths = {
    start: process.env.MOVE_START_PATH || "./move",
    logs: process.env.MOVE_LOGS_PATH || "./logs",
};
// Create necessary directories
function ensureDirectories() {
    const requiredPaths = Object.values(exports.paths);
    for (const dir of requiredPaths) {
        if (!path_1.default.isAbsolute(dir)) {
            const absolutePath = path_1.default.resolve(process.cwd(), dir);
            try {
                require("fs").mkdirSync(absolutePath, { recursive: true });
                exports.logger.info(`Ensured directory exists: ${absolutePath}`);
            }
            catch (error) {
                exports.logger.error(`Failed to create directory ${absolutePath}:`, error);
                process.exit(1);
            }
        }
    }
}
// Mock functions for development
function mockAsyncOperation(ms = 1000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// Validation utilities
function validateRequiredParams(params, requiredFields) {
    for (const field of requiredFields) {
        if (!params[field]) {
            throw new Error(`Missing required parameter: ${field}`);
        }
    }
}
function validateNumber(value, fieldName, options = {}) {
    const num = Number(value);
    if (isNaN(num)) {
        throw new Error(`${fieldName} must be a valid number`);
    }
    if (options.min !== undefined && num < options.min) {
        throw new Error(`${fieldName} must be greater than or equal to ${options.min}`);
    }
    if (options.max !== undefined && num > options.max) {
        throw new Error(`${fieldName} must be less than or equal to ${options.max}`);
    }
}
