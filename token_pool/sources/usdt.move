/*
/// Module: token_pool
module token_pool::token_pool;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions


module token_pool::usdt;
use sui::coin::{Self, TreasuryCap};

public struct AdminCap has key {
    id: UID,
}

public struct USDT has drop {}

fun init(witness: USDT, ctx: &mut TxContext) {
    let sender = ctx.sender();
    let (mut treasury, metadata) = coin::create_currency(
        witness,
        6,
        b"USDT",
        b"USDT",
        b"USDT",
        option::none(),
        ctx,
	);
	

    let admin_cap = AdminCap {
        id: object::new(ctx),
    };

    transfer::transfer(admin_cap, sender);

    mint_once(&mut treasury, 5_0000_000_000_000, sender, ctx);
    transfer::public_freeze_object(metadata);
	transfer::public_transfer(treasury, sender);
}

fun mint_once(
    treasury_cap: &mut TreasuryCap<USDT>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
	let coin = coin::mint(treasury_cap, amount, ctx);
	transfer::public_transfer(coin, recipient)
}
