import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddEditAdvanceRequestPage } from './add-edit-advance-request.page';

const routes: Routes = [
  {
    path: '',
    component: AddEditAdvanceRequestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddEditAdvanceRequestPageRoutingModule {}
