/*
/// Module: buzzing

*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module buzzing::buzzing;
use sui::coin;
use sui::sui::SUI;
use sui::balance::{Self, Balance};
use sui::vec_set::{Self, VecSet};

const E_NOT_ADMIN: u64 = 1;

public struct AdminCap has key {
    id: UID,
}

// token type is : token_package::token::TOKEN
public struct MarketData has store {
    question: String,
    options: Vec<u8>,
    token_package: Vec<address>,
}

public struct BuzzingInfo has key {
    id: UID,
    platform_token_meta: ID,
    sui_pool: Balance<SUI>,
    buzzing_per_sui: u64,
    buzzing_pool: Balance<BUZZING>,
    admin_address: VecSet<address>,
    markets: Vec<MarketData>,
}


// platform token for buzzing
public struct BUZZING has drop {}

fun init(witness: BUZZING, ctx: &mut TxContext) {
    let sender = ctx.sender();
    let (treasury, metadata) = coin::create_currency(
        witness,
        6,
        b"BUZZING",
        b"BUZZING",
        b"Buzzing Platform Token",
        option::none(),
        ctx,
    );

    let admin_cap = AdminCap {
        id: object::new(ctx)
    };

    transfer::transfer(admin_cap, sender);
    
	transfer::public_transfer(treasury, sender);

    let mut admin_list = vec_set::empty();
    admin_list.insert(sender);


    transfer::share_object(BuzzingInfo{
        id: object::new(ctx),
        platform_token_meta: object::id(&metadata),
        sui_pool: balance::zero(),
        buzzing_per_sui: 10,
        buzzing_pool: balance::zero(),
        admin_address: admin_list,
        markets: Vec::empty()
    });

    transfer::public_freeze_object(metadata);

}

public entry fun mint_buzzing_to_pool(amount: u64,treasury: &mut coin::TreasuryCap<BUZZING>, info: &mut BuzzingInfo, ctx: &mut TxContext) {
    assert!(info.admin_address.contains(&ctx.sender()), E_NOT_ADMIN);
    let new_coin = treasury.mint(amount,ctx);
    info.buzzing_pool.join(new_coin.into_balance());
}

public entry fun deposit(coin: &mut coin::Coin<SUI>,amount: u64,info: &mut BuzzingInfo, ctx: &mut TxContext) {

    let new_coin = coin.split(amount,ctx);
    info.sui_pool.join(new_coin.into_balance());

    let buzzing_amount = amount * info.buzzing_per_sui;
    let buzzing_balance = info.buzzing_pool.split(buzzing_amount);
    let buzzing_coin = coin::from_balance(buzzing_balance,ctx);
    transfer::public_transfer(buzzing_coin, ctx.sender());

}
