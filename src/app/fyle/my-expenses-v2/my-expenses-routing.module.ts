import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyExpensesV2Page } from './my-expenses-v2.page';

const routes: Routes = [
  {
    path: '',
    component: MyExpensesV2Page,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyExpensesV2PageRoutingModule {}
