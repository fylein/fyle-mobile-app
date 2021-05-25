import { TestBed } from '@angular/core/testing';

import { BottomSheetService } from './bottom-sheet.service';

describe('BottomSheetService', () => {
  let service: BottomSheetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BottomSheetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

