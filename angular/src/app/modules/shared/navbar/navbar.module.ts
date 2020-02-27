import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { MatButtonModule } from '@angular/material/button';
import { IconsModule, RkAvatarModule } from 'roksit-lib';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap';

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        MatButtonModule,
        IconsModule,
        RkAvatarModule,
        NgbModule,
        BsDropdownModule.forRoot(),
    ],
    declarations: [NavbarComponent],
    exports: [NavbarComponent]
})

export class NavbarModule { }
