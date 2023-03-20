import { TestBed } from '@angular/core/testing';
import { SecureStorageService } from './secure-storage.service';

describe('SecureStorageService', () => {
  let secureStorageService: SecureStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SecureStorageService],
    });
    secureStorageService = TestBed.inject(SecureStorageService);
  });

  it('should be created', () => {
    expect(secureStorageService).toBeTruthy();
  });

  it('clearAll(): should clear secure storage data', async () => {
    const result = await secureStorageService.clearAll();
    expect(result).toEqual({ value: true });
  });
});
