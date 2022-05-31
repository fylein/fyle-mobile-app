import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MyAddEditTripPageRoutingModule } from './my-add-edit-trip-routing.module';
import { MyAddEditTripPage } from './my-add-edit-trip.page';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from '../../shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { OtherRequestsComponent } from './other-requests/other-requests.component';
import { SavePopoverComponent } from './save-popover/save-popover.component';
import { MatInputModule } from '@angular/material/input';
import { PolicyViolationComponent } from './policy-violation/policy-violation.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MyAddEditTripPageRoutingModule,
    MatIconModule,
    MatSelectModule,
    SharedModule,
    MatCheckboxModule,
    MatTabsModule,
    MatInputModule,
  ],
  declarations: [MyAddEditTripPage, OtherRequestsComponent, SavePopoverComponent, PolicyViolationComponent],
  exports: [MatTabsModule],
})
export class MyAddEditTripPageModule {}
