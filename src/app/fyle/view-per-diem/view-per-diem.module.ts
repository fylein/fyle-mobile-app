import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewPerDiemPageRoutingModule } from './view-per-diem-routing.module';
import { ViewPerDiemPage } from './view-per-diem.page';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ViewPerDiemPageRoutingModule, SharedModule, MatButtonModule],
  declarations: [ViewPerDiemPage],
})
export class ViewPerDiemPageModule {}
