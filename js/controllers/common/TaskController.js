'use strict';

//任务控制器
var tCtrl = angular.module('TaskController', []);

/**
 * 任务列表
 * */
tCtrl.controller('tasksListCtrl', ["$scope", "$rootScope", "$state", "$stateParams", "Task", "Modal", "CV", function($scope, $rootScope, $state, $stateParams, Task, Modal, CV) {
    var _tab_name = $stateParams.tab_name;
    //任务信息
    $scope.task_info = {
        mine_task_exe_count    : '',  //我的任务待处理数
        review_task_exe_count  : '',  //复核任务待处理数
        auth_task_exe_count    : '',  //授权任务待处理数
        trouble_task_exe_count : ''   //故障单任务待处理数
    };
    //页面控制
    $scope.control = {
        tab_flag : 1
    };
    var init = function () {
        if(_tab_name === "mine_task"){
            $scope.control.tab_flag = 1;
        }else if(_tab_name === "review_task"){
            $scope.control.tab_flag = 2;
        }else if(_tab_name === "trouble_task"){
            $scope.control.tab_flag = 4;
        }else{
            $scope.control.tab_flag = 3;
        }
        //获取未处理任务列表记录
        Task.getUnhandleTaskList(0,3).then(function(data){
            $rootScope.all_recdt = data.all_recd;
        },function(error){
            Modal.alert(error.message,3);
        });
        //获取未处理任务数
        Task.getUnhandleTaskCount().then(function (data){
            $scope.task_info = {
                mine_task_exe_count    : data.mine_executory_count         || '',
                review_task_exe_count  : data.uncheck_executory_count      || '',
                auth_task_exe_count    : data.unauth_executory_count       || '',
                trouble_task_exe_count : data.mine_trouble_executory_count || ''
            };
        },function(error){
            Modal.alert(error.message,3);
        });
    };
    //选择tab页
    $scope.selectTab = function (tab_flag,name){
        $scope.control.tab_flag = tab_flag;
        $state.go('tasks_list',{tab_name:name});
    };
    init();
}]);

/**
 * 历史任务列表
 * */
tCtrl.controller('tasksHistoryListCtrl', ["$scope", "$state", "$stateParams", function($scope, $state, $stateParams) {
    var _tab_name = $stateParams.tab_name;
    //页面控制
    $scope.control = {
        tab_flag : 1
    };
    if(_tab_name === "submit_his"){
        $scope.control.tab_flag = 1;
    }else if(_tab_name === "review_his"){
        $scope.control.tab_flag  = 2;
    }else{
        $scope.control.tab_flag  = 3;
    }
    //选择历史任务Tab
    $scope.selectHisTaskTab = function (tab_flag,name) {
        $scope.control.tab_flag  = tab_flag;
        $state.go('tasks_history_list',{tab_name:name});
    };
}]);

/**
 * 任务查看
 * */
tCtrl.controller('taskDetailCtrl', ["$scope", "$stateParams", "$state", "Task", "Modal", function($scope, $stateParams, $state, Task, Modal) {
    var _tab_name = $stateParams.tab_name; //tab名称
    var _task_seq = $stateParams.task_id;  //任务流水号
    var _task_handle_state = '';           //任务处理状态
    //任务信息
    $scope.task_info = {
        task_seq  : _task_seq,   //任务流水号
        task_desc : '',          //任务描述
        task_apply_desc:'',      //任务申请说明
        task_flow_list:[],       //任务处理流程列表
        interface_info : {       //接口信息
            interface_list : [], //接口数据列表
            extra_list     : [], //附件数据列表
        }
    };
    var init = function () {
        //查询任务详细信息
        Task.getTaskDetail(_task_seq).then(function(data){
            var _interface_list = JSON.parse(data.new_json_list);
            _task_handle_state = data.workflow_state || '';
            $scope.task_info.task_desc = data.pendwk_bk_expl || '';
            $scope.task_info.task_apply_desc = data.apply_bk_expl || '';
            $scope.task_info.task_flow_list = data.work_detail_list || [];
            $scope.task_info.url = data.rs_url || '';
            $scope.task_info.aprov_type = data.aprov_type || 1;
            $scope.task_info.interface_info.interface_list = angular.copy(_interface_list);

            //处理-任务流程状态
            for(var i = 0; i < $scope.task_info.task_flow_list.length; i++){
                var _single_step = $scope.task_info.task_flow_list[i];
                if(_single_step.pend_type == 1){
                    _single_step.deal_type_name ="申请";
                }else if(_single_step.pend_type == 2){
                    _single_step.deal_type_name ="复核";
                }else if(_single_step.pend_type == 3){
                    _single_step.deal_type_name ="授权";
                }else if(_single_step.pend_type == 4){
                    _single_step.deal_type_name ="执行";
                }else{
                    _single_step.deal_type_name ="关闭";
                }
                _single_step.show = false;
            }
        },function(error){
            Modal.alert(error.message,3);
        });
        //获得任务接口附件信息
        Task.getAccessoryInfo(_task_seq).then(function(data){
            $scope.task_info.interface_info.extra_list = data.extra_list || [];
        },function(error){
            Modal.alert(error.message,3);
        });
    };

    //鼠标移入事件
    $scope.mouseEnter = function (length,index) {
        var element =".changeWith"+index;
        if(length >= 28){
            $scope.task_info.task_flow_list[index].show = true;
            var _width = (length-24)*9 + 230;
            $(element).css("width",_width);
        }
    };
    //鼠标离开事件
    $scope.mouseLeave = function (index) {
        $scope.task_info.task_flow_list[index].show = false;
        var element =".changeWith" +index;
        $(element).width(208);
    };
    //处理流程小圆样式
    $scope.flowCircleSm = function (work_state,index) {
        if(_task_handle_state == 2 || _task_handle_state ==4){
            return {
                'background-color'  : work_state == 1  ? "#0095A5": work_state == 2 ? "#D85668" : index == $scope.task_info.task_flow_list.length-1 ? "#0095A5" : "#CCCCCC",
                'top'               : (index)*100 +(-10)+"px",
            };
        }else if(_task_handle_state == 1 || _task_handle_state == 3 || _task_handle_state ==5){
            return {
                'background-color'  :work_state == 1 || work_state == 3  ? "#0095A5": "#FFFFFF",
                'border'            :"2px solid #0095A5",
                'top'               :(index)*100 +(-10)+"px",
            };
        }else if(_task_handle_state == 7){
            return {
                'background-color'  : (work_state == 1 && index != $scope.task_info.task_flow_list.length-1) ? "#0095A5" : work_state == 2 ? "#F37889" :index == $scope.task_info.task_flow_list.length-1  ? "black":"#CCCCCC",
                'top'               : (index)*100 +(-10)+"px",
            };
        }else{
            return {
                'background-color'  : work_state == 1 ? "#0095A5" : work_state == 2 ? "#F37889" : work_state == 4 ? "#0095A5":"#CCCCCC",
                'border-radius'     : "100%",
                'top'               : (index)*100 +(-10)+"px",
            };
        }

    };
    //处理流程大圆样式
    $scope.flowCircleLg = function (work_state,index) {
        if(work_state == 6 || work_state == 7){
            return {};
        }else{
            return {
                'top'  : (index)*112 +(-16)+"px",
            };
        }
    };
    //设置容器高度
    $scope.setContainerHeight = function (size) {
        return {
            'height'     : 100 * (size-1) + 200 > 399 ? (100 * (size-1) + 200)+"px" :"",
            'min-height' : "399px"
        };
    };
    //竖线样式
    $scope.verticalLineStyle = function (size) {
        return {
            'height'  : (110 * (size-1)) + "px",
        };
    };
    //任务处理状态名称
    $scope.taskStateCnName = function (size) {
        return{
            'top' : (size * 92)-18+"px",
        }
    };
    //查看接口信息
    $scope.viewInterfaceInfo = function () {
        Modal.jsonList($scope.task_info.interface_info,$scope.task_info.url,$scope.task_info.aprov_type,_task_seq);
    };
    //返回
    $scope.back = function(){
       if(_tab_name.indexOf("his") > 0){
           $state.go("tasks_history_list",{tab_name: _tab_name});
       }else{
           $state.go("tasks_list",{tab_name: _tab_name});
       }
    };
    init();
}]);

/**
 *任务处理
 * */
tCtrl.controller('taskHandleCtrl', ["$scope", "$rootScope", "$stateParams", "$state", "Task", "Modal", function($scope, $rootScope, $stateParams, $state, Task, Modal) {
    var _tab_name = $stateParams.tab_name; //tab名称
    var _task_seq = $stateParams.task_id;  //任务流水号
    var _srv_name = '';                    //服务名称
    var _new_interface_list = [];          //处理后-任务接口信息列表
    //任务信息
    $scope.task_info = {
        task_seq  : _task_seq,   //任务流水号
        task_desc : '',          //任务描述
        task_apply_desc:'',      //任务申请说明
        task_handle_desc:'',     //任务处理说明
        task_handle_state:'',    //任务处理状态
        task_flow_list:[],       //任务处理流程列表
        handle_flag : 1,         //处理标志(1 执行/通过 2终止/拒绝)
        interface_info : {       //接口信息
            interface_list : [], //接口数据列表
            extra_list     : [], //附件数据列表
        }
    };
    //页面控制
    $scope.control = {
        btn_loading : false,
        task_handle_type : 0, //任务处理类型(1:授权 2：处理 3：复核 4：故障单处理)
    };

    //查询未处理的任务
    var getUnhandleTask = function () {
        //查询未处理的而任务列表
        Task.getUnhandleTaskList(0,3).then(function(data){
            $rootScope.head_tasks = data.unhandle_work_list;
            $rootScope.all_recdt = data.all_recd;
        },function(error){
            Modal.alert(error.message,3);
        });
    };
    //初始化任务信息
    var initTaskInfo = function () {
        //查询任务详细信息
        Task.getTaskDetail(_task_seq).then(function(data){
            var _interface_list = JSON.parse(data.new_json_list);
            _srv_name = data.pend_srv_name;
            $scope.task_info.task_desc = data.pendwk_bk_expl || '';
            $scope.task_info.task_apply_desc = data.apply_bk_expl || '';
            $scope.task_info.task_handle_state = data.workflow_state || '';
            $scope.task_info.task_flow_list = data.work_detail_list || [];
            $scope.task_info.interface_info.interface_list = angular.copy(_interface_list);
            $scope.task_info.handle_flag = $scope.task_info.task_handle_state != 5 && $scope.control.task_handle_type == 2 ? 2 : 1;

            //处理任务接口数据
            _new_interface_list = angular.copy(_interface_list);
            for(var i = _new_interface_list.length-1; i >= 0; i--){
                var _interface = _new_interface_list[i];
                if(_interface.fname == 'org_srv_name' || _interface.fname == 'org_rs_code' || _interface.fname == 'remote_ip' || _interface.fname == 'org_work_code' || _interface.fname == 'server_port' || _interface.fname == "pend_work_seq" ||_interface.fname == 'server_name' || _interface.fname == 'pendwk_bk_expl'){
                    _interface.splice(i,1);
                }
            }

            //处理-任务流程状态
            for(var i = 0; i < $scope.task_info.task_flow_list.length; i++){
                var _single_step = $scope.task_info.task_flow_list[i];
                if(_single_step.pend_type == 1){
                    _single_step.deal_type_name ="申请";
                }else if(_single_step.pend_type == 2){
                    _single_step.deal_type_name ="复核";
                }else if(_single_step.pend_type == 3){
                    _single_step.deal_type_name ="授权";
                }else if(_single_step.pend_type == 4){
                    _single_step.deal_type_name ="执行";
                }else{
                    _single_step.deal_type_name ="关闭";
                }
                _single_step.show = false;
            }

        },function(error){
            Modal.alert(error.message,3);
        });
        //获得任务接口附件信息
        Task.getAccessoryInfo(_task_seq).then(function(data){
            $scope.task_info.interface_info.extra_list = data.extra_list || [];
        },function(error){
            Modal.alert(error.message,3);
        })
    };
    var init = function () {
        //任务处理类型
        if(_tab_name === "auth_task"){
            $scope.control.task_handle_type = 1;
        }else if(_tab_name === "review_task"){
            $scope.control.task_handle_type = 3;
        }else{
            $scope.control.task_handle_type = 2;
        }
        initTaskInfo();
    };
    //鼠标移入事件
    $scope.mouseEnter = function (length,index) {
        var element =".changeWith"+index;
        if(length >= 28){
            $scope.task_info.task_flow_list[index].show = true;
            var _width = (length-24)*9 + 230;
            $(element).css("width",_width);
        }
    };
    //鼠标离开事件
    $scope.mouseLeave = function (index) {
        $scope.task_info.task_flow_list[index].show = false;
        var element =".changeWith" +index;
        $(element).width(208);
    };
    //处理流程小圆样式
    $scope.flowCircleSm =function(work_state,index){
        if($scope.task_info.task_handle_state == 2 || $scope.task_info.task_handle_state ==4){
            return {
                'background-color' : work_state == 1  ? "#0095A5": work_state == 2 ? "#D85668" : index == $scope.task_info.task_flow_list.length-1 ? "#0095A5" : "#CCCCCC",
                'top'              : (index)*100 +(-10)+"px",
                'left'             : "-5px",
                'z-index'          : 6
            };
        }else{
            return {
                'background-color' : work_state == 1 || work_state == 3  ? "#0095A5": "#FFFFFF",
                'border'           : "2px solid #0095A5",
                'top'              : (index)*100 +(-10)+"px",
            };
        }

    };
    //处理流程大圆样式
    $scope.flowCircleLg = function (index) {
        return {
            'top' : (index)*112 +(-16)+"px",
        };
    };
    //设置容器高度
    $scope.setContainerHeight = function (size) {
        return {
            'height'     : 140 * (size-1) + 200 > 399 ? (140 * (size-1) + 200)+"px" :"",
            'min-height' : "399px"
        };
    };
    //竖线样式
    $scope.verticalLineStyle = function (size) {
        return {
            'height' : (110 * (size-1))+"px",
        };
    };
    //任务处理状态名称
    $scope.taskStateCnName = function(size){
        return{
            'top' : (size * 92)-18+"px",
        }
    };
    //查看接口信息
    $scope.viewInterfaceInfo = function () {
        Modal.jsonList($scope.task_info.interface_info);
    };
    //处理
    $scope.taskHandle = function(){
        $scope.control.btn_loading = true;
        if($scope.task_info.handle_flag == 1){
            var _task_param = {
                submit_type : 2,
                pend_work_seq : _task_seq,
                srvName : _srv_name,
                deal_bk_desc : $scope.task_info.task_handle_desc
            };
            for(var i = 0; i < _new_interface_list.length; i++) {
                var _interface = _new_interface_list[i];
                _task_param[_interface.fname] = _interface.fval;
            }
            //执行任务
            Task.ExecuteTask(_task_param, _srv_name).then(function(data) {
                Modal.alert("任务执行成功！",2);
                getUnhandleTask();
                $scope.control.btn_loading = false;
                $state.go("tasks_list",{tab_name:_tab_name});
            }, function(error) {
                $scope.control.btn_loading = false;
                Modal.alert(error.message,3);
            });
        }else{
            var param = {
                'pend_wk_seq'       : _task_seq,
                'workflow_state'    : 7,
                'deal_bk_desc'      : $scope.task_info.task_handle_desc,
            };
            //关闭任务
            Task.CloseTask(param).then(function(data) {
                Modal.alert("任务成功关闭！",2);
                getUnhandleTask();
                $scope.control.btn_loading = false;
                $state.go("tasks_list",{tab_name:_tab_name});
            }, function(error) {
                $scope.control.btn_loading = false;
                Modal.alert(error.message,3);
            });
        }
    };
    //复核
    $scope.taskReview = function() {
        var param = {
            'pend_wk_seq'   : _task_seq,
            'deal_res'      : $scope.task_info.handle_flag,
            'deal_bk_desc'  : $scope.task_info.task_handle_desc,
        };
        $scope.control.btn_loading = true;
        //任务复核
        Task.CheckPendTask(param).then(function(data) {
            if(param.deal_res == 1) {
                Modal.alert("复核通过！",2);
            } else {
                Modal.alert("复核拒绝！",3);
            }
            getUnhandleTask();
            $scope.control.btn_loading = false;
            $state.go("tasks_list",{tab_name: _tab_name});
        }, function(error) {
            Modal.alert(error.message,3);
            $scope.control.btn_loading = false;
        });
    };
    //授权
    $scope.taskAuth = function () {
        var param = {
            'pend_wk_seq'   : _task_seq,
            'auth_type'     : 2,    //远程授权
            'deal_res'      : $scope.task_info.handle_flag,
            'deal_bk_desc'  : $scope.task_info.task_handle_desc,
        };
        $scope.control.btn_loading = true;
        //任务授权
        Task.AuthPendTask(param).then(function(data) {
            if(param.deal_res == 1) {
                Modal.alert("成功授权",2);
            } else {
                Modal.alert("授权拒绝！",3);
            }
            getUnhandleTask();
            $scope.control.btn_loading = false;
            $state.go("tasks_list",{tab_name:_tab_name});
        }, function(error) {
            $scope.control.btn_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //取消
    $scope.cancel = function(){
        $state.go("tasks_list",{tab_name:_tab_name});
    };
    init();
}]);

/**
 * 故障单任务处理/查看
 * */
tCtrl.controller('troubleTaskHandleCtrl', ["$scope", "$rootScope", "$stateParams", "$state", "Task", "ProgramExec", "Workorder", "Modal", function($scope, $rootScope, $stateParams, $state, Task, ProgramExec, Workorder, Modal) {
    var _wrk_seq = $stateParams.task_id;           //任务编号
    var _tab_name = $stateParams.tab_name;         //tab名称
    var _detail_flag = $stateParams.detail_flag; //是否为查看
    //任务信息
    $scope.task_info = {
        submit_info : {                     //提交信息
            'pg_work_seq'      : _wrk_seq,  //方案授权任务编号
            'deal_bk_desc'     :  '',       //任务授权说明
            'deal_res'         :  1,        //授权结果(1通过 2拒绝)
            'pgsubmit_type'    :  2         //提交类型
        },
        task_detail : {
            'wrk_seq'          :  _wrk_seq, //任务编号
            'pgwork_status'    :  '',       //方案授权任务状态
            'apply_bk_expl'    :  '',       //任务申请说明
            'work_detail_list' :  []        //任务明细列表(处理流)
        }
    };
    //页面控制
    $scope.control = {
        is_detail : _detail_flag == 'false' ? false : true,   //是否为查看
        btn_loading : false,        //按钮加载
    };

    var init = function () {
        /*
          pgpend_type ( 1 申请 2 授权 3 执行)
          run_state(1 待执行 2 执行中  3 执行成功 4 执行失败)
          pgwork_status( 1 待授权  2 授权拒绝 3 待执行 4 执行完毕  5 关闭任务)*/

        //获取方案授权信息
        Task.getProgramAuthDetail(_wrk_seq).then(function(data){
            $scope.task_info.task_detail.work_detail_list = data.pg_detail_list || [];
            $scope.task_info.task_detail.apply_bk_expl = data.apply_bk_expl || '';
            $scope.task_info.task_detail.pgwork_status = data.pgwork_status || '';

            for(var i =0; i < $scope.task_info.task_detail.work_detail_list.length; i++){
                var _single_step = $scope.task_info.task_detail.work_detail_list[i];
                if(_single_step.pgpend_type == 1){
                    _single_step.deal_type_name ="申请";
                }else if(_single_step.pgpend_type == 2){
                    if($scope.task_info.task_detail.pgwork_status !=2 && $scope.task_info.task_detail.pgwork_status !=5){
                        _single_step.deal_type_name ="授权";
                    }else {
                        if(i == $scope.task_info.task_detail.work_detail_list.length-1){
                            _single_step.deal_type_name ="关闭";
                        }else {
                            _single_step.deal_type_name ="授权";
                        }
                    }
                }else if(_single_step.pgpend_type == 3){
                    if($scope.task_info.task_detail.pgwork_status!=2 && $scope.task_info.task_detail.pgwork_status!=5){
                        _single_step.deal_type_name ="执行";
                    }else {
                        _single_step.deal_type_name ="关闭";
                    }
                }
            }
        },function(error){
            Modal.alert(error.message,3);
        });
    };

    //设置容器高度
    $scope.setContainerHeight =function (size) {
        return {
            'height'     : 100 * (size-1) + 200 > 399 ? (100 * (size-1) + 200)+"px" :"",
            'min-height' : "399px"
        };
    };
    //处理流程小圆样式
    $scope.flowCircleSm = function (work_state,index) {
        if($scope.task_info.task_detail.pgwork_status == 2 ||  $scope.task_info.task_detail.pgwork_status == 5){
            return {
                'background-color'  :work_state == 1  ? "#ccc" : work_state == 2 || work_state == 3 ? "#0095A5" : "#D85668",
                'top'               :(index)*100 +(-10)+"px",
                'border'            :"2px solid",
                'border-color'      :work_state == 1  ? "#ccc" : work_state == 4 ? '#D85668' :'#0095A5',
            };
        }else {
            return {
                'background-color'  :work_state == 1  ? "#fff" : work_state == 2 || work_state == 3 ? "#0095A5" : "#D85668",
                'top'               :(index)*100 +(-10)+"px",
                'border'            :"2px solid",
                'border-color'      :work_state == 4 ? '#D85668' :'#0095A5',
            };
        }
    };
    //处理流程大圆样式
    $scope.flowCircleLg = function (index) {
        var _position = {
            'position'          :"absolute",
            'width'             :"24px",
            'height'            :"24px",
            'left'              :"-11px",
            'z-index'           :1
        };
        if($scope.workflow_state == 2 || $scope.workflow_state ==4){
            return angular.extend(_position,{

                'background-color'  :"#F37889",
                'border-radius'     :"100%",
                'top'               :(index)*112 +(-16)+"px",
            });
        }else{
            return angular.extend(_position,{
                'background-color'  :"#75C6D1",
                'border-radius'     :"100%",
                'top'               :(index)*112 +(-16)+"px",
                'animation-name'    :"cbreath",                     // 动画名称  IE10、Firefox and Opera，IE9以及更早的版本不支持
                'animation-duration':"3s",                           //动画时长3秒
                'animation-timing-function':"ease-in-out",           //动画速度曲线：以低速开始和结束
                'animation-iteration-count':"infinite",
                '-webkit-animation-name':"cbreath",                  //动画名称   Safari and Chrome
                '-webkit-animation-duration':"3s",                   //动画时长3秒
                '-webkit-animation-timing-function': "ease-in-out",  //动画速度曲线：以低速开始和结束
                '-webkit-animation-iteration-count': "infinite",
            });
        }
    };
    //竖线样式
    $scope.verticalLineStyle = function (size) {
        return {
            'height' :(110 * (size-1))+"px",
        };
    };
    //任务处理状态名称
    $scope.taskStateCnName = function (size) {
        return{
            'top' :(size * 92)-18+"px",
        }
    };
    //鼠标移入事件
    $scope.mouseEnter = function (index) {
        var element =".changeWith"+index;
        var _auth_introduce= $(element).find('.auth-introduce');
        var _max_width = Math.max(_auth_introduce.eq(0).width(),_auth_introduce.eq(1) ? _auth_introduce.eq(1).width() : 0);
        if(_max_width > 135){
            var _width =  _max_width+ 100;
            $(element).animate({"width":_width});
        }
    };
    //鼠标离开事件
    $scope.mouseLeave = function (index) {
        var element =".changeWith" +index;
        $(element).animate({"width":220});
    };
    //查看方案详细信息
    $scope.programDetail = function() {
        Modal.viewTroubleTicketProgram(_wrk_seq)
    };
    //授权
    $scope.taskAuth = function () {
        $scope.control.btn_loading = true;
        Task.authProgram($scope.task_info.submit_info).then(function(data) {
            $state.go("tasks_list",{tab_name:_tab_name});
        }, function(error) {
            $scope.control.btn_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //执行
    $scope.taskExec = function () {
        $scope.control.btn_loading = true;
        ProgramExec.execProgramStep($scope.task_info.submit_info).then(function(data) {
            $state.go("tasks_list",{tab_name:_tab_name});
            Modal.alert('执行成功',2)
        }, function(error) {
            $scope.control.btn_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //关闭
    $scope.taskClose = function () {
        $scope.control.btn_loading = true;
        Workorder.closePgWorkAction(_wrk_seq,$scope.task.deal_bk_desc).then(function(data) {
            $state.go("tasks_list",{tab_name:_tab_name});
            Modal.alert('关闭成功',2)
        }, function(error) {
            $scope.control.btn_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //返回
    $scope.back = function () {
        $state.go("tasks_list",{tab_name:_tab_name});
    };
    init();
}]);