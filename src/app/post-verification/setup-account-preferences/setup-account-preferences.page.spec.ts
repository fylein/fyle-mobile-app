import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SetupAccountPreferencesPage } from './setup-account-preferences.page';

xdescribe('SetupAccountPreferencesPage', () => {
  let component: SetupAccountPreferencesPage;
  let fixture: ComponentFixture<SetupAccountPreferencesPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SetupAccountPreferencesPage],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(SetupAccountPreferencesPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
