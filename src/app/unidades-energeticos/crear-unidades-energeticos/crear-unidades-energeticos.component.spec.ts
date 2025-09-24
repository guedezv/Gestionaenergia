import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearUnidadesEnergeticosComponent } from './crear-unidades-energeticos.component';

describe('CrearUnidadesEnergeticosComponent', () => {
  let component: CrearUnidadesEnergeticosComponent;
  let fixture: ComponentFixture<CrearUnidadesEnergeticosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearUnidadesEnergeticosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearUnidadesEnergeticosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
