import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewTeamReportPageV2 } from './view-team-report-v2.page';

const routes: Routes = [
  {
    path: '',
    component: ViewTeamReportPageV2,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewTeamReportPageV2RoutingModule {}
