import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EllipsisPipe } from './pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from './pipes/humanize-currency.pipe';
import { ReportState } from './pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from './pipes/snake_case_to_space_case.pipe';
import { FySelectComponent } from './components/fy-select/fy-select.component';
import { FySelectModalComponent } from './components/fy-select/fy-select-modal/fy-select-modal.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';
import { FyLocationComponent } from './components/fy-location/fy-location.component';
import { FyMultiselectComponent } from './components/fy-multiselect/fy-multiselect.component';
import { FyUserlistComponent } from './components/fy-userlist/fy-userlist.component';
import { FyLocationModalComponent } from './components/fy-location/fy-location-modal/fy-location-modal.component';
import { FyMultiselectModalComponent } from './components/fy-multiselect/fy-multiselect-modal/fy-multiselect-modal.component';
import { FyUserlistModalComponent } from './components/fy-userlist/fy-userlist-modal/fy-userlist-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';



@NgModule({
  declarations: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    SnakeCaseToSpaceCase,
    FySelectComponent,
    FySelectModalComponent,
    FyLocationComponent,
    FyMultiselectComponent,
    FyUserlistComponent,
    FyLocationModalComponent,
    FyMultiselectModalComponent,
    FyUserlistModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule
  ],
  exports: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    SnakeCaseToSpaceCase,
    FySelectComponent,
    FyLocationComponent,
    FyMultiselectComponent,
    FyUserlistComponent
  ]
})
export class SharedModule { }
