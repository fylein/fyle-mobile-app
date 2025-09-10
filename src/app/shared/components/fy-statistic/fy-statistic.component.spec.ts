import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyStatisticComponent } from './fy-statistic.component';

describe('FyStatisticComponent', () => {
  let fyStatisticComponent: FyStatisticComponent;
  let fixture: ComponentFixture<FyStatisticComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), FyStatisticComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FyStatisticComponent);
    fyStatisticComponent = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(fyStatisticComponent).toBeTruthy();
  });
});
