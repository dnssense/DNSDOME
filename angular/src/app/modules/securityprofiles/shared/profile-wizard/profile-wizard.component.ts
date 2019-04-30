import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NotificationService } from 'src/app/core/services/notification.service';
import { StaticService } from 'src/app/core/services/StaticService';
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { Agent } from 'src/app/core/models/Agent';
import { ApplicationV2 } from 'src/app/core/models/ApplicationV2';

declare var $: any;

export class categoryItem {
  constructor(public category: CategoryV2, public isBlocked: boolean) { }

}

export class applicationItem {
  constructor(public application: ApplicationV2, public isBlocked: boolean) { }
}

@Component({
  selector: 'app-profile-wizard',
  templateUrl: './profile-wizard.component.html',
  styleUrls: ['./profile-wizard.component.sass']
})
export class ProfileWizardComponent implements OnInit {

  categoryList: categoryItem[] = [];
  applicationList: applicationItem[] = [];
  public _selectedAgent: Agent;

  @Input() set selectedAgent(value: Agent) {
    this._selectedAgent = value;
  }
  get selectedAgent(): Agent {
    return this._selectedAgent;
  }

  @Output() public saveEmitter = new EventEmitter();

  constructor(private notification: NotificationService, private formBuilder: FormBuilder,
    private staticService: StaticService) {

    this.staticService.getCategoryList().subscribe(res => {
      res.forEach(r => {
        this.categoryList.push(new categoryItem(r, false));
      });
      console.log(this.categoryList);
    });

    this.staticService.getApplicationList().subscribe(res => {
      res.forEach(r => {
        this.applicationList.push(new applicationItem(r, false));
      });
      console.log(this.applicationList);

    });

  }

  ngOnInit() {

  }

  checkKeyboardEventForIP(event: KeyboardEvent, inputValue: string) {

    let allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "Backspace", "ArrowLeft", "ArrowRight", "."];
    let isValid: boolean = false;

    for (let i = 0; i < allowedChars.length; i++) {
      if (allowedChars[i] == event.key) {
        isValid = true;
        break;
      }
    }
    if (inputValue && (event.key != 'Backspace' && event.key != 'ArrowLeft' && event.key != 'ArrowRight')) {
      if (event.key != '.') {
        inputValue += event.key;
      }
      let lastOcletStr = inputValue.substring(inputValue.lastIndexOf('.') + 1);
      let lastOclet = Number(lastOcletStr);
      if (isValid && (lastOclet > 255 || lastOclet < 0 || lastOcletStr.length > 3)) {
        isValid = false;
      }
      if (isValid && event.key == '.') {
        let oclets: string[] = inputValue.split('.');
        for (let i = 0; i < oclets.length; i++) {
          const oclet = oclets[i];
          if (Number(oclet) < 0 || Number(oclet) > 255) {
            isValid = false;
            break;
          }
        }
      }

      if (isValid && ((inputValue.length == 2 && inputValue == '10' && event.key == '.') ||
        inputValue == '192.168' || inputValue == '127.0.0.1')) {
        isValid = false;
        this.notification.warning('Please enter a valid Public IP Adress!', false);
      }

      if (isValid && inputValue.length >= 4 && (inputValue.substring(0, 4) == '172.')) {

        let secondOcletStr = inputValue.substring(inputValue.indexOf('.') + 1);
        let secondOclet = Number(secondOcletStr);
        if (secondOclet >= 16 && secondOclet <= 31) {
          isValid = false;
          this.notification.warning('Please enter a valid Public IP Adress!', false);
        }
      }

      if (isValid && event.key == '.' && (inputValue.endsWith('.') || inputValue.split('.').length >= 4)) {
        isValid = false;
      }
    } else if (isValid && event.key == '.') {
      isValid = false;
    }

    if (!isValid) {
      event.preventDefault();
    }
  }

  allowCategory(id: string) {
    debugger;
    this.categoryList.find(c => c.category.id == id).isBlocked = false;
  }

  blockCategory(id: string) {
    debugger;
    this.categoryList.find(c => c.category.id == id).isBlocked = true;
  }

  allowApplication(id: string) {
    this.applicationList.find(a => a.application.id == id).isBlocked = false;
  }

  blockApplication(id: string) {
    this.applicationList.find(a => a.application.id == id).isBlocked = true;
  }


}
