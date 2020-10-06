import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PullBackTripComponent } from './pull-back-trip.component';

describe('PullBackTripComponent', () => {
  let component: PullBackTripComponent;
  let fixture: ComponentFixture<PullBackTripComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PullBackTripComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PullBackTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
