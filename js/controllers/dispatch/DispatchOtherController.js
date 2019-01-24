/**
 * Created by admin on 2018/6/2.
 * 包括策略和统计模块的控制器
 */
var other = angular.module('dispatchOtherController',[]);
//策略组列表控制器
other.controller('strategyListCtrl', ["$scope", "$timeout", "Scene", "Modal", "CV", function($scope, $timeout, Scene, Modal, CV) {
    //新增策略组
    $scope.newStrategyGroup = function(){
        Modal.newStrategyGroup().then(function(data){
            if(data){
                $scope.$broadcast("updateTableDate", {})
            }
        })
    };
}]);
//策略组查看控制器
other.controller('strategyDetailCtrl', ["$scope", "$stateParams", "$state", "$timeout", "StrategyGroupType", "Strategy", "Modal", "CV", function($scope, $stateParams, $state, $timeout, StrategyGroupType, Strategy, Modal, CV) {
    var _strategy_id = $stateParams.strategy_id ? $stateParams.strategy_id : '';
    var _flow_param = {offset:0, limit:0,sdstrategy_id:_strategy_id};

    $scope.info = {
        sdstrategy_id        : '',
        sdstrategy_name      : '',
        sdstrategy_desc      : '',
        sdstrategy_concurrent: 2,
        sdpriority           : 5,
        sdstrategy_type      : 2
    };
    var init = function(){
        Strategy.viewSingleStrategyGroup(_strategy_id).then(function(data){
            $timeout(function(){
                if(data.strategyInfo){
                    $scope.info = data.strategyInfo;
                    $scope.info.strategy_type_cn = CV.findValue($scope.info.sdstrategy_type,StrategyGroupType);
                    //获取策略组流程(可扩展成分页)
                    Strategy.getFlowListByStrategyId(_flow_param).then(function(data){
                        $timeout(function(){
                            if(data){
                                $scope.info.flow_list =  data.flow_list ? data.flow_list : [];
                            }
                        },0);
                    },function(error){
                        $scope.info.flow_err_msg = error.message;
                    })
                }
            },0)
        },function (error) {
            Modal.alert(error.message);
            $state.go('dispatch_strategy_list')
        });
    }
    init();
}]);
//统计列表控制器
other.controller('reportListCtrl', ["$scope", "$rootScope", "$location", "$timeout","Flow", "Charts", "Modal", "CV", function($scope, $rootScope, $location, $timeout, Flow, Charts, Modal, CV) {
    var _max_date = new Date(); //日期最大值
    var flow_pipe = {           //流程饼状图
        title:'',
        name:'流程数',
        info_name:'总流程数',
        total_num:0,
        data:[]
    };
    var task_pipe={             //任务饼状图
        title:'任务总数',
        name:'任务数',
        info_name:'总流程数',
        total_num:0,
        data:[]
    };
    var column = {              //柱状图
        title: '',
        yAxis_name: '总笔数',
        columns: [{
            name: '总笔数',
            data: []
        }]
    };
    $scope.info = {
        maxDate : _max_date,    //日期最大值
        datepicker_start : {},  //日期控件
        datepicker_end : {},    //日期控件
        chart : {               //图表数据
            begin_date:'',
            end_data  :'',
            chart_config:{}
        }
    };
    $scope.control = {
        loading:false,
        err_msg:'',
        has_data_flag:''
    };

    //显示日期控件
    $scope.open = function (flag) {
        if(flag==1){
            $scope.info.datepicker_start.opened = true;
        }else if(flag==2){
            $scope.info.datepicker_end.opened = true;
        }
    };
    //获取日期区间的图标数据
    $scope.getCountInfoByPeriod = function () {
        if(!CV.valiForm($scope.chart_form)){
            return false;
        }
        if($scope.info.chart.begin_date>$scope.info.chart.end_date){
            Modal.alert("开始时间大于结束时间，请重新选择");
            return false;
        }
        $scope.control.loading = true;
        $scope.info.chart.begin_date_fmt = CV.dtFormat($scope.info.chart.begin_date);
        $scope.info.chart.end_date_fmt = CV.dtFormat($scope.info.chart.end_date);
        Flow.getReportInfoByDate($scope.info.chart).then(function (data) {
            $timeout(function () {
                if(!data.task_count&&!data.flow_running&&!data.flow_failed){
                    $scope.control.has_data_flag = false;
                    return;
                }
                $scope.control.has_data_flag = true;
                data.flow_count = data.flow_count ? data.flow_count :[];
                data.task_count = data.task_count ? data.task_count :[];
                data.flow_running = data.flow_running ? data.flow_running.sort(function(a,b){return b.count_num - a.count_num}) :[];
                data.flow_failed = data.flow_failed ? data.flow_failed.sort(function(a,b){return b.count_num - a.count_num}) :[];
                task_pipe.total_num = 0;
                flow_pipe.total_num = 0;

                for(var i=0;i<data.flow_count.length;i++){
                    data.flow_count[i].name = data.flow_count[i].sddispatch_type === 1 ? '手工':'定时';
                    data.flow_count[i].y = data.flow_count[i].flow_num;
                    flow_pipe.total_num += data.flow_count[i].flow_num;
                }
                flow_pipe.data = data.flow_count;
                flow_pipe.title = "流程总数 " + flow_pipe.total_num;
                $scope.info.chart.chart_flow_config = Charts.getFlowPieConfig(flow_pipe,300);
                $scope.info.chart.chart_flow_config.total_num = flow_pipe.total_num;

                for(var j=0;j<data.task_count.length;j++){
                    data.task_count[j].name = data.task_count[j].count_name;
                    data.task_count[j].y = data.task_count[j].count_num ? data.task_count[j].count_num : 0;
                    task_pipe.total_num += data.task_count[j].y;
                    if(data.task_count[j].count_name === "成功笔数") data.task_count[j].color = '#B0D364';
                    if(data.task_count[j].count_name === "失败笔数") data.task_count[j].color = '#F27772';
                }
                task_pipe.data = data.task_count;
                task_pipe.title = "任务总数 " + task_pipe.total_num;
                $scope.info.chart.chart_task_config = Charts.getFlowPieConfig(task_pipe,300);
                $scope.info.chart.chart_task_config.total_num = task_pipe.total_num;

                var _run = angular.copy(column);
                $scope.control.has_data_flag = true;
                for(var k=0;k<data.flow_running.length;k++){
                    _run.columns[0].data.push([data.flow_running[k].count_name,data.flow_running[k].count_num]);
                }
                $scope.info.chart.chart_running_config = Charts.getFlowColumnConfig(_run,300);

                var _failed= angular.copy(column);
                $scope.control.has_data_flag = true;
                for(var m=0;m<data.flow_failed.length;m++){
                    _failed.columns[0].data.push([data.flow_failed[m].count_name,data.flow_failed[m].count_num]);
                }
                $scope.info.chart.chart_failed_config = Charts.getFlowColumnConfig(_failed,300);
            },0);
            $scope.control.loading = false;
        },function (error) {
            $scope.control.loading = false;
            $scope.control.err_msg = error.message;
        });
    }
}]);

