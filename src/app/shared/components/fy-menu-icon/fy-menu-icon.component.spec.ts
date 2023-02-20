import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyMenuIconComponent } from './fy-menu-icon.component';

describe('FyMenuIconComponent', () => {
  let fyMenuIconComponent: FyMenuIconComponent;
  let fixture: ComponentFixture<FyMenuIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FyMenuIconComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FyMenuIconComponent);
    fyMenuIconComponent = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(fyMenuIconComponent).toBeTruthy();
  });
});
