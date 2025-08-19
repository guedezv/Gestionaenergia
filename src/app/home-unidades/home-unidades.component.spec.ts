import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeUnidadesComponent } from './home-unidades.component';

describe('HomeUnidadesComponent', () => {
  let component: HomeUnidadesComponent;
  let fixture: ComponentFixture<HomeUnidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeUnidadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeUnidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
