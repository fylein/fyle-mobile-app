import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InvitedUserPage } from './invited-user.page';

describe('InvitedUserPage', () => {
  let component: InvitedUserPage;
  let fixture: ComponentFixture<InvitedUserPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitedUserPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InvitedUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
