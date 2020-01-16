import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

export enum DropdownPositions {
    Center,
    Left,
    Right,
}

interface DropdownWrapperBodyProps {
    horizontalPosition?: DropdownPositions;
    steadyCustomTop?: Boolean;
    steadyCustomWidth?: Boolean;
    steadyCustomZIndex?: Boolean;
}

interface Props extends HTMLAttributes<HTMLDivElement>, DropdownWrapperBodyProps {
    body: React.ReactNode;
    header: React.ReactNode;
    shouldCloseDropdownOnClickOutside?: boolean;
}

const DropdownWrapper = styled.div`
    position: relative;
`;

const DropdownWrapperHeader = styled.div`
    width: 100%;
    cursor: pointer;
    position: relative;
`;

const DropdownWrapperBody = styled.div<DropdownWrapperBodyProps>`
    position: absolute;

    ${props => (props.steadyCustomTop ? 'top: calc(100% - 25px);' : 'top: calc(100% + 15px);')}

    ${props => (props.steadyCustomWidth ? 'width: 100%;' : '')}
    
    ${props => (props.steadyCustomZIndex ? 'z-index: 13;' : '')}

    ${props => (props.horizontalPosition === DropdownPositions.Left ? 'left: 0;' : '')}

    ${props => (props.horizontalPosition === DropdownPositions.Center ? 'left: 50%; transform: translateX(-50%);' : '')}

    ${props => (props.horizontalPosition === DropdownPositions.Right ? 'right: 0;' : '')}
`;

interface State {
    isOpen: boolean;
}

export class Dropdown extends React.Component<Props, State> {
    public readonly state: State = {
        isOpen: false,
    };
    private _wrapperRef: any;

    public render = () => {
        const { 
            header, 
            body, 
            horizontalPosition = DropdownPositions.Left, 
            steadyCustomTop = false, 
            steadyCustomWidth = false, 
            steadyCustomZIndex = false,
            ...restProps 
        } = this.props;

        return (
            <DropdownWrapper ref={this._setWrapperRef} {...restProps}>
                <DropdownWrapperHeader onClick={this._toggleDropdown}>{header}</DropdownWrapperHeader>
                {this.state.isOpen ? (
                    <DropdownWrapperBody 
                    horizontalPosition={horizontalPosition} 
                    steadyCustomTop={steadyCustomTop} 
                    steadyCustomWidth={steadyCustomWidth} 
                    steadyCustomZIndex={steadyCustomZIndex} 
                    onClick={this._closeDropdownBody}>
                        {body}
                    </DropdownWrapperBody>
                ) : null}
            </DropdownWrapper>
        );
    };

    public componentDidMount = () => {
        document.addEventListener('mousedown', this._handleClickOutside);
    };

    public componentWillUnmount = () => {
        document.removeEventListener('mousedown', this._handleClickOutside);
    };

    public closeDropdown = () => {
        this.setState({ isOpen: false });
    };

    private readonly _setWrapperRef = (node: any) => {
        this._wrapperRef = node;
    };

    private readonly _handleClickOutside = (event: any) => {
        const { shouldCloseDropdownOnClickOutside = true } = this.props;
        if (this._wrapperRef && !this._wrapperRef.contains(event.target)) {
            if (shouldCloseDropdownOnClickOutside) {
                this.closeDropdown();
            }
        }
    };

    private readonly _toggleDropdown = () => {
        this.setState({ isOpen: !this.state.isOpen });
    };

    private readonly _closeDropdownBody = () => {
        const { shouldCloseDropdownOnClickOutside = true } = this.props;
        if (shouldCloseDropdownOnClickOutside) {
            this.closeDropdown();
        }
    };
}
