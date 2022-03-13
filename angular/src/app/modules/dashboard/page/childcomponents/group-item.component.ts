import {Component, EventEmitter, Input, Output} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

export interface GroupItemDom {
  active: boolean
  datatype: 'total' | 'safe' | 'malicious' | 'variable' | 'restricted' | 'harmful'
  name: string
  color: string
  className: string
  val1: number
  val2: number
  description: string
  uitype: number
}

@Component({
  selector: 'app-dashboard-groupitem',
  templateUrl: 'group-item.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class GroupItemComponent {
  constructor(private translateService: TranslateService) {
  }

  @Input() public group: GroupItemDom
  @Output() public onGroupClick = new EventEmitter<GroupItemDom>()
  //region direct ui methodes
  onClick() {
    this.onGroupClick.emit(this.group)
  }
  translate(data: string): string {
    return this.translateService.instant(data)
  }
  getClassName(): string {
    return this.group.className || ''
  }
  //endregion
}
