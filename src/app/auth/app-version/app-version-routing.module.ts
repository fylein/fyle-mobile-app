import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppVersionPage } from './app-version.page';

const routes: Routes = [
  {
    path: '',
    component: AppVersionPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppVersionPageRoutingModule {}
