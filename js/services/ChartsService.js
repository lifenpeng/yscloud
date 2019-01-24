'use strict';

var chartsSrv = angular.module('ChartsService', []);
//图表服务
chartsSrv.service('Charts', function() {

    /**
     * 字符串时间格式化(巡检报告)
     * */
    var stringTimeLabelFormats = function(lines,time_str){
        var value = '';
        if(new Date(lines[0].data[0][0]).getFullYear()){
            var start_year = new Date(lines[0].data[0][0]).getFullYear() ;
            var start_month = new Date(lines[0].data[0][0]).getMonth() ;
            var start_day = new Date(lines[0].data[0][0]).getDate() ;
            var end_year = new Date(lines[0].data[lines[0].data.length -1][0]).getFullYear() ;
            var end_month = new Date(lines[0].data[lines[0].data.length -1][0]).getMonth();
            var end_day = new Date(lines[0].data[lines[0].data.length -1][0]).getDate();
            //一天内数据格式为（hh:mm:ss）
            if((start_year == end_year) && (start_month == end_month) && (start_day == end_day)){
                value = time_str.substring(11,time_str.length);
            }
            //一月内数据格式为（MM-dd hh:mm:ss）
            if((start_year == end_year) && (start_month == end_month) && (start_day != end_day)){
                value = time_str.substring(5,time_str.length);
            }
        }
        if(!value) value = time_str;
        return value;
    };
    /**
     * 饼图（巡检报表）
     * @param
     *  demo_data = {
            title: '2017年度日平均交易量占比',
            dataname: '日平均交易量占比',
            datalist: [
                ['T6002',   45.0],
                ['T6001',   55.0]
            ]
        };
     * @returns 饼图配置
     */
    this.getPieConfig = function(data,chart_height) {
        return {
            title: {
                text: data.title,
                style: {color: '#d2f1fe'}
            },
            options:{
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type:'pie',
                    height : chart_height ? chart_height : null,
                    backgroundColor: '#2b3b53',
                    borderColor: null
                },
                tooltip:{
                    headerFormat: '{series.name}<br>',
                    pointFormat: '{point.name}: <b>{point.percentage:.2f}%</b>'
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.2f} %',
                            color:'#d2f1fe'
                        }
                    }
                }
            },
            series: [{
                name: data.name,
                data:data.data
            }]
        }
    };
    /**
     * 交易直线走势图（巡检报表）
     * @param
     *  demo_data = {
            title: '大标题',
            subtitle: '副标题',
            yAxis: '纵坐标Label',
            starttimeUTC: Date.UTC(2017, 1, 1, 0, 0, 0),
            pointInterval: 1000*60*60, //一小时
            valueSuffix: '笔/s',       //数据单位
            lines: [{
                name: '第一条线',
                data: [45, 78]
            }, {
                name: '第二条线',
                data: [145, 178]
            }]
        };
     * @returns 曲线图配置
     */
    this.getLineConfig = function(data,chart_height) {
        return {
            title: {
                text: data.title,
                style: {color: '#999'}
            },
            subtitle: {
                text: data.subtitle,
                style: {color: '#999'}
            },
            options: {
                chart: {
                    type: 'line',
                    backgroundColor: '#484C52',
                    height: chart_height ? chart_height : 300,
                    zoomType:'x'
                },
                xAxis: {
                    title: {
                        text: data.xAxis_name,
                        style: {color: '#999'},
                        x: -35
                    },
                    type: data.xAxis_type ? data.xAxis_type == 5 ? 'datetime' : 'category' : 'category',
                    gridLineWidth: 1,
                    gridLineColor: '#666',
                    dateTimeLabelFormats: {
                        millisecond:"%H:%M:%S.%L",
                        second:"%H:%M:%S",
                        minute:"%H:%M",
                        hour:"%H:00",
                        day:"%b.%e",
                        week:"%b.%e %A",
                        month:"%Y-%B",
                        year:"%Y"
                    },
                    labels: {
                        style: {color: '#999'},
                        formatter: function(){
                            if(!data.xAxis_type || data.xAxis_type != 5){
                                return stringTimeLabelFormats(data.lines,this.value);
                            }
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: data.yAxis_name,
                        style: {color: '#FFF'}
                    },
                    min: 0,
                    gridLineWidth: 1,
                    gridLineColor: '#666',
                    labels: {
                        style: {color: '#FFF'}
                    }
                },
                legend: {
                    enabled: data.lines ? data.lines.length > 1 ? true : false: false,
                    itemStyle: {color: '#999'}
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    valueSuffix: data.valuesuffix ?  ' ' + data.valuesuffix : '',
                    dateTimeLabelFormats: { //Y:年  b:月份  e:日  A:星期  H:小时  M:分钟  s:秒  L:毫秒
                        millisecond:"%H:%M:%S.%L",
                        second:"%H:%M:%S",
                        minute:"%H:%M",
                        hour:"%H:00",
                        day:"%Y-%b.%e",
                        week:"%Y-%b.%e %A",
                        month:"%Y-%B",
                        year:"%Y"
                    },
                    shared: true    //一个框多条线信息
                },
                plotOptions: {
                    line: {
                        //color: '#F9802D',
                        lineWidth: 2,
                        states: {
                            hover: {
                                lineWidth: 2
                            }
                        },
                        marker: {
                            enabled: false
                        },
                        //pointInterval: data.pointinterval ? data.pointinterval : null, // 一小时一个点
                        //pointStart: data.starttimeutc   //开始时间
                    }
                },
                navigation: {
                    menuItemStyle: {
                        fontSize: '10px'
                    }
                }
            },
            series: data.lines ? data.lines : []
        }
    };
    /**
     * 资源多直线走势图（巡检报告）
     * @param data
     * @returns {{title: {text: *, style: {color: string}}, subtitle: {text: *, style: {color: string}}, options: {chart: {type: string, backgroundColor: string, height: number}, xAxis: {type: string, gridLineWidth: number, gridLineColor: string, dateTimeLabelFormats: {millisecond: string, second: string, minute: string, hour: string, day: string, week: string, month: string, year: string}, labels: {style: {color: string}}}, yAxis: {title: {text: *, style: {color: string}}, max: number, min: number, gridLineWidth: number, gridLineColor: string, labels: {style: {color: string}}}, tooltip: {valueSuffix: string, dateTimeLabelFormats: {millisecond: string, second: string, minute: string, hour: string, day: string, week: string, month: string, year: string}, shared: boolean}, legend: {itemStyle: {color: string}}, plotOptions: {line: {color: string, lineWidth: number, states: {hover: {lineWidth: number}}, marker: {enabled: boolean}, pointInterval: *, pointStart: *}}, navigation: {menuItemStyle: {fontSize: string}}}, series: *}}
     */
    this.getRSLineConfig = function(data, maxvalue,chart_height) {
        return {
            title: {
                text: data.title,
                style: {color: '#DDD'}
            },
            subtitle: {
                text: data.subtitle,
                style: {color: '#DDD'}
            },
            options: {
                chart: {
                    type: 'line',
                    backgroundColor: '#484C52',
                    height: chart_height ? chart_height : 300
                },
                xAxis: {
                    type: 'datetime',
                    gridLineWidth: 1,
                    gridLineColor: '#666',
                    dateTimeLabelFormats: {
                        millisecond:"%H:%M:%S.%L",
                        second:"%H:%M:%S",
                        minute:"%H:%M",
                        hour:"%H:00",
                        day:"%b.%e",
                        week:"%b.%e %A",
                        month:"%Y-%B",
                        year:"%Y"
                    },
                    labels: {
                        style: {color: '#DDD'}
                    }
                },
                yAxis: {
                    title: {
                        text: data.yaxis,
                        style: {color: '#DDD'}
                    },
                    max: maxvalue ? maxvalue : null,
                    min: 0,
                    gridLineWidth: 1,
                    gridLineColor: '#666',
                    labels: {
                        style: {color: '#DDD'}
                    }
                },
                tooltip: {
                    valueSuffix: ' ' + data.valuesuffix,
                    dateTimeLabelFormats: { //Y:年  b:月份  e:日  A:星期  H:小时  M:分钟  s:秒  L:毫秒
                        millisecond:"%H:%M:%S.%L",
                        second:"%H:%M:%S",
                        minute:"%H:%M",
                        hour:"%H:00",
                        day:"%Y-%b.%e",
                        week:"%Y-%b.%e %A",
                        month:"%Y-%B",
                        year:"%Y"
                    },
                    shared: true    //一个框多条线信息
                },
                legend: {
                    itemStyle: {color: '#DDD'}
                },
                plotOptions: {
                    line: {
                        color: '#F9802D',
                        lineWidth: 2,
                        states: {
                            hover: {
                                lineWidth: 2
                            }
                        },
                        marker: {
                            enabled: false
                        },
                        pointInterval: data.pointinterval, // 一小时一个点
                        pointStart: data.starttimeutc   //开始时间
                    }
                },
                navigation: {
                    menuItemStyle: {
                        fontSize: '10px'
                    }
                }
            },
            series: data.lines ? data.lines : []
        }
    };
    /**
     * TOP10排行榜横向条形图（巡检报告）
     * @param data:{
     *      title: '',
     *      subtitle: '',
     *      valueSuffix: '',
     *      tops: [],
     *      columns: []
     * }
     * @returns {{}}
     */
    this.getTop10Config = function(data,chart_height) {
        return {
            title: {
                text: data.title,
                style: {color: '#DDD'}
            },
            subtitle: {
                text: data.subtitle,
                style: {color: '#DDD'}
            },
            options: {
                chart: {
                    type: 'bar',
                    backgroundColor: '#484C52',
                    height: chart_height ? chart_height : 300
                },
                xAxis: {
                    max: data.tops ? data.tops.length - 1 : null,
                    categories: data.tops ? data.tops : [],
                    type:'category',
                    title: {
                        text: null
                    },
                    gridLineWidth: 1,
                    gridLineColor: '#666',
                    labels: {
                        style: {color: '#DDD'}
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: data.valuesuffix,
                        style: {color: '#DDD'}
                    },
                    gridLineWidth: 1,
                    gridLineColor: '#666',
                    labels: {
                        overflow: 'justify',
                        style: {color: '#DDD'}
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true,
                            allowOverlap: true
                        }
                    }
                }
            },
            series: [{
                name: '交易量',
                color: '#4D7EB7',
                borderWidth: 0,
                dataLabels: {
                    y: 1,
                    color: '#DDD'
                },
                data: data.columns ? data.columns : []
            }]
        }
    }
    /**
     * 特殊时间点预测交易量趋势
     */
    this.getFutureConfig = function(data,maxvalue,chart_height) {
        return {
            title: {
                text: data.title,
                style: {color: '#999'}
            },
            options: {
                chart: {
                    type: 'spline',
                    backgroundColor: '#484C52',
                    height: chart_height ? chart_height : 300
                },
                xAxis: {
                    type: 'datetime',
                    gridLineWidth: 1,
                    gridLineColor: '#666',
                    dateTimeLabelFormats: {
                        day:"%b.%e",
                        month:"%B"
                    },
                    labels: {
                        style: {color: '#999'}
                    }
                },
                yAxis: {
                    title: {
                        text: data.yAxis,
                        style: {color: '#999'}
                    },
                    min: 0,
                    max: maxvalue ? maxvalue : null,
                    gridLineWidth: 1,
                    gridLineColor: '#666',
                    labels: {
                        style: {color: '#FFF'}
                    }
                },
                legend: {
                    itemStyle: {color: '#999'}
                },
                tooltip: {
                    valueSuffix: ' ' + data.valuesuffix,
                    dateTimeLabelFormats: { //Y:年  b:月份  e:日  A:星期  H:小时  M:分钟  s:秒  L:毫秒
                        hour:"%b%e日",
                        day:"%b%e日",
                    },
                    shared: true
                },
                plotOptions: {
                    spline: {
                        color: '#F9802D',
                        lineWidth: 1,
                        marker: {
                            enabled: false
                        },
                        pointInterval: 7*24*60*60*1000, // 一周一个点
                        pointStart: 1451577600000   //开始时间
                    },
                },
                navigation: {
                    menuItemStyle: {
                        fontSize: '10px'
                    }
                }
            },
            series: data.lines
        }
    }
    /**
     * 纵向柱状图/横向条形图（巡检报告）
     */
    this.getColumnConfig = function(data,chart_height) {
        return {
            title: {
                text: data.title,
                style: {color: '#999'}
            },
            subtitle: {
                text: data.subtitle,
                style: {color: '#999'}
            },
            options: {
                chart: {
                    type: data.chart_type == 1 ? 'column' : 'bar',//1:column纵向柱状图, 2:bar横向条形图
                    backgroundColor: '#484C52',
                    height: chart_height ? chart_height : null
                },
                xAxis: {
                    title: {
                        text: data.xAxis_name ? data.xAxis_name : null,
                        style: {color: data.chart_type == 2 ? '#FFF' : '#999'},
                        x: data.chart_type == 1 ? -35 : null
                    },
                    type: data.xAxis_type ? data.xAxis_type== 5 ? 'datetime' : 'category' : 'category',
                    gridLineWidth: 1,
                    gridLineColor: '#666',
                    dateTimeLabelFormats: {
                        millisecond:"%H:%M:%S.%L",
                        second:"%H:%M:%S",
                        minute:"%H:%M",
                        hour:"%H:00",
                        day:"%b.%e",
                        week:"%b.%e %A",
                        month:"%Y-%B",
                        year:"%Y"
                    },
                    labels: {
                        style: {color: data.chart_type == 2 ? '#FFF' : '#999'},
                        formatter: function(){
                            if(!data.xAxis_type || data.xAxis_type != 5){
                                return stringTimeLabelFormats(data.columns,this.value)
                            }
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: data.yAxis_name ? data.yAxis_name : null,
                        style: {color: data.chart_type == 1 ? '#FFF' : '#999'}
                    },
                    min: 0,
                    gridLineWidth: 1,
                    gridLineColor: '#666',
                    labels: {
                        style: {color: data.chart_type == 1 ? '#FFF' : '#999'}
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    valueSuffix: data.valuesuffix ? ' ' + data.valuesuffix : '',
                    dateTimeLabelFormats: { //Y:年  b:月份  e:日  A:星期  H:小时  M:分钟  s:秒  L:毫秒
                        millisecond:"%H:%M:%S.%L",
                        second:"%H:%M:%S",
                        minute:"%H:%M",
                        hour:"%H:00",
                        day:"%Y-%b.%e",
                        week:"%Y-%b.%e %A",
                        month:"%Y-%B",
                        year:"%Y"
                    },
                    shared: true    //一个框多条柱
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        color: '#4D7EB7',
                        // name: data.chart_type == 2 ? '交易量' : '',
                    },
                    bar:{    //横向条形图显示数据点
                        dataLabels: {
                            enabled: true,
                            allowOverlap: true,
                            y: 1,
                            color: '#DDD'
                        }
                    },
                    column:{    //纵向柱状图显示数据点
                        dataLabels: {
                            enabled: true,
                            allowOverlap: true,
                            y: 1,
                            color: '#DDD'
                        }
                    }
                }
            },
            series: data.columns ? data.columns : []
        }
    };
    /**
     * 横条形图（发布管理）
     * @param data
     * @returns {{options: {chart: {type: string}, plotOptions: {series: {stacking: string}}, legend: {enabled: boolean}, yAxis: {allowDecimals: boolean, title: {text: string}}, xAxis: {categories: *}}, series: *[], title: {text: string}, credits: {enabled: boolean}, loading: boolean}}
     */
    this.getBarConfig = function(data) {
        return {
            options: {
                chart: {
                    type: 'bar',
                    backgroundColor: '#091118',
                    borderColor: ""
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        maxPointWidth: 15,
                        borderColor: ""
                    },
                },
                legend: {
                    enabled: false,
                    borderColor: "",
                },
                yAxis: {
                    allowDecimals: false,
                    title: {
                        text: '发布数量'
                    },
                    lineColor:'#141F2B',
                    gridLineColor:'#141F2B',
                },
                xAxis: {
                    categories: data.categories,
                    min:0,
                    max: data.categories.length > 50 ? 35 : null, //一页显示35条数据
                    labels: {
                        step: 1,   //标签无间隔(step:1)
                        staggerLines : data.categories.length > 50 ? 2 : 1, //分两行显示(只对水平轴起作用)
                    }
                },
                scrollbar : {
                    enabled:  data.categories.length > 50,
                    barBackgroundColor:'#434b55',
                    barBorderColor:'#434b55',
                    buttonArrowColor:'',
                    buttonBackgroundColor:'#091118',
                    buttonBorderColor:'#091118',
                    trackBackgroundColor:'#091118',
                    trackBorderColor:'#091118',
                }
            },
            series: [
                {
                    "name": "失败",
                    "color": '#F85b27',
                    "data": data.fail,
                    "id": "series-0",
                },
                {
                    "name": "成功",
                    "color": '#333861',
                    "data": data.success,
                    "id": "series-1"
                }
            ],
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            loading: false
        }
    };
   /**
    * 调度任务执行（环形圆）
    * @param
    *  demo_data = {
            title: '标题居中的环形图测试',
            name: '测试',
            datalist: [
                ['test1',   65.0],
                ['test2',   30.0]，
                {
                    name: 'test3',
                    y: 5.0,
                   color:'#CCC'
                }
            ]
        };
    * @returns 环形饼图配置
    * **/
    this.getCircularPieConfig = function(data,chart_width=160,chart_height=160) {
        return {
            title: {
                text: data.title,
                verticalAlign: 'middle',
                y:8,
                style:{
                    fontSize:'20px',
                    fontWeight: 'bold',
                    color: data.color
                }
            },
            options:{
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type:'pie',
                    spacing : [0,0,0,0],
                    margin : [0,0,0,0],
                    height : chart_height ? chart_height : null,
                    width : chart_width ? chart_width : null,
                    backgroundColor: null
                },
                tooltip:{
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        animation: false,
                        states: {
                            hover: {
                                enabled: false
                            }
                        }

                    },
                    pie: {
                        borderColor:null,
                        innerSize: '75%',
                        dataLabels: {
                            enabled: false
                        }
                    }
                }
            },
            series: [{
                name: data.name ? data.name : '',
                data: data.dataList ? data.dataList : []
            }]
        }
    };

    /**
     * 调度任务监控（分割圆环）
     * */
    this.getSplitPieConfig = function(data,chart_width,chart_height,hover_enabled) {
        return {
            title: {
                text: data.title,
                verticalAlign: 'middle',
                y:7,
                style:{
                    fontSize:'12px',
                    color: data.color
                }
            },
            options:{
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type:'pie',
                    spacing : [0,0,0,0],
                    margin : [0,0,0,0],
                    height : chart_height ? chart_height : null,
                    width : chart_width ? chart_width : null,
                    backgroundColor: null
                },
                tooltip:{
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        animation: hover_enabled ? hover_enabled : false,
                        states: {
                            hover: {
                                enabled: hover_enabled ? hover_enabled : false
                            }
                        }

                    },
                    pie: {
                        borderColor:data.split_color ? data.split_color : '',
                        borderWidth: data.border_width ? data.border_width : null,
                        innerSize:  data.inner_size ? data.inner_size : '67%',
                        dataLabels: {
                            enabled: false
                        }
                    }
                }
            },
            series: [{
                name: data.name ? data.name : '',
                data: data.dataList ? data.dataList : [15,20,30,5,51]
            }]
        }
    };

    /**
     * 调度任务监控（活动圆环）
     * */
    this.getActivityConfig = function(data,chart_width,chart_height) {
        return {
            title: {
                text: data.title ? data.title : '',
                y: 4,
                verticalAlign: 'middle',
                style:{
                    fontSize:'12px',
                    color: data.color ? data.color : ''
                }
            },
            options: {
                chart: {
                    type: 'solidgauge',
                    height : chart_height ? chart_height : null,
                    width : chart_width ? chart_width : null,
                    spacing : [0,0,0,0],
                    margin : [0,0,0,0],
                    backgroundColor: null
                },
                tooltip: {
                    enabled: false,
                    borderWidth: 0,
                    backgroundColor: 'none',
                    shadow: false,
                    style: {
                        fontSize: '16px'
                    },
                    pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}%</span>',
                },
                credits: {
                    enabled: false
                },
                pane: {
                    startAngle: 0,
                    endAngle: 360,
                    background: [{ // Track for Move
                        outerRadius: '100%',
                        innerRadius: '96%',
                        backgroundColor: data.color ? data.color : null,
                        borderWidth: 0
                    }]
                },
                yAxis: {
                    min: 0,
                    max: 100,
                    lineWidth: 0,
                    tickPositions: []
                },
                plotOptions: {
                    solidgauge: {
                        borderWidth: '4px',
                        dataLabels: {
                            enabled: false
                        },
                        linecap: 'round',
                        stickyTracking: false,
                        animation: false,
                    }
                }
            },
            series: [{
                name: '',
                borderColor: data.color ? data.color : null,
                data: [{
                    color: null,
                    radius: '100%',
                    innerRadius: '100%',
                    y: data.percentage ? data.percentage :0
                }]
            }]
        }
    }


   
    /**
     * 纵向柱状图/横向条形图（日志报告预览）
     */
    this.getLogColumnConfig = function(data,chart_height) {
        return {
            title: {
                text: data.title,
                style: {color: '#d2f1fe'}
            },
            subtitle: {
                text: data.subtitle,
                style: {color: '#d2f1fe'}
            },
            options: {
                chart: {
                    type: data.chart_type==0 ? 'line' : 'column',//1:column纵向柱状图, 2:bar横向条形图
                    backgroundColor: '#2b3b53',
                    borderColor: null,
                    height: chart_height ? chart_height : null
                },
                xAxis: {
                    type: 'category',
                    categories:data.units ? data.units: [],
                    gridLineWidth: 1,
                    gridLineColor: '#172230',
                    labels: {
                        style: {color: data.chart_type == 1 ? '#ddd' : '#ddd'}
                    },
                    title: {
                        text: data.xAxis_name ? data.xAxis_name : null,
                        style: {color:'#FFF'},
                        x: data.chart_type == 1 ? -35 : null
                    },
                },
                yAxis: {
                    title: {
                        text: data.yAxis_name ? data.yAxis_name : null,
                        style: {color: data.chart_type == 1 ? '#d2f1fe' : '#d2f1fe'}
                    },
                    min: 0,
                    gridLineWidth: 1,
                    gridLineColor: '#172230',
                    lineColor:'#172230',
                    labels: {
                        style: {color: data.chart_type == 1 ? '#ddd' : '#ddd'}
                    },
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    valueSuffix: data.valuesuffix ? ' ' + data.valuesuffix : '',
                    dateTimeLabelFormats: { //Y:年  b:月份  e:日  A:星期  H:小时  M:分钟  s:秒  L:毫秒
                        millisecond:"%H:%M:%S.%L",
                        second:"%H:%M:%S",
                        minute:"%H:%M",
                        hour:"%H:00",
                        day:"%Y-%b.%e",
                        week:"%Y-%b.%e %A",
                        month:"%Y-%B",
                        year:"%Y"
                    },
                    shared: true    //一个框多条柱
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        color: '#4D7EB7',
                    },
                    bar:{    //横向条形图显示数据点
                        dataLabels: {
                            enabled: true,
                            allowOverlap: true,
                            y: 1,
                            color: '#d2f1fe'
                        }
                    },
                    column:{    //纵向柱状图显示数据点
                        dataLabels: {
                            enabled: true,
                            allowOverlap: true,
                            y: 1,
                            color: '#d2f1fe'
                        }
                    }
                }
            },
            series: data.columns ? data.columns : []
        }
    };
    /*调度-任务报告纵向柱状图*/
    this.getFlowColumnConfig = function (data,chart_height) {
        return {
            title: {
                text: data.title,
                style: {color: '#d2f1fe'}
            },
            options: {
                chart: {
                    type: 'column',
                    backgroundColor: '#091016',
                    height: chart_height ? chart_height : null
                },
                xAxis: {
                    title: {
                        text: data.xAxis_name ? data.xAxis_name : null,
                        style: {color:'#FFF'},
                        x: -35
                    },
                    type: 'category',
                    tickColor: '#396770',
                    lineColor: '#396770',
                    gridLineWidth: 1,
                    gridLineColor: '#396770',
                    labels: {
                        style: {color: '#d2f1fe'}
                    }
                },
                yAxis: {
                    title: {
                        text: data.yAxis_name ? data.yAxis_name : null,
                        style: {color: '#d2f1fe'}
                    },
                    min: 0,
                    gridLineWidth: 1,
                    gridLineColor: '#396770',
                    labels: {
                        style: {color: '#d2f1fe'}
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    tooltip:{
                        headerFormat: '{series.name}<br>',
                        pointFormat: '{point.name}: <b>{point.y} 笔</b>'
                    },
                    dateTimeLabelFormats: { //Y:年  b:月份  e:日  A:星期  H:小时  M:分钟  s:秒  L:毫秒
                        millisecond:"%H:%M:%S.%L",
                        second:"%H:%M:%S",
                        minute:"%H:%M",
                        hour:"%H:00",
                        day:"%Y-%b.%e",
                        week:"%Y-%b.%e %A",
                        month:"%Y-%B",
                        year:"%Y"
                    },
                    shared: true
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        color: '#4D7EB7',
                        maxPointWidth: 70
                    },
                    column:{
                        dataLabels: {
                            enabled: true,
                            allowOverlap: true,
                            y: 1,
                            color: '#d2f1fe',
                            style:{
                                textOutline:null
                            }
                        }
                    }
                }
            },
            series: data.columns ? data.columns : []
        }
    }
    /*调度-任务报告饼图*/
    this.getFlowPieConfig = function(data,chart_height) {
        return {
            title: {
                text: data.title,
                style:{
                    color:'#d2f1fe'
                }
            },
            options:{
                color:['red','pink'],
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type:'pie',
                    height : chart_height ? chart_height : null,
                    width:300,
                    backgroundColor: 'transparent',
                },
                tooltip:{
                    headerFormat: '{series.name}<br>',
                    pointFormat: '{point.name}: <b>{point.y}</b>'
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: false,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false,
                            format: '<b>{point.name}</b>: {point.y}',
                            color:'#d2f1fe'
                        },
                    }
                }
            },
            series: [{
                name: data.name,
                data:data.data,
                }]
        }
    };

});
