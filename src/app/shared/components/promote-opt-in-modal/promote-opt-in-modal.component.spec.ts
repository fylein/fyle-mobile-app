import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';

import { PromoteOptInModalComponent } from './promote-opt-in-modal.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('PromoteOptInModalComponent', () => {
  let component: PromoteOptInModalComponent;
  let fixture: ComponentFixture<PromoteOptInModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss', 'onDidDismiss']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [PromoteOptInModalComponent],
      imports: [IonicModule.forRoot(), TranslocoModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PromoteOptInModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'promoteOptInModal.skipMessageBody':
          "<div>\n              <p>You can't send receipts and expense details via text message if you don't opt in.</p>\n              <p>Are you sure you want to skip?<p>  \n            </div>",
        'promoteOptInModal.areYouSure': 'Are you sure?',
        'promoteOptInModal.yesSkipOptIn': 'Yes, skip opt in',
        'promoteOptInModal.noGoBack': 'No, go back',
        'promoteOptInModal.skip': 'Skip',
        'promoteOptInModal.altOptInGif': 'Opt in to text receipts',
        'promoteOptInModal.tryAI': ' Try AI ',
        'promoteOptInModal.description':
          'Text receipts for <span class="promote-opt-in-modal__instant-text-decoration">instant</span>\n      <span class="promote-opt-in-modal__underline"></span> expense submission',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('skip(): should dismiss modal', fakeAsync(() => {
    const skipOptInPopover = jasmine.createSpyObj('skipOptInPopover', ['present', 'onWillDismiss']);
    skipOptInPopover.onWillDismiss.and.resolveTo({ data: { action: 'continue' } });
    popoverController.create.and.returnValue(skipOptInPopover);
    component.skip();
    tick(100);
    expect(popoverController.create).toHaveBeenCalledTimes(1);
    expect(skipOptInPopover.present).toHaveBeenCalledTimes(1);
    expect(skipOptInPopover.onWillDismiss).toHaveBeenCalledTimes(1);
    expect(modalController.dismiss).toHaveBeenCalledWith({ skipOptIn: true });
  }));

  it('optInClick(): should dismiss modal on optInClick with skipOptIn as false if user opted-in', async () => {
    const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
    modalController.create.and.resolveTo(modal);
    modal.onDidDismiss.and.resolveTo({ data: { action: 'SUCCESS' } });

    await component.optInClick();
    expect(modalController.dismiss).toHaveBeenCalledWith({ skipOptIn: false });
  });
});
