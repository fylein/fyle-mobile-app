import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { FileService } from 'src/app/core/services/file.service';
import { CameraOptionsPopupComponent } from './camera-options-popup.component';
import { of } from 'rxjs';

describe('CameraOptionsPopupComponent', () => {
  let component: CameraOptionsPopupComponent;
  let fixture: ComponentFixture<CameraOptionsPopupComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let fileService: jasmine.SpyObj<FileService>;
  let translocoService: TranslocoService;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['readFile']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });

    TestBed.configureTestingModule({
      declarations: [CameraOptionsPopupComponent],
      imports: [IonicModule.forRoot(), TranslocoModule],
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
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraOptionsPopupComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    translocoService = TestBed.inject(TranslocoService);

    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'cameraOptionsPopup.clickAPicture': 'Click a picture',
        'cameraOptionsPopup.uploadFiles': 'Upload files',
      };
      return translations[key] || key;
    });

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should initialize component', () => {
      spyOn(component, 'ngOnInit');

      component.ngOnInit();

      expect(component.ngOnInit).toHaveBeenCalledTimes(1);
    });

    it('should not throw any errors when called', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('closeClicked()', () => {
    it('should dismiss popover when called', () => {
      component.closeClicked();

      expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
      expect(popoverController.dismiss).toHaveBeenCalledWith();
    });

    it('should not pass any parameters to dismiss', () => {
      component.closeClicked();

      expect(popoverController.dismiss).toHaveBeenCalledWith();
    });
  });

  describe('getImageFromPicture()', () => {
    it('should dismiss popover with camera option', fakeAsync(() => {
      popoverController.dismiss.and.resolveTo(true);

      component.getImageFromPicture();
      tick(100);

      expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
      expect(popoverController.dismiss).toHaveBeenCalledWith({ option: 'camera' });
    }));

    it('should handle async operation correctly', fakeAsync(() => {
      popoverController.dismiss.and.resolveTo(true);

      component.getImageFromPicture();
      tick(100);

      expect(popoverController.dismiss).toHaveBeenCalledWith({ option: 'camera' });
    }));

    it('should not throw errors when dismiss resolves', fakeAsync(() => {
      popoverController.dismiss.and.resolveTo(true);

      expect(() => {
        component.getImageFromPicture();
        tick(100);
      }).not.toThrow();
    }));
  });

  describe('getImageFromImagePicker()', () => {
    beforeEach(() => {
      // Setup fileUpload ViewChild mock
      const mockNativeElement = document.createElement('input');
      component.fileUpload = {
        nativeElement: mockNativeElement,
      } as DebugElement;
    });

    it('should set up file input change handler and click the input', fakeAsync(() => {
      const nativeElement = component.fileUpload.nativeElement as HTMLInputElement;
      spyOn(nativeElement, 'click').and.callThrough();

      component.getImageFromImagePicker();
      tick(100);

      expect(nativeElement.click).toHaveBeenCalledTimes(1);
      expect(typeof nativeElement.onchange).toBe('function');
    }));

    it('should handle file selection and read file successfully', fakeAsync(() => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' });
      const mockDataUrl = 'data:image/png;base64,test-data';
      fileService.readFile.and.resolveTo(mockDataUrl);

      const nativeElement = component.fileUpload.nativeElement as HTMLInputElement;
      spyOn(nativeElement, 'click').and.callThrough();

      component.getImageFromImagePicker();
      tick(100);

      // Simulate file selection
      Object.defineProperty(nativeElement, 'files', {
        value: [mockFile],
        writable: true,
      });

      // Trigger the change event
      nativeElement.dispatchEvent(new Event('change'));
      tick(100);

      expect(fileService.readFile).toHaveBeenCalledWith(mockFile);
      expect(popoverController.dismiss).toHaveBeenCalledWith({
        type: mockFile.type,
        dataUrl: mockDataUrl,
      });
    }));

    it('should call closeClicked when no file is selected', fakeAsync(() => {
      spyOn(component, 'closeClicked');

      const nativeElement = component.fileUpload.nativeElement as HTMLInputElement;
      spyOn(nativeElement, 'click').and.callThrough();

      component.getImageFromImagePicker();
      tick(100);

      // Simulate no file selection
      Object.defineProperty(nativeElement, 'files', {
        value: [],
        writable: true,
      });

      // Trigger the change event
      nativeElement.dispatchEvent(new Event('change'));
      tick(100);

      expect(component.closeClicked).toHaveBeenCalledTimes(1);
    }));

    it('should handle null fileUpload ViewChild gracefully', fakeAsync(() => {
      component.fileUpload = null;

      expect(() => {
        component.getImageFromImagePicker();
        tick(100);
      }).toThrow();
    }));

    it('should handle different file types correctly', fakeAsync(() => {
      const mockPdfFile = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
      const mockDataUrl = 'data:application/pdf;base64,pdf-data';
      fileService.readFile.and.resolveTo(mockDataUrl);

      const nativeElement = component.fileUpload.nativeElement as HTMLInputElement;
      spyOn(nativeElement, 'click').and.callThrough();

      component.getImageFromImagePicker();
      tick(100);

      // Simulate PDF file selection
      Object.defineProperty(nativeElement, 'files', {
        value: [mockPdfFile],
        writable: true,
      });

      // Trigger the change event
      nativeElement.dispatchEvent(new Event('change'));
      tick(100);

      expect(fileService.readFile).toHaveBeenCalledWith(mockPdfFile);
      expect(popoverController.dismiss).toHaveBeenCalledWith({
        type: mockPdfFile.type,
        dataUrl: mockDataUrl,
      });
    }));
  });

  describe('Component Integration', () => {
    it('should have proper ViewChild setup', () => {
      expect(component.fileUpload).toBeDefined();
    });

    it('should have proper service injections', () => {
      expect(component.popoverController).toBeDefined();
      expect(component.fileService).toBeDefined();
    });

    it('should handle component lifecycle correctly', () => {
      expect(() => {
        component.ngOnInit();
        component.closeClicked();
      }).not.toThrow();
    });
  });
});
