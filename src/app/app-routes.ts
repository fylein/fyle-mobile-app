import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { VerifiedOrgAuthGuard } from './core/guards/verified-org-auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'enterprise/my_dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'post_verification',
    loadChildren: () => import('./post-verification/post-verification.routes').then((m) => m.postVerificationRoutes),
    canActivate: [AuthGuard],
  },
  {
    path: 'enterprise',
    loadChildren: () => import('./fyle/fyle.routes').then((m) => m.fyleRoutes),
    canActivate: [AuthGuard, VerifiedOrgAuthGuard],
  },
  {
    path: 'deep_link_redirection',
    loadChildren: () =>
      import('./deep-link-redirection/deep-link-redirection.routes').then((m) => m.deepLinkRedirectionRoutes),
  },
];
