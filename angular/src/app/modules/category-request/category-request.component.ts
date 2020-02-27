import { Component, OnInit } from '@angular/core';
import { ValidationService } from 'src/app/core/services/validation.service';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { StaticService } from 'src/app/core/services/StaticService';
import { ToolsService, Domain2CategorizeRequestV2 } from 'src/app/core/services/ToolsService';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
    selector: 'app-category-request',
    templateUrl: 'category-request.component.html'
})

export class CategoryRequestComponent implements OnInit {

    constructor(
        private staticService: StaticService,
        private toolsService: ToolsService,
        private notificationService: NotificationService
    ) { }

    domain: string;

    category = '';
    categoryOptions: RkSelectModel[] = [];

    comment = '';

    ngOnInit() {
        this.getCategories();
    }

    private getCategories() {
        this.staticService.getCategoryList().subscribe(result => {
            this.categoryOptions = result.map(x => {
                return {
                    displayText: x.name,
                    value: x.name
                } as RkSelectModel;
            });
        });
    }

    get getIsValidForm() {
        return ValidationService.isDomainValid(this.domain) && this.category.length > 0;
    }

    sendCategorize() {
        const request = {
            domain: this.domain,
            category: this.category
        } as Domain2CategorizeRequestV2;

        if (this.comment.trim().length > 0) {
            request.comment = this.comment;
        }

        this.toolsService.sendCategoryRequestV2(request).subscribe(result => {
            this.notificationService.success('Category request is successfully sent');
        });
    }

}
