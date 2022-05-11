import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PolicyViolationDialogComponent } from './policy-violation-dialog.component';

xdescribe('PolicyViolationDialogComponent', () => {
  let component: PolicyViolationDialogComponent;
  let fixture: ComponentFixture<PolicyViolationDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PolicyViolationDialogComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(PolicyViolationDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
