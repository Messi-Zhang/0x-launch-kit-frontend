import { getType } from 'typesafe-actions';

import { SteadyState } from '../../util/types';
import * as actions from '../actions';
import { RootAction } from '../reducers';
import { getKnownSteadyTokens } from '../../util/known_tokens';

const initialSteadyState: SteadyState = {
    currentToken: getKnownSteadyTokens().getSteadyDefaultToken(),
    addresses: null,
};

export function steady(state: SteadyState = initialSteadyState, action: RootAction): SteadyState {
    switch (action.type) {
        case getType(actions.setCurrentToken):
            return { ...state, currentToken: action.payload };
        case getType(actions.setAddresses):
            return { ...state, addresses: action.payload };
        default:
            return state;
    }
}
