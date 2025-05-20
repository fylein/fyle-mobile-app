import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SwitchOrgPageRoutingModule } from './switch-org-routing.module';
import { SwitchOrgPage } from './switch-org.page';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
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
    MatListModule,
    MatRippleModule,
    SharedModule,
  ],
  declarations: [SwitchOrgPage, ActiveOrgCardComponent, OrgCardComponent],
})
export class SwitchOrgPageModule {}
