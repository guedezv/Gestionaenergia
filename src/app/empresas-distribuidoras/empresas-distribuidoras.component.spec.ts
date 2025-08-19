import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresasDistribuidorasComponent } from './empresas-distribuidoras.component';

describe('EmpresasDistribuidorasComponent', () => {
  let component: EmpresasDistribuidorasComponent;
  let fixture: ComponentFixture<EmpresasDistribuidorasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresasDistribuidorasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpresasDistribuidorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
