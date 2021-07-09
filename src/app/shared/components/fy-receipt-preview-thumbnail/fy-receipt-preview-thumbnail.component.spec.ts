import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyReceiptPreviewThumbnailComponent } from './fy-receipt-preview-thumbnail.component';

describe('FyReceiptPreviewThumbnailComponent', () => {
  let component: FyReceiptPreviewThumbnailComponent;
  let fixture: ComponentFixture<FyReceiptPreviewThumbnailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FyReceiptPreviewThumbnailComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyReceiptPreviewThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
