import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {SwitchOrgPage} from './switch-org.page';

const routes: Routes = [
  {
    path: '',
    component: SwitchOrgPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwitchOrgPageRoutingModule {}
