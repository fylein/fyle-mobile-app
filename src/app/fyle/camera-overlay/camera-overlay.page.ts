import { Component, OnInit, ViewChild } from '@angular/core';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';

@Component({
  selector: 'app-camera-overlay',
  templateUrl: './camera-overlay.page.html',
  styleUrls: ['./camera-overlay.page.scss'],
  imports: [CaptureReceiptComponent],
})
export class CameraOverlayPage implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the query. This prevents migration.
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
