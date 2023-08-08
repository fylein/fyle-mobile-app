import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { NgxMaskModule } from 'ngx-mask';

import { ManageCorporateCardsPageRoutingModule } from './manage-corporate-cards-routing.module';

import { ManageCorporateCardsPage } from './manage-corporate-cards.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { CorporateCardComponent } from './corporate-card/corporate-card.component';
import { AddCorporateCardComponent } from './add-corporate-card/add-corporate-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    ManageCorporateCardsPageRoutingModule,
    NgxMaskModule.forRoot(),
  ],
  declarations: [ManageCorporateCardsPage, CorporateCardComponent, AddCorporateCardComponent],
})
export class ManageCorporateCardsPageModule {}
