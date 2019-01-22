import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/core/services/config.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { Messages } from 'src/app/core/messages';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { FormBuilder, FormGroup } from '@angular/forms';



@Component({
    selector: 'app-reports',
    templateUrl: 'reports.component.html'
})
export class ReportsComponent implements OnInit, OnDestroy {
    searchForm: FormGroup;
    topSlider = 250;
    time: number;
    query: string;
    refreshOff: number;
    constructor(private auth: AuthenticationService, private config: ConfigService, private notificationService: NotificationService,
        private http: HttpClient, private spinner: SpinnerService, private translator: TranslatorService,
        private formBuilder: FormBuilder) {

        this.searchForm = this.formBuilder.group({
            "time": ["", []],
            "query": ["", []],
            "refreshOff": ["", []],
            "type": ["", []],
            "slider": ["", []],
        });

    }
    ngOnDestroy(): void {

    }
    ngOnInit(): void {

    }

    search() {

        this.notificationService.info("submite basıldı slider:" + this.topSlider +
            "-query:" + this.query +
            "-time: " + this.time + 
            "-refreshOff: " + this.refreshOff);
    }






}
