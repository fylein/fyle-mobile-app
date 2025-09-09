import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewPasswordPageRoutingModule } from './new-password-routing.module';

import { NewPasswordPage } from './new-password.page';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';

import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        NewPasswordPageRoutingModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        SharedModule,
        NewPasswordPage,
    ],
})
export class NewPasswordPageModule {}
