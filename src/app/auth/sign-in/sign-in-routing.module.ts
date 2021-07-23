import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {SignInPage} from './sign-in.page';

const routes: Routes = [
  {
    path: '',
    component: SignInPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignInPageRoutingModule {}
