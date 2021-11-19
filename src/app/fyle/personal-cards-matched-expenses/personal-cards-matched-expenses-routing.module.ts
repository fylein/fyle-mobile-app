import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalCardsMatchedExpensesPage } from './personal-cards-matched-expenses.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalCardsMatchedExpensesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalCardsMatchedExpensesPageRoutingModule {}
