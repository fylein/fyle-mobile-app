import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyCreateReportPage } from './my-create-report.page';

const routes: Routes = [
  {
    path: '',
    component: MyCreateReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyCreateReportPageRoutingModule {}
