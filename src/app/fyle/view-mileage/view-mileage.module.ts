import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewMileagePageRoutingModule } from './view-mileage-routing.module';
import { ViewMileagePage } from './view-mileage.page';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ViewMileagePageRoutingModule, SharedModule, MatButtonModule],
  declarations: [ViewMileagePage],
})
export class ViewMileagePageModule {}
