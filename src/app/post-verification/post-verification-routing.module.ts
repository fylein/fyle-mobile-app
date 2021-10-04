import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'setup_account',
    loadChildren: () => import('./setup-account/setup-account.module').then((m) => m.SetupAccountPageModule),
  },
  {
    path: 'invited_user',
    loadChildren: () => import('./invited-user/invited-user.module').then((m) => m.InvitedUserPageModule),
  },
  {
    path: 'setup_account_preferences',
    loadChildren: () =>
      import('./setup-account-preferences/setup-account-preferences.module').then(
        (m) => m.SetupAccountPreferencesPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostVerificationRoutingModule {}
