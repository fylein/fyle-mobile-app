import { TestBed } from '@angular/core/testing';
import { CameraPreviewService } from './camera-preview.service';
import { CameraPreview, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { CameraPreviewPlugin } from '@capacitor-community/camera-preview';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

fdescribe('CameraPreviewService', () => {
  let cameraPreviewService: CameraPreviewService;

  class CameraPreviewStub {
    capture() {
      return Promise.resolve({});
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CameraPreview,
          useClass: CameraPreviewStub,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    cameraPreviewService = TestBed.inject(CameraPreviewService);
  });

  it('should be created', () => {
    expect(cameraPreviewService).toBeTruthy();
  });

  it('capture(): should capture in the camera', async () => {
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 70,
    };

    await cameraPreviewService.capture(cameraPreviewPictureOptions);
  });
});
