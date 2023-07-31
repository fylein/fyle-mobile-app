import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageCorporateCardsPageRoutingModule } from './manage-corporate-cards-routing.module';

import { ManageCorporateCardsPage } from './manage-corporate-cards.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SharedModule, ManageCorporateCardsPageRoutingModule],
  declarations: [ManageCorporateCardsPage],
})
export class ManageCorporateCardsPageModule {}
