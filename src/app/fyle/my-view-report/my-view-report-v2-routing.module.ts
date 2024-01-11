import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyViewReportV2Page } from './my-view-report-v2.page';

const routes: Routes = [
  {
    path: '',
    component: MyViewReportV2Page,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyViewReportPageV2RoutingModule {}
