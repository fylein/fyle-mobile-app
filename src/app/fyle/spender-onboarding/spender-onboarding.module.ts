import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SpenderOnboardingPage } from './spender-onboarding.page';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpenderOnboardingRoutingModule } from './spender-onboarding-routing.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [SharedModule, CommonModule, FormsModule, IonicModule, MatButtonModule, SpenderOnboardingRoutingModule],
  declarations: [SpenderOnboardingPage],
})
export class SpenderOnboardingPageModule {}
