import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';

import { PersonalCardsPageRoutingModule } from './personal-cards-routing.module';

import { PersonalCardsPage } from './personal-cards.page';
import { TransactionsShimmerComponent } from './transactions-shimmer/transactions-shimmer.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatNativeDateModule } from '@angular/material/core';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { DateRangeModalComponent } from './date-range-modal/date-range-modal.component';
import { SpinnerDialog } from '@awesome-cordova-plugins/spinner-dialog/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonalCardsPageRoutingModule,
    SharedModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
  ],
  providers: [SpinnerDialog],
  declarations: [PersonalCardsPage, TransactionsShimmerComponent, DateRangeModalComponent],
})
export class PersonalCardsPageModule {}
