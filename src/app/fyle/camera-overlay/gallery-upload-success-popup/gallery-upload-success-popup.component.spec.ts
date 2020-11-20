import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GalleryUploadSuccessPopupComponent } from './gallery-upload-success-popup.component';

describe('GalleryUploadSuccessPopupComponent', () => {
  let component: GalleryUploadSuccessPopupComponent;
  let fixture: ComponentFixture<GalleryUploadSuccessPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleryUploadSuccessPopupComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryUploadSuccessPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
