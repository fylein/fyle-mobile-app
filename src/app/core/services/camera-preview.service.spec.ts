import { TestBed } from '@angular/core/testing';

import { CameraPreviewService } from './camera-preview.service';

describe('CameraPreviewService', () => {
  let service: CameraPreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CameraPreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
