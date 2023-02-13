export interface SidemenuAllowedActions {
  allowedReportsActions: {
    allowedRouteAccess: boolean;
    approve: boolean;
    create: boolean;
    delete: boolean;
  };
  allowedAdvancesActions: {
    allowedRouteAccess: boolean;
    approve: boolean;
    delete: boolean;
    creaet?: boolean;
  };
}
