import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { FileService } from 'src/app/core/services/file.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { CameraOptionsPopupComponent } from './camera-options-popup.component';

describe('CameraOptionsPopupComponent', () => {
  let component: CameraOptionsPopupComponent;
  let fixture: ComponentFixture<CameraOptionsPopupComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let fileService: jasmine.SpyObj<FileService>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create', 'dismiss']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['readFile']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['addAttachment']);

    TestBed.configureTestingModule({
      declarations: [CameraOptionsPopupComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: FileService,
          useValue: fileServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraOptionsPopupComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closeClicked(): dismiss popover', () => {
    component.closeClicked();

    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('getImageFromPicture(): should get an image from the popover', fakeAsync(() => {
    popoverController.dismiss.and.resolveTo(true);

    component.getImageFromPicture();
    tick(500);

    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ option: 'camera' });
    expect(trackingService.addAttachment).toHaveBeenCalledOnceWith({ Mode: 'Add Expense', Category: 'Camera' });
  }));

  it('showSizeLimitExceededPopover(): should show size limit exceed popup to the user', fakeAsync(() => {
    const sizeLimitExceededPopoverSpy = jasmine.createSpyObj('sizeLimitExceededPopover', ['present']);
    popoverController.create.and.resolveTo(sizeLimitExceededPopoverSpy);

    component.showSizeLimitExceededPopover();
    tick(500);

    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Size limit exceeded',
        message: 'The uploaded file is greater than 5MB in size. Please reduce the file size and try again.',
        primaryCta: {
          text: 'OK',
        },
      },
      cssClass: 'pop-up-in-center',
    });
  }));

  it('onChangeCallback(): should call upload file callback', fakeAsync(() => {
    spyOn(component, 'uploadFileCallback');

    const mockFile = new File(['file contents'], 'test.png', { type: 'image/png' });
    const mockNativeElement = {
      files: [mockFile],
    } as unknown as HTMLInputElement;

    component.onChangeCallback(mockNativeElement);
    tick(500);

    expect(component.uploadFileCallback).toHaveBeenCalledOnceWith(mockFile);
  }));

  it('getImageFromImagePicker():', fakeAsync(() => {
    spyOn(component, 'onChangeCallback');

    const dummyNativeElement = document.createElement('input');

    component.fileUpload = {
      nativeElement: dummyNativeElement,
    } as DebugElement;

    const nativeElement = component.fileUpload.nativeElement as HTMLInputElement;
    spyOn(nativeElement, 'click').and.callThrough();

    component.getImageFromImagePicker();
    fixture.detectChanges();
    tick(500);

    nativeElement.dispatchEvent(new Event('change'));

    expect(component.onChangeCallback).toHaveBeenCalledOnceWith(nativeElement);
    expect(nativeElement.click).toHaveBeenCalledTimes(1);
    expect(trackingService.addAttachment).toHaveBeenCalledOnceWith({ Mode: 'Add Expense', Category: 'Camera' });
  }));

  describe('uploadFileCallback():', () => {
    it('should read file if the size is less than the maximum file size limit', fakeAsync(() => {
      fileService.readFile.and.resolveTo('file');
      const myBlob = new Blob([new ArrayBuffer(100 * 100)], { type: 'application/octet-stream' });
      const file = new File([myBlob], 'file');

      component.uploadFileCallback(file);
      tick(500);

      expect(fileService.readFile).toHaveBeenCalledOnceWith(file);
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({
        type: file.type,
        dataUrl: 'file',
        actionSource: 'gallery_upload',
      });
    }));

    it('should show warning popup to the user when the file size exceeds the maximum file size limit  allowed', fakeAsync(() => {
      const myBlob = new Blob([new ArrayBuffer(100 * 100 * 1000)], { type: 'application/octet-stream' });
      const file = new File([myBlob], 'file');

      spyOn(component, 'closeClicked');
      spyOn(component, 'showSizeLimitExceededPopover');

      component.uploadFileCallback(file);
      tick(500);

      expect(component.closeClicked).toHaveBeenCalledTimes(1);
      expect(component.showSizeLimitExceededPopover).toHaveBeenCalledTimes(1);
    }));

    it('should take no action if file is not present', fakeAsync(() => {
      spyOn(component, 'closeClicked');
      spyOn(component, 'showSizeLimitExceededPopover');

      component.uploadFileCallback(null);
      tick(500);

      expect(fileService.readFile).not.toHaveBeenCalled();
      expect(popoverController.dismiss).not.toHaveBeenCalled();
      expect(component.closeClicked).toHaveBeenCalledTimes(1);
      expect(component.showSizeLimitExceededPopover).not.toHaveBeenCalled();
    }));
  });
});
