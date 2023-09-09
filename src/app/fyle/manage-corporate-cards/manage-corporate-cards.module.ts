import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageCorporateCardsPageRoutingModule } from './manage-corporate-cards-routing.module';

import { ManageCorporateCardsPage } from './manage-corporate-cards.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddCorporateCardComponent } from './add-corporate-card/add-corporate-card.component';
import { CardAddedComponent } from './card-added/card-added.component';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    ManageCorporateCardsPageRoutingModule,
    NgxMaskModule.forRoot({
      validation: false,
    }),
  ],
  declarations: [ManageCorporateCardsPage, AddCorporateCardComponent, CardAddedComponent],
})
export class ManageCorporateCardsPageModule {}
