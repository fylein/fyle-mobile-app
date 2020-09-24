import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'signup_details_enterprise',
    loadChildren: () => import('./signup-details-enterprise/signup-details-enterprise.module')
      .then(m => m.SignupDetailsEnterprisePageModule)
  },
  {
    path: 'verify_email',
    loadChildren: () => import('./verify-email/verify-email.module').then( m => m.VerifyEmailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreVerificationRoutingModule { }
