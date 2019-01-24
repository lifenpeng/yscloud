'use strict';

//用户控制器
var uCtrl = angular.module('UserController', []);

/**
 *修改用户信息
 * */
uCtrl.controller('userModifyCtrl', ["$scope", "$rootScope", "$state", "User", "Modal", function($scope, $rootScope, $state, User, Modal) {
    //用户编号
    var _user_id = $rootScope.loginUser.org_user_id;
    //用户信息
    $scope.user_info = {};
    //控制
    $scope.control = {
        save_btn_loading : false
     };
    //根据用户编号获取用户信息
    User.getUserByUserId(_user_id).then(function (data) {
        if(data.user_bean){
            $scope.user_info = {
                user_name           : data.user_bean.user_id        || '',  //用户名
                user_cn_name        : data.user_bean.user_cn_name   || '',  //用户中文名
                teller_number       : data.user_bean.teller_no      || '',  //柜员号
                user_email          : data.user_bean.email_add      || '',  //邮箱
                phone_number        : data.user_bean.phone_no       || '',  //电话号码
                pwd_expiry_date     : data.user_bean.pwdexp_bk_date || '',  //密码到期日期
                user_type           : data.user_bean.user_type      || '',  //用户类型(1行内 2行外)
                user_department     : data.user_bean.bl_dept_id     || '',  //用户部门
                parttime_department : data.user_bean.first_dept_id  || '',  //兼职部门
                department_role     : data.user_bean.dprl_cn_name   || ''   //部门角色
            };
        }
    });
    //提交
    $scope.formSubmit = function () {
        $scope.control.save_btn_loading = true;
        User.us_UpdateUserAction($scope.user_info).then(function () {
            Modal.alert("个人信息修改成功!",2);
            $scope.control.save_btn_loading = false;
            $state.go('index');
        }, function(error){
            Modal.alert(error.message,3);
            $scope.control.save_btn_loading = false;
        });
    };
    //返回
    $scope.back = function() {
        $state.go('index');
    };
}]);

/**
 *修改密码
 * */
uCtrl.controller('pwdModifyCtrl', ["$scope", "$rootScope", "$state", "$timeout", "User", "Modal", "CV", function($scope, $rootScope, $state, $timeout, User, Modal, CV) {
    //用户编号
    var _user_id = $rootScope.loginUser.org_user_id;
    //用户信息
    $scope.user_info = {
        user_name: _user_id,       //用户名
        pwd_info : {
            user_passwd     : '',  //用户密码
            new_user_passwd : '',  //新密码
            new_sec_passwd  : ''   //再次输入新密码
        }
    };
    //页面控制
    $scope.control = {
        edit_btn_loading:false
    };
    //提交
    $scope.formSubmit = function () {
        //表单验证
        if(!CV.valiForm($scope.pwd_form)) {
            return false;
        }

        //校验密码合法性
        if ($scope.user_info.pwd_info.new_sec_passwd !== $scope.user_info.pwd_info.new_user_passwd) {
            Modal.alert("两次新密码输入不一致!",3);
            return false;
        } else if ($scope.user_info.pwd_info.user_passwd === $scope.user_info.pwd_info.new_user_passwd) {
            Modal.alert("密码修改前后一致，请重新设置新密码!",3);
            return false;
        }

        $scope.control.edit_btn_loading = true;
        User.UpdatePwd($scope.user_info.pwd_info).then(function (data) {
            $scope.control.edit_btn_loading  = false;
            Modal.alert("密码修改成功!",2);
            $state.go("index");
        }, function (error) {
            Modal.alert(error.message,3);
            $scope.control.edit_btn_loading = false;
        });
    };
    //重置
    $scope.reset = function(){
        $scope.user_info.pwd_info.user_passwd = '';
        $scope.user_info.pwd_info.new_user_passwd = '';
        $scope.user_info.pwd_info.new_sec_passwd = '';
        $timeout(function(){
            $scope.pwd_form.$setPristine();
        },0);
    };
}]);

/**
 *通讯录列表
 * */
uCtrl.controller('contactsListCtrl', ["$scope", "User", "config", "Modal", "CV", function($scope, User, config, Modal, CV) {
    //已关注的联系人列表
    var _attention_concats_list = [];
    //页面信息
    $scope.info = {
        user_cn_name : '', //搜索关键字(用户名)
        contacts_list : [], //联系人列表
    };
    //页面控制
    $scope.control = {
        current_page : 1, //当前页
        total_recd   : 0, //联系人总记录
    };

    //获取通讯录列表
    var getContactsList = function (startWith) {
        //根据用户名获取通讯录列表
        User.getContactsListByUserName(startWith, 20, $scope.info.user_cn_name).then(function (data) {
            if(data.all_recd !=0){
                $scope.info.contacts_list = config.rebuildContactsList(data.user_list);
                $scope.control.total_recd = data.all_recd;
            }else{
                Modal.alert("没有符合条件的联系人",3);
            }
        }, function (error) {
            Modal.alert(error.message,3);
        });
    };
    //获取常用联系人
    var getAttentionContacts = function () {
        User.getCommonlyUsedConcats().then(function (data) {
            _attention_concats_list = data.contact_list ? data.contact_list : [];
        }, function (error) {
            Modal.alert(error.message,3);
        });
    };
    var init = function () {
        getContactsList(0);
        getAttentionContacts();
    };

    //添加关注样式
    $scope.getAttentionStyle = function (user_id, single_concat) {
        single_concat.attention_flag = false;
        for (var i = 0; i < _attention_concats_list.length; i++) {
            var _attention_list = _attention_concats_list[i];
            if (_attention_list["user_id"] == user_id) {
                single_concat.attention_flag = true;
                return {"color": "red", "margin-top": "2px", "cursor": "pointer"};
            }
        }
        return {"cursor": "pointer"};
    };
    //联系人添加/移除关注
    $scope.addAndRemoveAttentionContact = function (user_id, single_concat) {
        if (single_concat.attention_flag) {
            //删除关注联系人
            User.removeAttentionContacts(user_id).then(function (data) {
                getAttentionContacts();
            }, function (error) {
                Modal.alert(error.message,3);
            });
        } else {
            //添加关注联系人
            User.addAttentionContacts(user_id).then(function (data) {
                getAttentionContacts();
            }, function (error) {
                Modal.alert(error.message,3);
            });
        }
    };
    //分页
    $scope.pageChanged = function () {
        getContactsList(($scope.control.current_page - 1) * 20);
    };
    //搜索联系人
    $scope.searchConcats = function () {
        getContactsList(0);
    };

    init();
}]);

/**
 *消息详细信息
 * */
uCtrl.controller('msgDetailCtrl', ["$scope", "$state", "$stateParams", "$window", "Message", "Modal", "CV", function($scope, $state, $stateParams, $window, Message, Modal, CV) {
    //消息编号
    var _msg_id = $stateParams.msg_id;
    //消息信息
    $scope.msg_info = {};
    //获取消息详细信息
    Message.getmessageDetail(_msg_id).then(function (data) {
        $scope.msg_info = data.msg_info ? data.msg_info : {};
    },function(error){
        Modal.alert(error.message,3);
    });
    //下载附件
    $scope.downloadAttachment = function(file_name) {
        var _path = $scope.msg_info.file_path + file_name;
        CV.downloadFile(_path);
    };
    //返回
    $scope.back = function(){
        $state.go("msg_list");
    };
}]);

/**
 * 日志控制器
 * */
uCtrl.controller('logListCtrl', ["$scope", "LogSrv", "Modal", "CV", function($scope, LogSrv, Modal, CV) {
    var _date = CV.dtFormat(new Date());
    //日志信息
    $scope.log_info = {
        datepicker    : {},        //日期插件
        log_date      : _date,     //当前日志日期
        log_total_recd: 0,         //日志总数
        log_list      : [],        //日志列表
        submit_info   : {
            start_bk_date : '',    //开始日期
            end_bk_date   : '',    //结束日期
            start_recd    : 1,     //开始记录数
            limit_recd    : 5,     //限制记录数
            log_label     : 0,     //日志标签(0:未关注 1：关注)
            log_level     : 1      //日志级别
        },
        download_log_info : {
            start_bk_date : _date, //开始日期
            end_bk_date   : _date, //结束日期
        }
    };
    //页面控制
    $scope.control = {
        current_page : 1,     //当前页
        show_log_menu: false, //显示/隐藏-日志下载菜单
    };
    //显示日志详细信息
    $scope.showLogDetail = function (log) {
        log.show_detail = !log.show_detail;
    };
    //添加/取消单个日志关注
    $scope.toggleLogAttention = function (log) {
        log.log_label = log.log_label == 0 ? 1 : 0;
        LogSrv.lg_UpdateLogLabelAction(log.work_seq, log.log_label).then(function (data) {
        }, function (error) {
            log.log_label = log.log_label == 0 ? 1 : 0;
            Modal.alert(error.message,3);
        });
    };
    //添加/取消所有日志关注
    $scope.toggleAllLogAttention = function () {
        $scope.log_info.submit_info.log_label = $scope.log_info.submit_info.log_label == 0 ? 1 : 0;
        $scope.refreshLogList();
    };
    //选择日志日期
    $scope.selectLogDate = function () {
        $scope.log_info.log_date = CV.dtFormat($scope.log_info.log_date);
        $scope.refreshLogList();
    };
    //改变日志级别
    $scope.changeLogLevel = function (log_level) {
        $scope.log_info.submit_info.log_level = log_level;
        $scope.refreshLogList();
    };
    //刷新日志列表
    $scope.refreshLogList = function () {
        $scope.log_info.submit_info.start_recd = ($scope.control.current_page - 1) * $scope.log_info.submit_info.limit_recd;
        $scope.log_info.submit_info.start_bk_date = $scope.log_info.log_date;
        $scope.log_info.submit_info.end_bk_date = $scope.log_info.log_date;
        if($scope.log_info.submit_info.start_bk_date && $scope.log_info.submit_info.end_bk_date){
            LogSrv.getLogPageList($scope.log_info.submit_info).then(function (data) {
                $scope.log_info.log_list = data.log_list ? data.log_list : [];
                $scope.log_info.log_total_recd = data.all_recd;
            }, function (error) {
                Modal.alert(error.message,3);
            });
        }else{
            Modal.alert("输入时间为空！",3);
        }
    };
    //下载日志
    $scope.downloadLog = function () {
        var _start_bk_date,_start_bk_time;
        var _end_bk_date,_end_bk_time;
        var _curr_time = new Date().getTime();

        if(!$scope.log_info.download_log_info.start_bk_date || !$scope.log_info.download_log_info.end_bk_date){
            Modal.alert("输入日期不能为空",3);
        }else{
            if($scope.log_info.download_log_info.start_bk_date.length == 10){
                _start_bk_date = $scope.log_info.download_log_info.start_bk_date.replace(/-/g,'/') + " 00:00:00";
                _start_bk_date = new Date(_start_bk_date).getTime();
                _start_bk_time = $scope.log_info.download_log_info.start_bk_date;
            }else{
                _start_bk_date = $scope.log_info.download_log_info.start_bk_date.getTime();
                _start_bk_time = CV.dtFormat($scope.log_info.download_log_info.start_bk_date);
            }
            if($scope.log_info.download_log_info.end_bk_date.length == 10){
                _end_bk_date = $scope.log_info.download_log_info.end_bk_date.replace(/-/g,'/') +" 00:00:00";
                _end_bk_date = new Date(_end_bk_date).getTime();
                _end_bk_time = $scope.log_info.download_log_info.end_bk_date;
            }else{
                _end_bk_date =$scope.log_info.download_log_info.end_bk_date.getTime();
                _end_bk_time = CV.dtFormat($scope.log_info.download_log_info.end_bk_date);
            }
            //日期校验
            if(_start_bk_date > _end_bk_date){
                Modal.alert("输入起始日期不合法!",3);
            }else if(_start_bk_date >_curr_time || _end_bk_date > _curr_time){
                Modal.alert("输入日期超出当前日期!",3);
            } else{
                LogSrv.downloadLog(_start_bk_time, _end_bk_time).then(function(data){
                    var _full_path = data.path_name + "/"+ data.file_name;
                    var _path = _full_path.substring(_full_path.indexOf('clWeb/') + 6, _full_path.length);
                    CV.downloadFile(_path);
                },function (error) {
                    Modal.alert(error.message,3);
                });
            }
        }
    };
    //初始获取日志列表
    $scope.refreshLogList();
}]);

