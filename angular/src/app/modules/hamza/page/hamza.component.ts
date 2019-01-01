import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/core/services/config.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { Messages } from 'src/app/core/messages';



@Component({
    selector: 'app-hamza',
    templateUrl: 'hamza.component.html'
})

export class HamzaComponent implements OnInit, OnDestroy {

    /**
     *
     */
    constructor(private config: ConfigService, private notificationService: NotificationService, private http: HttpClient, private spinner: SpinnerService, private translator: TranslatorService) {


    }
    ngOnDestroy(): void {


    }
    ngOnInit(): void {


    }

    info() {
        this.notificationService.info("info msg");
    }
    error() {
        this.notificationService.error("error msg");
    }
    warning() {
        this.notificationService.warning("warning msg");
    }
    success() {
        this.notificationService.success("success msg");
    }
    danger() {
        this.notificationService.danger("danger msg");
    }

    errorHttp() {
        this.http.post('http://localhost:100/api', {}).subscribe(
            x => {

            }
        )

    }


    throwException() {
        throw new Error("hamza error");
    }

    language(lang: string) {
        this.config.setTranslationLanguage(lang);
    }
    invalidmsg = 'invalid url';
    language2() {
        this.invalidmsg = this.translator.translate('InvalidUrl')
    }

    throwex() {
        throw new Error(Messages.InvalidEmailOrPassword);
    }

    spin() {

        this.spinner.show();
        setTimeout(() => {
            this.spinner.hide()
        }, 5000);

    }

    spinexception() {
        try {
            this.spinner.show();
            throw new Error('aha');
        } finally {
            // this.spinner.hide();

        }


    }









}
