import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyExpensesPageRoutingModule } from './my-expenses-routing.module';

import { MyExpensesPage } from './my-expenses.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyExpensesPageRoutingModule
  ],
  declarations: [MyExpensesPage]
})
export class MyExpensesPageModule {}
