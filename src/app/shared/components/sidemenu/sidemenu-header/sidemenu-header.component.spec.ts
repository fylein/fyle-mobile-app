import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidemenuHeaderComponent } from './sidemenu-header.component';

describe('SidemenuHeaderComponent', () => {
  let component: SidemenuHeaderComponent;
  let fixture: ComponentFixture<SidemenuHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidemenuHeaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidemenuHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
