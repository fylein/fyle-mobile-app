import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyAdvancesPage } from './my-advances.page';

const routes: Routes = [
  {
    path: '',
    component: MyAdvancesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyAdvancesPageRoutingModule {}
