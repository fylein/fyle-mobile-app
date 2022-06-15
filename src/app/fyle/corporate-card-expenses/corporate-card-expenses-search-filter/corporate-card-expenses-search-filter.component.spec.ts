import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CorporateCardExpensesSearchFilterComponent } from './corporate-card-expenses-search-filter.component';

xdescribe('CorporateCardExpensesSearchFilterComponent', () => {
  let component: CorporateCardExpensesSearchFilterComponent;
  let fixture: ComponentFixture<CorporateCardExpensesSearchFilterComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CorporateCardExpensesSearchFilterComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(CorporateCardExpensesSearchFilterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
