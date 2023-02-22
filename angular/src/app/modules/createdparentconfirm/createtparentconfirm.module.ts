import {NgModule} from '@angular/core';
import { CreatetparentconfirmComponent } from './page/createtparentconfirm/createtparentconfirm.component';
import {CreatetparentconfirmRoutingModule} from './createtparentconfirm-routing.module';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {translateHttpLoaderFactory} from '../../core/translationhelper';
import {HttpClient} from '@angular/common/http';
import {FooterModule} from "../shared/footer/footer.module";
import {ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {RecaptchaModule} from "ng-recaptcha";
import {RkSelectModule} from "roksit-lib";

@NgModule({
  declarations: [CreatetparentconfirmComponent],
  imports: [
    CreatetparentconfirmRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    FooterModule,
    ReactiveFormsModule,
    CommonModule,
    RecaptchaModule,
    RkSelectModule
  ]
})
export class CreatetparentconfirmModule { }
