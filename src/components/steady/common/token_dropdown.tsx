import React, { HTMLAttributes } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { changeCurrentToken } from '../../../store/actions';
import { getSteadyCurrentToken } from '../../../store/selectors';
import { themeDimensions } from '../../../themes/commons';
import { getKnownSteadyTokens } from '../../../util/known_tokens';
import { StoreState, Token } from '../../../util/types';
import { CardBase } from '../../common/card_base';
import { Dropdown } from '../../common/dropdown';
import { ChevronDownIcon } from '../../common/icons/chevron_down_icon';
import { CustomTDFirst, CustomTDLast, Table, TBody, THead, THFirst, THLast, TR } from '../../common/table';

interface PropsDivElement extends HTMLAttributes<HTMLDivElement> {}

interface PropsToken {
    currentToken: Token | null;
}

interface DispatchProps {
    changeCurrentToken: (token: Token) => any;
}

type Props = PropsDivElement & PropsToken & DispatchProps;

interface State {
    tokens: Token[];
}

interface MarketRowProps {
    active: boolean;
}

const MarketsDropdownWrapper = styled(Dropdown)``;

const MarketsDropdownHeader = styled.div`
    align-items: center;
    display: flex;
    height: 46px;
    margin-bottom: 25px;
    background-color: #1B1B1B;
    border-radius: 4px;
    border: 1px solid #000;
`;

const MarketsDropdownHeaderText = styled.p`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    width: calc(100% - 24px);
    font-size: 18px;
    font-weight: 600;
    line-height: 46px;
    text-align: center;
`;

const MarketsDropdownBody = styled(CardBase)`
    box-shadow: ${props => props.theme.componentsTheme.boxShadow};
    max-height: 100%;
    max-width: 100%;
`;

const TableWrapper = styled.div`
    max-height: 420px;
    overflow: auto;
    position: relative;
`;

const verticalCellPadding = `
    padding-bottom: 10px;
    padding-top: 10px;
`;

const TRStyled = styled(TR)<MarketRowProps>`
    background-color: ${props => (props.active ? props.theme.componentsTheme.rowActive : 'transparent')};
    cursor: ${props => (props.active ? 'default' : 'pointer')};

    &:hover {
        background-color: ${props => props.theme.componentsTheme.rowActive};
    }

    &:last-child > td {
        border-bottom-left-radius: ${themeDimensions.borderRadius};
        border-bottom-right-radius: ${themeDimensions.borderRadius};
        border-bottom: none;
    }
`;

const CustomTDFirstStyled = styled(CustomTDFirst)`
    ${verticalCellPadding};
    padding-left: 0 !important;
`;

const TokenIconAndLabel = styled.div`
    align-items: center;
    display: flex;
    justify-content: flex-start;
`;

const TokenLabel = styled.div`
    padding-right: 24px;
    width: 100%;
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
    margin: 0;
`;

class TokenDropdown extends React.Component<Props, State> {
    public readonly state: State = {
        tokens: getKnownSteadyTokens().getSteadyTokens(),
    };

    private readonly _dropdown = React.createRef<Dropdown>();

    public render = () => {
        const { currentToken, ...restProps } = this.props;
        const { tokens } = this.state;

        const header = (
            <MarketsDropdownHeader>
                <MarketsDropdownHeaderText>
                { currentToken ? (
                    currentToken.symbol.toUpperCase()
                ) : '' }
                </MarketsDropdownHeaderText>
                <ChevronDownIcon />
            </MarketsDropdownHeader>
        );

        const body = (
            <MarketsDropdownBody>
                <TableWrapper>{this._getTokens()}</TableWrapper>
            </MarketsDropdownBody>
        );
        return (
            <MarketsDropdownWrapper
                body={body}
                header={header}
                ref={this._dropdown}
                steadyCustomTop={true}
                steadyCustomWidth={true}
                steadyCustomZIndex={true}
                {...restProps}
            />
        );
    };

    private readonly _getTokens = () => {
        const { tokens } = this.state;
        const { currentToken } = this.props;

        return (
            <Table>
                <TBody>
                    {tokens.map((token, index) => {
                        const isActive =
                            currentToken === token;
                        const setSelectedMarket = () => this._setSelectedToken(token);
                        const tokenSymbol = token.symbol.toUpperCase();
                        return (
                            <TRStyled active={isActive} key={index} onClick={setSelectedMarket}>
                                <CustomTDFirstStyled styles={{ textAlign: 'center', borderBottom: true }}>
                                    <TokenIconAndLabel>
                                        <TokenLabel>
                                            {tokenSymbol}
                                        </TokenLabel>
                                    </TokenIconAndLabel>
                                </CustomTDFirstStyled>
                            </TRStyled>
                        );
                    })}
                </TBody>
            </Table>
        );
    };

    private readonly _setSelectedToken: any = (token: Token) => {
        this.props.changeCurrentToken(token);
        if (this._dropdown.current) {
            this._dropdown.current.closeDropdown();
        }
    };
}

const mapStateToProps = (state: StoreState): PropsToken => {
    return {
        currentToken: getSteadyCurrentToken(state),
    };
};


const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        changeCurrentToken: (token: Token) => dispatch(changeCurrentToken(token)),
    };
};

const TokenDropdownContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(TokenDropdown);

export { TokenDropdown, TokenDropdownContainer };
