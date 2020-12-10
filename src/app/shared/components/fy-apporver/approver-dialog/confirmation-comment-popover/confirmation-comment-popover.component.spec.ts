import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConfirmationCommentPopoverComponent } from './confirmation-comment-popover.component';

describe('ConfirmationCommentPopoverComponent', () => {
  let component: ConfirmationCommentPopoverComponent;
  let fixture: ComponentFixture<ConfirmationCommentPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationCommentPopoverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationCommentPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
