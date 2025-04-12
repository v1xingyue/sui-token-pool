/*
/// Module: token_pool
module token_pool::token_pool;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions
// https://docs.sui.io/guides/developer/stablecoins#usdc-guide

module token_pool::atoken;

use usdc::usdc::{USDC};
use sui::coin::{Self, TreasuryCap};
use sui::balance::{Self, Balance};

public struct AdminCap has key {
    id: UID,
}

public struct TokenInfo has key,store {
    id: UID,
    oracle: address,
    option: u8,
    deployer: address,
    usdc_wallet: Balance<USDC>,
}

public struct ATOKEN has drop {}

fun init(witness: ATOKEN, ctx: &mut TxContext) {

    let sender = ctx.sender();
    let (mut treasury, metadata) = coin::create_currency(
        witness,
        6,
        b"ATOKEN",
        b"",
        b"",
        option::none(),
        ctx,
	);

    let admin_cap = AdminCap {
        id: object::new(ctx),
    };

    transfer::transfer(admin_cap, sender);

    mint_once(&mut treasury, 5000_000_000, sender, ctx);
    transfer::public_freeze_object(metadata);
	transfer::public_transfer(treasury, sender);

    let token_info = TokenInfo {
        id: object::new(ctx),
        oracle: sender,
        option: 0,
        deployer: sender,
        usdc_wallet: balance::zero(),
    };

    transfer::public_share_object(token_info);
}

public fun set_option(token_info: &mut TokenInfo, option: u8,_admin_cap: &AdminCap) {
    token_info.option = option;
}

fun mint_once(
    treasury_cap: &mut TreasuryCap<ATOKEN>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
	let coin = coin::mint(treasury_cap, amount, ctx);
	transfer::public_transfer(coin, recipient)
}

public fun freeze_treasury_cap(treasury_cap: TreasuryCap<ATOKEN>) {
	transfer::public_freeze_object(treasury_cap);
}

public fun exchange(
    a: &mut coin::Coin<ATOKEN>,
    info: &TokenInfo,
    ctx: &mut TxContext,
) {
    if (info.option == 0) {
        let amount = a.balance().value();
        let a_token = coin::split(a, amount, ctx);
        transfer::public_transfer(a_token, info.deployer);
    } 
}


public entry fun deposit(
    coin: &mut coin::Coin<USDC>,
    amount: u64,
    info: &mut TokenInfo,
    ctx: &mut TxContext,
) {
    let usdc = coin::split(coin, amount, ctx);
    info.usdc_wallet.join(coin::into_balance(usdc));
}