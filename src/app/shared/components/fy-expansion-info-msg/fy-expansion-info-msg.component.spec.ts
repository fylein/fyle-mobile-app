import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';
import { By } from '@angular/platform-browser';
import { FyExpansionInfoMsgComponent } from './fy-expansion-info-msg.component';

describe('FyExpansionInfoMsgComponent', () => {
  let component: FyExpansionInfoMsgComponent;
  let fixture: ComponentFixture<FyExpansionInfoMsgComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FyExpansionInfoMsgComponent],
      imports: [MatIconModule, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FyExpansionInfoMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the info message content', () => {
    component.infoMsgContent = 'Test message content';
    fixture.detectChanges();

    const messageText = fixture.debugElement.query(By.css('.info-text-container span'));
    expect(messageText.nativeElement.textContent.trim()).toContain('Test message content');
  });

  it('should show help link when showHelpLink is true', () => {
    component.infoMsgContent = 'Test content';
    component.showHelpLink = true;
    component.helpLinkLabel = 'Learn more';
    fixture.detectChanges();

    const helpLink = fixture.debugElement.query(By.css('.fy-expansion--article-link'));
    expect(helpLink).toBeTruthy();
    expect(helpLink.nativeElement.textContent.trim()).toContain('Learn more');
  });

  it('should hide help link when showHelpLink is false', () => {
    component.infoMsgContent = 'Test content';
    component.showHelpLink = false;
    fixture.detectChanges();

    const helpLink = fixture.debugElement.query(By.css('.fy-expansion--article-link'));
    expect(helpLink).toBeFalsy();
  });

  it('should emit helpLinkClick when help link is clicked', () => {
    spyOn(component.helpLinkClick, 'emit');
    component.infoMsgContent = 'Test content';
    component.showHelpLink = true;
    fixture.detectChanges();

    const helpLink = fixture.debugElement.query(By.css('.fy-expansion--article-link'));
    helpLink.nativeElement.click();

    expect(component.helpLinkClick.emit).toHaveBeenCalled();
  });

  it('should render ion-accordion-group structure', () => {
    component.infoMsgContent = 'Test content';
    fixture.detectChanges();

    const accordionGroup = fixture.debugElement.query(By.css('ion-accordion-group'));
    expect(accordionGroup).toBeTruthy();
    expect(accordionGroup.nativeElement).toHaveClass('fy-expansion--info-message-accordion-group');
  });

  it('should render ion-accordion with correct class', () => {
    component.infoMsgContent = 'Test content';
    fixture.detectChanges();

    const accordion = fixture.debugElement.query(By.css('ion-accordion'));
    expect(accordion).toBeTruthy();
    expect(accordion.nativeElement).toHaveClass('fy-expansion--info-message-accordion');
  });

  it('should render info icon', () => {
    component.infoMsgContent = 'Test content';
    fixture.detectChanges();

    const infoIcon = fixture.debugElement.query(By.css('.info-icon'));
    expect(infoIcon).toBeTruthy();
    expect(infoIcon.nativeElement.getAttribute('svgIcon')).toBe('info-circle-fill');
  });

  it('should set custom help link label', () => {
    component.infoMsgContent = 'Test content';
    component.showHelpLink = true;
    component.helpLinkLabel = 'Custom Link Text';
    fixture.detectChanges();

    const helpLink = fixture.debugElement.query(By.css('.fy-expansion--article-link span'));
    expect(helpLink.nativeElement.textContent.trim()).toContain('Custom Link Text');
  });
});
