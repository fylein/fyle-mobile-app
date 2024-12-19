import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpenderOnboardingPage } from './potential-duplicates.page';

const routes: Routes = [
  {
    path: '',
    component: SpenderOnboardingPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpenderOnboardingPageModule {}
