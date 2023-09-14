import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import {MissingTranslationHandler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { RecaptchaModule } from 'ng-recaptcha';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import {NgxUiLoaderConfig, NgxUiLoaderHttpModule, NgxUiLoaderModule, NgxUiLoaderRouterModule} from 'ngx-ui-loader';
import {
  ApplicationService,
  CategoryService, ProductLicenceService,
  RkNotificationModule,
  RkTranslatorService,
  ServicesModule
} from 'roksit-lib';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorInterceptor } from './core/interceptors/ErrorInterceptor';
import { HttpErrorInterceptor } from './core/interceptors/HttpErrorInterceptor';
import { JwtInterceptor } from './core/interceptors/JwtInterceptor';
import { translateHttpLoaderFactory } from './core/translationhelper';
import { ClipboardModule } from 'ngx-clipboard';
import {RkTranslationHandler, TranslatorService} from './core/services/translator.service';
import {CacheableCategoryServiceImpl} from './core/services/cacheable-categories.service';
import {CacheableApplicationServiceImpl} from './core/services/cacheable-application.service';
import {ProductLicenceServiceImpl} from "./core/services/product-licence.service";
const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  logoUrl: '/assets/img/DNSDome Logo Reveal.svg',
  minTime: 100,
  fgsColor: '#507df3',
  pbColor: '#507df3'
};


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgxUiLoaderHttpModule.forRoot({
      showForeground: true,
      excludeRegexp: [
        '\/api\/oauth\/token$',
        '\/api\/user\/current$',
        '\/api\/user\/current\/role$',
        '\/websocket$',
        '\/api\/investigation\/v1']
    }),
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
      },
      missingTranslationHandler: {provide: MissingTranslationHandler, useClass: RkTranslationHandler}
    }),
    ServicesModule.forRoot(),
    NgIdleKeepaliveModule.forRoot(),
    ClipboardModule,
    RkNotificationModule
  ],
  providers: [
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
    },
    { provide: RkTranslatorService, useClass: TranslatorService },
    { provide: CategoryService, useClass: CacheableCategoryServiceImpl },
    { provide: ApplicationService, useClass: CacheableApplicationServiceImpl },
    { provide: ProductLicenceService, useClass: ProductLicenceServiceImpl },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
