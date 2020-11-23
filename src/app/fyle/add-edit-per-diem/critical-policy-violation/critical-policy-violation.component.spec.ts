import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CriticalPolicyViolationComponent } from './critical-policy-violation.component';

describe('CriticalPolicyViolationComponent', () => {
  let component: CriticalPolicyViolationComponent;
  let fixture: ComponentFixture<CriticalPolicyViolationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CriticalPolicyViolationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CriticalPolicyViolationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
