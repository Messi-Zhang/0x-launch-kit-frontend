import { BigNumber } from '@0x/utils';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { ERC_777_ABI, ERC_777_ADDRESS } from '../../../common/erc777Abi'
import { ZERO, QR_CODE_SIZE, WITHDRAW_ADDRESS } from '../../../common/constants';
import { initWallet, startBuySellLimitSteps, startBuySellMarketSteps, changeAddresses } from '../../../store/actions';
import { fetchTakerAndMakerFee } from '../../../store/relayer/actions';
import { fetchTokensDepositAddress, signMessage } from '../../../store/steady/actions';
import { getWeb3State, getSteadyCurrentToken, getDepositAddresses } from '../../../store/selectors';
import { themeDimensions } from '../../../themes/commons';
import { getKnownTokens } from '../../../util/known_tokens';
import { tokenSymbolToDisplayString } from '../../../util/tokens';
import { TokenDropdownContainer } from '../common/token_dropdown';
import QRCode from 'qrcode.react';
import WAValidator from 'wallet-address-validator';
import CopyToClipboard from 'react-copy-to-clipboard';

import {
    ButtonIcons,
    ButtonVariant,
    OrderFeeData,
    StoreState,
    Web3State,
    SteadySide,
    Token,
    Address
} from '../../../util/types';
import { BigNumberInput } from '../../common/big_number_input';
import { AddressInput } from '../../common/address_input';
import { Button } from '../../common/button';
import { CardBase } from '../../common/card_base';
import { CardTabSelector } from '../../common/card_tab_selector';
import { ErrorCard, ErrorIcons, FontSize } from '../../common/error_card';

interface StateProps {
    web3State: Web3State;
    currentToken: Token | null;
    addresses: Address[] | null;
}

interface DispatchProps {
    onSubmitLimitOrder: (
        amount: BigNumber,
        price: BigNumber,
        side: SteadySide,
        orderFeeData: OrderFeeData,
    ) => Promise<any>;
    onSubmitMarketOrder: (amount: BigNumber, side: SteadySide, orderFeeData: OrderFeeData) => Promise<any>;
    onConnectWallet: () => any;
    onFetchTakerAndMakerFee: (amount: BigNumber, price: BigNumber, side: SteadySide) => Promise<OrderFeeData>;
    onTokensDepositAddress: (signString: string, coinCode: string) => Promise<any>;
    onSignMessage: (coinCode: string) => Promise<any>;
    onChangeAddresses: (addresses: Address[]) => any;
}

type Props = StateProps & DispatchProps;

interface State {
    withdrawAmount: BigNumber | null;
    price: BigNumber | null;
    address: string | null;
    tab: SteadySide;
    error: {
        btnMsg: string | null;
        cardMsg: string | null;
    };
}

const DepositWithdrawWrapper = styled(CardBase)`
    margin-bottom: ${themeDimensions.verticalSeparationSm};
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px ${themeDimensions.horizontalPadding};
`;

const TabsContainer = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
`;

const TabButton = styled.div<{ isSelected: boolean; side: SteadySide }>`
    align-items: center;
    background-color: ${props =>
        props.isSelected ? 'transparent' : props.theme.componentsTheme.inactiveTabBackgroundColor};
    border-bottom-color: ${props => (props.isSelected ? 'transparent' : props.theme.componentsTheme.cardBorderColor)};
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-right-color: ${props => (props.isSelected ? props.theme.componentsTheme.cardBorderColor : 'transparent')};
    border-right-style: solid;
    border-right-width: 1px;
    color: ${props =>
        props.isSelected
            ? props.side === SteadySide.Deposit
                ? props.theme.componentsTheme.green
                : props.theme.componentsTheme.red
            : props.theme.componentsTheme.textLight};
    cursor: ${props => (props.isSelected ? 'default' : 'pointer')};
    display: flex;
    font-weight: 600;
    height: 47px;
    justify-content: center;
    width: 50%;

    &:first-child {
        border-top-left-radius: ${themeDimensions.borderRadius};
    }

    &:last-child {
        border-left-color: ${props => (props.isSelected ? props.theme.componentsTheme.cardBorderColor : 'transparent')};
        border-left-style: solid;
        border-left-width: 1px;
        border-right: none;
        border-top-right-radius: ${themeDimensions.borderRadius};
    }
`;

const LabelContainer = styled.div`
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
`;

const Label = styled.label<{ color?: string }>`
    color: ${props => props.color || props.theme.componentsTheme.textColorCommon};
    font-size: 14px;
    font-weight: 500;
    line-height: normal;
    margin: 0;
`;

const InnerTabs = styled(CardTabSelector)`
    font-size: 14px;
`;

const FieldContainer = styled.div`
    height: ${themeDimensions.fieldHeight};
    margin-bottom: 25px;
    position: relative;
`;

const BigInputNumberStyled = styled<any>(BigNumberInput)`
    background-color: ${props => props.theme.componentsTheme.textInputBackgroundColor};
    border-radius: ${themeDimensions.borderRadius};
    border: 1px solid ${props => props.theme.componentsTheme.textInputBorderColor};
    color: ${props => props.theme.componentsTheme.textInputTextColor};
    font-feature-settings: 'tnum' 1;
    font-size: 16px;
    height: 100%;
    padding-left: 14px;
    padding-right: 60px;
    position: absolute;
    width: 100%;
    z-index: 1;
`;

const AddressInputStyled = styled<any>(AddressInput)`
    background-color: ${props => props.theme.componentsTheme.textInputBackgroundColor};
    border-radius: ${themeDimensions.borderRadius};
    border: 1px solid ${props => props.theme.componentsTheme.textInputBorderColor};
    color: ${props => props.theme.componentsTheme.textInputTextColor};
    font-feature-settings: 'tnum' 1;
    font-size: 16px;
    height: 100%;
    padding-left: 14px;
    padding-right: 14px;
    position: absolute;
    width: 100%;
    z-index: 1;
`;

const TokenContainer = styled.div`
    display: flex;
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 12;
`;

const TokenText = styled.span`
    color: ${props => props.theme.componentsTheme.textInputTextColor};
    font-size: 14px;
    font-weight: normal;
    line-height: 21px;
    text-align: right;
`;

const TokenDropdown = styled<any>(TokenDropdownContainer)`
    align-items: center;
    display: flex;
`;

const AddressQRContent = styled.div`
    margin: 0 auto 25px;
`;

const BigInputNumberTokenLabel = (props: { tokenSymbol: string }) => (
    <TokenContainer>
        <TokenText>{tokenSymbolToDisplayString(props.tokenSymbol)}</TokenText>
    </TokenContainer>
);

const TIMEOUT_BTN_ERROR = 2000;
const TIMEOUT_CARD_ERROR = 4000;

class DepositWithdraw extends React.Component<Props, State> {
    public state: State = {
        withdrawAmount: null,
        price: null,
        address: null,
        tab: SteadySide.Deposit,
        error: {
            btnMsg: null,
            cardMsg: null,
        },
    };

    public render = () => {
        const { currentToken, web3State, addresses } = this.props;
        const { withdrawAmount, address, tab, error } = this.state;
        if (!currentToken) {
            return null;
        }
        let currentTokenAddress = '';
        if (addresses && addresses.length > 0) {
            addresses.forEach(element => {
                if (currentToken.symbol.toUpperCase() === element.coinCode.toUpperCase()) {
                    currentTokenAddress = element.address;
                }
            });
        }
        const btnPrefix = tab === SteadySide.Deposit ? 'Get ' : 'Withdraw ';
        const btnText = error && error.btnMsg ? 'Error' :
            tab === SteadySide.Deposit ? currentTokenAddress.length > 0 ?
                'Copy Address' :
                btnPrefix + tokenSymbolToDisplayString(currentToken.symbol) + ' Address' :
                btnPrefix + tokenSymbolToDisplayString(currentToken.symbol);

        let inputContent;
        let buttonContent;
        let qrContent;
        if (tab === SteadySide.Deposit) {
            if (currentTokenAddress.length > 0) {
                qrContent = this.getQrContent(currentTokenAddress);
            }
            buttonContent = this.getButtonContent(web3State, error, btnText, tab, currentTokenAddress);
        } else {
            const decimals = getKnownTokens().getTokenBySymbol(currentToken.symbol).decimals;
            inputContent = this.getInputContent(decimals, withdrawAmount, currentToken, address);
            buttonContent = buttonContent = this.getButtonContent(web3State, error, btnText, tab, '');
        }

        return (
            <>
                <DepositWithdrawWrapper>
                    <TabsContainer>
                        <TabButton
                            isSelected={tab === SteadySide.Deposit}
                            onClick={this.changeTab(SteadySide.Deposit)}
                            side={SteadySide.Deposit}
                        >
                            Deposit
                        </TabButton>
                        <TabButton
                            isSelected={tab === SteadySide.Withdraw}
                            onClick={this.changeTab(SteadySide.Withdraw)}
                            side={SteadySide.Withdraw}
                        >
                            Withdraw
                        </TabButton>
                    </TabsContainer>
                    <Content>
                        <TokenDropdown shouldCloseDropdownBodyOnClick={false} />
                        {inputContent}
                        {currentTokenAddress.length > 0 ? (
                            <AddressQRContent>
                                {qrContent}
                            </AddressQRContent>
                        ) : null}
                        {buttonContent}
                    </Content>
                </DepositWithdrawWrapper>
                {error && error.cardMsg ? (
                    <ErrorCard fontSize={FontSize.Large} text={error.cardMsg} icon={ErrorIcons.Sad} />
                ) : null}
            </>
        );
    };

    public changeTab = (tab: SteadySide) => () => this.setState({ tab });

    public getQrContent(address: string) {
        return (
            <QRCode value={address} size={QR_CODE_SIZE} />
        )
    }

    public getInputContent(decimals: number, withdrawAmount: BigNumber | null, currentToken: Token, address: string | null) {
        return (
            (
                <>
                    <LabelContainer>
                        <Label>Amount</Label>
                    </LabelContainer>
                    <FieldContainer>
                        <BigInputNumberStyled
                            decimals={decimals}
                            min={ZERO}
                            onChange={this.updateWithdrawAmount}
                            value={withdrawAmount}
                            placeholder={'0.00'}
                        />
                        <BigInputNumberTokenLabel tokenSymbol={currentToken.symbol} />
                    </FieldContainer>
                    {(
                        <>
                            <LabelContainer>
                                <Label>Address</Label>
                            </LabelContainer>
                            <FieldContainer>
                                <AddressInputStyled
                                    decimals={0}
                                    onChange={this.updateAddress}
                                    value={address}
                                    placeholder={''}
                                />
                            </FieldContainer>
                        </>
                    )}
                </>
            )
        );
    }

    public getButtonContent(web3State: Web3State, error: {
        btnMsg: string | null;
        cardMsg: string | null;
    }, btnText: string, tab: SteadySide, currentTokenAddress: string) {
        let button = (
            <Button
                    disabled={web3State !== Web3State.Done}
                    icon={error && error.btnMsg ? ButtonIcons.Warning : undefined}
                    onClick={this.submit}
                    variant={
                        error && error.btnMsg
                            ? ButtonVariant.Error
                            : tab == SteadySide.Deposit ?
                                ButtonVariant.Deposit :
                                ButtonVariant.Withdraw
                    }
                >
                    {btnText}
                </Button>
        )
        if (currentTokenAddress.length > 0 && tab == SteadySide.Deposit) {
            return (
                <CopyToClipboard text={currentTokenAddress}>
                    {button}
                </CopyToClipboard>
            );
        } else {
            return button;
        }
    }

    public updateWithdrawAmount = (newValue: BigNumber) => {
        this.setState({
            withdrawAmount: newValue,
        });
    };

    public updateAddress = (address: string) => {
        this.setState({ address });
    };

    public submit = async () => {
        const { currentToken, addresses } = this.props;
        const { withdrawAmount, address, tab } = this.state;

        if (!currentToken) {
            return null;
        }

        if (tab === SteadySide.Deposit) {
            let currentTokenAddress = '';
            if (addresses && addresses.length > 0) {
                addresses.forEach(element => {
                    if (currentToken.symbol.toUpperCase() === element.coinCode.toUpperCase()) {
                        currentTokenAddress = element.address;
                    }
                });
            }
            if (currentTokenAddress.length <= 0) {
                console.log('asdasdasdasdasd')
                const { web3 } = window;

                web3.personal.sign('Get BTC Address', '0xdB25001A52E2F44E87F21dfb7FdA4656B84843a6', (error:any, result:any) => {
                    console.log('aaaaaa======', error, result)
                })
                



                // await this.props.onSignMessage(currentToken.symbol.toUpperCase());
                // const signString = await this.props.onSignMessage(currentToken.symbol.toUpperCase());
                // console.log('signString =========', signString)
                // if (signString.length > 0) {
                //     const addresses = await this.props.onTokensDepositAddress(signString, currentToken.symbol.toUpperCase());
                //     this.props.onChangeAddresses(addresses);
                // }                
            }
        } else {
            if (!withdrawAmount || !address) {
                return null;
            }
            var valid = WAValidator.validate(address, currentToken.symbol.toUpperCase());
            console.log('valid',valid );
            if (valid) {
                this.withdraw(withdrawAmount, address);
            } else {

            }
        }
    };

    public withdraw(amount: BigNumber, address: string) {
        const { web3 } = window;
        const ethContract = web3.eth.contract(ERC_777_ABI).at(ERC_777_ADDRESS);
        ethContract.send(
            WITHDRAW_ADDRESS,
            amount.toJSON(),
            address,
            (result: any) => {
                console.log('asdasdad', result)
                // this._reset();
            })
    }

    private readonly _reset = () => {
        this.setState({
            withdrawAmount: null,
            address: null,
        });
    };
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        web3State: getWeb3State(state),
        currentToken: getSteadyCurrentToken(state),
        addresses: getDepositAddresses(state),
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        onSubmitLimitOrder: (amount: BigNumber, price: BigNumber, side: SteadySide, orderFeeData: OrderFeeData) =>
            dispatch(startBuySellLimitSteps(amount, price, side, orderFeeData)),
        onSubmitMarketOrder: (amount: BigNumber, side: SteadySide, orderFeeData: OrderFeeData) =>
            dispatch(startBuySellMarketSteps(amount, side, orderFeeData)),
        onConnectWallet: () => dispatch(initWallet()),
        onFetchTakerAndMakerFee: (amount: BigNumber, price: BigNumber, side: SteadySide) =>
            dispatch(fetchTakerAndMakerFee(amount, price, side)),
        onTokensDepositAddress: (signString: string, coinCode: string) => dispatch(fetchTokensDepositAddress(signString, coinCode)),
        onSignMessage: (coinCode: string) => dispatch(signMessage(coinCode)),
        onChangeAddresses: (addresses: Address[]) => dispatch(changeAddresses(addresses)),
    };
};

const DepositWithdrawContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(DepositWithdraw);

export { DepositWithdraw, DepositWithdrawContainer };
