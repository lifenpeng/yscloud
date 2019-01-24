'use strict';
//模态框控制器模块
var modal_m = angular.module('ModalCtrl', []);

//-----------------------公共模块-------------------

/**
 *加载模态框
 * */
modal_m.controller('LoadingCtrl', ["$scope", "Message", function ($scope, Message) {
    $scope.message = Message;
}]);

/**
 *提示模态框
 * */
modal_m.controller('AlertCtrl', ["$scope", "$modalInstance", "$timeout", "status", "Message", function ($scope, $modalInstance, $timeout, status, Message) {
    $scope.message = Message;
    $scope.status = status ? status : 1; //1正常情况提示，2//成功提示，3//失败提示
    $scope.ok = function () {
        try {
            $modalInstance.close(true);
        } catch (error) { }
    };
    $('body').keypress(function (event) {
        var code = event.keyCode || event.which;
        if (code == 13) {
            $scope.$apply(function () {
                $modalInstance.close(true);
            });
        }
    });
    if ($scope.status != 3) {
        $timeout(function () {
            try {
                $modalInstance.close(true);
            } catch (error) { }
        }, 2000);
    }
}]);

/**
 *确认模态框
 * */
modal_m.controller('ConfirmCtrl', ["$scope", "$modalInstance", "Message", function ($scope, $modalInstance, Message) {
    $scope.message = Message;
    $scope.ok = function () {
        $modalInstance.close(true);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 *本地授权
 * */
modal_m.controller('localAuthCtrl', ["$scope", "$modalInstance", "modalParam", "Task", "QRCodeLocalAuth", "Modal", function ($scope, $modalInstance, modalParam, Task, QRCodeLocalAuth, Modal) {
    var _srvReqData = angular.copy(modalParam.srv_req_data); //服务数据
    //页面交互信息
    $scope.info = {
        authdprl_bk_expl: modalParam.auth_data.authdprl_bk_expl, //任务描述
        user_id: '',                                    //用户ID
        user_password: '',                                    //用户密码
        qrcodeLocalAuthImageURL: '',                                    //二维码图片路径
    };
    //页面控制
    $scope.control = {
        btnBus_loading: false, //loading
    };
    //二维码服务
    var _param = {
        auth_dprl_code: modalParam.auth_data.auth_dprl_code,
        auth_seq: modalParam.auth_data.auth_seq,
        auth_user_id: $scope.info.user_id,
        pend_srv_name: modalParam.auth_data.pend_srv_name,
        user_passwd: $scope.info.user_password,
        auth_key: modalParam.auth_data.auth_key, //新增参数（支持故障维护SQL本地授权）
        req_data: _srvReqData
    };
    var _cancelObj = QRCodeLocalAuth.getQRCodeLocalAuthImage(_param, function (imgURL) {
        $scope.info.qrcodeLocalAuthImageURL = imgURL;
    }, function (data) {
        if (data && data.pend_srv_name == _srvReqData.org_srv_name) {
            _srvReqData.submit_type = 4;
            Task.ExecuteTask(_srvReqData, modalParam.auth_data.pend_srv_name).then(function (data) {
                $modalInstance.close(data);
            }, function (error) {
                $scope.control.btnBus_loading = false;
                $modalInstance.dismiss({ status: 'system', message: error.message });
            });
        } else {
            $modalInstance.close(data);
        }
    }, function (error) {
        $scope.control.btnBus_loading = false;
        $modalInstance.dismiss({ status: 'system', message: error.message });
    });
    //确定
    $scope.submit = function () {
        _cancelObj.cancel = true;
        $scope.control.btnBus_loading = true;
        var _srvReqData = angular.copy(modalParam.srv_req_data);
        if (!$scope.info.user_id) {
            Modal.alert("授权用户名为空！", 3);
            $scope.control.btnBus_loading = false;
            return false;
        } else if (!$scope.info.user_password) {
            Modal.alert("授权用户密码为空！", 3);
            $scope.control.btnBus_loading = false;
            return false;
        } else {
            _param.auth_user_id = $scope.info.user_id;
            _param.user_passwd = $scope.info.user_password;
            Task.LocalAuthTask(_param).then(function (data) {
                if (data.pend_work_seq) {//sql本地授权
                    data.pend_srv_name = data.pend_work_seq;
                }
                if (data && data.pend_srv_name == _srvReqData.org_srv_name) {
                    _srvReqData.submit_type = 4;
                    Task.ExecuteTask(_srvReqData, modalParam.auth_data.pend_srv_name).then(function (data) {
                        $modalInstance.close(data);
                    }, function (error) {
                        $scope.control.btnBus_loading = false;
                        $modalInstance.dismiss(error);
                    });
                } else {
                    $modalInstance.close(data);
                }
            }, function (error) {
                $scope.control.btnBus_loading = false;
                $modalInstance.dismiss(error);
            });
        }
    };
    //取消
    $scope.cancel = function () {
        _cancelObj.cancel = true;
        $modalInstance.dismiss({ status: 'system', message: '已取消本地授权' });
    };
}]);

/**
 *远程授权
 * */
modal_m.controller('remoteAuthCtrl', ["$scope", "$modalInstance", "modalParam", "Task", "CV", function ($scope, $modalInstance, modalParam, Task, CV) {
    //页面对象
    $scope.info = {
        pendwk_bk_expl: modalParam.auth_data.pendwk_bk_expl, //任务描述
        apply_bk_expl: '',                                  //申请说明
        form: {},                                  //form表单对象
    };
    //页面控制对象
    $scope.control = {
        btnBus_loading: false, //页面loading
    };
    //提交
    $scope.submitRaForm = function () {
        $scope.control.btnBus_loading = true;
        //表单验证
        if (!CV.valiForm($scope.info.form.raForm)) {
            $scope.control.btnBus_loading = false;
            return false;
        }
        var _srvReqData = angular.copy(modalParam.srv_req_data);
        _srvReqData.submit_type = 5;
        _srvReqData.apply_bk_expl = $scope.info.apply_bk_expl;
        Task.ExecuteTask(_srvReqData, modalParam.srv_req_data.org_srv_name).then(function (data) {
            $modalInstance.close({ status: 'system', message: '任务已提交，待审批', task_id: data.appdata.pend_work_seq });
        }, function (error) {
            $scope.control.btnBus_loading = false;
            $modalInstance.dismiss({ status: 'system', message: error.message });
        });
    };
    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss({ status: 'system', message: '手动取消任务申请' });
    };
}]);

/**
 *文件比对
 * */
modal_m.controller('CompareFileCtrl', ["$scope", "$modalInstance", "$timeout", "Exec", "modalParam", "EncodingType", "ScriptDayNight", "CodeMirrorOption", "Modal", function ($scope, $modalInstance, $timeout, Exec, modalParam, EncodingType, ScriptDayNight, CodeMirrorOption, Modal) {
    var _encoding = ""; //记录上次的编码
    var _timer = ""; //清除动画
    $scope.can_not_save = true; //默认保存按钮不能点击
    $scope.show_setting = false; //默认不显示设置内容
    $scope.socWords = '';
    $scope.tagWords = '';
    $scope.upload_exist_flag = false;
    $scope.btnBus_loading = false;
    $scope.loading_config_file = false;
    $scope.filePath = modalParam.file_path;
    $scope.isEdit = modalParam.is_edit ? modalParam.is_edit : false;
    $scope.fileData = {
        socWords: "",
        system: "",
    };
    $scope.select_data = {
        encoding: EncodingType,    //文件编码方式列表
        encoding_type: 'GBK',
        day_night: ScriptDayNight,
        script_day: '日间'
    }
    _encoding = $scope.select_data.encoding_type;
    $scope.editorOptions = {
        lineWrapping: true,
        lineNumbers: true,
        readOnly: !$scope.isEdit,
        mode: 'text/x-properties'
    };
    //根据文件路径和节点名获得文件内容
    var getConfigFile = function () {
        Exec.getConfigFile(modalParam.busi_sys_id, modalParam.sys_publish_id, modalParam.download_soc_ip, modalParam.file_path, modalParam.download_soc_name, $scope.select_data.encoding_type).then(function (data) {
            $scope.fileData.socWords = data.config_string ? data.config_string : "";
            //$scope.tagWords = data.config_modifyStr? data.config_modifyStr : $scope.socWords;
            $scope.upload_exist_flag = data.upload_exist_flag;
            $scope.fileData.socWords = Base64.decode($scope.fileData.socWords);
            $scope.fileData.system = data.system;
            $scope.loading_config_file = true;
            var _unbing_watch = $scope.$watch('fileData.socWords', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    $scope.can_not_save = false;
                    _unbing_watch(); //注销监听函数
                }
            });
        }, function (error) {
            Modal.alert(error.message, 3);
            $scope.loading_config_file = true;
            $modalInstance.close(false);
        });
    };
    var init = function () {
        getConfigFile();
    }
    $scope.fileEditorLoaded = function (_editor) {
        CodeMirrorOption.setFileEditor(_editor, !$scope.isEdit);
    };
    //切换脚本白天/夜间
    $scope.scriptDayOrNight = function (script_day) {
        if ($scope.select_data.script_day == script_day) { return false; }
        $scope.select_data.script_day = script_day;
        CodeMirrorOption.dayOrNight();
    };
    //改变编码方式
    $scope.changeCoding = function (selectKey) {
        $scope.select_data.encoding_type = selectKey;
        if (_encoding == selectKey) {
            return false;
        }
        $scope.loading_config_file = false;
        getConfigFile();
        _encoding = selectKey;
    };
    //设置按钮的点击事件
    $scope.setFunc = function () {
        $scope.show_setting = !$scope.show_setting;
    };
    //点击文本域隐藏按钮组
    $scope.hidenGroupList = function () {
        $scope.show_setting = false;
    };
    //显示动画
    $scope.showAnimate = function (name) {
        _timer = $timeout(function () {
            $('.' + name).animate({ right: '2px' }, 200, 'linear');
        }, 200);
    }
    //隐藏动画
    $scope.hiddenAnimate = function (name) {
        if (_timer) {
            $timeout.cancel(_timer);
        }
        _timer = $timeout(function () {
            $('.' + name).animate({ right: '-130px' }, 200, 'linear');
        }, 200);
    }
    $scope.ok = function (socWords) {
        $scope.tagWords = socWords ? Base64.encode(socWords) : "";
        $scope.btnBus_loading = true;
        var fileInfo = {
            business_sys_name: modalParam.busi_sys_id,
            syspublish_id: modalParam.sys_publish_id,
            node_name: modalParam.node_name,
            relative_path: modalParam.file_path,
            config_string: $scope.tagWords,
            system: $scope.fileData.system,
            check_soc_name: modalParam.check_soc_name,
            download_soc_name: modalParam.download_soc_name,
            download_soc_ip: modalParam.download_soc_ip,
            encoding: $scope.select_data.encoding_type,
            phase_type: modalParam.phase_type,
            phase_no: modalParam.phase_no ? modalParam.phase_no : 0,
            quick_publish: modalParam.quick_publish ? modalParam.quick_publish : 2
        }
        Exec.saveConfigFile(fileInfo).then(function (data) {
            Modal.alert("配置文件修改成功！", 2);
            $modalInstance.close(true);
        }, function (error) {
            $scope.btnBus_loading = false;
            Modal.alert(error.message, 3);
        });
    };
    $scope.cancel = function () {
        Modal.confirm("确认退出当前操作吗？").then(function () {
            $modalInstance.close(false);
        });
    };
    //模态框拖拽
    $timeout(function () {
        (function ($) {
            $(".modal-content").draggable(
                { cancel: ".modal-body", cursor: "move" }
            );
        })(jQuery);
    }, 1000);
    init();
}]);

//---------------------发布管理模块-----------------------

/**
 * 计划编列-新增分组
 * */
modal_m.controller('planNewGroupCtrl', ["$scope", "$modalInstance", "$timeout", "Plan", "ProjectNature", "Modal", "CV", function ($scope, $modalInstance, $timeout, Plan, ProjectNature, Modal, CV) {
    $scope.col = 'start_bk_time'; //自定义排序标题
    $scope.desc = 0;               //递增排序
    $scope.checked = false;           //全选默认不选中
    $scope.selectAll_flag = false;           //全选默认可点击
    $scope.newGroupList = [];               //所有未分组项目列表
    $scope.form = {};                       //表单信息
    //新增分组表单信息
    $scope.new_group_info = {
        group_id: "",
        group_cn_name: "",
        proj_list: []
    };

    var init = function () {
        Plan.getCanGroupProjList().then(function (data) {
            $timeout(function () {
                data.rows = data.pj_plan_list ? data.pj_plan_list : "";
                $scope.newGroupList = data.rows;
                for (var i = 0; i < $scope.newGroupList.length; i++) {
                    $scope.newGroupList[i].checked = 0;
                    $scope.newGroupList[i].project_nature_cn = CV.findValue($scope.newGroupList[i].project_nature, ProjectNature);
                    $scope.newGroupList[i].pre_project_short_name = $scope.newGroupList[i].pre_project_short_name ? $scope.newGroupList[i].pre_project_short_name : "无";
                }
                //再次循环newGroupList，确定selectAll_flag标志位
                for (var j = 0; j < $scope.newGroupList.length; j++) {
                    // 判断未分组项目列表中是否有前置项目，若都有则全选按钮不可选
                    if ($scope.newGroupList[j].pre_project_short_name !== "无") {
                        $scope.selectAll_flag = true;
                    } else {
                        //有一个无前置则全选按钮可选,并退出循环
                        $scope.selectAll_flag = false;
                        break;
                    }
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3)
        });
    };
    //全选
    $scope.selectAll = function (checked) {
        if (checked) {
            for (var i = 0; i < $scope.newGroupList.length; i++) {
                if ($scope.newGroupList[i].pre_project_short_name == "无") {
                    $scope.newGroupList[i].checked = 1;
                }
            }
        } else {
            for (var i = 0; i < $scope.newGroupList.length; i++) {
                $scope.newGroupList[i].checked = 0;
            }
        }
    };
    //提交
    $scope.formSubmit = function () {
        //表单验证
        if (!CV.valiForm($scope.form.new_group_form)) {
            return false;
        }
        $scope.new_btn_loading = true;
        //根据每一行是否被选中$scope.newGroupList[i].checked状态来push proj_name和buysis_sys_name
        for (var i = 0; i < $scope.newGroupList.length; i++) {
            if ($scope.newGroupList[i].checked == 1) {
                $scope.new_group_info.proj_list.push({ "project_name": $scope.newGroupList[i].project_name, "business_sys_name": $scope.newGroupList[i].business_sys_name })
            }
        }
        if ($scope.new_group_info.proj_list.length == 0) {
            Modal.alert("请至少选择一个项目", 3);
            $scope.new_btn_loading = false;
            return false;
        };
        //提交项目信息
        Plan.saveOrUpdateGroup($scope.new_group_info).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.new_btn_loading = false;
                    Modal.alert("添加成功", 2);
                    $modalInstance.close(true);
                }
            }, 0);
        }, function (error) {
            $scope.new_btn_loading = false;
            Modal.alert(error.message, 3)
        });
    };
    //取消
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    //初始化
    init();

}]);

/**
 * 计划编列-修改分组
 * */
modal_m.controller('planEditGroupCtrl', ["$scope", "$modalInstance", "$timeout", "Plan", "ProjectNature", "modalParam", "Modal", "CV", function ($scope, $modalInstance, $timeout, Plan, ProjectNature, modalParam, Modal, CV) {
    //分组组号
    var group_id = modalParam.group_id;
    //根据分组组号与日期查询项目列表的参数
    var params = { group_id: group_id, pro_bk_date: modalParam.group_date };

    $scope.col = 'start_bk_time'; //自定义排序标题
    $scope.desc = 0;               //递增排序
    $scope.newGroupList = [];               //未分组项目列表
    $scope.groupList = [];               //当前组项目列表
    $scope.all_checked = false;           //默认全不选
    $scope.form = {};                          //表单信息
    $scope.edit_group_info = {                 //修改信息
        group_id: "",
        group_cn_name: modalParam.group_cn_name,
        proj_list: []
    };

    var init = function () {
        //根据分组组号与日期查询项目列表
        Plan.getProjListByGroup(params).then(function (data) {

            data.rows = data.pj_plan_list ? data.pj_plan_list : [];
            $scope.groupList = data.rows;
            for (var i = 0; i < $scope.groupList.length; i++) {
                //当前项目默认选中状态
                $scope.groupList[i].checked = 1;
                //发布类型中文转换
                $scope.groupList[i].project_nature_cn = CV.findValue($scope.groupList[i].project_nature, ProjectNature);
                //前置项目判断
                $scope.groupList[i].pre_project_short_name = $scope.groupList[i].pre_project_short_name ? $scope.groupList[i].pre_project_short_name : "无";
            }

        }, function (error) {
            Modal.alert(error.message, 3)
        });
        //查询未分组项目列表
        Plan.getCanGroupProjList().then(function (data) {

            data.rows = data.pj_plan_list ? data.pj_plan_list : "";
            $scope.newGroupList = data.rows;
            for (var i = 0; i < $scope.newGroupList.length; i++) {
                //未分组项目默认不选中状态
                $scope.newGroupList[i].checked = 0;
                //发布类型中文转换
                $scope.newGroupList[i].project_nature_cn = CV.findValue($scope.newGroupList[i].project_nature, ProjectNature);
                //前置项目判断
                $scope.newGroupList[i].pre_project_short_name = $scope.newGroupList[i].pre_project_short_name ? $scope.newGroupList[i].pre_project_short_name : "无";
            }

        }, function (error) {
            Modal.alert(error.message, 3)
        });
    };
    //全选按钮
    $scope.selectAll = function (all_checked) {
        if (all_checked) {
            for (var i = 0; i < $scope.newGroupList.length; i++) {
                if ($scope.newGroupList[i].pre_project_short_name == "无") {
                    $scope.newGroupList[i].checked = 1;
                }
            }
            for (var i = 0; i < $scope.groupList.length; i++) {
                if ($scope.groupList[i].pre_project_short_name == "无") {
                    $scope.groupList[i].checked = 1;
                }
            }
        } else {
            for (var i = 0; i < $scope.newGroupList.length; i++) {
                $scope.newGroupList[i].checked = 0;
            }
            for (var i = 0; i < $scope.groupList.length; i++) {
                $scope.groupList[i].checked = 0;
            }
        }
    };
    //撤销
    $scope.cancel = function () {
        $scope.all_checked = false;
        init();
    };
    //提交
    $scope.formSubmit = function () {
        //表单验证
        if (!CV.valiForm($scope.form.edit_group_form)) {
            return false;
        }
        $scope.edit_btn_loading = true;
        //根据每一行是否被选中$scope.newGroupList[i].checked状态来push proj_name和buysis_sys_name
        for (var i = 0; i < $scope.newGroupList.length; i++) {
            if ($scope.newGroupList[i].checked == 1) {
                $scope.edit_group_info.proj_list.push({ "project_name": $scope.newGroupList[i].project_name, "business_sys_name": $scope.newGroupList[i].business_sys_name })
            }

        }
        //根据每一行是否被选中$scope.groupList[i].checked状态来push proj_name和buysis_sys_name
        for (var i = 0; i < $scope.groupList.length; i++) {
            if ($scope.groupList[i].checked == 1) {
                $scope.edit_group_info.proj_list.push({ "project_name": $scope.groupList[i].project_name, "business_sys_name": $scope.groupList[i].business_sys_name })
            }

        }
        //判断至少选择一个项目
        if ($scope.edit_group_info.proj_list.length == 0) {
            $scope.edit_btn_loading = false;
            Modal.confirm("您当前未选择任何项目，请确认是否要删除该分组").then(function () {
                $scope.edit_btn_loading = true;
                //将group_id传进修改信息中
                $scope.edit_group_info.group_id = group_id;
                //提交项目信息
                Plan.saveOrUpdateGroup($scope.edit_group_info).then(function (data) {
                    $timeout(function () {
                        if (data) {
                            $scope.edit_btn_loading = false;
                            Modal.alert("删除成功", 2);
                            $modalInstance.close(true);
                        }
                    }, 1000);
                }, function (error) {
                    $scope.edit_btn_loading = false;
                    Modal.alert(error.message, 3)
                });
            });
        } else {
            //将group_id传进修改信息中
            $scope.edit_group_info.group_id = group_id;
            //提交项目信息
            Plan.saveOrUpdateGroup($scope.edit_group_info).then(function (data) {
                $timeout(function () {
                    if (data) {
                        $scope.edit_btn_loading = false;
                        Modal.alert("修改成功", 2);
                        $modalInstance.close(true);
                    }
                }, 0);
            }, function (error) {
                $scope.edit_btn_loading = false;
                Modal.alert(error.message, 3)
            });
        }
    };
    //取消
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    //初始化
    init();

}]);

/**
 *项目发布-回退评价
 * */
modal_m.controller('RollbackSummaryCtrl', ["$scope", "$modalInstance", "$timeout", "$location", "Exec", "User", "Proj", "ProjectNature", "modalParam", "Modal", "CV", function ($scope, $modalInstance, $timeout, $location, Exec, User, Proj, ProjectNature, modalParam, Modal, CV) {
    //页面控制
    $scope.control = {
        btnBus_loading: false,//加载按钮
        show_user_flag: false
    };
    //表单对象
    $scope.form = {};
    $scope.rollback_summary = {
        business_sys_name: modalParam.busi_sys,
        syspublish_id: modalParam.publish_id,
        project_bk_evaluate: '',           //发布评价
        rollback_flag: modalParam.rollback_flag,  //回退结果
        evaluate_user_cn_name: '', //评价人
        notice_type: 1, //1 为邮件 2 为短信
        notice_users: [], // 所要发送人email的列表
        user_cn_name: '', //单个发送人
        feedback_msg: '',//反馈信息
    };
    //data数据
    $scope.data = {
        select_person: [], //可供选择的邮箱列表
        feedback_type_list: [
            {
                key: 1,
                value: '邮件',
                state: false
            },
            {
                key: 2,
                value: '短信',
                state: false
            }
        ]
    };
    //用于存放发送邮箱的内容信息
    $scope.email_msg = {
        project_name: '',//项目编号
        project_short_name: '',//项目简称
        business_sys_name: '',//应用系统
        project_bk_desc: '',//项目描述
        project_nature_cn: '',//发布类型中文名
        user_cn_name: '',//执行用户
        pj_end_time: '',//发布结束时间
        pj_start_time: '',//发布开始时间
        prod_flag_cn: '',//发布结果中文
        assess_time: '',//评价时间
        assess_msg: '',//评价信息
    };

    var processEmailData = function () {
        var _date = new Date();
        $scope.email_msg.prod_flag_cn = ($scope.rollback_summary.rollback_flag == 1) ? '成功' : '失败';
        $scope.email_msg.assess_time = CV.dtFormat(_date) + ' ' + CV.dttFormat(_date);
        $scope.email_msg.assess_msg = $scope.rollback_summary.project_bk_evaluate;
        $scope.rollback_summary.feedback_msg = [
            '<html><head></head><body>',
            '<div>项目编号 ：' + $scope.email_msg.project_name + '</div>',
            $scope.email_msg.project_short_name ? '<div>项目简称 ：' + $scope.email_msg.project_short_name + '</div>' : '',
            '<div>应用系统 ：' + $scope.email_msg.business_sys_name + '</div>',
            $scope.email_msg.project_bk_desc ? '<div>项目描述 ：' + $scope.email_msg.project_bk_desc + '</div>' : '',
            $scope.email_msg.project_nature_cn ? '<div>发布类型 ：' + $scope.email_msg.project_nature_cn + '</div>' : '',
            $scope.email_msg.user_cn_name ? '<div>执行用户 ：' + $scope.email_msg.user_cn_name + '</div>' : '',
            '<div>开始时间 ：' + $scope.email_msg.pj_start_time + '</div>',
            '<div>结束时间 ：' + $scope.email_msg.pj_end_time + '</div>',
            '<div>回退结果 ：' + $scope.email_msg.prod_flag_cn + '</div>',
            '<div>评价时间 ：' + $scope.email_msg.assess_time + '</div>',
            '<div>回退信息 ：' + $scope.email_msg.assess_msg + '</div>',
            '</body>',
            '</html>'

        ].join("");
    };

    var init = function () {
        //获取回退评价信息
        Exec.getRollbackSummary(modalParam.publish_id, modalParam.busi_sys).then(function (data) {
            console.log(data);
            if (data.rollback_evaluate_info) {
                $scope.rollback_summary.assess_bk_seq = data.rollback_evaluate_info.assess_bk_seq;
                $scope.rollback_summary.project_bk_evaluate = data.rollback_evaluate_info.project_bk_evaluate;
                $scope.rollback_summary.evaluate_user_cn_name = data.rollback_evaluate_info.user_cn_name;
                $scope.rollback_summary.assess_bk_date = data.rollback_evaluate_info.assess_bk_date;
                $scope.rollback_summary.assess_bk_time = data.rollback_evaluate_info.assess_bk_time;
            }
        }, function (error) {
            Modal.alert(error.message, 3);
        });
        //查询用户集合
        User.getAllUserCanExec().then(function (data) {
            $timeout(function () {
                if (data.user_dept_list) {
                    $scope.data.select_person = data.user_dept_list;
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
        });
        /*   //获取项目信息
           Proj.getProjDetail(modalParam.busi_sys,modalParam.project_name).then(function (data) {
               console.log(data);
               if(data.pj_info_detail){
                   $scope.email_msg.project_name = data.pj_info_detail.project_name;
                   $scope.email_msg.project_short_name = data.pj_info_detail.project_short_name;
                   $scope.email_msg.business_sys_name = data.pj_info_detail.business_sys_name;
                   $scope.email_msg.project_bk_desc = data.pj_info_detail.project_bk_desc;
                   $scope.email_msg.project_nature_cn = CV.findValue(data.pj_info_detail.project_nature, ProjectNature);
                   $scope.email_msg.user_cn_name = data.pj_info_detail.user_cn_name;
               }
           },function (error) {
               Modal.alert(error.message,3);
           });*/
        //获取回退信息
        /* Exec.getHistroyRollbackInfo(modalParam.busi_sys,modalParam.publish_id).then(function (data) {
             if(data.rollback_list){
                 console.log(data);
                 $scope.email_msg.pj_start_time = data.rollback_list[data.rollback_list.length-1].start_bk_tm;
                 $scope.email_msg.pj_end_time = data.rollback_list[data.rollback_list.length-1].end_bk_tm;
                 $scope.email_msg.project_name = data.rollback_list[data.rollback_list.length-1].project_name;
                 $scope.email_msg.business_sys_name = data.rollback_list[data.rollback_list.length-1].business_sys_name;
             }
         },function (error) {

         });*/
    };

    //选择反馈类型
    $scope.chooseFeedBackType = function (type) {
        if (type.state) {
            $scope.control.show_user_flag = true;
        } else {
            $scope.control.show_user_flag = false;
            $scope.control.user_is_none = false;
            $scope.rollback_summary.notice_users = [];
            $scope.rollback_summary.user_cn_name = '';
        }
    };
    //添加单个email邮箱
    $scope.addEmailAddress = function (address) {
        var _flag = 0;
        if (!address) {
            Modal.alert("收件人不能为空！", 3);
            return false;
        }
        if ($scope.rollback_summary.notice_users.length != 0) {
            for (var j = 0; j < $scope.rollback_summary.notice_users.length; j++) {
                var _user = $scope.rollback_summary.notice_users[j];
                if (_user.user_cn_name == address) {
                    Modal.alert("收件人已经添加过！请添加新收件人", 3);
                    $scope.rollback_summary.user_cn_name = '';
                    return false;
                }
            }
        }
        for (var i = 0; i < $scope.data.select_person.length; i++) {
            var _one = $scope.data.select_person[i];
            if (_one.user_cn_name == address) {
                _flag++;
                $scope.rollback_summary.notice_users.push(_one);
                break;
            }
        };
        if (_flag == 0) {
            Modal.alert("用户不存在！请重新添加！", 3);
        };
        $scope.rollback_summary.user_cn_name = '';
    };
    //删除发送的邮件人
    $scope.deleteSingleUser = function (index) {
        $scope.rollback_summary.notice_users.splice(index, 1);
    };
    $scope.formSubmit = function () {
        //表单验证
        if (!CV.valiForm($scope.form.rollback_form)) {
            return false;
        };
        processEmailData();
        $scope.control.btnBus_loading = true;
        Exec.editRollbackSummary($scope.rollback_summary).then(function (data) {
            Modal.alert("评价完成！", 2);
            $scope.control.btnBus_loading = false;
            $modalInstance.close(data);
        }, function (error) {
            $scope.control.btnBus_loading = false;
            Modal.alert(error.message, 3);
        });

    };
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *项目发布-发布评价
 * */
modal_m.controller('SummaryCtrl', ["$scope", "$modalInstance", "$location", "$timeout", "Exec", "User", "Proj", "IssueType", "ProjectNature", "modalParam", "Modal", "CV", function ($scope, $modalInstance, $location, $timeout, Exec, User, Proj, IssueType, ProjectNature, modalParam, Modal, CV) {
    //提交的评价信息
    $scope.summary = {
        business_sys_name: modalParam.busi_sys,
        syspublish_id: modalParam.publish_id,
        prod_flag: 1,
        problem_type_list: [],
        project_evaluate_list: [],
        project_bk_evaluate: '',
        project_evaluate: {},
        notice_type: 1, //1 为邮件 2 为短信
        notice_users: [], // 所要发送人email的列表
        user_cn_name: '', //单个发送人
        feedback_msg: '',//反馈信息
    };
    //页面控制
    $scope.control = {
        btnBus_loading: false,
        show_user_flag: false
    };
    //data数据
    $scope.data = {
        select_person: [], //可供选择的邮箱列表
        feedback_type_list: [
            {
                key: 1,
                value: '邮件',
                state: false
            },
            {
                key: 2,
                value: '短信',
                state: false
            }
        ]
    };
    //用于存放发送邮箱的内容信息
    $scope.email_msg = {
        syspublish_id: '',//项目编号
        project_short_name: '',//项目简称
        business_sys_name: '',//应用系统
        project_bk_desc: '',//项目描述
        project_nature_cn: '',//发布类型中文名
        user_cn_name: '',//执行用户
        pj_end_time: '',//发布结束时间
        pj_start_time: '',//发布开始时间
        prod_flag_cn: '',//发布结果中文
        assess_time: '',//评价时间
        assess_msg: '',//评价信息
        problem_type: '',//问题类型
    };
    //历史项目（发布结果默认为失败）
    var path = $location.url();
    var URL = path.substring(0, path.indexOf("/", 10));
    if (URL == "/finish_proj") {
        $scope.summary.prod_flag = 2;
    }
    //处理email数据
    var processEmailData = function () {
        var _date = new Date();
        var _problem_type_list = [];
        $scope.email_msg.prod_flag_cn = ($scope.summary.prod_flag == 1) ? '成功' : '失败';
        $scope.email_msg.assess_time = CV.dtFormat(_date) + ' ' + CV.dttFormat(_date);
        $scope.email_msg.assess_msg = $scope.summary.project_bk_evaluate;
        if ($scope.summary.problem_type_list.length != 0) {
            for (var j = 0; j < $scope.summary.problem_type_list.length; j++) {
                _problem_type_list.push(CV.findValue($scope.summary.problem_type_list[j], IssueType));
            }
            $scope.email_msg.problem_type = _problem_type_list.join('|');
        }
        $scope.summary.feedback_msg = [
            '<html><head></head><body>',
            '<div>项目编号 ：' + $scope.email_msg.project_name + '</div>',
            '<div>项目简称 ：' + $scope.email_msg.project_short_name + '</div>',
            '<div>应用系统 ：' + $scope.email_msg.business_sys_name + '</div>',
            '<div>项目描述 ：' + $scope.email_msg.project_bk_desc + '</div>',
            '<div>发布类型 ：' + $scope.email_msg.project_nature_cn + '</div>',
            '<div>执行用户 ：' + $scope.email_msg.user_cn_name + '</div>',
            '<div>开始时间 ：' + $scope.email_msg.pj_start_time + '</div>',
            '<div>结束时间 ：' + $scope.email_msg.pj_end_time + '</div>',
            '<div>发布结果 ：' + $scope.email_msg.prod_flag_cn + '</div>',
            '<div>评价时间 ：' + $scope.email_msg.assess_time + '</div>',
            '<div>评价信息 ：' + $scope.email_msg.assess_msg + '</div>',
            $scope.email_msg.problem_type ? '<div>问题类型 ：' + $scope.email_msg.problem_type + '</div>' : '',
            '</body>',
            '</html>'

        ].join("");
    };

    var init = function () {
        $scope.all_problem_type = angular.copy(IssueType);
        //展示评价信息
        Exec.showSummaryProd(modalParam.busi_sys, modalParam.publish_id).then(function (data) {
            if (data.pj_evaluate_bean) {
                $scope.summary.prod_flag = data.pj_evaluate_bean.prod_flag ? data.pj_evaluate_bean.prod_flag : 1;
                $scope.summary.problem_type_list = data.pj_evaluate_bean.problem_type_list ? data.pj_evaluate_bean.problem_type_list : [];
                for (var i = 0; i < $scope.all_problem_type.length; i++) {
                    var _all_problem_i = $scope.all_problem_type[i];
                    if ($scope.summary.problem_type_list.indexOf(_all_problem_i.key) == -1) {
                        _all_problem_i.checked = false;
                    } else {
                        _all_problem_i.checked = true;
                    }
                }
                // $scope.summary.project_evaluate_list = data.pj_evaluate_bean.project_evaluate_list ? data.pj_evaluate_bean.project_evaluate_list : [];
                if (data.pj_evaluate_bean.projectAssessInfo) {
                    $scope.summary.project_evaluate = data.pj_evaluate_bean.projectAssessInfo;
                    $scope.summary.project_bk_evaluate = $scope.summary.project_evaluate.project_bk_evaluate;
                }
            }
        }, function (error) {
            Modal.alert(error.message, 3);
        });
        //查询用户集合
        User.getAllUserCanExec().then(function (data) {
            $timeout(function () {
                if (data.user_dept_list) {
                    $scope.data.select_person = data.user_dept_list;
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
        });
        /*        //获取项目信息
                Exec.getSysPubDetail(modalParam.busi_sys,modalParam.publish_id).then(function (data) {
                       if(data.pj_info_detail){
                           console.log(data);
                           $scope.email_msg.project_name = data.pj_info_detail.project_name;
                           $scope.email_msg.project_short_name = data.pj_info_detail.project_short_name;
                           $scope.email_msg.business_sys_name = data.pj_info_detail.business_sys_name;
                           $scope.email_msg.project_bk_desc = data.pj_info_detail.project_bk_desc;
                           $scope.email_msg.project_nature_cn = CV.findValue(data.pj_info_detail.project_nature, ProjectNature);
                           $scope.email_msg.user_cn_name = data.pj_info_detail.user_cn_name;
                           $scope.email_msg.pj_end_time = data.pj_info_detail.pj_end_time;
                           $scope.email_msg.pj_start_time = data.pj_info_detail.pj_start_time;
                       }
                },function (error) {
                    Modal.alert(error.message,3);
                })*/
    };
    //选择反馈类型
    $scope.chooseFeedBackType = function (type) {
        if (type.state) {
            $scope.control.show_user_flag = true;
        } else {
            $scope.control.show_user_flag = false;
            $scope.control.user_is_none = false;
            $scope.summary.notice_users = [];
            $scope.summary.user_cn_name = '';
        }
    };
    //添加单个email邮箱
    $scope.addEmailAddress = function (address) {
        var _flag = 0;
        if (!address) {
            Modal.alert("收件人不能为空！", 3);
            return false;
        }
        if ($scope.summary.notice_users.length != 0) {
            for (var j = 0; j < $scope.summary.notice_users.length; j++) {
                var _user = $scope.summary.notice_users[j];
                if (_user.user_cn_name == address) {
                    Modal.alert("收件人已经添加过！请添加新收件人", 3);
                    $scope.summary.user_cn_name = '';
                    return false;
                }
            }
        }
        for (var i = 0; i < $scope.data.select_person.length; i++) {
            var _one = $scope.data.select_person[i];
            if (_one.user_cn_name == address) {
                _flag++;
                $scope.summary.notice_users.push(_one);
                break;
            }
        };
        if (_flag == 0) {
            Modal.alert("用户不存在！请重新添加！", 3);
        };
        $scope.control.user_is_none = false;
        $scope.summary.user_cn_name = '';
    };
    //删除发送的邮件人
    $scope.deleteSingleUser = function (index) {
        $scope.summary.notice_users.splice(index, 1);
    };
    //确认
    $scope.ok = function () {
        //已勾选的问题类型
        $scope.summary.problem_type_list = [];
        for (var i = 0; i < $scope.all_problem_type.length; i++) {
            if ($scope.all_problem_type[i].checked) {
                $scope.summary.problem_type_list.push($scope.all_problem_type[i].key);
            }
        }
        //保存校验
        if ($scope.control.show_user_flag && $scope.summary.notice_users.length == 0) {
            $scope.control.user_is_none = true;
            return false;
        }
        if ($scope.summary.problem_type_list.length == 0 && $scope.summary.prod_flag == 2) {
            Modal.alert("未选择问题类型！", 3);
            return false;
        } else if (!$scope.summary.project_bk_evaluate) {
            Modal.alert("未填写总结评价！", 3);
            return false;
        } else {
            processEmailData();
            $scope.control.btnBus_loading = true;
            Exec.summaryProd($scope.summary).then(function (data) {
                Modal.alert("评价完成！", 2);
                $scope.control.btnBus_loading = false;
                $modalInstance.close(data);
            }, function (error) {
                $scope.control.btnBus_loading = false;
                Modal.alert(error.message, 3);
            });
        }
    };
    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *发布准备-添加发布(包 & 清单)
 * */
modal_m.controller('addPordPacModalCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Collection", "CmptFunc", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Collection, CmptFunc, Modal, CV) {
    var _pac_index = modalParam.pac_index;//投产包列表序号
    var _pac_flag = modalParam.pac_flag;//1为从本地，2是版本机
    var _soc_name = modalParam.pre_info.version_soc_name;
    $scope.control = {
        package_list_flag: modalParam.is_prod_list,
        show_real: false,
        propackage_btn_loading: false,
    };
    $scope.info = {
        packlist_info: angular.copy(modalParam.pre_info),
        form: {},
        version_info: {
            soc_name: _soc_name,
            root_bk_dir: "",
            init_path: (modalParam.propackage_bk_path != "/") ? modalParam.propackage_bk_path : "",
            loading: false,
            full_path: ""
        }
    };
    $scope.config = {
        prodpackage_fileupload: {//发布包上传控件
            suffixs: '',
            filetype: "",
            filenames: [],
            uploadpath: modalParam.fileupload_path
        },
        prodlist_fileupload: {//清单上传控件
            suffixs: 'xls,xlsx',
            filetype: "EXCEL",
            filename: '',
            uploadpath: modalParam.fileupload_path
        },
    };
    //发布包不可以重复校验
    var validPodPacNoRepeat = function () {
        var _repeat_flag = false;
        var _package_name_list = $scope.info.packlist_info.propackage_list[_pac_index].package_name_list;
        for (var i = 0; i < _package_name_list.length; i++) {
            var _one_pack = _package_name_list[i];
            for (var j = 0; j < $scope.info.version_info.checked_files.length; j++) {
                var _one_file = $scope.info.version_info.checked_files[j];
                if (_one_pack.propackage_full_path.substring(_one_pack.propackage_full_path.lastIndexOf("/") + 1, _one_pack.propackage_full_path.length) == _one_file.file) {
                    _repeat_flag = true;
                    break;
                }
            }
        }
        return _repeat_flag;
    };
    //发布包不可以重复-本地上传
    var localValidPodPacNoRepeat = function () {
        var _repeat_flag = false;
        var _package_name_list = $scope.info.packlist_info.propackage_list[_pac_index].package_name_list;
        for (var i = 0; i < _package_name_list.length; i++) {
            var _one_pack = _package_name_list[i];
            if (_one_pack.propackage_full_path.substring(_one_pack.propackage_full_path.lastIndexOf("/") + 1, _one_pack.propackage_full_path.length) == $scope.config.prodpackage_fileupload.filename) {
                _repeat_flag = true;
                break;
            }
        }
        return _repeat_flag;
    }
    //添加发布包
    var pushProdPac = function () {
        if ($scope.info.packlist_info.upload_flag == 2) {
            for (var i = 0; i < $scope.info.version_info.checked_files.length; i++) {
                var _one_file = $scope.info.version_info.checked_files[i];
                var _real_path = _one_file.path + "/" + _one_file.file;
                var _one_real_pack = {
                    propackage_full_path: _real_path
                }
                $scope.info.packlist_info.propackage_list[_pac_index].package_name_list.push(_one_real_pack);
                $scope.info.packlist_info.propackage_list[_pac_index].propackage_full_path.push(_real_path);
                $scope.info.packlist_info.propackage_list[_pac_index].package_list.push(_one_file.file);
            }
        } else {
            for (var i = 0; i < $scope.config.prodpackage_fileupload.filenames.length; i++) {
                var _filename = $scope.config.prodpackage_fileupload.filenames[i];
                var _exsit = false;
                var _filepath = $scope.config.prodpackage_fileupload.uploadpath + _filename;
                for (var j = 0; j < $scope.info.packlist_info.propackage_list[_pac_index].package_name_list.length; j++) {
                    var _path = $scope.info.packlist_info.propackage_list[_pac_index].package_name_list[j].propackage_full_path;
                    if (_filepath == _path) {
                        _exsit = true;
                        break;
                    }
                }
                if (!_exsit) {
                    $scope.info.packlist_info.propackage_list[_pac_index].package_name_list.push({ propackage_full_path: _filepath });
                    $scope.info.packlist_info.propackage_list[_pac_index].propackage_full_path.push(_filepath);
                    $scope.info.packlist_info.propackage_list[_pac_index].package_list.push(_filename);
                }

            }
        }

    };
    //初始化节点信息
    var getAllNodePath = function () {
        $scope.info.version_info.checked_files = [];
        $scope.info.version_info.paths = [];
        $scope.info.version_info.active = false;
        $scope.info.version_info.loading = false;
    };
    var init = function () {
        //1.上传2.远程
        if ($scope.info.packlist_info.upload_flag == 2) {
            if ($scope.control.package_list_flag) {
                $scope.info.version_info.init_path = (modalParam.prolist_bk_path != "/") ? modalParam.prolist_bk_path : "";
            } else {
                $scope.info.version_info.init_path = (modalParam.propackage_bk_path != "/") ? modalParam.propackage_bk_path : "";
            }
            if (!$scope.info.version_info.init_path) {
                Collection.getFileListBySoc(_soc_name, $scope.info.version_info.init_path).then(function (data) {
                    getAllNodePath();
                    $scope.info.version_info.path_files = data.file_bean_list ? data.file_bean_list : [];
                    $scope.info.version_info.full_path = data.root_bk_dir ? data.root_bk_dir : "";
                    $scope.info.version_info.init_path = data.root_bk_dir ? data.root_bk_dir : "";
                    $scope.control.show_real = true;
                }, function (error) {
                    Modal.alert(error.message, 3);
                    $modalInstance.dismiss();
                });
            } else {
                $timeout(function () {
                    $scope.control.show_real = true;
                }, 1000);
            }
        }
    };
    //new清单-从本地-上传成功
    $scope.uploadProdListSuccessThen = function () {
        $scope.info.packlist_info.prolist_full_path = $scope.config.prodlist_fileupload.uploadpath + $scope.config.prodlist_fileupload.filename;
    };
    //new清单-从本地-清单删除
    $scope.removeProdListFile = function () {
        $scope.config.prodlist_fileupload.filename = '';
        $scope.info.packlist_info.prolist_full_path = '';
    };
    //new清单-从本地-清单下载
    $scope.downloadProdListFile = function () {
        CV.downloadFile($scope.config.prodlist_fileupload.uploadpath + $scope.info.packlist_info.prolist_full_path.substring($scope.info.packlist_info.prolist_full_path.lastIndexOf("/") + 1, $scope.info.packlist_info.prolist_full_path.length));
    };
    //new发布包-从本地-包下载
    $scope.removeProdPackage = function () {

    };
    //new发布包-从本地-包删除
    $scope.downloadProdPackage = function () {

    };
    //重置
    $scope.resetDpp = function () {
        //表单初始化
        if ($scope.control.package_list_flag) {
            $scope.info.packlist_info.prolist_full_path = modalParam.pre_info.prolist_full_path;
            $scope.info.version_info.checked_files = [];
            $scope.changePath($scope.info.version_info)
            if ($scope.info.packlist_info.upload_flag == 1) {
                $scope.config.prodlist_fileupload.filenames = [];
            }
        } else {
            $scope.info.version_info.checked_files = [];
            $scope.changePath($scope.info.version_info)
            if ($scope.info.packlist_info.upload_flag == 1) {
                $scope.config.prodpackage_fileupload.filenames = [];
            }
        }
        $scope.info.form.newDppForm.$setPristine();
    };
    //保存表单
    $scope.prodPacSubmit = function () {
        if (!CV.valiForm($scope.info.form.newDppForm)) {
            return false;
        }
        //添加清单
        if ($scope.control.package_list_flag) {
            var _list_file = "";
            if ($scope.info.packlist_info.upload_flag == 1 && !$scope.config.prodlist_fileupload.filename) {
                Modal.alert("请上传本地清单文件！");
                return false;
            }
            if ($scope.info.packlist_info.upload_flag == 2) {
                if ($scope.info.version_info.checked_files.length == 0) {
                    Modal.alert("请选择清单文件！");
                    return false;
                }
            }
            if ($scope.info.version_info.checked_files && $scope.info.version_info.checked_files.length > 0) {
                _list_file = $scope.info.version_info.checked_files[0];
                $scope.info.packlist_info.prolist_full_path = $scope.info.version_info.full_path + "/" + _list_file.file;
            }
            $scope.control.propackage_btn_loading = true;
            var _data = {
                prolist_full_path: $scope.info.packlist_info.prolist_full_path,
            };
            $modalInstance.close(_data);
        } else { //添加发布包
            if ($scope.info.version_info.upload_flag == 1 && $scope.config.prodpackage_fileupload.filenames.length == 0) {
                Modal.alert("请上传本地发布包！");
                return false;
            }
            if ($scope.info.version_info.upload_flag == 2) {
                if ($scope.info.version_info.checked_files.length == 0) {
                    Modal.alert("请选择发布包！");
                    return false;
                }
            }
            if ($scope.info.version_info.upload_flag == 2) {
                if (validPodPacNoRepeat()) {
                    Modal.alert("发布包已经存在!");
                    $scope.control.propackage_btn_loading = false;
                    return false;
                }
            } else if ($scope.info.upload_flag == 1) {
                if (localValidPodPacNoRepeat()) {
                    Modal.alert("发布包已经存在!");
                    $scope.control.propackage_btn_loading = false;
                    return false;
                }
            }
            pushProdPac(_pac_flag);
            $scope.control.propackage_btn_loading = true;
            var data = {
                dpp_param_info: $scope.info.packlist_info,
                propackage_full_path: $scope.info.packlist_info.propackage_full_path
            };
            $modalInstance.close(data);
        }
        $scope.control.propackage_btn_loading = false;
    };
    //展示目录文件列表
    $scope.changePath = function (node) {
        node.loading = true;
        Collection.getFileListBySoc(_soc_name, node.full_path).then(function (data) {
            node.loading = false;
            node.path_files = data.file_bean_list ? data.file_bean_list : [];
        }, function (error) {
            node.loading = false;
            node.err_msg = error.message;
        });
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    init();
}]);
/**
 *发布准备-添加发布包 -- 从平台获取
 * */
modal_m.controller('addPlatformPackageModalCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Exec", "ScrollConfig", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Exec, ScrollConfig, Modal, CV) {
    var _pac_index = modalParam.pac_index;//投产包列表序号
    var _sys_publish_id = modalParam.sys_publish_id;//系统发布id

    $scope.control = {
        propackage_btn_loading: false,
    };
    $scope.data = {
        dir_names: angular.copy(modalParam.dir_names) || {},
    };
    $scope.configs = {
        scroll_info: ScrollConfig
    };
    $scope.info = {
        form: {},
        file_nodes : {
            nodes : [],
            choosed_file_list: []
        }
    };

    var init = function () {
        var _nodes = angular.copy(modalParam.dir_names) || {};
        $scope.info.file_nodes.nodes = _nodes.nodes;
    };

    //保存表单
    $scope.prodPacSubmit = function () {
        $scope.control.propackage_btn_loading = true;
        var _reqList = [];
        var _showList = [];
        for (var k = 0; k < $scope.info.file_nodes.choosed_file_list.length; k++) {
            var _dir_name = $scope.info.file_nodes.choosed_file_list[k];
            _reqList.push(_dir_name.file_path);
            _showList.push(_dir_name.file);
        }
        Exec.savePlatFilePath(_sys_publish_id, _reqList).then(function (data) {
            if (data) {
                $scope.control.propackage_btn_loading = false;
                $modalInstance.close({package_list:_showList,propackage_full_path :_reqList });
            }
        }, function (error) {
            $scope.control.propackage_btn_loading = false;
            Modal.alert(error.message, 3);
        });
    };

    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    init();
}]);

/**
 *发布执行-人机交互对话框
 * */
modal_m.controller('showHumanInteractCtrl', ["$scope", "$modalInstance", "$timeout", "$interval", "modalParam", "Modal", "Exec", "CmptFunc", "CodeMirrorOption", "CV", function ($scope, $modalInstance, $timeout, $interval, modalParam, Modal, Exec, CmptFunc, CodeMirrorOption, CV) {
    var _interval;
    var _execute_id = modalParam.execute_id;
    var _phase_no = modalParam.phaseId;
    var _steps = modalParam.steps;

    $scope.get_loading = true;

    //公共-参数默认值输入框智能提示
    $scope.paramShellLoaded = function (_editor) {
        CodeMirrorOption.showParamsEditor(_editor, $scope);
    };
    $scope.form = {};
    //交互信息对象
    $scope.interact_info = {
        interact_msg: '',//脚本内容信息
        label_send_cmd_msg: '',//密文显示十个黑点
        send_cmd_msg: '',//发送命令
        end_interact_flag: false,
    };
    $scope.data = {
        interact_dialog_list: [],
        key_word_list: []
    };
    //滚动条配置
    $scope.scroll_dialog_info = {
        axis: "y",
        theme: "custom-dark",
        scrollbarPosition: "inside",
        scrollInertia: 400,
        scrollEasing: "easeOutCirc",
        autoDraggerLength: true,
        autoHideScrollbar: true,
        scrollButtons: { enable: false }
    };
    //获取交互信息
    var getMonitorInteractMsg = function () {
        Exec.getMonitorInteractLogMsg(_execute_id, _phase_no).then(function (data) {
            if (data.msg) {
                //获取每次对话内容
                $scope.data.interact_dialog_list.push({ msg: CmptFunc.stringToCmds(data.msg), type: 1 });
                scrollText();
            }
            if (data.param_list) {
                $scope.data.key_word_list = translateSelectList(data.param_list)
            }
            if (data.end_flag) {
                $scope.interact_info.end_interact_flag = true;
            }
            $scope.get_loading = false;
        }, function (error) {
            $interval.cancel(_interval);
            Modal.alert(error.message, 3);
        });

    };
    //获取脚本信息内容
    var getExecCmdMsg = function () {
        for (var i = 0; i < _steps.length; i++) {
            for (var j = 0; j < _steps[i].phase_list.length; j++) {
                var _phase = _steps[i].phase_list[j];
                if (_phase.phase_no == _phase_no) {
                    if (_phase.exe_script) {
                        $scope.interact_info.interact_msg = CmptFunc.stringToCmds(_phase.exe_script);
                    }
                }
            }

        }
    };
    //控制台滚动文字
    var scrollText = function () {
        $timeout(function () {
            $('.dialog_wrap').mCustomScrollbar("scrollTo", "bottom", {
                scrollEasing: "linear"
            });
        }, 200);
    };
    //转化可选择列表
    var translateSelectList = function (list) {
        var _new_list = [];
        for (var i = 0; i < list.length; i++) {
            var _param = list[i];
            _param.param_cn_name = _param.param_cn_name ? _param.param_cn_name : '--';
            _new_list.push({ key: '${' + _param.param_name + '}', text: '${' + _param.param_name + '} [' + _param.param_cn_name + ']' })
        }
        return _new_list;
    };

    var init = function () {
        getExecCmdMsg();
        _interval = $interval(function () {
            getMonitorInteractMsg();
        }, 3000);
        $scope.$watch('interact_info.end_interact_flag', function () {
            if ($scope.interact_info.end_interact_flag) {
                $interval.cancel(_interval);
            }
        })
    };
    //切换命令的显示方式
    $scope.toggleShowStyle = function (flag) {
        $scope.show_flag = flag;
        if (flag && $scope.interact_info.send_cmd_msg) {
            //密文显示10个黑点
            $scope.interact_info.label_send_cmd_msg = '1111111111';
        }
    };
    //发送命令
    $scope.sendCmdMsg = function () {
        if (!$scope.interact_info.send_cmd_msg) {
            return false;
        }
        var _flag = $scope.show_flag;
        //发送交互命令
        Exec.sendInteractCmdMsg(_execute_id, _phase_no, $scope.interact_info.send_cmd_msg, _flag).then(function (data) {
            $scope.data.interact_dialog_list.push({ msg: $scope.interact_info.send_cmd_msg, type: 2, show_flag: _flag });
            scrollText();
            $scope.interact_info.send_cmd_msg = '';
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    };
    //取消按钮
    $scope.cancel = function (flag) {
        if (flag == 1) {
            $modalInstance.close(true);
            $interval.cancel(_interval);
        } else {
            if ($scope.interact_info.end_interact_flag) {
                $modalInstance.close(true);
                $interval.cancel(_interval);
            } else {
                Modal.confirm("交互正在进行中,请确认是否退出交互并停止？").then(function () {
                    $modalInstance.close(false);
                    $interval.cancel(_interval);
                });
            }
        }
    };
    init()
}]);

/**
 *发布回退-选择回退方案及节点弹窗
 * */
modal_m.controller('chooseRollbackProgCtrl', ["$scope", "$modalInstance", "$timeout", "$sce", "Exec", "modalParam", "Modal", "CodeMirrorOption", "BusiSys", "ScrollConfig", "BsysFunc", "CmptFunc", "ProtocolType", "CV", function ($scope, $modalInstance, $timeout, $sce, Exec, modalParam, Modal, CodeMirrorOption, BusiSys, ScrollConfig, BsysFunc, CmptFunc, ProtocolType, CV) {
    var _business_sys_name = modalParam.business_sys_name;
    var _syspublish_id = modalParam.publish_id;
    var _propackage_bk_path = "", //发布包根路径
        _fileupload_path = ''; //上传根路径

    //隔离父表单
    $scope.form = {};
    //回退信息对象
    $scope.rollback_info = {
        business_sys_name: _business_sys_name,
        syspublish_id: _syspublish_id,
        prepare_msg: {},
        prog_cn_name: '',
        prog_id: '',
        group_list: [],
        param_list: [],
        propackage_list: []
    };
    //data数据
    $scope.data = {
        node_list: [], //节点列表
        rollBack_program_list: [],//回退方案列表
        rollback_info_list: [], //历史回退信息列表
    };
    //页面控制
    $scope.control = {
        get_prog_loading: false, // 获取方案信息loading
        get_prog_list_loading: false,//获取方案列表loading
        soc_flag: false,//方案显示数据源标志
        valid_prog_complete: false, //方案完整性校验完成标志
        valid_prog_loading: false, // 方案完整性校验loading
        get_prog_complete: false,
        get_node_list_loading: false,
        btnBus_loading: false,
        param_list_flag: false,
    };
    //页面配置对象
    $scope.config = {
        rollback_scroll: ScrollConfig
    };
    //公共-参数默认值输入框智能提示
    $scope.paramShellLoaded = function (_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
        $timeout(function () {
            $scope.code_reflash = true;
        }, 0);
    };
    //执行脚本内容
    $scope.viewOptions = CodeMirrorOption.Sh(true);
    //获取系统下节点列表
    var getNodeList = function (list) {
        $scope.control.get_node_list_loading = true;
        $scope.data.node_list = [];
        var _node_list = list ? list : [];
        for (var i = 0; i < _node_list.length; i++) {
            $scope.data.node_list.push({ soc_ip: _node_list[i], is_checked: true })
        }
        $timeout(function () {
            $scope.control.get_node_list_loading = false;
        }, 1000)
    };
    //获取系统下可用的回退方案列表
    var getRollbackProgList = function () {
        $scope.control.get_prog_list_loading = true;
        /*第一个参数系统名，第二个参数发布状态（1 发布 2 未发布），第三个参数方案类型（1 发布方案 2 回退方案）*/
        BusiSys.getAllProgramList(_business_sys_name, 1, 2).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.control.get_prog_list_loading = false;
                    $scope.data.rollBack_program_list = data.program_list ? data.program_list : [];
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
            $scope.control.get_prog_list_loading = false;
        });
    };
    //获取历史回退信息
    var getHistroyRollbackInfo = function () {
        Exec.getHistroyRollbackInfo(_business_sys_name, _syspublish_id).then(function (data) {
            if (data) {
                $scope.data.rollback_info_list = data.rollback_list ? data.rollback_list : [];
            }
        }, function (error) {

        });
    };
    //判断参数列表是否都是节点参数
    var judgeParamListFlag = function (list) {
        var _flag = 0;
        for (var i = 0; i < list.length; i++) {
            var _param = list[i];
            if (_param.param_type != 3) {
                _flag++;
            }
        }
        if (_flag == 0) {
            $scope.control.param_list_flag = true;
        }
    };

    //绑定发布包信息
    var bindPropackageList = function (pac_list) {
        //获取发布包类型列表
        var _propackage_list = pac_list ? pac_list : [];
        for (var i = 0; i < _propackage_list.length; i++) {
            var _package = _propackage_list[i];
            _package.package_name_list = [];
            _package.package_list = [];
            _package.propackage_full_path = _package.propackage_full_path ? _package.propackage_full_path : [];
            for (var j = 0; j < _package.propackage_full_path.length; j++) {
                _package.package_name_list.push({ propackage_full_path: _package.propackage_full_path[j] });
            }
        }
        $scope.rollback_info.propackage_list = _propackage_list;
    };
    //new验证发布包添加完整性
    var valiProdPacComplete = function () {
        for (var i = 0; i < $scope.rollback_info.propackage_list.length; i++) {
            var _propackage = $scope.rollback_info.propackage_list[i];
            if (_propackage.required_flag) {
                if (_propackage.package_name_list.length == 0) {
                    $scope.control.package_exsit_flag = true;
                    break;
                }
            }
        }
        return !$scope.control.package_exsit_flag;
    };
    //验证发布包是不是存在
    var validateProdPacExist = function (prod_pac, data) {
        for (var i = 0; i < prod_pac.package_name_list.length; i++) {
            var _prodpackage = prod_pac.package_name_list[i];
            //修改后
            validPropac(_prodpackage, data, prod_pac);
        }
    };
    //验证单个发布包（验证重名加下载）
    var validPropac = function (prodpackage, data, prod_pac) {
        prod_pac.add_pac_btn_disable = true;
        prodpackage.is_exsit_loading = true;
        prodpackage.no_exsit = false;
        Exec.downloadProdListFile(_business_sys_name, _project_name, $scope.rollback_info.version_soc_name, prodpackage.propackage_full_path).then(function (data) {
            prodpackage.is_exsit_loading = false;
            prod_pac.add_pac_btn_disable = false;
        }, function (error) {
            prod_pac.add_pac_btn_disable = false;
            prodpackage.is_exsit_loading = false;
            prodpackage.no_exsit = true;
            Modal.alert(error.message, 3);
        });
    };

    var init = function () {
        //获取所在系统的节点列表
        // getNodeList();
        //获取所在系统发布的回退方案列表
        getRollbackProgList();
        //获取历史回退信息
        getHistroyRollbackInfo();
    };
    //选择回退方案
    $scope.selectProgram = function (selectKey) {
        $scope.rollback_info.prog_id = selectKey;
        $scope.rollback_info.propackage_list = [];
        $scope.control.valid_prog_complete = false;
        $scope.control.valid_prog_loading = true;
        $scope.control.get_prog_complete = false;
        //验证方案完整性
        BusiSys.validateProgComplete($scope.rollback_info.prog_id).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.control.valid_prog_loading = false; //loading结束
                    $scope.control.valid_prog_complete = true; //验证完成
                    //获取方案信息
                    $scope.errorMessage = "";
                    //加载方案中
                    $scope.control.get_prog_loading = true;
                    //获取清单和发布包信息
                    Exec.getReadyPacParamInfo(_syspublish_id, $scope.rollback_info.prog_id).then(function (data) {
                        console.log(data);
                        if (data) {
                            $scope.rollback_info.prepare_msg = data.prepare_msg;
                            $scope.rollback_info.version_soc_name = data.version_soc_name;
                            $scope.rollback_info.upload_flag = data.version_soc_name ? 2 : 1;
                            $scope.rollback_info.param_list = data.prepare_msg.param_list ? data.prepare_msg.param_list : [];
                            judgeParamListFlag($scope.rollback_info.param_list);
                            $scope.rollback_info.group_list = data.prepare_msg.group_list ? data.prepare_msg.group_list : [];
                            BsysFunc.processProgDate($scope.rollback_info.group_list, data.prepare_msg.pac_type_list);
                            getNodeList(data.node_list);
                            //绑定包
                            bindPropackageList(data.prepare_msg.pac_type_list);
                            _fileupload_path = data.file_upload_path;
                            _propackage_bk_path = data.dftpropac_bk_dir;
                            //加载成功
                            $scope.control.get_prog_loading = false;
                            $scope.control.get_prog_complete = true;
                        }
                    }, function (error) {
                        Modal.alert(error.message, 3)
                    });
                    /*Exec.getRollbackReadyPacParamInfo(_business_sys_name, _project_name,$scope.rollback_info.prog_id).then(function(data){
                        $timeout(function(){
                            if(data){
                                $scope.rollback_info.upload_flag = data.upload_flag ? data.upload_flag : 1;
                                $scope.rollback_info.version_soc_name = data.version_soc_name;
                                $scope.rollback_info.param_list = data.param_list ? data.param_list : [];
                                $scope.rollback_info.group_list = data.group_list ? data.group_list :[];
                                for(var i=0;i<$scope.rollback_info.group_list.length;i++){
                                    var _group = $scope.rollback_info.group_list[i];
                                    _group.nav_show_flag = 0;// //默认方案阶段全部收起
                                    _group.expand_flag = false;// //默认阶段收起
                                    _group.phase_list = BsysFunc.dealPhase(_group.phase_list);
                                    for(var j=0;j<_group.phase_list.length;j++){
                                        if(_group.phase_list[j].script && _group.phase_list[j].script.cmds){
                                            _group.phase_list[j].exec_script = CmptFunc.cmdsToString(_group.phase_list[j].script.cmds);
                                        }
                                        if(_group.phase_list[j].phase_type == 6){
                                            _group.phase_list[j].url_detail = $sce.trustAsHtml(_group.phase_list[j].script.cmds[0])
                                        }
                                        //添加
                                        if(_group.phase_list[j].command && _group.phase_list[j].command.cmds){
                                            _group.phase_list[j].command.exec_script=CmptFunc.cmdsToString(_group.phase_list[j].command.cmds);
                                        }
                                    }
                                }
                                //绑定包
                                bindPropackageList(data.propackage_list);
                                _fileupload_path = data.file_upload_path;
                                _propackage_bk_path = data.dftpropac_bk_dir;
                                getNodeList($scope.rollback_info.prog_id);
                                //加载成功
                                $scope.control.get_prog_loading = false;
                                $scope.control.get_prog_complete = true;
                            }
                        },0);
                    },function(error){
                        $scope.errorMessage = error.message;
                        $scope.control.get_prog_loading = false;
                    });*/
                }
            }, 0);
        }, function (error) {
            $scope.valid_prog_error_msg = error.message;
            $scope.control.valid_prog_complete = false;
            $scope.control.valid_prog_loading = false;

        });
    };
    //清单/包获取方式
    $scope.changeFileFlag = function (flag) {
        $scope.rollback_info.upload_flag = flag;
        $scope.control.validate_pac = false;
        if (flag == 2) {
            $scope.control.is_prolist_add = false;
        }
        //清空发布包列表
        angular.forEach($scope.rollback_info.propackage_list, function (data) {
            data.propackage_full_path = data.propackage_full_path ? [] : [];
            data.package_name_list = data.package_name_list ? [] : [];
        });

    };
    //new添加发布包
    $scope.addProdPackage = function (index, pac_flag) {
        $scope.control.validate_msg = false;
        $scope.control.validate_pac = false;
        Modal.prodPreAddProdPac(_propackage_bk_path, _fileupload_path, '', index, pac_flag, false, $scope.rollback_info).then(function (data) {
            if (data) {
                $scope.rollback_info.propackage_list[index].package_name_list = data.dpp_param_info.propackage_list[index].package_name_list;
                $scope.rollback_info.propackage_list[index].propackage_full_path = data.dpp_param_info.propackage_list[index].propackage_full_path;
                $scope.rollback_info.propackage_list[index].package_list = data.dpp_param_info.propackage_list[index].package_list;
                //检验版本机包是否存在
                if ($scope.rollback_info.upload_flag == 2) {
                    validateProdPacExist($scope.rollback_info.propackage_list[index], data);
                }
            }
        });
    };
    //new发布包-移除发布包
    $scope.removeProdPackage = function (propackage_list, prodpac, propackage) {
        var _tar_name = propackage.propackage_full_path.substring(propackage.propackage_full_path.lastIndexOf('/') + 1, propackage.propackage_full_path.length);
        for (var i = 0; i < propackage_list.length; i++) {
            var _pac_type = propackage_list[i];
            if (_pac_type.package_type == prodpac.package_type) {
                //删除临时发布包
                for (var j = 0; j < _pac_type.package_name_list.length; j++) {
                    var _pac_path = _pac_type.package_name_list[j];
                    if (_pac_path.propackage_full_path == propackage.propackage_full_path) {
                        propackage_list[i].package_name_list.splice(j, 1);
                        break;
                    }
                }
                //删除提交的发布包
                for (var j = 0; j < _pac_type.package_list.length; j++) {
                    var _package = _pac_type.package_list[j];
                    if (_package == _tar_name) {
                        propackage_list[i].package_list.splice(j, 1);
                        break;
                    }
                }
                //删除发布包
                for (var k = 0; k < _pac_type.propackage_full_path.length; k++) {
                    var _package_path = _pac_type.propackage_full_path[k];
                    if (_package_path == propackage.propackage_full_path) {
                        propackage_list[i].propackage_full_path.splice(k, 1);
                        break;
                    }
                }
            }
        }
    };
    //new发布包-下载发布包
    $scope.downloadPackage = function (propackage) {
        var _path = _fileupload_path + propackage.propackage_full_path.substring(propackage.propackage_full_path.lastIndexOf("/") + 1, propackage.propackage_full_path.length);
        CV.downloadFile(_path);
    };
    //展开收起阶段信息
    $scope.toggleModulesDetail = function (step, group) {
        step.show_detail = !step.show_detail;
        group.nav_show_flag = CmptFunc.judgeShowDetail(group.phase_list);
        group.expand_flag = (group.nav_show_flag == 2) ? true : false;
    };
    //模组全部展开
    $scope.expandCollapseAll = function (group) {
        group.nav_show_flag = CmptFunc.expandAllModules(group.phase_list);
    };
    //模组全部收起
    $scope.colseCollapseAll = function (group) {
        group.nav_show_flag = CmptFunc.closeAllModules(group.phase_list);
    };
    //协议类型转化中文名
    $scope.getProtocolTypeCnName = function (protocol_type) {
        return CV.findValue(protocol_type, ProtocolType).substring(0, 5).toLowerCase();
    }
    //保存回退所需信息
    $scope.saveRollbackInfo = function () {
        var _node_names = [];
        if ($scope.data.node_list.length != 0) {
            for (var i = 0; i < $scope.data.node_list.length; i++) {
                if ($scope.data.node_list[i].is_checked) {
                    _node_names.push($scope.data.node_list[i].soc_ip);
                }
            }
            if (_node_names.length == 0) {
                Modal.alert("请先选择要回退的运行节点！", 3);
                return false;
            }
        }
        var _rollback_info = angular.copy($scope.rollback_info);
        $scope.rollback_info.prepare_msg.group_list = _rollback_info.prepare_msg.group_list;
        $scope.rollback_info.prepare_msg.param_list = _rollback_info.prepare_msg.param_list;
        $scope.rollback_info.prepare_msg.pac_type_list = _rollback_info.prepare_msg.pac_type_list ? _rollback_info.prepare_msg.pac_type_list : [];
        var _req_data = {
            syspublish_id: _syspublish_id,
            prepare_msg: $scope.rollback_info.prepare_msg,
            node_list: _node_names,
        };
        if (!CV.valiForm($scope.form.saveRollInfoForm)) {
            return false;
        }
        if ($scope.rollback_info.propackage_list.length != 0) {
            //发布包不可为空
            if (!valiProdPacComplete()) {
                return false;
            }
        }
        //回退准备
        $scope.control.btnBus_loading = true;
        Exec.saveReadyInfo(_req_data).then(function (data) {
            if (data) {
                $scope.control.btnBus_loading = false;
                $modalInstance.close(true);
            }
        }, function (error) {
            $scope.control.btnBus_loading = false;
            Modal.alert(error.message, 3);
        });

    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    init()
}]);

/**
 * 发布监控-添加监控节点日志信息
 * */
modal_m.controller("addMonitorLogCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "Exec", "Collection", "EncodingType", "Modal", function ($scope, $modalInstance, $timeout, modalParam, Exec, Collection, EncodingType, Modal) {
    var _business_sys_name = modalParam.business_sys_name;
    var _project_name = modalParam.project_name;
    var _env_id = modalParam.environment_id;
    var _modify_node = modalParam.node; // 存在node即为修改

    //监控日志对象
    $scope.monitor_log_info = {
        node_ip: '', //节点
        checked_files: [],//选中的文件
    };
    //data对象
    $scope.data = {
        node_list: [], // 节点列表
        encode_type_list: EncodingType,//编码列表
        all_checked_list: [] //所有选中的文件对象
    };
    //node对象
    $scope.node = {
        path_files: [], // 节点目录列表
        checked_files: [],
        paths: [],
    };
    //页面控制对象
    $scope.control = {
        node_loading: false,
        is_update: false
    };
    //处理自定义配置文件获取到的物理节点数据源
    var dealSocList = function (soc_list) {
        for (var i = 0; i < soc_list.length; i++) {
            var _soc_info = soc_list[i];
            _soc_info.lable = _soc_info.file_soc_username + "@" + _soc_info.ip;
            _soc_info.index = i;
        }
    };
    //获取配置文件物理节点数据源信息
    var getNodeConfigList = function () {
        $scope.data.node_list = [];
        $scope.control.node_loading = true;
        Exec.getDefinePhyInfo(_business_sys_name, _env_id).then(function (data) {
            if (data) {
                $scope.control.node_loading = false;
                $scope.data.node_list = data.phy_node_list ? data.phy_node_list : [];
                dealSocList($scope.data.node_list)
            }
        }, function (error) {
            Modal.alert(error.message, 3);
            $scope.control.node_loading = false;
        })
    };

    //获取文件路径
    var getNodePath = function (path) {
        var _init_path = path;
        var _fill_path = "";
        //去掉路径最后的'/'
        _init_path = _init_path.length > 1 && _init_path.lastIndexOf("/") == _init_path.length - 1 ? _init_path.slice(0, _init_path.length - 1) : _init_path;
        var _last_slash_index = _init_path.lastIndexOf("/");
        // /, /a, a, /a/b, a/b, a/
        if (!_init_path) {           //''
            $scope.node.paths = [];
        } else if (_last_slash_index == -1) {   //没有'/'或''
            $scope.node.paths = [_init_path];
        } else if (_init_path.length == 1 && _last_slash_index == 0) {   //只有'/'
            $scope.node.paths = [_init_path];
        } else if (_last_slash_index == 0) {     // '/x'
            _fill_path = "/";
            $scope.node.paths = [_init_path.slice(1)];
        } else {
            _fill_path = _init_path.slice(0, _last_slash_index + 1);
            $scope.node.paths = [_init_path.slice(_last_slash_index + 1)];
        }
    };

    var init = function () {
        getNodeConfigList();
        if (_modify_node) {
            $scope.data.all_checked_list = angular.copy(_modify_node);
        }
    };
    var _old_ip;
    //获取数据源下的文件列表
    $scope.getFileList = function (selectKey) {
        var _node = {};
        _node = $scope.data.node_list[selectKey];
        $scope.node.paths = [];
        $scope.node.path_files = [];
        $scope.node.init_path = _node.init_path ? _node.init_path : '';
        $scope.node.check_soc_name = _node.execute_soc_name;
        $scope.node.download_soc_name = _node.file_soc_name;
        $scope.node.execute_ip = _node.ip;
        $scope.node.err_msg = '';
        $scope.node.loading = true;
        /*切换一个节点生成一个属于节点的对象*/
        var _obj = {
            node_ip: selectKey, //节点
            label: _node.lable,
            business_sys_name: _business_sys_name,
            soc_name: $scope.node.check_soc_name,
            checked_files: []
        };
        _old_ip = selectKey;
        var _flag = 0;
        if ($scope.data.all_checked_list.length == 0) {
            _obj.checked_files = $scope.node.checked_files;
            $scope.data.all_checked_list.push(_obj);
        } else {
            for (var j = 0; j < $scope.data.all_checked_list.length; j++) {
                var _node_ip = $scope.data.all_checked_list[j];
                if (_node_ip.node_ip == selectKey) {
                    $scope.node.checked_files = _node_ip.checked_files;
                    _flag = 1;
                } else if (_node_ip.node_ip != selectKey && _node_ip.checked_files.length == 0) {
                    $scope.data.all_checked_list.splice(j--, 1);
                }
            }
            if (_flag == 0) {
                $scope.node.checked_files = [];
                _obj.checked_files = $scope.node.checked_files;
                $scope.data.all_checked_list.push(_obj);
            }
        }
        Collection.getFileListBySoc(_node.file_soc_name, $scope.node.init_path, _node.ip).then(function (data) {
            $scope.node.loading = false;
            $scope.node.init_temp = data.root_bk_dir;
            $scope.node.init_path = $scope.node.init_temp;
            getNodePath($scope.node.init_temp);
            $scope.node.path_files = data.file_bean_list ? data.file_bean_list : [];
        }, function (error) {
            $scope.node.paths = [];
            $scope.node.init_path = '';
            $scope.node.path_files = [];
            $scope.init_temp = '';
            $scope.node.loading = false;
            $scope.node.err_msg = error.message;
        });

        /*        Exec.getLogsFilesByPath(_business_sys_name, _project_name, _node.init_path, _node.node_name, _node.check_soc_name, _node.download_soc_name).then(function(data) {
                    $scope.node.loading = false;
                    $scope.node.path_files = data.file_list_bean ? data.file_list_bean : [];
                    // node.path_files = data.file_list_bean ? data.file_list_bean : [];
                }, function(error) {
                    Modal.alert(error.message,3);
                    $scope.node.loading = false;
                    $scope.node.err_msg =error.message;
                    // node.err_msg = error.message;
                });*/

    };

    //展示目录文件列表
    $scope.changePath = function (node) {
        if ($scope.data.all_checked_list.length != 0) {
            for (var j = 0; j < $scope.data.all_checked_list.length; j++) {
                var _node_ip = $scope.data.all_checked_list[j];
                if (_node_ip.node_ip == _old_ip) {
                    $scope.node.checked_files = _node_ip.checked_files;
                }
            }
        }
        node.loading = true;
        $timeout(function () {
            Collection.getFileListBySoc(node.download_soc_name, node.full_path, node.ip).then(function (data) {
                node.loading = false;
                node.path_files = data.file_bean_list ? data.file_bean_list : [];
            }, function (error) {
                node.paths = [];
                node.loading = false;
                node.err_msg = error.message;
            });

        }, 0);
    };
    $scope.saveMonitorNode = function () {
        $scope.monitor_log_info.checked_files = $scope.node.checked_files;

        if ($scope.monitor_log_info.checked_files.length == 0) {
            Modal.alert("请至少选择一个监控日志文件！", 3);
            return false;
        }
        for (var i = 0; i < $scope.monitor_log_info.checked_files.length; i++) {
            if (!$scope.monitor_log_info.checked_files[i].word_coding) {
                Modal.alert("请选择文件的编码方式！", 3);
                return false;
            }
        }
        $modalInstance.close($scope.data.all_checked_list); //添加成功
    };

    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    init();
}]);

/**
 *发布执行-配置执行节点信息
 * */
modal_m.controller('configExecNodeCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Modal, CV) {

    var _phase_info = modalParam.phase_info;

    //配置信息对象
    $scope.phase_info = {};
    //页面控制对象
    $scope.control = {
        is_parallel: true,
        is_quick_publish: modalParam.quick_publish ? modalParam.quick_publish : 2
    };
    $scope.data = {

    };

    var init = function () {
        $scope.phase_info = angular.copy(_phase_info);
        $scope.control.is_parallel = $scope.phase_info.parallel_flag;
    };

    $scope.changeNodeExec = function (index, node) {
        node.is_exec = !node.is_exec;
    };

    //保存配置信息
    $scope.saveConfigInfo = function () {
        $scope.phase_info.parallel_flag = $scope.control.is_parallel;
        $modalInstance.close($scope.phase_info); //添加成功
    };

    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    init()
}]);

/**
 *发布执行-变更结果弹出框
 * */
modal_m.controller('changeExecResultCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Modal, CV) {

    var _node_info = modalParam.node_info;
    $scope.form = {};//隔离表单
    //变更信息对象
    $scope.result_info = {
        msg: ''
    };
    //页面控制对象
    $scope.control = {};
    $scope.data = {};

    var init = function () {

    };

    //保存配置信息
    $scope.saveResult = function () {
        if (!CV.valiForm($scope.form.new_result_form)) {
            return false;
        }
        $modalInstance.close($scope.result_info); //添加成功
    };

    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
    init()
}]);

/**
 *版本管理--全屏查看
 * */
modal_m.controller('viewfileFullScreenCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "CodeMirrorOption", "Version", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, CodeMirrorOption, Version, Modal, CV) {
    var _encoding;
    $scope.file_info = modalParam.file_info ? modalParam.file_info : {};
    $scope.file_post_header = modalParam.file_post_header ? modalParam.file_post_header : {};
    $scope.codemethod_loading = false;
    $scope.detailFileOptions = {
        lineWrapping: true,
        lineNumbers: true,
        scrollbarStyle: 'simple',
        readOnly: true,
        refresh: false,
        mode: 'text/x-properties'
    };
    var init = function () {
        $timeout(function () {
            resizeCodeHeight();
            $scope.detailFileOptions.refresh = true;
        }, 800);
        $scope.has_file_icon = $scope.file_info.file_type >= 1 && $scope.file_info.file_type < 4;
    };
    //重置codemirror高度
    var resizeCodeHeight = function () {
        var _code_ele = $("#modal-codemirror .CodeMirror");
        if (_code_ele.is(':visible')) {
            var _codemirror_height = $(window).height() - parseInt(_code_ele.offset().top) - 15;
            _code_ele.height(_codemirror_height);
        }
    };
    //查询文件信息
    var getFileContent = function () {
        $scope.codemethod_loading = true;
        Version.viewfileContent($scope.file_post_header).then(function (data) {
            $scope.file_info.file_content = data.file_content ? Base64.decode(data.file_content) : '';
            $scope.file_info.file_size = data.file_size ? data.file_size : '';
            $scope.file_info.file_update_time = data.file_update_time ? data.file_update_time : '';
            $scope.detailFileOptions.refresh = true;
            $scope.codemethod_loading = false;
        }, function (error) {
            $scope.codemethod_loading = false;
        });
    };

    //格式化文件图标
    $scope.formatFileIconStyle = function () {
        var class_name = '';
        if ($scope.file_info.file_type == 1) {
            class_name = 'txt-icon';
        } else if ($scope.file_info.file_type == 2 || $scope.file_info.file_type == 3) {
            class_name = 'excel-icon';
        } else if ($scope.file_info.file_type == 9) {
            class_name = 'tar-icon';
        } else {
            class_name = '';
        }
        return class_name;
    };

    //切换编码方式
    $scope.changeCodeMethod = function () {
        _encoding = $scope.file_post_header.encoding_type;
        if (_encoding === 'UTF-8') {
            $scope.file_post_header.encoding_type = 'GBK';
        }
        if (_encoding === 'GBK') {
            $scope.file_post_header.encoding_type = 'UTF-8';
        }
        getFileContent();
    };

    //文件下载(download_type:1整个版本 2目录 3 文件)
    $scope.downloadFile = function () {
        var _download_info = {
            file_absolute_path: $scope.file_post_header.absolute_path,
            file_path: $scope.file_post_header.file_path,
            version_num: $scope.file_post_header.version_num,
            business_sys_name: modalParam.business_sys_name,
            is_dir: false,
        };
        Version.downloadFile(_download_info).then(function (data) {
            $timeout(function () {
                if (data.download_url) CV.downloadFile(data.download_url);
            }, 0);
        }, function (error) {

        });
    };

    //取消按钮
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    //窗口变化
    $(window).resize(function () {
        $timeout(function () {
            resizeCodeHeight();
        }, 100);
    });
    init();
}]);

/**
 *例行窗口模态框配置
 * */
modal_m.controller('setNormalWindowTimeCtrl', ["$scope", "$modalInstance", "PubWindow", "ScrollConfig", "Modal", "CV", function ($scope, $modalInstance, PubWindow, ScrollConfig, Modal, CV) {
    $scope.dateObj = {
        start_bk_datetime: CV.dtFormat(new Date()),
        end_bk_datetime: '',
        cycle_type: 0,
        cycles: [],
        minDate: new Date(),
    };
    $scope.control = {
        opened: false,
        startTimeFlag: false,
        save_loading: false,
        viewtime_error: ''
    };
    $scope.config = {
        scroll_info: ScrollConfig,
    };
    //时间拼接
    var timeFormat = function (list) {
        for (var i = 0; i < list.length; i++) {
            var _cycle = list[i];
            _cycle.open_time = [parseInt(_cycle.hh) < 10 ? '0' + "" + parseInt(_cycle.hh) : parseInt(_cycle.hh), ':', parseInt(_cycle.mi) < 10 ? '0' + "" + parseInt(_cycle.mi) : parseInt(_cycle.mi)].join('')
        }
    };
    var init = function () {

    };

    //显示日期控件
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.control.opened = true;
    };

    $scope.removeAutoTime = function ($index) {
        $scope.dateObj.cycles.splice($index, 1);
    };
    //添加循环时间
    $scope.addCirlTime = function () {
        if ($scope.dateObj.errorM) return;
        $scope.dateObj.cycles.push({ cycle_type: $scope.dateObj.cycle_type, cycle_number: 1, hh: 0, mi: 0, duration: 1 });
    };
    //切换时间单位
    $scope.changeTimeUnitType = function (flag) {
        $scope.dateObj.cycle_type = flag;
        if ($scope.dateObj.cycles.length == 0) {
            $scope.dateObj.cycles.push({ cycle_type: $scope.dateObj.cycle_type, cycle_number: 1, hh: 0, mi: 0, duration: 1 });
        } else {
            $scope.dateObj.cycles[$scope.dateObj.cycles.length - 1].cycle_type = flag;
            $scope.dateObj.cycles[$scope.dateObj.cycles.length - 1].cycle_number = 1;
        }
    };

    $scope.$watch('dateObj', function () {
        if (!$scope.dateObj.start_bk_datetime) {
            $scope.control.startTimeFlag = true;
        } else {
            $scope.control.startTimeFlag = false;
        }
    }, true);
    //保存按钮
    $scope.ok = function () {
        if ($scope.control.startTimeFlag || $scope.dateObj.errorM) return;
        if (!$scope.dateObj.end_bk_datetime) {
            Modal.alert("结束时间不可为空", 3);
            return false;
        }
        if ($scope.dateObj.cycles.length == 0) {
            Modal.alert("时间周期不可为空", 3);
            return false;
        }
        if ($scope.dateObj.start_bk_datetime && $scope.dateObj.end_bk_datetime) {
            if (+$scope.dateObj.start_bk_datetime > +$scope.dateObj.end_bk_datetime) {
                Modal.alert('开始时间不可大于结束时间！', 3);
                return false;
            }
        }
        timeFormat($scope.dateObj.cycles);
        $scope.control.save_loading = true;
        PubWindow.saveRoutineWindow(CV.dtFormat($scope.dateObj.start_bk_datetime), CV.dtFormat($scope.dateObj.end_bk_datetime), $scope.dateObj.cycles).then(function (data) {
            console.log(data)
            $scope.control.save_loading = false;
            $modalInstance.close(true);
        }, function (error) {
            $scope.control.save_loading = false;
            Modal.alert(error.message, 3);
        });

    };

    //取消按钮
    $scope.close = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *特殊窗口模态框配置
 * */
modal_m.controller('setSpecialWindowTimeCtrl', ["$scope", "$modalInstance", "ScrollConfig", "PubWindow", "Modal", "CV", function ($scope, $modalInstance, ScrollConfig, PubWindow, Modal, CV) {
    $scope.dateObj = {
        cycles: [],
    };
    $scope.cus_date = {
        date: '',
        minDate: new Date(),
    };
    $scope.control = {
        save_loading: false,
    };
    $scope.config = {
        scroll_info: ScrollConfig,
    };
    //时间拼接
    var timeFormat = function (list) {
        for (var i = 0; i < list.length; i++) {
            var _cycle = list[i];
            _cycle.open_time = [parseInt(_cycle.hh) < 10 ? '0' + "" + parseInt(_cycle.hh) : parseInt(_cycle.hh), ':', parseInt(_cycle.mi) < 10 ? '0' + "" + parseInt(_cycle.mi) : parseInt(_cycle.mi)].join('')
        }
    };

    var init = function () {

    };
    //删除
    $scope.removeAutoTime = function ($index) {
        $scope.dateObj.cycles.splice($index, 1);
    };
    $scope.$watch('cus_date.date', function () {
        if ($scope.cus_date.date != '' && $scope.cus_date.date) {
            var _dataStrShow = $scope.cus_date.date.getFullYear() + '年' + ($scope.cus_date.date.getMonth() + 1) + '月' + $scope.cus_date.date.getDate() + '日';
            var _dataValue = CV.dtFormat($scope.cus_date.date);
            for (var i = 0; i < $scope.dateObj.cycles.length; i++) {
                var _cycle = $scope.dateObj.cycles[i];
                if (_dataStrShow == _cycle.date_str) {
                    Modal.alert("已经存在该日期！！！", 3);
                    return false
                }
            }
            $scope.dateObj.cycles.push({ hh: 0, mi: 0, open_date: _dataValue, date_str: _dataStrShow, duration: 0 });
        }
    }, true);

    //保存按钮
    $scope.ok = function () {
        if ($scope.dateObj.errorM) return;
        if ($scope.dateObj.cycles.length == 0) {
            Modal.alert("特殊日期不可为空", 3);
            return false;
        }
        timeFormat($scope.dateObj.cycles);
        $scope.control.save_loading = true;
        PubWindow.saveSpecialWindow($scope.dateObj.cycles).then(function (data) {
            $scope.control.save_loading = false;
            $modalInstance.close(true);
        }, function (error) {
            $scope.control.save_loading = false;
            Modal.alert(error.message, 3);
        });

    };

    //取消按钮
    $scope.close = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *黑名单窗口模态框配置
 * */
modal_m.controller('setBlackWindowTimeCtrl', ["$scope", "$modalInstance", "ScrollConfig", "PubWindow", "Modal", "CV", function ($scope, $modalInstance, ScrollConfig, PubWindow, Modal, CV) {
    $scope.dateObj = {
        cycles: [],
        special_reason: ''
    };
    $scope.cus_date = {
        date: '',
        minDate: new Date(),
    };
    $scope.control = {
        save_loading: false,
    };
    $scope.config = {
        scroll_info: ScrollConfig,
    };
    var init = function () {

    };
    //删除
    $scope.removeAutoTime = function ($index) {
        $scope.dateObj.cycles.splice($index, 1);
    };
    $scope.$watch('cus_date.date', function () {
        if ($scope.cus_date.date != '' && $scope.cus_date.date) {
            var _dataValue = CV.dtFormat($scope.cus_date.date);
            for (var i = 0; i < $scope.dateObj.cycles.length; i++) {
                var _cycle = $scope.dateObj.cycles[i];
                if (_dataValue == _cycle) {
                    Modal.alert("已经存在该日期！！！", 3);
                    return false
                }
            }
            $scope.dateObj.cycles.push(_dataValue);
        }
    }, true);

    //保存按钮
    $scope.ok = function () {
        $scope.control.save_loading = true;
        PubWindow.saveSpecialDayWindow($scope.dateObj.special_reason, $scope.dateObj.cycles).then(function (data) {
            $scope.control.save_loading = false;
            $modalInstance.close($scope.dateObj);
        }, function (error) {
            $scope.control.save_loading = false;
            Modal.alert(error.message, 3)
        });
    };

    //取消按钮
    $scope.close = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *发布窗口关闭弹窗
 * */
modal_m.controller('closeWindowCtrl', ["$scope", "$modalInstance", "modalParam", "PubWindow", "Modal", "CV", function ($scope, $modalInstance, modalParam, PubWindow, Modal, CV) {
    var _window = modalParam.window;
    $scope.form = {};//隔离表单
    //关闭信息对象
    $scope.result_info = {
        msg: ''
    };
    $scope.control = {
        save_loading: false,
    };
    var init = function () {

    };
    //保存按钮
    $scope.saveResult = function () {
        if (!CV.valiForm($scope.form.pub_window_form)) {
            return false;
        }
        _window.close_reason = $scope.result_info.msg;
        $scope.control.save_loading = true;
        PubWindow.closePubWindow(_window).then(function (data) {
            $scope.control.save_loading = false;
            $modalInstance.close(true);
        }, function (error) {
            $scope.control.save_loading = false;
            Modal.alert(error.message, 3)
        })

    };

    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *发布窗口详情
 * */
modal_m.controller('viewWindowDetailCtrl', ["$scope", "$modalInstance", "modalParam", "ScrollBarConfig", "ProjectStatus", "Project", "Modal", "CV", function ($scope, $modalInstance, modalParam, ScrollBarConfig, ProjectStatus, Project, Modal, CV) {
    var _event = modalParam.event;
    $scope.info = {
        close_reason: _event.close_reason,
        pjpublish_id: _event.pjpublish_id,
        error_message: '',
        publish_info: {},
    };
    //页面配置
    $scope.config = {
        scroll: ScrollBarConfig.Y(),
    };
    //页面控制
    $scope.control = {
        get_project_loading: false,
    };
    var init = function () {
        $scope.info.error_message = '';
        $scope.control.get_project_loading = true;
        Project.viewReleaseApply($scope.info.pjpublish_id).then(function (data) {
            if (data) {
                $scope.control.get_project_loading = false;
                $scope.info.publish_info = data.publish_bean || {};
            }
        }, function (error) {
            $scope.control.get_project_loading = false;
            $scope.info.error_message = error.message;
        })
    };
    //取消按钮
    $scope.close = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *发布申请添加项目
 * */
modal_m.controller('releaseAppAddProjectCtrl', ["$scope", "$modalInstance", "modalParam", "PubWindow", "ProjectStatus", "Modal", "CV", function ($scope, $modalInstance, modalParam, PubWindow, ProjectStatus, Modal, CV) {
    $scope.info = {
        error_message: '',                             //错误信息
        proj_list: []
    };
    $scope.control = {
        proj_list_loading: true   //加载列表信息
    };
    var init = function () {

    };
    //表单提交
    $scope.formSubmit = function () {
        var _compid_list = [];
        if ($scope.info.proj_list.length > 0) {
            $modalInstance.close($scope.info.proj_list);
        }
    };
    //取消表单
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *发布准备--选择回列表还是直接到执行页面
 * */
modal_m.controller('prepareChooseCtrl', ["$scope", "$state", "$modalInstance", "modalParam", "Modal", "CV", function ($scope, $state, $modalInstance, modalParam, Modal, CV) {
    var _syspublish_id = modalParam.syspublish_id;
    var _business_sys_name = modalParam.business_sys_name;

    $scope.info = {};
    //页面数据
    $scope.data = {};
    //页面控制
    $scope.control = {};
    var init = function () { };
    //跳转执行
    $scope.goToExecute = function () {
        $modalInstance.close(1);
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.close(2);
    };
    init();
}]);
/*
* 发布执行-sql交互式执行
* */
modal_m.controller('interactiveExecuteCtrl', ["$scope", "$timeout", "$modalInstance", "modalParam", "EncodingType", "ScrollBarConfig", "CodeMirrorOption", "Exec", "Modal", function ($scope, $timeout, $modalInstance, modalParam, EncodingType, ScrollBarConfig, CodeMirrorOption, Exec, Modal) {
    var _execute_id = modalParam.execute_id || '',
        _curr_select_sql_statement = '',
        _encoding = '',//编码方式
        _timer; //配置定时

    //页面信息
    $scope.info = {
        phase_name: modalParam.phase_desc || '交互式SQL' ,
        phase_info: {
            node_list: [],
        },
        curr_node: {},
    };
    //页面数据
    $scope.data = {
        encoding: EncodingType,
    };
    //页面控制
    $scope.control = {
        refresh_codemirror: false,
        show_setting: false,
        close_monitor: false,
        show_notification : false
    };
    //页面配置
    $scope.config = {
        scroll_bar: {
            axis:"y" ,
            theme:"custom-dark",
            scrollbarPosition: "outside",
            scrollInertia:400,
            scrollEasing:"easeOutCirc",
            autoDraggerLength: true,
            autoHideScrollbar: true,
            scrollButtons:{ enable: false }
        },
        fileReadOnlyLoaded: CodeMirrorOption.Sql('nocursor'),
        fileEditLoaded: function (_editor) {
            CodeMirrorOption.setSqlFileEditor(_editor);
            _editor.on('blur', function () {
                _curr_select_sql_statement = _editor.somethingSelected() ? _editor.getSelection() : '';
            });
            _editor.on('focus', function () {
                $scope.control.show_setting = false;
            });
        }
    };

    //回滚和提交操作(增删改可操作)
    //sql_type   1 select 2 update 3 insert 4 delete 5未知
    //exe_status 1 执行中  2执行成功 3 执行出错 4 提交成功 5 回退成功
    var disableOprateBtn = function (sql_list, exe_status) {
        sql_list = sql_list || [];
        if (exe_status === 4 || exe_status === 5) {
            return true;
        }
        return !sql_list.some(function (item, index, array) {
            return item.sql_type > 1 && item.sql_type < 5;
        });
    };
    //sql执行时间格式化
    var formatSqlExeTime = function (time_used) {
        var _times = '';
        if (time_used < 1000) {
            _times = time_used + '毫秒'
        } else {
            _times = Math.floor(time_used / 1000) + '秒';
            if (_times > 60) {
                _times = Math.floor(time_used / 1000) / 60 + '分'
            }
        }
        return _times;
    };
    //显示通知提示 duration(s)
    var showNotification = function (msg, duration) {
        $scope.msg_notification = msg || '';
        $scope.control.show_notification = true;
        duration = duration || 3;
        $scope.control.add_enter_class = true;
        $timeout(function () {
            $scope.control.add_enter_class = false;
            $scope.control.add_leave_class = true;
            //等待动画结束
            $timeout(function () {
                 $scope.msg_notification = '';
                 $scope.control.show_notification = false;
            },500);
        }, duration * 1000);
    };
    //获取文件内容
    var getFileContent = function (file) {
        $timeout(function () {
            file.change_encoding_loading = false;
        }, 1000);
    };
    //获取分页信息
    var getPageResult = function (page, exe_result) {
        exe_result.page_option.start_recd = exe_result.page_option.limit_recd * (page - 1);
        exe_result.page_tbodys = exe_result.tbodys.slice(exe_result.page_option.start_recd, exe_result.page_option.start_recd + exe_result.page_option.limit_recd);
    };
    //监控sql执行
    var monitorExeSql = function () {
        if ($scope.control.close_monitor) return;
        var _node = $scope.info.curr_node || {};
        console.log(_node,'当前节点对象');

        Exec.interactiveSqlExeMonitor(_execute_id).then(function (data) {
            var _sql_exe_msg = data.sql_exe_msg
            if (_sql_exe_msg) {
                _node.exe_info_list = _node.exe_info_list || [];
                if (_node.exe_info_list.length === 0) {
                    _node.exe_info_list.unshift(_sql_exe_msg[0]);
                }
                var _new_list = [];
                for (var i = 0; i < _sql_exe_msg.length; i++) {
                    var _sql_exe = _sql_exe_msg[i];
                    if (_node.node_ip !== _sql_exe.node_ip) continue;
                    _sql_exe.theads = _sql_exe.theads || [];
                    _sql_exe.tbodys = _sql_exe.tbodys || [];
                    _sql_exe.exe_timeused_cn = formatSqlExeTime(_sql_exe.exe_timeused || 0);
                    _sql_exe.disbaled_operate_btn = !_sql_exe.tran_flag;
                    _sql_exe.scroll_x = ScrollBarConfig.X();
                    _sql_exe.page_tbodys = _sql_exe.tbodys.length > 5 ? _sql_exe.tbodys.slice(0, 5) : _sql_exe.tbodys; //首页显示5个
                    _sql_exe.page_option = {
                        curr: 1, //当前页数
                        all: 1, //总页数
                        all_recd:  _sql_exe.tbodys.length, //总数目
                        count: 5, //最多显示的导航页数，默认为5，多余隐藏
                        start_recd: 0, //开始记录
                        limit_recd: 5, //每页限制5条
                        // 点击页数的回调函数，参数page为点击的页数
                        click: function (page) {
                            getPageResult(page,_sql_exe);
                        }
                    };
                    //处理开始
                    var _new_flag = true;
                    for (var j = 0; j < _node.exe_info_list.length; j++) {
                        var _exe_info = _node.exe_info_list[j];
                        if (_sql_exe.exe_id === _exe_info.exe_id) {
                            //已存在-替换
                            _node.exe_info_list[j] = _sql_exe;
                            _new_flag = false;
                        }
                    }
                    if(_new_flag){
                        //不存在-追加
                        _new_list.unshift(_sql_exe);
                    }
                }
                //新的追加
                _node.exe_info_list =  _new_list.concat(_node.exe_info_list);
                //延迟调用
                $timeout(function () {
                    monitorExeSql();
                }, 100)
            }
        }, function (error) {
            console.log(error.message);
        });
    };
    var init = function () {
        //获取节点信息
        Exec.interactiveSqlGetNode(_execute_id).then(function (data) {
            $timeout(function () {
                $scope.info.phase_info.node_list = data.node_list || [];
                for (var i = 0; i < $scope.info.phase_info.node_list.length; i++) {
                    var _node = $scope.info.phase_info.node_list[i];
                    _node.file_list = _node.file_list || [];
                    _node.exe_info_list = _node.exe_history_list ?  _node.exe_history_list.reverse() :  [];
                    for (var k =0; k < _node.exe_info_list.length; k++) {
                        var _exe_info = _node.exe_info_list[k];
                        _exe_info.theads = _exe_info.theads || [];
                        _exe_info.tbodys = _exe_info.tbodys || []
                        _exe_info.scroll_x =  ScrollBarConfig.X();
                        _exe_info.exe_timeused_cn = formatSqlExeTime(_exe_info.exe_timeused || 0);
                        _exe_info.disbaled_operate_btn  = !_exe_info.tran_flag;
                        _exe_info.page_tbodys = _exe_info.tbodys.length > 5 ? _exe_info.tbodys.slice(0, 5) : _exe_info.tbodys; //首页显示5个
                        _exe_info.page_option  ={
                            curr: 1, //当前页数
                            all: 1, //总页数
                            all_recd:  _exe_info.tbodys.length, //总数目
                            count: 5, //最多显示的导航页数，默认为5，多余隐藏
                            start_recd: 0, //开始记录
                            limit_recd: 5, //每页限制5条
                            // 点击页数的回调函数，参数page为点击的页数
                            click: function (page) {
                                getPageResult(page,_exe_info);
                            }
                        }
                    }
                    for (var j = 0; j < _node.file_list.length; j++) {
                        var _file = _node.file_list[j];
                        _file.is_original_area = false;
                        _file.delimiter = _file.delimiter || ';';
                        _file.encoding_type = _file.encoding_type || 'UTF-8';
                        _file.file_edit_content = _file.file_content;
                    }
                }
                if($scope.info.phase_info.node_list.length){
                    $scope.info.curr_node = $scope.info.phase_info.node_list[0];
                    monitorExeSql();
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message,3)
        });
    };

    //切换tab页 flag:1 节点   2文件
    $scope.changeTab = function (node, index) {
        _encoding = '';
        _curr_select_sql_statement = '';
        $scope.hidenGroupList();
        $scope.info.curr_node = node;
        node.curr_file_index = index || 0;
        $timeout(function () { $scope.control.refresh_codemirror = !$scope.control.refresh_codemirror; }, 100);
    };
    //改变编码方式
    $scope.changeCoding = function (selectKey, file) {
        file.encoding_type = selectKey;
        file.change_encoding_loading = true;
        if (_encoding === selectKey) {
            return false;
        }
        getFileContent(file);
        _encoding = selectKey;
    };
    //点击文本域隐藏按钮组
    $scope.hidenGroupList = function () {
        $scope.control.show_setting = false;
    };
    //显示动画
    $scope.showAnimate = function (name) {
        _timer = $timeout(function () {
            $('.' + name).animate({ right: '2px' }, 200, 'linear');
        }, 200);
    };
    //隐藏动画
    $scope.hiddenAnimate = function (name) {
        if (_timer) {
            $timeout.cancel(_timer);
            _timer = null;
        }
        _timer = $timeout(function () {
            $('.' + name).animate({ right: '-97px' }, 200, 'linear');
        }, 200);
    };
    //同步高度
    $scope.syncHeight = function () {
        return {
            'height': $('.node-container').height() + 'px',
        }
    };
    //执行sql
    $scope.exeSql = function (node) {
        if (_curr_select_sql_statement) {
            //生成sql
            node.generate_sql_loading = true;
            node.curr_file_index = node.curr_file_index || 0;
            //执行
            Exec.interactiveSqlExeSql(_execute_id, node.node_ip, node.file_list[node.curr_file_index].delimiter, _curr_select_sql_statement).then(function (data) {
                $timeout(function () {
                    node.generate_sql_loading = false;
                }, 0);
            }, function (error) {
                showNotification(error.message, 2);
            });
        } else {
            showNotification('请选择SQL', 2);
        }
    };
    //第一条sql高度
    $scope.firstSqlHeight = function (exe_info) {
        if (exe_info.sql_statement_list.length === 1) {
            exe_info.hide_more_btn = $('.sql-block .row:first-child').height() <= 26;
        }
    };
    //展开收起sql
    $scope.expandOrCollapseMoreSql = function (exe_info,index) {
        exe_info.show_sql_more = !exe_info.show_sql_more;
        var _sql_block_ele = $("#sql-block-" + index);
        var _cur_height = _sql_block_ele.height();
        if (exe_info.show_sql_more) {
            var _auto_height = _sql_block_ele.css('height', 'auto').height();
            _sql_block_ele.height(_cur_height).animate({ height: _auto_height }, 500);
        } else {
            _sql_block_ele.animate({ height: '24px' });
        }
    };
    //执行状态转中文
    $scope.exeStatusToCn = function (exe_status) {
        var _cn_status = '';
        switch (exe_status) {
            case 1: _cn_status = '执行中'; break;
            case 2: _cn_status = '执行成功'; break;
            case 3: _cn_status = '执行出错'; break;
            case 4: _cn_status = '回滚成功'; break;
            case 5: _cn_status = '提交成功'; break;
            default: _cn_status = '执行中'; break;
        }
        return _cn_status;
    };
    //提交/回滾 flag: 1提交 2回滾
    $scope.sqlOperate = function (exe_result,flag) {
        Exec.interactiveSqlSubmitOrRollback(_execute_id,flag,exe_result.exe_id).then(function (data) {
            // $timeout(function () {
            //     disableOprateBtn([], exe_result.exe_status);
            // }, 0);
            var _msg = flag == 1 ? '已提交':'已回滚';
            Modal.alert(_msg,1);
        }, function (error) {
            Modal.alert(error.message, 3)
        });
    };
    //关闭窗口
    $scope.cancel = function () {
        Modal.confirm('确认关闭'+ $scope.info.phase_name + ' ?').then(function(data){
            if(data){
                $scope.control.close_monitor = true;
                Exec.interactiveSqlClose(_execute_id).then(function(data){
                    if(data){
                        $modalInstance.close(true);
                    }
                },function(error){
                    Modal.alert(error.message);
                })
            }
        });
    };
    //状态改变
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $scope.control.close_monitor = true;
    });
    init();
}]);

//---------------------公共管理模块-----------------------

/**
 *查看组件详情信息
 * */
modal_m.controller('viewCmptDetailModalCtrl', ["$scope", "$modalInstance", "$timeout", "Cmpt", "IML_TYPE", "modalParam", "CodeMirrorOption", "CmptFunc", "pluginType", "Modal", "CV", function ($scope, $modalInstance, $timeout, Cmpt, IML_TYPE, modalParam, CodeMirrorOption, CmptFunc, pluginType, Modal, CV) {
    var id = modalParam.id;
    //执行脚本输入框配置参数
    $scope.config = {
        view_sh_options: CodeMirrorOption.Sh(true),
        view_sql_options: CodeMirrorOption.Sql(true),
        view_py_options: CodeMirrorOption.Python(true),
        view_java_options: CodeMirrorOption.Java(true)
    };
    //页面控制
    $scope.control = {
        cmpt_detail_loading: false,  //详情加载
        error_message: false         //出错标志
    };
    //页面信息
    $scope.info = {
        cmpt_info: {}
    };
    var init = function () {
        //初始化组件信息对象
        Cmpt.viewModulegetModuleDetail(id).then(function (data) {
            $timeout(function () {
                $scope.control.cmpt_detail_loading = true;
                $scope.info.cmpt_info = {
                    id: id,               //组件id
                    publish_state: data.publish_state,
                    cn_name: data.component.cn_name,
                    bk_desc: data.component.bk_desc,
                    impl_type: data.component.impl_type,
                    impl_type_cn: CV.findValue(data.component.impl_type, IML_TYPE),
                    ref_flag: data.ref_flag,
                    file_path: data.file_path,
                    param_list: data.component.param_list || [],
                    out_param_list: data.component.out_param_list || [],
                    cmds: data.component.cmds || [],
                    script_list: data.component.script_list || [],
                    language_version: data.component.language_version,
                    tag_list: data.component.tag_list || [],
                    plugin_list: data.component.plugin_list || []
                };
                if ($scope.info.cmpt_info.script_list.length > 0 && $scope.info.cmpt_info.script_list[0].cmds) {
                    angular.forEach($scope.info.cmpt_info.script_list, function (data) {
                        data.exec_script = CmptFunc.cmdsToString(data.cmds);
                        data.active = data.script_type == 'default' ? true : false;
                        data.code_mirror_control = false;
                    });
                }
                $scope.info.cmpt_info.exec_script = CmptFunc.cmdsToString($scope.info.cmpt_info.cmds);
                if (data.component.command && data.component.command.cmds) {
                    $scope.info.cmpt_info.command = {
                        exec_script: CmptFunc.cmdsToString(data.component.command.cmds),
                        cmds: data.component.command.cmds
                    }
                }
            }, 0)
        }, function (error) {
            Modal.alert(error.message, 3);
            $scope.control.error_message = true;
        })
    };
    //插件类型转化中文名
    $scope.getPluginTypeCnName = function (plugin_type) {
        return CV.findValue(plugin_type, pluginType);
    };
    //解决codemirror加载显示不出来问题
    $scope.selectScript = function (index) {
        $timeout(function () {
            $scope.info.cmpt_info.script_list[index].code_mirror_control = true;
        }, 200)
    };
    //查看详细步骤--关闭模态框
    $scope.closeModal = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 * 组件脚本添加执行系统
 * */
modal_m.controller('CmptSysCtrl', ["$scope", "$modalInstance", "$timeout", "CmptSysType", "Modal", function ($scope, $modalInstance, $timeout, CmptSysType, Modal) {
    $scope.form = {};
    //页面控制
    $scope.control = {
        other_flag: false   //选择“其他”标志
    };
    $scope.data = {
        sys_list: CmptSysType
    };
    $scope.info = {
    };
    $scope.formSubmit = function () {
        var _script_type = $scope.info.script_type ? $scope.info.script_type : $scope.info.other_script_type ? $scope.info.other_script_type : ''
        if (!_script_type) {
            Modal.alert("请选择或填写脚本类型", 3);
            return;
        }
        $modalInstance.close(_script_type);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    //选择脚本类型
    $scope.selectScriptType = function (flag) {
        if (flag) {
            $scope.info.other_script_type = '';
            $timeout(function () {
                $scope.control.other_flag = false;
            }, 50)
        } else {
            $scope.control.other_flag = true;
        }
    };
}]);

/**组件添加分类标签**/
modal_m.controller('CmptClassifyLabelCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Modal", function ($scope, $modalInstance, $timeout, modalParam, Modal) {
    $scope.form = {};
    //页面数据
    $scope.data = {
        cmpt_label_list: angular.copy(modalParam.data ? modalParam.data : [])   //被当前选中的label列表
    };
    //页面信息
    $scope.info = {};
    $scope.control = {
        valid_length_falg: false
    };
    //选择脚本类型
    $scope.selectLabel = function (_val, index) {
        _val.flag = !_val.flag;
        if (!_val.flag && _val.is_new) {
            $scope.data.cmpt_label_list.splice(index, 1);
        }
    };
    //添加新的标签
    $scope.addNewLabel = function (_val) {
        if (_val == '' || _val == undefined) return;
        console.log(_val.length);
        if (_val.length >= 50) {
            $scope.control.valid_length_falg = true;
            return;
        }
        $scope.control.valid_length_falg = false;
        for (var i = 0; i < $scope.data.cmpt_label_list.length; i++) {
            var _label = $scope.data.cmpt_label_list[i];
            if (_label.value === _val) {
                return;
            }
        }
        $scope.data.cmpt_label_list.push({
            value: _val,
            is_new: true,
            flag: true
        });
        $scope.info.label = '';
    };
    //表单保存
    $scope.formSubmit = function () {
        $modalInstance.close($scope.data.cmpt_label_list);
    };
    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);

/**
 * 添加组件 & 组件组
 * */
modal_m.controller('addCmptModalCtrl', ["$scope", "$modalInstance", "$timeout", "Cmpt", "IML_TYPE", "CmptType", "modalParam", "Modal", "CV", function ($scope, $modalInstance, $timeout, Cmpt, IML_TYPE, CmptType, modalParam, Modal, CV) {
    //high_search_obj组件高级搜索框
    $scope.info = {
        high_search_obj: {
            exec_type_list: angular.copy(IML_TYPE),      //执行类别
            classify_list: []
        },
        error_message: '',                             //错误信息
        cmpt_type: modalParam.cmpt_type,               //组件类型(1:组件，2：组件组)
        cmpt_flag: modalParam.cmpt_flag,               //组件标志（1：发布组件，2：采集组件）
        cmpts_list: [],                                //组件组列表
        cmpt_list: []                                //组件列表
    };
    $scope.control = {
        cmpt_list_loading: true,   //加载列表信息
        search_flag: true,        //搜索方式标识
        tags_more_flag: false,     //更多
        classify_flag: false      //控制显示分类分类标签是否显示“更多”
    };
    //执行类别转中文
    var formatExecuteType = function (cmpt_list) {
        for (var i = 0; i < cmpt_list.length; i++) {
            var _cmpt = cmpt_list[i];
            _cmpt.execute_type_cn = CV.findValue(_cmpt.impl_type, IML_TYPE);
        }
    };
    //组件类型转中文
    var formatCmptType = function (cmpt_list) {
        for (var i = 0; i < cmpt_list.length; i++) {
            var _cmpt = cmpt_list[i];
            _cmpt.cmpt_type_cn = CV.findValue(_cmpt.module_purpose, CmptType);
        }
    };
    var init = function () {
        if ($scope.info.cmpt_type == 2) {
            Cmpt.getPublishedCmpt($scope.info.cmpt_type, $scope.info.cmpt_flag).then(function (data) {
                $timeout(function () {
                    if (data) {
                        $scope.info.cmpts_list = data.comp_list ? data.comp_list : [];
                        $scope.control.cmpt_list_loading = false;
                    }
                }, 0);
            }, function (error) {
                $scope.info.error_message = error.message;
            });
        }
        //查询所有组件标签
        Cmpt.selectAllTas().then(function (data) {
            if (data) {
                $timeout(function () {
                    var _tag_list = data.tag_list ? data.tag_list : [];
                    for (var i = 0; i < _tag_list.length; i++) {
                        $scope.info.high_search_obj.classify_list.push({
                            value: _tag_list[i],
                            flag: false
                        })
                    }
                }, 0)
            }
        }, function (error) {
            Modal.alert(error.message, 3);
        })
    };
    var initData = function () {
        for (var i = 0; i < arguments.length; i++) {
            for (var j = 0; j < arguments[i].length; j++) {
                arguments[i][j] = angular.extend(arguments[i][j], { flag: false })
            }
        }
    };
    //清空搜索框
    $scope.clear = function () {
        $scope.search_key_word = '';
    };
    //高级搜索--删除搜索条件
    $scope.clearData = function () {
        initData($scope.info.high_search_obj.classify_list, $scope.info.high_search_obj.exec_type_list);
        $scope.info.high_search_obj.key_word = '';
    };
    //取消搜索
    $scope.cancelSeniorSearch = function () {
        $scope.control.search_flag = true
    };
    //高级搜索
    $scope.changeSearchFlag = function (e) {
        $scope.control.search_flag = false;
        e.stopPropagation();
    };
    //表单提交
    $scope.formSubmit = function () {
        //组件id列表
        var _compid_list = [];
        //组件列表
        if ($scope.info.cmpt_list.length > 0) {
            for (var i = 0; i < $scope.info.cmpt_list.length; i++) {
                var _cmpt_list = $scope.info.cmpt_list[i];
                if (_cmpt_list.checked) {
                    _compid_list.push(_cmpt_list.id);
                }
            }
        }
        //组件组列表
        if ($scope.info.cmpts_list.length > 0) {
            for (var j = 0; j < $scope.info.cmpts_list.length; j++) {
                var _cmpt_group_list = $scope.info.cmpts_list[j];
                if (_cmpt_group_list.checked == 1) {
                    _compid_list.push(_cmpt_group_list.id);
                }
            }
        }
        if (_compid_list.length == 0) {
            Modal.alert("请至少选择一组", 3);
        } else {
            $modalInstance.close(_compid_list); //添加成功
        }
    };
    //取消表单
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    $scope.countTagDivHeight = function () {
        $timeout(function () {
            var _height = $('.classify-tag-id').height();
            _height > 48 ? $scope.control.classify_flag = true : $scope.control.classify_flag = false;
        }, 500)
    };
    init();
}]);

/**
 *添加 & 修改阶段
 * */
modal_m.controller('modifyPhaseCtrl', ["$scope", "$modalInstance", "$timeout", "CmptFunc", "IML_TYPE", "CodeMirrorOption", "envManage", "Plugin", "modalParam", "pluginType", "Modal", "CV", function ($scope, $modalInstance, $timeout, CmptFunc, IML_TYPE, CodeMirrorOption, envManage, Plugin, modalParam, pluginType, Modal, CV) {
    var _curr_code_type = 1; //默认1 为shell语言 2 为python语言 3 为java语言 4 为SQL
    //form表单
    var _codemirror_editor;
    $scope.form = {};
    //阶段对象
    $scope.phase_info = {
        is_update: 1,
        impl_type: '',
        language_version: '',
        cn_name: '',
        exec_script: '',
        // srv_soc : [],
        plugin_list: [],
        command: {
            cmds: [],
            exec_script: '',
        },
    };
    $scope.control = {
        cmpt_save_disabled: false,
    };
    $scope.data = {
        subgroup_list: IML_TYPE,
        language_version_list: [], //语言环境列表
        plugin_list: [], //插件列表
        plugin_hint_list: [], //插件代码提示列表
        ref_param_list: CmptFunc.translateAllParam(modalParam.ref_param_list), // 可引用的全局参数列表
    };

    //组件-脚本输入框智能提示
    $scope.shellLoaded = function (_editor) {
        _codemirror_editor = _editor;
        CodeMirrorOption.setEditor(_editor);
        _codemirror_editor.on("keypress", function () {
            if ($scope.data.ref_param_list && $scope.data.ref_param_list.length != 0) {
                _codemirror_editor.showHint({ 'pluginKeys': $scope.data.plugin_hint_list.concat($scope.data.ref_param_list) });
            } else {
                _codemirror_editor.showHint();
            }
        });
    };
    //组件-命令输入
    $scope.commandShellLoaded = function (_editor) {
        CodeMirrorOption.setUniqueParamsEditor(_editor, _curr_code_type, $scope.data.plugin_hint_list);
    };
    //组件-命令输入无提示
    $scope.commandNoneShellLoaded = function (_editor) {
        CodeMirrorOption.setNoneParamsEditor(_editor, _curr_code_type, $scope.data.plugin_hint_list);
    }
    //C/C++附件
    $scope.cmpt_accessory_fileupload = {
        suffixs: '',
        filetype: "",
        filename: "",
        uploadpath: ""
    };
    //组件--获取执行类别对应的可用插件列表
    var getPluginListByImplType = function (impl_type) {
        //获取对应实现类型的插件列表
        Plugin.getAllPluginList(impl_type).then(function (data) {
            if (data) {
                $scope.data.plugin_list = data.plugin_list ? data.plugin_list : [];
            }
        }, function (error) {
            // Modal.alert(error.message,3);
        });
    };
    //组件- 获取附件上传路径
    var getAccessaryUploadPath = function () {
        envManage.getUploadPath().then(function (data) {
            if (data) {
                $scope.cmpt_accessory_fileupload.uploadpath = data.upload_path ? data.upload_path : '';
            }
        }, function (error) {
            // Modal.alert(error.message,3);
        });
    };
    var init = function () {

        if (!modalParam.is_update || modalParam.is_update == 2) {
            $scope.phase_info.is_update = modalParam.is_update;
            $scope.phase_info.impl_type = modalParam.impl_type;
            getPluginListByImplType($scope.phase_info.impl_type);
            //语言查询版本号
            if ($scope.phase_info.impl_type == 14 || $scope.phase_info.impl_type == 7 || $scope.phase_info.impl_type == 8) {
                /*      envManage.selectLanguageVersionByName($scope.phase_info.impl_type).then(function (data) {
                          if(data){
                              $scope.data.language_version_list = data.language_version_list ? data.language_version_list :[];
                          }
                      },function (error) {
                          // Modal.alert(error.message,3);
                      })*/
                $scope.data.language_version_list = ["1.5", "1.6", "1.7", "1.8"];
            }
            $scope.phase_info.language_version = modalParam.language_version;
            _curr_code_type = ($scope.phase_info.impl_type < 6) ? 1 : ($scope.phase_info.impl_type == 6) ? 4 : ($scope.phase_info.impl_type == 7 || $scope.phase_info.impl_type == 8) ? 2 : ($scope.phase_info.impl_type == 14) ? 3 : 1;
            $scope.phase_info.cn_name = modalParam.cn_name;
            $scope.phase_info.exec_script = modalParam.exec_script;
            // $scope.phase_info.srv_soc= modalParam.srv_soc;
            $scope.phase_info.plugin_list = modalParam.plugin_list ? modalParam.plugin_list : [];
            $scope.phase_info.annex_file = modalParam.annex_file;
            $scope.phase_info.command = modalParam.command;

            $scope.data.plugin_hint_list = CmptFunc.translatePluginHint($scope.phase_info.plugin_list);
            $scope.cmpt_accessory_fileupload.filename = modalParam.annex_file ? modalParam.annex_file.substring(modalParam.annex_file.lastIndexOf('/') + 1) : '';
            $timeout(function () {
                if ($scope.phase_info.impl_type != 15) {
                    _codemirror_editor.setOption('mode', (_curr_code_type == 4) ? 'text/x-sql' : (_curr_code_type == 2) ? 'text/x-python' : (_curr_code_type == 3) ? 'text/x-java' : 'text/x-sh');
                    _codemirror_editor.on("keypress", function () {
                        if (($scope.data.plugin_hint_list && $scope.data.plugin_hint_list.length > 0) || ($scope.data.ref_param_list && $scope.data.ref_param_list.length != 0)) {
                            _codemirror_editor.showHint({ 'pluginKeys': $scope.data.plugin_hint_list.concat($scope.data.ref_param_list) });
                        } else {
                            _codemirror_editor.showHint();
                        }
                    });
                }

            }, 100)
        };
        getAccessaryUploadPath();
    };
    //组件--选择实现类型来切换codemirror的代码高亮类型
    $scope.chooseImplType = function (impl_type) {
        $scope.data.language_version_list = [];
        $scope.data.plugin_list = [];
        $scope.phase_info.plugin_list = [];
        $scope.data.plugin_hint_list = [];
        _curr_code_type = (impl_type < 6) ? 1 : (impl_type == 6) ? 4 : (impl_type == 7 || impl_type == 8) ? 2 : (impl_type == 14) ? 3 : 1;
        _codemirror_editor.setOption('mode', (_curr_code_type == 4) ? 'text/x-sql' : (_curr_code_type == 2) ? 'text/x-python' : (_curr_code_type == 3) ? 'text/x-java' : 'text/x-sh');
        _codemirror_editor.on("keypress", function () {
            if ($scope.data.plugin_hint_list && $scope.data.plugin_hint_list.length > 0) {
                _codemirror_editor.showHint({ 'pluginKeys': $scope.data.plugin_hint_list });
            } else {
                _codemirror_editor.showHint();
            }
        });
        //语言查询版本号
        if (impl_type == 14 || impl_type == 7 || impl_type == 8) {
            /*      envManage.selectLanguageVersionByName(impl_type).then(function (data) {
                      if(data){
                          $scope.data.language_version_list = data.language_version_list ? data.language_version_list :[];
                      }
                  },function (error) {
                      // Modal.alert(error.message,3);
                  })*/
            $scope.data.language_version_list = ["1.5", "1.6", "1.7", "1.8"];
        } else {
            $scope.phase_info.language_version = '';
        }
        getPluginListByImplType(impl_type);
    };
    //组件--添加可用的插件列表
    $scope.addAvailablePlugin = function () {
        if ($scope.phase_info.plugin_list.length != 0) {
            for (var i = 0; i < $scope.phase_info.plugin_list.length; i++) {
                if (!$scope.phase_info.plugin_list[i].plugin_name) {
                    Modal.alert("请选择插件名", 3);
                    return false;
                }
            }
            //无可用插件
            if ($scope.data.plugin_list.length == $scope.phase_info.plugin_list.length) {
                Modal.alert("无可再添加的插件！", 3);
                return false
            }
        }
        $scope.phase_info.plugin_list.push({
            plugin_name: "",
            plugin_type: "",
            plugin_file_name: "",
            plugin_bk_desc: "",
        });
    };
    //组件--绑定选择的插件的基本信息及刷新codemirror提示信息
    $scope.bindPluginInfo = function (selectKey, index, tr) {
        var plugin_name_info = {};
        for (var j = 0; j < $scope.phase_info.plugin_list.length; j++) {
            var _plugin_name = $scope.phase_info.plugin_list[j].plugin_name;
            if (!plugin_name_info[_plugin_name]) {
                plugin_name_info[_plugin_name] = 1;
            } else {
                Modal.alert("插件已经添加！", 3);
                $scope.phase_info.plugin_list.splice(index, 1);
                return false;
            }
        }
        for (var i = 0; i < $scope.data.plugin_list.length; i++) {
            var _plugin = $scope.data.plugin_list[i];
            if (selectKey == _plugin.plugin_name) {
                tr.plugin_type = _plugin.plugin_type;
                tr.plugin_file_name = _plugin.plugin_file_name;
                tr.plugin_bk_desc = _plugin.plugin_bk_desc;
                break;
            }
        }
        $scope.data.plugin_hint_list = CmptFunc.translatePluginHint($scope.phase_info.plugin_list);
        _codemirror_editor.on("keypress", function () {
            if (($scope.data.plugin_hint_list && $scope.data.plugin_hint_list.length > 0) || ($scope.data.ref_param_list && $scope.data.ref_param_list.length != 0)) {
                _codemirror_editor.showHint({ 'pluginKeys': $scope.data.plugin_hint_list.concat($scope.data.ref_param_list) });
            } else {
                _codemirror_editor.showHint();
            }
        });
    };
    //插件类型转化中文名
    $scope.getPluginTypeCnName = function (plugin_type) {
        return CV.findValue(plugin_type, pluginType);
    };
    //组件 -- 删除也已经选择的插件
    $scope.deleteSinglePlugin = function (index) {
        var _plugin_name = $scope.phase_info.plugin_list[index].plugin_name;
        if (_plugin_name) {
            Modal.confirm("确认是否要删除[ " + _plugin_name + " ]插件?").then(function () {
                $scope.phase_info.plugin_list.splice(index, 1);
                $scope.data.plugin_hint_list = CmptFunc.translatePluginHint($scope.phase_info.plugin_list);
                _codemirror_editor.on("keypress", function () {
                    if ($scope.data.plugin_hint_list && $scope.data.plugin_hint_list.length > 0) {
                        _codemirror_editor.showHint({ 'pluginKeys': $scope.data.plugin_hint_list });
                    } else {
                        _codemirror_editor.showHint();
                    }
                });
            })
        } else {
            $scope.phase_info.plugin_list.splice(index, 1);
            $scope.data.plugin_hint_list = CmptFunc.translatePluginHint($scope.phase_info.plugin_list);
            _codemirror_editor.on("keypress", function () {
                if ($scope.data.plugin_hint_list && $scope.data.plugin_hint_list.length > 0) {
                    _codemirror_editor.showHint({ 'pluginKeys': $scope.data.plugin_hint_list });
                } else {
                    _codemirror_editor.showHint();
                }
            });
        }
    };
    //附件上传成功
    $scope.ImportAccessorySuccessThen = function () {
        $scope.phase_info.annex_file = $scope.cmpt_accessory_fileupload.uploadpath + '/' + $scope.cmpt_accessory_fileupload.filename;
    };
    //删除附件
    $scope.removeAccessoryFile = function () {
        $scope.cmpt_accessory_fileupload.filename = '';
        $scope.phase_info.annex_file = '';
    };
    //下载附件
    $scope.downloadAccessoryFile = function () {
        CV.downloadFile($scope.phase_info.annex_file);
    };
    //保存阶段
    $scope.savePhase = function () {
        if (!CV.valiForm($scope.form.new_phase_form)) {
            return false;
        }
        $scope.phase_info.cmds = CmptFunc.stringToCmds($scope.phase_info.exec_script);
        if ($scope.phase_info.command && $scope.phase_info.command.exec_script) {
            $scope.phase_info.command.cmds = CmptFunc.stringToCmds($scope.phase_info.command.exec_script);
        }
        //组件类型为阶段
        $scope.phase_info.phase_type = 3;
        $modalInstance.close($scope.phase_info); //添加成功
        $scope.show_phase = false; //清空
    };
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    }
    //组件 -下载插件
    $scope.downLoadPlugin = function (path) {
        CV.downloadFile(path);
    };
    init();
}]);

/**
 *方案--固化配置
 * */
modal_m.controller('programCurConfigCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "NodeReform", "Collection", "BusiSys", "ProtocolType", "Sys", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, NodeReform, Collection, BusiSys, ProtocolType, Sys, Modal, CV) {
    var _business_sys_name = modalParam.business_sys_name;
    var _modify_node = modalParam.node_soc_list ? angular.copy(modalParam.node_soc_list) : []; // 存在即为修改
    var _init_temp = "";  //初始化路径
    var _logical_node_id;   //逻辑节点id
    //对象
    $scope.info = {
        node_info: {
            logical_node_id: '',//逻辑节点id
            logical_node_name: '',//逻辑节点中文名
            node_list: [],
            node_soc_list: []
        },
        node_dir: {
            path_files: [],  // 节点目录列表
            checked_files: [], //选中文件
            paths: [],       //路径
            init_path: '',     //初始化路径
        },
        form: {},  //页面对象
    };
    //数据
    $scope.data = {
        logic_node_list: [],  // 逻辑节点列表
        // ver_soc_list:[], //执行数据源
        // exe_soc_list :[] //ftp
    };
    //页面控制对象
    $scope.control = {
        node_loading: false,  //节点加载
        is_update: false,  //是否更新
    };
    //获取文件路径
    var getNodePath = function (path) {
        var _init_path = path;
        var _fill_path = "";
        //去掉路径最后的'/'
        _init_path = _init_path.length > 1 && _init_path.lastIndexOf("/") == _init_path.length - 1 ? _init_path.slice(0, _init_path.length - 1) : _init_path;
        var _last_slash_index = _init_path.lastIndexOf("/");
        // /, /a, a, /a/b, a/b, a/
        if (!_init_path) {           //''
            $scope.info.node_dir.paths = [];
        } else if (_last_slash_index == -1) {   //没有'/'或''
            $scope.info.node_dir.paths = [_init_path];
        } else if (_init_path.length == 1 && _last_slash_index == 0) {   //只有'/'
            $scope.info.node_dir.paths = ['/'];
        } else if (_last_slash_index == 0) {     // '/x'
            _fill_path = "/";
            $scope.info.node_dir.paths = [_init_path.slice(1)];
        } else {
            _fill_path = "/";
            $scope.info.node_dir.paths = _init_path.slice(1).split("/");
        }
    };
    var init = function () {
        // $scope.control.node_loading =true;
        $scope.data.logic_node_list = modalParam.logic_node_list ? modalParam.logic_node_list : [];
        /*  //获取节点信息
          NodeReform.getIpWithProtocolAndSoc(_business_sys_name,9).then(function (data) {
              var _node_list = data.node_list ? data.node_list : [];
              for(var i=0;i<_node_list.length;i++){
                  _node_list[i].index=i;
                  _node_list[i].ver_soc_list = _node_list[i].ver_soc_list ?  _node_list[i].ver_soc_list :[];
                  _node_list[i].exe_soc_list = _node_list[i].exe_soc_list ?  _node_list[i].exe_soc_list :[];
              }
              $scope.data.node_list = _node_list;
              $scope.control.node_loading =false;
          }, function (error) {
              $scope.control.node_loading =false;
              Modal.alert(error.message,3);
          });*/
        if (_modify_node.length != 0) {
            var _node_soc = _modify_node[0];
            _logical_node_id = _node_soc.logical_node_id;
            $scope.info.node_info.logical_node_id = _node_soc.logical_node_id;
            $scope.info.node_info.logical_node_name = _node_soc.logical_node_name;
            $scope.getFileList($scope.info.node_info.logical_node_id, $scope.info.node_info.logical_node_name);
        }
    };
    //获取节点下文件
    $scope.getFileList = function (selectKey, selectValue) {
        if ($scope.info.node_info.node_soc_list.length != 0) {
            $scope.info.node_info.node_soc_list[0].checked_files = [];
        }
        $scope.info.node_info.logical_node_name = selectValue;
        $scope.info.node_dir.paths = [];
        $scope.info.node_dir.loading = true;
        $scope.info.node_dir.init_path = '';
        Sys.getRemoteDirectory(_business_sys_name, selectKey, $scope.info.node_dir.init_path).then(function (data) {
            if (data) {
                $scope.info.node_dir.loading = false;
                _init_temp = data.root_bk_dir;
                $scope.info.node_dir.init_path = _init_temp;
                getNodePath(_init_temp);
                $scope.info.node_dir.path_files = data.file_bean_list ? data.file_bean_list : [];
            }
        }, function (error) {
            $scope.info.node_dir.loading = false;
            $scope.info.node_dir.err_msg = error.message;
        });
        /*        Collection.getFileListBySoc(_ftp_soc, $scope.info.node_dir.init_path,$scope.info.node_info.execute_ip).then(function(data) {
                    $scope.info.node_dir.loading = false;
                    _init_temp= data.root_bk_dir;
                    $scope.info.node_dir.init_path = _init_temp;
                    getNodePath(_init_temp);
                    $scope.info.node_dir.path_files = data.file_bean_list ? data.file_bean_list : [];
                }, function(error) {
                    $scope.info.node_dir.loading = false;
                    $scope.info.node_dir.err_msg = error.message;
                });*/
    };
    //选择目录
    $scope.changePath = function () {
        $scope.info.node_dir.loading = true;
        if (_modify_node.length == 0) {
            $scope.info.node_info.node_soc_list = [];
        }
        Sys.getRemoteDirectory(_business_sys_name, $scope.info.node_info.logical_node_id, $scope.info.node_dir.full_path).then(function (data) {
            if (data) {
                $scope.info.node_dir.loading = false;
                $scope.info.node_dir.path_files = data.file_bean_list ? data.file_bean_list : [];
                if (_modify_node.length == 0) {
                    var _obj = {
                        logical_node_name: $scope.info.node_info.logical_node_name,
                        logical_node_id: $scope.info.node_info.logical_node_id,
                        file_list: [],
                        checked_files: []
                    };
                    _obj.checked_files = $scope.info.node_dir.checked_files;
                    $scope.info.node_info.node_soc_list.push(_obj);
                } else {
                    if (_logical_node_id == $scope.info.node_info.logical_node_id) {
                        var _node_soc = _modify_node[0];
                        _node_soc.checked_files = [];
                        _node_soc.file_list = _node_soc.file_list ? _node_soc.file_list : [];
                        for (var i = 0; i < _node_soc.file_list.length; i++) {
                            var _file = _node_soc.file_list[i];
                            _node_soc.checked_files.push({ path: _file.substring(0, _file.lastIndexOf('/')), file: _file.substring(_file.lastIndexOf('/') + 1) });
                        }
                        $scope.info.node_info.node_soc_list = _modify_node;
                        $scope.info.node_dir.checked_files = $scope.info.node_info.node_soc_list[0].checked_files;
                    } else {
                        $scope.info.node_info.node_soc_list = [];
                        var _obj = {
                            logical_node_name: $scope.info.node_info.logical_node_name,
                            logical_node_id: $scope.info.node_info.logical_node_id,
                            file_list: [],
                            checked_files: []
                        };
                        _obj.checked_files = $scope.info.node_dir.checked_files;
                        $scope.info.node_info.node_soc_list.push(_obj);
                    }
                }
            }
        }, function (error) {
            $scope.info.node_dir.loading = false;
            $scope.info.node_dir.err_msg = error.message;
        });
        /*Collection.getFileListBySoc(_ftp_soc, $scope.info.node_dir.full_path,$scope.info.node_info.execute_ip).then(function(data) {
            $scope.info.node_dir.loading = false;
            $scope.info.node_dir.path_files = data.file_bean_list ? data.file_bean_list : [];
            if(_modify_node.length==0){
                // $scope.info.node_dir.checked_files = [];
                var _obj={
                    execute_soc_name :_ftp_soc,
                    support_soc_name: '',
                    execute_ip:$scope.info.node_info.execute_ip,
                    support_ip:$scope.info.node_info.execute_ip,
                    execute_protocol_type:$scope.data.exe_soc_list[$scope.info.node_info.ftp_soc_index].protocol_type,
                    support_protocol_type:'',
                    file_list:[],
                    checked_files:[]
                };
                _obj.checked_files = $scope.info.node_dir.checked_files;
                $scope.info.node_info.node_soc_list.push(_obj);
            }else {
                if(_ftp_soc == $scope.info.node_info.node_soc_list[0].exe_soc_name){
                    $scope.info.node_dir.checked_files =$scope.info.node_info.node_soc_list[0].checked_files;
                }else{
                    $scope.info.node_info.node_soc_list=[];
                    var _obj={
                        execute_soc_name :_ftp_soc,
                        support_soc_name: '',
                        execute_ip:$scope.info.node_info.execute_ip,
                        support_ip:$scope.info.node_info.execute_ip,
                        execute_protocol_type:$scope.data.exe_soc_list[$scope.info.node_info.ftp_soc_index].protocol_type,
                        support_protocol_type:'',
                        file_list:[],
                        checked_files:[]
                    };
                    _obj.checked_files = $scope.info.node_dir.checked_files;
                    $scope.info.node_info.node_soc_list.push(_obj);
                }
            }
        }, function(error){
            $scope.info.node_dir.loading = false;
            $scope.info.node_dir.err_msg = error.message;
        });*/
    };
    //确认按钮
    $scope.saveData = function () {
        if (!CV.valiForm($scope.info.form)) {
            return false;
        }
        var _node_soc = $scope.info.node_info.node_soc_list[0];
        if (!_node_soc || _node_soc.checked_files.length == 0) {
            Modal.alert("请选择文件", 3);
            return;
        }
        _node_soc.file_list = [];
        _node_soc.files_list = [];
        for (var i = 0; i < _node_soc.checked_files.length; i++) {
            if (_node_soc.checked_files[i].path.charAt(0) == '/' && _node_soc.checked_files[i].path.charAt(1) == '/') {
                _node_soc.file_list.push(_node_soc.checked_files[i].path.substring(2) + '/' + _node_soc.checked_files[i].file);
                _node_soc.files_list.push({ file: _node_soc.checked_files[i].path.substring(2) + '/' + _node_soc.checked_files[i].file, ready_flag: true });
            } else {
                _node_soc.file_list.push(_node_soc.checked_files[i].path + '/' + _node_soc.checked_files[i].file);
                _node_soc.files_list.push({ file: _node_soc.checked_files[i].path + '/' + _node_soc.checked_files[i].file, ready_flag: true });
            }
        }
        $modalInstance.close($scope.info.node_info.node_soc_list)
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    init();
}]);

/**
 * 人工阶段
 * **/
modal_m.controller('programManualPhaseCtrl', ["$scope", "$modalInstance", "ScrollConfig", "$sce", "$timeout", "modalParam", "Modal", "CV", function ($scope, $modalInstance, ScrollConfig, $sce, $timeout, modalParam, Modal, CV) {
    var _script = modalParam.script;
    //对象
    $scope.info = {
        manual: {}, //人工对象
        form: {},  //页面提交表单
        manual_phase_form: {}  //页面阶段表单
    };
    $scope.config = {
        scroll_info: ScrollConfig
    }
    $scope.info.manual.script = '';
    //控制
    $scope.control = {
        link_show_flag: false  //链接
    };
    //初始化
    var init = function () {
        if (_script) {    //修改
            $scope.info.manual.script = modalParam.script.cmds[0];
            $timeout(function () {
                $('#manual_id').html($scope.info.manual.script);
            }, 300);
        };
    };
    //html
    var pasteHtmlAtCaret = function (html, selectPastedContent) {
        var sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                var el = document.createElement("div");
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                var firstNode = frag.firstChild;
                range.insertNode(frag);
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    if (selectPastedContent) {
                        range.setStartBefore(firstNode);
                    } else {
                        range.collapse(true);
                    }
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if ((sel = document.selection) && sel.type != "Control") {
            // IE < 9
            var originalRange = sel.createRange();
            originalRange.collapse(true);
            sel.createRange().pasteHTML(html);
            if (selectPastedContent) {
                range = sel.createRange();
                range.setEndPoint("StartToStart", originalRange);
                range.select();
            }
        }
    };
    //保存url
    $scope.saveUrl = function () {
        if (!CV.valiForm($scope.info.form)) {
            return false;
        }
        var _html = $('#manual_id').html()
        if (!$('#manual_id').text()) {
            _html = $('#manual_id').html().replace(/<br>/g, '')
        }
        $('#manual_id').html(_html + '[<a href="' + $scope.info.manual.link_url + '" title="' + $scope.info.manual.link_url + '" target="_blank">' + $scope.info.manual.link_intro + '</a>]');
        $scope.info.manual.link_intro = '';
        $scope.info.manual.link_url = '';
        $scope.info.form.$setPristine();
        $scope.control.link_show_flag = false;
    };
    //删除url
    $scope.deleteUrl = function () {
        $scope.control.link_show_flag = false;
        $scope.info.manual.link_intro = '';
        $scope.info.manual.link_url = '';
    };
    //保存数据
    $scope.saveData = function () {
        var _text = $('#manual_id').html();
        if ($('#manual_id').text() == '') {
            Modal.alert("请输入内容", 3);
            return;
        }
        $modalInstance.close(_text)
    };
    //换行
    $scope.changeLine = function (event) {
        if (event.keyCode == 13) {
            pasteHtmlAtCaret('<br>', false);
        }
    };
    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
    $timeout(function () {
        $('[contenteditable]').each(function () {
            //IE http之类地址自动加链接
            try {
                document.execCommand("AutoUrlDetect", false, false);
            } catch (e) { }

            $(this).on('paste', function (e) {
                e.preventDefault();
                var text = null;
                if (window.clipboardData && clipboardData.setData) {
                    // IE
                    text = window.clipboardData.getData('text');
                } else {
                    text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('在这里输入文本');
                }
                if (document.body.createTextRange) {
                    if (document.selection) {
                        var textRange = document.selection.createRange();
                    } else if (window.getSelection) {
                        var sel = window.getSelection();
                        var range = sel.getRangeAt(0);

                        // 创建临时元素，使得TextRange可以移动到正确的位置
                        var tempEl = document.createElement("span");
                        tempEl.innerHTML = "&#FEFF;";
                        range.deleteContents();
                        range.insertNode(tempEl);
                        textRange = document.body.createTextRange();
                        textRange.moveToElementText(tempEl);
                        tempEl.parentNode.removeChild(tempEl);
                    }
                    textRange.text = text;
                    textRange.collapse(false);
                    textRange.select();
                } else {
                    // Chrome之类浏览器
                    document.execCommand("insertText", false, text);
                }
            });
            // 去除Crtl+b/Ctrl+i/Ctrl+u等快捷键
            $(this).on('keydown', function (e) {
                // e.metaKey for mac
                if (e.ctrlKey || e.metaKey) {
                    switch (e.keyCode) {
                        case 66: //ctrl+B or ctrl+b
                        case 98:
                        case 73: //ctrl+I or ctrl+i
                        case 105:
                        case 85: //ctrl+U or ctrl+u
                        case 117: {
                            e.preventDefault();
                            break;
                        }
                    }
                }
            });
        });
    }, 0);
    init();
}]);

/**
 *方案--批量处理
 * */
modal_m.controller('programBatchConfigCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "ScrollConfig", "NodeReform", "BusiSys", "ProtocolType", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, ScrollConfig, NodeReform, BusiSys, ProtocolType, Modal, CV) {
    var _temp_group_list = [];
    var _group_list_global = [];
    var _owner_control = modalParam.control;
    /*数据源配置*/
    var _business_sys_name = modalParam.business_sys_name;
    var _srv_soc = modalParam.srv_soc ? modalParam.srv_soc : [];
    //上一步
    var _old_soc;
    $scope.form = {};
    $scope.config = {
        scroll_info: ScrollConfig
    };
    $scope.data_deal_info = {};
    $scope.controls = {
        next_step_flag: false,
        operate_btn: 1,        //`1,复制，2移动，3数据源，4删除,
        copy_flag: true,
        ip_loading: false,
        soc_flag: true,
        soc_config_type: 1,      //配置数据源默认手动配置
        check_phase_flag: false,   //是否有阶段被选中
        deal_loading: false      //处理loading
    };
    $scope.data = {
        copy_soc_list: [],//拷贝数据源列表
        phase_item: []    //阶段下拉选项
    };
    $scope.program_info = {
        group_list: []
    };
    /*滚动条内部配置*/
    $scope.scroll_config_info = {
        axis: "y",
        theme: "custom-dark",
        scrollbarPosition: "inside",
        scrollInertia: 500,
        scrollEasing: "easeOutCirc",
        autoDraggerLength: true,
        autoHideScrollbar: true,
        scrollButtons: { enable: false }
    };
    $scope.normal_ip_list = [];
    $scope.extra_ip_list = [];
    $scope.source_list = [];
    $scope.reqData = {
        imply_type: '',
        two_soc_loading: false,
        business_sys_name: _business_sys_name,
        two_soc: false,
        check_ip: '',
        search_ver_key: '',
        protocol_type: '',
        normal_ip_list: [],
        extra_ip_list: [],
        ip_data_list: [],
        mid_ip_list: [],
        search_key_work: '',
        srv_soc: [],
        copy_soc_list: [] //copy数据源列表
    };
    $scope.sourceType_color = [
        { s_type: 1, color: "#88B8FE", bg: "#F5F9FE" },
        { s_type: 5, color: "#7BADA4", bg: "#D2F6EE" },
        { s_type: 9, color: "#FC973E", bg: "#FFF4ED" },
        { s_type: 10, color: "#88B8FE", bg: "#EAF8FC" },
        { s_type: 14, color: "#FC973E", bg: "#FFF4ED" },
    ];
    var init = function () {
        //生成phase_index,group_index
        for (var i = 0; i < modalParam.group_list.length; i++) {
            modalParam.group_list[i].group_index = i;
            for (var j = 0; j < modalParam.group_list[i].phase_list.length; j++) {
                modalParam.group_list[i].phase_list[j].phase_index = j;
                modalParam.group_list[i].phase_list[j].select_flag = false;
            }
        }
        _group_list_global = modalParam.group_list;
        $scope.program_info.group_list = angular.copy(modalParam.group_list);
    };
    //移除所有已选中的节点数据源面板中的数据源
    var remove_AllDataSource = function (one_ip) {
        for (var i = 0; i < $scope.reqData.normal_ip_list.length; i++) {
            if (one_ip.exe_ip == $scope.reqData.normal_ip_list[i].exe_ip) {
                $scope.reqData.normal_ip_list[i].is_show = false;
            }
        }
    };
    //保存数据源
    var saveCheckSocMSg = function (group_list) {
        if ($scope.controls.soc_config_type == 1) {
            if ($scope.reqData.two_soc) {
                for (var i = 0; i < $scope.reqData.extra_ip_list.length; i++) {
                    if (!$scope.reqData.extra_ip_list[i].delete_flag) {
                        var _srv_soc = {};
                        _srv_soc.exe_ip = $scope.reqData.extra_ip_list[i].exe_ip;
                        _srv_soc.exe_soc_list = [];
                        _srv_soc.ver_soc_list = [];
                        for (var j = 0; j < $scope.reqData.extra_ip_list[i].exe_soc_list.length; j++) {
                            _srv_soc.exe_soc_list.push({ soc_name: $scope.reqData.extra_ip_list[i].exe_soc_list[j].exe_soc_name, protocol_type: $scope.reqData.extra_ip_list[i].exe_soc_list[j].protocol_type });
                            if ($scope.reqData.extra_ip_list[i].exe_soc_list[j].state) {
                                _srv_soc.exe_soc_name = $scope.reqData.extra_ip_list[i].exe_soc_list[j].exe_soc_name;
                                _srv_soc.exe_protocol_type = $scope.reqData.extra_ip_list[i].exe_soc_list[j].protocol_type;
                            }
                        }
                        for (var k = 0; k < $scope.reqData.extra_ip_list[i].ver_ip_list.length; k++) {
                            if ($scope.reqData.extra_ip_list[i].ver_ip_list[k].is_check) {
                                _srv_soc.ver_ip = $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_ip;
                                for (var m = 0; m < $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list.length; m++) {
                                    _srv_soc.ver_soc_list.push({ soc_name: $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list[m].ver_soc_name, protocol_type: $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list[m].protocol_type });
                                    if ($scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list[m].state) {
                                        _srv_soc.ver_soc_name = $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list[m].ver_soc_name;
                                        _srv_soc.ver_protocol_type = $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list[m].protocol_type;

                                    }
                                }
                                break;
                            }
                        }
                        if (_srv_soc.exe_soc_name && _srv_soc.ver_soc_name) {
                            _srv_soc.execute_ip = _srv_soc.exe_ip;
                            _srv_soc.execute_soc_name = _srv_soc.exe_soc_name;
                            _srv_soc.execute_protocol_type = _srv_soc.exe_protocol_type;
                            _srv_soc.support_soc_name = _srv_soc.ver_soc_name;
                            _srv_soc.support_ip = _srv_soc.ver_ip;
                            _srv_soc.support_protocol_type = _srv_soc.ver_protocol_type;
                            $scope.reqData.srv_soc.push(_srv_soc);
                        }
                    }
                }
            } else {
                for (var i = 0; i < $scope.reqData.normal_ip_list.length; i++) {
                    if ($scope.reqData.normal_ip_list[i].is_show) {
                        var _soc = {};
                        _soc.exe_soc_list = [];
                        _soc.exe_ip = $scope.reqData.normal_ip_list[i].exe_ip;
                        for (var j = 0; j < $scope.reqData.normal_ip_list[i].exe_soc_list.length; j++) {
                            _soc.exe_soc_list.push({ soc_name: $scope.reqData.normal_ip_list[i].exe_soc_list[j].exe_soc_name, protocol_type: $scope.reqData.normal_ip_list[i].exe_soc_list[j].protocol_type });
                            if ($scope.reqData.normal_ip_list[i].exe_soc_list[j].state) {
                                _soc.exe_soc_name = $scope.reqData.normal_ip_list[i].exe_soc_list[j].exe_soc_name;
                                _soc.exe_protocol_type = $scope.reqData.normal_ip_list[i].exe_soc_list[j].protocol_type;
                            }
                        }
                        if (_soc.exe_soc_name) {
                            _soc.execute_ip = _soc.exe_ip;
                            _soc.execute_soc_name = _soc.exe_soc_name;
                            _soc.execute_protocol_type = _soc.exe_protocol_type;
                            $scope.reqData.srv_soc.push(_soc);
                        }
                    }
                }
            }
        }
        var _node_soc_list = $scope.controls.soc_config_type == 1 ? $scope.reqData.srv_soc : $scope.reqData.copy_soc_list;
        for (var i = 0; i < group_list.length; i++) {
            var _group = group_list[i];
            for (var j = 0; j < _group.phase_list.length; j++) {
                if (_group.phase_list[j].select_flag) {
                    _group.phase_list[j].node_soc_list = _node_soc_list;
                }
            }
        }
    };
    /********************************************************/
    //copy数据源列表
    var copyPhaseSoc = function (phases, impl_type) {
        $scope.data.copy_soc_list = [];
        var _copy_index = 0;
        for (var i = 0; i < phases.length; i++) {
            for (var j = 0; j < phases[i].phase_list.length; j++) {
                var _phase = phases[i].phase_list[j];
                if (_phase.node_soc_list && _phase.node_soc_list.length != 0) {
                    if (impl_type == _phase.impl_type) {
                        $scope.data.copy_soc_list.push({ phase_name: _phase.phase_name, node_soc_list: _phase.node_soc_list, status: false, phase_type: _phase.phase_type, copy_index: _copy_index });
                        _copy_index++;
                    }
                }
            }
        }
    };
    //复制
    var copyBatchPhase = function (global_list) {
        var _arr = [];
        var _group_index = $scope.data_deal_info.group_index;
        var _phase_index = $scope.data_deal_info.phase_index;
        for (var i = 0; i < $scope.program_info.group_list.length; i++) {
            var _group = $scope.program_info.group_list[i];
            if (_group.state) {
                _arr = _arr.concat(angular.copy(_group.phase_list));
            } else {
                for (var j = 0; j < _group.phase_list.length; j++) {
                    if (_group.phase_list[j].select_flag) {
                        _arr.push(angular.copy(_group.phase_list[j]));
                    }
                }
            }
        }
        var pre_arr = global_list[_group_index].phase_list.slice(0, _phase_index + 1);
        var last_arr = global_list[_group_index].phase_list.slice(_phase_index + 1);
        global_list[_group_index].phase_list = pre_arr.concat(_arr).concat(last_arr);
    };
    //移动
    var moveBatchPhase = function () {
        copyBatchPhase(_temp_group_list);
    };
    //数据源初始化
    var configBatchSoc = function () {
        $scope.controls.ip_loading = true;
        if ($scope.reqData.imply_type > 2 && $scope.reqData.imply_type < 6 || $scope.reqData.imply_type == 14 || $scope.reqData.imply_type == 15) {
            $scope.reqData.two_soc = true;
        }
        $scope.reqData.ip_data_list = [];
        $scope.reqData.normal_ip_list = [];
        $scope.reqData.extra_ip_list = [];
        NodeReform.getIpWithProtocolAndSoc(_business_sys_name, $scope.reqData.imply_type).then(function (data) {
            $scope.controls.ip_loading = false;
            var _node_list = data.node_list ? data.node_list : [];
            for (var i = 0; i < _node_list.length; i++) {
                var _one_node = _node_list[i];
                $scope.reqData.ip_data_list.push(_one_node.node_ip);
                if (!$scope.reqData.two_soc) {
                    $scope.reqData.normal_ip_list.push({
                        exe_ip: _one_node.node_ip,
                        exe_soc_list: [],
                        is_show: false,
                        exe_soc_name: ''
                    });
                }
            }
            for (var m = 0; m < _srv_soc.length; m++) {
                if (!_srv_soc[m].exe_soc_list) {
                    _srv_soc[m].exe_soc_list = [];
                    for (var l = 0; l < _node_list.length; l++) {
                        if (_node_list[l].node_ip == _srv_soc[m].exe_ip) {
                            _srv_soc[m].exe_soc_list = _node_list[l].exe_soc_list;
                        }
                    }
                }
                if (!_srv_soc[m].ver_soc_list) {
                    _srv_soc[m].ver_soc_list = [];
                    for (var l = 0; l < _node_list.length; l++) {
                        if (_node_list[l].node_ip == _srv_soc[m].ver_ip) {
                            _srv_soc[m].ver_soc_list = _node_list[l].ver_soc_list;
                        }
                    }
                }
            }

            if (!$scope.reqData.two_soc) {
                for (var i = 0; i < _srv_soc.length; i++) {
                    for (var j = 0; j < $scope.reqData.normal_ip_list.length; j++) {
                        if (_srv_soc[i].exe_ip == $scope.reqData.normal_ip_list[j].exe_ip) {
                            $scope.reqData.normal_ip_list[j].is_show = true;
                            $scope.reqData.normal_ip_list[j].exe_soc_list = [];
                            $scope.reqData.normal_ip_list[j].exe_soc_name = _srv_soc[i].exe_soc_name;
                            for (var k = 0; k < _srv_soc[i].exe_soc_list.length; k++) {//
                                if (_srv_soc[i].exe_soc_list[k].soc_name == _srv_soc[i].exe_soc_name) {
                                    $scope.reqData.normal_ip_list[j].exe_soc_list.push({
                                        state: true,
                                        exe_soc_name: _srv_soc[i].exe_soc_list[k].soc_name,
                                        protocol_type: _srv_soc[i].exe_soc_list[k].protocol_type
                                    });
                                } else {
                                    $scope.reqData.normal_ip_list[j].exe_soc_list.push({
                                        state: false,
                                        exe_soc_name: _srv_soc[i].exe_soc_list[k].soc_name,
                                        protocol_type: _srv_soc[i].exe_soc_list[k].protocol_type
                                    });
                                }
                            }
                        }
                    }
                }
            } else {
                for (var i = 0; i < _srv_soc.length; i++) {
                    for (var j = 0; j < _srv_soc[i].ver_soc_list.length; j++) {
                        _srv_soc[i].ver_soc_list[j].ver_soc_name = _srv_soc[i].ver_soc_list[j].soc_name;
                        if (_srv_soc[i].ver_soc_name == _srv_soc[i].ver_soc_list[j].soc_name) {
                            _srv_soc[i].ver_soc_list[j].state = true;
                        } else {
                            _srv_soc[i].ver_soc_list[j].state = false;
                        }
                    }
                    for (var j = 0; j < _srv_soc[i].exe_soc_list.length; j++) {
                        _srv_soc[i].exe_soc_list[j].exe_soc_name = _srv_soc[i].exe_soc_list[j].soc_name;
                        if (_srv_soc[i].exe_soc_name == _srv_soc[i].exe_soc_list[j].soc_name) {
                            _srv_soc[i].exe_soc_list[j].state = true;
                        } else {
                            _srv_soc[i].exe_soc_list[j].state = false;
                        }
                    }
                }
                for (var i = 0; i < _srv_soc.length; i++) {
                    var _extra_ip_list = [];
                    for (var j = 0; j < $scope.reqData.ip_data_list.length; j++) {
                        if ($scope.reqData.ip_data_list[j] == _srv_soc[i].ver_ip) {
                            _extra_ip_list.push({
                                ver_ip: $scope.reqData.ip_data_list[j],
                                is_check: true,
                                ver_soc_list: _srv_soc[i].ver_soc_list
                            });
                        } else {
                            _extra_ip_list.push({
                                ver_ip: $scope.reqData.ip_data_list[j],
                                is_check: false,
                                ver_soc_list: []
                            });
                        }
                    }
                    $scope.reqData.extra_ip_list.push({
                        exe_ip: _srv_soc[i].exe_ip,
                        exe_soc_list: _srv_soc[i].exe_soc_list,
                        is_show: false,
                        delete_flag: false,
                        exe_soc_name: _srv_soc[i].exe_soc_name,
                        ver_ip_list: _extra_ip_list,
                        ver_ip: _srv_soc[i].ver_ip
                    })
                }
            }
        }, function (error) {
            $scope.controls.ip_loading = false;
            Modal.alert(error.message, 3);
        });
    };
    //删除
    var deleteBatchPhase = function (group_list) {
        for (var i = 0; i < group_list.length; i++) {
            var _group = group_list[i];
            if (_group.state) {
                _group.phase_list = [];
                if (_group.owner_flag) {
                    _owner_control.owner_btn_flag = true;
                }
            } else {
                for (var j = 0; j < _group.phase_list.length; j++) {
                    if (_group.phase_list[j].select_flag) {
                        if (_group.phase_list[j].phase_type == 5 && $scope.controls.operate_btn == 4) {
                            _owner_control.owner_btn_flag = true;
                        }
                        _group.phase_list.splice(j--, 1);
                    }
                }
            }
        }
    };
    //选择分组,获取阶段下拉框
    $scope.getPhaseItem = function (index) {
        $scope.data.phase_item = [];
        if ($scope.controls.operate_btn == 1) {
            $scope.data.phase_item = $scope.program_info.group_list[index].phase_list
        } else {
            _temp_group_list = angular.copy($scope.program_info.group_list);
            deleteBatchPhase(_temp_group_list);
            for (var k = 0; k < _temp_group_list[index].phase_list.length; k++) {
                var __phase = _temp_group_list[index].phase_list[k];
                __phase.phase_index = k;
            }
            $scope.data.phase_item = _temp_group_list[index].phase_list;
        }
    };
    //添加一条
    $scope.clearVerIp = function () {
        $scope.reqData.search_ver_key = '';
    };
    $scope.locationVerword = function () {
        var _index = 0;
        for (var i = 0; i < $scope.reqData.extra_ip_list.length; i++) {
            if ($scope.reqData.extra_ip_list[i].exe_ip == $scope.reqData.check_ip) {
                _index = i;
                break;
            }
        }
        $scope.reqData.mid_ip_list = [];
        if ($scope.reqData.search_ver_key == '') {
            for (var i = 0; i < $scope.reqData.ip_data_list.length; i++) {
                $scope.reqData.mid_ip_list.push($scope.reqData.ip_data_list[i]);
            }
        } else {
            for (var i = 0; i < $scope.reqData.ip_data_list.length; i++) {
                var _is_exsit = $scope.reqData.ip_data_list[i].indexOf($scope.reqData.search_ver_key);
                if (_is_exsit != -1) {
                    $scope.reqData.mid_ip_list.push($scope.reqData.ip_data_list[i]);
                }
            }
        }
        for (var i = 0; i < $scope.reqData.mid_ip_list.length; i++) {
            var _ip = $scope.reqData.mid_ip_list[i];
            var _is_exsit = false;
            for (var j = 0; j < $scope.reqData.extra_ip_list[_index].ver_ip_list.length; j++) {
                if (_ip == $scope.reqData.extra_ip_list[_index].ver_ip_list[j].ver_ip) {
                    _is_exsit = true;
                }
            }
            if (!_is_exsit) {
                $scope.reqData.extra_ip_list[_index].ver_ip_list.push({ ver_ip: _ip, ver_soc_list: [], is_check: false })
            }
        }
        //
        for (var i = $scope.reqData.extra_ip_list[_index].ver_ip_list.length - 1; i >= 0; i--) {
            if (!$scope.reqData.extra_ip_list[_index].ver_ip_list[i].is_check) {
                var _is_exsit = false;
                for (var j = 0; j < $scope.reqData.mid_ip_list.length; j++) {
                    if ($scope.reqData.mid_ip_list[j] == $scope.reqData.extra_ip_list[_index].ver_ip_list[i].ver_ip) {
                        _is_exsit = true;
                    }
                }
                if (!_is_exsit) {
                    $scope.reqData.extra_ip_list[_index].ver_ip_list.splice(i, 1);
                }
            }
        }

    };
    //点击节点IP
    $scope.checkNodeIP = function (one_ip) {
        one_ip.is_show = !one_ip.is_show;
        if (one_ip.exe_soc_list.length == 0) {
            one_ip.is_loading = true;
            var _imply_type = ($scope.reqData.imply_type == 7 || $scope.reqData.imply_type == 8) ? 2 : $scope.reqData.imply_type;
            if (_business_sys_name == '') {
                Cmpt.getAllSocList(one_ip.exe_ip, _imply_type).then(function (data) {
                    var _soc_list = data.source_list ? data.source_list : [];
                    for (var i = 0; i < _soc_list.length; i++) {
                        if (new RegExp('agent').test(_soc_list[i])) {
                            one_ip.exe_soc_name = _soc_list[i];
                            one_ip.exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                        } else {
                            one_ip.exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                        }
                    }
                    one_ip.is_loading = false;
                }, function (error) {
                    one_ip.is_loading = false;
                    Modal.alert(error.message, 3);
                });
            } else {
                BusiSys.getSocListByIpAndBsys(_business_sys_name, one_ip.exe_ip, _imply_type).then(function (data) {
                    var _soc_list = data.source_list ? data.source_list : [];
                    for (var i = 0; i < _soc_list.length; i++) {
                        if (new RegExp('agent').test(_soc_list[i])) {
                            one_ip.exe_soc_name = _soc_list[i];
                            one_ip.exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                        } else {
                            one_ip.exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                        }
                    }
                    one_ip.is_loading = false;
                }, function (error) {
                    one_ip.is_loading = false;
                    Modal.alert(error.message, 3);
                });
            }

        }
        if (!one_ip.is_show) {
            remove_AllDataSource(one_ip);
        }
    };
    //选中数据源
    $scope.click_dataSource = function (one_soc, one_ip, index) {
        one_soc.state = !one_soc.state;
        //排他数据源
        for (var i = 0; i < $scope.reqData.normal_ip_list.length; i++) {
            if ($scope.reqData.normal_ip_list[i].exe_ip == one_ip) {
                for (var j = 0; j < $scope.reqData.normal_ip_list[i].exe_soc_list.length; j++) {
                    if (j != index) {
                        $scope.reqData.normal_ip_list[i].exe_soc_list[j].state = false;
                    }
                }
            }
        }
    };
    //这里开始为was，svn weblogic
    $scope.selectTwo = function () {
        $timeout(function () {
            $scope.addNodeIp($scope.reqData.search_key_work);
        }, 10);
    };
    //添加第一个节点IP
    $scope.addNodeIp = function (ip) {
        if (ip != '') {
            var _is_exsit = false;
            for (var i = 0; i < $scope.reqData.extra_ip_list.length; i++) {
                if ($scope.reqData.extra_ip_list[i].exe_ip == ip) {
                    _is_exsit = true;
                }
            }
            if (!_is_exsit) {
                $scope.reqData.check_ip = ip;
                var _exe_soc_list = [];
                var _exe_soc_name = '';
                var _extra_ip_list = [];
                for (var i = 0; i < $scope.reqData.ip_data_list.length; i++) {
                    _extra_ip_list.push({ ver_ip: $scope.reqData.ip_data_list[i], is_check: false, ver_soc_list: [] });
                }
                if (_business_sys_name == '') {
                    Cmpt.getAllSocList(ip, 2).then(function (data) {
                        var _soc_list = data.source_list ? data.source_list : [];
                        for (var i = 0; i < _soc_list.length; i++) {
                            if (new RegExp('agent').test(_soc_list[i])) {
                                _exe_soc_name.exe_soc_name = _soc_list[i];
                                _exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                            } else {

                                _exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                            }
                        }
                        $scope.reqData.extra_ip_list.push({ exe_ip: ip, exe_soc_list: _exe_soc_list, is_show: true, delete_flag: false, exe_soc_name: _exe_soc_name, ver_ip_list: [], ver_ip: '' });
                    }, function () {
                        $scope.reqData.extra_ip_list.push({ exe_ip: ip, exe_soc_list: _exe_soc_list, is_show: true, delete_flag: false, exe_soc_name: _exe_soc_name, ver_ip_list: [], ver_ip: '' });
                        Modal.alert(error.message, 3);
                    });
                } else {
                    BusiSys.getSocListByIpAndBsys(_business_sys_name, ip, 2).then(function (data) {
                        var _soc_list = data.source_list ? data.source_list : [];
                        for (var i = 0; i < _soc_list.length; i++) {
                            if (new RegExp('agent').test(_soc_list[i])) {
                                _exe_soc_name.exe_soc_name = _soc_list[i];
                                _exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                            } else {

                                _exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                            }
                        }
                        $scope.reqData.extra_ip_list.push({ exe_ip: ip, exe_soc_list: _exe_soc_list, is_show: true, delete_flag: false, exe_soc_name: _exe_soc_name, ver_ip_list: _extra_ip_list, ver_ip: '' });
                    }, function () {
                        $scope.reqData.extra_ip_list.push({ exe_ip: ip, exe_soc_list: _exe_soc_list, is_show: true, delete_flag: false, exe_soc_name: _exe_soc_name, ver_ip_list: _extra_ip_list, ver_ip: '' });
                        Modal.alert(error.message, 3);
                    });
                }

                for (var i = 0; i < $scope.reqData.extra_ip_list.length; i++) {
                    if ($scope.reqData.extra_ip_list[i].exe_ip != ip) {
                        $scope.reqData.extra_ip_list[i].is_show = false;
                    }
                }
            }
        }
    };
    //选中当前exe_ip,排他
    $scope.clickNodeIP = function (obj, index) {
        if ($scope.reqData.check_ip == obj.exe_ip) {
            obj.is_show = false;
            $scope.reqData.check_ip = '';
        } else {
            $scope.reqData.check_ip = obj.exe_ip;
            for (var i = 0; i < $scope.reqData.extra_ip_list.length; i++) {
                if (obj.exe_ip != $scope.reqData.extra_ip_list[i].exe_ip) {
                    $scope.reqData.extra_ip_list[i].is_show = false;
                } else {
                    $scope.reqData.extra_ip_list[i].is_show = true;
                }
            }
        }

    };
    //删除WAS节点
    $scope.checkDeleteFlag = function (nodeIP, event) {
        event.stopPropagation();
        nodeIP.delete_flag = !nodeIP.delete_flag;
    };
    //选中exe数据源
    $scope.clickExeDataSource = function (data_source, index, parent_index) {
        for (var i = 0; i < $scope.reqData.extra_ip_list[parent_index].exe_soc_list.length; i++) {
            if (i != index) {
                $scope.reqData.extra_ip_list[parent_index].exe_soc_list[i].state = false;
            }
        }
        $scope.reqData.extra_ip_list[parent_index].exe_soc_list[index].state = !$scope.reqData.extra_ip_list[parent_index].exe_soc_list[index].state;
    };
    $scope.clickVerNode = function (one_ver, index, pre_index) {
        if ($scope.reqData.extra_ip_list[pre_index].ver_ip_list[index].ver_soc_list.length == 0) {
            $scope.reqData.tow_soc_loading = true;
            if (_business_sys_name == '') {
                Cmpt.getAllSocList(one_ver.ver_ip, $scope.reqData.imply_type).then(function (data) {
                    var _soc_list = data.source_list || [];
                    var _ver_soc_list = [];
                    var _ver_soc_name = '';
                    for (var i = 0; i < _soc_list.length; i++) {
                        if (new RegExp('agent').test(_soc_list[i])) {
                            _ver_soc_name.exe_soc_name = _soc_list[i];
                            _ver_soc_list.push({ ver_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                        } else {
                            _ver_soc_list.push({ ver_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                        }
                    }
                    $scope.reqData.extra_ip_list[pre_index].ver_ip_list[index].ver_soc_list = _ver_soc_list;
                    $scope.reqData.tow_soc_loading = false;
                }, function (error) {
                    $scope.reqData.tow_soc_loading = false;
                    Modal.alert(error.message, 3);
                });
            } else {
                BusiSys.getSocListByIpAndBsys(_business_sys_name, one_ver.ver_ip, $scope.reqData.imply_type).then(function (data) {
                    var _soc_list = data.source_list || [];
                    var _ver_soc_list = [];
                    var _ver_soc_name = '';
                    for (var i = 0; i < _soc_list.length; i++) {
                        if (new RegExp('agent').test(_soc_list[i])) {
                            _ver_soc_name.exe_soc_name = _soc_list[i];
                            _ver_soc_list.push({ ver_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                        } else {
                            _ver_soc_list.push({ ver_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                        }
                    }
                    $scope.reqData.extra_ip_list[pre_index].ver_ip_list[index].ver_soc_list = _ver_soc_list;
                    $scope.reqData.tow_soc_loading = false;
                }, function (error) {
                    $scope.reqData.tow_soc_loading = false;
                    Modal.alert(error.message, 3);
                });
            }

        }
        for (var i = 0; i < $scope.reqData.extra_ip_list[pre_index].ver_ip_list.length; i++) {
            $scope.reqData.extra_ip_list[pre_index].ver_ip_list[i].is_check = false;
        }
        $scope.reqData.extra_ip_list[pre_index].ver_ip_list[index].is_check = true;
    };
    $scope.clickVerSource = function (one_soc, index, pre_index, p_index) {
        for (var i = 0; i < $scope.reqData.extra_ip_list[p_index].ver_ip_list[pre_index].ver_soc_list.length; i++) {
            if (i != index) {
                $scope.reqData.extra_ip_list[p_index].ver_ip_list[pre_index].ver_soc_list[i].state = false;
            }
        }
        $scope.reqData.extra_ip_list[p_index].ver_ip_list[pre_index].ver_soc_list[index].state = !$scope.reqData.extra_ip_list[p_index].ver_ip_list[pre_index].ver_soc_list[index].state;
    };
    $scope.getProtocolTypeCnName = function (protocol_type) {
        return CV.findValue(protocol_type, ProtocolType);
    }
    $scope.find_dataSource_color = function (type) {
        for (var i = 0; i < $scope.sourceType_color.length; i++) {
            if ($scope.sourceType_color[i].s_type == type) {
                return $scope.sourceType_color[i].color;
            }
        }
    }
    $scope.find_dataSource_bgcolor = function (type) {
        for (var i = 0; i < $scope.sourceType_color.length; i++) {
            if ($scope.sourceType_color[i].s_type == type) {
                return $scope.sourceType_color[i].bg;
            }
        }
    }
    //copy数据源
    $scope.selectCopySoc = function (copy_index) {
        var _node_soc_list = $scope.data.copy_soc_list[copy_index].node_soc_list;
        $scope.reqData.copy_soc_list = _node_soc_list;
    };
    //选中按钮
    $scope.checkUsage = function (index) {
        $scope.data_deal_info.group_index = '';
        if (index == 1) {
            if ($scope.controls.copy_flag) {
                $scope.controls.operate_btn = index;
            }
        } else if (index == 3) {
            if ($scope.controls.soc_flag) {
                $scope.controls.operate_btn = index;
                configBatchSoc();
            }
        } else {
            $scope.controls.operate_btn = index;
        }
    };
    //全部选中
    $scope.selectAllCheck = function (group, state) {
        for (var i = 0; i < group.phase_list.length; i++) {
            if (state) {
                group.phase_list[i].select_flag = true;
                if (group.phase_list[i].phase_type == 5) {
                    group.owner_flag = true;
                }
            } else {
                group.phase_list[i].select_flag = false;
                if (group.phase_list[i].phase_type == 5) {
                    group.owner_flag = false;
                }
            }
        }
    };
    //下一步
    $scope.nextStep = function () {
        var _soc_impl = [];
        for (var i = 0; i < $scope.program_info.group_list.length; i++) {
            var _group = $scope.program_info.group_list[i];
            for (var j = 0; j < _group.phase_list.length; j++) {
                if (_group.phase_list[j].select_flag) {
                    $scope.controls.check_phase_flag = true;//存在被选中阶段标志
                    if (_group.phase_list[j].phase_type > 3) { //不能配置数据源
                        $scope.controls.soc_flag = false;
                        $scope.controls.operate_btn = 2;
                        if (_group.phase_list[j].phase_type == 5) {
                            $scope.controls.operate_btn = 2;
                            $scope.controls.copy_flag = false;
                            break;
                        }
                    } else {
                        if (_soc_impl.length == 0) {
                            _soc_impl.push(_group.phase_list[j].impl_type)
                        } else {
                            if (_soc_impl.indexOf(_group.phase_list[j].impl_type) == -1) {
                                $scope.controls.soc_flag = false;
                                $scope.controls.operate_btn = 2;
                            }
                        }
                    }
                }
            }
        }
        if (!$scope.controls.check_phase_flag) {
            Modal.alert("请选择阶段！");
            $scope.controls.deal_loading = false;
            return;
        }
        $scope.controls.step_flag = true;
        if (_soc_impl.length != 0) {
            $scope.reqData.imply_type = _soc_impl[0];
            if ($scope.controls.operate_btn == 3 && $scope.reqData.imply_type != _old_soc) {
                configBatchSoc();
            }
            if ($scope.controls.soc_flag) {
                copyPhaseSoc($scope.program_info.group_list, $scope.reqData.imply_type);
            }
        }
    };
    $scope.preStep = function () {
        _old_soc = $scope.reqData.imply_type;
        $scope.controls.step_flag = false;
        $scope.controls.copy_flag = true;
        $scope.controls.soc_flag = true;
        $scope.data_deal_info.group_index = '';
        $scope.controls.check_phase_flag = false;
    };
    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
    //确定
    $scope.saveData = function () {
        if (!CV.valiForm($scope.form.batch_from)) {
            return false;
        }
        $scope.controls.deal_loading = true;
        $timeout(function () {
            if ($scope.controls.operate_btn == 1) {
                copyBatchPhase(_group_list_global);
            } else if ($scope.controls.operate_btn == 2) {
                moveBatchPhase();
                _group_list_global = _temp_group_list;
            } else if ($scope.controls.operate_btn == 4) {
                _temp_group_list = angular.copy($scope.program_info.group_list);
                deleteBatchPhase(_temp_group_list);
                $modalInstance.close(_temp_group_list);
                return;
            } else {
                _temp_group_list = angular.copy($scope.program_info.group_list);
                saveCheckSocMSg(_temp_group_list);
                _group_list_global = _temp_group_list;
            }
            $scope.controls.deal_loading = false;
            $modalInstance.close(_group_list_global);
        }, 200);

    };
    init();
}]);

/**
 *节点配置检查项
 * */
modal_m.controller('configCheckItemCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "CmptFunc", "BusiSys", "Cmpt", "CmptType", "ProtocolType", "IML_TYPE", "CodeMirrorOption", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, CmptFunc, BusiSys, Cmpt, CmptType, ProtocolType, IML_TYPE, CodeMirrorOption, Modal, CV) {
    /*    var _soc_ip = modalParam.soc_ip;//ip*/
    var _phase = modalParam.phase;//配置项
    var _obj_exe = {};//执行对象
    var _obj_ver = {};//数据源对象
    var _save_phase = {//保存的脚本信息
        script: {},//脚本
        phase_type: 1//类型
    };
    var _temp_search = {} //临时搜索的条件
    var _tbl_params = {//高级搜索条件
        cn_name: '',//关键字
        tag_list: [],//组件标签
        data: { sort: 'crt_bk_date,crt_bk_time', order: 'desc', offset: 0, limit: 12 },//排序方式，排序类型，分页配置
        impl_types: '',//实现类型
        start_modify_date: '',//开始修改日期
        end_modify_date: '',//结束修改日期
        crt_user_id: '',//用户id
        publish_state: 1,//发布状态
        component_purpose: 1,//组件类型
    };
    //组件对象
    $scope.cmpt_info = {
        param_list: [],//参数列表
        script_list: [], //脚本列表
        exe_soc_list: [], //执行数据源列表,
        ver_soc_list: [],//版本数据源列表
        cmpt_list: [],//组件列表
    };
    //配置对象
    $scope.info = {
        high_search_obj: {//搜索对象
            search_key_word: '',//关键字
            exec_type_list: angular.copy(IML_TYPE),//执行类别
            classify_list: []//分类
        },
        user: ''
    };
    $scope.config = {
        form: {},//页面对象
        view_options: CodeMirrorOption.Sh(true),//codemirror配置
    };
    //控制对象
    $scope.control = {
        search_flag: true,   //搜索方式标识
        tags_more_flag: false, //显示‘更多’
        soc_config_flag: false,//显示数据源信息
        script_loading: false,//显示脚本
        cmpt_list_loading: false,//加载
        classify_flag: false  //控制显示分类分类标签是否显示“更多”
    };
    //页面数据
    $scope.data = modalParam.user_info;
    //搜索
    var search = function (param) {
        $scope.control.cmpt_list_loading = true;
        Cmpt.getCmptPageList(param).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.control.cmpt_list_loading = false;
                    $scope.cmpt_info.cmpt_list = data.comp_list ? data.comp_list : [];
                }
            }, 0);
        }, function (error) {
            $scope.control.cmpt_list_loading = false;
            $scope.cmpt_info.error_message = error.message;
        });
    };
    //初始化数据
    var initData = function () {
        for (var i = 0; i < arguments.length; i++) {
            for (var j = 0; j < arguments[i].length; j++) {
                arguments[i][j] = angular.extend(arguments[i][j], { flag: false })
            }
        }
    };
    var init = function () {
        $timeout(function () {
            $scope.control.script_loading = true;
        }, 200);
        if (!_phase.phase_name) {//新增
            search(_tbl_params);
        } else {//修改
            _save_phase.phase_name = _phase.phase_name;
            _save_phase.impl_type = _phase.impl_type;
            $scope.cmpt_info.impl_type = _phase.impl_type;
            $scope.cmpt_info.param_list = _phase.param_list;
            $scope.cmpt_info.exec_script = CmptFunc.cmdsToString(_phase.script.cmds);
            $scope.control.soc_config_flag = true;
            $scope.cmpt_info.cmpt_list = [{ cn_name: _phase.phase_name, is_checked: true, }];
            _obj_exe = {
                execute_ip: _phase.node_soc_list[0].execute_ip,
                execute_protocol_type: _phase.node_soc_list[0].execute_protocol_type,
                execute_soc_name: _phase.node_soc_list[0].execute_soc_name
            };
            _obj_ver = {
                support_ip: _phase.node_soc_list[0].support_ip,
                support_protocol_type: _phase.node_soc_list[0].support_protocol_type,
                support_soc_name: _phase.node_soc_list[0].support_soc_name
            };
            /* BusiSys.getSocListBySocIpAndSys(_sys,_soc_ip,$scope.cmpt_info.impl_type).then(function (data) {
                 $scope.cmpt_info.exe_soc_list = data.node.exe_soc_list ? data.node.exe_soc_list:[];
                 $scope.cmpt_info.ver_soc_list = data.node.ver_soc_list ? data.node.ver_soc_list:[];
                 for(var i=0;i<$scope.cmpt_info.exe_soc_list.length;i++){
                     var _exe_soc=$scope.cmpt_info.exe_soc_list[i];
                     if(_exe_soc.soc_name==_phase.node_soc_list[0].execute_soc_name){
                         _exe_soc.state=true;
                     }
                 }
                 for(var j=0;j<$scope.cmpt_info.ver_soc_list.length;j++){
                     var _ver_soc=$scope.cmpt_info.exe_soc_list[j];
                     if(_exe_soc.soc_name==_phase.node_soc_list[0].support_soc_name){
                         _exe_soc.state=true;
                     }
                 }
                 $scope.control.soc_config_flag =false;
             })*/
        }
        //查询所有组件标签
        Cmpt.selectAllTas().then(function (data) {
            if (data) {
                $timeout(function () {
                    var _tag_list = data.tag_list ? data.tag_list : [];
                    for (var i = 0; i < _tag_list.length; i++) {
                        $scope.info.high_search_obj.classify_list.push({
                            value: _tag_list[i],
                            flag: false
                        })
                    }
                }, 0)
            }
        }, function (error) {
            Modal.alert(error.message, 3);
        })
    };
    //公共-参数默认值输入框智能提示
    $scope.paramShellLoaded = function (_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };
    //高级搜索
    $scope.changeSearchFlag = function (e) {
        $scope.control.search_flag = false;
        e.stopPropagation();
    };
    //清空搜索框
    $scope.clear = function () {
        $scope.info.high_search_obj.search_key_word = '';
    };
    //搜索
    $scope.seniorSearch = function () {
        _temp_search.tag_list = [];
        _temp_search.impl_types = [];
        for (var i = 0; i < $scope.info.high_search_obj.exec_type_list.length; i++) {
            if ($scope.info.high_search_obj.exec_type_list[i].flag) {
                _temp_search.impl_types.push($scope.info.high_search_obj.exec_type_list[i].key);
            }
        }
        for (var i = 0; i < $scope.info.high_search_obj.classify_list.length; i++) {
            if ($scope.info.high_search_obj.classify_list[i].flag) {
                _temp_search.tag_list.push($scope.info.high_search_obj.classify_list[i].value);
            }
        }
        _tbl_params.cn_name = $scope.info.high_search_obj.key_word;
        _tbl_params.tag_list = _temp_search.tag_list;
        _tbl_params.impl_types = _temp_search.impl_types;
        search(_tbl_params);
        $scope.info.high_search_obj.search_key_word = '';
        $scope.control.search_flag = true
    };
    //搜索按钮
    $scope.searchSubgroupByKeyword = function () {
        _tbl_params.cn_name = $scope.info.high_search_obj.search_key_word;
        _tbl_params.tag_list = [];
        _tbl_params.impl_types = [];
        search(_tbl_params);
    };
    //高级搜索--删除搜索条件
    $scope.clearData = function () {
        initData($scope.info.high_search_obj.classify_list, $scope.info.high_search_obj.exec_type_list);
        $scope.info.high_search_obj.key_word = '';
    };
    //选中组件
    $scope.checkCheckCmpt = function (step) {
        if (!step.id) {
            return;
        }
        angular.forEach($scope.cmpt_info.cmpt_list, function (data) {
            data.is_checked = false;
        });
        step.is_checked = true;
        _save_phase.phase_name = step.cn_name;
        $scope.control.script_loading = false;
        Cmpt.viewModulegetModuleDetail(step.id).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.cmpt_info.param_list = data.component.param_list ? data.component.param_list : [];
                    $scope.cmpt_info.script_list = data.component.script_list ? data.component.script_list : [];
                    for (var j = 0; j < $scope.cmpt_info.script_list.length; j++) {
                        $scope.cmpt_info.script_list[j].exec_script = CmptFunc.cmdsToString($scope.cmpt_info.script_list[j].cmds);
                        $scope.cmpt_info.script_list[j].script_type_cn = $scope.cmpt_info.script_list[j].script_type == 'default' ? '缺省' : $scope.cmpt_info.script_list[j].script_type;
                    }
                    $scope.cmpt_info.script_type = data.component.script_list[0].script_type;
                    $scope.cmpt_info.exec_script = data.component.script_list[0].exec_script;
                    $scope.cmpt_info.impl_type = data.component.impl_type ? data.component.impl_type : "";
                    _save_phase.impl_type = $scope.cmpt_info.impl_type;
                    _save_phase.script.cmds = CmptFunc.stringToCmds($scope.cmpt_info.exec_script);
                    $scope.control.script_loading = true;
                    /* $scope.control.soc_config_flag =true;
                     BusiSys.getSocListBySocIpAndSys(_sys,_soc_ip,$scope.cmpt_info.impl_type).then(function (data) {
                         $scope.cmpt_info.exe_soc_list = data.node.exe_soc_list ? data.node.exe_soc_list:[];
                         $scope.cmpt_info.ver_soc_list = data.node.ver_soc_list ? data.node.ver_soc_list:[];
                         $scope.control.soc_config_flag =false;
                     })*/
                }
            }, 0)
        }, function (error) {
            $scope.control.script_loading = true;
            Modal.alert(error.message, 3);
        })
    };
    //选择数据源
    /*  $scope.checkSoc =function (step,soc_list,index) {
          angular.forEach(soc_list,function (data) {
              data.state =false;
          });
          step.state = true;
          if(index==1){
              _obj_exe={
                  execute_ip:_soc_ip,
                  execute_protocol_type:step.protocol_type,
                  execute_soc_name:step.soc_name
              }
          }else if(index==2) {
              _obj_ver={
                  support_ip:_soc_ip,
                  support_protocol_type:step.protocol_type,
                  support_soc_name:step.soc_name
              }
          }
      };*/
    //通过脚本类型找到对应脚本
    $scope.selectScriptByScriptType = function (script_type, step) {
        for (var i = 0; i < step.script_list.length; i++) {
            if (step.script_list[i].script_type == script_type) {
                step.exec_script = step.script_list[i].exec_script;
                break;
            }
        }
    };
    //通过协议得到名字
    $scope.getProtocolTypeCnName = function (protocol_type) {
        return CV.findValue(protocol_type, ProtocolType).toLowerCase()
    };
    //取消搜索
    $scope.cancelSeniorSearch = function () {
        $scope.control.search_flag = true
    };
    //动态计算高度
    $scope.countTagDivHeight = function () {
        $timeout(function () {
            var _height = $('.classify-tag-id').height();
            _height > 48 ? $scope.control.classify_flag = true : $scope.control.classify_flag = false;
        }, 500)
    };
    //表单提交
    $scope.save = function () {
        if (!_save_phase.phase_name) {
            Modal.alert("请选择组件");
            return;
        }
      /*  if (!CV.valiForm($scope.config.form.user_form)) {
            return false;
        }*/
        if ($scope.cmpt_info.param_list.length != 0 && !CV.valiForm($scope.config.form.param_form)) {
            return false;
        }
        _save_phase.script.cmds = CmptFunc.stringToCmds($scope.cmpt_info.exec_script);
        /* if(_save_phase.impl_type > 2 && _save_phase.impl_type < 6){
             var _name=CV.findValue(_save_phase.impl_type,IML_TYPE);
             if(!_obj_ver.support_soc_name){
                 Modal.alert("请配置"+_name+"数据源");
                 return;
             }
         }*/
        _save_phase.node_soc_list = [angular.extend(_obj_exe, _obj_ver)];
        _save_phase.param_list = $scope.cmpt_info.param_list;
        $modalInstance.close(_save_phase);
    };
    //取消表单
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

//服务器agent部署
modal_m.controller('ServerAgentDeployCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "ProtocolType", "Server", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, ProtocolType, Server, Modal, CV) {
    //页面表单
    $scope.form = {};
    $scope.info = {
        srv_info: {
            server_ip: modalParam.server_ip,//服务器ip
            soc_name: ''    //数据源名称
        },
        agent_status: parseInt(modalParam.agent_status),
        error_message: '',
        deploy_steps: [ //status(1 待执行；2 执行中；3 执行失败；4 执行成功)
            { status: 1, step: '步骤一', value: '校验文件传输协议' },
            { status: 1, step: '步骤二', value: '检测运行环境' },
            { status: 1, step: '步骤三', value: '安装运行环境' },
            { status: 1, step: '步骤四', value: '安装AGENT' },
            { status: 1, step: '步骤五', value: '启动AGENT' },
            { status: 1, step: '步骤六', value: '检测AGENT端口连接' },
            { status: 1, step: '步骤七', value: '安装成功' }
        ],
    };
    //页面数据
    $scope.data = modalParam.user_info;
    //页面控制
    $scope.control = {
        deploy_status: parseInt(modalParam.agent_status) === 1 ? 1 : 3 //1,未部署，2部署中，3部署成功，4，部署失败，5,取消部署中，6，取消部署成功，7取消部署失败
    };
    //初始化部署步骤状态
    var initPhaseStatus = function (status) {
        for (var i = 0; i < $scope.info.deploy_steps.length; i++) {
            var _step = $scope.info.deploy_steps[i];
            _step.status = status;
        }
    }
    var init = function () {
        if (parseInt(modalParam.agent_status) === 1) {
            initPhaseStatus(1);
        } else {
            initPhaseStatus(4);
        }
    };
    //部署agent
    $scope.deployAgent = function () {
        if (!CV.valiForm($scope.form.deploy_form) && ($scope.control.deploy_status == 6 || $scope.control.deploy_status == 1)) {
            return;
        }
        initPhaseStatus(1);
        //校验文件传输协议
        $scope.info.deploy_steps[0].status = 2;
        $scope.control.deploy_status = 2;
        Server.testFileTransform($scope.info.srv_info.server_ip, $scope.info.srv_info.user).then(function (data) {
            $scope.info.deploy_steps[0].status = (data.success ? 4 : 3);
            $scope.info.error_message = data.result || '';
            $scope.info.soc_list = data.soc_list || [];
            if (!data.success) { $scope.control.deploy_status = 4; return; }
            $timeout(function () {
                //检测运行环境
                $scope.info.deploy_steps[1].status = 2;
                Server.testRunEnv($scope.info.soc_list).then(function (data2) {
                    $scope.info.deploy_steps[1].status = (data2.success ? 4 : 3);
                    $scope.info.error_message = data2.result || '';
                    $scope.info.deploy_path = data2.deploy_path || '';
                    if (!data2.success) { $scope.control.deploy_status = 4; return; }
                    $timeout(function () {
                        //安装运行环境
                        $scope.info.deploy_steps[2].status = 2;
                        Server.deployRunEnv($scope.info.soc_list, data2.sys_type, data2.sys_bit, data2.agent_run_env_flag).then(function (data3) {
                            $timeout(function () {
                                //安装agent
                                $scope.info.deploy_steps[2].status = (data3.success ? 4 : 3);
                                $scope.info.error_message = data3.result || '';
                                if (!data3.success) { $scope.control.deploy_status = 4; return; }
                                $scope.info.deploy_steps[3].status = 2;
                                Server.deployAgent($scope.info.soc_list).then(function (data4) {
                                    $scope.info.deploy_steps[3].status = (data4.success ? 4 : 3);
                                    $scope.info.error_message = data4.result || '';
                                    if (!data4.success) { $scope.control.deploy_status = 4; return; }
                                    $timeout(function () {
                                        //启动agent
                                        $scope.info.deploy_steps[4].status = 2;
                                        Server.startAgent($scope.info.soc_list, $scope.info.deploy_path, data2.agent_run_env_flag).then(function (data5) {
                                            $scope.info.deploy_steps[4].status = (data5.success ? 4 : 3);
                                            $scope.info.error_message = data5.result || '';
                                            if (!data5.success) { $scope.control.deploy_status = 4; return; }
                                            $timeout(function () {
                                                //检测agent端口连接
                                                $scope.info.deploy_steps[5].status = 2;
                                                Server.testAgentPort($scope.info.soc_list).then(function (data6) {
                                                    $scope.info.deploy_steps[5].status = (data6.success ? 4 : 3);
                                                    $scope.info.error_message = data6.result || '';
                                                    if (!data6.success) { $scope.control.deploy_status = 4; return; }
                                                    $timeout(function () {
                                                        //安装成功
                                                        $scope.info.deploy_steps[6].status = 2;
                                                        $timeout(function () {
                                                            $scope.info.deploy_steps[6].status = 4;
                                                            $scope.control.deploy_status = 3;
                                                        }, 1500)
                                                    }, 400);
                                                }, function (error6) {
                                                    $scope.info.deploy_steps[5].status = 3;
                                                    $scope.control.deploy_status = 4;
                                                    $scope.info.error_message = error6.message;
                                                })
                                            }, 400);
                                        }, function (error5) {
                                            $scope.info.deploy_steps[4].status = 3;
                                            $scope.control.deploy_status = 4;
                                            $scope.info.error_message = error5.message;
                                        })
                                    }, 400);
                                }, function (error4) {
                                    $scope.info.deploy_steps[3].status = 3;
                                    $scope.control.deploy_status = 4;
                                    $scope.info.error_message = error4.message;
                                })
                            }, 400);
                        }, function (error3) {
                            $scope.info.deploy_steps[2].status = 3;
                            $scope.control.deploy_status = 4;
                            $scope.info.error_message = error3.message;
                        })
                    }, 800);
                }, function (error2) {
                    $scope.info.deploy_steps[1].status = 3;
                    $scope.control.deploy_status = 4;
                    $scope.info.error_message = error2.message;
                })
            }, 800);
        }, function (error) {
            $scope.info.deploy_steps[0].status = 3;
            $scope.control.deploy_status = 4;
            $scope.info.error_message = error.message;
        })
    };
    //取消部署agent
    $scope.uninstallAgent = function () {
        $scope.control.deploy_status = 5;
        Server.uninstallAgentByIp($scope.info.srv_info.server_ip).then(function (data) {
            $scope.control.deploy_status = 6;
            initPhaseStatus(1);
            $scope.info.agent_status = 1;
        }, function (error) {
            $scope.control.deploy_status = 7;
            $scope.info.error_message = error.message;
        });
    };
    //关闭
    $scope.cancel = function () {
        if ($scope.control.deploy_status == 2) {
            Modal.alert("Agent部署中，不能关闭。");
            return;
        }
        $scope.info.agent_status = ($scope.control.deploy_status == 3 ? 3 : 1);
        $modalInstance.close($scope.info.agent_status);
    };
    init();
}]);
/**
 *查看组件组测试详细信息
 * */
modal_m.controller('cmptGroupDetailModalCtrl', ["$scope", "$modalInstance", "$timeout", "$routeParams", "Cmpt", "CodeMirrorOption", "modalParam", "CmptFunc", "IML_TYPE", "Modal", "CV", function ($scope, $modalInstance, $timeout, $routeParams, Cmpt, CodeMirrorOption, modalParam, CmptFunc, IML_TYPE, Modal, CV) {
    //组件组ID
    var _comp_id = $routeParams.id;
    //页面控制对象
    $scope.cmpt_group_control = {
        nav_show_flag: 0,      //导航条显示标志
        expand_flag: false,   //模组全部展开标志
    };
    //组件初始数据
    var initCmptGroupInfo = function () {
        $scope.cmpt_group_info = {
            id: '',                      //组件组id
            cn_name: '',               //组件组中文名
            bk_desc: '',               //描述
            modules: [],            //组件,阶段列表
            params: [],                  //参数列表
            publish_state: '',           //发布状态
            file_path: '',        //导入路径
            ref_flag: ''                //引用标志
        }
    };
    var init = function () {
        initCmptGroupInfo();
        //组件组是否被引用
        Cmpt.checkCmptGroupReference(_comp_id, 2).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.cmpt_group_info.ref_flag = data.ref_flag;
                }
            }, 0)
        }, function (error) {
            Modal.alert(error.message, 3);
        });
        //查询组件组信息
        Cmpt.viewSingleCmptGroup(_comp_id).then(function (data) {
            $timeout(function () {
                if (data.module_group) {
                    $scope.cmpt_group_info.cn_name = data.module_group.cn_name;
                    $scope.cmpt_group_info.id = data.module_group.id;
                    $scope.cmpt_group_info.bk_desc = data.module_group.bk_desc;
                    $scope.cmpt_group_info.params = data.module_group.params ? data.module_group.params : [];
                    $scope.cmpt_group_info.publish_state = data.publish_state;
                    $scope.cmpt_group_info.modules = data.module_group.modules ? data.module_group.modules : [];
                    $scope.cmpt_group_info.file_path = data.file_path;
                    angular.forEach($scope.cmpt_group_info.modules, function (data, index, array) {
                        data.params = data.params ? data.params : [];
                        data.ref_params = data.ref_params ? data.ref_params : [];
                        data.alias_name = data.alias_name ? data.alias_name : data.cn_name; //别名
                        data.show_detail = false;               //控制模板展开收起
                        if (data.cmds && data.cmds.length != 0) {
                            data.exec_script = CmptFunc.cmdsToString(data.cmds);
                        }
                        if (data.impl_type) {
                            data.impl_type_formcat = CV.findValue(data.impl_type, IML_TYPE);
                        }
                    });
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
            $location.url("/cmpt/cmpts_list");
        });
    };

    //查看执行脚本
    $scope.editorOptions = CodeMirrorOption.Sh(true);
    //模组展开收起操作
    $scope.toggleModulesDetail = function (step) {
        step.show_detail = !step.show_detail;
        //判断导航条是否显示标志
        $scope.cmpt_group_control.nav_show_flag = CmptFunc.judgeShowDetail($scope.cmpt_group_info.modules);
        if ($scope.cmpt_group_control.nav_show_flag == 2) {
            $scope.cmpt_group_control.expand_flag = true;
        } else {
            $scope.cmpt_group_control.expand_flag = false;
        }
    };
    //收起所有参数和阶段
    $scope.collapseAll = function () {
        $scope.cmpt_group_control.nav_show_flag = CmptFunc.closeAllModules($scope.cmpt_group_info.modules);
    };
    //展开所有参数和阶段
    $scope.expandAll = function () {
        $scope.cmpt_group_control.nav_show_flag = CmptFunc.expandAllModules($scope.cmpt_group_info.modules);
    };
    //阻止展开收起
    $scope.stopPrevent = function (event) {
        event.stopPropagation();
    };

    //横线的样式
    $scope.horizontalLineStyle = function () {
        return {
            'width': "50px",
            'height': "1px",
            'position': "absolute",
            'background': "#CCC",
            'left': "20px",
            'top': "15px"
        };
    };
    //竖线的样式
    $scope.verticalLineStyle = function () {
        return {
            'width': "1px",
            'height': "100%",
            'position': "absolute",
            'background': "#77BBEE",
            'left': "15px",
            'top': "23px"
        };
    };

    //返回
    $scope.return = function () {
        $modalInstance.dismiss(false);
    };


    init();
}]);

/**
 *组件组测试-配置阶段数据源
 * */
modal_m.controller("cmptGroupPublishPhaseSocModalCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "Cmpt", "IML_TYPE", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Cmpt, IML_TYPE, Modal, CV) {
    $scope.stepData = {};
    $scope.stepInfo = {
        type: modalParam.step.type,
        cn_name: modalParam.step.alias_name,
        srv_soc: modalParam.step.srv_soc ? angular.copy(modalParam.step.srv_soc) : [],
        flag: modalParam.flag,
        impl_type: modalParam.step.impl_type,
        impl_type_cn: CV.findValue(modalParam.step.impl_type, IML_TYPE),
        old_srv_soc: modalParam.step.srv_soc ? angular.copy(modalParam.step.srv_soc) : [],
        copy_soc: true,
        package_list: modalParam.step.package_list,       //发布包列表
        package_names: modalParam.step.package_names,
        testPreObj: modalParam.testPreObj,
    };
    //如果配置，需要考虑离开进去的情
    if (!modalParam.flag) {
        for (var i = 0; i < $scope.stepInfo.package_list.length; i++) {
            if ($scope.stepInfo.package_list[i].flag) {
                $scope.stepInfo.package_names.push($scope.stepInfo.package_list[i].package_name);
            }
        }
    }
    $scope.preStepSoc = modalParam.preStepSoc ? modalParam.preStepSoc : [];
    $scope.form = {
        stepForm: {}
    };
    //复制前一步骤数据源
    $scope.copySoc = function () {
        $scope.stepInfo.srv_soc = angular.copy($scope.preStepSoc);
        $scope.stepInfo.copy_original_flag = true;
        $scope.stepInfo.copy_shell_flag = true;
    };
    //根据服务器获得数据源列表
    $scope.getSocByServer = function (index, impl_type) {
        if ($scope.stepInfo.copy_original_flag && $scope.stepInfo.testPreObj.soc_ip_list.length == 1) {
            $scope.stepInfo.copy_original_flag = false;
        } else {
            $timeout(function () {
                if (impl_type == 4 || impl_type == 3 || impl_type == 5) {
                    var _soc_list = $scope.stepInfo.srv_soc[index].soc_list;
                    $scope.stepInfo.srv_soc[index].soc_list = [];
                    if ($scope.stepInfo.srv_soc[index].exe_ip != '' && $scope.stepInfo.srv_soc[index].exe_ip) {
                        Cmpt.getAllSocList($scope.stepInfo.srv_soc[index].exe_ip, 2).then(function (data) {
                            if (data.soc_list.join('-') != _soc_list.join('-')) {
                                $scope.stepInfo.srv_soc[index].soc_list_loading = false;
                                $scope.stepInfo.srv_soc[index].soc_list = data.source_list ? data.source_list : [];
                                $scope.stepInfo.srv_soc[index].exe_soc_name = '';
                            } else {
                                $scope.stepInfo.srv_soc[index].soc_list = data.soc_list ? data.soc_list : [];
                            }
                        }, function (error) {
                            $scope.stepInfo.srv_soc[index].soc_list_loading = false;
                            Modal.alert(error.message, 3);
                        });
                    }
                } else {
                    var _soc_list = $scope.stepInfo.srv_soc[index].soc_list;
                    $scope.stepInfo.srv_soc[index].soc_list = [];
                    if ($scope.stepInfo.srv_soc[index].exe_ip != '' && $scope.stepInfo.srv_soc[index].exe_ip) {
                        Cmpt.getAllSocList($scope.stepInfo.srv_soc[index].exe_ip, impl_type).then(function (data) {
                            if (data.soc_list.join('-') != _soc_list.join('-')) {
                                $scope.stepInfo.srv_soc[index].soc_list_loading = false;
                                $scope.stepInfo.srv_soc[index].soc_list = data.source_list ? data.source_list : [];
                                $scope.stepInfo.srv_soc[index].exe_soc_name = '';
                            } else {
                                $scope.stepInfo.srv_soc[index].soc_list = data.soc_list ? data.soc_list : [];
                            }
                        }, function (error) {
                            $scope.stepInfo.srv_soc[index].soc_list_loading = false;
                            Modal.alert(error.message, 3);
                        });
                    }
                }
            }, 500);
        }

    };
    //根据shell服务器获得数据源列表
    $scope.getShellSocByServer = function (index, impl_type) {
        if ($scope.stepInfo.copy_shell_flag && $scope.stepInfo.testPreObj.soc_ip_list.length == 1) {
            $scope.stepInfo.copy_shell_flag = false;
        } else {
            $timeout(function () {
                var _shell_soc_list = $scope.stepInfo.srv_soc[index].shell_soc_list;
                $scope.stepInfo.srv_soc[index].shell_soc_list = [];
                if ($scope.stepInfo.srv_soc[index].ver_ip != '' && $scope.stepInfo.srv_soc[index].ver_ip) {
                    Cmpt.getAllSocList($scope.stepInfo.srv_soc[index].ver_ip, impl_type).then(function (data) {
                        if (data.soc_list.join('-') != _shell_soc_list.join('-')) {
                            $scope.stepInfo.srv_soc[index].shell_soc_list_loading = false;
                            $scope.stepInfo.srv_soc[index].shell_soc_list = data.source_list ? data.source_list : [];
                            $scope.stepInfo.srv_soc[index].ver_soc_name = '';
                        } else {
                            $scope.stepInfo.srv_soc[index].shell_soc_list = data.soc_list ? data.soc_list : [];
                        }
                    }, function (error) {
                        $scope.stepInfo.srv_soc[index].shell_soc_list_loading = false;
                        Modal.alert(error.message, 3);
                    });
                }
            }, 500);
        }

    };
    //删除一条数据源
    $scope.removeOneSoc = function (index) {
        $scope.stepInfo.srv_soc.splice(index, 1);
    };
    //新增一条数据源
    $scope.addSoc = function () {
        $scope.stepData.soc_list = [];
        var _length = $scope.stepInfo.srv_soc.length;
        if (_length == 0) {
            $scope.stepInfo.srv_soc.push({ exe_ip: "", exe_soc_name: "", ver_ip: '', ver_soc_name: '', soc_list: [], shell_soc_list: [] });
        } else if ($scope.stepInfo.srv_soc[_length - 1].server_name == '') {
            Modal.alert("请完善服务器名！");
        } else {
            $scope.stepInfo.srv_soc.push({ exe_ip: "", exe_soc_name: "", ver_ip: '', ver_soc_name: '', soc_list: [], shell_soc_list: [] });
        }
    };
    //保存按钮
    $scope.formSubmit = function () {
        if ($scope.stepInfo.flag) {
            $modalInstance.close('cancel');
        } else {
            if (!CV.valiForm($scope.form.stepForm)) {
                return false;
            }
            $modalInstance.close($scope.stepInfo);
        }
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.close('cancel');
    };
    //选中,把选中的状态设为相反(发布包参数)
    $scope.selectItem = function (one) {
        if (one.flag) {
            $scope.stepInfo.package_names.push(one.package_name);
        } else {
            $scope.stepInfo.package_names.splice($scope.stepInfo.package_names.indexOf(one.package_name), 1);
        }
    };
}]);

/**
 *插件库--新增/修改插件
 * */
modal_m.controller('addPluginCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Plugin", "Modal", "CodeMirrorOption", "CmptFunc", "pluginType", "envManage", "CV", function ($scope, $modalInstance, $timeout, modalParam, Plugin, Modal, CodeMirrorOption, CmptFunc, pluginType, envManage, CV) {
    //数据
    $scope.data = {
        plugin_type_list: pluginType//插件类型
    };
    $scope.plugin_info = {
        plugin_name: modalParam.plugin_name, //插件名称
        plugin_bk_desc: '',    // 插件描述
        plugin_type: '',       // 插件类型
        plugin_file_name: '',  //插件文件名
        install_command: '',  //安装命令
        uninstall_command: '',  //卸载命令
    };
    //页面加载控制
    $scope.control = {
        change_type: false,//改变类型
        btn_loading: false,//页面加载
        get_path_loading: true,//获取信息
        is_update: modalParam.is_update ? modalParam.is_update : false,//是否修改
        error_message: '',//错误信息
    };
    //上传配置
    $scope.config = {
        lib_fileupload: {
            suffixs: '',
            filetype: "",
            filename: "",
            uploadpath: ""
        },
        add_plugin_form: {},//表单对象
    };
    //切换codemirror配置
    var changeCodeStyle = function () {
        if ($scope.plugin_info.plugin_type == 4) {
            $scope.editOptions = CodeMirrorOption.Python();
        } else if ($scope.plugin_info.plugin_type == 6) {
            $scope.editOptions = CodeMirrorOption.Vbs();
        } else {
            $scope.editOptions = CodeMirrorOption.Sh();
        }
        $scope.control.change_type = false;
        $timeout(function () {
            $scope.control.change_type = true;
        }, 10)
    };
    var init = function () {
        //获取上传路径
        envManage.getUploadPath().then(function (data) {
            if (data) {
                $scope.control.get_path_loading = false;
                $scope.config.lib_fileupload.uploadpath = data.upload_path ? data.upload_path : '';
                changeCodeStyle();
            }
        }, function (error) {
            $scope.control.get_path_loading = false;
            $scope.control.error_message = error.message
        });
        //查询基本信息
        if (modalParam.is_update) {
            //获得插件信息
            Plugin.viewPluginInfo(modalParam.plugin_name).then(function (data) {
                $timeout(function () {
                    if (data.plugin) {
                        $scope.plugin_info.plugin_bk_desc = data.plugin.plugin_bk_desc ? data.plugin.plugin_bk_desc : '';
                        $scope.plugin_info.plugin_type = data.plugin.plugin_type ? data.plugin.plugin_type : '';
                        $scope.plugin_info.plugin_file_name = data.plugin.plugin_file_name ? data.plugin.plugin_file_name : '';
                        $scope.plugin_info.install_command = data.plugin.install_command ? data.plugin.install_command : '';
                        $scope.plugin_info.uninstall_command = data.plugin.uninstall_command ? data.plugin.uninstall_command : '';
                        $scope.config.lib_fileupload.filename = data.plugin.plugin_file_name ? data.plugin.plugin_file_name.substring(data.plugin.plugin_file_name.lastIndexOf('/') + 1) : '';
                        $scope.control.get_path_loading = false;
                        changeCodeStyle();
                    }
                }, 0)
            }, function (error) {
                $scope.control.get_path_loading = false;
                $scope.control.error_message = error.message
            })
        }
    };
    //上传成功
    $scope.fileUploadSuccessThen = function () {
        $scope.plugin_info.plugin_file_name = $scope.config.lib_fileupload.uploadpath + "/" + $scope.config.lib_fileupload.filename;
        var _type = $scope.config.lib_fileupload.filename.substring($scope.config.lib_fileupload.filename.lastIndexOf('.') + 1);
        for (var i = 0; i < $scope.data.plugin_type_list.length; i++) {
            if (_type === $scope.data.plugin_type_list[i].value) {
                $scope.plugin_info.plugin_type = $scope.data.plugin_type_list[i].key;
                changeCodeStyle();
                break;
            }
        }
    };
    //删除插件文件
    $scope.removePluginFile = function () {
        $scope.config.lib_fileupload.filename = '';
        $scope.plugin_info.plugin_file_name = '';
        $scope.plugin_info.plugin_type = '';
        changeCodeStyle();
    };
    //下载插件文件
    $scope.downloadPluginFile = function () {
        if ($scope.plugin_info.plugin_file_name) CV.downloadFile($scope.plugin_info.plugin_file_name);
    };
    //切换插件类型
    $scope.changePluginType = function () {
        changeCodeStyle();
    };
    //提交表单
    $scope.save = function () {
        //表单验证
        if (!CV.valiForm($scope.config.add_plugin_form)) {
            return false;
        }
        if (!$scope.plugin_info.plugin_file_name) {
            Modal.alert("请上传插件文件", 3);
            return false;
        }
        $scope.control.btn_loading = true;
        if ($scope.control.is_update) {
            //修改
            Plugin.updateNewPlugin($scope.plugin_info).then(function (data) {
                if (data) {
                    $scope.control.btn_loading = false;
                    $modalInstance.close();
                }
            }, function (error) {
                $scope.control.btn_loading = false;
                Modal.alert(error.message, 3);
            });
        } else {
            //保存
            Plugin.addNewPlugin($scope.plugin_info).then(function (data) {
                if (data) {
                    $scope.control.btn_loading = false;
                    $modalInstance.close();
                }
            }, function (error) {
                $scope.control.btn_loading = false;
                Modal.alert(error.message, 3);
            });
        }
    };
    //取消表单
    $scope.back = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);
/**
 *资源库--新增/修改资源
 * */
modal_m.controller('addResourceCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "CommonResources", "Modal", "pluginType", "envManage", "CV", function ($scope, $modalInstance, $timeout, modalParam, CommonResources, Modal, pluginType, envManage, CV) {
    //资源对象
    $scope.resource_info = {
        resources_name: modalParam.resources_name, //插件名称
        resources_desc: '', // 插件描述
    };
    //页面加载控制
    $scope.control = {
        btn_loading: false,//加载
        get_path_loading: true,//得到路径
        is_update: modalParam.is_update ? modalParam.is_update : false,//是否是修改
        error_message: '',//错误信息
    };
    //配置对象
    $scope.config = {
        lib_fileupload: {//上传资源配置
            suffixs: '',
            filetype: "",
            filename: "",
            uploadpath: ""
        },
        add_resource_form: {}//表单对象
    };
    var init = function () {
        //获取上传路径
        envManage.getUploadPath().then(function (data) {
            if (data) {
                $scope.control.get_path_loading = false;
                $scope.config.lib_fileupload.uploadpath = data.upload_path ? data.upload_path : '';
            }
        }, function (error) {
            // Modal.alert(error.message,3);
            $scope.control.get_path_loading = false;
            $scope.control.error_message = error.message
        });
        //查询基本信息
        if (modalParam.is_update) {
            //得到资源信息
            CommonResources.viewResources(modalParam.resources_name).then(function (data) {
                $timeout(function () {
                    if (data.resourcesInfo) {
                        $scope.resource_info.resources_desc = data.resourcesInfo.resource_desc ? data.resourcesInfo.resource_desc : '';
                        $scope.resource_info.resources_file_path = data.resourcesInfo.resource_file_path ? data.resourcesInfo.resource_file_path : '';
                        $scope.config.lib_fileupload.filename = data.resourcesInfo.resource_file_path ? data.resourcesInfo.resource_file_path.substring(data.resourcesInfo.resource_file_path.lastIndexOf('/') + 1) : '';
                        $scope.control.get_path_loading = false;
                    }
                }, 0)
            }, function (error) {
                $scope.control.get_path_loading = false;
                $scope.control.error_message = error.message
            })
        }
    };
    //上传成功
    $scope.fileUploadSuccessThen = function () {
        $scope.resource_info.resources_file_path = $scope.config.lib_fileupload.uploadpath + "/" + $scope.config.lib_fileupload.filename;
    };
    //删除文件
    $scope.removeResourcesFile = function () {
        $scope.config.lib_fileupload.filename = '';
        $scope.resource_info.resources_file_path = '';
    };
    //下载文件
    $scope.downloadResourcesFile = function () {
        if ($scope.resource_info.resources_file_path) CV.downloadFile($scope.resource_info.resources_file_path);
    };
    //提交表单
    $scope.save = function () {
        //表单验证
        if (!CV.valiForm($scope.config.add_resource_form)) {
            return false;
        }
        if (!$scope.resource_info.resources_file_path) {
            Modal.alert("请上传文件", 3);
            return false;
        }
        $scope.control.btn_loading = true;
        if ($scope.control.is_update) {
            //修改
            CommonResources.updateResources($scope.resource_info).then(function (data) {
                if (data) {
                    $scope.control.btn_loading = false;
                    $modalInstance.close();
                }
            }, function (error) {
                $scope.control.btn_loading = false;
                Modal.alert(error.message, 3);
            });
        } else {
            //保存
            CommonResources.addResources($scope.resource_info).then(function (data) {
                if (data) {
                    $scope.control.btn_loading = false;
                    $modalInstance.close();
                }
            }, function (error) {
                $scope.control.btn_loading = false;
                Modal.alert(error.message, 3);
            });
        }
    };
    //取消表单
    $scope.back = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *业务系统配置-新增节点
 * */
modal_m.controller("busiSysAddNodeModalCtrl", ["$scope", "$modalInstance", "$timeout", "NodeReform", "ProtocolType", "modalParam", "Cmpt", "IML_TYPE", "Modal", "CV", function ($scope, $modalInstance, $timeout, NodeReform, ProtocolType, modalParam, Cmpt, IML_TYPE, Modal, CV) {
    //业务系统名
    var business_sys_name = modalParam.business_sys_name;
    //节点名
    var node_name = modalParam.node_name;
    //存储成功请求后的服务器地址
    var node_soc_ip = "";
    //能够对数据源进行配置的协议列表
    var _can_be_config_protocol = ["PLT_FTP", "SFTP"];
    //能够作为校验数据源的协议列表
    var _can_be_test_protocol = ["SSH", "TELNET"];
    //点击触发配置附带数据源标志
    var _is_click = false;
    //form表单验证
    $scope.form = {};
    //提示信息
    $scope.errMessage = "";
    //判断是新增还是修改
    $scope.is_edit = modalParam.flag;
    $scope.nodeControl = {
        protocol_soc_loading: false,  //判断数据源服务是否加载中
        protocol_soc_warn: false,    //初始化时数据源样式
        config_data_source: false,   //是否显示选择一个校验数据源
        config_common_data_source: false,//是否显示选择一个普通数据源
    }
    //数据源列表
    $scope.data = {
        protocol_soc_list: [],
    }
    var initData = function () {
        $scope.node_info = {
            new_node: {                //一个节点的基本信息
                node_soc_ip: "",       //服务器地址
                ftp_config_soc: "",    //配置数据源
                shell_config_soc: "",  //附带数据源
                soc_name_list: [],     //数据源列表
                need_conect_ftp: ["---请选择---"],   //配置完ftp数据后可附带数据源
                protocol_soc_list: [],
                business_sys_name: business_sys_name,
            },
        }
    };
    //新增节点-初始化数据
    var addInit = function () {
        initData();
    };
    //修改节点-初始化数据
    var updateInit = function () {
        initData();
        //得到所有的节点信息
        NodeReform.getNodeForUpdat(node_name).then(function (info) {
            $timeout(function () {
                $scope.node_info.new_node = angular.copy(info);
                $scope.node_info.new_node.protocol_soc_list = info.protocol_soc_list ? info.protocol_soc_list : [];
                $scope.node_info.new_node.business_sys_name = business_sys_name;
                $scope.node_info.new_node.soc_ip = info.node_soc_ip;
                $scope.node_info.new_node.need_conect_ftp = ["---请选择---"];
                //通过ip获得所有的数据源
                $scope.getProtocolAndDataSocList();
                //通过返回的所有协议匹配校验数据源
                if ($scope.node_info.new_node.protocol_soc_list) {
                    for (var i = 0; i < $scope.node_info.new_node.protocol_soc_list.length; i++) {
                        var _one_soc = $scope.node_info.new_node.protocol_soc_list[i];
                        if (_one_soc.protocol_type == 5 || _one_soc.protocol_type == 10) {
                            $scope.node_info.new_node.need_conect_ftp = $scope.node_info.new_node.need_conect_ftp.concat(_one_soc.soc_name_list);
                        }
                    }

                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    }
    //通过ip得到所有的数据源
    var getAllSocByIp = function (ip) {
        //2.通过ip得到所有数据源列表
        NodeReform.queryProtocolAndSocNameByIp(ip).then(function (data) {
            $timeout(function () {
                $scope.data.protocol_soc_list = data;
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    }
    //验证数据源是否配置
    var isConfigDbSource = function () {
        if ($scope.node_info.new_node.shell_config_soc) {
            if (!$scope.node_info.new_node.ftp_config_soc) {
                $scope.nodeControl.config_data_source = true;
                return false;
            }
        }
        return true;
    };
    //防止一个值的时候自动选中
    var preventAutoChose = function () {
        for (var i = 0; i < $scope.data.protocol_soc_list.length; i++) {
            for (var j = 0; j < $scope.data.protocol_soc_list[i].soc_name_list.length; j++) {
                var _soc = $scope.data.protocol_soc_list[i].soc_name_list[j];
                if (_soc.soc_name == $scope.node_info.new_node.shell_config_soc && !_soc.has_connect_flag) {
                    $scope.node_info.new_node.shell_config_soc = "";
                    return;
                }
            }
        }
        if ($scope.node_info.new_node.shell_config_soc == "---请选择---") {
            $scope.node_info.new_node.shell_config_soc = "";
        }
    };
    //将状态转换为数据源数据
    var stateTransformData = function () {
        preventAutoChose();
        for (var i = 0; i < $scope.data.protocol_soc_list.length; i++) {
            for (var j = 0; j < $scope.data.protocol_soc_list[i].soc_name_list.length; j++) {
                var _soc_data_obj = $scope.data.protocol_soc_list[i].soc_name_list[j];
                if (_soc_data_obj.state) {
                    $scope.node_info.new_node.soc_name_list.push(_soc_data_obj.soc_name);
                }
            }
        }
    };
    //将数据转换为状态
    var dataTransformState = function () {
        for (var i = 0; i < $scope.node_info.new_node.protocol_soc_list.length; i++) {
            for (var j = 0; j < $scope.node_info.new_node.protocol_soc_list[i].soc_name_list.length; j++) {
                var _soc_name = $scope.node_info.new_node.protocol_soc_list[i].soc_name_list[j];
                for (var k = 0; k < $scope.data.protocol_soc_list.length; k++) {
                    for (var l = 0; l < $scope.data.protocol_soc_list[k].soc_name_list.length; l++) {
                        var _data_soc_obj = $scope.data.protocol_soc_list[k].soc_name_list[l];
                        if (_soc_name == _data_soc_obj.soc_name) {
                            _data_soc_obj.state = true;
                        }
                        /*      if(_data_soc_obj.soc_name == $scope.node_info.new_node.ftp_config_soc && $scope.node_info.new_node.shell_config_soc){
                         _data_soc_obj.has_connect_flag = true;
                         }*/
                        if (_data_soc_obj.soc_name == $scope.node_info.new_node.shell_config_soc && $scope.node_info.new_node.ftp_config_soc) {
                            _data_soc_obj.has_connect_flag = true;
                        }
                    }
                }
            }
        }
    };
    //初始化获取校验数据源列表
    var getTestDataList = function () {
        var _test_data_list = [];
        for (var i = 0; i < $scope.node_info.new_node.protocol_soc_list.length; i++) {
            var _soc = $scope.node_info.new_node.protocol_soc_list[i];
            if (_can_be_test_protocol.indexOf(CV.findValue(_soc.protocol_type, ProtocolType)) != -1) {
                _test_data_list = _test_data_list.concat(_soc.soc_name_list);
            }
        }
        return _test_data_list;
    };
    //节点-获取数据源列表
    $scope.getProtocolAndDataSocList = function () {
        var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
        $timeout(function () {
            if (!$scope.node_info.new_node.node_soc_ip) {
                node_soc_ip = "";
                $scope.data.protocol_soc_list = [];
                $scope.node_info.new_node.soc_list = [];
                $scope.nodeControl.protocol_soc_warn = false;
            }
            if ($scope.node_info.new_node.node_soc_ip != "" && (node_soc_ip != $scope.node_info.new_node.node_soc_ip) && (reg.test($scope.node_info.new_node.node_soc_ip))) {
                _is_click = false; //下拉框一条数据默认不执行。
                $scope.nodeControl.protocol_soc_loading = true;
                $scope.data.protocol_soc_list = [];
                if ($scope.is_edit == 1) {
                    $scope.node_info.new_node.ftp_config_soc = "";
                    $scope.node_info.new_node.shell_config_soc = "";
                    $scope.node_info.new_node.need_conect_ftp = ["---请选择---"];
                }
                $scope.node_info.new_node.soc_name_list = [];
                NodeReform.queryProtocolAndSocNameByIp($scope.node_info.new_node.node_soc_ip).then(function (data) {
                    $scope.nodeControl.config_data_source = false;
                    node_soc_ip = $scope.node_info.new_node.node_soc_ip;
                    $timeout(function () {
                        $scope.data.protocol_soc_list = data.protocol_soc_list ? data.protocol_soc_list : [];
                        //提取需要附带配置单的数据源列表
                        /*            $scope.node_info.new_node.need_conect_ftp = [];
                         for(var i=0;i<$scope.data.protocol_soc_list.length;i++) {
                         var _protocol_soc = $scope.data.protocol_soc_list[i];
                         if (_protocol_soc.protocol_type == 5 || _protocol_soc.protocol_type == 10) {
                         $scope.node_info.new_node.need_conect_ftp = $scope.node_info.new_node.need_conect_ftp.concat(_protocol_soc.soc_name_list);
                         }
                         }
                         $scope.node_info.new_node.need_conect_ftp.unshift("---请选择---");*/
                        //把数据源封装成对象
                        for (var i = 0; i < $scope.data.protocol_soc_list.length; i++) {
                            var _protocol_soc = $scope.data.protocol_soc_list[i];
                            _protocol_soc.show_flag_by_protocol_type = false; //初始化不显示 可配置数据源协议的提示
                            _protocol_soc.protocol_type = CV.findValue($scope.data.protocol_soc_list[i].protocol_type, ProtocolType);
                            if (_can_be_config_protocol.indexOf(_protocol_soc.protocol_type) != -1) {
                                _protocol_soc.show_flag_by_protocol_type = true;
                            }
                            var _str_list = []; //临时存储对象列表
                            for (var j = 0; j < $scope.data.protocol_soc_list[i].soc_name_list.length; j++) {
                                _str_list.push({ soc_name: $scope.data.protocol_soc_list[i].soc_name_list[j], state: false, show_select: false, has_connect_flag: false });
                            }
                            $scope.data.protocol_soc_list[i].soc_name_list = _str_list;
                        }
                        $scope.nodeControl.protocol_soc_loading = false;
                        if ($scope.is_edit == 2) {
                            //整理数据
                            dataTransformState();
                        }
                    }, 200);
                }, function (error) {
                    $scope.error_message = error.message;
                    node_soc_ip = $scope.node_info.new_node.node_soc_ip;
                    $scope.nodeControl.protocol_soc_loading = false;
                    $scope.nodeControl.protocol_soc_warn = true;
                })
            }
        }, 0);
    };
    //选中，radio选中触发事件
    $scope.selectRadioItem = function (number) {
        $scope.nodeControl.config_common_data_source = false;
        _is_click = true;
        //更新页面效果
        for (var i = 0; i < $scope.data.protocol_soc_list.length; i++) {
            for (var j = 0; j < $scope.data.protocol_soc_list[i].soc_name_list.length; j++) {
                var _soc = $scope.data.protocol_soc_list[i].soc_name_list[j];
                _soc.has_connect_flag = false;
                _soc.show_select = false;
            }
        }
        number.state = true;
        number.show_select = true;
    };
    //清除radio选中数据
    $scope.clearSelect = function (number) {
        $scope.node_info.new_node.ftp_config_soc = "";
        number.state = false;
        number.show_select = false;
        //更新页面效果
        for (var i = 0; i < $scope.data.protocol_soc_list.length; i++) {
            for (var j = 0; j < $scope.data.protocol_soc_list[i].soc_name_list.length; j++) {
                var _soc = $scope.data.protocol_soc_list[i].soc_name_list[j];
                if (_soc.has_connect_flag) {
                    _soc.has_connect_flag = false;
                    _soc.show_select = false;
                    $scope.node_info.new_node.shell_config_soc = "";
                }
            }
        }
        $scope.nodeControl.config_data_source = false;
    };
    //选择一般数据
    $scope.setNormalData = function (obj_soc, type) {
        $scope.nodeControl.config_common_data_source = false;
        if (obj_soc.state) {
            if (obj_soc.soc_name == $scope.node_info.new_node.ftp_config_soc) {
                _is_click = true;
                obj_soc.show_select = !obj_soc.show_select;
                return;
            } else if (obj_soc.soc_name == $scope.node_info.new_node.shell_config_soc && obj_soc.has_connect_flag) {
                return;
            } else {
                obj_soc.state = false;
                //删除掉校验数据源中被删除的
                if (_can_be_test_protocol.indexOf(type) != -1) {
                    $scope.node_info.new_node.need_conect_ftp.splice($scope.node_info.new_node.need_conect_ftp.indexOf(obj_soc.soc_name), 1);
                }
                //关闭校验数据源选择框
                for (var i = 0; i < $scope.data.protocol_soc_list.length; i++) {
                    for (var j = 0; j < $scope.data.protocol_soc_list[i].soc_name_list.length; j++) {
                        var _soc = $scope.data.protocol_soc_list[i].soc_name_list[j];
                        _soc.show_select = false;
                    }
                }
            }
        } else {
            obj_soc.state = true;
            //新增符合条件的校验数据源
            if (_can_be_test_protocol.indexOf(type) != -1) {
                $scope.node_info.new_node.need_conect_ftp.push(obj_soc.soc_name);
            }
            //关闭校验数据源选择框
            for (var i = 0; i < $scope.data.protocol_soc_list.length; i++) {
                for (var j = 0; j < $scope.data.protocol_soc_list[i].soc_name_list.length; j++) {
                    var _soc = $scope.data.protocol_soc_list[i].soc_name_list[j];
                    _soc.show_select = false;
                }
            }
        }
    };
    //选择附带数据源
    $scope.setConnectDataSource = function (val, obj) {
        if (!_is_click) {
            return;
        }
        //更新页面效果
        for (var i = 0; i < $scope.data.protocol_soc_list.length; i++) {
            for (var j = 0; j < $scope.data.protocol_soc_list[i].soc_name_list.length; j++) {
                var _soc = $scope.data.protocol_soc_list[i].soc_name_list[j];
                _soc.has_connect_flag = false;
                if (_soc.soc_name == val) {
                    _soc.state = true;
                    _soc.has_connect_flag = true;
                }
            }
        }
        //隐藏弹出框
        obj.show_select = false;
        //obj.has_connect_flag = true;
        _is_click = false;
        //附带数据源为空无关联样式
        if (val == "---请选择---") {
            obj.has_connect_flag = false;
            $scope.node_info.new_node.shell_config_soc = "";
        } else {
            //obj.has_connect_flag = true;
            $scope.node_info.new_node.shell_config_soc = val;
            $scope.nodeControl.config_data_source = false;
        }
    };
    //获取数据源title提示信息
    $scope.getTitleInfo = function (soc_obj) {
        var _str = "";
        if (soc_obj.state) {
            /*     if(soc_obj.soc_name == $scope.node_info.new_node.ftp_config_soc){
             _str = "校验数据源："+$scope.node_info.new_node.shell_config_soc;
             }
             if(soc_obj.soc_name ==$scope.node_info.new_node.shell_config_soc){
             _str = "配置数据源："+$scope.node_info.new_node.ftp_config_soc;
             }*/
            if (soc_obj.soc_name == $scope.node_info.new_node.ftp_config_soc) {
                _str = "配置数据源";
            }
            if (soc_obj.soc_name == $scope.node_info.new_node.shell_config_soc) {
                _str = "校验数据源";
            }
        }
        return _str;
    };
    //保存按钮
    $scope.formSubmit = function () {
        if (!CV.valiForm($scope.form.addModifyNodeForm)) {
            return false;
        }
        stateTransformData();
        isConfigDbSource();
        //验证，需要配置至少一个数据源
        if ($scope.node_info.new_node.soc_name_list.length == 0) {
            $scope.nodeControl.config_common_data_source = true;
            $scope.node_info.new_node.soc_name_list = [];
            return false;
        }
        //验证，如果配置了配置数据源，必须配置校验数据源
        if ($scope.node_info.new_node.ftp_config_soc) {
            if (!$scope.node_info.new_node.shell_config_soc) {
                $scope.nodeControl.config_data_source = true;
                $scope.node_info.new_node.soc_name_list = [];
                return false;
            }
        }
        if ($scope.is_edit == 1) {

            //新增
            NodeReform.addBsNode($scope.node_info.new_node).then(function (data) {
                $timeout(function () {
                    Modal.alert("新增节点成功", 2);
                    $modalInstance.close($scope.node_info.new_node.node_soc_ip);
                }, 0);
            }, function (error) {
                $scope.data.protocol_soc_list = [];
                $scope.node_info.new_node.soc_list = [];
                $scope.node_info.new_node.node_soc_ip = "";
                Modal.alert(error.message, 3);
            });
        } if ($scope.is_edit == 2) {
            //修改
            NodeReform.updateBsNode($scope.node_info.new_node).then(function (data) {
                $timeout(function () {
                    Modal.alert("修改节点成功", 2);
                    $modalInstance.close($scope.node_info.new_node.node_soc_ip);
                }, 0);
            }, function (error) {
                Modal.alert(error.message, 3);
            });
        }
        // $scope.node_info.new_node.soc_name_list = [];
        //保存节点信息
        //刷新节点列表
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.close('cancel');
    };
    $scope.myKeyup = function (e) {
        var keycode = e.keyCode;
        if (keycode == 13) {
            $scope.getProtocolAndDataSocList();
        }
    };
    $scope.changeScorll = function () {
        if ($scope.data.protocol_soc_list.length > 3) {
            return {
                "overflow": "auto",
            }
        }
    }

    if ($scope.is_edit == 2) {
        updateInit();
    } else if ($scope.is_edit == 1) {
        addInit();
    }
}]);


/**
 *业务系统配置-选择环境
 * */
modal_m.controller("envDeployCtrl", ["$scope", "$modalInstance", "$timeout", "envManage", "LanguageName", "modalParam", "pluginExeEnv", "operateSysBit", "Modal", "CV", function ($scope, $modalInstance, $timeout, envManage, LanguageName, modalParam, pluginExeEnv, operateSysBit, Modal, CV) {
    $scope.data = {};
    $scope.data.language_list = angular.copy(LanguageName);
    $scope.controls = { loading: false };
    var env_info = {};
    $scope.data.env_list = [];
    var filterEnv = function (language) {
        $scope.controls.loading = true;
        envManage.queryEnvList(language).then(function (data) {
            $scope.data.env_list = data.language_env_list ? data.language_env_list : [];
            $scope.controls.loading = false;
        }, function (error) {
            $scope.controls.loading = false;
            Modal.alert(error.message, 3);
        })
    };

    //
    $scope.getValue = function (_key, flag) {
        var _field_area = flag == 1 ? pluginExeEnv : operateSysBit;
        return CV.findValue(_key, _field_area);
    };

    $scope.chooseLanguage = function (language) {
        if (!language.choose_flag) {
            angular.forEach($scope.data.language_list, function (data) {
                language.key == data.key ? data.choose_flag = true : data.choose_flag = false;
            });
            filterEnv(language.key);
            env_info.language_name = language.key;
        }
    };
    $scope.chooseEnv = function (env, index) {
        if (!env.choose_flag) {
            angular.forEach($scope.data.env_list, function (data, _index) {
                index == _index ? data.choose_flag = true : data.choose_flag = false;
            });
            env_info = angular.extend(env_info, env);
        }
    };
    $scope.saveData = function () {
        if (!env_info.choose_flag) {
            Modal.alert("请选择环境", 3);
            return;
        }
        $modalInstance.close(env_info);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    }
}]);

/**
* 业务系统配置-部署插件(改版后)
* */
modal_m.controller("plusePluginCtrl", ["$scope", "$modalInstance", "$timeout", "Plugin", "ScrollConfig", "LanguageName", "modalParam", "pluginExeEnv", "operateSysBit", "Modal", "CV", function ($scope, $modalInstance, $timeout, Plugin, ScrollConfig, LanguageName, modalParam, pluginExeEnv, operateSysBit, Modal, CV) {
    var _deployed_plugin_list = modalParam.plugin_list ? modalParam.plugin_list : [];
    $scope.form = {};
    $scope.data = {
        plugin_list: [],
        user_info: modalParam.user_info
    };
    $scope.info = { search: '', server_user: '' };
    $scope.controls = { loading: true };
    $scope.config = {
        plugin_list_scroll: ScrollConfig,
        choosed_plugin_scroll: ScrollConfig
    };
    var init = function () {
        Plugin.getAllPluginList().then(function (data) {
            $scope.controls.loading = false;
            $scope.data.plugin_list = data.plugin_list ? data.plugin_list : [];
            if (_deployed_plugin_list.length) {
                for (var i = 0; i < $scope.data.plugin_list.length; i++) {
                    var _plugin_list = $scope.data.plugin_list[i];
                    for (var j = 0; j < _deployed_plugin_list.length; j++) {
                        var _deployed_plugin = _deployed_plugin_list[j];
                        if (_plugin_list.plugin_name === _deployed_plugin.plugin_name) {
                            //deploy_status 0未部署 1 部署中 2成功 3失败 4 删除中
                            _plugin_list.deploy_status = _deployed_plugin.deploy_status ? _deployed_plugin.deploy_status : 0;
                            if (_plugin_list.deploy_status !== 3) {
                                _plugin_list.is_deploy = true;
                            } else {
                                _plugin_list.deploy_status = 0;
                            }
                        }
                    }
                }
            }

        }, function (error) {
            $scope.controls.loading = false;
        })
    };

    //搜索插件
    $scope.filterPluginNmae = function (item) {
        if (!$scope.info.search) {
            return true;
        } else {
            return item.plugin_name.indexOf($scope.info.search) > -1;
        }
    };
    //删除已选插件
    $scope.deleteChoosedPlugin = function (plugin) {
        plugin.is_deploy = false;
    };
    //部署
    $scope.deploy = function () {
        if (!CV.valiForm($scope.form.deployForm)) {
            return false;
        }
        var _selected_plugin = [];
        for (var i = 0; i < $scope.data.plugin_list.length; i++) {
            var _plugin = $scope.data.plugin_list[i];
            if (_plugin.is_deploy) {
                _selected_plugin.push({
                    deploy_status: _plugin.deploy_status,
                    plugin_name: _plugin.plugin_name,
                    error_message: '',
                });
            }
        }
        $modalInstance.close({ selected_plugin: _selected_plugin, server_user: $scope.info.server_user });
    };
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };

    init();
}]);
/**
 * 业务系统配置-添加部署组件
 * */
modal_m.controller("addCollectCmptCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", function ($scope, $modalInstance, $timeout, modalParam) {
    var _cj_cmpt_list = modalParam.cj_cmpt_list ? modalParam.cj_cmpt_list : [];

    $scope.cj_cmpt = {
        all_cj_cmpt_list: _cj_cmpt_list,      // 所有部署采集组件
    };
    //获取选中的部署组件
    var getCheckedCmpt = function (list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].is_checked) {
                list[i].status = 1;
                list[i].is_show = true;
                $scope.cj_cmpt.checked_cj_cmpt_list.push(list[i]);
            }
        }
        return $scope.cj_cmpt.checked_cj_cmpt_list;
    };

    //选中部署组件
    $scope.checkCmpt = function (index) {
        $scope.cj_cmpt.all_cj_cmpt_list[index].is_checked = !$scope.cj_cmpt.all_cj_cmpt_list[index].is_checked;
        $scope.cj_cmpt.all_cj_cmpt_list[index].is_show = false;
        if (!$scope.cj_cmpt.all_cj_cmpt_list[index].is_checked) {
            $scope.cj_cmpt.all_cj_cmpt_list[index].status = 0;
        }
    };
    //保存按钮
    $scope.saveCollectCmpt = function () {
        $scope.cj_cmpt.checked_cj_cmpt_list = [];
        $modalInstance.close(getCheckedCmpt($scope.cj_cmpt.all_cj_cmpt_list));
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    // init();
}]);

/**
 *业务系统配置-查看系统插件和协议
 * */
modal_m.controller('viewPluginProtocolCtrl', ["$scope", "$modalInstance", "modalParam", function ($scope, $modalInstance, modalParam) {
    $scope.lists = modalParam.list;
    $scope.flag = modalParam.flag;  //flag:1,插件  2.协议
    $scope.ip = modalParam.ip;
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 *业务系统配置-查看方案信息
 * */
modal_m.controller('schemeDetailCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "BusiSys", "CodeMirrorOption", "CmptFunc", "IML_TYPE", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, BusiSys, CodeMirrorOption, CmptFunc, IML_TYPE, Modal, CV) {
    var _prog_id = modalParam.prog_id;
    //查看发布方案详细信息
    $scope.viewOptions = CodeMirrorOption.Sh(true);
    //方案信息对象
    $scope.progData = {
        prog_source: 1,
        prog_cn_name: "",
        prog_bk_desc: "",
        package_types: [],//发布包类型
        ref_package_list: [],//应用包类型
        pub_info: {
            phase_list: [],
            param_list: [],
        },
        rol_info: {
            phase_list: [],
            param_list: [],
        },
    };
    //页面控制对象--发布
    $scope.pubControls = {
        nav_show_flag: false,   //导航条显示标志
        modules_loading: false,   //模组信息加载标志
        submit_loading: false,   //页面提交标志
        expand_flag: false,    //模组全部展开标志
        import_loading: false,    //模组导入loading
        data_source: 1,
        upload_show: true,
    };
    //页面控制对象--回退
    $scope.rolControls = {
        nav_show_flag: false,   //导航条显示标志
        modules_loading: false,   //模组信息加载标志
        expand_flag: false,    //模组全部展开标志
        import_loading: false,    //模组导入loading
        data_source: 1,
    };
    //获取方案详细信息
    var init = function () {
        BusiSys.viewPubProgramInfo(_prog_id).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.progData.prog_cn_name = data.prog_cn_name;
                    $scope.progData.prog_bk_desc = data.prog_bk_desc;
                    $scope.progData.package_types = data.package_types ? data.package_types : [];
                    $scope.progData.pub_info = data.pub_info ? data.pub_info : { phase_list: [], param_list: [] };
                    $scope.progData.rol_info = data.rol_info ? data.rol_info : { phase_list: [], param_list: [] };
                    $scope.progData.pub_info.phase_list = $scope.progData.pub_info.phase_list ? $scope.progData.pub_info.phase_list : [];
                    $scope.progData.pub_info.param_list = $scope.progData.pub_info.param_list ? $scope.progData.pub_info.param_list : [];
                    console.log($scope.progData.pub_info.param_list);
                    $scope.progData.rol_info.phase_list = $scope.progData.rol_info.phase_list ? $scope.progData.rol_info.phase_list : [];
                    $scope.progData.rol_info.param_list = $scope.progData.rol_info.param_list ? $scope.progData.rol_info.param_list : [];
                    for (var j = 0; j < $scope.progData.pub_info.phase_list.length; j++) {
                        if ($scope.progData.pub_info.phase_list[j].type == 1 || $scope.progData.pub_info.phase_list[j].type == 4) {
                            if (!$scope.progData.pub_info.phase_list[j].alias_name) {
                                $scope.progData.pub_info.phase_list[j].alias_name = $scope.progData.pub_info.phase_list[j].cn_name;
                            }
                            $scope.progData.pub_info.phase_list[j].show_detail = false;
                            $scope.progData.pub_info.phase_list[j].type_cn = CV.findValue($scope.progData.pub_info.phase_list[j].impl_type, IML_TYPE);
                            $scope.progData.pub_info.phase_list[j].exec_script = CmptFunc.cmdsToString($scope.progData.pub_info.phase_list[j].cmds);
                            $scope.progData.pub_info.phase_list[j].ref_params = $scope.progData.pub_info.phase_list[j].ref_params ? $scope.progData.pub_info.phase_list[j].ref_params : [];
                            if ($scope.progData.pub_info.phase_list[j].ref_params.length != 0) {
                                $scope.progData.pub_info.phase_list[j].show_ref_param = true;
                            }
                        }
                        if ($scope.progData.pub_info.phase_list[j].type == 2) {
                            var _modules = $scope.progData.pub_info.phase_list[j];
                            if (!_modules.alias_name) {
                                _modules.alias_name = _modules.cn_name;
                            }
                            _modules.show_detail = false;
                            for (var l = 0; l < _modules.modules.length; l++) {
                                if (!_modules.modules[l].alias_name) {
                                    _modules.modules[l].alias_name = _modules.modules[l].cn_name;
                                }
                                _modules.modules[l].exec_script = CmptFunc.cmdsToString(_modules.modules[l].cmds);
                                _modules.modules[l].type_cn = CV.findValue(_modules.modules[l].impl_type, IML_TYPE);
                                _modules.modules[l].ref_params = _modules.modules[l].ref_params ? _modules.modules[l].ref_params : [];
                                if (_modules.modules[l].ref_params.length != 0) {
                                    for (var m = 0; m < _modules.modules[l].ref_params.length; m++) {
                                    };
                                    _modules.modules[l].show_ref_param = true;
                                }
                            }
                        };
                    };
                    for (var j = 0; j < $scope.progData.rol_info.phase_list.length; j++) {
                        if ($scope.progData.rol_info.phase_list[j].type == 1 || $scope.progData.rol_info.phase_list[j].type == 4) {
                            if (!$scope.progData.rol_info.phase_list[j].alias_name) {
                                $scope.progData.rol_info.phase_list[j].alias_name = $scope.progData.rol_info.phase_list[j].cn_name;
                            }
                            $scope.progData.rol_info.phase_list[j].show_detail = false;
                            $scope.progData.rol_info.phase_list[j].type_cn = CV.findValue($scope.progData.rol_info.phase_list[j].impl_type, IML_TYPE);
                            $scope.progData.rol_info.phase_list[j].exec_script = CmptFunc.cmdsToString($scope.progData.rol_info.phase_list[j].cmds);
                            $scope.progData.rol_info.phase_list[j].ref_params = $scope.progData.rol_info.phase_list[j].ref_params ? $scope.progData.rol_info.phase_list[j].ref_params : [];
                            if ($scope.progData.rol_info.phase_list[j].ref_params.length != 0) {
                                for (var m = 0; m < $scope.progData.rol_info.phase_list[j].ref_params.length; m++) {
                                    $scope.progData.rol_info.phase_list[j].ref_params[m].ref_param_flag = judgeRefParam($scope.progData.rol_info.phase_list[j].ref_params[m].ref, $scope.rolData.handle_param_list);
                                };
                                $scope.progData.rol_info.phase_list[j].show_ref_param = true;
                            }
                        }
                        if ($scope.progData.rol_info.phase_list[j].type == 2) {
                            var _modules = $scope.progData.rol_info.phase_list[j];
                            if (!_modules.alias_name) {
                                _modules.alias_name = _modules.cn_name;
                            }
                            _modules.show_detail = false;
                            for (var l = 0; l < _modules.modules.length; l++) {
                                if (!_modules.modules[l].alias_name) {
                                    _modules.modules[l].alias_name = _modules.modules[l].cn_name;
                                }
                                _modules.modules[l].exec_script = CmptFunc.cmdsToString(_modules.modules[l].cmds);
                                _modules.modules[l].type_cn = CV.findValue(_modules.modules[l].impl_type, IML_TYPE);
                                _modules.modules[l].ref_params = _modules.modules[l].ref_params ? _modules.modules[l].ref_params : [];
                                if (_modules.modules[l].ref_params.length != 0) {
                                    for (var m = 0; m < _modules.modules[l].ref_params.length; m++) {
                                        _modules.modules[l].ref_params[m].ref_param_flag = judgeRefParam(_modules.modules[l].ref_params[m].ref, $scope.rolData.handle_param_list);
                                    };
                                    _modules.modules[l].show_ref_param = true;
                                }
                            }
                        };
                    };
                }
            }, 0)
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    };
    $scope.changTab = function (flag) {
        if (flag == 2) {
            $timeout(function () {
                $scope.flagTab = true;
            }, 0);
        } else {
            $timeout(function () {
                $scope.flagTab = false;
            }, 0);
        };
    };
    //模组展开收起操作
    $scope.toggleModulesDetail = function (step, type_flag) {
        step.show_detail = !step.show_detail;
        //判断导航条是否显示标志
        if (type_flag == 1) {
            $scope.pubControls.nav_show_flag = CmptFunc.judgeShowDetail($scope.progData.pub_info.phase_list);
            if ($scope.pubControls.nav_show_flag == 2) {
                $scope.pubControls.expand_flag = true;
            } else {
                $scope.pubControls.expand_flag = false;
            }
        } else {
            $scope.rolControls.nav_show_flag = CmptFunc.judgeShowDetail($scope.progData.rol_info.phase_list);
            if ($scope.rolControls.nav_show_flag == 2) {
                $scope.rolControls.expand_flag = true;
            } else {
                $scope.rolControls.expand_flag = false;
            }
        }

    };
    //模组全部展开
    $scope.expandCollapseAll = function (type_flag) {
        if (type_flag == 1) {
            $scope.pubControls.nav_show_flag = CmptFunc.expandAllModules($scope.progData.pub_info.phase_list);
        } else {
            $scope.rolControls.nav_show_flag = CmptFunc.expandAllModules($scope.progData.rol_info.phase_list);
        }
    };
    //模组全部收起
    $scope.colseCollapseAll = function (type_flag) {
        if (type_flag == 1) {
            $scope.pubControls.nav_show_flag = CmptFunc.closeAllModules($scope.progData.pub_info.phase_list);
        } else {
            $scope.rolControls.nav_show_flag = CmptFunc.closeAllModules($scope.progData.rol_info.phase_list);
        }
    };
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *业务系统配置-上传文件基本信息
 * */
modal_m.controller('uploadLogFileCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "BusiSys", "CodeMirrorOption", "CmptFunc", "IML_TYPE", "Modal", "NodeReform", "Col_Fmt", "CV", function ($scope, $modalInstance, $timeout, modalParam, BusiSys, CodeMirrorOption, CmptFunc, IML_TYPE, Modal, NodeReform, Col_Fmt, CV) {
    $scope.form = {};
    $scope.maxDate = new Date();
    $scope.log_fileupload = {
        suffixs: '',
        filetype: "",
        filename: "",
        uploadpath: ""
    };
    //日期指令参数
    $scope.datepicker = {};
    //上传基本信息对象
    $scope.upload_file_info = {
        sys_name: modalParam.sys_name,
        log_name: modalParam.log_name,
        log_id: modalParam.log_id,
        node_name: '',
        file_date: CV.dtFormat(new Date()),
        file_name: '',
        ip: '',
        temp_date: '',
        node_ip: '',
    };
    $scope.data = {
        node_ip_list: [],
        logSyncInfoList: [],//文件基本信息列表
    };
    $scope.control = {
        show_upload: false,
    };
    var init = function () {
        NodeReform.getNodeByBusi(modalParam.sys_name).then(function (data) {
            $timeout(function () {
                $scope.data.node_ip_list = data.node_msg_list ? data.node_msg_list : [];
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    };
    $scope.getipAndPath = function (node_ip) {
        if (!$scope.upload_file_info.file_date) {
            Modal.alert("请先选择日期");
            return false;
        }
        var _node_name = "";
        for (var i = 0; i < $scope.data.node_ip_list.length; i++) {
            var _tem = $scope.data.node_ip_list[i];
            if (_tem.soc_ip == node_ip) {
                _node_name = _tem.node_name;
                break;
            }
        }
        var _file_date = CV.dtFormat($scope.upload_file_info.file_date);
        //获取上传路径
        BusiSys.getLogUploadPath(_node_name, modalParam.sys_name, _file_date, $scope.upload_file_info.log_id).then(function (data) {
            $timeout(function () {
                $scope.log_fileupload.uploadpath = data.path ? data.path : '';
                $scope.control.show_upload = true;
                $scope.data.file_list = data.file_list ? data.file_list : [];
                if ($scope.data.file_list.length > 0) {
                    for (var i = 0; i < $scope.data.file_list.length; i++) {
                        var _one_file = $scope.data.file_list[i];
                        _one_file.real_length = Col_Fmt.formByteToM(_one_file.file_length);
                    }
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    }
    //上传成功
    $scope.fileUploadSuccessThen = function () {
        $scope.upload_file_info.file_name = $scope.log_fileupload.filename;
    };
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.datepicker.opened = true;
    };
    $scope.formSubmit = function () {
        if (!CV.valiForm($scope.form.uploadFile)) {
            return false;
        }
        if (!$scope.upload_file_info.file_name) {
            Modal.alert("请上传文件");
            return false;
        }
        for (var i = 0; i < $scope.data.node_ip_list.length; i++) {
            var _one = $scope.data.node_ip_list[i];
            if (_one.soc_ip == $scope.upload_file_info.node_ip) {
                $scope.upload_file_info.node_name = _one.node_name;
                break;
            }
        }
        $scope.upload_file_info.file_date = CV.dtFormat($scope.upload_file_info.file_date);
        //提交内容
        BusiSys.saveLogUploadBase($scope.upload_file_info).then(function (data) {
            $timeout(function () {
                Modal.alert('提交成功');
                $modalInstance.close(false);
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
            $modalInstance.close(false);
        });
    }
    init();
}]);

/**
 * 业务系统配置-agent部署
 * */
modal_m.controller("deployAgentCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "NodeReform", "Modal", function ($scope, $modalInstance, $timeout, modalParam, NodeReform, Modal) {
    var _protocol_soc_list = modalParam.protocol_soc_list ? modalParam.protocol_soc_list : [];
    var _node_name = modalParam.node_name;
    //data对象
    $scope.data = {
        protocol_soc_list: [] // 数据源列表
    };
    //页面控制对象
    $scope.control = {
        deploy_loading: false, //开始部署loading
        deploy_success: false, //部署成功标志
        deploy_fail: false, //部署失败标志
    };
    //将未选中的数据源check标志初始化
    var initCheckState = function (list) {
        for (var i = 0; i < list.length; i++) {
            list[i].is_check = false;
        }
    };
    //获取选中的数据源名
    var getCheckedSocName = function (list) {
        var _soc_name = '';
        for (var i = 0; i < list.length; i++) {
            if (list[i].is_check) {
                _soc_name = list[i].soc_name;
            }
        }
        return _soc_name;
    }

    var init = function () {
        $scope.data.protocol_soc_list = _protocol_soc_list;
        initCheckState($scope.data.protocol_soc_list);
    };
    //选中要执行的数据源
    $scope.chooseExecSoc = function (index) {
        initCheckState($scope.data.protocol_soc_list);
        $scope.data.protocol_soc_list[index].is_check = true;
    };
    //开始部署
    $scope.startDeploy = function () {
        var _soc_name = getCheckedSocName($scope.data.protocol_soc_list);
        if (!_soc_name) {
            Modal.alert("请选择要执行的数据源！");
            return false;
        }
        $scope.control.deploy_loading = true;
        //部署agent
        NodeReform.deployAgent(_soc_name, _node_name).then(function (data) {
            if (data) {
                $scope.control.deploy_loading = false;
                if (data.success) {
                    $scope.control.deploy_success = true;
                } else {
                    $scope.deploy_error_message = data.result;
                    $scope.control.deploy_fail = true;
                }

            }
        }, function (error) {
            $scope.control.deploy_loading = false;
            Modal.alert(error.message, 3);
        });
    };
    //确认按钮
    $scope.finishDeploy = function () {
        $modalInstance.close(true);
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    init();
}]);
/*业务系统修改，新增-版本机路径配置12*/
modal_m.controller("configDirCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "Collection", "BusiSys", "Modal", function ($scope, $modalInstance, $timeout, modalParam, Collection, BusiSys, Modal) {
    //flag:1 生产包  2.清单
    var _version_config_flag = modalParam._flag ? modalParam._flag : 1;
    //数据源
    var _soc_version = modalParam.soc_version ? modalParam.soc_version : "";
    $scope.info = {
        version_info: {
            soc_name: _soc_version,//数据源
            root_bk_dir: "",//根路径
            init_path: "",//初始化路径
            loading: false,//加载
            full_path: ""//全路径
        }
    };
    //控制
    $scope.control = {
        version_config_flag: _version_config_flag,//版本配置类型
        show_real: false//展示内容
    };
    //配置节点路径相关信息
    var getAllNodePath = function () {
        $scope.info.version_info.checked_files = [];//选中文件列表
        $scope.info.version_info.paths = [];//路径列表
        $scope.info.version_info.active = false;//是否选中
        $scope.info.version_info.loading = false;//是否加载
    };
    var init = function () {
        //得到数据源下所有信息
        Collection.getFileListBySoc(_soc_version, $scope.info.version_info.init_path).then(function (data) {
            getAllNodePath();
            $scope.info.version_info.path_files = data.file_bean_list ? data.file_bean_list : [];
            $scope.info.version_info.init_path = data.root_bk_dir ? data.root_bk_dir : "";
            $scope.info.version_info.full_path = data.root_bk_dir ? data.root_bk_dir : "";
            $scope.control.show_real = true;
        }, function (error) {
            Modal.alert(error.message, 3);
            $modalInstance.dismiss();
        });
    };
    //展示目录文件列表
    $scope.changePath = function (node) {
        node.loading = true;
        Collection.getFileListBySoc(_soc_version, node.full_path).then(function (data) {
            node.loading = false;
            node.path_files = data.file_bean_list ? data.file_bean_list : [];
        }, function (error) {
            node.loading = false;
            node.err_msg = error.message;
        });
    };
    //确认按钮
    $scope.save = function () {
        if ($scope.info.version_info.paths.length == 0) {
            Modal.alert("请选择目录");
            return false;
        }
        $modalInstance.close($scope.info.version_info.full_path);
    };
    //取消按钮
    $scope.back = function () {
        $modalInstance.dismiss();
    };
    init();
}]);
//-------------------巡检模块-------------------

/**
 *数据采集-自动采集-浏览文件目录
 * */
modal_m.controller('ViewFileDirListCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Collection", "Modal", function ($scope, $modalInstance, $timeout, modalParam, Collection, Modal) {
    var _checked_file_list = [];
    $scope.file_list = [];
    $scope.content = modalParam.content;
    $scope.changePath = function () {
        if ($scope.node.is_dir) {
            $scope.node.loading = true;
            $timeout(function () {
                Collection.getFileList($scope.content.node_name, $scope.node.full_path).then(function (data) {
                    $scope.node.path_files = data.file_bean_list;
                    $scope.node.loading = false;
                }, function (error) {
                    Modal.alert(error.message, 3);
                });
            });
        } else {
        }
    }
    var init = function () {
        $scope.node = {
            node_name: '',  //节点名
            init_path: modalParam.init_path ? modalParam.init_path : "",  //初始化路径
            path_files: [], //当前路径文件列表（生成）
            loading: false,   //文件列表加载中（生成）
            full_path: '',  //完整路径（生成）
            is_dir: true,    //当前是目录还是文件(自动维护)
            checked_files: [],      //选中的文件列表（自动维护）
            deleted_files: [],      //删除的文件列表（自动维护）
            modified_files: [],
            spical_files: []
        };
        /* Collection.getFileList($scope.content.node_name,$scope.node.init_path).then(function(data){
         $scope.node.path_files=data.file_bean_list;
         $scope.node.init_path=data.root_bk_dir;
         },function(error){
         Modal.alert(error.message,3);
         });*/
    }
    //确定
    $scope.formSubmit = function () {
        var _checked_flag = false;
        angular.forEach($scope.node.path_files, function (data) {
            if (data.checked) {
                _checked_flag = true;
                data.file = $scope.node.full_path + "/" + data.file;
                console.log(data.file);
                _checked_file_list.push(data);
            }
        });
        if (!_checked_flag) {
            Modal.alert("请至少选择一个目录或文件");
        } else {
            $modalInstance.close(_checked_file_list);
        }
    }
    //取消表单
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *采集方案--新增采集项
 * */
modal_m.controller("newCjProgramItemsModalCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "IML_TYPE", "CmptFunc", "Collection", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, IML_TYPE, CmptFunc, Collection, Modal, CV) {
    var _business_sys_name = modalParam.business_sys_name;
    var _hour_count = 0, _minutes = 0;//小时/分钟修改次数
    //form表单验证
    $scope.form = {};
    //判断是新增还是修改
    $scope.is_edit = modalParam.is_update;
    //采集项信息
    $scope.collect_item_info = {
        collect_item_name: "",    //采集项中文名
        is_parallel: true,   //是否并行(默认并行)
        coProgramModuleBeans: [],      //采集组件列表
        run_yn_flag: true,   //是否立即执行
        start_bk_time: "",    //计划开始时间
        max_run_time: "",    //最大运行时间(单位秒)
        immediate_exec: 0,
    };
    //计划时间对象
    $scope.start_time = {
        plan_hour: "",
        plan_minute: ""
    };
    //运行时长对象
    $scope.run_time = { flag: 1, time: "" };
    //页面控制标志
    $scope.control = {
        show_cmpts: false,  //显示可选采集组件
        get_cmpts_loading: false,  //获取组件loading
        get_cmpts_error: false,  //获取组件服务异常
        time_format: true
    };
    //data对象
    $scope.data = {
        cj_cmpt_list: [],
        times: [{ key: 1, value: "分钟" }, { key: 2, value: "小时" }],
    };
    var judgeCheckedCmpt = function (cmpt_list, list) {
        if (list.length != 0) {
            for (var i = 0; i < cmpt_list.length; i++) {
                for (var j = 0; j < list.length; j++) {
                    if (cmpt_list[i].module_id == list[j].module_id) {
                        cmpt_list[i].is_check = true;
                    }
                }
            }
        };
        return cmpt_list;
    };

    var init = function () {
        if ($scope.is_edit) {
            $scope.collect_item_info = angular.copy(modalParam.item);
            if ($scope.collect_item_info.coProgramModuleBeans) {
                for (var i = 0; i < $scope.collect_item_info.coProgramModuleBeans.length; i++) {
                    var _module = $scope.collect_item_info.coProgramModuleBeans[i];
                    _module.script_content = CmptFunc.cmdsToString(_module.script);
                }
            }
            if ($scope.collect_item_info.run_yn_flag) {
                $scope.collect_item_info.immediate_exec = 0;
            } else {
                $scope.collect_item_info.immediate_exec = 1;
                $scope.start_time = {
                    plan_hour: $scope.collect_item_info.start_bk_time.substring(0, 2),
                    plan_minute: $scope.collect_item_info.start_bk_time.substring(3, $scope.collect_item_info.start_bk_time.length)
                };
            };
            if ($scope.collect_item_info.translate_run_time_m > 0) {
                $scope.run_time.flag = 1;
                $scope.run_time.time = $scope.collect_item_info.max_run_time / 60;
            } else {
                $scope.run_time.flag = 2;
                $scope.run_time.time = $scope.collect_item_info.max_run_time / 60 / 60;
            }
        };
    };

    //显示采集组件框
    $scope.showCollectCmpt = function () {
        $scope.control.show_cmpts = true;
        $scope.control.get_cmpts_error = false;
        $scope.control.get_cmpts_none = false;
        //获取采集组件loading
        $scope.control.get_cmpts_loading = true;
        //获取采集组件
        Collection.getCollectItemList(_business_sys_name).then(function (data) {
            $timeout(function () {
                if (data.module_list) {
                    $scope.data.cj_cmpt_list = data.module_list ? data.module_list : [];
                    for (var i = 0; i < $scope.data.cj_cmpt_list.length; i++) {
                        $scope.data.cj_cmpt_list[i].impl_type_cn = CV.findValue($scope.data.cj_cmpt_list[i].impl_type, IML_TYPE);
                        $scope.data.cj_cmpt_list[i].script_content = CmptFunc.cmdsToString($scope.data.cj_cmpt_list[i].script);
                        $scope.data.cj_cmpt_list[i].show_script = false;
                        $scope.data.cj_cmpt_list[i].is_check = false;
                    };
                    judgeCheckedCmpt($scope.data.cj_cmpt_list, $scope.collect_item_info.coProgramModuleBeans);
                    $scope.control.get_cmpts_loading = false;
                } else {
                    $scope.control.get_cmpts_loading = false;
                    $scope.control.get_cmpts_none = true;
                }
            }, 0);
        }, function (error) {
            $scope.control.get_cmpts_loading = false;
            $scope.control.get_cmpts_error = true;
            $scope.error_message = error.message;
        });

    };
    //添加采集组件
    $scope.addCollectCmpt = function (index) {
        var _cmpt = $scope.data.cj_cmpt_list[index];
        _cmpt.is_check = !_cmpt.is_check;
        if (_cmpt.is_check) {
            $scope.collect_item_info.coProgramModuleBeans.push(_cmpt);
        } else {
            angular.forEach($scope.collect_item_info.coProgramModuleBeans, function (data, index) {
                if (data.module_id == _cmpt.module_id) {
                    $scope.collect_item_info.coProgramModuleBeans.splice(index, 1);
                }
            });
        }

    };
    //删除单个组件
    $scope.deleteSingCmpt = function (index) {
        $scope.collect_item_info.coProgramModuleBeans.splice(index, 1);
        if ($scope.collect_item_info.coProgramModuleBeans.length == 0) {
            $scope.collect_item_info.immediate_exec = 0;
            $scope.collect_item_info.max_run_time = "";
            $scope.collect_item_info.run_yn_flag = true;
            $scope.start_time = {
                plan_hour: "",
                plan_minute: ""
            };
            $scope.run_time = { flag: 1, time: "" };
            $scope.control.time_format = true;
        }
    };
    //上移单个组件
    $scope.upSingCmpt = function (index) {
        var _cmpt = $scope.collect_item_info.coProgramModuleBeans;
        var _temp = _cmpt[index];
        _cmpt[index] = _cmpt[index - 1];
        _cmpt[index - 1] = _temp;
        $scope.collect_item_info.coProgramModuleBeans = _cmpt;
    };
    //下移单个组件
    $scope.downSingCmpt = function (index) {
        var _cmpt = $scope.collect_item_info.coProgramModuleBeans;
        var _temp = _cmpt[index];
        _cmpt[index] = _cmpt[index + 1];
        _cmpt[index + 1] = _temp;
        $scope.collect_item_info.coProgramModuleBeans = _cmpt;
    };
    //关闭组件框
    $scope.close = function () {
        $scope.control.show_cmpts = false;
    };
    //验证时间格式是否正确
    $scope.testTimeFormat = function (hour, minutes, flag) {
        var reg = /^[0-9]{1,2}$/;
        if ($scope.collect_item_info.immediate_exec == 0 && !hour && !minutes) {
            return false;
        }
        if (flag == 1) {
            _hour_count++;
        } else {
            _minutes++;
        }
        if (reg.test(hour) && (hour >= 0 && hour < 24)) {
            $scope.control.time_format = true;
            if ((reg.test(minutes) && (minutes >= 0 && minutes < 60))) {
                $scope.control.time_format = true;
            } else if (_minutes > 0) {
                $scope.control.time_format = false;
            }
        } else if (_hour_count > 0) {
            $scope.control.time_format = false;
        }
    };

    //改变开始时间方式
    $scope.changeStartTime = function (flag) {
        if (flag == 0) {
            $scope.collect_item_info.run_yn_flag = true;
            $scope.collect_item_info.immediate_exec = flag;
            $scope.start_time = {
                plan_hour: "",
                plan_minute: ""
            };
            $scope.control.time_format = true;
        } else {
            $scope.collect_item_info.run_yn_flag = false;
            $scope.collect_item_info.immediate_exec = flag;
        }

    };
    //提交表单
    $scope.saveCollectItem = function () {
        if (!$scope.collect_item_info.run_yn_flag) {
            if ($scope.start_time.plan_hour.length == 1) {
                $scope.start_time.plan_hour = "0" + $scope.start_time.plan_hour;
            }
            if ($scope.start_time.plan_minute.length == 1) {
                $scope.start_time.plan_minute = "0" + $scope.start_time.plan_minute;
            }
            $scope.collect_item_info.start_bk_time = $scope.start_time.plan_hour + ":" + $scope.start_time.plan_minute;
        } else {
            $scope.collect_item_info.start_bk_time = "";
        };
        if ($scope.run_time.flag == 1) {
            $scope.collect_item_info.max_run_time = parseFloat($scope.run_time.time) * 60;
        } else {
            $scope.collect_item_info.max_run_time = parseFloat($scope.run_time.time) * 60 * 60;
        };
        if ($scope.collect_item_info.coProgramModuleBeans.length == 0) {
            Modal.alert("请至少添加一个采集组件");
            return false;
        }
        if (!CV.valiForm($scope.form.collect_item_form)) {
            return false;
        }
        if (($scope.collect_item_info.immediate_exec == 1) && (!$scope.start_time.plan_hour || !$scope.start_time.plan_minute)) {
            $scope.control.time_format = false;
            return false;
        }
        $modalInstance.close($scope.collect_item_info);
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    init();
}]);

/**
 * 任务采集-修改方案流程
 * */
modal_m.controller("cjTaskCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "Collection", function ($scope, $modalInstance, $timeout, modalParam, Collection) {
    $scope.modal_info = modalParam.modal_info;
    $scope.all_node_list = modalParam.node_list;
    $scope.checkedCount = 0;
    var _business_sys_name = modalParam.business_sys_name;
    var _module_index = modalParam.module_index;
    //得到可以部署的节点列表
    var getDisposeNodeList = function () {
        //初始化页面node
        for (var i = 0; i < $scope.all_node_list.length; i++) {
            $scope.all_node_list[i].state = 0;
            $scope.all_node_list[i].checked = false;
            $scope.all_node_list[i].loading = true;
        }
        angular.forEach($scope.modal_info.coTaskModuleBeans, function (cmpt) {
            cmpt.cmpt_nodes = [];
            cmpt.checkedCount = 0;
            cmpt.all_node_list = angular.copy(modalParam.node_list);
            //是否全选
            cmpt.check_all = false;
            $timeout(function () {
                //获取组件下可编辑的节点
                Collection.getNodesByCmptId(_business_sys_name, cmpt.module_id).then(function (data) {
                    if (data.node_list) {
                        for (var i = 0; i < data.node_list.length; i++) {
                            cmpt.cmpt_nodes.push({ node_name: data.node_list[i].node_name, node_ip: data.node_list[i].soc_ip, state: 0, checked: false });
                        }
                    }
                    for (var i = 0; i < cmpt.cmpt_nodes.length; i++) {
                        var _can_config_node = cmpt.cmpt_nodes[i];
                        for (var j = 0; j < cmpt.all_node_list.length; j++) {
                            var _page_node = cmpt.all_node_list[j];
                            if (_can_config_node.node_ip == _page_node.node_ip) {
                                _page_node.state = 1;
                            }
                            _page_node.loading = false;
                        }

                    }
                    //刷出页面已经配置过的节点
                    if (cmpt.coNodeBeans) {
                        $scope.checkedCount = 0;
                        for (var i = 0; i < cmpt.coNodeBeans.length; i++) {
                            var _has_config_node = cmpt.coNodeBeans[i];
                            for (var j = 0; j < cmpt.all_node_list.length; j++) {
                                var _page_node = cmpt.all_node_list[j];
                                if (_has_config_node.node_ip == _page_node.node_ip) {
                                    _page_node.checked = true;
                                    cmpt.checkedCount++;
                                }
                            }
                        }
                        if (cmpt.all_node_list.length == cmpt.checkedCount) {
                            cmpt.check_all = true;
                        }
                    }
                }, function (error) {

                });
            }, 1000);
        })
    };
    //判断是否是全部选中
    var judgeIsChooseAll = function (list, attr) {
        var _flag = true;
        angular.forEach(list, function (data) {
            if (!data[attr]) {
                _flag = false;
            }
        });
        return _flag;
    }
    var init = function () {
        $scope.modal_info.coTaskModuleBeans[_module_index].show_detail = false;
        $scope.toggleModulesDetail($scope.modal_info.coTaskModuleBeans[_module_index], _module_index);
        getDisposeNodeList();
    }

    //手风琴
    $scope.toggleModulesDetail = function (cmpt, index) {
        //手风琴效果
        cmpt.show_detail = !cmpt.show_detail;
        for (var i = 0; i < $scope.modal_info.coTaskModuleBeans.length; i++) {
            if (i != index) {
                $scope.modal_info.coTaskModuleBeans[i].show_detail = false;
            }
        }
        cmpt.checkedCount = 0;
        //刷出页面已经配置过的节点
        if (cmpt.coNodeBeans) {
            for (var i = 0; i < cmpt.coNodeBeans.length; i++) {
                var _has_config_node = cmpt.coNodeBeans[i];
                for (var j = 0; j < cmpt.all_node_list.length; j++) {
                    var _page_node = cmpt.all_node_list[j];
                    if (_has_config_node.node_ip == _page_node.node_ip) {
                        _page_node.checked = true;
                        cmpt.checkedCount++;
                    }
                }
            }
        }
    };
    //勾选节点后将状态转为数据
    $scope.stateChangeData = function (cmpt, node) {
        if (node.state == 0) {
            return false;
        } else {
            node.checked = !node.checked;
        }
        cmpt.coNodeBeans = [];
        for (var i = 0; i < cmpt.all_node_list.length; i++) {
            var _page_node = cmpt.all_node_list[i];
            if (_page_node.state == 1 && _page_node.checked) {
                cmpt.coNodeBeans.push({ node_name: _page_node.node_name, node_ip: _page_node.node_ip });
            }
        }
        // $scope.checkedCount= cmpt.coNodeBeans.length ? cmpt.coNodeBeans.length : 0;
        cmpt.checkedCount = cmpt.coNodeBeans.length ? cmpt.coNodeBeans.length : 0;
        cmpt.check_all = judgeIsChooseAll(cmpt.all_node_list, "checked");
    };
    //全选
    $scope.checkAll = function (cmpt) {
        cmpt.coNodeBeans = [];
        console.log(cmpt.check_all);
        if (cmpt.check_all) {
            for (var i = 0; i < cmpt.all_node_list.length; i++) {
                var _page_node = cmpt.all_node_list[i];
                _page_node.checked = true;
                if (_page_node.state == 1 && _page_node.checked) {
                    cmpt.coNodeBeans.push({ node_name: _page_node.node_name, node_ip: _page_node.node_ip });
                }
            }
            cmpt.checkedCount = cmpt.coNodeBeans.length ? cmpt.coNodeBeans.length : 0;
        } else {
            console.log(0)
            angular.forEach(cmpt.all_node_list, function (data) {
                data.checked = false;
            });
            cmpt.coNodeBeans = [];
            cmpt.checkedCount = 0;
        }
    }
    //保存按钮
    $scope.formSubmit = function () {

        $modalInstance.close($scope.modal_info);
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.close();
    };

    init();
}]);

/**
 *报告模板-添加指标模型
 * */
modal_m.controller("addTargetModelCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "Collection", "Inspection", function ($scope, $modalInstance, $timeout, modalParam, Collection, Inspection) {
    $scope.data = {
        model_all_list: [],
        model_checked_list: [],
    }
    var _tem_model_list = modalParam.model_list ? modalParam.model_list : [];
    $scope.data.model_checked_list = angular.copy(_tem_model_list);
    var init = function () {
        //得到所有的指标模型
        Inspection.getAllIndexModel().then(function (data) {
            $scope.data.model_all_list = data.indi_model_list ? data.indi_model_list : [];
            for (var i = 0; i < $scope.data.model_all_list.length; i++) {
                angular.forEach($scope.data.model_checked_list, function (model) {
                    if (model.indi_model_name == $scope.data.model_all_list[i].indi_model_name) {
                        $scope.data.model_all_list[i].checked = true;
                    }
                })
            }
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    }
    //添加单个指标模型
    $scope.addSingleModel = function (step) {
        step.checked = !step.checked;
        var _step_info = { show_detail: false, indi_model_name: step.indi_model_name, indi_model_cn_name: step.indi_model_cn_name };
        if (step.checked) {
            $scope.data.model_checked_list.push(_step_info);
        } else {
            angular.forEach($scope.data.model_checked_list, function (data, index) {
                if (data.indi_model_name == step.indi_model_name) {
                    $scope.data.model_checked_list.splice(index, 1);
                }
            });
        }
    };
    //保存按钮
    $scope.formSubmit = function () {
        $modalInstance.close($scope.data.model_checked_list);
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.close();
    };
    init();
}]);

/**
 * 报告模板配置图表
 * */
modal_m.controller('xjtaskConfigModalCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Inspection", function ($scope, $modalInstance, $timeout, modalParam, Inspection) {
    $scope.form_control = {
        data_loading: false,
        error_message: ''
    };
    //配置表单
    $scope.config_info = {
        modify_chart_list: modalParam.model_info.chart_list ? modalParam.model_info.chart_list : [],
        config_list: [],
        checkd_list: []
    };

    var init = function () {
        $scope.form_control.data_loading = true;
        //获取图表列表
        Inspection.getChartListByModelList(modalParam.model_list).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.form_control.data_loading = false;
                    $scope.config_info.config_list = data.model_node_list ? data.model_node_list : [];
                    angular.forEach($scope.config_info.config_list, function (data) {
                        data.node_list = data.node_list ? data.node_list : [];
                    });
                    //已选的图表
                    angular.forEach($scope.config_info.modify_chart_list, function (data) {
                        var _modify_list = data;
                        angular.forEach($scope.config_info.config_list, function (data) {
                            var _chart_list = data;
                            angular.forEach(_chart_list.node_list, function (data) {
                                if ((_modify_list.indi_node_name == data.indi_node_name) && (_modify_list.indi_model_name == data.indi_model_name)) {
                                    data.checked = true;
                                }
                            });
                        })
                    });
                }
            }, 0)
        }, function (error) {
            $scope.form_control.data_loading = false;
            $scope.form_control.error_message = error.message;
        });
    };
    //保存
    $scope.formSubmit = function () {
        angular.forEach($scope.config_info.config_list, function (one_config) {
            angular.forEach(one_config.node_list, function (data) {
                if (data.checked) {
                    data.indi_model_name = one_config.indi_model_name;
                    $scope.config_info.checkd_list.push(data);
                }
            });
        });
        $modalInstance.close($scope.config_info.checkd_list);
    };
    //取消
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *巡检任务第一步--配置数据集弹窗
 * */
modal_m.controller('configDataCollectionCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Inspection", "Cmpt", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Inspection, Cmpt, Modal, CV) {
    var config_item = modalParam.data;
    //任务ID
    var _task_id = modalParam.task_id;
    var _indi_model_name = modalParam.indi_model_name; //指标模型名
    $scope.form = {};
    $scope.data = {
        filter_info: '',
        finished_task_list: [],
        file_type_list: [
            { key: 1, value: 'csv' },
            { key: 2, value: 'json' },
            { key: 3, value: 'other' }
        ],
        files_list: []
    };
    //控制对象
    $scope.data_config_controls = {
        flag: false,      //改变文件格式标志(解决当前控制器文件格式改变，指令中的文件格式不改变问题)
        curr_config_type: 1, //tab切换时，当前的配置方式，1，数据采集，2.手工上传
    };
    //上传脚本文件参数
    $scope.cmpt_script_fileupload = {
        suffixs: 'sh',
        filetype: "SHELL",
        filename: "",
        uploadpath: ""
    };
    $scope.tabs = [true, false];
    $scope.data_config_info = {
        file_type: ''
    };
    var init = function () {
        initData();
        //查询任务列表
        Inspection.getCotTaskList().then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.data.finished_task_list = data.task_list ? data.task_list : [];
                }
            }, 0)
        })
        if (config_item.taskImportBean) {
            if (config_item.taskImportBean.curr_config_type == 1) {
                $scope.data_config_controls.curr_config_type = 1;
                $timeout(function () {
                    $scope.config_info_collection = config_item.taskImportBean;
                    $scope.data.files_list = config_item.taskImportBean.all_files ? config_item.taskImportBean.all_files : [];
                }, 0);
            } else {
                $scope.data_config_controls.curr_config_type = 2;
                $scope.tabs = [false, true];
                $scope.data_config_controls.flag = true;
                $timeout(function () {
                    $scope.config_info_hand = angular.copy(config_item.taskImportBean);
                    $scope.data_config_info.file_type = config_item.taskImportBean.import_file_type;
                    $scope.changeFileType($scope.data_config_info.file_type);
                }, 0);
            }
        }
    };
    //文件-获取导入组件文件上传路径
    var getFilePath = function () {
        Inspection.getUploadFilePath().then(function (data) {
            if (data) {
                $scope.data_fileupload.uploadpath = data.file_path ? data.file_path : '';
            }
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    };
    //初始化数据
    var initData = function () {
        $scope.data_config_controls.flag = false;
        $scope.data.files_list = [];
        $scope.data.filter_info = "";
        $scope.data_config_info.file_type = "";
        //配置信息（采集）
        $scope.config_info_collection = {       //配置数据集信息（采集）
            indi_task_id: _task_id,
            table_name: config_item.table_name,
            indi_model_name: _indi_model_name,
            indi_node_name: config_item.indi_node_name,
            co_task_name: '',                 //已经完成的任务
            import_type: 0,                      //数据采集
            import_file_type: '',            //文件格式
            files: [],                        //采集文件列表
            is_need_clean: 1                       //清除原有数据
        };
        //配置信息（手工添加）
        $scope.config_info_hand = {       //配置数据集信息(手工添加)
            indi_task_id: _task_id,
            table_name: config_item.table_name,
            indi_model_name: _indi_model_name,
            indi_node_name: config_item.indi_node_name,
            import_type: 1,                  //手工上传
            uploadFiles: [],             //文件列表
            parse_cmd: '',            //解析命令
            is_need_clean: 1           //清除原有数据
        };
        //导入文件参数
        $scope.data_fileupload = {
            suffixs: '',
            filename: "",
            filetype: '',
            uploadpath: ""
        };
    };
    //根据文件类型查询文件列表
    $scope.getFileList = function (type, task_name) {
        if (!type || !task_name) {
            return;
        }
        var _task_no;
        for (var i = 0; i < $scope.data.finished_task_list.length; i++) {
            var _finished_task_list = $scope.data.finished_task_list[i];
            if (_finished_task_list.task_name == task_name) {
                _task_no = _finished_task_list.task_no;
                break;
            }
        }
        $scope.config_info_collection.files = [];
        Inspection.getFileListByFileType(CV.findValue(type, $scope.data.file_type_list), _task_no).then(function (data) {
            $timeout(function () {
                if (data) {
                    var _file_list = data.file_list ? data.file_list : [];
                    $scope.data.files_list = [];
                    angular.forEach(_file_list, function (val, index, arr) {
                        $scope.data.files_list.push({
                            state: false,
                            file_bk_path: val,
                            file_name: val.slice(val.lastIndexOf('/') + 1),
                        });
                    });
                }
            }, 0)
        }, function (error) {
            $scope.data.files_list = [];
            Modal.alert(error.message, 3);
        })
    };
    //文件-导入文件成功后
    $scope.ImportSuccessThen = function () {
        var _files = { file_name: $scope.data_fileupload.filename };
        $scope.data_fileupload.filename = '';
        $scope.config_info_hand.uploadFiles.push(_files.file_name);
        //文件路径
        var _file_path = $scope.data_fileupload.uploadpath + $scope.data_fileupload.filename;
    };
    //选择不同的文件类型，改变上传文件参数
    $scope.changeFileType = function (key) {
        $scope.data_config_controls.flag = false;
        //$scope.config_info_hand.uploadFiles = [];
        $scope.config_info_collection.files = [];
        $timeout(function () {
            $scope.data_config_controls.flag = true;
        }, 0);
        if (key && key != 3) {
            var _file_type = CV.findValue(key, $scope.data.file_type_list);
            $scope.data_fileupload.suffixs = _file_type;
            $scope.data_fileupload.file_type = _file_type;
        } else {
            $scope.data_fileupload.suffixs = '';
            $scope.data_fileupload.file_type = '';
        }
        $scope.data_config_info.file_type = key;
    };
    //数据采集-选择导入文件
    $scope.selectItem = function (item) {
        $scope.config_info_collection.files = [];
        for (var i = 0; i < $scope.data.files_list.length; i++) {
            var _files = $scope.data.files_list[i];
            if (_files.state) {
                $scope.config_info_collection.files.push(_files.file_bk_path);
            }
        }
    };
    $scope.close = function () {
        $modalInstance.dismiss(false);
    };
    //导入数据
    $scope.saveOrInportData = function () {
        var import_obj = {};//提交的数据
        if ($scope.data_config_controls.curr_config_type == 1) {
            if (!CV.valiForm($scope.form.collect_data_form)) {
                return false;
            }
            //$scope.config_info_collection.all_files = [];
            import_obj = $scope.config_info_collection;
        } else {
            if (!CV.valiForm($scope.form.collect_hand_form)) {
                return false;
            }
            if ($scope.config_info_hand.uploadFiles.length == 0) {
                Modal.alert("请至少上传一个文件");
                return false;
            }
            import_obj = $scope.config_info_hand;
        }
        import_obj.flag = true;
        import_obj.is_need_clean = import_obj.is_need_clean == 1 ? true : false;
        Inspection.importXJConfigInfo(_task_id, import_obj).then(function (data) {
            $timeout(function () {
                if (data) {
                    config_item.import_state = 2;
                    config_item.monitor.import_seq = data.import_seq;
                    $modalInstance.close(import_obj);
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    };
    //保存数据
    $scope.saveConfigInfo = function () {
        var import_obj = {};//提交的数据
        if ($scope.data_config_controls.curr_config_type == 1) {
            if (!CV.valiForm($scope.form.collect_data_form)) {
                return false;
            }
            $scope.config_info_collection.all_files = $scope.data.files_list;
            $scope.config_info_collection.curr_config_type = 1;
            import_obj = $scope.config_info_collection;
        } else {
            if (!CV.valiForm($scope.form.collect_hand_form)) {
                return false;
            }
            if ($scope.config_info_hand.uploadFiles.length == 0) {
                Modal.alert("请至少上传一个文件");
                return false;
            }
            $scope.config_info_hand.curr_config_type = 2;
            import_obj = $scope.config_info_hand;
        }
        config_item.import_state = 1;
        import_obj.flag = false;
        $modalInstance.close(import_obj);
    }
    //切换‘数据采集’与‘手工上传’两种方式
    $scope.changeConfigMethod = function (state) {
        $scope.data_config_controls.curr_config_type = state;
        initData();
        getFilePath();
    };
    //删除指定的上传文件
    $scope.deleteFile = function (index, list) {
        list.splice(index, 1);
    }
    init();
}]);

/**
 * 巡检任务第一步--据集导入明细
 * */
modal_m.controller('dataGatherDetailCtrl', ["$scope", "$modalInstance", "$timeout", "$rootScope", "$interval", "Inspection", "modalParam", function ($scope, $modalInstance, $timeout, $rootScope, $interval, Inspection, modalParam) {
    var task_id = modalParam.task_id;
    var cofirm = modalParam.data;
    //导入明细信息
    $scope.export_detail = {
        source_data_name: cofirm.table_cn_name,//名称
        data_count: cofirm.total_file_num, //所有记录条数
        time: "",
        his_detail_list: []
    };
    //导入中显示监控信息
    $scope.show_flag = $rootScope.listen_info.import_state == 3 ? true : false;
    $scope.control = {
        info_loading: true
    }
    var init = function () {
        getCurrentImportInfo();
        Inspection.viewXJImportHis(task_id, cofirm.indi_model_name, cofirm.indi_node_name).then(function (data) {
            var _history_list = data.import_bean_list ? data.import_bean_list : [];
            $scope.control.info_loading = false;
            for (var i = 0; i < _history_list.length; i++) {
                _history_list[i].day = _history_list[i].import_bk_time.split(" ")[0];
                _history_list[i].time = _history_list[i].import_bk_time.split(" ")[1];
            }
            $scope.export_detail.his_detail_list = _history_list;
        }, function (error) {
            $scope.control.info_loading = false;
            Modal.alert(error.message, 3);
        });
    };
    //获取当前导入信息
    var getCurrentImportInfo = function () {
        if ($rootScope.listen_info.exec_detail) {
            var _time = $rootScope.listen_info.exec_detail.import_bk_time.split(" ")[1];
            $scope.export_detail.time = _time.substring(0, _time.lastIndexOf('.'));
        }
    };
    //关闭模态框
    $scope.close = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *巡检任务第一步--信息提示
 * */
modal_m.controller('xjMessageTipsCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", function ($scope, $modalInstance, $timeout, modalParam) {
    $scope.remind_info = modalParam.data;
    $scope.close = function () {
        $modalInstance.close(true);
    };
}]);

//日志巡检-日志选择
modal_m.controller('configLogCtrl', ["$scope", "$modalInstance", "$timeout", "BusiSys", "NodeReform", "Exec", "Modal", "EncodingType", "Collection", "LogXJ", "logTimeStampType", "newLogTimeStampType", "ScrollBarConfig", "modalParam", function ($scope, $modalInstance, $timeout, BusiSys, NodeReform, Exec, Modal, EncodingType, Collection, LogXJ, logTimeStampType, newLogTimeStampType, ScrollBarConfig, modalParam) {
    var _modify_flag = false;
    var _height_index = 0;//用来计算选择框高度
    //日志基本信息
    var _tem_ip_list = [];//临时存储节点信息
    $scope.log_info = {
        sys_name: '',
        choose_ip_list: [],//选中的节点数组
    };
    //所有的系统列表
    $scope.data = {
        busys_list: [],
        node_ip_list: [],
        encode_type_list: EncodingType,//编码列表
        date_format_list: newLogTimeStampType
    };
    //所有的控制
    $scope.control = {
        next_step: false,//下一步
        loading_busys: false,//加载业务系统
        loading_node_ip: false,//加载节点数据
    };
    //配置
    $scope.config = {
        scroll_config: ScrollBarConfig.Y(), //滚动条配置
    };
    $scope.log_info.sys_name = modalParam.sys_name ? modalParam.sys_name : '';
    $scope.log_info.choose_ip_list = modalParam.choose_ip_list ? angular.copy(modalParam.choose_ip_list) : [];
    _tem_ip_list = modalParam.choose_ip_list ? angular.copy(modalParam.choose_ip_list) : [];
    console.log(_tem_ip_list)
    if ($scope.log_info.choose_ip_list.length > 0) {
        _modify_flag = true;
    }
    var showAndHideByClass = function (class_name, class_tar, e) {
        //flag==1显示，flag==2隐藏
        var _class = "." + class_name;
        var _class_tar = "." + class_tar;
        var _first = $(_class);
        if (_first.is(e.target) || _first.has(e.target).length != 0) { // Mark 1
            $(_class_tar).removeClass('display-none').addClass('display-block');
            return false;
        }
        var _con = $(_class_tar);   // 设置目标区域
        if (!_con.is(e.target) && _con.has(e.target).length === 0) { // Mark 1
            $(_class_tar).removeClass('display-block').addClass('display-none')
        }
    };
    //循环列表，如果某个属性为空，跳出
    var judgeIsEmpty = function (list, attr) {
        var _flag = true;
        for (var i = 0; i < list.length; i++) {
            var _one = list[i];
            if (!_one[attr]) {
                _flag = false;
                break;
            }
        }
        return _flag;
    }
    //得到所有节点下的日志目录
    var getAllNodePath = function () {
        for (var i = 0; i < $scope.log_info.choose_ip_list.length; i++) {
            var _node = $scope.log_info.choose_ip_list[i];
            _node.init_path = _node.web_root_path ? _node.web_root_path : "";
            _node.checked_files = [];
            _node.paths = [];
            _node.active = false;
        }
    };
    //得到系统下所有的节点
    var getAllNodeListBySys = function (sys_name) {
        $scope.control.loading_node_ip = true;
        LogXJ.getAllNodeListBySys(sys_name).then(function (data) {
            $timeout(function () {
                $scope.data.node_ip_list = data.prepare_node_list ? data.prepare_node_list : [];
                angular.forEach($scope.data.node_ip_list, function (one_node) {
                    one_node.checked = false;
                })
                $scope.control.loading_node_ip = false;
            }, 0);
        }, function (error) {
            $scope.control.loading_node_ip = false;
            Modal.alert(error.message, 3);
        });
    }
    //判断两个数组是否相等
    var judgeArrEqual = function (array1, array2) {
        var _flag = true;
        if (array1.length == array2.length) {
            for (var i = 0; i < array1.length; i++) {
                if (array1[i].node_name != array2[i].node_name) {
                    _flag = false;
                }
            }
        } else {
            _flag = false;
        }
        return _flag
    }
    var init = function () {
        $scope.control.loading_busys = true;
        BusiSys.getAllBusinessSys().then(function (data) {
            $timeout(function () {
                $scope.data.busys_list = data.list_bs ? data.list_bs : [];
                if (data.list_bs) {
                    angular.forEach($scope.data.busys_list, function (data) {
                        if (_modify_flag && data.business_sys_name == $scope.log_info.sys_name) {
                            data.checked = true;
                        } else {
                            data.checked = false;
                        }
                    })
                }
                $scope.control.loading_busys = false;
            }, 0);
        }, function (error) {
            $scope.control.loading_busys = false;
            Modal.alert(error.message, 3);
        });
        if (_modify_flag) {
            $scope.control.loading_node_ip = true;
            LogXJ.getAllNodeListBySys($scope.log_info.sys_name).then(function (data) {
                $timeout(function () {
                    $scope.data.node_ip_list = data.prepare_node_list ? data.prepare_node_list : [];
                    angular.forEach($scope.data.node_ip_list, function (one_node) {
                        one_node.checked = false;
                    })
                    for (var i = 0; i < $scope.data.node_ip_list.length; i++) {
                        var _one_node_all = $scope.data.node_ip_list[i];
                        for (var j = 0; j < $scope.log_info.choose_ip_list.length; j++) {
                            var _one_node_cur = $scope.log_info.choose_ip_list[j];
                            if (_one_node_all.soc_ip == _one_node_cur.soc_ip) {
                                _one_node_all.checked = true;
                            }
                        }
                    }
                    $scope.control.loading_node_ip = false;
                }, 0);
            }, function (error) {
                $scope.control.loading_node_ip = false;
                Modal.alert(error.message, 3);
            });
        }
    }
    //选中当前业务系统
    $scope.checkBysys = function (curr, index) {
        var _flag = true;
        for (var i = 0; i < $scope.data.busys_list.length; i++) {
            var _one_cur = $scope.data.busys_list[i];
            _one_cur.checked = false;
        }
        $scope.data.node_ip_list = [];
        curr.checked = true;
        $scope.log_info.sys_name = curr.business_sys_name;
        //根据系统得到所有的ip;
        getAllNodeListBySys(curr.business_sys_name);
    };
    //选中当前
    $scope.chooseCurIp = function (curr) {
        curr.checked = !curr.checked;
    };
    //下一步骤
    $scope.nextStep = function () {
        if (!$scope.log_info.sys_name) {
            Modal.alert("请选择系统");
            return false;
        }
        var _choose_list = [];
        angular.forEach($scope.data.node_ip_list, function (one_node) {
            if (one_node.checked) {
                _choose_list.push(one_node);
            }
        });
        if (_choose_list.length == 0) {
            Modal.alert("请至少选择一个节点");
            return false;
        }
        //修改，而且节点没有变，将上次选中信息赋值
        var _flag = judgeArrEqual($scope.log_info.choose_ip_list, _choose_list);
        if (_modify_flag && judgeArrEqual($scope.log_info.choose_ip_list, _choose_list)) {
            $scope.log_info.choose_ip_list = _tem_ip_list;
        } else {
            $scope.log_info.choose_ip_list = _choose_list;
            getAllNodePath();
        }
        $scope.control.next_step = true;
    };
    $scope.lastStep = function () {
        $scope.control.next_step = false;
    }
    $scope.selectTab = function (node) {
        /*   $timeout(function() {
               node.loading = true;
               Collection.getFileList(node.node_name,node.full_path).then(function(data) {
                node.loading = false;
                node.path_files = data.file_bean_list ? data.file_bean_list : [];
                   angular.forEach(node.path_files,function(one_file){
                       if(!one_file.dir){
                           var _tem_log=one_file.file.substring(one_file.file.lastIndexOf("."));
                           if(_tem_log=='.log'){
                               one_file.log_flag=true;
                           }else{
                               one_file.log_flag=false;
                           }
                       }
                   })
                }, function(error) {
                node.loading = false;
                node.err_msg = error.message;
                });
           },300);*/
    }
    $scope.selectFile = function (selectKey) {
        console.log(selectKey)
    }
    //展示目录文件列表
    $scope.changePath = function (node) {
        node.loading = true;
        Collection.getFileList(node.node_name, node.full_path).then(function (data) {
            node.loading = false;
            node.path_files = data.file_bean_list ? data.file_bean_list : [];
            angular.forEach(node.path_files, function (one_file) {
                if (!one_file.dir) {
                    var _tem_log = one_file.file.substring(one_file.file.lastIndexOf("."));
                    if (_tem_log == '.log') {
                        one_file.log_flag = true;
                    } else {
                        one_file.log_flag = false;
                    }
                }
            })
        }, function (error) {
            node.loading = false;
            node.err_msg = error.message;
        });
    };
    //点击当前
    $scope.chooseCurDateFormat = function (file_list, one) {
        file_list[_height_index].date_format = one.key;
        file_list[_height_index].date_format_show = one.value;
        //截取提示
        var _start = one.value.indexOf("(");
        var _end = one.value.indexOf(")");
        file_list[_height_index].date_format_show = one.value.substring(0, _start);
        file_list[_height_index].timestamp_show_title = one.value.substring(_start + 1, _end);
        $(".target_log_choose").removeClass('display-block').addClass('display-none');
    }
    //显示日期选择
    $scope.showChooseTime = function (index) {
        _height_index = index;
    }
    //更改高度
    $scope.changeHeight = function () {
        var _height = 69 + (54) * _height_index;
        return {
            'top': _height
        }
    }
    //保存所有的信息
    $scope.saveLogList = function () {
        var _flag_encoding = true;
        var _flag_timestamp = true;
        for (var i = 0; i < $scope.log_info.choose_ip_list.length; i++) {
            var _one_node = $scope.log_info.choose_ip_list[i];
            _flag_encoding = judgeIsEmpty(_one_node.checked_files, 'word_coding');
            _flag_timestamp = judgeIsEmpty(_one_node.checked_files, 'date_format_show');
            if (!_flag_encoding || !_flag_timestamp) {
                break;
            }
        }
        if (!_flag_encoding || !_flag_timestamp) {
            Modal.alert("请完善日志文件编码或时间格式信息");
            return false;
        }
        $scope.log_info.node_ip_list = $scope.data.node_ip_list;
        console.log($scope.log_info)
        $modalInstance.close($scope.log_info); //添加成功
    };
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    //用来显示隐藏不同的内容
    $(document).mouseup(function (e) {
        showAndHideByClass('first_span_choose', 'target_log_choose', e);
    });
    init();
}]);
//日志巡检-日志筛选
modal_m.controller('configLogScreenCtrl', ["$scope", "$modalInstance", "$timeout", "BusiSys", "NodeReform", "Exec", "Modal", "EncodingType", "modalParam", "CV", function ($scope, $modalInstance, $timeout, BusiSys, NodeReform, Exec, Modal, EncodingType, modalParam, CV) {
    $scope.form = {};
    $scope.log_screen = {
        start_hour: '00',
        start_minutes: '00',
        end_hour: '23',
        end_minutes: '59',
        keywords: '',
        key_line: "",
    }
    $scope.control = {
        time_input_err_msg: '',
    }
    if (modalParam.log_screen) {
        // console.log(122212);
        console.log(modalParam.log_screen)
        var _tem_screen = angular.copy(modalParam.log_screen);
        $scope.log_screen = _tem_screen ? _tem_screen : "";
    }
    $scope.timeInputBlur = function (time_str, time_flag) {
        var _time_cn_name = time_flag == 1 ? '开始时间小时' : time_flag == 2 ? '开始时间分钟' : time_flag == 3 ? '结束时间小时' : time_flag == 4 ? '结束时间分钟' : '';
        if (!time_str) {
            $scope.control.time_input_err_msg = _time_cn_name + '不能为空';
            return false;
        }
        if (($scope.log_screen.start_hour && $scope.log_screen.end_hour) && (parseInt($scope.log_screen.end_hour) < parseInt($scope.log_screen.start_hour))) {
            $scope.control.time_input_err_msg = '时间间隔有误';
            return false;
        }
        if ($scope.log_screen.start_hour && $scope.log_screen.end_minutes && $scope.log_screen.end_hour && $scope.log_screen.end_minutes) {
            if (($scope.log_screen.end_hour == $scope.log_screen.start_hour) && parseInt($scope.log_screen.end_minutes) < parseInt($scope.log_screen.start_minutes)) {
                $scope.control.time_input_err_msg = '时间间隔有误';
                return false;
            }
        }
        $scope.control.time_input_err_msg = '';
    };
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    $scope.saveScreenInfo = function () {
        if (!CV.valiForm($scope.form.log_screen)) {
            return false;
        } else if ($scope.log_screen.startDate > $scope.log_screen.endDate) {
            Modal.alert("开始时间大于结束时间，请重新输入");
            return false;
        }
        if (!$scope.log_screen.start_hour || !$scope.log_screen.start_minutes || !$scope.log_screen.end_hour || !$scope.log_screen.end_minutes || $scope.control.time_input_err_msg) {
            $scope.control.time_input_err_msg = $scope.control.time_input_err_msg ? $scope.control.time_input_err_msg : '时间间隔有误';
            return false;
        }
        if ($scope.log_screen.keywords) {
            if (!$scope.log_screen.key_line) {
                Modal.alert("请输入截取行数");
                return false;
            }
        }
        if ($scope.log_screen.key_line) {
            if (!$scope.log_screen.keywords) {
                Modal.alert("请输入关键字");
                return false;
            }
        }
        var log_screen = angular.copy($scope.log_screen);
        log_screen.key_line = parseInt($scope.log_screen.key_line ? $scope.log_screen.key_line : 0);
        // $scope.log_screen.key_line=parseInt($scope.log_screen.key_line ? $scope.log_screen.key_line :0);
        $modalInstance.close(log_screen); //添加成功
    }
}]);
//新增巡检报告-日志选择
modal_m.controller('reportLogChooseCtrl', ["$scope", "$modalInstance", "$timeout", "BusiSys", "NodeReform", "Exec", "Modal", "EncodingType", "modalParam", "ScrollConfig", "CV", function ($scope, $modalInstance, $timeout, BusiSys, NodeReform, Exec, Modal, EncodingType, modalParam, ScrollConfig, CV) {
    //巡检基本信息(0:全部日志1：只有日期的日志)
    var _inspect_flag = 1;
    var _modify_flag = false;
    var _sys_name = modalParam.sys_name;
    var _curr_date = new Date();

    //页面信息
    $scope.info = {
        datepicker: {},         //日期插件
        max_date: _curr_date, //最大日期
    };
    //页面控制
    $scope.control = {
        show_input: true,
    };
    //配置
    $scope.config = {
        scroll_config: ScrollConfig
    };
    //页面数据
    $scope.data = {
        log_type_list: [],  //日志分类列表
        log_ip_file: [],    //日志节点列表
        logSyncInfoList: [],
        curr_node: '',     //放临时数据
    };
    //日期选择信息
    $scope.report_choose = {
        start_date: '',
        end_date: '',
        choose_log_list: [],
        choose_log_name: '',
    };
    $scope.form = {};

    //将没有日志的类型变为不可选中
    var judegelogTypeUncheck = function (start_time, end_time) {
        for (var i = 0; i < $scope.data.log_type_list.length; i++) {
            var one_log = $scope.data.log_type_list[i];
            var _tem_log_list = one_log.logSyncInfos ? one_log.logSyncInfos : [];
            var _tem_list = reChangeNodeList(start_time, end_time, _tem_log_list);
            if (_tem_list.length > 0) {
                one_log.uncheck = false;
            } else {
                one_log.uncheck = true;
                one_log.choose_log = false;
            }
        }
    };
    //获取所有日志
    var getAllLog = function () {
        //根据业务系统得到文件
        BusiSys.getAllLogList(_sys_name, _inspect_flag).then(function (data) {
            $timeout(function () {
                $scope.data.log_type_list = data.logBeanList ? data.logBeanList : [];
                if (data.logBeanList) {
                    angular.forEach($scope.data.log_type_list, function (one_log) {
                        if (one_log.logSyncInfos && one_log.logSyncInfos.length > 0) {
                            one_log.uncheck = false;
                        } else {
                            one_log.uncheck = true;
                        }
                        one_log.checked = false;
                    })
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    };
    //重置日志节点表格
    var reChangeNodeList = function (start_time, end_time, curr_node) {
        var _list = [];
        var _tem_start_time = CV.dtFormat(start_time);
        var _tem_end_time = CV.dtFormat(end_time);
        angular.forEach(curr_node, function (one_node) {
            if (_tem_start_time <= one_node.file_date && one_node.file_date <= _tem_end_time) {
                _list.push(one_node);
            }
        });
        return _list;
    };
    var init = function () {
        if (modalParam.report_choose.choose_log_list || modalParam.report_choose.choose_log_name) {
            _modify_flag = true;
            $scope.report_choose = modalParam.report_choose;
        }
        if (_modify_flag) {
            BusiSys.getAllLogList(_sys_name, _inspect_flag).then(function (data) {
                $timeout(function () {
                    $scope.data.log_type_list = data.logBeanList ? data.logBeanList : [];
                    if (data.logBeanList) {
                        angular.forEach($scope.data.log_type_list, function (one_log) {
                            one_log.checked = false;
                        })
                    }
                    angular.forEach($scope.data.log_type_list, function (second_log) {
                        if (second_log.log_name == $scope.report_choose.choose_log_name) {
                            second_log.checked = true;
                            //$scope.data.logSyncInfoList=second_log.logSyncInfos ? second_log.logSyncInfos :[];
                            $scope.data.logSyncInfoList = reChangeNodeList($scope.report_choose.start_date, $scope.report_choose.end_date, second_log.logSyncInfos);
                            //添加的内容
                            $scope.data.curr_node = second_log.logSyncInfos;
                        }
                    });
                    if ($scope.report_choose.choose_log_list && $scope.report_choose.choose_log_list.length > 0) {
                        for (var i = 0; i < $scope.report_choose.choose_log_list.length; i++) {
                            var _choose_log = $scope.report_choose.choose_log_list[i];
                            for (var j = 0; j < $scope.data.log_type_list.length; j++) {
                                var _one_log = $scope.data.log_type_list[j];
                                if (_one_log.log_name == _choose_log.log_name) {
                                    _one_log.choose_log = true;
                                }
                            }
                        }
                    }
                    judegelogTypeUncheck($scope.report_choose.start_date, $scope.report_choose.end_date)
                }, 0);
            }, function (error) {
                Modal.alert(error.message, 3);
            });
        } else {
            getAllLog();
        }
    };
    //显示日期控件
    $scope.open = function ($event, flag) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.info.datepicker.opened = true;
    };
    //切换日志是否选中
    $scope.checkCurLogType = function (curr) {
        for (var i = 0; i < $scope.data.log_type_list.length; i++) {
            var _one_cur = $scope.data.log_type_list[i];
            _one_cur.checked = false;
        }
        curr.checked = true;
        $scope.report_choose.choose_log_name = curr.log_name;
        $scope.data.curr_node = curr.logSyncInfos;
        //根据日期筛选日志列表
        if ($scope.report_choose.start_date && $scope.report_choose.end_date) {
            //控制是否可以选中
            var _tem_log_list = [];
            if (curr.logSyncInfos) {
                for (var k = 0; k < curr.logSyncInfos.length; k++) {
                    var one_log = curr.logSyncInfos[k];
                    if (one_log.file_date) {
                        if (CV.dtFormat($scope.report_choose.start_date) <= one_log.file_date && one_log.file_date <= CV.dtFormat($scope.report_choose.end_date)) {
                            _tem_log_list.push(one_log);
                        }
                    }
                }
            }
            $scope.data.logSyncInfoList = _tem_log_list;
        } else {
            $scope.data.logSyncInfoList = curr.logSyncInfos ? curr.logSyncInfos : [];
        }
    };
    //保存所有的信息
    $scope.saveReport = function () {
        if (!CV.valiForm($scope.form.log_screen)) {
            return false;
        }
        var _tem_list = [];
        angular.forEach($scope.data.log_type_list, function (one_type) {
            if (one_type.choose_log) {
                _tem_list.push(one_type);
            }
        });
        $scope.report_choose.choose_log_list = _tem_list;
        //处理时间数据
        $scope.report_choose.start_date = CV.dtFormat($scope.report_choose.start_date);
        $scope.report_choose.end_date = CV.dtFormat($scope.report_choose.end_date);
        if ($scope.report_choose.start_date > $scope.report_choose.end_date) {
            Modal.alert("时间输入不合法，请重新输入");
            return false;
        }
        if ($scope.report_choose.choose_log_list.length == 0) {
            Modal.alert("未选择日志文件");
            return false;
        }
        $modalInstance.close($scope.report_choose); //添加成功
    };
    //取消
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    /*日期改变*/
    $scope.$watch('report_choose.end_date', function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.data.logSyncInfoList = reChangeNodeList($scope.report_choose.start_date, $scope.report_choose.end_date, $scope.data.curr_node)
            judegelogTypeUncheck($scope.report_choose.start_date, $scope.report_choose.end_date);
        }
    });
    init();
}]);

//----------------故障管理模块--------------------
/**
 *导入方案
 * **/
modal_m.controller("importProgramCtrl", ["$scope", "$modalInstance", "$timeout", "$location", "Program", "Modal", "CV", function ($scope, $modalInstance, $timeout, $location, Program, Modal, CV) {

    $scope.import_program_btn_loading = true;
    $scope.program_loading = false;
    $scope.program_error_upload = false;
    //上传成功标志
    var fileupload_succ = false;
    //上传控件参数配置
    $scope.program_fileupload = {
        suffixs: 'sql',
        filetype: "SQL",
        filename: "",
        uploadpath: "",
    };
    var init = function () {
        Program.getimportProgramUploadPath().then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.program_fileupload.uploadpath = data.program_upload_path;
                }
            }, 0)
        }, function (error) {
            Modal.alert(error.message, 3);
        })
    }
    //上传成功
    $scope.uploadSuccessThen = function () {
        $scope.import_program_btn_loading = false;
        //成功之后再去call导入方案的服务
        $scope.program_loading = false;
        Program.importUsableProgram($scope.program_fileupload.filename).then(function () {
            fileupload_succ = true;
            $scope.program_loading = true;
        }, function (error) {
            $scope.program_loading = true;
            $scope.program_error_upload = true;
            $scope.program_error_message = error.message;
        })
    }
    //取消
    $scope.cancel = function () {
        fileupload_succ ? $modalInstance.close(true) : $modalInstance.dismiss(false);
    };
    init();
}]);
/**
 *切换工单处理方式
 * */
modal_m.controller('pgChangeHandleTypeCtrl', ["$scope", "$modalInstance", "modalParam", "Workorder", "Modal", "CV", function ($scope, $modalInstance, modalParam, Workorder, Modal, CV) {
    var _work_id = modalParam.workId;  //工单编号
    //页面交互信息
    $scope.info = {
        sub_tab: {                 //单个工单tab页
            temp_handle_type: '', //临时处理方式
            order_bk_title: '', //工单title
        },
        form: {}                //表单隔离对象
    };

    var init = function () {
        Workorder.getWorkorder(_work_id).then(function (data) {
            if (data.woorderbean) {
                $scope.info.sub_tab.order_bk_title = data.woorderbean.order_bk_title;
            }
        }, function (erorr) {
            Modal.alert(erorr.message);
        });
    };
    //提交处理方式
    $scope.formSubmit = function () {
        if (!CV.valiForm($scope.info.form.changeTypeform)) {
            return false;
        }
        //service
        $modalInstance.close($scope.info.sub_tab);
    };
    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    init();
}]);

/**
 *工单处理-添加手工SQL
 * */
modal_m.controller("workorderAddSQLModalCtrl", ["$scope", "$modalInstance", "$timeout", "$location", "modalParam", "CodeMirrorOption", "SqlExec", "Program", "BusiSys", "Modal", "CV", function ($scope, $modalInstance, $timeout, $location, modalParam, CodeMirrorOption, SqlExec, Program, BusiSys, Modal, CV) {
    var _type = modalParam.flag; //判断是sql维护还是固化方案 1 sql维护 2 固化方案
    var _srv_list = [];//后台返回服务器数据
    var data_type = '1'; //数据源类型jdbc
    //页面控制标志
    $scope.control = {
        save_btn_loading: false, //保存按钮loading
        get_soc_loading: false, //获取数据库loading
        get_sys_loading: false, //获取数据库loading
        get_srv_loading: false, //获取服务器loading
    };
    //页面交互信息对象
    $scope.info = {
        form: {}, //表单对象
        error_message: '', //错误信息
        sql_info: {},//sql 对象
        sensite_info: {}
    };
    //页面数据对象
    $scope.data = {
        sql_sys_list: [],
        sql_soc_list: [],
        sql_srv_list: [],//系统列表
        srv_name: '',
    };
    //页面配置对象
    $scope.config = {
        editorOptions: CodeMirrorOption.Sql(), //codemirror Sql输入框配置参数
    };

    var init = function () {
        if (_type == 1) {
            $scope.info.sql_info.sys_name = modalParam.sub_tab.basicData.sys_name ? modalParam.sub_tab.basicData.sys_name : '';
            if (modalParam.sub_tab.basicData.workorder_type == 1 && $scope.info.sql_info.sys_name) {
                $scope.selectSys($scope.info.sql_info.sys_name)
            }
            $scope.info.sql_info = { sql_steps: [], sys_name: modalParam.sub_tab.basicData.sys_name ? modalParam.sub_tab.basicData.sys_name : '' };
            //如果是数据导出则需要新增敏感字段列表
            if (modalParam.sub_tab.handle_type == 4) {
                $scope.info.sensite_info = {
                    show_table_flag: true,
                    sensitive_list: []
                };
            }
        } else {
            $scope.info.sql_info = { sys_name: '', sql_txt: '', soc_name: '' };
        }
        //查询所有业务系统（添加sql时用）
        $scope.control.get_sys_loading = true;
        BusiSys.getAllBusinessSys().then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.control.get_sys_loading = false;
                    $scope.data.sql_sys_list = data.list_bs ? data.list_bs : [];
                }
            }, 0);
        }, function (error) {
            $scope.control.get_sys_loading = false;
            Modal.alert(error.message, 3);
        });
        //获取服务器（有jdbc数据源的服务器）
        selectSrv();
    };

    //获取服务器（有jdbc数据源的服务器）
    var selectSrv = function () {
        $scope.control.get_srv_loading = true;
        Program.selectSrv(data_type).then(function (data) {
            if (data) {
                $scope.control.get_srv_loading = false;
                _srv_list = data.server_bean_list;
                for (var i = 0; i < _srv_list.length; i++) {
                    $scope.data.sql_srv_list[i] = _srv_list[i].server_ip;
                }
            }
        }, function (error) {
            Modal.alert(error.message, 3);
            $scope.control.get_srv_loading = false;
        })
    }
    //根据服务器获取数据源
    $scope.selectSrv = function (server_ip) {
        for (var i = 0; i < _srv_list.length; i++) {
            if (_srv_list[i].server_ip == server_ip) {
                $scope.data.sql_soc_list = _srv_list[i].all_soc_name;
            }
        }
    }

    //添加并解析SQL
    var parseSql = function (sub_tab) {
        var _order_seq = sub_tab.basicData.order_seq;//工单编号
        var _deal_bk_seq = sub_tab.basicData.deal_bk_seq;//工单处理流水号
        var _sys_name = $scope.info.sql_info.sys_name;//系统名
        var _soc_name = $scope.info.sql_info.soc_name;//数据库对应的数据源名
        var _sql_txt = $scope.info.sql_info.sql_txt;//sql语句内容
        if (sub_tab.handle_type == 4) {
            //添加查询SQL并解析SQL
            SqlExec.addSelectSql(_order_seq, _deal_bk_seq, _sys_name, _sql_txt, _soc_name).then(function (data) {
                $timeout(function () {
                    if (data.parser_flag && data.sl_msg_list) {
                        //push--sql步骤数据
                        for (var i = 0; i < data.sl_msg_list.length; i++) {
                            var _sql_list = data.sl_msg_list[i];
                            _sql_list.sensite_list = $scope.info.sensite_info.sensitive_list;
                            $scope.info.sql_info.sql_steps.push(_sql_list);
                        }
                        var _sub_tab_info = {
                            sql_steps: $scope.info.sql_info.sql_steps,
                            is_sql: sub_tab.is_sql
                        };
                        $modalInstance.close(_sub_tab_info);
                    } else if (data.parser_failed_msg) {
                        Modal.alert(data.parser_failed_msg);
                    }
                    $scope.control.save_btn_loading = false;
                    $scope.config.editorOptions = CodeMirrorOption.Sql(false);
                }, 0);
            }, function (error) {
                $scope.control.save_btn_loading = false;
                $scope.config.editorOptions = CodeMirrorOption.Sql(false);
                Modal.alert(error.message, 3);
            });
        } else {
            //添加并解析SQL
            SqlExec.addSql(_order_seq, _deal_bk_seq, _sys_name, _sql_txt, _soc_name).then(function (data) {
                $timeout(function () {
                    if (data.parser_flag && data.sl_msg_list) {
                        //push--sql步骤数据
                        for (var i = 0; i < data.sl_msg_list.length; i++) {
                            var _sql_list = data.sl_msg_list[i];
                            $scope.info.sql_info.sql_steps.push(_sql_list);
                        }
                        var _sub_tab_info = {
                            sql_steps: $scope.info.sql_info.sql_steps,
                            is_sql: sub_tab.is_sql
                        };
                        $modalInstance.close(_sub_tab_info);
                    } else if (data.parser_failed_msg) {
                        Modal.alert(data.parser_failed_msg);
                    }
                    $scope.control.save_btn_loading = false;
                    $scope.config.editorOptions = CodeMirrorOption.Sql(false);
                }, 0);
            }, function (error) {
                $scope.control.save_btn_loading = false;
                $scope.config.editorOptions = CodeMirrorOption.Sql(false);
                Modal.alert(error.message, 3);
            });
        }
    };
    //根据系统获取jdbc数据源
    $scope.selectSys = function (sys_name) {
        $scope.info.error_message = "";
        $scope.control.get_soc_loading = true;
        Program.getSocByBusy(sys_name, 1).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.info.sql_info.soc_name = '';
                    $scope.control.get_soc_loading = false;
                    $scope.data.sql_soc_list = [];
                    var _soc_list = data.source_list ? data.source_list : [];
                    for (var i = 0; i < _soc_list.length; i++) {
                        $scope.data.sql_soc_list.push(_soc_list[i].soc_name);
                    }
                }
            }, 0);
        }, function (error) {
            $scope.control.get_soc_loading = false;
            $scope.info.error_message = error.message;
        });
    };
    //数据导出情况下的新增脱敏字段列表
    $scope.addSensitiveParam = function (sensitive_list) {
        var _length = sensitive_list.length;
        if (_length != 0) {
            if (sensitive_list[_length - 1].param_name == '' || sensitive_list[_length - 1].param_value == '') {
                Modal.alert("请完善当前数据操作");
                return false;
            }
        }
        sensitive_list.push({ param_name: '', param_value: '' });
    };
    //数据导出情况下的删除脱敏字段列表
    $scope.removeSensitiveParam = function (index, sensitive_list) {
        sensitive_list.splice(index, 1);
    };

    //保存按钮
    $scope.formSubmit = function () {
        if (!CV.valiForm($scope.info.form.sql_handle_form)) {
            return false;
        }
        $scope.control.save_btn_loading = true;
        $scope.config.editorOptions = CodeMirrorOption.Sql(false);
        if (_type == 1) {
            parseSql(modalParam.sub_tab)
        } else {
            $scope.info.sql_info.sql_txt = $scope.info.sql_info.sql_txt.trim();
            //校验sql语句的合法性
            Program.addProgramStepSql(modalParam.program_seq, $scope.info.sql_info.step_seq, $scope.info.sql_info.sql_txt, $scope.info.sql_info.sys_name).then(function (data) {
                if (data) {
                    $scope.control.save_btn_loading = false;
                    $scope.info.sql_info.sql_param_list = data.sql_param_list ? data.sql_param_list : [];
                    $modalInstance.close($scope.info.sql_info);
                }
            }, function (error) {
                $scope.control.save_btn_loading = false;
                Modal.alert("请填写正确的SQL语句");
            });
        }
    };
    //取消按钮
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);
//工单生成方案--导入sql
modal_m.controller("importProgramSqlCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "Program", "BusiSys", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Program, BusiSys, Modal, CV) {
    //页面信息
    $scope.info = {
        sql_info: { //sql对象
            sys_name: '',
            sql_txt: '',
            soc_name: '',
            sql_seq: 0
        },
        form: { //表单数据
            sql_handle_form: {}
        },
        handleData: modalParam.handleData, //工单处理数据
        error_message: '', //获取数据库错误信息
    };
    //页面数据
    $scope.data = {
        busy_sys_list: [], //系统列表
        sql_soc_list: [], //数据库列表
        srv_list: [] //服务器列表
    };
    //页面控制
    $scope.control = {
        soc_btn_loading: false, //获取数据源loading
    };
    var init = function () {
        //默认选上第一条
        $scope.info.handleData.checkFlag = 0;
        $scope.changeSysNameAndSoc($scope.info.handleData.sql_msg_list[0]);
        //获取业务系统列表
        BusiSys.getAllBusinessSys().then(function (data) {
            $scope.data.busy_sys_list = data.list_bs ? data.list_bs : [];
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    };
    //根据系统获取数据源
    $scope.selectSys = function (sys_name) {
        $scope.info.error_message = "";
        $scope.control.soc_btn_loading = true;
        Program.getSocByBusy(sys_name, 1).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.data.sql_soc_list = [];
                    var _soc_list = data.source_list ? data.source_list : [];
                    for (var i = 0; i < _soc_list.length; i++) {
                        $scope.data.sql_soc_list.push(_soc_list[i].soc_name);
                    }
                    console.log($scope.data.sql_soc_list);
                    $scope.control.soc_btn_loading = false;
                }
            }, 0);
        }, function (error) {
            $scope.control.soc_btn_loading = false;
            $scope.info.error_message = error.message;
        });
    };
    //选择系统和数据库
    $scope.changeSysNameAndSoc = function (curr_sql) {
        if (!curr_sql) return;
        $scope.info.sql_info.sys_name = curr_sql.sys_name;
        $scope.info.sql_info.soc_name = curr_sql.soc_name;
        $scope.info.sql_info.curr_index = curr_sql.curr_index;
        $scope.info.sql_info.sql_txt = curr_sql.sql_text;
        $scope.selectSys($scope.info.sql_info.sys_name);
    };
    //保存sql
    $scope.saveAddSql = function () {
        if (!CV.valiForm($scope.info.form.sql_handle_form)) {
            return false;
        }
        $modalInstance.close($scope.info.sql_info);
    };
    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    init();
}]);
/**
 *工单处理-批量导入SQL
 * */
modal_m.controller("importBatchSQLCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "SqlExec", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, SqlExec, Modal, CV) {
    //页面信息
    $scope.info = {
        sub_tab: modalParam.sub_tab,
    };
    //配置信息
    $scope.config = {
        sql_fileupload: {
            suffixs: 'sql',
            filetype: "SQL",
            filename: "",
            uploadpath: $scope.info.sub_tab.batch_fileupload.uploadpath,
        }
    };
    //sql文件-上传成功
    $scope.uploadSqlSuccessThen = function () {
        $scope.info.sub_tab.batch_fileupload.filename = $scope.config.sql_fileupload.filename;
    };
    //sql文件--删除
    $scope.removeSqlFile = function () {
        $scope.config.sql_fileupload.filename = '';
        $scope.info.sub_tab.batch_fileupload.filename = '';
    };
    //sql文件--下载
    $scope.downloadSqlFile = function () {
        var _download_sql_filepath = $scope.config.sql_fileupload.uploadpath + "/" + $scope.config.sql_fileupload.filename;
        CV.downloadFile(_download_sql_filepath);
    };
    //确认
    $scope.submit = function () {
        if (!$scope.config.sql_fileupload.filename) {
            Modal.alert('请先上传SQL文件！');
            return false;
        }
        console.log($scope.info.sub_tab);
        $modalInstance.close($scope.info.sub_tab);
    };
    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 *工单处理-查看批量导入sql（解析/执行）失败信息
 * */
modal_m.controller("viewExeInfoCtrl", ["$scope", "$modalInstance", "modalParam", function ($scope, $modalInstance, modalParam) {
    //信息
    $scope.message = modalParam.message ? modalParam.message : [];
    //滚动条配置
    $scope.scroll_exec_info = {
        axis: "y",
        theme: "custom-dark",
        scrollbarPosition: "inside",
        scrollInertia: 400,
        scrollEasing: "easeOutCirc",
        autoDraggerLength: true,
        autoHideScrollbar: true,
        scrollButtons: { enable: false }
    };
    //取消
    $scope.cancel = function () {
        $modalInstance.dismiss(false)
    };
}]);

/**
 *工单处理-查看sql处理授权信息
 * */
modal_m.controller("viewTaskDetailCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "SqlExec", "Task", function ($scope, $modalInstance, $timeout, modalParam, SqlExec, Task) {
    var _task_id = modalParam.task_id ? modalParam.task_id : '';
    $scope.work_detail_list = [];
    $scope.currentPoint = 0;
    $scope.data_loading = true;
    $scope.error_message = '';
    $scope.scroll_flow_info = {
        axis: "y",
        theme: "custom-dark",
        scrollbarPosition: "inside",
        scrollInertia: 400,
        scrollEasing: "easeOutCirc",
        autoDraggerLength: true,
        autoHideScrollbar: true,
        scrollButtons: { enable: false }
    };
    //获得必需数据
    Task.getTaskDetail(_task_id).then(function (data) {
        $scope.data_loading = false;
        $scope.work_detail_list = data.work_detail_list ? data.work_detail_list : [];
        $scope.apply_bk_expl = data.apply_bk_expl ? data.apply_bk_expl : '';
        $scope.pendwk_bk_expl = data.pendwk_bk_expl ? data.pendwk_bk_expl : '';
        $scope.user_cn_name = data.user_cn_name ? data.user_cn_name : '';
        $scope.workflow_state = data.workflow_state ? data.workflow_state : '';

        for (var i = 0; i < $scope.work_detail_list.length; i++) {
            if ($scope.work_detail_list[i].pend_type == 1) {
                $scope.work_detail_list[i].deal_type_name = "申请";
            } else if ($scope.work_detail_list[i].pend_type == 2) {
                $scope.work_detail_list[i].deal_type_name = "复核";
            } else if ($scope.work_detail_list[i].pend_type == 3) {
                $scope.work_detail_list[i].deal_type_name = "授权";
            } else if ($scope.work_detail_list[i].pend_type == 4) {
                $scope.work_detail_list[i].deal_type_name = "执行";
            } else {
                $scope.work_detail_list[i].deal_type_name = "关闭";
            }
        }
        //判断执行到哪一步，考虑到多个复核，授权的问题
        for (var i = 0; i < $scope.work_detail_list.length; i++) {
            if ($scope.work_detail_list[i].user_cn_name) {
                $scope.currentPoint = i;
            }
            $scope.work_detail_list[i].show = false;
        }
    }, function (error) {
        $scope.data_loading = false;
        $scope.error_message = error.message;
    });
    $scope.styleCh = function (index) {
        return {
            'position': "relative",
            'top': (index == 0 ? 2 : index * (65 + 14)) + "px",
        }
    };
    $scope.styleAng = function (index, oneStep) {
        if ($scope.workflow_state == 2 || $scope.workflow_state == 4) {
            return {
                'position': "absolute",
                'width': "20px",
                'height': "20px",
                'background-color': oneStep.work_state == 1 ? "#0095A5" : oneStep.work_state == 2 ? "#D85668" : index == $scope.work_detail_list.length - 1 ? "#fff" : "#CCCCCC",
                'border-radius': "20px",
                'border': oneStep.work_state == 1 ? "2px solid #0095A5" : oneStep.work_state == 2 ? "2px solid #D85668" : index == $scope.work_detail_list.length - 1 ? "2px solid #0095A5" : "2px solid #CCCCCC",
                'left': "100px",
                'top': "10px",
                "text-align": "center"
            };
        } else if ($scope.workflow_state == 1 || $scope.workflow_state == 3 || $scope.workflow_state == 5) {
            return {
                'position': "absolute",
                'width': "20px",
                'height': "20px",
                'background-color': oneStep.work_state == 1 || oneStep.work_state == 3 ? "#0095A5" : "#1c2837",
                'border': "2px solid #0095A5",
                'border-radius': "20px",
                'left': "100px",
                'top': "10px",
                "text-align": "center"
            };
        } else if ($scope.workflow_state == 7) {
            return {
                'position': "absolute",
                'width': "20px",
                'height': "20px",
                'background-color': (oneStep.work_state == 1 && index != $scope.work_detail_list.length - 1) ? "#0095A5" : oneStep.work_state == 2 ? "#F37889" : index == $scope.work_detail_list.length - 1 ? "black" : "#CCCCCC",
                'border-radius': "20px",
                'left': "100px",
                'top': "10px",
                "text-align": "center"
            };
        } else {
            return {
                'position': "absolute",
                'width': "20px",
                'height': "20px",
                'background-color': oneStep.work_state == 1 ? "#0095A5" : oneStep.work_state == 2 ? "#F37889" : oneStep.work_state == 4 ? "#0095A5" : "#CCCCCC",
                'border-radius': "20px",
                'left': "100px",
                'top': "10px",
                "text-align": "center"
            };
        }

    };
    //取消
    $scope.formCancel = function () {
        $modalInstance.close($scope.workflow_state);
    };
}]);

/**
 *工单处理--查看手工sql详细
 * */
modal_m.controller("ProgramDetailSqlStepCtrl", ["$scope", "$modalInstance", "$timeout", "SqlExec", "modalParam", "SqlType", "BucketType", "Modal", "CV", function ($scope, $modalInstance, $timeout, SqlExec, modalParam, SqlType, BucketType, Modal, CV) {
    var _sql_work_seq = modalParam.sql_work_seq; //工单流水号
    //sql细步骤信息
    $scope.info = {
        sql_seq: '', //sql序号
        sql_text: '', //sql语句
        sys_cn_name: '', //系统节点
        soc_priv: '', //数据源权限
        stp_info_list: [], //表名
        sql_type: '', //操作类型
        priv_yn_flag: '', //操作权限
        sql_where: '', //约束条件
        scp_info_list: [], //参数信息列表
        exp_bk_num: '', //预计影响条数
        exp_exec_time: '', //预计执行时间
        bucket_type: ''  //时段类型
    };
    //sql查看详细按钮对象
    $scope.control = {
        sqldetail_loading: false, //sql查看详细加载
        sqldetail_error: false, //sql查看详细加载异常
        sqldetail_error_message: '' //sql查看详细加载异常信息
    }
    var init = function () {
        //查看详细步骤信息
        SqlExec.getSqlSchemeResult(_sql_work_seq).then(function (data) {
            $timeout(function () {
                if (data.sql_detail_msg) {
                    $scope.info.sql_seq = data.sql_detail_msg.sql_seq;
                    $scope.info.sql_text = data.sql_detail_msg.sql_text;
                    $scope.info.sys_cn_name = data.sql_detail_msg.sys_cn_name;
                    $scope.info.soc_priv = data.sql_detail_msg.soc_priv;
                    $scope.info.stp_info_list = data.sql_detail_msg.stp_info_list ? data.sql_detail_msg.stp_info_list : [];
                    $scope.info.sql_type = data.sql_detail_msg.sql_type;
                    $scope.info.priv_yn_flag = data.sql_detail_msg.priv_yn_flag;
                    $scope.info.sql_where = data.sql_detail_msg.sql_where;
                    $scope.info.scp_info_list = data.sql_detail_msg.scp_info_list ? data.sql_detail_msg.scp_info_list : [];
                    $scope.info.exp_bk_num = data.sql_detail_msg.exp_bk_num;
                    $scope.info.exp_exec_time = data.sql_detail_msg.exp_exec_time;
                    $scope.info.bucket_type = data.sql_detail_msg.bucket_type;
                    //格式化--数据库操作类型
                    $scope.info.sql_type_cn = CV.findValue($scope.info.sql_type, SqlType);
                    //格式化时段
                    $scope.info.bucket_cn_type = CV.findValue($scope.info.bucket_type, BucketType);
                    //sql查看详细加载完成
                    $scope.control.sqldetail_loading = true;
                }
            }, 0);
        }, function (error) {
            $scope.control.sqldetail_loading = true;
            $scope.control.sqldetail_error = true;
            $scope.control.sqldetail_error_message = error.message;
        });
    };
    //查看详细步骤--关闭模态框
    $scope.closeModal = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *手工sql--执行单条sql--确认模态框
 * */
modal_m.controller("ProgramConfirmSqlStatementCtrl", ["$scope", "$modalInstance", "modalParam", "Modal", function ($scope, $modalInstance, modalParam, Modal) {
    //页面交互对象
    $scope.info = {
        sql_step: modalParam.sql_step,            // 单条sql语句
        unsubmit_sql_steps: modalParam.un_submit_sql_steps, //所有未提交的sql步骤
    };
    //页面控制对象
    $scope.control = {
        confirm_btn_loading: false, //确认加载 按钮loading
    };

    //方案--SQL维护--查看详细步骤
    $scope.viewSqlStepModal = function (sql_work_seq) {
        Modal.viewSqlDetailStep(sql_work_seq).then(function () { });
    };
    //提交单个sql--确认模态框
    $scope.confirm = function () {
        $scope.confirm_btn_loading = true;
        $modalInstance.close($scope.sql_step);
    };
    //取消-确认模态框
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 *固化方案本地授权
 * */
modal_m.controller('pgLocalauthCtrl', ["$scope", "$modalInstance", "Workorder", "modalParam", "Modal", function ($scope, $modalInstance, Workorder, modalParam, Modal) {
    $scope.condition_text = modalParam.data.condition_text;
    $scope.u = {};
    $scope.authdprl_bk_expl = modalParam.data.authdprl_bk_expl;
    $scope.btnBus_loading = false;
    $scope.order_bk_title = modalParam.srv_req.order_bk_title;
    $scope.program_name = modalParam.srv_req.program_name;
    $scope.step_bk_title = modalParam.srv_req.step_bk_title;
    $scope.ok = function () {
        $scope.btnBus_loading = true;
        if (!$scope.u.userId) {
            Modal.alert("授权用户名为空！");
            $scope.btnBus_loading = false;
            return false;
        } else if (!$scope.u.userPwd) {
            Modal.alert("授权用户密码为空！");
            $scope.btnBus_loading = false;
            return false;
        } else {
            var param = {
                auth_dprl_code: modalParam.data.auth_dprl_code,
                auth_user_id: $scope.u.userId,
                user_passed: $scope.u.userPwd,
                auth_key: modalParam.data.auth_key,
            };
            Workorder.checkPgLocalAuth(param).then(function (data) {
                if (data.pgsvdeal_type == 1) {
                    $modalInstance.close(data);
                } else if (data.pgsvdeal_type == 2) {
                    $modalInstance.close(data);
                }
            }, function (error) {
                $scope.btnBus_loading = false;
                $modalInstance.dismiss({ status: 'system', message: error.message });
            });
        }
    };
    $scope.cancel = function () {
        $modalInstance.close('system');
    };
}]);

/**
 * 固化方案远程授权
 * */
modal_m.controller('pgRemoteauthCtrl', ["$scope", "$modalInstance", "Task", "modalParam", "Modal", "CV", function ($scope, $modalInstance, Task, modalParam, Modal, CV) {
    //页面信息
    $scope.info = {
        order_bk_title: modalParam.srv_req.order_bk_title,//工单标题
        pendwk_bk_expl: modalParam.data.condition_text, //授权条件
        program_name: modalParam.srv_req.program_name, //方案名
        step_bk_title: modalParam.srv_req.step_bk_title, //当前步骤名
        apply_bk_expl: '',//申请说明
        form: {},//隔离表单对象
    };
    //页面控制
    $scope.control = {
        btnBus_loading: false
    };
    //提交表单
    $scope.submitRaForm = function () {
        $scope.control.btnBus_loading = true;
        //表单验证
        if (!CV.valiForm($scope.info.form.raForm)) {
            $scope.control.btnBus_loading = false;
            return false;
        }
        var _srvReqData = angular.copy(modalParam.srv_req);
        modalParam.data.pgsubmit_type = 4; //方案提交类型--远程授权提交申请
        modalParam.data.apply_bk_expl = $scope.info.apply_bk_expl; //远程授权提交申请--申请说明
        modalParam.data.sql_list = _srvReqData.sql_list;
        modalParam.data.order_seq = _srvReqData.order_seq;
        modalParam.data.deal_bk_seq = _srvReqData.deal_bk_seq;
        modalParam.data.order_bk_title = _srvReqData.order_bk_title;
        modalParam.data.program_name = _srvReqData.program_name;
        modalParam.data.step_bk_title = _srvReqData.step_bk_title;
        modalParam.data.step_seq = _srvReqData.step_seq;
        Task.ExecuteTask(modalParam.data, _srvReqData.org_srv_name).then(function (data) {
            data.success = true;
            $modalInstance.close(data);
        }, function (error) {
            $scope.control.btnBus_loading = false;
            $modalInstance.close('system');
        });
    };
    //取消
    $scope.cancel = function () {
        $modalInstance.close('system');
    };
}]);

/**
 *工单处理-查看执行脚本详情
 * */
modal_m.controller("viewScriptInfoCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "CodeMirrorOption", "CmptFunc", "ScriptExec", function ($scope, $modalInstance, $timeout, modalParam, CodeMirrorOption, CmptFunc, ScriptExec) {
    var _order_seq = modalParam.order_seq; //工单编号
    var _deal_bk_seq = modalParam.deal_bk_seq; //处理流水号
    var _script_bk_seq = modalParam.script_bk_seq; //脚本号
    //页面交互信息
    $scope.info = {
        impl_type: "", //实现类别
        script_text: '', //脚本内容
        exe_msg_list: [], //执行信息列表
        error_msg: '', //加载出错信息
    };
    //页面控制
    $scope.control = {
        error_flag: false, //执行结果中的错误标志
        loading_flag: false, //加载标志
    };
    //页面配置
    $scope.config = {
        detailOptionShell: CodeMirrorOption.Sh(true), //shell配置
        detailOptionPython: CodeMirrorOption.Python(true), //shell配置
    };
    var init = function () {
        $scope.control.loading_flag = true;
        //查看脚本执行详细信息
        ScriptExec.viewStepDetail(_order_seq, _deal_bk_seq, _script_bk_seq).then(function (data) {
            $timeout(function () {
                if (data.exetend_bean) {
                    $scope.control.loading_flag = false;
                    $scope.info.impl_type = data.exetend_bean.impl_type;
                    $scope.info.script_text = data.exetend_bean.script_content ? CmptFunc.cmdsToString(data.exetend_bean.script_content) : '';
                    $scope.info.exe_msg_list = data.exetend_bean.source_list ? data.exetend_bean.source_list : [];
                    for (var i = 0; i < $scope.info.exe_msg_list.length; i++) {
                        $scope.info.exe_msg_list[i].collapse_flag = true;
                        if ($scope.info.exe_msg_list[i].exe_result == 2) {
                            $scope.control.error_flag = true;
                            break;
                        }
                    }
                }
            }, 0);
        }, function (error) {
            $scope.control.loading_flag = false;
            $scope.info.error_msg = error.message;
        });
    };
    //关闭
    $scope.close = function () {
        $modalInstance.close(true);
    };
    init();
}]);

/**
 * 查看固化方案审批流程
 * */
modal_m.controller("viewWorkOrderFlowCtrl", ["$scope", "$modalInstance", "$timeout", "ScrollBarConfig", "modalParam", function ($scope, $modalInstance, $timeout, ScrollBarConfig, modalParam) {
    //页面信息
    $scope.info = {
        pgDetailList: [],//流程列表
    };
    //滚动条配置
    $scope.config = {
        scroll_y_info: ScrollBarConfig.Y()
    };
    var init = function () {
        $scope.info.pgDetailList = modalParam.data.pg_detail_list ? modalParam.data.pg_detail_list : [];
    };
    //取消
    $scope.formCancel = function () {
        $modalInstance.close('error');
    };
    init()
}]);

/**
 *方案查看sql详细
 * */
modal_m.controller("faultProgramSqlDetailCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "Program", "SqlType", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Program, SqlType, Modal, CV) {
    var _program_seq = modalParam.program_seq; //方案编号
    var _step_seq = modalParam.step_seq;    //方案步骤编号
    var _sql_seq = modalParam.sql_seq;     //方案步骤sql编号
    //sql详细信息对象
    $scope.info = {
        step_seq: _step_seq, //步骤号
        sql_index: _sql_seq, //步骤中sql的序号
        sql_detail_info: {}        //sql详细信息对象
    };
    //页面控制交互对象
    $scope.control = {
        sql_detail_loading: false,  //sql信息加载loading
        sql_detail_error: false,  //sql信息加载error标志
    };
    //获取sql详细信息
    var getSqlDetailInfo = function (program_seq, step_seq, sql_seq) {
        //加载信息中
        $scope.control.sql_detail_loading = true;
        Program.viewProgramStepSqlDetail(program_seq, step_seq, sql_seq).then(function (data) {
            if (data.sql_parse_bean) {
                $scope.info.sql_detail_info.sql_type = data.sql_parse_bean.sql_type;
                $scope.info.sql_detail_info.sql_type_cn = CV.findValue($scope.info.sql_detail_info.sql_type, SqlType);
                $scope.info.sql_detail_info.sys_cn_name = data.sql_parse_bean.sys_cn_name;
                $scope.info.sql_detail_info.sql_text = data.sql_parse_bean.sql_text;
                $scope.info.sql_detail_info.sql_where = data.sql_parse_bean.sql_where;
                $scope.info.sql_detail_info.tbl_name_list = data.sql_parse_bean.tbl_name_list ? data.sql_parse_bean.tbl_name_list : [];
                $scope.info.sql_detail_info.select_parse_list = data.sql_parse_bean.select_parse_list ? data.sql_parse_bean.select_parse_list : [];
                $scope.info.sql_detail_info.modify_parse_list = data.sql_parse_bean.modify_parse_list ? data.sql_parse_bean.modify_parse_list : [];
                //加载完成
                $scope.control.sql_detail_loading = false;
            }
        }, function (error) {
            $scope.control.sql_detail_loading = false;
            $scope.control.sql_detail_error = true;
            $scope.info.sql_detail_info.errorMessage = error.message;
            // Modal.alert(error.message,3);
        })
    };

    var init = function () {
        getSqlDetailInfo(_program_seq, _step_seq, _sql_seq);
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
*固化方案--批量导入方案步骤
* */
modal_m.controller("importProgramStepCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "Program", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Program, Modal, CV) {
    //页面info
    $scope.info = {
        excel_download_path: ''
    };
    //页面配置
    $scope.config = {
        program_step_fileupload: { //上传控件
            suffixs: 'xls,xlsx',
            filetype: "EXCEL",
            filename: "",
            uploadpath: "",
        }
    };
    var init = function () {
        //获取上传路径
        Program.getimportProgramUploadPath().then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.config.program_step_fileupload.uploadpath = data.program_upload_path ? data.program_upload_path : '';
                }
            }, 0)
        }, function (error) {
            Modal.alert(error.message, 3);
        })
    };
    //上传成功
    $scope.uploadSuccessThen = function () {
        $scope.info.excel_download_path = $scope.config.program_step_fileupload.uploadpath + $scope.config.program_step_fileupload.filename;
    };
    //下载excel
    $scope.downLoadExcel = function () {
        CV.downloadFile($scope.info.excel_download_path);
    };
    //移除excel
    $scope.deleteExcel = function () {
        $scope.config.program_step_fileupload.filename = '';
    };
    //提交信息
    $scope.saveProgramStep = function () {
        if (!$scope.config.program_step_fileupload.filename) {
            Modal.alert("请先上传文件！");
            return false;
        };
        $modalInstance.close($scope.config.program_step_fileupload.filename);
    };
    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    init();
}]);

/**
 *故障单任务--查看方案
 * */
modal_m.controller("viewTroubleTicketProgramCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "Task", "WoStatusType", "ScrollBarConfig", "Modal", function ($scope, $modalInstance, $timeout, modalParam, Task, WoStatusType, ScrollBarConfig, Modal) {
    var _program_seq = modalParam.task_id;//方案编号
    $scope.info = {};
    $scope.config = {
        scroll_info: ScrollBarConfig.XY()
    };
    //通过方案编号得到所有数据
    var getSteps = function (program_seq) {
        Task.viewTaskProgramDetail(program_seq).then(function (data) {
            $timeout(function () {
                $scope.info = data;
            }, 0)
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    };
    var init = function () {
        getSteps(_program_seq);
    };
    $scope.close = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *故障管理-参数配置-高峰时段(包括新增修改)
 * */
modal_m.controller("faultPeakDateModalCtrl", ["$scope", "$modalInstance", "WorkDayType", "modalParam", "TroubleConfig", "Modal", "CV", function ($scope, $modalInstance, WorkDayType, modalParam, TroubleConfig, Modal, CV) {
    var _time_work_seq = modalParam.time_work_seq;  //时段流水号
    //设置初始化时间0时0分
    var now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    //设置初始化时间23时59分
    var _max_now = new Date();
    _max_now.setHours(23);
    _max_now.setMinutes(59);

    //页面信息对象
    $scope.info = {
        peak_data: {
            time_cn_name: '',  //时段中文名
            time_bk_desc: '',  //时段描述
            wday_type: '',        //高峰日类型
            start_bk_date: '', //开始日期
            end_bk_date: '',   //结束日期
            times: [],         //时间组列表
            start_time: now,   //起始开始时间
            end_time: _max_now //起始结束时间
        },  //高峰时段对象
        form: {}, //表单隔离对象
    };
    //页面数据对象
    $scope.data = {
        work_day_type_list: WorkDayType //所有的工作日类型列表
    };
    //页面控制对象
    $scope.control = {
        edit_flag: false, //新增,修改标志
        show_date_flag: false, //日期显示标志
        show_time_group_flag: false, //时间组显示标志
        save_btn_loading: false //保存标志
    };
    var init = function () {
        if (_time_work_seq) {
            //获取单个高峰时段信息
            TroubleConfig.viewPeakTimeIntervalInfo(_time_work_seq).then(function (data) {
                if (data.time_interval_bean) {
                    var _time_interval_info = data.time_interval_bean;
                    $scope.info.peak_data.time_work_seq = _time_interval_info.time_work_seq;
                    $scope.info.peak_data.time_cn_name = _time_interval_info.time_cn_name;
                    $scope.info.peak_data.time_bk_desc = _time_interval_info.time_bk_desc;
                    $scope.info.peak_data.wday_type = _time_interval_info.wday_type;
                    //如果工作日类型是调休工作日，节假日，那就显示日期控件
                    if ($scope.info.peak_data.wday_type == 3 || $scope.info.peak_data.wday_type == 4) {
                        $scope.control.show_date_flag = true;
                    }
                    //转化工作日类型为中文
                    $scope.info.peak_data.wday_type_cn = CV.findValue(_time_interval_info.wday_type, WorkDayType);
                    //如果存在日期，需要赋值
                    if (_time_interval_info.start_bk_date && _time_interval_info.end_bk_date) {
                        $scope.info.peak_data.start_bk_date = _time_interval_info.start_bk_date;
                        $scope.info.peak_data.end_bk_date = _time_interval_info.end_bk_date;
                    }
                    //赋值时间组
                    $scope.info.peak_data.times = _time_interval_info.times;
                }

            });
        }
    };
    //根据不同的工作日类型来判断是否显示日期区间 1 普通工作日 2 普通周末 3 调休工作日 4 节假日
    $scope.changeDateState = function (selectKey) {
        $scope.control.show_date_flag = (selectKey == 3 || selectKey == 4) ? true : false;
        //如果工作日类型为普通工作日，普通周末，不需要日期
        if (selectKey == 1 || selectKey == 2) {
            $scope.info.peak_data.start_bk_date = '';
            $scope.info.peak_data.end_bk_date = '';
        }
    };
    //用来同时打开两个日期控件
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.info.form.opened = true;
    };
    //添加时间组到时间组列表
    $scope.addTimeGroup = function (start_time, end_time) {
        var _start_time = (CV.dttFormat(start_time)).substr(0, 5);
        var _end_time = (CV.dttFormat(end_time)).substr(0, 5);
        //条件判断
        if (start_time > end_time) {
            Modal.alert("开始时间大于结束时间，请重新选择");
            return false;
        }
        for (var i = 0; i < $scope.info.peak_data.times.length; i++) {
            var _time = $scope.info.peak_data.times[i];
            if (_start_time == _time.start_time && _end_time == _time.end_time) {
                Modal.alert("不可重复添加，重新选择！");
                return false;
            }
        }
        $scope.info.peak_data.times.push({ start_time: _start_time, end_time: _end_time });
    };
    //删除时间组列表的某一项
    $scope.deleteTimeGroup = function (index) {
        $scope.info.peak_data.times.splice(index, 1);
    };
    //提交指派表单
    $scope.formSubmit = function () {
        //表单验证
        if (!CV.valiForm($scope.info.form.peakForm)) {
            return false;
        }
        //如果工作日类型为调休工作日，节假日，需要选择日期
        if ($scope.info.peak_data.wday_type == 3 || $scope.info.peak_data.wday_type == 4) {
            if (!$scope.info.peak_data.start_bk_date || !$scope.info.peak_data.end_bk_date) {
                Modal.alert("日期不可以为空");
                return false;
            }
            if ($scope.info.peak_data.start_bk_date > $scope.info.peak_data.end_bk_date) {
                Modal.alert("开始日期大于结束日期，请重新选择");
                return false;
            }
            $scope.info.peak_data.start_bk_date = CV.dtFormat($scope.info.peak_data.start_bk_date);
            $scope.info.peak_data.end_bk_date = CV.dtFormat($scope.info.peak_data.end_bk_date);
        }
        $scope.control.save_btn_loading = true;
        if (_time_work_seq) {
            //修改保存高峰时间组
            TroubleConfig.modifyPeakTimeInterval($scope.info.peak_data).then(function (data) {
                if (data) {
                    Modal.alert("修改成功");
                    $scope.control.save_btn_loading = false;
                    $modalInstance.close(true);
                }
            }, function (error) {
                $scope.control.save_btn_loading = false;
                Modal.alert(error.message, 3);
            });
        } else {
            //新增高峰时间组
            TroubleConfig.addPeakTimeInterval($scope.info.peak_data).then(function (data) {
                if (data) {
                    $scope.control.save_btn_loading = false;
                    Modal.alert("新增成功");
                    $modalInstance.close(true);
                }
            }, function (error) {
                $scope.control.save_btn_loading = false;
                Modal.alert(error.message, 3);
            });
        }



    }
    // 表单取消
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 * 故障管理-参数配置-故障类型模态框(包括新增修改)
* */
modal_m.controller("faultTroubleTypeCtrl", ["$scope", "$modalInstance", "$timeout", "modalParam", "TroubleConfig", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, TroubleConfig, Modal, CV) {
    var _trouble_key = modalParam.trouble_key; //故障编号
    //页面交互信息对象
    $scope.info = {
        form: {}, // 表单隔离对象
        trouble_type_info: {  //页面故障信息对象
            trouble_code: '', //故障编号
            trouble_bk_desc: '' //故障描述
        }
    };
    //页面控制对象
    $scope.control = {
        edit_flag: false, // 区分新增和修改的标志
        save_btn_loading: false //保存按钮loading加载
    };
    //初始化方法
    var init = function () {
        //存在故障编号即为修改
        if (_trouble_key) {
            $scope.control.edit_flag = true; //存在trouble_key即意味着修改
            //获取单个故障类型信息
            TroubleConfig.viewTroubleTypeInfo(_trouble_key).then(function (data) {
                $timeout(function () {
                    $scope.info.trouble_type_info.trouble_key = data.trouble_key;
                    $scope.info.trouble_type_info.trouble_code = data.trouble_code ? data.trouble_code : '';
                    $scope.info.trouble_type_info.trouble_bk_desc = data.trouble_bk_desc ? data.trouble_bk_desc : '';
                }, 0);
            }, function (error) {
                Modal.alert(error.message, 3);
            });
        }
    };
    //提交表单
    $scope.formSubmit = function () {
        $scope.control.save_btn_loading = true;
        //表单验证
        if (!CV.valiForm($scope.info.form.trouble_type_form)) {
            $scope.control.save_btn_loading = false;
            return false;
        }
        if (!_trouble_key) {
            //新增故障类型信息
            TroubleConfig.addTroubleType($scope.info.trouble_type_info).then(function (data) {
                if (data) {
                    $timeout(function () {
                        $scope.control.save_btn_loading = false;
                        Modal.alert("新增成功");
                        $modalInstance.close(true);
                    }, 0);
                }
            }, function (error) {
                $scope.control.save_btn_loading = false;
                Modal.alert(error.message, 3);
            });
        } else {
            //修改保存故障类型信息
            TroubleConfig.updateTroubleType($scope.info.trouble_type_info).then(function (data) {
                if (data) {
                    $timeout(function () {
                        $scope.control.save_btn_loading = false;
                        Modal.alert("修改成功");
                        $modalInstance.close(true);
                    }, 0);
                }
            }, function (error) {
                $scope.control.save_btn_loading = false;
                Modal.alert(error.message, 3);
            });
        }
    };
    //取消表单
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    init()
}]);

/**
 *方案预览
 * */
modal_m.controller('schemePreviewCtrl', ["$scope", "$timeout", "$routeParams", "$modalInstance", "modalParam", "Program", "Modal", function ($scope, $timeout, $routeParams, $modalInstance, modalParam, Program, Modal) {
    //页面信息
    $scope.info = {
        program_seq: modalParam.programSeq, //方案编号
        steps: []                     //方案步骤数据
    };
    //通过方案编号得到所有步骤数据
    var getAllStepsByProgramSeq = function (program_seq) {
        $timeout(function () {
            Program.previewProgram(program_seq).then(function (data) {
                $scope.info.steps = data.preview_pg_list ? data.preview_pg_list : [];
            }, function (error) {
                Modal.alert(error.message, 3);
            });
        }, 0);
    };
    var init = function () {
        //通过方案编号得到所有步骤数据
        getAllStepsByProgramSeq($scope.info.program_seq);
    };
    //当前步骤线的样式
    $scope.lineStyle = function (step) {
        return {
            'width': "2px",
            'height': "100%",
            'position': "absolute",
            'background-color': step.type == 2 ? "#3D9ED8" : "#555f76",
            'left': "-32px",
            'top': "18px"
        };
    };
    $scope.cancel = function () {
        $modalInstance.close(true);
    };
    init();
}]);
/**
 *工单退回
 * */
modal_m.controller('workOrderRollbackCtrl', ["$scope", "$timeout", "$modalInstance", "modalParam", "Workorder", "Modal", "CV", function ($scope, $timeout, $modalInstance, modalParam, Workorder, Modal, CV) {
    //工单编号
    var _order_seq = modalParam.order_seq;
    //页面交互信息
    $scope.info = {
        workorder_rollback_info: {
            order_seq: _order_seq, //工单编号
            workorder_title: '',         //工单标题
            deal_bk_expl: ''          //退回说明
        },
        form: {}, //表单信息对象
    };
    //页面控制
    $scope.control = {
        save_rollback_btn_loading: false, //保存退回信息loading
    };
    var init = function () {
        //根据编号查询工单信息
        Workorder.getWorkorder(_order_seq).then(function (data) {
            $timeout(function () {
                if (data.woorderbean) {
                    //工单标题
                    $scope.info.workorder_rollback_info.workorder_title = data.woorderbean.order_bk_title;
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3)
        });
    };
    //提交退回信息
    $scope.formSubmit = function () {
        //表单验证
        if (!CV.valiForm($scope.info.form.rollback_form)) {
            return false;
        }
        $scope.control.save_rollback_btn_loading = true;
        //提交退回信息
        Workorder.rollbackWorkorder($scope.info.workorder_rollback_info).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.control.save_rollback_btn_loading = false;
                    $modalInstance.close(true);
                }
            }, 0);
        }, function (error) {
            $scope.control.save_rollback_btn_loading = false;
            Modal.alert(error.message, 3)
        });
    };
    //取消
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);
/**
 *工单指派
 * */
modal_m.controller('workOrderAppointCtrl', ["$scope", "$timeout", "$modalInstance", "$rootScope", "modalParam", "Workorder", "Modal", "CV", function ($scope, $timeout, $modalInstance, $rootScope, modalParam, Workorder, Modal, CV) {
    var _order_seq = modalParam.order_seq; //工单编号
    var _loginuser = $rootScope.loginUser; //获取当前用户信息
    var _user_cur_id = _loginuser.org_user_id; //获得当前用户名
    var _user_cur_dept_id = _loginuser.org_dept_id; //获得当前用户部门
    $scope.form = {}; //用来包围模态框中的scope数据
    //页面信息交互对象
    $scope.info = {
        workorder_appoint_info: {
            order_seq: _order_seq, //工单编号
            deal_dept_id: "",         //指派部门
            deal_user_id: "",         //指派员工
            order_bk_title: ""          //工单标题
        },
        form: {}, //form表单对象
    };
    //页面data列表数据
    $scope.data = {
        department_list: [], //可指派的部门列表
        employee_list: [], //可指派的员工列表
    };
    //页面判断条件
    $scope.control = {
        judge_cur_appoint: false, //判断当前用户是不是工单责任人
        save_appoint_btn_loading: false, //保存指派信息loading
        get_appoint_info_loading: false, //获取工单信息
    };
    //根据指派部门得到指派员工列表
    var getAppointStaffList = function (selectKey) {
        Workorder.getAppointStaffList(selectKey).then(function (data) {
            $timeout(function () {
                $scope.data.employee_list = data.user_list ? data.user_list : [];
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    };
    //判断当前用户是不是工单责任人
    var judgeCurAppoint = function (dept_id, user_id) {
        if (_user_cur_dept_id == dept_id && _user_cur_id == user_id) {
            $scope.control.judge_cur_appoint = true;
        } else {
            $scope.control.judge_cur_appoint = false;
        }
    };
    //初始化指派信息
    var init = function () {
        $scope.control.get_appoint_info_loading = true;
        //得到工单的编号和标题
        Workorder.getWorkorder(_order_seq).then(function (data) {
            $timeout(function () {
                if (data.woorderbean) {
                    $scope.control.get_appoint_info_loading = false;
                    $scope.info.workorder_appoint_info.order_bk_title = data.woorderbean.order_bk_title;
                    $scope.info.workorder_appoint_info.deal_dept_id = data.woorderbean.deal_dept_id;
                    $scope.info.workorder_appoint_info.deal_user_id = data.woorderbean.deal_user_id;
                    //通过工单指派部门得到员工列表
                    getAppointStaffList($scope.info.workorder_appoint_info.deal_dept_id);
                    //判断当前用户是不是工单责任人
                    judgeCurAppoint($scope.info.workorder_appoint_info.deal_dept_id, $scope.info.workorder_appoint_info.deal_user_id);
                }
            }, 0);
        }, function (error) {
            $scope.control.get_appoint_info_loading = false;
            $scope.info.error_message = error.message;
        });
        //得到所有的指派部门信息
        Workorder.getAppointDepartmentList().then(function (data) {
            $timeout(function () {
                $scope.data.department_list = data.dept_list ? data.dept_list : [];
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3);
        });
    };
    //通过选择的部门得到指派员工列表
    $scope.selectDepartment = function (selectKey) {
        $scope.info.workorder_appoint_info.deal_user_id = ""; //清除指派员工
        getAppointStaffList(selectKey); //得到指派员工列表
    };
    //提交指派表单
    $scope.formSubmit = function () {
        //表单验证
        if (!CV.valiForm($scope.info.form.pointForm)) {
            return false;
        }
        $scope.control.save_appoint_btn_loading = true;
        //提交指派信息
        Workorder.appiontWorkorder($scope.info.workorder_appoint_info).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.control.save_appoint_btn_loading = false;
                    $modalInstance.close(true);
                }
            }, 0);
        }, function (error) {
            $scope.control.save_appoint_btn_loading = false;
            Modal.alert(error.message, 3);
        });
    }
    //取消指派
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);
/**
 * 工单变更
 * */
modal_m.controller('workOrderChangeCtrl', ["$scope", "$timeout", "$modalInstance", "Workorder", "modalParam", "WoCloseType", "WoRestartType", "Modal", "CV", function ($scope, $timeout, $modalInstance, Workorder, modalParam, WoCloseType, WoRestartType, Modal, CV) {
    //工单编号
    var _order_seq = modalParam.order_seq;
    //工单变更--表单信息
    $scope.info = {
        workorder_change_info: {
            order_seq: _order_seq, //工单编号
            workorder_title: '',         //工单标题
            flow_type: '',         //变更类型
            close_type: '',         //关闭原因
            restart_type: '',         //重启原因
            deal_bk_expl: ''          //情况说明
        },
        form: {}, //表单对象
    };
    //页面控制
    $scope.control = {
        save_change_btn_loading: false, // 保存变更信息loading
    };
    //页面数据
    $scope.data = {
        change_reason: [], //变更原因--下拉菜单
    };
    var init = function () {
        //根据编号查询工单信息
        Workorder.getWorkorder(_order_seq).then(function (data) {
            $timeout(function () {
                if (data.woorderbean) {
                    $scope.info.workorder_change_info.workorder_title = data.woorderbean.order_bk_title; //工单标题
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message, 3)
        });
    };
    //选择变更类型
    $scope.selectChangeType = function (flag) {
        $scope.info.workorder_change_info.flow_type = flag;
        // 5:关闭--6:重启
        if ($scope.info.workorder_change_info.flow_type == 5) {
            $scope.data.change_reason = WoCloseType;
        } else {
            $scope.data.change_reason = WoRestartType;
        }
    };
    //提交变更
    $scope.formSubmit = function () {
        if (!$scope.info.workorder_change_info.flow_type) {
            Modal.alert("请选择变更类型");
            return false;
        }
        //表单验证
        if (!CV.valiForm($scope.info.form.change_form)) {
            return false;
        }
        $scope.control.save_change_btn_loading = true;
        //提交变更--信息
        Workorder.changeWorkorder($scope.info.workorder_change_info).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.control.save_change_btn_loading = false;
                    $modalInstance.close(true);
                }
            }, 0);
        }, function (error) {
            $scope.control.save_change_btn_loading = false;
            Modal.alert(error.message, 3)
        });
    };
    //取消变更
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

//-----------------------调度---------------------

/**
 *自动运维-查看单个作业执行信息
 * */
modal_m.controller('viewSingleWorkCtrl', ["$scope", "$rootScope", "$modalInstance", "$interval", "$timeout", "modalParam", "AutoFlowOpType", "IML_TYPE", "dataBaseType", "CmptType", "CmptFunc", "Cmpt", "Flow", "CodeMirrorOption", "JobOpType", "pluginType", "ScrollBarConfig", "Modal", "CV", function ($scope, $rootScope, $modalInstance, $interval, $timeout, modalParam, AutoFlowOpType, IML_TYPE, dataBaseType, CmptType, CmptFunc, Cmpt, Flow, CodeMirrorOption, JobOpType, pluginType, ScrollBarConfig, Modal, CV) {
    var opinfo_monitor, pre_monitor;
    var flow_job_list = modalParam.flow_job_list ? modalParam.flow_job_list : [];
    var _task_id = modalParam.task_id ? modalParam.task_id : '';
    var _single_work = modalParam.job ? modalParam.job : {};
    var _annex_file = _single_work.sd_job_bean.annex_file ? _single_work.sd_job_bean.annex_file.substring(_single_work.sd_job_bean.annex_file.lastIndexOf('/') + 1) : '';
    var _file_type = _annex_file ? CmptFunc.judgeFileType(_annex_file.substring(_annex_file.lastIndexOf('.') + 1)) : '';
    var _job_index, _code_type = 1; //code_type 默认1 为shell语言 2 为python语言 3 为java语言 4 为SQL

    $rootScope.dispatch_task_status = $rootScope.dispatch_task_status ? $rootScope.dispatch_task_status : 0;//主控制器任务状态
    //任务状态
    $scope.task_status = modalParam.task_status ? modalParam.task_status : 0;
    //执行脚本-配置参数
    $scope.viewScriptEditor = CodeMirrorOption.Sh(true);
    //表达式-配置参数
    $scope.viewJavaCodeEditor = CodeMirrorOption.Java(true);
    //单个作业信息
    $scope.single_work = {
        pre_job_list: _single_work.sd_job_bean.pre_job_list ? _single_work.sd_job_bean.pre_job_list : [],
        job_status: _single_work.sd_job_bean.job_status ? _single_work.sd_job_bean.job_status : 0,
        job_type: _single_work.type ? _single_work.type : 0,
        job_cn_name: _single_work.sd_job_bean.sdwork_cn_name ? _single_work.sd_job_bean.sdwork_cn_name : '',
        job_id: _single_work.sd_job_bean.job_id ? _single_work.sd_job_bean.job_id : 0,
        input_params: _single_work.sd_job_bean.input ? _single_work.sd_job_bean.input : [],
        output_params: _single_work.sd_job_bean.output ? _single_work.sd_job_bean.output : [],
        error_handle: _single_work.sd_job_bean.error_handle ? _single_work.sd_job_bean.error_handle : 1,
        over_type: _single_work.sd_job_bean.over_type ? _single_work.sd_job_bean.over_type : 1,
        env_name: _single_work.sd_job_bean.env_name ? _single_work.sd_job_bean.env_name : '',
        plugin_list: _single_work.sd_job_bean.plugin_list ? _single_work.sd_job_bean.plugin_list : [],
        annex_file: _single_work.sd_job_bean.annex_file ? _single_work.sd_job_bean.annex_file : '',
        job_err_msg: ''
    };
    //表单控制
    $scope.controls = {
        basic_loading: false, basic_err_msg: '', operate_err_msg: '',
        codemirror_refresh: false, is_detail: modalParam.is_detail,
        task_finish: false, complete_job: false, job_error: false,
        polling_end: false, op_type: 1, tem_op_list: []
    };
    //C/C++附件
    $scope.accessory_fileupload = {
        suffixs: '',
        filetype: _file_type,
        filename: _annex_file,
        uploadpath: ""
    };
    $scope.config = {
        scroll_config: ScrollBarConfig.Y()
    };

    //配置代码高亮
    var configCodeOptions = function (impl_type) {
        //配置代码-类型
        _code_type = (impl_type < 6) ? 1 :
            (impl_type == 6) ? 4 :
                (impl_type == 7 || impl_type == 8) ? 2 :
                    (impl_type == 14) ? 3 : 1;
        //数据库
        if ($scope.single_work.job_type == 14 || $scope.single_work.job_type == 15) _code_type = 4;

        //执行脚本输入框配置参数
        $scope.viewScriptEditor = (_code_type == 4) ? CodeMirrorOption.Sql(true) :
            (_code_type == 3) ? CodeMirrorOption.Java(true) :
                (_code_type == 2) ? CodeMirrorOption.Python(true) :
                    CodeMirrorOption.Sh(true);
    };
    //获取作业索引
    var getJobIndex = function () {
        var job_index;
        for (var i = 0; i < flow_job_list.length; i++) {
            var _job = flow_job_list[i];
            if (_job.type == 3) continue;
            if (_single_work.sd_job_bean.job_id === _job.sd_job_bean.job_id) {
                job_index = i;
                break;
            }
        }
        return job_index
    };
    //刷新前置作业执行状态
    var updatePreWorkStatus = function () {
        for (var i = 0; i < flow_job_list.length; i++) {
            var _job = flow_job_list[i];
            if (_job.type == 3) continue;
            for (var k = 0; k < $scope.single_work.pre_job_list.length; k++) {
                var _pre_job = $scope.single_work.pre_job_list[k];
                if (_pre_job.job_id == _job.sd_job_bean.job_id) {
                    _pre_job.job_status = _job.sd_job_bean.job_status ? _job.sd_job_bean.job_status : 1;//待执行
                    _pre_job.job_type = _job.sd_job_bean.job_type ? _job.sd_job_bean.job_type : 0;
                    _pre_job.job_cn_name = _job.sd_job_bean.sdwork_cn_name ? _job.sd_job_bean.sdwork_cn_name : '';
                    if (!_job.sd_job_bean.sdwork_cn_name && _job.type == 1) _pre_job.job_cn_name = '开始';
                }
                if (_pre_job.job_status >= 3) {
                    $interval.cancel(pre_monitor);
                }
            }
        }
    };
    //关闭模态框
    var closeModal = function (meddle_info) {
        if (pre_monitor) $interval.cancel(pre_monitor);
        if (opinfo_monitor) $interval.cancel(opinfo_monitor);
        $modalInstance.close(meddle_info);
    };
    //左侧高度
    var jobLeftHeight = function () {
        $timeout(function () {
            var _left_ele = $('.col-left');
            var _right_height = $('.col-right').height();
            var _job_err_ele = $('.job_errmsg');
            _left_ele.height(_right_height);
            $scope.single_work.job_err_msg && _job_err_ele.css({ 'max-height': _right_height - 120 + 'px' });
        }, 200);
    };
    //获取基本信息
    var getBasicInfo = function () {
        $scope.controls.basic_err_msg = '';
        Flow.viewSingleJobInfo(_task_id, $scope.single_work.job_id).then(function (data) {
            $timeout(function () {
                if (data.job_info) {
                    jobLeftHeight();

                    //监控前置作业执行状态
                    if ($scope.single_work.pre_job_list.length !== 0) {
                        updatePreWorkStatus();
                        pre_monitor = $interval(function () {
                            updatePreWorkStatus();
                        }, 1000);
                    }

                    $scope.single_work.input_params = data.job_info.input_list ? data.job_info.input_list : [];
                    $scope.single_work.output_params = data.job_info.output_list ? data.job_info.output_list : [];

                    if ($scope.single_work.job_type <= 2) {
                        $scope.single_work.datetime_condition = data.job_info.datetime_condition ? data.job_info.datetime_condition.substring(data.job_info.datetime_condition.lastIndexOf('.'), -1) : '';
                        //数据未返回-情况下的处理
                        if (!$scope.single_work.datetime_condition) {
                            $scope.single_work.datetime_condition = _single_work.sd_job_bean.datetime_condition ? _single_work.sd_job_bean.datetime_condition.substring(_single_work.sd_job_bean.datetime_condition.lastIndexOf('.'), -1) : '';
                        }
                    } else {
                        //(1组件 2自定义)
                        $scope.single_work.job_method = data.job_info.job_method ? data.job_info.job_method : 0;
                        $scope.single_work.job_bk_desc = data.job_info.job_desp;
                        $scope.single_work.timeout = data.job_info.timeout;
                        //轮询作业
                        $scope.single_work.polling_max_times = data.job_info.polling_max_times ? data.job_info.polling_max_times : _single_work.sd_job_bean.polling_max_times;
                        $scope.single_work.polling_interval = data.job_info.polling_interval ? data.job_info.polling_interval : _single_work.sd_job_bean.polling_interval;

                        if ($scope.single_work.job_status == 3 || $scope.single_work.job_status == 5) {
                            $scope.single_work.input_params = data.job_info.input_list ? data.job_info.input_list : [];
                            $scope.single_work.output_params = data.job_info.output_list ? data.job_info.output_list : [];
                        }
                        //条件作业表达式
                        $scope.single_work.expr = _single_work.sd_job_bean.expr ? _single_work.sd_job_bean.expr : '';
                        //组件
                        if (data.job_info.component_info) {
                            $scope.single_work.exe_cn_type = data.job_info.component_info.impl_type ? CV.findValue(data.job_info.component_info.impl_type, IML_TYPE) : '';
                            $scope.single_work.script_list = data.job_info.component_info.script_list ? data.job_info.component_info.script_list : [];
                            $scope.single_work.script_source = data.job_info.component_info.component_source ? data.job_info.component_info.component_source : 1;
                            $scope.single_work.comp_cn_name = data.job_info.component_info.cn_name;
                            $scope.single_work.cmpt_cn_type = '';
                            configCodeOptions(data.job_info.component_info.impl_type);

                            //组件类型转换
                            if (data.job_info.component_info.component_purposes && data.job_info.component_info.component_purposes.length != 0) {
                                angular.forEach(data.job_info.component_info.component_purposes, function (data) {
                                    $scope.single_work.cmpt_cn_type += '  ' + CV.findValue(data, CmptType);
                                })
                            }
                            //执行脚本转换
                            angular.forEach($scope.single_work.script_list, function (data) {
                                data.exe_script = data.cmds ? CmptFunc.cmdsToString(data.cmds) : '';
                            });
                        }
                        //自定义
                        if (data.job_info.sdDefineCompBean) {
                            $scope.single_work.dataBase_type_cn = data.job_info.sdDefineCompBean.dataBase_type ? CV.findValue(data.job_info.sdDefineCompBean.dataBase_type, dataBaseType) : '';
                            $scope.single_work.service_name = data.job_info.sdDefineCompBean.service_name;
                            $scope.single_work.script_source = data.job_info.sdDefineCompBean.script_source;
                            $scope.single_work.exe_script = data.job_info.sdDefineCompBean.exec_script;
                            $scope.single_work.file_name = data.job_info.sdDefineCompBean.script_file_name;
                            $scope.single_work.script_cn_type = data.job_info.sdDefineCompBean.comp_impl_type ? CV.findValue(data.job_info.sdDefineCompBean.comp_impl_type, IML_TYPE) : '';
                            configCodeOptions(data.job_info.sdDefineCompBean.comp_impl_type);
                        }
                        //作业参数表
                        $scope.single_work.job_param_list = data.job_info.source_list ? data.job_info.source_list : [];
                        //未执行的作业参数
                        if ($scope.single_work.input_params.length === 0) {
                            $scope.single_work.input_params = _single_work.sd_job_bean.input ? _single_work.sd_job_bean.input : [];
                        }
                        if ($scope.single_work.output_params.length === 0) {
                            $scope.single_work.output_params = _single_work.sd_job_bean.output ? _single_work.sd_job_bean.output : [];
                        }
                    }
                }

                $scope.controls.basic_loading = false;
            }, 0)
        }, function (error) {
            $scope.controls.basic_loading = false;
            $scope.controls.basic_err_msg = error.message;
        });
    };
    //获取操作信息
    var getOperateInfo = function () {
        Flow.viewSingleJobOpInfo(_task_id, $scope.single_work.job_id).then(function (data) {
            $timeout(function () {
                $scope.controls.operate_err_msg = '';
                if (data.job_operate_info) {
                    $scope.single_work.job_status = data.job_operate_info.job_status ? data.job_operate_info.job_status : _single_work.sd_job_bean.job_status;
                    $scope.single_work.job_err_msg = data.job_operate_info.job_err_msg ? data.job_operate_info.job_err_msg : '';
                    if ($scope.controls.op_type == 1) {
                        var _operate_list = data.job_operate_info.job_operate_list ? data.job_operate_info.job_operate_list.sort(function (a, b) { return Date.parse(b.operate_time) - Date.parse(a.operate_time) }) : [];
                        //初始化弹出框显示状态
                        for (var i = 0, len = _operate_list.length; i < len; i++) {
                            var _opetate = _operate_list[i];
                            _opetate.source_list = _opetate.source_list ? _opetate.source_list : [];
                            for (var j = 0, soc_len = _opetate.source_list.length; j < soc_len; j++) {
                                var _soc = _opetate.source_list[j];
                                for (var k = 0, tem_len = $scope.controls.tem_op_list.length; k < tem_len; k++) {
                                    var _tem_op = $scope.controls.tem_op_list[k];
                                    if (_tem_op.operate_time === _opetate.operate_time) {
                                        if (_soc.exe_ip === _tem_op.exe_ip) {
                                            _soc.show_popover = _tem_op.show_popover;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        //操作信息列表
                        $scope.single_work.operate_list = _operate_list;
                        //操作类型转中文
                        angular.forEach($scope.single_work.operate_list, function (item, index, array) {
                            if (item.sdmeddle_type > 5 && item.sdmeddle_type < 9) {
                                item.operate_type = 1;  //执行
                            } else if (item.sdmeddle_type == 16) {
                                item.operate_type = 2;  //完成
                            } else if (item.sdmeddle_type == 9) {
                                item.operate_type = 3;  //跳过
                            } else if (item.sdmeddle_type == 11 || item.sdmeddle_type == 12) {
                                item.operate_type = 4;  //重试
                            } else if (item.sdmeddle_type == 5) {
                                item.operate_type = 5;  //中止
                            } else {
                                item.operate_type = 0;  //默认
                            }
                            if (item.operate_type) item.operate_cn_type = CV.findValue(item.operate_type, JobOpType);
                        });
                    } else {
                        if ($scope.single_work.job_status == 3) {
                            getBasicInfo();
                            if (opinfo_monitor) $interval.cancel(opinfo_monitor);
                        }
                    }
                    //轮询作业处理
                    $scope.controls.polling_end = ($scope.single_work.job_type == 6 && $scope.single_work.job_status == 4);
                    //作业出错
                    if ($scope.single_work.job_status == 4 || $scope.single_work.job_status == 7) {
                        $scope.controls.job_error = true;
                    }
                    //完成作业处理
                    if ($scope.single_work.job_type != 4 && ($scope.single_work.job_status == 4 || $scope.single_work.job_status == 5 || $scope.single_work.job_status == 7)) {
                        $scope.controls.complete_job = true;
                    }
                    jobLeftHeight();
                } else {
                    $scope.single_work.operate_list = [];
                }
            }, 0)
        }, function (error) {
            $scope.controls.operate_err_msg = error.message;
            $scope.single_work.operate_list = [];
        });
    };
    //监控操作信息
    var monitorOperateInfo = function () {
        getOperateInfo();
        opinfo_monitor = $interval(function () {
            getOperateInfo();
        }, 2000)
    };
    //记录弹出框显示状态
    var savePopoverShowStatus = function (node, operate) {
        var _is_exist, tem_index = 0;
        for (var i = 0, len = $scope.controls.tem_op_list.length; i < len; i++) {
            var _tem_op = $scope.controls.tem_op_list[i];
            if (_tem_op.exe_ip === node.exe_ip && _tem_op.operate_time === operate.operate_time) {
                _is_exist = true;
                tem_index = i;
                break;
            }
        }
        if (!_is_exist) {
            $scope.controls.tem_op_list.push({
                'operate_time': operate.operate_time,
                'exe_ip': node.exe_ip,
                'show_popover': node.show_popover
            })
        } else {
            $scope.controls.tem_op_list[tem_index].show_popover = node.show_popover;
        }
        //清空其他的
        if (node.show_popover) {
            for (var j = 0, tem_len = $scope.controls.tem_op_list.length; j < tem_len; j++) {
                var _tem_oplist = $scope.controls.tem_op_list[j];
                if (_tem_oplist.exe_ip === node.exe_ip && _tem_oplist.operate_time === operate.operate_time) {
                    console.log('当前选中')
                } else {
                    _tem_oplist.show_popover = false;
                }
            }
        }
    };
    //清除弹出框显示状态
    var clearPopoverShowStatus = function () {
        angular.forEach($scope.controls.tem_op_list, function (data, index, array) {
            data.show_popover = false;
        })
    };
    var init = function () {
        //监控操作信息
        monitorOperateInfo();
        jobLeftHeight();
        _job_index = getJobIndex();
        getBasicInfo();
        //出错跳过-没跳过不可点击按钮
        if ($scope.single_work.error_handle == 2 && ($scope.single_work.job_status == 4 || $scope.single_work.job_status == 7)) {
            $scope.controls.task_finish = true;
        }
        if ($scope.task_status == 4 || $scope.task_status == 5) {
            $scope.controls.task_finish = true;
            if (pre_monitor) $interval.cancel(pre_monitor);
            if (opinfo_monitor) $interval.cancel(opinfo_monitor);
        }

        $scope.controls.job_error = ($scope.single_work.job_status == 4 || $scope.single_work.job_status == 7)
        $scope.controls.complete_job = ($scope.single_work.job_status == 4 || $scope.single_work.job_status == 5 || $scope.single_work.job_status == 7) && $scope.single_work.job_type != 4;
    };

    //切换tab(flag 1操作明细 2基本信息)
    $scope.changeTab = function (flag) {
        if ($scope.controls.op_type === flag) return;
        $scope.controls.op_type = flag;
        if (flag === 1) {
            if (pre_monitor) $interval.cancel(pre_monitor);
            // || $scope.single_work.job_status == 1
            if ($scope.task_status == 4 || $scope.task_status == 5) {
                if (opinfo_monitor) $interval.cancel(opinfo_monitor);
            }
        } else {
            getBasicInfo();
        }
        $scope.controls.tem_op_list = [];
        jobLeftHeight();
    };
    //单个作业背景图
    $scope.singleWorkIcon = function (op_type, is_prejob) {
        var _bg_url = '', _bg_size = '/60px';
        switch (op_type) {
            case 1: _bg_url = 'url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url = 'url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url = 'url(img/dispatch/fl/context/condition.png)'; break;
            case 5: _bg_url = 'url(img/dispatch/fl/context/stop.png)'; break;
            case 6: _bg_url = 'url(img/dispatch/fl/context/rep.png)'; break;
            case 7: _bg_url = 'url(img/dispatch/fl/context/ftpU.png)'; break;
            case 8: _bg_url = 'url(img/dispatch/fl/context/ftpD.png)'; break;
            case 9: _bg_url = 'url(img/dispatch/fl/context/sftpU.png)'; break;
            case 10: _bg_url = 'url(img/dispatch/fl/context/sftpD.png)'; break;
            case 11: _bg_url = 'url(img/dispatch/fl/context/zngtU.png)'; break;
            case 12: _bg_url = 'url(img/dispatch/fl/context/zngtD.png)'; break;
            case 13: _bg_url = 'url(img/dispatch/fl/context/copy.png)'; break;
            case 14: _bg_url = 'url(img/dispatch/fl/context/sql.png)'; break;
            case 15: _bg_url = 'url(img/dispatch/fl/context/sqlS.png)'; break;
            case 16: _bg_url = 'url(img/dispatch/fl/context/web.png)'; break;
            case 17: _bg_url = 'url(img/dispatch/fl/context/sysSt.png)'; break;
            case 18: _bg_url = 'url(img/dispatch/fl/context/sysE.png)'; break;
            case 19: _bg_url = 'url(img/dispatch/fl/context/python.png)'; break;
            case 20: _bg_url = 'url(img/dispatch/fl/context/shell.png)'; break;
            case 21: _bg_url = 'url(img/dispatch/fl/context/bat.png)'; break;
            case 22: _bg_url = 'url(img/dispatch/fl/context/rb.png)'; break;
            case 23: _bg_url = 'url(img/dispatch/fl/context/perl.png)'; break;
            case 24: _bg_url = 'url(img/dispatch/fl/context/webs.png)'; break;
            case 25: _bg_url = 'url(img/dispatch/fl/context/tcp.png)'; break;
            case 26: _bg_url = 'url(img/dispatch/fl/context/http.png)'; break;
            case 27: _bg_url = 'url(img/dispatch/fl/context/tux.png)'; break;
            case 28: _bg_url = 'url(img/dispatch/fl/context/cl.png)'; break;
            case 29: _bg_url = 'url(img/dispatch/fl/context/rpg.png)'; break;
            case 30: _bg_url = 'url(img/dispatch/fl/context/java.png)'; break;
            case 31: _bg_url = 'url(img/dispatch/fl/context/c.png)'; break;
            case 32: _bg_url = 'url(img/dispatch/fl/context/c++.png)'; break;
            default: _bg_url = 'url(img/dispatch/fl/context/ftpU.png)'; break;
        }
        if (is_prejob) _bg_size = '/90%';
        return { "background": _bg_url + 'no-repeat center' + _bg_size };
    };
    //操作信息背景色
    $scope.operateBgColor = function (flag, op_type) {
        var _color = '';
        //1 执行 2完成 3跳过 4重试
        switch (op_type) {
            case 1: _color = '#1295da'; break;
            case 2: _color = '#9cb85f'; break;
            case 3: _color = '#999'; break;
            case 4: _color = '#ed6f67'; break;
            default: _color = '#fff'; break;
        }
        return flag === 1 ? { 'background-color': _color } : { 'color': _color };
    };
    //单个节点边框样式
    $scope.singleNodeBorder = function (node) {
        var _obj = {
            'cursor': 'default',
            'border': '1px solid transparent'
        };
        if (node.run_state == 4 || node.run_state == 7) {
            _obj.cursor = 'pointer';
        }
        if (node.show_popover) {
            _obj.border = '1px solid #4A90E2';
        }
        return _obj;
    };
    //查看节点执行错误信息
    $scope.viewNodeErrMsg = function (parent_index, index) {
        var _operate = $scope.single_work.operate_list[parent_index];
        if (!_operate.source_list) return;
        var node = _operate.source_list[index];
        node.show_popover = !node.show_popover;
        var _popover_ele = $('.popover-modal-' + parent_index + '-' + index);
        if (node.show_popover) {
            //置空状态-隐藏其他弹窗
            for (var i = 0; i < $scope.single_work.operate_list.length; i++) {
                var _operate_list = $scope.single_work.operate_list[i];
                _operate_list.source_list = _operate_list.source_list ? _operate_list.source_list : [];
                var soc_len = _operate_list.source_list.length;
                if (soc_len === 0) continue;
                for (var j = 0; j < soc_len; j++) {
                    var _soc = _operate_list.source_list[j];
                    if (parent_index === i && index === j) {
                        console.log(111)
                    } else {
                        _soc.show_popover = false;
                        $('.popover-modal-' + i + '-' + j).css({ 'display': 'none' });
                    }
                }
            }
            _popover_ele.fadeIn();                  //弹出框显示
            savePopoverShowStatus(node, _operate);  //保存弹出框显示状态
        } else {
            _popover_ele.fadeOut();
            //清除弹出框显示状态
            clearPopoverShowStatus();
        }
    };
    //弹出框位置
    $scope.popoverPosition = function (node, parent_index, index) {
        if (!node.show_popover) return;
        var _popover_ele = $('.popover-modal-' + parent_index + '-' + index);
        //第三列
        if (((index + 1) - 3) % 4 === 0) {
            _popover_ele.css({ 'left': 'auto', 'right': 0 });
        }
        //第二列
        if (((index + 1) - 2) % 4 === 0) {
            _popover_ele.css({ 'width': '340px' });
        }
    };
    //阻止事件传递
    $scope.stopPropagation = function (e) {
        e.stopPropagation();
    };
    //隐藏节点错误信息弹窗
    $scope.hidePopover = function (node, parent_index, index) {
        $timeout(function () {
            node.show_popover = false;
            //清除弹出框显示状态
            clearPopoverShowStatus();
            $('.popover-modal-' + parent_index + '-' + index).fadeOut();
        }, 800)
    };
    //切换执行脚本类型
    $scope.changeScript = function () {
        $scope.controls.codemirror_refresh = false;
        $timeout(function () {
            $scope.controls.codemirror_refresh = true;
        }, 100)
    };
    //插件类型转化中文名
    $scope.getPluginTypeCnName = function (plugin_type) {
        return CV.findValue(plugin_type, pluginType);
    };
    //下载C/C++附件
    $scope.downloadAccessoryFile = function () {
        CV.downloadFile($scope.single_work.annex_file);
    };

    $scope.formSubmit = function (meddle_type) {
        //处理完的任务不可继续
        if ($rootScope.dispatch_task_status == 4 || $rootScope.dispatch_task_status == 5) {
            Modal.alert("任务已处理完成");
            return false;
        } else if (($rootScope.dispatch_task_status >= 0 && $rootScope.dispatch_task_status <= 2) || $rootScope.dispatch_task_status == 6) {
            Modal.alert("任务处理中，请稍侯...");
            return false;
        }
        //干预类型meddle_type(1:重试，2：重做，3：跳过,4重试链，5:完成作业)
        var _meddle_info = { meddle_type: meddle_type, job_index: _job_index, job_id: $scope.single_work.job_id };
        if (meddle_type == 1) {
            Modal.confirm("确认重试 [" + $scope.single_work.job_cn_name + "] 作业 ?").then(function () {
                closeModal(_meddle_info);
            })
        } else if (meddle_type == 2) {
            Modal.confirm("确认重做 [" + $scope.single_work.job_cn_name + "] 作业 ?").then(function () {
                closeModal(_meddle_info);
            })
        } else if (meddle_type == 3) {
            Modal.confirm("确认跳过 [" + $scope.single_work.job_cn_name + "] 作业 ?").then(function () {
                closeModal(_meddle_info);
            })
        } else if (meddle_type == 4) {
            Modal.confirm("确认重试作业链 ?").then(function () {
                closeModal(_meddle_info);
            })
        } else {
            Modal.confirm("确认完成 [" + $scope.single_work.job_cn_name + "] 作业 ?").then(function () {
                //完成单个作业
                Modal.completeJob(_task_id, [$scope.single_work.job_id]).then(function (data) {
                    if (data) {
                        _meddle_info.meddle_reason = data;
                        closeModal(_meddle_info);
                    }
                })
            })
        }
    };
    $scope.formCancel = function () {
        if (pre_monitor) $interval.cancel(pre_monitor);
        if (opinfo_monitor) $interval.cancel(opinfo_monitor);
        $modalInstance.close();
    };
    init();

}]);

/**
 * 自动运维-单个作业跳过-添加输出参数
 * */
modal_m.controller('addSkipWorkParamsCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "AutoFlowOpType", "IML_TYPE", "CmptType", "CmptFunc", "Cmpt", "CodeMirrorOption", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, AutoFlowOpType, IML_TYPE, CmptType, CmptFunc, Cmpt, CodeMirrorOption, Modal, CV) {
    //表单
    $scope.form = {};
    //跳过作业输出参数
    $scope.job_output_list = modalParam.output_param ? modalParam.output_param : [];
    //公共-参数默认值输入框智能提示
    $scope.paramShellLoaded = function (_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };

    //提交表单
    $scope.formSubmit = function () {
        if (!CV.valiForm($scope.form.job_param_form)) {
            return false;
        }
        $modalInstance.close($scope.job_output_list);
    };
    //取消表单
    $scope.formCancel = function () {
        $modalInstance.close();
    };
}]);

/**
 * 自动任务执行-查看任务运行信息
 * */
modal_m.controller('viewTaskProgressInfoCtrl', ["$scope", "$modalInstance", "$timeout", "$interval", "DispatchTaskMonitor", "modalParam", "Modal", "CV", function ($scope, $modalInstance, $timeout, $interval, DispatchTaskMonitor, modalParam, Modal, CV) {
    var _interval;

    $scope.query_type = 0;
    $scope.data = {
        task_thread_list: [], job_thread_list: [], task_queue_list: [], job_queue_list: [],
    };

    //查看任务运行信息
    var viewRuningInfo = function (query_type) {
        DispatchTaskMonitor.runingInfo(query_type).then(function (data) {
            $timeout(function () {
                if (query_type === 1) {
                    $scope.data.task_thread_list = data.task_thread_list ? data.task_thread_list : [];
                } else if (query_type === 2) {
                    $scope.data.job_thread_list = data.job_thread_list ? data.job_thread_list : [];
                } else if (query_type === 3) {
                    $scope.data.task_queue_list = data.task_queue_list ? data.task_queue_list : [];
                } else {
                    $scope.data.job_queue_list = data.job_queue_list ? data.job_queue_list : [];
                }
            }, 0)
        }, function (error) {

        })
    };
    var init = function () {
        DispatchTaskMonitor.runingInfo(1).then(function (data) {
            $timeout(function () {
                $scope.data.task_thread_list = data.task_thread_list ? data.task_thread_list : [];
            }, 0)
        }, function (error) {

        });
        //监控进程信息
        _interval = $interval(function () {
            viewRuningInfo($scope.query_type)
        }, 2000);
    };

    //选择查询类型(query_type:1任务线程 2作业线程 3任务队列 4作业队列)
    $scope.selectType = function (query_type) {
        if ($scope.query_type === query_type) return;
        $scope.query_type = query_type;
        viewRuningInfo($scope.query_type);
    };
    //干预任务(回收任务线程)
    $scope.meddleTask = function (task_id, meddle_type, task_thread_id) {
        Modal.confirm("确认回收任务线程 " + task_thread_id + " ?").then(function () {
            DispatchTaskMonitor.meddleTask(task_id, meddle_type).then(function (data) {

            }, function (error) {

            });
        })
    };
    //干预作业(回收作业线程)
    $scope.meddleJob = function (task_id, meddle_type, job_id, job_thread_id) {
        Modal.confirm("确认回收作业线程 " + job_thread_id + " ?").then(function () {
            DispatchTaskMonitor.meddleJob(task_id, meddle_type, [job_id]).then(function (data) {

            }, function (error) {

            });
        })
    };

    $scope.formCancel = function () {
        if (_interval) $interval.cancel(_interval);
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 * 调度任务执行-输入开始作业参数
 * */
modal_m.controller('inputStartJobParamsCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "AutoFlowOpType", "IML_TYPE", "CmptType", "CmptFunc", "Cmpt", "CodeMirrorOption", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, AutoFlowOpType, IML_TYPE, CmptType, CmptFunc, Cmpt, CodeMirrorOption, Modal, CV) {
    //表单
    $scope.form = {};
    //跳过作业输出参数
    $scope.input_param_list = modalParam.input_param ? modalParam.input_param : [];
    //公共-参数默认值输入框智能提示
    $scope.paramShellLoaded = function (_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };

    //提交表单
    $scope.formSubmit = function () {
        if (!CV.valiForm($scope.form.input_param_form)) {
            return false;
        }
        $modalInstance.close($scope.input_param_list);
    };
    //取消表单
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 * 调度任务执行-强制完成单个作业
 * */
modal_m.controller('completeJobCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Flow", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Flow, Modal, CV) {

    $scope.form = {};
    $scope.reason = { complete_reason: '' };

    //提交表单
    $scope.formSubmit = function () {
        if (!CV.valiForm($scope.form.reason_form)) {
            return false;
        };
        $modalInstance.close($scope.reason.complete_reason);
    };
    //取消表单
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 * 调度流程编辑-设置时间条件
 * */
modal_m.controller('configFlowTimeConditionCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Flow", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Flow, Modal, CV) {
    var _date_obj = modalParam.data ? modalParam.data : {};
    var _today = new Date();
    var _today_h = _today.getHours() < 10 ? '0' + _today.getHours() : _today.getHours();
    var _today_m = _today.getMinutes() < 10 ? '0' + _today.getMinutes() : _today.getMinutes();
    var _date = _date_obj.date_str ? new Date(_date_obj.date_str) < _today ? _today : new Date(_date_obj.date_str) : _today;

    $scope.form = {};
    $scope.datepicker = { opened: true };
    $scope.cus_date = {
        minDate: new Date(),
        date: _date,
        hh: _date_obj.h_condition ? _date_obj.h_condition : _today_h,
        mm: _date_obj.m_condition ? _date_obj.m_condition : _today_m
    };

    $scope.formSubmit = function () {
        if (!CV.valiForm($scope.form.setTime)) {
            return false;
        }
        if ($scope.cus_date.hh > 23) {
            Modal.alert("小时输入有误，请重新输入");
            return false;
        }
        if ($scope.cus_date.mm > 59) {
            Modal.alert("分钟输入有误，请重新输入");
            return false;
        }
        $scope.cus_date.hh = $scope.cus_date.hh.length < 2 ? '0' + $scope.cus_date.hh : $scope.cus_date.hh;
        $scope.cus_date.mm = $scope.cus_date.hh.length < 2 ? '0' + $scope.cus_date.mm : $scope.cus_date.mm;
        $modalInstance.close($scope.cus_date);
    };
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 * 调度流程编辑-设置作业方式（组件，自定义）
 * */
modal_m.controller('configFlowJobMethodCtrl', ["$scope", "$modalInstance", "$timeout", "Cmpt", "Plugin", "IML_TYPE", "CmptType", "modalParam", "CodeMirrorOption", "BusiSys", "dataBaseType", "CmptFunc", "envManage", "LanguageName", "pluginExeEnv", "pluginType", "operateSysBit", "RequestMethod", "Modal", "CV", function ($scope, $modalInstance, $timeout, Cmpt, Plugin, IML_TYPE, CmptType, modalParam, CodeMirrorOption, BusiSys, dataBaseType, CmptFunc, envManage, LanguageName, pluginExeEnv, pluginType, operateSysBit, RequestMethod, Modal, CV) {
    var _old_exe_script = [], code_editor;
    var _job_method = modalParam.job_data.job_method ? modalParam.job_data.job_method : 1;
    _job_method = modalParam.job_type > 23 && modalParam.job_type < 28 ? 2 : _job_method;
    console.log(_job_method, 'job_method');
    console.log(modalParam.job_type, 'job_type');
    var _cmpt_id = modalParam.job_data.comp_id ? modalParam.job_data.comp_id : '';
    var _annex_file = modalParam.job_data.annex_file ? modalParam.job_data.annex_file.substring(modalParam.job_data.annex_file.lastIndexOf('/') + 1) : '';
    var _file_type = _annex_file ? CmptFunc.judgeFileType(_annex_file.substring(_annex_file.lastIndexOf('.') + 1)) : '';
    var _code_type = 1; //code_type 默认1 为shell语言 2 为python语言 3 为java语言 4 为SQL
    $scope.is_detail = !!modalParam.is_detail;
    $scope.is_special_element = !!modalParam.is_special_element; //场景元素/私有元素不可切换类型
    console.log('查看：', $scope.is_detail, '特殊：', $scope.is_special_element);

    $scope.form = {};
    $scope.form_control = {
        job_method: _job_method,
        is_service: false,
        is_database: false,
        refresh_script: true
    };
    $scope.cmpt_control = {};
    //C/C++附件
    $scope.accessory_fileupload = {
        suffixs: '',
        filetype: _file_type,
        filename: _annex_file,
        uploadpath: ""
    };
    //组件信息
    $scope.cmpt_info = {
        cmpt_list: [],                    //组件列表
        cmpt_list_loading: false,          //加载列表信息
        script_loading: false,          //获取脚本加载
        script_list: [],                  //组件脚本列表
        get_script_err: '',                 //获取脚本异常
        checked: -1,                      //组件选中索引
    };
    //作业类型
    $scope.job_type = modalParam.job_type;
    //自定义基础数据
    $scope.basic_data = {
        plugin_list: [],
        plugin_hint_list: [],
        env_list: [],
        sys_list: [],
        iml_type_list: IML_TYPE,
        sql_type_list: [],
        dataBase_type_list: dataBaseType,
        request_method_list: RequestMethod,
    };

    //自定义数据
    $scope.sava_data = {};
    //组件数据
    $scope.cmpt_data = {};
    //查看脚本编辑器
    $scope.viewOptions = CodeMirrorOption.Sh(true);
    //公共-参数默认值输入框智能提示
    $scope.paramShellLoaded = function (_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };

    //初始作业信息
    var initJobInfo = function (info) {
        info = info || {};
        var _job_info = {
            comp_id: info.comp_id ? info.comp_id : '',
            comp_cn_name: info.comp_cn_name ? info.comp_cn_name : '',
            impl_type: info.comp_impl_type ? info.comp_impl_type : '',    //脚本类型（实现类型）
            script_source: info.script_source ? info.script_source : 1,       //脚本来源 1 输入，2文件
            script_file_name: info.script_file_name ? info.script_file_name : '', //脚本来源为2 脚本文件名
            exec_script: info.exec_script ? info.exec_script : '',           //执行脚本
            param_list: info.input ? info.input : [],                       //输入参数
            output: info.output ? info.output : [],                     //输出参数
            dataBase_type: info.dataBase_type ? info.dataBase_type : '',       //数据库类型
            sql_source: info.sql_source ? info.sql_source : 1,             //数据库来源来源 1 输入，2文件
            service_name: info.service_name ? info.service_name : '',          //服务名称
            service_ip: info.service_ip ? info.service_ip : '',              //服务器ip
            service_url: info.service_url ? info.service_url : '',            //服务器URL
            service_port: info.service_port ? info.service_port : '',          //服务端口
            service_comm_info: info.service_comm_info ? info.service_comm_info : {}, //服务调用公共数据
            env_name: info.env_name ? info.env_name : '',                  //环境名称(由以下四个组合而来)
            language_name: info.language_name ? info.language_name : '',        //语言名称
            language_version: info.language_version ? info.language_version : '',  //语言版本
            operating_system: info.operating_system ? info.operating_system : '',  //操作系统
            bit_number: info.bit_number ? info.bit_number : '',              //操作位数
            annex_file: info.annex_file ? info.annex_file : '',              //c/c++附件
            plugin_list: info.plugin_list ? info.plugin_list : [],            //插件列表(shell/python/java/c,c++)
            command: info.command ? info.command : [],                   //执行命令
            request_method: info.request_method ? info.request_method : 1,        //服务作业请求方式
        };
        if (info.command && info.command.cmds) {
            _job_info.command.exec_script = CmptFunc.cmdsToString(info.command.cmds);
        }
        return _job_info;
    };
    //初始作业输出参数(服务/数据库)
    var initSrvOrDatabaseOutParam = function (is_init) {
        //服务
        if ($scope.job_type >= 24 && $scope.job_type <= 27) {
            $scope.form_control.is_service = true;
            if ($scope.form_control.job_method == 2) {
                if (is_init && modalParam.job_data.input.length != 0) {
                    $scope.sava_data.param_list = modalParam.job_data.input;
                    $scope.sava_data.output = modalParam.job_data.output;
                } else {
                    $scope.sava_data.param_list = [{ param_name: 'request', param_cn_name: '', param_source: 1, param_value: '' }];
                    $scope.sava_data.output = [{ param_name: 'response', param_cn_name: '' }];
                }
            }
        }
        //数据库
        if ($scope.job_type == 14 || $scope.job_type == 15) {
            $scope.form_control.is_database = true;
            if ($scope.form_control.job_method == 1) {
                $scope.cmpt_data.output = [{ param_name: 'sqlresult', param_cn_name: 'sql输出结果' }];
            } else {
                $scope.sava_data.output = [{ param_name: 'sqlresult', param_cn_name: 'sql输出结果' }];
            }
        }
    };
    //格式化组件信息
    var formatCmptInfo = function (cmpt_list) {
        var len = cmpt_list.length || 0;
        for (var i = 0; i < len; i++) {
            var _cmpt = cmpt_list[i];
            //组件名转换
            if (_cmpt.cn_name.substring(0, 2) == '/*') {
                _cmpt.cn_name = _cmpt.cn_name.substring(2, len - 2);
            }
            //执行类别转中文
            _cmpt.execute_type_cn = CV.findValue(_cmpt.impl_type, IML_TYPE);
            //组件类型转中文
            _cmpt.cmpt_type_cn = CV.findValue(_cmpt.module_purpose, CmptType);
        }
    };
    //寻找选择的组件索引
    var findCmptIndex = function (comp_id) {
        var index = -1;
        for (var i = 0; i < $scope.cmpt_info.cmpt_list.length; i++) {
            var _cmpt = $scope.cmpt_info.cmpt_list[i];
            if (_cmpt.id === comp_id) {
                index = i;
                break;
            }
        }
        return index;
    };
    //获取(C/C++)附件上传路径
    var getAccessoryUploadPath = function () {
        envManage.getUploadPath().then(function (data) {
            if (data) {
                $scope.accessory_fileupload.uploadpath = data.upload_path ? data.upload_path : '';
            }
        }, function (error) {
            // Modal.alert(error.message,3);
        });
    };
    //获取插件字符串列表（为了不刷到参数列表中）
    var getHidePluginList = function (list) {
        var arr = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].plugin_name) {
                arr.push(list[i].plugin_name)
            }
        }
        return arr;
    };
    //获取执行类别对应的可用插件列表
    var getPluginListByImplType = function (impl_type) {
        //获取对应实现类型的插件列表
        if (impl_type) {
            Plugin.getAllPluginList(impl_type).then(function (data) {
                if (data) {
                    $scope.basic_data.plugin_list = data.plugin_list ? data.plugin_list : [];
                }
            }, function (error) {
            });
        }
    };
    //获取调度组件
    var getCmpt = function () {
        $scope.cmpt_info.cmpt_list_loading = true;
        $scope.cmpt_info.error_message = '';
        Cmpt.getPublishedCmpt(1, 3).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.cmpt_info.cmpt_list_loading = false;
                    $scope.cmpt_info.cmpt_list = data.comp_list ? data.comp_list : [];
                    formatCmptInfo($scope.cmpt_info.cmpt_list);
                    $scope.cmpt_info.checked = findCmptIndex($scope.cmpt_data.comp_id);
                    if ($scope.cmpt_info.cmpt_list.length && $scope.cmpt_info.checked > -1) {
                        $scope.selectCmptGetScript($scope.cmpt_info.checked);
                        //滚动到可见区域
                        $timeout(function () {
                            if ($scope.cmpt_info.checked > 5) {
                                var _row = document.querySelectorAll('.scrollTbody > tr');
                                _row[$scope.cmpt_info.checked].scrollIntoView();
                            }
                        }, 0);
                    }
                }
            }, 0);
        }, function (error) {
            $scope.cmpt_info.error_message = error.message;
        });
    };
    //配置代码高亮
    var configCodeOptions = function (impl_type) {
        //配置代码-类型
        _code_type = (impl_type < 6) ? 1 :
            (impl_type == 6) ? 4 :
                (impl_type == 7 || impl_type == 8) ? 2 :
                    (impl_type == 14) ? 3 : 1;
        //数据库
        if ($scope.job_type == 14 || $scope.job_type == 15) _code_type = 4;

        //执行脚本输入框配置参数
        $scope.viewOptions = (_code_type == 4) ? CodeMirrorOption.Sql(true) :
            (_code_type == 3) ? CodeMirrorOption.Java(true) :
                (_code_type == 2) ? CodeMirrorOption.Python(true) :
                    CodeMirrorOption.Sh(true);
    };
    //获取语言环境列表
    var getLanguageEnv = function (info) {
        $scope.basic_data.env_list = [];
        //当实现类别java 14 python2 7 python3 8 时获取可选择的环境的列表
        if (info.impl_type == 14 || info.impl_type == 7 || info.impl_type == 8) {
            $scope.basic_data.env_list = ["1.5", "1.6", "1.7", "1.8"];
        }
        getPluginListByImplType(info.impl_type);
    };
    //转换环境信息
    var convertEnvInfo = function (info, env_name) {
        var _arr = env_name.split('-');
        info.language_name = CV.findKey(_arr[0], LanguageName);
        info.language_version = _arr[1];
        info.operating_system = CV.findKey(_arr[2], pluginExeEnv);
        info.bit_number = CV.findKey(_arr[3], operateSysBit);
    };

    var init = function () {
        if (_job_method == 1) {
            $scope.cmpt_data = initJobInfo(modalParam.job_data);
            if (!$scope.is_special_element && !$scope.is_detail) getCmpt();
            if (!$scope.is_detail) getLanguageEnv($scope.cmpt_data);
        } else {
            $scope.sava_data = initJobInfo(modalParam.job_data);
            configCodeOptions($scope.sava_data.impl_type);
            getLanguageEnv($scope.sava_data);
        }
        initSrvOrDatabaseOutParam(true); //初始-服务/数据库输出参数
        !$scope.is_detail && getAccessoryUploadPath();  //获取C/C++附件上传路径
    };

    //输入参数加载
    $scope.shellLoaded = function (_editor) {
        var current_blur_timeout;
        CodeMirrorOption.setEditor(_editor, _code_type);
        code_editor = _editor;
        _editor.on('blur', function () {
            current_blur_timeout = $timeout(function () {
                var _hide_plugin_list = getHidePluginList($scope.sava_data.plugin_list);
                var _cmpt_func = CmptFunc.getParamsByScript($scope.sava_data.exec_script ? $scope.sava_data.exec_script : "", _hide_plugin_list);
                //参数不变不刷新参数表
                if (_old_exe_script.length == _cmpt_func.list.length) {
                    $scope.sava_data.script_msg = _cmpt_func.msg;
                    if (_old_exe_script.length == 0) {
                        $scope.sava_data.param_list = [];
                        return false;
                    }
                    for (var k = 0; k < _cmpt_func.list.length; k++) {
                        var _param_is_equal = false;
                        for (var j = 0; j < _old_exe_script.length; j++) {
                            if (_cmpt_func.list[k].param_name == _old_exe_script[j].param_name && _cmpt_func.list[k].param_group == _old_exe_script[j].param_group) {
                                _param_is_equal = true;
                                break;
                            }
                        }
                        if (!_param_is_equal) {
                            CmptFunc.blurGetParams(_cmpt_func, $scope.sava_data, $scope.cmpt_control, _old_exe_script);
                            if ($scope.form_control.job_method == 1) {
                                $scope.cmpt_data.param_list = $scope.sava_data.param_list;
                            }
                        }
                    }
                } else {
                    CmptFunc.blurGetParams(_cmpt_func, $scope.sava_data, $scope.cmpt_control, _old_exe_script);
                    if ($scope.form_control.job_method == 1) {
                        $scope.cmpt_data.param_list = $scope.sava_data.param_list;
                    }
                }
            }, 500);
        });
    };
    //命令行参数脚本配置
    $scope.commandNoneShellLoaded = function (_editor) {
        var current_blur_timeout;
        CodeMirrorOption.setNoneParamsEditor(_editor, _code_type, $scope.sava_data.plugin_list);
        // code_editor = _editor;
        _editor.on('blur', function () {
            current_blur_timeout = $timeout(function () {
                var _hide_plugin_list = getHidePluginList($scope.sava_data.plugin_list);
                //可以提交组件信息
                $scope.sava_data.command.cmds = $scope.sava_data.command.exec_script ? $scope.sava_data.command.exec_script.split("\n") : [];
                var _total_script = $scope.sava_data.command.exec_script + "" + $scope.sava_data.exec_script;
                var _cmpt_func = CmptFunc.getParamsByScript(_total_script ? _total_script : "", _hide_plugin_list);

                //参数不变不刷新参数表
                if (_old_exe_script.length == _cmpt_func.list.length) {
                    $scope.sava_data.script_msg = _cmpt_func.msg;
                    if (_old_exe_script.length == 0) {
                        $scope.sava_data.param_list = [];
                        return false;
                    }
                    for (var k = 0; k < _cmpt_func.list.length; k++) {
                        var _param_is_equal = false;
                        for (var j = 0; j < _old_exe_script.length; j++) {
                            if (_cmpt_func.list[k].param_name == _old_exe_script[j].param_name && _cmpt_func.list[k].param_group == _old_exe_script[j].param_group) {
                                _param_is_equal = true;
                                break;
                            }
                        }
                        if (!_param_is_equal) {
                            CmptFunc.blurGetParams(_cmpt_func, $scope.sava_data, $scope.cmpt_control, _old_exe_script);
                            if ($scope.form_control.job_method == 1) {
                                $scope.cmpt_data.param_list = $scope.sava_data.param_list;
                            }
                        }
                    }
                } else {
                    CmptFunc.blurGetParams(_cmpt_func, $scope.sava_data, $scope.cmpt_control, _old_exe_script);
                    if ($scope.form_control.job_method == 1) {
                        $scope.cmpt_data.param_list = $scope.sava_data.param_list;
                    }
                }
            }, 500);
        });
    };
    $scope.commandShellLoaded = function (_editor) {
        var current_blur_timeout;
        CodeMirrorOption.setUniqueParamsEditor(_editor, _code_type, $scope.sava_data.plugin_list);
        //code_editor = _editor;
        _editor.on('blur', function () {
            current_blur_timeout = $timeout(function () {
                var _hide_plugin_list = getHidePluginList($scope.sava_data.plugin_list);
                //可以提交组件信息
                $scope.sava_data.command.cmds = $scope.sava_data.command.exec_script ? $scope.sava_data.command.exec_script.split("\n") : [];
                var _total_script = $scope.sava_data.command.exec_script + "" + $scope.sava_data.exec_script;
                var _cmpt_func = CmptFunc.getParamsByScript(_total_script ? _total_script : "", _hide_plugin_list);

                //参数不变不刷新参数表
                if (_old_exe_script.length == _cmpt_func.list.length) {
                    $scope.sava_data.script_msg = _cmpt_func.msg;
                    if (_old_exe_script.length == 0) {
                        $scope.sava_data.param_list = [];
                        return false;
                    }
                    for (var k = 0; k < _cmpt_func.list.length; k++) {
                        var _param_is_equal = false;
                        for (var j = 0; j < _old_exe_script.length; j++) {
                            if (_cmpt_func.list[k].param_name == _old_exe_script[j].param_name && _cmpt_func.list[k].param_group == _old_exe_script[j].param_group) {
                                _param_is_equal = true;
                                break;
                            }
                        }
                        if (!_param_is_equal) {
                            CmptFunc.blurGetParams(_cmpt_func, $scope.sava_data, $scope.cmpt_control, _old_exe_script);
                            if ($scope.form_control.job_method == 1) {
                                $scope.cmpt_data.param_list = $scope.sava_data.param_list;
                            }
                        }
                    }
                } else {
                    CmptFunc.blurGetParams(_cmpt_func, $scope.sava_data, $scope.cmpt_control, _old_exe_script);
                    if ($scope.form_control.job_method == 1) {
                        $scope.cmpt_data.param_list = $scope.sava_data.param_list;
                    }
                }
            }, 500);
        });
    };
    //添加输入参数
    $scope.addInputParam = function () {
        $scope.sava_data.param_list.push({
            param_name: '',
            param_cn_name: '',
            param_source: 1,
            param_value: ''
        });
    };
    //添加输出参数
    $scope.addOutputParam = function (flag) {
        if ($scope.sava_data.output.some(function (item) { return !item.param_name })) {
            Modal.alert('当前参数表输入不完整');
            return;
        }
        $scope.sava_data.output.push({
            param_name: '',
            param_cn_name: ''
        });
    };
    //flag:1输入 2：输出
    $scope.removeOutputParam = function (index, flag) {
        if (flag === 1) {
            $scope.sava_data.param_list.splice(index, 1);
        } else {
            $scope.sava_data.output.splice(index, 1);
        }
    };
    //切换作业方式
    $scope.changeJobType = function (flag) {
        if ($scope.form_control.job_method == flag) return;
        $scope.form_control.job_method = flag;
        if (flag === 1) {
            $scope.cmpt_data = _job_method == 1 ? initJobInfo(modalParam.job_data) : initJobInfo();
            getCmpt();
        } else {
            $scope.sava_data = _job_method == 2 ? initJobInfo(modalParam.job_data) : initJobInfo();
            configCodeOptions($scope.sava_data.impl_type);
            getLanguageEnv($scope.sava_data);
        }
        initSrvOrDatabaseOutParam();
    };
    //选择组件获取脚本信息
    $scope.selectCmptGetScript = function (index) {
        $scope.cmpt_info.checked = index;
        _cmpt_id = $scope.cmpt_info.cmpt_list[index].id || '';
        //根据组件id获取组件详细信息
        $scope.cmpt_info.script_loading = true;
        $scope.cmpt_info.get_script_err = '';
        Cmpt.viewModulegetModuleDetail(_cmpt_id).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.cmpt_info.script_loading = false;
                    $scope.cmpt_info.script_list = data.component.script_list ? data.component.script_list : [];
                    for (var j = 0; j < $scope.cmpt_info.script_list.length; j++) {
                        $scope.cmpt_info.script_list[j].exec_script = CmptFunc.cmdsToString($scope.cmpt_info.script_list[j].cmds);
                        $scope.cmpt_info.script_list[j].script_type_cn = $scope.cmpt_info.script_list[j].script_type == 'default' ? '缺省' : $scope.cmpt_info.script_list[j].script_type;
                    }
                    $scope.cmpt_data.comp_id = data.component.id;
                    $scope.cmpt_data.comp_cn_name = data.component.cn_name;
                    $scope.cmpt_data.exec_script = $scope.cmpt_info.script_list[0].exec_script;
                    $scope.cmpt_data.script_source = data.component.component_source ? data.component.component_source : 1;
                    $scope.cmpt_data.impl_type = data.component.impl_type ? data.component.impl_type : "";
                    $scope.cmpt_data.language_version = data.component.language_version ? data.component.language_version : "";
                    $scope.cmpt_data.output = data.component.out_param_list ? data.component.out_param_list : [];
                    $scope.cmpt_data.param_list = data.component.param_list ? data.component.param_list : [];
                    $scope.cmpt_data.plugin_list = data.component.plugin_list ? data.component.plugin_list : [];
                    $scope.cmpt_data.annex_file = data.component.annex_file ? data.component.annex_file : '';
                    for (var i = 0; i < $scope.cmpt_data.param_list.length; i++) $scope.cmpt_data.param_list[i].param_source = 1;
                    initSrvOrDatabaseOutParam();
                    configCodeOptions($scope.cmpt_data.impl_type);
                    getLanguageEnv($scope.cmpt_data);
                }
            }, 0)
        }, function (error) {
            $scope.cmpt_info.script_loading = false;
            $scope.cmpt_info.get_script_err = error.message;
        })
    };
    //选择环境名
    $scope.selectEnvName = function (env_name) {
        if ($scope.form_control.job_method == 1) {
            convertEnvInfo($scope.cmpt_data, env_name);
        } else {
            convertEnvInfo($scope.sava_data, env_name);
        }
    };
    //选择脚本类型
    $scope.selectScriptType = function (type) {
        $scope.form_control.job_method == 1 ? getLanguageEnv($scope.cmpt_data) : getLanguageEnv($scope.sava_data);
        ($scope.form_control.job_method == 2) && ($scope.sava_data.plugin_list = []);
        $scope.form_control.refresh_script = false;
        $timeout(function () {
            configCodeOptions(type);
            $scope.shellLoaded(code_editor);
            $scope.form_control.refresh_script = true;
        }, 100);
    };
    //插件类型转化中文名
    $scope.getPluginTypeCnName = function (plugin_type) {
        return CV.findValue(plugin_type, pluginType);
    };
    //添加可用的插件列表
    $scope.addAvailablePlugin = function (info) {
        if (info.plugin_list.length !== 0) {
            if (info.plugin_list.some(function (item) { return !item.plugin_name })) {
                Modal.alert("请选择插件名");
                return false;
            }
            //无可用插件
            if (info.plugin_list.length === $scope.basic_data.plugin_list.length) {
                Modal.alert("无可再添加的插件！");
                return false
            }
        }
        info.plugin_list.push({
            plugin_name: "",
            plugin_type: "",
            plugin_file_name: "",
            plugin_bk_desc: "",
        });
    };
    //删除也已经选择的插件
    $scope.deleteSinglePlugin = function (index, info) {
        var _plugin_name = info.plugin_list[index].plugin_name;
        if (_plugin_name) {
            Modal.confirm("确认是否要删除[ " + _plugin_name + " ]插件?").then(function () {
                info.plugin_list.splice(index, 1);
                $scope.basic_data.plugin_hint_list = CmptFunc.translatePluginHint(info.plugin_list);
                if (code_editor) {
                    CodeMirrorOption.setEditor(code_editor, _code_type, $scope.basic_data.plugin_hint_list);
                }
                /* $scope.cmpt_control.show_codemirror = false;
                 $timeout(function () {
                     $scope.cmpt_control.show_codemirror = true;
                 },20);*/
            })
        } else {
            info.plugin_list.splice(index, 1);
            $scope.basic_data.plugin_hint_list = CmptFunc.translatePluginHint(info.plugin_list);
            if (code_editor) {
                CodeMirrorOption.setEditor(code_editor, _code_type, $scope.basic_data.plugin_hint_list);
            }
            /*$scope.cmpt_control.show_codemirror = false;
            $timeout(function () {
                $scope.cmpt_control.show_codemirror = true;
            },20);*/
        }
    };
    //绑定选择的插件的基本信息及刷新codemirror提示信息
    $scope.bindPluginInfo = function (plugin_name, index, tr, info) {
        var _is_exist_count = 0;
        for (var j = 0; j < info.plugin_list.length; j++) {
            if (plugin_name === info.plugin_list[j].plugin_name) {
                _is_exist_count++;
            }
        }

        if (_is_exist_count > 1) {
            Modal.alert("插件已经添加！");
            info.plugin_list.splice(index, 1);
            return false;
        }


        for (var i = 0; i < $scope.basic_data.plugin_list.length; i++) {
            var _plugin = $scope.basic_data.plugin_list[i];
            if (plugin_name === _plugin.plugin_name) {
                tr.plugin_type = _plugin.plugin_type;
                tr.plugin_file_name = _plugin.plugin_file_name;
                tr.plugin_bk_desc = _plugin.plugin_bk_desc;
                break;
            }
        }
        $scope.basic_data.plugin_hint_list = CmptFunc.translatePluginHint(info.plugin_list);
        if (code_editor) {
            CodeMirrorOption.setEditor(code_editor, _code_type, $scope.basic_data.plugin_hint_list);
        }
        /* $scope.cmpt_control.show_codemirror = false;
         $timeout(function () {
             $scope.cmpt_control.show_codemirror = true;
         },20);*/
    };
    //附件上传成功
    $scope.ImportAccessorySuccessThen = function (info) {
        info.annex_file = $scope.accessory_fileupload.uploadpath + '/' + $scope.accessory_fileupload.filename;
        var _file_type = $scope.accessory_fileupload.filename.substring($scope.accessory_fileupload.filename.lastIndexOf('.') + 1);
        $scope.accessory_fileupload.filetype = CmptFunc.judgeFileType(_file_type);
    };
    //删除附件
    $scope.removeAccessoryFile = function (info) {
        $scope.accessory_fileupload.filename = '';
        $scope.accessory_fileupload.filetype = '';
        info.annex_file = '';
    };
    //下载附件
    $scope.downloadAccessoryFile = function (info) {
        CV.downloadFile(info.annex_file);
    };
    //提交
    $scope.formSubmit = function () {
        if ($scope.form_control.job_method === 1) {
            if ($scope.cmpt_info.checked === -1 && !$scope.is_special_element) {
                Modal.alert('请选择组件');
                return false;
            }
            if ($scope.cmpt_info.get_script_err) {
                Modal.alert('组件信息获取异常,请重新选择组件');
                return false;
            }
            $scope.cmpt_data.input = $scope.cmpt_data.param_list || [];
            $scope.cmpt_data.job_method = $scope.form_control.job_method;
            $modalInstance.close($scope.cmpt_data); //组件
        } else {
            console.log('submitBtn')
            //表单验证
            if (!CV.valiForm($scope.form.job_form)) {
                return false;
            }
            if ($scope.sava_data.command && $scope.sava_data.command.exec_script) {
                $scope.sava_data.command.cmds = $scope.sava_data.command.exec_script ? $scope.sava_data.command.exec_script.split("\n") : [];
            }
            $scope.sava_data.job_method = $scope.form_control.job_method;
            $modalInstance.close($scope.sava_data); //自定义
        }
    };
    //取消
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };

    init();
}]);

/**
 * 调度流程编辑-输入参数选择引用节点
 * */
modal_m.controller('configRefNodeCtrl', ["$scope", "$modalInstance", "$timeout", "Cmpt", "IML_TYPE", "CmptType", "modalParam", "CodeMirrorOption", "BusiSys", "dataBaseType", "CmptFunc", "Modal", "CV", function ($scope, $modalInstance, $timeout, Cmpt, IML_TYPE, CmptType, modalParam, CodeMirrorOption, BusiSys, dataBaseType, CmptFunc, Modal, CV) {
    var _select_list = modalParam.source_list ? modalParam.source_list : [];
    $scope.ref_node_list = modalParam.ref_node_list ? modalParam.ref_node_list : [];
    var init = function () {
        for (var i = 0; i < $scope.ref_node_list.length; i++) {
            var _ref = $scope.ref_node_list[i];
            _ref.checked = false;
            for (var j = 0; j < _select_list.length; j++) {
                var _select = _select_list[j];
                if ((_select.exe_ip === _ref.exe_ip) && (_select.exe_soc_name === _ref.exe_soc_name)) {
                    _ref.checked = true;
                }
            }
        }
    };

    //表单提交
    $scope.formSubmit = function () {
        var _selected_nodelist = [];
        for (var i = 0; i < $scope.ref_node_list.length; i++) {
            var _ref = $scope.ref_node_list[i];
            if (_ref.checked) {
                _selected_nodelist.push({
                    'exe_ip': _ref.exe_ip,
                    'exe_soc_name': _ref.exe_soc_name
                })
            }
        }
        $modalInstance.close(_selected_nodelist);
    };
    //取消表单
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };

    init();

}]);

/**
 * 调度流程编辑-添加场景
 * */
modal_m.controller('addSceneCtrl', ["$scope", "$modalInstance", "$timeout", "Scene", "modalParam", "ElementCategory", "Modal", "CV", function ($scope, $modalInstance, $timeout, Scene, modalParam, ElementCategory, Modal, CV) {
    $scope.form = {};
    $scope.btn_loading = false;

    $scope.scene_info = {
        scene_list: [],  //所有场景列表
        checked_scene_list: modalParam.scene_list ? modalParam.scene_list : [],
        scene_id_list: []
    };
    $scope.control = {
        scene_loading: true,
        error_message: '',
    };

    //元素分类转中文
    var categoryToCn = function (category) {
        return category ? CV.findValue(category, ElementCategory) : '--';
    };
    //查找选中的场景id
    var findCheckedSceneId = function () {
        var scene_id = [];
        angular.forEach($scope.scene_info.scene_list, function (item, index, array) {
            if (item.checked && !item.is_ref) {
                scene_id.push(item.scene_id)
            }
        });
        return scene_id;
    };

    //获取场景列表
    Scene.getSceneListByType({ key_word: '', data: { offset: 0 } }).then(function (data) {
        $timeout(function () {
            $scope.control.scene_loading = false;
            $scope.scene_info.scene_list = data.scene_list ? data.scene_list.filter(function (item) { return item.scene_type !== 3 }) : [];
            //选中
            for (var i = 0; i < $scope.scene_info.checked_scene_list.length; i++) {
                var _checked_scene = $scope.scene_info.checked_scene_list[i];
                for (var j = 0; j < $scope.scene_info.scene_list.length; j++) {
                    var _scene = $scope.scene_info.scene_list[j];
                    if (_checked_scene.scene_id === _scene.scene_id) {
                        _scene.checked = true;
                        _scene.is_ref = true;
                    }
                }
            }
        }, 0)
    }, function (error) {
        $scope.control.scene_loading = false;
        $scope.control.error_message = error.message;
    });

    $scope.formSubmit = function () {
        $scope.scene_info.scene_id_list = findCheckedSceneId();

        if ($scope.scene_info.scene_id_list.length === 0) {
            $modalInstance.close();
            return false;
        }

        //根据场景编号获取场景元素列表
        $scope.btn_loading = true;
        Scene.getMultipleSceneElementDetail($scope.scene_info.scene_id_list).then(function (data) {
            $timeout(function () {
                $scope.btn_loading = false;
                var _scene_list = data.scene_list ? data.scene_list : [];
                if (_scene_list.length === 0) {
                    Modal.alert('获取场景元素数据为空');
                    return false;
                }

                var _check_scene_list = [];
                for (var i = 0; i < _scene_list.length; i++) {
                    var _scene = _scene_list[i];
                    _scene.category_list = _scene.category_list ? _scene.category_list : [];
                    for (var j = 0; j < _scene.category_list.length; j++) {
                        var _category = _scene.category_list[j];
                        _category.element_list = _category.element_list ? _category.element_list : [];
                        _category.category_cn = _category.text ? _category.text : categoryToCn(_category.category);
                        for (var k = 0; k < _category.element_list.length; k++) {
                            var _ele = _category.element_list[k];
                            _ele.category = '7'; //添加到流程的分类默认为（普通作业）
                            _ele.sd_job_bean = _ele.element_info ? _ele.element_info : {};
                            _ele.sd_job_bean.is_special_element = true;
                            _ele.text = _ele.sd_job_bean.sdwork_cn_name ? _ele.sd_job_bean.sdwork_cn_name : _ele.text; //元素名称
                        }
                    }
                    _check_scene_list.push({
                        scene_id: _scene.scene_id ? _scene.scene_id : '',
                        scene_name: _scene.scene_name ? _scene.scene_name : '',
                        category_list: _scene.category_list
                    })
                }
                $modalInstance.close(_check_scene_list);
            }, 0)
        }, function (error) {
            $scope.btn_loading = false;
            Modal.alert(error.message, 3);
        });
    };
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 * 调度流程编辑-添加私有元素
 * */
modal_m.controller('addPrivateElementCtrl', ["$scope", "$modalInstance", "$timeout", "Cmpt", "IML_TYPE", "CmptType", "modalParam", "ElementCategory", "Scene", "FlowCategoryData", "CmptFunc", "dataBaseType", "JobErrorType", "ParamValueSource", "FlowJobType", "ScrollConfig", "Modal", "CV", function ($scope, $modalInstance, $timeout, Cmpt, IML_TYPE, CmptType, modalParam, ElementCategory, Scene, FlowCategoryData, CmptFunc, dataBaseType, JobErrorType, ParamValueSource, FlowJobType, ScrollConfig, Modal, CV) {
    var _flow_category_data = FlowCategoryData;
    var _single_element = modalParam.element ? angular.copy(modalParam.element) : {};

    $scope.btn_loading = false;
    $scope.form = {};
    $scope.single_element = {
        category: '7',                              //元素分类(私有元素暂为7：普通元素)
        type: _single_element.type,            //元素类型
        text: '',                              //元素类型中文
        element_info: _single_element.element_info  //元素属性信息
    };
    $scope.data = {
        execute_type_list: IML_TYPE,
        database_type_list: dataBaseType,
        error_handle_list: JobErrorType,
        param_source_list: ParamValueSource
    };
    $scope.config = {
        scroll_bar: ScrollConfig
    };


    //根据类型格式化分类和中文
    var typeToCategoryAndCn = function (ele_type) {
        if (!ele_type) return 0;
        var _category;
        for (var i = 0; i < _flow_category_data.length; i++) {
            var _category_data = _flow_category_data[i];
            for (var j = 0; j < _category_data.element_list.length; j++) {
                var _ele = _category_data.element_list[j];
                if (_ele.type === ele_type) {
                    _category = {
                        category: _category_data.category,
                        type_cn: _ele.text
                    };
                    break;
                }
            }
            if (_category) break;
        };
        return _category;
    };

    //元素图标
    $scope.elementIcon = function () {
        var _bg_url = '', _bg_size = '/50px';
        switch (_single_element.type) {
            case 1: _bg_url = 'url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url = 'url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url = 'url(img/dispatch/fl/context/condition.png)'; break;
            case 5: _bg_url = 'url(img/dispatch/fl/context/stop.png)'; break;
            case 6: _bg_url = 'url(img/dispatch/fl/context/rep.png)'; break;
            case 7: _bg_url = 'url(img/dispatch/fl/context/ftpU.png)'; break;
            case 8: _bg_url = 'url(img/dispatch/fl/context/ftpD.png)'; break;
            case 9: _bg_url = 'url(img/dispatch/fl/context/sftpU.png)'; break;
            case 10: _bg_url = 'url(img/dispatch/fl/context/sftpD.png)'; break;
            case 11: _bg_url = 'url(img/dispatch/fl/context/zngtU.png)'; break;
            case 12: _bg_url = 'url(img/dispatch/fl/context/zngtD.png)'; break;
            case 13: _bg_url = 'url(img/dispatch/fl/context/copy.png)'; break;
            case 14: _bg_url = 'url(img/dispatch/fl/context/sql.png)'; break;
            case 15: _bg_url = 'url(img/dispatch/fl/context/sqlS.png)'; break;
            case 16: _bg_url = 'url(img/dispatch/fl/context/web.png)'; break;
            case 17: _bg_url = 'url(img/dispatch/fl/context/sysSt.png)'; break;
            case 18: _bg_url = 'url(img/dispatch/fl/context/sysE.png)'; break;
            case 19: _bg_url = 'url(img/dispatch/fl/context/python.png)'; break;
            case 20: _bg_url = 'url(img/dispatch/fl/context/shell.png)'; break;
            case 21: _bg_url = 'url(img/dispatch/fl/context/bat.png)'; break;
            case 22: _bg_url = 'url(img/dispatch/fl/context/rb.png)'; break;
            case 23: _bg_url = 'url(img/dispatch/fl/context/perl.png)'; break;
            case 24: _bg_url = 'url(img/dispatch/fl/context/webs.png)'; break;
            case 25: _bg_url = 'url(img/dispatch/fl/context/tcp.png)'; break;
            case 26: _bg_url = 'url(img/dispatch/fl/context/http.png)'; break;
            case 27: _bg_url = 'url(img/dispatch/fl/context/tux.png)'; break;
            case 28: _bg_url = 'url(img/dispatch/fl/context/cl.png)'; break;
            case 29: _bg_url = 'url(img/dispatch/fl/context/rpg.png)'; break;
            case 30: _bg_url = 'url(img/dispatch/fl/context/java.png)'; break;
            case 31: _bg_url = 'url(img/dispatch/fl/context/c.png)'; break;
            case 32: _bg_url = 'url(img/dispatch/fl/context/c++.png)'; break;
            case 33: _bg_url='url(img/dispatch/fl/context/site.png)'; break;
            case 34: _bg_url='url(img/dispatch/fl/context/area.png)'; break;
            case 35: _bg_url='url(img/dispatch/fl/context/cell.png)'; break;
            case 36: _bg_url='url(img/dispatch/fl/context/unit.png)'; break;
            case 37: _bg_url='url(img/dispatch/fl/context/enterprise.png)'; break;
            default: _bg_url = 'url(img/dispatch/fl/context/ftpU.png)'; break;
        }
        return { "background": _bg_url + 'no-repeat center' + _bg_size };
    };
    //元素类型转换
    $scope.eleTypeTOCn = function () {
        return _single_element.type ? CV.findValue(_single_element.type, FlowJobType) : '--';
    };
    //选择出错处理方式
    $scope.selectErrorHandle = function (error_hadle) {
        if (error_hadle === 3) {
            $scope.single_element.element_info.retry_times = 3;
            $scope.single_element.element_info.retry_interval = 4;
        }
    };
    //设置作业方式
    $scope.setJobMethod = function () {
        Modal.setFlowJobMethod($scope.single_element.type, $scope.single_element.element_info).then(function (result) {
            $scope.single_element.element_info.job_method = result.job_method;
            if (result.job_method == 1) {
                $scope.single_element.element_info.comp_id = result.comp_id;
                $scope.single_element.element_info.comp_impl_type = result.impl_type;
                $scope.single_element.element_info.comp_cn_name = result.comp_cn_name;
                $scope.single_element.element_info.input = result.input || [];
                $scope.single_element.element_info.output = result.output || [];
                $scope.single_element.element_info.exec_script = result.exec_script;
                $scope.single_element.element_info.script_source = result.script_source;
            } else {
                $scope.single_element.element_info.comp_id = '';
                $scope.single_element.element_info.comp_impl_type = result.impl_type;
                $scope.single_element.element_info.output = result.output ? result.output : [];
                $scope.single_element.element_info.input = result.param_list;
                $scope.single_element.element_info.exec_script = result.exec_script;
                $scope.single_element.element_info.business_sys_name = result.business_sys_name;
                $scope.single_element.element_info.script_source = result.script_source;
                $scope.single_element.element_info.sql_source = result.sql_source;
                $scope.single_element.element_info.script_file_name = result.script_file_name;
                $scope.single_element.element_info.dataBase_type = result.dataBase_type;
                $scope.single_element.element_info.service_name = result.service_name;
                for (var i = 0; i < $scope.single_element.element_info.input.length; i++) {
                    $scope.single_element.element_info.input[i].param_source = 1;
                }
            }
        })
    };

    $scope.formSubmit = function () {
        if (!CV.valiForm($scope.form.private_ele_form)) {
            return false;
        }

        if (!$scope.single_element.element_info.job_method) {
            Modal.alert('请设置内容类型');
            return false;
        }

        //组件方式-组件名不可为空
        if ($scope.single_element.element_info.job_method === 1 && !$scope.single_element.element_info.comp_cn_name) {
            Modal.alert('请重配内容类型');
            return false;
        }

        $scope.btn_loading = true;
        $scope.single_element.text = $scope.single_element.element_info.sdwork_cn_name || typeToCategoryAndCn(_single_element.type).type_cn;
        Scene.addPrivateScene($scope.single_element).then(function (data) {
            $scope.single_element.sd_job_bean = $scope.single_element.element_info;
            $scope.single_element.sd_job_bean.is_special_element = true;
            $scope.btn_loading = false;
            $modalInstance.close($scope.single_element);
        }, function (error) {
            $scope.btn_loading = false;
            Modal.alert(error.message, 3)
        });
    };
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 * 调度场景-添加场景元素
 * */
modal_m.controller('addSceneElementCtrl', ["$scope", "$modalInstance", "$timeout", "Cmpt", "IML_TYPE", "CmptType", "modalParam", "ElementCategory", "Scene", "FlowCategoryData", "CmptFunc", "Modal", "CV", function ($scope, $modalInstance, $timeout, Cmpt, IML_TYPE, CmptType, modalParam, ElementCategory, Scene, FlowCategoryData, CmptFunc, Modal, CV) {
    var _flow_category_data = FlowCategoryData;

    $scope.is_update = modalParam.is_update ? modalParam.is_update : false;
    $scope.btn_loading = false;

    $scope.form = {};
    $scope.element_info = {
        category: '',
        element_list: []
    };

    $scope.data = {
        element_category_list: ElementCategory,
        element_data: _flow_category_data,
        category_ele: []
    };

    //元素图标
    $scope.elementIcon = function (type) {
        var _bg_url = '', _bg_size = '/40px';
        switch (type) {
            case 1: _bg_url = 'url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url = 'url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url = 'url(img/dispatch/fl/palette/condition.png)'; break;
            case 5: _bg_url = 'url(img/dispatch/fl/palette/stop.png)'; break;
            case 6: _bg_url = 'url(img/dispatch/fl/palette/rep.png)'; break;
            case 7: _bg_url = 'url(img/dispatch/fl/palette/ftp_u.png)'; break;
            case 8: _bg_url = 'url(img/dispatch/fl/palette/ftp_d.png)'; break;
            case 9: _bg_url = 'url(img/dispatch/fl/palette/sftp_u.png)'; break;
            case 10: _bg_url = 'url(img/dispatch/fl/palette/sftp_d.png)'; break;
            case 11: _bg_url = 'url(img/dispatch/fl/palette/agnt_u.png)'; break;
            case 12: _bg_url = 'url(img/dispatch/fl/palette/agnt_d.png)'; break;
            case 13: _bg_url = 'url(img/dispatch/fl/palette/copy.png)'; break;
            case 14: _bg_url = 'url(img/dispatch/fl/palette/sql.png)'; break;
            case 15: _bg_url = 'url(img/dispatch/fl/palette/sql_s.png)'; break;
            case 16: _bg_url = 'url(img/dispatch/fl/palette/net.png)'; break;
            case 17: _bg_url = 'url(img/dispatch/fl/palette/sys_start.png)'; break;
            case 18: _bg_url = 'url(img/dispatch/fl/palette/sys_end.png)'; break;
            case 19: _bg_url = 'url(img/dispatch/fl/palette/python.png)'; break;
            case 20: _bg_url = 'url(img/dispatch/fl/palette/shell.png)'; break;
            case 21: _bg_url = 'url(img/dispatch/fl/palette/bat.png)'; break;
            case 22: _bg_url = 'url(img/dispatch/fl/palette/ruby.png)'; break;
            case 23: _bg_url = 'url(img/dispatch/fl/palette/perl.png)'; break;
            case 24: _bg_url = 'url(img/dispatch/fl/palette/web.png)'; break;
            case 25: _bg_url = 'url(img/dispatch/fl/palette/tcp.png)'; break;
            case 26: _bg_url = 'url(img/dispatch/fl/palette/http.png)'; break;
            case 27: _bg_url = 'url(img/dispatch/fl/palette/tux.png)'; break;
            case 28: _bg_url = 'url(img/dispatch/fl/palette/cl.png)'; break;
            case 29: _bg_url = 'url(img/dispatch/fl/palette/rpg.png)'; break;
            case 30: _bg_url = 'url(img/dispatch/fl/palette/java.png)'; break;
            case 31: _bg_url = 'url(img/dispatch/fl/palette/c.png)'; break;
            case 32: _bg_url = 'url(img/dispatch/fl/palette/c++.png)'; break;
            case 33: _bg_url='url(img/dispatch/fl/context/site.png)'; break;
            case 34: _bg_url='url(img/dispatch/fl/context/area.png)'; break;
            case 35: _bg_url='url(img/dispatch/fl/context/cell.png)'; break;
            case 36: _bg_url='url(img/dispatch/fl/context/unit.png)'; break;
            case 37: _bg_url='url(img/dispatch/fl/context/enterprise.png)'; break;
            default: _bg_url = 'url(img/dispatch/fl/palette/ftp_u.png)'; break;
        }
        return { "background": _bg_url + 'no-repeat center' + _bg_size };
    };
    //选择分类
    $scope.selectCategory = function (category) {
        $scope.data.category_ele = [];
        $scope.element_info.category = category;
        $scope.data.element_data = angular.copy(_flow_category_data);
        $scope.data.category_ele = $scope.data.element_data.filter(function (item) {
            return item.category === category;
        });
    };
    //选择元素
    $scope.selectElement = function (element, category) {
        element.checked = !element.checked;
        for (var i = 0; i < $scope.data.category_ele.length; i++) {
            var _ele_category = $scope.data.category_ele[i];
            if (_ele_category.category !== category) continue;
            for (var j = 0; j < _ele_category.element_list.length; j++) {
                var _ele = _ele_category.element_list[j];
                if (_ele.type === element.type) {
                    _ele.checked = element.checked;
                }
            }
        }
    };


    $scope.formSubmit = function () {
        if (!CV.valiForm($scope.form.element_form)) {
            return false;
        }
        if (!$scope.data.category_ele.length) {
            Modal.alert('元素不可为空');
            return false
        }
        //处理选中的元素
        $scope.element_info.element_list = [];
        for (var i = 0; i < $scope.data.category_ele[0].element_list.length; i++) {
            var _ele = $scope.data.category_ele[0].element_list[i];
            if (_ele.checked) {
                $scope.element_info.element_list.push(_ele);
            }
        }
        if ($scope.element_info.element_list.length === 0) {
            Modal.alert('请选择元素');
            return false
        }
        $modalInstance.close($scope.element_info);
    };
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };


}]);

/**
 * 调度策略-新增策略组
 * */
modal_m.controller('newStrategyGroupCtrl', ["$scope", "$modalInstance", "$timeout", "Cmpt", "StrategyPriority", "StrategyGroupType", "modalParam", "CodeMirrorOption", "Strategy", "dataBaseType", "CmptFunc", "Modal", "CV", function ($scope, $modalInstance, $timeout, Cmpt, StrategyPriority, StrategyGroupType, modalParam, CodeMirrorOption, Strategy, dataBaseType, CmptFunc, Modal, CV) {
    $scope.btn_loading = false;
    $scope.form = {};
    $scope.strategy_info = {
        sdstrategy_id: '',
        sdstrategy_name: '',  //策略名
        sdstrategy_desc: '',  //策略组描述
        sdstrategy_concurrent: 2,   //并发度
        sdstrategy_type: 1    //策略组类型
    };
    $scope.data = {
        strategy_type_list: StrategyGroupType,
    };

    $scope.formSubmit = function () {
        if (!CV.valiForm($scope.form.strategy_form)) return false;
        $scope.btn_loading = true;
        Strategy.addStrategyGroup($scope.strategy_info, $scope.is_update).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.btn_loading = false;
                    $modalInstance.close(true);
                }
            }, 0)
        }, function (error) {
            $scope.btn_loading = false;
            Modal.alert(error.message, 3);
        });
    };
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };


}]);

/**
 *流程复制
 * */
modal_m.controller('RepeatFlowCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Collection", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Modal, Collection, CV) {
    $scope.flow_id = modalParam.flow_id;
    $scope.form = {
    }
    $scope.flow_info = {
        flow_cn_name: ""
    }
    //确定
    $scope.formSubmit = function () {
        //表单验证
        if (!CV.valiForm($scope.form.flow)) {
            return false;
        }
        $modalInstance.close();
    }
    //取消表单
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 *发布原因
 * */
modal_m.controller('FlowPubReasonCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Collection", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Modal, Collection, CV) {
    $scope.data = {
        pub_reason: ""
    };
    //确定
    $scope.formSubmit = function () {

        $modalInstance.close($scope.data.pub_reason);
    }
    //取消表单
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
}]);

/**
 * 任务概览--选择节点
 * **/
modal_m.controller('ywtaskChooseNodeCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Flow", "ScrollConfig", "Modal", "CV", function ($scope, $modalInstance, $timeout, modalParam, Flow, ScrollConfig, Modal, CV) {
    $scope.node_info = {
        node_ip: '',
        selected_node: modalParam.node_list ? modalParam.node_list : [],
    };
    $scope.node_control = {
        loading: false,
    };
    //模拟数据
    $scope.data = {
        node_list: []
    };
    $scope.config = {
        scroll_bar: ScrollConfig
    }
    var init = function () {
        $scope.node_control.loading = true;
        Flow.getAllNodesInfo().then(function (data) {
            $timeout(function () {
                if (data) {
                    var _node_list = data.nodes_list ? data.nodes_list : [];
                    for (var i = 0, len = _node_list.length; i < len; i++) {
                        var _node = _node_list[i];
                        _node.state = false;
                        for (var j = 0; j < $scope.node_info.selected_node.length; j++) {
                            var _selected_node = $scope.node_info.selected_node[j];
                            if (_node.node_ip == _selected_node.node_ip) _node.state = true;
                        }
                    }
                    $scope.data.node_list = _node_list;
                    $scope.node_control.loading = false;
                }
            }, 1000);
        }, function (error) {
            $scope.node_control.loading = false;
            Modal.alert(error.message, 3);
        });
    }
    //清除搜索纪录
    $scope.clearSearchInfo = function () {
        $scope.node_info.node_ip = "";
    };
    //选择节点
    $scope.selectNode = function (node) {
        node.state = !node.state;
    };
    $scope.saveNodeList = function () {
        var _select_node = [];
        for (var i = 0; i < $scope.data.node_list.length; i++) {
            var _node = $scope.data.node_list[i];
            if (_node.state) {
                _select_node.push({ node_ip: _node.node_ip, node_detail: (_node.node_detail ? _node.node_detail : '暂无'), state: false });
            }
        }
        $modalInstance.close(_select_node);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *流程周期配置模态框
 * */
modal_m.controller('configFlowTimeCtrl', ["$scope", "$modalInstance", "modalParam", "Flow", "Modal", "CV", function ($scope, $modalInstance, modalParam, Flow, Modal, CV) {
    $scope.dateObj = {
        cycles: modalParam.data.cycle_info.cycles ? modalParam.data.cycle_info.cycles : [],
        time_unit: modalParam.data.cycle_info.time_unit ? modalParam.data.cycle_info.time_unit : 0,
        period_list_str: modalParam.data.period_list_str ? modalParam.data.period_list_str : [],
        start_bk_datetime: modalParam.data.start_bk_datetime_val ? modalParam.data.start_bk_datetime_val : CV.dtFormat(new Date()),
        end_bk_datetime: modalParam.data.end_bk_datetime_val ? modalParam.data.end_bk_datetime_val : '',
        cycle_type: modalParam.data.cycle_info.cycle_type ? modalParam.data.cycle_info.cycle_type : 1,
        flag: modalParam.data.start_bk_datetime_val == "" ? 1 : 0,
        view_flag: modalParam.data.view_flag ? modalParam.data.view_flag : 1,
        minDate: new Date(),
        errorM: ''
    };
    $scope.datepicker = {};
    $scope.cus_date = {
        date: '',
        minDate: new Date(),
    };
    $scope.control = {
        startTimeFlag: false,
        viewtime_error: ''
    };
    var init = function () {
        //循环处理
        if ($scope.dateObj.cycle_type == 3 && $scope.dateObj.cycles.length == 0) {
            $scope.dateObj.cycles[0] = modalParam.data.cycle_info.loop_time;
        }
        for (var i = 0; i < $scope.dateObj.cycles.length; i++) {
            $scope.dateObj.cycles[i].dd = parseInt($scope.dateObj.cycles[i].dd);
            $scope.dateObj.cycles[i].hh = parseInt($scope.dateObj.cycles[i].hh);
            $scope.dateObj.cycles[i].mm = parseInt($scope.dateObj.cycles[i].mm);
            $scope.dateObj.cycles[i].mi = parseInt($scope.dateObj.cycles[i].mi);
            $scope.dateObj.cycles[i].ww = parseInt($scope.dateObj.cycles[i].ww);
        }
        //执行时间查看--查询周期时间列表
        if ($scope.dateObj.view_flag == 2) {
            $scope.getCirclePeriod();
        }
    };

    //显示日期控件
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.datepicker.opened = true;
    };
    $scope.toggleMin = function () {
        $scope.cus_date.minDate = $scope.dateObj.start_bk_datetime != '' ? new Date($scope.dateObj.start_bk_datetime) : new Date();
    };
    $scope.$watch('cus_date.date', function () {
        if ($scope.dateObj.view_flag == 1) {
            if ($scope.dateObj.start_bk_datetime == '') {
                $scope.control.startTimeFlag = true;
                return false;
            }
            if ($scope.cus_date.date != '' && $scope.cus_date.date) {
                var _dataStrShow = $scope.cus_date.date.getFullYear() + '年' + ($scope.cus_date.date.getMonth() + 1) + '月' + $scope.cus_date.date.getDate() + '日';
                var _dataValue = CV.dtFormat($scope.cus_date.date);
                $scope.dateObj.cycles.push({ ww: 0, dd: 0, mm: 0, hh: 0, mi: 0, customize_times: '', date: _dataValue, date_str: _dataStrShow });
            }
        }
    }, true);
    $scope.removeAutoTime = function ($index) {
        $scope.dateObj.cycles.splice($index, 1);
        //移除输入验证信息
        if ($scope.dateObj.errorM) $('.ss').remove();
        if ($scope.dateObj.cycle_type == 3) {
            $scope.dateObj.period_list_str = [];
        }
    };
    //切换操作类型（1自定义 2周期 3循环）
    $scope.changeOpexeType = function (flag) {
        $scope.dateObj.cycle_type = flag;
        $scope.dateObj.cycles = [];
        $scope.dateObj.period_list_str = [];
        $scope.dateObj.time_unit = 0;
        //移除输入验证信息
        if ($scope.dateObj.errorM) $('.ss').remove();
    };
    //添加循环时间
    $scope.addCirlTime = function () {
        if ($scope.dateObj.errorM) return;
        var _hh = 0, _mi = 0;
        if ($scope.dateObj.cycle_type == 3) {
            _hh = 1;
            _mi = 1;
        }
        $scope.dateObj.cycles.push({ unit: $scope.dateObj.time_unit, ww: 1, dd: 1, mm: 1, hh: _hh, mi: _mi });
    };
    //切换时间单位
    $scope.changeTimeUnitType = function (flag) {
        var _hh = 0, _mi = 0;
        $scope.dateObj.cycles = [];
        $scope.dateObj.time_unit = flag;
        if ($scope.dateObj.period_list_str) $scope.dateObj.period_list_str = [];
        //移除输入验证信息
        if ($('.ss').text()) $('.ss').remove();
        //周期/循环切换年月日
        if ($scope.dateObj.cycle_type == 3) {
            _hh = 1;
            _mi = 1;
        }
        $scope.dateObj.cycles.push({ unit: $scope.dateObj.time_unit, ww: 1, dd: 1, mm: 1, hh: _hh, mi: _mi });
    };
    //获取执行时间
    $scope.getCirclePeriod = function () {
        $scope.dateObj.period_list_str = [];
        if ($scope.dateObj.cycle_type == 1 || $scope.dateObj.errorM) return;
        if ($scope.dateObj.cycles.length == 0 && $scope.dateObj.view_flag != 2) {
            if ($scope.dateObj.cycle_type == 2) {
                Modal.alert("周期列表不可为空");
                return false;
            } else {
                Modal.alert("循环列表不可为空");
                return false;
            }
        }
        var _data = {
            start_bk_datetime: CV.dtFormat($scope.dateObj.start_bk_datetime),
            end_bk_datetime: CV.dtFormat($scope.dateObj.end_bk_datetime),
            cycle_info: {
                cycleTimeBeen: $scope.dateObj.cycle_type == 3 ? [] : $scope.dateObj.cycles,
                cycle_type: $scope.dateObj.cycle_type,
                loop_time: $scope.dateObj.cycle_type == 3 ? $scope.dateObj.cycles[0] : {}
            }
        };
        Flow.caculatorExeTime(_data).then(function (data) {
            $scope.dateObj.period_list_str = data.next_time_list ? data.next_time_list : [];
            if ($scope.dateObj.view_flag == 1 && $scope.dateObj.period_list_str.length == 0) {
                Modal.alert("暂无下次执行时间");
            }
        }, function (error) {
            if ($scope.dateObj.view_flag == 2) {
                $scope.control.viewtime_error = error.message;
            } else {
                Modal.alert(error.message, 3);
            }
        });
    };
    $scope.$watch('dateObj', function () {
        if (!$scope.dateObj.start_bk_datetime) {
            $scope.control.startTimeFlag = true;
        } else {
            $scope.toggleMin();
            $scope.control.startTimeFlag = false;
        }
    }, true);
    //保存按钮
    $scope.ok = function () {
        if ($scope.control.startTimeFlag || $scope.dateObj.errorM) return;
        if ($scope.dateObj.cycles.length == 0) {
            var _time_type = $scope.dateObj.cycle_type == 1 ? '自定义时间' : $scope.dateObj.cycle_type == 2 ? '周期' : '循环';
            Modal.alert(_time_type + "列表不可为空");
            return false;
        }
        if ($scope.dateObj.start_bk_datetime && $scope.dateObj.end_bk_datetime) {
            if ($scope.dateObj.start_bk_datetime > $scope.dateObj.end_bk_datetime) {
                Modal.alert('开始时间不可大于结束时间！');
                return false;
            }
        }
        $modalInstance.close($scope.dateObj);
    };

    //取消按钮
    $scope.close = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);


//----------------------其他---------------------

/**
 *任务接口模态框
 * */
modal_m.controller('JsonListCtrl', ["$scope", "$modalInstance", "$state", "Workorder", "modalParam", "Modal", "CV", function ($scope, $modalInstance, $state, Workorder, modalParam, Modal, CV) {
    var _task_seq = modalParam.task_seq; //任务流水号
    //接口信息
    $scope.interface_info = modalParam.data;
    $scope.control = {
        aprov_type: modalParam.aprov_type
    };
    console.log($scope.interface_info);
    var init = function () {
        //如果是定制的审批流程则需跳转到指定页面
        if ($scope.control.aprov_type == 3) {
            $scope.control.url = modalParam.url;
            if ($scope.control.url == 'execute_program_step') {
                Workorder.getApprovalExecuteProgramStep(_task_seq).then(function (data) {
                    console.log(data);
                }, function (error) {
                    Modal.alert(error.message, 3)
                })
            }
        }
    };
    //下载附件
    $scope.downloadAccessoryFile = function (path) {
        CV.downloadFile(path);
    };
    //关闭
    $scope.close = function () {
        $modalInstance.close(true);
    };
    init()
}]);

/**
 *数据源配置
 * */
modal_m.controller('configDataSourceCtrl', ["$scope", "$modalInstance", "$timeout", "modalParam", "Modal", "NodeReform", "BusiSys", "Collection", "OperateSys", "BsysFunc", "Cmpt", "ScriptExec", "ProtocolType", "CV", function ($scope, $modalInstance, $timeout, modalParam, Modal, NodeReform, BusiSys, Collection, OperateSys, BsysFunc, Cmpt, ScriptExec, ProtocolType, CV) {
    var _business_sys_name = modalParam.business_sys_name;
    $scope.normal_ip_list = [];
    $scope.extra_ip_list = [];
    $scope.source_list = [];
    var _srv_soc = modalParam.srv_soc;
    $scope.reqData = {
        imply_type: modalParam.dataSource_type,
        tow_soc_loading: false,
        business_sys_name: _business_sys_name,
        two_soc: false,
        check_ip: '',
        search_ver_key: '',
        protocol_type: '',
        script_ip_list: [],
        normal_ip_list: [],
        extra_ip_list: [],
        ip_data_list: [],
        mid_ip_list: [],
        search_key_work: '',
        search_key: '',
        old_srv_soc: [],
        srv_soc: [],
        sc_search_key: '',
        flag: modalParam.flag,
        script_kind: '',
        script_type: modalParam.business_sys_name,
        ip_data_loading: false   //ip加载
    };
    $scope.control = {
        no_select_node: false,
    };
    $scope.selectOne = function () {
        $timeout(function () {
            $scope.scLocationIp();
        }, 10);
    };
    /*滚动条内部配置*/
    $scope.scroll_config_info = {
        axis: "y",
        theme: "custom-dark",
        scrollbarPosition: "inside",
        scrollInertia: 500,
        scrollEasing: "easeOutCirc",
        autoDraggerLength: true,
        autoHideScrollbar: true,
        scrollButtons: { enable: false }
    };
    /*滚动条外部配置*/
    $scope.scroll_config_out_info = {
        axis: "y",
        theme: "custom-dark",
        scrollbarPosition: "outside",
        scrollInertia: 500,
        scrollEasing: "easeOutCirc",
        autoDraggerLength: true,
        autoHideScrollbar: true,
        scrollButtons: { enable: false }
    };

    var init = function () {
        if ($scope.reqData.flag == 1) {
            NodeReform.getIpByNone().then(function (data) {
                $scope.reqData.ip_data_list = data.ip_list ? data.ip_list : [];
                for (var i = 0; i < $scope.reqData.ip_data_list.length; i++) {
                    $scope.reqData.ip_data_list[i] = $scope.reqData.ip_data_list[i].trim();
                }
            }, function (error) {
            });
            for (var i = 0; i < _srv_soc.length; i++) {
                $scope.reqData.normal_ip_list.push({ soc_ip: _srv_soc[i].soc_ip, is_show: true, soc_name: _srv_soc[i].soc_name, soc_name_list: [], ftp_soc_name_list: [], is_loading: false, is_ftp_loading: false, is_exsit_ftp: false })
                for (var k = 0; k < _srv_soc[i].soc_name_list.length; k++) {
                    if (_srv_soc[i].soc_name_list[k].soc_name == _srv_soc[i].soc_name) {
                        $scope.reqData.normal_ip_list[i].soc_name_list.push({
                            state: true,
                            soc_name: _srv_soc[i].soc_name_list[k].soc_name,
                            protocol_type: _srv_soc[i].soc_name_list[k].protocol_type,

                        });
                    } else {
                        $scope.reqData.normal_ip_list[i].soc_name_list.push({
                            state: false,
                            soc_name: _srv_soc[i].soc_name_list[k].soc_name,
                            protocol_type: _srv_soc[i].soc_name_list[k].protocol_type,
                        });
                    }
                }
                if (_srv_soc[i].ftp_soc_name_list && _srv_soc[i].ftp_soc_name_list.length != 0) {
                    $scope.reqData.normal_ip_list[i].is_exsit_ftp = true;
                    for (var j = 0; j < _srv_soc[i].ftp_soc_name_list.length; j++) {//
                        if (_srv_soc[i].ftp_soc_name_list[j].soc_name == _srv_soc[i].ftp_soc_name) {
                            $scope.reqData.normal_ip_list[i].ftp_soc_name_list.push({
                                state: true,
                                soc_name: _srv_soc[i].ftp_soc_name_list[j].soc_name,
                                protocol_type: _srv_soc[i].ftp_soc_name_list[j].protocol_type,
                            });
                        } else {
                            $scope.reqData.normal_ip_list[i].ftp_soc_name_list.push({
                                state: false,
                                soc_name: _srv_soc[i].ftp_soc_name_list[j].soc_name,
                                protocol_type: _srv_soc[i].ftp_soc_name_list[j].protocol_type,
                            });
                        }
                    }
                }
            }
        } else {
            if (($scope.reqData.imply_type > 2 && $scope.reqData.imply_type < 6) || $scope.reqData.imply_type == 14 || $scope.reqData.imply_type == 15 || $scope.reqData.imply_type == 17) {
                $scope.reqData.two_soc = true;
            }
            if (_business_sys_name == '') {
                NodeReform.getIpByNone().then(function (data) {
                    var _node_list = data.ip_list ? data.ip_list : [];
                    for (var i = 0; i < _node_list.length; i++) {
                        _node_list[i] = _node_list[i].trim();
                    }
                    for (var i = 0; i < _node_list.length; i++) {
                        var _one_node = _node_list[i];
                        $scope.reqData.ip_data_list.push(_one_node);
                    }
                    if (!$scope.reqData.two_soc) {
                        for (var i = 0; i < _srv_soc.length; i++) {
                            $scope.reqData.normal_ip_list.push({ exe_ip: _srv_soc[i].exe_ip, is_show: true, exe_soc_name: _srv_soc[i].soc_name, exe_soc_list: [], ftp_soc_name_list: [], is_loading: false, is_ftp_loading: false, is_exsit_ftp: false })
                            for (var k = 0; k < _srv_soc[i].exe_soc_list.length; k++) {
                                if (_srv_soc[i].exe_soc_list[k].soc_name == _srv_soc[i].exe_soc_name) {
                                    $scope.reqData.normal_ip_list[i].exe_soc_list.push({
                                        state: true,
                                        exe_soc_name: _srv_soc[i].exe_soc_list[k].soc_name,
                                        protocol_type: _srv_soc[i].exe_soc_list[k].protocol_type,

                                    });
                                } else {
                                    $scope.reqData.normal_ip_list[i].exe_soc_list.push({
                                        state: false,
                                        exe_soc_name: _srv_soc[i].exe_soc_list[k].soc_name,
                                        protocol_type: _srv_soc[i].exe_soc_list[k].protocol_type,
                                    });
                                }
                            }
                        }
                    } else {
                        for (var i = 0; i < _srv_soc.length; i++) {
                            for (var j = 0; j < _srv_soc[i].ver_soc_list.length; j++) {
                                _srv_soc[i].ver_soc_list[j].ver_soc_name = _srv_soc[i].ver_soc_list[j].soc_name;
                                if (_srv_soc[i].ver_soc_name == _srv_soc[i].ver_soc_list[j].soc_name) {
                                    _srv_soc[i].ver_soc_list[j].state = true;
                                } else {
                                    _srv_soc[i].ver_soc_list[j].state = false;
                                }
                            }
                            for (var j = 0; j < _srv_soc[i].exe_soc_list.length; j++) {
                                _srv_soc[i].exe_soc_list[j].exe_soc_name = _srv_soc[i].exe_soc_list[j].soc_name;
                                if (_srv_soc[i].exe_soc_name == _srv_soc[i].exe_soc_list[j].soc_name) {
                                    _srv_soc[i].exe_soc_list[j].state = true;
                                } else {
                                    _srv_soc[i].exe_soc_list[j].state = false;
                                }
                            }
                        }
                        for (var i = 0; i < _srv_soc.length; i++) {
                            var _extra_ip_list = [];
                            for (var j = 0; j < $scope.reqData.ip_data_list.length; j++) {
                                if ($scope.reqData.ip_data_list[j] == _srv_soc[i].ver_ip) {
                                    _extra_ip_list.push({
                                        ver_ip: $scope.reqData.ip_data_list[j],
                                        is_check: true,
                                        ver_soc_list: _srv_soc[i].ver_soc_list,
                                    });
                                }
                            }
                            $scope.reqData.extra_ip_list.push({
                                exe_ip: _srv_soc[i].exe_ip,
                                exe_soc_list: _srv_soc[i].exe_soc_list,
                                is_show: false,
                                delete_flag: false,
                                exe_soc_name: _srv_soc[i].exe_soc_name,
                                ver_ip_list: _extra_ip_list,
                                ver_ip: _srv_soc[i].ver_ip
                            })
                        }
                    }
                }, function (error) {
                    Modal.alert(error.message, 3);
                });
            } else {
                NodeReform.getIpWithProtocolAndSoc(_business_sys_name, $scope.reqData.imply_type).then(function (data) {
                    var _node_list = data.node_list ? data.node_list : [];
                    for (var i = 0; i < _node_list.length; i++) {
                        var _one_node = _node_list[i];
                        $scope.reqData.ip_data_list.push(_one_node.node_ip);
                        if (!$scope.reqData.two_soc) {
                            $scope.reqData.normal_ip_list.push({
                                exe_ip: _one_node.node_ip,
                                exe_soc_list: [],
                                is_show: false,
                                exe_soc_name: ''
                            });
                        }
                    }
                    for (var m = 0; m < _srv_soc.length; m++) {
                        if (!_srv_soc[m].exe_soc_list) {
                            _srv_soc[m].exe_soc_list = [];
                            for (var l = 0; l < _node_list.length; l++) {
                                if (_node_list[l].node_ip == _srv_soc[m].exe_ip) {
                                    _srv_soc[m].exe_soc_list = _node_list[l].exe_soc_list;
                                }
                            }
                        }
                        if (!_srv_soc[m].ver_soc_list) {
                            _srv_soc[m].ver_soc_list = [];
                            for (var l = 0; l < _node_list.length; l++) {
                                if (_node_list[l].node_ip == _srv_soc[m].ver_ip) {
                                    _srv_soc[m].ver_soc_list = _node_list[l].ver_soc_list;
                                }
                            }
                        }
                    }

                    if (!$scope.reqData.two_soc) {
                        for (var i = 0; i < _srv_soc.length; i++) {
                            for (var j = 0; j < $scope.reqData.normal_ip_list.length; j++) {
                                if (_srv_soc[i].exe_ip == $scope.reqData.normal_ip_list[j].exe_ip) {
                                    $scope.reqData.normal_ip_list[j].is_show = true;
                                    $scope.reqData.normal_ip_list[j].exe_soc_list = [];
                                    $scope.reqData.normal_ip_list[j].exe_soc_name = _srv_soc[i].exe_soc_name;
                                    for (var k = 0; k < _srv_soc[i].exe_soc_list.length; k++) {//
                                        if (_srv_soc[i].exe_soc_list[k].soc_name == _srv_soc[i].exe_soc_name) {
                                            $scope.reqData.normal_ip_list[j].exe_soc_list.push({
                                                state: true,
                                                exe_soc_name: _srv_soc[i].exe_soc_list[k].soc_name,
                                                protocol_type: _srv_soc[i].exe_soc_list[k].protocol_type
                                            });
                                        } else {
                                            $scope.reqData.normal_ip_list[j].exe_soc_list.push({
                                                state: false,
                                                exe_soc_name: _srv_soc[i].exe_soc_list[k].soc_name,
                                                protocol_type: _srv_soc[i].exe_soc_list[k].protocol_type
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        for (var i = 0; i < _srv_soc.length; i++) {
                            for (var j = 0; j < _srv_soc[i].ver_soc_list.length; j++) {
                                _srv_soc[i].ver_soc_list[j].ver_soc_name = _srv_soc[i].ver_soc_list[j].soc_name;
                                if (_srv_soc[i].ver_soc_name == _srv_soc[i].ver_soc_list[j].soc_name) {
                                    _srv_soc[i].ver_soc_list[j].state = true;
                                } else {
                                    _srv_soc[i].ver_soc_list[j].state = false;
                                }
                            }
                            for (var j = 0; j < _srv_soc[i].exe_soc_list.length; j++) {
                                _srv_soc[i].exe_soc_list[j].exe_soc_name = _srv_soc[i].exe_soc_list[j].soc_name;
                                if (_srv_soc[i].exe_soc_name == _srv_soc[i].exe_soc_list[j].soc_name) {
                                    _srv_soc[i].exe_soc_list[j].state = true;
                                } else {
                                    _srv_soc[i].exe_soc_list[j].state = false;
                                }
                            }
                        }
                        for (var i = 0; i < _srv_soc.length; i++) {
                            var _extra_ip_list = [];
                            for (var j = 0; j < $scope.reqData.ip_data_list.length; j++) {
                                if ($scope.reqData.ip_data_list[j] == _srv_soc[i].ver_ip) {
                                    _extra_ip_list.push({
                                        ver_ip: $scope.reqData.ip_data_list[j],
                                        is_check: true,
                                        ver_soc_list: _srv_soc[i].ver_soc_list
                                    });
                                } else {
                                    _extra_ip_list.push({
                                        ver_ip: $scope.reqData.ip_data_list[j],
                                        is_check: false,
                                        ver_soc_list: []
                                    });
                                }
                            }
                            $scope.reqData.extra_ip_list.push({
                                exe_ip: _srv_soc[i].exe_ip,
                                exe_soc_list: _srv_soc[i].exe_soc_list,
                                is_show: false,
                                delete_flag: false,
                                exe_soc_name: _srv_soc[i].exe_soc_name,
                                ver_ip_list: _extra_ip_list,
                                ver_ip: _srv_soc[i].ver_ip
                            })
                        }
                    }
                    $scope.reqData.ip_data_loading = true;
                }, function (error) {
                    $scope.reqData.ip_data_loading = true;
                    Modal.alert(error.message, 3);
                });
            }

        }


        //再次点击的时候--初始化数据

    };
    //添加一条
    $scope.scLocationIp = function () {
        var _is_exsit = false;
        for (var i = 0; i < $scope.reqData.normal_ip_list.length; i++) {
            if ($scope.reqData.normal_ip_list[i].soc_ip == $scope.reqData.sc_search_key) {
                _is_exsit = true;
            }
        }
        if (!_is_exsit) {
            var _sc_search_key = angular.copy($scope.reqData.sc_search_key);
            $scope.reqData.normal_ip_list.push({ soc_ip: $scope.reqData.sc_search_key, is_show: true, soc_name: '', soc_name_list: [], ftp_soc_name_list: [], is_loading: true, is_ftp_loading: false, is_exsit_ftp: false });
            ScriptExec.getSocByNodeIp($scope.reqData.sc_search_key, $scope.reqData.imply_type).then(function (data) {
                var _soc_list = data.source_list ? data.source_list : [];
                for (var i = 0; i < _soc_list.length; i++) {
                    _soc_list[i].state = false;
                }
                for (var i = 0; i < $scope.reqData.normal_ip_list.length; i++) {
                    if (_sc_search_key == $scope.reqData.normal_ip_list[i].soc_ip) {
                        $scope.reqData.normal_ip_list[i].is_loading = false;
                        $scope.reqData.normal_ip_list[i].soc_name_list = _soc_list;
                    }
                }
            }, function (error) {
                Modal.alert(error.message, 3);
            });
        } else {
            $scope.reqData.normal_ip_list[$scope.reqData.normal_ip_list.length - 1].is_loading = false;
            $scope.reqData.sc_search_key = '';
        }

    };
    $scope.clickScSource = function (one_soc, one_ip, index, pre_index) {
        var _state = false;
        //排他
        for (var i = 0; i < $scope.reqData.normal_ip_list[pre_index].soc_name_list.length; i++) {
            if ($scope.reqData.normal_ip_list[pre_index].soc_name_list[i].soc_name == one_soc.soc_name) {
                $scope.reqData.normal_ip_list[pre_index].soc_name_list[i].state = !$scope.reqData.normal_ip_list[pre_index].soc_name_list[i].state;
                _state = $scope.reqData.normal_ip_list[pre_index].soc_name_list[i].state;
            } else {
                $scope.reqData.normal_ip_list[pre_index].soc_name_list[i].state = false;
            }
        }
        one_ip.is_exsit_ftp = false;
        one_ip.ftp_soc_name_list = [];
        if (_state) {
            if ($scope.reqData.script_type == 2) {
                one_ip.is_exsit_ftp = true;
                one_ip.is_ftp_loading = true;
                //获取FTP数据源
                ScriptExec.getSocByNodeIp(one_ip.soc_ip, 1).then(function (data) {
                    var _soc_list = data.source_list ? data.source_list : [];
                    for (var i = 0; i < _soc_list.length; i++) {
                        _soc_list[i].state = false;
                    }
                    one_ip.ftp_soc_name_list = _soc_list;
                    one_ip.is_ftp_loading = false;
                }, function (error) {
                    one_ip.is_ftp_loading = false;
                });
            }
        }

    };
    $scope.clickScFtpSource = function (one_soc, one_ip, $index, pre_index) {
        //排他
        for (var i = 0; i < $scope.reqData.normal_ip_list[pre_index].ftp_soc_name_list.length; i++) {
            if ($scope.reqData.normal_ip_list[pre_index].ftp_soc_name_list[i].soc_name == one_soc.soc_name) {
                $scope.reqData.normal_ip_list[pre_index].ftp_soc_name_list[i].state = !$scope.reqData.normal_ip_list[pre_index].ftp_soc_name_list[i].state;
            } else {
                $scope.reqData.normal_ip_list[pre_index].ftp_soc_name_list[i].state = false;
            }
        }
    };




    $scope.locationIp = function () {
        $scope.reqData.mid_ip_list = [];
        if ($scope.reqData.search_key == '') {
            for (var i = 0; i < $scope.reqData.ip_data_list.length; i++) {
                $scope.reqData.mid_ip_list.push($scope.reqData.ip_data_list[i]);
            }
        } else {
            for (var i = 0; i < $scope.reqData.ip_data_list.length; i++) {
                var _is_exsit = $scope.reqData.ip_data_list[i].indexOf($scope.reqData.search_key);
                if (_is_exsit != -1) {
                    $scope.reqData.mid_ip_list.push($scope.reqData.ip_data_list[i]);
                }
            }
        }
        //少的补上
        for (var i = 0; i < $scope.reqData.mid_ip_list.length; i++) {
            var _ip = $scope.reqData.mid_ip_list[i];
            var _is_exsit = false;
            for (var j = 0; j < $scope.reqData.normal_ip_list.length; j++) {
                if (_ip == $scope.reqData.normal_ip_list[j].exe_ip) {
                    _is_exsit = true;
                }
            }
            if (!_is_exsit) {
                $scope.reqData.normal_ip_list.push({ exe_ip: _ip, exe_soc_list: [], is_show: false, exe_soc_name: '' })
            }
        }
        //多的删除
        for (var i = $scope.reqData.normal_ip_list.length - 1; i >= 0; i--) {
            if (!$scope.reqData.normal_ip_list[i].is_show) {
                var _is_exsit = false;
                for (var j = 0; j < $scope.reqData.mid_ip_list.length; j++) {
                    if ($scope.reqData.mid_ip_list[j] == $scope.reqData.normal_ip_list[i].exe_ip) {
                        _is_exsit = true;
                    }
                }
                if (!_is_exsit) {
                    $scope.reqData.normal_ip_list.splice(i, 1);
                }
            }
        }
    };
    $scope.clearIp = function () {
        $scope.reqData.search_key = '';
    };
    $scope.clearVerIp = function () {
        $scope.reqData.search_ver_key = '';
    };
    $scope.locationVerword = function () {
        var _index = 0;
        for (var i = 0; i < $scope.reqData.extra_ip_list.length; i++) {
            if ($scope.reqData.extra_ip_list[i].exe_ip == $scope.reqData.check_ip) {
                _index = i;
                break;
            }
        }
        $scope.reqData.mid_ip_list = [];
        if ($scope.reqData.search_ver_key == '') {
            for (var i = 0; i < $scope.reqData.ip_data_list.length; i++) {
                $scope.reqData.mid_ip_list.push($scope.reqData.ip_data_list[i]);
            }
        } else {
            for (var i = 0; i < $scope.reqData.ip_data_list.length; i++) {
                var _is_exsit = $scope.reqData.ip_data_list[i].indexOf($scope.reqData.search_ver_key);
                if (_is_exsit != -1) {
                    $scope.reqData.mid_ip_list.push($scope.reqData.ip_data_list[i]);
                }
            }
        }
        //$scope.reqData.extra_ip_list[_index].ver_ip_list
        for (var i = 0; i < $scope.reqData.mid_ip_list.length; i++) {
            var _ip = $scope.reqData.mid_ip_list[i];
            var _is_exsit = false;
            for (var j = 0; j < $scope.reqData.extra_ip_list[_index].ver_ip_list.length; j++) {
                if (_ip == $scope.reqData.extra_ip_list[_index].ver_ip_list[j].ver_ip) {
                    _is_exsit = true;
                }
            }
            if (!_is_exsit) {
                $scope.reqData.extra_ip_list[_index].ver_ip_list.push({ ver_ip: _ip, ver_soc_list: [], is_check: false })
            }
        }
        //
        for (var i = $scope.reqData.extra_ip_list[_index].ver_ip_list.length - 1; i >= 0; i--) {
            if (!$scope.reqData.extra_ip_list[_index].ver_ip_list[i].is_check) {
                var _is_exsit = false;
                for (var j = 0; j < $scope.reqData.mid_ip_list.length; j++) {
                    if ($scope.reqData.mid_ip_list[j] == $scope.reqData.extra_ip_list[_index].ver_ip_list[i].ver_ip) {
                        _is_exsit = true;
                    }
                }
                if (!_is_exsit) {
                    $scope.reqData.extra_ip_list[_index].ver_ip_list.splice(i, 1);
                }
            }
        }



    };
    $scope.checkNodeIPNobusiness = function () {
        var _is_exsit = false;
        for (var i = 0; i < $scope.reqData.normal_ip_list.length; i++) {
            if ($scope.reqData.normal_ip_list[i].exe_ip == $scope.reqData.search_key) {
                _is_exsit = true;
            }
        }
        if (!_is_exsit) {
            var _imply_type = ($scope.reqData.imply_type == 7 || $scope.reqData.imply_type == 8) ? 2 : $scope.reqData.imply_type;
            $scope.reqData.normal_ip_list.push({ exe_ip: $scope.reqData.search_key, is_show: true, soc_name: '', exe_soc_list: [], ftp_soc_name_list: [], is_loading: true, is_ftp_loading: false, is_exsit_ftp: false });
            Cmpt.getAllSocList($scope.reqData.search_key, _imply_type).then(function (data) {
                var _soc_list = data.source_list ? data.source_list : [];
                var _exe_soc_list = []
                for (var i = 0; i < _soc_list.length; i++) {
                    _soc_list[i].state = false;
                    _exe_soc_list.push({ state: false, exe_soc_name: _soc_list[i].soc_name, protocol_type: _soc_list[i].protocol_type })
                }
                $scope.reqData.normal_ip_list[$scope.reqData.normal_ip_list.length - 1].is_loading = false;
                $scope.reqData.normal_ip_list[$scope.reqData.normal_ip_list.length - 1].exe_soc_list = _exe_soc_list;
            }, function (error) {
                Modal.alert(error.message, 3);
            });
        } else {
            $scope.reqData.normal_ip_list[$scope.reqData.normal_ip_list.length - 1].is_loading = false;
            $scope.reqData.search_key = '';
        }

    };
    $scope.testCh = function (index) {
        $timeout(function () {
            if ($scope.reqData.normal_ip_list[index].exe_soc_list.length == 0) {
                $scope.reqData.normal_ip_list[index].is_loading = true;
                var _imply_type = ($scope.reqData.imply_type == 7 || $scope.reqData.imply_type == 8) ? 2 : $scope.reqData.imply_type;
                BusiSys.getSocListByIpAndBsys(_business_sys_name, $scope.reqData.normal_ip_list[index].exe_ip, _imply_type).then(function (data) {
                    var _soc_list = data.source_list ? data.source_list : [];
                    for (var i = 0; i < _soc_list.length; i++) {
                        if (new RegExp('agent').test(_soc_list[i])) {
                            $scope.reqData.normal_ip_list[index].exe_soc_name = _soc_list[i];
                            $scope.reqData.normal_ip_list[index].exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                        } else {
                            $scope.reqData.normal_ip_list[index].exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                        }
                    }
                    $scope.reqData.normal_ip_list[index].is_loading = false;
                }, function (error) {
                    $scope.reqData.normal_ip_list[index].is_loading = false;
                    Modal.alert(error.message, 3);
                });
            }
            if (!$scope.reqData.normal_ip_list[index].is_show) {
                remove_AllDataSource($scope.reqData.normal_ip_list[index]);
            }
        }, 10);
    };
    //点击节点IP
    $scope.checkNodeIP = function (one_ip) {
        one_ip.is_show = !one_ip.is_show;
        if (one_ip.exe_soc_list.length == 0) {
            one_ip.is_loading = true;
            var _imply_type = ($scope.reqData.imply_type == 7 || $scope.reqData.imply_type == 8) ? 2 : $scope.reqData.imply_type;
            if (_business_sys_name == '') {
                Cmpt.getAllSocList(one_ip.exe_ip, _imply_type).then(function (data) {
                    var _soc_list = data.source_list ? data.source_list : [];
                    for (var i = 0; i < _soc_list.length; i++) {
                        if (new RegExp('agent').test(_soc_list[i])) {
                            one_ip.exe_soc_name = _soc_list[i];
                            one_ip.exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                        } else {
                            one_ip.exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                        }
                    }
                    one_ip.is_loading = false;
                }, function (error) {
                    one_ip.is_loading = false;
                    Modal.alert(error.message, 3);
                });
            } else {
                BusiSys.getSocListByIpAndBsys(_business_sys_name, one_ip.exe_ip, _imply_type).then(function (data) {
                    var _soc_list = data.source_list ? data.source_list : [];
                    for (var i = 0; i < _soc_list.length; i++) {
                        if (new RegExp('agent').test(_soc_list[i])) {
                            one_ip.exe_soc_name = _soc_list[i];
                            one_ip.exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                        } else {
                            one_ip.exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                        }
                    }
                    one_ip.is_loading = false;
                }, function (error) {
                    one_ip.is_loading = false;
                    Modal.alert(error.message, 3);
                });
            }

        }
        if (!one_ip.is_show) {
            remove_AllDataSource(one_ip);
        }
    }
    //移除所有已选中的节点数据源面板中的数据源
    var remove_AllDataSource = function (one_ip) {
        for (var i = 0; i < $scope.reqData.normal_ip_list.length; i++) {
            if (one_ip.exe_ip == $scope.reqData.normal_ip_list[i].exe_ip) {
                $scope.reqData.normal_ip_list[i].is_show = false;
            }
        }
    }
    //选中数据源
    $scope.click_dataSource = function (one_soc, one_ip, index) {
        one_soc.state = !one_soc.state;
        //排他数据源
        for (var i = 0; i < $scope.reqData.normal_ip_list.length; i++) {
            if ($scope.reqData.normal_ip_list[i].exe_ip == one_ip) {
                for (var j = 0; j < $scope.reqData.normal_ip_list[i].exe_soc_list.length; j++) {
                    if (j != index) {
                        $scope.reqData.normal_ip_list[i].exe_soc_list[j].state = false;
                    }
                }
            }
        }
    }

    //这里开始为was，svn weblogic
    $scope.selectTwo = function () {
        $timeout(function () {
            $scope.addNodeIp($scope.reqData.search_key_work);
        }, 10);
    };
    //添加第一个节点IP
    $scope.addNodeIp = function (ip) {
        if (ip != '') {
            var _is_exsit = false;
            for (var i = 0; i < $scope.reqData.extra_ip_list.length; i++) {
                if ($scope.reqData.extra_ip_list[i].exe_ip == ip) {
                    _is_exsit = true;
                }
            }
            if (!_is_exsit) {
                $scope.reqData.check_ip = ip;
                var _exe_soc_list = [];
                var _exe_soc_name = '';
                var _extra_ip_list = [];
                for (var i = 0; i < $scope.reqData.ip_data_list.length; i++) {
                    _extra_ip_list.push({ ver_ip: $scope.reqData.ip_data_list[i], is_check: false, ver_soc_list: [] });
                }
                if (_business_sys_name == '') {
                    Cmpt.getAllSocList(ip, 2).then(function (data) {
                        var _soc_list = data.source_list ? data.source_list : [];
                        for (var i = 0; i < _soc_list.length; i++) {
                            if (new RegExp('agent').test(_soc_list[i])) {
                                _exe_soc_name.exe_soc_name = _soc_list[i];
                                _exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                            } else {

                                _exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                            }
                        }
                        $scope.reqData.extra_ip_list.push({ exe_ip: ip, exe_soc_list: _exe_soc_list, is_show: true, delete_flag: false, exe_soc_name: _exe_soc_name, ver_ip_list: [], ver_ip: '' });
                    }, function () {
                        $scope.reqData.extra_ip_list.push({ exe_ip: ip, exe_soc_list: _exe_soc_list, is_show: true, delete_flag: false, exe_soc_name: _exe_soc_name, ver_ip_list: [], ver_ip: '' });
                        Modal.alert(error.message, 3);
                    });
                } else {
                    BusiSys.getSocListByIpAndBsys(_business_sys_name, ip, 2).then(function (data) {
                        var _soc_list = data.source_list ? data.source_list : [];
                        for (var i = 0; i < _soc_list.length; i++) {
                            if (new RegExp('agent').test(_soc_list[i])) {
                                _exe_soc_name.exe_soc_name = _soc_list[i];
                                _exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                            } else {

                                _exe_soc_list.push({ exe_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                            }
                        }
                        $scope.reqData.extra_ip_list.push({ exe_ip: ip, exe_soc_list: _exe_soc_list, is_show: true, delete_flag: false, exe_soc_name: _exe_soc_name, ver_ip_list: _extra_ip_list, ver_ip: '' });
                    }, function () {
                        $scope.reqData.extra_ip_list.push({ exe_ip: ip, exe_soc_list: _exe_soc_list, is_show: true, delete_flag: false, exe_soc_name: _exe_soc_name, ver_ip_list: _extra_ip_list, ver_ip: '' });
                        Modal.alert(error.message, 3);
                    });
                }

                for (var i = 0; i < $scope.reqData.extra_ip_list.length; i++) {
                    if ($scope.reqData.extra_ip_list[i].exe_ip != ip) {
                        $scope.reqData.extra_ip_list[i].is_show = false;
                    }
                }
            }
        }
    }


    //选中当前exe_ip,排他
    $scope.clickNodeIP = function (obj, index) {
        if ($scope.reqData.check_ip == obj.exe_ip) {
            obj.is_show = false;
            $scope.reqData.check_ip = '';
        } else {
            $scope.reqData.check_ip = obj.exe_ip;
            for (var i = 0; i < $scope.reqData.extra_ip_list.length; i++) {
                if (obj.exe_ip != $scope.reqData.extra_ip_list[i].exe_ip) {
                    $scope.reqData.extra_ip_list[i].is_show = false;
                } else {
                    $scope.reqData.extra_ip_list[i].is_show = true;
                }
            }
        }

    }
    //删除WAS节点
    $scope.checkDeleteFlag = function (nodeIP, event) {
        event.stopPropagation();
        nodeIP.delete_flag = !nodeIP.delete_flag;
    }
    //选中exe数据源
    $scope.clickExeDataSource = function (data_source, index, parent_index) {
        for (var i = 0; i < $scope.reqData.extra_ip_list[parent_index].exe_soc_list.length; i++) {
            if (i != index) {
                $scope.reqData.extra_ip_list[parent_index].exe_soc_list[i].state = false;
            }
        }
        $scope.reqData.extra_ip_list[parent_index].exe_soc_list[index].state = !$scope.reqData.extra_ip_list[parent_index].exe_soc_list[index].state;
    }

    $scope.clickVerNode = function (one_ver, index, pre_index) {
        if ($scope.reqData.extra_ip_list[pre_index].ver_ip_list[index].ver_soc_list.length == 0) {
            $scope.reqData.tow_soc_loading = true;
            if (_business_sys_name == '') {
                Cmpt.getAllSocList(one_ver.ver_ip, $scope.reqData.imply_type).then(function (data) {
                    var _soc_list = data.source_list || [];
                    var _ver_soc_list = [];
                    var _ver_soc_name = '';
                    for (var i = 0; i < _soc_list.length; i++) {
                        if (new RegExp('agent').test(_soc_list[i])) {
                            _ver_soc_name.exe_soc_name = _soc_list[i];
                            _ver_soc_list.push({ ver_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                        } else {
                            _ver_soc_list.push({ ver_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                        }
                    }
                    $scope.reqData.extra_ip_list[pre_index].ver_ip_list[index].ver_soc_list = _ver_soc_list;
                    $scope.reqData.tow_soc_loading = false;
                }, function (error) {
                    $scope.reqData.tow_soc_loading = false;
                    Modal.alert(error.message, 3);
                });
            } else {
                BusiSys.getSocListByIpAndBsys(_business_sys_name, one_ver.ver_ip, $scope.reqData.imply_type).then(function (data) {
                    var _soc_list = data.source_list || [];
                    var _ver_soc_list = [];
                    var _ver_soc_name = '';
                    for (var i = 0; i < _soc_list.length; i++) {
                        if (new RegExp('agent').test(_soc_list[i])) {
                            _ver_soc_name.exe_soc_name = _soc_list[i];
                            _ver_soc_list.push({ ver_soc_name: _soc_list[i].soc_name, state: true, protocol_type: _soc_list[i].protocol_type })
                        } else {
                            _ver_soc_list.push({ ver_soc_name: _soc_list[i].soc_name, state: false, protocol_type: _soc_list[i].protocol_type });
                        }
                    }
                    $scope.reqData.extra_ip_list[pre_index].ver_ip_list[index].ver_soc_list = _ver_soc_list;
                    $scope.reqData.tow_soc_loading = false;
                }, function (error) {
                    $scope.reqData.tow_soc_loading = false;
                    Modal.alert(error.message, 3);
                });
            }

        }
        for (var i = 0; i < $scope.reqData.extra_ip_list[pre_index].ver_ip_list.length; i++) {
            $scope.reqData.extra_ip_list[pre_index].ver_ip_list[i].is_check = false;
        }
        $scope.reqData.extra_ip_list[pre_index].ver_ip_list[index].is_check = true;
    };

    $scope.clickVerSource = function (one_soc, index, pre_index, p_index) {
        for (var i = 0; i < $scope.reqData.extra_ip_list[p_index].ver_ip_list[pre_index].ver_soc_list.length; i++) {
            if (i != index) {
                $scope.reqData.extra_ip_list[p_index].ver_ip_list[pre_index].ver_soc_list[i].state = false;
            }
        }
        $scope.reqData.extra_ip_list[p_index].ver_ip_list[pre_index].ver_soc_list[index].state = !$scope.reqData.extra_ip_list[p_index].ver_ip_list[pre_index].ver_soc_list[index].state;
    };
    //取消
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    $scope.sourceType_color = [
        { s_type: 1, color: "#88B8FE", bg: "#F5F9FE" },
        { s_type: 5, color: "#7BADA4", bg: "#D2F6EE" },
        { s_type: 9, color: "#FC973E", bg: "#FFF4ED" },
        { s_type: 10, color: "#88B8FE", bg: "#EAF8FC" },
        { s_type: 14, color: "#FC973E", bg: "#FFF4ED" }
    ];
    $scope.getProtocolTypeCnName = function (protocol_type) {
        return CV.findValue(protocol_type, ProtocolType);
    }
    $scope.find_dataSource_color = function (type) {
        for (var i = 0; i < $scope.sourceType_color.length; i++) {
            if ($scope.sourceType_color[i].s_type == type) {
                return $scope.sourceType_color[i].color;
            }
        }
    }
    $scope.find_dataSource_bgcolor = function (type) {
        for (var i = 0; i < $scope.sourceType_color.length; i++) {
            if ($scope.sourceType_color[i].s_type == type) {
                return $scope.sourceType_color[i].bg;
            }
        }
    }
    $scope.savebtn = function () {
        if ($scope.reqData.flag == 1) {
            for (var i = 0; i < $scope.reqData.normal_ip_list.length; i++) {
                if ($scope.reqData.normal_ip_list[i].is_show) {
                    var _soc = {};
                    _soc.soc_name_list = [];
                    _soc.ftp_soc_name_list = [];
                    _soc.soc_ip = $scope.reqData.normal_ip_list[i].soc_ip;
                    for (var j = 0; j < $scope.reqData.normal_ip_list[i].soc_name_list.length; j++) {
                        _soc.soc_name_list.push({ soc_name: $scope.reqData.normal_ip_list[i].soc_name_list[j].soc_name, protocol_type: $scope.reqData.normal_ip_list[i].soc_name_list[j].protocol_type });
                        if ($scope.reqData.normal_ip_list[i].soc_name_list[j].state) {
                            _soc.soc_name = $scope.reqData.normal_ip_list[i].soc_name_list[j].soc_name;
                            _soc.protocol_type = $scope.reqData.normal_ip_list[i].soc_name_list[j].protocol_type;
                        }
                    }
                    if ($scope.reqData.normal_ip_list[i].ftp_soc_name_list.length != 0) {
                        for (var j = 0; j < $scope.reqData.normal_ip_list[i].ftp_soc_name_list.length; j++) {
                            _soc.ftp_soc_name_list.push({ soc_name: $scope.reqData.normal_ip_list[i].ftp_soc_name_list[j].soc_name, protocol_type: $scope.reqData.normal_ip_list[i].ftp_soc_name_list[j].protocol_type });
                            if ($scope.reqData.normal_ip_list[i].ftp_soc_name_list[j].state) {
                                _soc.ftp_soc_name = $scope.reqData.normal_ip_list[i].ftp_soc_name_list[j].soc_name;
                                _soc.ftp_protocol_type = $scope.reqData.normal_ip_list[i].ftp_soc_name_list[j].protocol_type;
                            }
                        }
                    }
                    if (($scope.reqData.normal_ip_list[i].ftp_soc_name_list.length != 0 && _soc.ftp_soc_name && _soc.soc_name) || ($scope.reqData.normal_ip_list[i].ftp_soc_name_list.length == 0 && _soc.soc_name)) {
                        $scope.reqData.srv_soc.push(_soc);
                    }
                }
            }
        } else {
            if ($scope.reqData.two_soc) {
                for (var i = 0; i < $scope.reqData.extra_ip_list.length; i++) {
                    if (!$scope.reqData.extra_ip_list[i].delete_flag) {
                        var _srv_soc = {};
                        _srv_soc.exe_ip = $scope.reqData.extra_ip_list[i].exe_ip;
                        _srv_soc.exe_soc_list = [];
                        _srv_soc.ver_soc_list = [];
                        for (var j = 0; j < $scope.reqData.extra_ip_list[i].exe_soc_list.length; j++) {
                            _srv_soc.exe_soc_list.push({ soc_name: $scope.reqData.extra_ip_list[i].exe_soc_list[j].exe_soc_name, protocol_type: $scope.reqData.extra_ip_list[i].exe_soc_list[j].protocol_type });
                            if ($scope.reqData.extra_ip_list[i].exe_soc_list[j].state) {
                                _srv_soc.exe_soc_name = $scope.reqData.extra_ip_list[i].exe_soc_list[j].exe_soc_name;
                                _srv_soc.exe_protocol_type = $scope.reqData.extra_ip_list[i].exe_soc_list[j].protocol_type;
                            }
                        }
                        for (var k = 0; k < $scope.reqData.extra_ip_list[i].ver_ip_list.length; k++) {
                            if ($scope.reqData.extra_ip_list[i].ver_ip_list[k].is_check) {
                                _srv_soc.ver_ip = $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_ip;
                                for (var m = 0; m < $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list.length; m++) {
                                    _srv_soc.ver_soc_list.push({ soc_name: $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list[m].ver_soc_name, protocol_type: $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list[m].protocol_type });
                                    if ($scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list[m].state) {
                                        _srv_soc.ver_soc_name = $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list[m].ver_soc_name;
                                        _srv_soc.ver_protocol_type = $scope.reqData.extra_ip_list[i].ver_ip_list[k].ver_soc_list[m].protocol_type;

                                    }
                                }
                                break;
                            }
                        }
                        if (_srv_soc.exe_soc_name && _srv_soc.ver_soc_name) {
                            $scope.reqData.srv_soc.push(_srv_soc);
                        }
                    }
                }

            } else {

                for (var i = 0; i < $scope.reqData.normal_ip_list.length; i++) {
                    if ($scope.reqData.normal_ip_list[i].is_show) {
                        var _soc = {};
                        _soc.exe_soc_list = [];
                        _soc.exe_ip = $scope.reqData.normal_ip_list[i].exe_ip;
                        for (var j = 0; j < $scope.reqData.normal_ip_list[i].exe_soc_list.length; j++) {
                            _soc.exe_soc_list.push({ soc_name: $scope.reqData.normal_ip_list[i].exe_soc_list[j].exe_soc_name, protocol_type: $scope.reqData.normal_ip_list[i].exe_soc_list[j].protocol_type });
                            if ($scope.reqData.normal_ip_list[i].exe_soc_list[j].state) {
                                _soc.exe_soc_name = $scope.reqData.normal_ip_list[i].exe_soc_list[j].exe_soc_name;
                                _soc.exe_protocol_type = $scope.reqData.normal_ip_list[i].exe_soc_list[j].protocol_type;
                            }
                        }
                        if (_soc.exe_soc_name) {
                            $scope.reqData.srv_soc.push(_soc);
                        }
                    }
                }
            }
        }
        $modalInstance.close($scope.reqData.srv_soc);

    }
    //监控选择节点
    $scope.monitorSelect = function () {
        $scope.control.no_select_node = !$scope.reqData.normal_ip_list.some(function (item) { return item.is_show });
        return null;
    };

    init();
}]);
// 数据源查看
modal_m.controller('nodeSocDetailCtrl', ["$scope", "$modalInstance", "modalParam", "ProtocolType", "IML_TYPE", "CV", function ($scope, $modalInstance, modalParam, ProtocolType, IML_TYPE, CV) {
    $scope.phase = modalParam.data;

    //协议类型转化中文名
    $scope.getProtocolTypeCnName = function (protocol_type) {
        return CV.findValue(protocol_type, ProtocolType).substring(0, 5).toLowerCase();
    };
    //实现类型转化中文名
    $scope.getImplTypeCnName = function (impl_type) {
        if (impl_type) {
            if (impl_type == 9) {
                return '配置';
            } else if (impl_type == 10) {
                return '人工';
            } else {
                return CV.findValue(impl_type, IML_TYPE);
            }
        }

    };
    $scope.cancel = function () {
        $modalInstance.close(true);
    };
    $scope.ok = function () {
        $modalInstance.close(true);
    };
}]);
