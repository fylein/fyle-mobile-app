import { TestBed } from '@angular/core/testing';

import { JwtHelperService } from './jwt-helper.service';

describe('JwtHelperService', () => {
  let service: JwtHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
