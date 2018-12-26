import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule }    from '@angular/forms';
import { NgModule } from '@angular/core';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModule } from './modules/login/login.module';
import { PagenotfoundModule } from './modules/pagenotfound/pagenotfound.module';
import { AuthenticationService } from './core/services/authentication.service';
import { ConfigService } from './core/services/config.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from './core/services/cookie.service';



@NgModule({
  declarations: [
    AppComponent
    
    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LoginModule,
    PagenotfoundModule,
    AppRoutingModule
  ],
  providers: [AuthenticationService,ConfigService,CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
