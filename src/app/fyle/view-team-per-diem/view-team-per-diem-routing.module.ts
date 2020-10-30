import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewTeamPerDiemPage } from './view-team-per-diem.page';

const routes: Routes = [
  {
    path: '',
    component: ViewTeamPerDiemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewTeamPerDiemPageRoutingModule {}
