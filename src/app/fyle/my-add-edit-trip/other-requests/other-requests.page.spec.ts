import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OtherRequestsPage } from './other-requests.page';

describe('OtherRequestsPage', () => {
  let component: OtherRequestsPage;
  let fixture: ComponentFixture<OtherRequestsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherRequestsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OtherRequestsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
