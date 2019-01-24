//发布申请控制器
var releaseAppCtrl = angular.module('ReleaseApplicationController', []);

/**
 *发布申请
 * */
releaseAppCtrl.controller('pubApplicationCtrl', ["$scope", "$state", "$stateParams", "$timeout", "$sce", "BusiSys", "Project", "CmptFunc", "BsysFunc", "PubWindow", "CodeMirrorOption", "ProtocolType", "ScrollConfig", "Modal", "CV", function($scope, $state, $stateParams, $timeout, $sce, BusiSys, Project, CmptFunc, BsysFunc, PubWindow, CodeMirrorOption, ProtocolType, ScrollConfig,  Modal, CV) {
    //页面对象
    $scope.info = {
        apply_info : {
            pjpublish_name: '',//申请名称
            pjpublish_type : 1,   // 申请发布类型
            pjpublish_date : '',  //申请发布日期
            pjpublish_time : '',  //申请发布时间
            pjpublish_desc : '',  //申请发布说明
            publish_win_id : '',  //发布窗口编号
            execute_type : 1,     //发布执行方式
            pjpublish_project_list:[] //提交的项目列表
        },
        publish_proj_list : [], //全部项目列表
        pjpublish_manager:'',
        publish_minute : '00',
        publish_hour : 18,
        publish_date_type: 2,   //发布日期选择
        time_err_msg : ''
    };
    //配置对象
    $scope.config = {
        scroll_sys_info : ScrollConfig,
        data_picker_max_date : new Date()            //日期控件最大日期
    };
    //页面数据
    $scope.data = {
        user_list : [], //用户列表
        window_list : [] //上线窗口
    };
    //控制
    $scope.control = {
        start_opened : false,   //日期控件
        save_btn_loading : false//保存按钮
    };
    var init = function () {
        //获取上线窗口
        PubWindow.getPubWindowList(1).then(function (data) {
            $scope.data.window_list = data.window_list || [];
            if($scope.data.window_list.length == 0){
                $scope.info.publish_date_type = 2;
            }
        },function (error) {
            Modal.alert(error.message,3);
        });
    };
    //选择发布窗口
    $scope.choosePubWindow = function (selectK,selectV) {
        $scope.info.apply_info.pjpublish_date = selectV;
    };
    //显示日期控件
    $scope.open = function (flag,e) {
        $scope.control.start_opened = (flag==1) ? true : false;
        e.stopPropagation();
    };
    //添加项目
    $scope.addProject = function (sys_name,cn_name) {
       Modal.releaseAddProject().then(function (data) {
            var _temp_list = data;
            var _proj_list = $scope.info.publish_proj_list;
            var _proj_list_length = _proj_list.length;
            if(_proj_list.length ==0){
                $scope.info.publish_proj_list = _temp_list;
            }else {
                for(var i=0; i< _temp_list.length; i++){
                    for(var j = 0; j< _proj_list_length; j++){
                        if(_temp_list[i].project_id == _proj_list[j].project_id){
                            break;
                        }else if(_temp_list[i].project_id != _proj_list[j].project_id && j == _proj_list_length-1){
                            _proj_list.push(_temp_list[i]);
                        }
                    }
                }
            }
       })
    };
    //删除项目
    $scope.deleteProj = function (index,e) {
        e.stopPropagation();
        Modal.confirm("确认删除当前项目？").then(function (choose) {
            if(choose){
                $scope.info.publish_proj_list.splice(index,1);
            }
        })
    };
    //格式化
    $scope.fmtPublishDate = function () {
        $scope.control.start_opened = false;
        if($scope.info.apply_info.pjpublish_date){
            $scope.info.apply_info.pjpublish_date = CV.dtFormat($scope.info.apply_info.pjpublish_date);
        }
    };
    //项目勾选系统
    $scope.checkSystem = function (sys) {
        if(sys.sys_used_flag!=2){
            sys.checked=!sys.checked
        }
    };
    //保存
    $scope.formSubmit = function () {
        $scope.info.apply_info.pjpublish_project_list = [];
        if(!CV.valiForm($scope.application_form)){
            return false;
        }
        if($scope.info.publish_proj_list.length==0){
            Modal.alert('请添加项目!');
            return;
        }
        $scope.control.save_btn_loading = true;
        for(var k =0; k< $scope.info.publish_proj_list.length; k++){
            var _obj = {
                project_id : $scope.info.publish_proj_list[k].project_id,
                project_name : $scope.info.publish_proj_list[k].project_name,
                project_desc : $scope.info.publish_proj_list[k].project_desc,
                business_sys_list: []
            };
            var _sys_list = $scope.info.publish_proj_list[k].business_sys_list || [];
            for(var i =0; i< _sys_list.length; i++){
                if(!_sys_list[i].checked && _sys_list[i].sys_used_flag!=2){
                    _obj.business_sys_list.push(_sys_list[i]);
                }
            }
            if(_obj.business_sys_list.length==0){
                Modal.alert('项目'+_obj.project_name+'应至少选择一个系统！');
                $scope.control.save_btn_loading = false;
                return;
            }
            $scope.info.apply_info.pjpublish_project_list.push(_obj);
        }
        $scope.info.apply_info.pjpublish_date = CV.dtFormat($scope.info.apply_info.pjpublish_date);
        $scope.info.apply_info.pjpublish_time = [parseInt($scope.info.publish_hour) < 10 ? '0'+ "" +parseInt($scope.info.publish_hour):parseInt($scope.info.publish_hour) ,':', parseInt($scope.info.publish_minute) < 10 ? '0'+""+ parseInt($scope.info.publish_minute):parseInt($scope.info.publish_minute)].join('');
        var _apply_info = angular.extend({},$scope.info.apply_info);
        _apply_info.pjpublish_date = CV.dtFormat($scope.info.apply_info.pjpublish_date);  //申请发布日期
        _apply_info.publish_win_id = $scope.info.publish_date_type==1 ? $scope.info.apply_info.publish_win_id : null;//发布窗口编号
        Project.applyRelease(_apply_info).then(function (data) {
            $state.go('pub_application_list');
            $scope.control.save_btn_loading = false;
        },function (error) {
            $scope.control.save_btn_loading = false;
            Modal.alert(error.message,3);
        })
    };
    //取消
    $scope.formcancel = function () {
        $state.go('pub_application_list')
    };
    init();
}]);

/**
 *发布申请修改
 * */
releaseAppCtrl.controller('updatePubApplicationCtrl', ["$scope", "$state", "$stateParams", "$timeout", "$sce", "BusiSys", "Project", "CmptFunc", "BsysFunc", "PubWindow", "CodeMirrorOption", "ProtocolType", "ScrollConfig", "Modal", "CV", function($scope, $state, $stateParams, $timeout, $sce, BusiSys, Project, CmptFunc, BsysFunc, PubWindow, CodeMirrorOption, ProtocolType, ScrollConfig,  Modal, CV) {
    var _pjpublish_id = $stateParams.pjpublish_id;
    //页面对象
    $scope.info = {
        apply_info : {
            pjpublish_name: '',//申请名称
            pjpublish_type : 1,   // 申请发布类型
            pjpublish_date : '',  //申请发布日期
            pjpublish_time : '',  //申请发布时间
            pjpublish_desc : '',  //申请发布说明
            publish_win_id : '',  //发布窗口编号
            execute_type : 1,     //发布执行方式
            pjpublish_project_list:[] //提交的项目列表
        },
        publish_proj_list : [], //全部项目列表
        pjpublish_manager:'',
        publish_minute : '00',
        publish_hour : 18,
        publish_date_type: 2,   //发布日期选择
        time_err_msg : ''
    };
    //配置对象
    $scope.config = {
        scroll_sys_info : ScrollConfig,
        data_picker_max_date : new Date()            //日期控件最大日期
    };
    //页面数据
    $scope.data = {
        user_list : [], //用户列表
        window_list : [] //上线窗口
    };
    //控制
    $scope.control = {
        start_opened : false,   //日期控件
        save_btn_loading : false,//保存按钮
    };
    var init = function () {
        //获取上线窗口
        PubWindow.getPubWindowList(1).then(function (data) {
            $scope.data.window_list = data.window_list || [];
            if($scope.data.window_list.length == 0){
                $scope.info.publish_date_type = 2;
            }
        },function (error) {
            Modal.alert(error.message,3);
        });
        //查看申请信息
        Project.viewReleaseApply(_pjpublish_id).then(function (data) {
           $timeout(function () {
               if(data){
               var _publish_minute = parseInt(data.publish_bean.pjpublish_time.split(':')[1]);
               $scope.info.apply_info.pjpublish_name = data.publish_bean.pjpublish_name;
               $scope.info.apply_info.pjpublish_desc = data.publish_bean.pjpublish_desc;
               $scope.info.apply_info.execute_type = data.publish_bean.execute_type;
               $scope.info.apply_info.pjpublish_id = data.publish_bean.pjpublish_id;
               $scope.info.apply_info.publish_win_id = data.publish_bean.publish_win_id;
               $scope.info.publish_date_type = data.publish_bean.publish_win_id ? 1 : 2;
               $scope.info.apply_info.pjpublish_date = data.publish_bean.pjpublish_date;
               $scope.info.apply_info.pjpublish_time = data.publish_bean.pjpublish_time;      //申请发布时间
               $scope.info.publish_hour = parseInt(data.publish_bean.pjpublish_time.split(':')[0]);
               $scope.info.publish_minute = _publish_minute <10 ? '0'+_publish_minute : _publish_minute;
               $scope.info.publish_proj_list = data.publish_bean.pjpublish_project_list || [];
               for(var k =0; k< $scope.info.publish_proj_list.length; k++){
                   var _sys_list = $scope.info.publish_proj_list[k].business_sys_list || [];
                   for(var i =0; i< _sys_list.length; i++){
                       if(_sys_list[i].sys_used_flag ==1){
                           _sys_list[i].checked = true;
                       }
                   }
               }
               }
           },0)
        },function (error) {
            Modal.alert(error.message,3);
        })
    };
    //选择发布窗口
    $scope.choosePubWindow = function (selectK,selectV) {
        $scope.info.apply_info.pjpublish_date = selectV;
    };
    //显示日期控件
    $scope.open = function (flag,e) {
        $scope.control.start_opened = (flag==1) ? true : false;
        e.stopPropagation();
    };
    //添加项目
    $scope.addProject = function (sys_name,cn_name) {
        Modal.releaseAddProject().then(function (data) {
            var _temp_list = data;
            var _proj_list = $scope.info.publish_proj_list;
            var _proj_list_length = _proj_list.length;
            if(_proj_list.length ==0){
                $scope.info.publish_proj_list = _temp_list;
            }else {
                for(var i=0; i< _temp_list.length; i++){
                    for(var j = 0; j< _proj_list_length; j++){
                        if(_temp_list[i].project_id == _proj_list[j].project_id){
                            break;
                        }else if(_temp_list[i].project_id != _proj_list[j].project_id && j == _proj_list_length-1){
                            _proj_list.push(_temp_list[i]);
                        }
                    }
                }
            }
        })
    };
    //删除项目
    $scope.deleteProj = function (index,e) {
        e.stopPropagation();
        Modal.confirm("确认删除当前项目？").then(function (choose) {
            if(choose){
                $scope.info.publish_proj_list.splice(index,1);
            }
        })
    };
    //格式化
    $scope.fmtPublishDate = function () {
        $scope.control.start_opened = false;
        if($scope.info.apply_info.pjpublish_date){
            $scope.info.apply_info.pjpublish_date = CV.dtFormat($scope.info.apply_info.pjpublish_date);
        }
    };
    //项目勾选系统
    $scope.checkSystem = function (sys) {
        if(sys.sys_used_flag!=2){
            sys.checked=!sys.checked
        }
    };
    //保存
    $scope.formSubmit = function () {
        $scope.info.apply_info.pjpublish_project_list = [];
        if(!CV.valiForm($scope.application_form)){
            return false;
        }
        if($scope.info.publish_proj_list.length==0){
            Modal.alert('请添加项目!');
            return;
        }
        $scope.control.save_btn_loading = true;
        for(var k =0; k< $scope.info.publish_proj_list.length; k++){
            var _obj = {
                project_id : $scope.info.publish_proj_list[k].project_id,
                project_name : $scope.info.publish_proj_list[k].project_name,
                project_desc : $scope.info.publish_proj_list[k].project_desc,
                business_sys_list: []
            };
            var _sys_list = $scope.info.publish_proj_list[k].business_sys_list || [];
            for(var i =0; i< _sys_list.length; i++){
                if(!_sys_list[i].checked && _sys_list[i].sys_used_flag!=2){
                    _obj.business_sys_list.push(_sys_list[i]);
                }
            }
            if(_obj.business_sys_list.length==0){
                Modal.alert('项目'+_obj.project_name+'应至少选择一个系统！');
                $scope.control.save_btn_loading = false;
                return;
            }
            $scope.info.apply_info.pjpublish_project_list.push(_obj);
        }
        $scope.info.apply_info.pjpublish_date = CV.dtFormat($scope.info.apply_info.pjpublish_date);
        $scope.info.apply_info.pjpublish_time = [parseInt($scope.info.publish_hour) < 10 ? '0'+ "" +parseInt($scope.info.publish_hour):parseInt($scope.info.publish_hour) ,':', parseInt($scope.info.publish_minute) < 10 ? '0'+""+ parseInt($scope.info.publish_minute):parseInt($scope.info.publish_minute)].join('');
        var _apply_info = angular.extend({},$scope.info.apply_info);
        _apply_info.pjpublish_date = CV.dtFormat($scope.info.apply_info.pjpublish_date);  //申请发布日期
        _apply_info.publish_win_id = $scope.info.publish_date_type==1 ? $scope.info.apply_info.publish_win_id : null;//发布窗口编号
        Project.applyRelease(_apply_info).then(function (data) {
            $state.go('pub_application_list');
            $scope.control.save_btn_loading = false;
        },function (error) {
            $scope.control.save_btn_loading = false;
            Modal.alert(error.message,3);
        })
    };
    //取消
    $scope.formcancel = function () {
        $state.go('pub_application_list')
    };
    init();
}]);

/**
 * 发布申请列表
 * **/
pCtrl.controller('pubApplicationListCtrl', ["$scope", "$state", "$stateParams", "$timeout", "Project", "ProjectStatus", "ProjectReleaseType","ScrollBarConfig", "Modal", "CV", function($scope, $state, $stateParams, $timeout, Project, ProjectStatus, ProjectReleaseType,ScrollBarConfig, Modal, CV) {
    var _status = [];//全局状态控制
    //页面信息
    $scope.info = {
        error_msg : '', //错误信息
        project_info : {},  //项目信息
        project_info_his:{},
        apply_list : [],    //申请信息列表
        history_apply_list : [],     //历史申请列表
        history_app_index : 0,
        apply_release_list:[],
        apply_release_history_list: [],//申请历史列表
        project_id : $stateParams.project_id || '', //项目查看使用
    };
    //页面数据
    $scope.data = {
        release_type : ProjectReleaseType ,   //发布状态
        project_status : ProjectStatus        //项目状态
    };
    //页面控制
    $scope.control = {
        project_list_loading : false,
        project_history_list_loading: false,
        active_index : 0, //当前选中项目序号
        active_his_index : 0,
        his_list_flag: $stateParams.his_list_flag,  //是否是历史申请列表标志
        apply_sys_loading : false,//申请信息系统加载
        apply_his_sys_loading : false,//申请信息系统加载
        view_proj_app_flag: $scope.proj_detail_app_flag
    };
    //页面滚动条
    $scope.config = {
        sys_scroll : ScrollBarConfig.Y(),
        project_scroll:ScrollBarConfig.Y(),
        page_option :  {
            limit_recd:10,
            curr: 1, //当前页数
            all_recd: 10, //总数目
            count: 8, //最多显示的页数，默认为10
            // 点击页数的回调函数，参数page为点击的页数
            click: function (page) {
                getHisList(page)
            }
        }
    };

    var init = function() {
        if($scope.control.his_list_flag){
            getHisList(1)
        }else {
            getList();
        }
    };

    //申请列表
    var getList = function () {
        $scope.info.error_msg = '';
        $scope.control.project_list_loading = true;
        Project.getApplyReleaseList($scope.info.project_id).then(function (data) {
            $timeout(function () {
                $scope.info.apply_release_list = data.pjpublish_list || [];
                getProjectBasicInfo($scope.control.active_index);
                $scope.control.project_list_loading = false;
            },0)
        },function (error) {
            $scope.control.project_list_loading = false;
            $scope.info.error_msg = error.message;
        });
    };
    //历史申请列表
    var getHisList = function (_page) {
        var _param ={
            limit_recd: $scope.config.page_option.limit_recd,
            project_id: $scope.info.project_id,
            start_recd: $scope.config.page_option.limit_recd *(_page-1)
        };
        $scope.info.error_his_msg = '';
        $scope.control.project_history_list_loading =true;
        $scope.info.apply_release_history_list =[];
        $scope.control.active_his_index = 0;
        Project.getApplyReleaseHistoryList(_param).then(function (data) {
            $timeout(function () {
                $scope.config.page_option.all_recd = data.all_recd;
                $scope.info.apply_release_history_list = data.pjpublish_list || [];
                getProjectBasicHisInfo($scope.control.active_his_index);
                $scope.control.project_history_list_loading = false;
            },0)
        },function (error) {
            $scope.control.project_history_list_loading = false;
            $scope.info.error_his_msg = error.message;
        })
    };
    //项目信息
    var getProjectBasicInfo = function (index) {
        $scope.info.project_info = $scope.info.apply_release_list[index];
    };
    var getProjectBasicHisInfo = function (index) {
        $scope.info.project_info_his = $scope.info.apply_release_history_list[index];
    };
    //选中当前项目
    $scope.chooseProject = function (index,flag) {
        if(flag){
            $scope.control.active_index = index;
            getProjectBasicInfo($scope.control.active_index);
        }else {
            $scope.control.active_his_index = index;
            getProjectBasicHisInfo($scope.control.active_his_index)
        }
    };
    //获取枚举值
    $scope.getEnumValue = function (key, _list) {
        return CV.findValue(key,_list);
    };
    //跳转发布申请页面
    $scope.goToApplication = function(id){
        $state.go('pub_application',{project_id:id});
    };
    //跳转发布查看页面
    $scope.goToPubDetail = function(sys){
        $state.go('proj_detail_pre',{publish_id:sys.syspublish_id,sys_id:sys.business_sys_name})
    };
    //修改申请
    $scope.updateApplication = function (id,project_id) {
        $state.go('pub_application_update',{pjpublish_id:id,project_id:project_id});
    };
    //撤销申请
    $scope.deleteApplication = function (id) {
        Modal.confirm("确认撤销申请？").then(function () {
            Project.deleteReleaseApply(id).then(function (data) {
                if(data){
                    Modal.alert('撤销成功',2);
                    getList();
                }
            },function (error) {
                Modal.alert(error.message,3);
            })
        })
    };
    //重启发布申请
    $scope.reBootPublish = function(id){
        Modal.confirm("请确认是否重启该发布申请？").then(function (data) {
            if(data){
                //这里调服务
                Project.reBootPjpublish(id).then(function (data) {
                    if(data){
                        Modal.alert('重启成功',2);
                        getHisList(1)
                    }
                },function (error) {
                    Modal.alert(error.message,3)
                })
            }
        })
    };
    //跳转计划编列
    $scope.goToPlanSys = function(publish_id){
        $state.go('plan_sys_set',{publish_id:publish_id});
    };
    //动态计算左右两边的高度
    $scope.syncHeight = function () {
        var _offset_top =  $scope.control.view_proj_app_flag ?  100 : 30;
        return {
            'height' : $('.ui-view-content').height() - _offset_top //(110：容器距离顶部的高度+内边距)
        }
    };
    //动态计算项目区域的高度
    $scope.syncSysHeight = function(a){
        a = $scope.control.view_proj_app_flag ? 0 : a;
        return {
            'height' : $('.proj-content').height() - 85-a //(185 ： 基本信息的高度和下面按钮的高度)
        }
    };
    $(window).resize(function () {
        $timeout(function () {
            $scope.syncHeight();
            $scope.syncSysHeight();
        },50);
    });
    init();
}]);
