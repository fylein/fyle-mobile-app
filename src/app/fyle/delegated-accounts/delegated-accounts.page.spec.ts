import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DelegatedAccountsPage } from './delegated-accounts.page';

describe('DelegatedAccountsPage', () => {
  let component: DelegatedAccountsPage;
  let fixture: ComponentFixture<DelegatedAccountsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelegatedAccountsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DelegatedAccountsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
