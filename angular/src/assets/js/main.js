$(function () {
 
  $(document).click(function () {
   // $('.dropdown-menu').removeClass('show');
  });

  $('.sidemenu-toggle').click(function () {
    $('.sidemenu-column').toggleClass('col-lg-3');
    $('.sidemenu-column').toggleClass('sidemenu-column-border');
    $('.outside-content').toggleClass('col-lg-11');
    $('.side-menu li span.hidden-lg').toggleClass('d-none');

    $('.side-menu .menu-collapse-icon').toggleClass('d-none');
    $('.side-menu .collapse-menu').toggleClass('drop-collapse-menu');

    $('.sidemenu-toggle i').toggleClass('rotate-180');
  });

  function setDropdown(dropdownId, datepickerId) {
    $(dropdownId + ' .dropdown-menu .nav-tabs li').click(function (e) {
      setTimeout(() => {
        $(dropdownId + ' .dropdown-menu').addClass('show');
      }, 1);
    });

    $(datepickerId).flatpickr({
      mode: 'range',
      inline: true
    });

    $(dropdownId + ' .flatpickr-prev-month').click(function (e) {
      setTimeout(() => {
        $(dropdownId + ' .dropdown-menu').addClass('show');
      }, 1);
    });

    $(dropdownId + ' .flatpickr-next-month').click(function (e) {
      setTimeout(() => {
        $(dropdownId + ' .dropdown-menu').addClass('show');
      }, 1);
    });
  }

  setDropdown('#dropdownDate', '.datepicker');
  setDropdown('#dropdownDate1', '.datepicker1');
  setDropdown('#dropdownDate2', '.datepicker2');

  function setDefaultDropdown(dropdownId) {
    $(dropdownId + ' .dropdown-menu').click(function (e) {
      e.stopPropagation();
    });
  }

  setDefaultDropdown('#dropdownFilter');

  $('.datatable-labels .label').click(function () {
    $(this).toggleClass('active');
  });

  menuSize();

  $(window).resize(function () {
    menuSize();
  });

  function menuSize() {
    if (window.innerWidth >= 1440) {
      $('.sidemenu-column').addClass('col-xl-2');
      $('.outside-content').addClass('col-xl-10');
    }

    if (window.innerWidth <= 1440) {
      $('.sidemenu-column').removeClass('col-xl-2');
      $('.outside-content').removeClass('col-xl-10');
    }
  }

  $('.side-menu > li a').click(function () {
    $(this).parent().children('.collapse-menu').toggleClass('d-none');
  });

  $('input[name="isNot"]').amsifySuggestags({
    suggestions: ['lorem'],
    classes: ['btn', 'border-radius-8', 'p2']
  });

});