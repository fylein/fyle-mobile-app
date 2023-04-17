import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, PopoverController } from '@ionic/angular';

import { FyViewAttachmentComponent } from './fy-view-attachment.component';
import { DomSanitizer } from '@angular/platform-browser';
import { FileService } from 'src/app/core/services/file.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

fdescribe('FyViewAttachmentComponent', () => {
  let component: FyViewAttachmentComponent;
  let fixture: ComponentFixture<FyViewAttachmentComponent>;
  let domSantizer: jasmine.SpyObj<DomSanitizer>;
  let modalController: jasmine.SpyObj<ModalController>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let fileService: jasmine.SpyObj<FileService>;
  let loaderService: jasmine.SpyObj<LoaderService>;

  beforeEach(waitForAsync(() => {
    const domSantizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustUrl']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['delete']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['hideLoader', 'showLoader']);

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
          provide: FileService,
          useValue: fileServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
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
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;

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
});
