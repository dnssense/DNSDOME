import { Component } from '@angular/core';
import { ToolsService } from 'src/app/core/services/ToolsService';
import { ValidationService } from 'src/app/core/services/validation.service';
import { CategoryQuery } from 'src/app/core/models/CategoryQuery';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
    selector: 'app-tools',
    templateUrl: 'tools.component.html',
    styleUrls: ['tools.component.sass']
})
export class ToolsComponent {

    constructor(
        private toolsService: ToolsService,
        private formBuilder: FormBuilder,
        private notification: NotificationService
    ) {
        this.searchForm = this.formBuilder.group({
            'domain': ['', [Validators.required]]
        });
    }

    searchForm: FormGroup;
    isDomain: boolean;
    isDomainForReq: boolean;
    domain: string;
    domainForReq: string;
    categoryQuery: CategoryQuery;

    checkDomain(type: string) {
        if (type === 'category') {
            if (String(this.domain).toLowerCase().startsWith('http')) {
                this.domain = String(this.domain).toLowerCase().replace('http://', '').replace('https://', '');
            }
            this.isDomain = ValidationService.domainValidationWithoutTLD(this.domain);
        } else {
            let res = true;
            const l = this.domainForReq.split(',').length;
            if (l > 5) {
                this.notification.warning('You can report 5 domains per request');
                this.isDomainForReq = false;
            } else {
                for (let i = 0; i < l; i++) {
                    let f = this.domainForReq.split(',')[i];
                    if (String(f).toLowerCase().startsWith('http')) {
                        f = String(f).toLowerCase().replace('http://', '').replace('https://', '');
                    }
                    res = ValidationService.domainValidationWithoutTLD(f);
                    if (!res) {
                        break;
                    }
                } this.isDomainForReq = res;
            }
        }
    }

    searchCategory() {
        if (this.isDomain) {
            this.toolsService.searchCategory(this.domain).subscribe(res => {
                this.categoryQuery = res;
                this.categoryQuery.domain = this.domain;
                this.domain = '';
            });
        }
    }

    reportDomain() {
        const body: string[] = [];

        this.domainForReq.split(',').forEach(f => body.push(f));

        let check = true;

        for (let i = 0; i < body.length; i++) {
            if (body.indexOf(body[i]) !== body.lastIndexOf(body[i])) {
                this.notification.warning('Entered list contains duplicate domains');
                check = false;
                break;
            }
        }

        if (check) {
            this.toolsService.sendCategoryRequest(body).subscribe(res => {
                if (res) {
                    this.domainForReq = '';
                    this.notification.success('Category request is successfully sent');
                }
            });
        }
    }
}
