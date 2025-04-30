"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSigner = void 0;
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const getSigner = () => {
    const signer = ed25519_1.Ed25519Keypair.fromSecretKey("suiprivkey1qqnl73py2gcuauapjptdg3uv7gzdvm5s77msszsps0t9keuaug7h6n205w5");
    return signer;
};
exports.getSigner = getSigner;
