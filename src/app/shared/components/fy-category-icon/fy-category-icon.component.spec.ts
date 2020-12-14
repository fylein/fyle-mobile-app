import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyCategoryIconComponent } from './fy-category-icon.component';

describe('FyCategoryIconComponent', () => {
  let component: FyCategoryIconComponent;
  let fixture: ComponentFixture<FyCategoryIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyCategoryIconComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyCategoryIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
