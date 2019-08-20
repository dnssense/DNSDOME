import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolsComponent } from './tools.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ToolsComponent', () => {
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ToolsComponent]
    })
      .compileComponents();
  }));

  
  it('should create', () => {
    expect(ToolsComponent).toBeDefined();
  });
});
