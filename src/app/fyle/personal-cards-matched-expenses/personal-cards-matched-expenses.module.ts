import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';

import { PersonalCardsMatchedExpensesPageRoutingModule } from './personal-cards-matched-expenses-routing.module';

import { PersonalCardsMatchedExpensesPage } from './personal-cards-matched-expenses.page';
import { ExpensePreviewComponent } from './expense-preview/expense-preview.component';
import { ExpensePreviewShimmerComponent } from './expense-preview-shimmer/expense-preview-shimmer.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonalCardsMatchedExpensesPageRoutingModule,
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
    MatButtonModule,
    MatCheckboxModule,
    MatBottomSheetModule,
    MatSnackBarModule,
    SharedModule,
    MatCheckboxModule,
  ],
  declarations: [PersonalCardsMatchedExpensesPage, ExpensePreviewComponent, ExpensePreviewShimmerComponent],
})
export class PersonalCardsMatchedExpensesPageModule {}
