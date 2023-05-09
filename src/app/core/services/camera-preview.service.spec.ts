import { TestBed } from '@angular/core/testing';
import { CameraPreviewService } from './camera-preview.service';

xdescribe('CameraPreviewService', () => {
  let cameraPreviewService: CameraPreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    cameraPreviewService = TestBed.inject(CameraPreviewService);
  });

  it('should be created', () => {
    expect(cameraPreviewService).toBeTruthy();
  });
});
