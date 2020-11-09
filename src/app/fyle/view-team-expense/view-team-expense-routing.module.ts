import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewTeamExpensePage } from './view-team-expense.page';

const routes: Routes = [
  {
    path: '',
    component: ViewTeamExpensePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewTeamExpensePageRoutingModule {}
