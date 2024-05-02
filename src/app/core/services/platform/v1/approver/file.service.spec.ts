import { TestBed } from '@angular/core/testing';
import { ApproverFileService } from './file.service';
import { ApproverPlatformApiService } from '../../../approver-platform-api.service';

describe('ApproverFileService', () => {
  let service: ApproverFileService;
  let approverPlatformApiService: jasmine.SpyObj<ApproverPlatformApiService>;

  beforeEach(() => {
    const approverPlatformApiServiceSpy = jasmine.createSpyObj('ApproverPlatformApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApproverPlatformApiService,
          useValue: approverPlatformApiServiceSpy,
        },
      ],
    });
    service = TestBed.inject(ApproverFileService);
    approverPlatformApiService = TestBed.inject(
      ApproverPlatformApiService
    ) as jasmine.SpyObj<ApproverPlatformApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
