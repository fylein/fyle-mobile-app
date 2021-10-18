import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountCardsComponent } from './bank-account-cards.component';

describe('BankAccountCardsComponent', () => {
  let component: BankAccountCardsComponent;
  let fixture: ComponentFixture<BankAccountCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankAccountCardsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
