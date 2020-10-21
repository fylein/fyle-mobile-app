import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PolicyViolationInfoBlockComponent } from './policy-violation-info-block.component';

describe('PolicyViolationInfoBlockComponent', () => {
  let component: PolicyViolationInfoBlockComponent;
  let fixture: ComponentFixture<PolicyViolationInfoBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolicyViolationInfoBlockComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyViolationInfoBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
