import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { FyViewAttachmentComponent } from './fy-view-attachment.component';
import { DomSanitizer } from '@angular/platform-browser';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { FileService } from 'src/app/core/services/file.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RotationDirection } from 'src/app/core/enums/rotation-direction.enum';
import { ApproverFileService } from 'src/app/core/services/platform/v1/approver/file.service';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';

describe('FyViewAttachmentComponent', () => {
  let component: FyViewAttachmentComponent;
  let fixture: ComponentFixture<FyViewAttachmentComponent>;
  let domSantizer: jasmine.SpyObj<DomSanitizer>;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let spenderFileService: jasmine.SpyObj<SpenderFileService>;
  let approverFileService: jasmine.SpyObj<ApproverFileService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let fileService: jasmine.SpyObj<FileService>;
  let transactionsOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let router: jasmine.SpyObj<Router>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  
  beforeEach(waitForAsync(() => {
    const domSantizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustUrl']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'deleteFileClicked',
      'fileDeleted',
      'eventTrack',
    ]);
    const spenderFileServiceSpy = jasmine.createSpyObj('SpenderFileService', ['deleteFilesBulk']);
    const approverFileServiceSpy = jasmine.createSpyObj('ApproverFileService', ['deleteFilesBulk']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['attachReceiptToExpense']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['readFile', 'uploadUrl', 'uploadUrlForTeamAdvance']);
    const transactionsOutboxServiceSpy = jasmine.createSpyObj('TransactionsOutboxService', ['uploadData']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        params: {},
        queryParams: {},
      },
    });
    const routerSpy = jasmine.createSpyObj('Router', [], {
      url: '/test-url',
    });
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    
    TestBed.configureTestingModule({
      declarations: [FyViewAttachmentComponent, PopupAlertComponent],
      providers: [
        {
          provide: DomSanitizer,
          useValue: domSantizerSpy,
        },
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: SpenderFileService,
          useValue: spenderFileServiceSpy,
        },
        {
          provide: ApproverFileService,
          useValue: approverFileServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
        {
          provide: FileService,
          useValue: fileServiceSpy,
        },
        {
          provide: TransactionsOutboxService,
          useValue: transactionsOutboxServiceSpy,
        },
        {
          provide: 'API_PAGINATION_SIZE',
          useValue: 10,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        { 
          provide: TranslocoService, 
          useValue: translocoServiceSpy 
        },
      ],
      imports: [IonicModule.forRoot(), TranslocoModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyViewAttachmentComponent);
    component = fixture.componentInstance;
    domSantizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    spenderFileService = TestBed.inject(SpenderFileService) as jasmine.SpyObj<SpenderFileService>;
    approverFileService = TestBed.inject(ApproverFileService) as jasmine.SpyObj<ApproverFileService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    transactionsOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyViewAttachment.mapPreview': 'Map preview',
        'fyViewAttachment.receiptPreviews': 'Receipt previews',
        'fyViewAttachment.saving': 'Saving',
        'fyViewAttachment.saveChanges': 'Save changes',
        'fyViewAttachment.saved': 'Saved',
        'fyViewAttachment.removeReceiptTitle': 'Remove receipt',
        'fyViewAttachment.removeReceiptMessage': 'Are you sure you want to remove this receipt?',
        'fyViewAttachment.remove': 'Remove',
        'fyViewAttachment.cancel': 'Cancel',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    
    // Global fetch and fileService.readFile mocks
    spyOn(window, 'fetch').and.callFake(() =>
      Promise.resolve({
        blob: () => Promise.resolve(new Blob(['mock'], { type: 'image/jpeg' })),
      } as any)
    );
    fileService.readFile.and.resolveTo('data:image/jpeg;base64,mocked');
    fileService.uploadUrl.and.returnValue(of('upload-url'));
    fileService.uploadUrlForTeamAdvance.and.returnValue(of('upload-url-team-advance'));

    const mockAttachments = [
      {
        id: '1',
        type: 'pdf',
        url: 'http://example.com/attachment1.pdf',
      },
      {
        id: '2',
        type: 'image',
        url: 'http://example.com/attachment2.jpg',
      },
      {
        id: '3',
        type: 'pdf',
        url: 'http://example.com/attachment3.pdf',
      },
    ];
    loaderService.hideLoader.and.resolveTo();
    loaderService.showLoader.and.resolveTo();

    component.attachments = mockAttachments;
    // Mock the isTeamAdvance signal input
    Object.defineProperty(component, 'isTeamAdvance', {
      value: () => false,
      writable: true,
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should update ', fakeAsync(() => {
    // Reset the spy to ensure clean state
    domSantizer.bypassSecurityTrustUrl.calls.reset();
    
    const expectedSliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    expect(component.zoomScale).toBe(1);
    expect(component.sliderOptions).toEqual(expectedSliderOptions);
    // The component calls bypassSecurityTrustUrl for each PDF attachment
    // Since we have 2 PDF attachments (indices 0 and 2), it should be called 2 times
    expect(domSantizer.bypassSecurityTrustUrl).toHaveBeenCalledTimes(2);
    expect(domSantizer.bypassSecurityTrustUrl).toHaveBeenCalledWith(component.attachments[0].url);
    expect(domSantizer.bypassSecurityTrustUrl).toHaveBeenCalledWith(component.attachments[2].url);
  }));

  it('ionViewWillEnter(): should update the swiper', () => {
    component.imageSlides = {
      swiperRef: jasmine.createSpyObj('swiperRef', ['update']),
    } as any;
    component.ionViewWillEnter();
    expect(component.imageSlides.swiperRef.update).toHaveBeenCalledTimes(1);
  });

  it('zoomIn(): should scale in the zoom with 0.25x', () => {
    const previousZoomScale = component.zoomScale;
    component.zoomIn();
    expect(component.zoomScale).toBe(previousZoomScale + 0.25);
  });

  it('zoomOut(): should scale out the zoom with 0.25x', () => {
    const previousZoomScale = component.zoomScale;
    component.zoomOut();
    expect(component.zoomScale).toBe(previousZoomScale - 0.25);
  });

  it('resetZoom(): should set the scale to 1', () => {
    component.resetZoom();
    expect(component.zoomScale).toBe(1);
  });

  it('onDoneClick(): should dismiss the modal', () => {
    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ attachments: component.attachments });
  });

  it('goToNextSlide(): should trigger appropiate methods on the swiper component on event', () => {
    const mockSwiperRef = jasmine.createSpyObj('swiperRef', ['slideNext']);
    component.imageSlides = {
      swiperRef: mockSwiperRef,
    } as any;
    component.goToNextSlide();
    expect(mockSwiperRef.slideNext).toHaveBeenCalledTimes(1);
  });

  it('goToPrevSlide(): should trigger appropiate methods on the swiper component on event', () => {
    const mockSwiperRef = jasmine.createSpyObj('swiperRef', ['slidePrev']);
    component.imageSlides = {
      swiperRef: mockSwiperRef,
    } as any;
    component.goToPrevSlide();
    expect(mockSwiperRef.slidePrev).toHaveBeenCalledTimes(1);
  });

  it('getActiveIndex(): should be able to set the proper activeIndex', () => {
    component.imageSlides = {
      swiperRef: {
        activeIndex: 6,
      },
    } as any;
    component.getActiveIndex();
    expect(component.activeIndex).toBe(6);
  });

  it('deleteAttachment(): should be able to show delete attachment popover and perform deletion', fakeAsync(async () => {
    component.imageSlides = {
      swiperRef: {
        activeIndex: Promise.resolve(1),
        slideNext: jasmine.createSpy('slideNext'),
        slidePrev: jasmine.createSpy('slidePrev'),
      },
    } as any;

    popoverController.create.and.returnValue(
      Promise.resolve({
        present: () => Promise.resolve(),
        onWillDismiss: () =>
          Promise.resolve({
            data: {
              action: 'remove',
            },
          }),
      }) as any
    );

    spenderFileService.deleteFilesBulk.and.returnValue(of({}));
    spyOn(component, 'goToPrevSlide');
    spyOn(component, 'goToNextSlide');
    
    await component.deleteAttachment();
    tick(1000);

    expect(component.goToPrevSlide).toHaveBeenCalledTimes(1);
    expect(component.attachments).toEqual([
      jasmine.objectContaining({ id: '1', type: 'pdf', url: 'http://example.com/attachment1.pdf' }),
      jasmine.objectContaining({ id: '3', type: 'pdf', url: 'http://example.com/attachment3.pdf' }),
    ]);
    expect(spenderFileService.deleteFilesBulk).toHaveBeenCalledOnceWith(['2']);
    expect(trackingService.deleteFileClicked).toHaveBeenCalledOnceWith({ 'File ID': '2' });
    expect(trackingService.fileDeleted).toHaveBeenCalledOnceWith({ 'File ID': '2' });
  }));

  it('deleteAttachment(): should be able to show delete first attachment popover and perform deletion', fakeAsync(async () => {
    component.imageSlides = {
      swiperRef: {
        activeIndex: Promise.resolve(0),
        slideNext: jasmine.createSpy('slideNext'),
        slidePrev: jasmine.createSpy('slidePrev'),
      },
    } as any;

    popoverController.create.and.returnValue(
      Promise.resolve({
        present: () => Promise.resolve(),
        onWillDismiss: () =>
          Promise.resolve({
            data: {
              action: 'remove',
            },
          }),
      }) as any
    );

    spenderFileService.deleteFilesBulk.and.returnValue(of({}));
    spyOn(component, 'goToPrevSlide');
    spyOn(component, 'goToNextSlide');
    
    await component.deleteAttachment();
    tick(1000);

    expect(component.goToNextSlide).toHaveBeenCalledTimes(1);
    expect(component.attachments).toEqual([
      jasmine.objectContaining({ id: '2', type: 'image', url: 'data:image/jpeg;base64,mocked' }),
      jasmine.objectContaining({ id: '3', type: 'pdf', url: 'http://example.com/attachment3.pdf' }),
    ]);
    expect(spenderFileService.deleteFilesBulk).toHaveBeenCalledOnceWith(['1']);
    expect(trackingService.deleteFileClicked).toHaveBeenCalledOnceWith({ 'File ID': '1' });
    expect(trackingService.fileDeleted).toHaveBeenCalledOnceWith({ 'File ID': '1' });
  }));

  it('deleteAttachment(): should be able to show delete first attachment popover and perform deletion and dismiss the modal', fakeAsync(async () => {
    component.imageSlides = {
      swiperRef: {
        activeIndex: Promise.resolve(0),
        slideNext: jasmine.createSpy('slideNext'),
        slidePrev: jasmine.createSpy('slidePrev'),
      },
    } as any;

    component.attachments = [
      {
        id: '1',
        type: 'pdf',
        url: 'http://example.com/attachment1.pdf',
      },
    ];

    popoverController.create.and.returnValue(
      Promise.resolve({
        present: () => Promise.resolve(),
        onWillDismiss: () =>
          Promise.resolve({
            data: {
              action: 'remove',
            },
          }),
      }) as any
    );

    spenderFileService.deleteFilesBulk.and.returnValue(of({}));
    spyOn(component, 'goToPrevSlide');
    spyOn(component, 'goToNextSlide');
    
    await component.deleteAttachment();
    tick(1000);

    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ attachments: component.attachments });
    expect(component.attachments.length).toBe(0);
    expect(spenderFileService.deleteFilesBulk).toHaveBeenCalledOnceWith(['1']);
    expect(trackingService.deleteFileClicked).toHaveBeenCalledOnceWith({ 'File ID': '1' });
    expect(trackingService.fileDeleted).toHaveBeenCalledOnceWith({ 'File ID': '1' });
  }));

  it('deleteAttachment(): should not make api calls for attachments which have not been persisted yet', fakeAsync(async () => {
    component.attachments = [
      {
        id: '1',
        type: 'pdf',
        url: 'http://example.com/attachment1.pdf',
      },
      {
        id: null,
        type: 'jpeg',
        url: 'http://example.com/attachment2.jpeg',
      },
      {
        id: '3',
        type: 'pdf',
        url: 'http://example.com/attachment3.pdf',
      },
    ];

    component.imageSlides = {
      swiperRef: {
        activeIndex: Promise.resolve(1),
        slideNext: jasmine.createSpy('slideNext'),
        slidePrev: jasmine.createSpy('slidePrev'),
      },
    } as any;

    popoverController.create.and.returnValue(
      Promise.resolve({
        present: () => Promise.resolve(),
        onWillDismiss: () =>
          Promise.resolve({
            data: {
              action: 'remove',
            },
          }),
      }) as any
    );

    spenderFileService.deleteFilesBulk.and.returnValue(of({}));
    spyOn(component, 'goToPrevSlide');
    spyOn(component, 'goToNextSlide');

    await component.deleteAttachment();
    tick(1000);

    expect(component.goToPrevSlide).toHaveBeenCalledTimes(1);
    expect(component.attachments).toEqual([
      {
        id: '1',
        type: 'pdf',
        url: 'http://example.com/attachment1.pdf',
      },
      {
        id: '3',
        type: 'pdf',
        url: 'http://example.com/attachment3.pdf',
      },
    ]);
    expect(spenderFileService.deleteFilesBulk).not.toHaveBeenCalled();
    expect(trackingService.deleteFileClicked).toHaveBeenCalledOnceWith({ 'File ID': null });
    expect(trackingService.fileDeleted).toHaveBeenCalledOnceWith({ 'File ID': null });
  }));

  it('deleteAttachment(): should use approverFileService when isTeamAdvance is true', fakeAsync(async () => {
    // Mock the isTeamAdvance signal input to return true
    Object.defineProperty(component, 'isTeamAdvance', {
      value: () => true,
      writable: true,
    });
    component.imageSlides = {
      swiperRef: {
        activeIndex: Promise.resolve(0),
        slideNext: jasmine.createSpy('slideNext'),
        slidePrev: jasmine.createSpy('slidePrev'),
      },
    } as any;

    popoverController.create.and.returnValue(
      Promise.resolve({
        present: () => Promise.resolve(),
        onWillDismiss: () =>
          Promise.resolve({
            data: {
              action: 'remove',
            },
          }),
      }) as any
    );

    approverFileService.deleteFilesBulk.and.returnValue(of(void 0));
    
    await component.deleteAttachment();
    tick(1000);

    expect(approverFileService.deleteFilesBulk).toHaveBeenCalledOnceWith(['1']);
  }));

  describe('rotation and save logic', () => {
    beforeEach(() => {
      component.attachments = [{ url: 'test', id: '1', type: 'image' }];
      component.activeIndex = 0;
      component.rotatingDirection = null;
      component.loading = false;
    });

    it('should return early if loading or rotatingDirection is set', async () => {
      component.loading = true;
      await component.rotateAttachment(1 as any);
      expect(component.rotatingDirection).toBeNull();

      component.loading = false;
      component.rotatingDirection = RotationDirection.RIGHT;
      await component.rotateAttachment(RotationDirection.RIGHT);
      expect(component.rotatingDirection).toBe(RotationDirection.RIGHT);
      component.rotatingDirection = null;
    });

    it('should return early if currentAttachment is falsy', async () => {
      component.attachments = [];
      component.activeIndex = 0;
      await component.rotateAttachment(RotationDirection.RIGHT);
      expect(component.rotatingDirection).toBeNull();
    });

    it('should call rotateImage after timeout', fakeAsync(() => {
      spyOn(component as any, 'rotateImage');
      component.attachments = [{ url: 'test', id: '1', type: 'image' }];
      component.activeIndex = 0;
      component.loading = false;
      component.rotatingDirection = null;
      component.rotateAttachment(RotationDirection.RIGHT);
      tick(401);
      expect((component as any).rotateImage).toHaveBeenCalled();
    }));

    it('should handle error if blob is empty or not a Blob', (done) => {
      (window.fetch as jasmine.Spy).and.callFake(() => Promise.resolve({ blob: () => Promise.resolve(null) } as any));
      component.saveRotatedImage();
      setTimeout(() => {
        expect(component.saving).toBeFalse();
        expect(component.isImageDirty[0]).toBeTrue();
        done();
      }, 10);
    });

    it('should upload and update attachment if blob is valid', fakeAsync(() => {
      const fakeBlob = new Blob(['test'], { type: 'image/jpeg' });
      (window.fetch as jasmine.Spy).and.callFake(() =>
        Promise.resolve({ blob: () => Promise.resolve(fakeBlob) } as any)
      );
      fileService.uploadUrl.and.returnValue(of('upload-url'));
      transactionsOutboxService.uploadData.and.returnValue(of(null));
      component.saveRotatedImage();
      tick();
      expect(fileService.uploadUrl).toHaveBeenCalled();
      expect(transactionsOutboxService.uploadData).toHaveBeenCalled();
      expect(component.attachments[0].url).toBe('test');
      expect(component.saving).toBeFalse();
      expect(component.saveComplete[0]).toBeTrue();
      tick(5001);
      expect(component.saveComplete[0]).toBeFalse();
    }));

    it('should use uploadUrlForTeamAdvance when isTeamAdvance is true', fakeAsync(() => {
      // Mock the isTeamAdvance signal input to return true
      Object.defineProperty(component, 'isTeamAdvance', {
        value: () => true,
        writable: true,
      });
      const fakeBlob = new Blob(['test'], { type: 'image/jpeg' });
      (window.fetch as jasmine.Spy).and.callFake(() =>
        Promise.resolve({ blob: () => Promise.resolve(fakeBlob) } as any)
      );
      fileService.uploadUrlForTeamAdvance.and.returnValue(of('upload-url-team-advance'));
      transactionsOutboxService.uploadData.and.returnValue(of(null));
      component.saveRotatedImage();
      tick();
      expect(fileService.uploadUrlForTeamAdvance).toHaveBeenCalled();
      expect(fileService.uploadUrl).not.toHaveBeenCalled();
    }));

    it('should handle error in observable chain', (done) => {
      const fakeBlob = new Blob(['test'], { type: 'image/jpeg' });
      (window.fetch as jasmine.Spy).and.callFake(() =>
        Promise.resolve({ blob: () => Promise.resolve(fakeBlob) } as any)
      );
      fileService.uploadUrl.and.returnValue(of('upload-url'));
      transactionsOutboxService.uploadData.and.returnValue(throwError(() => new Error('upload failed')));
      const orig = component.attachments[0];
      Object.defineProperty(component.attachments, '0', { writable: false });
      component.saveRotatedImage();
      setTimeout(() => {
        expect(component.saving).toBeFalse();
        expect(component.isImageDirty[0]).toBeTrue();
        Object.defineProperty(component.attachments, '0', { writable: true, value: orig });
        done();
      }, 10);
    });

    it('should return early if canvas context is null', (done) => {
      const mockImage = {
        set onload(fn: () => void) {
          setTimeout(fn, 0);
        },
        set src(val: string) {},
        get src(): string {
          return '';
        },
      };
      spyOn(window as any, 'Image').and.returnValue(mockImage);
      spyOn(document, 'createElement').and.returnValue({ getContext: () => null } as any);
      component.attachments = [{ url: 'test', id: '1', type: 'image' }];
      component.activeIndex = 0;
      component.rotatingDirection = 1 as any;
      (component as any).rotateImage(component.attachments[0], 1 as any);
      setTimeout(() => {
        expect(component.rotatingDirection).toBeNull();
        done();
      }, 10);
    });

    it('should update attachment and flags on successful rotation', (done) => {
      const mockImage = {
        set onload(fn: () => void) {
          setTimeout(fn, 0);
        },
        set src(val: string) {},
        get src(): string {
          return '';
        },
      };
      spyOn(window as any, 'Image').and.returnValue(mockImage);
      const mockCtx = {
        translate: jasmine.createSpy(),
        rotate: jasmine.createSpy(),
        drawImage: jasmine.createSpy(),
      };
      const mockCanvas = {
        getContext: () => mockCtx,
        toDataURL: () => 'data:image/jpeg;base64,rotated',
        width: 0,
        height: 0,
      };
      spyOn(document, 'createElement').and.returnValue(mockCanvas as any);
      component.attachments = [{ url: 'test', id: '1', type: 'image' }];
      component.activeIndex = 0;
      component.rotatingDirection = 1 as any;
      (component as any).rotateImage(component.attachments[0], 1 as any);
      setTimeout(() => {
        expect(component.attachments[0].url).toBe('data:image/jpeg;base64,rotated');
        expect(component.rotatingDirection).toBeNull();
        expect(component.isImageDirty[0]).toBeTrue();
        done();
      }, 10);
    });

    it('should handle image onerror', () => {
      const mockImage: any = {};
      Object.defineProperty(mockImage, 'onerror', {
        set(fn: () => void): void {
          fn();
        },
      });
      spyOn(window as any, 'Image').and.returnValue(mockImage);
      component.attachments = [{ url: 'test', id: '1', type: 'image' }];
      component.activeIndex = 0;
      component.rotatingDirection = 1 as any;
      (component as any).rotateImage(component.attachments[0], 1 as any);
      expect(component.rotatingDirection).toBeNull();
    });
  });

  it('ngOnInit(): should convert image attachments to base64', fakeAsync(() => {
    const base64Url = 'data:image/jpeg;base64,abc123';
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    (window.fetch as jasmine.Spy).and.callFake(() => Promise.resolve({ blob: () => Promise.resolve(mockBlob) } as any));
    fileService.readFile.and.resolveTo(base64Url);
    component.attachments = [{ id: '2', type: 'image', url: 'http://example.com/attachment2.jpg' }];
    component.ngOnInit();
    tick();
    expect(component.attachments[0].url).toBe(base64Url);
    expect(component.attachments[0].thumbnail).toBe(base64Url);
  }));

  it('addAttachments(): should dismiss modal with addMoreAttachments action', () => {
    const event = new Event('click');
    component.addAttachments(event);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ action: 'addMoreAttachments', event });
  });

  it('saveRotatedImage(): should handle error in uploadData', fakeAsync(() => {
    const fakeBlob = new Blob(['test'], { type: 'image/jpeg' });
    (window.fetch as jasmine.Spy).and.callFake(() => Promise.resolve({ blob: () => Promise.resolve(fakeBlob) } as any));
    fileService.uploadUrl.and.returnValue(of('upload-url'));
    transactionsOutboxService.uploadData.and.returnValue(throwError(() => new Error('upload failed')));
    component.saveRotatedImage();
    tick();
    expect(component.saving).toBeFalse();
    expect(component.isImageDirty[0]).toBeTrue();
  }));

  it('goToNextSlide(): should call swiperRef.slideNext', () => {
    const mockSwiperRef = jasmine.createSpyObj('swiperRef', ['slideNext']);
    component.imageSlides = { swiperRef: mockSwiperRef } as any;
    component.goToNextSlide();
    expect(mockSwiperRef.slideNext).toHaveBeenCalled();
  });

  it('goToPrevSlide(): should call swiperRef.slidePrev', () => {
    const mockSwiperRef = jasmine.createSpyObj('swiperRef', ['slidePrev']);
    component.imageSlides = { swiperRef: mockSwiperRef } as any;
    component.goToPrevSlide();
    expect(mockSwiperRef.slidePrev).toHaveBeenCalled();
  });

  it('getActiveIndex(): should set activeIndex from swiperRef', () => {
    component.imageSlides = { swiperRef: { activeIndex: 42 } } as any;
    component.getActiveIndex();
    expect(component.activeIndex).toBe(42);
  });

  it('rotateImage(): should rotate image LEFT', (done) => {
    const mockImage = {
      set onload(fn: () => void) {
        setTimeout(fn, 0);
      },
      set src(val: string) {},
      get src(): string {
        return '';
      },
    };
    spyOn(window as any, 'Image').and.returnValue(mockImage);
    const mockCtx = {
      translate: jasmine.createSpy(),
      rotate: jasmine.createSpy(),
      drawImage: jasmine.createSpy(),
    };
    const mockCanvas = {
      getContext: () => mockCtx,
      toDataURL: () => 'data:image/jpeg;base64,left',
      width: 0,
      height: 0,
    };
    spyOn(document, 'createElement').and.returnValue(mockCanvas as any);
    component.attachments = [{ url: 'test', id: '1', type: 'image' }];
    component.activeIndex = 0;
    component.rotatingDirection = RotationDirection.RIGHT;
    (component as any).rotateImage(component.attachments[0], RotationDirection.LEFT);
    setTimeout(() => {
      expect(component.attachments[0].url).toBe('data:image/jpeg;base64,left');
      done();
    }, 10);
  });

  it('rotateImage(): should rotate image RIGHT', (done) => {
    const mockImage = {
      set onload(fn: () => void) {
        setTimeout(fn, 0);
      },
      set src(val: string) {},
      get src(): string {
        return '';
      },
    };
    spyOn(window as any, 'Image').and.returnValue(mockImage);
    const mockCtx = {
      translate: jasmine.createSpy(),
      rotate: jasmine.createSpy(),
      drawImage: jasmine.createSpy(),
    };
    const mockCanvas = {
      getContext: () => mockCtx,
      toDataURL: () => 'data:image/jpeg;base64,right',
      width: 0,
      height: 0,
    };
    spyOn(document, 'createElement').and.returnValue(mockCanvas as any);
    component.attachments = [{ url: 'test', id: '1', type: 'image' }];
    component.activeIndex = 0;
    component.rotatingDirection = RotationDirection.LEFT;
    (component as any).rotateImage(component.attachments[0], RotationDirection.RIGHT);
    setTimeout(() => {
      expect(component.attachments[0].url).toBe('data:image/jpeg;base64,right');
      done();
    }, 10);
  });

  it('should track events when rotating and saving images', (done) => {
    const mockImage = {
      set onload(fn: () => void) {
        setTimeout(fn, 0);
      },
      set src(val: string) {},
      get src(): string {
        return '';
      },
    };
    spyOn(window as any, 'Image').and.returnValue(mockImage);
    const mockCtx = {
      translate: jasmine.createSpy(),
      rotate: jasmine.createSpy(),
      drawImage: jasmine.createSpy(),
    };
    const mockCanvas = {
      getContext: (): any => mockCtx,
      toDataURL: (): string => 'data:image/jpeg;base64,rotated',
      width: 0,
      height: 0,
    };
    spyOn(document, 'createElement').and.returnValue(mockCanvas as any);
    component.attachments = [{ url: 'test', id: '1', type: 'image' }];
    component.activeIndex = 0;
    component.rotatingDirection = RotationDirection.LEFT;
    (component as any).rotateImage(component.attachments[0], RotationDirection.LEFT);
    setTimeout(() => {
      expect(trackingService.eventTrack).toHaveBeenCalledWith('Rotated receipt', {
        ExpenseId: '1',
        Direction: RotationDirection.LEFT,
        Source: '/test-url',
      });
      done();
    }, 10);
  });

  it('should track events when saving rotated images', fakeAsync(() => {
    const fakeBlob = new Blob(['test'], { type: 'image/jpeg' });
    (window.fetch as jasmine.Spy).and.callFake(() =>
      Promise.resolve({ blob: () => Promise.resolve(fakeBlob) } as any)
    );
    fileService.uploadUrl.and.returnValue(of('upload-url'));
    transactionsOutboxService.uploadData.and.returnValue(of(null));
    component.rotatingDirection = RotationDirection.RIGHT;
    component.saveRotatedImage();
    tick();
    expect(trackingService.eventTrack).toHaveBeenCalledWith('Saved rotated receipt', {
      ReceiptId: '1',
      Direction: RotationDirection.RIGHT,
      Source: '/test-url',
    });
  }));
});
