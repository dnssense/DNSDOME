// $(function () {

//   $(document).click(function () {
//     $('.dropdown-menu').removeClass('show');
//   });

//   $('.dns-sidemenu-toggle').click(function () {
//     $('.dns-sidemenu-column').toggleClass('col-lg-3');
//     $('.dns-sidemenu-column').toggleClass('sidemenu-column-border');
//     $('.outside-content').toggleClass('col-lg-11');
//     $('.dns-side-menu li .hidden-lg').toggleClass('d-none');

//     $('.dns-side-menu .menu-collapse-icon').toggleClass('d-none flex-1')
//     $('.dns-side-menu .menu-logo').toggleClass('flex-1');
//     $('.dns-side-menu .dns-collapse-menu').toggleClass('dns-drop-collapse-menu');

//     $('.sidemenu-toggle i').toggleClass('rotate-180');
//   });

//   // function setDropdown(dropdownId, datepickerId) {
//   //   $(dropdownId + ' .dropdown-menu .nav-tabs li').click(function (e) {
//   //     setTimeout(() => {
//   //       $(dropdownId + ' .dropdown-menu').addClass('show');
//   //     }, 1);
//   //   });

//   //   $(datepickerId).flatpickr({
//   //     mode: 'range',
//   //     inline: true
//   //   });

//   //   $(dropdownId + ' .flatpickr-prev-month').click(function (e) {
//   //     setTimeout(() => {
//   //       $(dropdownId + ' .dropdown-menu').addClass('show');
//   //     }, 1);
//   //   });

//   //   $(dropdownId + ' .flatpickr-next-month').click(function (e) {
//   //     setTimeout(() => {
//   //       $(dropdownId + ' .dropdown-menu').addClass('show');
//   //     }, 1);
//   //   });
//   // }

//   // setDropdown('#dropdownDate', '.datepicker');
//   // setDropdown('#dropdownDate1', '.datepicker1');
//   // setDropdown('#dropdownDate2', '.datepicker2');

//   function setDefaultDropdown(dropdownId) {
//     $(dropdownId + ' .dropdown-menu').click(function (e) {
//       e.stopPropagation();
//     });
//   }

//   setDefaultDropdown('#dropdownFilter');
//   setDefaultDropdown('#dropdownSaveButton');

//   $('.dns-datatable-labels .dns-label').click(function () {
//     $(this).toggleClass('dns-active');
//   });

//   menuSize();

//   $(window).resize(function () {
//     menuSize();
//   });

//   function menuSize() {
//     if (window.innerWidth >= 1440) {
//       $('.dns-sidemenu-column').addClass('col-xl-2');
//       $('.outside-content').addClass('col-xl-10');
//     }

//     if (window.innerWidth <= 1440) {
//       $('.dns-sidemenu-column').removeClass('col-xl-2');
//       $('.outside-content').removeClass('col-xl-10');
//     }
//   }

//   $('.dns-side-menu > li a').click(function () {
//     $(this).parent().children('.dns-collapse-menu').toggleClass('d-none');
//   });

//   if ($().amsifySuggestags) {
//     $('input[name="isNot"]').amsifySuggestags({
//       suggestions: ['lorem'],
//       classes: ['btn', 'border-radius-8', 'p2']
//     });
//   }

//   $('#pi_card_btn').click(function () {
//     $('#pi_add_filter').removeClass('d-none');
//     $(this).addClass('d-none');
//     $('#filterCard').addClass('d-block');
//   });

//   $('#pi_add_filter .close-btn').click(function () {
//     $('#pi_add_filter').addClass('d-none');
//     $('#pi_card_btn').parent('.row').removeClass('d-none');
//     $('#filterCard').removeClass('d-block');
//     $('#pi_card_btn').removeClass('d-none');
//   });

//   var agentsTable = $('#childcomponents-table'),
//     closeNewAgentBtn = $('#closeNewAgentBtn');

//   $('#newAgentBtn').click(function () {
//     agentsTable.addClass('d-none');
//     $('#closeNewAgentBtn').removeClass('d-none');
//     $(this).addClass('d-none');
//     $('#agent-wizard').removeClass('d-none');
//   });

//   closeNewAgentBtn.click(function () {
//     agentsTable.removeClass('d-none');
//     closeNewAgentBtn.addClass('d-none');
//     $('#newAgentBtn').removeClass('d-none');
//     $('#agent-wizard').addClass('d-none');
//   });

//   // Wizard

//   var currentStep = 0;
//   var prevButton = $('#prevBtn');
//   var nextButton = $('#nextBtn');
//   var finishButton = $('#finishBtn');

//   prevButton.click(function () {
//     if (currentStep >= 0 && currentStep <= 3) {
//       currentStep--;

//       controlStep();
//     }
//   });

//   nextButton.click(function () {
//     if (currentStep >= 0 && currentStep < 3) {
//       currentStep++;

//       controlStep();
//     }
//   });

//   function controlStep() {
//     var contentFilter = $('#contentFilter'),
//       security = $('#security'),
//       applications = $('#applications'),
//       blackWhiteLists = $('#blackWhiteLists');

//     if (currentStep === 0) {
//       prevButton.hide();
//       finishButton.hide();
//     } else if (currentStep === 3) {
//       nextButton.hide();
//       finishButton.show();
//     } else {
//       finishButton.hide();
//       prevButton.show();
//       nextButton.show();
//     }

//     contentFilter.removeClass('d-block');
//     security.removeClass('d-block');
//     applications.removeClass('d-block');
//     blackWhiteLists.removeClass('d-block');

//     if (currentStep === 0) {
//       contentFilter.addClass('d-block');
//       $('#contentFilterBtn').addClass('activated')
//     } else if (currentStep === 1) {
//       security.addClass('d-block');
//       $('#securityBtn').addClass('activated')
//     } else if (currentStep === 2) {
//       applications.addClass('d-block');
//       $('#applicationsBtn').addClass('activated')
//     } else {
//       blackWhiteLists.addClass('d-block');
//       $('#blackWhiteListsBtn').addClass('activated')
//     }
//   }

//   controlStep();

//   // #Wizard

//   $('#saveBtn').hide();
//   $('#cancelBtn').hide();
//   $('#newPasswordGroup').hide();

//   $('#editBtn').click(function () {
//     $(this).hide();
//     $('#saveBtn').show();
//     $('#cancelBtn').show();
//     $('#newPasswordGroup').show();
//     $('#userInformationForm').addClass('activated');
//   });

//   $('#cancelBtn').click(function () {
//     $(this).hide();
//     $('#saveBtn').hide();
//     $('#editBtn').show();
//     $('#newPasswordGroup').hide();
//     $('#userInformationForm').removeClass('activated');
//     $(".form-ux.activated .form-group input + i").hide();
//   });

//   $('[data-toggle="tooltip"]').tooltip();

//   $('#advancedBtn').click(function () {
//     $('#advancedContent').toggleClass('d-none');
//     $('#defaultSaveBtn').toggleClass('d-none');
//     $('#advancedSaveBtn').toggleClass('d-none');
//   });

// });
