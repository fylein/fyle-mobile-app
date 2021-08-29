import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DisabledPage } from './disabled.page';

const routes: Routes = [
  {
    path: '',
    component: DisabledPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DisabledPageRoutingModule {}
