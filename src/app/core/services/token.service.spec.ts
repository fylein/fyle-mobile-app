import { TestBed } from '@angular/core/testing';

import { TokenService } from './token.service';

fdescribe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  fit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
