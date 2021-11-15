import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferenceSettingComponent } from './preference-setting.component';

describe('PreferenceSettingComponent', () => {
  let component: PreferenceSettingComponent;
  let fixture: ComponentFixture<PreferenceSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreferenceSettingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferenceSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
