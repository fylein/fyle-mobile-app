import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { PromoteOptInModalComponent } from './promote-opt-in-modal.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PromoteOptInModalComponent', () => {
  let component: PromoteOptInModalComponent;
  let fixture: ComponentFixture<PromoteOptInModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss', 'onDidDismiss']);

    TestBed.configureTestingModule({
      declarations: [PromoteOptInModalComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PromoteOptInModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('skip(): should dismiss modal', () => {
    component.skip();
    expect(modalController.dismiss).toHaveBeenCalledWith({ skipOptIn: true });
  });

  describe('optInClick()', () => {
    it('should dismiss modal on optInClick with skipOptIn as false if user opted-in', async () => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalController.create.and.resolveTo(modal);
      modal.onDidDismiss.and.resolveTo({ data: { action: 'SUCCESS' } });

      await component.optInClick();
      expect(modalController.dismiss).toHaveBeenCalledWith({ skipOptIn: false });
    });

    it('should dismiss modal on optInClick with skipOptIn as true if user has not opted-in', async () => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
      modalController.create.and.resolveTo(modal);
      modal.onDidDismiss.and.resolveTo({});

      await component.optInClick();
      expect(modalController.dismiss).toHaveBeenCalledWith({ skipOptIn: true });
    });
  });
});
