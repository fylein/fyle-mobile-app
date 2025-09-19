import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import { FyHighlightTextComponent } from './fy-highlight-text.component';

describe('FyHighlightTextComponent', () => {
  let fyHighlightTextComponent: FyHighlightTextComponent;
  let fixture: ComponentFixture<FyHighlightTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FyHighlightTextComponent, HighlightPipe],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FyHighlightTextComponent);
    fyHighlightTextComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the fyHighlightTextComponent', () => {
    expect(fyHighlightTextComponent).toBeTruthy();
  });

  it('should apply inverse-highlight class when queryText is present', () => {
    fyHighlightTextComponent.queryText = 'project';
    fixture.detectChanges();
    const divElement = fixture.nativeElement.querySelector('div');
    expect(divElement.classList.contains('inverse-highlight')).toBeTrue();
  });

  it('should not apply inverse-highlight class when queryText is not present', () => {
    fyHighlightTextComponent.queryText = '';
    fixture.detectChanges();
    const divElement = fixture.nativeElement.querySelector('div');
    expect(divElement.classList.contains('inverse-highlight')).toBeFalse();
  });

  it('should highlight the text when queryText is present', () => {
    fyHighlightTextComponent.fullText = 'This is a project';
    fyHighlightTextComponent.queryText = 'project';
    fixture.detectChanges();
    const divElement = fixture.nativeElement.querySelector('div');
    expect(divElement.innerHTML).toContain('This is a <span class="highlight">project</span>');
  });

  it('should not highlight the text when queryText is not present', () => {
    fyHighlightTextComponent.fullText = 'This is a project';
    fyHighlightTextComponent.queryText = '';
    fixture.detectChanges();
    const divElement = fixture.nativeElement.querySelector('div');
    expect(divElement.innerHTML).toEqual(fyHighlightTextComponent.fullText);
  });
});
