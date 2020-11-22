import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApproverModalPage } from './approver-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ApproverModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApproverModalPageRoutingModule {}
