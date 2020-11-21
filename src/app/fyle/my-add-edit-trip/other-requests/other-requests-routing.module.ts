import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OtherRequestsPage } from './other-requests.page';

const routes: Routes = [
  {
    path: '',
    component: OtherRequestsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OtherRequestsPageRoutingModule {}
