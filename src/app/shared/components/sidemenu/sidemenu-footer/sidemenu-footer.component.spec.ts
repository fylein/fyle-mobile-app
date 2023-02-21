import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidemenuFooterComponent } from './sidemenu-footer.component';

describe('SidemenuFooterComponent', () => {
  let sidemenuFooterComponent: SidemenuFooterComponent;
  let fixture: ComponentFixture<SidemenuFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidemenuFooterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidemenuFooterComponent);
    sidemenuFooterComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sidemenuFooterComponent).toBeTruthy();
  });
});
