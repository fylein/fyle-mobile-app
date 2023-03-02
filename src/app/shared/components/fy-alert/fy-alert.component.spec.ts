import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';

import { FyAlertComponent } from './fy-alert.component';

describe('FyAlertComponent', () => {
  let fyAlertComponent: FyAlertComponent;
  let fixture: ComponentFixture<FyAlertComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FyAlertComponent],
      imports: [IonicModule.forRoot(), MatIconModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FyAlertComponent);
    fyAlertComponent = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(fyAlertComponent).toBeTruthy();
  });
});
