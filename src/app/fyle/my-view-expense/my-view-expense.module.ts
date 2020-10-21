import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MyViewExpensePageRoutingModule } from './my-view-expense-routing.module';
import { MyViewExpensePage } from './my-view-expense.page';
import { MatIconModule } from '@angular/material/icon';
import { PolicyViolationInfoBlockComponent } from './policy-violation-info-block/policy-violation-info-block.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyViewExpensePageRoutingModule,
    MatIconModule
  ],
  declarations: [
    MyViewExpensePage,
    PolicyViolationInfoBlockComponent
  ]
})
export class MyViewExpensePageModule {}
