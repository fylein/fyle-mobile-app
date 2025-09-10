import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/standalone';

import { DeleteButtonComponent } from './delete-button-component';

describe('DeleteButtonComponent', () => {
  let component: DeleteButtonComponent;
  let fixture: ComponentFixture<DeleteButtonComponent>;
  let popoverController: PopoverController;

  beforeEach(async () => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), DeleteButtonComponent],
      providers: [{ provide: PopoverController, useValue: popoverControllerSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteButtonComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call popoverController.dismiss when confirmDelete button is clicked', () => {
    component.confirmDelete();
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith('delete');
  });
});
