import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeamTripsPage } from './team-trips.page';

const routes: Routes = [
  {
    path: '',
    component: TeamTripsPage,
  },
  {
    path: 'view-team-trip/:id',
    loadChildren: () => import('./view-team-trip/view-team-trip.module').then( m => m.ViewTeamTripPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamTripsPageRoutingModule {}
