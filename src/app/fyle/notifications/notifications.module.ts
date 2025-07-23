import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NotificationsPageRoutingModule } from './notifications-routing.module';
import { NotificationsBetaPage } from './notifications-beta/notifications-beta.page';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EmailNotificationsComponent } from './email-notifications/email-notifications.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        NotificationsPageRoutingModule,
        SharedModule,
        MatCheckboxModule,
        NotificationsBetaPage, EmailNotificationsComponent,
    ],
})
export class NotificationsPageModule {}
