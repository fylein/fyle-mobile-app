import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewTeamExpensePageRoutingModule } from './view-team-expense-routing.module';
import { ViewTeamExpensePage } from './view-team-expense.page';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewTeamExpensePageRoutingModule,
    SharedModule
  ],
  declarations: [ViewTeamExpensePage]
})
export class ViewTeamExpensePageModule {}
