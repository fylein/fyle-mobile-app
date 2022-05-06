import { TestBed } from '@angular/core/testing';

import { CustomInputsService } from './custom-inputs.service';

xdescribe('CustomInputsService', () => {
  let service: CustomInputsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomInputsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
