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
import { MyReportsSortFilterComponent } from './my-reports-sort-filter/my-reports-sort-filter.component';
import { MatRadioModule } from '@angular/material/radio';

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
    ReactiveFormsModule
  ],
  declarations: [
    MyReportsPage,
    MyReportsCardComponent,
    MyReportsSearchFilterComponent,
    MyReportsSortFilterComponent
  ]
})
export class MyReportsPageModule { }
