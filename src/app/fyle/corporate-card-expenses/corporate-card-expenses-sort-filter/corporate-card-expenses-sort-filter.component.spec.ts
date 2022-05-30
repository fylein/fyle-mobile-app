import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CorporateCardExpensesSortFilterComponent } from './corporate-card-expenses-sort-filter.component';

xdescribe('CorporateCardExpensesSortFilterComponent', () => {
  let component: CorporateCardExpensesSortFilterComponent;
  let fixture: ComponentFixture<CorporateCardExpensesSortFilterComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CorporateCardExpensesSortFilterComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(CorporateCardExpensesSortFilterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
