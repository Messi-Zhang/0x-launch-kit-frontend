import React from 'react';
import { Route, Switch } from 'react-router';
import { ThemeProvider } from 'styled-components';
import { STEADY_APP_BASE_PATH } from '../../common/constants';
import { AdBlockDetector } from '../common/adblock_detector';
import { GeneralLayout } from '../general_layout';
import { getThemeByMarketplace } from '../../themes/theme_meta_data_utils';
import { MARKETPLACES } from '../../util/types';

import { ToolbarContentContainer } from './common/toolbar_content';
import { Exchange } from './pages/exchange';

const toolbar = <ToolbarContentContainer />;

export const SteadyApp = () => {
    const themeColor = getThemeByMarketplace(MARKETPLACES.ERC20);

    return (
        <ThemeProvider theme={themeColor}>
            <GeneralLayout toolbar={toolbar}>
                <AdBlockDetector />
                <Switch>
                    <Route exact={true} path={`${STEADY_APP_BASE_PATH}/`} component={Exchange} />
                </Switch>
            </GeneralLayout>
        </ThemeProvider>
    );
};
