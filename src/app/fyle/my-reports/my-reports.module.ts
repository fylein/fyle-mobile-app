import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyReportsPageRoutingModule } from './my-reports-routing.module';

import { MyReportsPage } from './my-reports.page';
import { MyReportsCardComponent } from './my-reports-card/my-reports-card.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MyReportsSearchFilterComponent } from './my-reports-search-filter/my-reports-search-filter.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyReportsPageRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    SharedModule,
  ],
  declarations: [MyReportsPage, MyReportsCardComponent, MyReportsSearchFilterComponent],
})
export class MyReportsPageModule {}
