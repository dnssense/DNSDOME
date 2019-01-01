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
    return environment.production ? "https://management.dnssense.com" : "http://localhost:4200";
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
