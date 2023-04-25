import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { CropReceiptComponent } from './crop-receipt.component';
import { ModalController, Platform } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { Subscription } from 'rxjs';
import { HammerModule } from '@angular/platform-browser';
import { Component, Input } from '@angular/core';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';

describe('CropReceiptComponent', () => {
  let component: CropReceiptComponent;
  let fixture: ComponentFixture<CropReceiptComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let platform: Platform;

  @Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'image-cropper',
    template: '',
    providers: [{ provide: ImageCropperComponent, useClass: ImageCropperStubComponent }],
  })
  class ImageCropperStubComponent {
    @Input() imageBase64;

    @Input() maintainAspectRatio;

    crop() {
      return {
        base64: 'base64content',
      };
    }
  }

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

    TestBed.configureTestingModule({
      declarations: [CropReceiptComponent, ImageCropperStubComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, HammerModule],
      providers: [
        Platform,
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CropReceiptComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    platform = TestBed.inject(Platform);

    component.base64ImageWithSource = {
      source: '2023-02-23/orNVthTo2Zyo/receipts/fi1w2IE6JeqS.000.jpeg',
      base64Image: 'base64encodedcontent1',
    };
    component.backButtonAction = new Subscription();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cropReceipt', () => {
    modalController.dismiss.and.callThrough();
    spyOn(component.imageCropper, 'crop').and.callThrough();

    component.cropReceipt();
    expect(component.imageCropper.crop).toHaveBeenCalledTimes(1);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      base64ImageWithSource: component.base64ImageWithSource,
    });
  });

  it('closeModal(): should close modal', () => {
    modalController.dismiss.and.returnValue(null);

    component.closeModal();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('imageLoaded(): should hide loader if image loaded', () => {
    loaderService.hideLoader.and.returnValue(null);

    component.imageLoaded();
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
  });

  it('ionViewWillEnter(): should close modal when view enters', () => {
    spyOn(platform.backButton, 'subscribeWithPriority').and.callThrough();

    component.ionViewWillEnter();
    expect(platform.backButton.subscribeWithPriority).toHaveBeenCalled();
  });

  it('ionViewWillLeave(): should unsubscribe to the back button action', () => {
    component.backButtonAction = new Subscription();
    spyOn(component.backButtonAction, 'unsubscribe');
    fixture.detectChanges();

    component.ionViewWillLeave();
    expect(component.backButtonAction.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should close the modal on clicking cancel CTA', () => {
    spyOn(component, 'closeModal');

    const cancelCTA = getElementBySelector(fixture, '.btn-secondary') as HTMLElement;
    click(cancelCTA);
    expect(component.closeModal).toHaveBeenCalledTimes(1);
  });

  it('should crop the receipt on clicking crop CTA', () => {
    spyOn(component, 'cropReceipt');

    const cancelCTA = getElementBySelector(fixture, '.btn-primary') as HTMLElement;
    click(cancelCTA);
    expect(component.cropReceipt).toHaveBeenCalledTimes(1);
  });
});
