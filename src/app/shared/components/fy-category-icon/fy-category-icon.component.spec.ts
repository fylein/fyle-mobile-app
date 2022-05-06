import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyCategoryIconComponent } from './fy-category-icon.component';

xdescribe('FyCategoryIconComponent', () => {
  let component: FyCategoryIconComponent;
  let fixture: ComponentFixture<FyCategoryIconComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FyCategoryIconComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(FyCategoryIconComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
