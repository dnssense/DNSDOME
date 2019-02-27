import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PagenotfoundModule } from './modules/pagenotfound/pagenotfound.module';
import { AuthenticationService } from './core/services/authentication.service';
import { ConfigService } from './core/services/config.service';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { CookieService } from './core/services/cookie.service';
import { NotificationService } from './core/services/notification.service';
import { AuthGuard } from './core/guards/AuthGuard';
import { AuthLayoutModule } from './modules/layouts/auth/authlayout.module';
import { AdminLayoutModule } from './modules/layouts/admin/adminlayout.module';
import { JwtInterceptor } from './core/interceptors/JwtInterceptor';
import { HttpErrorInterceptor } from './core/interceptors/HttpErrorInterceptor';
import { NotificationModule } from './modules/shared/notification/notification.module';
import { ErrorInterceptor } from './core/interceptors/ErrorInterceptor';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translateHttpLoaderFactory } from './core/translationhelper';
import { NgxUiLoaderModule, NgxUiLoaderRouterModule, NgxUiLoaderHttpModule } from 'ngx-ui-loader';
import {ReCaptchaModule} from "angular2-recaptcha"; 
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { DashBoardService } from './core/services/DashBoardService';
import { SearchSettingService } from './core/services/SearchSettingService';
import { FastReportService } from './core/services/FastReportService';
import { CustomReportService } from './core/services/CustomReportService';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ModalModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AuthLayoutModule,
    AdminLayoutModule,
    PagenotfoundModule,
    AppRoutingModule,
    NotificationModule,
    NgxUiLoaderModule.forRoot({ fgsPosition: 'center-center' }),
    NgxUiLoaderHttpModule.forRoot({ showForeground: true }),
    NgxUiLoaderRouterModule,
    ReCaptchaModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    AuthGuard,
    AuthenticationService,
    SearchSettingService,
    FastReportService,
    CustomReportService,
    ConfigService,
    CookieService,
    BsModalService,
    DashBoardService,
    NotificationService,
    {
      provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true
    },
    {
      provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true
    },
    {
      provide: ErrorHandler, useClass: ErrorInterceptor
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
