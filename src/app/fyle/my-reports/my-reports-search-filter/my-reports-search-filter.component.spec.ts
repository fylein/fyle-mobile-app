import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyReportsSearchFilterComponent } from './my-reports-search-filter.component';

xdescribe('MyReportsSearchFilterComponent', () => {
  let component: MyReportsSearchFilterComponent;
  let fixture: ComponentFixture<MyReportsSearchFilterComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MyReportsSearchFilterComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(MyReportsSearchFilterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
