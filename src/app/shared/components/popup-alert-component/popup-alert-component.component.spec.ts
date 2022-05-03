import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PopupAlertComponentComponent } from './popup-alert-component.component';

xdescribe('PopupAlertComponentComponent', () => {
  let component: PopupAlertComponentComponent;
  let fixture: ComponentFixture<PopupAlertComponentComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PopupAlertComponentComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(PopupAlertComponentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
