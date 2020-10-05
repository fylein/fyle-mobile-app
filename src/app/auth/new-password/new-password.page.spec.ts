import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewPasswordPage } from './new-password.page';

describe('NewPasswordPage', () => {
  let component: NewPasswordPage;
  let fixture: ComponentFixture<NewPasswordPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPasswordPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
