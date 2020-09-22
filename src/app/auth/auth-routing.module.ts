import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'sign-in',
    loadChildren: () => import('./sign-in/sign-in.module').then(m => m.SignInPageModule)
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./sign-up/sign-up.module').then(m => m.SignUpPageModule)
  },
  {
    path: 'switch-org',
    loadChildren: () => import('./switch-org/switch-org.module').then(m => m.SwitchOrgPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'request_invitation',
    loadChildren: () => import('./request-invitation/request-invitation.module').then( m => m.RequestInvitationPageModule)
  },
  {
    path: 'app_version',
    loadChildren: () => import('./app-version/app-version.module').then( m => m.AppVersionPageModule)
  },
  {
    path: 'reset_password',
    loadChildren: () => import('./reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }