import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MergeExpensePageRoutingModule } from './merge-expense-routing.module';
import { MergeExpensePage } from './merge-expense.page';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { CardTransactionPreviewComponent } from './card-transaction-preview/card-transaction-preview.component';
import { GenericFieldsFormComponent } from './generic-fields-form/generic-fields-form.component';
import { CategoryDependentFieldsFormComponent } from './category-dependent-fields-form/category-dependent-fields-form.component';
import { CustomInputsFieldsFormComponent } from './custom-inputs-fields-form/custom-inputs-fields-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MergeExpensePageRoutingModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    SharedModule,
    PinchZoomModule,
    PdfViewerModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  declarations: [
    MergeExpensePage,
    CardTransactionPreviewComponent,
    GenericFieldsFormComponent,
    CategoryDependentFieldsFormComponent,
    CustomInputsFieldsFormComponent,
  ],
})
export class MergeExpensePageModule {}
