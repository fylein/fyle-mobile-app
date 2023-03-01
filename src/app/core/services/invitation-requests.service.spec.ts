import { TestBed } from '@angular/core/testing';
import { RouterApiService } from '../services/router-api.service';
import { InvitationRequestsService } from './invitation-requests.service';

describe('InvitationRequestsService', () => {
  let invitationRequestsService: InvitationRequestsService;
  let routerApiService: jasmine.SpyObj<RouterApiService>;

  beforeEach(() => {
    const routerApiServiceSpy = jasmine.createSpyObj('RouterApiService', ['post']);
    TestBed.configureTestingModule({
      providers: [
        InvitationRequestsService,
        {
          provide: routerApiService,
          useValue: routerApiServiceSpy,
        },
      ],
    });
    invitationRequestsService = TestBed.inject(InvitationRequestsService);
    routerApiService = TestBed.inject(RouterApiService) as jasmine.SpyObj<RouterApiService>;
  });

  it('should be created', () => {
    expect(invitationRequestsService).toBeTruthy();
  });
});
