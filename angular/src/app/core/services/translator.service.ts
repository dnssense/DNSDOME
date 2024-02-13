import { Injectable } from '@angular/core';
import {MissingTranslationHandler, MissingTranslationHandlerParams, TranslateService} from '@ngx-translate/core';
import {ConfigHost} from './config.service';
import * as moment from 'moment';
import flatpickr from 'flatpickr';
import { Turkish } from 'flatpickr/dist/l10n/tr';
Turkish.weekdays.shorthand = ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'];
import { english } from 'flatpickr/dist/l10n/default';
import { Russian } from 'flatpickr/dist/l10n/ru';
import {RkTranslatorService} from 'roksit-lib';
@Injectable({
  providedIn: 'root'
})
export class TranslatorService implements RkTranslatorService {
  constructor(private translationService: TranslateService) { }
  translate(data: string, params?: object): string {
    return this.translationService.instant(data, params);
  }

  translateWithArgs(data: string, params): string {
    return this.translationService.instant(data, params);
  }

  translateCategoryName(data: string) {
    return this.translationService.instant(`CATEGORY.${data}`);
  }

  initLanguages(lang?: string, host?: ConfigHost) {
    const languages = ['en'];
    const selectedLang = 'en';
    /*if (host?.brand === 'CMERP' || host?.brand === 'DNSSense') {
      languages = ['en'];
    } else {
      languages = ['en', 'tr'];
    }
    languages.forEach(x => {
      this.translationService.addLangs([x]);
    });


    this.translationService.setDefaultLang(languages[0]);

    const browserLang = this.translationService.getBrowserLang();
    let selectedLang;
    if (!lang) {
      selectedLang = languages.find(x => x === browserLang) ? browserLang : languages[0];
    } else {
      selectedLang = languages.find(x => x === lang);
    }*/
    if (selectedLang) {
      this.translationService.use(selectedLang);
      this.setCalendarLang(selectedLang);
    } else {
      this.translationService.use(languages[0]);
      this.setCalendarLang(selectedLang);
    }

  }

  use(lang: string): any {
    this.translationService.use(lang);
    moment.locale(lang);
    this.setCalendarLang(lang);
  }
  getCurrentLang(): any {
    return this.translationService.currentLang;
  }
  setDefaultLang(lang: string): any {
    this.translationService.setDefaultLang(lang);
  }
  setCalendarLang(lang: string) {
    if (lang === 'tr')
      flatpickr.localize(Turkish);
    else if(lang === 'ru')
      flatpickr.localize(Russian);
    else
      flatpickr.localize(english);
  }
}

export class RkTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    console.warn('MISSINGTRANSLATION:', `[${params.translateService.currentLang}]`, params.key);

    let key;
    return (key = params.key.split('.'))[1] || key[0];
  }
}
