import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyReportsSortFilterComponent } from './my-reports-sort-filter.component';

describe('MyReportsSortFilterComponent', () => {
  let component: MyReportsSortFilterComponent;
  let fixture: ComponentFixture<MyReportsSortFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyReportsSortFilterComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyReportsSortFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
