import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { MatButtonModule } from '@angular/material';
import { IconsModule, RkAvatarModule } from 'roksit-lib';
@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        MatButtonModule,
        IconsModule,
        RkAvatarModule
    ],
    declarations: [NavbarComponent],
    exports: [NavbarComponent]
})

export class NavbarModule { }
