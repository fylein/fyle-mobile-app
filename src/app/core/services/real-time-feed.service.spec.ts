import { TestBed, waitForAsync } from '@angular/core/testing';

import { RealTimeFeedService } from './real-time-feed.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { mastercardRTFCard, visaRTFCard } from '../mock-data/platform-corporate-card.data';
import { catchError, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CardNetworkType } from '../enums/card-network-type';

describe('RealTimeFeedService', () => {
  let realTimeFeedService: RealTimeFeedService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['post']);

    TestBed.configureTestingModule({
      providers: [
        RealTimeFeedService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
      ],
    });

    realTimeFeedService = TestBed.inject(RealTimeFeedService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(realTimeFeedService).toBeTruthy();
  });

  describe('getCardTypeFromNumber()', () => {
    it('should return null if the input card number is empty', () => {
      expect(realTimeFeedService.getCardTypeFromNumber('')).toBeNull();
    });

    it('should return visa if the input card number starts with 4', () => {
      expect(realTimeFeedService.getCardTypeFromNumber('4111111111111111')).toBe(CardNetworkType.VISA);
    });

    it('should return mastercard if the input card number starts with 5', () => {
      expect(realTimeFeedService.getCardTypeFromNumber('5555555555555555')).toBe(CardNetworkType.MASTERCARD);
    });

    it('should return card type others if the input card number does not start with 4 or 5', () => {
      expect(realTimeFeedService.getCardTypeFromNumber('6111111111111111')).toBe(CardNetworkType.OTHERS);
    });
  });

  describe('enroll()', () => {
    it('should handle enrollment of visa rtf cards', waitForAsync(() => {
      spyOn(realTimeFeedService, 'getCardType').and.returnValue(CardNetworkType.VISA);
      spenderPlatformV1ApiService.post.and.returnValue(of({ data: visaRTFCard }));

      realTimeFeedService.enroll('4111111111111111').subscribe((res) => {
        expect(res).toEqual(visaRTFCard);

        expect(realTimeFeedService.getCardTypeFromNumber).toHaveBeenCalledOnceWith('4111111111111111');

        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/corporate_cards/visa_enroll', {
          data: {
            card_number: '4111111111111111',
          },
        });
      });
    }));

    it('should handle enrollment of mastercard rtf cards', waitForAsync(() => {
      spyOn(realTimeFeedService, 'getCardType').and.returnValue(CardNetworkType.MASTERCARD);
      spenderPlatformV1ApiService.post.and.returnValue(of({ data: mastercardRTFCard }));

      realTimeFeedService.enroll('5555555555555555').subscribe((res) => {
        expect(res).toEqual(mastercardRTFCard);

        expect(realTimeFeedService.getCardTypeFromNumber).toHaveBeenCalledOnceWith('5555555555555555');

        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/corporate_cards/mastercard_enroll', {
          data: {
            card_number: '5555555555555555',
          },
        });
      });
    }));

    it('should throw an error if the card number passed does not belong to either visa/mastercard', waitForAsync(() => {
      spyOn(realTimeFeedService, 'getCardTypeFromNumber').and.returnValue(CardNetworkType.OTHERS);

      expect(() => realTimeFeedService.enroll('6111111111111111')).toThrowError(
        `Invalid card type ${CardNetworkType.OTHERS}`
      );

      expect(realTimeFeedService.getCardTypeFromNumber).toHaveBeenCalledOnceWith('6111111111111111');
    }));

    it('should rethrow enroll api errors as a generic error', waitForAsync(() => {
      spyOn(realTimeFeedService, 'getCardType').and.returnValue(CardNetworkType.VISA);
      spenderPlatformV1ApiService.post.and.returnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              error: {
                message: 'This card already exists in the system',
              },
            })
        )
      );

      realTimeFeedService
        .enroll('4111111111111111')
        .pipe(
          catchError((error: Error) => {
            expect(error.message).toEqual('This card already exists in the system');
            return of(null);
          })
        )
        .subscribe();
    }));

    it('should handle enrollment of existing cards', waitForAsync(() => {
      spyOn(realTimeFeedService, 'getCardTypeFromNumber').and.returnValue(CardNetworkType.VISA);
      spenderPlatformV1ApiService.post.and.returnValue(of({ data: visaRTFCard }));

      realTimeFeedService.enroll('4555555555555555', 'bacc15bbrRGWzf').subscribe((res) => {
        expect(res).toEqual(visaRTFCard);

        expect(realTimeFeedService.getCardTypeFromNumber).toHaveBeenCalledOnceWith('4555555555555555');

        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/corporate_cards/visa_enroll', {
          data: {
            card_number: '4555555555555555',
            id: 'bacc15bbrRGWzf',
          },
        });
      });
    }));
  });

  describe('isCardNumberValid()', () => {
    it('should return false for empty card number', () => {
      expect(realTimeFeedService.isCardNumberValid('')).toBeFalse();
    });

    it('should return true for a valid card number', () => {
      expect(realTimeFeedService.isCardNumberValid('5555555555554444')).toBeTrue();
    });

    it('should return false for an invalid card number', () => {
      expect(realTimeFeedService.isCardNumberValid('411111111111111')).toBeFalse();
    });
  });
});
