import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CccClassifiedActionsPage } from './ccc-classified-actions.page';

const routes: Routes = [
    {
        path: '',
        component: CccClassifiedActionsPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CccClassifiedActionsPageRoutingModule {}
