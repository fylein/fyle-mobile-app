import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'my_dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'my_expenses',
    loadChildren: () => import('./my-expenses/my-expenses.module').then(m => m.MyExpensesPageModule)
  },
  {
    path: 'camera_overlay',
    loadChildren: () => import('./camera-overlay/camera-overlay.module').then(m => m.CameraOverlayPageModule)
  },
  {
    path: 'my_advances',
    loadChildren: () => import('./my-advances/my-advances.module').then(m => m.MyAdvancesPageModule)
  },
  {
    path: 'team_trips',
    loadChildren: () => import('./team-trips/team-trips.module').then( m => m.TeamTripsPageModule)
  },
  {
    path: 'view_team_trips',
    loadChildren: () => import('./view-team-trip/view-team-trip.module').then( m => m.ViewTeamTripPageModule)
  },
  {
    path: 'my_profile',
    loadChildren: () => import('./my-profile/my-profile.module').then(m => m.MyProfilePageModule)
  },
  {
    path: 'my_trips',
    loadChildren: () => import('./my-trips/my-trips.module').then(m => m.MyTripsPageModule)
  },
  {
    path: 'my_view_trips',
    loadChildren: () => import('./my-view-trips/my-view-trips.module').then(m => m.MyViewTripsPageModule)
  },
  {
    path: 'my_reports',
    loadChildren: () => import('./my-reports/my-reports.module').then(m => m.MyReportsPageModule)
  },
  {
    path: 'my_view_report',
    loadChildren: () => import('./my-view-report/my-view-report.module').then(m => m.MyViewReportPageModule)
  },
  {
    path: 'help',
    loadChildren: () => import('./help/help.module').then( m => m.HelpPageModule)
  },
  {
    path: 'team_advance',
    loadChildren: () => import('./team-advance/team-advance.module').then( m => m.TeamAdvancePageModule)
  },
  {
    path: 'team_reports',
    loadChildren: () => import('./team-reports/team-reports.module').then( m => m.TeamReportsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FyleRoutingModule { }