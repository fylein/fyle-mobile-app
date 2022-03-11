import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PendingVerificationPage } from './pending-verification.page';

const routes: Routes = [
  {
    path: '',
    component: PendingVerificationPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingVerificationPageRoutingModule {}
