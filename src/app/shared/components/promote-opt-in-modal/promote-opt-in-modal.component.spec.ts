import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PromoteOptInModalComponent } from './promote-opt-in-modal.component';

xdescribe('PromoteOptInModalComponent', () => {
  let component: PromoteOptInModalComponent;
  let fixture: ComponentFixture<PromoteOptInModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PromoteOptInModalComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PromoteOptInModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
