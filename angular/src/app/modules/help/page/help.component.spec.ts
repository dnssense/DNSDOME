import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpComponent } from './help.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


describe('HelpComponent (minimal)', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      declarations: [ HelpComponent ]
    });
    const fixture = TestBed.createComponent(HelpComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
  });
});
