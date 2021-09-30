import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DelegatedAccountsPage } from './delegated-accounts.page';

const routes: Routes = [
  {
    path: '',
    component: DelegatedAccountsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DelegatedAccountsPageRoutingModule {}
