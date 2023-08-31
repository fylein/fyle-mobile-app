import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

import { AutoSubmissionInfoCardComponent } from './auto-submission-info-card.component';

describe('AutoSubmissionInfoCardComponent', () => {
  let component: AutoSubmissionInfoCardComponent;
  let fixture: ComponentFixture<AutoSubmissionInfoCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AutoSubmissionInfoCardComponent, DatePipe],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AutoSubmissionInfoCardComponent);
    component = fixture.componentInstance;
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
