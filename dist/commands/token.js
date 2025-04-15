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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNewToken = handleNewToken;
const config_1 = require("../config");
const spinner_1 = require("../config/spinner");
const utils_1 = require("../utils");
function handleNewToken(options, startPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            spinner_1.spinner.start("Validating token parameters...");
            // Validate required parameters
            (0, config_1.validateRequiredParams)({
                name: options.name,
                decimals: options.decimals,
                initialSupply: options.initialSupply,
                tokenSymbol: options.tokenSymbol,
            }, ["name", "decimals", "initialSupply", "tokenSymbol"]);
            // Validate numeric parameters
            (0, config_1.validateNumber)(options.decimals, "decimals", { min: 0 });
            (0, config_1.validateNumber)(options.initialSupply, "initialSupply", { min: 1 });
            spinner_1.spinner.update("Creating new token...");
            config_1.logger.info("Token parameters:", {
                name: options.name,
                decimals: options.decimals,
                initialSupply: options.initialSupply,
                tokenSymbol: options.tokenSymbol,
            });
            yield (0, utils_1.newToken)({
                name: options.name,
                symbol: options.tokenSymbol,
                decimals: options.decimals,
                initialSupply: options.initialSupply,
            }, startPath);
            spinner_1.spinner.succeed("Successfully created new token");
        }
        catch (error) {
            spinner_1.spinner.fail("Failed to create new token");
            config_1.logger.error("Error details:", error);
            throw error;
        }
    });
}
