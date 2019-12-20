import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { MaterialModule } from 'src/app/material.module';
import { AdminLayoutComponent } from './page/adminlayout.component';
import { AdminLayoutRoutingModule } from './adminlayout-routing.module';
import { NavbarModule } from '../../shared/navbar/navbar.module';
import { FooterModule } from '../../shared/footer/footer.module';
import { SidebarModule } from '../../shared/sidebar/sidebar.module';
import { MdModule } from '../../shared/md/md.module';

@NgModule({
  declarations: [AdminLayoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NouisliderModule,
    TagInputModule,
    MaterialModule,
    AdminLayoutRoutingModule,
    NavbarModule,
    FooterModule,
    SidebarModule,
    MdModule

  ]
})
export class AdminLayoutModule { }
