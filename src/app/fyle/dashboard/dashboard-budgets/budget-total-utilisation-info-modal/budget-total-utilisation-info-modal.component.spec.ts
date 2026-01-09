import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
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

  it('dismissModal(): should call modalController.dismiss', () => {
    component.dismissModal();
    expect(modalControllerSpy.dismiss).toHaveBeenCalledTimes(1);
  });
});
