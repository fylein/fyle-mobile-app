import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PotentialDuplicatesPage } from './potential-duplicates.page';

const routes: Routes = [
  {
    path: '',
    component: PotentialDuplicatesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PotentialDuplicatesPageRoutingModule {}
