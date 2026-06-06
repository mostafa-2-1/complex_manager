import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexDetail } from './complex-detail';

describe('ComplexDetail', () => {
  let component: ComplexDetail;
  let fixture: ComponentFixture<ComplexDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplexDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplexDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
