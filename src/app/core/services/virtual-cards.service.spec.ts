import { TestBed } from '@angular/core/testing';

import { VirtualCardsService } from './virtual-cards.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

xdescribe('VirtualCardsService', () => {
  let virtualCardsService: VirtualCardsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['post']);
    TestBed.configureTestingModule({
      providers: [
        VirtualCardsService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
      ],
    });
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    virtualCardsService = TestBed.inject(VirtualCardsService);
  });

  it('should be created', () => {
    expect(virtualCardsService).toBeTruthy();
  });
});
