import { TestBed } from '@angular/core/testing';

import { FooterService } from './footer.service';

describe('FooterService', () => {
  let service: FooterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FooterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial footerCurrentStateIndex$ value as 0', (done) => {
    service.footerCurrentStateIndex$.subscribe((index) => {
      expect(index).toBe(0);
      done();
    });
  });

  it('should update footerCurrentStateIndex$ value', (done) => {
    service.updateCurrentStateIndex(1);
    service.footerCurrentStateIndex$.subscribe((index) => {
      expect(index).toBe(1);
      done();
    });
  });

  it('should have initial selectionMode$ value as false', (done) => {
    service.selectionMode$.subscribe((isEnabled) => {
      expect(isEnabled).toBeFalse();
      done();
    });
  });

  it('should update selectionMode$ value', (done) => {
    service.updateSelectionMode(true);
    service.selectionMode$.subscribe((isEnabled) => {
      expect(isEnabled).toBeTrue();
      done();
    });
  });
});
