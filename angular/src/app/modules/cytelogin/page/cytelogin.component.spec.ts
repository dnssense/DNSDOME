import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CyteLoginComponent } from './cytelogin.component';

describe('LoginComponent', () => {
  let component: CyteLoginComponent;
  let fixture: ComponentFixture<CyteLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CyteLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CyteLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
