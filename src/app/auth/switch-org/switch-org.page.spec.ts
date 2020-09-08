import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SwithOrgPage } from './swith-org.page';

describe('SwithOrgPage', () => {
  let component: SwithOrgPage;
  let fixture: ComponentFixture<SwithOrgPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwithOrgPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SwithOrgPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
