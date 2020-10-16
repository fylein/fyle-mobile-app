import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PullBackAdvanceRequestComponent } from './pull-back-advance-request.component';

describe('PullBackAdvanceRequestComponent', () => {
  let component: PullBackAdvanceRequestComponent;
  let fixture: ComponentFixture<PullBackAdvanceRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PullBackAdvanceRequestComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PullBackAdvanceRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
