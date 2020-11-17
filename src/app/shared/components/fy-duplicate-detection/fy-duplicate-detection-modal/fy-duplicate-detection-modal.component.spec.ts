import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyDuplicateDetectionModalComponent } from './fy-duplicate-detection-modal.component';

describe('FyDuplicateDetectionModalComponent', () => {
  let component: FyDuplicateDetectionModalComponent;
  let fixture: ComponentFixture<FyDuplicateDetectionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyDuplicateDetectionModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyDuplicateDetectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
