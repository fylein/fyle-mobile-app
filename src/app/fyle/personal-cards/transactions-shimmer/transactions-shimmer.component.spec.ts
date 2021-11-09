import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsShimmerComponent } from './transactions-shimmer.component';

describe('TransactionsShimmerComponent', () => {
  let component: TransactionsShimmerComponent;
  let fixture: ComponentFixture<TransactionsShimmerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionsShimmerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsShimmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
