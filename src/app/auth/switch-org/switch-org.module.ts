import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SwitchOrgPageRoutingModule } from './switch-org-routing.module';

import { SwitchOrgPage } from './switch-org.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwitchOrgPageRoutingModule
  ],
  declarations: [SwitchOrgPage]
})
export class SwitchOrgPageModule {}
