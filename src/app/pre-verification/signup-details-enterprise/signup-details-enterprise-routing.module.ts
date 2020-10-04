import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignupDetailsEnterprisePage } from './signup-details-enterprise.page';

const routes: Routes = [
  {
    path: '',
    component: SignupDetailsEnterprisePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignupDetailsEnterprisePageRoutingModule {}
