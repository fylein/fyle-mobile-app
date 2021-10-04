import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaptureReceiptPage } from './capture-receipt.page';

const routes: Routes = [
  {
    path: '',
    component: CaptureReceiptPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaptureReceiptPageRoutingModule {}
