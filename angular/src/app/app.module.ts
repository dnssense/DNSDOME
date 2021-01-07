import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { RecaptchaModule } from 'ng-recaptcha';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule, NgxUiLoaderRouterModule } from 'ngx-ui-loader';
import { RoksitModule, ServicesModule } from 'roksit-lib';
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
import { NotificationApiService } from './core/services/notification-api.service';
import { NotificationService } from './core/services/notification.service';
import { translateHttpLoaderFactory } from './core/translationhelper';
import { AdminLayoutModule } from './modules/layouts/admin/adminlayout.module';
import { AuthLayoutModule } from './modules/layouts/auth/authlayout.module';
import { PagenotfoundModule } from './modules/pagenotfound/pagenotfound.module';
import { NotificationModule } from './modules/shared/notification/notification.module';
import { ClipboardModule } from 'ngx-clipboard';


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
    NgxUiLoaderModule.forRoot({ fgsPosition: 'center-center', minTime: 100, fgsType: 'ball-scale-multiple', fgsColor: '#507df3', pbColor: '#507df3' }),
    NgxUiLoaderHttpModule.forRoot({ showForeground: true, excludeRegexp: ['\/api\/oauth\/token$', '\/api\/user\/current$', '\/api\/user\/current\/role$', '\/websocket$'] }),
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
    ServicesModule.forRoot(),
    NgIdleKeepaliveModule.forRoot(),
    ClipboardModule
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
