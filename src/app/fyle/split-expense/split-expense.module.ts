import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SplitExpensePageRoutingModule } from './split-expense-routing.module';

import { SplitExpensePage } from './split-expense.page';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { SplitExpenseStatusComponent } from './split-expense-status/split-expense-status.component';
import { FySelectProjectComponent } from './fy-select-project/fy-select-project.component';
import { FySelectModalComponent } from './fy-select-project/fy-select-modal/fy-select-modal.component';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  declarations: [
    SplitExpensePage,
    SplitExpenseStatusComponent,
    FySelectProjectComponent,
    FySelectModalComponent
  ]
})
export class SplitExpensePageModule {}
