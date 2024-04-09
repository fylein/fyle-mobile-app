export interface SidemenuAllowedActions {
  allowedReportsActions: Partial<{
    allowedRouteAccess: boolean;
    approve: boolean;
    create: boolean;
    delete: boolean;
  }>;
  allowedAdvancesActions: Partial<{
    allowedRouteAccess: boolean;
    approve: boolean;
    delete: boolean;
    create?: boolean;
  }>;
}
