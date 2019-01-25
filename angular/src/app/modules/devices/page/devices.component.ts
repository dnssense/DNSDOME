import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/core/services/config.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { Messages } from 'src/app/core/messages';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { FormBuilder, FormGroup } from '@angular/forms';

declare var $: any;
declare interface Device {
    title: string;
    macid: string;
    checked: boolean;
}

@Component({
    selector: 'app-devices',
    templateUrl: 'devices.component.html'
})
export class DevicesComponent implements OnInit, OnDestroy {

    public devices: Device[];

    constructor(private auth: AuthenticationService, private config: ConfigService, private notificationService: NotificationService,
        private http: HttpClient, private spinner: SpinnerService, private translator: TranslatorService,
        private formBuilder: FormBuilder) {


    }
    ngOnDestroy(): void {

    }

    ngOnInit() {
        this.devices = [
            { title: 'Device 1', macid: '00:0a:95:9d:68:11', checked: false },
            { title: 'Device 2', macid: '00:0a:95:9d:68:12', checked: true },
            { title: 'Device 3', macid: '00:0a:95:9d:68:13', checked: true },
            { title: 'Device 4', macid: '00:0a:95:9d:68:14', checked: false }
        ];

    }

}
