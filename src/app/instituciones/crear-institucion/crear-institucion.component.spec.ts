import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearInstitucionComponent } from './crear-institucion.component';

describe('CrearInstitucionComponent', () => {
  let component: CrearInstitucionComponent;
  let fixture: ComponentFixture<CrearInstitucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearInstitucionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearInstitucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
