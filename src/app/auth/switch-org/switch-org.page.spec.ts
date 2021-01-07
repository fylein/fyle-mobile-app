import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SwitchOrgPage} from './switch-org.page';

describe('SwithOrgPage', () => {
  let component: SwitchOrgPage;
  let fixture: ComponentFixture<SwitchOrgPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwitchOrgPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SwitchOrgPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
