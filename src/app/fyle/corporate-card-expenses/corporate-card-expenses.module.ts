import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CorporateCardExpensesPageRoutingModule } from './corporate-card-expenses-routing.module';

import { CorporateCardExpensesPage } from './corporate-card-expenses.page';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../shared/shared.module';
import { CorporateCardExpenseCardComponent } from './corporate-card-expense-card/corporate-card-expense-card.component';
import { CorporateCardExpensesSearchFilterComponent } from './corporate-card-expenses-search-filter/corporate-card-expenses-search-filter.component';
import { CorporateCardExpensesSortFilterComponent } from './corporate-card-expenses-sort-filter/corporate-card-expenses-sort-filter.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CorporateCardExpensesPageRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    SharedModule,
  ],
  declarations: [
    CorporateCardExpensesPage,
    CorporateCardExpenseCardComponent,
    CorporateCardExpensesSearchFilterComponent,
    CorporateCardExpensesSortFilterComponent,
  ],
})
export class CorporateCardExpensesPageModule {}
