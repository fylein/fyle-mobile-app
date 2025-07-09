import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { CCExpenseMerchantInfoModalComponent } from './cc-expense-merchant-info-modal.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('CCExpenseMerchantInfoComponent', () => {
  let component: CCExpenseMerchantInfoModalComponent;
  let modalController: jasmine.SpyObj<ModalController>;
  let fixture: ComponentFixture<CCExpenseMerchantInfoModalComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [CCExpenseMerchantInfoModalComponent],
      imports: [IonicModule.forRoot(), TranslocoModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CCExpenseMerchantInfoModalComponent);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'ccExpenseMerchantInfoModal.title': 'Merchant',
        'ccExpenseMerchantInfoModal.bodyText': 'This merchant name comes from the transaction.',
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
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the popover when clicked on close button', () => {
    const closeBtn = getElementBySelector(fixture, '[data-testid="close-btn"') as HTMLButtonElement;
    closeBtn.click();

    fixture.detectChanges();

    expect(modalController.dismiss).toHaveBeenCalled();
  });

  describe('template', () => {
    it('should display the correct title', () => {
      fixture.detectChanges();
      const title = getElementBySelector(fixture, '[data-testid="title"');
      expect(title.textContent).toEqual('Merchant');
    });

    it('should display the correct content', () => {
      fixture.detectChanges();
      const content = getElementBySelector(fixture, '[data-testid="content"');
      expect(content.textContent).toEqual('This merchant name comes from the transaction.');
    });
  });
});
