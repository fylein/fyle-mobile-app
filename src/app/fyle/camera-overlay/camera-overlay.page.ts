import { Component, OnInit, ViewChild } from '@angular/core';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';

@Component({
  selector: 'app-camera-overlay',
  templateUrl: './camera-overlay.page.html',
  styleUrls: ['./camera-overlay.page.scss'],
})
export class CameraOverlayPage implements OnInit {
  @ViewChild('captureReceipt') captureReceipt: CaptureReceiptComponent;

  constructor() {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.captureReceipt.ngOnInit();
    this.captureReceipt.setUpAndStartCamera();
  }

  ionViewWillLeave() {
    this.captureReceipt.stopCamera();
  }
}
