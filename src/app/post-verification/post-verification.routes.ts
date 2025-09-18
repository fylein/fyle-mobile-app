import { Routes } from '@angular/router';

export const postVerificationRoutes: Routes = [
  {
    path: 'invited_user',
    loadComponent: () => import('./invited-user/invited-user.page').then((m) => m.InvitedUserPage),
  },
];
