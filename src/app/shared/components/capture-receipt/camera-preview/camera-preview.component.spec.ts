import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CameraPreviewComponent } from './camera-preview.component';
import { DEVICE_PLATFORM } from 'src/app/constants';
import { CameraState } from 'src/app/core/enums/camera-state.enum';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { SimpleChange } from '@angular/core';
import { CameraPreviewService } from 'src/app/core/services/camera-preview.service';
import { CameraService } from 'src/app/core/services/camera.service';

describe('CameraPreviewComponent', () => {
  let component: CameraPreviewComponent;
  let fixture: ComponentFixture<CameraPreviewComponent>;
  let cameraPreviewService: jasmine.SpyObj<CameraPreviewService>;
  let cameraService: jasmine.SpyObj<CameraService>;

  beforeEach(waitForAsync(() => {
    const cameraServiceSpy = jasmine.createSpyObj('CameraService', ['requestCameraPermissions']);
    const cameraPreviewServiceSpy = jasmine.createSpyObj('CameraPreviewService', [
      'start',
      'stop',
      'getSupportedFlashModes',
      'setFlashMode',
    ]);

    TestBed.configureTestingModule({
      declarations: [CameraPreviewComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: DEVICE_PLATFORM,
          useValue: 'Ios',
        },
        {
          provide: CameraService,
          useValue: cameraServiceSpy,
        },
        {
          provide: CameraPreviewService,
          useValue: cameraPreviewServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraPreviewComponent);
    component = fixture.componentInstance;
    cameraService = TestBed.inject(CameraService) as jasmine.SpyObj<CameraService>;
    cameraPreviewService = TestBed.inject(CameraPreviewService) as jasmine.SpyObj<CameraPreviewService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setUpAndStartCamera():', () => {
    it('should start camera preview if permission is granted', fakeAsync(() => {
      cameraService.requestCameraPermissions.and.returnValue(
        Promise.resolve({
          camera: 'granted',
          photos: 'granted',
        })
      );

      spyOn(component, 'startCameraPreview');

      fixture.detectChanges();

      component.setUpAndStartCamera();
      tick(1000);
      expect(component.startCameraPreview).toHaveBeenCalledTimes(1);
      expect(cameraService.requestCameraPermissions).toHaveBeenCalledTimes(1);
    }));

    it('should emit permission denied event', fakeAsync(() => {
      cameraService.requestCameraPermissions.and.returnValue(
        Promise.resolve({
          camera: 'denied',
          photos: 'granted',
        })
      );
      spyOn(component.permissionDenied, 'emit');

      fixture.detectChanges();

      component.setUpAndStartCamera();
      tick(1000);
      expect(component.permissionDenied.emit).toHaveBeenCalledTimes(1);
      expect(cameraService.requestCameraPermissions).toHaveBeenCalledTimes(1);
    }));
  });

  it('startCameraPreview(): should start camera preview', fakeAsync(() => {
    cameraPreviewService.start.and.returnValue(Promise.resolve({}));
    spyOn(component, 'getFlashModes');
    fixture.detectChanges();

    component.startCameraPreview();
    tick(1000);
    expect(component.getFlashModes).toHaveBeenCalledTimes(1);
    expect(cameraPreviewService.start).toHaveBeenCalledOnceWith({
      position: 'rear',
      toBack: true,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'cameraPreview',
      disableAudio: true,
    });
  }));

  it('stopCamera(): should stop camera and change state', fakeAsync(() => {
    cameraPreviewService.stop.and.returnValue(Promise.resolve(true));
    component.cameraState = CameraState.RUNNING;
    fixture.detectChanges();

    component.stopCamera();
    tick(2000);
    expect(cameraPreviewService.stop).toHaveBeenCalledTimes(1);
  }));

  describe('getFlashModes():', () => {
    it('should get flash modes', () => {
      component.flashMode = 'off';
      cameraPreviewService.getSupportedFlashModes.and.returnValue(
        Promise.resolve({
          result: ['on', 'off'],
        })
      );
      cameraPreviewService.setFlashMode.and.stub();

      fixture.detectChanges();

      component.getFlashModes();
      expect(cameraPreviewService.getSupportedFlashModes).toHaveBeenCalledTimes(1);
    });

    it('should not change flash modes if there are no available flash modes', () => {
      cameraPreviewService.getSupportedFlashModes.and.returnValue(
        Promise.resolve({
          result: [],
        })
      );

      component.flashMode = 'on';
      fixture.detectChanges();

      component.getFlashModes();
      expect(cameraPreviewService.getSupportedFlashModes).toHaveBeenCalled();
    });
  });

  it('onToggleFlashMode(): should toggle flash mode', () => {
    spyOn(component.toggleFlashMode, 'emit');
    component.flashMode = 'on';
    cameraPreviewService.setFlashMode.and.stub();

    fixture.detectChanges();

    component.onToggleFlashMode();
    expect(component.toggleFlashMode.emit).toHaveBeenCalledTimes(1);
    expect(cameraPreviewService.setFlashMode).toHaveBeenCalledOnceWith({ flashMode: 'off' });
  });

  it('onGalleryUpload(): should stop camera and emit upload gallery event', () => {
    spyOn(component, 'stopCamera');
    spyOn(component.galleryUpload, 'emit');

    component.onGalleryUpload();
    expect(component.stopCamera).toHaveBeenCalledTimes(1);
    expect(component.galleryUpload.emit).toHaveBeenCalledTimes(1);
  });

  it('onSwitchMode(): should emit switch event', () => {
    spyOn(component.switchMode, 'emit');

    component.onSwitchMode();
    expect(component.switchMode.emit).toHaveBeenCalledTimes(1);
  });

  it('openReceiptPreview(): should stop camera and emit receipt preview event', () => {
    spyOn(component, 'stopCamera');
    spyOn(component.receiptPreview, 'emit');

    component.openReceiptPreview();
    expect(component.stopCamera).toHaveBeenCalledTimes(1);
    expect(component.receiptPreview.emit).toHaveBeenCalledTimes(1);
  });

  it('onDismissCameraPreview(): should stop camera and emit dismiss camera preview event', () => {
    spyOn(component, 'stopCamera');
    spyOn(component.dismissCameraPreview, 'emit');

    component.onDismissCameraPreview();
    expect(component.stopCamera).toHaveBeenCalledTimes(1);
    expect(component.dismissCameraPreview.emit).toHaveBeenCalledTimes(1);
  });

  it('onCaptureReceipt(): should emit capture receipt event', () => {
    spyOn(component.captureReceipt, 'emit');
    component.cameraState = CameraState.RUNNING;
    fixture.detectChanges();

    component.onCaptureReceipt();
    expect(component.captureReceipt.emit).toHaveBeenCalledTimes(1);
  });

  describe('ngOnChanges():', () => {
    it('should show message if bulk mode is turned on', fakeAsync(() => {
      component.ngOnChanges({
        isBulkMode: new SimpleChange(false, true, true),
      });

      expect(component.showModeChangedMessage).toEqual(true);
      tick(1500);
      expect(component.showModeChangedMessage).toEqual(false);
    }));

    it('should not change state if no change detected', () => {
      component.showModeChangedMessage = false;

      component.ngOnChanges({});
      expect(component.showModeChangedMessage).toEqual(false);
    });
  });
});
