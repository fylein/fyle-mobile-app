import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NotificationsPageRoutingModule } from './notifications-routing.module';
import { NotificationsPage } from './notifications.page';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NotificationsPageRoutingModule,
    MatSelectModule,
    SharedModule,
    MatCheckboxModule,
  ],
  declarations: [NotificationsPage],
})
export class NotificationsPageModule {}
