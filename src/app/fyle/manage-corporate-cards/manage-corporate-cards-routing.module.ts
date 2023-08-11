import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageCorporateCardsPage } from './manage-corporate-cards.page';

const routes: Routes = [
  {
    path: '',
    component: ManageCorporateCardsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageCorporateCardsPageRoutingModule {}
