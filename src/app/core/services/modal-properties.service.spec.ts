import { TestBed } from '@angular/core/testing';

import { ModalPropertiesService } from './modal-properties.service';

describe('ModalPropertiesService', () => {
  let service: ModalPropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalPropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
