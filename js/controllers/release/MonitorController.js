'use strict';

//发布监控控制器
var monitorCtrl = angular.module('MonitorController', []);
/*发布监控列表*/
monitorCtrl.controller('execMonirorListCtrl', ["$scope", "$timeout", "$routeParams", "$rootScope", "$state", "$interval", "Monitor", "Plan","Project", "Modal", "CV", function($scope, $timeout, $routeParams, $rootScope, $state, $interval, Monitor, Plan,Project, Modal, CV) {
    //pjpublish_status 1待发布 2发布中 3发布完成

    var _monitor = {};//自动刷新对象
    //纪录上次的百分比
    var _old_percent = 0;
    //新版发布监控
    $scope.info = {
        all_project_count:0, //所有项目数
        pub_project_count:0, //发布中数
        wait_project_count:0, //待发布数
        pubed_project_count:0, //已发布
        pub_percent:0, //发布百分比
        head_date:{}, //头部日期
        mouth_date:{}, //侧边栏日期没有年份
        tomorrow_date:{},//明天日期
        pjplan_list:[],//项目列表
    };
    $scope.control = {
        monitor_info_loading:true,//监控数据加载
        begin_flag:true,//所有项目未开始标志
        finish_flag:false,//所有项目执行完毕标志
    };
    var initData = function(){
        $scope.info.all_project_count = 0;
        $scope.info.pub_project_count = 0;
        $scope.info.wait_project_count = 0;
        $scope.info.pubed_project_count = 0;
        $scope.info.pub_percent = 0;
    };
    //获取各种状态下的项目数量
    var getProjPubPercent = function(){
       if($scope.info.all_project_count != 0){
          $scope.info.pub_percent = Math.round($scope.info.pubed_project_count / $scope.info.all_project_count*100);
       }
       dynamicGetBg();
       _old_percent = $scope.info.pub_percent;
    };

    //对分组数据个数进行处理
    var dealGroupData = function(list){
        list = list || [];
        $scope.info.all_project_count = list.length;
        angular.forEach(list,function (item,index,array) {
            if(item.pjpublish_status === 2){
                $scope.info.pub_project_count ++; //发布中
            }else if(item.pjpublish_status === 1){
                $scope.info.wait_project_count ++; //待发布
            }
        });
        $scope.info.pubed_project_count = $scope.info.all_project_count - $scope.info.pub_project_count - $scope.info.wait_project_count;
    };
    //对页面上的数据进行部分更新
    var updatePageInfo = function(old_list,new_list){
        for(var i=0; i<old_list.length; i++){
            var _old = old_list[i];
            for(var j=0; j<new_list.length; j++){
                var _new = new_list[j];
                //找到同一个分组
                if(_old.pjpublish_id && _new.pjpublish_id && (_old.pjpublish_id == _new.pjpublish_id)){
                    _old.publish_count = _new.publish_count;
                    _old.exec_count = _new.exec_count;
                    _old.exec_end_count = _new.exec_end_count;
                    _old.project_status = _new.project_status;
                    break;
                }
            }
        }
        dealGroupData(old_list);
        getProjPubPercent();
    };
    //刷新当前监控页面的数据
    var refreshMonitorInfo = function(){
        Monitor.getAllMonitorInfomation().then(function(data){
            var _list = data.pjplan_list ? data.pjplan_list : [];
            initData();
            updatePageInfo($scope.info.pjplan_list,_list);
        },function(error){

        });
    };
    var init = function(){
        Monitor.getAllMonitorInfomation().then(function(data){
            var _list = data.pjplan_list ? data.pjplan_list : [];
            dealGroupData(_list);
            getProjPubPercent();
            $scope.info.pjplan_list = _list;
            $scope.control.monitor_info_loading = false;
            //监控开始
            _monitor = $interval(function () {
                refreshMonitorInfo();
            }, 5000);
        },function(error){
           $scope.control.monitor_info_loading = false;
        });
    };
    //动态获取背景图片
    var dynamicGetBg = function(){
      if(_old_percent ==0 && $scope.info.pub_percent != 0){
         $timeout(function(){
            $scope.control.begin_flag = false;
         },1000);
      }
      if(_old_percent !=100 && $scope.info.pub_percent == 100){
         $timeout(function(){
            $scope.control.finish_flag = true;
         },2000);
      }
   };
    //改变路由，进入详细页面
    $scope.changeState = function(flag,proj){
        if(flag == 3){
            $state.go('group_monitor_detail',{publish_id:proj.pjpublish_id,application_name:proj.pjpublish_name});
        }else if(flag == 2){
            $state.go('proj_detail_pre',{proj_id:proj.project_name,sys_id:proj.business_sys_name});
        }else{
            $state.go('monitor_detail',{proj_id:proj.project_name,sys_id:proj.business_sys_name,proj_status:proj.project_status});
        }

    };
    //跳转监控单个发布系统
    $scope.goToSingleMonitor = function(sys){
        $state.go('monitor_detail',{sys_publish_id:sys.syspublish_id,sys_id:sys.business_sys_name,sys_status:sys.sys_publish_status,quick_pub_flag:2});
    };
    //离开页面之后停止所有监控
    $rootScope.$on('$stateChangeSuccess',function(){
         $timeout(function(){
             //清除监控
             $interval.cancel(_monitor);
         },6000);
     });
    init();
}]);
/*新版分组监控*/
monitorCtrl.controller('monitorGroupCtrl',["$scope", "$timeout", "$stateParams", "$rootScope", "$state", "$interval","Plan", "Monitor", function($scope, $timeout, $stateParams, $rootScope, $state, $interval,Plan, Monitor) {
    //持续刷新数据
    var _interval = {};
    $scope.info = {
        publish_id : $stateParams.publish_id,
        pjpublish_name : $stateParams.application_name,
        nodeLinkData : { //流程图数据
            nodeDataArray:[],//节点数据
            linkDataArray:[],//线条数据
        },
        node_length : 0,//当个项目节点长度最大值，指令中需要用来判断画布长度
        group : {},//单个分组数据
    };
    $scope.control = {
        read_only :true,//流程图只读属性
        loadingData : true,//数据加载中
        loading_error: false,//数据加载出错
    };
    //处理节点数据
    var dealLinkAndNode = function(group){
        $scope.node_length = 0;
        $scope.info.nodeLinkData = {
            nodeDataArray:[],
            linkDataArray:[]
        };
        var _key = 1;
        var _interline_relation = [];
        for(var i = 0 ; i < group.proj_list.length; i++){
            var _proj = group.proj_list[i];
            var _row_node = {
                category:'OfNodes',
                isGroup:true,
                key:_key
            };
            _key++;
            _proj.phase_list =  _proj.phase_list || [];
            $scope.info.nodeLinkData.nodeDataArray.push(_row_node);
            var _pre_key = undefined;
            for(var j = 0 ; j < _proj.phase_list.length; j++){
                $scope.node_length = $scope.node_length > j+1 ? $scope.node_length : j+1;
                var _phase = _proj.phase_list[j];
                var _col_node = {
                    key: _key ,
                    test:_phase.phase_cn_name,
                    isGroup:true,
                    category:'OfGroups',
                    group:_row_node.key,
                    time:j == 0 ? _proj.start_time : (j == _proj.phase_list.length-1 ? _proj.end_time:''),
                };
                _key++;
                if(_phase.phase_status == 2){
                    var _node = {
                        key: _key ,
                        group:_col_node.key,
                        category:'executing',
                        slices: [
                            { start:-90, sweep: 360, color: "#CCC",radius:20,center:20 },
                            { start:-90, sweep: 360*0.01*_phase.phase_dynamic, color:"#2196f3",radius:20,center:20 },
                            { start:-90, sweep: 360, color: "#fafafa" ,radius:16,center:20 },
                        ],
                        dynamic:_phase.phase_dynamic,
                        row:i+1,
                        col:j+1,
                    };
                    _key++;
                }else{
                    var _node = {
                        key: _key ,
                        group:_col_node.key,
                        category:'noExecute',
                        row:i+1,
                        col:j+1,
                        status:_phase.phase_status
                    };
                    _key++;
                }
                if(_phase.rely_list && _phase.rely_list.length != 0){
                    for(var p = 0 ; p < _phase.rely_list.length; p++){
                        var _one_pre = _phase.rely_list[p];
                        _interline_relation.push({to:_node.key,business_sys_name:_one_pre.pre_sys_name,phase_id:_one_pre.pre_phase_id,to_row:p+1,to_col:j+1});
                    }
                }
                $scope.info.nodeLinkData.nodeDataArray.push(_col_node);
                $scope.info.nodeLinkData.nodeDataArray.push(_node);
                if(j != 0){
                    $scope.info.nodeLinkData.linkDataArray.push({from:_pre_key,to:_node.key,statue:_phase.phase_status});
                }
                _pre_key = _node.key;
            }
        }
        for(var i = 0 ; i < _interline_relation.length; i++){
            var key = 0;
            for(var j = 0 ; j < group.proj_list.length; j++){
                key++;
                var _proj = group.proj_list[j];
                for(var k = 0 ; k < _proj.phase_list.length; k++){
                    key = key+2;
                    if(_proj.business_sys_name == _interline_relation[i].business_sys_name && _proj.phase_list[k].phase_id == _interline_relation[i].phase_id){
                        $scope.info.nodeLinkData.linkDataArray.push({to:_interline_relation[i].to,from:key,statue:_proj.phase_list[k].phase_status});
                    }
                }
            }
        }
        $scope.control.loadingData = true;
    };
    //初始化数据
    var init = function(){
        $scope.control.loadingData = false;
        getData();
        _interval = $interval(function () {
            getData();
        }, 10000);
    };
    //获得数据分组数据
    var getData = function(){
        //获取计划编列基础信息
        Plan.getProjectPlanInfo($scope.info.publish_id).then(function (data) {
            if(data){
                $scope.info.group = {
                    proj_list : data.pubProSys_list ? data.pubProSys_list : [],
                    project_cn_name: data.project_cn_name ? data.project_cn_name : '--',
                    dynamic : data.dynamic ? data.dynamic : 0,
                };
                dealLinkAndNode($scope.info.group);
                $scope.control.loadingData = true;
            }
        },function (error) {
            $scope.control.loadingData = true;
            $scope.control.loading_error = true;
            $scope.control.error_message = error.message;
            // Modal.alert(error.message);
        })
        /*Monitor.getPjGroupToProcessMsg($scope.info.publish_id).then(function(data){
            $scope.info.group = data.process_list[0];
            dealLinkAndNode($scope.info.group);
        },function(error){
            $scope.control.loadingData = true;
            $scope.control.loading_error = true;
            $scope.control.error_message = error.message;
        });*/
    };
    //项目样式
    $scope.projStyle = function(index){
        return {
            'top':index*145 +"px"
        }
    };
    //跳转监控单个发布系统
    $scope.goToSingleMonitor = function(proj){
        $state.go('monitor_detail',{sys_publish_id:proj.syspublish_id,sys_id:proj.business_sys_name,sys_status:proj.sys_publish_status,quick_pub_flag:2});
    };
    //返回监控列表页面
    $scope.returnMonitorList =function(){
        $state.go('monitor_list');
    };

    $scope.$on('$stateChangeSuccess',function(){
        $timeout(function(){
            $interval.cancel(_interval); //清除监控
        },1000);
    });
    // 刷新服务
    init();
}]);
/*单个项目执行监控*/
prodCtrl.controller('monitorDetailCtrl', ["$scope", "$stateParams", "$state", "$rootScope", "$interval","$timeout","$sce", "Proj", "Monitor", "Exec", "ProjState", "ProdFlag", "IssueType", "ProdNodeState", "ProdCmdState", "Modal","ProdFunc","CmptFunc" ,"ProtocolType","CodeMirrorOption","ScrollConfig", "CV", function($scope, $stateParams, $state, $rootScope, $interval,$timeout,$sce, Proj, Monitor, Exec, ProjState, ProdFlag, IssueType, ProdNodeState, ProdCmdState, Modal,ProdFunc, CmptFunc,ProtocolType,CodeMirrorOption,ScrollConfig, CV) {
    var _sys_id  = $stateParams.sys_id;//系统名
    var _proj_id  = $stateParams.sys_publish_id;//项目名
    var _prog_type = $stateParams.sys_status < 6 ? 1 : 2;//方案类型
    var _exec_interval = {};//执行信息刷新对象
    var _time_interval = {};//项目开始时间倒计时
    var _codeDiv = $('#codePanel');//内同dome对象
    var _execute_id;//系统发布执行id
    var _env_id;//环境id
    $scope.info = {
        proj_info : {},//项目信息
        exec_type : _prog_type < 6 ? 1 : 2,//方案类型
        instance_info : {//执行步骤信息
            steps : []
        },
        phase_node_info :{//阶段配置节点信息
            nodes_info : {
                node_list :[],
                parallel_flag : false
            },
            nodes_flag : false,
            expand_flag : false,
            phase_status: 1,
            phase_no:1,
            nav_show_flag : 0
        },
        exe_log_info:{},//正在监控的文件对象
        log_info : {//文件对象
            search_key_word : '', //关键字
            curr_checked_ip : '',//当前选中的ip
            monitor_log_list : [], //监控日志文件列表
        },
        nowDate:'',
        nowTime:'',
        remainTime:'',
    };
    //页面控制
    $scope.control = {
        is_log_minisize : false , //控制台缩放控制
        is_Exec : true, //是否是可以执行的用户
        show_prod_error : false,//方案执行出错（头部样式）
        show_monitor_div_flag :true, // 监控信息伸缩标志
        monitor_flag : false,//监控日志标志
        scroll_is_lock: false,//日志滚动
        code_mirror_control : false,
        tab_type:true, //执行节点与日志监控切换
        show_monitor_log: false, // 选中监控文件显示具体监控内容标志
        show_key_word_search_input : false,//显示关键字搜索框标志
        show_start_search : true,
        is_quick_publish : $stateParams.quick_pub_flag ? $stateParams.quick_pub_flag : 2, //是否是敏捷项目
        curr : {//当前执行到的阶段和节点
            _phase:0,
            _node:0,
        },
        can_exec:false,
        show_plan_time:false,

    };
    $scope.data = {
        key_word_count : 0 , //关键字数量
        checked_node_list :[],//选中的节点列表
        log_tasks : {}
    };
    $scope.config = {
        scroll_code_info : ScrollConfig,//内容滚动条配置
        scroll_node_info : ScrollConfig,//节点栏滚动条配置
        scroll_console_info : ScrollConfig,//控制台滚动条配置
        scroll_log_files_info : ScrollConfig,//日志文件滚动条配置
        scroll_log_content_info : ScrollConfig,//日志文件内容滚动条配置
        view_options:CodeMirrorOption.Sh(true),//阶段信息codemirror显示
    };
    //阶段内容初始化滚动控制
    var initScollHeights = function(phase_id) {
        $timeout(function () {
            var _phase = '#phase_'+phase_id;
            $scope.inscrollTo($(_phase));
        },100)
    };
    //获取所有执行节点
    var getAllExecNodes = function (list) {
        var _arr_temp = [];
        var _arr = [];
        var _nodes_list =[];
        for(var i=0;i<list.length;i++){
            var _group = list[i];
            for(var j=0;j<_group.phase_list.length;j++){
                var _phase = _group.phase_list[j];
                if(_phase.node_list){
                    for(var k=0;k<_phase.node_list.length;k++){
                        _arr.push(_phase.node_list[k].exec_node_ip)
                    }
                }
            }
        }
        _arr_temp = Array.from(new Set(_arr));
        for(var l=0;l<_arr_temp.length;l++){
            _nodes_list.push({exec_ip : _arr_temp[l],is_show : false});
        }
        return _nodes_list;
    };
    //倒计时时间和服务器时间计算
    var getFinalTime = function (data) {
        var _now_date = new Date((data.dtbs_bk_date).replace(/-/g,"/")+' '+data.dtbs_bk_time);
        var _year = _now_date.getFullYear();
        var _month = _now_date.getMonth()+1 < 10 ? '0' + (_now_date.getMonth()+1) : _now_date.getMonth()+1;
        var _date = _now_date.getDate() < 10 ? '0' +_now_date.getDate() : _now_date.getDate();
        var _hours = _now_date.getHours() < 10 ? '0' +_now_date.getHours() : _now_date.getHours();
        var _minutes = _now_date.getMinutes() < 10 ? '0' +_now_date.getMinutes() : _now_date.getMinutes();
        var _seconds = _now_date.getSeconds() < 10 ? '0' +_now_date.getSeconds() : _now_date.getSeconds();
        var _remain_date =new Date((data.pj_info_detail.pro_bk_date).replace(/-/g,"/")+' '+ data.pj_info_detail.pro_bk_time);
        var _remain_seconds = _remain_date.getTime();
        var _now_seconds =_now_date.getTime();
        $scope.info.nowDate=_year+"-"+_month+"-"+_date;
        $scope.info.nowTime=_hours+':'+_minutes+':'+_seconds;
        $scope.setTimer = function(){
            _now_seconds+=1000;
            _now_date = new Date(_now_seconds);
            _date = _now_date.getDate() < 10 ? '0' +_now_date.getDate() : _now_date.getDate();
            _hours = _now_date.getHours() < 10 ? '0' +_now_date.getHours() : _now_date.getHours();
            _minutes = _now_date.getMinutes() < 10 ? '0' +_now_date.getMinutes() : _now_date.getMinutes();
            _seconds = _now_date.getSeconds() < 10 ? '0' +_now_date.getSeconds() : _now_date.getSeconds();
            $scope.info.nowDate=_year+"-"+_month+"-"+_date;
            $scope.info.nowTime=_hours+':'+_minutes+':'+_seconds;
            var t=_remain_seconds-_now_seconds;
            var d=0,h=0,m=0,s=0;
            if(t>=0){
                d=Math.floor(t/1000/60/60/24);
                h=Math.floor(t/1000/60/60%24)<10 ? '0'+Math.floor(t/1000/60/60%24) : Math.floor(t/1000/60/60%24);
                m=Math.floor(t/1000/60%60) <10 ? '0'+Math.floor(t/1000/60%60) : Math.floor(t/1000/60%60);
                s=Math.floor(t/1000%60) <10 ? '0'+Math.floor(t/1000%60) : Math.floor(t/1000%60);
                if(d>0){
                    h=d*24+parseInt(h);
                }
                $scope.info.remainTime =h+'时'+m+'分'+s+'秒';
            }else{
                $scope.control.can_exec = true;
            }
            $scope.$applyAsync();
        };
        _time_interval=$interval($scope.setTimer,1000);
    };
    //获取项目详细信息
    var getProj = function() {
        Exec.getSysPubDetail(_sys_id, _proj_id).then(function(data) {
            $scope.info.proj_info = data.pj_info_detail;
            $scope.info.proj_info.project_status = data.pj_info_detail.syspublish_status ? data.pj_info_detail.syspublish_status : 1;
            $scope.info.proj_info.project_status_cn = CV.findValue($scope.info.proj_info.project_status, ProjState);
        }, function(error) {});
    }
    //获取已经执行的步骤信息
    var getSteps = function () {
        Monitor.monitorPjProject(_execute_id).then(function (data) {
            if(data.group_list){
                var _temp_steps = data.group_list ? data.group_list : [];
                $scope.control.curr._phase = data.current_phase_no ? data.current_phase_no : 1;
                $scope.control.curr._node = data.current_phase_ip;
                for(var i=0;i<_temp_steps.length;i++){
                    var _group = _temp_steps[i];
                    for(var j=0;j<_group.phase_list.length;j++){
                        var _phase = $scope.info.instance_info.steps[i].phase_list[j];
                        var _new_phase = _group.phase_list[j];
                        _phase.time_used = _new_phase.time_used ? _new_phase.time_used : 0;
                        _phase.exe_msg = _new_phase.exe_msg ? _new_phase.exe_msg : '';
                        _phase.phase_status = _new_phase.phase_status;
                        _phase.end_bk_tm = _new_phase.end_bk_tm ? _new_phase.end_bk_tm  : '';
                        _phase.start_bk_tm = _new_phase.start_bk_tm ? _new_phase.start_bk_tm  : '';
                        _phase.parallel_flag = _new_phase.parallel_flag;
                        _phase.is_check = false;
                        if(_new_phase.node_list){
                            for(var k=0;k<_new_phase.node_list.length;k++){
                                var _node = _phase.node_list[k];
                                if(_phase.exe_script && _node.cmds){
                                    if($scope.control.curr._node == _node.exec_node_ip){
                                        _phase.exe_script = CmptFunc.cmdsToString(_node.cmds);
                                    }else{
                                        _phase.exe_script = CmptFunc.cmdsToString( _phase.node_list[0].cmds);
                                    }
                                }
                                _node.node_status = _new_phase.node_list[k].node_status;
                                _node.exe_msg = _new_phase.exe_msg
                            }
                        }
                        if($scope.control.curr._phase == _new_phase.phase_no){
                            _phase.is_check = true;
                            $scope.info.phase_node_info.phase_no = _phase.phase_no;
                            $scope.info.phase_node_info.phase_status = _phase.phase_status;
                            $scope.info.phase_node_info.nodes_info.parallel_flag = _phase.parallel_flag;
                            if($scope.info.phase_node_info.nodes_info.node_list){
                                for(var k=0; k < $scope.info.phase_node_info.nodes_info.node_list.length; k++){
                                    $scope.info.phase_node_info.nodes_info.node_list[k].is_show = false;
                                }
                            }
                            if(_phase.node_list){
                                $scope.info.phase_node_info.nodes_flag = false;
                                ProdFunc.dealPhaseNode(_phase.node_list,$scope.info.phase_node_info.nodes_info.node_list);
                            }else{
                                $scope.info.phase_node_info.nodes_flag = true;
                            }
                            if($scope.info.phase_node_info.nodes_info.node_list){
                                $scope.info.phase_node_info.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.phase_node_info.nodes_info.node_list);
                                $scope.info.phase_node_info.expand_flag = ($scope.info.phase_node_info.nav_show_flag == 2) ? true : false;
                            }
                        }
                    }
                };
                cancelMonitorNodeMsg($scope.info.phase_node_info.nodes_info.node_list,false);
                if(data.current_phase_status ==3) {
                    $scope.control.show_prod_error = true;
                }
                if($scope.control.curr._phase == -1){
                    var _last_group =  $scope.info.instance_info.steps[$scope.info.instance_info.steps.length-1];
                    var _last_phase =  _last_group.phase_list[_last_group.phase_list.length-1];
                    $scope.info.phase_node_info.phase_no = _last_phase.phase_no;
                    $scope.info.phase_node_info.phase_status = _last_phase.phase_status;
                    $scope.info.phase_node_info.nodes_info.parallel_flag = _last_phase.parallel_flag;
                    if($scope.info.phase_node_info.nodes_info.node_list){
                        for(var k=0; k < $scope.info.phase_node_info.nodes_info.node_list.length; k++){
                            $scope.info.phase_node_info.nodes_info.node_list[k].is_show = false;
                        }
                    }
                    if(_last_phase.node_list){
                        $scope.info.phase_node_info.nodes_flag = false;
                        ProdFunc.dealPhaseNode(_last_phase.node_list,$scope.info.phase_node_info.nodes_info.node_list);
                    }else{
                        $scope.info.phase_node_info.nodes_flag = true;
                    }
                    _last_phase.is_check = true;
                }
                //初始化所有阶段步骤的滚动高度
                $timeout(function () {
                    if($scope.control.curr._phase != -1){
                        initScollHeights($scope.control.curr._phase);
                    }
                    $scope.control.code_mirror_control = true;
                },200);
            }
        }, function (error) {
            Modal.alert(error.message,3);
            //初始化数据错误，直接返回列表
            $state.go("pub_window")
        });
    };
    //监控节点端口等信息
    var getMonitorNodeMsg = function (soc_ip , node) {
        Exec.monitorNodeMsg(_sys_id,soc_ip).then(function (data) {
            if(data){
                node.node_monitor_msg = data.monitor_result_list ? data.monitor_result_list : [];
                if(node.show_detail){
                    $timeout(function () {
                        getMonitorNodeMsg(soc_ip , node)
                    },5000)
                }
            }
        },function (error) {
            if(node.show_detail){
                $timeout(function () {
                    getMonitorNodeMsg(soc_ip , node)
                },5000)
            }
        });
    };
    //清除个阶段节点端口的监控服务
    var cancelMonitorNodeMsg = function (node_list ,flag) {
        for(var i=0;i<node_list.length;i++){
            var _node = node_list[i];
            if(flag){
                _node.show_detail = false;
            }else {
                if(!_node.is_show){
                    _node.show_detail = false;
                }
            }
        }
    };
    //页面数据初始化&启动Interval
    var init = function() {
        //第一次进入开始倒计时
        Exec.getSysPubDetail(_sys_id, _proj_id).then(function(data) {
            if(data.pj_info_detail){
                _execute_id = data.pj_info_detail.execute_id;
                _env_id = data.pj_info_detail.environment_id;
                var _stop_flag = ($scope.info.proj_info.project_status == 4 || $scope.info.proj_info.project_status == 5 || $scope.info.proj_info.project_status == 7 || $scope.info.proj_info.project_status == 8) ? 2 : 1;
                $state.go('monitor_detail.console',{execute_id:_execute_id,stop_flag:_stop_flag});
                $scope.info.proj_info = data.pj_info_detail;
                $scope.info.proj_info.project_status = data.pj_info_detail.syspublish_status ? data.pj_info_detail.syspublish_status : 1;
                if($scope.info.exec_type == 1){
                    getFinalTime(data);
                }else{
                    $scope.control.can_exec = true;
                }
                if(data.pj_info_detail.syspublish_status == 1) {//防止第三方重置后任然刷新
                    $state.go("pub_window")
                };
                $scope.info.proj_info.project_status_cn = CV.findValue($scope.info.proj_info.project_status, ProjState);
                Monitor.monitorPjProject(_execute_id).then(function (data) {
                    if(data.group_list){
                        $scope.info.instance_info.steps = data.group_list ? data.group_list : [];
                        $scope.info.phase_node_info.nodes_info.node_list = getAllExecNodes($scope.info.instance_info.steps);
                        $scope.control.curr._phase = data.current_phase_no ? data.current_phase_no : 1;
                        $scope.control.curr._node = data.current_phase_ip;
                        for(var i=0;i<$scope.info.instance_info.steps.length;i++){
                            var _group = $scope.info.instance_info.steps[i];
                            _group.expand_flag = true;
                            for(var j=0;j<_group.phase_list.length;j++){
                                var _phase = _group.phase_list[j];
                                _phase.is_check = false;
                                _phase.time_used = _phase.time_used ? _phase.time_used : 0;
                                if(_phase.phase_type <= 3){
                                    if(_phase.node_list){
                                        for( var m = 0; m< _phase.node_list.length; m++){
                                            if($scope.control.curr._node == _phase.node_list[m].exec_node_ip){
                                                _phase.exe_script = CmptFunc.cmdsToString(_phase.node_list[m].cmds);
                                            }else{
                                                _phase.exe_script = CmptFunc.cmdsToString(_phase.node_list[0].cmds);
                                            }
                                        }
                                    }
                                }
                                if(_phase.phase_type == 6){
                                    if(_phase.cmds){
                                        _phase.url_detail = $sce.trustAsHtml(_phase.cmds[0])
                                    }
                                }
                                if($scope.control.curr._phase == _phase.phase_no){
                                    _phase.is_check = true;
                                    $scope.info.phase_node_info.phase_no = _phase.phase_no;
                                    $scope.info.phase_node_info.phase_status = _phase.phase_status;
                                    $scope.info.phase_node_info.nodes_info.parallel_flag = _phase.parallel_flag;
                                    if(_phase.node_list){
                                        $scope.info.phase_node_info.nodes_flag = false;
                                        ProdFunc.dealPhaseNode(_phase.node_list,$scope.info.phase_node_info.nodes_info.node_list);
                                    }else{
                                        $scope.info.phase_node_info.nodes_flag = true;
                                    }
                                    if($scope.info.phase_node_info.nodes_info.node_list){
                                        $scope.info.phase_node_info.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.phase_node_info.nodes_info.node_list);
                                        $scope.info.phase_node_info.expand_flag = ($scope.info.phase_node_info.nav_show_flag == 2) ? true : false;
                                    }
                                }
                            }
                        }
                        if(data.current_phase_status == 3 ) {
                            $scope.control.show_prod_error = true;
                        }
                        if($scope.control.curr._phase == -1){
                            var _last_group =  $scope.info.instance_info.steps[$scope.info.instance_info.steps.length-1];
                            var _last_phase =  _last_group.phase_list[_last_group.phase_list.length-1];
                            $scope.info.phase_node_info.phase_no = _last_phase.phase_no;
                            $scope.info.phase_node_info.phase_status = _last_phase.phase_status;
                            $scope.info.phase_node_info.nodes_info.parallel_flag = _last_phase.parallel_flag;
                            if($scope.info.phase_node_info.nodes_info.node_list){
                                for(var k=0; k < $scope.info.phase_node_info.nodes_info.node_list.length; k++){
                                    $scope.info.phase_node_info.nodes_info.node_list[k].is_show = false;
                                }
                            }
                            if(_last_phase.node_list){
                                $scope.info.phase_node_info.nodes_flag = false;
                                ProdFunc.dealPhaseNode(_last_phase.node_list,$scope.info.phase_node_info.nodes_info.node_list);
                            }else{
                                $scope.info.phase_node_info.nodes_flag = true;
                            }
                            _last_phase.is_check = true;
                        }
                        //初始化所有阶段步骤的滚动高度和codemirror加载问题
                        $timeout(function () {
                            $scope.control.code_mirror_control = true;
                            if($scope.control.curr._phase != -1){
                                initScollHeights($scope.control.curr._phase);
                            }
                        },200)
                    }
                }, function (error) {
                    Modal.alert(error.message,3);
                    //初始化数据错误，直接返回列表
                    $state.go("pub_window");
                    if(_exec_interval) $interval.cancel(_exec_interval);
                });
            }
        }, function(error) {
            if(_exec_interval) $interval.cancel(_exec_interval);
        });
        _exec_interval = $interval(function() {
            getProj();
            getSteps();
        }, 5000);
        $scope.$watch('info.proj_info', function(newValue, oldValue) {
            var _project_status = newValue.project_status;
            if(_project_status > 3 && _project_status != 6){
                if(_exec_interval) $interval.cancel(_exec_interval);
            }
        }, true);
        $('body').addClass("over_flow_y");
    };

    //路由改变清除Interval事件
    $rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
        if(fromState.name != 'monitor_detail'){
            $interval.cancel(_time_interval);
            //清除服务刷新
            $interval.cancel(_exec_interval);
        }
        //清除每个阶段中的监控刷新
        cancelMonitorNodeMsg($scope.info.phase_node_info.nodes_info.node_list,true);
        //清除监控服务
        $scope.control.monitor_flag = false;
        $('body').removeClass("over_flow_y");
    });
    //下载文件
    $scope.downloadFile = function(path) {
        CV.downloadFile(path);
    };
    //鼠标移入显示倒计时
    $scope.changeTime = function () {
        $scope.control.show_plan_time = true;
    };
    //鼠标离开还原服务器时间
    $scope.resetTime = function () {
        $scope.control.show_plan_time = false;
    };
    //监控应用日志信息
    var getMonitorLogDetail = function (log_files) {
        var _log_files ={
            file:log_files.file,
            file_path:log_files.file_path,
            log_name:log_files.log_name,
            no_log_flag:log_files.no_log_flag,
            node_ip:log_files.node_ip,
            node_name:log_files.node_name,
            path :log_files.path,
            task_id:log_files.task_id,
            word_coding:log_files.word_coding
        }
        _log_files.key_word = $scope.info.exe_log_info.key_word ? $scope.info.exe_log_info.key_word : '';
        Exec.getMonitorLogInfo(_log_files).then(function (data) {
            if(data){
                $timeout(function () {
                    var _stop_auto = false;
                    if(data.log_task){
                        if(!data.log_task.stop_mark){
                            _stop_auto = true;
                        }
                        if(data.log_task.log_name == log_files.file_path){
                            if(data.log_task.log_text){
                                log_files.no_log_flag = false;
                                log_files.log_msg =log_files.log_msg.concat(data.log_task.log_text);
                                if(log_files.log_msg.length >= 2000){
                                    log_files.log_msg.splice(0,log_files.log_msg.length-2000);
                                }
                                log_files.log_text = log_files.log_msg;
                                if(!$scope.control.scroll_is_lock){
                                    $timeout(function () {
                                        $scope.logscrollToBottom('bottom', {
                                            scrollEasing:"linear"
                                        });
                                    },100);
                                }
                            }else{
                                log_files.no_log_flag = true;
                            }
                        }
                    };
                    if(_stop_auto){
                        Modal.alert("监控日志超时,已自动停止！",2);
                        $scope.control.monitor_flag = false;
                        return false;
                    };
                    if(!$scope.control.monitor_flag){
                        return false;
                    };
                    getMonitorLogDetail(log_files);
                },1000);
            }
        },function (error) {
            $scope.control.monitor_flag = false;
            Modal.alert('监控日志异常终止',3);
        });
    };
    //添加监控日志内容
    $scope.addMonitorContent = function () {
        Modal.addMonitorModal(_sys_id,_proj_id ,$scope.info.log_info.monitor_log_list,_env_id).then(function (ret) {
            if(ret){
                $scope.info.log_info.monitor_log_list = ret;
            }
        })
    };
    //开始单个节点监控
    $scope.startFileMonitor = function (node) {
        $scope.control.monitor_flag = true;
        node.file_path = node.path +'/'+node.file;
        Exec.startMonitorNode(node).then(function (data) {
            if(data){
                if(data.log_task){
                    if(data.log_task.log_name == node.file_path){
                        node.task_id = data.log_task.task_id;
                        node.log_name = node.file_path;
                        node.log_msg = [];
                    }
                }
                getMonitorLogDetail(node);
            }
        },function (error) {
            $scope.control.monitor_flag = false;
            Modal.alert(error.message,3);
        });
    };
    //结束单个节点监控
    $scope.stopNodeMonitor = function (node) {
        $scope.info.exe_log_info.key_word = '';
        Exec.endMonitorNode({task_id : node.task_id}).then(function (data) {
            if(data){
                $timeout(function () {
                    $scope.control.monitor_flag = false;
                    //滚动条停止滚动
                    // $scope.instop();
                    Modal.alert("已停止监控!",2);
                },0);
            }
        },function (error) {
            Modal.alert(error.message,3);
        });
    };
    //高亮显示搜索内容
    $scope.searchByKeyword = function(key_word){
        //将关键字高亮1
        if(!key_word){
            $scope.logClearSearch('');
            return false;
        }
        if(key_word.length <2){
            Modal.alert('关键字请至少输入两个字符',3);
            return false;
        }
        $('.common_top').each(function(){
            var Reg=new RegExp(key_word,"g");
            var _new_html=$(this).children(":last").text().replace(Reg,function(world){
                return "<strong class='high_light'>"+world+"</strong>"
            });
            $(this).children(":last").html(_new_html);
        });
    };
    //高亮显示第一个找到的key_word
    $scope.firstHighLight=function(key_word){
        if(!$scope.info.log_info.search_key_word){
            Modal.alert("请先输入关键字！",3);
            return false;
        }
        $scope.searchByKeyword($scope.info.log_info.search_key_word);
        //如果存在第一个高亮，退出
        var _key_word_list=$('.high_light');
        $(_key_word_list[0]).removeClass('high_light').addClass('cur_high_light');
        document.querySelector('.cur_high_light').scrollIntoView(true);
    };
    //高亮显示前一行
    $scope.preHighLight=function(key_word){
        if(!$scope.info.log_info.search_key_word){
            Modal.alert("请先输入关键字！",3);
            return false;
        }
        //如果存在第一个高亮，退出
        var _list = $('strong');
        var _flag = 0;
        for(var i=0;i<_list.length;i++){
            if(_list[i].className == 'cur_high_light'){
                _flag++;
                if(i == 0){
                    Modal.alert('已经是第一个了',3);
                }else{
                    $(_list[i]).removeClass('cur_high_light').addClass('high_light');
                    $(_list[i-1]).removeClass('high_light').addClass('cur_high_light');
                }
                break;
            }
        }
        if(_flag == 0){
            $(_list[0]).removeClass('high_light').addClass('cur_high_light');
        }
        document.querySelector('.cur_high_light').scrollIntoView(true);
    };
    //高亮显示下一行
    $scope.backHighLight=function(key_word){
        if(!$scope.info.log_info.search_key_word){
            Modal.alert("请先输入关键字！",3);
            return false;
        }
        //找到当前高亮所在的位置
        var _list = $('strong');
        var _flag = 0;
        for(var i=0;i<_list.length;i++){
            if(_list[i].className == 'cur_high_light'){
                _flag++;
                if(i == _list.length-1){
                    Modal.alert('已经是最后一个了',3);
                }else{
                    $(_list[i]).removeClass('cur_high_light').addClass('high_light');
                    $(_list[i+1]).removeClass('high_light').addClass('cur_high_light');
                }
                break;
            }
        }
        if(_flag == 0){
            $(_list[0]).removeClass('high_light').addClass('cur_high_light');
        }
        document.querySelector('.cur_high_light').scrollIntoView(true);
        //滚动
    };
    //高亮显示最后一个key_word
    $scope.lastHighLight=function(key_word){
        if(!$scope.info.log_info.search_key_word){
            Modal.alert("请先输入关键字！",3);
            return false;
        }
        $scope.searchByKeyword($scope.info.log_info.search_key_word);
        var _key_word_list=$('.high_light');
        $(_key_word_list[_key_word_list.length-1]).removeClass('high_light').addClass('cur_high_light');
        document.querySelector('.cur_high_light').scrollIntoView(true);
    };
    //只显示搜索到的关键字行
    $scope.showKeyWordLine = function (key_word) {
        if(!key_word){
            Modal.alert("请先输入关键字！",3);
            return false;
        }else{
            if(key_word.length < 2){
                Modal.alert('关键字请至少输入两个字符',3);
                return false;
            }else{
                $scope.control.show_key_line = true;
                $scope.control.show_start_search = false;
                if($scope.control.monitor_flag){
                    $scope.info.exe_log_info.key_word = $scope.info.log_info.search_key_word;
                    $scope.control.scroll_is_lock = false;
                }
            }
        };
    };
    //取消关键字搜索
    $scope.cancelKeyWordLine = function () {
        $scope.control.show_key_word_search_input = false;
        if($scope.control.monitor_flag && $scope.control.show_key_line){
            $scope.control.show_key_line = false;
            $scope.info.exe_log_info.key_word = '';
            $scope.info.log_info.search_key_word = '';
            $scope.control.scroll_is_lock = false;
        }
    };
    //锁定当前的页面（禁止滚动条往下）
    $scope.lockLogScroll = function () {
        $scope.control.scroll_is_lock = !$scope.control.scroll_is_lock;
        if($scope.control.monitor_flag){
            if($scope.control.scroll_is_lock){
                $scope.instop();
            }else{
                $timeout(function () {
                    $scope.logscrollToBottom('bottom', {
                        scrollEasing:"linear"
                    });
                },100);
            }
        }
    };
    //显示关键字搜索框
    $scope.showSearchInput = function () {
        $scope.control.show_key_word_search_input = true;
    };

    var resetPhaseStatus = function (steps_list) {
        for(var i=0;i<steps_list.length;i++){
            var _step = steps_list[i];
            for(var j=0;j<_step.phase_list.length;j++){
                _step.phase_list[j].is_check = false;
            }
        }
    };
    //选择对应阶段显示节点信息
    $scope.chooseNodeConfig = function (group_no,phase_no,phase,steps_list) {
        resetPhaseStatus(steps_list);
        phase.is_check = true;
        $scope.control.get_nodes_loading = true;
        $timeout(function () {
            if($scope.info.phase_node_info.nodes_info.node_list){
                for(var k=0; k < $scope.info.phase_node_info.nodes_info.node_list.length; k++){
                    $scope.info.phase_node_info.nodes_info.node_list[k].is_show = false;
                }
            }
            if(steps_list[group_no].phase_list[phase_no].node_list){
                $scope.info.phase_node_info.nodes_flag = false;
                ProdFunc.dealPhaseNode(steps_list[group_no].phase_list[phase_no].node_list,$scope.info.phase_node_info.nodes_info.node_list);
                cancelMonitorNodeMsg($scope.info.phase_node_info.nodes_info.node_list,false)
            }else{
                $scope.info.phase_node_info.nodes_flag = true;
                cancelMonitorNodeMsg($scope.info.phase_node_info.nodes_info.node_list,true)
            }
            $scope.info.phase_node_info.phase_no = steps_list[group_no].phase_list[phase_no].phase_no;
            $scope.info.phase_node_info.phase_status = steps_list[group_no].phase_list[phase_no].phase_status;
            $scope.info.phase_node_info.nodes_info.parallel_flag = steps_list[group_no].phase_list[phase_no].parallel_flag;
            if($scope.info.phase_node_info.nodes_info.node_list){
                $scope.info.phase_node_info.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.phase_node_info.nodes_info.node_list);
                $scope.info.phase_node_info.expand_flag = ($scope.info.phase_node_info.nav_show_flag == 2) ? true : false;
            }
            $scope.control.get_nodes_loading = false;
        },1000)
    };
    //展开收起节点执行信息
    $scope.toggleNodeExecInfo = function (node ,info) {
        node.show_detail = !node.show_detail;
        //判断导航条是否显示标志
        info.nav_show_flag = CmptFunc.judgeShowDetail(info.nodes_info.node_list);
        info.expand_flag = (info.nav_show_flag == 2) ? true : false;
        if(node.show_detail){
            getMonitorNodeMsg(node.exec_node_ip , node);
        }
    };
    //展开所有节点
    $scope.expandAllNode = function (info){
        info.nav_show_flag = CmptFunc.expandAllModules(info.nodes_info.node_list);
        for(var i=0;i<info.nodes_info.node_list.length;i++){
            var _node = info.nodes_info.node_list[i];
            if(_node.show_detail && _node.is_show){
                (function (ip , node) {
                    getMonitorNodeMsg(ip ,node);
                }(_node.exec_node_ip , _node))
            }
        }
    };
    //收起所有节点
    $scope.closeAllNode = function (info) {
        info.nav_show_flag = CmptFunc.closeAllModules(info.nodes_info.node_list);
    };
    //协议类型转化中文名
    $scope.getProtocolTypeCnName = function(protocol_type){
        return CV.findValue(protocol_type,ProtocolType).substring(0,5).toLowerCase();
    };
    //切换监控类型
    $scope.changeMontiorType = function (flag) {
        $scope.control.tab_type = (flag ==1) ? true : false
    };
    //选择监控文件
    $scope.chooseMonitorFile = function (file ,node) {
        $scope.control.show_monitor_log = !$scope.control.show_monitor_log;
        $scope.info.exe_log_info = angular.copy(file);
        $scope.info.exe_log_info.node_ip = node.node_ip;
        $scope.info.exe_log_info.business_sys_name = node.business_sys_name;
        $scope.info.exe_log_info.soc_name = node.soc_name;
        $scope.info.exe_log_info.show_monitor_log = true;
    };
    //返回监控文件列表
    $scope.returnMonitorList = function () {
        /*这里可能需要做返回的一些条件验证*/
        if($scope.control.monitor_flag){
            Modal.alert('日志正在监控中,请勿切换到列表',3);
            return false;
        }
        $scope.info.log_info.search_key_word = '';
        $scope.control.show_monitor_log = false;
    };
    //计算监控文件显示区域的高度
    $scope.caculateMonitorHeight = function () {
        var _height = $(window).innerHeight()-260;
        return{
            'height': _height + 'px'
        }
    };
    //删除单个监控文件
    $scope.deleteMonitorLog = function (event,index,node,parent_index) {
        event.stopPropagation();
        Modal.confirm("请确认是否删除该监控文件?").then(function () {
            node.checked_files.splice(index,1);
            if(node.checked_files.length ==0){
                $scope.info.log_info.monitor_log_list.splice(parent_index,1)
            }
        });
    };
    //控制台缩放效果
    $scope.toggleMinimize = function() {
        $timeout(function () {
            var _height = _codeDiv.height();
            var _console_desk_div = $('#consoleDesk');//控制台dome对象
            $scope.control.is_log_minisize = !$scope.control.is_log_minisize;
            _console_desk_div.css('height', _console_desk_div.height() == 25 ? '200' : '25');
            if($scope.control.is_log_minisize){
                _codeDiv.css('height',_height + 180);
            }else{
                _codeDiv.css('height',_height - 200 + 20);
            }
        },10)
    };
    //计算内容的高度
    $scope.caculateHeight = function () {
        var _height = 0;
        if(!$scope.control.is_log_minisize){
            _height = $(window).height()-250-110;
        }else{
            _height = $(window).height()-250-110 + 180;
        }
        return {
            height :   _height + 'px',
        }
    };
    //计算控制台的宽度
    $scope.caculateConsoleWidth = function () {
        var _width = $('#codePanel').width();
        return {
            width :   _width + 'px',
        }
    };
    init();
}]);
