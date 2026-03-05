import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import heic2any from 'heic2any';
import { CaptureReceiptComponent } from 'src/app/shared/components/capture-receipt/capture-receipt.component';
import { ShareTargetService } from 'src/app/core/services/share-target.service';

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

  private shareTargetService = inject(ShareTargetService);

  constructor() {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.captureReceipt.ngOnInit();
    const openedViaShare = this.shareTargetService.hasPendingFiles();
    if (!openedViaShare) {
      this.captureReceipt.setUpAndStartCamera();
    }
    this.processPendingSharedFiles();
  }

  ionViewWillLeave() {
    this.captureReceipt.stopCamera();
  }

  /**
   * User opened the app via Share with multiple images: convert to data URLs and show receipt preview modal (no camera).
   */
  private processPendingSharedFiles(): void {
    const files = this.shareTargetService.getAndClearPendingFiles();
    if (files.length === 0) {
      return;
    }
    Promise.all(files.map((file) => this.uriToDataUrl(file.uri, file.mimeType)))
      .then((dataUrls) => {
        const images = dataUrls.map((dataUrl) => ({
          source: 'MOBILE_DASHCAM_GALLERY',
          base64Image: dataUrl,
        }));
        this.captureReceipt.setSharedImages(images);
        this.captureReceipt.openReceiptPreviewModal();
      })
      .catch(() => {});
  }

  private uriToDataUrl(uri: string, mimeType?: string): Promise<string> {
    const isHeic = mimeType?.toLowerCase() === 'image/heic';
    const path = `file://${uri}`;
    return Filesystem.readFile({ path }).then((result) => {
      const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${result.data}`;
      if (isHeic) {
        const blob = this.dataUrlToBlob(dataUrl);
        return this.heicToJpegDataUrl(blob);
      }
      return dataUrl;
    });
  }

  /** Convert HEIC blob to JPEG data URL using heic2any. */
  private heicToJpegDataUrl(heicBlob: Blob): Promise<string> {
    return heic2any({
      blob: heicBlob,
      toType: 'image/jpeg',
      quality: 0.5,
    }).then((result) => {
      const blob = Array.isArray(result) ? result[0] : result;
      return this.blobToDataUrl(blob);
    });
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'image/heic' });
  }
}
