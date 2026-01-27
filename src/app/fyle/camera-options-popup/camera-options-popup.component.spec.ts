import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/standalone';
import { FileService } from 'src/app/core/services/file.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';
import { CameraOptionsPopupComponent } from './camera-options-popup.component';
import { MAX_FILE_SIZE } from 'src/app/core/constants';
import { LoaderService } from 'src/app/core/services/loader.service';
import { of } from 'rxjs';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('CameraOptionsPopupComponent', () => {
  let component: CameraOptionsPopupComponent;
  let fixture: ComponentFixture<CameraOptionsPopupComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let fileService: jasmine.SpyObj<FileService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let translocoService: TranslocoService;
  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create', 'dismiss']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['readFile']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['addAttachment', 'addAttachmentPickerError']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [TranslocoModule, CameraOptionsPopupComponent, MatIconTestingModule],
      providers: [
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraOptionsPopupComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    translocoService = TestBed.inject(TranslocoService);
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'cameraOptionsPopup.sizeLimitExceededTitle': 'Size limit exceeded',
        'cameraOptionsPopup.sizeLimitExceededMessage':
          'The uploaded file is greater than 11MB in size. Please reduce the file size and try again.',
        'cameraOptionsPopup.ok': 'OK',
        'cameraOptionsPopup.addMoreUsing': 'Add more using',
        'cameraOptionsPopup.clickPicture': 'Click picture',
        'cameraOptionsPopup.uploadFiles': 'Upload files',
        'cameraOptionsPopup.uploadFile': 'Upload file',
        'cameraOptionsPopup.uploadImage': 'Upload image',
        'cameraOptionsPopup.loaderMessage': 'Please wait...',
      };
      return translations[key] || key;
    });
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
    fixture.componentRef.setInput('mode', 'Edit Expense');
    component.getImageFromPicture();
    tick(500);
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ option: 'camera' });
    expect(trackingService.addAttachment).toHaveBeenCalledOnceWith({ Mode: 'Edit Expense', Category: 'Camera' });
  }));

  it('showSizeLimitExceededPopover(): should show size limit exceed popup to the user', fakeAsync(() => {
    const sizeLimitExceededPopoverSpy = jasmine.createSpyObj('sizeLimitExceededPopover', ['present']);
    popoverController.create.and.resolveTo(sizeLimitExceededPopoverSpy);
    component.showSizeLimitExceededPopover(11534337);
    tick(500);
    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: PopupAlertComponent,
      componentProps: {
        title: 'Size limit exceeded',
        message: 'The uploaded file is greater than 11MB in size. Please reduce the file size and try again.',
        primaryCta: { text: 'OK' },
      },
      cssClass: 'pop-up-in-center',
    });
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
      const newSize = MAX_FILE_SIZE + 1;
      const myBlob = new Blob([new ArrayBuffer(newSize)], { type: 'application/octet-stream' });
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

    it('should show loader if file reading takes more than 300ms', fakeAsync(() => {
      let resolveFileRead: (v: string) => void;
      const fileReadPromise: Promise<string> = new Promise((resolve) => {
        resolveFileRead = resolve;
      });
      fileService.readFile.and.returnValue(fileReadPromise);
      loaderService.showLoader.and.resolveTo();
      const myBlob = new Blob([new ArrayBuffer(100 * 100)], { type: 'application/octet-stream' });
      const file = new File([myBlob], 'file');
      component.uploadFileCallback(file);
      tick(301);
      expect(loaderService.showLoader).toHaveBeenCalledWith('Please wait...', 5000);
      resolveFileRead!('file-data');
      tick(100);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({
        type: file.type,
        dataUrl: 'file-data',
        actionSource: 'gallery_upload',
      });
    }));
  });
});
