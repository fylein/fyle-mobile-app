import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';

import { PersonalCardsPageRoutingModule } from './personal-cards-routing.module';

import { PersonalCardsPage } from './personal-cards.page';
import { TransactionsShimmerComponent } from './transactions-shimmer/transactions-shimmer.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PersonalCardsPageRoutingModule, SharedModule, MatCheckboxModule],
  declarations: [PersonalCardsPage, TransactionsShimmerComponent],
})
export class PersonalCardsPageModule {}
