import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {AppVersionPage} from './app-version.page';

describe('AppVersionPage', () => {
  let component: AppVersionPage;
  let fixture: ComponentFixture<AppVersionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppVersionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AppVersionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
