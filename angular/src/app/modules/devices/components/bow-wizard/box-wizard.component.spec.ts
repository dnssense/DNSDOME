/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BoxWizardComponent } from './box-wizard.component';

describe('TimeProfileComponent', () => {
  let component: BoxWizardComponent;
  let fixture: ComponentFixture<BoxWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
