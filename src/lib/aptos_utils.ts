

export const APTOS_DECIMALS = 8;


export function aptos_to_decimal(price: number): number {
    return price * 10 ** (-APTOS_DECIMALS)
}