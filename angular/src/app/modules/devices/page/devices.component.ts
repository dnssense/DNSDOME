import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgentService } from 'src/app/core/services/agent.service';
import { AgentResponse } from 'src/app/core/models/AgentResponse';
import { AlertService } from 'src/app/core/services/alert.service';
import { Box } from 'src/app/core/models/Box';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Agent } from 'src/app/core/models/Agent';
import { AgentType } from 'src/app/core/models/AgentType';
import { SecurityProfile, SecurityProfileItem, BlackWhiteListProfile } from 'src/app/core/models/SecurityProfile';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { BoxService } from 'src/app/core/services/box.service';
import { ValidationService } from 'src/app/core/services/validation.service';

declare var $: any;

@Component({
    selector: 'app-devices',
    templateUrl: 'devices.component.html',
    styleUrls: ['devices.component.sass']
})
export class DevicesComponent implements OnInit {
    ipv4Pattern = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    registeredCount: number = 0;
    unregisteredCount: number = 0;
    registered: AgentResponse[];
    unregistered: AgentResponse[];
    // profiles: TimeProfileResponse;
    // mobileCategories: MobileCategory[];
    // notUpdatedCategories: MobileCategory[] = [];
    device: AgentResponse;
    boxForm: FormGroup;
    //  collectiveBlockReq: CollectiveBlockRequest = new CollectiveBlockRequest();
    //selectedProfile: DayProfileGroup;
    //boxes: Box[] = [];
    selectedBox: Box = new Box();
    isNewProfileSelected: boolean = false;
    boxes: Box[] = [];
    deviceAgents: Agent[] = [];
    selectedAgent: Agent = new Agent();
    securityProfiles: SecurityProfile[] = [];
    startWizard: boolean;
    saveMode: String;
    isNewItemUpdated: boolean = true;

    constructor(private agentService: AgentService, private formBuilder: FormBuilder, private alertService: AlertService,
        private boxService: BoxService, private notification: NotificationService) {

        this.selectedBox = new Box();
        this.selectedBox.agent = new Agent();

        this.loadBoxes();

        // this.agentService.getRegisteredAgents().subscribe(data => { this.registered = data; this.registeredCount = data.length });
        // this.agentService.getUnRegisteredAgents().subscribe(data => { this.unregistered = data; this.unregisteredCount = data.length; });

        this.defineNewAgentForProfile();
    }

    loadBoxes() {
        this.boxService.getBoxes().subscribe(res => {
            this.boxes = res;
        });
        this.agentService.getSecurityProfiles().subscribe(res => this.securityProfiles = res);
    }

    defineNewAgentForProfile() {
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

    showNewWizard(type: string, id: number) {

        if (type == AgentType.BOX.toString()) {
            this.selectedBox = this.boxes.find(a => a.id == id);
            // this.selectedAgent.rootProfile = this.securityProfiles[0];
        } else {
            this.selectedAgent = this.deviceAgents.find(a => a.id == id);
            this.selectedAgent.rootProfile = this.securityProfiles[0];
        }

        $('#devicePanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
        this.startWizard = true;
        document.getElementById('wizardPanel').scrollIntoView();

    }

    showEditWizard(type: string, id: number) {

        if (type == AgentType.BOX.toString()) {
            this.selectedBox = JSON.parse(JSON.stringify(this.boxes.find(c => c.id == id)));
            if (!this.selectedBox.agent) {
                this.defineNewAgentForProfile();
                this.selectedBox.agent = this.selectedAgent;
            }
            $('#newBoxRow').slideDown(300);
        } else {
            this.selectedAgent = this.deviceAgents.find(a => a.id == id);
            this.selectedAgent.rootProfile = this.securityProfiles[0];
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
        this.defineNewAgentForProfile();
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
        this.loadBoxes();
    }

    saveBox() {

        if (!this.isBoxFormValid()) {
            return;
        }


        this.boxService.saveBox(this.selectedBox).subscribe(res => {
            if (res.status == 200) {
                this.notification.success(res.message)
                $('#newBoxRow').slideUp(300);
                this.loadBoxes();
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

    deleteAgent(id: number) {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'Settings for this device will be deleted!').subscribe(
            res => {
                if (res) {
                    //id ile agenti bulup gonder
                    // this.agentService.deleteAgent(null);
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
                                this.loadBoxes();
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
            // if (!this.selectedBox.agent) {
            //     this.defineNewAgentForProfile();
            //     this.selectedBox.agent = this.selectedAgent;
            // }

            this.selectedBox.agent.rootProfile = JSON.parse(JSON.stringify(this.securityProfiles.find(s => s.id == profileId)));

        } else if (type && type.toLowerCase() == 'agent') {
            this.selectedAgent.rootProfile = JSON.parse(JSON.stringify(this.securityProfiles.find(s => s.id == profileId)));
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
}
