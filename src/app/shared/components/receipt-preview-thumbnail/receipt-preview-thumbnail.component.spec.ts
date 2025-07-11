import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { ReceiptPreviewThumbnailComponent } from './receipt-preview-thumbnail.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { fileObjectData1 } from 'src/app/core/mock-data/file-object.data';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { of } from 'rxjs';
describe('ReceiptPreviewThumbnailComponent', () => {
  let trackingService: jasmine.SpyObj<TrackingService>;
  let component: ReceiptPreviewThumbnailComponent;
  let fixture: ComponentFixture<ReceiptPreviewThumbnailComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['addMoreFilesClicked', 'fileDownloadComplete']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [ReceiptPreviewThumbnailComponent],
      providers: [
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
      imports: [IonicModule.forRoot(), TranslocoModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptPreviewThumbnailComponent);
    component = fixture.componentInstance;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'receiptPreviewThumbnail.mapLabel': 'Map',
        'receiptPreviewThumbnail.receiptLabel': 'Receipt',
        'receiptPreviewThumbnail.addMore': 'Add more',
        'receiptPreviewThumbnail.uploading': 'Uploading',
        'receiptPreviewThumbnail.loading': 'Loading',
        'receiptPreviewThumbnail.mapSuffix': ' map',
        'receiptPreviewThumbnail.receiptSuffix': ' receipt',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });

    component.attachments = fileObjectData1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should initialise slider option and previous count', () => {
    const expectedSliderOptions = {
      slidesPerView: 1,
      spaceBetween: 80,
    };
    spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(component.sliderOptions).toEqual(expectedSliderOptions);
    expect(component.previousCount).toBe(1);
  });

  it('goToNextSlide(): should move the next slide after 100ms', () => {
    const imageSlidesSpy = {
      swiperRef: jasmine.createSpyObj('swiperRef', ['slideNext']),
    };
    component.imageSlides = imageSlidesSpy as any;
    component.goToNextSlide();
    expect(imageSlidesSpy.swiperRef.slideNext).toHaveBeenCalledOnceWith(100);
  });

  it('goToPrevSlide(): should move to previous slide after 100ms', () => {
    const imageSlidesSpy = {
      swiperRef: jasmine.createSpyObj('swiperRef', ['slidePrev']),
    };
    component.imageSlides = imageSlidesSpy as any;
    component.goToPrevSlide();
    expect(imageSlidesSpy.swiperRef.slidePrev).toHaveBeenCalledOnceWith(100);
  });

  it('addAttachments(): should add more attachments', () => {
    spyOn(component.addMoreAttachments, 'emit');
    const event = null;
    component.mode = 'add';
    component.addAttachments(event);
    expect(component.addMoreAttachments.emit).toHaveBeenCalledOnceWith(event);
    expect(trackingService.addMoreFilesClicked).toHaveBeenCalledOnceWith({ mode: 'add' });
  });

  it('previewAttachments(): should let user view the attachments', () => {
    spyOn(component.viewAttachments, 'emit');
    component.previewAttachments();
    expect(component.viewAttachments.emit).toHaveBeenCalledTimes(1);
  });

  it('getActiveIndex(): should set active index based on swiperRef.activeIndex', () => {
    component.imageSlides = {
      swiperRef: {
        activeIndex: 2,
      },
    } as any;
    component.getActiveIndex();
    fixture.detectChanges();
    expect(component.activeIndex).toEqual(2);
  });

  it('ngDoCheck(): should not update the previousCount if attachments length is equal to previousCount', fakeAsync(() => {
    const imageSlidesSpy = {
      swiperRef: jasmine.createSpyObj('swiperRef', ['slideTo']),
    };
    component.imageSlides = imageSlidesSpy as any;
    component.imageSlides.swiperRef.activeIndex = 2;
    spyOn(component, 'getActiveIndex');
    component.previousCount = 1;
    component.ngDoCheck();
    fixture.detectChanges();
    tick(100);
    expect(component.imageSlides.swiperRef.slideTo).not.toHaveBeenCalledOnceWith(component.attachments.length);
    expect(component.getActiveIndex).not.toHaveBeenCalled();
  }));

  it('ngDoCheck(): should update the previousCount if attachments length is not equal', fakeAsync(() => {
    const imageSlidesSpy = {
      swiperRef: jasmine.createSpyObj('swiperRef', ['slideTo']),
    };
    component.imageSlides = imageSlidesSpy as any;
    component.imageSlides.swiperRef.activeIndex = 2;
    spyOn(component, 'getActiveIndex');
    component.previousCount = 2;
    component.ngDoCheck();
    fixture.detectChanges();
    expect(component.previousCount).toBe(component.attachments.length);
    tick(100);
    expect(component.imageSlides.swiperRef.slideTo).toHaveBeenCalledOnceWith(component.attachments.length);
    expect(component.getActiveIndex).toHaveBeenCalledTimes(1);
  }));

  it('onLoad', () => {
    const previousNumLoadedImage = component.numLoadedImage;
    component.onLoad();
    expect(component.numLoadedImage).toBe(previousNumLoadedImage + 1);
    expect(trackingService.fileDownloadComplete).toHaveBeenCalledOnceWith({ 'File ID': fileObjectData1[0].id });
  });
});
