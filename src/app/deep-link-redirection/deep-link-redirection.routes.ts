import { Routes } from '@angular/router';

export const deepLinkRedirectionRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./deep-link-redirection.page').then((m) => m.DeepLinkRedirectionPage),
  },
];
