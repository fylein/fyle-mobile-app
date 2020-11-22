import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApproverModalPageRoutingModule } from './approver-modal-routing.module';

import { ApproverModalPage } from './approver-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApproverModalPageRoutingModule
  ],
  declarations: [ApproverModalPage]
})
export class ApproverModalPageModule {}
