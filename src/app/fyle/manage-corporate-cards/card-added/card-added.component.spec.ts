import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';

import { CardAddedComponent } from './card-added.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('CardAddedComponent', () => {
  let component: CardAddedComponent;
  let fixture: ComponentFixture<CardAddedComponent>;

  let popoverController: jasmine.SpyObj<PopoverController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [CardAddedComponent],
      imports: [IonicModule.forRoot(), TranslocoModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardAddedComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'cardAdded.cardAdded': 'Card added',
        'cardAdded.viewExpensesInfo': 'View your corporate card expenses on the expenses page.',
        'cardAdded.debitCardNote':
          '<b>Note on debit cards:</b> If you have enrolled a debit card please note that not all transactions with your enrolled debit card may be eligible for expense tracking including PIN-based purchases. Do not use a Personal Identification Number (PIN) when paying for your purchase if you want the transaction to be available under this service.',
        'cardAdded.gotIt': 'Got it',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the popover when clicked on the got it button', () => {
    const gotItButton = getElementBySelector(fixture, '[data-testid="got-it-button"]') as HTMLButtonElement;
    gotItButton.click();

    fixture.detectChanges();

    expect(popoverController.dismiss).toHaveBeenCalled();
  });
});
