import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeamReportsPage } from './team-reports.page';

const routes: Routes = [
  {
    path: '',
    component: TeamReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamReportsPageRoutingModule {}
