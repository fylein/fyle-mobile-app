import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { By } from '@angular/platform-browser';
import { BudgetTotalUtilisationInfoModalComponent } from './budget-total-utilisation-info-modal.component';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';

describe('BudgetTotalUtilisationInfoModalComponent', () => {
  let component: BudgetTotalUtilisationInfoModalComponent;
  let fixture: ComponentFixture<BudgetTotalUtilisationInfoModalComponent>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    await TestBed.configureTestingModule({
      imports: [BudgetTotalUtilisationInfoModalComponent, getTranslocoTestingModule()],
      providers: [{ provide: ModalController, useValue: modalControllerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetTotalUtilisationInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('dismissModal():', () => {
    it('should call modalController.dismiss', () => {
      component.dismissModal();
      expect(modalControllerSpy.dismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('template:', () => {
    it('should display title', () => {
      const title = fixture.debugElement.query(By.css('[data-testid="title"]'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('Total utilisation');
    });

    it('should display description content', () => {
      const content = fixture.debugElement.query(By.css('[data-testid="content"]'));
      expect(content).toBeTruthy();
    });

    it('should call dismissModal when close button is clicked', () => {
      spyOn(component, 'dismissModal');
      const closeBtn = fixture.debugElement.query(By.css('[data-testid="close-btn"]'));
      closeBtn.nativeElement.click();
      expect(component.dismissModal).toHaveBeenCalledTimes(1);
    });
  });
});
