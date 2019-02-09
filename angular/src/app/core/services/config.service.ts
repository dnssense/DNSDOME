import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { TranslatorService } from './translator.service';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private translationservice: TranslatorService) {
    console.log('constructor configservice');
  }

  init() {
    this.translationservice.initLanguages();
  }

  getApiUrl(): string {

    return environment.production ? window.location.protocol + "//" + window.location.hostname + (window.location.port != "" ? (":" + window.location.port) : "") + "/services" : "https://management.dnssense.com/services";
  }
  setDefaultLanguage(lang: string) {
    this.translationservice.setDefaultLang(lang);
  }
  getTranslationLanguage() {
    return this.translationservice.getCurrentLang();
  }

  setTranslationLanguage(lang: string) {
    this.translationservice.use(lang);
  }

}
