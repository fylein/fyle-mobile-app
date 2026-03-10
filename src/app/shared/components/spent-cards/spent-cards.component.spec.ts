import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { cardDetailsRes } from 'src/app/core/mock-data/platform-corporate-card-detail.data';
import { SpentCardsComponent } from './spent-cards.component';
import { getAllElementsBySelector, getElementBySelector } from 'src/app/core/dom-helpers';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from '@angular/core';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';
import { CardDetailComponent } from './card-detail/card-detail.component';
import { AddCardComponent } from '../add-card/add-card.component';

// mock for card-detail component
@Component({
  selector: 'app-card-detail',
  template: '<div></div>',
  imports: [],
})
class MockCardDetailComponent {
  @Input() cardDetail: unknown;
  @Input() homeCurrency: string | undefined;
  @Input() currencySymbol: string | undefined;
}

// mock for add-card component
@Component({
  selector: 'app-add-card',
  template: '<div></div>',
  imports: [],
})
class MockAddCardComponent {
  @Input() showZeroStateMessage = false;
  @Output() addCardClick = new EventEmitter<void>();
}

describe('SpentCardsComponent', () => {
  let component: SpentCardsComponent;
  let fixture: ComponentFixture<SpentCardsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SpentCardsComponent, getTranslocoTestingModule()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).overrideComponent(SpentCardsComponent, {
      remove: {
        imports: [CardDetailComponent, AddCardComponent],
      },
      add: {
        imports: [MockCardDetailComponent, MockAddCardComponent],
      },
    }).compileComponents();

    fixture = TestBed.createComponent(SpentCardsComponent);
    component = fixture.componentInstance;

    component.showAddCardSlide = true;
    fixture.componentRef.setInput('cardDetails', cardDetailsRes);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render cards in swiper component', () => {
    fixture.componentRef.setInput('cardDetails', cardDetailsRes);
    fixture.detectChanges();
    const swiper = getElementBySelector(fixture, '.swiper');
    expect(swiper).toBeTruthy();
    const swiperSlides = getAllElementsBySelector(fixture, '.swiper-slide');
    // Adding + 1 for add new card swiper slide
    expect(swiperSlides.length).toBe(cardDetailsRes.length + 1);
  });

  it('should render pagination container', () => {
    fixture.componentRef.setInput('cardDetails', cardDetailsRes);
    fixture.detectChanges();
    const pagination = getElementBySelector(fixture, '.swiper-pagination');
    expect(pagination).toBeTruthy();
  });

  it('should render single card if only one card is present', () => {
    fixture.componentRef.setInput('cardDetails', [cardDetailsRes[0]]);
    fixture.detectChanges();
    const swiper = getElementBySelector(fixture, '.swiper');
    expect(swiper).toBeTruthy();
    const cardDetail = getElementBySelector(fixture, '.spent-cards app-card-detail');
    expect(cardDetail).toBeTruthy();
    const swiperSlides = getAllElementsBySelector(fixture, '.swiper-slide');
    // Adding + 1 for add new card swiper slide
    expect(swiperSlides.length).toBe(2);
  });

  it('should have add card slide at the end', () => {
    fixture.componentRef.setInput('cardDetails', cardDetailsRes);
    fixture.detectChanges();

    const swiperSlides = getAllElementsBySelector(fixture, '.swiper-slide');
    const lastSlide = swiperSlides[swiperSlides.length - 1];

    const addCardComponent = getElementBySelector(fixture, '[data-testid="add-card"]');
    expect(addCardComponent).toBeTruthy();

    expect(lastSlide?.contains(addCardComponent)).toBeTrue();
  });

  it('should not have add card slide if showAddCardSlide is false', () => {
    fixture.componentRef.setInput('cardDetails', cardDetailsRes);
    component.showAddCardSlide = false;

    fixture.detectChanges();

    const addCardComponent = getElementBySelector(fixture, '[data-testid="add-card"]');
    expect(addCardComponent).toBeFalsy();
  });
});
