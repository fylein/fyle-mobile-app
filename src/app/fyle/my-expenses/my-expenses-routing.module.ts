import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyExpensesPage } from './my-expenses.page';

const routes: Routes = [
  {
    path: '',
    component: MyExpensesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyExpensesPageRoutingModule {}
