import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SetupAccountPage } from './setup-account.page';

describe('SetupAccountPage', () => {
  let component: SetupAccountPage;
  let fixture: ComponentFixture<SetupAccountPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupAccountPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SetupAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
