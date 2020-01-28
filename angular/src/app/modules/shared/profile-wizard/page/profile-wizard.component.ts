import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NotificationService } from 'src/app/core/services/notification.service';
import { StaticService } from 'src/app/core/services/StaticService';
import { CategoryV2 } from 'src/app/core/models/CategoryV2';
import { Agent } from 'src/app/core/models/Agent';
import { ApplicationV2 } from 'src/app/core/models/ApplicationV2';
import { SecurityProfile, BlackWhiteListProfile, SecurityProfileItem, ListItem } from 'src/app/core/models/SecurityProfile';
import { ValidationService } from 'src/app/core/services/validation.service';
import { AgentService } from 'src/app/core/services/agent.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { RoamingService } from 'src/app/core/services/roaming.service';
import { Box } from 'src/app/core/models/Box';
import { BoxService } from 'src/app/core/services/box.service';
import { DEVICE_GROUP } from 'src/app/core/Constants';
import { DeviceGroup, AgentInfo } from 'src/app/core/models/DeviceGroup';
import { BWListItem } from 'src/app/core/models/BWListItem';

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
export class ProfileWizardComponent {
  isSafeSearchEnabled: boolean;
  isYoutubeStrictModeEnabled: boolean;
  profileName: string;
  isNewBlackListItem: boolean = false;
  isNewWhiteListItem: boolean = false;
  blackListItem: ListItem = new ListItem();
  whiteListItem: ListItem = new ListItem();
  categoryList: categoryItem[] = [];
  applicationList: applicationItem[] = [];
  public _selectedBox: Box;
  public _selectedAgent: Agent;
  public _startWizard: boolean;
  public _saveMode: string;
  currentStep = 0;

  @Input() set saveMode(value: string) {
    this._saveMode = value;
  }
  get saveMode(): string {
    return this._saveMode;
  }
  @Input() set selectedAgent(value: Agent) {
    this._selectedAgent = value;
  }
  get selectedAgent(): Agent {
    return this._selectedAgent;
  }

  @Input() set selectedBox(value: Box) {
    this._selectedBox = value;
  }
  get selectedBox(): Box {
    return this._selectedBox;
  }

  @Input() set startWizard(value: boolean) {
    this._startWizard = value;
    if (value) {
      this.currentStep = 0;
      this.controlStep();
    }
  }

  get startWizard(): boolean {
    return this._startWizard;
  }

  @Input() updateCount: number;

  @Output() public saveEmitter = new EventEmitter();

  constructor(private notification: NotificationService, private alertService: AlertService, private staticService: StaticService,
    private agentService: AgentService, private roamingService: RoamingService, private boxService: BoxService) {

    this.getCategoriesAndApps();

  }

  getCategoriesAndApps(): void {

    this.staticService.getCategoryList().subscribe(res => {
      res.forEach(r => {
        this.categoryList.push(new categoryItem(r, false));
      });
      this.categoryList = this.categoryList.sort((x, y) => { return x.category.name > y.category.name ? 1 : -1 })
    });

    this.staticService.getApplicationList().subscribe(res => {
      res.forEach(r => {
        this.applicationList.push(new applicationItem(r, false));
      });
      this.applicationList = this.applicationList.sort((x, y) => { return x.application.name > y.application.name ? 1 : -1 })
    });
  }


  ngOnChanges(changes: SimpleChanges): void {

    this.updateModels();
  }

  updateModels() {
    this.currentStep = 0;
    this.controlStep();

    if (this.saveMode == 'NewProfile') {

      this.categoryList.forEach(c => {
        if (c.category.isVisible) {
          c.isBlocked = false;
          this.selectedAgent.rootProfile.domainProfile.categories.push({ id: c.category.id, isBlocked: false })
        }
      });
      this.applicationList.forEach(a => {
        if (a.application.isVisible) {
          a.isBlocked = false;
          this.selectedAgent.rootProfile.applicationProfile.categories.push({ id: a.application.id, isBlocked: false })
        }
      });
    } else if (this.saveMode == 'ProfileUpdate') {
      this.selectedAgent.rootProfile.domainProfile.categories.forEach(x => {
        this.categoryList.find(y => y.category.id == x.id).isBlocked = x.isBlocked;
      });

      this.selectedAgent.rootProfile.applicationProfile.categories.forEach(x => {
        this.applicationList.find(y => y.application.id == x.id).isBlocked = x.isBlocked;
      });
    } else {

      this.categoryList.forEach(c => {
        if (c.category.isVisible) {
          c.isBlocked = false;
          this.selectedAgent.rootProfile.domainProfile.categories.push({ id: c.category.id, isBlocked: false })
        }
      });
      this.applicationList.forEach(a => {
        if (a.application.isVisible) {
          a.isBlocked = false;
          this.selectedAgent.rootProfile.applicationProfile.categories.push({ id: a.application.id, isBlocked: false })
        }
      });
    }
  }

  allowCategory(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem == false) {
      this.categoryList.find(c => c.category.id == id).isBlocked = false;
      this.selectedAgent.rootProfile.domainProfile.categories.find(c => c.id == id).isBlocked = false;
    }
  }

  blockCategory(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem == false) {
      this.categoryList.find(c => c.category.id == id).isBlocked = true;
      this.selectedAgent.rootProfile.domainProfile.categories.find(c => c.id == id).isBlocked = true;
    }
  }

  allowApplication(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem == false) {
      this.applicationList.find(a => a.application.id == id).isBlocked = false;
      this.selectedAgent.rootProfile.applicationProfile.categories.find(c => c.id == id).isBlocked = false;
    }

  }

  blockApplication(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem == false) {
      this.applicationList.find(a => a.application.id == id).isBlocked = true;
      this.selectedAgent.rootProfile.applicationProfile.categories.find(c => c.id == id).isBlocked = true;
    }
  }

  profileNameChanged() {
    if (!this.selectedAgent.rootProfile.name) {
      $('#profileName').addClass('profileNameHasError');
      $('.profileNameToolTip').show(300)
    } else {
      $('#profileName').removeClass('profileNameHasError');
      $('.profileNameToolTip').hide(200)
    }
  }

  saveProfile() {
    if (!this.selectedAgent.rootProfile.name) {
      $('#profileName').focus();
      $('#profileName').addClass('profileNameHasError');
      $('.profileNameToolTip').css("visibility", 'hidden');
      setTimeout(() => {$('.profileNameToolTip').css("visibility", 'visible');}, 100);
      return;
    }
    let alertMessage = '', alertTitle = '';
    if (this.selectedAgent.rootProfile.numberOfUsage && this.selectedAgent.rootProfile.numberOfUsage > 0) {
      alertTitle = this.selectedAgent.rootProfile.numberOfUsage + ' Agent/s using this profile!';
      alertMessage = 'Profile configuration will change for all of related agents.';
    } else {
      alertTitle = 'Are You Sure?';
      alertMessage = 'Profile configuration will change.';
    }

    this.alertService.alertWarningAndCancel(alertTitle, alertMessage).subscribe(
      res => {
        if (res) {
          if (this.saveMode == 'NewProfile' || this.saveMode == 'ProfileUpdate') {
            this.agentService.saveSecurityProfile(this.selectedAgent.rootProfile).subscribe(res => {
              if (res.status == 200) {
                this.notification.success(res.message)
                this.saveEmitter.emit();
              } else {
                this.notification.error(res.message)
              }
            });
          } else if (this.saveMode == 'NewProfileWithAgent') {
            this.agentService.saveAgent(this.selectedAgent).subscribe(res => {
              if (res.status == 200) {
                this.notification.success(res.message)
                this.saveEmitter.emit();
              } else {
                this.notification.error(res.message)
              }
            });
          } else if (this.saveMode == 'NewProfileWithRoaming') {
            this.roamingService.saveClient(this.selectedAgent).subscribe(res => {
              if (res.status == 200) {
                this.notification.success(res.message)
                this.saveEmitter.emit();
              } else {
                this.notification.error(res.message)
              }
            });
          } else if (this.saveMode == 'NewProfileWithBox') {
            this.selectedBox.agent = this.selectedAgent;
            this.boxService.saveBox(this.selectedBox).subscribe(res => {
              if (res.status == 200) {
                this.notification.success(res.message)
                this.saveEmitter.emit();
              } else {
                this.notification.error(res.message)
              }
            });
          } else if (this.saveMode == 'NewProfileWithDevice') {
            let dg = new DeviceGroup()
            dg.rootProfile = this.selectedAgent.rootProfile

            let ai: AgentInfo = new AgentInfo();
            ai.mac = this.selectedAgent.mac
            ai.blockMessage = this.selectedAgent.blockMessage
            ai.agentType = this.selectedAgent.agentType
            ai.agentAlias = this.selectedAgent.agentAlias

            dg.agents = [ai]
            delete dg.agentGroup

            this.agentService.saveDevice(dg).subscribe(res => {
              if (res.status == 200) {
                this.notification.success(res.message)
                this.saveEmitter.emit();
              } else {
                this.notification.error(res.message)
              }
            });
          } else if (this.saveMode == 'NewProfileWithDeviceGroup') {

            if (localStorage.getItem(DEVICE_GROUP)) {
              let deviceGroup: DeviceGroup = JSON.parse(localStorage.getItem(DEVICE_GROUP));
              deviceGroup.rootProfile = this.selectedAgent.rootProfile;

              if (deviceGroup.agents.length > 0 && deviceGroup.agentGroup.groupName && deviceGroup.rootProfile) {
                this.agentService.saveDevice(deviceGroup).subscribe(res => {
                  if (res.status == 200) {
                    this.notification.success(res.message)
                    this.saveEmitter.emit();
                  } else {
                    this.notification.error(res.message)
                  }
                });
              } else {
                this.notification.warning('Missing Information! Please provide required fields.')
              }


            }
          }
        }
      }
    );


  }

  blackListItemValidation() {
    
    if (this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.find(b => b.domain == this.blackListItem.domain)) {
      this.isNewBlackListItem = false;
    } else {
      let result = ValidationService.domainValidation({ value: this.blackListItem.domain });
      if (result == true) {
        this.isNewBlackListItem = true;
      } else {
        this.isNewBlackListItem = false;
      }
    }
  }

  addToBlackList() {
    this.blackListItem.domain=this.cleanDomain(this.blackListItem.domain);
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem == false) {
      if (this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.find(b => b.domain == this.blackListItem.domain)) {
        this.notification.warning("This domain already in black list.")
      }else
      if (this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.find(b => b.domain == this.blackListItem.domain)) {
        this.notification.warning("This domain already in white list.")
      } else {
        let cloned=JSON.parse(JSON.stringify(this.blackListItem)) as ListItem;
        
        this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.push(cloned);
        this.blackListItem.domain = ""
        this.blackListItem.comment = ""
        this.isNewBlackListItem = false;
      }
    }
  }

  removeFromBlackList(item: ListItem) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem == false) {
      this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.splice(
        this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.findIndex(b => b.domain == item.domain), 1);
    }
  }
  cleanDomain(domain:string):string{
    return domain.replace(/https|http|\/|:/gm, '').replace(/\//g, '').trim();
  }
  whiteListItemValidation() {
    
    if (this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.find(b => b.domain == this.whiteListItem.domain)) {
      this.isNewWhiteListItem = false;
    } else {
      let result = ValidationService.domainValidation({ value: this.whiteListItem.domain });
      if (result == true) {
        this.isNewWhiteListItem = true;
      } else {
        this.isNewWhiteListItem = false;
      }
    }
  }

  addToWhiteList() {
    this.whiteListItem.domain=this.cleanDomain(this.whiteListItem.domain);
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem == false) {
      if (this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.find(b => b.domain == this.whiteListItem.domain)) {
        this.notification.warning("This domain already in white list.")
      }else
      if (this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.find(b => b.domain == this.whiteListItem.domain)) {
        this.notification.warning("This domain already in black list.")
      }
       else {
        this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.push(JSON.parse(JSON.stringify(this.whiteListItem)));
        this.whiteListItem.domain = ""
        this.whiteListItem.comment = ""
        this.isNewWhiteListItem = false;
      }
    }
  }

  removeFromWhiteList(item: string) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem == false) {
      this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.splice(
        this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.findIndex(b => b.domain == item), 1);
    }
  }

  changeSafeSearchMode() {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem == false) {
      this.selectedAgent.rootProfile.isSafeSearchEnabled = this.selectedAgent.rootProfile.isSafeSearchEnabled ? false : true;
    }
  }

  changeYoutubeMode() {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem == false) {
      this.selectedAgent.rootProfile.isYoutubeStrictModeEnabled = this.selectedAgent.rootProfile.isYoutubeStrictModeEnabled ? false : true;
    }
  }

  nextStep() {
    if (this.currentStep >= 0 && this.currentStep < 3) {
      this.currentStep++;
      this.controlStep();
      document.getElementById('agent-wizard').scrollIntoView();
    }
  }

  prevStep() {
    if (this.currentStep >= 0 && this.currentStep <= 3) {
      this.currentStep--;
      this.controlStep();
      document.getElementById('agent-wizard').scrollIntoView();
    }
  }

  changeWizardStep(stepNo: number) {
    this.currentStep = stepNo;
    this.controlStep();
  }

  controlStep() {

    let prevButton = $('#prevBtn');
    let nextButton = $('#nextBtn');
    let finishButton = $('#finishBtn');

    let contentFilter = $('#contentFilter'),
      security = $('#security'),
      applications = $('#applications'),
      blackWhiteLists = $('#blackWhiteLists');

    prevButton.hide();
    nextButton.hide();
    finishButton.show();
    //finishButton.hide();

    if (this.currentStep === 0) {
      prevButton.hide();
      nextButton.show();
      //finishButton.hide();
    } else if (this.currentStep === 3) {
      prevButton.show();
      nextButton.hide();
      // finishButton.show();
    } else {
      //finishButton.hide();
      prevButton.show();
      nextButton.show();
    }

    contentFilter.removeClass('d-block');
    security.removeClass('d-block');
    applications.removeClass('d-block');
    blackWhiteLists.removeClass('d-block');

    if (this.currentStep === 0) {
      contentFilter.addClass('d-block');
      $('#contentFilterBtn').addClass('activated')
      $('#securityBtn').removeClass('activated')
      $('#applicationsBtn').removeClass('activated')
      $('#blackWhiteListsBtn').removeClass('activated')
    } else if (this.currentStep === 1) {
      security.addClass('d-block');
      $('#securityBtn').addClass('activated')
      $('#applicationsBtn').removeClass('activated')
      $('#blackWhiteListsBtn').removeClass('activated')
    } else if (this.currentStep === 2) {
      applications.addClass('d-block');
      $('#applicationsBtn').addClass('activated')
      $('#blackWhiteListsBtn').removeClass('activated')
    } else {
      blackWhiteLists.addClass('d-block');
      $('#blackWhiteListsBtn').addClass('activated')
    }

  }


}
