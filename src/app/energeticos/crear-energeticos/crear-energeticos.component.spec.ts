import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEnergeticosComponent } from './crear-energeticos.component';

describe('CrearEnergeticosComponent', () => {
  let component: CrearEnergeticosComponent;
  let fixture: ComponentFixture<CrearEnergeticosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearEnergeticosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearEnergeticosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
