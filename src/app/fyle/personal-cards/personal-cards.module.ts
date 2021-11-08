import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';

import { PersonalCardsPageRoutingModule } from './personal-cards-routing.module';

import { PersonalCardsPage } from './personal-cards.page';
import { TransactionsShimmerComponent } from './transactions-shimmer/transactions-shimmer.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';
import { DateRangeModalComponent } from './date-range-modal/date-range-modal.component';
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
  ],
  declarations: [PersonalCardsPage, TransactionsShimmerComponent, DateRangeModalComponent],
})
export class PersonalCardsPageModule {}
