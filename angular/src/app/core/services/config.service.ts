import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private translation:TranslateService) {
    console.log('constructor configservice');
      
   
   }
   initLanguages(){
    this.translation.addLangs(['en','tr']);
    this.translation.setDefaultLang('en');

    const browserLang = this.translation.getBrowserLang();
    this.translation.use(browserLang.match(/en|tr/) ? browserLang : 'en'); 
   }

  getApiUrl():string{
    return environment.production?"https://management.dnssense.com/api":"http://localhost:4200/api";
  }
  setDefaultLanguage(lang:string){
    this.translation.setDefaultLang(lang);
  }
  getTranslationLanguage(){
    return this.translation.currentLang;;
  }

  setTranslationLanguage(lang:string){
    
    this.translation.use(lang);
  }
  getTranslator():TranslateService{
    return this.translation;
  }
}
