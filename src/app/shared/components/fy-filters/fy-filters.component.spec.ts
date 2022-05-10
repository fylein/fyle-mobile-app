import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyFiltersComponent } from './fy-filters.component';

xdescribe('FyFiltersComponent', () => {
  let component: FyFiltersComponent;
  let fixture: ComponentFixture<FyFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FyFiltersComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FyFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
