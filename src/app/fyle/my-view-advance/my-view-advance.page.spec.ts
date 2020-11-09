import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyViewAdvancePage } from './my-view-advance.page';

describe('MyViewAdvancePage', () => {
  let component: MyViewAdvancePage;
  let fixture: ComponentFixture<MyViewAdvancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyViewAdvancePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyViewAdvancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
