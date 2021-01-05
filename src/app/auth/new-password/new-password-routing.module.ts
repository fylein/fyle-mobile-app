import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {NewPasswordPage} from './new-password.page';

const routes: Routes = [
  {
    path: '',
    component: NewPasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewPasswordPageRoutingModule {}
