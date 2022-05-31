import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyAddEditTripPage } from './my-add-edit-trip.page';

const routes: Routes = [
  {
    path: '',
    component: MyAddEditTripPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyAddEditTripPageRoutingModule {}
