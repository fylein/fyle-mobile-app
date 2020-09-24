import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'signup_details_enterprise',
    loadChildren: () => import('./signup-details-enterprise/signup-details-enterprise.module').then(m => m.SignupDetailsEnterprisePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreVerificationRoutingModule { }
