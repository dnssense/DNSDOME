import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslatorService {
  constructor(private translationService: TranslateService) {

  }
  translate(data: string): string {
    return this.translationService.instant(data);
  }

  initLanguages() {

    this.translationService.addLangs(['en']);
    this.translationService.setDefaultLang('en');

    const browserLang = this.translationService.getBrowserLang();
    this.translationService.use('en'); //browserLang.match(/en|tr/) ? browserLang : 'en');

  }

  use(lang: string): any {
    this.translationService.use(lang);
  }
  getCurrentLang(): any {
    return this.translationService.currentLang;
  }
  setDefaultLang(lang: string): any {
    this.translationService.setDefaultLang(lang);
  }
}
