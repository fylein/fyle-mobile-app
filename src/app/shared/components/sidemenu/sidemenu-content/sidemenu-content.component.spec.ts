import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidemenuContentComponent } from './sidemenu-content.component';

describe('SidemenuContentComponent', () => {
  let component: SidemenuContentComponent;
  let fixture: ComponentFixture<SidemenuContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidemenuContentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidemenuContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
