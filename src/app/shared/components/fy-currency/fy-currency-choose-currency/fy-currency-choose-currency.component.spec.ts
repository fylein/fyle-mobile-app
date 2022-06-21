import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyCurrencyChooseCurrencyComponent } from './fy-currency-choose-currency.component';

xdescribe('FyCurrencyChooseCurrencyComponent', () => {
  let component: FyCurrencyChooseCurrencyComponent;
  let fixture: ComponentFixture<FyCurrencyChooseCurrencyComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FyCurrencyChooseCurrencyComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(FyCurrencyChooseCurrencyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
