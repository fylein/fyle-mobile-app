import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';
import { TrackingService } from '../../../core/services/tracking.service';
import { SupportDialogPage } from './support-dialog.page';
import { employeesRes } from 'src/app/core/test-data/org-user.service.spec.data';

class MockNavParams {
  data = {
    type: 'contact_support',
    adminEous: employeesRes.data,
  };

  get(param) {
    return this.data[param];
  }
}

describe('SupportDialogPage', () => {
  let component: SupportDialogPage;
  let fixture: ComponentFixture<SupportDialogPage>;
  let modalController: jasmine.SpyObj<ModalController>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let browserHandlerService: jasmine.SpyObj<BrowserHandlerService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['engageWithHelpCard']);
    const browserHandlerServiceSpy = jasmine.createSpyObj('BrowserHandlerService', ['openLinkWithToolbarColor']);

    TestBed.configureTestingModule({
      declarations: [SupportDialogPage],
      imports: [IonicModule.forRoot(), MatIconTestingModule, MatIconModule],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: BrowserHandlerService, useValue: browserHandlerServiceSpy },
        { provide: NavParams, useClass: MockNavParams },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SupportDialogPage);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    browserHandlerService = TestBed.inject(BrowserHandlerService) as jasmine.SpyObj<BrowserHandlerService>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openHelpLink(): should open help link', () => {
    component.openHelpLink();
    expect(trackingService.engageWithHelpCard).toHaveBeenCalledTimes(1);
    expect(browserHandlerService.openLinkWithToolbarColor).toHaveBeenCalledOnceWith(
      '#280a31',
      'https://help.fylehq.com'
    );
  });

  it('openChromeExtLink(): should open chrome extention link', () => {
    component.openChromeExtLink();
    expect(trackingService.engageWithHelpCard).toHaveBeenCalledTimes(1);
    expect(browserHandlerService.openLinkWithToolbarColor).toHaveBeenCalledOnceWith(
      '#280a31',
      'https://chrome.google.com/webstore/detail/fyle-expense-tracking-rep/abggpefphmldapcoknbcaadbpdjjmjgk'
    );
  });

  it('openOutlookExtLink(): should open outlook extention link', () => {
    component.openOutlookExtLink();
    expect(trackingService.engageWithHelpCard).toHaveBeenCalledTimes(1);
    expect(browserHandlerService.openLinkWithToolbarColor).toHaveBeenCalledOnceWith(
      '#280a31',
      'https://appsource.microsoft.com/en-us/product/office/WA104380673?tab=Overview'
    );
  });

  it('closeDialog(): should dismiss the dialog', () => {
    component.closeDialog();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ dismissed: true });
  });
});
