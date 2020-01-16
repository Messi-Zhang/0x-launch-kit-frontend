import { NETWORK_ID, UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION } from '../common/constants';
import { TokenSteadyData } from '../common/tokens_steady_data';

import { Token } from './types';

export const getWethTokenFromTokensSteadyDataByNetworkId = (tokensMetaData: TokenSteadyData[]): Token => {
    const tokenMetaData = tokensMetaData.find(t => t.symbol === 'weth');
    if (!tokenMetaData) {
        throw new Error('WETH Token MetaData not found');
    }
    return {
        address: tokenMetaData.addresses[NETWORK_ID],
        symbol: tokenMetaData.symbol,
        decimals: tokenMetaData.decimals,
        name: tokenMetaData.name,
        primaryColor: tokenMetaData.primaryColor,
        icon: tokenMetaData.icon,
        displayDecimals: tokenMetaData.displayDecimals || UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION,
    };
};

export const mapTokensSteadyDataToTokenByNetworkId = (tokensSteadyData: TokenSteadyData[]): Token[] => {
    return tokensSteadyData
        .filter(tokensSteadyData => tokensSteadyData.addresses[NETWORK_ID])
        .map(
            (tokensSteadyData): Token => {
                return {
                    address: tokensSteadyData.addresses[NETWORK_ID],
                    symbol: tokensSteadyData.symbol,
                    decimals: tokensSteadyData.decimals,
                    name: tokensSteadyData.name,
                    primaryColor: tokensSteadyData.primaryColor,
                    icon: tokensSteadyData.icon,
                    displayDecimals: tokensSteadyData.displayDecimals || UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION,
                };
            },
        );
};
