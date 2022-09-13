import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreatetparentconfirmComponent } from './createtparentconfirm.component';

describe('CreatetparentconfirmComponent', () => {
  let component: CreatetparentconfirmComponent;
  let fixture: ComponentFixture<CreatetparentconfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatetparentconfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatetparentconfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
