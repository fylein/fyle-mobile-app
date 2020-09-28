import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RequestInvitationPage } from './request-invitation.page';

describe('RequestInvitationPage', () => {
  let component: RequestInvitationPage;
  let fixture: ComponentFixture<RequestInvitationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestInvitationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestInvitationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
