import { Component, OnInit, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgentService } from 'src/app/core/services/agent.service';
import { AgentResponse } from 'src/app/core/models/AgentResponse';
import { MobileCategory } from 'src/app/core/models/MobileCategory';
import { AlertService } from 'src/app/core/services/alert.service';
import { TimeProfileResponse } from 'src/app/core/models/TimeProfileResponse';
import { CollectiveBlockRequest } from 'src/app/core/models/CollectiveBlockRequest';
import { CollectiveCategory } from 'src/app/core/models/CollectiveCategory';
import { DayProfileGroup } from 'src/app/core/models/DayProfileGroup';
import { BoxService } from 'src/app/core/services/BoxService';
import { Box } from 'src/app/core/models/Box';

declare var $: any;

@Component({
    selector: 'app-devices',
    templateUrl: 'devices.component.html',
    styleUrls: ['devices.component.sass']
})
export class DevicesComponent implements OnInit, OnChanges, AfterViewInit {

    registeredCount: number = 0;
    unregisteredCount: number = 0;
    registered: AgentResponse[];
    unregistered: AgentResponse[];
    profiles: TimeProfileResponse;
    mobileCategories: MobileCategory[];
    notUpdatedCategories: MobileCategory[] = [];
    device: AgentResponse;
    deviceForm: FormGroup;
    collectiveBlockReq: CollectiveBlockRequest = new CollectiveBlockRequest();
    selectedProfile: DayProfileGroup;
    boxes: Box[] = [];

    constructor(private agentService: AgentService, private formBuilder: FormBuilder, private alertService: AlertService,
        private boxService: BoxService) {

        this.boxService.getBoxes().subscribe(b => this.boxes = b);
        this.initializeVariables();

        this.agentService.getRegisteredAgents().subscribe(data => { this.registered = data; this.registeredCount = data.length });
        this.agentService.getUnRegisteredAgents().subscribe(data => { this.unregistered = data; this.unregisteredCount = data.length; });
        this.agentService.getProfiles().subscribe(data => this.profiles = data);

    }

    initializeVariables() {
        this.device = new AgentResponse();
        this.device.id = null;
        this.device.agentAlias = null;
        this.device.agentCode = null;
    }

    isFieldValid(form: FormGroup, field: string) {
        return !form.get(field).valid && form.get(field).touched;
    }
    displayFieldCss(form: FormGroup, field: string) {
        return {
            'has-error': this.isFieldValid(form, field),
            'has-feedback': this.isFieldValid(form, field)
        };
    }

    ngOnInit() {

        this.deviceForm =
            this.formBuilder.group({
                deviceName: ["", [Validators.required, Validators.minLength(2)]]
            }
            );
    }

    installWizard() {

        // Code for the Validator
        const $validator = $('.card-wizard form').validate({
            rules: {
                deviceName: {
                    required: true,
                    minlength: 3
                }
            },

            highlight: function (element) {
                $(element).closest('.form-group').removeClass('has-success').addClass('has-danger');
            },
            success: function (element) {
                $(element).closest('.form-group').removeClass('has-danger').addClass('has-success');
            },
            errorPlacement: function (error, element) {
                $(element).append(error);
            }
        });

        // Wizard Initialization
        $('.card-wizard').bootstrapWizard({
            'tabClass': 'nav nav-pills',
            'nextSelector': '.btn-next',
            'previousSelector': '.btn-previous',

            onNext: function () {
                var $valid = $('.card-wizard form').valid();
                document.getElementById('wizardPanel').scrollIntoView();
                if (!$valid) {
                    $validator.focusInvalid();
                    return false;
                }
            },

            onInit: function (tab: any, navigation: any, index: any) {

                // check number of tabs and fill the entire row
                let $total = navigation.find('li').length;
                let $wizard = navigation.closest('.card-wizard');

                let $first_li = navigation.find('li:first-child a').html();
                let $moving_div = $('<div class="moving-tab">' + $first_li + '</div>');
                $('.card-wizard .wizard-navigation').append($moving_div);

                $total = $wizard.find('.nav li').length;
                let $li_width = 100 / $total;

                let total_steps = $wizard.find('.nav li').length;
                let move_distance = $wizard.width() / total_steps;
                let index_temp = index;
                let vertical_level = 0;

                let mobile_device = $(document).width() < 600 && $total > 3;

                if (mobile_device) {
                    move_distance = $wizard.width() / 2;
                    index_temp = index % 2;
                    $li_width = 50;
                }

                $wizard.find('.nav li').css('width', $li_width + '%');

                let step_width = move_distance;
                move_distance = move_distance * index_temp;

                let $current = index + 1;

                if ($current == 1 || (mobile_device == true && (index % 2 == 0))) {
                    move_distance -= 8;
                } else if ($current == total_steps || (mobile_device == true && (index % 2 == 1))) {
                    move_distance += 8;
                }

                if (mobile_device) {
                    let x: any = index / 2;
                    vertical_level = parseInt(x);
                    vertical_level = vertical_level * 38;
                }

                $wizard.find('.moving-tab').css('width', step_width);
                $('.moving-tab').css({
                    'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
                    'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'

                });
                $('.moving-tab').css('transition', 'transform 0s');
            },

            onTabClick: function () {

                const $valid = $('.card-wizard form').valid();

                if (!$valid) {
                    return false;
                } else {
                    return true;
                }
            },

            onTabShow: function (tab: any, navigation: any, index: any) {
                let $total = navigation.find('li').length;
                let $current = index + 1;

                const $wizard = navigation.closest('.card-wizard');

                // If it's the last tab then hide the last button and show the finish instead
                if ($current >= $total) {
                    $($wizard).find('.btn-next').hide();
                    $($wizard).find('.btn-finish').show();
                } else {
                    $($wizard).find('.btn-next').show();
                    $($wizard).find('.btn-finish').hide();
                }

                const button_text = navigation.find('li:nth-child(' + $current + ') a').html();

                setTimeout(function () {
                    $('.moving-tab').text(button_text);
                }, 150);

                const checkbox = $('.footer-checkbox');

                if (index !== 0) {
                    $(checkbox).css({
                        'opacity': '0',
                        'visibility': 'hidden',
                        'position': 'absolute'
                    });
                } else {
                    $(checkbox).css({
                        'opacity': '1',
                        'visibility': 'visible'
                    });
                }
                $total = $wizard.find('.nav li').length;
                let $li_width = 100 / $total;

                let total_steps = $wizard.find('.nav li').length;
                let move_distance = $wizard.width() / total_steps;
                let index_temp = index;
                let vertical_level = 0;

                let mobile_device = $(document).width() < 600 && $total > 3;

                if (mobile_device) {
                    move_distance = $wizard.width() / 2;
                    index_temp = index % 2;
                    $li_width = 50;
                }

                $wizard.find('.nav li').css('width', $li_width + '%');

                let step_width = move_distance;
                move_distance = move_distance * index_temp;

                $current = index + 1;

                if ($current == 1 || (mobile_device == true && (index % 2 == 0))) {
                    move_distance -= 8;
                } else if ($current == total_steps || (mobile_device == true && (index % 2 == 1))) {
                    move_distance += 8;
                }

                if (mobile_device) {
                    let x: any = index / 2;
                    vertical_level = parseInt(x);
                    vertical_level = vertical_level * 38;
                }

                $wizard.find('.moving-tab').css('width', step_width);
                $('.moving-tab').css({
                    'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
                    'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'

                });
            }
        });


        $('[data-toggle="wizard-radio"]').click(function () {
            const wizard = $(this).closest('.card-wizard');
            wizard.find('[data-toggle="wizard-radio"]').removeClass('active');
            $(this).addClass('active');
            $(wizard).find('[type="radio"]').removeAttr('checked');
            $(this).find('[type="radio"]').attr('checked', 'true');
        });

        $('[data-toggle="wizard-checkbox"]').click(function () {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(this).find('[type="checkbox"]').removeAttr('checked');
            } else {
                $(this).addClass('active');
                $(this).find('[type="checkbox"]').attr('checked', 'true');
            }
        });

        $('.set-full-height').css('height', 'auto');

        document.getElementById("previous").onclick = function () {
            document.getElementById('wizardPanel').scrollIntoView();
        };

    }

    ngOnChanges(changes: SimpleChanges) {
        const input = $(this);

        if (input[0].files && input[0].files[0]) {
            const reader: any = new FileReader();

            reader.onload = function (e: any) {
                $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
            };
            reader.readAsDataURL(input[0].files[0]);
        }
    }

    ngAfterViewInit() {

        $(window).resize(() => {
            $('.card-wizard').each(function () {

                const $wizard = $(this);
                const index = $wizard.bootstrapWizard('currentIndex');
                let $total = $wizard.find('.nav li').length;
                let $li_width = 100 / $total;

                let total_steps = $wizard.find('.nav li').length;
                let move_distance = $wizard.width() / total_steps;
                let index_temp = index;
                let vertical_level = 0;

                let mobile_device = $(document).width() < 600 && $total > 3;

                if (mobile_device) {
                    move_distance = $wizard.width() / 2;
                    index_temp = index % 2;
                    $li_width = 50;
                }

                $wizard.find('.nav li').css('width', $li_width + '%');

                let step_width = move_distance;
                move_distance = move_distance * index_temp;

                let $current = index + 1;

                if ($current == 1 || (mobile_device == true && (index % 2 == 0))) {
                    move_distance -= 8;
                } else if ($current == total_steps || (mobile_device == true && (index % 2 == 1))) {
                    move_distance += 8;
                }

                if (mobile_device) {
                    let x: any = index / 2;
                    vertical_level = parseInt(x);
                    vertical_level = vertical_level * 38;
                }

                $wizard.find('.moving-tab').css('width', step_width);
                $('.moving-tab').css({
                    'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
                    'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
                });

                $('.moving-tab').css({
                    'transition': 'transform 0s'
                });
            });
        });
    }

    showNewWizard(agentCode: string) {
        this.agentService.getProfiles().subscribe(data => this.profiles = data);
        this.device = this.unregistered.find(d => d.agentCode == agentCode);
        this.agentService.getMobileCategories(0).subscribe(data => this.mobileCategories = data);

        this.collectiveBlockReq = new CollectiveBlockRequest();
        this.collectiveBlockReq.agent = new AgentResponse();
        this.collectiveBlockReq.agent = this.device;
        this.collectiveBlockReq.collectiveCategories = new Array;

        $('#devicePanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);

        document.getElementById('wizardPanel').scrollIntoView();

        this.installWizard();
        $('#contentLink').click();

        console.log(this.collectiveBlockReq);
    }

    showEditWizard(id: string) {
        this.agentService.getProfiles().subscribe(data => this.profiles = data);
        this.device = this.registered.find(d => d.id == Number(id));

        this.collectiveBlockReq = new CollectiveBlockRequest();
        this.collectiveBlockReq.agent = new AgentResponse();
        this.collectiveBlockReq.agent = this.device;
        this.collectiveBlockReq.collectiveCategories = new Array;

        this.agentService.getMobileCategories(Number(id)).subscribe(data => {
            this.mobileCategories = data;
            this.mobileCategories.forEach(i => {
                if (i.blocked == true || i.profile) {
                    let cc = new CollectiveCategory();
                    cc.block = i.blocked;
                    cc.category = i;
                    if (i.profile) {
                        cc.profileId = i.profile.id;
                    }
                    this.collectiveBlockReq.collectiveCategories.push(cc);
                }

            });
        });

        $('#devicePanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
        document.getElementById('wizardPanel').scrollIntoView();
        this.installWizard();
        $('#contentLink').click();

        console.log(this.collectiveBlockReq);
    }

    hideWizard() {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'Your Changes will be cancelled!').subscribe(
            res => {
                if (res) {
                    $('#wizardPanel').toggle("slide", { direction: "right" }, 1000);
                    $('#devicePanel').toggle("slide", { direction: "left" }, 1000);
                    $('#profilePanel').slideUp(300);

                    this.agentService.getRegisteredAgents().subscribe(data => { this.registered = data; this.registeredCount = data.length });
                    this.agentService.getUnRegisteredAgents().subscribe(data => { this.unregistered = data; this.unregisteredCount = data.length; });
                }
            }
        );
    }

    allowCategory(id: number) {
        this.mobileCategories.find(m => m.id == id).blocked = false;

        if (this.collectiveBlockReq.agent.id && this.collectiveBlockReq.agent.id > 0) {
            if (this.notUpdatedCategories.find(m => m.id == id)) {
                this.collectiveBlockReq.collectiveCategories.splice(this.collectiveBlockReq.collectiveCategories.findIndex(c => c.category.id == id), 1);
                this.notUpdatedCategories.splice(this.notUpdatedCategories.findIndex(n => n.id == id));
            } else {
                this.collectiveBlockReq.collectiveCategories.find(c => c.category.id == id).block = false;
            }
        } else {
            this.collectiveBlockReq.collectiveCategories.splice(this.collectiveBlockReq.collectiveCategories.findIndex(c => c.category.id == id), 1);
            this.notUpdatedCategories.splice(this.notUpdatedCategories.findIndex(n => n.id == id));
        }

        $('#profilePanel').hide();
        console.log(this.collectiveBlockReq);
    }
    blockCategory(id: number) {
        this.mobileCategories.find(m => m.id == id).blocked = true;
        let mc: MobileCategory = this.mobileCategories.find(m => m.id == id);
        debugger;
        if (this.collectiveBlockReq.collectiveCategories.find(c => c.category.id == id)) {
            this.collectiveBlockReq.collectiveCategories.find(c => c.category.id == id).block = true;
            if (this.collectiveBlockReq.collectiveCategories.find(c => c.category.id == id).category.categoryType == 1) {
                this.collectiveBlockReq.collectiveCategories.find(c => c.category.id == id).profileId = null;
            }
        } else {
            let cc = new CollectiveCategory();
            cc.block = true;
            cc.category = mc;
            this.collectiveBlockReq.collectiveCategories.push(cc);
            this.notUpdatedCategories.push(cc.category);
        }

        $('#profilePanel').hide();

        console.log(this.collectiveBlockReq);
    }

    postCollectiveBlock() {

        this.collectiveBlockReq.agent.agentAlias = this.device.agentAlias;

        this.agentService.collectiveBlock(this.collectiveBlockReq).subscribe(d => {
            this.alertService.alertSuccessMessage("Operation Successful", "Options changed for agent: " + this.collectiveBlockReq.agent.agentAlias);

            $('#wizardPanel').toggle("slide", { direction: "right" }, 1000);
            $('#devicePanel').toggle("slide", { direction: "left" }, 1000);
            this.agentService.getProfiles().subscribe(d => this.profiles = d);
        });

    }

    selectCategoryProfile(catId: number, pId: number) {

        if (pId == 0) { // remove profile
            this.mobileCategories.find(m => m.id == catId).profile = null;
            if (this.notUpdatedCategories.find(n => n.id == catId)) {
                this.collectiveBlockReq.collectiveCategories.splice(this.collectiveBlockReq.collectiveCategories.findIndex(c => c.category.id == catId), 1);
                this.notUpdatedCategories.splice(this.notUpdatedCategories.findIndex(n => n.id == catId));
            }

        } else {
            this.mobileCategories.find(m => m.id == catId).profile = this.profiles.profileDay.find(p => p.id == pId);

            if (this.collectiveBlockReq.collectiveCategories.find(cc => cc.category.id == catId)) {
                this.collectiveBlockReq.collectiveCategories.find(cc => cc.category.id == catId).profileId = pId;
            } else {
                let cc = new CollectiveCategory();
                cc.block = false;
                cc.category = this.mobileCategories.find(m => m.id == catId);
                cc.profileId = pId;
                this.collectiveBlockReq.collectiveCategories.push(cc)
                this.notUpdatedCategories.push(cc.category);
            }

        }

        console.log(this.collectiveBlockReq);

        $(".dropdown-menu").removeClass("show");
        this.closeProfilePanel();
    }

    deleteAgent(agent: AgentResponse) {
        this.alertService.alertWarningAndCancel('Are You Sure?', 'Settings for this device will be deleted!').subscribe(
            res => {
                if (res) {
                    this.agentService.deleteAgent(agent);
                }
            }
        );

    }

    openEditProfilePanel(id: number) {

        this.agentService.getProfiles().subscribe(d => this.selectedProfile = d.profileDay.find(p => p.id == id));

        $('#profilePanel').slideDown(300);
    }

    deleteProfile(id: number) {

        alert("you clicked delete" + id);
    }

    closeProfilePanel() {
        $('#profilePanel').slideUp(300);
    }

    addNewProfile() {

        this.selectedProfile = new DayProfileGroup();

        $('#profilePanel').slideDown(300);

    }


}
