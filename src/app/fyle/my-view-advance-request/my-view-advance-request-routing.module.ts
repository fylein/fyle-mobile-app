import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyViewAdvanceRequestPage } from './my-view-advance-request.page';

const routes: Routes = [
  {
    path: '',
    component: MyViewAdvanceRequestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyViewAdvanceRequestPageRoutingModule {}
