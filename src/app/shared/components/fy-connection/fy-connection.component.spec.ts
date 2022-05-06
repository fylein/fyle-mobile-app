import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyConnectionComponent } from './fy-connection.component';

xdescribe('FyConnectionComponent', () => {
  let component: FyConnectionComponent;
  let fixture: ComponentFixture<FyConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FyConnectionComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FyConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
