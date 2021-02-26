import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/sign_in',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing.module').then(m => m.AuthRoutingModule)
  },
  {
    path: 'post_verification',
    loadChildren: () => import('./post-verification/post-verification-routing.module').then(m => m.PostVerificationRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'enterprise',
    loadChildren: () => import('./fyle/fyle-routing.module').then(m => m.FyleRoutingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'deep_link_redirection',
    loadChildren: () => import('./deep-link-redirection/deep-link-redirection.module').then( m => m.DeepLinkRedirectionPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
