import { Component, OnInit, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/core/services/config.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TranslatorService } from 'src/app/core/services/translator.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgentService } from 'src/app/core/services/agent.service';
import { AgentResponse } from 'src/app/core/models/AgentResponse';
import { Observable } from 'rxjs';
import { ValidationService } from 'src/app/core/services/validation.service';
import { MobileCategory } from 'src/app/core/models/MobileCategory';
import { AlertService } from 'src/app/core/services/alert.service';

declare var $: any;

@Component({
    selector: 'app-devices',
    templateUrl: 'devices.component.html',
    styleUrls: ['devices.component.sass']
})
export class DevicesComponent implements OnInit, OnChanges, AfterViewInit {

    public registered: AgentResponse[];
    public unregistered: AgentResponse[];
    mobileCategories: MobileCategory[];
    device: AgentResponse;
    deviceForm: FormGroup;

    constructor(private agentService: AgentService, private formBuilder: FormBuilder, private notification: NotificationService,
         private alert: AlertService) {
        this.device = new AgentResponse();
        this.device.id = null;
        this.device.agentAlias = null;
        this.device.agentCode = null;

        this.agentService.getRegisteredAgents().subscribe(data => this.registered = data);
        this.agentService.getUnRegisteredAgents().subscribe(data => this.unregistered = data);
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

            onNext: function (tab, navigation, index) {
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

            onTabClick: function (tab: any, navigation: any, index: any) {

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


        // Prepare the preview for profile picture
        $('#wizard-picture').change(function () {
            const input = $(this);

            if (input[0].files && input[0].files[0]) {
                const reader = new FileReader();

                reader.onload = function (e: any) {
                    $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
                };
                reader.readAsDataURL(input[0].files[0]);
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

        this.device = this.unregistered.find(d => d.agentCode == agentCode);
        this.agentService.getMobileCategories(0).subscribe(data => this.mobileCategories = data);

        //TODO: Reset wizard form

        $('#devicePanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);

        document.getElementById('wizardPanel').scrollIntoView();
        this.installWizard();
    }

    showEditWizard(id: string) {

        this.device = this.registered.find(d => d.id == Number(id));
        this.agentService.getMobileCategories(Number(id)).subscribe(data => this.mobileCategories = data);

        //TODO: Restart Wizard Form

        $('#devicePanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);

        document.getElementById('wizardPanel').scrollIntoView();
        this.installWizard();
    }

    hideWizard() {
        this.alert.alertWarningAndCancel('Are You Sure?', 'Your Changes will be cancelled!').subscribe(
            res => {
                if (res) {
                    $('#wizardPanel').toggle("slide", { direction: "right" }, 1000);
                    $('#devicePanel').toggle("slide", { direction: "left" }, 1000);            
                }
            }
        );       
    }

    saveAgent() {
        this.alert.alertSuccessMessage("Agent Register Operation","You Clicked finish button");

    }




}
