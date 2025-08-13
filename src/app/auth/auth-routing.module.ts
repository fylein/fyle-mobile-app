import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'sign_in',
    loadChildren: () => import('./sign-in/sign-in.module').then((m) => m.SignInPageModule),
  },
  {
    path: 'switch_org',
    loadChildren: () => import('./switch-org/switch-org.module').then((m) => m.SwitchOrgPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'app_version',
    loadChildren: () => import('./app-version/app-version.module').then((m) => m.AppVersionPageModule),
  },
  {
    path: 'reset_password',
    loadChildren: () => import('./reset-password/reset-password.module').then((m) => m.ResetPasswordPageModule),
  },
  {
    path: 'verify',
    loadChildren: () => import('./verify/verify.module').then((m) => m.VerifyPageModule),
  },
  {
    path: 'new_password',
    loadChildren: () => import('./new-password/new-password.module').then((m) => m.NewPasswordPageModule),
  },
  {
    path: 'disabled',
    loadChildren: () => import('./disabled/disabled.module').then((m) => m.DisabledPageModule),
  },
  {
    path: 'pending_verification',
    loadChildren: () =>
      import('./pending-verification/pending-verification.module').then((m) => m.PendingVerificationPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
