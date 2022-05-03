import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyDuplicateDetectionComponent } from './fy-duplicate-detection.component';

xdescribe('FyDuplicateDetectionComponent', () => {
  let component: FyDuplicateDetectionComponent;
  let fixture: ComponentFixture<FyDuplicateDetectionComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FyDuplicateDetectionComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(FyDuplicateDetectionComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
