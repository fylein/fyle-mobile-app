import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyEditReportPage } from './my-edit-report.page';

describe('MyEditReportPage', () => {
  let component: MyEditReportPage;
  let fixture: ComponentFixture<MyEditReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyEditReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyEditReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
