import { Routes } from '@angular/router';
import { OptInGuard } from '../core/guards/opt-in.guard';
import { OnboardingGuard } from '../core/guards/onboarding.guard';

const routes: Routes = [
  {
    path: 'my_dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
    canActivate: [OnboardingGuard],
    data: {
      allowedDelegationScopes: ['SUBMIT', 'APPROVE'],
    },
  },
  {
    path: 'my_expenses',
    loadComponent: () => import('./my-expenses/my-expenses.page').then((m) => m.MyExpensesPage),
    data: {
      allowedDelegationScopes: ['SUBMIT'],
    },
  },
  {
    path: 'my_advances',
    loadComponent: () => import('./my-advances/my-advances.page').then((m) => m.MyAdvancesPage),
  },
  {
    path: 'my_profile',
    loadComponent: () => import('./my-profile/my-profile.page').then((m) => m.MyProfilePage),
  },
  {
    path: 'my_reports',
    loadComponent: () => import('./my-reports/my-reports.page').then((m) => m.MyReportsPage),
    data: {
      allowedDelegationScopes: ['SUBMIT'],
    },
  },
  {
    path: 'my_view_report',
    loadComponent: () => import('./my-view-report/my-view-report.page').then((m) => m.MyViewReportPage),
    data: {
      allowedDelegationScopes: ['SUBMIT'],
    },
  },
  {
    path: 'help',
    loadComponent: () => import('./help/help.page').then((m) => m.HelpPage),
  },
  {
    path: 'my_view_advance_request',
    loadComponent: () =>
      import('./my-view-advance-request/my-view-advance-request.page').then((m) => m.MyViewAdvanceRequestPage),
  },
  {
    path: 'team_advance',
    loadComponent: () => import('./team-advance/team-advance.page').then((m) => m.TeamAdvancePage),
  },
  {
    path: 'add_edit_expense',
    loadComponent: () => import('./add-edit-expense/add-edit-expense.page').then((m) => m.AddEditExpensePage),
    data: {
      allowedDelegationScopes: ['SUBMIT'],
    },
  },
  {
    path: 'spender_onboarding',
    loadComponent: () => import('./spender-onboarding/spender-onboarding.page').then((m) => m.SpenderOnboardingPage),
  },
  {
    path: 'team_reports',
    loadComponent: () => import('./team-reports/team-reports.page').then((m) => m.TeamReportsPage),
    data: {
      allowedDelegationScopes: ['APPROVE'],
    },
  },
  {
    path: 'view_team_report',
    loadComponent: () => import('./view-team-report/view-team-report.page').then((m) => m.ViewTeamReportPage),
    data: {
      allowedDelegationScopes: ['APPROVE'],
    },
  },
  {
    path: 'my_view_advance',
    loadComponent: () => import('./my-view-advance/my-view-advance.page').then((m) => m.MyViewAdvancePage),
  },
  {
    path: 'delegated_accounts',
    loadComponent: () => import('./delegated-accounts/delegated-accounts.page').then((m) => m.DelegatedAccountsPage),
    data: {
      // Every delegatee should be able to switch back.
      allowedDelegationScopes: ['SUBMIT', 'APPROVE'],
    },
  },
  {
    path: 'view_team_advance',
    loadComponent: () =>
      import('./view-team-advance-request/view-team-advance-request.page').then((m) => m.ViewTeamAdvanceRequestPage),
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./notifications/notifications-beta/notifications-beta.page').then((m) => m.NotificationsBetaPage),
  },
  {
    path: 'my_create_report',
    loadComponent: () => import('./my-create-report/my-create-report.page').then((m) => m.MyCreateReportPage),
    data: {
      allowedDelegationScopes: ['SUBMIT'],
    },
  },
  {
    path: 'add_edit_per_diem',
    loadComponent: () => import('./add-edit-per-diem/add-edit-per-diem.page').then((m) => m.AddEditPerDiemPage),
    data: {
      allowedDelegationScopes: ['SUBMIT'],
    },
  },
  {
    path: 'add_edit_mileage',
    loadComponent: () => import('./add-edit-mileage/add-edit-mileage.page').then((m) => m.AddEditMileagePage),
    data: {
      allowedDelegationScopes: ['SUBMIT'],
    },
  },
  {
    path: 'add_edit_advance_request',
    loadComponent: () =>
      import('./add-edit-advance-request/add-edit-advance-request.page').then((m) => m.AddEditAdvanceRequestPage),
  },
  {
    path: 'split_expense',
    loadComponent: () => import('./split-expense/split-expense.page').then((m) => m.SplitExpensePage),
    data: {
      allowedDelegationScopes: ['SUBMIT'],
    },
  },
  {
    path: 'camera_overlay',
    loadComponent: () => import('./camera-overlay/camera-overlay.page').then((m) => m.CameraOverlayPage),
    data: {
      allowedDelegationScopes: ['SUBMIT'],
    },
  },
  {
    path: 'personal_cards_matched_expenses',
    loadComponent: () =>
      import('./personal-cards-matched-expenses/personal-cards-matched-expenses.page').then(
        (m) => m.PersonalCardsMatchedExpensesPage,
      ),
  },
  {
    path: 'personal_cards',
    loadComponent: () => import('./personal-cards/personal-cards.page').then((m) => m.PersonalCardsPage),
  },
  {
    path: 'view_expense',
    loadComponent: () => import('./view-expense/view-expense.page').then((m) => m.ViewExpensePage),
    data: {
      allowedDelegationScopes: ['SUBMIT', 'APPROVE'],
    },
  },
  {
    path: 'view_mileage',
    loadComponent: () => import('./view-mileage/view-mileage.page').then((m) => m.ViewMileagePage),
    data: {
      allowedDelegationScopes: ['SUBMIT', 'APPROVE'],
    },
  },
  {
    path: 'view_per_diem',
    loadComponent: () => import('./view-per-diem/view-per-diem.page').then((m) => m.ViewPerDiemPage),
    data: {
      allowedDelegationScopes: ['SUBMIT', 'APPROVE'],
    },
  },
  {
    path: 'potential-duplicates',
    loadComponent: () =>
      import('./potential-duplicates/potential-duplicates.page').then((m) => m.PotentialDuplicatesPage),
    data: {
      allowedDelegationScopes: ['SUBMIT'],
    },
  },
  {
    path: 'merge_expense',
    loadComponent: () => import('./merge-expense/merge-expense.page').then((m) => m.MergeExpensePage),
  },
  {
    path: 'manage_corporate_cards',
    loadComponent: () =>
      import('./manage-corporate-cards/manage-corporate-cards.page').then((m) => m.ManageCorporateCardsPage),
  },
];

// Apply OptInGuard to all routes
routes.forEach((route) => {
  route.canActivate = route.canActivate || [];
  route.canActivate.push(OptInGuard);
});

export const fyleRoutes = routes;
