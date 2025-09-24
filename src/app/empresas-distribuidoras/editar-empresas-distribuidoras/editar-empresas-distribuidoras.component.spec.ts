import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEmpresasDistribuidorasComponent } from './editar-empresas-distribuidoras.component';

describe('EditarEmpresasDistribuidorasComponent', () => {
  let component: EditarEmpresasDistribuidorasComponent;
  let fixture: ComponentFixture<EditarEmpresasDistribuidorasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarEmpresasDistribuidorasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarEmpresasDistribuidorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
