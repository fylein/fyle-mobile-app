import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SplitExpensePageRoutingModule } from './split-expense-routing.module';

import { SplitExpensePage } from './split-expense.page';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import {
  MatLegacyFormField as MatFormField,
  MatLegacyFormFieldModule as MatFormFieldModule,
} from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplitExpensePageRoutingModule,
    MatIconModule,
    ReactiveFormsModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  declarations: [SplitExpensePage],
})
export class SplitExpensePageModule {}
