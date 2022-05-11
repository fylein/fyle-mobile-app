import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { viewTeamAdvanceRequestPage } from './view-team-advance-request.page';

const routes: Routes = [
  {
    path: '',
    component: viewTeamAdvanceRequestPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class viewTeamAdvanceRequestPageRoutingModule {}
