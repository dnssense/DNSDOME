import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
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
    NouisliderModule,
    TagInputModule,
    MaterialModule,
    AuthLayoutRoutingModule
  ]
})
export class AuthLayoutModule { }
