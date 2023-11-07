import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';
import { AdminLayoutComponent } from './page/adminlayout.component';
import { AdminLayoutRoutingModule } from './adminlayout-routing.module';
import { FooterModule } from '../../shared/footer/footer.module';
import { MdModule } from '../../shared/md/md.module';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import {
  RkNavbarComponent,
  RkSidebarComponent
} from 'roksit-lib';


@NgModule({
  declarations: [AdminLayoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TagInputModule,
    AdminLayoutRoutingModule,
    FooterModule,
    MdModule,
    RkNavbarComponent,
    RkSidebarComponent,
    TranslateModule,
    FeatherModule
  ]
})
export class AdminLayoutModule { }
