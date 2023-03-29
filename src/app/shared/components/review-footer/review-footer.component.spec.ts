import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ReviewFooterComponent } from './review-footer.component';
import { apiExpenseRes } from 'src/app/core/mock-data/expense.data';
import { expensesWithDependentFields } from 'src/app/core/mock-data/dependent-field-expenses.data';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('ReviewFooterComponent', () => {
  let reviewFooterComponent: ReviewFooterComponent;
  let fixture: ComponentFixture<ReviewFooterComponent>;
  let trackingServiceSpy: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'footerSaveAndNextClicked',
      'footerSaveAndPrevClicked',
    ]);

    TestBed.configureTestingModule({
      declarations: [ReviewFooterComponent],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: TrackingService, useValue: trackingServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewFooterComponent);
    reviewFooterComponent = fixture.componentInstance;
    reviewFooterComponent.reviewList = apiExpenseRes;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(reviewFooterComponent).toBeTruthy();
  });

  it('onSaveAndGoToNext(): should emit save and go to next event when onSaveAndGoToNext is called', () => {
    const saveAndGoToNextSpy = spyOn(reviewFooterComponent.saveAndGoToNext, 'emit');
    fixture.detectChanges();
    reviewFooterComponent.onSaveAndGoToNext();
    expect(trackingServiceSpy.footerSaveAndNextClicked).toHaveBeenCalled();
    expect(saveAndGoToNextSpy).toHaveBeenCalled();
  });

  it('onSaveAndGoToPrev(): should emit save and go to prev event when onSaveAndGoToPrev is called', () => {
    const saveAndGoToNextPrev = spyOn(reviewFooterComponent.saveAndGoToPrev, 'emit');
    fixture.detectChanges();
    reviewFooterComponent.onSaveAndGoToPrev();
    expect(trackingServiceSpy.footerSaveAndPrevClicked).toHaveBeenCalled();
    expect(saveAndGoToNextPrev).toHaveBeenCalled();
  });

  it('should not render Save and Previous button when activeIndex is 0', () => {
    reviewFooterComponent.activeIndex = 0;
    reviewFooterComponent.reviewList = apiExpenseRes;
    fixture.detectChanges();
    const saveAndPrevButton = getElementBySelector(fixture, '.fy-footer-cta--tertiary-secondary') as HTMLElement;
    expect(saveAndPrevButton).toBeNull();
  });

  it('should not render Save and Previous button when reviewList is empty', () => {
    reviewFooterComponent.activeIndex = 1;
    reviewFooterComponent.reviewList = [];
    fixture.detectChanges();
    const saveAndPrevButton = getElementBySelector(fixture, '.fy-footer-cta--tertiary-secondary') as HTMLElement;
    expect(saveAndPrevButton).toBeNull();
  });

  it('should render Save and Previous button when activeIndex is greater than 0 and reviewList is not empty', () => {
    reviewFooterComponent.activeIndex = 1;
    reviewFooterComponent.reviewList = apiExpenseRes;
    fixture.detectChanges();
    const saveAndPrevButton = getElementBySelector(fixture, '.fy-footer-cta--tertiary-secondary') as HTMLElement;
    expect(saveAndPrevButton).not.toBeNull();
    expect(getTextContent(saveAndPrevButton)).toContain('Save and Previous');
  });

  it('should render Save button when reviewList is empty or activeIndex is the last item', () => {
    reviewFooterComponent.activeIndex = 1;
    reviewFooterComponent.reviewList = expensesWithDependentFields;
    fixture.detectChanges();
    const saveAndNextButton = getElementBySelector(fixture, '.fy-footer-cta--primary') as HTMLElement;
    expect(getTextContent(saveAndNextButton)).toContain('Save');
  });
});
