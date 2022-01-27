import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidemenuFooterComponent } from './sidemenu-footer.component';

describe('SidemenuFooterComponent', () => {
  let component: SidemenuFooterComponent;
  let fixture: ComponentFixture<SidemenuFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidemenuFooterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidemenuFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
