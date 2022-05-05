import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyPolicyViolationInfoComponent } from './fy-policy-violation-info.component';

xdescribe('FyPolicyViolationInfoComponent', () => {
  let component: FyPolicyViolationInfoComponent;
  let fixture: ComponentFixture<FyPolicyViolationInfoComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FyPolicyViolationInfoComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(FyPolicyViolationInfoComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
