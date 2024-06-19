import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';

import { DashboardOptInComponent } from './dashboard-opt-in.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DashboardOptInComponent', () => {
  let component: DashboardOptInComponent;
  let fixture: ComponentFixture<DashboardOptInComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss', 'onWillDismiss']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);

    TestBed.configureTestingModule({
      declarations: [DashboardOptInComponent],
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

    fixture = TestBed.createComponent(DashboardOptInComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('optInClick()', () => {
    beforeEach(() => {
      spyOn(component.toggleOptInBanner, 'emit');
    });

    it('should dismiss modal on optInClick with skipOptIn as false if user opted-in', async () => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
      modalController.create.and.resolveTo(modal);
      modal.onWillDismiss.and.resolveTo({ data: { action: 'SUCCESS' } });

      await component.optInClick();
      expect(component.toggleOptInBanner.emit).toHaveBeenCalledWith({ optedIn: true });
    });

    it('should dismiss modal on optInClick with skipOptIn as true if user has not opted-in', async () => {
      const modal = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
      modalController.create.and.resolveTo(modal);
      modal.onWillDismiss.and.resolveTo({});

      await component.optInClick();
      expect(component.toggleOptInBanner.emit).not.toHaveBeenCalled();
    });
  });

  it('skip(): should show popover and emit toggleOptInBanner with false', async () => {
    const popover = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
    popoverController.create.and.resolveTo(popover);
    popover.onWillDismiss.and.resolveTo({ data: { action: 'continue' } });
    spyOn(component.toggleOptInBanner, 'emit');

    await component.skip();
    expect(popover.present).toHaveBeenCalledTimes(1);
    expect(component.toggleOptInBanner.emit).toHaveBeenCalledWith({ optedIn: false });
  });
});
