import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyViewMileagePage } from './my-view-mileage.page';

const routes: Routes = [
    {
        path: '',
        component: MyViewMileagePage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MyViewMileagePageRoutingModule {}
