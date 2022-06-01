import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ActionConfirmationPopoverComponent } from './action-confirmation-popover.component';

xdescribe('ActionConfirmationPopoverComponent', () => {
  let component: ActionConfirmationPopoverComponent;
  let fixture: ComponentFixture<ActionConfirmationPopoverComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ActionConfirmationPopoverComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(ActionConfirmationPopoverComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
