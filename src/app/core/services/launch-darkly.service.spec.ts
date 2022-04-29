import { TestBed } from '@angular/core/testing';

import { LaunchDarklyService } from './launch-darkly.service';

describe('LaunchDarklyService', () => {
  let service: LaunchDarklyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LaunchDarklyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
