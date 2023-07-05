import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {ConfigHost} from './config.service';
import * as moment from 'moment';
import flatpickr from 'flatpickr';
import { Turkish } from 'flatpickr/dist/l10n/tr';
Turkish.weekdays.shorthand = ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'];
import { english } from 'flatpickr/dist/l10n/default';
@Injectable({
  providedIn: 'root'
})
export class TranslatorService {
  constructor(private translationService: TranslateService) { }
  translate(data: string): string {
    return this.translationService.instant(data);
  }

  translateWithArgs(data: string, params): string {
    return this.translationService.instant(data, params);
  }

  translateCategoryName(data: string) {
    return this.translationService.instant(`CATEGORY.${data}`);
  }

  initLanguages(lang?: string, host?: ConfigHost) {
    let languages;
    if (host?.brand === 'CMERP' || host?.brand === 'DNSSense') {
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
    }
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
    else
      flatpickr.localize(english);
  }
}
