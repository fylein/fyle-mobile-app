import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PersonalCardsMatchedExpensesPage } from './personal-cards-matched-expenses.page';

describe('PersonalCardsMatchedExpensesPage', () => {
  let component: PersonalCardsMatchedExpensesPage;
  let fixture: ComponentFixture<PersonalCardsMatchedExpensesPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PersonalCardsMatchedExpensesPage],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(PersonalCardsMatchedExpensesPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
