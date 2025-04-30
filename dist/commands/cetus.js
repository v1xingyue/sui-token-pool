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
const cetus_sui_clmm_sdk_1 = require("@cetusprotocol/cetus-sui-clmm-sdk");
const config_1 = require("../config");
const tools_1 = require("../tools");
const cetusClmmSDK = (0, cetus_sui_clmm_sdk_1.initCetusSDK)({ network: config_1.network });
const cetusCommand = new commander_1.Command("cetus").description("cetus command tools");
cetusCommand.addCommand(new commander_1.Command("pools")
    .description("dump all pools")
    .option("-c, --coins <coins...>", "coin type", [])
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    const coins = options.coins;
    config_1.logger.info(`options: ${JSON.stringify(options)}`);
    const lines = [];
    if (!coins || coins.length == 0) {
        const pools = yield cetusClmmSDK.Pool.getPools([], 0, 10);
        pools.forEach((pool) => {
            lines.push({
                coinTypeA: pool.coinTypeA,
                coinTypeB: pool.coinTypeB,
                index: pool.index,
            });
        });
    }
    else {
        config_1.logger.info(`dump pool by coin ${coins}`);
        const pools = yield cetusClmmSDK.Pool.getPoolByCoins(coins);
        pools.forEach((pool) => {
            lines.push({
                coinTypeA: pool.coinTypeA,
                coinTypeB: pool.coinTypeB,
                index: pool.index,
            });
        });
    }
    console.table(lines);
})));
cetusCommand.addCommand(new commander_1.Command("create-pool")
    .description(`
    Create pool with cetus sdk.
    Get price tick . Price should be A/B , such if 1A = 0.1B , then price will be 0.1
  `)
    .option("-p, --prices <prices...>", "price list : lower_price current_price upper_price")
    .option("-t, --tokens <tokens...>", "tokens list A,B ")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!options.tokens || options.tokens.length != 2) {
        config_1.logger.error("tokens must be 2 or tokens is not set");
        return;
    }
    const signer = (0, tools_1.getSigner)();
    const rpc = cetusClmmSDK.fullClient;
    config_1.logger.info(signer.toSuiAddress());
    const tokenMestas = yield Promise.all(options.tokens.map((token) => __awaiter(void 0, void 0, void 0, function* () {
        const meta = yield rpc.getCoinMetadata({
            coinType: token,
        });
        return meta;
    })));
    const decimalsA = (_a = tokenMestas[0]) === null || _a === void 0 ? void 0 : _a.decimals;
    const decimalsB = (_b = tokenMestas[1]) === null || _b === void 0 ? void 0 : _b.decimals;
    config_1.logger.info(`decimalsA: ${decimalsA}`);
    config_1.logger.info(`decimalsB: ${decimalsB}`);
    // // // 价格边界
    // const currentPrice = new Decimal(options.prices[2]);
    // const tickSpacing = new BN(2);
    // const initialize_sqrt_price = TickMath.priceToSqrtPriceX64(
    //   currentPrice,
    //   decimalsA,
    //   decimalsB
    // );
    // const current_tick_index = TickMath.sqrtPriceX64ToTickIndex(
    //   new BN(initialize_sqrt_price)
    // );
    // const tick_lower = TickMath.getPrevInitializableTickIndex(
    //   new BN(current_tick_index).toNumber(),
    //   tickSpacing.toNumber()
    // );
    // const tick_upper = TickMath.getNextInitializableTickIndex(
    //   new BN(current_tick_index).toNumber(),
    //   tickSpacing.toNumber()
    // );
    // logger.info(`initialize_sqrt_price: ${initialize_sqrt_price}`);
    // logger.info(`tick_lower: ${tick_lower}`);
    // logger.info(`tick_upper: ${tick_upper}`);
    // const creatPoolPayload = sdk.Pool.createPoolTransactionPayload({
    //   coinTypeA,
    //   coinTypeB,
    //   tick_spacing: tick_spacing,
    //   initialize_sqrt_price: initialize_sqrt_price,
    //   uri: "",
    //   amount_a,
    //   amount_b,
    //   fix_amount_a,
    //   tick_lower,
    //   tick_upper,
    //   metadata_a: coinMetadataAID,
    //   metadata_b: coinMetadataBID,
    // });
})));
exports.default = cetusCommand;
