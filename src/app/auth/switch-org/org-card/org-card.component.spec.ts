import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { MatRippleModule } from '@angular/material/core';
import { OrgCardComponent } from './org-card.component';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('OrgCardComponent', () => {
  let component: OrgCardComponent;
  let fixture: ComponentFixture<OrgCardComponent>;
  let translocoService: TranslocoService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OrgCardComponent],
      imports: [IonicModule.forRoot(), MatRippleModule],
      providers: [
        {
          provide: TranslocoService,
          useValue: {
            instant: jasmine.createSpy('instant'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrgCardComponent);
    component = fixture.componentInstance;
    component.org = orgData1[0];
    translocoService = TestBed.inject(TranslocoService);
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
    fixture.detectChanges();
    const currencyEl = getElementBySelector(fixture, '.org-card__icon-container__icon');
    expect(getTextContent(currencyEl)).toContain('USD');

    const domainEl = getElementBySelector(fixture, '.org-card__content-container__sub-title');
    expect(getTextContent(domainEl)).toContain('fyle.in');

    const nameEl = getElementBySelector(fixture, '.org-card__content-container__title');
    expect(getTextContent(nameEl)).toContain('Staging Loaded');
  });

  it('should show the skeleton text when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const skeletonTextEl = getElementBySelector(fixture, 'ion-skeleton-text');
    expect(skeletonTextEl).toBeTruthy();
  });

  it('should show "Primary" when isPrimaryOrg is true', () => {
    component.isPrimaryOrg = true;
    fixture.detectChanges();
    const pillEl = getElementBySelector(fixture, '.org-card__pill-container__pill');
    expect(getTextContent(pillEl)).toContain('Primary');
  });

  it('should not show "Primary" when isPrimaryOrg is false', () => {
    component.isPrimaryOrg = false;
    fixture.detectChanges();
    const pillEl = getElementBySelector(fixture, '.org-card__pill-container__pill');
    expect(pillEl).toBeNull();
  });
});
