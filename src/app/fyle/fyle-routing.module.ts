import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyAdvancesPageModule } from './my-advances/my-advances.module';
import { MyExpensesPageModule } from './my-expenses/my-expenses.module';
import { DashboardPageModule } from './dashboard/dashboard.module';
import { MyProfilePageModule } from './my-profile/my-profile.module';
import { MyReportsPageModule } from './my-reports/my-reports.module';
import { MyViewReportPageModule } from './my-view-report/my-view-report.module';
import { HelpPageModule } from './help/help.module';
import { MyViewAdvanceRequestPageModule } from './my-view-advance-request/my-view-advance-request.module';
import { TeamAdvancePageModule } from './team-advance/team-advance.module';
import { AddEditExpensePageModule } from './add-edit-expense/add-edit-expense.module';
import { TeamReportsPageModule } from './team-reports/team-reports.module';
import { ViewTeamReportPageModule } from './view-team-report/view-team-report.module';
import { MyViewAdvancePageModule } from './my-view-advance/my-view-advance.module';
import { DelegatedAccountsPageModule } from './delegated-accounts/delegated-accounts.module';
import { ViewTeamAdvanceRequestPageModule } from './view-team-advance-request/view-team-advance-request.module';
import { NotificationsPageModule } from './notifications/notifications.module';
import { MyCreateReportPageModule } from './my-create-report/my-create-report.module';
import { AddEditPerDiemPageModule } from './add-edit-per-diem/add-edit-per-diem.module';
import { AddEditMileagePageModule } from './add-edit-mileage/add-edit-mileage.module';
import { AddEditAdvanceRequestPageModule } from './add-edit-advance-request/add-edit-advance-request.module';
import { SplitExpensePageModule } from './split-expense/split-expense.module';
import { CameraOverlayPageModule } from './camera-overlay/camera-overlay.module';
import { PersonalCardsMatchedExpensesPageModule } from './personal-cards-matched-expenses/personal-cards-matched-expenses.module';
import { PersonalCardsPageModule } from './personal-cards/personal-cards.module';
import { ViewExpensePageModule } from './view-expense/view-expense.module';
import { ViewMileagePageModule } from './view-mileage/view-mileage.module';
import { ViewPerDiemPageModule } from './view-per-diem/view-per-diem.module';
import { PotentialDuplicatesPageModule } from './potential-duplicates/potential-duplicates.module';
import { MergeExpensePageModule } from './merge-expense/merge-expense.module';
import { ManageCorporateCardsPageModule } from './manage-corporate-cards/manage-corporate-cards.module';

const routes: Routes = [
  {
    path: 'my_dashboard',
    loadChildren: (): Promise<DashboardPageModule> =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardPageModule),
  },
  {
    path: 'my_expenses',
    loadChildren: (): Promise<MyExpensesPageModule> =>
      import('./my-expenses/my-expenses.module').then((m) => m.MyExpensesPageModule),
  },
  {
    path: 'my_advances',
    loadChildren: (): Promise<MyAdvancesPageModule> =>
      import('./my-advances/my-advances.module').then((m) => m.MyAdvancesPageModule),
  },
  {
    path: 'my_profile',
    loadChildren: (): Promise<MyProfilePageModule> =>
      import('./my-profile/my-profile.module').then((m) => m.MyProfilePageModule),
  },
  {
    path: 'my_reports',
    loadChildren: (): Promise<MyReportsPageModule> =>
      import('./my-reports/my-reports.module').then((m) => m.MyReportsPageModule),
  },
  {
    path: 'my_view_report',
    loadChildren: (): Promise<MyViewReportPageModule> =>
      import('./my-view-report/my-view-report.module').then((m) => m.MyViewReportPageModule),
  },
  {
    path: 'help',
    loadChildren: (): Promise<HelpPageModule> => import('./help/help.module').then((m) => m.HelpPageModule),
  },
  {
    path: 'my_view_advance_request',
    loadChildren: (): Promise<MyViewAdvanceRequestPageModule> =>
      import('./my-view-advance-request/my-view-advance-request.module').then((m) => m.MyViewAdvanceRequestPageModule),
  },
  {
    path: 'team_advance',
    loadChildren: (): Promise<TeamAdvancePageModule> =>
      import('./team-advance/team-advance.module').then((m) => m.TeamAdvancePageModule),
  },
  {
    path: 'add_edit_expense',
    loadChildren: (): Promise<AddEditExpensePageModule> =>
      import('./add-edit-expense/add-edit-expense.module').then((m) => m.AddEditExpensePageModule),
  },
  {
    path: 'team_reports',
    loadChildren: (): Promise<TeamReportsPageModule> =>
      import('./team-reports/team-reports.module').then((m) => m.TeamReportsPageModule),
  },
  {
    path: 'view_team_report',
    loadChildren: (): Promise<ViewTeamReportPageModule> =>
      import('./view-team-report/view-team-report.module').then((m) => m.ViewTeamReportPageModule),
  },
  {
    path: 'my_view_advance',
    loadChildren: (): Promise<MyViewAdvancePageModule> =>
      import('./my-view-advance/my-view-advance.module').then((m) => m.MyViewAdvancePageModule),
  },
  {
    path: 'delegated_accounts',
    loadChildren: (): Promise<DelegatedAccountsPageModule> =>
      import('./delegated-accounts/delegated-accounts.module').then((m) => m.DelegatedAccountsPageModule),
  },
  {
    path: 'view_team_advance',
    loadChildren: (): Promise<ViewTeamAdvanceRequestPageModule> =>
      import('./view-team-advance-request/view-team-advance-request.module').then(
        (m) => m.ViewTeamAdvanceRequestPageModule
      ),
  },
  {
    path: 'notifications',
    loadChildren: (): Promise<NotificationsPageModule> =>
      import('./notifications/notifications.module').then((m) => m.NotificationsPageModule),
  },
  {
    path: 'my_create_report',
    loadChildren: (): Promise<MyCreateReportPageModule> =>
      import('./my-create-report/my-create-report.module').then((m) => m.MyCreateReportPageModule),
  },
  {
    path: 'add_edit_per_diem',
    loadChildren: (): Promise<AddEditPerDiemPageModule> =>
      import('./add-edit-per-diem/add-edit-per-diem.module').then((m) => m.AddEditPerDiemPageModule),
  },
  {
    path: 'add_edit_mileage',
    loadChildren: (): Promise<AddEditMileagePageModule> =>
      import('./add-edit-mileage/add-edit-mileage.module').then((m) => m.AddEditMileagePageModule),
  },
  {
    path: 'add_edit_advance_request',
    loadChildren: (): Promise<AddEditAdvanceRequestPageModule> =>
      import('./add-edit-advance-request/add-edit-advance-request.module').then(
        (m) => m.AddEditAdvanceRequestPageModule
      ),
  },
  {
    path: 'split_expense',
    loadChildren: (): Promise<SplitExpensePageModule> =>
      import('./split-expense/split-expense.module').then((m) => m.SplitExpensePageModule),
  },
  {
    path: 'camera_overlay',
    loadChildren: (): Promise<CameraOverlayPageModule> =>
      import('./camera-overlay/camera-overlay.module').then((m) => m.CameraOverlayPageModule),
  },
  {
    path: 'personal_cards_matched_expenses',
    loadChildren: (): Promise<PersonalCardsMatchedExpensesPageModule> =>
      import('./personal-cards-matched-expenses/personal-cards-matched-expenses.module').then(
        (m) => m.PersonalCardsMatchedExpensesPageModule
      ),
  },
  {
    path: 'personal_cards',
    loadChildren: (): Promise<PersonalCardsPageModule> =>
      import('./personal-cards/personal-cards.module').then((m) => m.PersonalCardsPageModule),
  },
  {
    path: 'view_expense',
    loadChildren: (): Promise<ViewExpensePageModule> =>
      import('./view-expense/view-expense.module').then((m) => m.ViewExpensePageModule),
  },
  {
    path: 'view_mileage',
    loadChildren: (): Promise<ViewMileagePageModule> =>
      import('./view-mileage/view-mileage.module').then((m) => m.ViewMileagePageModule),
  },
  {
    path: 'view_per_diem',
    loadChildren: (): Promise<ViewPerDiemPageModule> =>
      import('./view-per-diem/view-per-diem.module').then((m) => m.ViewPerDiemPageModule),
  },
  {
    path: 'potential-duplicates',
    loadChildren: (): Promise<PotentialDuplicatesPageModule> =>
      import('./potential-duplicates/potential-duplicates.module').then((m) => m.PotentialDuplicatesPageModule),
  },
  {
    path: 'merge_expense',
    loadChildren: (): Promise<MergeExpensePageModule> =>
      import('./merge-expense/merge-expense.module').then((m) => m.MergeExpensePageModule),
  },
  {
    path: 'manage_corporate_cards',
    loadChildren: (): Promise<ManageCorporateCardsPageModule> =>
      import('./manage-corporate-cards/manage-corporate-cards.module').then((m) => m.ManageCorporateCardsPageModule),
  },
];

export const fyleRoutes = routes;

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FyleRoutingModule {}
