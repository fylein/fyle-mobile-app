import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModifyApproverConfirmationPopoverComponent } from './modify-approver-confirmation-popover.component';

describe('ModifyApproverConfirmationPopoverComponent', () => {
  let component: ModifyApproverConfirmationPopoverComponent;
  let fixture: ComponentFixture<ModifyApproverConfirmationPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyApproverConfirmationPopoverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModifyApproverConfirmationPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
