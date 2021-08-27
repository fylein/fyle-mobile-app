import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetupAccountPreferencesPage } from './setup-account-preferences.page';

const routes: Routes = [
  {
    path: '',
    component: SetupAccountPreferencesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupAccountPreferencesPageRoutingModule {}
