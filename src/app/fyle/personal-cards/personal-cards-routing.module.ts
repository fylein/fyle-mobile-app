import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalCardsPage } from './personal-cards.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalCardsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalCardsPageRoutingModule {}
