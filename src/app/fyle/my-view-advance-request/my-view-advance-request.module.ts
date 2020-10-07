import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyViewAdvanceRequestPageRoutingModule } from './my-view-advance-request-routing.module';

import { MyViewAdvanceRequestPage } from './my-view-advance-request.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewAdvanceRequestPageRoutingModule
  ],
  declarations: [MyViewAdvanceRequestPage]
})
export class MyViewAdvanceRequestPageModule {}
