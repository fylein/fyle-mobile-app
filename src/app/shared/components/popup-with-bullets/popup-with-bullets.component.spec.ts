import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PopupWithBulletsComponent } from './popup-with-bullets.component';

xdescribe('PopupWithBulletsComponent', () => {
  let component: PopupWithBulletsComponent;
  let fixture: ComponentFixture<PopupWithBulletsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PopupWithBulletsComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupWithBulletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
