import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';
import { SpenderFileService } from 'src/app/core/services/platform/v1/spender/file.service';
import { FyViewAttachmentComponent } from './fy-view-attachment.component';
import { DomSanitizer } from '@angular/platform-browser';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { FileService } from 'src/app/core/services/file.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { ActivatedRoute } from '@angular/router';

describe('FyViewAttachmentComponent', () => {
  let component: FyViewAttachmentComponent;
  let fixture: ComponentFixture<FyViewAttachmentComponent>;
  let domSantizer: jasmine.SpyObj<DomSanitizer>;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let spenderFileService: jasmine.SpyObj<SpenderFileService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let fileService: jasmine.SpyObj<FileService>;
  let transactionsOutboxService: jasmine.SpyObj<TransactionsOutboxService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(waitForAsync(() => {
    const domSantizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustUrl']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);
    const trackingServiceSpy = jasmine.createSpyObj('TracingService', ['deleteFileClicked', 'fileDeleted']);
    const spenderFileServiceSpy = jasmine.createSpyObj('SpenderFileService', ['deleteFilesBulk']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['attachReceiptToExpense']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['readFile', 'uploadUrl']);
    const transactionsOutboxServiceSpy = jasmine.createSpyObj('TransactionsOutboxService', ['uploadData']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        params: {},
        queryParams: {},
      },
    });

    TestBed.configureTestingModule({
      declarations: [FyViewAttachmentComponent],
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
      ],
      imports: [IonicModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyViewAttachmentComponent);
    component = fixture.componentInstance;
    domSantizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    spenderFileService = TestBed.inject(SpenderFileService) as jasmine.SpyObj<SpenderFileService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    transactionsOutboxService = TestBed.inject(TransactionsOutboxService) as jasmine.SpyObj<TransactionsOutboxService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;

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
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should update ', () => {
    const expectedSliderOptions = {
      zoom: {
        maxRatio: 1,
      },
    };
    spyOn(component, 'ngOnInit');
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.zoomScale).toBe(1);
    expect(component.sliderOptions).toEqual(expectedSliderOptions);
    expect(domSantizer.bypassSecurityTrustUrl).toHaveBeenCalledTimes(2);
    expect(domSantizer.bypassSecurityTrustUrl).toHaveBeenCalledWith(component.attachments[0].url);
    expect(domSantizer.bypassSecurityTrustUrl).toHaveBeenCalledWith(component.attachments[2].url);
  });

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

  it('deleteAttachment(): should be able to show delete attachment popover and perform deletion', fakeAsync(() => {
    component.imageSlides = {
      swiperRef: {
        activeIndex: 1,
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
    component.deleteAttachment();
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
    expect(spenderFileService.deleteFilesBulk).toHaveBeenCalledOnceWith(['2']);
    expect(trackingService.deleteFileClicked).toHaveBeenCalledOnceWith({ 'File ID': '2' });
    expect(trackingService.fileDeleted).toHaveBeenCalledOnceWith({ 'File ID': '2' });
  }));

  it('deleteAttachment(): should be able to show delete first attachment popover and perform deletion', fakeAsync(() => {
    component.imageSlides = {
      swiperRef: {
        activeIndex: 0,
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
    component.deleteAttachment();
    tick(1000);

    expect(component.goToNextSlide).toHaveBeenCalledTimes(1);
    expect(component.attachments).toEqual([
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
    ]);
    expect(spenderFileService.deleteFilesBulk).toHaveBeenCalledOnceWith(['1']);
    expect(trackingService.deleteFileClicked).toHaveBeenCalledOnceWith({ 'File ID': '1' });
    expect(trackingService.fileDeleted).toHaveBeenCalledOnceWith({ 'File ID': '1' });
  }));

  it('deleteAttachment(): should be able to show delete first attachment popover and perform deletion and dismiss the modal', fakeAsync(() => {
    component.imageSlides = {
      swiperRef: {
        activeIndex: 0,
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
    component.deleteAttachment();
    tick(1000);

    expect(modalController.dismiss).toHaveBeenCalledOnceWith({ attachments: component.attachments });
    expect(component.attachments.length).toBe(0);
    expect(spenderFileService.deleteFilesBulk).toHaveBeenCalledOnceWith(['1']);
    expect(trackingService.deleteFileClicked).toHaveBeenCalledOnceWith({ 'File ID': '1' });
    expect(trackingService.fileDeleted).toHaveBeenCalledOnceWith({ 'File ID': '1' });
  }));

  it('deleteAttachment(): should not make api calls for attachments which have not been persisted yet', fakeAsync(() => {
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
        activeIndex: 1,
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

    component.deleteAttachment();
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
    expect(spenderFileService.deleteFilesBulk).not.toHaveBeenCalledOnceWith(['2']);
    expect(trackingService.deleteFileClicked).toHaveBeenCalledOnceWith({ 'File ID': null });
    expect(trackingService.fileDeleted).toHaveBeenCalledOnceWith({ 'File ID': null });
  }));
});
