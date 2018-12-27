import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NouisliderModule } from 'ng2-nouislider';
import { TagInputModule } from 'ngx-chips';
import { SelectModule } from 'ng2-select';
import { MaterialModule } from 'src/app/shared/components/material.module';
import { AdminLayoutComponent } from './page/adminlayout.component';
import { AdminLayoutRoutingModule } from './adminlayout-routing.module';


import { FixedpluginModule } from '../../shared/fixedplugin/fixedplugin.module';
import { NavbarModule } from '../../shared/navbar/navbar.module';
import { FooterModule } from '../../shared/footer/footer.module';
import { SidebarModule } from '../../shared/sidebar/sidebar.module';
import { MdModule } from '../../shared/md/md.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';





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
    FixedpluginModule,
    NavbarModule,
    FooterModule,
    SidebarModule,
    MdModule,
    
    

  ]
})
export class AdminLayoutModule { }
