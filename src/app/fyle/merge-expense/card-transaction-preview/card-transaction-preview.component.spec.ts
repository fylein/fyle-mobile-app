import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CardTransactionPreviewComponent } from './card-transaction-preview.component';

describe('CardTransactionPreviewComponent', () => {
  let component: CardTransactionPreviewComponent;
  let fixture: ComponentFixture<CardTransactionPreviewComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CardTransactionPreviewComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(CardTransactionPreviewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
