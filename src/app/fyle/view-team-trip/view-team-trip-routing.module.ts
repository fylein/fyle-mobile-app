import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewTeamTripPage } from './view-team-trip.page';

const routes: Routes = [
  {
    path: '',
    component: ViewTeamTripPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewTeamTripPageRoutingModule {}
