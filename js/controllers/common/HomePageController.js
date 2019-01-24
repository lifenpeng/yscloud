//首页控制器
var homeCtrl = angular.module('HomePageController', []);

/**
 * 首页
 * */
homeCtrl.controller('indexCtrl', ["$rootScope" ,"$scope", "$state", "$timeout", "User", "Message", "Task","Charts","Version", "Modal", function ($rootScope, $scope, $state, $timeout, User, Message, Task,Charts,Version, Modal) {
    //发布环形图
    var _task_pub_data = {
        title: '',
        color:'#FFF',
        border_width:2,
        split_color:'#344257',
        dataList:[
            {y:19,color:'#41D5EC'},
            {y:80,color:'#F9D938'}
        ]
    };
    //故障环形图
    var _task_fault_data = {
        title: '',
        color:'#FFF',
        border_width:2,
        split_color:'#344257',
        dataList:[
            {y:18,color:'#41D5EC'},
            {y:80,color:'#EE406D'}
        ]
    };
    //调度环形图
    var _task_dispatch_data = {
        title: '',
        data:[
            {y:12,color:'#FF5100',name:'ITS'},
            {y:24,color:'#4EAFFF',name:'KGS'},
            {y:16,color:'#41D5EC',name:'HTS'},
            {y:14,color:'#F9D938',name:'ATS'},
            {y:18,color:'#EE406D',name:'DOS'}
        ],
        name:'微池'
    };
    //空数量环形图
    var _task_pie_data = {
        title: '',
        color:'#FFF',
        border_width:2,
        split_color:'#446479',
        dataList:[
            {name:'',y:100,color:'#446479'}
        ]
    };

    //图表配置
    $scope.config = {
        pub_circle_config      : {}, //项目发布圆图配置
        fault_circle_config    : {}, //故障工单圆图配置
        dispatch_circle_config : {}  //调度任务圆图配置
    };
    //任务数量对象
    $scope.task_info = {
        unhandle_order_num : 0 , //未处理工单数
        handling_order_num : 0 , //处理工单数
        end_project_num    : 80 , //已发布项目数
        ready_project_num  : 19, //准备项目数
        finish_task_num    : 0 , //已完成调度任务数
        unfinish_task_num  : 0   //未完成调度任务数
    };
    //数据对象
    $scope.data = {
        sys_list : [], //系统列表
    };
    //页面控制
    $scope.control = {
        task_loading : true,
        pub_module_exit_flag : true,      //发布模块存在标志
        dispatch_module_exit_flag : true, //调度模块存在标志
        fault_module_exit_flag : true      //故障模块存在标志
    };

    //处理系统列表分页数据
    var handleSysPageData = function (list) {
        var _length = list.length, _result_list = [];
        if(_length == 0){
            _result_list.push({
                page    : 0,
                sys_list: [],
                active  : false
            });
        }else{
            for(var k = 0; k < _length; k+=12){
                _result_list.push({
                    page     : parseInt(k/12),
                    sys_list : list.slice(k,k+12),
                    active   : false
                });
            }
        }
        //剩余系统列表数据长度
        var  _remain_length =  12 - _result_list[_result_list.length-1].sys_list.length;
        for(var i = 0; i < _remain_length; i++){
            _result_list[_result_list.length-1].sys_list.push({})
        }

        _result_list[0].active = true;
        return _result_list;
    };
    var init = function(){
        var _sys_list = [];
        $scope.data.sys_list =  handleSysPageData(_sys_list);
        $scope.config.pub_circle_config = Charts.getSplitPieConfig(_task_pie_data,130,130,true);
        $scope.config.fault_circle_config = Charts.getSplitPieConfig(_task_pie_data,130,130,true);
        $scope.config.dispatch_circle_config = Charts.getFlowColumnConfig(_task_pie_data,130,130,true);
        //获取系统流列表
        // Version.getStreamListByKey('',1,).then(function (data) {
        //
        //     _sys_list = data.vsVersion_list ? data.vsVersion_list : [];
        //     $scope.data.sys_list =  handleSysPageData(_sys_list);
        // },function (error) {
        //     Modal.alert(error.message,3)
        // });


        $scope.config.pub_circle_config = Charts.getSplitPieConfig(_task_pub_data,160,160,true);
        $scope.config.fault_circle_config = Charts.getSplitPieConfig(_task_fault_data,160,160,true);
        $scope.config.dispatch_circle_config = Charts.getFlowPieConfig(_task_dispatch_data,180,true);

        //获取任务数量
        Task.getIndexTaskCount().then(function (data) {

            if(data){
                $scope.control.task_loading = false;
                if(data.project_bean){
                    var _proj_total_count = data.project_bean.end_project_num + data.project_bean.ready_project_num;
                    $scope.task_info.end_project_num = data.project_bean.end_project_num;
                    $scope.task_info.ready_project_num = data.project_bean.ready_project_num;
                    if(_proj_total_count != 0){
                        _task_pub_data.dataList.push(
                            {y:parseFloat(($scope.task_info.end_project_num/_proj_total_count) * 100),color:'#43e0f7'},
                            {y:parseFloat(($scope.task_info.ready_project_num/_proj_total_count) * 100),color:'#f8d838'});
                        $scope.config.pub_circle_config = Charts.getSplitPieConfig(_task_pub_data,110,110,true);
                    }
                }
                if(data.order_bean){
                    var _order_total_count = data.order_bean.handling_order_num + data.order_bean.unhandle_order_num;
                    $scope.task_info.handling_order_num = data.order_bean.handling_order_num;
                    $scope.task_info.unhandle_order_num = data.order_bean.unhandle_order_num;
                    if(_order_total_count != 0){
                        _task_fault_data.dataList.push(
                            {y:parseFloat(($scope.task_info.handling_order_num/_order_total_count) * 100),color:'#4faeff'},
                            {y:parseFloat(($scope.task_info.unhandle_order_num/_order_total_count) * 100),color:'#ed416e'});
                        $scope.config.fault_circle_config = Charts.getSplitPieConfig(_task_fault_data,110,110,true);
                    }
                }
                if(data.task_bean){
                    var _total_count = data.task_bean.finish_task_num + data.task_bean.unfinish_task_num;
                    $scope.task_info.finish_task_num = data.task_bean.finish_task_num;
                    $scope.task_info.unfinish_task_num = data.task_bean.unfinish_task_num;
                    if(_total_count != 0){
                        // _task_dispatch_data.dataList.push(
                        //     {y:parseFloat(($scope.task_info.finish_task_num /_total_count) * 100),color:'#f458b7'},
                        //     {y:parseFloat(($scope.task_info.unfinish_task_num/_total_count) * 100),color:'#ff9a00'});
                        // $scope.config.dispatch_circle_config = Charts.getSplitPieConfig(_task_dispatch_data,110,110,true);
                    }
                }
                var _menu_list = $rootScope.level_menu_list;
                angular.forEach(_menu_list, function(data){
                    switch (data.menu_name) {
                        case '发布':
                            $scope.control.pub_module_exit_flag =true;
                            break;
                        case '故障':
                            $scope.control.fault_module_exit_flag =true;
                            break;
                        case '调度':
                            $scope.control.dispatch_module_exit_flag =true;
                            break;
                    }
                })
            }
        },function (error) {
            Modal.alert(error.message,3);
        })
    };

    //跳转到对应任务列表
    $scope.goToList = function(flag){
        if(flag == 1){
            $state.go('proj_list');
        }else if(flag == 2){
            $state.go('wo_mine.create_list');
        }else{
            $state.go('dispatch_task_list.cur_task');
        }
    };
    //切换数据
    $scope.switchData = function(index,flag,list){
        var _curr_page = $('#page_'+index),_prev_page = $('#page_'+(index-1)),_next_page = $('#page_'+(index+1));
        var _prev_btn =  $('.sys_prev_btn'),_next_btn = $('.sys_next_btn');
        _prev_btn.css('display','none');
        _next_btn.css('display','none');
        if(flag == 1){
            _curr_page.animate({left: -_curr_page.width()+ 'px'},1000,function(){
                _curr_page.css('display','none')
            });
            _next_page.css('display','block');
            _next_page.css('left', _next_page.width()+'px');
            _next_page.animate({left:'0px'},1000,function () {
                _prev_btn.css('display','block');
                _next_btn.css('display','block');
            });
        }else{
            _curr_page.animate({left: _curr_page.width()+ 'px'},1000,function(){
                _curr_page.css('display','none')
            });
            _prev_page.css('display','block');
            _prev_page.css('left', - _prev_page.width()+'px');
            _prev_page.animate({left: '0px'},1000,function () {
                _prev_btn.css('display','block');
                _next_btn.css('display','block');
            });
        }
    };

    init()

    $scope.app_Url = function(par){
        $state.go('appStore',{sdflow_type:par});
    }
}]);

