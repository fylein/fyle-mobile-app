import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

import { AutoSubmissionInfoCardComponent } from './auto-submission-info-card.component';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('AutoSubmissionInfoCardComponent', () => {
  let component: AutoSubmissionInfoCardComponent;
  let fixture: ComponentFixture<AutoSubmissionInfoCardComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [ TranslocoModule, AutoSubmissionInfoCardComponent],
      providers: [
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AutoSubmissionInfoCardComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'autoSubmissionInfoCard.nextSubmissionOn': 'Next submission on',
        'autoSubmissionInfoCard.completeExpenses': 'Complete expenses',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onCardClicked(): should emit cardClicked event when card is clicked', () => {
    spyOn(component.cardClicked, 'emit');
    const infoCardContainer = getElementBySelector(fixture, '.info-card__container') as HTMLElement;
    infoCardContainer.click();
    expect(component.cardClicked.emit).toHaveBeenCalled();
  });

  it('should display the correct date in the template', () => {
    const expectedDate = new Date('2022-11-30T17:31:52.261Z');
    component.autoSubmissionReportDate = expectedDate;
    fixture.detectChanges();
    const infoCardDate = getElementBySelector(fixture, '.info-card__date');
    expect(getTextContent(infoCardDate)).toBe('Nov 30');
  });
});
