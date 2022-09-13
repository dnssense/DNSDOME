import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';



// describe('UsersComponent', () => {
//   let component: UsersComponent;
//   let fixture: ComponentFixture<UsersComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       schemas: [CUSTOM_ELEMENTS_SCHEMA],
//       declarations: [ UsersComponent ]
//     })
//     .compileComponents();
//   }));

//   // beforeEach(() => {
//   //   fixture = TestBed.createComponent(UsersComponent);
//   //   component = fixture.componentInstance;
//   //   fixture.detectChanges();
//   // });

//   it('should create', () => {
//     expect(UsersComponent).toBeTruthy();
//   });
// });

describe('UsersComponent (minimal)', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ UsersComponent ]
    });
    const fixture = TestBed.createComponent(UsersComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
  });
});