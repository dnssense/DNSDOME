import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthLayoutComponent } from './page/authlayout.component';
import { AuthLayoutRoutingModule } from './authlayout-routing.module';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [AuthLayoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    AuthLayoutRoutingModule
  ]
})
export class AuthLayoutModule { }
