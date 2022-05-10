import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyReportsSortFilterComponent } from './my-reports-sort-filter.component';

xdescribe('MyReportsSortFilterComponent', () => {
  let component: MyReportsSortFilterComponent;
  let fixture: ComponentFixture<MyReportsSortFilterComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MyReportsSortFilterComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(MyReportsSortFilterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
