import { TestBed } from '@angular/core/testing';
import { CameraPreviewService } from './camera-preview.service';
import { CameraPreview, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';

describe('CameraPreviewService', () => {
  let cameraPreviewService: CameraPreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    cameraPreviewService = TestBed.inject(CameraPreviewService);
  });

  it('should be created', () => {
    expect(cameraPreviewService).toBeTruthy();
  });

  xit('capture(): should capture in the camera', async () => {
    spyOn(CameraPreview, 'capture').and.returnValue(null);

    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 70,
    };

    await cameraPreviewService.capture(cameraPreviewPictureOptions);
  });
});
