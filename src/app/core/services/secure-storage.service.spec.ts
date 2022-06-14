import { TestBed } from '@angular/core/testing';

import { SecureStorageService } from './secure-storage.service';

xdescribe('SecureStorageService', () => {
  let service: SecureStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecureStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
