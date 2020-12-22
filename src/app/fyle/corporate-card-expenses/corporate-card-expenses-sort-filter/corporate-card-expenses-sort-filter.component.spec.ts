import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CorporateCardExpensesSortFilterComponent } from './corporate-card-expenses-sort-filter.component';

describe('CorporateCardExpensesSortFilterComponent', () => {
  let component: CorporateCardExpensesSortFilterComponent;
  let fixture: ComponentFixture<CorporateCardExpensesSortFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CorporateCardExpensesSortFilterComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CorporateCardExpensesSortFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
