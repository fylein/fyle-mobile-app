import { Injectable } from '@angular/core';
import {
  CameraPreview,
  CameraPreviewFlashMode,
  CameraPreviewOptions,
  CameraPreviewPictureOptions,
} from '@capacitor-community/camera-preview';

@Injectable({
  providedIn: 'root',
})
export class CameraPreviewService {
  capture(options: CameraPreviewPictureOptions): Promise<{
    value: string;
  }> {
    return CameraPreview.capture(options);
  }

  start(options: CameraPreviewOptions): Promise<void> {
    return CameraPreview.start(options);
  }

  stop(): Promise<void> {
    return CameraPreview.stop();
  }

  getSupportedFlashModes(): Promise<{
    result: CameraPreviewFlashMode[];
  }> {
    return CameraPreview.getSupportedFlashModes();
  }

  setFlashMode(params: { flashMode: 'on' | 'off' }): Promise<void> {
    return CameraPreview.setFlashMode(params);
  }
}
