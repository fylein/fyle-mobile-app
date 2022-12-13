import { NgModule } from '@angular/core';
import { NoPreloading, PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { VerifiedOrgAuthGuard } from './core/guards/verified-org-auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'enterprise/my_dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'post_verification',
    loadChildren: () => import('./post-verification/post-verification.module').then((m) => m.PostVerificationModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'enterprise',
    loadChildren: () => import('./fyle/fyle.module').then((m) => m.FyleModule),
    canActivate: [AuthGuard, VerifiedOrgAuthGuard],
  },
  {
    path: 'deep_link_redirection',
    loadChildren: () =>
      import('./deep-link-redirection/deep-link-redirection.module').then((m) => m.DeepLinkRedirectionPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
