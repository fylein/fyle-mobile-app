import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvitedUserPage } from './invited-user.page';

const routes: Routes = [
  {
    path: '',
    component: InvitedUserPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvitedUserPageRoutingModule {}
