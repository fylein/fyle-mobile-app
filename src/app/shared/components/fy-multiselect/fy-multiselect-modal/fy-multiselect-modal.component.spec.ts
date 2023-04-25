import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyMultiselectModalComponent } from './fy-multiselect-modal.component';

xdescribe('FyMultiselectComponent', () => {
  let component: FyMultiselectModalComponent;
  let fixture: ComponentFixture<FyMultiselectModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FyMultiselectModalComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FyMultiselectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
