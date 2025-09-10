import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PendingGasChargeInfoModalComponent } from './pending-gas-charge-info-modal.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';

describe('PendingGasChargeInfoModalComponent', () => {
  let component: PendingGasChargeInfoModalComponent;
  let modalController: jasmine.SpyObj<ModalController>;
  let fixture: ComponentFixture<PendingGasChargeInfoModalComponent>;
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
      imports: [
        IonicModule.forRoot(),
        TranslocoModule,
        MatIconModule,
        HttpClientTestingModule,
        PendingGasChargeInfoModalComponent,
      ],
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

    fixture = TestBed.createComponent(PendingGasChargeInfoModalComponent);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;

    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'pendingGasChargeInfoModal.title': 'Pending Gas Charge Info',
        'pendingGasChargeInfoModal.description':
          'Gas stations often place a temporary $1 hold amount when you swipe your card.',
        'pendingGasChargeInfoModal.step1Description': 'Step 1 Description',
        'pendingGasChargeInfoModal.step2Description': 'Step 2 Description',
        'pendingGasChargeInfoModal.step3Description': 'Step 3 Description',
        'pendingGasChargeInfoModal.step4Description': 'Step 4 Description',
        'pendingGasChargeInfoModal.step5Description': 'Step 5 Description',
        'pendingGasChargeInfoModal.additionalInfoTitle': 'Additional Information',
        'pendingGasChargeInfoModal.additionalInfoDescription': 'This is additional information about gas charges.',
        'pendingGasChargeInfoModal.readMoreText': 'Read more about gas charges',
        'pendingGasChargeInfoModal.readMoreLinkText': 'Learn more',
      };

      let translation = translations[key] || key;

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

  describe('dismissModal()', () => {
    it('should dismiss the modal when called', () => {
      component.dismissModal();
      expect(modalController.dismiss).toHaveBeenCalled();
    });

    it('should dismiss the modal when close button is clicked', () => {
      const closeBtn = getElementBySelector(fixture, '[data-testid="close-btn"]') as HTMLButtonElement;
      closeBtn.click();
      fixture.detectChanges();

      expect(modalController.dismiss).toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should have the correct modal structure', () => {
      const header = fixture.nativeElement.querySelector('ion-header');
      const content = fixture.nativeElement.querySelector('ion-content');
      const toolbar = fixture.nativeElement.querySelector('ion-toolbar');
      const closeBtn = fixture.nativeElement.querySelector('[data-testid="close-btn"]');
      const title = fixture.nativeElement.querySelector('[data-testid="title"]');

      expect(header).toBeTruthy();
      expect(content).toBeTruthy();
      expect(toolbar).toBeTruthy();
      expect(closeBtn).toBeTruthy();
      expect(title).toBeTruthy();
    });

    it('should have timeline container with steps', () => {
      const timelineContainer = fixture.nativeElement.querySelector(
        '.pending-gas-charge-info-modal__timeline-container',
      );
      const timelineSteps = fixture.nativeElement.querySelectorAll('.timeline-flow-step');
      const navigationArrows = fixture.nativeElement.querySelectorAll('.navigation-arrow');

      expect(timelineContainer).toBeTruthy();
      expect(timelineSteps.length).toBe(5);
      expect(navigationArrows.length).toBe(4);
    });

    it('should have info box with title and description', () => {
      const infoBox = fixture.nativeElement.querySelector('.pending-gas-charge-info-modal__info-box');
      const infoTitle = fixture.nativeElement.querySelector('.pending-gas-charge-info-modal__info-title');
      const infoDescription = fixture.nativeElement.querySelector('.pending-gas-charge-info-modal__info-description');

      expect(infoBox).toBeTruthy();
      expect(infoTitle).toBeTruthy();
      expect(infoDescription).toBeTruthy();
    });

    it('should have read more container with link', () => {
      const readMoreContainer = fixture.nativeElement.querySelector(
        '.pending-gas-charge-info-modal__read-more-container',
      );
      const readMoreText = fixture.nativeElement.querySelector('.pending-gas-charge-info-modal__read-more-text');
      const readMoreLink = fixture.nativeElement.querySelector('.pending-gas-charge-info-modal__read-more-link');

      expect(readMoreContainer).toBeTruthy();
      expect(readMoreText).toBeTruthy();
      expect(readMoreLink).toBeTruthy();
    });

    it('should have timeline steps with icons', () => {
      const timelineSteps = fixture.nativeElement.querySelectorAll('.timeline-flow-step');
      expect(timelineSteps.length).toBe(5);

      timelineSteps.forEach((step) => {
        const iconContainer = step.querySelector('.icon-container');
        expect(iconContainer).toBeTruthy();
      });
    });

    it('should have navigation arrows between steps', () => {
      const navigationArrows = fixture.nativeElement.querySelectorAll('.navigation-arrow');
      expect(navigationArrows.length).toBe(4);
    });

    it('should have last step with different styling', () => {
      const lastStep = fixture.nativeElement.querySelector('.timeline-flow-step.last-step');
      expect(lastStep).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have proper data-testid attributes', () => {
      const closeBtn = fixture.nativeElement.querySelector('[data-testid="close-btn"]');
      const title = fixture.nativeElement.querySelector('[data-testid="title"]');
      const content = fixture.nativeElement.querySelector('[data-testid="content"]');

      expect(closeBtn).toBeTruthy();
      expect(title).toBeTruthy();
      expect(content).toBeTruthy();
    });
  });

  describe('component methods', () => {
    it('should have dismissModal method', () => {
      expect(typeof component.dismissModal).toBe('function');
    });
  });
});
