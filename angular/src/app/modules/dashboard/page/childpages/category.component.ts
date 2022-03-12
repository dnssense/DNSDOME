import {Component} from "@angular/core";

@Component({
  selector: 'app-dashboard-category',
  templateUrl: 'category.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class CategoryComponent {
  constructor() {
  }
  selectedCategory: string = "Total"
  currentGroup: ''
  theme: any = 'light';

  //region direct ui methodes
  getCategoryName() {

  }
  //endregion

}
