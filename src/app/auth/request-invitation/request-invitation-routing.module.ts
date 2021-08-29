import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RequestInvitationPage } from './request-invitation.page';

const routes: Routes = [
  {
    path: '',
    component: RequestInvitationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestInvitationPageRoutingModule {}
