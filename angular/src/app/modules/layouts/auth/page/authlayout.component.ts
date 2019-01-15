import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/core/services/config.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { TranslatorService } from 'src/app/core/services/translator.service';

@Component({
  selector: 'app-authlayout',
  templateUrl: './authlayout.component.html',
  styleUrls: ['./authlayout.component.sass']
})
export class AuthLayoutComponent implements OnInit {

  constructor(private config: ConfigService, private notification:NotificationService, private translator:TranslatorService) { }

  ngOnInit() {
  }

  language(lang: string) {
    this.config.setTranslationLanguage(lang);
  }
}
