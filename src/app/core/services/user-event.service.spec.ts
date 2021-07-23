import { TestBed } from '@angular/core/testing';

import { UserEventService } from './user-event.service';

describe('UserEventService', () => {
  let service: UserEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
