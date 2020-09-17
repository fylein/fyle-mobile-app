import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvitedUserPageRoutingModule } from './invited-user-routing.module';

import { InvitedUserPage } from './invited-user.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvitedUserPageRoutingModule
  ],
  declarations: [InvitedUserPage]
})
export class InvitedUserPageModule {}
