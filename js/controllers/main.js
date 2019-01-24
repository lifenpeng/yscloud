"use strict";
var App = angular.module('app', [
    'ngRoute',
    'ui.bootstrap',
    'ui.router',
    'ngAnimate',
    'ngCookies',
    'ngWebSocket',
    'bsTable',
    'angularFileUpload',
    'clroute',

    'LicenseController',
    'ProjController',
    'ProdController',
    'PlanController',
    'MonitorController',
    'VersionController',
    'HomePageController',
    'UserController',
    'AnalysisController',
    'TaskController',
    'WorkorderController',
    'ProgramController',
    'CmptCtrl',
    'serverCtrl',
    'ModalCtrl',
    'InspectionController',
    'dispatchFlowController',
    'dispatchTaskController',
    'dispatchSceneController',
    'dispatchOtherController',
    'SysController',
    'ReleaseApplicationController',
    'FactoryController',
    'appStoreController',
    

    'CvDirectives',
    'TableDirective',
    'CvService',
    'CommHttpSrv',
    'DispatchHttpSrv',
    'FaultHttpSrv',
    'InspectionHttpSrv',
    'ReleaseHttpSrv',
    'ChartsService',
    'ConfigService',
    'GlobalData',
    'QRCodeLoginService',
    'FuncService',

    'ui.bootstrap.collapse',
    'ui.calendar',
    'ui.codemirror',
    'ui.sortable',
    'ui.tree'
]);
//请求服务根目录
App.constant('baseUrl', '/clWeb/');
App.controller('AppController', ["$scope", "$interval", "$rootScope", "$cookieStore", "$window", "$timeout","$state", "$location", "CommData", "User", "Message", "Task", "Modal", "$modal", "CV", function($scope, $interval, $rootScope, $cookieStore, $window,  $timeout, $state, $location, CommData, User, Message, Task, Modal, $modal, CV) {
    var url = $location.absUrl();
    var userName = url.indexOf('#') == -1 ? url.substring(url.indexOf("?")+1) : url.substring(url.indexOf("?")+1, url.indexOf("#"));
    var bl_rs_code=$cookieStore.get(userName + '_bl_rs_code');
    var login_data = $cookieStore.get(userName + '_data');
    $rootScope.rollback_dynamic = {};   //保存发布回退的进度信息
    $rootScope.global_data = {
        last_page : {}
    };
    $scope.bar = {
        first_active   :'',
        sec_active     :'',
        third_active   :'',
        topbar_active  :''
    };
    $rootScope.tops = [];
    $scope.sitebarData = {
        secondBarIsOpen : false,
        level_menu_num : 0,
        menu_num:0,
        rsul_num:0,
        top_bar_lg: false,
    }
    $scope.leftBar = 0;
    $scope.data = {};
    $scope.run_mode = $cookieStore.get("run_mode") ? $cookieStore.get("run_mode") : "";
    /*滚动条配置*/
    $scope.scroll_config_info={
        axis:"y" ,
        theme:"custom-dark",
        scrollbarPosition: "inside",
        scrollInertia:400,
        scrollEasing:"easeOutCirc",
        autoDraggerLength: true,
        autoHideScrollbar: true,
        scrollButtons:{ enable: false }
    };
    var _meg_and_task_init = function(){
        Message.mg_PageMessageAction(2,0,5).then(function(data){
            $rootScope.messages_list = data.msg_list;
            $rootScope.all_recd = data.all_recd;
        },function(error) {
            $rootScope.all_recd = 0;
            $rootScope.messages_list = [];
        });
    };

    var initAuthData = function(){
        if($rootScope.level_menu_list){
            for(var i = 0 ; i < $rootScope.level_menu_list.length; i++){
                for(var j = 0 ; j < $rootScope.level_menu_list[i].meun_bean_list.length;j++){
                    $rootScope.level_menu_list[i].meun_bean_list[j].active = false;
                }
            }
        }

    };
    //调用读取License信息服务
    var getLicense=function(){
        User.getLicense().then(function(data){
            $timeout(function () {
                if (data) {
                    $scope.operating_environment = data.zh_name ? data.zh_name : '沃克软件';
                    $scope.regist_flag= data.regist_flag;          //判断是否注册1显示未注册，2显示注册
                    if ($scope.regist_flag==2) {
                        if (data.expire_days != -9999) {
                            $scope.expire_end_date = '有效期至 ' + data.expire_end_date;
                        } else {
                            $scope.expire_end_date = '';
                        }
                    }
                }
            },0)
        },function(error){
            Modal.alert(error.message)
        });
    }
    var init = function(){
        if(!login_data) {
            $window.location.href='../login.html';
        } else {
            var login_user = login_data.cp;
            CommData.org_user_id = login_user.org_user_id;
            CommData.org_dept_id = login_user.org_dept_id;
            CommData.org_term_no = login_user.org_term_no;
            CommData.orguser_cn_name = login_user.orguser_cn_name;
            CommData.orgdept_cn_name = login_user.orgdept_cn_name;
            $rootScope.loginUser = login_user;
            User.getPermission(bl_rs_code).then(function(data){
                if(!$rootScope.level_menu_list) $rootScope.level_menu_list = data.level_menu_list ? data.level_menu_list : [];
                if(!$rootScope.menulist) $rootScope.menulist = data.menu ? data.menu : [];
                if(!$rootScope.rslist) $rootScope.rslist = data.rsurl ? data.rsurl : [];
                initAuthData();
            },function(error) {
                Modal.alert(error.message);
                $window.location.href='../login.html';
            });
        }
        if($scope.run_mode != 'integration'){
            _meg_and_task_init();
        }
        if(sessionStorage.getItem("com_data")){
            sessionStorage.removeItem("com_data");
        }
    };


    $scope.slidedownSecL = function(meun_list){
        if($scope.bar.sec_active != ''){
            meun_list.active = !meun_list.active;
            $scope.bar.sec_active = '';
        }else{
           meun_list.active = !meun_list.active;
        }
    };
    $scope.changeBar = function(tab){
        $scope.bar.first_active = tab.menu_name;
    };
    $scope.goToIndex = function(){
        $window.location.href='../index.html?' + userName;
    };
    $scope.goToUrl = function(path,us_num,munu_num){
        $scope.sitebarData.menu_num = munu_num;
        $scope.sitebarData.rsul_num = us_num;
        if(path === "flow_task_monitor"){
            return $window.location.href='views/dispatch/task/task_monitor.html?'+ userName;
        }
        if(path === "release_monitor"){
            return $window.location.href='views/publish/monitor/release_monitor.html?'+ userName;
        }
        $state.go(path);
    };
    $scope.indexGoToUrl = function(path){
        if(path.length>0){
            $state.go(path);
        }
    }
    //登出操作
    $scope.logoout = function() {
        $window.location.href='../login.html';
    };
    //跳转信息列表页
    $scope.goMessageList = function(){
        $state.go("msg_list");
        Message.mg_PageMessageAction(2,0,3).then(function(data){
            $rootScope.all_recd = data.all_recd;
        },function(error) {
            Modal.alert(error.message);
        });
    };
    //跳转我的任务列表页
    $scope.goTaskList = function(){
        $state.go("tasks_list",{tab_name:'mine_task'});
    };
    $scope.closeWindow = function(){
        Modal.confirm("是否关闭当前页面？").then(function(){
            var browserName=navigator.appName;
            if (browserName=="Netscape"){
                window.open('', '_self', '');
                window.close();
            }
            if (browserName=="Microsoft Internet Explorer") {
                window.parent.opener = "whocares";
                window.parent.close();
            }
        });
    };
    //菜单栏跳转
    $scope.sitebarJump = function(state) {
       $state.go(state.stateName,state.params);
    };
    //二级菜单打开收起
    $scope.secondBarOpen = function(flag){
        $scope.sitebarData.menu_num = -1;
        $scope.sitebarData.rsul_num = -1;
        if(flag == -1){
            $scope.sitebarData.secondBarIsOpen = false;
        }else if(!$scope.sitebarData.secondBarIsOpen){
            $scope.sitebarData.secondBarIsOpen = !$scope.sitebarData.secondBarIsOpen;
        }else if(flag == $scope.sitebarData.level_menu_num && $scope.sitebarData.secondBarIsOpen){
            $scope.sitebarData.secondBarIsOpen = !$scope.sitebarData.secondBarIsOpen;
        }
        $scope.sitebarData.level_menu_num = flag;
    };
    //头部logo跳转首页
    $scope.jumpToIndex = function(){
        $state.go('index');
    };
    //注册CorsLares模态框
    $scope.registerCorsLares=function(){
        $modal.open({
            templateUrl: 'templates/modal/regist_license_modal.html',
            controller: 'registerLicenseCtrl',
            size: 'md',
            backdrop:'static',
            keyboard:false,
            resolve: {
            }
        }).result.then(function(ret){
                getLicense();      //读取License信息服务
            });
    };
    $scope.breadcrumb = $cookieStore.get("crumb") ? $cookieStore.get("crumb") : [];
    $scope.$on('$stateChangeSuccess',function (event, toState, toParams, fromState, fromParams) {
        $scope.breadcrumb = CV.dealBreadCrumbData(toState,$scope.breadcrumb,toParams);
        $cookieStore.put('crumb',$scope.breadcrumb);
        if($state.current.name == 'index'){
            $scope.sitebarData.top_bar_lg = true;
        }else{
            $scope.sitebarData.top_bar_lg = false;
        }
    });
    //方案页面滚动时出现顶部按钮组
    $scope.scroll_callback = {
        whileScrolling : function () {
            if($('.flow-default') && $('.flow-default').offset()){
                var _h = $('.add-group-width').offset().top;
                var _r = $('#mCSB_1_dragger_vertical').offset().top;
                if(Math.floor(parseInt(_h)+180) > Math.floor(parseInt(_r))){
                    $('.float-div').css('display','none');
                }else{
                    var _width = $('.cont-div').width() + 18;
                    _width = _width + "px";
                    $('.flag-program-type').css('width',_width);
                    $('.float-div').css('display','flex');
                }
            }
        }
    };
    init();
}]);
function forbidBackSpace(e) {
    var ev = e || window.event; //获取event对象
    var obj = ev.target || ev.srcElement; //获取事件源
    var t = obj.type || obj.getAttribute('type'); //获取事件源类型
    //获取作为判断条件的事件类型
    var vReadOnly = obj.readOnly;
    var vDisabled = obj.disabled;
    //处理undefined值情况
    vReadOnly = (vReadOnly == undefined) ? false : vReadOnly;
    vDisabled = (vDisabled == undefined) ? true : vDisabled;
    //当敲Backspace键时，事件源类型为密码或单行、多行文本的，
    //并且readOnly属性为true或disabled属性为true的，则退格键失效
    var flag1 = ev.keyCode == 8 && (t == "password" || t == "text" || t == "textarea") && (vReadOnly == true || vDisabled == true);
    //当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效
    var flag2 = ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea" && t !="editDiv"; //editDiv可编辑div
    //判断
    if (flag2 || flag1) return false;
}
//禁止后退键 作用于Firefox、Opera
document.onkeypress = forbidBackSpace;
//禁止后退键  作用于IE、Chrome
document.onkeydown = forbidBackSpace;
(function ($) {
    $('#sidebar').css('height',$(window).height()-32 + 'px');
    $.fn.Data = function () {};
    var $this = $.fn.Data;
    $.fn.Data.pages = {
        '/index': {title: [], 'breadcrumb': [],active_sitebar:[],topbar_active:'home'},
        '/modify_pwd': {title: [], 'breadcrumb': ['修改密码'],active_sitebar:[],topbar_active:'user'},
        '/modify_user': {title: [], 'breadcrumb': ['个人信息'],active_sitebar:[],topbar_active:'user'},
        '/phone_detail': {title: [], 'breadcrumb': ['通讯录'],active_sitebar:[],topbar_active:'phone'},
        '/all_message': {title: [], 'breadcrumb': ['消息列表'],active_sitebar:[],topbar_active:'message'},
        '/logList': {title: '', 'breadcrumb': ['日志信息'],active_sitebar:[],topbar_active:'phone'},
        '/mes_detail': {title: ['/all_message'], 'breadcrumb': ['消息列表','消息详细信息'],active_sitebar:[],topbar_active:'message'},
        '/tasks_list': {title: [], 'breadcrumb': ['任务列表'],active_sitebar:[],topbar_active:'task'},
        '/task_check_mine': {title: ['/tasks_list/mine_task'], 'breadcrumb': ['任务列表','查看任务'],active_sitebar:[],topbar_active:'task'},
        '/task_check_view': {title: ['/tasks_list/view_task'], 'breadcrumb': ['任务列表','查看复核任务'],active_sitebar:[],topbar_active:'task'},
        '/task_check_auth': {title: ['/tasks_list/auth_task'], 'breadcrumb': ['任务列表','查看授权任务'],active_sitebar:[],topbar_active:'task'},
        '/task_handle': {title: ['/tasks_list/mine_task'], 'breadcrumb': ['任务列表','处理任务'],active_sitebar:[],topbar_active:'task'},
        '/task_examine_view': {title: ['/tasks_list/view_task'], 'breadcrumb': ['任务列表','复核任务'],active_sitebar:[],topbar_active:'task'},
        '/task_examine_auth': {title: ['/tasks_list/auth_task'], 'breadcrumb': ['任务列表','授权任务'],active_sitebar:[],topbar_active:'task'},
        '/trouble_ticket_task': {title: ['/tasks_list/trouble_ticket_task'], 'breadcrumb': ['任务列表','故障单任务'],active_sitebar:[],topbar_active:'task'},
        '/history_task_list': {title: [], 'breadcrumb': ['历史任务列表'],active_sitebar:[],topbar_active:'phone'},
        '/his_task_check_mine': {title: ['/history_task_list/mine_his_task'], 'breadcrumb': ['历史任务列表','查看任务'],active_sitebar:[],topbar_active:'phone'},
        '/his_task_check_view': {title: ['/history_task_list/view_his_task'], 'breadcrumb': ['历史任务列表','查看复核任务'],active_sitebar:[],topbar_active:'phone'},
        '/his_task_check_auth': {title: ['/history_task_list/auth_his_task'], 'breadcrumb': ['历史任务列表','查看授权任务'],active_sitebar:[],topbar_active:'phone'},


        '/new_proj': {title: '', 'breadcrumb': ['项目登记'],active_sitebar:['发布','proj','new_proj']},
        '/proj_list': {title: '', 'breadcrumb': ['项目列表'],active_sitebar:['发布','proj','proj_list/proj_prod_list']},
        '/history_proj_detail': {title: ['/proj_list/proj_his_list'], 'breadcrumb': ['项目列表-历史', '查看项目'],active_sitebar:['发布','proj','proj_list/proj_prod_list']},
        '/proj_detail': {title: ['/proj_list/proj_prod_list'], 'breadcrumb': ['项目列表', '查看项目'],active_sitebar:['发布','proj','proj_list/proj_prod_list']},
        '/pro_proj_detail': {title: ['/proj_list/proj_prod_list'], 'breadcrumb': ['项目列表-发布', '查看项目'],active_sitebar:['发布','proj','proj_list/proj_prod_list']},
        '/edit_proj': {title: ['/proj_list/proj_prod_list'], 'breadcrumb': ['项目列表', '修改项目'],active_sitebar:['发布','proj','proj_list/proj_prod_list']},
        '/finish_proj': {title: ['/proj_list/proj_his_list'], 'breadcrumb': ['历史项目列表', '结束项目'],active_sitebar:['发布','proj','proj_list/proj_prod_list']},
        '/his_proj_detail': {title: ['/proj_list/proj_his_list'], 'breadcrumb': ['历史项目列表', '查看项目'],active_sitebar:['发布','proj','proj_list/proj_prod_list']},
        '/new_proj_detail': {title: ['/proj_list/proj_prod_list'], 'breadcrumb': ['项目列表', '查看项目'],active_sitebar:['发布','proj','proj_list/proj_prod_list']},


        '/prod_exec_list': {title: '', 'breadcrumb': ['项目发布'],active_sitebar:['发布','prod','prod_exec_list/prod_pre_list']},
        '/prod_pre_detail': {title: ['/prod_exec_list/prod_pre_list'], 'breadcrumb': ['项目发布','准备项目'],active_sitebar:['发布','prod','prod_exec_list/prod_pre_list']},
        '/prod_pre_new_detail': {title: ['/prod_exec_list/prod_pre_list'], 'breadcrumb': ['项目发布','准备项目'],active_sitebar:['发布','prod','prod_exec_list/prod_pre_list']},
        '/prod_exec_detail': {title: ['/prod_exec_list/prod_do_list'], 'breadcrumb': ['项目发布','查看步骤'],active_sitebar:['发布','prod','prod_exec_list/prod_pre_list']},
        '/prod_exec_rollback': {title: ['/prod_exec_list/prod_do_list'], 'breadcrumb': ['项目发布','发布回退'],active_sitebar:['发布','prod','prod_exec_list/prod_pre_list']},
        '/prod_exec_do': {title: ['/prod_exec_list/prod_do_list'], 'breadcrumb': ['项目发布','执行项目'],active_sitebar:['发布','prod','prod_exec_list/prod_pre_list']},
        '/pre_proj_detail': {title: ['/prod_exec_list/prod_pre_list'], 'breadcrumb': ['准备项目','查看项目'],active_sitebar:['发布','prod','prod_exec_list/prod_pre_list']},
        '/pre_exec_proj_detail': {title: ['/prod_exec_list/prod_do_list'], 'breadcrumb': ['发布项目','查看项目'],active_sitebar:['发布','prod','prod_exec_list/prod_pre_list']},

        //敏捷发布
        '/quick_prod_list': {title: [], 'breadcrumb': ['敏捷发布'],active_sitebar:['发布','prod','quick_prod_list']},
        '/quick_prod': {title: ['/quick_prod_list'], 'breadcrumb': ['敏捷发布','登记项目'],active_sitebar:['发布','prod','quick_prod_list']},
        '/quick_detail': {title: ['/quick_prod_list'], 'breadcrumb': ['敏捷发布', '查看项目'],active_sitebar:['发布','prod','quick_prod_list']},
        '/quick_prod_exe': {title: ['/quick_prod_list'], 'breadcrumb': ['敏捷发布', '发布执行'],active_sitebar:['发布','prod','quick_prod_list']},


        '/exec_monitor_list': {title: [], 'breadcrumb': ['发布监控'],active_sitebar:['发布','prod','exec_monitor_list/single_monitor']},
        '/single_monitor_detail': {title: ['/exec_monitor_list/single_monitor'], 'breadcrumb': ['发布监控','单项监控'],active_sitebar:['发布','prod','exec_monitor_list/single_monitor']},
        '/single_monitor_auto': {title: ['/prod_exec_list/prod_do_list'], 'breadcrumb': ['发布项目','单项监控'],active_sitebar:['发布','prod','exec_monitor_list/single_monitor']},
        '/group_monitor_detail': {title: ['/exec_monitor_list/group_monitor'], 'breadcrumb': ['发布监控','分组监控'],active_sitebar:['发布','prod','prod_exec_list/prod_pre_list']},
        '/pre_monitor_detail': {title: ['/exec_monitor_list/pre_monitor'], 'breadcrumb': ['发布监控','前置监控'],active_sitebar:['发布','prod','exec_monitor_list/single_monitor']},
        '/monitor_prod_exec_rollback': {title: ['/exec_monitor_list'], 'breadcrumb': ['发布监控','发布回退'],active_sitebar:['发布','prod','exec_monitor_list/single_monitor']},
        '/single_monitor_prod_exec_rollback': {title: ['/exec_monitor_list/single_monitor'], 'breadcrumb': ['单项监控','发布回退'],active_sitebar:['发布','prod','exec_monitor_list/single_monitor']},
        '/group_monitor_prod_exec_rollback': {title: ['/exec_monitor_list/group_monitor'], 'breadcrumb': ['分组监控','发布回退'],active_sitebar:['发布','prod','exec_monitor_list/single_monitor']},
        '/pre_monitor_prod_exec_rollback': {title: ['/exec_monitor_list/pre_monitor'], 'breadcrumb': ['前置监控','发布回退'],active_sitebar:['发布','prod','exec_monitor_list/single_monitor']},
        //新版分组监控
        '/monitor_group': {title: ['/exec_monitor_list/monitor_group'], 'breadcrumb': ['发布监控','分组监控'],active_sitebar:['发布','prod','exec_monitor_list/single_monitor']},
        '/monitor_proj_detail': {title: ['/exec_monitor_list/monitor_group'], 'breadcrumb': ['发布监控', '查看项目'],active_sitebar:['发布','prod','exec_monitor_list/single_monitor']},

        '/prod_plan_list': {title: [], 'breadcrumb': ['计划编列'],active_sitebar:['发布','plan','prod_plan_list/plan']},
        '/history_plan_list': {title: [], 'breadcrumb': ['历史计划'],active_sitebar:['发布','plan','history_plan_list']},
        '/plan_proj_detail': {title: ['/prod_plan_list/plan'], 'breadcrumb': ['编排计划','查看项目'],active_sitebar:['发布','plan','prod_plan_list/plan']},
        '/plan_pre_detail': {title: ['/prod_plan_list/pre_plan'], 'breadcrumb': ['编排计划','查看项目'],active_sitebar:['发布','plan','prod_plan_list/plan']},
        '/plan_group_detail': {title: ['/prod_plan_list/group_plan'], 'breadcrumb': ['编排计划','查看项目'],active_sitebar:['发布','plan','prod_plan_list/plan']},
        '/proj_history_detail': {title: ['/history_plan_list'], 'breadcrumb': ['历史计划','查看项目'],active_sitebar:['发布','plan','history_plan_list']},
        '/his_plan_proj_detail': {title: ['/history_plan_list'], 'breadcrumb': ['历史计划','查看项目'],active_sitebar:['发布','plan','history_plan_list']},

        '/regular_prod_analysis': {title: [], 'breadcrumb': ['例行发布'],active_sitebar:['发布','analysis','regular_prod_analysis']},
        '/proj_prod_analysis': {title: [], 'breadcrumb': ['项目发布'],active_sitebar:['发布','analysis','proj_prod_analysis']},
        '/urgent_prod_analysis': {title: [], 'breadcrumb': ['紧急发布'],active_sitebar:['发布','analysis','urgent_prod_analysis']},
        '/demo': {title: [], 'breadcrumb': ['demo'],active_sitebar:['发布','demo','demo']},

        '/new_busi_sys': {title: [], 'breadcrumb': ['系统新增'],active_sitebar:['公共','busys','new_busi_sys']},
        '/busi_sys_list': {title: [], 'breadcrumb': ['系统列表'],active_sitebar:['公共','busys','busi_sys_list']},
        '/view_busi_sys': {title: ['/busi_sys_list'], 'breadcrumb': ['系统列表', '查看应用系统'],active_sitebar:['公共','busys','busi_sys_list']},
        '/edit_busi_sys': {title: ['/busi_sys_list'], 'breadcrumb': ['系统列表', '修改应用系统'],active_sitebar:['公共','busys','busi_sys_list']},
        '/config_busi_sys': {title: ['/busi_sys_list'], 'breadcrumb': ['系统列表', '配置应用系统'],active_sitebar:['公共','busys','busi_sys_list']},

        '/node_programme_config': {title: ['/busi_sys_list'], 'breadcrumb': ['系统列表', '配置应用系统'],active_sitebar:['公共','busys','busi_sys_list']},
        '/bs_proj_detail': {title: ['/busi_sys_list','/config_busi_sys/busiSysId'], 'breadcrumb': ['系统列表','配置应用系统','项目查看'],active_sitebar:['公共','busys','busi_sys_list']},

        '/env_add':{title:[],'breadcrumb':['环境新增'],active_sitebar:['公共','env','env_add']},
        '/env_list':{title:[],'breadcrumb':['环境列表'],active_sitebar:['公共','env','env_list']},
        '/env_detail':{title:['/env_list'],'breadcrumb':['环境列表','环境查看'],active_sitebar:['公共','env','env_list']},
        '/env_update':{title:['/env_list'],'breadcrumb':['环境列表','环境修改'],active_sitebar:['公共','env','env_list']},

        '/new_cmpt': {title: [], 'breadcrumb': ['新增组件'],active_sitebar:['公共','cmpt','new_cmpt']},
        '/cmpt_list': {title: [], 'breadcrumb': ['组件列表'],active_sitebar:['公共','cmpt','cmpt_list']},
        '/cmpts_list': {title: [], 'breadcrumb': ['组件组列表'],active_sitebar:['公共','cmpt','cmpts_list']},
        '/edit_cmpt': {title: ['/cmpt_list'], 'breadcrumb': ['组件列表','编辑组件'],active_sitebar:['公共','cmpt','cmpt_list']},
        '/detail_cmpt': {title: ['/cmpt_list'], 'breadcrumb': ['组件列表','查看组件'],active_sitebar:['公共','cmpt','cmpt_list']},
        '/cmpt_test': {title: ['/cmpt_list'], 'breadcrumb': ['组件列表','测试组件'],active_sitebar:['公共','cmpt','cmpt_list']},
        '/edit_cmpts': {title: ['/cmpts_list'], 'breadcrumb': ['组件组列表','编辑组件组'],active_sitebar:['公共','cmpt','cmpts_list']},
        '/detail_cmpts': {title: ['/cmpts_list'], 'breadcrumb': ['组件组列表','查看组件组'],active_sitebar:['公共','cmpt','cmpts_list']},
        '/cmpts_test': {title: ['/cmpts_list'], 'breadcrumb': ['组件组列表','测试组件组'],active_sitebar:['公共','cmpt','cmpts_list']},
        '/plugIn_list': {title: [], 'breadcrumb': ['插件库'],active_sitebar:['公共','plugIn_list','plugIn_list']},
        '/resource_list': {title: [], 'breadcrumb': ['公共资源'],active_sitebar:['公共','resource_list','resource_list']},


        '/new_workorder': {title: [], 'breadcrumb': ['录入工单'],active_sitebar:['故障','order','new_workorder']},
        '/import_excel': {title: ['new_workorder'], 'breadcrumb': ['录入工单','批量导入'],active_sitebar:['故障','order','new_workorder']},
        '/my_workorder_list': {title: [], 'breadcrumb': ['我的工单'],active_sitebar:['故障','order','my_workorder_list/create/no_workorder']},
        '/detail_creating_workorder':  {title: ['my_workorder_list/create/no_workorder'], 'breadcrumb': ['我的工单','查看工单'],active_sitebar:['故障','order','my_workorder_list/create/no_workorder']},
        '/detail_pending_workorder':  {title: ['my_workorder_list/pending/no_workorder'], 'breadcrumb': ['我的工单','查看工单'],active_sitebar:['故障','order','my_workorder_list/create/no_workorder']},
        '/detail_processed_workorder':  {title: ['my_workorder_list/processed/no_workorder'], 'breadcrumb': ['我的工单','查看工单'],active_sitebar:['故障','order','my_workorder_list/create/no_workorder']},
        '/edit_workorder':  {title: ['my_workorder_list/create/no_workorder'], 'breadcrumb': ['我的工单','修改工单'],active_sitebar:['故障','order','my_workorder_list/create/no_workorder']},
        '/detail_allWorkorder':  {title: ['all_workorder'], 'breadcrumb': ['所有工单','查看工单'],active_sitebar:['故障','order','all_workorder']},
        '/export_program':  {title: ['all_workorder'], 'breadcrumb': ['所有工单','导出方案'],active_sitebar:['故障','order','all_workorder']},
        '/all_workorder': {title: [], 'breadcrumb': ['所有工单'],active_sitebar:['故障','order','all_workorder']},
        '/new_program': {title: [], 'breadcrumb': ['新建方案'],active_sitebar:['故障','prog','new_program/new_program/new_program']},
        '/edit_program': {title: ['program_list'], 'breadcrumb': ['所有方案','修改方案'],active_sitebar:['故障','prog','program_list']},
        '/detail_program': {title: ['program_list'], 'breadcrumb': ['所有方案','查看方案'],active_sitebar:['故障','prog','program_list']},
        '/program_list': {title: [], 'breadcrumb': ['方案库'],active_sitebar:['故障','prog','program_list']},
        '/trouble_sys': {title: [], 'breadcrumb': ['故障系统'],active_sitebar:['故障','param','trouble_sys']},
        '/trouble_type': {title: [], 'breadcrumb': ['故障类型'],active_sitebar:['故障','param','trouble_type']},
        '/peak_date': {title: [], 'breadcrumb': ['高峰时段'],active_sitebar:['故障','param','peak_date']},

        '/cjtask_list': {title: [], 'breadcrumb': ['任务列表'],active_sitebar:['巡检','collect','cjtask_list/create']},
        '/new_cjprog': {title: [], 'breadcrumb': ['新建采集方案'],active_sitebar:['巡检','collect','new_cjprog']},
        '/edit_cjprog': {title: ['cjprog_list'], 'breadcrumb': ['所有采集方案','修改采集方案'],active_sitebar:['巡检','collect','cjprog_list']},
        '/cjprog_list': {title: [], 'breadcrumb': ['方案列表'],active_sitebar:['巡检','collect','cjprog_list']},
        '/new_cjtask': {title: [], 'breadcrumb': ['自动采集'],active_sitebar:['巡检','collect','new_cjtask']},
        '/detail_cj_prog': {title: ['cjprog_list'], 'breadcrumb': ['所有采集方案','方案查看'],active_sitebar:['巡检','collect','cjprog_list']},
        '/cj_run_task_detail': {title: ['cjtask_list/create'], 'breadcrumb': ['任务列表','查看运行中任务'],active_sitebar:['巡检','collect','cjtask_list/create']},
        '/cj_pend_task_detail': {title: ['cjtask_list/pending'], 'breadcrumb': ['任务列表','查看自动任务'],active_sitebar:['巡检','collect','cjtask_list/create']},
        '/cj_pend_task_watch': {title: ['cjtask_list/watch'], 'breadcrumb': ['任务列表','采集监控'],active_sitebar:['巡检','collect','cjtask_list/create']},

        '/new_xjdatabase': {title: [], 'breadcrumb': ['创建数据库'],active_sitebar:['巡检','inspect','new_xjdatabase']},
        '/xjdatabase_list': {title: [], 'breadcrumb': ['数据库列表'],active_sitebar:['巡检','inspect','xjdatabase_list']},
        '/edit_xjdatabase': {title: ['/xjdatabase_list'], 'breadcrumb': ['数据库列表','修改数据库'],active_sitebar:['巡检','inspect','xjdatabase_list']},
        '/xjdatabase_detail': {title: ['/xjdatabase_list'], 'breadcrumb': ['数据库列表','查看数据库'],active_sitebar:['巡检','inspect','xjdatabase_list']},
        '/new_xjtask': {title: [], 'breadcrumb': ['创建巡检任务'],active_sitebar:['巡检','inspect','new_xjtask']},
        '/new_detail_xjtask': {title: ['/xjtask_list'], 'breadcrumb': ['巡检任务列表','查看巡检任务'],active_sitebar:['巡检','inspect','xjtask_list']},
        '/xjtask_list': {title: [], 'breadcrumb': ['巡检任务列表'],active_sitebar:['巡检','inspect','xjtask_list']},
        '/xjreport_list': {title: [], 'breadcrumb': ['巡检报告列表'],active_sitebar:['巡检','inspect','xjreport_list']},
        '/new_indexmodule': {title: [], 'breadcrumb': ['指标模型'],active_sitebar:['巡检','module','new_indexmodule']},
        '/edit_indexmodule': {title: ['/indexmodule_list'], 'breadcrumb': ['指标模型列表','修改指标模型'],active_sitebar:['巡检','module','indexmodule_list']},
        '/index_module_detail': {title: ['/indexmodule_list'], 'breadcrumb': ['指标模型列表','查看指标模型'],active_sitebar:['巡检','module','indexmodule_list']},
        '/indexmodule_list': {title: [], 'breadcrumb': ['指标模型'],active_sitebar:['巡检','module','indexmodule_list']},
        '/new_report_temp': {title: [], 'breadcrumb': ['报告模版'],active_sitebar:['巡检','module','new_report_temp']},
        '/xj_log': {title: [], 'breadcrumb': ['日志巡检'],active_sitebar:['巡检','xj_log','xj_log']},
        '/log_pick':{title:[],'breadcrumb': ['日志提取'],active_sitebar:['巡检','xj_log','log_pick']},
        '/log_report':{title:[],'breadcrumb': ['新增巡检报告'],active_sitebar:['巡检','xj_log','log_report']},
        '/log_report_list':{title:[],'breadcrumb': ['巡检报告列表'],active_sitebar:['巡检','xj_log','log_report_list']},

        '/flow_list':{title:[],'breadcrumb': ['流程列表'],active_sitebar:['调度','flow','flow_list/cus_active']},
        '/flow_made':{title:[],'breadcrumb': ['流程定制'],active_sitebar:['调度','flow','flow_made']},
        '/flow_edit':{title:['/flow_list/cus_active'],'breadcrumb': ['流程列表','流程修改'],active_sitebar:['调度','flow','flow_list/cus_active']},
        '/flow_edit_auto':{title:['/flow_list/auto_active'],'breadcrumb': ['流程列表','流程修改'],active_sitebar:['调度','flow','flow_list/auto_active']},
        '/flow_edit_focus':{title:['/flow_list/atten_active'],'breadcrumb': ['流程列表','流程修改'],active_sitebar:['调度','flow','flow_list/atten_active']},
        '/flow_copy':{title:['/flow_list/cus_active'],'breadcrumb': ['流程列表','流程复制'],active_sitebar:['调度','flow','flow_list/cus_active']},
        '/flow_copy_auto':{title:['/flow_list/auto_active'],'breadcrumb': ['流程列表','流程复制'],active_sitebar:['调度','flow','flow_list/auto_active']},
        '/flow_copy_focus':{title:['/flow_list/atten_active'],'breadcrumb': ['流程列表','流程复制'],active_sitebar:['调度','flow','flow_list/atten_active']},
        '/flow_detail':{title:['/flow_list/cus_active'],'breadcrumb': ['流程列表','流程查看'],active_sitebar:['调度','flow','flow_list/cus_active']},
        '/flow_detail_auto':{title:['/flow_list/auto_active'],'breadcrumb': ['流程列表','流程查看'],active_sitebar:['调度','flow','flow_list/auto_active']},
        '/flow_detail_focus':{title:['/flow_list/atten_active'],'breadcrumb': ['流程列表','流程查看'],active_sitebar:['调度','flow','flow_list/atten_active']},
        '/flow_task_list':{title:[],'breadcrumb': ['任务列表'],active_sitebar:['调度','flow_task','flow_task_list/cus_active']},
        '/yw_task_exec':{title:['/flow_task_list/cus_active'],'breadcrumb': ['任务列表','任务执行'],active_sitebar:['调度','flow_task','ywtask_detail']},
        '/yw_task_detail':{title:['/flow_task_list/cus_active'],'breadcrumb': ['任务列表', '任务查看'],active_sitebar:['调度','flow_task','flow_task_list/cus_active']},
        '/yw_task_detail_his':{title:['/flow_task_list/his_active'],'breadcrumb': ['任务列表','任务查看'],active_sitebar:['调度','flow_task','flow_task_list/his_active']},
        '/flow_task_preview':{title:[],'breadcrumb': ['任务概览'],active_sitebar:['调度','flow_task','flow_task_preview']},
        '/new_scene':{title:[],'breadcrumb': ['新增场景'],active_sitebar:['调度','dispatch_scene','new_scene']},
        '/edit_scene':{title:['/scene_list/new_scene'],'breadcrumb': ['场景列表','场景修改'],active_sitebar:['调度','dispatch_scene','scene_list/new_scene']},
        '/scene_list':{title:[],'breadcrumb': ['场景列表'],active_sitebar:['调度','dispatch_scene','scene_list/new_scene']},
        '/scene_detail':{title:['/scene_list/new_scene'],'breadcrumb': ['场景列表','场景查看'],active_sitebar:['调度','dispatch_scene','scene_list/new_scene']},
        '/strategy_group_list':{title:[],'breadcrumb': ['策略组'],active_sitebar:['调度','dispatch_strategy','strategy_group_list']},
        '/strategy_group_detail':{title:['/strategy_group_list'],'breadcrumb': ['策略组','策略组查看'],active_sitebar:['调度','dispatch_strategy','strategy_group_list']},
        '/yw_task_report':{title:[],'breadcrumb': ['报表'],active_sitebar:['调度','dispatch_analysis','yw_task_report']},
        '/tree': {title: '', 'breadcrumb': ['DEMO']},
        '/flow_factmode_devzone':{title:['/flow_factmode_devzone'],'breadcrumb':['工厂建模','开发区(Dev)'],active_sitebar:['工厂建模','flow_factmode_devzone','/flow_factmode_devzone']},
        '/appStore':{title:['/appStore'],'breadcrumb':['应用商店','商店列表'],active_sitebar:['应用商店','appStore','/appStore']}
    };
    $.fn.Data.get = function (id) {
        if (id && $this.pages[id]) {
            return $this.pages[id];
        }
    };
})(jQuery);
