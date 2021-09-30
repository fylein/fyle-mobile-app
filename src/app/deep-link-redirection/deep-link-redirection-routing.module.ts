import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeepLinkRedirectionPage } from './deep-link-redirection.page';

const routes: Routes = [
  {
    path: '',
    component: DeepLinkRedirectionPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeepLinkRedirectionPageRoutingModule {}
