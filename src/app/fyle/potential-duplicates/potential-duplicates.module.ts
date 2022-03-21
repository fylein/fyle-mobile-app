import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PotentialDuplicatesPageRoutingModule } from './potential-duplicates-routing.module';
import { PotentialDuplicatesPage } from './potential-duplicates.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PotentialDuplicatesPageRoutingModule, SharedModule],
  declarations: [PotentialDuplicatesPage],
})
export class PotentialDuplicatesPageModule {}
