import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddEditExpensePage } from './add-edit-expense.page';

const routes: Routes = [
  {
    path: '',
    component: AddEditExpensePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddEditExpensePageRoutingModule {}
