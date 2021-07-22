import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CccClassifyActionsPageRoutingModule } from './ccc-classify-actions-routing.module';

import { CccClassifyActionsPage } from './ccc-classify-actions.page';
import {SharedModule} from '../../shared/shared.module';
import {MatRippleModule} from '@angular/material/core';
import {MatchExpensePopoverComponent} from './match-expense-popover/match-expense-popover.component';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CccClassifyActionsPageRoutingModule,
        SharedModule,
        MatRippleModule,
        MatButtonModule
    ],
    declarations: [
        CccClassifyActionsPage,
        MatchExpensePopoverComponent
    ]
})
export class CccClassifyActionsPageModule {}
