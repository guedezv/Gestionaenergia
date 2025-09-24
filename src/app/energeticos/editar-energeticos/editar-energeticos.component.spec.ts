import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEnergeticosComponent } from './editar-energeticos.component';

describe('EditarEnergeticosComponent', () => {
  let component: EditarEnergeticosComponent;
  let fixture: ComponentFixture<EditarEnergeticosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarEnergeticosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarEnergeticosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
