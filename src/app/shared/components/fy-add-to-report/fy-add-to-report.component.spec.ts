import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyAddToReportComponent } from './fy-add-to-report.component';

describe('FyAddToReportComponent', () => {
  let component: FyAddToReportComponent;
  let fixture: ComponentFixture<FyAddToReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyAddToReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyAddToReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
