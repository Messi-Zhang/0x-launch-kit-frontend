import { createAction } from 'typesafe-actions';
import { signatureUtils } from '@0x/order-utils';
import { MetamaskSubprovider } from '@0x/subproviders';
import { SignedOrderException } from '../../exceptions/signed_order_exception';
import { getKnownSteadyTokens } from '../../util/known_tokens';
import { getLogger } from '../../util/logger';
import { ThunkCreator, Token, Address } from '../../util/types';
import { utf8ToHex } from '../../util/hex_string'
import { BITPIE_BASE_URL } from '../../common/constants'
import {
    getEthAccount,
} from '../selectors';
var utf8 = require('utf8');

const logger = getLogger('Steady::Actions');

export const setCurrentToken = createAction('steady/STEADY_CURRENT_TOKENS_set', resolve => {
    return (token: Token) => resolve(token);
});

export const setAddresses = createAction('steady/ADDRESSES_set', resolve => {
    return (addresses: Address[]) => resolve(addresses);
});

export const fetchTokens: ThunkCreator = () => {
    return async dispatch => {
        const knownTokens = getKnownSteadyTokens();
        let tokens: Token[] = knownTokens.getSteadyTokens();
        return tokens;
    };
};

export const changeCurrentToken: ThunkCreator = (token: Token) => {
    return async (dispatch, getState) => {
        dispatch(setCurrentToken(token));
    };
};

export const changeAddresses: ThunkCreator = (addresses: Address[]) => {
    return async (dispatch, getState) => {
        dispatch(setAddresses(addresses));
    };
};

export const signMessage: ThunkCreator = (coinCode: string) => {
    return async (dispatch, getState, { getContractWrappers, getWeb3Wrapper }) => {
        console.log('===================')
        const state = getState();
        const ethAccount = getEthAccount(state);
        try {
            const { web3 } = window;
            // const web3Wrapper = await getWeb3Wrapper();
            // const provider = new MetamaskSubprovider(web3Wrapper.getProvider());
            // web3.eth.setProvider(provider)
            console.log('===================')
            web3.personal.sign('Get BTC Address', '0xdB25001A52E2F44E87F21dfb7FdA4656B84843a6').then((a:any) => {
                console.log('aaaaaa======', a)
            })
            // console.log('================', a)
            // const web3Wrapper = await getWeb3Wrapper();
            // const provider = new MetamaskSubprovider(web3Wrapper.getProvider());
            // let hexString = utf8ToHex(`Get ${coinCode} Address`)
            // return signatureUtils.ecSignHashAsync(provider, hexString, ethAccount);
            return ''
        } catch (error) {
            new SignedOrderException(error.message);
        }
    };
};


export const fetchDepositAddress: ThunkCreator<Promise<any>> = () => {
    return async (dispatch, getState, { getContractWrappers, getWeb3Wrapper }) => {
        const state = getState();
        const ethAccount = getEthAccount(state);
        console.log(ethAccount);
        const addresses = await fetch(`${BITPIE_BASE_URL}/BTC/recharge/address/${ethAccount}`, {
            method: 'GET',
            headers: {
                'Accept-Encoding': 'gzip'
            },
        }).then((response) => {
            response.json()
        }).then((result) => {
            return result
        }).catch((error) => {
            logger.error(error);
            throw error;
        })
        console.log('action addresses', addresses);
        dispatch(setAddresses([]));
    };
};

export const fetchTokensDepositAddress: ThunkCreator<Promise<any>> = (
    signString: string,
    coinCode: string
) => {
    return async (dispatch, getState) => {
        const state = getState();
        const ethAccount = getEthAccount(state);
        try {
            let data = new FormData();
            data.append('sign', signString);
            const address = await fetch(`${BITPIE_BASE_URL}/${coinCode}/recharge/address/${ethAccount}`, {
                method: 'POST',
                body: data,
            })
            return address.json;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    };
};