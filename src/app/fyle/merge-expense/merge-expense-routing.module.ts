import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MergeExpensePage } from './merge-expense.page';

const routes: Routes = [
  {
    path: '',
    component: MergeExpensePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MergeExpensePageRoutingModule {}
