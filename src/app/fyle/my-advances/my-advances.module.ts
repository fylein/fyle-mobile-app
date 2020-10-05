import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyAdvancesPageRoutingModule } from './my-advances-routing.module';

import { MyAdvancesPage } from './my-advances.page';
import { MyAdvancesCardComponent } from './my-advances-card/my-advances-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyAdvancesPageRoutingModule
  ],
  declarations: [
    MyAdvancesPage,
    MyAdvancesCardComponent
  ]
})
export class MyAdvancesPageModule {}
