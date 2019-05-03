import React from 'react';
import { connect } from 'react-redux';

import { CheckMetamaskStateModalContainer } from '../../components/common/check_metamask_state_modal_container';
import { getMyCollectibles } from '../../store/selectors';
import { Collectible, StoreState } from '../../util/types';
import { CollectibleAsset } from '../components/collectible_asset';
import { ColumnMyCollectibles } from '../components/column_my_collectibles';

interface Props {
    myCollectibles: Collectible[];
}

class MyCollectibles extends React.Component<Props> {
    public render = () => {
        const { myCollectibles } = this.props;
        const rows = myCollectibles.map((item, index) => {
            const { name, price, image, color } = item;
            return <CollectibleAsset name={name} price={price} image={image} color={color} key={index} />;
        });

        const groupSize = 2;
        const rowsReduced = rows.reduce((row: any[], item, index) => {
            const chunkIndex = Math.floor(index / groupSize);

            if (!row[chunkIndex]) {
                row[chunkIndex] = [] as any[];
            }

            row[chunkIndex].push(item);

            return row;
        }, []);

        return (
            <>
                {rowsReduced.map((items, index) => {
                    return (
                        <React.Fragment key={index}>
                            <ColumnMyCollectibles>
                                {items.map((item: any) => {
                                    return item;
                                })}
                            </ColumnMyCollectibles>
                        </React.Fragment>
                    );
                })}
                <CheckMetamaskStateModalContainer />
            </>
        );
    };
}

const mapStateToProps = (state: StoreState): Props => {
    return {
        myCollectibles: getMyCollectibles(state),
    };
};

const MyCollectiblesContainer = connect(mapStateToProps)(MyCollectibles);

export { MyCollectibles, MyCollectiblesContainer };
