import deepFreeze from 'deep-freeze-strict';

import { SidemenuAllowedActions } from '../models/sidemenu-allowed-actions.model';

export const sidemenuAllowedActions: SidemenuAllowedActions = deepFreeze({
  allowedReportsActions: {
    allowedRouteAccess: true,
    approve: true,
    create: true,
    delete: true,
  },
  allowedAdvancesActions: {
    allowedRouteAccess: true,
    approve: true,
    delete: true,
  },
});
