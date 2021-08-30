import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyPreviewAttachmentsComponent } from './fy-preview-attachments.component';

describe('FyPreviewAttachmentsComponent', () => {
  let component: FyPreviewAttachmentsComponent;
  let fixture: ComponentFixture<FyPreviewAttachmentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FyPreviewAttachmentsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyPreviewAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
