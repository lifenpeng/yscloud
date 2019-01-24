'use strict';

//统计分析控制器
var anaCtrl = angular.module('AnalysisController', ["highcharts-ng"]);

/**
 *例行发布
 * */
anaCtrl.controller("regularanalysisCtrl",["$scope", "$timeout", "Analysis", "Charts", "Modal", "CV",function($scope, $timeout, Analysis, Charts, Modal, CV) {
    var thisYear = new Date().getFullYear();
    $scope.info = {
        yearCount   : 0, //年份统计总数
        yearSucc    : 0, //年份统计成功数
        yearFail    : 0, //年份统计失败数
        historyYear : thisYear-1, //历史年份
        historyYearString : (thisYear- 1).toString() + "年度", //历史年份全称
        yearList : [],//年份列表
        programCount   : 0, //方案总数
        programSucc    : 0,//方案成功数
        programFail    : 0, //方案失败数
    };
    $scope.config = {
        programChartConfig : {}, //方案图配置
        monthChartConfig   : {}, //按月统计图配置
        historyChartConfig : {}, //历年统计图配置
        dayChartConfig     : {}, //按天统计图配置
    };
    $scope.control = {
        show : true,//控制器销毁 清除tabset select方法 防止路由变化 再次调用select方法
    };
    var init = function(){
        //近十年的年份
        for(var i = 0; i <= 10; i ++) {
            $scope.info.yearList.push((thisYear-i).toString() +"年度");
        }
    };
    //获取方案统计数据
    var getProgramData = function () {
        Analysis.getProgramData().then(function(data) {
            $timeout(function () {
                $scope.info.programCount    = data.pro_bk_num;  //方案总数
                $scope.info.programSucc     = data.success_bk_num;   //方案-发布成功数
                $scope.info.programFail     = data.fail_bk_num;   //方案-发布失败数
                var progList        = [];
                var successList     = [];
                var failList        = [];
                //处理方案数据
                var _program_List = data.program_prod_list ? data.program_prod_list : [];
                for(var i = 0; i < _program_List.length; i++){
                    var _single_prog = _program_List[i];
                    var _prog_sys = '';
                    if(_single_prog.prog_cn_name){
                        _prog_sys = _single_prog.prog_cn_name;
                    }else{
                        _prog_sys = _single_prog.pub_prog_id;
                    }
                    progList.push(_prog_sys);
                    successList.push(_single_prog.success_bk_num);
                    failList.push(_single_prog.fail_bk_num);
                }
                var progdata = {
                    categories  : progList,
                    success     : successList,
                    fail        : failList
                };
                $scope.config.programChartConfig = Charts.getBarConfig(progdata);
            },1000);
        }, function(error) {
            Modal.alert(error.message);
        });
    };
    //获得按月统计数据/历史统计分析
    var getYearDataByMonth = function(year, current) {
        Analysis.getYearDataGroupMonth(year).then(function(data) {
            $scope.info.yearCount    = data.prod_sum;
            $scope.info.yearSucc     = data.prod_success;
            $scope.info.yearFail     = data.prod_fail;
            var successList  = [];
            var failList     = [];
            var detailList = data.prodpermonth_list ? data.prodpermonth_list : [];
            for(var i = 1; i <= 12; i ++) {
                var skip = false;
                for(var j = 0; j < detailList.length; j ++) {
                    var detail = detailList[j];
                    if(detail.pro_bk_month == i) {
                        successList.push(detail.success_bk_num);
                        failList.push(detail.fail_bk_num);
                        skip = true;
                        break;
                    }
                }
                if(!skip) {
                    successList.push(0);
                    failList.push(0);
                }
            }
            var monthdata = {
                categories: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                success: successList,
                fail: failList
            };
            if(current) {
                $scope.config.monthChartConfig = Charts.getBarConfig(monthdata);
            } else {
                $scope.config.historyChartConfig = Charts.getBarConfig(monthdata);
            }
        }, function(error) {
            Modal.alert(error.message == 'APP_RELEASE_INPUT_YEAR_LESS_THEN_TABLE_LEAST_YEAR' ? "无"+year+"年份数据！" : error.message);
        });
    };
    //获得按天窗口统计数据
    var getYearDataByDay = function(year) {
        Analysis.getYearDataGroupMonth(year).then(function(data) {
            $scope.info.yearCount    = data.prod_sum;
            $scope.info.yearSucc     = data.prod_success;
            $scope.info.yearFail     = data.prod_fail;
            var dayList         = [];
            var successList     = [];
            var failList        = [];
            var detailList = data.prodperwindow_list ? data.prodperwindow_list : [];
            for(var j = 0; j < detailList.length; j ++) {
                var detail = detailList[j];
                var date = detail.pro_bk_date;
                if(date){
                    var month = date.substr(0,date.indexOf('/'));
                   var day = date.substr(date.lastIndexOf('/')+1,date.length -1);
                    if(day < 10){
                        day = '0' + day ;
                    }else{
                        day ='' +day;
                    }
                    if(month <10){
                        month = '0' + month + '/';
                    }else{
                        month = month + '/';
                    }
                }else{
                    date ='';
                }
                var Date = month + day;
                dayList.push(Date);
                successList.push(detail.success_bk_num);
                failList.push(detail.fail_bk_num);
            }
            var daydata = {
                categories  : dayList,
                success     : successList,
                fail        : failList
            };
            $scope.config.dayChartConfig = Charts.getBarConfig(daydata);
        }, function(error) {
            Modal.alert(error.message);
        });
    };
    //初始化以及切换tab页
    $scope.selectTab = function(tab) {
        if(tab =='program'){        //第一个Tab页“方案统计”
            getProgramData();
        }else if(tab =='month') {   //第二个Tab页“月份统计”
            getYearDataByMonth(thisYear, true);
        } else if(tab == 'day') {  //第三个Tab页"发布窗口统计"
            getYearDataByDay(thisYear);
        } else {                   //第四个Tab页"历史统计"
            getYearDataByMonth($scope.info.historyYear, false);
            $scope.info.historyYearString = (thisYear- 1).toString() + "年度";
        }
    };
    //变更历史年份
    $scope.changeYear = function(y) {
        $scope.info.historyYear = y.substring(0,4);
        getYearDataByMonth($scope.info.historyYear, false);
    };
    init();
}]);

/**
 *项目发布（一般&大型项目）
 * */
anaCtrl.controller("pubAnalysisCtrl", ["$scope","CV",function($scope, CV) {
    var date = new Date();
    $scope.info = {
        yearCount : 0, //大型项目年份总数
        yearFail  : 0, //大型项目年份失败数
        nyearCount : 0, //一般项幕年份总数
        nyearFail  : 0, //一般项目年份失败数
        n_year_list : [],//一般项目年份可选列表
        m_year_list : [],//大型项目年份可选列表
        endDay : '',//当前日期的前两天为统计分析的截止日期
        historyNormalYear : '',//一般项目选择的历史年份(对象)
        historyNormalYearString : '',//一般项目选择的历史年份（字符串）
        historyMajorYear : '',//大型目选择的历史年份(对象)
        historyMajorYearString : ''//大型项目选择的历史年份（字符串）

    };
    var init = function(){
        $scope.info.endDay = CV.dtFormat(new Date(date.getTime()-2*24*60*60*1000));
        var thisYear = $scope.info.endDay.substring(0, 4);
        $scope.info.historyNormalYear = thisYear;
        $scope.info.historyNormalYearString = thisYear.toString() + "年度";
        $scope.info.historyMajorYear = thisYear;
        $scope.info.historyMajorYearString = thisYear.toString() + "年度";
        for(var i = 0; i < 10; i ++) {
            var _thisYearString = (thisYear- i).toString() +"年度";
            $scope.info.n_year_list.push(_thisYearString);
            $scope.info.m_year_list.push(_thisYearString);
        }
    };
    //变更年份
    $scope.changeNormalYear = function(y) {
        $scope.historyNormalYear = y.substring(0,4);
    };
    $scope.changeMajorYear = function(y) {
        $scope.historyMajorYear = y.substring(0,4);
    };
    init();
}]);

/**
 *紧急发布
 * */
anaCtrl.controller("urgentAnalysisCtrl", ["$scope","CV",function($scope, CV) {
    var thisYear = new Date().getFullYear();
    $scope.info = {
        yearCount :0, //年份总计
        yearFail  :0, //年份失败数
        yearList  :[],//可选年份列表
        endDay    :'',//截止日期
        historyYear:'',//所选年份
        historyYearString:'',//所选年份+“年度"
    };
    var init = function () {
        $scope.info.endDay = CV.dtFormat(new Date(new Date().getTime()-2*24*60*60*1000));
        $scope.info.historyYear = thisYear;
        $scope.info.historyYearString = thisYear.toString() + "年度";
        for(var i = 0; i <= 10; i ++) {
            $scope.info.yearList.push((thisYear- i).toString() +"年度");
        };
    }
    //变更历史年份
    $scope.changeYear = function(y) {
        $scope.info.historyYear = y.substring(0,4);
    };
    init();
}]);
