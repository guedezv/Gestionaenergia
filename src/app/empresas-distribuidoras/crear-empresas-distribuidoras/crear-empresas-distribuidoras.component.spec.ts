import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEmpresasDistribuidorasComponent } from './crear-empresas-distribuidoras.component';

describe('CrearEmpresasDistribuidorasComponent', () => {
  let component: CrearEmpresasDistribuidorasComponent;
  let fixture: ComponentFixture<CrearEmpresasDistribuidorasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearEmpresasDistribuidorasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearEmpresasDistribuidorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
