import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { getAllElementsBySelector, getElementBySelector } from 'src/app/core/dom-helpers';

import { FyNavFooterComponent } from './fy-nav-footer.component';
import { of } from 'rxjs';

describe('FyNavFooterComponent', () => {
  let component: FyNavFooterComponent;
  let fixture: ComponentFixture<FyNavFooterComponent>;
  let mockActiveEtxnIndex: number;
  let mockNumEtxnsInReport: number;
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
      imports: [IonicModule.forRoot(), TranslocoModule, FyNavFooterComponent],
      providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
    }).compileComponents();
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyNavFooter.previous': 'Previous',
        'fyNavFooter.next': 'Next',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    fixture = TestBed.createComponent(FyNavFooterComponent);
    component = fixture.componentInstance;
    mockActiveEtxnIndex = 0;
    mockNumEtxnsInReport = 2;
    component.activeExpenseIndex = mockActiveEtxnIndex;
    component.reportExpenseCount = mockNumEtxnsInReport;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('goToNext(): should emit nextClicked when goToNext is called', () => {
    const nextClickedSpy = spyOn(component.nextClicked, 'emit');
    component.goToNext();
    expect(nextClickedSpy).toHaveBeenCalledTimes(1);
  });

  it('goToPrev(): should emit prevClicked when goToPrev is called', () => {
    const prevClickedSpy = spyOn(component.prevClicked, 'emit');
    component.goToPrev();
    expect(prevClickedSpy).toHaveBeenCalledTimes(1);
  });

  describe('template:', () => {
    it('should disable previous button when activeEtxnIndex is 0', () => {
      const prevButton = getElementBySelector(fixture, '.nav-footer__footer__btn') as HTMLButtonElement;
      expect(prevButton.disabled).toBeTruthy();
    });

    it('should disable next button when activeEtxnIndex is numEtxnsInReport - 1', () => {
      component.activeExpenseIndex = mockNumEtxnsInReport - 1;
      fixture.detectChanges();
      const nextButton = getAllElementsBySelector(fixture, '.btn-secondary')[1] as HTMLButtonElement;
      expect(nextButton.disabled).toBeTruthy();
    });

    it('should enable previous button when activeEtxnIndex is greater than 0', () => {
      component.activeExpenseIndex = 1;
      fixture.detectChanges();
      const prevButton = getElementBySelector(fixture, '.nav-footer__footer__btn') as HTMLButtonElement;
      expect(prevButton.disabled).toBeFalsy();
    });

    it('should enable next button when activeEtxnIndex is less than numEtxnsInReport - 1', () => {
      component.activeExpenseIndex = 0;
      fixture.detectChanges();
      const nextButton = getAllElementsBySelector(fixture, '.btn-secondary')[1] as HTMLButtonElement;
      expect(nextButton.disabled).toBeFalsy();
    });
  });
});
