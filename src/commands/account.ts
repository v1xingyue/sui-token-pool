import { Command } from "commander";
import { network } from "../config";
import { initCetusSDK } from "@cetusprotocol/cetus-sui-clmm-sdk";

const accountCommand = new Command("account").description("account command");

import { getSigner } from "../tools";

const signer = getSigner();

const cetusClmmSDK = initCetusSDK({ network: network });

accountCommand
  .command("info")
  .description("load account info")
  .action(async () => {
    console.log(`current address: ${signer.toSuiAddress()}`);
  });

accountCommand
  .command("balance")
  .description("load coin balance")
  .action(async () => {
    console.log(`current address: ${signer.toSuiAddress()}`);
    const rpc = cetusClmmSDK.fullClient;
    const balances = await rpc.getAllBalances({
      owner: signer.toSuiAddress(),
    });

    const lines: any[] = [];

    await Promise.all(
      balances.map(async (balance) => {
        const meta = await rpc.getCoinMetadata({
          coinType: balance.coinType,
        });

        lines.push({
          coinType: balance.coinType,
          balance: balance.totalBalance,
          decimal: meta?.decimals,
          humanBalance:
            Number(balance.totalBalance) / 10 ** (meta?.decimals ?? 0),
        });
      })
    );

    console.table(lines);
  });

export default accountCommand;
