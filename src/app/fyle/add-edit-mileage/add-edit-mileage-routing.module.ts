import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddEditMileagePage } from './add-edit-mileage.page';

const routes: Routes = [
  {
    path: '',
    component: AddEditMileagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddEditMileagePageRoutingModule {}
