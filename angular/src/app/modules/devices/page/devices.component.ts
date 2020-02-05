import { Component, OnInit } from '@angular/core';
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

declare var $: any;

export class UnregisteredAgent {
    agentGroup: AgentGroup
    agentInfo: AgentInfo = new AgentInfo()
    rootProfile: SecurityProfile
}

@Component({
    selector: 'app-devices',
    templateUrl: 'devices.component.html',
    styleUrls: ['devices.component.sass'],
    providers: [MacAddressFormatterPipe]
})
export class DevicesComponent implements OnInit {
    ipv4Pattern = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    registereds: Agent[] = [];
    unregistereds: UnregisteredAgent[] = [];
    devicesForGroup: AgentInfo[] = [];
    deviceGroup: DeviceGroup = new DeviceGroup();
    groupList: AgentGroup[] = []
    boxForm: FormGroup;
    selectedBox: Box = new Box();
    isNewProfileSelected: boolean = false;
    boxes: Box[] = [];
    selectedAgent: Agent = new Agent();
    securityProfiles: SecurityProfile[] = [];
    startWizard: boolean;
    saveMode: String;
    isNewItemUpdated: boolean = true;

    constructor(private agentService: AgentService, private formBuilder: FormBuilder, private alertService: AlertService,
        private boxService: BoxService, private notification: NotificationService) {

        this.loadDevices();
        this.selectedBox = new Box();
        this.initializeSelectedAgentProfile();
    }

    loadDevices() {
        this.agentService.getSecurityProfiles().subscribe(res => this.securityProfiles = res);
        this.boxService.getBoxes().subscribe(res => { this.boxes = res; });
        this.agentService.getRegisteredDevices().subscribe(res => {
            this.groupList = []
            res.forEach(r => {
                if (r.agentGroup && r.agentGroup.id > 0) {
                    if (!this.groupList.find(g => g.id == r.agentGroup.id)) {
                        this.groupList.push(r.agentGroup);
                    }
                }
            });

            console.log(res);

            this.registereds = res.sort((x, y) => {
                if (!x.agentGroup) {
                    return 1
                } else if (!y.agentGroup) {
                    return -1
                } else if (x.agentGroup.groupName > y.agentGroup.groupName) {
                    return 1
                }
                return -1
            });

            console.log('registereds', this.registereds);
        });
        this.agentService.getUnregisteredDevices().subscribe(res => {
            this.unregistereds = [];
            if (res && res instanceof Array) {
                res.forEach(d => {
                    let a = new AgentInfo()
                    a.agentType = AgentType.DEVICE;
                    a.mac = d.mac
                    a.agentAlias = d.hostName
                    this.unregistereds.push({ agentGroup: null, agentInfo: a, rootProfile: null })
                })

            }
        });

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
            boxName: ["", [Validators.required]],
            blockMessage: [""],
            captivePortalIp: [""]
        });
    }

    openTooltipGuide() {
        //tooltip istenirse eklenecek
    }

    showNewProfileWizardForDevice(mac: string) {

        let agentInfo = this.unregistereds.find(a => a.agentInfo.mac == mac).agentInfo;
        this.selectedAgent.id = agentInfo.id
        this.selectedAgent.agentType = agentInfo.agentType
        this.selectedAgent.agentAlias = agentInfo.agentAlias
        this.selectedAgent.blockMessage = agentInfo.blockMessage
        this.selectedAgent.mac = agentInfo.mac

        this.initializeSelectedAgentProfile();
        this.selectedAgent.rootProfile.name = this.selectedAgent.agentAlias + "-Profile";
        this.saveMode = 'NewProfileWithDevice';
        $('#devicePanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
        this.startWizard = true;
        //  document.getElementById('wizardPanel').scrollIntoView();

    }

    showNewProfileWizardForDeviceGroup() {
        if (this.deviceGroup.agentGroup.groupName && this.deviceGroup.agents.length > 0) {
            this.closeModal();
            localStorage.setItem(DEVICE_GROUP, JSON.stringify(this.deviceGroup));
            this.selectedAgent = new Agent();
            this.initializeSelectedAgentProfile();
            this.selectedAgent.rootProfile.name = this.deviceGroup.agentGroup.groupName + "-Profile";
            this.saveMode = 'NewProfileWithDeviceGroup';
            $('#devicePanel').toggle("slide", { direction: "left" }, 600);
            $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
            this.startWizard = true;
            //  document.getElementById('wizardPanel').scrollIntoView();
        } else {
            this.notification.warning('Missing Information! Please provide required fields.')
        }


    }

    saveDeviceGroup() {

        if (this.deviceGroup.agents.length > 0 && this.deviceGroup.agentGroup.groupName && this.deviceGroup.rootProfile
            && this.deviceGroup.rootProfile.id > 0) {

            if (this.deviceCache && this.deviceCache.length > 0) {
                let ids = [];
                for (let i = 0; i < this.deviceCache.length; i++) {
                    const e = this.deviceCache[i];
                    ids.push(e.id)
                }
                this.agentService.deleteDevice(ids).subscribe(res => {
                    if (res.status == 200) {
                        this.notification.success(res.message)
                    } else {
                        this.notification.error(res.message)
                    }
                });
            }

            this.agentService.saveDevice(this.deviceGroup).subscribe(res => {
                if (res.status == 200) {
                    this.closeModal()
                    this.notification.success(res.message)
                    this.loadDevices()
                } else {
                    this.notification.error(res.message)
                }
            });

        } else {
            this.notification.warning('Missing Information! Please provide required fields.')
        }
    }

    saveDevice(mac: string) {
        let d = this.unregistereds.find(u => u.agentInfo.mac == mac)

        let dg = new DeviceGroup()
        dg.agents = [d.agentInfo]
        if (d.agentGroup && d.agentGroup.id > 0) {
            dg.agentGroup = d.agentGroup
            dg.rootProfile = this.registereds.find(r => (r.agentGroup && r.agentGroup.id == d.agentGroup.id)).rootProfile
        } else {
            dg.rootProfile = d.rootProfile
            delete dg.agentGroup
        }

        this.agentService.saveDevice(dg).subscribe(res => {
            if (res.status == 200) {
                this.notification.success(res.message)
                this.loadDevices()
            } else {
                this.notification.error(res.message)
            }
        });

    }

    showEditWizard(type: string, id: number) {

        if (type == AgentType.BOX.toString()) {
            this.selectedBox = JSON.parse(JSON.stringify(this.boxes.find(c => c.id == id)));
            if (!this.selectedBox.agent) {
                this.initializeSelectedAgentProfile();
                this.selectedBox.agent = this.selectedAgent;
            }
            $('#newBoxRow').slideDown(300);
        } else {
            // this.selectedAgent = this.deviceAgents.find(a => a.id == id);
            // this.selectedAgent.rootProfile = this.securityProfiles[0];
        }

        // $('#devicePanel').toggle("slide", { direction: "left" }, 600);
        // $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
        // this.startWizard = true; 
        // document.getElementById('wizardPanel').scrollIntoView();
    }

    showNewProfileWizardForBox() {
        if (!this.isBoxFormValid()) {
            return;
        }

        this.selectedAgent = this.selectedBox.agent;
        this.initializeSelectedAgentProfile();
        this.selectedAgent.rootProfile.name = this.selectedBox.agent.agentAlias + "-Profile";

        this.saveMode = 'NewProfileWithBox';

        $('#devicePanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
        this.startWizard = true;
        document.getElementById('wizardPanel').scrollIntoView();
    }

    showNewProfileEditWizardForBox(boxId: number) {
        if (!this.isBoxFormValid()) {
            return;
        }

        let b = this.boxes.find(b => b.id == boxId);
        if (b && b.agent.rootProfile && b.agent.rootProfile.id > 0) {
            this.selectedAgent = b.agent;
            this.saveMode = 'ProfileUpdate';
            $('#devicePanel').toggle("slide", { direction: "left" }, 600);
            $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
            this.startWizard = true;

            document.getElementById('wizardPanel').scrollIntoView();
        } else {
            this.notification.warning('Profile can not find!');
        }
    }

    hideForm(type: string) {
        if (type == 'box') {
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

        $('#wizardPanel').hide("slide", { direction: "right" }, 1000);
        $('#devicePanel').show("slide", { direction: "left" }, 1000);
        $('#newBoxRow').slideUp(300);
        this.loadDevices();
    }

    saveBox() {
        if (!this.isBoxFormValid()) {
            return;
        }

        this.boxService.saveBox(this.selectedBox).subscribe(res => {
            if (res.status == 200) {
                this.notification.success(res.message)
                $('#newBoxRow').slideUp(300);
                this.loadDevices();
            } else {
                this.notification.error(res.message);
            }
        });
    }

    isBoxFormValid() {

        const $validator = $('.boxForm').validate({
            rules: {
                boxName: {
                    required: true
                }
            }
        });

        var $valid = $('.boxForm').valid();
        if (!$valid) {
            this.notification.warning("Box form is not valid. Please enter required fields. ")
            $validator.focusInvalid();
            return false;
        }

        if (this.selectedBox.agent.isCpEnabled && (!this.selectedBox.agent.captivePortalIp
            || !ValidationService.isValidIpString(this.selectedBox.agent.captivePortalIp))) {
            this.notification.warning("Please enter a valid IP for captive portal");
            return false;
        }

        return true;
    }

    deleteDevice(id: number) {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'Settings for this device will be deleted!').subscribe(
            res => {
                if (res) {
                    this.agentService.deleteDevice([id]).subscribe(res => {
                        if (res.status == 200) {
                            this.notification.success(res.message)
                            this.loadDevices();
                        } else {
                            this.notification.error(res.message)
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
                    let ids = [];
                    for (let i = 0; i < this.registereds.length; i++) {
                        const e = this.registereds[i];
                        if (e.agentGroup && e.agentGroup.id == id) {
                            ids.push(e.id)
                        }
                    }

                    this.agentService.deleteDevice(ids).subscribe(res => {
                        if (res.status == 200) {
                            this.closeModal();
                            this.notification.success(res.message)
                            this.loadDevices();
                        } else {
                            this.notification.error(res.message)
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
                        this.boxService.deleteBox(id).subscribe(res => {
                            if (res.status == 200) {
                                this.notification.success(res.message);
                                this.loadDevices();
                            } else {
                                this.notification.error(res.message);
                            }
                        });
                    }
                }
            );

        }
    }

    changeBoxCPStatus() {
        this.selectedBox.agent.isCpEnabled = this.selectedBox.agent.isCpEnabled ? false : true;
    }

    securityProfileChanged(type: string, profileId: number) {
        if (type && type.toLowerCase() == 'box') {
            this.selectedBox.agent.rootProfile = JSON.parse(JSON.stringify(this.securityProfiles.find(s => s.id == profileId)));
        } else if (type && type.toLowerCase() == 'agent') {
            this.selectedAgent.rootProfile = JSON.parse(JSON.stringify(this.securityProfiles.find(s => s.id == profileId)));
        }
    }

    deviceProfileChanged(mac: string, profileId: number) {
        this.unregistereds.find(d => d.agentInfo.mac == mac).agentGroup = null
        this.unregistereds.find(d => d.agentInfo.mac == mac).rootProfile =
            JSON.parse(JSON.stringify(this.securityProfiles.find(s => s.id == profileId)));

        $('#unregisteredTable').animate({ scrollLeft: '+=500' }, 1000);
    }

    deviceGroupChanged(mac: string, groupId: number) {
        this.unregistereds.find(d => d.agentInfo.mac == mac).agentGroup =
            { id: groupId, groupName: this.groupList.find(g => g.id == groupId).groupName };
        this.unregistereds.find(d => d.agentInfo.mac == mac).rootProfile = null;
        $('#unregisteredTable').animate({ scrollLeft: '+=500' }, 1000);
    }

    showProfileEditWizard(id: number) {
        let device = this.registereds.find(r => r.id == id);
        if (device.rootProfile && device.rootProfile.id > 0) {
            this.selectedAgent = device;
            this.saveMode = 'ProfileUpdate';
            $('#devicePanel').toggle("slide", { direction: "left" }, 600);
            $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
            this.startWizard = true;
        } else {
            this.notification.warning('Profile can not find!');
        }
    }

    checkIPNumber(event: KeyboardEvent, inputValue: string) {

        let allowedChars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "Backspace", "ArrowLeft", "ArrowRight", ".", "Tab"];
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

    groupProfileChanged(id: number) {
        this.deviceGroup.rootProfile = this.securityProfiles.find(p => p.id == id);
    }

    deviceCache: AgentInfo[] = []
    moveDeviceInGroup(opType: number, mac: string) {
        if (opType == 1) {
            const d = this.devicesForGroup.find(u => u.mac == mac)
            this.deviceGroup.agents.push(d);
            this.devicesForGroup.splice(this.devicesForGroup.findIndex(x => x.mac == mac), 1);
            if (d.id && d.id > 0 && this.deviceCache.find(c => c.id == d.id)) {
                this.deviceCache.splice(this.deviceCache.findIndex(c => c.mac == d.mac), 1)
            }
        } else {
            const d = this.deviceGroup.agents.find(u => u.mac == mac)
            if (d.id && d.id > 0) {
                this.deviceCache.push(d);
            }
            this.devicesForGroup.push(d);
            this.deviceGroup.agents.splice(this.deviceGroup.agents.findIndex(x => x.mac == mac), 1);
        }

    }

    openModal() {
        this.deviceGroup = new DeviceGroup();
        let agents = [];
        this.unregistereds.forEach(u => agents.push(u.agentInfo))
        this.devicesForGroup = JSON.parse(JSON.stringify(agents));
        $(document.body).addClass('modal-open');
        $('#exampleModal').css('display', 'block');
        $('#exampleModal').attr('aria-hidden', 'false');
        $('#exampleModal').addClass('show');
    }

    openModalForEdit(id: number) {
        this.deviceCache = []
        this.deviceGroup = new DeviceGroup()
        const d = this.registereds.find(r => r.id == id);

        if (d.agentGroup && d.agentGroup.id > 0) {
            this.deviceGroup.agentGroup = d.agentGroup
            this.registereds.filter(r => (r.agentGroup && r.agentGroup.id == d.agentGroup.id)).forEach(f => {
                this.deviceGroup.agents.push(
                    {
                        agentAlias: f.agentAlias,
                        agentType: AgentType.DEVICE,
                        mac: f.mac,
                        blockMessage: f.blockMessage,
                        id: f.id
                    }
                )
            })
            this.deviceGroup.rootProfile = d.rootProfile;

            console.log('device groups', this.deviceGroup);
        }
        let agents = [];
        this.unregistereds.forEach(u => agents.push(u.agentInfo))
        this.devicesForGroup = JSON.parse(JSON.stringify(agents));

        $(document.body).addClass('modal-open');
        $('#exampleModal').css('display', 'block');
        $('#exampleModal').attr('aria-hidden', 'false');
        $('#exampleModal').addClass('show');
    }

    closeModal() {
        $(document.body).removeClass('modal-open');
        $('#exampleModal').css('display', 'none');
        $('#exampleModal').attr('aria-hidden', 'true');
        $('#exampleModal').removeClass('show');
    }

    previousGroupId = 0;
    currentCss = '';
    isSameGroup(gId: AgentGroup) {

        if (gId) {
            if (gId.id == this.previousGroupId) {
                return this.currentCss;
            } else {
                this.currentCss = this.currentCss == '' ? 'baseTableRow' : '';
            }
            this.previousGroupId = gId.id
        }

        return this.currentCss;

    }
}
