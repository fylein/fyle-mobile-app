import deepFreeze from 'deep-freeze-strict';

import { ReportAllowedActions } from '../models/allowed-actions.model';

export const reportAllowedActionsResponse: ReportAllowedActions = deepFreeze({
  allowedRouteAccess: true,
  approve: true,
  create: true,
  delete: true,
});
