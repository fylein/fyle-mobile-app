import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { VerifiedOrgAuthGuard } from './core/guards/verified-org-auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'enterprise/spender_onboarding',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: (): void => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'post_verification',
    loadChildren: (): void => import('./post-verification/post-verification.module').then((m) => m.PostVerificationModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'enterprise',
    loadChildren: (): void => import('./fyle/fyle.module').then((m) => m.FyleModule),
    canActivate: [AuthGuard, VerifiedOrgAuthGuard],
  },
  {
    path: 'deep_link_redirection',
    loadChildren: (): void =>
      import('./deep-link-redirection/deep-link-redirection.module').then((m) => m.DeepLinkRedirectionPageModule),
  },
];

export const appRoutes = routes;

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
