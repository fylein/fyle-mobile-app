import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { FileService } from 'src/app/core/services/file.service';
import { FilePickerService } from 'src/app/core/services/file-picker.service';
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
  let filePickerService: jasmine.SpyObj<FilePickerService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let translocoService: TranslocoService;
  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create', 'dismiss']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['readFile', 'getImageTypeFromDataUrl']);
    const filePickerServiceSpy = jasmine.createSpyObj('FilePickerService', ['pick']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['addAttachment', 'filePickerError']);
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
        { provide: FilePickerService, useValue: filePickerServiceSpy },
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
    filePickerService = TestBed.inject(FilePickerService) as jasmine.SpyObj<FilePickerService>;
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
      fileService.getImageTypeFromDataUrl.and.returnValue('image/jpeg');
      const myBlob = new Blob([new ArrayBuffer(100 * 100)], { type: 'application/octet-stream' });
      const file = new File([myBlob], 'file');
      component.uploadFileCallback(file);
      tick(500);
      expect(fileService.readFile).toHaveBeenCalledOnceWith(file);
      expect(fileService.getImageTypeFromDataUrl).toHaveBeenCalledOnceWith('file');
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ dataUrl: 'file', type: 'image/jpeg' });
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
      fileService.getImageTypeFromDataUrl.and.returnValue('image/png');
      loaderService.showLoader.and.resolveTo();
      const myBlob = new Blob([new ArrayBuffer(100 * 100)], { type: 'application/octet-stream' });
      const file = new File([myBlob], 'file');
      component.uploadFileCallback(file);
      tick(301);
      expect(loaderService.showLoader).toHaveBeenCalledWith('Please wait...', 5000);
      resolveFileRead!('file-data');
      tick(100);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(fileService.getImageTypeFromDataUrl).toHaveBeenCalledOnceWith('file-data');
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ dataUrl: 'file-data', type: 'image/png' });
    }));
  });

  describe('getFileFromFilePicker():', () => {
    it('calls addAttachment with Category "Upload File" and Mode from input', async () => {
      fixture.componentRef.setInput('mode', 'Edit Advance Request');
      spyOn(Capacitor, 'isNativePlatform').and.returnValue(false);
      const inputEl = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      spyOn(inputEl, 'click');

      await component.getFileFromFilePicker();

      expect(trackingService.addAttachment).toHaveBeenCalledOnceWith({
        Mode: 'Edit Advance Request',
        Category: 'Upload File',
      });
    });

    it('on web sets file input accept to application/pdf and triggers click', async () => {
      spyOn(Capacitor, 'isNativePlatform').and.returnValue(false);
      fixture.detectChanges();
      const inputEl = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      spyOn(inputEl, 'click');

      await component.getFileFromFilePicker();

      expect(inputEl.accept).toBe('application/pdf');
      expect(inputEl.click).toHaveBeenCalled();
    });

  });

  describe('getImageFromImagePicker():', () => {
    it('calls addAttachment with Category "Upload Image" and Mode from input', async () => {
      fixture.componentRef.setInput('mode', 'Add Expense');
      spyOn(Capacitor, 'isNativePlatform').and.returnValue(false);
      const inputEl = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      spyOn(inputEl, 'click');

      await component.getImageFromImagePicker();

      expect(trackingService.addAttachment).toHaveBeenCalledOnceWith({
        Mode: 'Add Expense',
        Category: 'Upload Image',
      });
    });

    it('on web sets file input accept to image/* and triggers click', async () => {
      spyOn(Capacitor, 'isNativePlatform').and.returnValue(false);
      fixture.detectChanges();
      const inputEl = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      spyOn(inputEl, 'click');

      await component.getImageFromImagePicker();

      expect(inputEl.accept).toBe('image/*');
      expect(inputEl.click).toHaveBeenCalled();
    });

  });

  describe('triggerFileInput():', () => {
    it('sets input accept and calls click', async () => {
      spyOn(Capacitor, 'isNativePlatform').and.returnValue(false);
      fixture.detectChanges();
      const inputEl = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      spyOn(inputEl, 'click');

      (component as unknown as { triggerFileInput: (accept: string) => void }).triggerFileInput(
        'application/pdf',
      );
      expect(inputEl.accept).toBe('application/pdf');
      expect(inputEl.click).toHaveBeenCalled();
    });

    it('when input has a file and onchange fires, calls uploadFileCallback with that file', async () => {
      spyOn(Capacitor, 'isNativePlatform').and.returnValue(false);
      fixture.detectChanges();
      const inputEl = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
      spyOn(component, 'uploadFileCallback');
      const myBlob = new Blob([], { type: 'application/pdf' });
      const file = new File([myBlob], 'doc.pdf', { type: 'application/pdf' });
      Object.defineProperty(inputEl, 'files', {
        value: { 0: file, length: 1, item: (i: number) => (i === 0 ? file : null) },
        writable: false,
      });

      (component as unknown as { triggerFileInput: (accept: string) => void }).triggerFileInput(
        'application/pdf',
      );
      (inputEl.onchange as (ev?: Event) => void)?.();

      expect(component.uploadFileCallback).toHaveBeenCalledOnceWith(file);
    });
  });

  describe('pickAndUpload():', () => {
    it('on success converts picked file and calls uploadFileCallback', fakeAsync(() => {
      const mockBlob = new Blob([], { type: 'application/pdf' });
      spyOn(window, 'fetch').and.resolveTo({
        blob: () => Promise.resolve(mockBlob),
        ok: true,
      } as Response);
      filePickerService.pick.and.resolveTo({
        files: [
          {
            path: '/path/doc.pdf',
            webPath: 'https://example.com/doc.pdf',
            name: 'doc.pdf',
            extension: 'pdf',
          },
        ],
      });
      fileService.readFile.and.resolveTo('dataUrl');
      const uploadFileCallbackSpy = spyOn(component, 'uploadFileCallback');

      fixture.componentRef.setInput('mode', 'Edit Expense');
      (component as unknown as { pickAndUpload: (mimes: string[], category: string) => Promise<void> }).pickAndUpload(
        ['application/pdf'],
        'Upload File',
      );
      flush();

      expect(uploadFileCallbackSpy).toHaveBeenCalled();
      if (uploadFileCallbackSpy.calls.any()) {
        const blobArg = uploadFileCallbackSpy.calls.mostRecent().args[0];
        expect(blobArg).toBeInstanceOf(Blob);
        expect(blobArg.type).toBe('application/pdf');
      }
    }));

    it('on error calls filePickerError with Mode, Category and error', fakeAsync(() => {
      fixture.componentRef.setInput('mode', 'Edit Advance Request');
      filePickerService.pick.and.rejectWith(new Error('User cancelled'));

      (component as unknown as { pickAndUpload: (mimes: string[], category: string) => Promise<void> }).pickAndUpload(
        ['application/pdf'],
        'Upload File',
      );
      flush();

      const filePickerErrorSpy = trackingService.filePickerError as jasmine.Spy;
      expect(filePickerErrorSpy).toHaveBeenCalled();
      if (filePickerErrorSpy.calls.count() > 0) {
        const props = filePickerErrorSpy.calls.mostRecent().args[0];
        expect(props).toEqual(jasmine.objectContaining({
          Mode: 'Edit Advance Request',
          Category: 'Upload File',
        }));
        expect(props.error).toBeInstanceOf(Error);
        expect(typeof props.error.message).toBe('string');
      }
    }));

    it('when FilePicker returns no files, does not call uploadFileCallback', fakeAsync(() => {
      filePickerService.pick.and.resolveTo({ files: [] });
      const uploadFileCallbackSpy = spyOn(component, 'uploadFileCallback');

      (component as unknown as { pickAndUpload: (mimes: string[], category: string) => Promise<void> }).pickAndUpload(
        ['application/pdf'],
        'Upload File',
      );
      tick();

      expect(uploadFileCallbackSpy).not.toHaveBeenCalled();
    }));
  });

  describe('pickedFileToBlob():', () => {
    it('returns a Blob with correct type and content from picked object', fakeAsync(() => {
      const mockBlob = new Blob(['content'], { type: 'image/png' });
      spyOn(window, 'fetch').and.resolveTo({
        blob: () => Promise.resolve(mockBlob),
        ok: true,
      } as Response);
      const picked = {
        path: '/path/photo.png',
        webPath: 'https://example.com/photo.png',
      };

      const resultPromise = (component as unknown as {
        pickedFileToBlob: (p: typeof picked) => Promise<Blob>;
      }).pickedFileToBlob(picked);
      let result: Blob | undefined;
      resultPromise.then((b) => (result = b));
      tick();

      expect(result).toBeInstanceOf(Blob);
      expect(result?.type).toBe('image/png');
    }));

    it('uses path when webPath is absent via Capacitor.convertFileSrc', fakeAsync(() => {
      spyOn(Capacitor, 'convertFileSrc').and.returnValue('file:///converted/path');
      const mockBlob = new Blob([], { type: 'application/pdf' });
      spyOn(window, 'fetch').and.resolveTo({
        blob: () => Promise.resolve(mockBlob),
        ok: true,
      } as Response);
      const picked = {
        path: '/native/path/doc.pdf',
        webPath: undefined as unknown as string,
      };

      (component as unknown as { pickedFileToBlob: (p: typeof picked) => Promise<Blob> }).pickedFileToBlob(
        picked,
      );
      flush();

      expect(Capacitor.convertFileSrc).toHaveBeenCalledWith('/native/path/doc.pdf');
    }));
  });
});
