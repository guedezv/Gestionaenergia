import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarMedidoresComponent } from './editar-medidores.component';

describe('EditarMedidoresComponent', () => {
  let component: EditarMedidoresComponent;
  let fixture: ComponentFixture<EditarMedidoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarMedidoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarMedidoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
