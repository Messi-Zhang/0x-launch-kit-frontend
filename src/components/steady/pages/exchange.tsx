import React from 'react';

import { CheckMetamaskStateModalContainer } from '../../common/check_metamask_state_modal_container';
import { ColumnNarrow } from '../../common/column_narrow';
import { ColumnWide } from '../../common/column_wide';
import { Content } from '../common/content_wrapper';
import { WalletBalanceContainer } from '../exchange/wallet_balance';
import { DepositWithdrawContainer } from '../exchange/deposit_withdraw';

import { OrderHistoryContainer } from '../exchange/deposit_transaction';

class Exchange extends React.PureComponent {
    public render = () => {
        return (
            <Content>
                <ColumnNarrow>
                    <WalletBalanceContainer />
                    <DepositWithdrawContainer />
                </ColumnNarrow>
                <ColumnWide>
                    <OrderHistoryContainer />
                    {/* <OrderHistoryContainer /> */}
                </ColumnWide>
                <CheckMetamaskStateModalContainer />
            </Content>
        );
    };
}

export { Exchange };
