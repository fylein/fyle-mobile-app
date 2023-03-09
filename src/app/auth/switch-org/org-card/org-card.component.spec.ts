import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MatRippleModule } from '@angular/material/core';
import { OrgCardComponent } from './org-card.component';
import { orgData1 } from 'src/app/core/mock-data/org.data';

describe('OrgCardComponent', () => {
  let component: OrgCardComponent;
  let fixture: ComponentFixture<OrgCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrgCardComponent],
      imports: [IonicModule.forRoot(), MatRippleModule],
    }).compileComponents();

    fixture = TestBed.createComponent(OrgCardComponent);
    component = fixture.componentInstance;
    component.org = orgData1[0];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSelectOrg(): should emit the selectOrg event when onSelectOrg method is called', () => {
    spyOn(component.selectOrg, 'emit');
    component.onSelectOrg();
    expect(component.selectOrg.emit).toHaveBeenCalled();
  });

  it('should display the correct org card details', () => {
    component.isLoading = false;
    const currencyEl = fixture.nativeElement.querySelector('.org-card__icon-container__icon');
    expect(currencyEl.textContent).toContain('USD');

    const domainEl = fixture.nativeElement.querySelector('.org-card__content-container__sub-title');
    expect(domainEl.textContent).toContain('fyle.in');

    const nameEl = fixture.nativeElement.querySelector('.org-card__content-container__title');
    expect(nameEl.textContent).toContain('Staging Loaded');
  });

  it('should show the skeleton text when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const skeletonTextEl = fixture.nativeElement.querySelector('ion-skeleton-text');
    expect(skeletonTextEl).toBeTruthy();
  });

  it('should show "Primary" when isPrimaryOrg is true', () => {
    component.isPrimaryOrg = true;
    fixture.detectChanges();
    const pillEl = fixture.nativeElement.querySelector('.org-card__pill-container__pill');
    expect(pillEl.textContent).toContain('Primary');
  });

  it('should not show "Primary" when isPrimaryOrg is false', () => {
    component.isPrimaryOrg = false;
    fixture.detectChanges();
    const pillEl = fixture.nativeElement.querySelector('.org-card__pill-container__pill');
    expect(pillEl).toBeFalsy();
  });
});
