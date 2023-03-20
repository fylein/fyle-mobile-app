import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule } from '@ionic/angular';

import { FyCategoryIconComponent } from './fy-category-icon.component';

describe('FyCategoryIconComponent', () => {
  let fyCategoryIconComponent: FyCategoryIconComponent;
  let fixture: ComponentFixture<FyCategoryIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FyCategoryIconComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FyCategoryIconComponent);
    fyCategoryIconComponent = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(fyCategoryIconComponent).toBeTruthy();
  });
});
