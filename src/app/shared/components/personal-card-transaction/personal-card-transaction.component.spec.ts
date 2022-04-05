import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalCardTransactionComponent } from './personal-card-transaction.component';

describe('PersonalCardTransactionComponent', () => {
  let component: PersonalCardTransactionComponent;
  let fixture: ComponentFixture<PersonalCardTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PersonalCardTransactionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalCardTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
