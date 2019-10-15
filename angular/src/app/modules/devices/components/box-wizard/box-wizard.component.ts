import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Box } from 'src/app/core/models/Box';
import { DomainProfile } from 'src/app/core/models/DomainProfile';
import { ApplicationProfilesService } from 'src/app/core/services/ApplicationProfilesService';
import { DomainProfilesService } from 'src/app/core/services/DomainProfilesService';
import { BlackWhiteListService } from 'src/app/core/services/BlackWhiteListService';
import { BWList } from 'src/app/core/models/BWList';
import { ApplicationProfile } from 'src/app/core/models/ApplicationProfile';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/core/services/notification.service';
import { log } from 'util';
import { BoxService } from 'src/app/core/services/box.service';

declare var $: any;

@Component({
  selector: 'app-box-wizard',
  templateUrl: './box-wizard.component.html',
  styleUrls: ['./box-wizard.component.css']
})
export class BoxWizardComponent implements OnInit {
  domainProfiles: DomainProfile[];
  userProfiles: DomainProfile[];
  systemProfiles: DomainProfile[];
  appProfiles: ApplicationProfile[];
  applicationSystemProfiles: ApplicationProfile[];
  applicationUserProfiles: ApplicationProfile[];
  bwList: BWList[];
  userBWList: BWList[];
  systemBWList: BWList[];
  boxForm: FormGroup;
  etvIp: string;
  public _selectedBox: Box;
  @Input() set selectedBox(value: Box) {
    this._selectedBox = value;
  }
  get selectedBox(): Box {
    return this._selectedBox;
  }

  @Output() public saveEmitter = new EventEmitter();
  
  constructor(private apService: ApplicationProfilesService, private dpService: DomainProfilesService, private notification: NotificationService,
    private bwService: BlackWhiteListService, private boxService: BoxService, private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.boxForm = this.formBuilder.group({
      boxName: ["", [Validators.required]],
      domainProfile: ["", [Validators.required]],
      appProfile: ["", [Validators.required]],
      bwListProfile: ["", [Validators.required]],
      blockMessage: ["", Validators.required],
      isCaptivePortal: ["",],
      etvIp: [""]
    });

    this.dpService.getProfileData().subscribe((res: DomainProfile[]) => {
      if (res != null) {
        this.domainProfiles = res;
        this.updateDomainProfilelist();
      }
    });
    this.apService.getProfileData().subscribe((res: ApplicationProfile[]) => {
      if (res != null) {
        this.appProfiles = res;
        this.updateApplicationProfilelist();
      }
    });
    this.bwService.getBwList().subscribe((res: BWList[]) => {
      if (res != null) {
        this.bwList = res;
        this.updateBWList();
      }
    });
  }

  updateApplicationProfilelist() {
    let systemProfiles = new Array();
    let userProfiles = new Array();
    for (let a of this.appProfiles) {
      if (a.system) {
        systemProfiles.push(a);
      } else {
        userProfiles.push(a);
      }
    }

    this.applicationUserProfiles = userProfiles;
    this.applicationSystemProfiles = systemProfiles;
  }

  updateBWList() {
    const systemBWList = new Array();
    const userBWList = new Array();
    for (const a of this.bwList) {
      if (a.system) {
        systemBWList.push(a);
      } else {
        userBWList.push(a);
      }
    }
    this.userBWList = userBWList;
    this.systemBWList = systemBWList;
  }

  updateDomainProfilelist() {
    const systemProfiles = new Array();
    const userProfiles = new Array();
    for (let a of this.domainProfiles) {
      if (a.locked) {
        systemProfiles.push(a);
      } else {
        userProfiles.push(a);
      }
    }

    this.userProfiles = userProfiles;
    this.systemProfiles = systemProfiles;
  }

  checkIPNumber(event: KeyboardEvent, inputValue: string) {

    let allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "Backspace", "ArrowLeft", "ArrowRight", ".","Tab"];
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

  manageETV() {
    this.selectedBox.isCaptivePortal = this.selectedBox.isCaptivePortal == true ? false : true;
    if (this.selectedBox.isCaptivePortal) {
      this.boxForm.controls["etvIp"].setValidators([Validators.required]);
      this.boxForm.controls["etvIp"].updateValueAndValidity();
    } else {
      this.boxForm.controls["etvIp"].clearValidators();
      this.boxForm.controls["etvIp"].updateValueAndValidity();
    }
  }

  boxFormSubmit() {
    if (!this.boxForm.status || !this.boxForm.dirty) {
      return;
    }
    if (this.selectedBox.isCaptivePortal && !this.etvIp) {
      return;
    }
    this.selectedBox.ipAddress = this.etvIp;

    this.boxService.saveBox(this.selectedBox).subscribe(res => {
      if (res.status == 200) {
        this.notification.success(res.message);
        this.saveEmitter.emit();
      } else {
        this.notification.error(res.message);
      }
    });

  }


}
