import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {TasksPageRoutingModule} from './tasks-routing.module';

import {TasksPage} from './tasks.page';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TasksPageRoutingModule,
    SharedModule
  ],
  declarations: [TasksPage]
})
export class TasksPageModule {
}
