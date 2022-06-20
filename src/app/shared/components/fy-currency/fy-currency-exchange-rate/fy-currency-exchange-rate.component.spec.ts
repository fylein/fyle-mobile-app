import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyCurrencyExchangeRateComponent } from './fy-currency-exchange-rate.component';

xdescribe('FyCurrencyExchangeRateComponent', () => {
  let component: FyCurrencyExchangeRateComponent;
  let fixture: ComponentFixture<FyCurrencyExchangeRateComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FyCurrencyExchangeRateComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(FyCurrencyExchangeRateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
