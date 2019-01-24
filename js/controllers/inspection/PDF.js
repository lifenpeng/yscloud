//巡检任务查看报表模块
var pdfModule = angular.module('PDFModule', ["highcharts-ng", 'ui.bootstrap', 'CvService',
    'InspectionHttpSrv',
    'CommHttpSrv',
    'ChartsService',
    'ModalCtrl',
    'GlobalData']);

pdfModule.value('baseUrl', '/clWeb/');
pdfModule.controller("LogReportCtrl", ["$scope", "$rootScope", "$location","$timeout" ,"$window" ,"LogXJ","Inspection", "Charts", "Modal", function($scope, $rootScope, $location,$timeout, $window,LogXJ, Inspection, Charts, Modal) {
    var _url = $location.absUrl();
    //日志巡检信息
    $scope.log_inspect_info = {
        report_name : _url.split("=")[1] ? _url.split("=")[1] : "",
        sys_name    : '',
        log_names   : [],
        start_date  : '',
        end_date    : '',
        keywords    : [],
        is_regular  : false,
        time_interval_type : '',
        is_regular_exps    : [],
    };
    //列表数据
    $scope.data = {
        log_file_list     : [],
        sys_list          : [],
        date_circle       : [],
        wordCountBeanList : []
    };
    //页面控制
    $scope.control={
        export_loading:false,
        loading_all:true,
    };
    //获取报告信息
    var getReportMessage = function () {
        $scope.control.loading_all=true;
        LogXJ.getReportMessage($scope.log_inspect_info.report_name).then(function (data){
            if(data.info.down_file_path){
                LogXJ.getReportChartByName(_url.split("=")[1]).then(function (data){
                    $timeout(function() {
                        $scope.data.wordCountBeanList = data.wordCountBeanList || [];
                        angular.forEach($scope.data.wordCountBeanList,function(one_chart){
                            one_chart.chart_config= configChart(one_chart);
                            one_chart.err_table=configErrorTable(one_chart);
                        });
                        $scope.control.loading_all=false;
                    }, 0);
                }, function (error) {
                    $scope.control.loading_all=false;
                    Modal.alert(error.message);
                });
            }else{
                LogXJ.getReportChartByName(_url.split("=")[1]).then(function (data){
                    $timeout(function() {
                        $scope.data.wordCountBeanList = data.wordCountBeanList || [];
                        angular.forEach($scope.data.wordCountBeanList,function(one_chart){
                            one_chart.chart_config= configChart(one_chart);
                            one_chart.err_table=configErrorTable(one_chart);
                        });
                        $scope.control.loading_all=false;
                        $timeout(function(){
                            $scope.control.export_loading=true;
                            LogXJ.getInspectPdf($scope.log_inspect_info.report_name,_url.replace('false','true'),'1024*768').then(function (data){
                                $timeout(function() {
                                    $scope.control.export_loading=false;
                                    Modal.alert("导出成功");
                                }, 0);
                            }, function (error) {
                                $scope.control.export_loading=false;
                                Modal.alert(error.message);
                            });
                        },1000)
                    }, 0);
                }, function (error) {
                    $scope.control.loading_all=false;
                    Modal.alert(error.message);
                });
            }
        }, function (error) {
            Modal.alert(error.message);
            $scope.control.loading_all=false;
        });
    };
    //图标配置
    var configChart = function(cur){
        //0折线图，1,2柱状图
        var _chart={
            title:cur.time_interval_type==0 ? '错误时间分布' :'错误数走势',
            subtitle:cur.time_interval_type==0 ? cur.start_date : cur.start_date+"至"+cur.end_date,
            chart_type:cur.time_interval_type,
            yAxis_name:'错误数',
            xAxis_type:'5',
            columns:[{
                name:'错误数',
                data:cur.count_by_units,
            }],
            units:cur.units,
        };
        return Charts.getLogColumnConfig(_chart,260);
    };
    //配置错误日志表格
    var configErrorTable = function(cur){
        var _error_table=[];
        for(var i = 0; i < cur.keywords.length; i++){
            var _one_error={
                key_word:cur.keywords[i],
                error_count:'',
                scale:'',
            };
            _error_table.push(_one_error);
        }
        for(var j = 0; j < cur.counts.length; j++){
            _error_table[j].error_count = cur.counts[j];
            if(cur.total_count==0){
                _error_table[j].scale='无';
            }else{
                _error_table[j].scale=(cur.counts[j]/cur.total_count)*100 +'%';
            }
        }
        return _error_table;
    };
    var init = function(){
        getReportMessage();
    };
    $scope.saveToPdf=function(){
        $scope.control.export_loading=true;
        LogXJ.getInspectPdf($scope.log_inspect_info.report_name,_url.replace('false','true'),'1024*768').then(function (data){
            $timeout(function() {
                $scope.control.export_loading=false;
                Modal.alert("导出成功");
            }, 0);
        }, function (error) {
            $scope.control.export_loading=false;
            Modal.alert(error.message);
        });
    };
    init();
}]);