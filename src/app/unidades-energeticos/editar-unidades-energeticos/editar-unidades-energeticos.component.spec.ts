import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarUnidadesEnergeticosComponent } from './editar-unidades-energeticos.component';

describe('EditarUnidadesEnergeticosComponent', () => {
  let component: EditarUnidadesEnergeticosComponent;
  let fixture: ComponentFixture<EditarUnidadesEnergeticosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarUnidadesEnergeticosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarUnidadesEnergeticosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
