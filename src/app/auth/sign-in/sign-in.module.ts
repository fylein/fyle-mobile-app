import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SignInPageRoutingModule } from './sign-in-routing.module';
import { SignInPage } from './sign-in.page';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ErrorComponent } from './error/error.component';
import { SharedModule } from '../../shared/shared.module';
import { NewHeaderComponent } from '../new-header/new-header.template';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignInPageRoutingModule,
    MatInputModule,
    SharedModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  declarations: [SignInPage, ErrorComponent, NewHeaderComponent],
})
export class SignInPageModule {}
