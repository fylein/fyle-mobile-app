import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CameraOverlayPage } from './camera-overlay.page';

describe('CameraOverlayPage', () => {
  let component: CameraOverlayPage;
  let fixture: ComponentFixture<CameraOverlayPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CameraOverlayPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CameraOverlayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
