import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from 'src/app/core/services/validation.service';
import * as phoneNumberCodesList from "src/app/core/models/PhoneNumberCodes";
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { User } from 'src/app/core/models/User';
import { AlertService } from 'src/app/core/services/alert.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/UserService';
import { Role } from 'src/app/core/models/Role';

declare var $: any;
@Component({
    selector: 'app-users',
    templateUrl: 'users.component.html',
    styleUrls: ['users.component.sass']
})
export class UsersComponent implements OnInit {
    userForm: FormGroup;
    userList: User[] = [];
    selectedUser: User = new User();
    roleList: Role[] = [];

    constructor(private formBuilder: FormBuilder, private authService: AuthenticationService, private notification: NotificationService,
        private alert: AlertService, private userService: UserService) {

        this.userService.getUsers().subscribe(res => {
            this.userList = res
            console.log(res);
        });
        this.userService.getRoles().subscribe(res => this.roleList = res);

    }

    ngOnInit() {
        this.createForms();
    }

    createForms() {

        this.userForm =
            this.formBuilder.group({
                "name": ["", [Validators.required, Validators.minLength(2)]],
                "surname": ["", [Validators.required, Validators.minLength(2)]],
                "email": ["", [Validators.required, ValidationService.emailValidator]],
                "locked": [""],
                "active": [""],
                "role": ["", [Validators.required]],
                "password": ["", [Validators.required]],
                "passwordAgain": ["", [Validators.required]],
            }, { validator: Validators.compose([ValidationService.matchingPasswords("password", "passwordAgain")]) }
            );

    }

    showNewWizard() {
        this.selectedUser = new User();

        $('#listPanel').toggle("slide", { direction: "left" }, 600);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 600);

        this.installWizard();
        $('#contentLink').click();
    }

    showEditWizard(id: Number) {
        this.selectedUser = this.userList.find(r => r.id == id);

        console.log(this.selectedUser);

        $('#listPanel').toggle("slide", { direction: "left" }, 500);
        $('#wizardPanel').toggle("slide", { direction: "right" }, 500);

        this.installWizard();
        $('#contentLink').click();
    }

    hideWizard() {
        this.alert.alertWarningAndCancel('Are You Sure?', 'Your Changes will be cancelled!').subscribe(
            res => {
                this.userService.getUsers().subscribe(ul => this.userList = ul);
                if (res) {
                    $('#wizardPanel').toggle("slide", { direction: "right" }, 600);
                    $('#listPanel').toggle("slide", { direction: "left" }, 600);
                }
            }
        );
    }

    changeLockStatus() {
        this.selectedUser.locked = this.selectedUser.locked === true ? false : true;
    }

    changeActiveStatus() {
        this.selectedUser.active = this.selectedUser.active === true ? false : true;
    }

    changeLockedStatusOnRow(id: number) {

    }

    changeActiveStatusOnRow(id: number) {

    }

    userFormSubmit() {
        debugger;

        if (!this.selectedUser.locked) {
            this.selectedUser.locked = false;
        }

        if (!this.selectedUser.active) {
            this.selectedUser.active = false;
        }

        if (this.userForm.dirty && this.userForm.valid && this.selectedUser) {
            this.userService.save(this.selectedUser).subscribe(res => {
                if (res.status == 200) {
                    this.notification.success(res.message);
                } else {
                    this.notification.error(res.message);
                }
            });
        } else {
            return;
        }
    }

    deleteUser(id: number) {
        if (id) {
            this.alert.alertWarningAndCancel('Are You Sure?', 'Selected User will be deleted!').subscribe(
                res => {
                    if (res) {
                        this.userService.delete(this.userList.find(u => u.id == id)).subscribe(res => {
                            if (res.status == 200) {
                                this.notification.success(res.message);
                            } else {
                                this.notification.error(res.message);
                            }
                        });
                    }
                }
            );
        }
    }

    installWizard() {

        // Code for the Validator
        const $validator = $('.card-wizard form').validate({
            rules: {
                name: {
                    required: true,
                    minlength: 3
                },
                surname: {
                    required: true,
                    minlength: 5
                },
                email: {
                    required: true,
                    minlength: 5
                },
                password: {
                    required: true,
                    minlength: 6
                },
                passwordAgain: {
                    required: true,
                    minlength: 6
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

        document.getElementById("finish").onclick = function () {
            var $valid = $('.card-wizard form').valid();
            document.getElementById('wizardPanel').scrollIntoView();
            if (!$valid) {
                $validator.focusInvalid();
                return false;
            }
        };

    }


}
