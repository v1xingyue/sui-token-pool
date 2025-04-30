import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export const getSigner = () => {
  const signer = Ed25519Keypair.fromSecretKey(
    "suiprivkey1qqnl73py2gcuauapjptdg3uv7gzdvm5s77msszsps0t9keuaug7h6n205w5"
  );
  return signer;
};
