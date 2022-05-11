import { TestBed } from '@angular/core/testing';

import { SnackbarPropertiesService } from './snackbar-properties.service';

xdescribe('SnackbarPropertiesService', () => {
  let service: SnackbarPropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnackbarPropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
