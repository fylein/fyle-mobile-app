import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CameraPreviewComponent } from './camera-preview.component';
import { DEVICE_PLATFORM } from 'src/app/constants';
import { CameraState } from 'src/app/core/enums/camera-state.enum';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { SimpleChange } from '@angular/core';

describe('CameraPreviewComponent', () => {
  let component: CameraPreviewComponent;
  let fixture: ComponentFixture<CameraPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CameraPreviewComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: DEVICE_PLATFORM,
          useValue: 'Ios',
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setUpAndStartCamera():', () => {
    it('should start camera preview if permission is granted', fakeAsync(() => {
      component.camera = jasmine.createSpyObj('Camera', {
        requestPermissions: Promise.resolve({
          camera: 'granted',
          photos: 'granted',
        }),
      });
      spyOn(component, 'startCameraPreview');

      fixture.detectChanges();

      component.setUpAndStartCamera();
      tick(1000);
      expect(component.startCameraPreview).toHaveBeenCalledTimes(1);
      expect(component.camera.requestPermissions).toHaveBeenCalledTimes(1);
    }));

    it('should emit permission denied event', fakeAsync(() => {
      component.camera = jasmine.createSpyObj('Camera', {
        requestPermissions: Promise.resolve({
          camera: 'denied',
          photos: 'granted',
        }),
      });
      spyOn(component.permissionDenied, 'emit');

      fixture.detectChanges();

      component.setUpAndStartCamera();
      tick();
      expect(component.permissionDenied.emit).toHaveBeenCalledTimes(1);
      expect(component.camera.requestPermissions).toHaveBeenCalledTimes(1);
    }));
  });

  it('startCameraPreview(): should start camera preview', fakeAsync(() => {
    component.cameraPreview = jasmine.createSpyObj('CameraPreview', {
      start: Promise.resolve({}),
    });
    spyOn(component, 'getFlashModes');
    fixture.detectChanges();

    component.startCameraPreview();
    tick();
    expect(component.getFlashModes).toHaveBeenCalledTimes(1);
    expect(component.cameraPreview.start).toHaveBeenCalledOnceWith({
      position: 'rear',
      toBack: true,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'cameraPreview',
      disableAudio: true,
    });
  }));

  it('stopCamera(): should stop camera and change state', fakeAsync(() => {
    component.cameraPreview = jasmine.createSpyObj('CameraPreview', {
      stop: Promise.resolve({}),
    });
    component.cameraState = CameraState.RUNNING;
    fixture.detectChanges();

    component.stopCamera();
    tick();
    expect(component.cameraPreview.stop).toHaveBeenCalledTimes(1);
  }));

  describe('getFlashModes():', () => {
    it('should get flash modes', () => {
      component.flashMode = 'off';
      component.cameraPreview = jasmine.createSpyObj('CameraPreview', {
        getSupportedFlashModes: Promise.resolve({
          result: ['on', 'off'],
        }),
        setFlashMode: Promise.resolve({}),
      });
      fixture.detectChanges();

      component.getFlashModes();
      expect(component.cameraPreview.getSupportedFlashModes).toHaveBeenCalledTimes(1);
    });

    it('should not change flash modes if there are no available flash modes', () => {
      component.cameraPreview = jasmine.createSpyObj('CameraPreview', {
        getSupportedFlashModes: Promise.resolve({}),
        setFlashMode: Promise.resolve({}),
      });
      component.flashMode = 'on';
      fixture.detectChanges();

      component.getFlashModes();
      expect(component.cameraPreview.setFlashMode).not.toHaveBeenCalled();
    });
  });

  it('onToggleFlashMode(): should toggle flash mode', () => {
    spyOn(component.toggleFlashMode, 'emit');
    component.flashMode = 'on';
    component.cameraPreview = jasmine.createSpyObj('CameraPreview', {
      setFlashMode: Promise.resolve(),
    });
    fixture.detectChanges();

    component.onToggleFlashMode();
    expect(component.toggleFlashMode.emit).toHaveBeenCalledTimes(1);
    expect(component.cameraPreview.setFlashMode).toHaveBeenCalledOnceWith({ flashMode: 'off' });
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
