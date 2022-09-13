import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdminLayoutComponent } from './adminlayout.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AdminLayoutComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AdminLayoutComponent]
    });
    TestBed.compileComponents();
  });

  it('should create', () => {
    expect(AdminLayoutComponent).toBeTruthy();
  });

  
});
