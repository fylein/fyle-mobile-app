import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CustomGalleryPickerComponent } from './custom-gallery-picker.component';
import { ModalController, Platform } from '@ionic/angular';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { TranslocoService } from '@jsverse/transloco';
import { TrackingService } from 'src/app/core/services/tracking.service';

describe('CustomGalleryPickerComponent', () => {
  let component: CustomGalleryPickerComponent;
  let fixture: ComponentFixture<CustomGalleryPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomGalleryPickerComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: {} },
        { provide: Platform, useValue: {} },
        { provide: ImagePicker, useValue: {} },
        { provide: TranslocoService, useValue: {} },
        { provide: TrackingService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomGalleryPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have max images limit of 10', () => {
    expect(component.maxImages).toBe(10);
  });

  it('should start with empty selected images', () => {
    expect(component.selectedImages.length).toBe(0);
  });
}); 