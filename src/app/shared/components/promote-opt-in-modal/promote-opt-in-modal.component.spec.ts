import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';

import { PromoteOptInModalComponent } from './promote-opt-in-modal.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PromoteOptInModalComponent', () => {
  let component: PromoteOptInModalComponent;
  let fixture: ComponentFixture<PromoteOptInModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss', 'onDidDismiss']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);

    TestBed.configureTestingModule({
      declarations: [PromoteOptInModalComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PromoteOptInModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
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
