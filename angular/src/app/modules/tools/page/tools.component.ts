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

  /*   reportDomain() {


            const request = {
                domain: this.domain,
                category: this.sele
            } as Domain2CategorizeRequestV2;

            if (this.comment.trim().length > 0) {
                request.comment = this.comment;
            }
            this.toolsService.sendCategoryRequestV2(body).subscribe(res => {
                if (res) {
                    this.domainForReq = '';
                    this.notification.success('Category request is successfully sent');
                }
            });
        }
    } */
}
