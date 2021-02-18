import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignupDetailsEnterprisePage } from './signup-details-enterprise.page';

describe('SignupDetailsEnterprisePage', () => {
  let component: SignupDetailsEnterprisePage;
  let fixture: ComponentFixture<SignupDetailsEnterprisePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupDetailsEnterprisePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupDetailsEnterprisePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
