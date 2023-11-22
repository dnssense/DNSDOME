import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageExceptionsComponent } from './manage-exceptions.component';

describe('ManageRulesComponent', () => {
  let component: ManageExceptionsComponent;
  let fixture: ComponentFixture<ManageExceptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ManageExceptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageExceptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
