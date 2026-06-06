import { TestBed } from '@angular/core/testing';

import { Complex } from './complex';

describe('Complex', () => {
  let service: Complex;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Complex);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
