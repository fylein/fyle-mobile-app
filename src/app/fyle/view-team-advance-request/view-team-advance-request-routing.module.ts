import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewTeamAdvanceRequestPage } from './view-team-advance-request.page';

const routes: Routes = [
  {
    path: '',
    component: ViewTeamAdvanceRequestPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewTeamAdvanceRequestPageRoutingModule {}
