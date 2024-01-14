import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyViewReportPage } from './my-view-report.page';

const routes: Routes = [
  {
    path: '',
    component: MyViewReportPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyViewReportPageRoutingModule {}
