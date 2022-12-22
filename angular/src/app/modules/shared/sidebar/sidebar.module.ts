import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { IconsModule, RkMenuModule } from 'roksit-lib';
import { HttpClient } from '@angular/common/http';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        IconsModule,
        RkMenuModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: translateHttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    ],
    declarations: [SidebarComponent],
    exports: [SidebarComponent]
})

export class SidebarModule { }
