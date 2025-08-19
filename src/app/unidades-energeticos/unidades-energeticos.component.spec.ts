import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadesEnergeticosComponent } from './unidades-energeticos.component';

describe('UnidadesEnergeticosComponent', () => {
  let component: UnidadesEnergeticosComponent;
  let fixture: ComponentFixture<UnidadesEnergeticosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnidadesEnergeticosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnidadesEnergeticosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
