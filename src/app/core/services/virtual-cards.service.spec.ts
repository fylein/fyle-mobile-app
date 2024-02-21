import { TestBed } from '@angular/core/testing';

import { VirtualCardsService } from './virtual-cards.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import {
  virtualCardCurrentAmountResponse,
  virtualCardDetailsResponse,
} from '../mock-data/virtual-card-details-response.data';
import { of } from 'rxjs';
import { VirtualCardsRequest } from '../models/virtual-cards-request.model';
import { CardDetailsResponse } from '../models/card-details-response.model';
import { virtualCardResponse, virtualCardUndefinedResponse } from '../mock-data/virtual-card-response.data';
import { VirtualCardsCombinedRequest } from '../models/virtual-cards-combined-request.model';
import { cardDetailsRes } from '../mock-data/platform-corporate-card-detail.data';
import { virtualCardCombinedRequest } from '../mock-data/virtual-cards-combined-request.data';

describe('VirtualCardsService', () => {
  let virtualCardsService: VirtualCardsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['post', 'get']);
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

  it('getCardDetails(): should get virtual card details', (done) => {
    const params = {
      data: {
        id: 'vc1234',
      },
    };
    const virtualCardsRequest: VirtualCardsRequest = {
      id: 'vc1234',
    };
    const expectedResponse: { data: CardDetailsResponse } = virtualCardDetailsResponse;
    expectedResponse.data.expiry_date = new Date(expectedResponse.data.expiry_date);
    spenderPlatformV1ApiService.post.and.returnValue(of(virtualCardDetailsResponse));

    virtualCardsService.getCardDetails(virtualCardsRequest).subscribe((res) => {
      expect(res).toEqual(expectedResponse.data);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/virtual_cards/show_card_details', params);
      done();
    });
  });

  it('getCurrentAmount(): should get virtual card current Amount', (done) => {
    const params = {
      data: {
        id: 'vc1234',
      },
    };
    const virtualCardsRequest: VirtualCardsRequest = {
      id: 'vc1234',
    };
    spenderPlatformV1ApiService.post.and.returnValue(of(virtualCardCurrentAmountResponse));

    virtualCardsService.getCurrentAmount(virtualCardsRequest).subscribe((res) => {
      expect(res).toEqual(virtualCardCurrentAmountResponse.data);
      expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/virtual_cards/get_current_amount', params);
      done();
    });
  });

  describe('getVirtualCardById(): ', () => {
    it('should get virtual card', (done) => {
      const virtualCardsRequest: VirtualCardsRequest = {
        id: 'vc1234',
      };
      const data = {
        params: {
          id: 'eq.' + virtualCardsRequest.id,
        },
      };
      spenderPlatformV1ApiService.get.and.returnValue(of(virtualCardResponse));

      virtualCardsService.getVirtualCard(virtualCardsRequest).subscribe((res) => {
        expect(res).toEqual(virtualCardResponse.data[0]);
        expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/virtual_cards', data);
        done();
      });
    });

    it('should return undefined response in case of undefined data', (done) => {
      const virtualCardsRequest: VirtualCardsRequest = {
        id: 'vc1234',
      };
      const data = {
        params: {
          id: 'eq.' + virtualCardsRequest.id,
        },
      };
      spenderPlatformV1ApiService.get.and.returnValue(of(virtualCardUndefinedResponse));

      virtualCardsService.getVirtualCard(virtualCardsRequest).subscribe((res) => {
        expect(res).toEqual(undefined);
        done();
      });
    });
  });

  it('getCardDetailsMap(): should return serialised card details', () => {
    const expectedCardDetailsResponse = {
      cardDetails: virtualCardDetailsResponse.data,
      currentAmount: virtualCardCurrentAmountResponse.data,
      virtualCard: virtualCardResponse.data[0],
    };

    const expectedResponse = {
      vcgNQmrZvGhL: {
        ...expectedCardDetailsResponse.cardDetails,
        ...expectedCardDetailsResponse.currentAmount,
        nick_name: expectedCardDetailsResponse.virtualCard.nick_name,
      },
    };

    spyOn(virtualCardsService, 'getCombinedCardDetails').and.returnValue(of(expectedCardDetailsResponse));
    virtualCardsService.getCardDetailsMap(virtualCardCombinedRequest).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });
  });

  it('getCombinedCardDetails(): should return expected response for Card Details related API calls', () => {
    spyOn(virtualCardsService, 'getCardDetails').and.returnValue(of(virtualCardDetailsResponse.data));
    spyOn(virtualCardsService, 'getCurrentAmount').and.returnValue(of(virtualCardCurrentAmountResponse.data));
    spyOn(virtualCardsService, 'getVirtualCard').and.returnValue(of(virtualCardResponse.data[0]));

    const expectedResponse = {
      cardDetails: virtualCardDetailsResponse.data,
      currentAmount: virtualCardCurrentAmountResponse.data,
      virtualCard: virtualCardResponse.data[0],
    };
    virtualCardsService.getCombinedCardDetails('vcgNQmrZvGhL', true).subscribe((res) => {
      expect(res).toEqual(expectedResponse);
    });
  });
});
