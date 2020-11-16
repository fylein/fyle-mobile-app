import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyDuplicateDetectionComponent } from './fy-duplicate-detection.component';

describe('FyDuplicateDetectionComponent', () => {
  let component: FyDuplicateDetectionComponent;
  let fixture: ComponentFixture<FyDuplicateDetectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyDuplicateDetectionComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyDuplicateDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
