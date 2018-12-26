import { Component, OnInit } from '@angular/core';

import {FormControl, FormGroupDirective, NgForm, Validators, FormGroup} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { FormBuilder, AbstractControl } from '@angular/forms';
import { PasswordValidation } from './password-validator.component';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { CompileTemplateMetadata } from '@angular/compiler';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}


@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html'
})

export class LoginComponent {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  
  validEmailLogin: boolean = false;
  validPasswordLogin: boolean = false;



  matcher = new MyErrorStateMatcher(); 
  login : FormGroup;
  

  email:string;
  password:string;

  constructor(private formBuilder: FormBuilder,private authentication:AuthenticationService) {}

   isFieldValid(form: FormGroup, field: string) {
     return !form.get(field).valid && form.get(field).touched;
   }

   displayFieldCss(form: FormGroup, field: string) {
     return {
       'has-error': this.isFieldValid(form, field),
       'has-feedback': this.isFieldValid(form, field)
     };
   }

   
   onLogin() {
     if (this.login.valid) {
       this.authentication.authenticate(this.email,this.password).subscribe(
        {
          //todo:
          next(user){ console.log(user);},
          error(msg){console.log(msg)},
          complete(){console.log('completed')}
          
        }
       );
     } else {
       this.validateAllFormFields(this.login);
     }
   }
  
   validateAllFormFields(formGroup: FormGroup) {
     Object.keys(formGroup.controls).forEach(field => {
       const control = formGroup.get(field);
       if (control instanceof FormControl) {
         control.markAsTouched({ onlySelf: true });
       } else if (control instanceof FormGroup) {
         this.validateAllFormFields(control);
       }
     });
   }
  ngOnInit() {
     
     this.login = this.formBuilder.group({
       // To add a validator, we must first convert the string value into an array. The first item in the array is the default value if any, then the next item in the array is the validator. Here we are adding a required validator meaning that the firstName attribute must have a value in it.
       email: [null, [Validators.required,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
       // We can use more than one validator per field. If we want to use more than one validator we have to wrap our array of validators with a Validators.compose function. Here we are using a required, minimum length and maximum length validator.
       password: ['', Validators.required]
    });
       
  }

 

  emailValidationLogin(e){
    
    this.email=e;
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(e).toLowerCase())) {
        this.validEmailLogin= true;
    } else {
      this.validEmailLogin = false;
    }
  }
  passwordValidationLogin(e){
    
    this.password=e;
      if (e.length > 5) {
          this.validPasswordLogin = true;
      }else{
        this.validPasswordLogin = false;
      }
  }


 

}
