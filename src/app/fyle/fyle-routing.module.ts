import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyExpensesGuardGuard } from '../core/guards/my-expenses-guard.guard';
import { BetaPageFeatureFlagGuard } from '../core/guards/beta-page-feature-flag.guard';

const routes: Routes = [
  {
    path: 'my_dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardPageModule),
  },
  {
    path: 'my_expenses-v2',
    loadChildren: () => import('./my-expenses-v2/my-expenses-v2.module').then((m) => m.MyExpensesV2PageModule),
  },
  {
    path: 'my_expenses',
    loadChildren: () => import('./my-expenses/my-expenses.module').then((m) => m.MyExpensesPageModule),
    canActivate: [MyExpensesGuardGuard],
  },
  {
    path: 'my_advances',
    loadChildren: () => import('./my-advances/my-advances.module').then((m) => m.MyAdvancesPageModule),
  },
  {
    path: 'my_profile',
    loadChildren: () => import('./my-profile/my-profile.module').then((m) => m.MyProfilePageModule),
  },
  {
    path: 'my_reports',
    loadChildren: () => import('./my-reports/my-reports.module').then((m) => m.MyReportsPageModule),
  },
  {
    path: 'my_view_report',
    loadChildren: () => import('./my-view-report/my-view-report.module').then((m) => m.MyViewReportPageModule),
    canActivate: [BetaPageFeatureFlagGuard],
  },
  {
    path: 'my_view_report_beta',
    loadChildren: () => import('./my-view-report/my-view-report-v2.module').then((m) => m.MyViewReportV2PageModule),
  },
  {
    path: 'help',
    loadChildren: () => import('./help/help.module').then((m) => m.HelpPageModule),
  },
  {
    path: 'my_view_advance_request',
    loadChildren: () =>
      import('./my-view-advance-request/my-view-advance-request.module').then((m) => m.MyViewAdvanceRequestPageModule),
  },
  {
    path: 'team_advance',
    loadChildren: () => import('./team-advance/team-advance.module').then((m) => m.TeamAdvancePageModule),
  },
  {
    path: 'add_edit_expense',
    loadChildren: () => import('./add-edit-expense/add-edit-expense.module').then((m) => m.AddEditExpensePageModule),
  },
  {
    path: 'team_reports',
    loadChildren: () => import('./team-reports/team-reports.module').then((m) => m.TeamReportsPageModule),
  },
  {
    path: 'view_team_report',
    loadChildren: () => import('./view-team-report/view-team-report.module').then((m) => m.ViewTeamReportPageModule),
    canActivate: [BetaPageFeatureFlagGuard],
  },
  {
    path: 'view_team_report_beta',
    loadChildren: () =>
      import('./view-team-report/view-team-report-v2.module').then((m) => m.ViewTeamReportPageV2Module),
  },
  {
    path: 'my_view_advance',
    loadChildren: () => import('./my-view-advance/my-view-advance.module').then((m) => m.MyViewAdvancePageModule),
  },
  {
    path: 'delegated_accounts',
    loadChildren: () =>
      import('./delegated-accounts/delegated-accounts.module').then((m) => m.DelegatedAccountsPageModule),
  },
  {
    path: 'view_team_advance',
    loadChildren: () =>
      import('./view-team-advance-request/view-team-advance-request.module').then(
        (m) => m.ViewTeamAdvanceRequestPageModule
      ),
  },
  {
    path: 'notifications',
    loadChildren: () => import('./notifications/notifications.module').then((m) => m.NotificationsPageModule),
  },
  {
    path: 'my_create_report',
    loadChildren: () => import('./my-create-report/my-create-report.module').then((m) => m.MyCreateReportPageModule),
  },
  {
    path: 'add_edit_per_diem',
    loadChildren: () => import('./add-edit-per-diem/add-edit-per-diem.module').then((m) => m.AddEditPerDiemPageModule),
  },
  {
    path: 'add_edit_mileage',
    loadChildren: () => import('./add-edit-mileage/add-edit-mileage.module').then((m) => m.AddEditMileagePageModule),
  },
  {
    path: 'add_edit_advance_request',
    loadChildren: () =>
      import('./add-edit-advance-request/add-edit-advance-request.module').then(
        (m) => m.AddEditAdvanceRequestPageModule
      ),
  },
  {
    path: 'split_expense',
    loadChildren: () => import('./split-expense/split-expense.module').then((m) => m.SplitExpensePageModule),
  },
  {
    path: 'camera_overlay',
    loadChildren: () => import('./camera-overlay/camera-overlay.module').then((m) => m.CameraOverlayPageModule),
  },
  {
    path: 'personal_cards_matched_expenses',
    loadChildren: () =>
      import('./personal-cards-matched-expenses/personal-cards-matched-expenses.module').then(
        (m) => m.PersonalCardsMatchedExpensesPageModule
      ),
  },
  {
    path: 'personal_cards',
    loadChildren: () => import('./personal-cards/personal-cards.module').then((m) => m.PersonalCardsPageModule),
  },
  {
    path: 'view_expense',
    loadChildren: () => import('./view-expense/view-expense.module').then((m) => m.ViewExpensePageModule),
  },
  {
    path: 'view_mileage',
    loadChildren: () => import('./view-mileage/view-mileage.module').then((m) => m.ViewMileagePageModule),
  },
  {
    path: 'view_per_diem',
    loadChildren: () => import('./view-per-diem/view-per-diem.module').then((m) => m.ViewPerDiemPageModule),
  },
  {
    path: 'potential-duplicates',
    loadChildren: () =>
      import('./potential-duplicates/potential-duplicates.module').then((m) => m.PotentialDuplicatesPageModule),
  },
  {
    path: 'merge_expense',
    loadChildren: () => import('./merge-expense/merge-expense.module').then((m) => m.MergeExpensePageModule),
  },
  {
    path: 'manage_corporate_cards',
    loadChildren: () =>
      import('./manage-corporate-cards/manage-corporate-cards.module').then((m) => m.ManageCorporateCardsPageModule),
  },
  {
    path: 'my-expenses',
    loadChildren: () => import('./my-expenses/my-expenses.module').then((m) => m.MyExpensesPageModule),
  },
];

export const fyleRoutes = routes;

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FyleRoutingModule {}
