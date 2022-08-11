import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';
import { MaterialModule } from 'src/app/material.module';
import { AuthLayoutComponent } from './page/authlayout.component';
import { AuthLayoutRoutingModule } from './authlayout-routing.module';

@NgModule({
  declarations: [AuthLayoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TagInputModule,
    MaterialModule,
    AuthLayoutRoutingModule
  ]
})
export class AuthLayoutModule { }
