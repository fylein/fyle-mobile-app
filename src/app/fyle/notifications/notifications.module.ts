import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NotificationsPageRoutingModule } from './notifications-routing.module';
import { NotificationsBetaPage } from './notifications-beta/notifications-beta.page';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { EmailNotificationsComponent } from './email-notifications/email-notifications.component';

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
  declarations: [NotificationsBetaPage, EmailNotificationsComponent],
})
export class NotificationsPageModule {}
