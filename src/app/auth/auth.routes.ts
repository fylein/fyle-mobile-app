import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: 'sign_in',
    loadComponent: () => import('./sign-in/sign-in.page').then((m) => m.SignInPage),
  },
  {
    path: 'switch_org',
    loadComponent: () => import('./switch-org/switch-org.page').then((m) => m.SwitchOrgPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'app_version',
    loadComponent: () => import('./app-version/app-version.page').then((m) => m.AppVersionPage),
  },
  {
    path: 'reset_password',
    loadComponent: () => import('./reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
  },
  {
    path: 'verify',
    loadComponent: () => import('./verify/verify.page').then((m) => m.VerifyPage),
  },
  {
    path: 'new_password',
    loadComponent: () => import('./new-password/new-password.page').then((m) => m.NewPasswordPage),
  },
  {
    path: 'disabled',
    loadComponent: () => import('./disabled/disabled.page').then((m) => m.DisabledPage),
  },
  {
    path: 'pending_verification',
    loadComponent: () =>
      import('./pending-verification/pending-verification.page').then((m) => m.PendingVerificationPage),
  },
];
