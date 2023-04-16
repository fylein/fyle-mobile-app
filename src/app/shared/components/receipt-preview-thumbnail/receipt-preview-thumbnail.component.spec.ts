import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ReceiptPreviewThumbnailComponent } from './receipt-preview-thumbnail.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { fileObjectData1 } from 'src/app/core/mock-data/file-object.data';
fdescribe('ReceiptPreviewThumbnailComponent', () => {
  let component: ReceiptPreviewThumbnailComponent;
  let fixture: ComponentFixture<ReceiptPreviewThumbnailComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ReceiptPreviewThumbnailComponent],
      imports: [IonicModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(ReceiptPreviewThumbnailComponent);
    component = fixture.componentInstance;
    component.attachments = fileObjectData1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('goToNextSlide', () => {
    const imageSlidesSpy = {
      swiperRef: jasmine.createSpyObj('swiperRef', ['slideNext']),
    };
    component.imageSlides = imageSlidesSpy as any;
    component.goToNextSlide();
    expect(imageSlidesSpy.swiperRef.slideNext).toHaveBeenCalledOnceWith(100);
  });

  it('goToPrevSlide', () => {});
  it('addAttachments', () => {});
  it('previewAttachments', () => {});
  it('getActiveIndex', () => {});
  it('onLoad', () => {});
});
