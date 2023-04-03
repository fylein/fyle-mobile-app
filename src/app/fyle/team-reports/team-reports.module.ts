import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TeamReportsPageRoutingModule } from './team-reports-routing.module';
import { TeamReportsPage } from './team-reports.page';
import { TeamReportCardComponent } from './team-report-card/team-report-card.component';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TeamReportsSearchFilterComponent } from './team-reports-search-filter/team-reports-search-filter.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeamReportsPageRoutingModule,
    SharedModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  declarations: [TeamReportsPage, TeamReportCardComponent, TeamReportsSearchFilterComponent],
})
export class TeamReportsPageModule {}
