import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {GroupItemDom} from "./group-item.component";
import {Aggregation} from "../../../../core/models/report";

@Component({
  selector: 'app-dashboard-group',
  templateUrl: 'group.component.html',
  styleUrls: ['../dashboard.component.scss']
})
export class GroupComponent implements OnInit{
  constructor() {
  }
  @Input() public groups:GroupItemDom[]
  @Output() public onGroupChange = new EventEmitter<GroupItemDom>()
  ngOnInit() {
    this.initFillData()
  }

  //region initialization
  initFillData() {
    this.groups = [
      {
        active: true,
        datatype: 'total',
        name: 'Total',
        color: '#4353ff',
        className: 'blue',
        val1: 0,
        val2: 0,
        description: 'DASHBOARD.TotalDnsRequestCount',
        uitype: 1
      },
      {
        active: false,
        datatype: 'safe',
        name: 'Safe',
        color: '#3dd49a',
        className: 'green',
        val1: 0,
        val2: 0,
        description: 'SafeDescription',
        uitype: 2
      },
      {
        active: false,
        datatype: 'malicious',
        name: 'Malicious',
        color: '#f95656',
        className: 'red',
        val1: 0,
        val2: 0,
        description: 'MaliciousDescription',
        uitype: 2
      },
      {
        active: false,
        datatype: 'variable',
        name: 'Variable',
        color: '#A0AAB7',
        className: 'gray',
        val1: 0,
        val2: 0,
        description: 'VariableDescription',
        uitype: 2
      },
      {
        active: false,
        datatype: 'restricted',
        name: 'HarmfullContent',
        color: '#EFBB1E',
        className: 'yellow',
        val1: 0,
        val2: 0,
        description: 'HarmfulDescription',
        uitype: 2
      }
    ]
  }
  //endregion
  //region direct ui methodes
  onChangeVal(it: GroupItemDom) {
    this.onGroupChange.emit(it)
    this.groups.forEach(group=> {
      group.active = false
    })
    it.active = true
  }
  //endregion

  setDataGroup(groups: {items: Aggregation[]},total:{allow: number, block: number}) {
    let totalHit = total.allow + total.block
    this.groups.forEach(g=>{
      g.val1 = 0
      g.val2 = 0
      if (g.datatype == 'total') {
        g.val1= total.allow
        g.val2 = total.block
      }
    })
    groups.items.forEach(g=> {
      if (g.name == "harmful") {
        g.name = 'restricted'
      }
      let item = this.groups.find(it=>it.datatype == g.name)
      if (item) {
        let ratio = Math.floor((100 * g.hit) / totalHit)
        item.val1 = g.hit
        item.val2 = ratio
      }
    })
  }
}

