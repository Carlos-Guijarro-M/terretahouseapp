import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticaPrivacidad } from './politica-privacidad';

describe('PoliticaPrivacidad', () => {
  let component: PoliticaPrivacidad;
  let fixture: ComponentFixture<PoliticaPrivacidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticaPrivacidad],
    }).compileComponents();

    fixture = TestBed.createComponent(PoliticaPrivacidad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
