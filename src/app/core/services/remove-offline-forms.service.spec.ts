import { TestBed } from '@angular/core/testing';

import { RemoveOfflineFormsService } from './remove-offline-forms.service';

xdescribe('RemoveOfflineFormsService', () => {
  let service: RemoveOfflineFormsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoveOfflineFormsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
