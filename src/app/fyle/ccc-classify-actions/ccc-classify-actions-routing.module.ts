import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CccClassifyActionsPage } from './ccc-classify-actions.page';

const routes: Routes = [
  {
    path: '',
    component: CccClassifyActionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CccClassifyActionsPageRoutingModule {}
