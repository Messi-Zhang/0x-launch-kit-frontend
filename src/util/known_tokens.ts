import { ExchangeFillEventArgs, LogWithDecodedArgs } from '@0x/contract-wrappers';
import { assetDataUtils } from '@0x/order-utils';

import { KNOWN_TOKENS_META_DATA, TokenMetaData } from '../common/tokens_meta_data';
import { KNOWN_TOKENS_STEADY_DATA, TokenSteadyData } from '../common/tokens_steady_data';
import { getLogger } from '../util/logger';

import { getWethTokenFromTokensMetaDataByNetworkId, mapTokensMetaDataToTokenByNetworkId } from './token_meta_data';
import { getWethTokenFromTokensSteadyDataByNetworkId, mapTokensSteadyDataToTokenByNetworkId } from './token_steady_data';
import { Token } from './types';

const logger = getLogger('Tokens::known_tokens .ts');

export class KnownTokens {
    private readonly _tokens: Token[] = [];
    private readonly _steadyTokens: Token[] = [];
    private readonly _wethToken: Token;

    constructor(knownTokensData: TokenSteadyData[] | TokenMetaData[], isSteady: Boolean = false) {
        if (isSteady) {
            this._steadyTokens = mapTokensSteadyDataToTokenByNetworkId(knownTokensData).filter(token => !isWeth(token.symbol));
            this._wethToken = getWethTokenFromTokensSteadyDataByNetworkId(knownTokensData);
        } else {
            this._tokens = mapTokensMetaDataToTokenByNetworkId(knownTokensData).filter(token => !isWeth(token.symbol));
            this._wethToken = getWethTokenFromTokensMetaDataByNetworkId(knownTokensData);
        }
    }

    public getTokenBySymbol = (symbol: string): Token => {
        const symbolInLowerCaseScore = symbol.toLowerCase();
        const token = this._tokens.find(t => t.symbol === symbolInLowerCaseScore);
        if (!token) {
            if (symbolInLowerCaseScore === 'weth') {
                return this.getWethToken();
            }
            const errorMessage = `Token with symbol ${symbol} not found in known tokens`;
            logger.log(errorMessage);
            throw new Error(errorMessage);
        }
        return token;
    };

    public getTokenByAddress = (address: string): Token => {
        const addressInLowerCase = address.toLowerCase();
        let token = this._tokens.find(t => t.address.toLowerCase() === addressInLowerCase);
        if (!token) {
            // If it's not on the tokens list, we check if it's an wETH token
            // TODO - Maybe the this._tokens could be refactored to also have wETH inside
            token = this._wethToken.address === address ? this._wethToken : undefined;
        }
        if (!token) {
            throw new Error(`Token with address ${address} not found in known tokens`);
        }
        return token;
    };

    public getTokenByAssetData = (assetData: string): Token => {
        const tokenAddress = assetDataUtils.decodeERC20AssetData(assetData).tokenAddress;
        return this.getTokenByAddress(tokenAddress);
    };

    public isKnownAddress = (address: string): boolean => {
        try {
            this.getTokenByAddress(address);
            return true;
        } catch (e) {
            return false;
        }
    };

    /**
     * Checks if a Fill event is valid.
     *
     * A Fill event is considered valid if the order involves two ERC20 tokens whose addresses we know.
     *
     */
    public isValidFillEvent = (fillEvent: LogWithDecodedArgs<ExchangeFillEventArgs>): boolean => {
        const { makerAssetData, takerAssetData } = fillEvent.args;

        if (!isERC20AssetData(makerAssetData) || !isERC20AssetData(takerAssetData)) {
            return false;
        }

        const makerAssetAddress = assetDataUtils.decodeERC20AssetData(makerAssetData).tokenAddress;
        const takerAssetAddress = assetDataUtils.decodeERC20AssetData(takerAssetData).tokenAddress;

        if (!this.isKnownAddress(makerAssetAddress) || !this.isKnownAddress(takerAssetAddress)) {
            return false;
        }

        return true;
    };

    public getWethToken = (): Token => {
        return this._wethToken as Token;
    };

    public getTokens = (): Token[] => {
        return this._tokens;
    };

    public getSteadyTokens = (): Token[] => {
        return this._steadyTokens;
    };

    public getSteadyDefaultToken = (): Token => {
        return this._steadyTokens[0];
    };
}

let knownTokens: KnownTokens;
export const getKnownTokens = (knownTokensMetadata: TokenMetaData[] = KNOWN_TOKENS_META_DATA): KnownTokens => {
    if (!knownTokens) {
        knownTokens = new KnownTokens(knownTokensMetadata, false);
    }
    return knownTokens;
};

let knownSteadyTokens: KnownTokens;
export const getKnownSteadyTokens = (knownTokensSteadydata: TokenSteadyData[] = KNOWN_TOKENS_STEADY_DATA): KnownTokens => {
    if (!knownSteadyTokens) {
        knownSteadyTokens = new KnownTokens(knownTokensSteadydata, true);
    }
    return knownSteadyTokens;
};

export const getColorBySymbol = (symbol: string): string => {
    const token = KNOWN_TOKENS_META_DATA.find(t => t.symbol === symbol.toLowerCase());
    if (!token) {
        throw new Error(`Token with symbol ${symbol} not found in known tokens`);
    }

    return token.primaryColor;
};

export const isZrx = (token: string): boolean => {
    return token === 'zrx';
};

export const isWeth = (token: string): boolean => {
    return token === 'weth';
};

export const isERC20AssetData = (assetData: string): boolean => {
    try {
        assetDataUtils.decodeERC20AssetData(assetData);
        return true;
    } catch (e) {
        return false;
    }
};
