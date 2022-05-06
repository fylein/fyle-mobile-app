import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReceiptPreviewThumbnailComponent } from './receipt-preview-thumbnail.component';

xdescribe('FyReceiptPreviewThumbnailComponent', () => {
  let component: ReceiptPreviewThumbnailComponent;
  let fixture: ComponentFixture<ReceiptPreviewThumbnailComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ReceiptPreviewThumbnailComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(ReceiptPreviewThumbnailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
