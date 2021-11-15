import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewExpensePage } from './view-expense.page';

const routes: Routes = [
  {
    path: '',
    component: ViewExpensePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewExpensePageRoutingModule {}
