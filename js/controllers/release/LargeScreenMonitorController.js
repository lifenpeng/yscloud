'use strict';
//大屏监控
var monitor = angular.module('LargeScreenMonitorController',  [
    'ui.bootstrap',
    'ngCookies',
    'ngWebSocket',
    'CvService',
    'ReleaseHttpSrv',
    'CvDirectives',
    'ChartsService',
    'ModalCtrl',
    'GlobalData']);

monitor.value('baseUrl', '/clWeb/');

/**
 * 大屏监控
 * */
monitor.controller("sysMonitorCtrl", ["$scope", "$rootScope", "$cookieStore", "$location", "$timeout", "$interval", "$window" , "CommData", "Charts","weekType","ProtocolType","LargeMonitor", "Modal", "CV", function($scope, $rootScope, $cookieStore, $location, $timeout, $interval, $window, CommData, Charts,weekType,ProtocolType, LargeMonitor, Modal, CV) {
    var _today_date = new Date();
    var _timer ,_interval;

    //页面信息
    $scope.info = {
        today_date :CV.dtFormatCn(_today_date),
        week_cn_num :CV.findValue(_today_date.getDay(),weekType),
        now_time : '',
        sys_detail_index:0,
    };
    //页面数据对象
    $scope.data = {
        un_publish_project_list : [], //未发布列表数据
        published_project_list  : [], //已发布的列表数据
        publish_project_list    : [], //发布中的列表
        all_project_list        : [] //所有项目列表(暂时只支持30个绘图)
    };
    //页面控制对象
    $scope.control = {
        sys_show_index : 0, //当前系统显示位置
        unpublish_index:0, //未发布系统的滚动位置
        published_index:0, //已发布系统的滚动位置
        get_unpublish_loading : false, //获取未发布的项目
        get_publish_loading : false,   //获取发布的项目
        get_running_loading : false,  //获取发布中的项目
    };
    //处理待发布项目开始剩余时间 倒计时
    var dealAvaiableTime = function (plan_date,plan_time,project) {
        var _setTimer=function(){
            var _now_date = new Date();
            var _max_date =new Date((plan_date).replace(/-/g,"/")+' '+plan_time);
            var _max_seconds = _max_date.getTime();
            var _now_seconds =_now_date.getTime();
            var t=_max_seconds-_now_seconds;
            var d=0,h=0,m=0,s=0;
            if(t>=0){
                d=Math.floor(t/1000/60/60/24);
                h=Math.floor(t/1000/60/60%24)<10 ? '0'+Math.floor(t/1000/60/60%24) : Math.floor(t/1000/60/60%24);
                m=Math.floor(t/1000/60%60) <10 ? '0'+Math.floor(t/1000/60%60) : Math.floor(t/1000/60%60);
                s=Math.floor(t/1000%60) <10 ? '0'+Math.floor(t/1000%60) : Math.floor(t/1000%60);
                if(d>0){
                    h=d*24+parseInt(h);
                }
                project.remainTime =h+':'+m+':'+s;
            }else{
                if(project.time_interval) $interval.cancel(project.time_interval);
                project.deplay_flag = true;
            }
            // $scope.$applyAsync();
        };
        project.time_interval = $interval(_setTimer,1000);
    };
    //执行耗时转换
    var translateTime = function (s) {
        var _d,_h,_m,_s;
        var _time = Math.floor(s/1000);
        var _time_string = '';
        _d =Math.floor(s/1000/60/60/24);
        _h = Math.floor(s/1000/60/60%24);
        _m =Math.floor(s/1000/60%60);
        _s =Math.floor(s/1000%60);
        if(_time){
            if(_time< 60){
                _time_string = _s + '秒'
            }else if(_time < 60 * 60){
                _time_string = _m + '分' + _s + '秒'
            }else if(_time < 60*60*60){
                _time_string = _h + '时'+ _m + '分' + _s + '秒';
            }else{
                _time_string = _d + '天' +_h + '时'+ _m + '分' + _s + '秒';
            }
        }
        return _time_string
    };
    //数据切换 flag 1 模拟数据 2 真实数据
    var dataChange = function (flag) {
        if(flag == 1){
            $scope.control.get_unpublish_loading = true;
            $scope.control.get_publish_loading = true;
            $scope.control.get_running_loading = true;
            $timeout(function () {
                //待发布的项目
                var _new_list = [
                    {
                        project_name:'卡系统一期',
                        business_cn_name: "卡系统",
                        syspublish_id : '1',
                        publish_date : '2018-09-26',
                        publish_time:'15:00',
                        manager_user_name:"超级管理员",
                    },
                    {
                        project_name:'卡系统二期',
                        business_cn_name: "卡系统",
                        syspublish_id : '2',
                        publish_date : '2018-09-20',
                        publish_time:'18:00',
                        manager_user_name:"超级管理员",
                    },
                    {
                        project_name:'网银系统上线',
                        business_cn_name: "网银",
                        syspublish_id : '3',
                        publish_date : '2018-09-26',
                        publish_time:'18:30',
                        manager_user_name:"超级管理员",
                    },
                    {
                        project_name:'卡系统三期',
                        business_cn_name: "卡系统",
                        syspublish_id : '1',
                        publish_date : '2018-09-26',
                        publish_time:'15:00',
                        manager_user_name:"超级管理员",
                    },
                    {
                        project_name:'卡系统五期',
                        business_cn_name: "卡系统",
                        syspublish_id : '2',
                        publish_date : '2018-09-20',
                        publish_time:'18:00',
                        manager_user_name:"超级管理员",
                    },
                    {
                        project_name:'核心系统上线',
                        business_cn_name: "核心系统",
                        syspublish_id : '3',
                        publish_date : '2018-09-18',
                        publish_time:'18:30',
                        manager_user_name:"超级管理员",
                    },
                ];
                for(var i=0 ;i< _new_list.length;i++){
                    var _project =  _new_list[i];
                    if(!_project.project_name){
                        _project.project_name = '敏捷项目'
                    }
                    dealAvaiableTime(_project.publish_date,_project.publish_time,_project)
                }
                //已发布的项目
                var _pub_list = [
                    {
                        project_name:'核心上线一期',
                        start_datetime:'2018-09-17 15:00:00',
                        end_datetime:'2018-09-17 17:00:11',
                        time_used : 2*60*60*1000,
                        sys_publish_status:4,
                        syspublish_success_flag:1
                    },
                    {
                        project_name:'核心上线二期',
                        start_datetime:'2018-09-17 17:00:22',
                        end_datetime:'2018-09-17 18:00:11',
                        time_used : 1*60*60*1000,
                        sys_publish_status:4,
                        syspublish_success_flag:2
                    },
                    {
                        project_name:'集中业务一期',
                        start_datetime:'2018-09-17 15:30:22',
                        end_datetime:'2018-09-17 17:00:22',
                        time_used : (1.5)*60*60*1000,
                        sys_publish_status:6,
                        syspublish_success_flag:1
                    },
                    {
                        project_name:'集中业务一期',
                        start_datetime:'2018-09-17 15:00:22',
                        end_datetime:'2018-09-17 17:00:22',
                        time_used : 2*60*60*1000,
                        sys_publish_status:7,
                        syspublish_success_flag:1
                    },
                    {
                        project_name:'核心上线三期',
                        start_datetime:'2018-09-17 15:00:00',
                        end_datetime:'2018-09-17 17:00:11',
                        time_used : 2*60*60*1000,
                        sys_publish_status:4,
                        syspublish_success_flag:1
                    },
                    {
                        project_name:'核心上线五期',
                        start_datetime:'2018-09-17 17:00:22',
                        end_datetime:'2018-09-17 18:00:11',
                        time_used : 1*60*60*1000,
                        sys_publish_status:4,
                        syspublish_success_flag:2
                    },
                ];
                for(var j=0 ;j< _pub_list.length;j++){
                    var _pub =  _pub_list[j];
                    if(!_pub.project_name){
                        _pub.project_name = '敏捷项目'
                    }
                    _pub.time_used = translateTime(_pub.time_used);
                }
                //旋转总的项目
                var _all_list = [
                    {
                        "time_used":0,
                        "business_sys_name":"ronghui1",
                        "business_cn_name":"核心系统",
                        "project_name":"核心系统项目1",
                        "syspublish_id":"SP201809190000267",
                        "sys_publish_status":1,
                        "publish_date":"2018-09-20",
                        "publish_time":"18:00:00",
                        "project_id":"PJ201809070000060",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    },
                    {
                        "time_used":0,
                        "business_sys_name":"ronghui",
                        "business_cn_name":"合并发布测试系统",
                        "project_name":"核心系统项目2",
                        "syspublish_id":"SP201809190000266",
                        "sys_publish_status":1,
                        "publish_date":"2018-09-20",
                        "publish_time":"18:00:00",
                        "project_id":"PJ201809070000060",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    },
                    {
                        "time_used":0,
                        "business_sys_name":"YL_TEST",
                        "business_cn_name":"压力测试",
                        "project_name":"核心系统项目3",
                        "syspublish_id":"SP201809190000268",
                        "sys_publish_status":2,
                        "last_pub_execute_id":"PE201809190000135",
                        "publish_date":"2018-09-19",
                        "publish_time":"11:00:00",
                        "last_execute_id":"PE201809190000135",
                        "project_id":"PJ201809190000064",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    },
                    {
                        "time_used":0,
                        "business_sys_name":"YL_TEST",
                        "business_cn_name":"压力测试",
                        "project_name":"网银系统1",
                        "syspublish_id":"SP201809140000262",
                        "sys_publish_status":3,
                        "last_pub_execute_id":"PE201809190000134",
                        "publish_date":"2018-09-14",
                        "publish_time":"15:00:00",
                        "last_execute_id":"PE201809190000134",
                        "project_id":"PJ201809140000061",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    },
                    {
                        "time_used":0,
                        "business_sys_name":"test-08-15",
                        "business_cn_name":"测试系统09-08",
                        "project_name":"网银系统2",
                        "syspublish_id":"SP201809080000253",
                        "sys_publish_status":4,
                        "last_pub_execute_id":"PE201809080000128",
                        "syspublish_success_flag":1,
                        "publish_date":"2018-09-08",
                        "publish_time":"14:00:00",
                        "last_execute_id":"PE201809080000128",
                        "project_id":"PJ201809030000059",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    },
                    {
                        "time_used":0,
                        "business_sys_name":"yaw_sys",
                        "business_cn_name":"测试系统",
                        "project_name":"网银系统3",
                        "syspublish_id":"SP201809080000252",
                        "sys_publish_status":1,
                        "publish_date":"2018-09-08",
                        "publish_time":"14:00:00",
                        "project_id":"PJ201809030000059",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    },
                    {
                        "time_used":0,
                        "business_sys_name":"test-08-15",
                        "business_cn_name":"测试系统09-08",
                        "syspublish_id":"SP201809080000254",
                        "sys_publish_status":3,
                        "last_pub_execute_id":"PE201809080000129",
                        "publish_date":"2018-09-08",
                        "publish_time":"12:21:42",
                        "last_execute_id":"PE201809080000129",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    },
                    {
                        "time_used":0,
                        "business_sys_name":"CHN_Latest",
                        "business_cn_name":"CHN最新测试",
                        "project_name":"cl项目发布",
                        "syspublish_id":"SP201809030000202",
                        "sys_publish_status":4,
                        "last_pub_execute_id":"PE201809030000114",
                        "syspublish_success_flag":1,
                        "publish_date":"2018-09-03",
                        "publish_time":"16:10:00",
                        "last_execute_id":"PE201809030000114",
                        "project_id":"PJ201809030000055",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    },
                    {
                        "time_used":0,
                        "business_sys_name":"CHN_Latest",
                        "business_cn_name":"CHN最新测试",
                        "project_name":"cl项目发布2",
                        "syspublish_id":"SP201809030000204",
                        "sys_publish_status":3,
                        "last_pub_execute_id":"PE201809060000125",
                        "publish_date":"2018-09-03",
                        "publish_time":"16:00:00",
                        "last_execute_id":"PE201809060000125",
                        "project_id":"PJ201809030000057",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    },
                    {
                        "time_used":0,
                        "business_sys_name":"YL_SYS",
                        "business_cn_name":"我的系统",
                        "project_name":"网银优化项目",
                        "syspublish_id":"SP201808300000201",
                        "sys_publish_status":1,
                        "last_pub_execute_id":"PE201809060000123",
                        "publish_date":"2018-08-30",
                        "publish_time":"18:00:00",
                        "last_execute_id":"PE201809060000123",
                        "project_id":"PJ201808220000051",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    },
                    {
                        "time_used":0,
                        "business_sys_name":"YL_SYS",
                        "business_cn_name":"我的系统",
                        "project_name":"呵呵呵",
                        "syspublish_id":"SP201808280000198",
                        "sys_publish_status":6,
                        "last_roll_execute_id":"PE201808290000111",
                        "last_pub_execute_id":"PE201808280000110",
                        "syspublish_success_flag":1,
                        "publish_date":"2018-08-28",
                        "publish_time":"10:00:00",
                        "last_execute_id":"PE201808290000111",
                        "project_id":"PJ201808280000053",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    },
                    {
                        "time_used":0,
                        "business_sys_name":"guxm_sys",
                        "business_cn_name":"guxm_sys",
                        "project_name":"proj4",
                        "syspublish_id":"SP201808210000190",
                        "sys_publish_status":1,
                        "publish_date":"2018-08-23",
                        "publish_time":"18:00:00",
                        "project_id":"PJ201808200000050",
                        "manager_user_name":"超级管理员",
                        "manager_user_id":"admin",
                        "dynamic":0
                    }
                ];
                for (var k = 0; k < _all_list.length; k++) {
                    var _all_proj = _all_list[k];
                    _all_proj.project_name = _all_proj.project_name || '敏捷发布';
                    _all_proj.project_status = _all_proj.sys_publish_status || 0;
                    if(_all_proj.syspublish_success_flag === 2){
                        _all_proj.project_status = 10; //异常
                    }
                }
                //发布中的模拟数据
                var _publishing_list = [
                    {
                        project_name:'一分厂',
                        project_name1:'18',
                        project_name2:'186',
                        dynamic : '50',
                        status:1,
                        execute_faile:true,
                        publish_time:'12:00:00',
                        start_datetime:'2018-09-20 12:00:00.123',
                        manager_user_name:'超级管理员',
                        start_time : '18:00:00',
                        use_time:'00:12:10',
                        current_phase:{
                            phase_type: 1,
                            phase_name : '这是执行中的阶段',
                            impl_type: 2,
                            parallel_flag:1,
                            phase_status : phaseStatus(),
                            phase_id : 5,
                            b:'网部',
                            node_soc_list:[
                                {
                                    node_ip:	'10.1.1.220',
                                    soc_name	 : '220ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:5,
                                },
                                {
                                    node_ip:	'10.1.1.227',
                                    soc_name	 : '227ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:6,
                                },
                                {
                                    node_ip:	'10.1.1.228',
                                    soc_name	 : '228ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:8,
                                },
                                {
                                    node_ip:	'10.1.1.230',
                                    soc_name	 : '230ssh',
                                    protocol_type	 : 15,
                                    // exe_msg:"执行成功",
                                    node_status:2,
                                }
                            ],
                        },
                        phase_list : [
                            {
                                phase_type: 1,
                                phase_name : '这是跳过的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(78.46),
                                phase_no : 1,
                                dynamic : '78.46',
                                b:"原料投料",
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行跳过",
                                        node_status:6,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 9,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是第二个阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(56.87),
                                phase_no : 2,
                                dynamic : '56.87',
                                b:"打    浆",                           
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是手动修改成功的阶段',
                                impl_type: 1,
                                dynamic : '86.23',
                                b:'贮浆',
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(86.23),
                                phase_no : 3,
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是错误的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(89.12),
                                phase_no : 4,
                                dynamic : '89.12',
                                b:'混浆',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行出错",
                                        node_status:4,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是执行中的阶段',
                                impl_type: 11,
                                parallel_flag:true,
                                interactor_flag:false,
                                phase_status : phaseStatus(49,75),
                                phase_no : 5,
                                dynamic: '49.75',
                                b:'网部',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:6,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.230',
                                        soc_name	 : '230ssh',
                                        protocol_type	 : 15,
                                        // exe_msg:"执行成功",
                                        node_status:2,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(68.12),
                                phase_no : 6,
                                dynamic : '68.12',
                                b:'压榨',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(30.53),
                                phase_no : 7,
                                dynamic : '30.53',
                                b:'干燥',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(39.64),
                                phase_no : 6,
                                dynamic : '39.64',
                                b:'施剂',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(58.76),
                                phase_no : 7,
                                dynamic : '58.76',
                                b:'卷取',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(74.35),
                                phase_no : 6,
                                dynamic : '74.35',
                                b:'复卷',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(45.63),
                                phase_no : 7,
                                dynamic : '45.63',
                                b:'分切',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(72.45),
                                phase_no : 6,
                                dynamic : '72.45',
                                b:'包装',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(50.09),
                                phase_no : 7,
                                dynamic : '50.09',
                                b:'质检1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(48.79),
                                phase_no : 6,
                                dynamic : '48.79',
                                b:'质检2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(),
                                phase_no : 6,
                                dynamic : '',
                                b:'质检3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(60.86),
                                phase_no : 6,
                                dynamic : '60.86',
                                b:'设备1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(58.12),
                                phase_no : 6,
                                dynamic : '58.12',
                                b:'设备2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(),
                                phase_no : 6,
                                dynamic : '',
                                b:'设备3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(87.64),
                                phase_no : 6,
                                dynamic : '87.64',
                                b:'中控',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(76.86),
                                phase_no : 6,
                                dynamic : '76.86',
                                b:'管理',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        project_name:'二分厂',
                        project_name1:'19',
                        project_name2:'192',
                        dynamic : '87',
                        status:1,
                        publish_time:'12:00:00',
                        start_datetime:'2018-09-20 12:00:00.123',
                        execute_faile:false,
                        manager_user_name:'张三',
                        start_time : '18:00:00',
                        use_time:'00:12:10',
                        current_phase:{
                            phase_type: 1,
                            phase_name : '这是执行中的阶段',
                            impl_type: 1,
                            parallel_flag:1,
                            phase_status : 2,
                            phase_id : 4,
                            b:'网部',
                            node_soc_list:[
                                {
                                    node_ip:	'10.1.1.220',
                                    soc_name	 : '220ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:2,
                                },
                                {
                                    node_ip:	'10.1.1.227',
                                    soc_name	 : '227ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:1,
                                },
                                {
                                    node_ip:	'10.1.1.228',
                                    soc_name	 : '228ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:1,
                                }
                            ],
                        },
                        phase_list : [
                            {
                                phase_type: 1,
                                phase_name : '这是跳过的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(76.34),
                                phase_no : 1,
                                dynamic : '76.34',
                                b:"原料投料",                                
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行跳过",
                                        node_status:6,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是第二个阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(80.45),
                                phase_no : 2,
                                dynamic : '80.45',
                                b:"打浆",
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是手动修改成功的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(86.54),
                                phase_no : 3,
                                dynamic : '86.54',
                                b:'贮浆',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是执行中的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(74.54),
                                phase_no : 4,
                                dynamic : '74.54',
                                b:'网部',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:2,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(70.47),
                                phase_no : 5,
                                dynamic : '70.47',
                                b:'压榨',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(40.65),
                                phase_no : 6,
                                dynamic : '40.65',
                                b:'干燥',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(36.78),
                                phase_no : 6,
                                dynamic : '36.78',
                                b:'施剂',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(60.89),
                                phase_no : 7,
                                dynamic : '60.89',
                                b:'卷取',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(76.53),
                                phase_no : 6,
                                dynamic : '76.53',
                                b:'复卷',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(49.77),
                                phase_no : 7,
                                dynamic : '49.77',
                                b:'分切',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(75.31),
                                phase_no : 6,
                                dynamic : '75.31',
                                b:'包装',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(49.98),
                                phase_no : 7,
                                dynamic : '49.98',
                                b:'质检1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(49.65),
                                phase_no : 6,
                                dynamic : '49.65',
                                b:'质检2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(54.87),
                                phase_no : 6,
                                dynamic : '54.87',
                                b:'质检3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(62.65),
                                phase_no : 6,
                                dynamic : '62.65',
                                b:'设备1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(60.67),
                                phase_no : 6,
                                dynamic : '60.67',
                                b:'设备2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(),
                                phase_no : 6,
                                dynamic : '',
                                b:'设备3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(89.98),
                                phase_no : 6,
                                dynamic : '89,98',
                                b:'中控',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(78.12),
                                phase_no : 6,
                                dynamic : '78.12',
                                b:'管理',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },

                        ],
                    },
                    {
                        project_name:'三分厂',
                        project_name1:'19',
                        project_name2:'189',
                        dynamic : '87',
                        status:1,
                        publish_time:'12:00:00',
                        start_datetime:'2018-09-20 12:00:00.123',
                        execute_faile:false,
                        manager_user_name:'李四',
                        start_time : '18:00:00',
                        use_time:'00:12:10',
                        current_phase:{
                            phase_type: 1,
                            phase_name : '这是执行中的阶段',
                            impl_type: 1,
                            parallel_flag:1,
                            phase_status : 2,
                            phase_id : 4,
                            b:'网部',
                            node_soc_list:[
                                {
                                    node_ip:	'10.1.1.220',
                                    soc_name	 : '220ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:2,
                                },
                                {
                                    node_ip:	'10.1.1.227',
                                    soc_name	 : '227ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:1,
                                },
                                {
                                    node_ip:	'10.1.1.228',
                                    soc_name	 : '228ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:1,
                                }
                            ],
                        },
                        phase_list : [
                            {
                                phase_type: 1,
                                phase_name : '这是跳过的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(79.42),
                                phase_no : 1,
                                dynamic : '79.42',
                                b:"原料投料",                               
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行跳过",
                                        node_status:6,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是第二个阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(56.87),
                                phase_no : 2,
                                dynamic : '56.87',
                                b:"打浆",
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是手动修改成功的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(86.23),
                                phase_no : 3,
                                dynamic : '86.23',
                                b:'贮浆',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是执行中的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(89.12),
                                phase_no : 4,
                                dynamic : '89.12',
                                b:'混浆',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:2,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是执行中的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(49.75),
                                phase_no : 4,
                                dynamic : '49.75',
                                b:'网部',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:2,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(68.12),
                                phase_no : 5,
                                dynamic:'68.12',
                                b:'压榨',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(30.53),
                                phase_no : 6,
                                dynamic:'30,53',
                                b:'干燥',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(39.64),
                                phase_no : 6,
                                dynamic : '39.64',
                                b:'施剂',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(58.76),
                                phase_no : 7,
                                dynamic : '58.76',
                                b:'卷取',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(74.35),
                                phase_no : 6,
                                dynamic : '74.35',
                                b:'复卷',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(45.63),
                                phase_no : 7,
                                dynamic : '45.63',
                                b:'分切',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(72.45),
                                phase_no : 6,
                                dynamic : '72.45',
                                b:'包装',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(50.09),
                                phase_no : 7,
                                dynamic : '50.09',
                                b:'质检1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(48.79),
                                phase_no : 6,
                                dynamic : '48.79',
                                b:'质检2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(36.78),
                                phase_no : 6,
                                dynamic : '36.78',
                                b:'质检3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(60.86),
                                phase_no : 6,
                                dynamic : '60.86',
                                b:'设备1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(58.12),
                                phase_no : 6,
                                dynamic : '58.12',
                                b:'设备2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(),
                                phase_no : 6,
                                dynamic : '',
                                b:'设备3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(87.64),
                                phase_no : 6,
                                dynamic : '87.64',
                                b:'中控',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(76.86),
                                phase_no : 6,
                                dynamic : '76.86',
                                b:'管理',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        project_name:'四分厂',
                        project_name1:'18',
                        project_name2:'201',
                        dynamic : '87',
                        status:1,
                        publish_time:'12:00:00',
                        start_datetime:'2018-09-20 12:00:00.123',
                        execute_faile:false,
                        manager_user_name:'李四',
                        start_time : '18:00:00',
                        use_time:'00:12:10',
                        current_phase:{
                            phase_type: 1,
                            phase_name : '这是执行中的阶段',
                            impl_type: 1,
                            parallel_flag:1,
                            phase_status : phaseStatus(),
                            phase_id : 4,
                            b:'网部',
                            node_soc_list:[
                                {
                                    node_ip:	'10.1.1.220',
                                    soc_name	 : '220ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:2,
                                },
                                {
                                    node_ip:	'10.1.1.227',
                                    soc_name	 : '227ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:1,
                                },
                                {
                                    node_ip:	'10.1.1.228',
                                    soc_name	 : '228ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:1,
                                }
                            ],
                        },
                        phase_list : [
                            {
                                phase_type: 1,
                                phase_name : '这是跳过的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(75.31),
                                phase_no : 1,
                                dynamic : '75.31',
                                b:"原料投料",
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行跳过",
                                        node_status:6,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是第二个阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(58.12),
                                phase_no : 2,
                                dynamic:'58.12',
                                b:"打浆",
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是手动修改成功的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(80.45),
                                phase_no : 3,
                                dynamic:'80.45',
                                b:'贮浆',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是手动修改成功的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(86.54),
                                phase_no : 3,
                                dynamic:'86.54',
                                b:'混浆',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是执行中的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(53.54),
                                phase_no : 4,
                                dynamic:'53.54',
                                b:'网部',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:2,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(70.47),
                                phase_no : 5,
                                dynamic:'70.47',
                                b:'压榨',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(40.65),
                                phase_no : 6,
                                dynamic:'40.65',
                                b:'干燥',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(36.78),
                                phase_no : 6,
                                dynamic : '36.78',
                                b:'施剂',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(60.89),
                                phase_no : 7,
                                dynamic : '60.89',
                                b:'卷取',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(76.53),
                                phase_no : 6,
                                dynamic : '76.53',
                                b:'复卷',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(),
                                phase_no : 7,
                                dynamic : '',
                                b:'分切',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(75.31),
                                phase_no : 6,
                                dynamic : '75.31',
                                b:'包装',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(49.98),
                                phase_no : 7,
                                dynamic : '49.98',
                                b:'质检1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(49.65),
                                phase_no : 6,
                                dynamic : '49.65',
                                b:'质检2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(54.87),
                                phase_no : 6,
                                dynamic : '54.87',
                                b:'质检3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(59.79),
                                phase_no : 6,
                                dynamic : '59.79',
                                b:'设备1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(60.67),
                                phase_no : 6,
                                dynamic : '60.67',
                                b:'设备2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(),
                                phase_no : 6,
                                dynamic : '',
                                b:'设备3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(89.98),
                                phase_no : 6,
                                dynamic : '89,98',
                                b:'中控',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(78.12),
                                phase_no : 6,
                                dynamic : '78.12',
                                b:'管理',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        project_name:'五分厂',
                        project_name1:'19',
                        project_name2:'195',
                        dynamic : '87',
                        status:1,
                        publish_time:'12:00:00',
                        start_datetime:'2018-09-20 12:00:00.123',
                        execute_faile:false,
                        manager_user_name:'李四',
                        start_time : '18:00:00',
                        use_time:'00:12:10',
                        current_phase:{
                            phase_type: 1,
                            phase_name : '这是执行中的阶段',
                            impl_type: 1,
                            parallel_flag:1,
                            phase_status : phaseStatus(),
                            phase_id : 4,
                            b:'网部',
                            node_soc_list:[
                                {
                                    node_ip:	'10.1.1.220',
                                    soc_name	 : '220ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:2,
                                },
                                {
                                    node_ip:	'10.1.1.227',
                                    soc_name	 : '227ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:1,
                                },
                                {
                                    node_ip:	'10.1.1.228',
                                    soc_name	 : '228ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:1,
                                }
                            ],
                        },
                        phase_list : [
                            {
                                phase_type: 1,
                                phase_name : '这是跳过的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(78.16),
                                phase_no : 1,
                                b:"原料投料",
                                dynamic : '78.16',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行跳过",
                                        node_status:6,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是第二个阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(56.87),
                                phase_no : 2,
                                b:"打浆",
                                dynamic : '56.87',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是手动修改成功的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(86.23),
                                phase_no : 3,
                                b:'贮浆',
                                dynamic : '86.23',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是手动修改成功的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(89.12),
                                phase_no : 3,
                                b:'混浆',
                                dynamic : '89.12',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是执行中的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(49.75),
                                phase_no : 4,
                                b:'网部',
                                dynamic : '49.75',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:2,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(68.12),
                                phase_no : 5,
                                b:'压榨',
                                dynamic : '68.12',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(30.53),
                                phase_no : 6,
                                b:'干燥',
                                dynamic : '30.53',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(39.64),
                                phase_no : 6,
                                dynamic : '39.64',
                                b:'施剂',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(58.76),
                                phase_no : 7,
                                dynamic : '58.76',
                                b:'卷取',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(74.35),
                                phase_no : 6,
                                dynamic : '74.35',
                                b:'复卷',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(45.63),
                                phase_no : 7,
                                dynamic : '45.63',
                                b:'分切',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(72.45),
                                phase_no : 6,
                                dynamic : '72.45',
                                b:'包装',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(50.09),
                                phase_no : 7,
                                dynamic : '50.09',
                                b:'质检1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(48.79),
                                phase_no : 6,
                                dynamic : '48.79',
                                b:'质检2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(),
                                phase_no : 6,
                                dynamic : '',
                                b:'质检3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(60.86),
                                phase_no : 6,
                                dynamic : '60.86',
                                b:'设备1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(58.12),
                                phase_no : 6,
                                dynamic : '58.12',
                                b:'设备2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(49.77),
                                phase_no : 6,
                                dynamic : '49.77',
                                b:'设备3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(87.64),
                                phase_no : 6,
                                dynamic : '87.64',
                                b:'中控',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(76.86),
                                phase_no : 6,
                                dynamic : '76.86',
                                b:'管理',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        project_name:'六分厂',
                        project_name1:'20',
                        project_name2:'212',
                        dynamic : '87',
                        status:1,
                        publish_time:'12:00:00',
                        start_datetime:'2018-09-20 12:00:00.123',
                        execute_faile:false,
                        manager_user_name:'李四',
                        start_time : '18:00:00',
                        use_time:'00:12:10',
                        current_phase:{
                            phase_type: 1,
                            phase_name : '这是执行中的阶段',
                            impl_type: 1,
                            parallel_flag:1,
                            phase_status : phaseStatus(),
                            phase_id : 4,
                            b:'网部',
                            node_soc_list:[
                                {
                                    node_ip:	'10.1.1.220',
                                    soc_name	 : '220ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:2,
                                },
                                {
                                    node_ip:	'10.1.1.227',
                                    soc_name	 : '227ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:1,
                                },
                                {
                                    node_ip:	'10.1.1.228',
                                    soc_name	 : '228ssh',
                                    protocol_type	 : 5,
                                    // exe_msg:"执行成功",
                                    node_status:1,
                                }
                            ],
                        },
                        phase_list : [
                            {
                                phase_type: 1,
                                phase_name : '这是跳过的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(76.30),
                                phase_no : 1,
                                b:"原料投料",
                                dynamic : '76.30',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行跳过",
                                        node_status:6,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:4,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是第二个阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(58.12),
                                phase_no : 2,
                                dynamic : '58.12',
                                b:"打浆",
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        node_status:5,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:5,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是手动修改成功的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(80.45),
                                phase_no : 3,
                                dynamic : '80.45',
                                b:'贮浆',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是手动修改成功的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(86.54),
                                phase_no : 3,
                                dynamic : '86.54',
                                b:'混浆',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        exe_msg:"执行成功",
                                        node_status:8,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是执行中的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(64.54),
                                phase_no : 4,
                                dynamic:'64.54',
                                b:'网部',
                                node_soc_list:[
                                    {
                                        node_ip:	'10.1.1.220',
                                        soc_name	 : '220ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:2,
                                    },
                                    {
                                        node_ip:	'10.1.1.227',
                                        soc_name	 : '227ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        node_ip:	'10.1.1.228',
                                        soc_name	 : '228ssh',
                                        protocol_type	 : 5,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(70.47),
                                phase_no : 5,
                                b:'压榨',
                                dynamic:'70.47',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(40.65),
                                phase_no : 6,
                                b:'干燥',
                                dynamic:'40.65',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(36.78),
                                phase_no : 6,
                                dynamic : '36.78',
                                b:'施剂',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(60.89),
                                phase_no : 7,
                                dynamic : '60.89',
                                b:'卷取',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(76.53),
                                phase_no : 6,
                                dynamic : '76.53',
                                b:'复卷',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(49.77),
                                phase_no : 7,
                                dynamic : '49.77',
                                b:'分切',
                                node_soc_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(75.31),
                                phase_no : 6,
                                dynamic : '75.31',
                                b:'包装',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(49.98),
                                phase_no : 7,
                                dynamic : '49.98',
                                b:'质检1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status :phaseStatus(49.65) ,
                                phase_no : 6,
                                dynamic : '49.65',
                                b:'质检2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(54.87),
                                phase_no : 6,
                                dynamic : '54.87',
                                b:'质检3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(62.65),
                                phase_no : 6,
                                dynamic : '62.65',
                                b:'设备1',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(60.67),
                                phase_no : 6,
                                dynamic : '60.67',
                                b:'设备2',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(),
                                phase_no : 6,
                                dynamic : '',
                                b:'设备3',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(89.98),
                                phase_no : 6,
                                dynamic : '89,98',
                                b:'中控',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                            {
                                phase_type: 1,
                                phase_name : '这是未执行的阶段',
                                impl_type: 1,
                                parallel_flag:false,
                                interactor_flag:false,
                                phase_status : phaseStatus(78.12),
                                phase_no : 6,
                                dynamic : '78.12',
                                b:'管理',
                                node_list:[
                                    {
                                        exec_node_ip:	'10.1.1.220',
                                        exec_soc_name	 : '220ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'220ftp',
                                        support_node_ip:'10.1.1.220',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.227',
                                        exec_soc_name	 : '227ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'227ftp',
                                        support_node_ip:'10.1.1.227',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    },
                                    {
                                        exec_node_ip:	'10.1.1.228',
                                        exec_soc_name	 : '228ssh',
                                        exec_protocol_type	 : 5,
                                        support_soc_name:'228ftp',
                                        support_node_ip:'10.1.1.228',
                                        support_protocol_type:2,
                                        // exe_msg:"执行成功",
                                        node_status:1,
                                    }
                                ],
                            },
                        ],
                    },
                ];
                $timeout(function () {
                    //模拟数据 待发布的
                    $scope.data.un_publish_project_list = _new_list;
                    $scope.data.published_project_list = _pub_list;
                    $scope.data.all_project_list = _all_list;
                    $scope.data.publish_project_list = _publishing_list;
                    $scope.control.get_unpublish_loading = false;
                    $scope.control.get_publish_loading = false;
                    $scope.control.get_running_loading = false;
                    gauge()
                    pie()
                    bar()
                    rightBar()
                    levelBar()
                    rightLine('rightLine')
                    rightLine('rightLine1')
                    footerLine()
                    polar()
                    scatter()
                    _footerLine()
                    console.log($scope.data.publish_project_list)
                },1000);
            },0);
        }else{
            $scope.control.get_unpublish_loading = true;
            $scope.control.get_publish_loading = true;
            $scope.control.get_running_loading = true;
            //待发布的项目数据
            LargeMonitor.getUnpublishSys().then(function (data) {
                if(data){
                   $timeout(function () {
                       var _new_list = [];
                       _new_list = data.sysPublishList ? data.sysPublishList : [];
                       for(var i=0 ;i<_new_list.length;i++){
                           var _project = _new_list[i];
                           if(!_project.project_name){
                               _project.project_name = '敏捷项目'
                           }
                           dealAvaiableTime(_project.publish_date,_project.publish_time,_project)
                       }
                       $timeout(function () {
                           $scope.data.un_publish_project_list = _new_list;
                           $scope.control.get_unpublish_loading = false;
                       },1000);
                   },0)
                }
            },function (error) {
                $scope.control.get_unpublish_loading = false;
                // Modal.alert(error.message,3)
            });
            //已发布的项目数据
            LargeMonitor.getPublishedSys().then(function (data) {
                if(data){
                    $timeout(function () {
                        var _pub_list = [];
                        _pub_list = data.sysPublishList ? data.sysPublishList : [];
                        for(var i=0 ;i<_pub_list.length;i++){
                            var _pub = _pub_list[i];
                            if(!_pub.project_name){
                                _pub.project_name = '敏捷项目'
                            }
                            _pub.time_used = translateTime(_pub.time_used);
                        }
                        $scope.data.published_project_list = _pub_list;
                        $scope.control.get_publish_loading = false;
                    },0)
                }
            },function (error) {
                $scope.control.get_publish_loading = false;
                // Modal.alert(error.message,3)
            });
            //获取所有系统-旋转木马数据(前30个)
            LargeMonitor.getAllSys().then(function (data) {
                $timeout(function () {
                    var _all_list = [];
                    _all_list = data.sysPublishList ? data.sysPublishList.slice(0,30): [];
                    for (var i = 0; i < _all_list.length; i++) {
                        var _project = _all_list[i];
                        _project.project_name = _project.project_name || '敏捷发布';
                        _project.project_status = _project.sys_publish_status || 0;
                        if(_project.syspublish_success_flag === 2){
                            _project.project_status = 10; //异常
                        }
                    }
                    $scope.data.all_project_list = _all_list;
                },0);
            },function (error) {

            });
            //获取执行中的数据
            LargeMonitor.getRunningPublishSys().then(function (data) {
                if(data){
                    $timeout(function () {
                        console.log(data);
                        var _running_list = [];
                        _running_list = data.sysPublishList ? data.sysPublishList : [];
                        for(var i=0; i<_running_list.length ; i++){
                            var _run = _running_list[i];
                            if(!_run.project_name){
                                _run.project_name = '敏捷项目';
                            }
                        }
                        $scope.data.publish_project_list = _running_list;
                        $scope.control.get_running_loading = false;
                    },1000)
                }
            },function (error) {

            })
        }
    };
    var monitorDate = function () {
        //待发布的项目数据
        LargeMonitor.getUnpublishSys().then(function (data) {
            if(data){
               $timeout(function () {
                   var _new_list = data.sysPublishList ? data.sysPublishList : [];
                   for(var i=0 ;i<_new_list.length;i++){
                       var _project = _new_list[i];
                       if(!_project.project_name){
                           _project.project_name = '敏捷项目'
                       }
                       dealAvaiableTime(_project.publish_date,_project.publish_time,_project)
                   }
                   if($scope.control.unpublish_index  >  _new_list.length){
                       $scope.control.unpublish_index = 0;
                   }
                   $timeout(function () {
                       $scope.data.un_publish_project_list = _new_list;
                   },1000);
               },0)
            }
        },function (error) {

        });
        //已发布的项目数据
        LargeMonitor.getPublishedSys().then(function (data) {
            if(data){
                $timeout(function () {
                    var _pub_list = data.sysPublishList ? data.sysPublishList : [];
                    for(var i=0 ;i<_pub_list.length;i++){
                        var _pub = _pub_list[i];
                        if(!_pub.project_name){
                            _pub.project_name = '敏捷项目'
                        }
                        _pub.time_used = translateTime(_pub.time_used);
                    }
                    if($scope.control.published_index  >  _pub_list.length){
                       $scope.control.published_index = 0;
                   }
                    $scope.data.published_project_list = _pub_list;
                },0)
            }
        },function (error) {

        });
        //获取所有系统-旋转木马数据(前30个)
        LargeMonitor.getAllSys().then(function (data) {
            $timeout(function () {
                var _all_list = data.sysPublishList ? data.sysPublishList.slice(0,30): [];
                for (var i = 0; i < _all_list.length; i++) {
                    var _project = _all_list[i];
                    _project.project_name = _project.project_name || '敏捷发布';
                    _project.project_status = _project.sys_publish_status || 0;
                    if(_project.syspublish_success_flag === 2){
                        _project.project_status = 10; //异常
                    }
                }
                $scope.data.all_project_list = _all_list;
            },0);
        },function (error) {

        });
        // $scope.control.get_running_loading = true;
        //获取执行中的数据
        LargeMonitor.getRunningPublishSys().then(function (data) {
            if(data){
                $timeout(function () {
                    var _running_list = data.sysPublishList ? data.sysPublishList : [];
                    for(var i=0; i<_running_list.length ; i++){
                        var _run = _running_list[i];
                        if(!_run.project_name){
                            _run.project_name = '敏捷项目';
                        }
                    }
                    if($scope.control.sys_show_index  >= _running_list.length){
                        $scope.control.sys_show_index = 0;
                    }
                    $scope.data.publish_project_list = _running_list;
                },0)
            }
        },function (error) {
            $scope.control.get_running_loading = false;
        })
    };

    var init = function () {
        /*时间显示*/
        _timer = function(){
            var _now = new Date();
            var _hours = _now.getHours() < 10 ? '0' +_now.getHours() : _now.getHours();
            var _minutes = _now.getMinutes() < 10 ? '0' +_now.getMinutes() : _now.getMinutes();
            var _seconds = _now.getSeconds() < 10 ? '0' +_now.getSeconds() : _now.getSeconds();
            var _cn_hour = (_hours > 12) ? '下午' : '上午';
            $scope.info.now_time = _cn_hour + ' ' + _hours + '时' + _minutes + '分' + _seconds + '秒';
            $scope.$applyAsync();
        };
        _interval = $interval(_timer,1000);
        dataChange(1);
    };
    var gauge = function(){
        var myeCharts = echarts.init(document.getElementById('gauge'))
        var axislineColor = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            {
                offset: 0,
                color: '#4A90E2'
            },
        
            {
                offset: 0.62,
                color: '#64A8EA'
            },
        
            {
                offset: 1,
                color: '#76B9EF'
            }
        ]);
        
         var option = {
            series: [
                {
                    name: '车辆总数',
                    type: 'gauge',
                    z: 3,
                    min: 0,
                    max: 100,
                    splitNumber: 10,
                    radius: '80%',
                    axisLine: {            // 坐标轴线
                        lineStyle: {       // 属性lineStyle控制线条样式
                            width: 5,
                            color: [
                                [1,axislineColor]
                            ],
                        }
                    },
                    axisTick: {
                        show:false
                    },
                    axisLabel:{
                        show:true,
                        distance: -10,
                        textStyle: {
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 500
                        }
                    },
                    splitLine: { // 分隔线
                        show:false
                    },
                    title: {
                        offsetCenter:[0, 18],
                        textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            color: 'white',
                            fontSize: 20
                        }
                    },
                    detail: {
                        show:true,
                        offsetCenter:[0, 100],
                        textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            color: '#fff',
                            fontSize:20,
                            fontWeight: 500
                        },
                        formatter: function (value) {
                            return `${value}%`;
                        },
                    },
                    itemStyle: {
                        normal: {
                            color: "#4A90E2",
                            width:2
                        }
                    },
                    data: [{
                        value: 68.72,
                        name: '',
                    }]
                },
                {
                    name: '',
                    type: 'gauge',
                    z: 1,
                    min: 0,
                    max: 100,
                    splitNumber: 10,
                    radius: '70%',
                    axisLine: {            // 坐标轴线
                        show:false,
                        lineStyle: {       // 属性lineStyle控制线条样式
                            width: 1,
                            color: [
                                [1,axislineColor]
                            ],
                        }
                    },
                    title:{
                        show:true
                    },
                    detail:{
                        show:true
                    },
                    axisTick: {//刻度
                        show:true,
                        length: -10,
                        lineStyle:{
                            width:1,
                            color:'#979797'
                        }
                    },
                    axisLabel:{
                        show:false,
                        // length:0,
                        // textStyle:{
                        //     fontSize:10,
                        //     length:-20
                        // }
                    },
                    splitLine: { // 分隔线
                        show:true,
                        length:6,
                        lineStyle:{
                            // width:1
                        }
                    },
                }
            ]
        };
        myeCharts.setOption(option)
        setInterval(function(){
            var data = [{
                value:option.series[0].data[0].value == 68.72 ? 65 :68.72,
                name:''
            }]
            option.series[0].data = data
            myeCharts.setOption(option)


        },2000)
    }

    var pie = function(){
        var myeCharts = echarts.init(document.getElementById('pie'))
        function getData(percent) {
            return [{
                value: percent,
                name: percent,
                itemStyle: {
                     normal: {
                             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                        offset: 0,
                                        color: '#00B2EE'
                                    }, {
                                        offset: 1,
                                        color: '#00DDE6'
                                    }])
                    }
                }
            }, {
                value: 1 - percent,
                itemStyle: {
                    normal: {
                        color: 'transparent'
                    }
                }
            }];
        }
        
        var placeHolderStyle = {
            normal: {
                label: {
                    show: false,
                },
                labelLine: {
                    show: false,
                }
        
        
            }
        };
        
        var option = {
            // backgroundColor: '#0E2A43',
            tooltip: {
                trigger: 'item',
                formatter: function(params, ticket, callback) {
        
                    return params.seriesName + ": " + params.name * 100 + "%";
                }
            },
            // legend: {
            //     top: "",
            //     left: "",
            //     itemHeight: 18,
            //     data: ['实勘率', '户型图比例', '钥匙率', '委托率', '经理陪看率'],
            //     textStyle: {
            //         color: '#fff'
            //     },
        
            //     selectedMode: true,
            //     orient: "vertical",
        
            // },
            series: [{
                name: '企业资源转换率',
                type: 'pie',
                clockWise: true, //顺时加载
                hoverAnimation: false, //鼠标移入变大
                radius: [95, 115],
                itemStyle: placeHolderStyle,
        
                label: {
                    normal: {
                        show: false,
                    }
                },
                data: getData(0.5128)
            }, {
                name: '生产直接装备资源转化率',
                type: 'pie',
                clockWise: true, //顺时加载
                hoverAnimation: false, //鼠标移入变大
                radius: [65, 85],
                itemStyle: placeHolderStyle,
                data: getData(0.1845)
            },{
                name: '生产人员资源转化率',
                type: 'pie',
                clockWise: true, //顺时加载
                hoverAnimation: false, //鼠标移入变大
                radius: [35, 55],
                itemStyle: placeHolderStyle,
                data: getData(0.1631)
            }, {
                name: '能源资源转化率',
                type: 'pie',
                clockWise: true, //顺时加载
                hoverAnimation: false, //鼠标移入变大
                radius: [5, 25],
                itemStyle: placeHolderStyle,
                data: getData(0.1396)
            }]

        };
        myeCharts.setOption(option)
        // setInterval(function(){
        //     var data = option.series
        //     // for(var i = 0 ; i<data.length; i++){
        //     //     data[i].data = getData(0.1396)
        //     // }
        //     myeCharts.setOption(option)
        // },10000)
    }

    var bar = function(){
        var myCharts = echarts.init(document.getElementById('bar'))
        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',

                }
            },
            legend: {
                data: ['接入率', '在线率', '完好率'],
                align: 'right',
                right: 10,
                textStyle: {
                    color: "#fff"
                },
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 35
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                data: ['生产直接装备资源转化率',
                    '主原料资源转化率',
                    '生产人员资源转化率',
                    '能源资源转化率',
                   
                ],
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#063374",
                        width: 1,
                        type: "solid"
                    }
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    show: true,
                    interval:0,
                    rotate:5,
                    textStyle: {
                        color: "#00c7ff",
                        fontSize:'10'
                    
                    }
                },
            }],
            yAxis: [{
                type: 'value',
                axisLabel: {
                    formatter: '{value} %'
                },
                axisTick: {
                    show: false,
                },
                axisLine: {
                    show: false,
                    lineStyle: {
                        color: "#00c7ff",
                        width: 1,
                        type: "solid"
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: "#063374",
                    }
                }
            }],
            series: [{
                name: '资源转化率',
                type: 'bar',
                data: [20, 50, 80, 58, ],
                barWidth: 10, //柱子宽度
                barGap: 1, //柱子之间间距
                itemStyle: {
                    normal: {
                        barBorderRadius: 30,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#569BE5'
                        }, {
                            offset: 1,
                            color: '#76B8EF'
                        }]),
                        opacity: 1,
                    }
                }
            },  {
                name: '环比',
                type: 'bar',
                data: [70, 48, 73, 68, ],
                barWidth: 10,
                barGap: 1,
                itemStyle: {
                    normal: {
                        barBorderRadius: 30,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#c4e300'
                        }, {
                            offset: 1,
                            color: '#728400'
                        }]),
                        opacity: 1,
                    }
                }
            }]
        };
        myCharts.setOption(option)
    }

    var rightBar = function(){
        
        var myCharts = echarts.init(document.getElementById('rightBar'))
        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params){
                        console.log(params)
                        return "效能："+params[0].data+'%'
                }
            },
            // legend: {
            //     data: ['接入率', '在线率', '完好率'],
            //     align: 'right',
            //     right: 10,
            //     textStyle: {
            //         color: "#fff"
            //     },
            //     itemWidth: 10,
            //     itemHeight: 10,
            //     itemGap: 35
            // },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                data: ['2017.1',
                        '2017.3',
                        '2017.4',
                        '2017.5',
                        '2017.6',
                ],
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#063374",
                        width: 1,
                        type: "solid"
                    }
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: "#00c7ff",
                    }
                },
            }],
            yAxis: [{
                type: 'value',
                min:0,
                max:100,
                axisLabel: {
                    formatter: '{value} %'
                },
                axisTick: {
                    show: false,
                },
                axisLine: {
                    show: false,
                    lineStyle: {
                        color: "#00c7ff",
                        width: 1,
                        type: "solid"
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: "#063374",
                    }
                }
            }],
            series: [{
                name: '效能',
                type: 'bar',
                data: [82.19,82.45,81.76,80.97,81.42,80.65],
                barWidth: 10, //柱子宽度
                barGap: 1, //柱子之间间距
                itemStyle: {
                    normal: {
                        barBorderRadius: 30,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#008cff'
                        }, {
                            offset: 1,
                            color: '#005193'
                        }]),
                        opacity: 1,
                    }
                }
            },  
            ]
        };
        myCharts.setOption(option)
        var y = 2017 , m = 7 , obj = {
            sevenTeen:[79.87,81.09,81.13,80.49,80.69,81.21,80.65,81.42,80.97,81.76,82.45,82.19],
            eighteen:[78.01,80.11,80.45,79.23,79.40,80.11,81.00,81.34,80.21,81.33,81.45,81.19]
        }
        setInterval(function(){
            y = m > 12 && y == 2017 ? 2018 : y == 2018 && m <= 12 ? 2018 : 2017
            m = m > 12 ? 1 : m
            option.series[0].data.shift()
            option.series[0].data.push(y == 2017 ? obj.sevenTeen[m-1] : obj.eighteen[m-1])
            option.xAxis[0].data.shift()
            option.xAxis[0].data.push(y + '.' + m++)
            myCharts.setOption(option)
        },2000)

        
    }

    var levelBar = function(){
        var myChart = echarts.init(document.getElementById("levelBar"))
        var data = [70, 34, 60, 78, 69]
        var titlename = ['制度工时', '设备负荷', '开动时间', '净开动', '有价值开动'];
        var valdata = ['', '计划停机时间', '停机损失', '待料时间', '质量损失时间']
        var myColor = ["#50E3C2", "#4AD7E2", "#4A94E2", "#285E9C", "#184F8F"];
        var option = {
            xAxis: {
                show: false
            },
            yAxis: [{
                show: true,
                data: titlename,
                inverse: true,
                axisLine: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    textStyle:{
                        color:"#76B9EF",
                        fontSize:9
                    }
                },


            }, {
                show: true,
                inverse: true,
                data: valdata,
                axisLabel: {
                    textStyle: {
                        fontSize: 8,
                        color: '#fff',
                    },
                },
                axisLine: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },

            }],
            series: [{
                name: '条',
                type: 'bar',
                yAxisIndex: 0,
                data: data,
                barWidth: 10,
                itemStyle: {
                    normal: {
                        barBorderRadius: 30,
                        color: function(params) {
                            return myColor[params.dataIndex]
                        },
                    }
                },
            },  ]
        };
            option.series[0].data.reverse();
            myChart.setOption(option)
    }

    var rightLine = function(ele){
        var myChart = echarts.init(document.getElementById(ele))
        var dataSource = [];
        var dataSource2 = [];
        var xAxisFlag = "";
        var index = 0;
        var option = {
            title: {
                text: 'ECharts'
            },
            tooltip: {
                show:true,
                trigger: 'axis',
                textStyle:{
                    color:['#fff']
                }, 
            },
            legend: {
                data:['销量']
            },
            color:['#50E3C2','#50E3C2'],
            xAxis: {
                data: ["产销率","库存周转率","生产周期","生产节拍"],
                boundaryGap: false,
                axisLabel:{
                    textStyle:{
                        color:"#B7D9FF",
                        fontSize:11
                    }
                }
            },
            yAxis: {
                axisLabel:{
                    textStyle:{
                        color:"#B7D9FF",
                        fontSize:11
                    }
                }
            },
            series: [
                {
                    name: "",
                    type: 'line',
                    data: dataSource,
                    showSymbol:true,
                    symbol:"circle",
                    symbolSize:10,
                    
                   label: {
                    normal: {
                    show: index === 0 ? true : false,
                    position: 'top',
                    }
                },
                },
            ]
        };

        myChart.setOption(option);
        var source = 0
        var timer = setInterval(function(){
            var data = option.series[0].data,_data = [0.99, 4.438, 2.42, 2.46]
            dataSource.push(_data[source])
            source != _data.length && source++
            if(source == _data.length) clearInterval(timer)
            myChart.setOption(option);
        },5000)
       
    }

    var footerLine = function(){
        var myChart = echarts.init(document.getElementById('footerLine'))
       var dataSource = [];
       var dataSource2 = [];
       var xAxisFlag = "";
       var index = 0;
        var option = {
            title: {
                text: 'ECharts'
            },
            tooltip: {
                show:true,
                trigger: 'axis',
                textStyle:{
                    color:['#fff']
                }, 
            },
            legend: {
                data:['销量']
            },
            color:['#40B59B','#F0A323'],

            xAxis: {
                data: ["0","1","2","3","4","5"],
                boundaryGap: false,
                axisLabel:{
                    textStyle:{
                        color:"#B7D9FF",
                        fontSize:11
                    }
                },
                axisTick: {
                    alignWithLabel:true,
                    length:10,
                    lineStyle: {
                        color: '#57617B'
                    }  
                    
                },
                axisLine: {
                    lineStyle: {
                        color: '#57617B'
                    }  
                },
                splitLine: {
                    lineStyle: {
                        color: '#57617B',
                    }
                }
            },
            yAxis: {
                axisLabel:{
                    textStyle:{
                        color:"#B7D9FF",
                        fontSize:11
                    }
                },
                axisTick: {
                    alignWithLabel:true,
                    length:10,
                    lineStyle: {
                        color: '#57617B'
                    }  
                },
                axisLine: {
                    lineStyle: {
                        color: '#57617B'
                    }  
                },
                splitLine: {
                    lineStyle: {
                        color: '#57617B',
                    }
                }
            },
            series: [
                {
                    name: '生产周期',
                    type: 'line',
                    data: [5, 20, 36, 10, 10, 20],
                    showSymbol:true,
                    symbol:"circle",
                    symbolSize:10,
                    
                   label: {
                    normal: {
                    show: index === 0 ? true : false,
                    position: 'top',
                    }
                },
                },
                {
                    name: '生产节拍',
                    type: 'line',
                    data: [15, 22, 10, 30, 20, 40],
                    showSymbol:true,
                    symbol:"circle",
                    symbolSize:10,
                    
                   label: {
                    normal: {
                    show: index === 0 ? true : false,
                    position: 'top',
                    }
                },
                },
               
            ]
        };

        myChart.setOption(option);
       
    }

    var polar = function(){
        var myChart = echarts.init(document.getElementById('polar'))
        
        var hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a',
        '7a', '8a', '9a','10a','11a',
        '12p', '1p', '2p', '3p', '4p', '5p',
        '6p', '7p', '8p', '9p', '10p', '11p'];
        var days = ['Saturday', 'Friday', 'Thursday',
        'Wednesday', 'Tuesday', 'Monday', 'Sunday'];

        var data = [[0,0,5],[0,1,1],[0,2,0],[0,3,0],[0,4,0],[0,5,0],[0,6,0],[0,7,0],[0,8,0],[0,9,0],[0,10,0],[0,11,2],[0,12,4],[0,13,1],[0,14,1],[0,15,3],[0,16,4],[0,17,6],[0,18,4],[0,19,4],[0,20,3],[0,21,3],[0,22,2],[0,23,5],[1,0,7],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[1,5,0],[1,6,0],[1,7,0],[1,8,0],[1,9,0],[1,10,5],[1,11,2],[1,12,2],[1,13,6],[1,14,9],[1,15,11],[1,16,6],[1,17,7],[1,18,8],[1,19,12],[1,20,5],[1,21,5],[1,22,7],[1,23,2],[2,0,1],[2,1,1],[2,2,0],[2,3,0],[2,4,0],[2,5,0],[2,6,0],[2,7,0],[2,8,0],[2,9,0],[2,10,3],[2,11,2],[2,12,1],[2,13,9],[2,14,8],[2,15,10],[2,16,6],[2,17,5],[2,18,5],[2,19,5],[2,20,7],[2,21,4],[2,22,2],[2,23,4],[3,0,7],[3,1,3],[3,2,0],[3,3,0],[3,4,0],[3,5,0],[3,6,0],[3,7,0],[3,8,1],[3,9,0],[3,10,5],[3,11,4],[3,12,7],[3,13,14],[3,14,13],[3,15,12],[3,16,9],[3,17,5],[3,18,5],[3,19,10],[3,20,6],[3,21,4],[3,22,4],[3,23,1],[4,0,1],[4,1,3],[4,2,0],[4,3,0],[4,4,0],[4,5,1],[4,6,0],[4,7,0],[4,8,0],[4,9,2],[4,10,4],[4,11,4],[4,12,2],[4,13,4],[4,14,4],[4,15,14],[4,16,12],[4,17,1],[4,18,8],[4,19,5],[4,20,3],[4,21,7],[4,22,3],[4,23,0],[5,0,2],[5,1,1],[5,2,0],[5,3,3],[5,4,0],[5,5,0],[5,6,0],[5,7,0],[5,8,2],[5,9,0],[5,10,4],[5,11,1],[5,12,5],[5,13,10],[5,14,5],[5,15,7],[5,16,11],[5,17,6],[5,18,0],[5,19,5],[5,20,3],[5,21,4],[5,22,2],[5,23,0],[6,0,1],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[6,5,0],[6,6,0],[6,7,0],[6,8,0],[6,9,0],[6,10,1],[6,11,0],[6,12,2],[6,13,1],[6,14,3],[6,15,4],[6,16,0],[6,17,0],[6,18,0],[6,19,0],[6,20,1],[6,21,2],[6,22,2],[6,23,6]];

        var option = {
        title: {
        // text: 'Punch Card of Github',
        // link: 'https://github.com/pissang/echarts-next/graphs/punch-card'
        },
        // legend: {
        // data: ['Punch Card'],
        // left: 'right'
        // },
        polar: {},
        // tooltip: {
        //     formatter: function (params) {
        //         return params.value[2] + ' commits in ' + hours[params.value[1]] + ' of ' + days[params.value[0]];
        //     }
        // },
        angleAxis: {
        show:false,
        type: 'category',
        data: hours,
        boundaryGap: false,
        splitLine: {
            show: true,
            lineStyle: {
                color: '#ddd',
                type: 'dashed'
            }
        },
        axisLine: {
            show: false
        }
        },
        radiusAxis: {
        show: true,
        // type: 'category',
        // data: days,
        axisLine: {
            show: false,
        },
        axisTick: {
            show: false
        },
        axisLabel: {
            show: false
        },
        },
        series: [{
        name: 'Punch Card',
        type: 'scatter',
        itemStyle:{
            normal:{
                color:"#76B9EF"
            }
        },
        coordinateSystem: 'polar',
        symbolSize: function (val) {
            return val[2] * 2;
        },
        data: data
        }]
        };
        myChart.setOption(option)
    }

    var scatter = function(){
        var myChart = echarts.init(document.getElementById("scatter"))
        var app = '气泡图';
        var data = []
        for (var i = 0; i < 20; i++) {
            data.push(
                [
                    Math.round(Math.random() * 100),
                    Math.round(Math.random() * 100),
                    Math.round(Math.random() * 40)
                ]
            );
        }
        var option = {
            color: ['#2988b8','red'],
            xAxis:{
                axisLabel: {
                    margin:15,
                    textStyle: {
                        color: '#3e4956'
                    }  
                },
                axisTick: {
                    alignWithLabel:true,
                    length:10,
                    lineStyle: {
                        color: '#57617B'
                    }  
                    
                },
                axisLine: {
                    lineStyle: {
                        color: '#57617B'
                    }  
                },
                splitLine: {
                    lineStyle: {
                        color: '#57617B',
                    }
                }
            },
            yAxis: {
                axisTick: {show:false},
                splitLine: {show:false},
                axisLabel: {show:false},
                axisLine: {show:false},
            },
            visualMap: {
                show: false,
                max: 100,
                inRange: {
                    symbolSize: [10, 50]
                }
            },
            series: 
            {
                type: 'scatter',
                data: data
            },
            animationDelay: function (idx) {
                return idx * 50;
            },
            animationEasing: 'elasticOut'
        };
        myChart.setOption(option)
        setInterval(function(){
            data = []
            for (var i = 0; i < 20; i++) {
                data.push(
                    [
                        Math.round(Math.random() * 100),
                        Math.round(Math.random() * 100),
                        Math.round(Math.random() * 40)
                    ]
                );
            }
            option.series.data = data
            myChart.setOption(option)
        },4000)
    }

    var _footerLine = function(){
        var myChart = echarts.init(document.getElementById("_footerLine"))
        var datas =[96.3,96.4,97.5,95.6,98.1,94.8,89.6,94.1,80.1,52.4,75.8,94.7];
        var datas1 =[46.3,26.4,57.5,95.6,98.1,9.8,89.6,94.1,80.1,52.4,75.8,12.7];

        var option = {
            // backgroundColor: '#1b1b1b',
            title: {
                text: '',
                textStyle: {
                    fontWeight: 'normal',
                    fontSize: 12,
                    color: '#F1F1F3'
                },
                left: '6%'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    lineStyle: {
                        color: '#57617B'
                    }
                }
            },
            legend: {
                icon: 'rect',
                itemWidth: 14,
                itemHeight: 5,
                itemGap: 13,
                data: ['产销率'],
                right: '4%',
                textStyle: {
                    fontSize: 12,
                    color: '#F1F1F3'
                }
            },
            grid: {
                left: '1%',
                right: '2%',
                bottom: '8%',
                top:'14%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: '#57617B'
                    }
                },
                data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                axisLabel:{
                    textStyle:{
                        color:"#B7D9FF",
                        fontSize:11
                    }
                },
            }],
            yAxis: [{
                type: 'value',
                interval: 40,
                max:120,
                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#57617B'
                    }
                },
                axisLabel:{
                    textStyle:{
                        color:"#B7D9FF",
                        fontSize:11
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#57617B'
                    }
                }
            }],
            series: [{
                name: '产销率',
                type: 'line',
                smooth: true,
                lineStyle: {
                    normal: {
                        width: 2
                    }
                },
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(74,144,226, 0.8)'
                        }, {
                            offset: 0.8,
                            color: 'rgba(74,144,226, 0.3)'
                        }], false),
                        shadowColor: 'rgba(74,144,226, 0.4)',
                        shadowBlur: 10
                    }
                },
                symbolSize:4,  
                itemStyle: {
                    normal: {
                        color: '#4A90E2',
                        borderColor:'#e48b4c'
                    },
                },
                data: datas,
            },{
                name: '产销率',
                type: 'line',
                smooth: true,
                lineStyle: {
                    normal: {
                        width: 2
                    }
                },
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(240,163,35, 0.8)'
                        }, {
                            offset: 0.8,
                            color: 'rgba(240,163,35, 0.3)'
                        }], false),
                        shadowColor: 'rgba(240,163,35, 0.4)',
                        shadowBlur: 10
                    }
                },
                symbolSize:4,  
                itemStyle: {
                    normal: {
                        color: '#F0A323',
                        borderColor:'#e48b4c'
                    },
                },
                data: datas1,
            } ]
        };
        myChart.setOption(option)
        var m = 1
        setInterval(function(){
            var _data = option.series[0].data,_datas = option.series[1].data
            m = m > 12 ? 1 : m
            _data.shift()
            _data.push((Math.random()*100).toFixed(1))
            _datas.shift()
            _datas.push((Math.random()*100).toFixed(1))
            option.xAxis[0].data.shift()
            option.xAxis[0].data.push(m++ + "月")
            myChart.setOption(option)
        },3000)
    }
    //返回
    $scope.return = function(){
        $window.history.back();
        sessionStorage.removeItem("com_data");
    };

    var phaseStatus = function(val){
        var state  = val <= 30 ? 1 : val <= 50 ? 2 : val <= 70 ? 3 : 
            val <= 80 ? 5 : val <= 100 ? 6 : 7
        return state
    }
    console.log(phaseStatus(78.46))
    init();
    console.log($scope.data.publish_project_list)

}]);
