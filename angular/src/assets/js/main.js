$(function () {

  function trafficBasedChart() {
    var options = {
      chart: {
        height: 250,
        type: 'line',
        zoom: {
          enabled: false
        },
        foreColor: '#9b9b9b',
        toolbar: {
          show: false,
          tools: {
            download: false
          }
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [3, 3],
        curve: 'smooth',
        dashArray: [0, 6]
      },
      colors: ['#90a2fb', '#6c84fa'],
      series: [{
        name: "Session Duration",
        data: [800, 630, 700, 400, 200, 250, 350, 400]
      },
      {
        name: "Page Views",
        data: [780, 600, 750, 330, 230, 220, 320, 380]
      }
      ],
      markers: {
        size: 0,

        hover: {
          sizeOffset: 6
        }
      },
      xaxis: {
        categories: ['15', '16', '17', '18', '19', '20', '21'],
        labels: {
          minHeight: 20
        }
      },
      tooltip: {
        y: [{
          title: {
            formatter: function (val) {
              return val + " (mins)"
            }
          }
        }, {
          title: {
            formatter: function (val) {
              return val + " per session"
            }
          }
        }, {
          title: {
            formatter: function (val) {
              return val;
            }
          }
        }]
      },
      grid: {
        borderColor: '#626262',
        strokeDashArray: 6,
      },
      legend: {
        show: false
      },
      annotations: {
        yaxis: [{
          label: {
            fontSize: '20px'
          }
        }]
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#trafficBased"),
      options
    );

    chart.render();
  }

  trafficBasedChart();

  function uniqueCounterChart() {
    var options = {
      chart: {
        height: 250,
        type: 'line',
        zoom: {
          enabled: false
        },
        foreColor: '#9b9b9b',
        toolbar: {
          show: false,
          tools: {
            download: false
          }
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [3, 3],
        curve: 'smooth',
        dashArray: [0, 10]
      },
      colors: ['#4a90e2', '#4a90e2'],
      series: [{
        name: "Session Duration",
        data: [800, 630, 700, 400, 200, 250, 350, 400]
      },
      {
        name: "Page Views",
        data: [780, 600, 750, 330, 230, 220, 320, 380]
      }
      ],
      markers: {
        size: 0,

        hover: {
          sizeOffset: 6
        }
      },
      xaxis: {
        categories: ['15', '16', '17', '18', '19', '20', '21'],
        labels: {
          minHeight: 20
        }
      },
      tooltip: {
        y: [{
          title: {
            formatter: function (val) {
              return val + " (mins)"
            }
          }
        }, {
          title: {
            formatter: function (val) {
              return val + " per session"
            }
          }
        }, {
          title: {
            formatter: function (val) {
              return val;
            }
          }
        }]
      },
      grid: {
        borderColor: '#626262',
        strokeDashArray: 6,
      },
      legend: {
        show: false
      },
      annotations: {
        yaxis: [{
          label: {
            fontSize: '20px'
          }
        }]
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#uniqueCounterChart"),
      options
    );

    chart.render();
  }

  uniqueCounterChart();

  function generateData(count, yrange) {
    var i = 0;
    var series = [];
    while (i < count) {
      var x = '00 : ' + (i < 10 ? '0' : '') + (i + 2).toString();
      var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

      series.push({
        x: x,
        y: y
      });
      i++;
    }
    return series;
  }


  function malwareDetectionChart() {
    var options = {
      chart: {
        height: 400,
        type: 'heatmap',
        foreColor: '#9b9b9b',
        toolbar: {
          show: false,
          tools: {
            download: false
          }
        },
      },
      plotOptions: {
        heatmap: {
          distributed: false,
          radialBar: {
            hollow: {
              margin: 10
            },
          },
          colorScale: {
            ranges: [{
              from: -30,
              to: 5,
              color: '#f6b5b5',
              name: 'Major',
            },
            {
              from: 6,
              to: 20,
              color: '#dd3f3f',
              name: 'Threshold',
            },
            {
              from: 0,
              to: 45,
              color: '#ff6060',
              name: 'Minor',
            }
            ]
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: ['#262626'],
        width: 4,
        dashArray: 0,
      },
      colors: ["#dd3f3f"],
      series: [{
        name: 'Sun',
        data: generateData(18, {
          min: 0,
          max: 90
        })
      },
      {
        name: 'Mon',
        data: generateData(18, {
          min: 0,
          max: 90
        })
      },
      {
        name: 'Tue',
        data: generateData(18, {
          min: 0,
          max: 90
        })
      },
      {
        name: 'Wed',
        data: generateData(18, {
          min: 0,
          max: 90
        })
      },
      {
        name: 'Thu',
        data: generateData(18, {
          min: 0,
          max: 90
        })
      },
      {
        name: 'Fri',
        data: generateData(18, {
          min: 0,
          max: 90
        })
      },
      {
        name: 'Sat',
        data: generateData(18, {
          min: 0,
          max: 90
        })
      },
      ],
    }

    var chart = new ApexCharts(
      document.querySelector("#malwareDetectionChart"),
      options
    );

    chart.render();
  }

  malwareDetectionChart();

  function logHistogramChart() {
    var options = {
      chart: {
        height: 350,
        type: 'area',
        zoom: {
          enabled: false
        },
        foreColor: '#9b9b9b',
        toolbar: {
          show: false,
          tools: {
            download: false
          }
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 3,
        curve: 'straight'
      },
      colors: ['#9d60fb'],
      series: [{
        name: "Session Duration",
        data: [3000, 2000, 3000, 4000, 3700, 6000, 3000, 4000, 3700, 6000]
      }
      ],
      markers: {
        size: 5,
        strokeColor: '#9d60fb',
        fillColor: '#ffffff',
        strokeWidth: 3,
        hover: {
          size: 9
        }
      },
      xaxis: {

        categories: ['11:29:30', '11:29:30', '11:29:30', '11:29:30', '11:29:30', '11:29:30', '11:29:30', '11:29:30', '11:29:30', '11:29:30'],
        labels: {
          minHeight: 20
        }
      },
      tooltip: {
        y: [{
          title: {
            formatter: function (val) {
              return val + " (mins)"
            }
          }
        }, {
          title: {
            formatter: function (val) {
              return val + " per session"
            }
          }
        }, {
          title: {
            formatter: function (val) {
              return val;
            }
          }
        }]
      },
      grid: {
        borderColor: '#626262',
        strokeDashArray: 3,
        position: 'back',
        padding: {
          top: 0,
          right: 10,
          bottom: 0,
          left: 20
        },
      },
      legend: {
        show: false
      },
      annotations: {
        yaxis: [{
          label: {
            fontSize: '20px'
          }
        }]
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0,
        }
      },
      title: {
        text: 'Log Histogram',
        style: {
          fontSize: '20px',
          color: '#eeeeee'
        }
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#logHistogramChart"),
      options
    );

    chart.render();
  }

  logHistogramChart();

  $(document).click(function () {
    $('.dropdown-menu').removeClass('show');
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