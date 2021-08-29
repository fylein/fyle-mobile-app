import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddEditPerDiemPage } from './add-edit-per-diem.page';

const routes: Routes = [
  {
    path: '',
    component: AddEditPerDiemPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddEditPerDiemPageRoutingModule {}
