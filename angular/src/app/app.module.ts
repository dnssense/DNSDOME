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
import { environment } from 'src/environments/environment';
import { NotificationService } from './core/services/notification.service';
import { AuthGuard } from './core/guards/AuthGuard';
import { AuthLayoutModule } from './modules/layouts/auth/authlayout.module';
import { AdminLayoutModule } from './modules/layouts/admin/adminlayout.module';
import { FixedpluginModule } from './modules/shared/fixedplugin/fixedplugin.module';
import { NavbarModule } from './modules/shared/navbar/navbar.module';
import { FooterModule } from './modules/shared/footer/footer.module';
import { JwtInterceptor } from './core/interceptors/JwtInterceptor';
import { HttpErrorInterceptor } from './core/interceptors/HttpErrorInterceptor';
import { NotificationModule } from './modules/shared/notification/notification.module';
import { ErrorInterceptor } from './core/interceptors/ErrorInterceptor';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { translateHttpLoaderFactory } from './core/translationhelper';
import { NgxUiLoaderModule, NgxUiLoaderRouterModule, NgxUiLoaderHttpModule, NgxUiLoaderConfig, POSITION, SPINNER, PB_DIRECTION, NgxUiLoaderHttpConfig } from 'ngx-ui-loader';


@NgModule({
  declarations: [
    AppComponent
  ],
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
    ConfigService,
    CookieService,
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
