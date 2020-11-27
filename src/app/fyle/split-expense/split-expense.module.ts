import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SplitExpensePageRoutingModule } from './split-expense-routing.module';

import { SplitExpensePage } from './split-expense.page';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplitExpensePageRoutingModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  declarations: [SplitExpensePage]
})
export class SplitExpensePageModule {}
