import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

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
import { DashBoardService } from './core/services/dashBoardService';
import { MonitorService } from './core/services/monitorService';
import { NotificationService } from './core/services/notification.service';

import { translateHttpLoaderFactory } from './core/translationhelper';
import { AdminLayoutModule } from './modules/layouts/admin/adminlayout.module';
import { AuthLayoutModule } from './modules/layouts/auth/authlayout.module';
import { PagenotfoundModule } from './modules/pagenotfound/pagenotfound.module';
import { NotificationModule } from './modules/shared/notification/notification.module';
import { RoksitModule, ServicesModule } from 'roksit-lib';
import { NotificationApiService } from './core/services/notification-api.service';
import { RecaptchaModule } from 'ng-recaptcha';
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AuthLayoutModule,
    AdminLayoutModule,
    PagenotfoundModule,
    AppRoutingModule,
    NotificationModule,
    NgxUiLoaderModule.forRoot({ fgsPosition: 'center-center', minTime: 100}),
    NgxUiLoaderHttpModule.forRoot({ showForeground: true, excludeRegexp: ['\/api\/oauth\/', '\/api\/user\/current\/', '\/api\/user\/current\/role', '\/websocket']  }),
    NgxUiLoaderRouterModule,
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    PopoverModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    RecaptchaModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    RoksitModule.forRoot(),
    ServicesModule.forRoot()
  ],
  providers: [
    AuthGuard,
    AuthenticationService,
ConfigService,
    CookieService,
    BsModalService,
    DashBoardService,
    NotificationService,
    TranslateService,
    MonitorService,
    NotificationApiService,
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
