
document.addEventListener("DOMContentLoaded", function () {
  var calendar = new FullCalendar.Calendar(
    document.getElementById("calendar"),
    {
      initialView: "dayGridMonthCustom",
      initialDate: "2020-03-01",
      duration: { weeks: 8 }, //Works when duration is under views does not work here
      views: {
        dayGridMonthCustom: {
          type: "dayGridMonth",
          fixedWeekCount: false
        }
      }
    }
  );
  calendar.render();
});


var toolsPos = document.getElementById("calendarTools");

var tools = document.getElementsByClassName("fc-header-toolbar");
toolsPos.appendChild();

document.querySelector(".tooglebar").addEventListener('click',()=>{
   $(".sideWidth").fadeIn(1000).toggleClass('minibar');
   $(".hideText").fadeIn(1000).toggleClass('d-none');
    $(".mainContent").fadeIn(1000).toggleClass('fullbar');
   if ($(".sideWidth").hasClass('minibar')) {
        $(".logoDash img").attr('src', 'assets/img/arrow.svg');
    } else  {
       $(".logoDash img").attr('src', 'assets/img/Vlogo.svg');
    }
});


document.addEventListener('DOMContentLoaded', function(e) {
    $('[name="date"]')
        .datepicker({
            format: 'dd/mm/yyyy'
        })
        .on('changeDate', function(e) {
            // do somwthing here
        });
});


var expanded = false;
 showCheckboxes = ()=> {
  var checkboxes = document.getElementById("checkboxes");
  if (!expanded) {
    checkboxes.style.display = "block";
    expanded = true;
  } else {
    checkboxes.style.display = "none";
    expanded = false;
  }
}

     

Highcharts.chart('Compliance_Score', {
    chart: {
      type: 'areaspline',


    },
    title: {
      text: 'Compliance Score',
      align: 'left',
    },
    legend: {
      layout: 'vertical',
      align: 'left',
      verticalAlign: 'center',
      x: 300,
      y: 300,
      floating: true,
      borderWidth: 1,
      backgroundColor:
      Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
    },
    xAxis: {
      categories: [
      // 'Monday',
      // 'Tuesday',
      // 'Wednesday',
      // 'Thursday',
      // 'Friday',
      // 'Saturday',
      // 'Sunday'
      ],
    // plotBands: [{ // visualize the weekend
    //   from: 4.5,
    //   to: 6.5,
    //   color: 'rgba(68, 170, 213, .2)'
    // }]

        labels: {
            enabled: false
        },
          lineWidth: 0,
            gridLineWidth: 0 //Remove xAxis lines
  },
  yAxis: {
    title: {
      text: null
    },

        labels: {
            enabled: false
        },
         gridLineWidth: 0,
  },

  tooltip: {
    shared: false,
    valueSuffix: ' units'
  },
  credits: {
    enabled: false
  },
  plotOptions: {
    areaspline: {
      fillOpacity: 0.5
    }
  },
  series: [{
    name: 'John',
    data: [3, 4, 3, 5, 4, 10, 12],
     color: '#FF236645'
  }, {
    name: 'Jane',
    data: [1]
  }]
});
  Highcharts.chart('Compliance_Standars', {
    chart: {
      type: 'areaspline'
    },
    title: {
      text: 'Compliance Standars',
       align: 'left',
    },
    legend: {
      layout: 'vertical',
      align: 'left',
      verticalAlign: 'top',
      x: 300,
      y: 300,
      floating: true,
      borderWidth: 1,
      backgroundColor:
      Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
    },
    xAxis: {
      categories: [
      // 'Monday',
      // 'Tuesday',
      // 'Wednesday',
      // 'Thursday',
      // 'Friday',
      // 'Saturday',
      // 'Sunday'
      ],
    // plotBands: [{ 
    //   from: 4.5,
    //   to: 6.5,
    //   color: 'rgba(68, 170, 213, .2)'
    // }]

        labels: {
            enabled: false
        },
         lineWidth: 0,
         gridLineWidth: 0,
  },
  yAxis: {
    title: {
      text: null
    },

        labels: {
            enabled: false
        },
         gridLineWidth: 0,
  },
  tooltip: {
    shared: false,
    valueSuffix: ' units'
  },
  credits: {
    enabled: false
  },
  plotOptions: {
    areaspline: {
      fillOpacity: 0.5
    }
  },
  series: [{
    name: 'John',
    data: [3, 4, 3, 5, 4, 10, 12],
    color:'#66C67987'
  }, 
  {
    name: 'Jane',
    data: [1]
  }]
});



Highcharts.chart('container', {
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: 0,
    plotShadow: false
  },
  title: {
    text: '50%',
    align: 'center',
    verticalAlign: 'middle',
    y: 60
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  },
  accessibility: {
    point: {
      valueSuffix: '%'
    }
  },
  plotOptions: {
    pie: {
      dataLabels: {
        enabled: false,
        distance: -50,
        style: {
          fontWeight: 'bold',
          color: 'white'
        }
      },
      startAngle: -90,
      endAngle: 90,
      center: ['50%', '75%'],
      size: '100%'
    }
  },
  series: [{
    type: 'pie',
    name: 'Browser share',
    innerSize: '60%',
   data: [{
        name: 'Red slice',
        y: 50,
        color: '#ffda83'
    }, {
        name: 'Blue slice',
        y: 50,
        color: '#F0F2F8'
    }]
  }]
});



Highcharts.chart('containerdbl', {
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: 0,
    plotShadow: false
  },
  title: {
    text: '20%',
    align: 'center',
    verticalAlign: 'middle',
    y: 60
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  },
  accessibility: {
    point: {
      valueSuffix: '%'
    }
  },
  plotOptions: {
    pie: {
      dataLabels: {
        enabled: false,
        distance: -50,
        style: {
          fontWeight: 'bold',
          color: 'white'
        }
      },
      startAngle: -90,
      endAngle: 90,
      center: ['50%', '75%'],
      size: '100%'
    }
  },
  series: [{
    type: 'pie',
    name: 'Browser share',
    innerSize: '60%',
  data: [{
        name: 'Red slice',
        y: 25,
        color: '#ff8373'
    }, {
        name: 'Blue slice',
        y: 75,
        color: '#F0F2F8'
    }]

  }]
});








Highcharts.chart('container1', {
  chart: {
    type: 'spline',
    animation: Highcharts.svg, // don't animate in old IE
    marginRight: 10,
    events: {
      load: function () {

        // set up the updating of the chart each second
        var series = this.series[0];
        setInterval(function () {
          var x = (new Date()).getTime(), // current time
          y = Math.random();
          series.addPoint([x, y], true, true);
        }, 1000);
      }
    }
  },

  time: {
    useUTC: false
  },

  title: {
    text: 'Adherence as compared to other companies',
     align: 'left',
  },

  accessibility: {
    announceNewData: {
      enabled: true,
      minAnnounceInterval: 15000,
      announcementFormatter: function (allSeries, newSeries, newPoint) {
        if (newPoint) {
          return 'New point added. Value: ' + newPoint.y;
        }
        return false;
      }
    }
  },

  xAxis: {

        labels: {
            enabled: false
        },
    type: 'datetime',
    tickPixelInterval: 150,
       lineWidth: 0,
         gridLineWidth: 0,
  },

  yAxis: {
    title: {
      text: null
    },
    plotLines: [{
      value: 0,
      width: 1,
      color: '#A3A0FB'
    }],

        labels: {
            enabled: false
        },
           lineWidth: 0,
         gridLineWidth: 0,
  },

  tooltip: {
    headerFormat: '<b>{series.name}</b><br/>',
    pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
  },

  legend: {
    enabled: false
  },

  exporting: {
    enabled: false
  },

  series: [{
    name: 'Random data',
    data: (function () {
      // generate an array of random data
      var data = [],
      time = (new Date()).getTime(),
      i;

      for (i = -19; i <= 0; i += 1) {
        data.push({
          x: time + i * 1000,
          y: Math.random()
        });
      }
      return data;
    }())
  }]
});

Highcharts.chart('trendAnal', {
  chart: {
    type: 'column'
  },
  title: {
    text: 'Trend Analysis',
      align: 'left',
  },

  xAxis: {
    categories: [
    // 'Jan',
    // 'Feb',
    // 'Mar',
    // 'Apr',
    // 'May',
    // 'Jun',
    // 'Jul',
    // 'Aug',
    // 'Sep',
    // 'Oct',
    // 'Nov',
    // 'Dec'
    ],

        labels: {
            enabled: false
        },
           lineWidth: 0,
         gridLineWidth: 0,
    crosshair: true

  },
  yAxis: {
    min: 0,
    title: {
      text: null
    },

        labels: {
            enabled: false
        },
           lineWidth: 0,
         gridLineWidth: 0,
  },
  tooltip: {
    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
    '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
    footerFormat: '</table>',
    shared: true,
    useHTML: true
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0
    }
  },
  series: [{
    name: 'Sales',
    data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
    color:'#02BC77'

  }, {
    name: 'Other',
    data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3],
    color: '#173187B3'

  }]
});


// Create the chart
Highcharts.chart('taskLevel', {
  chart: {
    type: 'pie'
  },
  title: {
    text: 'Task Level',
      align: 'left',
  },
  // subtitle: {
  //   text: 'Click the slices to view versions. Source: <a href="http://statcounter.com" target="_blank">statcounter.com</a>'
  // },

  accessibility: {
    announceNewData: {
      enabled: true
    },
    point: {
      valueSuffix: '%'
    }
  },

  plotOptions: {
    series: {
      dataLabels: {
        enabled: true,
        format: '{point.name}: {point.y:.1f}%'
      }
    },
     pie: {
      size: '150%'
    }
  },

  tooltip: {
    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
  },

  series: [
  {
    name: "Browsers",
    colorByPoint: true,
    data: [
    {
      name: "Chrome",
      y: 62.74,
      drilldown: "Chrome",
          color: '#E6AC48'
    },
    {
      name: "Firefox",
      y: 10.57,
      drilldown: "Firefox",
                color: '#E67848'
    },
    
    ]
  }
  ],
  drilldown: {
    series: [
    {
      name: "Chrome",
      id: "Chrome",
      data: [
      [
      "v65.0",
      0.1
      ],
      [
      "v64.0",
      1.3
      ],
      [
      "v63.0",
      53.02
      ],
      [
      "v62.0",
      1.4
      ],
      [
      "v61.0",
      0.88
      ],
      [
      "v60.0",
      0.56
      ],
      [
      "v59.0",
      0.45
      ],
      [
      "v58.0",
      0.49
      ],
      [
      "v57.0",
      0.32
      ],
      [
      "v56.0",
      0.29
      ],
      [
      "v55.0",
      0.79
      ],
      [
      "v54.0",
      0.18
      ],
      [
      "v51.0",
      0.13
      ],
      [
      "v49.0",
      2.16
      ],
      [
      "v48.0",
      0.13
      ],
      [
      "v47.0",
      0.11
      ],
      [
      "v43.0",
      0.17
      ],
      [
      "v29.0",
      0.26
      ]
      ]
    },
    {
      name: "Firefox",
      id: "Firefox",
      data: [
      [
      "v58.0",
      1.02
      ],
      [
      "v57.0",
      7.36
      ],
      [
      "v56.0",
      0.35
      ],
      [
      "v55.0",
      0.11
      ],
      [
      "v54.0",
      0.1
      ],
      [
      "v52.0",
      0.95
      ],
      [
      "v51.0",
      0.15
      ],
      [
      "v50.0",
      0.1
      ],
      [
      "v48.0",
      0.31
      ],
      [
      "v47.0",
      0.12
      ]
      ]
    },
   
   
    
    ]
  }
});



window.onresize = function() {
  if ((window.outerHeight - window.innerHeight) > 100) {
    $(".sidebar").toggleClass("h-100");
    $(".timecontainer>.grid_item>.card>.card-body").toggleClass("vh_100");
  }
}


