import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReCaptchaModule } from 'angular2-recaptcha';
import {
  BsDropdownModule, BsModalService, CollapseModule, ModalModule, PaginationModule,
  PopoverModule, TabsModule, TooltipModule
} from 'ngx-bootstrap';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule, NgxUiLoaderRouterModule } from 'ngx-ui-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './core/guards/AuthGuard';
import { ErrorInterceptor } from './core/interceptors/ErrorInterceptor';
import { HttpErrorInterceptor } from './core/interceptors/HttpErrorInterceptor';
import { JwtInterceptor } from './core/interceptors/JwtInterceptor';
import { AuthenticationService } from './core/services/authentication.service';
import { ConfigService } from './core/services/config.service';
import { CookieService } from './core/services/cookie.service';
import { DashBoardService } from './core/services/DashBoardService';
import { MonitorService } from './core/services/MonitorService';
import { NotificationService } from './core/services/notification.service';
import { SearchSettingService } from './core/services/SearchSettingService';
import { translateHttpLoaderFactory } from './core/translationhelper';
import { AdminLayoutModule } from './modules/layouts/admin/adminlayout.module';
import { AuthLayoutModule } from './modules/layouts/auth/authlayout.module';
import { PagenotfoundModule } from './modules/pagenotfound/pagenotfound.module';
import { NotificationModule } from './modules/shared/notification/notification.module';
import { RoksitModule } from 'roksit-lib';
@NgModule({
  declarations: [AppComponent],
  imports: [
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
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    PopoverModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    ReCaptchaModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RoksitModule
  ],
  providers: [
    AuthGuard,
    AuthenticationService,
    SearchSettingService,
    ConfigService,
    CookieService,
    BsModalService,
    DashBoardService,
    NotificationService,
    TranslateService,
    MonitorService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: ErrorInterceptor
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
