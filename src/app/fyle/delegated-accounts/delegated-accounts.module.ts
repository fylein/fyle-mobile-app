import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DelegatedAccountsPageRoutingModule } from './delegated-accounts-routing.module';
import { DelegatedAccountsPage } from './delegated-accounts.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DelegatedAccountsPageRoutingModule,
    SharedModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  declarations: [DelegatedAccountsPage],
})
export class DelegatedAccountsPageModule {}
