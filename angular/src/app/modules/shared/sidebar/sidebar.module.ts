import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { IconsModule } from 'roksit-lib';
import { HttpClient } from '@angular/common/http';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        IconsModule,
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
