import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyViewAdvancePage } from './my-view-advance.page';

const routes: Routes = [
  {
    path: '',
    component: MyViewAdvancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyViewAdvancePageRoutingModule {}
