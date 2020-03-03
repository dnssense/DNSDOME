import { Component, OnInit } from '@angular/core';
import { ValidationService } from 'src/app/core/services/validation.service';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { StaticService } from 'src/app/core/services/StaticService';
import { ToolsService, Domain2CategorizeRequestV2 } from 'src/app/core/services/ToolsService';
import { NotificationService } from 'src/app/core/services/notification.service';
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { StaticMessageService } from 'src/app/core/services/StaticMessageService';

@Component({
    selector: 'app-category-request',
    templateUrl: 'category-request.component.html'
})

export class CategoryRequestComponent implements OnInit {

    constructor(
        private staticService: StaticService,
        private toolsService: ToolsService,
        private notificationService: NotificationService,
        private staticMessageService: StaticMessageService
    ) { }

    domain: string;

    category = '';
    categoryOptions: RkSelectModel[] = [];

    comment = '';

    private categories: CategoryV2[] = [];

    ngOnInit() {
        this.getCategories();
    }

    private getCategories() {
        this.staticService.getCategoryList().subscribe(result => {
            this.fillCategoryOptions(result);
        });
    }

    private fillCategoryOptions(categories: CategoryV2[]) {
        this.categories = categories;

        this.categoryOptions = categories.map(x => {
            return {
                displayText: x.name,
                value: x.name
            } as RkSelectModel;
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
            this.notificationService.success(this.staticMessageService.categoryRequestSuccessfullySendedMessage);

            this.domain = '';
            this.comment = '';
            this.category = '';

            this.fillCategoryOptions(this.categories);
        });
    }

}
