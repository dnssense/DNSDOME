import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AnomalyDetectionComponent } from './page/anomaly-detection.component';
import { IconsModule, RkProgressBarModule } from 'roksit-lib';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from 'src/app/core/translationhelper';
import { TagInputModule } from 'ngx-chips';

const route: Routes = [{ path: '', component: AnomalyDetectionComponent }];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(route),
        IconsModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: translateHttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        RkProgressBarModule,
        TagInputModule
    ],
    exports: [],
    declarations: [
        AnomalyDetectionComponent
    ],
    providers: [],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AnomalyDetectionModule { }
