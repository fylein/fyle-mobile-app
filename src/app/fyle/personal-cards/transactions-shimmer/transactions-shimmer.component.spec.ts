import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TransactionsShimmerComponent } from './transactions-shimmer.component';

describe('TransactionsShimmerComponent', () => {
  let transactionsShimmerComponent: TransactionsShimmerComponent;
  let fixture: ComponentFixture<TransactionsShimmerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionsShimmerComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsShimmerComponent);
    transactionsShimmerComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(transactionsShimmerComponent).toBeTruthy();
  });
});
