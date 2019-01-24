'use strict';

//项目控制器
var pCtrl = angular.module('ProjController', []);
/**
 *项目登记
 * */
pCtrl.controller('projectRegisterCtrl', ["$scope", "$timeout", "$state", "$stateParams", "ScrollBarConfig", "Project", "BusiSys", "LetterNavList", "Modal", "CV", function($scope, $timeout, $state, $stateParams, ScrollBarConfig, Project, BusiSys, LetterNavList, Modal, CV) {
    //页面控制对象
    $scope.control = {
        show_config_div : false,//责任人配置弹窗显示标志
        user_exsit : false,      //有无责任人标志
        sys_keyword:'', //系统搜索关键字
    };
    //数据对象
    $scope.info = {
        project_id:'',//项目编号
        project_name:'',//项目名称
        project_desc:'',//项目描述
        project_scale:1,//项目规模
        project_managers:[],//项目责任人列表
        error_message    :'',//错误信息
        project_sys_list:[]  //项目系统列表
    };
    //备选数据
    $scope.data = {
        user_list       : [], //用户责任人列表
        dept_user_list  : [], //部门用户列表
        sys_list        : [], //系统列表
        screen_sys_list : [], //筛选系统列表
        letter_nav_list : angular.copy(LetterNavList), //字母导航列表
    };
    //配置数据
    $scope.config = {
        dept_wrap_scroll :ScrollBarConfig.Y(),
        people_wrap_scroll: ScrollBarConfig.Y(),
    };

    //初始化部门用户数据
    var initDeptUserData = function (list) {
        for(var i = 0 ;i< list.length; i++){
            var _dept =list[i];
            _dept.is_check = false;
            list[0].is_check = true;
            _dept.user_list = _dept.user_list || [];
            for(var j = 0 ;j<_dept.user_list.length;j++){
                var _user = _dept.user_list[j];
                _user.check_flag = false;
            }
        }
    };
    //提取选中的部门人员
    var getCheckedDeptUser = function (list) {
        var _list = [];
        for(var i = 0 ;i< list.length; i++){
            var _dept =list[i];
            _dept.user_list = _dept.user_list || [];
            for(var j = 0 ;j<_dept.user_list.length;j++){
                var _user = _dept.user_list[j];
                if(_user.check_flag){
                    _list.push({dept_cn_name:_dept.dept_cn_name,dept_id:_dept.dept_id,user_id:_user.user_id,user_cn_name:_user.user_cn_name})
                }
            }
        }
        return _list;
    };
    //至少选择一个责任人
    var validDeptUser = function (list) {
        for(var i = 0 ;i< list.length; i++){
            var _dept =list[i];
            if(_dept.user_list){
                for(var j = 0 ;j<_dept.user_list.length;j++){
                    var _user = _dept.user_list[j];
                    if(_user.check_flag){
                        return true
                    }
                }
            }
        }
        return false;
    };
    //数组中对象去重
    var arrayUnique = function(arr, name) {
        var hash = {};
        return arr.reduce(function (item, next) {
            hash[next[name]] ? '' : hash[next[name]] = true && item.push(next);
            return item;
        }, []);
    };
    //同步负责人选中状态
    var syncUserChecked = function () {
        for (var i = 0; i < $scope.data.user_list.length; i++) {
            var _checked_user =  $scope.data.user_list[i];
            for (var j = 0; j < $scope.data.dept_user_list.length; j++) {
                var _dept = $scope.data.dept_user_list[j];
                _dept.user_list = _dept.user_list || [];
                for (var k = 0; k < _dept.user_list.length; k++) {
                    var _user = _dept.user_list[k];
                    if (_user.user_id.trim() === _checked_user.user_id.trim()) {
                        _user.check_flag = true;
                    }
                }
            }
        }
    };
    //初始化方法
    var init = function() {
        //得到责任人列表
        Project.getAllExcutedUser().then(function(data){
            $scope.data.dept_user_list = data.dept_user_list ? data.dept_user_list :[];
            initDeptUserData($scope.data.dept_user_list)
        },function(error){
            $scope.info.error_message = error.message;
        });
        //获取所有的系统列表
        BusiSys.getAllBusinessSys(false).then(function (data){
            $timeout(function() {
                if(data){
                    $scope.data.sys_list = data.list_bs || [];

                    for (var i = 0; i < $scope.data.sys_list.length; i++) {
                        var _sys =  $scope.data.sys_list[i];
                        var _initial_list = PinYin.toPyInitial(_sys.business_cn_name || ''); //转换成拼音首字母
                        _sys.letter = _initial_list[0].charAt(0).toUpperCase();
                        if(!/[A-Z]/.test(_sys.letter)) _sys.letter = '#';
                        for (var j = 0; j < $scope.data.letter_nav_list.length; j++) {
                            var _letter =  $scope.data.letter_nav_list[j];
                            if (_sys.letter === _letter.letter){
                                _letter.checked_count = 0;
                                _letter.list.push({
                                    sys_name : _sys.business_sys_name,
                                    sys_cn_name : _sys.business_cn_name,
                                });
                            }
                        }
                    }
                    $scope.data.screen_sys_list = $scope.data.letter_nav_list.filter(function (item){return item.list.length > 0});
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message,3);
        });
    };
    //配置负责人
    $scope.configProjectUser = function () {
        $scope.control.show_config_div = !$scope.control.show_config_div;
        if($scope.control.show_config_div){ syncUserChecked(); }
    };
    //切换部门
    $scope.switchDept = function(dept,list){
        for(var i = 0 ;i< list.length; i++){
            var _dept =list[i];
            _dept.is_check = false;
        }
        dept.is_check = true;
    };
    //隐藏责任人配置窗体并初始化数据
    $scope.hideConfig = function(){
        $scope.control.show_config_div = false;
        initDeptUserData($scope.data.dept_user_list)
    };
    //保存责任人
    $scope.saveResponseUser = function(){
        if(!validDeptUser($scope.data.dept_user_list)){
            Modal.alert('至少选择一个项目负责人！',3);
            return false;
        }
        $scope.data.user_list = [];
        $scope.data.user_list = $scope.data.user_list.concat(getCheckedDeptUser($scope.data.dept_user_list));
        $scope.data.user_list = arrayUnique($scope.data.user_list,'user_id');
        $scope.control.user_exsit = false;
        $scope.control.show_config_div = false;
        initDeptUserData($scope.data.dept_user_list)
    };
    //删除责任人
    $scope.deleteUser = function(index){
        $scope.data.user_list.splice(index,1)
    };
    //选择系统
    $scope.checkSys = function (letter,sys) {
        sys.checked = !sys.checked;
        if(sys.checked){
            letter.checked_count++;
            $scope.info.project_sys_list.push({
                business_sys_name : sys.sys_name,
            });
        } else {
            letter.checked_count--;
            $scope.info.project_sys_list.pop();
        }
    };
    //
    //保存项目信息
    $scope.formSubmit = function() {
        //表单验证
        if(!CV.valiForm($scope.proj_form)) {
            $scope.control.sava_btn_loading = false;
            return false;
        }
        if($scope.data.user_list.length == 0){
            $scope.control.user_exsit = true;
            $scope.control.sava_btn_loading = false;
            return false;
        }
        if($scope.info.project_sys_list.length === 0){
            Modal.alert('请选择应用系统',1);
            return false;
        }
        //提取执行用户ID组
        $scope.info.project_managers = [];
        for(var i =0;i< $scope.data.user_list.length;i++){
            $scope.info.project_managers.push($scope.data.user_list[i].user_id);
        }
        $scope.info.project_scale = parseInt($scope.info.project_scale);
        //新增
        $scope.control.sava_btn_loading = true;
        Project.addProj($scope.info).then(function (data) {
            if (data) {
                $scope.control.sava_btn_loading = false;
                Modal.alert("项目保存成功！",2);
                $state.go("proj_list");
            }
        }, function (error) {
            $scope.control.sava_btn_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //取消
    $scope.formCancel = function() {
        $state.go("proj_list");
    };
    init();
}]);
/**
 修改项目
 * */
pCtrl.controller('projectRegisterModifyCtrl', ["$scope", "$timeout", "$state", "$stateParams", "ScrollBarConfig", "Project", "BusiSys", "LetterNavList", "User", "Modal", "CV", function($scope, $timeout, $state, $stateParams, ScrollBarConfig, Project, BusiSys, LetterNavList, User, Modal, CV) {
    var _project_id = $stateParams.project_id;

    //页面控制对象
    $scope.control = {
        update_flag : true ,     //修改标志
        show_config_div : false,//责任人配置弹窗显示标志
        user_exsit : false,      //有无责任人标志
        sys_keyword:'', //系统搜索关键字
    };
    //数据对象
    $scope.info = {
        project_id : '',//项目编号
        project_name : '',//项目名称
        project_status : '',//项目状态
        project_desc : '',//项目描述
        project_scale : 1,//项目规模
        project_managers : [],//项目责任人列表
        error_message    : '',//错误信息
        project_sys_list : []
    };
    //备选数据
    $scope.data = {
        user_list      :[],//用户责任人列表
        all_user_list : [],
        dept_user_list :[], //部门用户列表
        sys_list       :[],
        screen_sys_list:[],
        letter_nav_list : angular.copy(LetterNavList), //字母导航列表
    };
    //配置数据
    //配置数据
    $scope.config = {
        dept_wrap_scroll :ScrollBarConfig.Y(),
        people_wrap_scroll: ScrollBarConfig.Y(),
    };

    //初始化部门用户数据
    var initDeptUserData = function (list) {
        for(var i = 0 ;i< list.length; i++){
            var _dept =list[i];
            _dept.is_check = false;
            list[0].is_check = true;
            _dept.user_list = _dept.user_list || [];
            for(var j = 0 ;j<_dept.user_list.length;j++){
                var _user = _dept.user_list[j];
                _user.check_flag = false;
                $scope.data.all_user_list.push(_user);
            }
        }
    };
    //提取选中的部门人员
    var getCheckedDeptUser = function (list) {
        var _list = [];
        for(var i = 0 ;i< list.length; i++){
            var _dept =list[i];
            _dept.user_list = _dept.user_list || [];
            for(var j = 0 ;j<_dept.user_list.length;j++){
                var _user = _dept.user_list[j];
                if(_user.check_flag){
                    _list.push({dept_cn_name:_dept.dept_cn_name,dept_id:_dept.dept_id,user_id:_user.user_id,user_cn_name:_user.user_cn_name})
                }
            }
        }
        return _list;
    };
    //至少选择一个责任人
    var validDeptUser = function (list) {
        for(var i = 0 ;i< list.length; i++){
            var _dept =list[i];
            if(_dept.user_list){
                for(var j = 0 ;j<_dept.user_list.length;j++){
                    var _user = _dept.user_list[j];
                    if(_user.check_flag){
                        return true
                    }
                }
            }
        }
        return false;
    };
    //数组中对象去重
    var arrayUnique = function(arr, name) {
        var hash = {};
        return arr.reduce(function (item, next) {
            hash[next[name]] ? '' : hash[next[name]] = true && item.push(next);
            return item;
        }, []);
    };
    //同步负责人选中状态
    var syncUserChecked = function () {
        for (var i = 0; i < $scope.data.user_list.length; i++) {
            var _checked_user =  $scope.data.user_list[i];
            for (var j = 0; j < $scope.data.dept_user_list.length; j++) {
                var _dept = $scope.data.dept_user_list[j];
                _dept.user_list = _dept.user_list || [];
                for (var k = 0; k < _dept.user_list.length; k++) {
                    var _user = _dept.user_list[k];
                    if (_user.user_id.trim() === _checked_user.user_id.trim()) {
                        _user.check_flag = true;
                    }
                }
            }
        }
    };
    //初始化方法
    var init = function() {
        //获取责任人列表
        Project.getAllExcutedUser().then(function(data){
            $scope.data.dept_user_list = data.dept_user_list ? data.dept_user_list :[];
            initDeptUserData($scope.data.dept_user_list);
            //查看
            Project.getProjectData(_project_id).then(function (data) {
                if(data){
                    $timeout(function () {
                        $scope.info.project_id = data.pjproject_info.project_id;
                        $scope.info.project_name = data.pjproject_info.project_name;
                        $scope.info.project_status = data.pjproject_info.project_status;
                        $scope.info.project_desc = data.pjproject_info.project_desc;
                        $scope.info.project_scale = data.pjproject_info.project_scale;
                        $scope.info.project_sys_list = data.pjSys_info_list || [];
                        $scope.data.sys_list = data.business_sys_list || [];
                        var _user_list = data.pjproject_info.project_managers ? data.pjproject_info.project_managers.trim().split(',') : [];
                        var _all_user_list = $scope.data.all_user_list;
                        for(var j = 0; j < _all_user_list.length; j++){
                            for(var i = 0; i < _user_list.length; i++){
                                if(_all_user_list[j].user_id.trim() == _user_list[i].trim()){
                                    $scope.data.user_list.push(_all_user_list[j]);
                                }
                            }
                        }
                        syncUserChecked();

                        //同步选中
                        for (var m = 0; m < $scope.data.sys_list.length; m++) {
                            var _sys =  $scope.data.sys_list[m];
                            var _initial_list = PinYin.toPyInitial(_sys.business_cn_name || ''); //转换成拼音首字母
                            _sys.letter = _initial_list[0].charAt(0).toUpperCase();
                            if(!/[A-Z]/.test(_sys.letter)) _sys.letter = '#';
                            for (var n = 0; n < $scope.data.letter_nav_list.length; n++) {
                                var _letter =  $scope.data.letter_nav_list[n];
                                if (_sys.letter === _letter.letter){
                                    _letter.checked_count = _letter.checked_count ? _letter.checked_count : 0;
                                    if(_sys.sys_used_flag === 1 || _sys.sys_used_flag === 2){
                                        _letter.checked_count ++;
                                        $scope.info.project_sys_list.push({
                                            business_sys_name : _sys.business_sys_name,
                                            sys_used_flag : _sys.sys_used_flag,
                                        });
                                    }
                                    _letter.list.push({
                                        sys_name : _sys.business_sys_name,
                                        sys_cn_name : _sys.business_cn_name,
                                        checked : _sys.sys_used_flag === 1,
                                        checked_disabled : _sys.sys_used_flag === 2,
                                    });
                                }
                            }
                        }
                        $scope.data.screen_sys_list = $scope.data.letter_nav_list.filter(function (item){return item.list.length > 0});
                    },0)
                }
            },function (error) {
                $scope.info.error_message = error.message;
            });
        },function(error){
            $scope.info.error_message = error.message;
        });
    };

    //配置负责人
    $scope.configProjectUser = function () {
        $scope.control.show_config_div = !$scope.control.show_config_div;
        if($scope.control.show_config_div){ syncUserChecked(); }
    };
    //切换部门
    $scope.switchDept = function(dept,list){
        for(var i = 0 ;i< list.length; i++){
            var _dept =list[i];
            _dept.is_check = false;
        }
        dept.is_check = true;
    };
    //隐藏责任人配置窗体并初始化数据
    $scope.hideConfig = function(){
        $scope.control.show_config_div = false;
        initDeptUserData($scope.data.dept_user_list)
    };
    //保存责任人
    $scope.saveResponseUser = function(){
        if(!validDeptUser($scope.data.dept_user_list)){
            Modal.alert('至少选择一个项目负责人！',3);
            return false;
        }
        $scope.data.user_list = [];
        $scope.data.user_list = $scope.data.user_list.concat(getCheckedDeptUser($scope.data.dept_user_list));
        $scope.data.user_list = arrayUnique($scope.data.user_list,'user_id');
        $scope.control.user_exsit = false;
        $scope.control.show_config_div = false;
        initDeptUserData($scope.data.dept_user_list)
    };
    //删除责任人
    $scope.deleteUser = function(index){
        $scope.data.user_list.splice(index,1)
    };
    //选择系统
    $scope.checkSys = function (letter,sys) {
        sys.checked = !sys.checked;
        if(sys.checked){
            letter.checked_count++;
            $scope.info.project_sys_list.push({
                business_sys_name : sys.sys_name,
                sys_used_flag : sys.sys_used_flag || 0,
            });
        } else {
            letter.checked_count--;
            $scope.info.project_sys_list.pop();
        }
    };
    //保存项目信息
    $scope.formSubmit = function() {
        //表单验证
        if(!CV.valiForm($scope.proj_form)) {
            $scope.control.sava_btn_loading = false;
            return false;
        }
        if($scope.data.user_list.length == 0){
            $scope.control.user_exsit = true;
            $scope.control.sava_btn_loading = false;
            return false;
        }
        if($scope.info.project_sys_list.length === 0){
            Modal.alert('请选择应用系统',1);
            return false;
        }
        //提取执行用户ID组
        $scope.info.project_managers = [];
        for(var i =0;i< $scope.data.user_list.length;i++){
            $scope.info.project_managers.push($scope.data.user_list[i].user_id);
        }
        $scope.info.project_scale = parseInt($scope.info.project_scale);
        //新增
        $scope.control.sava_btn_loading = true;
        Project.addProj($scope.info).then(function (data) {
            if (data) {
                $scope.control.sava_btn_loading = false;
                Modal.alert("项目修改成功！",2);
                $state.go("proj_list");
            }
        }, function (error) {
            $scope.control.sava_btn_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //取消
    $scope.formCancel = function() {
        $state.go("proj_list");
    };
    init();

}]);
/**
 *系统发布信息查看
 * */
pCtrl.controller('projPreDetailCtrl', ["$scope", "$stateParams", "$state", "$timeout", "$interval", "$sce", "ScrollConfig", "Proj","Project", "Exec", "ProjectNature","pathType" ,"ProjState", "IssueType", "ProdFlag", "DirNodeShare", "ProtocolType", "BusiSys", "Modal","CodeMirrorOption","CmptFunc","BsysFunc", "CV", function($scope, $stateParams, $state, $timeout, $interval, $sce, ScrollConfig, Proj,Project, Exec, ProjectNature, pathType, ProjState, IssueType, ProdFlag, DirNodeShare, ProtocolType, BusiSys, Modal, CodeMirrorOption, CmptFunc, BsysFunc, CV) {
    var _sys_name = $stateParams.sys_id;
    var _publish_id = $stateParams.publish_id;
    //配置对象
    $scope.config = {
        viewOptions         : CodeMirrorOption.Sh(true), //执行脚本codemirror配置
        pub_scroll          : ScrollConfig, //发布方案滚动条配置
        rollback_scroll     : ScrollConfig, //回退方案滚动条配置
        config_file_scroll  : ScrollConfig, //配置文件滚动条配置
        prepare_scroll      : ScrollConfig, //准备信息滚动条配置
    }
    //状态控制对象 error， loading， empty
    $scope.control = {
        pro_status      : {error_status:false, loading_status:false, empty_status:false},
        bs_status       : {error_status:false, loading_status:false, empty_status:false},
        plan_status     : {error_status:false, loading_status:false, empty_status:false},
        ready_status    : {error_status:false, loading_status:false, empty_status:false},
        pub_status      : {error_status:false, loading_status:false, empty_status:false},
        back_btn_active : 0,//回退方案选中标记
        pub_step_flag   : true,//发布步骤查看
        back_step_flag  : false,//回退步骤查看
        code_refresh    : false,//code刷新
    };
    //展示对象信息
    $scope.info = {
        public_info  : {},       //项目-公共信息
        pj_info      : {},       //项目-项目信息
        publish_info : {},       //项目-发布信息
        pre_info     : {},       //项目-准备信息
       /* plan_info    : {},       //项目-计划信息-自身
        front_plan_list  : [],   //项目-计划信息-前置s
        behind_plan_list : [],   //项目-计划信息-后置s*/
    }
    //发布信息-问题类型转中文显示
    var formatProblemType = function(problem_type_list) {
        var _problem_type_list_cn;
        var _problem_type_list_string = "";
        for (var i = 0; i < problem_type_list.length; i++) {
            _problem_type_list_string += CV.findValue(problem_type_list[i], IssueType) + " | ";
        }
        _problem_type_list_cn = _problem_type_list_string.substring(0,_problem_type_list_string.lastIndexOf('|')-1);
        return _problem_type_list_cn ? _problem_type_list_cn : '无';
    };
    //发布信息--修改发布评价模态框
    var showSummaryModel = function(_project_name, _business_sys_name) {
        Modal.summary(_project_name, _business_sys_name).then(function(data) {
            loadPublicData();
        });
    };
    //发布信息--修改回退评价模态框
    var showRollbackSummaryModel = function(_project_name, _business_sys_name, proj_status) {
        Modal.rollbackSummary(_project_name, _business_sys_name, proj_status).then(function(data) {
            loadPublicData();
        });
    };
    //查询公共信息
    var loadPublicData = function() {
   /*     $scope.control.pro_status.loading_status = false;
        $scope.info.pj_info = {
            business_cn_name : '卡系统',
            business_sys_name : 'test_sys',
            sys_publish_status : 1,
            project_name : '测试项目',
            project_scale : 1,
            project_managers : '超级管理员',
            project_desc : '上线项目--卡系统测试',
            pjpublish_date : '2018-07-25',
            user_cn_name : '超级管理员',
            problem_type_list:[1,2,3],
            project_bk_evaluate:{
                assess_bk_date : '2018-07-25',
                assess_bk_time : '10:00',
                project_bk_evaluate:'测试失败'
            },
            prod_flag : 2,
        };
        $scope.info.pj_info.problem_type_list_cn  = $scope.info.pj_info.problem_type_list ? formatProblemType($scope.info.pj_info.problem_type_list) : '无';
        $scope.info.pj_info.prod_flag_cn = $scope.info.pj_info.prod_flag ? CV.findValue($scope.info.pj_info.prod_flag, ProdFlag) : "--";*/
        Project.viewSysPublishDetail(_publish_id).then(function(data) {
            if(data.sysPublishDetail) {
                $scope.control.pro_status.loading_status = false;
                $scope.info.pj_info.business_cn_name = data.sysPublishDetail.business_cn_name;
                $scope.info.pj_info.business_sys_name = data.sysPublishDetail.business_sys_name;
                $scope.info.pj_info.pjpublish_name	 = data.sysPublishDetail.pjpublish_name	;
                $scope.info.pj_info.sys_publish_status = data.sysPublishDetail.sys_publish_status;
                $scope.info.pj_info.project_name = data.sysPublishDetail.project_name;
                $scope.info.pj_info.pjpublish_date = data.sysPublishDetail.publish_date + '  ' + data.sysPublishDetail.publish_time;
                $scope.info.pj_info.user_cn_name = data.sysPublishDetail.manager_user_name ? data.sysPublishDetail.manager_user_name : '--';
                $scope.info.pj_info.prod_flag = data.sysPublishDetail.syspublish_success_flag ? data.sysPublishDetail.syspublish_success_flag : "";
                $scope.info.pj_info.prod_flag_cn = data.sysPublishDetail.syspublish_success_flag ? CV.findValue(data.sysPublishDetail.syspublish_success_flag, ProdFlag) : "无";
                $scope.info.pj_info.project_bk_evaluate = data.sysPublishDetail.project_bk_evaluate;
                $scope.info.pj_info.assess_bk_date	 = data.sysPublishDetail.assess_bk_date	;
                $scope.info.pj_info.assess_bk_time	 = data.sysPublishDetail.assess_bk_time	;
                $scope.info.pj_info.problem_types	 = data.sysPublishDetail.problem_types ? data.sysPublishDetail.problem_types : [];
                $scope.info.pj_info.problem_type_list_cn  = formatProblemType($scope.info.pj_info.problem_types);
            }
            $scope.info.pj_info.promanual_path = data.promanual_path;     //发布手册下载doc
            $scope.info.pj_info.proreport_path = data.proreport_path;     //发布报告doc
            $scope.info.pj_info.prolog_path = data.prolog_path;           //发布日志
            $scope.info.pj_info.proreport_pdf_path = data.proreport_pdf_path; //发布报告pdf
            $scope.info.pj_info.promanual_pdf_path = data.promanual_pdf_path;     //发布手册pdf
        }, function(error) {
            Modal.alert(error.message,3);
        });
    };
    //查询发布信息
/*    var loadPublishData = function () {
        $timeout(function () {
            Proj.getProjPublishData(_sys_name, _publish_id).then(function (data) {
                if(data.pjrelease_detail) {
                    var _publish_detail = data.pjrelease_detail;
                    //评价信息
                    $scope.info.publish_info.pre_project_cn_name = _publish_detail.pre_project_cnname ? _publish_detail.pre_project_cnname : '--';
                    $scope.info.publish_info.plan_date = _publish_detail.plan_date ? _publish_detail.plan_date : '--';
                    $scope.info.publish_info.project_status = _publish_detail.project_status;
                    $scope.info.publish_info.project_status_cn = CV.findValue(_publish_detail.project_status,ProjState);
                    $scope.info.publish_info.prod_flag = _publish_detail.prod_flag;
                    $scope.info.publish_info.prod_flag_cn = _publish_detail.prod_flag ? CV.findValue(_publish_detail.prod_flag,ProdFlag) : '--';
                    $scope.info.publish_info.problem_type_list_cn  = _publish_detail.problem_type_list ? formatProblemType(_publish_detail.problem_type_list) : '无';
                    $scope.info.publish_info.project_bk_evaluate = _publish_detail.project_bk_evaluate ? _publish_detail.project_bk_evaluate: {};
                    $scope.info.publish_info.pro_start_time = _publish_detail.pro_start_time ? _publish_detail.pro_start_time : "";
                    $scope.info.publish_info.pro_end_time = _publish_detail.pro_end_time ? _publish_detail.pro_end_time : "";
                    $scope.info.publish_info.public_step_time_used = CV.usedCnTime(_publish_detail.pro_time_used);
                    $scope.info.publish_info.pro_cmd_list = _publish_detail.pro_cmd_list ? _publish_detail.pro_cmd_list : [];
                    var _curr_publish_phase = _publish_detail.publish_phase_id;
                    for(var i = 0; i < $scope.info.publish_info.pro_cmd_list.length; i ++) {
                        var _publish_cmd_list = $scope.info.publish_info.pro_cmd_list[i];
                        if(_publish_cmd_list.step_id != 0){
                            _publish_cmd_list.bk_cmd_content = $sce.trustAsHtml(_publish_cmd_list.bk_cmd);
                        }
                        if(_curr_publish_phase == _publish_cmd_list.phase_id && _publish_cmd_list.step_id == 0){
                            $scope.info.publish_info.publish_phase_bk_desc = _publish_cmd_list.phase_bk_desc;
                        }
                    }
                } else{
                    $scope.control.pub_status.empty_status = true ;
                }
                if(data.pjrollback_detail){
                    var _rollback_detail = data.pjrollback_detail;
                    //回退步骤
                    $scope.info.publish_info.rollback_start_time = _rollback_detail.pro_start_time ? _rollback_detail.pro_start_time : "";
                    $scope.info.publish_info.rollback_end_time = _rollback_detail.pro_end_time ? _rollback_detail.pro_end_time : "";
                    $scope.info.publish_info.rollback_step_time_used = CV.usedCnTime(_rollback_detail.pro_time_used);
                    $scope.info.publish_info.rollback_cmd_list = _rollback_detail.pro_cmd_list ? _rollback_detail.pro_cmd_list :[];
                    $scope.curr_rollback_phase = _rollback_detail.publish_phase_id;
                    $scope.curr_rollback_step = _rollback_detail.publish_step_id;
                    for(var i = 0; i < $scope.info.publish_info.rollback_cmd_list.length; i ++) {
                        var _rollback_cmd_list = $scope.info.publish_info.rollback_cmd_list[i];
                        if($scope.curr_rollback_phase == _rollback_cmd_list.phase_id && _rollback_cmd_list.step_id == 0){
                            $scope.info.publish_info.rollback_phase_bk_desc = _rollback_cmd_list.phase_bk_desc;
                        }
                    }
                }
                $scope.control.pub_status.loading_status = false;
            }, function (error) {
                $scope.control.pub_status.loading_status = false;
                $scope.control.pub_status.error_status= true;
                $scope.info.publish_info.errorMessage = error.message;
                Modal.alert(error.message);
            });
        },0);
    };*/
    //发布方案显示处理
    var dealPubPgm = function (list) {
        for(var i=0;i<list.length;i++){
            var _group = list[i];
            _group.nav_show_flag = 0;// //默认方案阶段全部收起
            _group.expand_flag = false;// //默认阶段收起
            _group.phase_list = BsysFunc.dealPhase(_group.phase_list);
            for(var j=0;j<_group.phase_list.length;j++){
                if(_group.phase_list[j].script &&  _group.phase_list[j].script.cmds){
                    _group.phase_list[j].exec_script = CmptFunc.cmdsToString(_group.phase_list[j].script.cmds);
                }
                if(_group.phase_list[j].phase_type == 6){
                    _group.phase_list[j].url_detail = $sce.trustAsHtml(_group.phase_list[j].script.cmds[0])
                }
                if(_group.phase_list[j].command && _group.phase_list[j].command.cmds){
                    _group.phase_list[j].command.exec_script=CmptFunc.cmdsToString(_group.phase_list[j].command.cmds);
                }
            }
        }
    };
    //查询准备信息
    var loadReadyData = function () {
        $timeout(function () {
            Project.viewSysReadyDetail(_publish_id).then(function (data) {
                if(data) {
                    $scope.control.ready_status.loading_status = false;
                    $scope.info.pre_info.dpl_upload_flag        =  data.dpl_upload_flag;
                    $scope.info.pre_info.dpp_upload_flag        =  data.dpp_upload_flag;
                    $scope.info.pre_info.dpl_upload_flag_cn     =  CV.findValue($scope.info.pre_info.dpl_upload_flag, pathType);
                    $scope.info.pre_info.dpp_upload_flag_cn     =  CV.findValue($scope.info.pre_info.dpp_upload_flag, pathType);
                    $scope.info.pre_info.version_soc_name       =  data.version_soc_name;
                    if(data.publish_program){
                        $scope.info.pre_info.prog_id                =  data.publish_program.prog_id;
                        $scope.info.pre_info.version_num            =  data.publish_program.version_num ? data.publish_program.version_num : "--";
                        $scope.info.pre_info.prog_cn_name           =  data.publish_program.prog_cn_name ;
                        $scope.info.pre_info.prolist_full_path      =  data.publish_program.list_name ? data.publish_program.list_name_path : '';
                        $scope.info.pre_info.publish_group_list     =  data.publish_program.group_list ? data.publish_program.group_list : [];
                        $scope.info.pre_info.pac_type_list          =  data.publish_program.pac_type_list ? data.publish_program.pac_type_list : [];
                        $scope.info.pre_info.config_file_list       =  data.publish_program.config_file_list ? data.publish_program.config_file_list : [];
                        //dealPubPgm($scope.info.pre_info.publish_group_list); //发布
                        BsysFunc.processProgDate($scope.info.pre_info.publish_group_list,$scope.info.pre_info.pac_type_list,$scope.info.pre_info.config_file_list);
                        $scope.info.pre_info.publish_param_list     =  data.publish_program.param_list ? data.publish_program.param_list : [];
                        $scope.info.pre_info.package_file_path=  data.publish_program.package_file_path ? data.publish_program.package_file_path :[];
                        //回退
                        $scope.info.pre_info.rollbackMsg_list       =  data.rollback_program ? data.rollback_program :[];
                        if($scope.info.pre_info.rollbackMsg_list.length >=1){
                            $scope.info.pre_info.back_cn_name   =   $scope.info.pre_info.rollbackMsg_list[0].prog_cn_name;
                            $scope.info.pre_info.rollback_group_list  =  $scope.info.pre_info.rollbackMsg_list[0].group_list ? $scope.info.pre_info.rollbackMsg_list[0].group_list : [];
                            $scope.info.pre_info.rollback_param_list    =   $scope.info.pre_info.rollbackMsg_list[0].param_list ? $scope.info.pre_info.rollbackMsg_list[0].param_list : [];
                            $scope.info.pre_info.rollback_pac_type_list    =   $scope.info.pre_info.rollbackMsg_list[0].pac_type_list ? $scope.info.pre_info.rollbackMsg_list[0].pac_type_list : [];
                            $scope.info.pre_info.rollback_config_file_list    =   $scope.info.pre_info.rollbackMsg_list[0].rollback_config_file_list ? $scope.info.pre_info.rollbackMsg_list[0].rollback_config_file_list : [];
                            // dealPubPgm($scope.info.pre_info.rollback_group_list);
                            BsysFunc.processProgDate($scope.info.pre_info.rollback_group_list,$scope.info.pre_info.rollback_pac_type_list,$scope.info.pre_info.rollback_config_file_list);
                        }
                        $scope.info.pre_info.config_file_list       =  data.publish_program.config_list ? data.publish_program.config_list :[];
                    }
                } else {
                    $scope.control.ready_status.empty_status  = true;
                }
            },function (error) {
                $scope.control.ready_status.loading_status = false;
                $scope.control.ready_status.error_status= true;
                $scope.info.pre_info.errorMessage = error.message;
            });
        },0);
    };
    //codereflash
    var codeRefresh = function () {
        $timeout(function(){
            $scope.control.code_refresh = !$scope.control.code_refresh;
        },50)
    };
    //初始化方法
    var init = function() {
        $scope.control.pro_status.loading_status = true;
        $scope.control.ready_status.loading_status = true;
        loadPublicData();
        loadReadyData();
        // loadProjectData();
    };
    //下载文件 path (路径)
    $scope.downloadFile = function(path) {
        CV.downloadFile(path);
    };
    //张开收起阶段信息
    $scope.toggleModulesDetail = function (step,group) {
        codeRefresh();
        step.show_detail = !step.show_detail;
        group.nav_show_flag = CmptFunc.judgeShowDetail(group.phase_list);
        group.expand_flag = (group.nav_show_flag == 2) ? true : false;
        //重新刷新codemirror
        if(step.show_detail){
            $scope.code_refresh = false;
            $timeout(function(){
                $scope.code_refresh = true;
            },10)
        }
    };
    //方案信息全部展开
    $scope.expandCollapseAll = function (group) {
        codeRefresh();
        group.nav_show_flag = CmptFunc.expandAllModules(group.phase_list);
        //重新刷新codemirror
        if(group.nav_show_flag == 2 ){
            $scope.code_refresh = false;
            $timeout(function(){
                $scope.code_refresh = true;
            },10)
        }
    };
    //方案信息全部收起
    $scope.colseCollapseAll = function (group) {
        codeRefresh();
        group.nav_show_flag = CmptFunc.closeAllModules(group.phase_list);
    };
    //协议类型转化中文名
    $scope.getProtocolTypeCnName = function(protocol_type){
        return CV.findValue(protocol_type,ProtocolType).substring(0,5).toLowerCase();
    };
    //计算表格宽度
    $scope.calculateParamTableWidth = function (flag,index) {
        var _width = (flag == 1) ? $('#param_table').width() : $('.param_rollback_table').width();
        return {
            'width' : _width/3 + 'px',
            'max-width' : _width/3 + 'px',
            'min-width' : _width/3 + 'px'
        }
    };
    //计划信息--后置项目多个情况-计算宽度
    $scope.calculatePlanWidth = function (list,one) {
        var _one_width = (1/ list.length)*100;
        return {
            'width' : _one_width + '%',
            'color' : one.checked ? '' : '#999'
        }
    };
    //计划信息--切换显示后置项目信息
    $scope.changeShowProj = function (list,one) {
        for(var i=0;i<list.length;i++){
            list[i].checked = false;
        }
        one.checked = true;
    };
    //发布信息--修改发布评价
    $scope.showSummary = function() {
        showSummaryModel(_publish_id, _sys_name);
    };
    //发布信息--修改回退评价
    $scope.showRollbackSummary = function() {
        showRollbackSummaryModel(_publish_id, _sys_name, $scope.info.publish_info.project_status);
    };
    //评价样式
    $scope.commentStyle = function (className) {
        var _span = $(className);
        while (_span.outerHeight() > 69) {
            _span.text(_span.text().replace(/(\s)*([a-zA-Z0-9]+|\W)(\.\.\.)?$/, "..."));
        }
    };
    //格式化回退方案日期
    $scope.formatData = function (back_info) {
        if(back_info.end_datetime){
            var _init_date = new Date(back_info.end_datetime);
            back_info.format_tm = _init_date;
        }else{
            back_info.format_tm = null;
        }
        return back_info;
    };
    //（回退方案）点击切换方案
    $scope.shiftRolbackProgram = function (back_info,index) {
        $scope.control.back_btn_active = index;
        $scope.info.pre_info.back_cn_name = back_info.prog_cn_name;
        $scope.info.pre_info.rollback_group_list    =  back_info.group_list ? back_info.group_list : [];
        dealPubPgm($scope.info.pre_info.rollback_group_list);
        $scope.info.pre_info.rollback_param_list    =  back_info.param_list ? back_info.param_list : [];
    };
    //下载投产包或清单
    $scope.downloadProdPackageOrList = function(path){
        CV.downloadFile(path);
    };
   /* //查看执行信息
    $scope.showDetail = function(){
        $state.go('proj_detail_exec',{proj_id:_publish_id,sys_id:_sys_name});
    };*/
    init();
}]);
/**
 * 项目列表/历史列表
 * **/
pCtrl.controller('projListCtrl', ["$scope", "$state", "$timeout", "Project", "ProjectStatus", "ProjectReleaseType", "ProjState", "ScrollBarConfig", "Modal", "CV", function($scope, $state, $timeout, Project, ProjectStatus, ProjectReleaseType, ProjState, ScrollBarConfig, Modal, CV) {
    var _status = [];//全局状态控制 //1待发布 2发布中 3发布完成 4已关闭
    var _curr_url = $state.$current.self.name || 'proj_list';

    //页面信息
    $scope.info = {
        error_msg : '', //错误信息
        project_list : [],  //项目列表
        project_name : '',  //项目名称
        project_info : {},  //项目信息
    };
    //页面数据
    $scope.data = {
        release_type : ProjectReleaseType ,   //发布状态
        project_status : ProjectStatus        //项目状态
    };
    //页面控制
    $scope.control = {
        project_list_loading : false,
        wait_pub_choose_flag : true,//待发布
        pub_exec_choose_flag : false,//发布中
        pub_finish_choose_flag : false,//发布结束
        pub_close_flag : false, //已关闭
        show_filter_flag : true, //显示筛选标志
        is_history_proj: _curr_url === 'proj_history',//是否为历史项目列表
        tab_flag: _curr_url === 'proj_history' ? '2':'1', //列表标志
    };
    //页面配置
    $scope.config = {
        project_scroll:ScrollBarConfig.Y(),
        page_option :  {
            curr: 1, //当前页数
            all: 1, //总页数
            limit_recd:10,
            all_recd: 0, //总数目
            count: 10, //最多显示的页数，默认为10
            page_info:{
                start_recd : 0,
                limit_recd : 10
            },
            // 点击页数的回调函数，参数page为点击的页数
            click: function (page) {
                getList('',[],page);
            }
        }
    };

    var init = function() {
        getList();
    };
    //列表
    var getList = function (keyword,status_list,page) {
        page = page || 1;
        var _keyword = keyword ? keyword : '';
        var _status_list = status_list  || [1];
        $scope.info.error_msg = '';
        $scope.control.project_list_loading = true;
        $scope.config.page_option.page_info.start_recd = $scope.config.page_option.page_info.limit_recd *(page-1);
        Project.getProjList(_keyword,_status_list,$scope.control.is_history_proj,$scope.config.page_option.page_info).then(function (data) {
            $timeout(function () {
                $scope.config.page_option.all_recd = data.all_recd || 0;
                $scope.info.project_list = data.project_list || [];
                $scope.control.project_list_loading = false;
            },0)
        },function (error) {
            $scope.control.project_list_loading = false;
            $scope.info.error_msg = error.message;
        })
    };

    //根据状态搜索发布窗口
    $scope.getListByStatus = function(flag){
        var _status_list = [];
        if(flag === 1){
            $scope.control.wait_pub_choose_flag = !$scope.control.wait_pub_choose_flag;
        }
        if(flag === 2){
            $scope.control.pub_exec_choose_flag = !$scope.control.pub_exec_choose_flag;
        }
        if(flag === 3){
            $scope.control.pub_finish_choose_flag = !$scope.control.pub_finish_choose_flag;
        }
        if(flag === 4){
            $scope.control.pub_close_flag = !$scope.control.pub_close_flag;
        }
        if($scope.control.wait_pub_choose_flag){
            _status_list.push(1);
        }
        if($scope.control.pub_exec_choose_flag){
            _status_list.push(2);
        }
        if($scope.control.pub_finish_choose_flag){
            _status_list.push(3);
        }
        if($scope.control.pub_close_flag){
            _status_list.push(4);
        }
        _status = _status_list;
        getList($scope.info.project_name,_status_list);
    };
    //搜索
    $scope.search = function () {
        getList($scope.info.project_name,_status);
    };
    //系统状态样式
    $scope.sysStatusStyle = function(status){
        var _class = '';
        switch (status){
            case 1:
            case 2:
            case 9: _class='publish-wait'; break;
            case 3:
            case 6: _class='publishing'; break;
            case 4:
            case 5:
            case 7: _class='published'; break;
            case 8: _class='publish-error'; break;
            default: _class = '';
        }
        return _class;
    };
    //获取系統状态值
    $scope.getSysStatusValue = function (key) {
        return CV.findValue(key,ProjState);
    };
    //关闭项目
    $scope.closeProject = function(event,project_id,project_name){
        event.stopPropagation();
        Modal.confirm("请确认是否关闭 [ "+ project_name +" ] 项目？").then(function (data) {
            if(data){
                //关闭服务
                Project.handleCloseProject(project_id).then(function (result) {
                    if(result){
                        Modal.alert('关闭成功',2);
                        getList();
                    }
                },function (error) {
                    Modal.alert(error.message,3)
                })
            }
        })
    };
    //重启项目
    $scope.restartProject = function(event,project_id,project_name){
        event.stopPropagation();
        Modal.confirm("请确认是否重启["+project_name+"]项目？").then(function (data) {
            if(data){
                Project.reBootProject(project_id).then(function (result) {
                    if(result){
                        Modal.alert("重启成功！",2);
                        getList();
                    }
                },function (error) {
                    Modal.alert(error.message,3)
                })
            }
        })
    };
    init();
}]);
/**
 * 项目查看
 * **/
pCtrl.controller('projDetailCtrl', ["$scope", "$state", "$stateParams", "$timeout", "Project", "ProjectStatus", "ScrollBarConfig", "Modal", "CV", function($scope, $state, $stateParams, $timeout, Project, ProjectStatus,ScrollBarConfig, Modal, CV) {
    //页面信息
    $scope.info = {
        error_msg : '', //错误信息
        project_id : $stateParams.project_id,  //项目编号
        project_name : $stateParams.project_name,  //项目名称
        project_status: $stateParams.project_status || 0 //项目状态
    };
    $scope.proj_detail_app_flag = true; //子控制器用到的标志(用于项目想看)
    $state.go('proj_detail.proj_application');
}]);
