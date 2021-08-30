import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CccClassifiedActionsPageRoutingModule } from './ccc-classified-actions-routing.module';

import { CccClassifiedActionsPage } from './ccc-classified-actions.page';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CccClassifiedActionsPageRoutingModule,
    SharedModule
  ],
  declarations: [CccClassifiedActionsPage]
})
export class CccClassifiedActionsPageModule {}
