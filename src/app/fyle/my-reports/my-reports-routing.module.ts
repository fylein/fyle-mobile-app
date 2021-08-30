import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyReportsPage } from './my-reports.page';

const routes: Routes = [
  {
    path: '',
    component: MyReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyReportsPageRoutingModule {}
