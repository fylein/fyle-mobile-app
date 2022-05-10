import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyDuplicateDetectionModalComponent } from './fy-duplicate-detection-modal.component';

xdescribe('FyDuplicateDetectionModalComponent', () => {
  let component: FyDuplicateDetectionModalComponent;
  let fixture: ComponentFixture<FyDuplicateDetectionModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FyDuplicateDetectionModalComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(FyDuplicateDetectionModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
