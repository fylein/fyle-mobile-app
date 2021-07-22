import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewTeamMileagePage } from './view-team-mileage.page';

const routes: Routes = [
    {
        path: '',
        component: ViewTeamMileagePage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ViewTeamMileagePageRoutingModule {}
