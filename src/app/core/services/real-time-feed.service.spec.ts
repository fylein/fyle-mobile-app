import { TestBed, waitForAsync } from '@angular/core/testing';

import { RealTimeFeedService } from './real-time-feed.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { RTFCardType } from '../enums/rtf-card-type.enum';
import { mastercardRTFCard, visaRTFCard } from '../mock-data/platform-corporate-card.data';
import { catchError, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

fdescribe('RealTimeFeedService', () => {
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

  describe('getCardType()', () => {
    it('should return null if the input card number is empty', () => {
      expect(realTimeFeedService.getCardType('')).toBeNull();
    });

    it('should return visa if the input card number starts with 4', () => {
      expect(realTimeFeedService.getCardType('4111111111111111')).toBe(RTFCardType.VISA);
    });

    it('should return mastercard if the input card number starts with 5', () => {
      expect(realTimeFeedService.getCardType('5555555555555555')).toBe(RTFCardType.MASTERCARD);
    });

    it('should return card type others if the input card number does not start with 4 or 5', () => {
      expect(realTimeFeedService.getCardType('6111111111111111')).toBe(RTFCardType.OTHERS);
    });
  });

  describe('enroll()', () => {
    it('should call spenderPlatformV1ApiService.post() with the correct endpoint and payload for visa cards', waitForAsync(() => {
      spyOn(realTimeFeedService, 'getCardType').and.returnValue(RTFCardType.VISA);
      spenderPlatformV1ApiService.post.and.returnValue(of({ data: visaRTFCard }));

      realTimeFeedService.enroll('4111111111111111').subscribe((res) => {
        expect(res).toEqual(visaRTFCard);

        expect(realTimeFeedService.getCardType).toHaveBeenCalledOnceWith('4111111111111111');

        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/corporate_cards/visa_enroll', {
          data: {
            card_number: '4111111111111111',
          },
        });
      });
    }));

    it('should call spenderPlatformV1ApiService.post() with the correct endpoint and payload for mastercard cards', waitForAsync(() => {
      spyOn(realTimeFeedService, 'getCardType').and.returnValue(RTFCardType.MASTERCARD);
      spenderPlatformV1ApiService.post.and.returnValue(of({ data: mastercardRTFCard }));

      realTimeFeedService.enroll('5555555555555555').subscribe((res) => {
        expect(res).toEqual(mastercardRTFCard);

        expect(realTimeFeedService.getCardType).toHaveBeenCalledOnceWith('5555555555555555');

        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/corporate_cards/mastercard_enroll', {
          data: {
            card_number: '5555555555555555',
          },
        });
      });
    }));

    it('should throw an error if the card number passed does not belong to either visa/mastercard', waitForAsync(() => {
      spyOn(realTimeFeedService, 'getCardType').and.returnValue(RTFCardType.OTHERS);

      expect(() => realTimeFeedService.enroll('6111111111111111')).toThrowError(
        `Invalid card type ${RTFCardType.OTHERS}`
      );

      expect(realTimeFeedService.getCardType).toHaveBeenCalledOnceWith('6111111111111111');
    }));

    it('should handle enroll card errors', waitForAsync(() => {
      spyOn(realTimeFeedService, 'getCardType').and.returnValue(RTFCardType.VISA);
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
      spyOn(realTimeFeedService, 'getCardType').and.returnValue(RTFCardType.VISA);
      spenderPlatformV1ApiService.post.and.returnValue(of({ data: visaRTFCard }));

      realTimeFeedService.enroll('4555555555555555', 'bacc15bbrRGWzf').subscribe((res) => {
        expect(res).toEqual(visaRTFCard);

        expect(realTimeFeedService.getCardType).toHaveBeenCalledOnceWith('4555555555555555');

        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledOnceWith('/corporate_cards/visa_enroll', {
          data: {
            card_number: '4555555555555555',
            id: 'bacc15bbrRGWzf',
          },
        });
      });
    }));
  });
});
