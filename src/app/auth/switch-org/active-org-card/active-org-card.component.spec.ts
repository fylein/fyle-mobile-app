import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveOrgCardComponent } from './active-org-card.component';

describe('ActiveOrgCardComponent', () => {
  let component: ActiveOrgCardComponent;
  let fixture: ComponentFixture<ActiveOrgCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveOrgCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveOrgCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
