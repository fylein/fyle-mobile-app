import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SwitchOrgPageRoutingModule } from './switch-org-routing.module';

import { SwitchOrgPage } from './switch-org.page';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwitchOrgPageRoutingModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [SwitchOrgPage]
})
export class SwitchOrgPageModule { }
