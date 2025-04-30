
module xing::token;
use sui::coin::{Self, TreasuryCap};

public struct TokenInfo has key, store {
    id: UID,
    metadata: ID,
}

public struct AdminCap has key {
    id: UID,
}

public struct TOKEN has drop {}

fun init(witness: TOKEN, ctx: &mut TxContext) {
    let sender = ctx.sender();
    let (mut treasury, metadata) = coin::create_currency(
        witness,
        6,
        b"XINGSIR",
        b"XINGSIR",
        b"XINGSIR",
        option::none(),
        ctx,
	);

    let metadata_id = object::id(&metadata);
	
    transfer::share_object(TokenInfo{
        id: object::new(ctx),
        metadata: metadata_id,
    });

    let admin_cap = AdminCap {
        id: object::new(ctx)
    };

    transfer::transfer(admin_cap, sender);

    mint_once(&mut treasury, 5000000000, sender, ctx);
    transfer::public_freeze_object(metadata);
	transfer::public_transfer(treasury, sender);
}

fun mint_once(
    treasury_cap: &mut TreasuryCap<TOKEN>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
	let coin = coin::mint(treasury_cap, amount, ctx);
	transfer::public_transfer(coin, recipient)
}
