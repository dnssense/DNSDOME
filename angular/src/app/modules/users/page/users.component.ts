import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from 'src/app/core/services/validation.service';
import { User, UserExtended } from 'src/app/core/models/User';
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
    modalStatus: string = "create";
    userForm: FormGroup;
    userList: User[] = [];
    selectedUser: User = new User();
    roleList: Role[] = [];

    constructor(private formBuilder: FormBuilder, private notification: NotificationService,
        private alert: AlertService, private userService: UserService) {

        this.selectedUser.roles = new Role();
        this.selectedUser.roles.name = 'ROLE_CUSTOMER';

        this.userService.getUsers().subscribe(res => {
            this.userList = res;
        });

        this.roleList = this.userService.getRoles();

    }

    ngOnInit() {
        this.userForm =
            this.formBuilder.group({
                //  "name": ["", [Validators.required, Validators.minLength(2)]], "surname": ["", []],
                "email": ["", [Validators.required, ValidationService.emailValidator]],
                "role": ["", [Validators.required]],
                "password": ["", [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]],
                "passwordAgain": ["", []],
            }
                //, { validator: Validators.compose([ValidationService.matchingPasswords("password", "passwordAgain")]) }
            );
    }

    userFriendlyRoleName(r: string) {
        if (r == 'ROLE_CUSTOMER') {
            return 'ADMIN';
        } else if (r == 'ROLE_USER') {
            return 'USER';
        } else {
            return 'Not Defined'
        }
    }

    showNewWizard() {
        this.selectedUser = new UserExtended();
        this.selectedUser.roles = new Role();
        this.selectedUser.roles.id = 2;
        this.modalStatus = 'create'
        this.openModal();
    }

    showEditWizard(id: Number) {

        let u = this.userList.find(r => r.id == id);
        this.selectedUser = JSON.parse(JSON.stringify(u));
        this.selectedUser.roles.name = u.roles[0].name;
        this.modalStatus = 'edit'
        this.openModal();
    }

    openModal() {
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

    changeLockStatus() {
        this.selectedUser.isLocked = this.selectedUser.isLocked === 1 ? 0 : 1;
    }

    changeActiveStatus() {
        this.selectedUser.isActive = this.selectedUser.isActive === 1 ? 0 : 1;
    }

    changeLockedStatusOnRow(id: number) {
        if (id) {
            let user = this.userList.find(u => u.id == id);
            user.locked = user.locked === true ? false : true;
            this.userService.save(user).subscribe(res => {
                if (res.status == 200) {
                    this.userService.getUsers().subscribe(res => this.userList = res);
                    this.notification.success(res.message);
                } else {
                    this.notification.error(res.message);
                }
            });
        }
    }

    changeActiveStatusOnRow(id: number) {
        if (id) {
            let user = this.userList.find(u => u.id == id);
            user.active = user.active === true ? false : true;
            this.userService.save(user).subscribe(res => {
                if (res.status == 200) {
                    this.userService.getUsers().subscribe(res => this.userList = res);
                    this.notification.success(res.message);
                } else {
                    this.notification.error(res.message);
                }
            });
        }
    }

    passStrength = 0;
    checkPasswordStrength() {
        this.passStrength = 0;
        if (!this.selectedUser.password || this.selectedUser.password.length < 1) {
            return;
        }

        if (/[a-z]/.test(this.selectedUser.password)) {
            this.passStrength++;
        }
        if (/[A-Z]/.test(this.selectedUser.password)) {
            this.passStrength++;
        }
        if (/[0-9]/.test(this.selectedUser.password)) {
            this.passStrength++;
        }
        if (this.selectedUser.password && this.selectedUser.password.length > 7) {
            this.passStrength++;
        }

    }

    userFormSubmit() {

        if (this.userForm.dirty && this.userForm.valid) {
            if (this.modalStatus == 'create') {
                let user = {
                    id: this.selectedUser.id,
                    username: this.selectedUser.username,
                    name: this.selectedUser.name,
                    password: this.selectedUser.password,
                    roles: [this.selectedUser.roles.name]
                }
                if (this.userForm.dirty && this.userForm.valid && user) {
                    this.userService.save(user).subscribe(res => {
                        if (res.key) {
                            this.closeModal();
                            this.notification.success('User Created.');
                            this.userService.getUsers().subscribe(res => this.userList = res);
                        } else {
                            this.notification.error(res.message);
                        }
                    });
                } else {
                    this.notification.warning('User Form is not valid!');
                    return;
                }
            } else {
                let user = {
                    id: this.selectedUser.id,
                    username: this.selectedUser.username,
                    password: this.selectedUser.password,
                    roles: [this.selectedUser.roles.name],
                    isActive: this.selectedUser.isActive,
                    isLocked: this.selectedUser.isLocked
                }
                this.userService.update(user).subscribe(res => {
                    this.closeModal();
                    this.notification.success('User updated.');
                    this.userService.getUsers().subscribe(res => this.userList = res);
                });
            }

        } else {
            this.notification.warning('User form is not valid');
        }
    }

    deleteUser(id: number) {
        if (id) {
            this.alert.alertWarningAndCancel('Are You Sure?', 'Selected User will be deleted!').subscribe(
                res => {
                    if (res) {
                        this.userService.delete(this.userList.find(u => u.id == id)).subscribe(res => {
                            this.userService.getUsers().subscribe(us => this.userList = us);
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


}
