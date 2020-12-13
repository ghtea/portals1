
import catalogSituationAuth from './catalogSituation/auth';
import catalogSituationStatus from './catalogSituation/status';
import catalogSituationPortal from './catalogSituation/portal';

import {LevelTimeBanner} from 'store/actions/notification';


export type KindSituation = 'success' | 'hint'| 'error' | 'warning';

export interface CatalogSituation {
    [index:string]: {
        kind: KindSituation;
        levelTimeBanner?: LevelTimeBanner;
    };
}

const catalogSituation: CatalogSituation = {
    
    ...catalogSituationAuth,
    ...catalogSituationStatus,
    ...catalogSituationPortal

    
}

export default catalogSituation;