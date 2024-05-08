import { TestBed } from '@angular/core/testing';
import { SpenderFileService } from './file.service';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';

describe('SpenderFileService', () => {
  let service: SpenderFileService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
      ],
    });
    service = TestBed.inject(SpenderFileService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
