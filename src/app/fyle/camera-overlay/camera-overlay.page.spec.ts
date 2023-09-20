import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CameraOverlayPage } from './camera-overlay.page';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CameraOverlayPage', () => {
  let component: CameraOverlayPage;
  let fixture: ComponentFixture<CameraOverlayPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CameraOverlayPage],
      imports: [IonicModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraOverlayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ionViewWillEnter(): should call captureReceipt.ngOnInit() and captureReceipt.setUpAndStartCamera()', () => {
    const captureReceiptComponent = jasmine.createSpyObj('CaptureReceiptComponent', [
      'ngOnInit',
      'setUpAndStartCamera',
    ]);
    component.captureReceipt = captureReceiptComponent;

    component.ionViewWillEnter();
    expect(captureReceiptComponent.ngOnInit).toHaveBeenCalledTimes(1);
    expect(captureReceiptComponent.setUpAndStartCamera).toHaveBeenCalledTimes(1);
  });

  it('ionViewWillLeave(): should call captureReceipt.stopCamera()', () => {
    const captureReceiptComponent = jasmine.createSpyObj('CaptureReceiptComponent', ['stopCamera']);
    component.captureReceipt = captureReceiptComponent;

    component.ionViewWillLeave();
    expect(captureReceiptComponent.stopCamera).toHaveBeenCalledTimes(1);
  });
});
