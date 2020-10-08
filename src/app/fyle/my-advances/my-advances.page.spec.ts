import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyAdvancesPage } from './my-advances.page';

describe('MyAdvancesPage', () => {
  let component: MyAdvancesPage;
  let fixture: ComponentFixture<MyAdvancesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyAdvancesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyAdvancesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
