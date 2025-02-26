import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ShowAllApproversPopoverComponent } from './show-all-approvers-popover.component';

describe('ShowAllApproversPopoverComponent', () => {
  let component: ShowAllApproversPopoverComponent;
  let fixture: ComponentFixture<ShowAllApproversPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ShowAllApproversPopoverComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowAllApproversPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
