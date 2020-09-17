import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyExpensesPageRoutingModule } from './my-expenses-routing.module';

import { MyExpensesPage } from './my-expenses.page';

import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { MatInputModule } from '@angular/material/input';

import {MatButtonModule} from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyExpensesPageRoutingModule,
    MatButtonToggleModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  declarations: [MyExpensesPage]
})
export class MyExpensesPageModule { }
