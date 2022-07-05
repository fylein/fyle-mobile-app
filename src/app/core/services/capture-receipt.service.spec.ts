import { TestBed } from '@angular/core/testing';

import { CaptureReceiptService } from './capture-receipt.service';

describe('CaptureReceiptService', () => {
  let service: CaptureReceiptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaptureReceiptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
