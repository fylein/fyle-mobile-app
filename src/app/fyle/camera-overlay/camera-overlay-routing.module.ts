import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CameraOverlayPage } from './camera-overlay.page';

const routes: Routes = [
  {
    path: '',
    component: CameraOverlayPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CameraOverlayPageRoutingModule {}
