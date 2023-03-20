import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActiveOrgCardComponent } from './active-org-card.component';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { IonicModule } from '@ionic/angular';

describe('ActiveOrgCardComponent', () => {
  let component: ActiveOrgCardComponent;
  let fixture: ComponentFixture<ActiveOrgCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot()],
      declarations: [ActiveOrgCardComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveOrgCardComponent);
    component = fixture.componentInstance;
    component.org = orgData1[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('switchOrg(): should emit event for switch org', () => {
    const orgSelectedSpy = spyOn(component.orgSelected, 'emit');
    component.switchOrg();
    expect(orgSelectedSpy).toHaveBeenCalledTimes(1);
  });

  it('should load with correct org data', () => {
    expect(getTextContent(getElementBySelector(fixture, '.active-org-card__icon-container__currency'))).toEqual(
      orgData1[0].currency
    );
    expect(getTextContent(getElementBySelector(fixture, '.active-org-card__content-container__title'))).toEqual(
      orgData1[0].name
    );
    expect(getTextContent(getElementBySelector(fixture, '.active-org-card__content-container__sub-title'))).toEqual(
      orgData1[0].domain
    );
  });

  it('should show Primary pill if the org isPrimary set to true', () => {
    component.isPrimaryOrg = true;
    fixture.detectChanges();
    expect(getTextContent(getElementBySelector(fixture, '.active-org-card__pill-container__pill'))).toEqual('Primary');
  });

  it('should show the skeleton text when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const skeletonTextEl = getElementBySelector(fixture, 'ion-skeleton-text');
    expect(skeletonTextEl).toBeTruthy();
  });

  it('should emit event when active org card is clicked', () => {
    const orgSelectedSpy = spyOn(component.orgSelected, 'emit');

    const button = getElementBySelector(fixture, '.active-org-card') as HTMLElement;
    click(button);
    expect(orgSelectedSpy).toHaveBeenCalledTimes(1);
  });
});
