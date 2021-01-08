import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {DisabledPage} from './disabled.page';

describe('DisabledPage', () => {
  let component: DisabledPage;
  let fixture: ComponentFixture<DisabledPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisabledPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DisabledPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
