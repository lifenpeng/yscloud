"use strict";
var router = angular.module('clroute', []);
/*
 采用这种配置可以避免相同的页面写多个状态---当firstFloor为第一层的时候 先清空 在赋值。
 面包屑对象
 $scope.breadcrumb = [{
 state:'',//跳转的状态名
 params:'',//参数名
 label:'',//面包屑名
 }];
 url:""// 路由地址，包含参数。
 路由内面包屑对象
 ncyBreadcrumb:{
 label:"",//当前的面包屑名
 params:'',//当前路由参数名,以‘|’形式隔开，参数值从url拿。在statechangesuccess里将参数以对象形式保存
 firstFloor:true,//是否是第一层，如果是第一层则先清空面包屑再赋值
 }
 */
router.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/index');
    $stateProvider.state('index', {//首页
        url: '/index',
        templateUrl: 'templates/states/home_page.html',
        controller: "indexCtrl",
        ncyBreadcrumb: {
            label: '首页',
            floor: 1,
        },
        menu_name: "",
    }).state('proj_register', {//新增项目
        url: '/proj_register',
        templateUrl: 'views/publish/proj/project_register.html',
        controller: 'projectRegisterCtrl',
        ncyBreadcrumb: {
            label: '项目登记',
            floor: 1,
        },
        menu_name: "发布",
    }).state('proj_register_modify', {//修改项目。参数名：proj_id(项目名）sys_id(系统名)
        url: '/proj_register_modify?project_id',
        templateUrl: 'views/publish/proj/project_register.html',
        controller: 'projectRegisterModifyCtrl',
        ncyBreadcrumb: {
            label: '修改项目',
            floor: 2,
        },
        menu_name: "发布",
    }).state('proj_modify.pub_pgm', {//修改项目-查看方案.参数：pgm_id（方案名）
        url: '/proj_modify?prog_id',
        templateUrl: 'views/publish/proj/pub_pgm.html',
        controller: 'pgmCtrl',
        menu_name: "发布",
    }).state('proj_list', {//项目列表
        url: '/proj_list',
        templateUrl: 'views/publish/proj/proj_list.html',
        controller: 'projListCtrl',
        ncyBreadcrumb: {
            label: '项目列表',
            floor: 1,
        },
        menu_name: "发布",
        frame: 'proj_list',
    }).state('proj_history', {//项目历史列表
        url: '/proj_history',
        templateUrl: 'views/publish/proj/proj_list.html',
        controller: 'projListCtrl',
        ncyBreadcrumb: {
            label: '历史项目',
            floor: 1,
        },
        menu_name: "发布",
        frame: 'proj_history',
    }).state('proj_detail', {//项目查看 参数：project_id（项目id） tab_flag(1项目列表 2历史项目列表);
        url: '/proj_detail?project_id&project_name&project_status&tab_flag',
        templateUrl: 'views/publish/proj/proj_detail.html',
        controller: 'projDetailCtrl',
        ncyBreadcrumb: {
            label: '项目查看',
            floor: 2,
        },
        menu_name: "发布",
        frame: 'proj_detail',
    }).state('proj_detail.proj_application', {//项目查看-项目查看单个项目申请
        url: '/proj_application',
        templateUrl: 'views/publish/pub/pub_application_list.html',
        controller: 'pubApplicationListCtrl',
        ncyBreadcrumb: {
            label: '项目查看',
            floor: 2,
        },
        menu_name: "发布",
        frame: 'proj_detail',
    }).state('proj_detail_pre', {//项目查看-项目信息。参数：publish_id（系统发布id）;sys_id(系统名);
        url: '/proj_detail_pre?publish_id&sys_id',
        templateUrl: 'views/publish/proj/proj_detail_pre.html',
        controller: 'projPreDetailCtrl',
        ncyBreadcrumb: {
            label: '系统发布查看',
            floor: 2,
        },
        menu_name: "发布",
    }).state('proj_detail_exec', {//项目查看-执行信息。参数：proj_name（项目名）;sys_id(系统名);back_state(返回状态）
        url: '/proj_detail_exec?proj_id&sys_id',
        templateUrl: 'views/publish/proj/proj_detail_exec.html',
        controller: 'projExecDetailCtrl',
        ncyBreadcrumb: {
            label: '项目查看',
            floor: 2,
        },
        menu_name: "发布",
    }).state('release_calendar', {//发布日历
        url: '/release_calendar',
        templateUrl: 'views/publish/plan/release_calendar.html',
        controller: 'releaseCalendarCtrl',
        ncyBreadcrumb: {
            label: '发布日历',
            floor: 1,
        },
        menu_name: "发布",
    }).state('pub_window_set', {//设置发布窗口
        url: '/pub_window_set',
        templateUrl: 'views/publish/plan/pub_window_set.html',
        controller: 'pubWindowSetCtrl',
        ncyBreadcrumb: {
            label: '发布窗口设置',
            floor: 1,
        },
        menu_name: "发布",
    }).state('pub_application', {//发布申请 publish_id 发布申请id
        url: '/pub_application',
        templateUrl: 'views/publish/pub/pub_application.html',
        controller: 'pubApplicationCtrl',
        ncyBreadcrumb: {
            label: '发布申请',
            floor: 1,
        },
        menu_name: "发布",
    }).state('pub_application_list', {//发布申请 publish_id 发布申请id
        url: '/pub_application_list',
        templateUrl: 'views/publish/pub/pub_application_list.html',
        controller: 'pubApplicationListCtrl',
        ncyBreadcrumb: {
            label: '申请列表',
            floor: 1,
        },
        menu_name: "发布",
    }).state('history_application', {//历史申请
        url: '/history_application',
        params:{
            his_list_flag : true
        },
        templateUrl: 'views/publish/pub/pub_application_list.html',
        controller: 'pubApplicationListCtrl',
        ncyBreadcrumb: {
            label: '历史申请',
            floor: 1,
        },
        menu_name: "发布",
    }).state('pub_application_update', {//修改发布申请id  发布申请id
        url: '/pub_application_update?pjpublish_id',
        templateUrl: 'views/publish/pub/pub_application.html',
        controller: 'updatePubApplicationCtrl',
        ncyBreadcrumb: {
            label: '修改发布申请',
            floor: 2,
        },
        menu_name: "发布",
    }).state('application_list', {//发布申请列表
        url: '/application_list',
        templateUrl: 'views/publish/pub/pub_application.html',
        controller: 'pubApplicationCtrl',
        ncyBreadcrumb: {
            label: '申请列表',
            floor: 1,
        },
        menu_name: "发布",
    }).state('application_history', {//历史发布申请列表
        url: '/application_history',
        templateUrl: 'views/publish/pub/pub_application.html',
        controller: 'pubApplicationCtrl',
        ncyBreadcrumb: {
            label: '历史申请',
            floor: 1,
        },
        menu_name: "发布",
    }).state('proj_his_plan_list', {//历史编列
        url: '/proj_his_plan_list',
        templateUrl: 'views/publish/plan/proj_his_plan_list.html',
        controller: 'projPlanHistoryCtrl',
        ncyBreadcrumb: {
            label: '历史计划',
            floor: 1,
        },
        menu_name: "发布",
        frame: 'proj_his_plan_list',
    }).state('routine_release', {//例行发布
        url: '/routine_release',
        templateUrl: 'views/publish/pub/routine_release.html',
        controller: 'routineReleaseCtrl',
        ncyBreadcrumb: {
            label: '例行发布',
            floor: 1,
        },
        menu_name: "发布",
    }).state('view_application', { //查看单个发布申请页面 application_id 申请id
        url: '/view_application?application_id',
        templateUrl: 'views/publish/pub/view_publish_application.html',
        controller: 'viewPubApplicationCtrl',
        ncyBreadcrumb: {
            label: '查看发布申请',
            floor: 2,
        },
        menu_name: "发布",
    }).state('plan_sys_set', {//计划编列页面--新 publish_id(发布id)
        url: '/plan_sys_set?publish_id',
        templateUrl: 'views/publish/plan/plan_sys_set.html',
        controller: 'planSysSetCtrl',
        ncyBreadcrumb: {
            label: '流程编排',
            floor: 2,
        },
        menu_name: "发布",
    }).state('pub_pre', {//发布准备。参数：sys_publish_id（系统发布），sys_id（系统ID）
        url: '/pub_pre?sys_publish_id&sys_id',
        templateUrl: 'views/publish/pub/pub_pre.html',
        controller: 'pubPreCtrl',
        ncyBreadcrumb: {
            label: '发布准备',
            replace_flag : true,
            floor: 2,
        },
        menu_name: "发布",
    }).state('pub_pre.pub_pgm', {//发布准备-方案信息 参数：proj_name（项目名），sys_id（系统ID）
        url: '/pub_pre?prog_id&pre_flag',
        templateUrl: 'views/publish/proj/pub_pgm.html',
        controller: 'pgmCtrl',
        menu_name: "发布",
    })
    .state('release_exec',{ //发布页面 参数：sys_publish_id（系统发布id），sys_id（系统ID）
        url: '/release_exec?sys_publish_id&sys_id',
        templateUrl: 'views/publish/pub/release_exec.html',
        controller: 'releaseExecCtrl',
        ncyBreadcrumb: {
            label: '发布执行',
            floor: 2,
        },
        menu_name: "发布",
    })
    .state('release_exec.monitor_view',{ //监控总执行视图
        url: '/monitor_view',
        templateUrl: 'views/publish/pub/release_monitor_view.html',
        controller: 'releaseMonitorCtrl',
        ncyBreadcrumb: {
            label: '发布执行',
            floor: 2,
        },
        menu_name: "发布",
    })
    .state('release_exec.terminal_view',{ //终端视图
        url: '/terminal_view',
        templateUrl: 'views/publish/pub/release_terminal_view.html',
        controller: 'releaseTerminalCtrl',
        ncyBreadcrumb: {
            label: '发布执行',
            floor: 2,
        },
        menu_name: "发布",
    })
    /* .state('pub_exec', {//发布执行明细 参数：sys_publish_id（系统发布id），sys_id（系统ID） path_flag (跳转标志) 1 从例行发布而来 2 从合并发布而来
        url: '/pub_exec?sys_publish_id&sys_id&exec_type&quick_pub_flag&auto_yn_flag&path_flag',
        templateUrl: 'views/publish/pub/prod_exec.html',
        controller: 'prodExecDoCtrl',
        ncyBreadcrumb: {
            label: '发布执行',
            floor: 2,
        },
        menu_name: "发布",
    })
        .state('pub_exec.console', {//发布执行明细-控制台信息
            url: '/console?execute_id&stop_flag',
            templateUrl: 'views/publish/pub/console.html',
            controller: 'execConsoleCtrl',
            menu_name: "发布",
        }) */
        .state('monitor_list', {//监控列表
            url: '/monitor_list',
            templateUrl: 'views/publish/pub/monitor_list.html',
            controller: 'execMonirorListCtrl',
            ncyBreadcrumb: {
                label: '监控列表',
                floor: 1,
            },
            menu_name: "发布",
        }).state('monitor_detail', {//单项监控 参数：sys_publish_id（系统发布id）；sys_id（系统名）；sys_status(项目状态）
        url: '/monitor_detail?sys_publish_id&sys_id&sys_status&quick_pub_flag',
        templateUrl: 'views/publish/pub/monitor_detail.html',
        controller: 'monitorDetailCtrl',
        ncyBreadcrumb: {
            label: '单项监控',
            floor: 2,
        },
        menu_name: "发布",
    }).state('monitor_detail.console', {//单项监控-控制台信息 参数：proj_name（项目名）；sys_id（系统状态）；proj_status(项目状态）
        url: '/console?execute_id&stop_flag',
        templateUrl: 'views/publish/pub/console.html',
        controller: 'execConsoleCtrl',
        menu_name: "发布",
        frame: 'monitor_list',
    }).state('group_monitor_detail', {//监控分组信息 参数 publish_id（分组名）
        url: '/group_monitor_detail?publish_id&application_name',
        templateUrl: 'views/publish/pub/monitor_group.html',
        controller: 'monitorGroupCtrl',
        ncyBreadcrumb: {
            label: '项目监控',
            floor: 2,
        },
        menu_name: "发布",
    }).state('agile_pub_list', {//敏捷发布列表
        url: '/agile_pub_list',
        templateUrl: 'views/publish/pub/agile_release_list.html',
        controller: 'agileReleaseListCtrl',
        ncyBreadcrumb: {
            label: '敏捷发布',
            floor: 1,

        },
        menu_name: "发布",
    }).state('agile_pub_pre', {//敏捷发布准备 参数：proj_name(项目名)。sys_id（系统名）。pub_type（发布类型）
        url: '/agile_pub_pre?modify_flag&proj_name&sys_name',
        templateUrl: 'views/publish/pub/agile_pub_pre.html',
        controller: 'agilePubPreCtrl',
        ncyBreadcrumb: {
            label: '敏捷发布准备',
            floor: 2,
        },
        menu_name: "发布",
    }).state('agile_pub_exe', {//敏捷发布执行 参数：sys_publish_id（系统发布id），sys_id（系统ID） path_flag (跳转标志) 1 从例行发布而来 2 从合并发布而来
        url: '/agile_pub_exe?sys_publish_id&sys_id&exec_type&quick_pub_flag&auto_yn_flag&path_flag',
        templateUrl: 'views/publish/pub/prod_exec.html',
        controller: 'prodExecDoCtrl',
        ncyBreadcrumb: {
            label: '敏捷发布执行',
            floor: 2,
        },
        menu_name: "发布",
    }).state('agile_pub_exe.console', {//发布执行明细-控制台信息
        url: '/console?execute_id&stop_flag',
        templateUrl: 'views/publish/pub/console.html',
        controller: 'execConsoleCtrl',
        menu_name: "发布",
    })
        .state('regular_analysis', {//统计分析 例行发布
            url: '/regular_analysis',
            templateUrl: 'views/publish/analysis/prod_regular_analysis.html',
            controller: 'regularanalysisCtrl',
            ncyBreadcrumb: {
                label: '统计分析',
                floor: 1,
            },
            menu_name: "发布",
        }).state('pub_analysis', {//统计分析 项目发布
        url: '/pub_analysis',
        templateUrl: 'views/publish/analysis/prod_pub_analysis.html',
        controller: 'pubAnalysisCtrl',
        ncyBreadcrumb: {
            label: '统计分析',
            floor: 1,
        },
        menu_name: "发布",
    }).state('urgent_analysis', {//紧急发布
        url: '/urgent_analysis',
        templateUrl: 'views/publish/analysis/prod_urgent_analysis.html',
        controller: 'urgentAnalysisCtrl',
        ncyBreadcrumb: {
            label: '统计分析',
            floor: 1,
        },
        menu_name: "发布",
    }).state('version_pub_stream_list', {//版本管理-发布流列表
        url: '/version_pub_stream_list',
        templateUrl: 'views/publish/version/publish_stream_list.html',
        controller: 'pubStreamListCtrl',
        ncyBreadcrumb: {
            label: '发布流列表',
            floor: 1
        },
        menu_name: "发布",
    }).state('version_pub_stream_detail', {//版本管理-发布流查看
        url: '/version_pub_stream_detail?sys_name&version_id',
        templateUrl: 'views/publish/version/publish_stream_detail.html',
        controller: 'pubStreamDetailCtrl',
        ncyBreadcrumb: {
            label: '发布流查看',
            floor: 2
        },
        menu_name: "发布",
    })
        .state('version_full_stream_list', {//版本管理-全量流列表
            url: '/version_full_stream_list',
            templateUrl: 'views/publish/version/full_stream_list.html',
            controller: 'fullStreamListCtrl',
            ncyBreadcrumb: {
                label: '全量流列表',
                floor: 1
            },
            menu_name: "发布",
        }).state('version_full_stream_detail', { //版本管理-全量流查看
        url: '/version_full_stream_detail?sys_name&version_id',
        templateUrl: 'views/publish/version/full_stream_detail.html',
        controller: 'fullStreamDetailCtrl',
        ncyBreadcrumb: {
            label: '全量流查看',
            floor: 2
        },
        menu_name: "发布",
    })
        .state('version_new', {//版本管理-新增版本
            url: '/version_new?sys_name&sys_cn_name',
            templateUrl: 'views/publish/version/version_new.html',
            controller: 'versionNewCtrl',
            ncyBreadcrumb: {
                label: '新增版本',
                floor: 1
            },
            menu_name: "发布",
        })
        .state('user_modify', { //头部导航-修改用户
            url: '/user_modify',
            templateUrl: 'views/header/user/user_modify.html',
            controller: 'userModifyCtrl',
            ncyBreadcrumb: {
                label: '个人信息',
                floor: 1
            },
            menu_name: "页头",
        })
        .state('pwd_modify', { //头部导航-修改密码
            url: '/pwd_modify',
            templateUrl: 'views/header/user/pwd_modify.html',
            controller: 'pwdModifyCtrl',
            ncyBreadcrumb: {
                label: '修改密码',
                floor: 1
            },
            menu_name: "页头",
        })
        .state('msg_list', { //头部导航-消息列表
            url: '/msg_list',
            templateUrl: 'views/header/msg/msg_list.html',
            ncyBreadcrumb: {
                label: '消息列表',
                floor: 1
            },
            menu_name: "页头",
        })
        .state('msg_detail', { //头部导航-消息查看  参数：msg_id(消息编号)
            url: '/msg_detail?msg_id',
            templateUrl: 'views/header/msg/msg_detail.html',
            controller: 'msgDetailCtrl',
            ncyBreadcrumb: {
                label: '消息查看',
                floor: 2
            },
            menu_name: "页头",
        })
        .state('tasks_list', { //头部导航-任务列表  参数：tab_name(tab页名称: mine_task(我的), review_task(复核), auth_task(授权), trouble_task(故障单))
            url: '/tasks_list?tab_name',
            templateUrl: 'views/header/task/tasks_list.html',
            controller: 'tasksListCtrl',
            ncyBreadcrumb: {
                label: '任务列表',
                floor: 1
            },
            menu_name: "页头",
        })
        .state('task_detail', { //头部导航-任务查看  参数：tab_name(tab页名称：包含我的任务和历史任务), task_id(任务编号)
            url: '/task_detail?tab_name&task_id',
            templateUrl: 'views/header/task/task_detail.html',
            controller: 'taskDetailCtrl',
            ncyBreadcrumb: {
                label: '任务查看',
                floor: 2
            },
            menu_name: "页头",
        })
        .state('task_handle', { //头部导航-任务处理(包含:复核，授权)  参数：tab_name(tab页名称), task_id(任务编号)
            url: '/task_handle?tab_name&task_id',
            templateUrl: 'views/header/task/task_handle.html',
            controller: 'taskHandleCtrl',
            ncyBreadcrumb: {
                label: '任务处理',
                floor: 2
            },
            menu_name: "页头",
        })
        .state('trouble_task_handle', { //头部导航-故障单任务处理  参数：tab_name(tab页名称), task_id(任务编号) detail_flag(查看标志)
            url: '/trouble_task_handle?tab_name&task_id&detail_flag',
            templateUrl: 'views/header/task/trouble_task_handle.html',
            controller: 'troubleTaskHandleCtrl',
            ncyBreadcrumb: {
                label: '故障单任务',
                floor: 2
            },
            menu_name: "页头",
        })
        .state('tasks_history_list', { //头部导航-任务历史列表  参数：tab_name(tab页名称: submit_his(提交), review_his(复核), auth_his(授权))
            url: '/tasks_history_list?tab_name',
            templateUrl: 'views/header/task/tasks_history_list.html',
            controller: 'tasksHistoryListCtrl',
            ncyBreadcrumb: {
                label: '历史任务列表',
                floor: 1
            },
            menu_name: "页头",
        })
        .state('log_list', { //头部导航-日志列表
            url: '/log_list',
            templateUrl: 'views/header/log/log_list.html',
            controller: 'logListCtrl',
            ncyBreadcrumb: {
                label: '日志列表',
                floor: 1
            },
            menu_name: "页头",
        })
        .state('contacts_list', { //头部导航-通讯录
            url: '/contacts_list',
            templateUrl: 'views/header/contacts/contacts_list.html',
            controller: 'contactsListCtrl',
            ncyBreadcrumb: {
                label: '通讯录',
                floor: 1
            },
            menu_name: "页头",
        })
        .state('inspection_log_pick', { //巡检-日志巡检-日志提取
            url: '/log_pick',
            templateUrl: 'views/inspection/log/log_pick.html',
            controller: 'logPickCtrl',
            ncyBreadcrumb: {
                label: '日志提取',
                floor: 1
            },
            menu_name: "巡检",
        })
        .state('inspection_log_analysis', { //巡检-日志巡检-日志分析
            url: '/log_analysis',
            templateUrl: 'views/inspection/log/log_analysis.html',
            controller: 'logAnalysisCtrl',
            ncyBreadcrumb: {
                label: '日志分析',
                floor: 1
            },
            menu_name: "巡检",
        })
        .state('inspection_log_analysis.keyword_chart', { //巡检-日志巡检-日志分析-关键字分析图表
            url: '/keyword_chart',
            params: {
                keyword_info: null
            },
            templateUrl: 'views/inspection/log/log_analysis_keyword_chart.html',
            controller: 'logAnalysisKeywordChartCtrl',
            ncyBreadcrumb: {
                label: '关键字分析报告',
                floor: 1
            },
            menu_name: "巡检",
        })
        .state('inspection_log_report_new', { //巡检-日志巡检-新增报告
            url: '/log_report_new',
            templateUrl: 'views/inspection/log/log_report_new.html',
            controller: 'logReportNewCtrl',
            ncyBreadcrumb: {
                label: '新增报告',
                floor: 1
            },
            menu_name: "巡检",
        })
        .state('inspection_log_report_new.log_preview', { //巡检-日志巡检-新增报告-报告预览
            url: '/log_preview',
            params: {
                submit_info: null
            },
            templateUrl: 'views/inspection/log/log_report_preview.html',
            controller: 'logReportReviewCtrl',
            ncyBreadcrumb: {
                label: '报告预览',
                floor: 1
            },
            menu_name: "巡检",
        })
        .state('inspection_log_report_list', { //巡检--日志巡检-报告列表
            url: '/log_report_list',
            templateUrl: 'views/inspection/log/log_report_list.html',
            ncyBreadcrumb: {
                label: '报告列表',
                floor: 1
            },
            menu_name: "巡检",
        })
        .state('wo_new', {   //录入工单
            url: '/wo_new',
            templateUrl: 'views/fault/workorder/wo_new.html',
            controller: 'woNewCtrl',
            ncyBreadcrumb: {
                label: '录入工单',
                floor: 1,
            },
            menu_name: "故障",
        })
        .state('wo_modify', {   //修改工单 参数 wo_seq 工单编号
            url: '/wo_modify?wo_seq',
            templateUrl: 'views/fault/workorder/wo_new.html',
            controller: 'woModifyCtrl',
            ncyBreadcrumb: {
                label: '修改工单',
                floor: 1,
            },
            menu_name: "故障",
        })
        .state('wo_import', {   //导入工单页面
            url: '/wo_import?file_name',
            templateUrl: 'views/fault/workorder/wo_import.html',
            controller: 'woImportCtrl',
            ncyBreadcrumb: {
                label: '导入工单',
                floor: 1,
            },
            menu_name: "故障",
        })
        .state('wo_detail', { //工单查看 参数 wo_seq : 工单编号 back_state : 返回的状态（从哪进回哪）
            url: '/wo_detail?wo_seq&back_state',
            templateUrl: 'views/fault/workorder/wo_detail.html',
            controller: 'woDetailCtrl',
            ncyBreadcrumb: {
                label: '工单查看',
                floor: 2,
            },
            menu_name: "故障",
        })
        .state('wo_mine', {  //我的工单 参数tab_name tab页名称 order_seq 工单id 录入工单后点击处理后传过来的
            url: '/wo_mine',
            params: {
                tab_name: null,
                order_seq: null,
            },
            templateUrl: 'views/fault/workorder/wo_mine.html',
            controller: 'woMineCtrl',
            menu_name: "故障",
        })
        .state('wo_mine.create_list', {    //我的工单 -- 我创建的工单列表
            url: '/create_list',
            template: '<create-workorder></create-workorder>',
            ncyBreadcrumb: {
                label: '我的工单',
                floor: 1,
            },
            menu_name: "故障",
        })
        .state('wo_mine.pending_list', {   //我的工单 -- 待处理的工单列表
            url: '/pending_list',
            template: '<pending-workorder></pending-workorder>',
            ncyBreadcrumb: {
                label: '待处理的工单',
                floor: 1,
            },
            menu_name: "故障",
        })
        .state('wo_mine.processed_list', {   //我的工单 -- 已处理的工单列表
            url: '/processed_list',
            template: '<processed-workorder></processed-workorder>',
            ncyBreadcrumb: {
                label: '已处理的工单',
                floor: 1,
            },
            menu_name: "故障",
        })
        .state('wo_mine.wo_handle', {  //我的工单 -- 处理工单
            url: '/wo_handle',
            templateUrl: 'views/fault/workorder/wo_handle.html',
            controller: 'woHandleCtrl',
            ncyBreadcrumb: {
                label: '处理工单',
                floor: 1,
            },
            menu_name: "故障",
        })
        .state('wo_all_list', { //所有工单
            url: '/wo_all_list',
            templateUrl: 'views/fault/workorder/wo_all_list.html',
            controller: 'woAllListCtrl',
            ncyBreadcrumb: {
                label: '所有工单',
                floor: 1,
            },
            menu_name: "故障",
        })
        .state('fault_program_new', { //新增方案
            url: '/fault_program_new',
            params: {
                flag: null,
                order_seq: null,
                deal_bk_seq: null,
            },
            templateUrl: 'views/fault/program/fault_program_new.html',
            controller: 'faultProgramNewCtrl',
            ncyBreadcrumb: {
                label: '新增方案',
                floor: 1,
            },
            menu_name: "故障",
        })
        .state('fault_program_modify', { //修改方案 参数 program_id : 方案编号
            url: '/fault_program_modify/:program_id',
            templateUrl: 'views/fault/program/fault_program_modify.html',
            controller: 'faultProgramModifyCtrl',
            ncyBreadcrumb: {
                label: '修改方案',
                floor: 2,
            },
            menu_name: "故障",
        })
        .state('fault_program_detail', { //查看方案 参数 program_id : 方案编号 program_source : 方案新增时类型（1 手动添加 2 批量导入 3 批量查询）
            url: '/fault_program_detail?program_id&program_source',
            templateUrl: 'views/fault/program/fault_program_detail.html',
            controller: 'faultProgramDetailCtrl',
            ncyBreadcrumb: {
                label: '查看方案',
                floor: 2,
            },
            menu_name: "故障",
        })
        .state('fault_program_list', { //方案列表
            url: '/fault_program_list',
            templateUrl: 'views/fault/program/fault_program_list.html',
            ncyBreadcrumb: {
                label: '方案列表',
                floor: 1,
            },
            menu_name: "故障",
        })
        .state('fault_trouble_type', {  //故障类型
            url: '/fault_trouble_type',
            templateUrl: 'views/fault/configParams/fault_trouble_type.html',
            ncyBreadcrumb: {
                label: '故障类型',
                floor: 1,
            },
            menu_name: "故障",
            // controller:'faultTroubleTypeCtrl'
        })
        .state('fault_peak_date', {   //高峰时段
            url: '/fault_peak_date',
            templateUrl: 'views/fault/configParams/fault_peak_date.html',
            ncyBreadcrumb: {
                label: '高峰时段',
                floor: 1,
            },
            menu_name: "故障",
            // controller:'faultPeakDateCtrl'
        })

        .state('sys_new', {//系统新增
            url: '/sys_new',
            templateUrl: 'views/public/sys/sys_new.html',
            controller: 'sysNewCtrl',
            ncyBreadcrumb: {
                label: '新增系统',
                floor: 1,
            },
            menu_name: "公共",
        })
        .state('sys_news', {//系统新增
            url: '/sys_news',
            templateUrl: 'views/public/sys/sys_news.html',
            controller: 'sysNewsCtrl',
            ncyBreadcrumb: {
                label: '新增系统',
                floor: 1,
            },
            menu_name: "公共",
        })
        .state('sys_modify', {//系统修改
            url: '/sys_modify?sys_id',    //sys_id(系统id)
            templateUrl: 'views/public/sys/sys_new.html',
            controller: 'sysModifyCtrl',
            ncyBreadcrumb: {
                label: '系统修改',
                floor: 2,
            },
            menu_name: "公共",
        })
        .state('sys_detail', {//系统查看,
            url: '/sys_detail?sys_id',//sys_id(系统id)
            templateUrl: 'views/public/sys/sys_detail.html',
            controller: 'sysDetailCtrl',
            ncyBreadcrumb: {
                label: '系统查看',
                floor: 2,
            },
            menu_name: "公共",
        })
        .state('sys_list', {//系统列表
            url: '/sys_list',
            templateUrl: 'views/public/sys/sys_list.html',
            ncyBreadcrumb: {
                label: '系统列表',
                floor: 1,
            },
            menu_name: "公共",
        })
        .state('sys_config', {//系统配置
            url: '/sys_config?sys_id&sys_cn_name',//参数 sys_id(系统id) sys_cn_name（系统中文名）
            templateUrl: 'views/public/sys/sys_config.html',
            controller: 'sysConfigCtrl',
            menu_name: "公共",
        })
        .state('sys_config.struct_config', {//系统配置 -- 架构配置
            url: '/struct_config',
            templateUrl: 'views/public/sys/struct_config.html',
            controller: 'structConfigCtrl',
            ncyBreadcrumb: {
                label: '系统配置',
                floor: 2,
            },
            menu_name: "公共",
         })
        .state('sys_config.env_config_list', {//系统配置--环境配置-环境列表
            url: '/env_config_list',
            templateUrl: 'views/public/sys/env_config_list.html',
            controller: 'envConfigListCtrl',
            ncyBreadcrumb: {
                label: '系统配置',
                floor: 2,
            },
            menu_name: "公共",
        })
        .state('sys_config.env_config_list.env_config_new', {//系统配置列表--环境配置--新增
            url: '/env_config_new?env_modify_flag&env_id',//参数 env_modify_flag(1查看 2修改 3新增)
            templateUrl: 'views/public/sys/env_config_new.html',
            controller: 'envConfigNewCtrl',
            menu_name: "公共",
        })
       /* .state('sys_config_list.node_list', {//系统配置列表-节点列表
            url: '/node_list',//参数 sys_id(业务系统id)
            templateUrl: 'views/public/sys/node_list.html',
            controller: 'nodeListCtrl',
            ncyBreadcrumb: {
                label: '系统配置',
                floor: 2,
            },
            menu_name: "公共",
        })
        .state('sys_config_list.node_tab', {//系统配置列表-节点配置
            url: '/node_tab?node_id&modify_type&node_name', //参数node_ed（节点id），node_name（节点名）,modify_type(操作类型)1：新增，2：修改 3：查看/!*node_id&modify_type&sys_id*!/
            templateUrl: 'views/public/sys/node_tab.html',
            controller: 'nodeTabCtrl',
            menu_name: "公共",
        })
        .state('sys_config_list.node_tab.node_add_modify', {//节点列表-节点切换新增，修改
            url: '/node_tab_add_modify?judge_id&judge_modify&judge_name', //参数 judge_name节点名， judge_modify:跳转类型：1：新增，2：修改 3：查看  judge_id(跳转ip)
            templateUrl: 'views/public/sys/node_tab_add_modify.html',
            controller: 'nodeTabAddOrModifyCtrl',
            menu_name: "公共",
        })
        .state('sys_config_list.node_tab.node_detail', {//节点列表-节点切换查看
            url: '/node_tab_detail?judge_id&judge_modify&judge_name', //参数judge_modify:1：新增，2：修改 3：查看  judge_id(跳转ip)
            templateUrl: 'views/public/sys/node_tab_detail.html',
            controller: 'nodeTabDetailCtrl',
            menu_name: "公共",
        })*/
        .state('sys_config.program_list', {//系统配置列表-方案列表
            url: '/program_list',
            templateUrl: 'views/public/sys/program_list.html',
            controller: 'programListCtrl',
            ncyBreadcrumb: {
                label: '系统配置',
                floor: 2,
            },
            menu_name: "公共",
        })
        .state('sys_config.program_tab', {//系统配置列表-方案配置
            url: '/program_tab',//参数program_id（方案id），modify_type(操作类型),program_name:参数名 1：新增，2：修改 3：查看,repeat_flag(是否是复制):1(复制),2（不复制）
            params:{
                program_id:null,
                modify_type:null,
                repeat_flag:null,
            },
            templateUrl: 'views/public/sys/program_tab.html',
            controller: 'programTabCtrl',
            menu_name: "公共",
        })
        .state('sys_config.program_tab.program_add_or_modify', {//方案列表-方案切换新增，修改
            url: '/program_tab_add_modify',//参数judge_id（方案id），judge_modify（操作类型），judge_name(方案中文名)1：新增，2：修改 3：查看judge_repeat:1复制2，不复制
            params:{
                judge_id:null,
                judge_modify:null,
                judge_repeat:null,
            },
            templateUrl: 'views/public/sys/program_tab_add_modify.html',
            controller: 'programTabAddOrModifyCtrl',
            menu_name: "公共",
        })
        .state('sys_config.program_tab.program_detail', {//方案列表-方案切换查看
            url: '/program_tab_detail',//参数program_id（方案id），modify_type(操作类型)1：新增，2：修改 3：查看
            params:{
                judge_id:null,
                judge_modify:null,
            },
            templateUrl: 'views/public/sys/program_tab_detail.html',
            controller: 'programTabDetailCtrl',
            menu_name: "公共",
        })
        .state('sys_config.log_list', {//系统配置列表-日志列表
            url: '/log_list',
            templateUrl: 'views/public/sys/log_list.html',
            controller: 'sysLogListCtrl',
            ncyBreadcrumb: {
                label: '系统配置',
                floor: 2,
            },
            menu_name: "公共",
        })
        .state('sys_config.log_tab', {//系统配置列表-日志配置
            url: '/log_tab',//参数log_id（日志id），modify_type(操作类型)1：新增，2：修改 3：查看 ,log_name(日志中文名)
            params:{
                log_id:null,
                modify_type:null,
                log_name:null
            },
            templateUrl: 'views/public/sys/log_tab.html',
            controller: 'logTabCtrl',
            menu_name: "公共",
        })
        .state('sys_config.log_tab.log_add_modify', {//日志列表-日志切换新增，修改
            url: '/log_tab_add_and_modify',//参数 judge_name日志名， judge_modify:跳转类型：1：新增，2：修改 3：查看  judge_id(跳转日志id)
            params:{
                judge_id:null,
                judge_modify:null,
                judge_name:null
            },
            templateUrl: 'views/public/sys/log_tab_add_modify.html',
            controller: 'logTabAddOrModifyCtrl',
            menu_name: "公共",
        })
        .state('sys_config.log_tab.log_detail', {//日志列表-日志切换查看
            url: '/log_tab_detail',//参数log_id（日志id），modify_type(操作类型)1：新增，2：修改 3：查看
            params:{
                judge_id:null,
                judge_modify:null,
                judge_name:null
            },
            templateUrl: 'views/public/sys/log_tab_detail.html',
            controller: 'logTabDetailCtrl',
            menu_name: "公共",
        })
        /*.state('sys_config.pub_version', {//系统配置列表-发布版本
            url: '/pub_version',
            templateUrl: 'views/public/sys/pub_version.html',
            controller: 'pubVersionCtrl',
            ncyBreadcrumb: {
                label: '系统配置',
                floor: 2,
            },
            menu_name: "公共",
        })
        .state('sys_config.agent_manage', {//系统配置列表-agent管理
            url: '/agent_manage',
            templateUrl: 'views/public/sys/agent_manage.html',
            controller: 'agentManageCtrl',
            ncyBreadcrumb: {
                label: '系统配置',
                floor: 2,
            },
            menu_name: "公共",
        })*/
        .state('srv_new',{ //服务器-新增服务器
            url:'/srv_new',
            templateUrl:'views/public/server/server_new.html',
            controller:'serverNewCtrl',
            ncyBreadcrumb: {
                label: '新增服务器',
                floor: 1,
            },
            menu_name: "srv",
        }).state('srv_new.srv_new_basic',{
        url:'/srv_new_basic?server_ip&&agent_status&&server_id',    //参数 server_ip:服务器ip,agent_status:agent部署标志
        templateUrl:'views/public/server/server_form.html',
        controller:'serverNewBasicInfoCtrl',
        menu_name: "srv"
    }).state('srv_modify',{ //服务器-修改服务器
        url:'/srv_modify?server_ip',
        views:{
            '' : {
                templateUrl : 'views/public/server/server_modify.html'
            },
            '@srv_modify': {
                templateUrl: 'views/public/server/server_form.html',
                controller: 'serverModifyCtrl'
            }
        },
        ncyBreadcrumb: {
            label: '修改服务器',
            floor: 2,
        },
        menu_name: "srv"
    }).state('srv_detail',{
        url:'/srv_detail?server_ip',
        templateUrl:'views/public/server/server_detail.html',
        controller:'serverDetailCtrl',
        ncyBreadcrumb: {
            label: '查看服务器',
            floor: 2,
        },
        menu_name: "srv",
    }).state('srv_list',{
        url:'/srv_list',
        templateUrl:'views/public/server/server_list.html',
        controller:'serverListCtrl',
        ncyBreadcrumb: {
            label: '服务器列表',
            floor: 1,
        },
        menu_name: "srv",
    }).state('agent_monitor',{
        url:'/agent_monitor',
            templateUrl:'views/public/server/agent_monitor.html',
            controller:'agentMonitorCtrl',
            ncyBreadcrumb: {
            label: '监控列表',
                floor: 1,
        },
        menu_name: "srv",
    })
        .state('cmpt', {//组件
            url: '/cmpt',
            templateUrl: 'views/public/cmpt/cmpt.html',
            controller: 'cmptCtrl',
            ncyBreadcrumb: {
                label: '新增组件',
                floor: 1,
            },
            menu_name: "公共",
        })
        .state('cmpt.cmpt_new', {//新增组件
            url: '/cmpt_new',
            templateUrl: 'views/public/cmpt/cmpt_new.html',
            controller: 'cmptNewCtrl',
            ncyBreadcrumb: {
                label: '新增组件',
                floor: 1,
            },
            menu_name: "公共",
        }).state('cmpt_modify', {//修改组件
        url: '/cmpt_modify?cmpt_id',  //参数cmpt_id（组件id）
        views: {
            '': {
                templateUrl: 'views/public/cmpt/cmpt_modify.html'
            },
            '@cmpt_modify': {
                templateUrl: 'views/public/cmpt/cmpt_new.html',
                controller: 'cmptModifyCtrl'
            }
        },
        ncyBreadcrumb: {
            label: '修改组件',
            floor: 2,
        },
        menu_name: "公共",
    }).state('cmpt.cmpts_new', {//新增组件组
        url: '/cmpts_new',
        templateUrl: 'views/public/cmpt/cmpts_new.html',
        controller: 'cmptsNewCtrl',
        ncyBreadcrumb: {
            label: '新增组件组',
            floor: 1
        },
        menu_name: "公共",
    }).state('cmpt_detail', {//查看组件
        url: '/cmpt_detail?cmpt_id',//参数cmpt_id（组件id）
        templateUrl: 'views/public/cmpt/cmpt_detail.html',
        controller: 'cmptDetailCtrl',
        ncyBreadcrumb: {
            label: '查看组件',
            floor: 2
        },
        menu_name: "公共",
    })
        .state('cmpts_modify', {//修改组件组
            url: '/cmpts_modify?cmpts_id',//参数cmpts_id（组件组id）
            views: {
                '': {
                    templateUrl: 'views/public/cmpt/cmpts_modify.html'
                },
                '@cmpts_modify': {
                    templateUrl: 'views/public/cmpt/cmpts_new.html',
                    controller: 'cmptsModifyCtrl'
                }
            },
            ncyBreadcrumb: {
                label: '修改组件组',
                floor: 2
            },
            menu_name: "公共",
        })
        .state('cmpts_detail', {//查看组件组
            url: '/cmpts_detail?cmpts_id',//参数cmpts_id（组件组id）
            templateUrl: 'views/public/cmpt/cmpts_detail.html',
            controller: 'cmptsDetailCtrl',
            ncyBreadcrumb: {
                label: '查看组件组',
                floor: 2
            }
        })
        .state("cmpt_list", {//组件列表
            url: '/cmpt_list',
            templateUrl: 'views/public/cmpt/cmpt_list.html',
            controller: 'cmptListCtrl',
            ncyBreadcrumb: {
                label: '组件列表',
                floor: 1
            },
            menu_name: "公共",
        })
        .state("cmpts_list", {//组件组列表
            url: '/cmpts_list',
            templateUrl: 'views/public/cmpt/cmpts_list.html',
            controller: 'cmptsListCtrl',
            ncyBreadcrumb: {
                label: '组件组列表',
                floor: 1
            },
            menu_name: "公共",
        })
        .state('cmpt_test', {//组件测试
            url: '/cmpt_test?cmpt_id&cmpt_name',//参数cmpt_id（组件id） cmpt_name(组件名)
            templateUrl: 'views/public/cmpt/cmpt_test.html',
            controller: 'cmptTestCtrl',
            ncyBreadcrumb: {
                label: '组件测试',
                floor: 2
            },
            menu_name: "公共",
        })
        .state('plugin_list', {//插件库
            url: '/plugin_list',
            templateUrl: 'views/public/plugin/plugin_list.html',
            ncyBreadcrumb: {
                label: '插件库',
                floor: 1,
            },
            menu_name: "公共",
        })
        .state('resources_list', {//公共资源
            url: '/resources_list',
            templateUrl: 'views/public/resources/resources_list.html',
            ncyBreadcrumb: {
                label: '公共资源',
                floor: 1,
            },
            menu_name: "公共",
        })
        //调度
        .state('dispatch_flow_new', { //新增流程。
            url: '/flow_new',
            templateUrl: 'views/dispatch/flow/flow_basic_new.html', //编辑基本信息页面
            controller: 'flowBasicInfoNewCtrl',
            ncyBreadcrumb: {
                label: 'App开发',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('dispatch_flow_edit', { //编辑流程图。
            url: '/flow_edit/:flow_id/:version_id',
            views: {
                '': { //此视图加载基本信息页面
                    templateUrl: 'views/dispatch/flow/flow_basic_detail.html', //编辑基本信息页面
                    controller: 'flowBasicInfoDetailCtrl',
                },
                'flow_edit_info@dispatch_flow_edit': {
                    templateUrl: 'views/dispatch/flow/flow_chart_edit.html',//流程图配置页面
                    controller: 'flowChartEditCtrl',
                },
                'config_edit_info@dispatch_flow_edit': {
                    templateUrl: 'views/dispatch/flow/flow_attribute_config_no.html',//流程图配置页面
                }
            },
            ncyBreadcrumb: {
                label: '新增流程',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('dispatch_flow_modify', { //修改流程。
            url: '/flow_modify/:flow_id/:version_id/:modify_flag',
            views: {
                '': { //此视图加载基本信息页面
                    templateUrl: 'views/dispatch/flow/flow_basic_new.html', //编辑基本信息页面
                    controller: 'flowBasicInfoEditCtrl',
                },
                'flow_new_info@dispatch_flow_modify': {
                    templateUrl: 'views/dispatch/flow/flow_chart_edit.html', //流程图配置页面
                    controller: 'flowChartEditCtrl',
                },
                'config_new_info@dispatch_flow_modify': {
                    templateUrl: 'views/dispatch/flow/flow_attribute_config_no.html',//流程图配置页面
                }
            },
            ncyBreadcrumb: {
                label: '修改流程',
                floor: 2,
            },
            menu_name: "调度",
        })
        .state('dispatch_flow_detail', { //查看流程。
            url: '/flow_detail/:flow_id/:version_id',
            views: {
                '': { //此视图加载基本信息页面
                    templateUrl: 'views/dispatch/flow/flow_basic_detail.html', //编辑基本信息页面
                    controller: 'flowBasicInfoDetailCtrl',
                },
                'flow_edit_info@dispatch_flow_detail': {
                    templateUrl: 'views/dispatch/flow/flow_chart_detail.html', //流程图配置页面
                    controller: 'flowChartDetailCtrl',
                },
                'config_edit_info@dispatch_flow_detail': {
                    templateUrl: 'views/dispatch/flow/flow_attribute_detail_no.html',//流程图配置页面
                }
            },
            ncyBreadcrumb: {
                label: '查看流程',
                floor: 2,
            },
            menu_name: "调度",
        })
        .state('dispatch_flow_copy', { //复制流程。
            url: '/flow_copy/:flow_id/:version_id',
            templateUrl: 'views/dispatch/flow/flow_basic_new.html', //编辑基本信息页面
            controller: 'flowBasicInfoCopyCtrl',
            ncyBreadcrumb: {
                label: '复制流程',
                floor: 2,
            },
            menu_name: "调度",
        })
        .state('dispatch_flow_edit.config', { //流程图配置页面下的属性配置页面
            params: {
                config_data: {},    //页面数据
                node_obj: {},       //节点数据
            },
            views: {
                'config_edit_info@dispatch_flow_edit': {
                    templateUrl: 'views/dispatch/flow/flow_attribute_config.html',
                    controller: 'flowAttributeCtrl'
                }
            },
            menu_name: "调度",
        })
        .state('dispatch_flow_edit.no_data', { //流程图配置页面下的属性配置暂无数据页面
            views: {
                'config_edit_info@dispatch_flow_edit': {
                    templateUrl: 'views/dispatch/flow/flow_attribute_config_no.html',
                    controller: 'flowAttributeDetailCtrl'
                }
            },
            menu_name: "调度",
        })
        .state('dispatch_flow_modify.config', { //流程图配置页面下的属性配置页面
            params: {
                config_data: {},    //页面数据
                node_obj: {},       //节点数据
            },
            views: {
                'config_new_info@dispatch_flow_modify': {
                    templateUrl: 'views/dispatch/flow/flow_attribute_config.html',
                    controller: 'flowAttributeCtrl'
                }
            },
            menu_name: "调度",
        })
        .state('dispatch_flow_modify.no_data', { //流程图配置页面下的属性配置暂无数据页面
            views: {
                'config_new_info@dispatch_flow_modify': {
                    templateUrl: 'views/dispatch/flow/flow_attribute_config_no.html',
                    controller: 'flowAttributeDetailCtrl'
                }
            },
            menu_name: "调度",
        })
        .state('dispatch_flow_detail.config', { //流程图配置页面下的属性配置页面
            params: {
                config_data: {},    //页面数据
                node_obj: {},       //节点数据
            },
            views: {
                'config_edit_info@dispatch_flow_detail': {
                    templateUrl: 'views/dispatch/flow/flow_attribute_config_detail.html',
                    controller: 'flowAttributeDetailCtrl'
                }
            },
            menu_name: "调度",
        })
        .state('dispatch_flow_detail.no_data', { //流程图配置页面下的属性配置暂无数据页面
            views: {
                'config_edit_info@dispatch_flow_detail': {
                    templateUrl: 'views/dispatch/flow/flow_attribute_detail_no.html',
                    controller: 'flowAttributeDetailCtrl'
                }
            },
            menu_name: "调度",
        })


        .state('dispatch_flow_list', { //流程列表
            url: '/dispatch_flow_list/:active_name',
            views: {
                '': {
                    templateUrl: 'views/dispatch/flow/flow_list.html',//流程列表--主页
                    controller: 'flowListCtrl'
                },
                'flow_info_view@dispatch_flow_list': {
                    templateUrl: 'views/dispatch/flow/flow_info.html',
                    controller: 'flowListInfoCtrl'
                }
            },
            ncyBreadcrumb: {
                label: 'App发布',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('dispatch_flow_list.flow_info', { //流程列表--具体流程的信息(点击列表中的数据显示对应的信息)
            url: '/:flow_id/:version_id/',
            views: {
                'flow_info_view@dispatch_flow_list': {
                    templateUrl: 'views/dispatch/flow/flow_info.html',
                    controller: 'flowListInfoCtrl'
                }
            },
            menu_name: "调度",
        })
        .state('dispatch_task_list', { //任务列表--主页
            url: '/dispatch_task_list',
            views: {
                '': {
                    templateUrl: 'views/dispatch/task/task_list.html',
                    controller: 'taskListCtrl',
                }
            },
            menu_name: "调度",
        })
        .state('dispatch_task_list.cur_task', { //任务列表--当前任务
            url: '/cur_task',
            views: {
                'task-table-view@dispatch_task_list': {
                    templateUrl: 'views/dispatch/task/task_cur_list.html',
                }
            },
            ncyBreadcrumb: {
                label: '任务列表',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('dispatch_task_list.his_task', { //任务列表--历史任务
            url: '/his_task',
            views: {
                'task-table-view@dispatch_task_list': {
                    templateUrl: 'views/dispatch/task/task_his_list.html',
                }
            },
            ncyBreadcrumb: {
                label: '任务列表',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('dispatch_task', { //任务执行。参数：taskId(任务id)
            url: '/task',
            templateUrl: 'views/dispatch/task/task_execute_module.html',
            controller: 'taskCommonCtrl',
            menu_name: "调度",
        })
        .state('dispatch_task.execute', { //任务执行。参数：taskId(任务id)
            url: '/execute/:task_id',
            views: {
                'basic_info@dispatch_task': {
                    templateUrl: 'views/dispatch/task/task_basic_info.html',
                    controller: 'taskBasicInfoCtrl'
                },
                'chart_info@dispatch_task': {
                    templateUrl: 'views/dispatch/task/task_chart.html',
                    controller: 'taskExecuteCtrl'
                }
            },
            ncyBreadcrumb: {
                label: '任务执行',
                floor: 2,
            },
            menu_name: "调度",
        })
        .state('dispatch_task.detail', { //任务查看。参数：taskId(任务id)，edit_flg(区分是执行还是查看)
            url: '/detail/:task_id',
            views: {
                'basic_info@dispatch_task': {
                    templateUrl: 'views/dispatch/task/task_basic_info.html',
                    controller: 'taskBasicInfoCtrl'
                },
                'chart_info@dispatch_task': {
                    templateUrl: 'views/dispatch/task/task_chart_detail.html',
                    controller: 'taskExecuteDetailCtrl'
                }
            },
            ncyBreadcrumb: {
                label: '任务查看',
                floor: 2,
            },
            menu_name: "调度",
        })
        //任务监控单独页面
        .state('dispatch_task_preview', { //任务概览--主页
            url: '/dispatch_task_preview',
            templateUrl: 'views/dispatch/task/task_preview.html',
            controller: 'taskPreviewCtrl',
            menu_name: "调度",
        })
        .state('dispatch_task_preview.task_all', { //任务概览--全行
            url: '/task_all',
            templateUrl: 'views/dispatch/task/task_preview_all.html',
            ncyBreadcrumb: {
                label: '任务概览',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('dispatch_task_preview.task_attention', { //任务概览--关注
            url: '/task_attention',
            templateUrl: 'views/dispatch/task/task_preview_attention.html',
            ncyBreadcrumb: {
                label: '任务概览',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('dispatch_task_preview.task_node', { //任务概览--节点
            url: '/task_node',
            templateUrl: 'views/dispatch/task/task_preview_node.html',
            ncyBreadcrumb: {
                label: '任务概览',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('dispatch_scene_new', { //新增场景
            url: '/dispatch_scene_new',
            templateUrl: 'views/dispatch/scene/scene_new.html',
            controller: 'sceneNewCtrl',
            ncyBreadcrumb: {
                label: '服务开发',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('dispatch_scene_list', { //场景列表
            url: '/dispatch_scene_list',
            views: {
                '': {
                    templateUrl: 'views/dispatch/scene/scene_list.html',
                    controller: 'sceneListCtrl'
                },
                'table_view@dispatch_scene_list': {
                    templateUrl: 'views/dispatch/scene/scene_table.html',//场景列表--表格
                },
                'scene_info_view@dispatch_scene_list': {
                    templateUrl: 'views/dispatch/scene/scene_table_info.html',//场景列表--场景信息
                    controller: 'singleSceneInfoCtrl'
                }
            },
            ncyBreadcrumb: {
                label: '服务总览',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('dispatch_scene_list.single_scene', {    //场景列表--场景信息
            url: '/single_scene/:scene_id/:private_flag',
            views: {
                'scene_info_view@dispatch_scene_list': {
                    templateUrl: 'views/dispatch/scene/scene_table_info.html',
                    controller: 'singleSceneInfoCtrl'
                }
            },
            menu_name: "调度",
        })
        .state('dispatch_scene_modify', { //修改场景。参数：sceneId(场景id)
            url: '/dispatch_scene_modify/:scene_id',
            templateUrl: 'views/dispatch/scene/scene_new.html',
            controller: 'sceneModifyCtrl',
            ncyBreadcrumb: {
                label: '修改App',
                floor: 2,
            },
            menu_name: "调度",
        })
        .state('dispatch_scene_detail', { //查看场景。参数：sceneId(场景id)
            url: '/dispatch_scene_detail/:scene_id',
            templateUrl: 'views/dispatch/scene/scene_detail.html',
            controller: 'sceneDetailCtrl',
            ncyBreadcrumb: {
                label: '查看场景',
                floor: 2,
            },
            menu_name: "调度",
        })
        .state('dispatch_strategy_list', { //策略组列表
            url: '/dispatch_strategy_list',
            views: {
                '': {
                    templateUrl: 'views/dispatch/other/strategy_list.html',
                    controller: 'strategyListCtrl',
                },
                'table_view@dispatch_strategy_list': {
                    template: '<dispatch-strategy-list></dispatch-strategy-list>',
                },
            },
            ncyBreadcrumb: {
                label: '策略组列表',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('dispatch_strategy_detail', { //策略组查看。参数：strategyId(策略组的id)
            url: '/dispatch_strategy_detail/:strategy_id',
            templateUrl: 'views/dispatch/other/strategy_detail.html',
            controller: 'strategyDetailCtrl',
            ncyBreadcrumb: {
                label: '策略组查看',
                floor: 2,
            },
            menu_name: "调度",
        })
        .state('dispatch_report_list', { //报表
            url: '/dispatch_report_list',
            templateUrl: 'views/dispatch/other/report_list.html',
            controller: 'reportListCtrl',
            ncyBreadcrumb: {
                label: '报表',
                floor: 1,
            },
            menu_name: "调度",
        })
        .state('flow_factmode_devzone',{
            url: '/flow_factmode_devzone',
            templateUrl: 'views/public/flow/flow_factmode_devzone.html',
            controller: 'factmodeDevzoneCtrl',
            ncyBreadcrumb: {
                label: '开发区(Dev)',
                floor: 1
            },
            menu_name: "工厂建模",
        })
        .state('flow_factmode_devzone.config',{
            params: {
                config_data: {},    //页面数据
                node_obj: {},       //节点数据
            },
            views: {
                'config_devzone_info@flow_factmode_devzone': {
                    templateUrl: 'views/dispatch/flow/flow_attribute_config.html',
                    controller: 'flowAttributeCtrl'
                }
            },
            menu_name: "工厂建模",
        })
        .state('appStore', {
            url: '/appStore/:sdflow_type',
            ncyBreadcrumb: {
                label: '应用商店',
                floor: 1,
            },
            templateUrl: 'views/public/appStore/appStore.html',
            controller: 'appListCtrl',
            menu_name: "应用商店",
        })
        .state('app_aps', {
            url: '/appAps',
            ncyBreadcrumb: {
                label: '智能排程',
                floor: 2,
            },
            templateUrl: 'views/public/appStore/app_aps.html',
            controller: 'appApsCtrl',
            menu_name: "应用商店",
        })
        // .state("flow_factmode_devzone", {//组件列表
        //     url: '/flow_factmode_devzone',
        //     // templateUrl: 'views/public/flow/flow_factmode_devzone.html',
        //     // controller: 'factmodeDevzoneCtrl',
        //     // ncyBreadcrumb: {
        //     //     label: '开发区(Dev)',
        //     //     floor: 1
        //     // },
        //     // menu_name: "工厂建模",
        //     views:{
        //         '':{
        //             templateUrl: 'views/public/flow/flow_factmode_devzone.html',
        //             controller: 'factmodeDevzoneCtrl',
        //         },
        //         'flow_new_info@dispatch_flow_modify': {
        //             templateUrl: 'views/dispatch/flow/flow_chart_edit.html', //流程图配置页面
        //             controller: 'flowChartEditCtrl',
        //         },
        //         'config_new_info@dispatch_flow_modify': {
        //             templateUrl: 'views/dispatch/flow/flow_attribute_config_no.html',//流程图配置页面
        //         }
        //     },
        //     ncyBreadcrumb: {
        //         label: '创建模型',
        //         floor: 2,
        //     },
        //     menu_name: "工厂建模",
        // })
}]);

