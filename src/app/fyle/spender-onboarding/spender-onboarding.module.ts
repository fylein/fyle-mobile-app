import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SpenderOnboardingPage } from './spender-onboarding.page';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpenderOnboardingRoutingModule } from './spender-onboarding-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { SpenderOnboardingConnectCardStepComponent } from './spender-onboarding-connect-card-step/spender-onboarding-connect-card-step.component';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    MatButtonModule,
    SpenderOnboardingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot({
      validation: false,
    }),
  ],
  declarations: [SpenderOnboardingPage, SpenderOnboardingConnectCardStepComponent],
})
export class SpenderOnboardingPageModule {}
