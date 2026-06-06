import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetail } from './admin-detail';

describe('AdminDetail', () => {
  let component: AdminDetail;
  let fixture: ComponentFixture<AdminDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
