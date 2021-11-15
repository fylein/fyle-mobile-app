import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyViewExpensePage } from './my-view-expense.page';

const routes: Routes = [
  {
    path: '',
    component: MyViewExpensePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyViewExpensePageRoutingModule {}
