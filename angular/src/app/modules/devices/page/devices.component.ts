import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgentService } from 'src/app/core/services/agent.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { Box } from 'src/app/core/models/Box';
import { NotificationService } from 'src/app/core/services/notification.service';

import { AgentType } from 'src/app/core/models/AgentType';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';
import { BoxService } from 'src/app/core/services/box.service';
import { ValidationService } from 'src/app/core/services/validation.service';
import { MacAddressFormatterPipe } from 'src/app/modules/shared/pipes/MacAddressFormatterPipe';
import { DEVICE_GROUP } from 'src/app/core/constants';
import { DeviceGroup, AgentInfo, AgentGroup } from 'src/app/core/models/DeviceGroup';
import { Agent } from 'src/app/core/models/Agent';
import { RkTableConfigModel } from 'roksit-lib/lib/modules/rk-table/rk-table/rk-table.component';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';
import { RkModalModel } from 'roksit-lib/lib/modules/rk-modal/rk-modal.component';
import { StaticMessageService } from 'src/app/core/services/staticMessageService';
import { element } from 'protractor';
import { group } from '@angular/animations';
import { JsonPipe } from '@angular/common';

declare var $: any;

export class UnregisteredAgent {
    agentGroup: AgentGroup;
    agentInfo: AgentInfo = new AgentInfo();
    rootProfile: SecurityProfile;

    /**
     * @description For UI
     */
    selected ?= false;
}

export function validLength(val: string) {
    return val.trim().length > 0;
}

export class GroupAgentModel {
    agentGroup: AgentGroup;
    securityProfile: SecurityProfile;
    agents: Agent[];
    memberCounts ?= 0;
}

@Component({
    selector: 'app-devices',
    templateUrl: 'devices.component.html',
    styleUrls: ['devices.component.sass'],
    providers: [MacAddressFormatterPipe]
})
export class DevicesComponent implements OnInit {

    constructor(private agentService: AgentService, private formBuilder: FormBuilder, private alertService: AlertService,
        private boxService: BoxService, private notification: NotificationService, private staticMessageService: StaticMessageService) {

        this.loadDevices();
        this.initializeSelectedAgentProfile();
    }
    ipv4Pattern = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    registereds: Agent[] = [];
    unregistereds: UnregisteredAgent[] = [];
    devicesForGroup: AgentInfo[] = [];
    deviceGroup: DeviceGroup = new DeviceGroup();
    groupList: GroupAgentModel[] = [];
    boxForm: FormGroup;
    isNewProfileSelected = false;
    boxes: Box[] = [];
    selectedAgent: Agent = new Agent();
    securityProfiles: SecurityProfile[] = [];
    startWizard: boolean;
    saveMode: String;
    isNewItemUpdated = true;

    deviceCache: AgentInfo[] = [];

    previousGroupId = 0;
    currentCss = '';

    @ViewChild('groupAgentModal') groupAgentModal: RkModalModel;

    selectedGroupAgent: GroupAgentModel = {
        agentGroup: {}
    } as GroupAgentModel;

    securityProfilesForSelect: RkSelectModel[] = [];

    groupListForSelect: RkSelectModel[] = [];

    @ViewChild('changeGroupModal') changeGroupModal: RkModalModel;

    selectedGroupMembers: any[] = [];

    showGB = false;

    groupName = '';
    groupNameBeforeEdit = '';

    selectedProfileRadio;
    selectedProfileRadioBeforeEdit;

    @ViewChild('selectedBoxModal') selectedBoxModal: RkModalModel;

    selectedBox: Box;

    enable: 'enable' | 'disabled';

    selectedGroupId: number | string;

    selectedProfileId: number | string;

    selectedAgentGroupType: 'create' | 'edit' = 'create';

    loadDevices() {
        this.agentService.getSecurityProfiles().subscribe(res => {
            this.securityProfiles = res;

            this.securityProfilesForSelect = [];

            this.securityProfiles.forEach(elem => {

                this.securityProfilesForSelect.push({
                    displayText: elem.name,
                    value: elem.id
                });

            });
        });

        this.boxService.getBoxes().subscribe(res => { this.boxes = res; });

        this.agentService.getRegisteredDevices().subscribe(res => {
            this.groupList = [];
            this.groupListForSelect = [];
            res.forEach((r, index) => {
                if (r.agentGroup && r.agentGroup.id > 0) {
                    const finded = this.groupList.find(g => g.agentGroup.groupName === r.agentGroup.groupName);
                    if (!finded) {
                        this.groupList.push({
                            agentGroup: r.agentGroup,
                            securityProfile: r.rootProfile,
                            agents: [r]
                        });

                            this.groupListForSelect.push({
                                displayText: r.agentGroup.groupName,
                                value: r.agentGroup.id,
                                selected: index === 0
                            });

                    } else {
                        finded['memberCounts']++;
                        finded.agents.push(r);
                    }
                }
            });

            this.registereds = res.sort((x, y) => {
                if (!x.agentGroup) {
                    return 1;
                } else if (!y.agentGroup) {
                    return -1;
                } else if (x.agentGroup.groupName > y.agentGroup.groupName) {
                    return 1;
                }
                return -1;
            });
        });

        this.agentService.getUnregisteredDevices().subscribe(res => {
            this.unregistereds = [];
            if (res && res instanceof Array) {
                res.forEach(d => {
                    const a = new AgentInfo();
                    a.agentType = AgentType.DEVICE;
                    a.mac = d.mac;
                    a.agentAlias = d.hostName;
                    this.unregistereds.push({ agentGroup: null, agentInfo: a, rootProfile: null });
                });
            }
        });
    }

    closeGroupAgentModal($event) {
        if ($event.closed) {
            this.selectedGroupAgent = {
                agentGroup: {}
            } as GroupAgentModel;
        }
    }
    createNewGroup() {

        this.selectedGroupAgent = new GroupAgentModel();
        this.selectedProfileRadioBeforeEdit = -1;
        this.selectedProfileRadio = -1;
        this.groupName = '';
        this.groupNameBeforeEdit = '';

        this.groupAgentModal.toggle();
    }

    editGroupAgentModal(groupAgent: GroupAgentModel) {
        this.selectedGroupAgent = this.deepCopy(groupAgent);

        this.groupName = this.selectedGroupAgent.agentGroup.groupName;
        this.groupNameBeforeEdit = this.selectedGroupAgent.agentGroup.groupName;

        this.selectedGroupAgent.agents.forEach(elem => {
            elem.selected = true;
        });
        this.selectedProfileRadioBeforeEdit = undefined;
        this.securityProfilesForSelect.forEach(elem => {
            if (elem.value === this.selectedGroupAgent.securityProfile.id) {
                this.selectedProfileRadio = elem.value;
                this.selectedProfileRadioBeforeEdit = elem.value;
            }
        });

        this.groupAgentModal.toggle();
    }

    initializeSelectedAgentProfile() {
        this.selectedAgent.rootProfile = new SecurityProfile();
        this.selectedAgent.rootProfile.domainProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.applicationProfile = {} as SecurityProfileItem;
        this.selectedAgent.rootProfile.blackWhiteListProfile = {} as BlackWhiteListProfile;
        this.selectedAgent.rootProfile.domainProfile.categories = [];
        this.selectedAgent.rootProfile.applicationProfile.categories = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.blackList = [];
        this.selectedAgent.rootProfile.blackWhiteListProfile.whiteList = [];
    }

    ngOnInit() {
        this.boxForm = this.formBuilder.group({
            boxName: ['', [Validators.required]],
            blockMessage: [''],
            captivePortalIp: ['']
        });
    }

    openTooltipGuide() {
        // tooltip istenirse eklenecek
    }



    saveBox() {
        if (this.isBoxFormValid()) {
            this.boxService.saveBox(this.selectedBox).subscribe(res => {
                this.selectedBoxModal.toggle();
                this.notification.success(this.staticMessageService.savedAgentBoxMessage);

                this.loadDevices();

            });
        } else {
            this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);
        }
    }

    private isBoxFormValid() {
        return validLength(this.selectedBox.host) && this.selectedBox.agent.rootProfile.id > 0;
    }

    removeDeviceFromRegistereds(id: number) {
        this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.settingsForThisDeviceWillBeDeletedMessage}!`).subscribe(
            res => {
                if (res) {
                    this.agentService.deleteAgentDevice([id]).subscribe(_res => {

                        this.notification.success(this.staticMessageService.deletedDeviceMessage);

                        this.loadDevices();

                    });
                }
            }
        );
    }

    deleteDeviceGroup(groupName: string) {
        this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.settingsForThisGroupWillBeDeletedMessage}!`).subscribe(
            res => {
                if (res) {
                    const ids = [];

                    for (let i = 0; i < this.registereds.length; i++) {
                        const e = this.registereds[i];
                        if (e.agentGroup && e.agentGroup.groupName === groupName) {
                            ids.push(e.id);
                        }
                    }

                    this.agentService.deleteAgentDevice(ids).subscribe(_res => {

                        this.closeModal();
                        this.notification.success(this.staticMessageService.deletedDevicesMessage);
                        this.loadDevices();

                    });
                }
            }
        );
    }

    deleteBox(id: number) {
        if (id) {
            this.alertService.alertWarningAndCancel(`${this.staticMessageService.areYouSureMessage}?`, `${this.staticMessageService.agentOfThisBoxWillBeDeletedMessage}!`).subscribe(
                res => {
                    if (res) {
                        this.boxService.deleteBox(id).subscribe(resu => {

                            this.notification.success(this.staticMessageService.deletedAgentBoxMessage);
                            this.loadDevices();

                        });
                    }
                }
            );
        }
    }

    /*   changeBoxCPStatus() {
          // this.selectedBox.agent.isCpEnabled = this.selectedBox.agent.isCpEnabled ? false : true;
      }
   */
    /*    securityProfileChanged(type: string, profileId: number) {
           if (type && type.toLowerCase() === 'box') {
               // this.selectedBox.agent.rootProfile = JSON.parse(JSON.stringify(this.securityProfiles.find(s => s.id === profileId)));
           } else if (type && type.toLowerCase() === 'agent') {
               this.selectedAgent.rootProfile = JSON.parse(JSON.stringify(this.securityProfiles.find(s => s.id === profileId)));
           }
       }
    */
    /*     deviceProfileChanged(mac: string, profileId: number) {
            this.unregistereds.find(d => d.agentInfo.mac === mac).agentGroup = null;
            this.unregistereds.find(d => d.agentInfo.mac === mac).rootProfile =
                JSON.parse(JSON.stringify(this.securityProfiles.find(s => s.id === profileId)));
        } */

    /*     deviceGroupChanged(mac: string, groupId: number) {
            this.unregistereds.find(d => d.agentInfo.mac === mac).agentGroup = {
                id: groupId,
                groupName: this.groupList.find(g => g.agentGroup.id === groupId).agentGroup.groupName
            };
            this.unregistereds.find(d => d.agentInfo.mac === mac).rootProfile = null;
        } */

    /*     showProfileEditWizard(id: number) {
            const device = this.registereds.find(r => r.id === id);
            if (device.rootProfile && device.rootProfile.id > 0) {
                this.selectedAgent = device;
                this.saveMode = 'ProfileUpdate';
                this.startWizard = true;
            } else {
                this.notification.warning('Profile can not find!');
            }
        } */

    checkKeydown($event: KeyboardEvent) {
        this.checkIPNumber($event, this.selectedBox.agent.captivePortalIp);
    }

    checkIPNumber(event: KeyboardEvent, inputValue: string) {

        const allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 'Backspace', 'ArrowLeft', 'ArrowRight', '.', 'Tab'];
        let isValid = false;

        for (let i = 0; i < allowedChars.length; i++) {
            if (allowedChars[i] == event.key) {
                isValid = true;
                break;
            }
        }
        if (inputValue && (event.key !== 'Backspace' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
            if (event.key !== '.') {
                inputValue += event.key;
            }
            const lastOcletStr = inputValue.substring(inputValue.lastIndexOf('.') + 1);
            const lastOclet = Number(lastOcletStr);
            if (isValid && (lastOclet > 255 || lastOclet < 0 || lastOcletStr.length > 3)) {
                isValid = false;
            }
            if (isValid && event.key === '.') {
                const oclets: string[] = inputValue.split('.');
                for (let i = 0; i < oclets.length; i++) {
                    const oclet = oclets[i];
                    if (Number(oclet) < 0 || Number(oclet) > 255) {
                        isValid = false;
                        break;
                    }
                }
            }

            if (isValid && event.key === '.' && (inputValue.endsWith('.') || inputValue.split('.').length >= 4)) {
                isValid = false;
            }
        } else if (isValid && event.key === '.') {
            isValid = false;
        }

        if (!isValid) {
            event.preventDefault();
        }
    }



    closeModal() { }


    groupMembersTableCheckboxChanged($event) {
        this.registereds.forEach(elem => elem.selected = $event);
    }

    ungroupMemberTableCheckboxChanged($event) {
        this.unregistereds.forEach(elem => elem.selected = $event);
    }


    selectRow(ev: boolean, item) { }


    changeTableGroup(type: 'edit' | 'create') {
        let selecteds;

        if (type === 'edit') {
            selecteds = this.registereds.filter(x => x.selected);

        } else {
            selecteds = this.unregistereds.filter(x => x.selected);
        }

        if (!selecteds.length) {
            this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
            return;
        }

        this.selectedAgentGroupType = type;

        this.selectedGroupMembers = selecteds;

        this.changeGroupModal.toggle();
    }

    groupNameKeyup($event) {
        if ($event.keyCode === 13) {
            // group ekleme yapılacak.
        }
    }

    saveGroupAgent() {

        const groupName = this.groupName;
        const selectedProfile = this.securityProfiles.find(x => x.id === Number(this.selectedProfileRadio));

        const selectedGroupAgentsAdded = this.unregistereds.filter(x => x.selected);

        let selectedGroupAgentsRemoved: AgentInfo[] = [];
        let selectedGroupAgentsExits: AgentInfo[] = [];

        if (this.selectedGroupAgent.agents) {
            selectedGroupAgentsRemoved = this.selectedGroupAgent.agents.filter(x => !x.selected).map(x => {
                return {
                    id: x.id,
                    agentAlias: x.agentAlias,
                    agentType: x.agentType,
                    blockMessage: x.blockMessage,
                    mac: x.mac,
                    rootProfile: x.rootProfile,
                    agentGroup: x.agentGroup
                } as AgentInfo;
            });

            selectedGroupAgentsExits = this.selectedGroupAgent.agents.filter(x => x.selected).map(x => {
                return {
                    id: x.id,
                    agentAlias: x.agentAlias,
                    agentType: x.agentType,
                    blockMessage: x.blockMessage,
                    mac: x.mac,
                    rootProfile: x.rootProfile,
                    agentGroup: x.agentGroup
                } as AgentInfo;
            });
        }
        if (this.groupName.trim().length === 0) {
            this.notification.warning(this.staticMessageService.needsGroupNameMessage);
            return;
        }
        if (!selectedProfile || selectedProfile?.id <= 0) {
            this.notification.warning(this.staticMessageService.needsToSelectSecurityProfileMessage);
            return;
        }
        const groupNameChanged = this.groupName !== this.groupNameBeforeEdit;
        const securityProfileChanged = this.selectedProfileRadioBeforeEdit !== selectedProfile?.id;
        const selectionOfGroupMembedsChanged = (selectedGroupAgentsAdded.length > 0 || selectedGroupAgentsRemoved.length > 0);
        if (!groupNameChanged && !securityProfileChanged && !selectionOfGroupMembedsChanged) {
            this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);
            return;
        }

        if (this.groupNameBeforeEdit === '' && !selectionOfGroupMembedsChanged) {
            this.notification.warning(this.staticMessageService.needsToSelectAGroupMemberMessage);
            return;
        }

        const deviceGroup = new DeviceGroup();

        deviceGroup.agentGroup = { id: 0, groupName: groupName };

        deviceGroup.agents = selectedGroupAgentsAdded.map(x => x.agentInfo);
        selectedGroupAgentsExits.forEach(x => deviceGroup.agents.push(x));

        selectedGroupAgentsRemoved.forEach(async (elem) => {
            await this.agentService.deleteAgentDevice([elem.id]).toPromise();

        });

        deviceGroup.rootProfile = selectedProfile;
        if (deviceGroup.agents.length) {
            this.agentService.saveAgentDevice(deviceGroup).subscribe(result => {

                this.groupAgentModal.toggle();

                this.notification.success(this.staticMessageService.savedDevicesMessage);

                this.loadDevices();

            });
        } else {
            this.groupAgentModal.toggle();
            this.notification.success(this.staticMessageService.savedDevicesMessage);
            this.loadDevices();
        }

    }

    editBox(box: Box) {
        this.selectedBoxModal.toggle();

        this.selectedBox = this.deepCopy(box);

        this.securityProfilesForSelect.forEach(elem => {
            if (box.agent.rootProfile.id === elem.value) {
                elem.selected = true;
            }
        });
    }

    private deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    cleanBoxForm() {
        this.selectedBox.host = '';
        this.selectedBox.agent.blockMessage = '';
        this.selectedBox.agent.captivePortalIp = '';
    }



    changeGroupModalApplyClick() {

        // const selectedProfile =  this.securityProfiles.find(x => x.id === this.selectedProfileId);

        const selectedGroup = this.groupList.find(x => x.agentGroup.id === this.selectedGroupId);
        const selectedProfile = selectedGroup?.securityProfile;
        const selectedAgents = this.selectedGroupMembers?.filter(x => x.selected);

        const deviceGroup = new DeviceGroup();

        if (!selectedProfile || !selectedGroup || !selectedAgents || selectedAgents.length === 0) {
            this.notification.warning(this.staticMessageService.needsToFillInRequiredFieldsMessage);

            return;
        }

        deviceGroup.agentGroup = { id: Number(selectedGroup.agentGroup.id), groupName: selectedGroup.agentGroup.groupName };
        deviceGroup.rootProfile = selectedProfile;

        if (this.selectedAgentGroupType === 'create') {
            selectedAgents.forEach(elem => {


                deviceGroup.agents.push({

                    agentAlias: elem.agentInfo.agentAlias,
                    agentType: elem.agentInfo.agentType,
                    mac: elem.agentInfo.mac,
                    agentGroup: elem.agentInfo.agentGroup,
                    rootProfile: elem.agentInfo.rootProfile

                });
            });
        } else {
            deviceGroup.agents = selectedAgents;
        }

        this.agentService.saveAgentDevice(deviceGroup).subscribe(result => {

            this.changeGroupModal.toggle();

            this.notification.success(this.staticMessageService.savedDevicesMessage);

            this.loadDevices();

        });
    }
}
