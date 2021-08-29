import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyViewPerDiemPageRoutingModule } from './my-view-per-diem-routing.module';

import { MyViewPerDiemPage } from './my-view-per-diem.page';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MyViewPerDiemPageRoutingModule, MatIconModule, SharedModule],
  declarations: [MyViewPerDiemPage]
})
export class MyViewPerDiemPageModule {}
