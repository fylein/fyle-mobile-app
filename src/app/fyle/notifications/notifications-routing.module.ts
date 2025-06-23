import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationsPage } from './notifications.page';
import { NotificationsBetaPage } from './notifications-beta/notifications-beta.page';

const routes: Routes = [
  {
    path: '',
    component: NotificationsPage,
  },
  {
    path: 'beta',
    component: NotificationsBetaPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsPageRoutingModule {}
