import { TestBed } from '@angular/core/testing';

import { InvitationRequestsService } from './invitation-requests.service';

xdescribe('InvitationRequestsService', () => {
  let service: InvitationRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvitationRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
