import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {SignUpPageRoutingModule} from './sign-up-routing.module';

import {SignUpPage} from './sign-up.page';

import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {SignUpErrorComponent} from './error/error.component';
import { SharedModule } from '../../shared/shared.module';
// import { FormButtonValidationDirective } from '../../shared/directive/form-button-validation.directive';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignUpPageRoutingModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    SharedModule
  ],
  declarations: [
    SignUpPage,
    SignUpErrorComponent,
    // FormButtonValidationDirective
  ]
})
export class SignUpPageModule {}
