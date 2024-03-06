import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FySelectCommuteDetailsComponent } from './fy-select-commute-details.component';

xdescribe('FySelectCommuteDetailsComponent', () => {
  let component: FySelectCommuteDetailsComponent;
  let fixture: ComponentFixture<FySelectCommuteDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FySelectCommuteDetailsComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FySelectCommuteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
