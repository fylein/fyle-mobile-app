import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SwitchOrgPageRoutingModule } from './switch-org-routing.module';
import { SwitchOrgPage } from './switch-org.page';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatRippleModule } from '@angular/material/core';
import { ActiveOrgCardComponent } from './active-org-card/active-org-card.component';
import { OrgCardComponent } from './org-card/org-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwitchOrgPageRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    SharedModule,
    SwitchOrgPage,
    ActiveOrgCardComponent,
    OrgCardComponent,
  ],
})
export class SwitchOrgPageModule {}
