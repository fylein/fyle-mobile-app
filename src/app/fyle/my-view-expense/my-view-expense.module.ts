import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MyViewExpensePageRoutingModule } from './my-view-expense-routing.module';
import { MyViewExpensePage } from './my-view-expense.page';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewExpensePageRoutingModule,
    MatIconModule,
    SharedModule
  ],
  declarations: [
    MyViewExpensePage
  ]
})
export class MyViewExpensePageModule {}
