import { Command } from "commander";
import { Decimal } from "decimal.js";
import { initCetusSDK, TickMath } from "@cetusprotocol/cetus-sui-clmm-sdk";
import BN from "bn.js";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

import {
  logger,
  paths,
  ensureDirectories,
  isDevelopment,
  network,
} from "../config";
import { getSigner } from "../tools";

const cetusClmmSDK = initCetusSDK({ network: network });

const cetusCommand = new Command("cetus").description("cetus command tools");

cetusCommand.addCommand(
  new Command("pools")
    .description("dump all pools")
    .option("-c, --coins <coins...>", "coin type", [])
    .action(async (options: { coins: string[] }) => {
      const coins = options.coins;
      logger.info(`options: ${JSON.stringify(options)}`);
      const lines: any[] = [];
      if (!coins || coins.length == 0) {
        const pools = await cetusClmmSDK.Pool.getPools([], 0, 10);
        pools.forEach((pool) => {
          lines.push({
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB,
            index: pool.index,
          });
        });
      } else {
        logger.info(`dump pool by coin ${coins}`);
        const pools = await cetusClmmSDK.Pool.getPoolByCoins(coins);
        pools.forEach((pool) => {
          lines.push({
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB,
            index: pool.index,
          });
        });
      }
      console.table(lines);
    })
);

cetusCommand.addCommand(
  new Command("create-pool")
    .description(
      `
    Create pool with cetus sdk.
    Get price tick . Price should be A/B , such if 1A = 0.1B , then price will be 0.1
  `
    )
    .option(
      "-p, --prices <prices...>",
      "price list : lower_price current_price upper_price"
    )
    .option("-t, --tokens <tokens...>", "tokens list A,B ")
    .action(async (options: { prices: number[]; tokens: string[] }) => {
      if (!options.tokens || options.tokens.length != 2) {
        logger.error("tokens must be 2 or tokens is not set");
        return;
      }

      const signer = getSigner();
      const rpc = cetusClmmSDK.fullClient;
      logger.info(signer.toSuiAddress());

      const tokenMestas = await Promise.all(
        options.tokens.map(async (token) => {
          const meta = await rpc.getCoinMetadata({
            coinType: token,
          });
          return meta;
        })
      );

      const decimalsA = tokenMestas[0]?.decimals;
      const decimalsB = tokenMestas[1]?.decimals;

      logger.info(`decimalsA: ${decimalsA}`);
      logger.info(`decimalsB: ${decimalsB}`);

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
    })
);

export default cetusCommand;
