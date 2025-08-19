import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergeticosComponent } from './energeticos.component';

describe('EnergeticosComponent', () => {
  let component: EnergeticosComponent;
  let fixture: ComponentFixture<EnergeticosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnergeticosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnergeticosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
