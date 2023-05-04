import { Injectable } from '@angular/core';
import { CameraPreview, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';

@Injectable({
  providedIn: 'root',
})
export class CameraPreviewService {
  constructor() {}

  capture(options: CameraPreviewPictureOptions) {
    return CameraPreview.capture(options);
  }

  start(options: CameraPreviewPictureOptions) {
    return CameraPreview.start(options);
  }

  stop() {
    return CameraPreview.stop();
  }

  getSupportedFlashModes() {
    return CameraPreview.getSupportedFlashModes();
  }

  setFlashMode(params: { flashMode: 'on' | 'off' }) {
    return CameraPreview.setFlashMode(params);
  }
}
