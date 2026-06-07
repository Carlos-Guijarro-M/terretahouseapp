import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetearPassword } from './resetear-password';

describe('ResetearPassword', () => {
  let component: ResetearPassword;
  let fixture: ComponentFixture<ResetearPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetearPassword],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetearPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
