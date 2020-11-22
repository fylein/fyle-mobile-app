import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ApproverModalPage } from './approver-modal.page';

describe('ApproverModalPage', () => {
  let component: ApproverModalPage;
  let fixture: ComponentFixture<ApproverModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproverModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ApproverModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
