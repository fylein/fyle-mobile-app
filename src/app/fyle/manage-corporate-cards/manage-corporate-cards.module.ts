import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { NgxMaskModule } from 'ngx-mask';

import { ManageCorporateCardsPageRoutingModule } from './manage-corporate-cards-routing.module';

import { ManageCorporateCardsPage } from './manage-corporate-cards.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddCorporateCardComponent } from './add-corporate-card/add-corporate-card.component';
import { CardAddedComponent } from './card-added/card-added.component';

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
  declarations: [ManageCorporateCardsPage, AddCorporateCardComponent, CardAddedComponent],
})
export class ManageCorporateCardsPageModule {}
