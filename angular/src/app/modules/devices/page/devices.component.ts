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
import { DEVICE_GROUP } from 'src/app/core/Constants';
import { DeviceGroup, AgentInfo, AgentGroup } from 'src/app/core/models/DeviceGroup';
import { Agent } from 'src/app/core/models/Agent';
import { RkTableConfigModel } from 'roksit-lib/lib/modules/rk-table/rk-table/rk-table.component';
import { RkSelectModel } from 'roksit-lib/lib/modules/rk-select/rk-select.component';

declare var $: any;

export class UnregisteredAgent {
    agentGroup: AgentGroup;
    agentInfo: AgentInfo = new AgentInfo();
    rootProfile: SecurityProfile;

    /**
     * @description For UI
     */
    selected?= false;
}

export function validLength(val: string) {
    return val.trim().length > 0;
}

export class GroupAgentModel {
    agentGroup: AgentGroup;
    securityProfile: SecurityProfile;
    agents: Agent[];
    memberCounts?= 0;
}

@Component({
    selector: 'app-devices',
    templateUrl: 'devices.component.html',
    styleUrls: ['devices.component.sass'],
    providers: [MacAddressFormatterPipe]
})
export class DevicesComponent implements OnInit {

    constructor(private agentService: AgentService, private formBuilder: FormBuilder, private alertService: AlertService,
        private boxService: BoxService, private notification: NotificationService) {

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

    @ViewChild('groupAgentModal') groupAgentModal;

    selectedGroupAgent: GroupAgentModel = {
        agentGroup: {}
    } as GroupAgentModel;

    securityProfilesForSelect: RkSelectModel[] = [];

    groupListForSelect: RkSelectModel[] = [];

    @ViewChild('changeGroupModal') changeGroupModal;

    selectedGroupMembers: any[] = [];

    showGB = false;

    groupName = '';

    selectedProfileRadio;

    @ViewChild('selectedBoxModal') selectedBoxModal;

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

    editGroupAgentModal(groupAgent: GroupAgentModel) {
        this.selectedGroupAgent = JSON.parse(JSON.stringify(groupAgent));

        this.groupName = this.selectedGroupAgent.agentGroup.groupName;

        this.selectedGroupAgent.agents.forEach(elem => {
            elem.selected = true;
        });

        this.securityProfilesForSelect.forEach(elem => {
            if (elem.value === this.selectedGroupAgent.securityProfile.id) {
                this.selectedProfileRadio = elem.value;
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

    showNewProfileWizardForDevice(mac: string) {
        const agentInfo = this.unregistereds.find(a => a.agentInfo.mac === mac).agentInfo;
        this.selectedAgent.id = agentInfo.id;
        this.selectedAgent.agentType = agentInfo.agentType;
        this.selectedAgent.agentAlias = agentInfo.agentAlias;
        this.selectedAgent.blockMessage = agentInfo.blockMessage;
        this.selectedAgent.mac = agentInfo.mac;

        this.initializeSelectedAgentProfile();
        this.selectedAgent.rootProfile.name = this.selectedAgent.agentAlias + '-Profile';
        this.saveMode = 'NewProfileWithDevice';
        this.startWizard = true;
    }

    showNewProfileWizardForDeviceGroup() {
        if (this.deviceGroup.agentGroup.groupName && this.deviceGroup.agents.length > 0) {
            this.closeModal();
            localStorage.setItem(DEVICE_GROUP, JSON.stringify(this.deviceGroup));
            this.selectedAgent = new Agent();
            this.initializeSelectedAgentProfile();
            this.selectedAgent.rootProfile.name = this.deviceGroup.agentGroup.groupName + '-Profile';
            this.saveMode = 'NewProfileWithDeviceGroup';
            this.startWizard = true;
        } else {
            this.notification.warning('Missing Information! Please provide required fields.');
        }
    }

    saveDeviceGroup() {
        if (this.deviceGroup.agents.length > 0 && this.deviceGroup.agentGroup.groupName && this.deviceGroup.rootProfile
            && this.deviceGroup.rootProfile.id > 0) {

            if (this.deviceCache && this.deviceCache.length > 0) {
                const ids = [];
                for (let i = 0; i < this.deviceCache.length; i++) {
                    const e = this.deviceCache[i];
                    ids.push(e.id);
                }
                this.agentService.deleteDevice(ids).subscribe(res => {
                    if (res.status === 200) {
                        this.notification.success(res.message);
                    } else {
                        this.notification.error(res.message);
                    }
                });
            }

            this.agentService.saveDevice(this.deviceGroup).subscribe(res => {
                if (res.status === 200) {
                    this.closeModal();
                    this.notification.success(res.message);
                    this.loadDevices();
                } else {
                    this.notification.error(res.message);
                }
            });

        } else {
            this.notification.warning('Missing Information! Please provide required fields.');
        }
    }

    saveDevice(mac: string) {
        const d = this.unregistereds.find(u => u.agentInfo.mac === mac);

        const dg = new DeviceGroup();
        dg.agents = [d.agentInfo];
        if (d.agentGroup && d.agentGroup.id > 0) {
            dg.agentGroup = d.agentGroup;
            dg.rootProfile = this.registereds.find(r => (r.agentGroup && r.agentGroup.id === d.agentGroup.id)).rootProfile;
        } else {
            dg.rootProfile = d.rootProfile;
            delete dg.agentGroup;
        }

        this.agentService.saveDevice(dg).subscribe(res => {
            if (res.status === 200) {
                this.notification.success(res.message);
                this.loadDevices();
            } else {
                this.notification.error(res.message);
            }
        });

    }

    showNewProfileWizardForBox() {
        if (!this.isBoxFormValid()) {
            return;
        }

        this.initializeSelectedAgentProfile();

        this.saveMode = 'NewProfileWithBox';

        this.startWizard = true;
    }

    showNewProfileEditWizardForBox(boxId: number) {
        if (!this.isBoxFormValid()) {
            return;
        }

        const b = this.boxes.find(bo => bo.id === boxId);
        if (b && b.agent.rootProfile && b.agent.rootProfile.id > 0) {
            this.selectedAgent = b.agent;
            this.saveMode = 'ProfileUpdate';
            this.startWizard = true;
        } else {
            this.notification.warning('Profile can not find!');
        }
    }

    hideForm(type: string) {
        if (type === 'box') {
            $('#newBoxRow').slideUp(300);
        }
    }

    hideWizard() {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'If you made changes, your changes will be cancelled!').subscribe(
            res => {
                if (res) {
                    this.hideWizardWithoutConfirm();
                }
            }
        );
    }

    hideWizardWithoutConfirm() {
        this.loadDevices();
    }

    saveBox() {
        if (this.isBoxFormValid()) {
            this.boxService.saveBox(this.selectedBox).subscribe(res => {
                if (res.status === 200) {
                    this.notification.success(res.message);

                    this.loadDevices();
                } else {
                    this.notification.error(res.message);
                }
            });
        }
    }

    private isBoxFormValid() {
        return validLength(this.selectedBox.host) && this.selectedBox.agent.rootProfile.id > 0;
    }

    removeDeviceFromRegistereds(id: number) {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'Settings for this device will be deleted!').subscribe(
            res => {
                if (res) {
                    this.agentService.deleteDevice([id]).subscribe(_res => {
                        if (_res.status === 200) {
                            this.notification.success(_res.message);

                            this.loadDevices();
                        } else {
                            this.notification.error(_res.message);
                        }
                    });
                }
            }
        );
    }

    deleteDeviceGroup(id: number) {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'Settings for this group will be deleted!').subscribe(
            res => {
                if (res) {
                    const ids = [];
                    for (let i = 0; i < this.registereds.length; i++) {
                        const e = this.registereds[i];
                        if (e.agentGroup && e.agentGroup.id === id) {
                            ids.push(e.id);
                        }
                    }

                    this.agentService.deleteDevice(ids).subscribe(_res => {
                        if (_res.status === 200) {
                            this.closeModal();
                            this.notification.success(_res.message);
                            this.loadDevices();
                        } else {
                            this.notification.error(_res.message);
                        }
                    });
                }
            }
        );
    }

    deleteBox(id: number) {
        if (id) {
            this.alertService.alertWarningAndCancel('Are You Sure?', 'Agent of this box will be deleted!').subscribe(
                res => {
                    if (res) {
                        this.boxService.deleteBox(id).subscribe(resu => {
                            if (resu.status === 200) {
                                this.notification.success(resu.message);
                                this.loadDevices();
                            } else {
                                this.notification.error(resu.message);
                            }
                        });
                    }
                }
            );
        }
    }

    changeBoxCPStatus() {
        // this.selectedBox.agent.isCpEnabled = this.selectedBox.agent.isCpEnabled ? false : true;
    }

    securityProfileChanged(type: string, profileId: number) {
        if (type && type.toLowerCase() === 'box') {
            // this.selectedBox.agent.rootProfile = JSON.parse(JSON.stringify(this.securityProfiles.find(s => s.id === profileId)));
        } else if (type && type.toLowerCase() === 'agent') {
            this.selectedAgent.rootProfile = JSON.parse(JSON.stringify(this.securityProfiles.find(s => s.id === profileId)));
        }
    }

    deviceProfileChanged(mac: string, profileId: number) {
        this.unregistereds.find(d => d.agentInfo.mac === mac).agentGroup = null;
        this.unregistereds.find(d => d.agentInfo.mac === mac).rootProfile =
            JSON.parse(JSON.stringify(this.securityProfiles.find(s => s.id === profileId)));
    }

    deviceGroupChanged(mac: string, groupId: number) {
        this.unregistereds.find(d => d.agentInfo.mac === mac).agentGroup = {
            id: groupId,
            groupName: this.groupList.find(g => g.agentGroup.id === groupId).agentGroup.groupName
        };
        this.unregistereds.find(d => d.agentInfo.mac === mac).rootProfile = null;
    }

    showProfileEditWizard(id: number) {
        const device = this.registereds.find(r => r.id === id);
        if (device.rootProfile && device.rootProfile.id > 0) {
            this.selectedAgent = device;
            this.saveMode = 'ProfileUpdate';
            this.startWizard = true;
        } else {
            this.notification.warning('Profile can not find!');
        }
    }

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

    groupProfileChanged(id: number) {
        this.deviceGroup.rootProfile = this.securityProfiles.find(p => p.id === id);
    }

    moveDeviceInGroup(opType: number, mac: string) {
        if (opType === 1) {
            const d = this.devicesForGroup.find(u => u.mac === mac);
            this.deviceGroup.agents.push(d);
            this.devicesForGroup.splice(this.devicesForGroup.findIndex(x => x.mac === mac), 1);
            if (d.id && d.id > 0 && this.deviceCache.find(c => c.id === d.id)) {
                this.deviceCache.splice(this.deviceCache.findIndex(c => c.mac === d.mac), 1);
            }
        } else {
            const d = this.deviceGroup.agents.find(u => u.mac === mac);
            if (d.id && d.id > 0) {
                this.deviceCache.push(d);
            }
            this.devicesForGroup.push(d);
            this.deviceGroup.agents.splice(this.deviceGroup.agents.findIndex(x => x.mac === mac), 1);
        }

    }

    deleteUngroupDevice(device: UnregisteredAgent) {
        if (device) {
            this.alertService.alertWarningAndCancel('Are You Sure?', 'Settings for this device will be deleted!').subscribe(
                res => {
                    if (res) {
                        this.boxService.deleteBox(device.agentInfo.id).subscribe(resu => {
                            if (resu.status === 200) {
                                this.notification.success(resu.message);
                                this.loadDevices();
                            } else {
                                this.notification.error(resu.message);
                            }
                        });
                    }
                }
            );
        }
    }

    openModal() {
        this.deviceGroup = new DeviceGroup();
        const agents = [];
        this.unregistereds.forEach(u => agents.push(u.agentInfo));
        this.devicesForGroup = JSON.parse(JSON.stringify(agents));
    }

    openAgentModal(id?: number) {
        if (id) {
            this.deviceCache = [];
            this.deviceGroup = new DeviceGroup();
            const d = this.registereds.find(r => r.id === id);

            if (d.agentGroup && d.agentGroup.id > 0) {
                this.deviceGroup.agentGroup = d.agentGroup;
                this.registereds
                    .filter(r => (r.agentGroup && r.agentGroup.id === d.agentGroup.id))
                    .forEach(f => {
                        this.deviceGroup.agents.push(
                            {
                                agentAlias: f.agentAlias,
                                agentType: AgentType.DEVICE,
                                mac: f.mac,
                                blockMessage: f.blockMessage,
                                id: f.id
                            }
                        );
                    });
                this.deviceGroup.rootProfile = d.rootProfile;
            }

            const agents = [];
            this.unregistereds.forEach(u => agents.push(u.agentInfo));
            this.devicesForGroup = JSON.parse(JSON.stringify(agents));
        } else {

        }

        this.groupAgentModal.toggle();
    }

    closeModal() { }

    isSameGroup(gId: AgentGroup) {
        if (gId) {
            if (gId.id === this.previousGroupId) {
                return this.currentCss;
            } else {
                this.currentCss = this.currentCss === '' ? 'baseTableRow' : '';
            }
            this.previousGroupId = gId.id;
        }

        return this.currentCss;
    }

    groupMembersTableCheckboxChanged($event) {
        this.registereds.forEach(elem => elem.selected = $event);
    }

    ungroupMemberTableCheckboxChanged($event) {
        this.unregistereds.forEach(elem => elem.selected = $event);
    }

    selectRow(ev: boolean, item) {
        console.log(ev, item);
    }

    changeTableGroup(type: 'edit' | 'create') {
        let selecteds;

        if (type === 'edit') {
            selecteds = this.registereds.filter(x => x.selected);
        } else {
            selecteds = this.unregistereds.filter(x => x.selected);
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

        const selectedGroupAgentsU = this.unregistereds.filter(x => x.selected);

        const selectedGroupAgentsR = this.selectedGroupAgent.agents.filter(x => !x.selected).map(x => {
            return {
                id: x.id,
                agentAlias: x.agentAlias,
                agentType: x.agentType,
                blockMessage: x.blockMessage,
                mac: x.mac
            } as AgentInfo;
        });

        if (groupName.trim().length > 0 && selectedProfile.id > 0 && (selectedGroupAgentsU.length > 0 || selectedGroupAgentsR.length > 0)) {
            const deviceGroup = new DeviceGroup();

            deviceGroup.agentGroup = { id: -1, groupName: groupName };

            deviceGroup.agents = selectedGroupAgentsU.map(x => x.agentInfo);

            selectedGroupAgentsR.forEach(async (elem) => {
                await this.agentService.deleteDevice([elem.id]).toPromise();
            });

            deviceGroup.rootProfile = selectedProfile;

            this.agentService.saveDevice(deviceGroup).subscribe(result => {
                if (result.status === 200) {
                    this.groupAgentModal.toggle();

                    this.notification.success(result.message);

                    this.loadDevices();
                } else {
                    this.notification.error(result.message);
                }
            });
        }
    }

    editBox(box: Box) {
        this.selectedBoxModal.toggle();

        this.selectedBox = this.deppCopy(box);

        this.securityProfilesForSelect.forEach(elem => {
            if (box.agent.rootProfile.id === elem.value) {
                elem.selected = true;
            }
        });
    }

    private deppCopy(obj) {
        return Object.assign({}, obj);
    }

    cleanBoxForm() {
        this.selectedBox.host = '';
        this.selectedBox.agent.blockMessage = '';
        this.selectedBox.agent.rootProfile = {} as SecurityProfile;
        this.selectedBox.agent.captivePortalIp = '';
    }

    changeGroupModalApplyClick() {
        const selectedProfile = this.securityProfiles.find(x => x.id === this.selectedProfileId);
        const selectedGroup = this.groupList.find(x => x.agentGroup.id === this.selectedGroupId);
        const selectedAgents = this.selectedGroupMembers.filter(x => x.selected);

        const deviceGroup = new DeviceGroup();

        if (!selectedProfile || !selectedGroup || selectedAgents.length === 0) {
            this.notification.warning('Please fill in the required fields');

            return;
        }

        deviceGroup.agentGroup = { id: Number(selectedGroup.agentGroup.id), groupName: selectedGroup.agentGroup.groupName };
        deviceGroup.rootProfile = selectedProfile;

        if (this.selectedAgentGroupType === 'create') {
            selectedAgents.forEach(elem => {
                console.log(elem);

                deviceGroup.agents.push({
                    agentAlias: elem.agentInfo.agentAlias,
                    agentType: elem.agentInfo.agentType,
                    mac: elem.agentInfo.mac,
                });
            });
        } else {
            deviceGroup.agents = selectedAgents;
        }

        this.agentService.saveDevice(deviceGroup).subscribe(result => {
            if (result.status === 200) {
                this.changeGroupModal.toggle();

                this.notification.success(result.message);

                this.loadDevices();
            } else {
                this.notification.danger(result.message);
            }
        });
    }
}
