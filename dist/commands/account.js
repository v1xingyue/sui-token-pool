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
const commander_1 = require("commander");
const config_1 = require("../config");
const cetus_sui_clmm_sdk_1 = require("@cetusprotocol/cetus-sui-clmm-sdk");
const accountCommand = new commander_1.Command("account").description("account command");
const tools_1 = require("../tools");
const signer = (0, tools_1.getSigner)();
const cetusClmmSDK = (0, cetus_sui_clmm_sdk_1.initCetusSDK)({ network: config_1.network });
accountCommand
    .command("info")
    .description("load account info")
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`current address: ${signer.toSuiAddress()}`);
}));
accountCommand
    .command("balance")
    .description("load coin balance")
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`current address: ${signer.toSuiAddress()}`);
    const rpc = cetusClmmSDK.fullClient;
    const balances = yield rpc.getAllBalances({
        owner: signer.toSuiAddress(),
    });
    const lines = [];
    yield Promise.all(balances.map((balance) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const meta = yield rpc.getCoinMetadata({
            coinType: balance.coinType,
        });
        lines.push({
            coinType: balance.coinType,
            balance: balance.totalBalance,
            decimal: meta === null || meta === void 0 ? void 0 : meta.decimals,
            humanBalance: Number(balance.totalBalance) / 10 ** ((_a = meta === null || meta === void 0 ? void 0 : meta.decimals) !== null && _a !== void 0 ? _a : 0),
        });
    })));
    console.table(lines);
}));
exports.default = accountCommand;
