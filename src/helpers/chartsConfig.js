export const AreasplineDefaultConfig = () => {
    let config = {
        chart: {
            type: 'areaspline',
            // height: (9 / 16 * 100) + '%'
            // height: 100+ '%'
            height: 180 + 'px'
        },
        title: {
            text: 'Sustenance Adherence',
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
            // backgroundColor:'#FFFFFF'
        },
        xAxis: {

            labels: {
                enabled: false,
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
            color: '#66C67987'
        },
        {
            name: 'Jane',
            data: [1]
        }
        ]
    }
    return config
}

export const SemiDonutDefaultConfig = () => {
    let config = {
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
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
            enabled: false
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
    }
    return config
}

export const pieDefaultConfig = () => {

    let obj = {
        chart: {
            plotBackgroundColor: "transparent",
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            height: "125px",
            backgroundColor: 'transparent',
            spacing: [0, 0, 0, 0]
        },
        title: {
            // text: 'Task Level - Weekly Adherence'
            text: undefined
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
            enabled: false
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: false
            }
        },
        series: [{
            name: 'Brands',

            colorByPoint: true,
            color: "transparent",
            data: [{
                name: 'Chrome',
                y: 75,
                selected: true,
                color: "#2680eb"

            }, {
                name: 'Internet Explorer',
                y: 25,
                color: "#b4d6ff"
            }]
        }]
    }
    return obj
}
export const radialBarDefaultConfig = () => {

    let obj = {
        series: [65, 40],
        options: {
            chart: {
                height: 250,
                type: "radialBar",
                offsetY: 0,
                offsetX: 0,
            },
            plotOptions: {
                radialBar: {
                    track: {
                        background: '#fff',
                    },
                    offsetY: 20,
                    offsetX: 20,
                    startAngle: 0,
                    endAngle: 360,
                    hollow: {
                        margin: 5,
                        size: "40%",
                        background: "transparent",
                        image: undefined
                    },
                    dataLabels: {
                        name: {
                            show: false
                        },
                        value: {
                            show: false
                        }
                    },
                    total: {
                        show: true,
                        label: 'Total',
                        formatter: function (w) {
                            // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                            return 249
                        }
                    }
                }
            },
            colors: ['#f4af6e', '#457297'],

            labels: ["", ""],
            legend: {
                show: true,
                floating: true,
                fontSize: "18px",
                position: "left",
                offsetX: 60,
                offsetY: 70,
                labels: {
                    useSeriesColors: true
                },
                markers: {
                    size: 0
                },
                formatter: function (seriesName, opts) {
                    return seriesName + "" + opts.w.globals.series[opts.seriesIndex] + "%";
                },
                itemMargin: {
                    horizontal: 1
                }
            },
            responsive: [
                {
                    breakpoint: 1400,
                    options: {
                        chart: {
                            height: 200,
                        },
                        plotOptions: {
                            radialBar: {
                                offsetY: 20,
                                offsetX: 35,
                                hollow: {
                                    margin: 0,
                                },
                            },
                        },
                        legend: {
                            fontSize: "10px",
                            offsetX: 85,
                            offsetY: 60,
                        }
                    }
                },
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            show: false
                        }
                    }
                }
            ]
        }
    }
    return obj
}
export const radialMultiBarDefaultConfig = (totalInfo = 0) => {

    let obj = {

        series: [44, 55, 67],
        options: {
            chart: {
                height: 350,
                type: 'radialBar',
                fontFamily: 'Poppins, sans-serif'
            },
            plotOptions: {

                radialBar: {
                    dataLabels: {
                        name: {
                            fontSize: '22px',
                        },
                        value: {
                            fontSize: '16px',
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            formatter: function (w) {
                                // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                                return totalInfo
                            }
                        }
                    }
                }
            },
            colors: ["#7FBCAC", "#F9774E", "#3476FA",],
            labels: ['Critcal (Major)', 'Critical (Minor)', 'Non Critical'],
        },


    };
    return obj
}
export const radialBarCustAngleDefaultConfig = () => {

    let obj = {

        series: [76, 67, 61],
        options: {
            chart: {
                height: 250,
                // width:250,
                type: 'radialBar',
                // offsetY: -30,
                // offsetX: 70
            },
            plotOptions: {
                radialBar: {
                    offsetY: -20,
                    offsetX: 30,
                    startAngle: 0,
                    endAngle: 270,
                    hollow: {
                        margin: 5,
                        size: '30%',
                        background: 'transparent',
                        image: undefined,
                    },
                    dataLabels: {
                        name: {
                            show: false,
                        },
                        value: {
                            show: false,
                        }
                    }
                }
            },
            colors: ['#1ab7ea', '#0084ff', '#39539E', 'black'],
            labels: ['Vimeo', 'Messenger', 'Facebook', 'Total'],
            legend: {
                show: true,
                floating: true,
                fontSize: '9px',
                position: 'left',
                offsetX: 30,
                offsetY: -15,
                labels: {
                    useSeriesColors: true,
                },
                markers: {
                    size: 0
                },
                formatter: function (seriesName, opts) {
                    if (seriesName == 'Total') {
                        return seriesName + ":  " + 500
                    } else {
                        return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
                    }

                },
                itemMargin: {
                    vertical: 1
                }
            },
            responsive: [
                {
                    breakpoint: 1199,
                    options: {
                        chart: {
                            height: 200,
                        },
                        plotOptions: {
                            radialBar: {
                                offsetY: 30,
                                offsetX: 10,
                            }
                        }
                    }
                },
                {
                breakpoint: 480,
                options: {
                    legend: {
                        show: false
                    }
                }
            }]
        },


    };
    return obj
}
export const radialBarGuageDefaultConfig = () => {

    let obj = {

        series: [67],
        options: {
            chart: {
                height: 350,
                type: 'radialBar',
            },
            plotOptions: {
                radialBar: {
                    offsetY: -20,
                    startAngle: -135,
                    endAngle: 135,
                    dataLabels: {
                        offsetX: -200,
                        name: {
                            fontSize: '15px',
                            fontWeight: 600,
                            color: "#1A182F",
                            offsetY: -95,
                            show: false
                        },
                        value: {
                            // offsetY: -15,
                            offsetY: 0,
                            //   show:false,
                            fontSize: '16px',
                            color: undefined,
                            formatter: function (val) {
                                return val + "%";
                            }
                        }
                    }
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    shadeIntensity: 0.15,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 1,
                    gradientToColors: ["#319fa9"],
                    stops: [0, 50, 65, 91]
                },
            },
            stroke: {
                dashArray: 4
            },
            labels: ['Median Ratio'],
            
            responsive: [
                {
                    breakpoint: 1400,
                    options: {
                        chart: {
                            height: 200,
                        },
                    }
                }
            ]
        },


    };
    return obj
}
export const areaChartDefaultConfig = () => {

    let obj  = {

        series: [{
          name: 'series1',
          data: [31, 40, 28, 51, 42, 109, 100],
          color: "#F78F6E"
        }],
        options: {
            chart: {
                height: 120,
                // type: 'area',
                type: 'areaspline',
                // height: (9 / 16 * 100) + '%',
                // height: 100+ '%',
                toolbar: {
                  show: false
                }
              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                curve: 'smooth',
                width: 2,
              },
              xaxis: {
                type: 'datetime',
                categories: ["2018-09-19T00:00:00.000Z", "2018-09-19T01:30:00.000Z", "2018-09-19T02:30:00.000Z", "2018-09-19T03:30:00.000Z", "2018-09-19T04:30:00.000Z", "2018-09-19T05:30:00.000Z", "2018-09-19T06:30:00.000Z"]
                // type: 'category',
                // categories: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL","AUG","SEP","OCT","NOV","DEC"]
              },
              yaxis: {
                show: false,

              },
              fill: {
                        type: 'gradient',
                        gradient: {
                            shade: 'light',
                            gradientToColors: ['#F78F6E'],
                            shadeIntensity: 1,
                            type: 'horizontal',
                            opacityFrom: 0,
                            opacityTo: 0,
                            stops: [0]
                        },
                        opacity: 0
                    },
              tooltip: {
                x: {
                  format: 'dd/MM/yy HH:mm'
                },
              },
        },


      };
    return obj
}