import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiUnidadComponent } from './mi-unidad.component';

describe('MiUnidadComponent', () => {
  let component: MiUnidadComponent;
  let fixture: ComponentFixture<MiUnidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiUnidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiUnidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
