import { Config } from './config';

export interface TokenSteadyData {
    addresses: { [key: number]: string };
    symbol: string;
    decimals: number;
    name: string;
    primaryColor: string;
    icon?: string;
    displayDecimals?: number;
}
export const KNOWN_TOKENS_STEADY_DATA: TokenSteadyData[] = Config.getConfig().steadyTokens;
