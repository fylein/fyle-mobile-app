import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OtherRequestsPageRoutingModule } from './other-requests-routing.module';
import { OtherRequestsPage } from './other-requests.page';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OtherRequestsPageRoutingModule,
    MatTabsModule,
    MatIconModule
  ],
  declarations: [OtherRequestsPage]
})
export class OtherRequestsPageModule {}
