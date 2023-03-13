import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule, RkColorModule } from 'roksit-lib';
import { ThemeComponent } from './theme.component';
import { ThemeRoutingModule } from './theme-routing.module';

@NgModule({
    declarations: [
        ThemeComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        ThemeRoutingModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: translateHttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        IconsModule,
        RkColorModule
    ]

})
export class ThemeModule { }
