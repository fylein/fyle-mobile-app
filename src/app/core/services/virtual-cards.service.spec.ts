import { TestBed } from '@angular/core/testing';

import { VirtualCardsService } from './virtual-cards.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import {
  virtualCardCurrentAmountResponse,
  virtualCardDetailsResponse,
} from '../mock-data/virtual-card-details-response.data';
import { of } from 'rxjs';

describe('VirtualCardsService', () => {
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

  it('getCardDetailsById(): should get virtual card details', (done) => {
    const params = {
      data: {
        id: 'vc1234',
      },
    };
    spenderPlatformV1ApiService.post.and.returnValue(of(virtualCardDetailsResponse));

    virtualCardsService.getCardDetailsById('vc1234').subscribe((res) => {
      expect(res).toEqual(virtualCardDetailsResponse.data[0]);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/virtual_cards/show_card_details', params);
      done();
    });
  });

  it('getCurrentAmountById(): should get virtual card current Amount', (done) => {
    const params = {
      data: {
        id: 'vc1234',
      },
    };
    spenderPlatformV1ApiService.post.and.returnValue(of(virtualCardCurrentAmountResponse));

    virtualCardsService.getCurrentAmountById('vc1234').subscribe((res) => {
      expect(res).toEqual(virtualCardCurrentAmountResponse.data[0]);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/virtual_cards/get_current_amount', params);
      done();
    });
  });
});
