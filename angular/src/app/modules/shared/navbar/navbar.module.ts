import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { MatButtonModule } from '@angular/material/button';
import { IconsModule, RkAvatarModule, RkMenuModule, RkModalModule } from 'roksit-lib';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { HttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule,
    IconsModule,
    RkAvatarModule,
    NgbModule,
    RkMenuModule,
    BsDropdownModule.forRoot(),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RkModalModule
  ],
  declarations: [NavbarComponent],
  exports: [NavbarComponent]
})

export class NavbarModule { }
