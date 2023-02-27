import { TestBed } from '@angular/core/testing';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { AdvanceService } from './advance.service';
import { extendedAdvancesData } from '../mock-data/extended-advance.data';
import { of } from 'rxjs';

describe('AdvanceService', () => {
  let advanceService: AdvanceService;
  let apiv2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    TestBed.configureTestingModule({
      providers: [
        AdvanceService,
        {
          provide: ApiV2Service,
          useValue: apiv2ServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
      ],
    });
    advanceService = TestBed.inject(AdvanceService);
  });

  it('should be created', () => {
    expect(advanceService).toBeTruthy();
  });
});
