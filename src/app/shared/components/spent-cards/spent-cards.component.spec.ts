import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { cardDetailsRes } from 'src/app/core/mock-data/platform-corporate-card-detail-data';
import { SpentCardsComponent } from './spent-cards.component';
import { SwiperModule } from 'swiper/angular';
import { getAllElementsBySelector, getElementBySelector } from 'src/app/core/dom-helpers';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SpentCardsComponent', () => {
  let component: SpentCardsComponent;
  let fixture: ComponentFixture<SpentCardsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SpentCardsComponent],
      imports: [IonicModule.forRoot(), SwiperModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SpentCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render cards in swiper component', () => {
    component.spentCards = cardDetailsRes;
    fixture.detectChanges();
    const swiper = getElementBySelector(fixture, 'swiper');
    expect(swiper).toBeTruthy();
    const swiperSlides = getAllElementsBySelector(fixture, '.swiper-slide');
    // Adding + 1 for add new card swiper slide
    expect(swiperSlides.length).toBe(component.spentCards.length + 1);
  });

  it('should set pagination to dynamic bullets', () => {
    const index = 1;
    const className = 'swiper-pagination-bullet';
    const result = component.pagination.renderBullet(index, className);
    expect(result).toContain(`<span class="spent-cards ${className}"> </span>`);
    expect(component.pagination.dynamicBullets).toBeTrue();
  });

  it('should render single card if only one card is present', () => {
    component.spentCards = [cardDetailsRes[0]];
    fixture.detectChanges();
    const swiper = getElementBySelector(fixture, 'swiper');
    expect(swiper).toBeTruthy();
    const cardDetail = getElementBySelector(fixture, '.spent-card app-card-detail');
    expect(cardDetail).toBeTruthy();
    const swiperSlides = getAllElementsBySelector(fixture, '.swiper-slide');
    // Adding + 1 for add new card swiper slide
    expect(swiperSlides.length).toBe(component.spentCards.length + 1);
  });

  it('should have add new card swiper slide at the end', () => {
    component.spentCards = cardDetailsRes;
    fixture.detectChanges();

    const swiperSlides = getAllElementsBySelector(fixture, '.swiper-slide');
    const lastSlide = swiperSlides[swiperSlides.length - 1];

    const addCardComponent = getElementBySelector(fixture, '[data-testid="add-card"]');
    expect(addCardComponent).toBeTruthy();

    expect(lastSlide.contains(addCardComponent)).toBeTrue();
  });
});
