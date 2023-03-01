import { InvitationRequestsService } from './invitation-requests.service';
import { RouterApiService } from './router-api.service';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

describe('InvitationRequestsService', () => {
  let invitationRequestsService: InvitationRequestsService;
  let routerApiServiceSpy: jasmine.SpyObj<RouterApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('RouterApiService', ['post']);
    TestBed.configureTestingModule({
      providers: [InvitationRequestsService, { provide: RouterApiService, useValue: spy }],
    });
    invitationRequestsService = TestBed.inject(InvitationRequestsService);
    routerApiServiceSpy = TestBed.inject(RouterApiService) as jasmine.SpyObj<RouterApiService>;
  });

  it('upsertRouter(): should call the post method with the correct endpoint and email', () => {
    const mockEmail = 'manjiri.c@fyle.in';
    const expectedEndpoint = '/invitation_requests/invite';
    const expectedRequestBody = { email: mockEmail };

    routerApiServiceSpy.post.and.returnValue(of({}));

    invitationRequestsService.upsertRouter(mockEmail).subscribe(() => {
      expect(routerApiServiceSpy.post).toHaveBeenCalledOnceWith(expectedEndpoint, expectedRequestBody);
    });
  });
});
