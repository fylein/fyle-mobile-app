import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'my_dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'my_expenses',
    loadChildren: () => import('./my-expenses/my-expenses.module').then( m => m.MyExpensesPageModule)
  },
  {
    path: 'camera_overlay',
    loadChildren: () => import('./camera-overlay/camera-overlay.module').then( m => m.CameraOverlayPageModule)
  },
  {
    path: 'my_advances',
    loadChildren: () => import('./my-advances/my-advances.module').then( m => m.MyAdvancesPageModule)
  },
  {
    path: 'my_trips',
    loadChildren: () => import('./my-trips/my-trips.module').then( m => m.MyTripsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FyleRoutingModule { }