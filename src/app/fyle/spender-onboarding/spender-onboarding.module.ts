import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SpenderOnboardingPage } from './spender-onboarding.page';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpenderOnboardingRoutingModule } from './spender-onboarding-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { SpenderOnboardingConnectCardStepComponent } from './spender-onboarding-connect-card-step/spender-onboarding-connect-card-step.component';
import { SpenderOnboardingOptInStepComponent } from './spender-onboarding-opt-in-step/spender-onboarding-opt-in-step.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        IonicModule,
        MatButtonModule,
        SpenderOnboardingRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgOtpInputModule,
        NgxMaskModule.forRoot({
            validation: false,
        }),
        SpenderOnboardingPage, SpenderOnboardingConnectCardStepComponent, SpenderOnboardingOptInStepComponent,
    ],
})
export class SpenderOnboardingPageModule {}
