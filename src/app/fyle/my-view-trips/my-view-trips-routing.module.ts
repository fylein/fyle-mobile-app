import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyViewTripsPage } from './my-view-trips.page';

const routes: Routes = [
  {
    path: '',
    component: MyViewTripsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyViewTripsPageRoutingModule {}
