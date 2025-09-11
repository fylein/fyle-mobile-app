import { TestBed } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/standalone';

import { BackButtonService } from './back-button.service';
import { TranslocoService } from '@jsverse/transloco';

describe('BackButtonService', () => {
  let backButtonService: BackButtonService;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.backButton.title': 'Exit Fyle App',
        'services.backButton.message': 'Are you sure you want to exit the app?',
        'services.backButton.primaryCtaText': 'OK',
        'services.backButton.secondaryCtaText': 'Cancel',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        BackButtonService,
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    backButtonService = TestBed.inject(BackButtonService);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(backButtonService).toBeTruthy();
  });
});
