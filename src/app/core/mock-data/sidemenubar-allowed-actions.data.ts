import { ReportAllowedActions } from '../models/allowed-actions.model';

export const advanceAllowedActionsResponse: ReportAllowedActions = {
  allowedRouteAccess: true,
  approve: false,
  create: undefined,
  delete: true,
};

export const reportAllowedActionsResponse: ReportAllowedActions = {
  allowedRouteAccess: true,
  approve: false,
  create: true,
  delete: true,
};
