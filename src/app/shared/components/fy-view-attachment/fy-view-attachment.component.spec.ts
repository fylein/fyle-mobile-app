import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyViewAttachmentComponent } from './fy-view-attachment.component';

xdescribe('FyViewAttachmentComponent', () => {
  let component: FyViewAttachmentComponent;
  let fixture: ComponentFixture<FyViewAttachmentComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FyViewAttachmentComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(FyViewAttachmentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
