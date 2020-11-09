import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyViewMileagePageRoutingModule } from './my-view-mileage-routing.module';

import { MyViewMileagePage } from './my-view-mileage.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewMileagePageRoutingModule,
    SharedModule
  ],
  declarations: [MyViewMileagePage]
})
export class MyViewMileagePageModule {}
