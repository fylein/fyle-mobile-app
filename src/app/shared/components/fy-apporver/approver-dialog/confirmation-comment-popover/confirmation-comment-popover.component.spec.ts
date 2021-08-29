import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConfirmationCommentPopoverComponent } from './confirmation-comment-popover.component';

describe('ConfirmationCommentPopoverComponent', () => {
  let component: ConfirmationCommentPopoverComponent;
  let fixture: ComponentFixture<ConfirmationCommentPopoverComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ConfirmationCommentPopoverComponent],
        imports: [IonicModule.forRoot()]
      }).compileComponents();

      fixture = TestBed.createComponent(ConfirmationCommentPopoverComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
