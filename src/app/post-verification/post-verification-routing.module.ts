import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'invited_user',
    loadChildren: () => import('./invited-user/invited-user.module').then((m) => m.InvitedUserPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostVerificationRoutingModule {}
