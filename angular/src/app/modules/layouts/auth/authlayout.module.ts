import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { SelectModule } from 'ng2-select';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { AuthLayoutComponent } from './page/authlayout.component';
import { AuthLayoutRoutingModule } from './authlayout-routing.module';
import { LoginComponent } from '../../login/page/login.component';
import { FieldErrorDisplayComponent } from '../../login/components/field-error-display/field-error-display.component';

@NgModule({
  declarations: [AuthLayoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule,
    AuthLayoutRoutingModule
  ]
})
export class AuthLayoutModule { }
