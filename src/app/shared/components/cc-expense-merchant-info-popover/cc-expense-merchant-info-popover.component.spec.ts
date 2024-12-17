import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CcExpenseMerchantInfoPopoverComponent } from './cc-expense-merchant-info-popover.component';

describe('CcExpenseMerchantInfoComponent', () => {
  let component: CcExpenseMerchantInfoPopoverComponent;
  let fixture: ComponentFixture<CcExpenseMerchantInfoPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CcExpenseMerchantInfoPopoverComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CcExpenseMerchantInfoPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
