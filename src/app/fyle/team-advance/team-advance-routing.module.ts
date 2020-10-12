import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeamAdvancePage } from './team-advance.page';

const routes: Routes = [
  {
    path: '',
    component: TeamAdvancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamAdvancePageRoutingModule {}
