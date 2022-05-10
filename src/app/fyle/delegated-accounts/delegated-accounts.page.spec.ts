import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DelegatedAccountsPage } from './delegated-accounts.page';

xdescribe('DelegatedAccountsPage', () => {
  let component: DelegatedAccountsPage;
  let fixture: ComponentFixture<DelegatedAccountsPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DelegatedAccountsPage],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(DelegatedAccountsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
