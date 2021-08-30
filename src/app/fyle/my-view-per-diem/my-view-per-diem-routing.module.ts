import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyViewPerDiemPage } from './my-view-per-diem.page';

const routes: Routes = [
  {
    path: '',
    component: MyViewPerDiemPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyViewPerDiemPageRoutingModule {}
