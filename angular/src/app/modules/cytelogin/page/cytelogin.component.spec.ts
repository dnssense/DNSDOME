import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CyteLoginComponent } from './cytelogin.component';

describe('LoginComponent', () => {
  let component: CyteLoginComponent;
  let fixture: ComponentFixture<CyteLoginComponent>;

  beforeEach(waitForAsync(() => {
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
