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

// tslint:disable-next-line: class-name
export class categoryItem {
  constructor(public category: CategoryV2, public isBlocked: boolean) { }
}

// tslint:disable-next-line: class-name
export class applicationItem {
  constructor(public application: ApplicationV2, public isBlocked: boolean) { }
}

export const ApplicationTypes = {
  REMOTE_ACCESS: 'REMOTE_ACCESS',
  ONLINE_VIDEO: 'ONLINE_VIDEO',
  INSTANT_MESSAGING: 'INSTANT_MESSAGING',
  SOCIAL: 'SOCIAL',
  CLEAR_ADS: 'CLEAR_ADS',
  HTTP: 'HTTP'
};


@Component({
  selector: 'app-profile-wizard',
  templateUrl: './profile-wizard.component.html',
  styleUrls: ['./profile-wizard.component.sass']
})
export class ProfileWizardComponent {

  constructor(
    private notification: NotificationService,
    private alertService: AlertService,
    private staticService: StaticService,
    private agentService: AgentService,
    private roamingService: RoamingService,
    private boxService: BoxService
  ) {
    this.getCategoriesAndApps();
  }

  isSafeSearchEnabled: boolean;
  isYoutubeStrictModeEnabled: boolean;
  profileName: string;
  isNewBlackListItem = false;
  isNewWhiteListItem = false;
  blackListItem: ListItem = new ListItem();
  whiteListItem: ListItem = new ListItem();
  categoryList: categoryItem[] = [];
  applicationList: applicationItem[] = [];
  activeNumber = 1;

  securityMode = true;

  groupedApplications: { type: string, displayText: string, description: string, applications: applicationItem[] }[] = [];

  public _selectedBox: Box;
  public _selectedAgent: Agent;
  public _startWizard: boolean;
  public _saveMode: string;

  @Input() startWizard;

  @Input() set saveMode(value: string) {
    this._saveMode = value;
  }
  get saveMode(): string {
    return this._saveMode;
  }
  @Input() set selectedAgent(value: Agent) {
    this._selectedAgent = value;

    this.updateModels();
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

  @Input() currentStep: number;

  @Input() updateCount: number;

  @Output() public saveEmitter = new EventEmitter();

  getCategoriesAndApps(): void {

    this.staticService.getCategoryList().subscribe(res => {
      res.forEach(r => {
        this.categoryList.push(new categoryItem(r, false));
      });

      this.categoryList = this.categoryList.sort((x, y) => x.category.name > y.category.name ? 1 : -1);
    });

    this.staticService.getApplicationList().subscribe(res => {
      res.forEach(r => {
        this.applicationList.push(new applicationItem(r, false));
      });
      this.applicationList = this.applicationList.sort((x, y) => x.application.name > y.application.name ? 1 : -1);

      this.fillGroupedApplications();
    });
  }

  setActiveNumber(val: number) {
    this.activeNumber = val;
  }

  fillGroupedApplications() {
    const clearAds = [];
    const http = [];
    const onlineVideo = [];
    const instantMessaging = [];
    const remoteAccess = [];
    const social = [];

    this.applicationList.forEach(el => {
      switch (el.application.type) {
        case ApplicationTypes.CLEAR_ADS:
          clearAds.push(el);
          break;

        case ApplicationTypes.HTTP:
          http.push(el);
          break;

        case ApplicationTypes.INSTANT_MESSAGING:
          instantMessaging.push(el);
          break;

        case ApplicationTypes.ONLINE_VIDEO:
          onlineVideo.push(el);
          break;

        case ApplicationTypes.REMOTE_ACCESS:
          remoteAccess.push(el);
          break;

        case ApplicationTypes.SOCIAL:
          social.push(el);
          break;

        default:
          break;
      }
    });

    this.groupedApplications = [
      { type: ApplicationTypes.CLEAR_ADS, displayText: 'Advertisement', description: 'Newly Register, Newly Up, Domain Parking, Dead Sites gibi içerik ve güvenlik riski değişiklik gösterebilen domainleri içerir.', applications: clearAds },
      // { type: ApplicationTypes.HTTP, displayText: 'HTTP', description: '',  applications: http },
      { type: ApplicationTypes.INSTANT_MESSAGING, displayText: 'Instant Messaging', description: 'Newly Register, Newly Up, Domain Parking, Dead Sites gibi içerik ve güvenlik riski değişiklik gösterebilen domainleri içerir.', applications: instantMessaging },
      { type: ApplicationTypes.ONLINE_VIDEO, displayText: 'Online Video', description: 'Pornogrphy, Adult, Gamblig gibi istenmeyen domainleri içerir.', applications: onlineVideo },
      { type: ApplicationTypes.REMOTE_ACCESS, displayText: 'Remote Access Tools', description: 'Newly Register, Newly Up, Domain Parking, Dead Sites gibi içerik ve güvenlik riski değişiklik gösterebilen domainleri içerir.', applications: remoteAccess },
      { type: ApplicationTypes.SOCIAL, displayText: 'Social Media', description: 'Newly Register, Newly Up, Domain Parking, Dead Sites gibi içerik ve güvenlik riski değişiklik gösterebilen domainleri içerir.', applications: social },
    ];
  }

  updateModels() {
    if (this.saveMode === 'NewProfile') {
      this.categoryList.forEach(c => {
        if (c.category.isVisible) {
          c.isBlocked = false;
          this.selectedAgent.rootProfile.domainProfile.categories.push({ id: c.category.id, isBlocked: false });
        }
      });
      this.applicationList.forEach(a => {
        if (a.application.isVisible) {
          a.isBlocked = false;
          this.selectedAgent.rootProfile.applicationProfile.categories.push({ id: a.application.id, isBlocked: false });
        }
      });
    } else if (this.saveMode === 'ProfileUpdate') {
      this.selectedAgent.rootProfile.domainProfile.categories.forEach(x => {
        this.categoryList.find(y => y.category.id === x.id).isBlocked = x.isBlocked;
      });

      this.selectedAgent.rootProfile.applicationProfile.categories.forEach(x => {
        this.applicationList.find(y => y.application.id === x.id).isBlocked = x.isBlocked;
      });
    } else {
      this.categoryList.forEach(c => {
        if (c.category.isVisible) {
          c.isBlocked = false;
          this.selectedAgent.rootProfile.domainProfile.categories.push({ id: c.category.id, isBlocked: false });
        }
      });
      this.applicationList.forEach(a => {
        if (a.application.isVisible) {
          a.isBlocked = false;
          this.selectedAgent.rootProfile.applicationProfile.categories.push({ id: a.application.id, isBlocked: false });
        }
      });
    }
  }

  categoryChanged(category: categoryItem) {
    if (category.isBlocked) {
      this.allowCategory(category.category.id);
    } else {
      this.blockCategory(category.category.id);
    }
  }

  allowCategory(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.categoryList.find(c => c.category.id === id).isBlocked = false;
      this.selectedAgent.rootProfile.domainProfile.categories.find(c => c.id === id).isBlocked = false;
    }
  }

  blockCategory(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.categoryList.find(c => c.category.id === id).isBlocked = true;
      this.selectedAgent.rootProfile.domainProfile.categories.find(c => c.id === id).isBlocked = true;
    }
  }

  applicationChanged(application: applicationItem) {
    if (application.isBlocked) {
      this.allowApplication(application.application.id);
    } else {
      this.blockApplication(application.application.id);
    }
  }

  allowApplication(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.applicationList.find(a => a.application.id === id).isBlocked = false;
      this.selectedAgent.rootProfile.applicationProfile.categories.find(c => c.id === id).isBlocked = false;
    }

  }

  blockApplication(id: number) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.applicationList.find(a => a.application.id === id).isBlocked = true;
      this.selectedAgent.rootProfile.applicationProfile.categories.find(c => c.id === id).isBlocked = true;
    }
  }

  saveProfile() {
    if (!this.selectedAgent.rootProfile.name) { return; }

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
          if (this.saveMode === 'NewProfile' || this.saveMode === 'ProfileUpdate') {
            this.agentService.saveSecurityProfile(this.selectedAgent.rootProfile).subscribe(result => {
              if (result.status === 200) {
                this.notification.success(result.message);
                this.saveEmitter.emit();
              } else {
                this.notification.error(result.message);
              }
            });
          } else if (this.saveMode === 'NewProfileWithAgent') {
            this.agentService.saveAgent(this.selectedAgent).subscribe(result => {
              if (result.status === 200) {
                this.notification.success(result.message);
                this.saveEmitter.emit();
              } else {
                this.notification.error(result.message);
              }
            });
          } else if (this.saveMode === 'NewProfileWithRoaming') {
            this.roamingService.saveClient(this.selectedAgent).subscribe(result => {
              if (result.status === 200) {
                this.notification.success(result.message);
                this.saveEmitter.emit();
              } else {
                this.notification.error(result.message);
              }
            });
          } else if (this.saveMode === 'NewProfileWithBox') {
            this.selectedBox.agent = this.selectedAgent;
            this.boxService.saveBox(this.selectedBox).subscribe(result => {
              if (result.status === 200) {
                this.notification.success(result.message);
                this.saveEmitter.emit();
              } else {
                this.notification.error(result.message);
              }
            });
          } else if (this.saveMode === 'NewProfileWithDevice') {
            const dg = new DeviceGroup();
            dg.rootProfile = this.selectedAgent.rootProfile;

            const ai: AgentInfo = new AgentInfo();
            ai.mac = this.selectedAgent.mac;
            ai.blockMessage = this.selectedAgent.blockMessage;
            ai.agentType = this.selectedAgent.agentType;
            ai.agentAlias = this.selectedAgent.agentAlias;

            dg.agents = [ai];
            delete dg.agentGroup;

            this.agentService.saveDevice(dg).subscribe(result => {
              if (result.status === 200) {
                this.notification.success(result.message);
                this.saveEmitter.emit();
              } else {
                this.notification.error(result.message);
              }
            });
          } else if (this.saveMode === 'NewProfileWithDeviceGroup') {

            if (localStorage.getItem(DEVICE_GROUP)) {
              const deviceGroup: DeviceGroup = JSON.parse(localStorage.getItem(DEVICE_GROUP));
              deviceGroup.rootProfile = this.selectedAgent.rootProfile;

              if (deviceGroup.agents.length > 0 && deviceGroup.agentGroup.groupName && deviceGroup.rootProfile) {
                this.agentService.saveDevice(deviceGroup).subscribe(result => {
                  if (result.status === 200) {
                    this.notification.success(result.message);
                    this.saveEmitter.emit();
                  } else {
                    this.notification.error(result.message);
                  }
                });
              } else {
                this.notification.warning('Missing Information! Please provide required fields.');
              }
            }
          }
        }
      }
    );
  }

  blackListItemValidation() {
    if (this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.find(b => b.domain === this.blackListItem.domain)) {
      this.isNewBlackListItem = false;
    } else {
      const result = ValidationService.domainValidation({ value: this.blackListItem.domain });
      if (result === true) {
        this.isNewBlackListItem = true;
      } else {
        this.isNewBlackListItem = false;
      }
    }
  }

  addToBlackList() {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      if (this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.find(b => b.domain === this.blackListItem.domain)) {
        this.notification.warning('This domain already in black list.');
      } else
        if (this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.find(b => b.domain === this.blackListItem.domain)) {
          this.notification.warning('This domain already in white list.');
        } else {
          this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.push(JSON.parse(JSON.stringify(this.blackListItem)));
          this.blackListItem.domain = '';
          this.blackListItem.comment = '';
          this.isNewBlackListItem = false;
        }
    }
  }

  removeFromBlackList(item: ListItem) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.splice(
        this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.findIndex(b => b.domain === item.domain), 1);
    }
  }

  whiteListItemValidation() {
    if (this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.find(b => b.domain === this.whiteListItem.domain)) {
      this.isNewWhiteListItem = false;
    } else {
      const result = ValidationService.domainValidation({ value: this.whiteListItem.domain });
      if (result == true) {
        this.isNewWhiteListItem = true;
      } else {
        this.isNewWhiteListItem = false;
      }
    }
  }

  addToWhiteList() {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      if (this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.find(b => b.domain === this.whiteListItem.domain)) {
        this.notification.warning('This domain already in white list.');
      } else
        if (this.selectedAgent.rootProfile.blackWhiteListProfile.blackList.find(b => b.domain === this.whiteListItem.domain)) {
          this.notification.warning('This domain already in black list.');
        } else {
          this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.push(JSON.parse(JSON.stringify(this.whiteListItem)));
          this.whiteListItem.domain = '';
          this.whiteListItem.comment = '';
          this.isNewWhiteListItem = false;
        }
    }
  }

  removeFromWhiteList(item: string) {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.splice(
        this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList.findIndex(b => b.domain === item), 1);
    }
  }

  changeSafeSearchMode() {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.selectedAgent.rootProfile.isSafeSearchEnabled = this.selectedAgent.rootProfile.isSafeSearchEnabled ? false : true;
    }
  }

  changeYoutubeMode() {
    if (this.selectedAgent.rootProfile && this.selectedAgent.rootProfile.isSystem === false) {
      this.selectedAgent.rootProfile.isYoutubeStrictModeEnabled = this.selectedAgent.rootProfile.isYoutubeStrictModeEnabled ? false : true;
    }
  }

  toggleSecurityMode() {
    this.securityMode = !this.securityMode;
  }

}
