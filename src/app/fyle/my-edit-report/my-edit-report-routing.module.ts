import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyEditReportPage } from './my-edit-report.page';

const routes: Routes = [
  {
    path: '',
    component: MyEditReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyEditReportPageRoutingModule {}
