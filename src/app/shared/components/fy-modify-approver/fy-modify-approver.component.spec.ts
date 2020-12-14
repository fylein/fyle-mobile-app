import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyModifyApproverComponent } from './fy-modify-approver.component';

describe('FyModifyApproverComponent', () => {
  let component: FyModifyApproverComponent;
  let fixture: ComponentFixture<FyModifyApproverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyModifyApproverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyModifyApproverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
