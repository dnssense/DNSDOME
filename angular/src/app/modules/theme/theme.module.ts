import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { AmazingTimePickerModule } from 'amazing-time-picker';
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
        NouisliderModule,
        MaterialModule,
        ThemeRoutingModule,
        AmazingTimePickerModule,
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
