import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SupportDialogPage } from './support-dialog.page';

const routes: Routes = [
    {
        path: '',
        component: SupportDialogPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SupportDialogPageRoutingModule {}
