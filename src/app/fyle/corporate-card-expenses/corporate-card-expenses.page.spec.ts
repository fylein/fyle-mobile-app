import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CorporateCardExpensesPage } from './corporate-card-expenses.page';

describe('CorporateCardExpensesPage', () => {
  let component: CorporateCardExpensesPage;
  let fixture: ComponentFixture<CorporateCardExpensesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CorporateCardExpensesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CorporateCardExpensesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
