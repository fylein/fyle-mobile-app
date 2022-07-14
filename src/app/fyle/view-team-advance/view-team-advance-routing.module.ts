import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewTeamAdvancePage } from './view-team-advance.page';

const routes: Routes = [
  {
    path: '',
    component: ViewTeamAdvancePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewTeamAdvancePageRoutingModule {}
