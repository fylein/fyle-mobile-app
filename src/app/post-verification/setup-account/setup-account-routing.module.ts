import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetupAccountPage } from './setup-account.page';

const routes: Routes = [
    {
        path: '',
        component: SetupAccountPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SetupAccountPageRoutingModule {}
