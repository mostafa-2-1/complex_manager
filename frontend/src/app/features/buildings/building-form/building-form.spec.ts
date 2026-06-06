import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingForm } from './building-form';

describe('BuildingForm', () => {
  let component: BuildingForm;
  let fixture: ComponentFixture<BuildingForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingForm],
    }).compileComponents();

    fixture = TestBed.createComponent(BuildingForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
