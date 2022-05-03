import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyFilterPillsComponent } from './fy-filter-pills.component';

xdescribe('FyFilterPillsComponent', () => {
  let component: FyFilterPillsComponent;
  let fixture: ComponentFixture<FyFilterPillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FyFilterPillsComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FyFilterPillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
