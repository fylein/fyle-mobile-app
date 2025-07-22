import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DisabledPageRoutingModule } from './disabled-routing.module';

import { DisabledPage } from './disabled.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DisabledPageRoutingModule, DisabledPage],
})
export class DisabledPageModule {}
