import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { InfoCardComponent } from './info-card.component';
import { By } from '@angular/platform-browser';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';

describe('InfoCardComponent', () => {
  let component: InfoCardComponent;
  let fixture: ComponentFixture<InfoCardComponent>;
  let clipboardService: jasmine.SpyObj<ClipboardService>;

  beforeEach(waitForAsync(() => {
    const clipboardServiceSpy = jasmine.createSpyObj('ClipboardService', ['writeString']);
    TestBed.configureTestingModule({
      declarations: [InfoCardComponent],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: ClipboardService, useValue: clipboardServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoCardComponent);
    component = fixture.componentInstance;
    clipboardService = TestBed.inject(ClipboardService) as jasmine.SpyObj<ClipboardService>;

    component.title = 'Email Receipts';
    component.content = 'Forward your receipts to Fyle at receipts@fylehq.com.';
    component.contentToCopy = 'receipts@fylehq.com';
    component.toastMessageContent = 'Email Copied Successfully';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('copyToClipboard(): Should copy content to clipboard and emit copiedText event', fakeAsync(() => {
    spyOn(component, 'copyToClipboard').and.callThrough();
    clipboardService.writeString.and.resolveTo();
    spyOn(component.copiedText, 'emit');

    const infoCard = getElementBySelector(fixture, '.info-card__card') as HTMLDivElement;
    click(infoCard);
    tick(100);

    expect(component.copyToClipboard).toHaveBeenCalledOnceWith(component.contentToCopy);
    expect(clipboardService.writeString).toHaveBeenCalledOnceWith(component.contentToCopy);
    expect(component.copiedText.emit).toHaveBeenCalledOnceWith(component.toastMessageContent);
  }));

  it('should render title and content in the ui', () => {
    const title = getElementBySelector(fixture, '.info-card__card__title');
    const content = getElementBySelector(fixture, '.info-card__content-container__content');

    expect(title.textContent).toEqual(component.title);
    expect(content.textContent).toEqual(component.content);
  });
});
