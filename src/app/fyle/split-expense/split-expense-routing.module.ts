import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SplitExpensePage } from './split-expense.page';

const routes: Routes = [
    {
        path: '',
        component: SplitExpensePage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SplitExpensePageRoutingModule {}
