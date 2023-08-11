import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageCorporateCardsPageRoutingModule } from './manage-corporate-cards-routing.module';

import { ManageCorporateCardsPage } from './manage-corporate-cards.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { CorporateCardComponent } from './corporate-card/corporate-card.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SharedModule, ManageCorporateCardsPageRoutingModule],
  declarations: [ManageCorporateCardsPage, CorporateCardComponent],
})
export class ManageCorporateCardsPageModule {}
