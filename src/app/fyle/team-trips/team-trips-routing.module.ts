import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeamTripsPage } from './team-trips.page';

const routes: Routes = [
  {
    path: '',
    component: TeamTripsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamTripsPageRoutingModule {}
