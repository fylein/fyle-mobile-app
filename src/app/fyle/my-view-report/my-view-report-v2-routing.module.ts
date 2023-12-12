import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyViewReportPageV2 } from './my-view-report-v2.page';

const routes: Routes = [
  {
    path: '',
    component: MyViewReportPageV2,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyViewReportPageV2RoutingModule {}
