'use strict';

//工单控制器
var woCtrl = angular.module('WorkorderController', []);

/**
 *案例控制器   注入顺序：angularjs自带服务->自有服务->CV
 * */
woCtrl.controller('DemoCtrl', ["$scope", function ($scope) {
    /*
     自定义变量
     只在控制器内部使用
     变量要以下划线开头
     变量只能以下划线间隔，不能出现大写字符
     语义要明确
     每一个都必须有注释
     */

    /*
     scope变量
     不在页面使用的，不能放在scope中
     scope中要尽量存放对象，不能把每个属性都单独定义
     变量只能以下划线间隔，不能出现大写字符
     语义要明确
     每一个都必须有注释
     */

    /*
     自定义方法
     只在控制器内部使用
     采用驼峰命名：getUserNameByUserId
     语义要明确
     每一个都必须有注释
     */

    /*
     初始化方法（init）
     有且仅有一个
     该方法内部不能写太复杂的逻辑，尽量拆分为多个方法
     页面的所有数据的初始化都在这个方法里定义
     这个方法在控制器最后调用
     */

    /*
     scope方法
     只有与页面交互的方法可以定义在scope里
     采用驼峰命名：getUserNameByUserId
     语义要明确
     每一个都必须有注释
     */
}]);
/**
 *导入工单
 * */
woCtrl.controller('woImportCtrl', ["$scope", "$stateParams", "$state", "Workorder", "Modal", function ($scope, $stateParams, $state, Workorder, Modal) {
    var _fileName = $stateParams.file_name ;//查询导入工单所需的文件名
    //页面信息
    $scope.info = {
        total_size  : 0 , //excel中总条数
        success_num : 0 , //总共成功的条数
        file_name   : _fileName,//文件名
    };
    //保存导入--跳转到我的工单页面
    $scope.saveImportOrder = function () {
        Workorder.importExcelWorkorder(_fileName).then(function (data) {
            $state.go('wo_mine',{tab_name : 'create'})
        }, function (error) {
            Modal.alert(error.message);
            $state.go('wo_new');
        })
    };
    //取消导入--跳转到录入工单页面
    $scope.cancel = function () {
        $state.go('wo_new');
    };
}]);
/**
 *新增工单
 * */
woCtrl.controller('woNewCtrl', ["$scope", "$timeout","$state", "$modal", "$rootScope", "Workorder","IssuFunc", "BusiSys", "Modal", "CV", function ($scope, $timeout, $state, $modal, $rootScope, Workorder,IssuFunc, BusiSys, Modal, CV) {
    var _loginuser = $rootScope.loginUser;          //当前用户信息
    var _user_cur_id = _loginuser.org_user_id;      //当前用户名
    var _user_cur_dept_id = _loginuser.org_dept_id; //当前用户部门
    //页面交互信息
    $scope.info = {
        workorder_info :{}, //故障单信息
        form : {}, //表单信息
    };
    //页面控制对象
    $scope.control = {
        workorder_save_btn_loading : false, //工单保存对象loading
    };
    //页面数据列表对象
    $scope.data = {
        workorder_errortype_list  : [], //故障类型列表
        department_list           : [], //指派部门列表
        workorder_sys_list        : [], //故障系统列表
        user_list                 : [], //指派人员列表
    };
    //页面其他配置对象
    $scope.config = {
        excel_upload : { //批量导入指令参数
            suffixs: 'xls,xlsx',
            filetype: "EXCEL",
            filename: "",
            uploadpath: ""
        }
    };
    var init = function () {
        //初始化工单对象
        $scope.info.workorder_info = IssuFunc.initWorkOrderInfo($scope.info.workorder_info,_user_cur_dept_id);
        //通过部门id选择staff
        $scope.loadStaffObj($scope.info.workorder_info.deal_dept_id);
        //获得工单导入路径
        Workorder.getOrderUploadPath().then(function (data) {
            $scope.config.excel_upload.uploadpath = data.order_upload_path ? data.order_upload_path : '';
        }, function (error) {
            Modal.alert(error.message);
        });
        //查询故障类型列表
        Workorder.getTroubleTypeList().then(function (data) {
            $timeout(function () {
                $scope.data.workorder_errortype_list = data.trouble_type_list ? data.trouble_type_list : [];
            }, 0)
        }, function (error) {
            Modal.alert(error.message);
        });
        //查询系统列表
        BusiSys.getAllBusinessSys().then(function (data) {
            $timeout(function () {
                $scope.data.workorder_sys_list = data.list_bs ? data.list_bs : [];
            }, 0)
        }, function (error) {
            Modal.alert(error.message);
        });
        //查询可选部门
        Workorder.getAppointDepartmentList().then(function (data) {
            $timeout(function () {
                $scope.data.department_list = data.dept_list ? data.dept_list : [];
            }, 0)
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //导入工单成功
    $scope.importSuccessThen = function () {
        $state.go('wo_import',{file_name : $scope.config.excel_upload.filename});
    };
    //选择工单类型
    $scope.changeOrderType = function (flag) {
        //初始化工单对象
        $scope.info.workorder_info = IssuFunc.initWorkOrderInfo($scope.info.workorder_info,_user_cur_dept_id,flag);
        $scope.loadStaffObj($scope.info.workorder_info.deal_dept_id);
        //初始化表单验证
        $scope.info.form.workorder_form.$setPristine();
    };
    //通过部门id选择staff
    $scope.loadStaffObj = function (dept_id) {
        Workorder.getAppointStaffList(dept_id).then(function (data) {
            $timeout(function () {
                $scope.data.user_list = data.user_list ? data.user_list : [];
            }, 0)
        }, function (error) {
            Modal.alert(error.message);
        });
        if (dept_id != _user_cur_dept_id) {
            $scope.info.workorder_info.deal_user_id = '';
        } else {
            $scope.info.workorder_info.deal_user_id = _user_cur_id;
        }
    };
    //保存维护信息
    $scope.formSubmit = function () {
        $scope.control.workorder_save_btn_loading = true;
        //表单验证
        if (!CV.valiForm($scope.info.form.workorder_form)) {
            $scope.control.workorder_save_btn_loading = false;
            return false;
        }
        $scope.info.workorder_info.urgency_level = $scope.info.workorder_info.urgency_state ? 2 : 1;
        $scope.info.workorder_info.trouble_key = $scope.info.workorder_info.trouble_key ? $scope.info.workorder_info.trouble_key : 0;
        //提交表单
        Workorder.saveWorkorderInfo($scope.info.workorder_info).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.control.workorder_save_btn_loading = false;
                    $scope.info.workorder_info.order_seq = data.order_seq ? data.order_seq : '';
                    $modal.open({
                        templateUrl: 'templates/modal/workorder_conform.html',
                        controller: ["$scope", "$modalInstance","workOrderInfo", "CV",  function ($scope, $modalInstance,workOrderInfo, CV ) {
                            //信息对象
                            $scope.info = {
                                workorder_info : workOrderInfo,
                            };
                            $scope.continueWorkOrder = function () {
                                $modalInstance.close(1);
                            };
                            $scope.dealWorkOrder = function () {
                                $modalInstance.close(2);
                            };
                            $scope.cancelWorkOrder = function () {
                                $modalInstance.close(3);
                            };
                        }],
                        backdrop: 'static',
                        keyboard: false,
                        size: 'md',
                        resolve: {
                            workOrderInfo: function () {
                                return $scope.info.workorder_info;
                            }
                        },
                    }).result.then(function (data) {
                            if (data == 1) {
                                $scope.changeOrderType(1);
                            } else if (data == 2) {
                                $state.go('wo_mine',{tab_name : 'handle',order_seq : $scope.info.workorder_info.order_seq});
                            } else {
                                //取消处理则回到我创建的工单
                                $state.go('wo_mine',{ tab_name : 'create'});
                            }
                        });
                }
            }, 0)
        }, function (error) {
            $scope.control.workorder_save_btn_loading = false;
            Modal.alert(error.message);
        });
    };
    //取消
    $scope.formCancel = function () {
        //取消退回到我创建的工单列表
        $state.go('wo_mine',{ tab_name : 'create'});
    };
    //初始化
    init();
}]);
/**
 *工单修改
 * */
woCtrl.controller('woModifyCtrl', ["$scope", "$timeout","$state", "$stateParams", "Workorder","IssuFunc", "BusiSys", "Modal", "CV", function ($scope, $timeout,$state, $stateParams, Workorder,IssuFunc, BusiSys, Modal, CV) {
    var _order_seq = $stateParams.wo_seq; //获取工单编号
    //页面信息对象
    $scope.info ={
        workorder_info : {}, //故障维护信息
        form:{},//表单对象
    };
    //页面控制对象
    $scope.control = {
        edit_flag                  : true,  //工单修改标志
        workorder_info_btn_loading : false, //工单加载信息loading
        workorder_save_btn_loading : false ,//工单保存信息按钮loading
    };
    //故障信息列表数据
    $scope.data = {
        workorder_errortype_list : [], //故障类型列表
        workorder_sys_list       : [], //故障系统列表
    };
    var init = function () {
        IssuFunc.initWorkOrderInfo($scope.info.workorder_info);
        $scope.control.workorder_info_btn_loading = true;
        //查询工单信息
        Workorder.getWorkorder(_order_seq).then(function (data) {
            $timeout(function () {
                if(data.woorderbean){
                    $scope.control.workorder_info_btn_loading = false;
                    $scope.info.workorder_info = data.woorderbean ? data.woorderbean : {};
                    $scope.info.workorder_info.urgency_state = $scope.info.workorder_info.urgency_level == 2 ? true : false;
                }
            });
        }, function (error) {
            $scope.control.workorder_info_btn_loading = false;
            Modal.alert(error.message);
            //若数据返回出错则返回列表
            $state.go('wo_mine',{ tab_name : 'create'});
        });
        //查询故障类型列表
        Workorder.getTroubleTypeList().then(function (data) {
            $timeout(function () {
                $scope.data.workorder_errortype_list = data.trouble_type_list ? data.trouble_type_list : [];
            }, 0)
        }, function (error) {
            Modal.alert(error.message);
        });
        //查询系统列表
        BusiSys.getAllBusinessSys().then(function (data) {
            $timeout(function () {
                $scope.data.workorder_sys_list = data.list_bs ? data.list_bs : [];
            }, 0)
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //保存维护信息
    $scope.formSubmit = function () {
        $scope.control.workorder_save_btn_loading = true;
        //表单验证
        if (!CV.valiForm($scope.info.form.workorder_form)) {
            $scope.control.workorder_save_btn_loading = false;
            return false;
        }
        $scope.info.workorder_info.urgency_level = $scope.info.workorder_info.urgency_state ? 2 : 1;
        //提交表单
        Workorder.updateWorkorder($scope.info.workorder_info).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.control.workorder_save_btn_loading = false;
                    Modal.alert("编号 " + $scope.info.workorder_info.order_seq + "  工单已修改成功！");
                    $state.go('wo_mine',{ tab_name : 'create'});
                }
            }, 0)
        }, function (error) {
            $scope.control.workorder_save_btn_loading = false;
            Modal.alert(error.message);
        });
    };
    //取消
    $scope.formCancel = function () {
        //取消退回到我创建的工单列表
        $state.go('wo_mine',{ tab_name : 'create'});
    };
    //初始化
    init();
}]);
/**
 *我的工单
 * */
woCtrl.controller('woMineCtrl', ["$scope", "$timeout","$state","$stateParams","$location","Workorder","CodeMirrorOption","Program","WoStatusType","WoFlowType","BucketType","SqlExec","IssuFunc", "Modal", "CV", function ($scope, $timeout, $state, $stateParams, $location, Workorder,CodeMirrorOption,Program, WoStatusType, WoFlowType,BucketType, SqlExec,IssuFunc,Modal, CV) {
    var _tab_name = $stateParams.tab_name; //tab页名称
    var _order_seq = $stateParams.order_seq;//工单录入后处理工单才会存在
    var _url = $location.absUrl(); //地址栏
    $scope.form = {};
    //页面工单数量信息
    $scope.info = {
        pending_number : 0 , //待处理工单数量
    };
    //页面跳转控制对象
    $scope.control = {
        active_tab : '', //活动页tab
        exist_index : -1,//工单tab页是否已经打开标志
    };
    //页面data
    $scope.data = {
        sub_tabs : [],   //正在处理工单的工单列表
        sql_sys_list: [], //sql处理--获取业务系统列表
    };
    //根据tabName切换相应工单列表
    var goToWorkOrderList = function (tab_name) {
        if(tab_name == 'create'){
            $scope.control.active_tab = 'create';
            $state.go('wo_mine.create_list');
        }
        if(tab_name && tab_name == 'pending'){
            $scope.control.active_tab = 'pending';
            $state.go('wo_mine.pending_list');
        }
        if(tab_name && tab_name == 'processed'){
            $scope.control.active_tab = 'processed';
            $state.go('wo_mine.processed_list');
        }
        if(tab_name && tab_name == 'handle'){
            $scope.control.active_tab = 'handle';
            $state.go('wo_mine.wo_handle');
        }
    };
    //刷新浏览器根据url判断进入到哪个列表
    var goToWorkOrderListByUrl = function () {
        var _reg_create = /\/wo_mine\/create_list/g;
        var _reg_pending = /\/wo_mine\/pending_list/g;
        var _reg_processed = /\/wo_mine\/processed_list/g;
        var _reg_handle = /\/wo_mine\/wo_handle/g;
        if(_reg_create.test(_url)){
            $scope.control.active_tab = 'create';
            $state.go('wo_mine.create_list');
        }
        if(_reg_pending.test(_url)){
            $scope.control.active_tab = 'pending';
            $state.go('wo_mine.pending_list');
        }
        if(_reg_processed.test(_url)){
            $scope.control.active_tab = 'processed';
            $state.go('wo_mine.processed_list');
        }
        if(_reg_handle.test(_url)){
            $scope.control.active_tab = 'handle';
            $state.go('wo_mine.wo_handle');
        }
    };
    //处理工单--加载已存在的数据
    var loadExsitData = function (wo_id ,_original_handle_type,_sqlexe_type,wokrder_bean,flag,is_detail) {
        $scope.control.exist_index = -1;
        for (var i = 0; i < $scope.data.sub_tabs.length; i++) {
            var _sub_tab = $scope.data.sub_tabs[i];
            _sub_tab.active = false;
            if (wo_id == _sub_tab.wo_id) {
                $scope.control.exist_index = i;
            }
        }
        if ($scope.control.exist_index != -1 && $scope.data.sub_tabs[$scope.control.exist_index].handle_type) {
            var _exist_sub_tab = $scope.data.sub_tabs[$scope.control.exist_index];
            _exist_sub_tab.active = true;
            _exist_sub_tab.is_detail = is_detail;
            //是查看并且是未处理--展开详细信息
            _exist_sub_tab.show_all_detail = false;
        } else {
            //单个tab页信息
            var _sub_tab_obj = {
                task_id: '',  //任务id
                is_detail : is_detail,  //是否是查看标志
                wo_id: wo_id,           //工单编号
                active: true,           //tab页活动标志
                show_all_detail: false, //展开收起详情
                steps: [],              //方案步骤列表
                program_seq: '',        //方案编号
                program_name: '',      //方案中文名
                sql_steps: [],        //sql步骤列表
                flowData: [],          //工单流转信息
                wo_handle_loading: false, //加载loading
                temp_handle_type: _original_handle_type, //临时处理方式
                handle_type: _original_handle_type,    //默认工单处理方式为（固化方案）
                original_handle_type: _original_handle_type, //原始处理方式
                script_info: {   //脚本信息
                    rollback_flag: false, //回退标志
                    stop_watch_flag: false,//停止监控标志
                    execute_list: [],    //执行列表
                    form_control: {     //表单控制
                        executing: false, //执行中
                        is_rollback: false,//是否回退
                        exec_result_list: [],//执行结果列表
                        cache_soc_list: [],//缓存数据源列表
                        exec_result: '',//执行结果
                    },
                    data: {  //临时数据
                        soc_name_list: [],//执行数据源名列表
                        ftp_soc_name_list: [],//ftp数据源名列表
                        impl_type_list: [{key: 2, value: 'shell'}, {key: 7, value: 'python2'}, {key: 8,value: 'python3'}],
                    },
                    script_fileupload: { //脚本上传控件
                        suffixs: 'sh',
                        filetype: "SHELL",
                        filename: "",
                        uploadpath: ""
                    },
                    view_options: CodeMirrorOption.Sh(true), //查看执行脚本
                    edit_options: CodeMirrorOption.Sh(), //编辑执行脚本
                    python_options: CodeMirrorOption.Python(), //编辑执行脚本
                    view_python_options: CodeMirrorOption.Python(true), //编辑执行脚本
                    script_form: {
                        soc_list: [],
                        script_source: 1,
                        exe_script: '',
                        script_content: [],
                        script_file_path: '',
                        impl_type: ''
                    },
                },
                sql_soc_list: [],
                batch_fileupload: {  //批量上传控件
                    suffixs: 'sql',
                    filetype: "SQL",
                    filename: "",
                    uploadpath: ""
                },
                control: {}
            };
            if ($scope.data.sub_tabs[$scope.control.exist_index]) {
                $scope.data.sub_tabs[$scope.control.exist_index] = _sub_tab_obj;
            } else {
                $scope.data.sub_tabs.push(_sub_tab_obj);
            }
            //是查看并且是未处理--展开详细信息
            var _last_sub_tab = $scope.data.sub_tabs[$scope.data.sub_tabs.length - 1];
            _last_sub_tab.show_all_detail = false;
            _last_sub_tab.exc_step_flag = false;
            //工单基本信息赋值
            _last_sub_tab.basicData = angular.copy(wokrder_bean);
            //handle_type：1 sql维护,2 方案维护,3执行脚本 4 5
            var _handle_type = _last_sub_tab.basicData.handle_type ? _last_sub_tab.basicData.handle_type : _original_handle_type;
            var _order_seq = _last_sub_tab.basicData.order_seq;
            _last_sub_tab.basicData.order_cn_state = CV.findValue(_last_sub_tab.basicData.order_state, WoStatusType);
            _last_sub_tab.handle_type = _handle_type ? _handle_type : _original_handle_type;
            _last_sub_tab.temp_handle_type = _handle_type ? _handle_type : _original_handle_type;
            _last_sub_tab.original_handle_type = _handle_type ? _handle_type : _original_handle_type;
            _last_sub_tab.basicData.sqlexe_type = _last_sub_tab.basicData.sqlexe_type ? _last_sub_tab.basicData.sqlexe_type : _sqlexe_type;
            _last_sub_tab.sqlexe_type = _last_sub_tab.basicData.sqlexe_type ? _last_sub_tab.basicData.sqlexe_type : _sqlexe_type;
            _last_sub_tab.basicData.flag = flag;
            if (_last_sub_tab.basicData.sys_name) {
                Program.getSocByBusy(_last_sub_tab.basicData.sys_name, 1).then(function (data) {
                    $timeout(function () {
                        if (data) {
                            _last_sub_tab.sql_soc_list = [];
                            var _soc_list = data.source_list ? data.source_list : [];
                            for(var i = 0 ; i < _soc_list.length; i++){
                                _last_sub_tab.sql_soc_list.push(_soc_list[i].soc_name);
                            }
                        }
                    }, 0);
                }, function (error) {
                    Modal.alert(error.message);
                });
            }
            if (flag == 2) {
                //Sql维护--手工输入/数据导出
                if ( _last_sub_tab.sqlexe_type == 1 || _handle_type == 4) {
                    //获得已提交的SQL列表数据
                    SqlExec.submitedSqlList(_order_seq, _last_sub_tab.basicData.deal_bk_seq).then(function (data) {
                        var _sql_msg_list = data.sql_msg_list ? data.sql_msg_list : [];
                        angular.forEach(_sql_msg_list, function (item) {
                            if (item.pend_work_seq) {
                                item.is_single_task_author = true;
                            }
                            item.generate_sql = {
                                generate_sql_list:[]
                            }
                        });
                        if (_sql_msg_list) {
                            _last_sub_tab.sql_steps = _sql_msg_list;
                            //sql时段类型转中文
                            IssuFunc.sqlBucketTranslateCnType(_last_sub_tab.sql_steps);
                            //全部提交按钮--隐藏/显示
                            IssuFunc.sqlHandleAllSubmitBtnControl(_last_sub_tab);
                            //放弃处理按钮--隐藏/显示
                            IssuFunc.quitHandleBtnControl(_last_sub_tab);
                            //完成处理按钮--隐藏/显示
                            IssuFunc.finishHandleBtnControl(_last_sub_tab);
                        }
                    }, function (error) {
                        Modal.alert(error.message);
                    });
                }
            }
            //获得工单流转信息
            Workorder.getWorkorderFlowList(wo_id).then(function (data) {
                //工单处理信息加载
                _last_sub_tab.wo_handle_loading = true;
                _last_sub_tab.flowData = data.order_flow_list ? data.order_flow_list : {};
                //合并处理时间并且转化流转状态
                for (var i = 0; i < _last_sub_tab.flowData.length; i++) {
                    if (_last_sub_tab.flowData[i].deal_bk_date) {
                        _last_sub_tab.flowData[i].deal_time = _last_sub_tab.flowData[i].deal_bk_date + ' ' + _last_sub_tab.flowData[i].deal_bk_time.substring(0, _last_sub_tab.flowData[i].deal_bk_time.length - 3);
                    }
                    _last_sub_tab.flowData[i].flow_type = CV.findValue(_last_sub_tab.flowData[i].flow_type, WoFlowType);
                }
            }, function (error) {
                Modal.alert(error.message);
            });
        }
        //跳转页面
        $scope.control.active_tab = 'handle';
        $state.go('wo_mine.wo_handle');
    };

    var init = function () {
        if(!_tab_name){
            goToWorkOrderListByUrl()
        }else{
            goToWorkOrderList(_tab_name);
        }
        $scope.getPendingWorkorderNumber();
        if(_order_seq){
            Workorder.getWorkorder(_order_seq).then(function (data) {
                var _stop_yn_flag = data.woorderbean.stop_yn_flag ? data.woorderbean.stop_yn_flag : 1;
                $scope.addProcessOrder(_order_seq, false, _stop_yn_flag);
            }, function (error) {
                Modal.alert(error.message);
            });
        }
    };
    //获得未处理工单条数(表格指令也在用)
    $scope.getPendingWorkorderNumber = function () {
        Workorder.queryWoOrderNumber().then(function (data) {
            //查询个数
            $scope.info.pending_number = data.process_num ? data.process_num : 0;
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //移除当前处理工单(表格指令也在用)
    $scope.closeProcessOrder = function (index, wo_id) {
        if(index == -1){
            angular.forEach($scope.data.sub_tabs,function(data,_index,array){
                if(data.wo_id == wo_id){
                    array.splice(_index,1);
                }
            });
        }else{
            Modal.confirm("确认关闭当前处理页面？").then(function (choose) {
                if (choose) {
                    $scope.data.sub_tabs.splice(index, 1);
                }
            });
        }
    };
    //根据tabName切换相应工单列表
    $scope.switchTab = function (tab_name){
        $scope.control.active_tab = tab_name;
        if(tab_name == 'create'){
            $state.go('wo_mine.create_list');
        }
        if(tab_name == 'pending'){
            $state.go('wo_mine.pending_list');
        }
        if(tab_name == 'processed'){
            $state.go('wo_mine.processed_list');
        }
        if(tab_name == 'handle'){
            if($scope.data.sub_tabs.length !=0){
                $scope.control.exist_index = $scope.data.sub_tabs.length -1;
            }
            $state.go('wo_mine.wo_handle');
        }
    };
    //新加入处理工单
    $scope.addProcessOrder = function (wo_id, is_detail, stop_yn_flag) {
        var _original_handle_type = null;//存储工单临时处理方式
        var _sqlexe_type = null;//sql执行方式
        var _wokrderbean = {};//工单信息
        var _deal_bk_seq = 0;//工单处理流水号
        if (stop_yn_flag == 1 && !is_detail) {
            Modal.chooseHandleType(wo_id).then(function (data) {
                if (data.temp_handle_type == 1) { //手工sql
                    _original_handle_type = 1;
                    _sqlexe_type = 1;
                } else if (data.temp_handle_type == 4) { //批量sql
                    _original_handle_type = 1;
                    _sqlexe_type = 2;
                } else if (data.temp_handle_type == 5) { //数据导出
                    _original_handle_type = 4;
                } else {
                    _original_handle_type = parseInt(data.temp_handle_type);
                }
                //获取工单处理信息
                Workorder.getHandlerType(wo_id, _original_handle_type, _sqlexe_type).then(function (data) {
                    _deal_bk_seq = data.deal_bk_seq ? data.deal_bk_seq : 0;
                    //获得工单基本信息
                    Workorder.getWorkorder(wo_id).then(function (data) {
                        _wokrderbean = data.woorderbean ? angular.copy(data.woorderbean) : {};
                        loadExsitData(wo_id,_original_handle_type,_sqlexe_type,angular.copy(_wokrderbean),1,is_detail);
                    }, function (error) {
                        Modal.alert(error.message);
                    });

                }, function (error) {
                    Modal.alert(error.message);
                });
            });
        } else {
            Workorder.getWorkorder(wo_id).then(function (data) {
                _wokrderbean = data.woorderbean ? angular.copy(data.woorderbean) : {};
                _deal_bk_seq = _wokrderbean.deal_bk_seq;
                loadExsitData(wo_id,_original_handle_type,_sqlexe_type,angular.copy(_wokrderbean),2,is_detail);
            }, function (error) {
                Modal.alert(error.message);
            });
        }
    };
    init()
}]);
/**
 *处理工单
 * */
woCtrl.controller('woHandleCtrl', ["$scope", "$timeout","$state","$stateParams","Workorder","Task","BusiSys","IssuFunc", "Modal", "CV", function ($scope, $timeout, $state, $stateParams, Workorder,Task,BusiSys,IssuFunc, Modal, CV) {
    //handle控制
    $scope.handle_control = {
        curr_index      : 0, //当前工单tab页下标
    };
    //得到目前工单的处理页面的下标
    var getSubTabsIndex = function () {
        var _index;
        for (var i = 0; i < $scope.data.sub_tabs.length; i++) {
            if ($scope.data.sub_tabs[i].active) {
                _index = i;
                break;
            }
        }
        return _index;
    };
    //工单基本信息和扭转信息
    var init = function () {
        //获取当前的tab页下标（表格指令中使用）
        $scope.handle_control.curr_index = getSubTabsIndex() || 0;
        //固化方案中按钮控制（指令中的控制）
        $scope.pgauthflag = {
            btn_loading: false
        };
        //获取业务系统列表(sql处理时用到的数据)
        BusiSys.getAllBusinessSys().then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.data.sql_sys_list = data.list_bs ? data.list_bs : [];
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    /*子控制器中公用的方法*/
    //手工sql/数据导出--查看授权任务信息
    $scope.viewTaskAuthorDetail = function (sub_tab, step) {
        var _task_id = step ? step.pend_work_seq : sub_tab.task_id;
        Modal.viewBatchImportAuthorDetail(_task_id).then(function (workflow_state) {
            if (workflow_state) {
                if (step) {
                    step.workflow_state = workflow_state;
                } else {
                    sub_tab.workflow_state = workflow_state;
                    sub_tab.control.finish_author = workflow_state == 6 ? true : false;
                }
            }
        });
    };
    //手工sql/数据导出/批量sql-关闭授权任务
    $scope.closeBatchExeTask = function (sub_tab, step, flag, index) {
        var param = {
            'pend_wk_seq': step.pend_work_seq,
            'workflow_state': 7
        };
        step.is_close_loading = true;
        Task.CloseTask(param).then(function (data) {
            step.workflow_state = 7;
            step.is_close_loading = false;
            step.is_single_task_author = false;
            //flag:(1：手工，2:批量,3:手工select后的修改sql)
            if (flag != 3) {
                sub_tab.sql_steps.splice(index, 1);
            } else {
                step.all_executesql_success = true;
                step.generate_sql_list = [];
                step.is_generate_sql_author = false;
            }
            //放弃处理按钮--隐藏/显示
            IssuFunc.quitHandleBtnControl(sub_tab);
            //完成处理按钮--隐藏/显示
            IssuFunc.finishHandleBtnControl(sub_tab);
            Modal.alert("任务成功关闭！");
        }, function (error) {
            step.is_close_loading = false;
            Modal.alert(error.message);
        });
    };
    //暂无工单处理时跳转到待处理工单列表
    $scope.goToPendingList = function (){
        $scope.control.active_tab = 'pending';
        $state.go('wo_mine.pending_list');
    };
    //放弃处理
    $scope.abandonHandle = function (sub_tab) {
        var _index = getSubTabsIndex();
        var _handle_type = sub_tab.handle_type;
        var _order_seq = sub_tab.basicData.order_seq;
        var _deal_bk_seq = sub_tab.basicData.deal_bk_seq;
        Modal.confirm("确认放弃对工单的处理？").then(function (choose) {
            if (choose) {
                Workorder.wo_StopOrderAction(_handle_type, _order_seq, _deal_bk_seq).then(function (data) {
                    $scope.data.sub_tabs.splice(_index, 1);
                }, function (error) {
                    Modal.alert(error.message);
                });
            }
        });
    };
    //完成处理
    $scope.finishDealWorkOrder = function (sub_tab) {
        Modal.confirm("确认完成工单处理 ?").then(function (choose) {
            if (choose) {
                //得到当前展开的tab下标
                var _index = getSubTabsIndex();
                Workorder.complateOrder(sub_tab.wo_id).then(function (data) {
                    $scope.data.sub_tabs.splice(_index, 1);
                    //获得未处理工单条数
                    $scope.getPendingWorkorderNumber();
                }, function (error) {
                    Modal.alert(error.message);
                });
            }
        });
    };
    init();
}]);
//工单处理--手工sql
woCtrl.controller('woSqlHandCtrl', ["$scope", "$timeout", "$interval", "$modal", "Workorder", "Program", "WoFlowType", "ProgramExec", "SqlExec", "IssuFunc", "WoStatusType", "CodeMirrorOption", "Cmpt", "CommData", "Task", "ScriptExec", "CmptFunc", "BusiSys", "Modal", "CV", function ($scope, $timeout, $interval, $modal, Workorder, Program, WoFlowType, ProgramExec, SqlExec, IssuFunc, WoStatusType, CodeMirrorOption, Cmpt, CommData, Task, ScriptExec, CmptFunc, BusiSys, Modal, CV) {
    //sql维护--修改的sql表格信息
    $scope.modify_info = {
        sql_work_seq: '', //sql流水号
        theads: '', //表头
        modify_string: '', //修改的表内容
        modify_list: []  //修改的列表
    };
    //查询对应的分页数据
    var getInfoByPage = function (obj) {
        var _select_sql_list = [];
        var start_num = obj.sql_step.page.current_page * 10;
        _select_sql_list.push({
            sql_work_seq: obj.sub_tab.sql_steps[obj.sql_step_index].sql_work_seq,
            sql_text: obj.sub_tab.sql_steps[obj.sql_step_index].sql_text,
            order_seq: obj.sub_tab.basicData.order_seq,
            deal_bk_seq: obj.sub_tab.basicData.deal_bk_seq
        });
        obj.sql_step.page_data_loading = true;
        SqlExec.execSelectSqlList(_select_sql_list, start_num, 10).then(function (data) {
            $timeout(function () {
                if (data.query_msg) {
                    obj.sql_step.page_data_loading = false;
                    obj.sql_step.read_only = (obj.sql_step.generate_sql.all_executesql_success && obj.sql_step.generate_sql.generate_sql_list.length != 0) ? true:false;
                    for (var i = 0; i < data.query_msg.length; i++) {
                        if (data.query_msg[i].theads) {
                            data.query_msg[i].theads = IssuFunc.setPrimaryKeySort(data.query_msg[i].theads);
                        }
                    }
                    //分页数据生成
                    IssuFunc.createPageNumberByData(obj.sql_step, data.query_msg);
                    var _query_msg_list = data.query_msg;
                    //sql查询信息
                    IssuFunc.getSqlMsgList(_query_msg_list, obj.sub_tab.sql_steps);
                    //全部提交按钮--隐藏
                    obj.sub_tab.show_all_submit_btn = false;
                    //提交按钮--加载
                    obj.sub_tab.sql_steps[obj.sql_step_index].submit_sql_btn_loading = false;
                    //放弃处理按钮--隐藏/显示
                    IssuFunc.quitHandleBtnControl(obj.sub_tab);
                    //完成处理按钮--隐藏/显示
                    IssuFunc.finishHandleBtnControl(obj.sub_tab);
                }
            }, 0);
        }, function (error) {
            obj.sql_step.page_data_loading = false;
            obj.sub_tab.sql_steps[obj.sql_step_index].submit_sql_btn_loading = false;
            if (error.task_id) {
                obj.sub_tab.sql_steps[obj.sql_step_index].pend_work_seq = error.task_id;
                obj.sub_tab.sql_steps[obj.sql_step_index].is_single_task_author = true;
                //放弃处理按钮--隐藏/显示
                IssuFunc.quitHandleBtnControl(obj.sub_tab);
            } else {
                Modal.alert(error.message);
            }
        });
    };
    //手工sql/数据导出--添加sql语句
    $scope.addHandleSQL = function (sub_tab) {
        IssuFunc.addSqlText(sub_tab);
    };
    //手工sql/数据导出--删除单条sql语句
    $scope.deleteSqlStep = function (sql_work_seq, index, sub_tab, sql_text) {
        IssuFunc.deleteHandleSqlText(sql_text,sql_work_seq,sub_tab,index);
    };
    //手工sql/数据导出--查看Sql详细步骤
    $scope.viewSqlStepDetailModal = function (sql_work_seq) {
        Modal.viewSqlDetailStep(sql_work_seq).then(function () {});
    };
    //手工sql--提交--单个SQL操作
    $scope.submitSqlStep = function (sql_step, sql_step_index, sub_tab, start_num, end_num) {
        var _select_sql_list = [];
        var _modify_sql_list = [];
        var _sql_info_list = [];
        var _unsubmit_sql_steps = '';
        //分页查询
        var _start_num = start_num ? start_num : 0;
        var _end_num = end_num ? end_num : 10;
        Modal.confirmSqlStatement(sql_step, _unsubmit_sql_steps).then(function () {
            //显示提交加载按钮
            sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = true;
            //提交单个sql
            if (sub_tab.sql_steps[sql_step_index].sql_type == 1) {
                _select_sql_list.push({
                    sql_work_seq: sub_tab.sql_steps[sql_step_index].sql_work_seq,
                    sql_text: sub_tab.sql_steps[sql_step_index].sql_text,
                    order_seq: sub_tab.basicData.order_seq,
                    deal_bk_seq: sub_tab.basicData.deal_bk_seq
                });
                //手工SQL-执行批量查询
                SqlExec.execSelectSqlList(_select_sql_list, _start_num, _end_num).then(function (data) {
                    $timeout(function () {
                        if (data.query_msg) {
                            for (var i = 0; i < data.query_msg.length; i++) {
                                if (data.query_msg[i].theads) {
                                    data.query_msg[i].theads = IssuFunc.setPrimaryKeySort(data.query_msg[i].theads);
                                }
                            }
                            //分页数据生成
                            IssuFunc.createPageNumberByData(sql_step, data.query_msg);
                            var _query_msg_list = data.query_msg;
                            //sql查询信息
                            IssuFunc.getSqlMsgList(_query_msg_list, sub_tab.sql_steps);
                            //全部提交按钮--隐藏
                            sub_tab.show_all_submit_btn = false;
                            //提交按钮--加载
                            sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
                            //放弃处理按钮--隐藏/显示
                            IssuFunc.quitHandleBtnControl(sub_tab);
                            //完成处理按钮--隐藏/显示
                            IssuFunc.finishHandleBtnControl(sub_tab);
                        }
                    }, 0);
                }, function (error) {
                    sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
                    if (error.task_id) {
                        sub_tab.sql_steps[sql_step_index].pend_work_seq = error.task_id;
                        sub_tab.sql_steps[sql_step_index].is_single_task_author = true;
                        //放弃按钮显示隐藏
                        IssuFunc.quitHandleBtnControl(sub_tab);
                    } else {
                        Modal.alert(error.message);
                    }
                });
            } else {
                _modify_sql_list.push({
                    sql_work_seq: sub_tab.sql_steps[sql_step_index].sql_work_seq,
                    sql_text: sub_tab.sql_steps[sql_step_index].sql_text,
                    order_seq: sub_tab.basicData.order_seq,
                    deal_bk_seq: sub_tab.basicData.deal_bk_seq
                });
                _sql_info_list.push({
                    sql_work_seq: sub_tab.sql_steps[sql_step_index].sql_work_seq,
                    sql_text: sub_tab.sql_steps[sql_step_index].sql_text
                });
                //手工SQL-执行批量变更
                SqlExec.execModifySqlList(_modify_sql_list, _sql_info_list).then(function (data) {
                    $timeout(function () {
                        if (data.modify_msg) {
                            var _modify_msg_list = data.modify_msg;
                            //提交按钮--加载
                            sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
                            //全部提交按钮--隐藏
                            sub_tab.show_all_submit_btn = false;
                            //sql变更信息
                            IssuFunc.getSqlMsgList(_modify_msg_list, sub_tab.sql_steps);
                            //放弃处理按钮--隐藏/显示
                            IssuFunc.quitHandleBtnControl(sub_tab);
                            //完成处理按钮--隐藏/显示
                            IssuFunc.finishHandleBtnControl(sub_tab);
                        }
                    }, 0);
                }, function (error) {
                    sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
                    if (error.task_id) {
                        sub_tab.sql_steps[sql_step_index].pend_work_seq = error.task_id;
                        sub_tab.sql_steps[sql_step_index].is_single_task_author = true;
                        //放弃处理按钮--隐藏/显示
                        IssuFunc.quitHandleBtnControl(sub_tab);
                    } else {
                        Modal.alert(error.message);
                    }
                });
            }
        });
    };
    //手工sql--提交单个授权(可能是查询sql、可能是修改sql)
    $scope.submitSingleSqlAuthor = function(sql_step, sql_step_index, sub_tab){
        var srvName = '';
        var _srvReqData = {};
        sub_tab.sql_steps[sql_step_index].is_close_loading = true;
        if (sub_tab.sql_steps[sql_step_index].sql_type == 1) {
            srvName = 'sl_ExecuteQuerySqlAction';
            _srvReqData = {
                submit_type: 2,
                pend_work_seq: sql_step.pend_work_seq,
                query_sql_list: [],
                sql_text: sub_tab.sql_steps[sql_step_index].sql_text,
                sensite_list: sub_tab.sql_steps[sql_step_index].sensite_list
            };
        } else { //修改sql服务
            srvName = "sl_ExecuteModifySqlAction";
            _srvReqData = {
                submit_type: 2, pend_work_seq: sql_step.pend_work_seq, modify_sql_list: []
            };
        }
        //显示提交加载按钮
        sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = true;
        Task.ExecuteTask(_srvReqData, srvName).then(function (data) {
            $timeout(function () {
                if (data) {
                    var _query_msg_list = [];
                    sub_tab.sql_steps[sql_step_index].is_close_loading = false;
                    sub_tab.sql_steps[sql_step_index].is_single_task_author = false;
                    if (sub_tab.sql_steps[sql_step_index].sql_type == 1){
                         _query_msg_list = data.query_msg ? data.query_msg : [];
                        for (var i = 0; i < data.query_msg.length; i++) {
                            if (data.query_msg[i].theads) {
                                data.query_msg[i].theads = IssuFunc.setPrimaryKeySort(data.query_msg[i].theads);
                            }
                        }
                        //分页数据生成
                        IssuFunc.createPageNumberByData(sql_step, data.query_msg);
                    }else{
                         _query_msg_list = data.modify_msg ? data.modify_msg : [];
                    }
                    //sql查询信息
                    IssuFunc.getSqlMsgList(_query_msg_list, sub_tab.sql_steps);
                    //生成的sql-全部提交成功
                    sub_tab.sql_steps[sql_step_index].all_executesql_success = true;
                    //全部提交按钮--隐藏
                    sub_tab.show_all_submit_btn = false;
                    //提交按钮--加载
                    sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
                    //放弃处理按钮--隐藏/显示
                    IssuFunc.quitHandleBtnControl(sub_tab);
                    //完成处理按钮--隐藏/显示
                    IssuFunc.finishHandleBtnControl(sub_tab);
                    if (data.download_path_list) {
                        sub_tab.sql_steps[sql_step_index].download_bk_path = data.download_path_list[0];
                    }
                }
            }, 0);
        }, function (error) {
            sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
            sub_tab.sql_steps[sql_step_index].is_close_loading = false;
            Modal.alert(error.message);
        });
    }
    //查询出来的数据--点击按钮切换
    $scope.switchPage = function (page, obj) {
        obj.sql_step.page.current_page = page.value;
        switch (page.key) {
            case 1:
                if (page.value > 0 && page.value < (obj.sql_step.page.numbers - 1)) {
                    obj.sql_step.page.show_page = [
                        {key: 1, value: page.value - 1},{key: 2, value: page.value},{key: 3, value: page.value + 1}, {key: 4, value: page.value + 2}
                    ];
                }
                break;
            case 4:
                if (page.value > 2 && page.value < obj.sql_step.page.numbers - 1) {
                    obj.sql_step.page.show_page = [
                        {key: 1, value: page.value - 2}, {key: 2, value: page.value - 1}, {key: 3, value: page.value}, {key: 4, value: page.value + 1}
                    ];
                }
                break;
            default:
                ;
        };
        getInfoByPage(obj);
    };
    //查询出来的数据--上下页切换
    $scope.nextPage = function (flag, obj) {
        if (!flag) {
            if (obj.sql_step.page.current_page == 0) {
                Modal.alert("已是最前一页");
                return;
            } else {
                var _current = --obj.sql_step.page.current_page;
                for (var i = 0; i < obj.sql_step.page.show_page.length; i++) {
                    var _page = obj.sql_step.page.show_page[i];
                    if (obj.sql_step.page.current_page == _page.value) {
                        getInfoByPage(obj);
                        return;
                    }
                }
                angular.forEach(obj.sql_step.page.show_page, function (data, index, array) {
                    data.value--;
                })
            }
        } else {
            if (obj.sql_step.page.current_page == obj.sql_step.page.numbers - 1) {
                Modal.alert("已是最后一页");
                return;
            } else {
                var _current = ++obj.sql_step.page.current_page;
                for (var i = 0; i < obj.sql_step.page.show_page.length; i++) {
                    var _page = obj.sql_step.page.show_page[i];
                    if (obj.sql_step.page.current_page == _page.value) {
                        getInfoByPage(obj);
                        return;
                    }
                }
                angular.forEach(obj.sql_step.page.show_page, function (data, index, array) {
                    data.value++;
                });
            }
        }
        getInfoByPage(obj);
    };
    //查询出来的数据--最前/后一页
    $scope.skipMostPage = function (flag, obj) {
        if (!flag) {
            obj.sql_step.page.current_page = 0;
            obj.sql_step.page.show_page = [
                {key: 1, value: 0}, {key: 2, value: 1}, {key: 3, value: 2}, {key: 4, value: 3}
            ];
        } else {
            var _last = obj.sql_step.page.numbers - 1;
            obj.sql_step.page.current_page = obj.sql_step.page.numbers - 1;
            obj.sql_step.page.show_page = [
                {key: 1, value: _last - 3}, {key: 2, value: _last - 2}, {key: 3, value: _last - 1}, {key: 4, value: _last}
            ];
        }
        getInfoByPage(obj);
    };
    //sql维护--撤销操作回调函数(指令中调用)
    $scope.resetAll = function (sub_tab, sql_step_index) {
        var _sql_list = sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list ? sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list : [];
        if (_sql_list.length > 0) {
            SqlExec.clearSqlList(_sql_list).then(function (data) {
                sub_tab.sql_steps[sql_step_index].read_only = false;
                sub_tab.sql_steps[sql_step_index].can_insert = true;
                sub_tab.sql_steps[sql_step_index].all_executesql_success = false;
                sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list = [];
            }, function (error) {
                Modal.alert(error.message);
                return false;
            });
        }
        return true;
    };
    /**
     * modify_list（tbodys）通过规则转成modify_string
     * 提交的modify_list里的值--对应theads的key value
     *  modify_list转成modify_string 规则：
     *  1.删除（delete） 传入row_status，主键及值
     *  2.修改（update） 传入row_status ，主键及值，修改的键及值
     *  3.新增（insert）  传入row_status，列全传
     **/
    //手工sql--生成SQL
    $scope.generateModifySql = function (sql_step_index, sql_work_seq, submit_table_data, sub_tab) {
        $scope.modify_info.modify_list = [];
        sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list = sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list ? sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list : [];
        sub_tab.sql_steps[sql_step_index].generate_sql_loading = true;
        $scope.modify_info.sql_work_seq = sql_work_seq;
        $scope.modify_info.theads = submit_table_data.theads;
        for (var i = 0; i < submit_table_data.tbodys.length; i++) {
            var _tbodys = submit_table_data.tbodys[i];
            //删除操作
            if (_tbodys.row_status == 4) {
                var _delete_obj = {row_status: _tbodys.row_status};
                for (var j = 0; j < submit_table_data.theads.length; j++) {
                    var _theads = submit_table_data.theads[j];
                    if (_theads.primary_key) {
                        _delete_obj[_theads.key] = _tbodys[_theads.key]; //主键
                    }
                }
                $scope.modify_info.modify_list.push(_delete_obj);
            }
            //修改操作
            if (_tbodys.row_status == 2) {
                var _modify_obj = {row_status: _tbodys.row_status};
                for (var k = 0; k < submit_table_data.theads.length; k++) {
                    var _modify_theads = submit_table_data.theads[k];
                    if (_modify_theads.primary_key) {
                        _modify_obj[_modify_theads.key] = _tbodys[_modify_theads.key]; //主键
                    } else {
                        if (_tbodys['original_' + _modify_theads.key] != _tbodys[_modify_theads.key] || _tbodys[_modify_theads.key + 'modify_flag']) {
                            _modify_obj[_modify_theads.key] = _tbodys[_modify_theads.key]; //修改的值
                        }
                    }
                }
                $scope.modify_info.modify_list.push(_modify_obj);
            }
            //新增操作
            if (_tbodys.row_status == 3) {
                var _add_obj = {row_status: _tbodys.row_status};
                for (var m = 0; m < submit_table_data.theads.length; m++) {
                    var _add_theads = submit_table_data.theads[m];
                    if (_tbodys[_add_theads.key]) {
                        _add_obj[_add_theads.key] = _tbodys[_add_theads.key];
                    } else {
                        _add_obj[_add_theads.key] = '';
                    }
                }
                $scope.modify_info.modify_list.push(_add_obj);
            }
        }
        //json对象转字符串
        $scope.modify_info.modify_string = angular.toJson($scope.modify_info.modify_list);
        SqlExec.generateSqlByTable($scope.modify_info).then(function (data) {
            $timeout(function () {
                if (data.sl_msg_list) {
                    //sql时段类型转中文
                    IssuFunc.sqlBucketTranslateCnType(data.sl_msg_list)
                    for (var i = 0; i < data.sl_msg_list.length; i++) {
                        for (var j = 0; j < sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list.length; j++) {
                            var _sql_list = sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list[j];
                            if (data.sl_msg_list[i].sql_text == _sql_list.sql_text) {
                                _sql_list.delete_mark = true;
                            }
                        }
                    }
                    //生成的sql列表
                    sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list = sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list.concat(data.sl_msg_list);
                    //合并重复的sql语句
                    SqlExec.mergRepeatSql(sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list).then(function (data) {

                    }, function (error) {
                        Modal.alert(error.message);
                    });
                }
                //隐藏--生成加载按钮
                sub_tab.sql_steps[sql_step_index].generate_sql_loading = false;
                sub_tab.sql_steps[sql_step_index].all_executesql_success = false;
            }, 0);
        }, function (error) {
            sub_tab.sql_steps[sql_step_index].generate_sql_loading = false;
            Modal.alert(error.message);
        });
    };
    //sql维护--生成的sql--批量提交
    $scope.allExecuteSql = function (generate_sql_list, index, sub_tab) {
        sub_tab.sql_steps[index].generate_sql.all_executesql_btnloading = true;
        var _modify_sql_list = [];
        var _sql_text_list = [];
        for (var i = 0; i < generate_sql_list.length; i++) {
            var _sql_list = generate_sql_list[i];
            if (_sql_list.sql_type != 1 && !_sql_list.delete_mark) {
                _modify_sql_list.push({
                    sql_work_seq: _sql_list.sql_work_seq,
                    sql_text: _sql_list.sql_text,
                    order_seq: sub_tab.basicData.order_seq,
                    deal_bk_seq: sub_tab.basicData.deal_bk_seq
                });
                _sql_text_list.push({sql_work_seq: _sql_list.sql_work_seq, sql_text: _sql_list.sql_text});
            }
        }
        //变更操作
        if (_modify_sql_list.length > 0) {
            SqlExec.execModifySqlList(_modify_sql_list, _sql_text_list).then(function (data) {
                $timeout(function () {
                    if (data.modify_msg) {
                        var _modify_msg_list = data.modify_msg;
                        //sql变更信息
                        IssuFunc.getSqlMsgList(_modify_msg_list, sub_tab.sql_steps);
                        //修改后的sql全部执行--列表不可编辑/
                        sub_tab.sql_steps[index].read_only = true;
                        sub_tab.sql_steps[index].can_insert = false;
                        sub_tab.sql_steps[index].generate_sql.all_executesql_success = true;
                        sub_tab.sql_steps[index].generate_sql.all_executesql_btnloading = false;
                    }
                }, 0);
            }, function (error) {
                sub_tab.sql_steps[index].generate_sql.all_executesql_btnloading = false;
                if (error.task_id) {
                    sub_tab.sql_steps[index].generate_sql.pend_work_seq = error.task_id;
                    sub_tab.sql_steps[index].generate_sql.is_generate_sql_author = true;
                    //存在授权--列表不可编辑
                    sub_tab.sql_steps[index].read_only = true;
                    sub_tab.sql_steps[index].can_insert = false;
                    sub_tab.sql_steps[index].generate_sql.all_executesql_success = true;
                    //隐藏放弃处理按钮
                    sub_tab.hide_no_handle_btn = true;
                    //隐藏完成处理按钮
                    sub_tab.finish_handle_btn = false;
                } else {
                    Modal.alert(error.message);
                }
            });
        }
    };
    //手工sql--生成的sql--批量提交--授权执行
    $scope.submitAuthorSqlStep = function (sql_step, sql_step_index, sub_tab) {
        var srvName = 'sl_ExecuteModifySqlAction';
        var _srvReqData = {};
        sub_tab.sql_steps[sql_step_index].is_close_loading = true;
        _srvReqData = {
            submit_type: 2, pend_work_seq: sql_step.generate_sql.pend_work_seq, modify_sql_list: []
        };
        //显示提交加载按钮
        sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = true;
        Task.ExecuteTask(_srvReqData, srvName).then(function (data) {
            $timeout(function () {
                if (data) {
                    sub_tab.sql_steps[sql_step_index].is_close_loading = false;
                    sub_tab.sql_steps[sql_step_index].is_single_task_author = false;
                    var _query_msg_list = data.modify_msg ? data.modify_msg : [];
                    //sql查询信息
                    IssuFunc.getSqlMsgList(_query_msg_list, sub_tab.sql_steps[sql_step_index].generate_sql.generate_sql_list);
                    sub_tab.sql_steps[sql_step_index].is_generate_sql_author = false;
                    sub_tab.sql_steps[sql_step_index].generate_sql.is_generate_sql_author = false;
                    sub_tab.sql_steps[sql_step_index].generate_sql.all_executesql_success = true;
                    //生成的sql-全部提交成功
                    sub_tab.sql_steps[sql_step_index].all_executesql_success = true;
                    //全部提交按钮--隐藏
                    sub_tab.show_all_submit_btn = false;
                    //提交按钮--加载
                    sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
                    //放弃处理按钮--隐藏/显示
                    IssuFunc.quitHandleBtnControl(sub_tab);
                    //完成处理按钮--隐藏/显示
                    IssuFunc.finishHandleBtnControl(sub_tab);
                    if (data.download_path_list) {
                        sub_tab.sql_steps[sql_step_index].download_bk_path = data.download_path_list[0];
                    }
                }
            }, 0);
        }, function (error) {
            sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
            sub_tab.sql_steps[sql_step_index].is_close_loading = false;
            Modal.alert(error.message);
        });
    };
}]);
//工单处理--批量sql
woCtrl.controller('woSqlBatchCtrl', ["$scope", "$routeParams", "$timeout", "$interval", "$modal", "Workorder", "Program", "WoFlowType", "ProgramExec", "SqlExec", "BucketType", "WoStatusType", "CodeMirrorOption", "Cmpt", "CommData", "Task", "ScriptExec", "CmptFunc", "BusiSys","IssuFunc", "Modal", "CV", function ($scope, $routeParams, $timeout, $interval, $modal, Workorder, Program, WoFlowType, ProgramExec, SqlExec, BucketType, WoStatusType, CodeMirrorOption, Cmpt, CommData, Task, ScriptExec, CmptFunc, BusiSys,IssuFunc, Modal, CV) {
    var init = function () {
        if ($scope.control.exist_index == -1) {
            var _last_sub_tab = $scope.data.sub_tabs[$scope.data.sub_tabs.length - 1];
            var _order_seq = _last_sub_tab.basicData.order_seq;
            var _deal_bk_seq = _last_sub_tab.basicData.deal_bk_seq;
            if (_last_sub_tab.basicData.flag == 2) {
                //查询批量导入sql信息
                //获取上传路径
                SqlExec.getImportFileUploadPath(_order_seq).then(function (data) {
                    $timeout(function () {
                        if (data) {
                            _last_sub_tab.batch_fileupload.uploadpath = data.program_upload_path;
                            //查询批量导入sql信息
                            SqlExec.submitedImportSqlList(_order_seq, _deal_bk_seq).then(function (data) {
                                _last_sub_tab.sql_steps = data.batch_sql_list ? data.batch_sql_list : [];
                                angular.forEach(_last_sub_tab.sql_steps, function (data) {
                                    data.tran_flag = 2;
                                    data.act_exec_time = data.act_exec_time ? IssuFunc.sqlExeTimeUsedFmt(data.act_exec_time) : 0;
                                    data.import_file_info = data;
                                    if (data.act_exec_time) {
                                        data.exe_result_info = data;
                                    }
                                    data.exe_success = data.act_exec_time ? true : false;
                                    data.is_exe_detail = true;
                                    data.parse_success = true;
                                    if (data.pend_work_seq) {
                                        data.is_task_author = true;
                                        data.sql_state = 1;
                                    }
                                    data.fileupload = {
                                        suffixs: 'sql', filetype: "SQL",
                                        filename: data.sql_bk_path ? data.sql_bk_path.substring(data.sql_bk_path.lastIndexOf("/") + 1, data.sql_bk_path.length) : '',
                                        uploadpath: _last_sub_tab.batch_fileupload.uploadpath
                                    };
                                    data.sql_info = {
                                        script_file_path: _last_sub_tab.batch_fileupload.uploadpath + data.fileupload.filename,
                                        sys_name: data.sys_name,
                                        soc_name: data.soc_name,
                                        sql_soc_list: []
                                    };
                                    //获取数据源集合
                                    if (data.sys_name) {
                                        $scope.selectSys(data.sys_name, data, true)
                                    }
                                    //放弃处理按钮--隐藏/显示
                                    IssuFunc.quitHandleBtnControl(_last_sub_tab);
                                    //完成处理按钮--隐藏/显示
                                    IssuFunc.finishHandleBtnControl(_last_sub_tab);
                                });
                            }, function (error) {
                                Modal.alert(error.message);
                            });
                        }
                    }, 0)
                }, function (error) {
                    Modal.alert(error.message);
                });
            } else {
                $scope.importSQL(_last_sub_tab);
            }
        }
    };
    //批量sql维护--上传sql文件模态框
    $scope.addSqlFileModal = function(sub_tab){
        Modal.showAddBatchSqlFile(sub_tab).then(function (data) {
            if(data){
                var _file_name = angular.copy(data.batch_fileupload.filename);
                sub_tab.show_file_upload = false;
                sub_tab.batch_fileupload.filename = '';
                sub_tab.sql_steps.push({
                    fileupload: {
                        filename: _file_name,
                        uploadpath: ''
                    },
                    sql_info: {
                        sql_soc_list: sub_tab.sql_soc_list ? sub_tab.sql_soc_list : [],
                        sys_name: sub_tab.basicData.sys_name ? sub_tab.basicData.sys_name : '',
                        script_file_path: sub_tab.batch_fileupload.uploadpath + _file_name
                    },
                    import_file_info: {},
                    exe_result_info: {}
                });
                //完成处理按钮--隐藏/显示
                IssuFunc.finishHandleBtnControl(sub_tab);
            }
        })
    };
    //批量sql维护-删除一条导入的sql文件信息
    $scope.deleteImportSql = function (sub_tab, sql_steps, index, flag, step) {
        var _flag_name = flag == 1 ? '确认删除' : '文件已解析，确认重置';
        Modal.confirm(_flag_name + "?").then(function () {
            if (flag == 2) {
                SqlExec.resetImportSql(sub_tab.basicData.order_seq, sub_tab.basicData.deal_bk_seq, step.step_seq).then(function (data) {
                    if (data) {
                        sql_steps.splice(index, 1);
                        //放弃处理按钮--隐藏/显示
                        IssuFunc.quitHandleBtnControl(sub_tab);
                        //完成处理按钮--隐藏/显示
                        IssuFunc.finishHandleBtnControl(sub_tab);
                    }
                }, function (error) {
                    Modal.alert(error.message)
                });
            } else {
                sql_steps.splice(index, 1);
                //放弃处理按钮--隐藏/显示
                IssuFunc.quitHandleBtnControl(sub_tab);
                //完成处理按钮--隐藏/显示
                IssuFunc.finishHandleBtnControl(sub_tab);
            }
        });
    };
    //sql维护-批量导入-下载sql文件
    $scope.downloadImportFile = function (step) {
        CV.downloadFile(step.sql_info.script_file_path);
    };
    //sql维护-根据系统获取jdbc数据源
    $scope.selectSys = function (sys_name, step, is_handled) {
        step.soc_loading = true;
        Program.getSocByBusy(sys_name, 1).then(function (data) {
            $timeout(function () {
                if (data) {
                    step.soc_loading = false;
                    if (!is_handled) {
                        step.sql_info.soc_name = ''
                    }
                    step.sql_info.sql_soc_list = [];
                    var _soc_list = data.source_list ? data.source_list : [];
                    for(var i = 0; i <_soc_list.length; i++){
                        step.sql_info.sql_soc_list.push(_soc_list[i].soc_name);
                    }
                }
            }, 0);
        }, function (error) {
            step.soc_loading = false;
            Modal.alert(error.message);
        });
    };
    //sql维护--批量导入-解析文件
    $scope.parseImportFile = function (sub_tab, step) {
        if (!step.sql_info.sys_name) {
            Modal.alert("数据库不可为空");
            return false;
        }
        if (!step.sql_info.soc_name) {
            Modal.alert("数据源不可为空");
            return false;
        }
        step.parse_loading = true;
        step.step_seq = step.step_seq ? step.step_seq : 0;
        //解析文件
        SqlExec.parseImportFile(sub_tab.basicData.order_seq, sub_tab.basicData.deal_bk_seq, step.fileupload.filename, step.sql_info.sys_name, step.sql_info.soc_name, step.step_seq).then(function (data) {
            $timeout(function () {
                if (data) {
                    step.import_file_info = data.result ? data.result : {};
                    step.parse_success = true;
                    step.parse_loading = false;
                    step.step_seq = data.step_seq ? data.step_seq : 0;
                    step.tran_flag = 2;
                }
            }, 0);
        }, function (error) {
            step.parse_success = false;
            step.parse_loading = false;
            Modal.alert(error.message);
        })
    };
    //sql维护--批量导入SQL
    $scope.importSQL = function (sub_tab) {
        //获取上传路径
        SqlExec.getImportFileUploadPath(sub_tab.basicData.order_seq).then(function (data) {
            $timeout(function () {
                if (data) {
                    sub_tab.basicData.sqlexe_type = 2;
                    sub_tab.batch_fileupload.uploadpath = data.program_upload_path;
                    sub_tab.is_import = true;
                    sub_tab.batch_sql_executed = false;
                }
            }, 0)
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //sql维护--批量执行
    $scope.batchExeSQL = function (sub_tab, step) {
        var _tran_flag = false;
        step.batch_exe_loading = true;
        //批量执行
        if (step.tran_flag == 2) {
            _tran_flag = true;
        }
        SqlExec.batchExeSql(sub_tab.basicData.order_seq, sub_tab.basicData.deal_bk_seq, step.sql_info.sys_name, step.sql_info.soc_name, step.fileupload.filename, step.step_seq, _tran_flag).then(function (data) {
            $timeout(function () {
                if (data.result) {
                    data.result.act_exec_time = data.result.act_exec_time ? IssuFunc.sqlExeTimeUsedFmt(data.result.act_exec_time) : '--';
                    step.exe_result_info = data.result;
                    step.exe_success = true;
                    step.batch_exe_loading = false;
                    //放弃处理按钮--隐藏/显示
                    IssuFunc.quitHandleBtnControl(sub_tab);
                    //完成处理按钮--隐藏/显示
                    IssuFunc.finishHandleBtnControl(sub_tab);
                }
            }, 0)
        }, function (error) {
            step.exe_success = false;
            step.batch_exe_loading = false;
            if (error.task_id) {
                step.pend_work_seq = error.task_id;
                step.sql_state = 1;
                step.is_task_author = true; //任务授权
                //放弃处理按钮--隐藏/显示
                IssuFunc.quitHandleBtnControl(sub_tab);
                //完成处理按钮--隐藏/显示
                IssuFunc.finishHandleBtnControl(sub_tab);
            } else {
                Modal.alert(error.message);
            }
        })
    };
    //sql维护--批量执行--授权执行
    $scope.authorExeSQL = function (sub_tab, step) {
        step.is_close_loading = true;
        var srvName = "sl_BatchExecuteSqlAction";
        var _srvReqData = {
            submit_type: 2,
            pend_work_seq: step.pend_work_seq,
            deal_bk_seq: sub_tab.basicData.deal_bk_seq,
            order_seq: sub_tab.basicData.order_seq,
            file_name: step.fileupload.filename,
            sys_name: step.sql_info.sys_name,
            soc_name: step.sql_info.soc_name,
            step_seq: step.step_seq
        };
        Task.ExecuteTask(_srvReqData, srvName).then(function (data) {
            $timeout(function () {
                step.is_close_loading = false;
                if (data.result) {
                    data.result.act_exec_time = data.result.act_exec_time ? IssuFunc.sqlExeTimeUsedFmt(data.result.act_exec_time) : '--';
                    step.exe_result_info = data.result;
                    step.exe_success = true;
                    step.sql_state = 1;
                    step.is_task_author = false;
                    //放弃处理按钮--隐藏/显示
                    IssuFunc.quitHandleBtnControl(sub_tab);
                    //完成处理按钮--隐藏/显示
                    IssuFunc.finishHandleBtnControl(sub_tab);
                }
            }, 0)
        }, function (error) {
            step.is_close_loading = false;
            Modal.alert(error.message);
        });

    };
    //sql维护-批量导入-查看执行失败信息
    $scope.viewExeDetail = function (step, flag) {
        var _message = flag == 1 ? step.import_file_info.parse_message : step.exe_result_info.message;
        Modal.viewBatchSqlExecDetail(_message).then()
    };
    //sql维护-批量导入-下载执行失败信息文件
    $scope.downloadDetailFile = function (file_download_path) {
        if (file_download_path) {
            CV.downloadFile(file_download_path)
        }
    };
    init();
}]);
//工单处理--固化方案
woCtrl.controller('woSolidProgramCtrl', ["$scope", "$stateParams", "$timeout","$modal", "Workorder", "Program", "ProgramExec", "Task","ScrollBarConfig", "Modal", "CV", function ($scope,$stateParams, $timeout, $modal, Workorder, Program, ProgramExec, Task,ScrollBarConfig, Modal, CV) {
    //固化方案-重新选择方案
    var resetProgram = function (sub_tab) {
        ProgramExec.reSelect(sub_tab.basicData.order_seq, sub_tab.basicData.deal_bk_seq).then(function (data) {
            sub_tab.showParamList = true;
            sub_tab.batchProgramBtn = false;
            sub_tab.batchSelectProgramBtn = false;
            sub_tab.steps = [];
            sub_tab.basicData.deal_bk_seq = data.deal_bk_seq;
            sub_tab.finish_deal_order = false; //重置某一个之后，工单处理没有结束
            sub_tab.first_show_resetall = false; //第一次进入，控制不显示全部重置
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //固化方案--处理数据
    var dealDataFunc = function (this_data, sub_tab, index) {
        sub_tab.auth_step_exsit = false;
        sub_tab.steps[index].pgsubmit_type = 1;
        //下一条数据的序号
        var next_step = this_data.next_step;
        sub_tab.next_step_btn = this_data.next_step;
        sub_tab.steps[index].type = 2;
        //保存过后,要显示全部重置按钮
        sub_tab.first_show_resetall = true;
        //执行当前步骤时候是否有异常
        sub_tab.steps[index].is_exception = false;
        //执行当前步骤异常原因
        sub_tab.steps[index].exception_reason = "";
        sub_tab.steps[index].checkData = {
            sql_basic_list: [],
            sql_result_list: [],
            isSuccess: this_data.success,
            fail_reason: this_data.fail_reason ? this_data.fail_reason : "",
            total_count: 0
        };
        //修改赋值sql_result_list，用来显示执行后的信息
        for (var k = 0; k < this_data.sql_result_list.length; k++) {
            sub_tab.steps[index].checkData.sql_result_list.push(this_data.sql_result_list[k]);
            //title_list中key值转小写
            if (sub_tab.steps[index].checkData.sql_result_list.length > 0) {
                angular.forEach(sub_tab.steps[index].checkData.sql_result_list, function (_data) {
                    _data.scroll_x_config = ScrollBarConfig.X();
                    _data.content_list = _data.content_list ? _data.content_list : [];
                    _data.start_num = _data.start_num ? _data.start_num : 0;
                    _data.end_num = _data.end_num ? _data.end_num : 10;
                    _data.title_list = _data.title_list ? _data.title_list : [];
                    angular.forEach(_data.title_list, function (_idata) {
                        _idata.key = _idata.key.toLowerCase();
                    });
                });
            }
            //得到返回的数据总条数,(只有sql_type==1表明是查询语句才进行计数)
            //计算所有查询sql返回的数据条数
            if (this_data.sql_result_list[k].content_list && this_data.sql_result_list[k].sql_type == 1) {
                sub_tab.steps[index].checkData.total_count = sub_tab.steps[index].checkData.total_count + this_data.sql_result_list[k].total_count;
            }
        }
        //数据内部赋值，让执行过的步骤显示出执行的信息
        for (var i = 0; i < sub_tab.steps[index].sql_list.length; i++) {
            if (sub_tab.steps[index].sql_list[i].sql_param_list) {
                for (var j = 0; j < sub_tab.steps[index].sql_list[i].sql_param_list.length; j++) {
                    //如果存在中文名，赋值中文名，没有赋值param_name
                    var sparam_name;
                    if (sub_tab.steps[index].sql_list[i].sql_param_list[j].sparam_cn_name) {
                        sparam_name = sub_tab.steps[index].sql_list[i].sql_param_list[j].sparam_cn_name;
                    } else {
                        sparam_name = sub_tab.steps[index].sql_list[i].sql_param_list[j].sparam_name;
                    }
                    sub_tab.steps[index].checkData.sql_basic_list.push({
                        key: sparam_name,
                        value: sub_tab.steps[index].sql_list[i].sql_param_list[j].sparam_value_text
                    });
                }
            }
        }
        if (next_step != -1) {
            //如果当前步骤数和下一步步骤数不等，说明下一步不是最后一步，需要继续查询
            //如果是相等，表示结束
            //用返回的下一步步骤号来确定下一步应该是哪一步
            if (next_step != index + 1) {
                var _exsit_auth_step = false;
                angular.forEach(sub_tab.steps, function (_data) {
                    if (_data.pgsubmit_type == 2) {
                        _exsit_auth_step = true;
                        sub_tab.auth_step_exsit = true;
                        sub_tab.first_show_resetall = false;
                        _data.type = 1;
                    }
                });
                if (!_exsit_auth_step) {
                    ProgramExec.getStepByProgramStepId(sub_tab.program_seq, next_step).then(function (_data) {
                        if (_data.sql_list) {
                            sub_tab.steps[next_step - 1].sql_list = _data.sql_list;
                            sub_tab.steps[next_step - 1].type = 1;
                            sub_tab.steps[next_step - 1].stepFormLock = false;
                            sub_tab.steps[next_step - 1].pgsubmit_type = 1;
                        }
                        //表示整个工单是否处理完成
                        sub_tab.finish_deal_order = false;
                    }, function (error) {
                        Modal.alert(error.message);
                    });
                }
            } else {
                //标志当前工单是否处理结束的标志位
                sub_tab.finish_deal_order = true;
            }
        } else {
            Modal.alert("执行出错");
        }
        //生成分页按组
        for (var i = 0; i < sub_tab.steps[index].checkData.sql_result_list.length; i++) {
            var _sql = sub_tab.steps[index].checkData.sql_result_list[i];
            createPageNumber(_sql);
        }
    };
    //固化方案--本地授权
    var pglocalauthFunc = function (res, _srv_req_data, sub_tab, index) {
        Modal.pglocalauth(res, _srv_req_data).then(function (_data) {
            if (_data.state != 'system') {
                //本地授权结束。执行或者提交远程授权
                if (_data.pgsvdeal_type == 1) {
                    //本地授权通过
                    _srv_req_data.pgsubmit_type = 3;
                    Task.ExecuteTask(_srv_req_data, "pg_ExecuteProgramStepAction").then(function (data) {
                        if (data.pgsvdeal_type == 1) {
                            dealDataFunc(data, sub_tab, index);
                        } else if (data.pgsvdeal_type == 3) {
                            //提交远程授权申请
                            _srv_req_data.org_srv_name = 'pg_ExecuteProgramStepAction';
                            Modal.pgremoteauth(res, _srv_req_data).then(function (_pg_data) {
                                if (_pg_data.success) {
                                    sub_tab.first_show_resetall = false;
                                    sub_tab.steps[index].pgsubmit_type = 2;
                                    sub_tab.steps[index].pg_work_seq = _pg_data.pg_work_seq;
                                    sub_tab.steps[index].stepFormLock = true;
                                    sub_tab.steps[index].pgwork_status = 1;
                                    sub_tab.steps[index].viewFlow = true;
                                    sub_tab.auth_step_exsit = true;
                                } else {
                                    sub_tab.steps[index].stepFormLock = false;
                                }
                                sub_tab.steps[index].pgsvdeal_type = _pg_data.pgsvdeal_type;
                            }, function (error) {
                                Modal.alert(error.message);
                            });
                        }
                    }, function (error) {
                        Modal.alert(error.message);
                    });
                } else if (_data.pgsvdeal_type == 2) {
                    //继续本地授权
                    pglocalauthFunc(_data, _srv_req_data, sub_tab, index);
                }
            }
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //根据数据生成分页查询
    var createPageNumber = function (_sql_step) {
        var _numbers = Math.ceil(_sql_step.total_count / 10);
        var _length = _numbers < 4 ? _numbers : 4;
        if (_sql_step.page) {
            _sql_step.page.numbers = _numbers;
        } else {
            _sql_step.page = {
                numbers: _numbers,
                current_page: 0,
                show_page: [],
            }
            for (var i = 0; i < _length; i++) {
                _sql_step.page.show_page.push({key: i + 1, value: i})
            }
        }
        $timeout(function () {
            _sql_step.page_number_show = true;
        }, 1000);
    };
    //查询对应的分页数据
    var getInfoByPage = function (obj) {
        var index = obj.sql_step_index;
        var _sql_index = obj.sql_index;
        var start_num = obj.sql_step.page.current_page * 10;
        var _srv_req_data = {
            order_bk_title: obj.sub_tab.basicData.order_bk_title,
            program_name: obj.sub_tab.program_name,
            step_bk_title: obj.sub_tab.steps[index].step_bk_title,
            order_seq: obj.sub_tab.basicData.order_seq,
            deal_bk_seq: obj.sub_tab.basicData.deal_bk_seq,
            step_seq: index + 1,
            sql_list: obj.sub_tab.steps[index].sql_list,
            pgsubmit_type: '',
            pg_work_seq: obj.sub_tab.steps[index].pg_work_seq ? obj.sub_tab.steps[index].pg_work_seq : '',
        };
        obj.sql_step.page_data_loading = true;
        ProgramExec.execProgramStep(_srv_req_data, start_num, 10).then(function (data) {
            obj.sql_step.page_data_loading = false;
            obj.sub_tab.steps[index].checkData.sql_result_list[_sql_index].content_list = data.sql_result_list[_sql_index].content_list ? data.sql_result_list[_sql_index].content_list : [];
        }, function (error) {
            obj.sql_step.page_data_loading = false;
            Modal.alert(error.message);
        });
    };
    //初始化方法
    var init = function () {
        if ($scope.control.exist_index == -1) {
            var _last_sub_tab = $scope.data.sub_tabs[$scope.data.sub_tabs.length - 1];
            var _order_seq = _last_sub_tab.basicData.order_seq;
            var _deal_bk_seq = _last_sub_tab.basicData.deal_bk_seq;
            if (_last_sub_tab.basicData.flag != 2) {
                _last_sub_tab.showParamList = true;
            } else {
                _last_sub_tab.auth_step_exsit = false;
                var next_step_count;    //下一步骤号
                var step_seq_count;     //用来做判断的步骤序号
                var _auth_step_exsit = false;
                ProgramExec.getProgramType(_order_seq, _deal_bk_seq).then(function (data) {
                    $timeout(function () {
                        if (data) {
                            if (!data.pg_source) {
                                _last_sub_tab.showParamList = true;
                            }
                            if (data.pg_source == 1) {
                                //查询已执行的步骤列表
                                ProgramExec.getExedProgramStep(_order_seq, _deal_bk_seq).then(function (data) {
                                    //得到所有的步骤信息
                                    _last_sub_tab.showParamList = false;
                                    var _step_exe_list = data.step_exe_list ? data.step_exe_list : [];
                                    if (_step_exe_list.length != 0) _last_sub_tab.exc_step_flag = true;
                                    next_step_count = data.next_step;
                                    _last_sub_tab.next_step_btn = data.next_step;
                                    //是否重置按钮
                                    if (next_step_count == 1 && _step_exe_list.length == 0) {
                                        _last_sub_tab.first_show_resetall = false;
                                    } else {
                                        _last_sub_tab.first_show_resetall = true; //可以显示全部重置
                                    }
                                    //获得最后一步步骤序号
                                    step_seq_count = _step_exe_list.length == 0 ? 0 : _step_exe_list[_step_exe_list.length - 1].step_seq;
                                    //把方案信息给当前要处理的工单
                                    _last_sub_tab.next_step = data.next_step;
                                    _last_sub_tab.program_seq = data.program_seq;
                                    _last_sub_tab.program_name = data.program_name;
                                    //需要根据方案得到的步骤信息，给步骤信息赋值
                                    Program.getProgramInfoAndStepList(data.program_seq).then(function (data) {
                                        if (data.program_step_list) {
                                            for (var i = 0; i < data.program_step_list.length; i++) {
                                                var _one_step = {
                                                    step_seq: data.program_step_list[i].step_seq,
                                                    step_bk_title: data.program_step_list[i].step_bk_title,
                                                    sql_list: [],
                                                    pgsubmit_type: '',
                                                    type: 0,
                                                    data: [],
                                                    reset_show: true, //如果之前操作过此工单，就需要刚进入可以重置每一步
                                                    is_exception: false, //是否有异常
                                                    exception_reason: "" //异常原因
                                                };
                                                var _execd_step = null;
                                                var _total_count = 0;
                                                var _sql_basic_list = [];
                                                for (var j = 0; j < _step_exe_list.length; j++) { //已执行的步骤列表
                                                    var _step_exe = _step_exe_list[j];
                                                    if (_step_exe.step_seq == _one_step.step_seq) {
                                                        var _sql_list = _step_exe.program_sql_list ? _step_exe.program_sql_list : [];
                                                        var _sql_result_list = _step_exe.sql_result_list ? _step_exe.sql_result_list : [];
                                                        for (var k = 0; k < _sql_list.length; k++) { //步骤的SQL列表
                                                            var _sql = _sql_list[k];
                                                            var _sql_result = _sql_result_list[k];
                                                            //计算查询条数
                                                            if (_sql.sql_type == 1) {
                                                                _total_count += _sql_result.total_count;
                                                            }
                                                            //构造sql_basic_list
                                                            var _param_list = _sql.sql_param_list ? _sql.sql_param_list : [];
                                                            for (var x = 0; x < _param_list.length; x++) {
                                                                var _param = _param_list[x];
                                                                _param.sparam_value_text = "";
                                                                if (_param.sparam_type == 1 || _param.sparam_type == 5) { //有Key&Value选项的参数
                                                                    _param.sparam_value_text = _param.sparam_value;
                                                                } else {
                                                                    var _sparam_scope_list = angular.fromJson(_param.sparam_scope);
                                                                    if (_param.sparam_type == 3) {
                                                                        var _param_value_text_list = [];
                                                                        var sparam_value_list = [];
                                                                        sparam_value_list = _param.sparam_value.split(",");
                                                                        for (var y = 0; y < sparam_value_list.length; y++) {
                                                                            _param_value_text_list.push(CV.findValue(sparam_value_list[y], _sparam_scope_list));
                                                                        }
                                                                        _param.sparam_value_text = _param_value_text_list.join(",");
                                                                    }
                                                                    if (_param.sparam_type == 2 || _param.sparam_type == 4) {
                                                                        _param.sparam_value_text = CV.findValue(_param.sparam_value, _sparam_scope_list);
                                                                    }
                                                                }
                                                                _sql_basic_list.push({
                                                                    key: _param.sparam_cn_name,
                                                                    value: _param.sparam_value_text
                                                                })
                                                            }
                                                        }
                                                        _execd_step = _step_exe;
                                                        break;
                                                    }
                                                }
                                                if (_execd_step) {
                                                    if (_execd_step.pg_work_seq) {
                                                        _auth_step_exsit = true;
                                                        _last_sub_tab.first_show_resetall = false;
                                                        _last_sub_tab.auth_step_exsit = true;
                                                        //如果当前是带授权或者授权通过未执行的这里要加锁并且给当前步骤赋执行授权权限
                                                        _one_step.pg_work_seq = _execd_step.pg_work_seq;
                                                        _one_step.viewFlow = true;
                                                        if (_execd_step.pgwork_status == 1) { //待授权
                                                            _one_step.stepFormLock = true;
                                                            _one_step.pgsubmit_type = 2;
                                                            _one_step.pgwork_status = 1;
                                                        } else if (_execd_step.pgwork_status == 2) { //授权拒绝
                                                            _one_step.stepFormLock = true;
                                                            _one_step.closeTask = true;
                                                            _one_step.pgwork_status = 2;
                                                            //授权拒绝应该关闭任务
                                                        } else if (_execd_step.pgwork_status == 3) { //待执行
                                                            _one_step.stepFormLock = true;
                                                            _one_step.pgsubmit_type = 2;
                                                            _one_step.pgwork_status = 3;
                                                        }
                                                        _one_step.type = 1;
                                                    } else {
                                                        _one_step.type = 2;
                                                    }
                                                    _one_step.sql_list = _execd_step.program_sql_list;
                                                    _one_step.checkData = {
                                                        sql_basic_list: _sql_basic_list,
                                                        sql_result_list: [], //只需每一步的成功或失败原因就行了。这里不需要赋值
                                                        isSuccess: _execd_step.success,
                                                        fail_reason: _execd_step.fail_reason ? _step_exe_list[i].fail_reason : "",
                                                        total_count: _total_count //返回查询数据的条数
                                                    }
                                                }
                                                _last_sub_tab.steps.push(_one_step);
                                            }
                                        }
                                        return _last_sub_tab;
                                    }, function (error) {
                                        Modal.alert(error.message);
                                    }).then(function (_last_sub_tab) {
                                        if (next_step_count == -1) { //执行异常出错
                                            _last_sub_tab.finish_deal_order = false;
                                        } else if (next_step_count == step_seq_count) { //执行正常结束
                                            _last_sub_tab.finish_deal_order = true;
                                        } else { //继续执行
                                            _last_sub_tab.finish_deal_order = false;
                                            if (!_auth_step_exsit && _last_sub_tab) {
                                                ProgramExec.getStepByProgramStepId(data.program_seq, next_step_count).then(function (data) {
                                                    if (data.sql_list) {
                                                        _last_sub_tab.steps[next_step_count - 1].sql_list = data.sql_list ? data.sql_list : [];
                                                        _last_sub_tab.steps[next_step_count - 1].type = 1;
                                                        _last_sub_tab.steps[next_step_count - 1].stepFormLock = false;
                                                        _last_sub_tab.steps[next_step_count - 1].pgsubmit_type = 1;
                                                    }
                                                }, function (error) {
                                                    Modal.alert(error.message);
                                                });
                                            }
                                        }
                                    });
                                }, function (error) {
                                    Modal.alert(error.message);
                                });
                            } else if (data.pg_source == 2) {
                                _last_sub_tab.showParamList = false;
                                _last_sub_tab.batchProgramBtn = true;
                                //固化方案--批量方案处理上传文件配置
                                _last_sub_tab.batch_program_fileupload = {
                                    suffixs: 'xls,xlsx',
                                    filetype: "EXCEL",
                                    filename: "",
                                    uploadpath: "",
                                }
                                ProgramExec.getImportPath(_last_sub_tab.wo_id, data.program_seq).then(function (data) {
                                    if (data) {
                                        _last_sub_tab.batch_program_fileupload.uploadpath = data.pg_excel_path;
                                    }
                                }, function (error) {
                                    Modal.alert(error.message);
                                });
                                //把方案信息给当前要处理的工单
                                _last_sub_tab.program_seq = data.program_seq;
                                _last_sub_tab.program_name = data.program_name;
                                //根据方案获取已执行的信息
                                ProgramExec.getExecdMsg(_order_seq, data.program_seq, _deal_bk_seq).then(function (data) {
                                    if (data) {
                                        if (data.select_path) {
                                            _last_sub_tab.auth_step_exsit = false;
                                            _last_sub_tab.exc_step_flag = true;
                                            _last_sub_tab.pg_source = 3;
                                            _last_sub_tab.control = {
                                                show_result: true,
                                                show_exec_btn: false,
                                                is_task_author: false
                                            };
                                            _last_sub_tab.batch_program_fileupload.filename = data.file_path.substring(data.file_path.lastIndexOf("/") + 1, data.file_path.length);
                                            _last_sub_tab.program_file_full_path = data.file_path;
                                            _last_sub_tab.select_path = data.select_path;
                                            //处理结束显示完成处理按钮
                                            _last_sub_tab.finish_deal_order = true;
                                        } else {
                                            _last_sub_tab.pg_source = 2;
                                            if (data.task_sql_num != 0 && data.workflow_state == 6) {
                                                _last_sub_tab.auth_step_exsit = false;
                                                _last_sub_tab.exc_step_flag = true;
                                                _last_sub_tab.program_result_msg = {
                                                    total_sql: data.task_sql_num,
                                                    success_num: data.success_num,
                                                    fail_num: data.fail_num,
                                                    used_time: data.used_time,
                                                    task_msg: data.task_msg ? data.task_msg : []
                                                };
                                                _last_sub_tab.control = {
                                                    show_result: true,
                                                    show_exec_btn: false,
                                                    is_task_author: false
                                                };
                                                _last_sub_tab.batch_program_fileupload.filename = data.file_path.substring(data.file_path.lastIndexOf("/") + 1, data.file_path.length);
                                                _last_sub_tab.program_file_full_path = data.file_path;
                                                _last_sub_tab.task_id = data.pend_work_seq;
                                                _last_sub_tab.workflow_state = data.workflow_state;
                                                //处理结束显示完成处理按钮
                                                _last_sub_tab.finish_deal_order = true;
                                            } else {
                                                if (!data.workflow_state) {
                                                    if(data.task_sql_num != 0){
                                                        _last_sub_tab.auth_step_exsit = false;
                                                        _last_sub_tab.exc_step_flag = true;
                                                        _last_sub_tab.program_result_msg = {
                                                            total_sql: data.task_sql_num,
                                                            success_num: data.success_num,
                                                            fail_num: data.fail_num,
                                                            used_time: data.used_time,
                                                            task_msg: data.task_msg ? data.task_msg : []
                                                        };
                                                        _last_sub_tab.control = {
                                                            show_result: true,
                                                            show_exec_btn: false,
                                                            is_task_author: false
                                                        };
                                                        _last_sub_tab.batch_program_fileupload.filename = data.file_path.substring(data.file_path.lastIndexOf("/") + 1, data.file_path.length);
                                                        _last_sub_tab.program_file_full_path = data.file_path;
                                                        _last_sub_tab.task_id = data.pend_work_seq;
                                                        //处理结束显示完成处理按钮
                                                        _last_sub_tab.finish_deal_order = true;
                                                    }else{
                                                        _last_sub_tab.exc_step_flag = false;
                                                        _last_sub_tab.control = {
                                                            show_result: false,
                                                            show_exec_btn: true,
                                                            is_task_author: false
                                                        };
                                                    }
                                                } else {
                                                    _last_sub_tab.auth_step_exsit = true;
                                                    _last_sub_tab.exc_step_flag = true;
                                                    _last_sub_tab.control = {
                                                        show_result: true,
                                                        show_exec_btn: false,
                                                        is_task_author: true
                                                    };
                                                    _last_sub_tab.batch_program_fileupload.filename = data.file_path.substring(data.file_path.lastIndexOf("/") + 1, data.file_path.length);
                                                    _last_sub_tab.program_file_full_path = data.file_path;
                                                    _last_sub_tab.task_id = data.pend_work_seq;
                                                    _last_sub_tab.workflow_state = data.workflow_state;
                                                }
                                            }
                                        }
                                    }
                                }, function (error) {
                                    Modal.alert(error.message);
                                });
                            } else if (data.pg_source == 3) {
                                _last_sub_tab.showParamList = false;
                                _last_sub_tab.batchSelectProgramBtn = true;
                                //把方案信息给当前要处理的工单
                                _last_sub_tab.program_seq = data.program_seq;
                                _last_sub_tab.program_name = data.program_name;
                                _last_sub_tab.select_program_form = {};
                                Program.getSelectProgramAllInfo(data.program_seq, _order_seq, _deal_bk_seq).then(function (data) {
                                    _last_sub_tab.step_list = data.program_step_list ? data.program_step_list : [];
                                    if (data.file_path) {
                                        _last_sub_tab.control = {
                                            show_result: true,
                                            show_exec_btn: false,
                                            exec_loading: false,
                                            is_disable: true
                                        };
                                        _last_sub_tab.select_path = data.file_path;
                                        //处理结束显示完成处理按钮
                                        _last_sub_tab.finish_deal_order = true;
                                        _last_sub_tab.auth_step_exsit = false;
                                    } else {
                                        if (!data.workflow_state) {
                                            _last_sub_tab.exc_step_flag = false;
                                            _last_sub_tab.control = {
                                                show_result: false,
                                                show_exec_btn: true,
                                                is_task_author: false
                                            };
                                        } else {
                                            _last_sub_tab.auth_step_exsit = true;
                                            _last_sub_tab.exc_step_flag = true;
                                            _last_sub_tab.control = {
                                                show_result: true,
                                                show_exec_btn: false,
                                                exec_loading: false,
                                                is_task_author: true,
                                                is_disable: true
                                            };
                                            _last_sub_tab.task_id = data.pend_work_seq;
                                            _last_sub_tab.workflow_state = data.workflow_state;
                                        }
                                    };
                                    if (data.exe_msg && data.exe_msg.error_message) {
                                        _last_sub_tab.control = {
                                            show_result: true,
                                            show_exec_btn: false,
                                            exec_loading: false,
                                            is_disable: true
                                        };
                                        _last_sub_tab.exc_step_flag = false;
                                        _last_sub_tab.error_message = data.exe_msg.error_message;
                                        _last_sub_tab.control.show_error_message = true;
                                        //处理结束显示完成处理按钮
                                        _last_sub_tab.finish_deal_order = true;
                                        _last_sub_tab.auth_step_exsit = false;
                                    }
                                });
                            }
                        }
                    }, 0)
                }, function (error) {
                    Modal.alert(error.message);
                });
            }
        }
    };

    //点击按钮切换
    $scope.switchPage = function (page, obj) {
        var _page_number = obj.sql_step.page.show_page.length;
        obj.sql_step.page.current_page = page.value;
        switch (page.key) {
            case 1:
                if (page.value > 0 && page.value < (obj.sql_step.page.numbers - 1)) {
                    obj.sql_step.page.show_page = [
                        {key: 1, value: page.value - 1}, {key: 2, value: page.value}, {
                            key: 3,
                            value: page.value + 1
                        }, {key: 4, value: page.value + 2}
                    ];
                }
                break;
            case 4:
                if (page.value > 2 && page.value < obj.sql_step.page.numbers - 1) {
                    obj.sql_step.page.show_page = [
                        {key: 1, value: page.value - 2}, {key: 2, value: page.value - 1}, {
                            key: 3,
                            value: page.value
                        }, {key: 4, value: page.value + 1}
                    ];
                }
                break;
            default:
                ;
        };
        getInfoByPage(obj);
    };
    //上下页切换
    $scope.nextPage = function (flag, obj) {
        //显示按钮组个数
        var _btn_number = obj.sql_step.page.show_page.length;
        //上一页
        if (!flag) {
            if (obj.sql_step.page.current_page == 0) {
                Modal.alert("已是最前一页");
                return;
            } else {
                var _current = --obj.sql_step.page.current_page;
                for (var i = 0; i < obj.sql_step.page.show_page.length; i++) {
                    var _page = obj.sql_step.page.show_page[i];
                    if (obj.sql_step.page.current_page == _page.value) {
                        getInfoByPage(obj);
                        return;
                    }
                }
                angular.forEach(obj.sql_step.page.show_page, function (data, index, array) {
                    data.value--;
                })
            }
        } else {
            if (obj.sql_step.page.current_page == obj.sql_step.page.numbers - 1) {
                Modal.alert("已是最后一页");
                return;
            } else {
                var _current = ++obj.sql_step.page.current_page;
                for (var i = 0; i < obj.sql_step.page.show_page.length; i++) {
                    var _page = obj.sql_step.page.show_page[i];
                    if (obj.sql_step.page.current_page == _page.value) {
                        getInfoByPage(obj);
                        return;
                    }
                }
                angular.forEach(obj.sql_step.page.show_page, function (data, index, array) {
                    data.value++;
                });
            }
        }
        getInfoByPage(obj);
    };
    //最前/后一页
    $scope.skipMostPage = function (flag, obj) {
        if (!flag) {
            obj.sql_step.page.current_page = 0;
            obj.sql_step.page.show_page = [
                {key: 1, value: 0}, {key: 2, value: 1}, {key: 3, value: 2}, {key: 4, value: 3}
            ];
        } else {
            var _last = obj.sql_step.page.numbers - 1;
            obj.sql_step.page.current_page = obj.sql_step.page.numbers - 1;
            obj.sql_step.page.show_page = [
                {key: 1, value: _last - 3}, {key: 2, value: _last - 2}, {key: 3, value: _last - 1}, {
                    key: 4,
                    value: _last
                }
            ];
        }
        getInfoByPage(obj);
    };

    //固化方案-下载上传的excel文件
    $scope.downloadProgramFile = function (sub_tab) {
        CV.downloadFile(sub_tab.program_file_full_path);
    };
    //固化方案-下载执行过的查询方案的excel文件
    $scope.downloadSelectExcel = function (path) {
        CV.downloadFile(path);
    };
    //固化方案-上传的excel文件成功
    $scope.importProgramFileUploadSuccessThen = function (sub_tab) {
        sub_tab.program_file_full_path = sub_tab.batch_program_fileupload.uploadpath + sub_tab.batch_program_fileupload.filename;
    };
    //固化方案-步骤标题-两行出现...
    $scope.stepTitleStyle = function (index, _className) {
        var _span = $(_className).eq(index);
        while (_span.outerHeight() > 40) {
            _span.text(_span.text().replace(/(\s)*([a-zA-Z0-9]+|\W)(\.\.\.)?$/, "..."));
        }
    };
    //固化方案-重新选择
    $scope.clearStep = function (sub_tab, is_reset) {
        if (is_reset) {
            Modal.confirm("确认重选方案 ?").then(function () {
                resetProgram(sub_tab)
            });
        } else {
            resetProgram(sub_tab)
        }
    };
    //固化方案-普通方案--保存当前步骤------提交执行当前步骤
    $scope.saveOneStep = function (sub_tab, index) {
        $scope.pgauthflag.btn_loading = true;
        //单步保存之后，显示所有步骤的'重置当前步骤'按钮
        /**
         * step:{
         *    reset_show:''控制所有步骤的‘重置当前步骤’按钮
         *    type:''控制步骤显示的内容
         *    is_exception:boolean 是否有异常
         *    exception_reason:'' 异常原因
         *    checkData：{}步骤执行后，返回的信息
         *    formData：{}用于传给指令的信息包含执行的sql.sql参数信息
         *   }
         **/
        for (var m = 0; m < sub_tab.steps.length; m++) {
            sub_tab.steps[m].reset_show = true;
        }
        //请求数据
        var _srv_req_data = {
            order_bk_title: sub_tab.basicData.order_bk_title,
            program_name: sub_tab.program_name,
            step_bk_title: sub_tab.steps[index].step_bk_title,
            order_seq: sub_tab.basicData.order_seq,
            deal_bk_seq: sub_tab.basicData.deal_bk_seq,
            step_seq: index + 1,
            start_num: sub_tab.start_num ? sub_tab.start_num : 0,
            end_num: sub_tab.end_num ? sub_tab.end_num : 10,
            sql_list: sub_tab.steps[index].sql_list,
            pgsubmit_type: sub_tab.steps[index].pgsubmit_type ? sub_tab.steps[index].pgsubmit_type : 1, //这里有可能有值
            pg_work_seq: sub_tab.steps[index].pg_work_seq ? sub_tab.steps[index].pg_work_seq : '',
        };
        if (sub_tab.steps[index].closeTask) {
            //关闭任务
            Workorder.closePgWorkAction(sub_tab.steps[index].pg_work_seq).then(function (data) {
                sub_tab.steps[index].closeTask = false;
                $scope.resetOneStep(sub_tab.steps[index], sub_tab);
            }, function (error) {
                Modal.alert(error.message);
            })
        } else {
            ProgramExec.execProgramStep(_srv_req_data, 0, 10).then(function (data) {
                $scope.pgauthflag.btn_loading = false;
                sub_tab.exc_step_flag = true;
                var res = data ? data : {};
                //原服务请求数据
                if (data.pgsvdeal_type == 1) {
                    dealDataFunc(data, sub_tab, index);
                } else if (data.pgsvdeal_type == 2) { //本地授权
                    pglocalauthFunc(res, _srv_req_data, sub_tab, index);
                } else if (data.pgsvdeal_type == 3) { //远程授权
                    _srv_req_data.pgsubmit_type = 1;
                    _srv_req_data.org_srv_name = 'pg_ExecuteProgramStepAction';
                    Modal.pgremoteauth(res, _srv_req_data).then(function (data) {
                        if (data.success) {
                            sub_tab.first_show_resetall = false;
                            sub_tab.steps[index].pgsubmit_type = 2;
                            sub_tab.steps[index].stepFormLock = true;
                            sub_tab.steps[index].pg_work_seq = data.pg_work_seq;
                            sub_tab.steps[index].pgwork_status = 1;
                            sub_tab.steps[index].viewFlow = true;
                            sub_tab.auth_step_exsit = true;
                            if(sub_tab.steps[index].checkData){
                                //生成分页按组
                                for (var i = 0; i < sub_tab.steps[index].checkData.sql_result_list.length; i++) {
                                    var _sql = sub_tab.steps[index].checkData.sql_result_list[i];
                                    createPageNumber(_sql);
                                }
                            }
                        } else {
                            sub_tab.steps[index].stepFormLock = false;
                        }
                    }, function (error) {
                        Modal.alert(error.message);
                    });
                } else {
                    sub_tab.steps[index].pg_work_seq = data.pg_work_seq;
                    //待审批 上锁
                    sub_tab.steps[index].stepFormLock = true;
                }
            }, function (error) {
                //用来判断执行异常，显示异常的原因
                sub_tab.steps[index].type = 2;
                sub_tab.steps[index].is_exception = true;
                $scope.pgauthflag.btn_loading = false;
                sub_tab.steps[index].exception_reason = error.message;
            });
        }
    };
    //固化方案-重置当前步骤---formData不清空---清空checkData
    //重置单步拦截在授权 ，如果有授权则不能全部重置
    $scope.resetOneStep = function (step, sub_tab) {
        $scope.pgauthflag.btn_loading = false;
        $timeout(function () {
            step.pgsubmit_type = 1;
            step.pgwork_status = 0;
            step.viewFlow = false;
            //得到所清空的步骤是哪一步
            var index;
            //重置第一步骤的时候，不显示全部重置按钮
            if (step.step_seq == 1 && (sub_tab.next_step_btn == 2 || sub_tab.next_step_btn == -1)) {
                sub_tab.first_show_resetall = false;
            }
            for (var i = 0; i < sub_tab.steps.length; i++) {
                sub_tab.steps[i].reset_show = false;
                if (sub_tab.steps[i].pgsubmit_type == 2) {
                    sub_tab.steps[i].type = -1;
                }
                //下一步骤隐藏(重置当前步骤之后，需要把的下一步骤隐藏，保证只修改当前步骤)
                if (sub_tab.next_step_btn == i + 1) {
                    sub_tab.steps[i].type = -1;
                }
                //得到重置的是哪一个步骤
                if (step.step_seq == sub_tab.steps[i].step_seq) {
                    index = i;
                }
            }
            ProgramExec.resetProgramStep(sub_tab.wo_id, sub_tab.basicData.deal_bk_seq, index + 1).then(function (data) {
                //无返回值
                step.checkData = {sql_basic_list: [], sql_result_list: []};
                step.type = 1;
                sub_tab.finish_deal_order = false; //重置某一个之后，工单处理没有结束
                step.stepFormLock = false;
            }, function (error) {
                Modal.alert(error.message);
            });
        }, 10);
    };
    //固化方案-重置所有步骤-----回到选择方案后的状态
    $scope.resetAllStep = function (sub_tab) {
        ProgramExec.resetAllExedStep(sub_tab.basicData.order_seq, sub_tab.basicData.deal_bk_seq, sub_tab.program_seq).then(function (data) {
            //无返回值
            sub_tab.basicData.deal_bk_seq = data.deal_bk_seq;
            for (var i = 0; i < sub_tab.steps.length; i++) {
                if (i == 0) {
                    sub_tab.steps[i].type = 1;
                    sub_tab.steps[i].checkData = {};
                    sub_tab.steps[i].pgsubmit_type = 1;
                    sub_tab.steps[i].pgwork_status = 0;
                    sub_tab.steps[i].stepFormLock = false;
                    sub_tab.steps[i].viewFlow = false;
                } else {
                    sub_tab.steps[i].type = 0;
                    sub_tab.steps[i].sql_list = {};
                    sub_tab.steps[i].viewFlow = false;
                    sub_tab.steps[i].checkData = {};
                }
            }
            sub_tab.finish_deal_order = false;
            //第一次进入，控制不显示全部重置
            sub_tab.first_show_resetall = false;
        }, function (error) {
            Modal.alert(error.message);
        });
    };

    //固化方案--批量方案--开始执行
    $scope.startProgramExec = function (sub_tab) {
        var _order_seq = sub_tab.basicData.order_seq;
        var _program_seq = sub_tab.program_seq;
        var _file_name = sub_tab.batch_program_fileupload.filename;
        var _deal_bk_seq = sub_tab.basicData.deal_bk_seq;
        sub_tab.control = {
            show_result: true,
            show_exec_btn: false,
            exec_loading: true,
        };
        if (sub_tab.pg_source == 2) {
            //这里调执行方案sql的的服务
            ProgramExec.startExecProgram(_order_seq, _program_seq, _file_name, _deal_bk_seq).then(function (data) {
                $timeout(function () {
                    if (data) {
                        ProgramExec.getExecdMsg(_order_seq, _program_seq, _deal_bk_seq).then(function (data) {
                            sub_tab.exc_step_flag = true;
                            sub_tab.auth_step_exsit = false;
                            sub_tab.program_result_msg = {
                                total_sql: data.task_sql_num,
                                success_num: data.success_num,
                                fail_num: data.fail_num,
                                used_time: data.used_time,
                                task_msg: data.task_msg ? data.task_msg : []
                            };
                            sub_tab.program_file_full_path = data.file_path;
                            //处理结束显示完成处理按钮
                            sub_tab.finish_deal_order = true;
                            sub_tab.control.exec_loading = false;
                        }, function (error) {
                            sub_tab.control.exec_loading = false;
                            Modal.alert(error.message);
                        });
                    }
                }, 0);
            }, function (error) {
                sub_tab.auth_step_exsit = true;
                sub_tab.exc_step_flag = true;
                sub_tab.control.exec_loading = false;
                if (error.task_id) {
                    sub_tab.task_id = error.task_id;
                    sub_tab.control.is_task_author = true; //任务授权
                } else {
                    sub_tab.control.show_exec_btn = true;
                    sub_tab.control.show_result = false;
                    Modal.alert(error.message);
                }
            });
        } else {
            //这里调执行select方案sql的的服务
            ProgramExec.startSelectProgram(_order_seq, _program_seq, _file_name, _deal_bk_seq).then(function (data) {
                $timeout(function () {
                    if (data) {
                        ProgramExec.getExecdMsg(_order_seq, _program_seq, _deal_bk_seq).then(function (data) {
                            sub_tab.exc_step_flag = true;
                            sub_tab.auth_step_exsit = false;
                            sub_tab.select_path = data.select_path;
                            sub_tab.program_file_full_path = data.file_path;
                            //处理结束显示完成处理按钮
                            sub_tab.finish_deal_order = true;
                            sub_tab.control.exec_loading = false;
                        }, function (error) {
                            sub_tab.control.exec_loading = false;
                            Modal.alert(error.message);
                        });
                    }
                }, 0);
            }, function (error) {
                sub_tab.auth_step_exsit = true;
                sub_tab.exc_step_flag = true;
                sub_tab.control.exec_loading = false;
                sub_tab.control.show_exec_btn = true;
                sub_tab.control.show_result = false;
                Modal.alert(error.message);
            });
        }
    };
    //固化方案--批量查询的方案--开始执行
    $scope.startSelectProgramExec = function (sub_tab) {
        var _order_seq = sub_tab.basicData.order_seq;
        var _program_seq = sub_tab.program_seq;
        var _deal_bk_seq = sub_tab.basicData.deal_bk_seq;
        if (!CV.valiForm(sub_tab.select_program_form)) {
            return false;
        }
        sub_tab.control = {
            show_result: true,
            show_exec_btn: false,
            exec_loading: true,
            is_disable: true
        };
        //执行select方案查询
        ProgramExec.startSelectExecProgram(_order_seq, _program_seq, _deal_bk_seq, sub_tab.step_list).then(function (data) {
            $timeout(function () {
                if (data) {
                    sub_tab.exc_step_flag = true;
                    sub_tab.auth_step_exsit = false;
                    sub_tab.select_path = data.file_path;
                    if (data.exe_msg) {
                        sub_tab.error_message = data.exe_msg.error_message;
                        sub_tab.control.show_error_message = true;
                    }
                    //处理结束显示完成处理按钮
                    sub_tab.finish_deal_order = true;
                    sub_tab.control.exec_loading = false;
                }
            }, 0);
        }, function (error) {
            sub_tab.auth_step_exsit = true;
            sub_tab.exc_step_flag = true;
            sub_tab.control.exec_loading = false;
            sub_tab.control.is_disable = false;
            if (error.task_id) {
                sub_tab.task_id = error.task_id;
                sub_tab.control.is_task_author = true; //任务授权
            } else {
                sub_tab.control.show_result = false;
                sub_tab.control.show_exec_btn = true;
                Modal.alert(error.message);
            }
        });
    };
    //固化方案--批量方案--授权执行
    $scope.startProgramAuthoExec = function (sub_tab) {
        var srvName = "pg_ExcuteBatchPgAction";
        var _srvReqData = {
            submit_type: 2, pend_work_seq: sub_tab.task_id,
            order_seq: sub_tab.basicData.order_seq, program_seq: sub_tab.program_seq,
            file_name: sub_tab.batch_program_fileupload.filename, deal_bk_seq: sub_tab.basicData.deal_bk_seq
        };
        sub_tab.control.exec_loading = true;
        Task.ExecuteTask(_srvReqData, srvName).then(function (data) {
            $timeout(function () {
                if (data) {
                    ProgramExec.getExecdMsg(sub_tab.basicData.order_seq, sub_tab.program_seq, sub_tab.basicData.deal_bk_seq).then(function (data) {
                        sub_tab.program_result_msg = {
                            total_sql: data.task_sql_num,
                            success_num: data.success_num,
                            fail_num: data.fail_num,
                            used_time: data.used_time,
                            task_msg: data.task_msg ? data.task_msg : []
                        };
                        sub_tab.program_file_full_path = data.file_path;
                        //处理结束显示完成处理按钮
                        sub_tab.finish_deal_order = true;
                        sub_tab.control.exec_loading = false;
                        sub_tab.control.is_task_author = false;
                    }, function (error) {
                        sub_tab.control.exec_loading = false;
                        Modal.alert(error.message);
                    });
                }
            }, 0)
        }, function (error) {
            sub_tab.control.exec_loading = false;
            Modal.alert(error.message);
        });
    };
    //固化方案--批量查询方案--授权执行
    $scope.startSelectProgramAuthoExec = function (sub_tab) {
        var srvName = "pg_ExcuteSelpgAction";
        var _srvReqData = {
            submit_type: 2, pend_work_seq: sub_tab.task_id,
            order_seq: sub_tab.basicData.order_seq, program_seq: sub_tab.program_seq,
            deal_bk_seq: sub_tab.basicData.deal_bk_seq
        };
        sub_tab.control.exec_loading = true;
        Task.ExecuteTask(_srvReqData, srvName).then(function (data) {
            $timeout(function () {
                if (data) {
                    sub_tab.exc_step_flag = true;
                    sub_tab.auth_step_exsit = false;
                    sub_tab.control.is_task_author = false;
                    sub_tab.select_path = data.file_path;
                    if (data.exe_msg) {
                        sub_tab.error_message = data.exe_msg.error_message;
                        sub_tab.control.show_error_message = true;
                    }
                    //处理结束显示完成处理按钮
                    sub_tab.finish_deal_order = true;
                    sub_tab.control.exec_loading = false;
                }
            }, 0)
        }, function (error) {
            sub_tab.control.exec_loading = false;
            Modal.alert(error.message);
        });
    };
    //固化方案-批量查询方案-查看授权任务信息
    $scope.viewProgramTaskAuthorDetail = function (sub_tab) {
        Modal.viewBatchImportAuthorDetail(sub_tab.task_id).then(function (workflow_state) {
            if (workflow_state) {
                sub_tab.workflow_state = workflow_state;
                sub_tab.control.finish_author = workflow_state == 6 ? true : false;
            }
        });
    };
    //固化方案--查看授权流程
    $scope.viewAuthProcess = function (sub_tab, index) {
        $scope.pgauthflag.btn_loading = false;
        var _pg_work_seq = sub_tab.steps[index].pg_work_seq;
        Workorder.getPgWorkDetail(_pg_work_seq).then(function (_data) {
            sub_tab.steps[index].pgwork_status = _data.pgwork_status;
            if (_data.pgwork_status == 2) {
                sub_tab.steps[index].stepFormLock = true;
                sub_tab.steps[index].closeTask = true;
            } else if (_data.pgwork_status == 1) {
                sub_tab.steps[index].stepFormLock = true;
            } else {
                sub_tab.steps[index].stepFormLock = false;
            }
            if (_data) {
                Modal.viewWorkOrderFlow(_data).then(function (data) {
                    $scope.pgauthflag.btn_loading = false;
                }, function (error) {
                    $scope.pgauthflag.btn_loading = false;
                    Modal.alert(error.message);
                });
            }
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //固化方案-批量方案-关闭授权任务
    $scope.closeProgramBatchExeTask = function (sub_tab) {
        var param = {
            'pend_wk_seq': sub_tab.task_id,
            'workflow_state': 7
        };
        Task.CloseTask(param).then(function (data) {
            sub_tab.control = {
                show_result: false,
                show_exec_btn: true,
                exec_loading: false,
                is_task_author: false
            };
            sub_tab.workflow_state = '';
            //固化方案--批量方案处理上传文件配置
            sub_tab.batch_program_fileupload = {
                suffixs: 'xls,xlsx',
                filetype: "EXCEL",
                filename: "",
                uploadpath: "",
            }
            ProgramExec.getImportPath(sub_tab.basicData.order_seq, sub_tab.program_seq).then(function (data) {
                if (data) {
                    sub_tab.batch_program_fileupload.uploadpath = data.pg_excel_path;
                }
            }, function (error) {
                Modal.alert(error.message);
            });
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //固化方案-批量方案-关闭授权任务
    $scope.closeSelectProgramBatchExeTask = function (sub_tab) {
        var param = {
            'pend_wk_seq': sub_tab.task_id,
            'workflow_state': 7
        };
        Task.CloseTask(param).then(function (data) {
            sub_tab.control = {
                show_result: false,
                show_exec_btn: true,
                exec_loading: false,
                is_task_author: false
            };
            sub_tab.workflow_state = '';
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    init();
}]);
//工单处理--脚本处理
woCtrl.controller('woScriptHandleCtrl', ["$scope",  "$timeout", "$interval", "$modal", "Workorder", "Program", "WoFlowType", "ProgramExec", "SqlExec", "BucketType", "WoStatusType", "CodeMirrorOption", "Cmpt", "CommData", "Task", "ScriptExec", "CmptFunc", "BusiSys", "Modal", "ProtocolType","IssuFunc", "CV", function ($scope,  $timeout, $interval, $modal, Workorder, Program, WoFlowType, ProgramExec, SqlExec, BucketType, WoStatusType, CodeMirrorOption, Cmpt, CommData, Task, ScriptExec, CmptFunc, BusiSys, Modal, ProtocolType,IssuFunc, CV) {
    //设置协议类型中文显示
    var showProtocotypeCn = function(script_form){
        for(var i=0; i<script_form.soc_list.length; i++){
            var _soc = script_form.soc_list[i];
            _soc.protocol_type_cn = CV.findValue(_soc.protocol_type,ProtocolType);
            if(_soc.ftp_protocol_type){
                _soc.ftp_protocol_type_cn = CV.findValue(_soc.ftp_protocol_type,ProtocolType);
            }
        }
    }
    //获取历史列表以及新的脚本上传路径
    var gethisListAndNewPath = function(sub_tab){
        //获取历史列表服务
        ScriptExec.viewHistoryList(sub_tab.basicData.order_seq, sub_tab.basicData.deal_bk_seq).then(function (data) {
            sub_tab.script_info.execute_list = data.execute_info_list ? data.execute_info_list : [];
            angular.forEach(sub_tab.script_info.execute_list, function (data) {
                data.his_style_flag = true;
                data.str_script = data.script_content ? data.script_content.join(" "):'';
            });
            //刷新列表滚动条自动返回最上端
            $timeout(function () {
                $('#history-record-scroll').animate({'scrollTop': '0'}, 500);
            }, 2000);
        }, function (error) {
            Modal.alert(error.message);
        });
        //获取新的脚本上传相对路径
        ScriptExec.getScriptUploadPath(sub_tab.basicData.order_seq, sub_tab.basicData.deal_bk_seq).then(function (data) {
            sub_tab.basicData.script_path = data.script_path;
            sub_tab.basicData.script_bk_seq = data.script_bk_seq;
            sub_tab.script_info.script_fileupload.uploadpath = data.script_path;
        }, function (error) {
            Modal.alert(error.message);
        });
    }
    //执行时监控
    var exeMoniter = function (sub_tab) {
        sub_tab.script_info.exe_timer = $interval(function () {
            ScriptExec.viewStepDetail(sub_tab.basicData.order_seq, sub_tab.basicData.deal_bk_seq, sub_tab.basicData.script_bk_seq).then(function (data) {
                $timeout(function () {
                    if (data) {
                        //返回的执行结果列表
                        sub_tab.script_info.form_control.exec_result_list = data.exetend_bean.source_list ? data.exetend_bean.source_list : [];
                        //执行完成以后
                        if (sub_tab.script_info.stop_watch_flag) {
                            gethisListAndNewPath(sub_tab);
                            $interval.cancel(sub_tab.script_info.exe_timer);
                        }
                    }
                }, 100);
            }, function (error) {
                $interval.cancel(sub_tab.script_info.exe_timer);
            });
        }, 3000);
    };
    //初始化方法
    var init = function () {
        if ($scope.control.exist_index == -1) {
            var _last_sub_tab = $scope.data.sub_tabs[$scope.data.sub_tabs.length - 1];
            var _handle_type = _last_sub_tab.basicData.handle_type ? _last_sub_tab.basicData.handle_type : _original_handle_type;
            var _order_seq = _last_sub_tab.basicData.order_seq;
            var _deal_bk_seq = _last_sub_tab.basicData.deal_bk_seq;
            $scope.toggle_show = false;
            //解决页面文本编辑器样式问题
            $timeout(function () {
                _last_sub_tab.script_info.script_form.impl_type = 2;
            }, 0);
            //判断当前工单是否存在授权任务
            ScriptExec.viewAuthStepDetail(_order_seq, _deal_bk_seq).then(function (data) {
                if (data.pend_work_seq && data.workflow_state != 6) {
                    _last_sub_tab.control = {
                        is_task_author: true,
                        finish_author: false
                    }
                    _last_sub_tab.task_id = data.pend_work_seq;
                    _last_sub_tab.workflow_state = data.workflow_state ? data.workflow_state : '';
                    _last_sub_tab.script_info.script_form.impl_type = data.exetend_bean.impl_type;
                    _last_sub_tab.script_info.script_form.script_source = data.exetend_bean.script_source;
                    _last_sub_tab.script_info.script_form.script_file_path = data.exetend_bean.scre_bk_path;
                    _last_sub_tab.script_info.script_form.soc_list = data.exetend_bean.source ? data.exetend_bean.source : [];
                    _last_sub_tab.basicData.script_bk_seq = data.exetend_bean.script_bk_seq ? _last_sub_tab.basicData.script_bk_seq : '';
                    _last_sub_tab.script_info.script_form.exe_script = CmptFunc.cmdsToString(data.exetend_bean.script_content);
                    _last_sub_tab.script_info.script_fileupload.filename = data.exetend_bean.scre_bk_path.slice(data.exetend_bean.scre_bk_path.lastIndexOf('/') + 1);
                    _last_sub_tab.script_info.script_fileupload.uploadpath = data.exetend_bean.scre_bk_path.slice(0, data.exetend_bean.scre_bk_path.lastIndexOf('/'));
                    showProtocotypeCn(_last_sub_tab.script_info.script_form);
                }
                if (!_last_sub_tab.basicData.script_bk_seq) {
                    //获取脚本上传相对路径
                    ScriptExec.getScriptUploadPath(_order_seq, _deal_bk_seq).then(function (data) {
                        _last_sub_tab.basicData.script_path = data.script_path;
                        _last_sub_tab.basicData.script_bk_seq = data.script_bk_seq;
                        _last_sub_tab.script_info.script_fileupload.uploadpath = data.script_path;
                    }, function (error) {
                        Modal.alert(error.message);
                    });
                }
            }, function (error) {
                Modal.alert(error.message);
            });
            //获取历史记录
            ScriptExec.viewHistoryList(_order_seq, _deal_bk_seq).then(function (data) {
                _last_sub_tab.script_info.execute_list = data.execute_info_list ? data.execute_info_list : [];
                //给每条历史纪录添加标志位
                for (var i = 0; i < _last_sub_tab.script_info.execute_list.length; i++) {
                    if( _last_sub_tab.script_info.execute_list[i].script_content){
                        _last_sub_tab.script_info.execute_list[i].str_script = _last_sub_tab.script_info.execute_list[i].script_content.join(" ");
                    }
                    _last_sub_tab.script_info.execute_list[i].his_style_flag = !_last_sub_tab.is_detail ? true : false;
                }
                if (_last_sub_tab.is_detail && _last_sub_tab.script_info.execute_list.length > 0) {
                    $scope.rollbackScript(_last_sub_tab, _last_sub_tab.script_info.execute_list[0],0);
                }
            }, function (error) {
                Modal.alert(error.message);
            });
        }
    };
    //脚本处理-计算历史纪录最大高度
    $scope.calculateMaxHeight = function () {
        var _left_height = parseInt($('.orderTabs .tab-pane.active .left-content').css('height'))-25;
        _left_height = _left_height <= 0 ? 309:_left_height;
        return {'height':_left_height+'px'}
    };
    //脚本处理--切换时重新计算
    $scope.select = function(){
        $timeout(function(){
            $scope.calculateMaxHeight();
        },100);
    };
    //脚本处理-选择脚本方式
    $scope.selectScriptMethod = function (impl_type, sub_tab) {
        //初始化表单信息
        var script_info = sub_tab.script_info;
        script_info.script_fileupload.suffixs = (impl_type == 2 ? 'sh' : 'py');
        script_info.script_fileupload.filetype = (impl_type == 2 ? 'SHELL' : 'PYTHON');
        script_info.script_form.exe_script = '';
        script_info.script_form.script_content = [];
        script_info.script_form.script_file_path = '';
        script_info.form_control = {
            exec_result_list: [],
            exec_result: '',
            executing: false,
            cache_soc_list: []
        };
        script_info.script_fileupload.filename = '';
        $scope.form.script_handle_form.$setPristine();
        script_info.script_form.impl_type = impl_type;
    };
    //脚本处理-配置执行数据源
    $scope.configExecuteDataSource = function(script_form){
        var _script_source = script_form.impl_type == 2 ? (script_form.script_source ==1 ? 1:2):2;
        Modal.configDataSource(script_form.impl_type,_script_source,script_form.soc_list,1).then(function(data){
            script_form.soc_list = data ? data : [];
            showProtocotypeCn(script_form);
        });
    };
    //脚本处理--删除单个配置数据源
    $scope.deleteSingleSoc = function (index,soc_list) {
        Modal.confirm("是否要删除此条数据源?").then(function () {
            soc_list.splice(index,1);
        });
    };
    //脚本处理-切换脚本来源
    $scope.changeScriptSource = function (script_info, script_source) {
        script_info.script_form.exe_script = '';
        script_info.script_form.script_content = [];
        script_info.script_form.soc_list = [];
        script_info.form_control.exec_result_list = [];
        script_info.script_fileupload.filename = '';
    };
    //脚本处理-删除脚本文件
    $scope.removeScriptFile = function (script_info) {
        Modal.confirm("确认删除文件【" + script_info.script_fileupload.filename + "】吗？").then(function (choose) {
            if (choose) {
                if (!script_info.rollback_flag) {
                    ScriptExec.deleteFile(script_info.script_form.script_file_path).then(function (data) {
                        script_info.script_fileupload.filename = '';
                        script_info.script_form.script_file_path = '';
                        script_info.script_form.exe_script = '';
                    }, function (error) {
                        Modal.alert(error.message);
                    });
                } else {
                    script_info.script_fileupload.filename = '';
                    script_info.script_form.script_file_path = '';
                    script_info.script_form.exe_script = '';
                }
                script_info.form_control.exec_result_list = [];
            }
        });
    };
    //脚本处理-下载脚本文件
    $scope.downloadScriptFile = function (script_info) {
        CV.downloadFile(script_info.script_form.script_file_path);
    };
    //脚本处理-脚本文件上传成功
    $scope.uploadScriptFileSuccessThen = function (script_info) {
        script_info.rollback_flag = false;
        script_info.script_form.script_file_path = script_info.script_fileupload.uploadpath + script_info.script_fileupload.filename;
        //解析脚本文件
        ScriptExec.parseScriptFile(script_info.script_form.script_file_path).then(function (data) {
            $timeout(function () {
                if (data) {
                    script_info.script_form.exe_script = CmptFunc.cmdsToString(data.script_content);
                    script_info.script_form.script_content = data.script_content ? data.script_content : [];
                }
            }, 0);
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //脚本处理-查看明细
    $scope.viewExeInfo = function (order_seq, deal_bk_seq, script_bk_seq) {
        Modal.viewScriptDetail(order_seq, deal_bk_seq, script_bk_seq).then();
    };
    //脚本处理-退回脚本
    $scope.rollbackScript = function (sub_tab, step, _flag) {
        //可执行
        sub_tab.script_info.form_control.is_rollback = true;
        //清空执行结果
        sub_tab.script_info.form_control.exec_result_list = [];
        sub_tab.script_info.form_control.no_sys_soc_show = false;
        sub_tab.script_info.script_form.soc_list = [];
        //获取脚本执行详情
        ScriptExec.viewStepDetail(step.order_seq, step.deal_bk_seq, step.script_bk_seq).then(function (data) {
            sub_tab.script_info.form_control.is_rollback = false;
            sub_tab.script_info.rollback_flag = true;
            sub_tab.script_info.script_form = data.exetend_bean;
            sub_tab.script_info.script_form.script_file_path = data.exetend_bean.scre_bk_path ? data.exetend_bean.scre_bk_path : '';
            //文件上传参数
            sub_tab.script_info.script_fileupload.filename = sub_tab.script_info.script_form.script_file_path.slice(sub_tab.script_info.script_form.script_file_path.lastIndexOf('/') + 1);
            sub_tab.script_info.script_fileupload.filetype = (data.exetend_bean.impl_type == 2 ? 'SHELL' : 'PYTHON');
            sub_tab.script_info.script_fileupload.suffixs = (data.exetend_bean.impl_type == 2 ? 'sh' : 'py');
            if(data.exetend_bean.script_content){
                sub_tab.script_info.script_form.exe_script = CmptFunc.cmdsToString(data.exetend_bean.script_content);
            }
            sub_tab.script_info.script_form.soc_list = (!sub_tab.is_detail && _flag) ? [] : data.exetend_bean.source_list;
            sub_tab.script_info.form_control.exec_result_list = sub_tab.is_detail ? (data.exetend_bean.source_list ? data.exetend_bean.source_list : []) : [];
            sub_tab.script_info.form_control.cache_soc_list = data.exetend_bean.source_list ? data.exetend_bean.source_list : [];
            showProtocotypeCn(sub_tab.script_info.script_form);
            //绑定语言环境
            sub_tab.script_info.language_name = data.exetend_bean.language_name ? data.exetend_bean.language_name : '';
            sub_tab.script_info.language_version = data.exetend_bean.language_version ? data.exetend_bean.language_version : '';
            sub_tab.script_info.operating_system = data.exetend_bean.operating_system ? data.exetend_bean.operating_system : '';
            sub_tab.script_info.bit_number = data.exetend_bean.bit_number ? data.exetend_bean.bit_number : '';
        }, function (error) {
            Modal.alert(error.message);
        });
        //获取新的脚本上传相对路径
        ScriptExec.getScriptUploadPath(step.order_seq, step.deal_bk_seq).then(function (data) {
            sub_tab.basicData.script_path = data.script_path;
            sub_tab.basicData.script_bk_seq = data.script_bk_seq;
            sub_tab.script_info.script_fileupload.uploadpath = data.script_path;
        }, function (error) {
            Modal.alert(error.message);
        });
        //清空脚本文件
        if (step.script_source == 1) {
            if (sub_tab.script_info.script_fileupload.filename) {
                sub_tab.script_info.script_form.script_file_path = '';
                sub_tab.script_info.script_fileupload.filename = '';
            }
        }
        //查看状态下修改历史纪录的样式
        if (sub_tab.is_detail) {
            if (step.his_style_flag) {
                return;
            } else {
                angular.forEach(sub_tab.script_info.execute_list, function (data) {
                    data.his_style_flag = false;
                });
                step.his_style_flag = true;
            }
        }
    };
    //脚本处理-提交表单-执行
    $scope.submitScriptHandle = function (sub_tab, script_info) {
        sub_tab.control = {
            is_task_author: false,
            finish_author: false,
        }
        if (!CV.valiForm($scope.form.script_handle_form)) {
            return false;
        }
        if (script_info.script_form.soc_list.length == 0) {
            script_info.form_control.no_sys_soc_show = true;
            return false;
        }
        if (script_info.script_form.script_source == 2 && !script_info.script_fileupload.filename) {
            Modal.alert("请上传脚本文件");
            return false;
        }
        script_info.form_control.executing = true;
        script_info.stop_watch_flag = false;
        //保存信息--保存后执行
        $timeout(function () {
            exeMoniter(sub_tab);
        }, 0);
        script_info.script_form.order_seq = sub_tab.basicData.order_seq;
        script_info.script_form.script_bk_seq = sub_tab.basicData.script_bk_seq;
        script_info.script_form.deal_bk_seq = sub_tab.basicData.deal_bk_seq;
        script_info.script_form.source = script_info.script_form.soc_list;
        //将执行脚本转为数组
        script_info.script_form.script_content = CmptFunc.stringToCmds(script_info.script_form.exe_script);
        script_info.form_control.exec_result_list = [];
        //封装执行需要的数据
        var _submit_object = {
            deal_bk_seq: script_info.script_form.deal_bk_seq,
            order_seq: script_info.script_form.order_seq,
            script_bk_seq: script_info.script_form.script_bk_seq,
            impl_type: script_info.script_form.impl_type,
            script_source: script_info.script_form.script_source,
            script_file_path: script_info.script_form.script_file_path,
            script_content: script_info.script_form.script_content,
            source: [],
            script_text: script_info.script_form.exe_script,
        };
        for (var i = 0; i < script_info.script_form.soc_list.length; i++) {
            var _soc_list = script_info.script_form.soc_list[i];
            _submit_object.source.push({
                soc_ip: _soc_list.soc_ip,
                soc_name: _soc_list.soc_name,
                ftp_soc_name: _soc_list.ftp_soc_name
            });
        }
        ScriptExec.execute(_submit_object).then(function (data) {
            if (data) {
                //停止监控
                script_info.stop_watch_flag = true;
                //执行过
                script_info.form_control.has_exec_flag = true;
                script_info.form_control.executing = false;
            }
        }, function (error) {
            if (error.task_id) {
                sub_tab.task_id = error.task_id;
                sub_tab.control.is_task_author = true; //任务授权
            } else {
                Modal.alert(error.message);
            }
            script_info.stop_watch_flag = true;
            sub_tab.workflow_state = "";
            sub_tab.script_info.form_control.executing = false;
        });
    };
    //脚本处理-授权执行
    $scope.execScriptBatchExeTask = function (sub_tab) {
        var srvName = "sc_ExecuteScriptAction";
        sub_tab.script_info.form_control.executing = true;
        sub_tab.script_info.stop_watch_flag = false;
        //保存信息--保存后执行
        $timeout(function () {
            exeMoniter(sub_tab);
        }, 0);
        sub_tab.script_info.script_form.order_seq = sub_tab.basicData.order_seq;
        sub_tab.script_info.script_form.script_bk_seq = sub_tab.basicData.script_bk_seq;
        sub_tab.script_info.script_form.deal_bk_seq = sub_tab.basicData.deal_bk_seq;
        sub_tab.script_info.script_form.source = sub_tab.script_info.script_form.soc_list;
        //将执行脚本转为数组
        sub_tab.script_info.script_form.script_content = CmptFunc.stringToCmds(sub_tab.script_info.script_form.exe_script);
        var _srvReqData = {
            submit_type: 2,
            pend_work_seq: sub_tab.task_id,
            deal_bk_seq: sub_tab.script_info.script_form.deal_bk_seq,
            order_seq: sub_tab.script_info.script_form.order_seq,
            script_bk_seq: sub_tab.script_info.script_form.script_bk_seq,
            impl_type: sub_tab.script_info.script_form.impl_type,
            script_source: sub_tab.script_info.script_form.script_source,
            script_file_path: sub_tab.script_info.script_form.script_file_path,
            script_content: sub_tab.script_info.script_form.script_content,
            source: []
        };
        for (var i = 0; i < sub_tab.script_info.script_form.soc_list.length; i++) {
            var _soc_list = sub_tab.script_info.script_form.soc_list[i];
            _srvReqData.source.push({
                soc_ip: _soc_list.soc_ip,
                soc_name: _soc_list.soc_name,
                ftp_soc_name: _soc_list.ftp_soc_name
            });
        }
        Task.ExecuteTask(_srvReqData, srvName).then(function (data) {
            $timeout(function () {
                if (data) {
                    //停止监控
                    sub_tab.script_info.stop_watch_flag = true;
                    sub_tab.control.is_task_author = false;
                    sub_tab.control.finish_author = true;
                    //执行过
                    sub_tab.script_info.form_control.has_exec_flag = true;
                    sub_tab.script_info.form_control.executing = false;
                }
            }, 0)
        }, function (error) {
            sub_tab.script_info.stop_watch_flag = true;
            sub_tab.script_info.form_control.executing = false;
            Modal.alert(error.message);
        });
    };
    //脚本处理-停止脚本执行
    $scope.stopScriptExecute = function(sub_tab){
        var _order_seq = sub_tab.basicData.order_seq;
        var _deal_bk_seq = sub_tab.basicData.deal_bk_seq;
        var _script_bk_seq = sub_tab.basicData.script_bk_seq;
        ScriptExec.stopScriptExec(_order_seq,_deal_bk_seq,_script_bk_seq).then(function(data){
            if(data){}
        },function(error){
            Modal.alert(error.message);
        });
    };
    //脚本处理-重置表单
    $scope.resetScriptHandle = function (sub_tab, script_info) {
        script_info.form_control.no_sys_soc_show = false;
        //执行脚本类型
        var _impl_type = angular.copy(script_info.script_form.impl_type);
        //初始化表单信息
        script_info.script_form = {
            soc_list: [],
            script_source: 1,
            exe_script: '',
            script_content: [],
            script_file_path: ''
        };
        script_info.form_control = {
            exec_result_list: [],
            exec_result: '',
            executing: false,
            cache_soc_list: []
        };
        script_info.script_fileupload.filename = '';
        //表单初始化
        $scope.form.script_handle_form.$setPristine();
        //脚本类型
        script_info.script_form.impl_type = _impl_type;
        //清空执行结果
        script_info.form_control.exec_result_list = [];
        var param = {
            'pend_wk_seq': sub_tab.task_id,
            'workflow_state': 7
        };
        // Task.CloseTask(param).then(function (data) {
        //     sub_tab.workflow_state = 7;
        //     sub_tab.control.is_task_author = false;
        //     //放弃处理按钮--隐藏/显示
        //     IssuFunc.quitHandleBtnControl(sub_tab);
        //     //完成处理按钮--隐藏/显示
        //     IssuFunc.finishHandleBtnControl(sub_tab);
        //     Modal.alert("任务成功关闭！");
        // }, function (error) {
        //     Modal.alert(error.message);
        // });
        console.log(sub_tab.basicData.order_seq);
        //获取新的脚本上传相对路径
        ScriptExec.getScriptUploadPath(sub_tab.basicData.order_seq, sub_tab.basicData.deal_bk_seq).then(function (data) {
            sub_tab.basicData.script_path = data.script_path;
            sub_tab.basicData.script_bk_seq = data.script_bk_seq;
            sub_tab.script_info.script_fileupload.uploadpath = data.script_path;
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //删除执行结果
    $scope.deleteExecResult = function (sub_tab) {
        sub_tab.script_info.form_control.exec_result_list = [];
    };
    init();
}]);
//工单处理--数据导出
woCtrl.controller('woExportDataCtrl', ["$scope", "$timeout", "$interval", "$modal", "Workorder", "Program", "WoFlowType", "ProgramExec", "SqlExec", "BucketType", "WoStatusType", "CodeMirrorOption", "Cmpt", "CommData", "Task", "ScriptExec", "CmptFunc", "BusiSys", "IssuFunc","Modal", "CV", function ($scope, $timeout, $interval, $modal, Workorder, Program, WoFlowType, ProgramExec, SqlExec, BucketType, WoStatusType, CodeMirrorOption, Cmpt, CommData, Task, ScriptExec, CmptFunc, BusiSys,IssuFunc, Modal, CV) {
    //手工sql/数据导出--添加sql语句
    $scope.addHandleSQL = function (sub_tab) {
        IssuFunc.addSqlText(sub_tab);
    };
    //手工sql/数据导出--删除单条sql语句
    $scope.deleteSqlStep = function (sql_work_seq, index, sub_tab, sql_text) {
        IssuFunc.deleteHandleSqlText(sql_text,sql_work_seq,sub_tab,index);
    };
    //手工sql/数据导出--查看Sql详细步骤
    $scope.viewSqlStepDetailModal = function (sql_work_seq) {
        Modal.viewSqlDetailStep(sql_work_seq).then(function () {});
    };
    //数据导出--提交--单个SQL操作
    $scope.submitSqlStep = function (sql_step, sql_step_index, sub_tab, start_num, end_num) {
        var _select_sql_list = []; //选择的sql列表
        var _modify_sql_list = []; //修改的sql列表
        var _sql_info_list = []; //sql列表
        var _unsubmit_sql_steps = ''; //未提交的sql步骤
        Modal.confirmSqlStatement(sql_step, _unsubmit_sql_steps).then(function () {
            //显示提交加载按钮
            sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = true;
            _select_sql_list.push({
                sql_work_seq: sub_tab.sql_steps[sql_step_index].sql_work_seq,
                sql_text: sub_tab.sql_steps[sql_step_index].sql_text,
                order_seq: sub_tab.basicData.order_seq,
                deal_bk_seq: sub_tab.basicData.deal_bk_seq
            });
            //查询类SQL执行信息
            SqlExec.exportQueryData(_select_sql_list, sub_tab.sql_steps[sql_step_index].sql_text, sub_tab.sql_steps[sql_step_index].sensite_list).then(function (data) {
                if (data.query_msg) {
                    var _query_msg_list = data.query_msg;
                    //获取sql执行信息
                    IssuFunc.getSqlMsgList(_query_msg_list, sub_tab.sql_steps);
                    sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
                    //全部提交按钮--隐藏
                    sub_tab.show_all_submit_btn = false;
                    //放弃处理按钮--隐藏/显示
                    IssuFunc.quitHandleBtnControl(sub_tab);
                    //完成处理按钮--隐藏/显示
                    IssuFunc.finishHandleBtnControl(sub_tab);
                }
                if (data.download_path_list) {
                    sub_tab.sql_steps[sql_step_index].download_bk_path = data.download_path_list[0];
                }
            }, function (error) {
                sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
                if (error.task_id) {
                    sub_tab.sql_steps[sql_step_index].pend_work_seq = error.task_id;
                    sub_tab.sql_steps[sql_step_index].is_single_task_author = true;
                    //放弃处理按钮--隐藏/显示
                    IssuFunc.quitHandleBtnControl(sub_tab);
                } else {
                    Modal.alert(error.message);
                }
            });
        });
    };
    //数据导出--授权导出
    $scope.dataExportAuthor = function(sql_step, sql_step_index, sub_tab){
        var srvName = 'sl_ExportSelectDataAction';
        var _select_sql_list = []; //选择的sql列表
        var _srvReqData = {};
        sub_tab.sql_steps[sql_step_index].is_close_loading = true;
        _select_sql_list.push({
            sql_work_seq: sub_tab.sql_steps[sql_step_index].sql_work_seq,
            sql_text: sub_tab.sql_steps[sql_step_index].sql_text
        });
        _srvReqData = {
            submit_type: 2,
            pend_work_seq: sql_step.pend_work_seq,
            query_sql_list: [],
            sql_text: sub_tab.sql_steps[sql_step_index].sql_text,
            sensite_list: sub_tab.sql_steps[sql_step_index].sensite_list
        };
        //显示提交加载按钮
        sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = true;
        Task.ExecuteTask(_srvReqData, srvName).then(function (data) {
            $timeout(function () {
                if (data) {
                    sub_tab.sql_steps[sql_step_index].is_close_loading = false;
                    sub_tab.sql_steps[sql_step_index].is_single_task_author = false;
                    var _query_msg_list = data.query_msg ? data.query_msg : [];
                    for (var i = 0; i < data.query_msg.length; i++) {
                        if (data.query_msg[i].theads) {
                            data.query_msg[i].theads = IssuFunc.setPrimaryKeySort(data.query_msg[i].theads);
                        }
                    }
                    //分页数据生成
                    IssuFunc.createPageNumberByData(sub_tab.sql_steps[sql_step_index], _query_msg_list);
                    //sql查询信息
                    IssuFunc.getSqlMsgList(_query_msg_list, sub_tab.sql_steps);
                    //提交按钮--加载
                    sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
                    //放弃处理按钮--隐藏/显示
                    IssuFunc.quitHandleBtnControl(sub_tab);
                    //完成处理按钮--隐藏/显示
                    IssuFunc.finishHandleBtnControl(sub_tab);
                    if (data.download_path_list) {
                        sub_tab.sql_steps[sql_step_index].download_bk_path = data.download_path_list[0];
                    }
                }
            }, 0);
        }, function (error) {
            sub_tab.sql_steps[sql_step_index].submit_sql_btn_loading = false;
            sub_tab.sql_steps[sql_step_index].is_close_loading = false;
            Modal.alert(error.message);
        });
    };
    //数据导出--导出数据
    $scope.loadData = function (path) {
        CV.downloadFile(path);
    };
}]);
/**
 *所有工单列表
 * */
woCtrl.controller('woAllListCtrl', ["$scope", "Workorder", "BusiSys", "WoStatusType", "WorkorderType","ScrollBarConfig", "Modal", "CV", function ($scope, Workorder, BusiSys, WoStatusType, WorkorderType,ScrollBarConfig, Modal, CV) {
    //页面数据
    $scope.data = {
        senior_header_list : [] , // 高级搜索头部显示展示数组
    };
    //页面交互数据
    $scope.info = {
        nomarlKeyWord : '', //普通搜索关键字
        hightSearchObj : { //高级搜索对象
            key_word : '', //关键字
            crt_user_id : '', //创建人
            deal_user_id : '', //处理人
            crt_start_date : '',//创建开始时间
            crt_end_date  : '',//创建结束时间
            deal_start_date : '', //处理开始时间
            deal_end_date : '', //处理结束时间
            workorder_type     : [],  //工单类型数组
            workorder_status   : [],  //工单状态数组
            system_list        : [],  //系统列表
            create_user_list   : [],  //所有创建人列表
            handler_user_list  : [],  //所有责任人列表
        }
    };
    //页面控制标志
    $scope.control = {
        searchSeniorFlag : false , //高级搜索显示标志
        systemFlag       : false , //系统展开收起标志
        crt_opened       : false , //创建时间控件打开标志
    };
    //页面配置
    $scope.config = {
        datepicker : {   //日期控件最大日期
            maxDate: new Date()
        },
        scroll_config : ScrollBarConfig.Y()
    };
    //初始化方法
    var init = function () {
        //转化工单类型
        for (var i = 0; i < WorkorderType.length; i++) {
            $scope.info.hightSearchObj.workorder_type.push({
                key: WorkorderType[i].key,
                value: WorkorderType[i].value,
                flag: false
            })
        }
        //转化工单状态
        for (var i = 0; i < WoStatusType.length; i++) {
            $scope.info.hightSearchObj.workorder_status.push({
                key: WoStatusType[i].key,
                value: WoStatusType[i].value,
                flag: false
            })
        }
        //查询故障系统
        BusiSys.getAllBusinessSys().then(function (data) {
            if (data.list_bs) {
                for (var i = 0; i < data.list_bs.length; i++) {
                    $scope.info.hightSearchObj.system_list.push({value: data.list_bs[i], flag: false});
                }
                if ($scope.info.hightSearchObj.system_list.length > 3) {
                    $scope.control.systemFlag = false;
                }
                if ($scope.info.hightSearchObj.system_list.length > 0 && $scope.info.hightSearchObj.system_list.length <= 3) {
                    $scope.control.systemFlag = true;
                }
            }
        }, function (error) {
            Modal.alert(error.message);
        });
        //查询所有创建人
        Workorder.getAllCreaterList().then(function (data) {
            if (data) {
                $scope.data.create_user_list = data.user_list;
            }
        }, function (error) {
            Modal.alert(error.message);
        });
        //查询所有责任人
        Workorder.getAllHandlerList().then(function (data) {
            if (data) {
                $scope.data.handler_user_list = data.user_list;
            }
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //控件--创建开始时间打开
    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.control.crt_opened = true;
    };
    //控件--处理开始时间打开
    $scope.dealOpen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.control.deal_opened = true;
    };
    //监控搜索对象
    $scope.$watch('info.hightSearchObj', function (newValue, oldValue) {
        $scope.data.senior_header_list = [];
        if ($scope.info.hightSearchObj.key_word) {
            $scope.data.senior_header_list.push({key: 1, value: "关键字：" + $scope.info.hightSearchObj.key_word});
        }
        for (var i = 0; i < $scope.info.hightSearchObj.system_list.length; i++) {
            if ($scope.info.hightSearchObj.system_list[i].flag) {
                $scope.data.senior_header_list.push({
                    key: 2,
                    value: $scope.info.hightSearchObj.system_list[i].value.business_cn_name
                });
            }
        }
        for (var i = 0; i < $scope.info.hightSearchObj.workorder_type.length; i++) {
            if ($scope.info.hightSearchObj.workorder_type[i].flag) {
                $scope.data.senior_header_list.push({key: 3, value: $scope.info.hightSearchObj.workorder_type[i].value});
            }
        }
        for (var i = 0; i < $scope.info.hightSearchObj.workorder_status.length; i++) {
            if ($scope.info.hightSearchObj.workorder_status[i].flag) {
                $scope.data.senior_header_list.push({key: 4, value: $scope.info.hightSearchObj.workorder_status[i].value});
            }
        }
        if ($scope.info.hightSearchObj.crt_user_id) {
            for (var i = 0; i < $scope.data.create_user_list.length; i++) {
                if ($scope.info.hightSearchObj.crt_user_id == $scope.data.create_user_list[i].user_id) {
                    $scope.data.senior_header_list.push({key: 5, value: "创建人：" + $scope.data.create_user_list[i].user_cn_name});
                }
            }

        }
        if ($scope.info.hightSearchObj.deal_user_id) {
            for (var i = 0; i < $scope.data.handler_user_list.length; i++) {
                if ($scope.info.hightSearchObj.deal_user_id == $scope.data.handler_user_list[i].user_id) {
                    $scope.data.senior_header_list.push({
                        key: 6,
                        value: "处理人：" + $scope.data.handler_user_list[i].user_cn_name
                    });
                }
            }
        }
        if ($scope.info.hightSearchObj.crt_start_date) {
            if ($scope.info.hightSearchObj.crt_end_date) {
                if ($scope.info.hightSearchObj.crt_end_date.getTime() < $scope.info.hightSearchObj.crt_start_date.getTime()) {
                    Modal.alert("创建日期不合法");
                    $scope.info.hightSearchObj.crt_start_date = "";
                    $scope.info.hightSearchObj.crt_end_date = "";
                    return false;
                } else {
                    $scope.data.senior_header_list.push({
                        key: 7,
                        value: "创建日期：" + CV.dtFormat($scope.info.hightSearchObj.crt_start_date, '-') + "/" + CV.dtFormat($scope.info.hightSearchObj.crt_end_date, '-')
                    });
                }
            } else {
                $scope.data.senior_header_list.push({
                    key: 7,
                    value: "创建时间：" + CV.dtFormat($scope.info.hightSearchObj.crt_start_date, '-') + "/至今"
                });
            }
        } else {
            if ($scope.info.hightSearchObj.crt_end_date) {
                $scope.data.senior_header_list.push({
                    key: 7,
                    value: "创建日期：" + "从前至" + CV.dtFormat($scope.info.hightSearchObj.crt_end_date, '-')
                });
            }
        }
        if ($scope.info.hightSearchObj.deal_start_date) {
            if ($scope.info.hightSearchObj.deal_end_date) {
                if ($scope.info.hightSearchObj.deal_end_date.getTime() < $scope.info.hightSearchObj.deal_start_date.getTime()) {
                    Modal.alert("结束日期不合法");
                    $scope.info.hightSearchObj.crt_start_date = "";
                    $scope.info.hightSearchObj.crt_end_date = "";
                    return false;
                } else {
                    $scope.data.senior_header_list.push({
                        key: 8,
                        value: "处理日期：" + CV.dtFormat($scope.info.hightSearchObj.deal_start_date, '-') + "/" + CV.dtFormat($scope.info.hightSearchObj.deal_end_date, '-')
                    });
                }
            } else {
                $scope.data.senior_header_list.push({
                    key: 8,
                    value: "处理日期：" + CV.dtFormat($scope.info.hightSearchObj.deal_start_date, '-') + "/至今"
                });
            }
        } else {
            if ($scope.info.hightSearchObj.deal_end_date) {
                $scope.data.senior_header_list.push({
                    key: 8,
                    value: "处理日期：" + "从前至" + CV.dtFormat($scope.info.hightSearchObj.deal_end_date, '-')
                });
            }
        }

    }, true);
    //加载
    init();
}]);
/**
 *工单查看
 * */
woCtrl.controller('woDetailCtrl', ["$scope", "$timeout","$state", "$stateParams", "$location", "BucketType", "ProgramExec", "Program", "WoStatusType", "SqlExec", "Workorder", "WoFlowType", "ScriptExec", "BusiSys", "CodeMirrorOption", "Modal", "ProtocolType", "IssuFunc", "CV", function ($scope, $timeout,$state, $stateParams, $location, BucketType, ProgramExec, Program, WoStatusType, SqlExec, Workorder, WoFlowType, ScriptExec, BusiSys, CodeMirrorOption, Modal, ProtocolType, IssuFunc, CV) {
    //工单编号
    var wo_id = $stateParams.wo_seq;
    //工单所有处理信息
    $scope.sub_tab = {
        'wo_id': wo_id,
        'show_all_detail': false,
        'showParamList': true,
        steps: [],
        flowData: [],
        is_detail: true,
        script_info: {
            view_options: CodeMirrorOption.Sh(true), //查看执行脚本
            view_python_options: CodeMirrorOption.Python(true), //编辑执行脚本
            data : {
                impl_type_list: [{key: 2, value: 'shell'}, {key: 7, value: 'python2'}, {key: 8,value: 'python3'}],
            },
            script_form: {
                soc_list: [],
                script_source: 1,
                exe_script: '',
                script_content: [],
                script_file_path: '',
                impl_type: 2
            },
            form_control: {     //表单控制
                exec_result_list: [],//执行结果列表
                cache_soc_list: [],//缓存数据源列表
                exec_result: '',//执行结果
            },
            script_fileupload: {
                filename: "",
            }
        },
        sql_steps : [], //手工sql 列表
    };
    //页面控制
    $scope.control = {
      wo_detail_flag : true, //工单查看标志
    };
    //脚本维护-格式化执行脚本
    var cmdFormat = function (arr) {
        var str = "";
        for (var i = 0; i < arr.length - 1; i++) {
            str += (arr[i] + "\n"); //脚本换行显示
        }
        return str += arr[arr.length - 1];
    };
    //脚本维护-查看明细:
    var detailExeInfo = function (order_seq, deal_bk_seq, script_bk_seq) {
        ScriptExec.viewStepDetail(order_seq, deal_bk_seq, script_bk_seq).then(function (data) {
            $timeout(function () {
                if (data) {
                    $scope.sub_tab.script_info.script_form = data.exetend_bean;
                    $scope.sub_tab.script_info.script_form.exe_script = data.exetend_bean.script_content ? cmdFormat(data.exetend_bean.script_content) : '';
                    $scope.sub_tab.script_info.form_control.exec_result_list = data.exetend_bean.source_list ? data.exetend_bean.source_list : [];
                    for(var i=0; i<$scope.sub_tab.script_info.form_control.exec_result_list.length; i++){
                        var _soc = $scope.sub_tab.script_info.form_control.exec_result_list[i];
                        _soc.protocol_type_cn = CV.findValue(_soc.protocol_type,ProtocolType);
                        if(_soc.ftp_protocol_type){
                            _soc.ftp_protocol_type_cn = CV.findValue(_soc.ftp_protocol_type,ProtocolType);
                        }
                    }
                    $scope.sub_tab.script_info.script_form.soc_list =$scope.sub_tab.script_info.form_control.exec_result_list;
                        //是否有下载文件
                    $scope.sub_tab.script_info.script_fileupload.filetype = (data.exetend_bean.impl_type == 2 ? 'SHELL' : 'PYTHON');
                    $scope.sub_tab.script_info.script_form.script_file_path = data.exetend_bean.scre_bk_path ? data.exetend_bean.scre_bk_path : '';
                    $scope.sub_tab.script_info.script_fileupload.filename = $scope.sub_tab.script_info.script_form.script_file_path.slice($scope.sub_tab.script_info.script_form.script_file_path.lastIndexOf('/') + 1);
                    $timeout(function () {
                        angular.forEach($scope.sub_tab.script_info.form_control.exec_result_list, function (data, index) {
                            data.show_expand_btn = false;
                            var _result_ele = $('#exec-result-' + index);
                            if (_result_ele.width() > 299) {
                                data.show_expand_btn = true;
                            }
                        });
                    }, 500);
                }
            }, 0);
        }, function (error) {
        });
    };
    var init = function () {
        //基础数据-基本信息
        Workorder.getWorkorder(wo_id).then(function (data) {
            if(data.woorderbean){
                $scope.sub_tab.basicData = data.woorderbean ? data.woorderbean : {};
                //handle_type：1 sql维护,2 方案维护,3 执行脚本 4,数据导出
                var _handle_type = $scope.sub_tab.basicData.handle_type;
                var _order_seq = $scope.sub_tab.basicData.order_seq;
                var _deal_bk_seq = $scope.sub_tab.basicData.deal_bk_seq;
                $scope.sub_tab.handle_type = _handle_type ? _handle_type : '';
                $scope.sub_tab.sqlexe_type = $scope.sub_tab.basicData.sqlexe_type;
                $scope.sub_tab.basicData.order_cn_state = CV.findValue($scope.sub_tab.basicData.order_state,WoStatusType);
                if (_handle_type == 1 || _handle_type == 4) {
                    //手工输入sql
                    if ($scope.sub_tab.basicData.sqlexe_type == 1 || _handle_type == 4) {
                        SqlExec.submitedSqlList(_order_seq, _deal_bk_seq).then(function (data) {
                            var _sql_msg_list = data.sql_msg_list ? data.sql_msg_list : [];
                            $scope.sub_tab.sql_steps = _sql_msg_list;
                            //时段转化中文名
                            IssuFunc.sqlBucketTranslateCnType(_sql_msg_list);
                        }, function (error) {
                            Modal.alert(error.message);
                        });
                    } else {
                        //查询批量导入sql信息
                        SqlExec.submitedImportSqlList(_order_seq, _deal_bk_seq).then(function (data) {
                            $scope.sub_tab.sql_steps = data.batch_sql_list ? data.batch_sql_list : [];
                            angular.forEach($scope.sub_tab.sql_steps, function (data) {
                                data.act_exec_time = data.act_exec_time ? IssuFunc.sqlExeTimeUsedFmt(data.act_exec_time) : 0;
                                data.import_file_info = data;
                                if (data.act_exec_time) {
                                    data.exe_result_info = data;
                                }
                                data.exe_success = data.act_exec_time ? true : false;
                                data.is_exe_detail = true;
                                data.parse_success = true;
                                data.parse_loading = false;
                                if (data.pend_work_seq) {
                                    data.is_task_author = true;
                                    data.sql_state = 1;
                                }
                                data.fileupload = {
                                    suffixs: 'sql', filetype: "SQL",
                                    filename: data.sql_bk_path ? data.sql_bk_path.substring(data.sql_bk_path.lastIndexOf("/") + 1, data.sql_bk_path.length) : '',
                                    uploadpath: $scope.sub_tab.sql_import_path
                                };
                                data.sql_info = {
                                    script_file_path: $scope.sub_tab.sql_import_path + data.fileupload.filename,
                                    sys_name: data.sys_name,
                                    soc_name: data.soc_name,
                                    sql_soc_list: []
                                };
                            });
                        }, function (error) {
                            Modal.alert(error.message);
                        });
                    }
                }
                if (_handle_type == 2) {
                    //表明此前选中的方案是固化方案
                    $scope.sub_tab.showParamList = false;
                    ProgramExec.getProgramType(_order_seq, _deal_bk_seq).then(function (data) {
                        $timeout(function () {
                            if (data) {
                                if (data.pg_source == 1) {
                                    //查询已执行的固化方案步骤列表
                                    var next_step_count; //下一步骤号
                                    var step_seq_count; //用来做判断的步骤序号
                                    var next_step_seq; //下一步id
                                    var next_step_title; //下一步title
                                    //查询已执行的步骤列表
                                    ProgramExec.getExedProgramStep(_order_seq, _deal_bk_seq).then(function (data) {
                                        //得到所有的步骤信息
                                        $scope.sub_tab.showParamList = false;
                                        var _step_exe_list = data.step_exe_list ? data.step_exe_list : [];
                                        if (_step_exe_list.length != 0) $scope.sub_tab.exc_step_flag = true;
                                        next_step_count = data.next_step;
                                        $scope.sub_tab.next_step_btn = data.next_step;
                                        //是否重置按钮
                                        if (next_step_count == 1 && _step_exe_list.length == 0) {
                                            $scope.sub_tab.first_show_resetall = false;
                                        } else {
                                            $scope.sub_tab.first_show_resetall = true; //可以显示全部重置
                                        }
                                        //获得最后一步步骤序号
                                        step_seq_count = _step_exe_list.length == 0 ? 0 : _step_exe_list[_step_exe_list.length - 1].step_seq;
                                        //把方案信息给当前要处理的工单
                                        $scope.sub_tab.next_step = data.next_step;
                                        $scope.sub_tab.program_seq = data.program_seq;
                                        $scope.sub_tab.program_name = data.program_name;
                                        //需要根据方案得到的步骤信息，给步骤信息赋值
                                        Program.getProgramInfoAndStepList(data.program_seq).then(function (data) {
                                            if (data.program_step_list) {
                                                for (var i = 0; i < data.program_step_list.length; i++) {
                                                    var _one_step = {
                                                        step_seq: data.program_step_list[i].step_seq,
                                                        step_bk_title: data.program_step_list[i].step_bk_title,
                                                        sql_list: [],
                                                        pgsubmit_type: '',
                                                        type: 0,
                                                        data: [],
                                                        reset_show: true, //如果之前操作过此工单，就需要刚进入可以重置每一步
                                                        is_exception: false, //是否有异常
                                                        exception_reason: "" //异常原因
                                                    };
                                                    var _execd_step = null;
                                                    var _total_count = 0;
                                                    var _sql_basic_list = [];
                                                    for (var j = 0; j < _step_exe_list.length; j++) { //已执行的步骤列表
                                                        var _step_exe = _step_exe_list[j];
                                                        if (_step_exe.step_seq == _one_step.step_seq) {
                                                            var _sql_list = _step_exe.program_sql_list ? _step_exe.program_sql_list : [];
                                                            var _sql_result_list = _step_exe.sql_result_list ? _step_exe.sql_result_list : [];
                                                            for (var k = 0; k < _sql_list.length; k++) { //步骤的SQL列表
                                                                var _sql = _sql_list[k];
                                                                var _sql_result = _sql_result_list[k];
                                                                //计算查询条数
                                                                if (_sql.sql_type == 1) {
                                                                    _total_count += _sql_result.total_count;
                                                                }
                                                                //构造sql_basic_list
                                                                var _param_list = _sql.sql_param_list ? _sql.sql_param_list : [];
                                                                for (var x = 0; x < _param_list.length; x++) {
                                                                    var _param = _param_list[x];
                                                                    _param.sparam_value_text = "";
                                                                    if (_param.sparam_type == 1 || _param.sparam_type == 5) { //有Key&Value选项的参数
                                                                        _param.sparam_value_text = _param.sparam_value;
                                                                    } else {
                                                                        var _sparam_scope_list = angular.fromJson(_param.sparam_scope);
                                                                        if (_param.sparam_type == 3) {
                                                                            var _param_value_text_list = [];
                                                                            var sparam_value_list = [];
                                                                            sparam_value_list = _param.sparam_value.split(",");
                                                                            for (var y = 0; y < sparam_value_list.length; y++) {
                                                                                _param_value_text_list.push(CV.findValue(sparam_value_list[y], _sparam_scope_list));
                                                                            }
                                                                            _param.sparam_value_text = _param_value_text_list.join(",");
                                                                        }
                                                                        if (_param.sparam_type == 2 || _param.sparam_type == 4) {
                                                                            _param.sparam_value_text = CV.findValue(_param.sparam_value, _sparam_scope_list);
                                                                        }
                                                                    }
                                                                    _sql_basic_list.push({
                                                                        key: _param.sparam_cn_name,
                                                                        value: _param.sparam_value_text
                                                                    })
                                                                }
                                                            }
                                                            _execd_step = _step_exe;
                                                            break;
                                                        }
                                                    }
                                                    if (_execd_step) {
                                                        if (_execd_step.pg_work_seq) {
                                                            // _auth_step_exsit = true;
                                                            $scope.sub_tab.first_show_resetall = false;
                                                            $scope.sub_tab.auth_step_exsit = true;
                                                            //如果当前是带授权或者授权通过未执行的这里要加锁并且给当前步骤赋执行授权权限
                                                            _one_step.pg_work_seq = _execd_step.pg_work_seq;
                                                            _one_step.viewFlow = true;
                                                            if (_execd_step.pgwork_status == 1) { //待授权
                                                                _one_step.stepFormLock = true;
                                                                _one_step.pgsubmit_type = 2;
                                                                _one_step.pgwork_status = 1;
                                                            } else if (_execd_step.pgwork_status == 2) { //授权拒绝
                                                                _one_step.stepFormLock = true;
                                                                _one_step.closeTask = true;
                                                                _one_step.pgwork_status = 2;
                                                                //授权拒绝应该关闭任务
                                                            } else if (_execd_step.pgwork_status == 3) { //待执行
                                                                _one_step.stepFormLock = true;
                                                                _one_step.pgsubmit_type = 2;
                                                                _one_step.pgwork_status = 3;
                                                            }
                                                            _one_step.type = 1;
                                                        } else {
                                                            _one_step.type = 2;
                                                        }
                                                        _one_step.sql_list = _execd_step.program_sql_list;
                                                        _one_step.checkData = {
                                                            sql_basic_list: _sql_basic_list,
                                                            sql_result_list: [], //只需每一步的成功或失败原因就行了。这里不需要赋值
                                                            isSuccess: _execd_step.success,
                                                            fail_reason: _execd_step.fail_reason ? _step_exe_list[i].fail_reason : "",
                                                            total_count: _total_count //返回查询数据的条数
                                                        }
                                                    }
                                                    $scope.sub_tab.steps.push(_one_step);
                                                }
                                            }
                                            return $scope.sub_tab;
                                        }, function (error) {
                                            Modal.alert(error.message);
                                        })
                                    }, function (error) {
                                        Modal.alert(error.message);
                                    });
                                } else if (data.pg_source == 2) {
                                    $scope.sub_tab.batchProgramBtn = true;
                                    $scope.sub_tab.showParamList = true;
                                    $scope.sub_tab.pg_source = 2;
                                    //固化方案--批量方案处理上传文件配置
                                    $scope.sub_tab.batch_program_fileupload = {
                                        suffixs: 'xls,xlsx',
                                        filetype: "EXCEL",
                                        filename: "",
                                        uploadpath: "",
                                    }
                                    //把方案信息给当前要处理的工单
                                    $scope.sub_tab.program_seq = data.program_seq;
                                    $scope.sub_tab.program_name = data.program_name;
                                    //根据方案获取已执行的信息
                                    ProgramExec.getExecdMsg(_order_seq, data.program_seq, _deal_bk_seq).then(function (data) {
                                        if (data) {
                                            if (data.task_sql_num != 0 && data.workflow_state == 6) {
                                                $scope.sub_tab.program_result_msg = {
                                                    total_sql: data.task_sql_num,
                                                    success_num: data.success_num,
                                                    fail_num: data.fail_num,
                                                    used_time: data.used_time,
                                                    task_msg: data.task_msg ? data.task_msg : []
                                                };
                                                $scope.sub_tab.control = {
                                                    is_disable: true ,
                                                    show_result: true,
                                                    show_exec_btn: false,
                                                    is_task_author: false
                                                };
                                                $scope.sub_tab.batch_program_fileupload.filename = data.file_path.substring(data.file_path.lastIndexOf("/") + 1, data.file_path.length);
                                                $scope.sub_tab.program_file_full_path = data.file_path;
                                                $scope.sub_tab.task_id = data.pend_work_seq;
                                                $scope.sub_tab.workflow_state = data.workflow_state;
                                            } else {
                                                if (!data.workflow_state) {
                                                    $scope.sub_tab.control = {
                                                        is_disable: true , //批量查询方案
                                                        show_result: false,
                                                        show_exec_btn: true,
                                                        is_task_author: false
                                                    };
                                                } else {
                                                    $scope.sub_tab.control = {
                                                        is_disable: true ,
                                                        show_result: true,
                                                        show_exec_btn: false,
                                                        is_task_author: true
                                                    };
                                                    $scope.sub_tab.batch_program_fileupload.filename = data.file_path.substring(data.file_path.lastIndexOf("/") + 1, data.file_path.length);
                                                    $scope.sub_tab.program_file_full_path = data.file_path;
                                                    $scope.sub_tab.task_id = data.pend_work_seq;
                                                    $scope.sub_tab.workflow_state = data.workflow_state;
                                                }
                                            }
                                        }
                                    }, function (error) {
                                        Modal.alert(error.message);
                                    });
                                } else {
                                    $scope.sub_tab.showParamList = true;
                                    $scope.sub_tab.batchProgramBtn = false;
                                    $scope.sub_tab.batchSelectProgramBtn = true;
                                    //把方案信息给当前要处理的工单
                                    $scope.sub_tab.program_seq = data.program_seq;
                                    $scope.sub_tab.program_name = data.program_name;
                                    Program.getSelectProgramAllInfo(data.program_seq, _order_seq, _deal_bk_seq).then(function (data) {
                                        $scope.sub_tab.step_list = data.program_step_list ? data.program_step_list : [];
                                        if (data.file_path) {
                                            $scope.sub_tab.control = {
                                                show_result: true,
                                                show_exec_btn: false,
                                                is_disable: true ,
                                            };
                                            $scope.sub_tab.select_path = data.file_path;
                                        } else {
                                            if (!data.workflow_state) {
                                                $scope.sub_tab.control = {
                                                    show_result: false,
                                                    show_exec_btn: true,
                                                    is_task_author: false
                                                };
                                            } else {
                                                $scope.sub_tab.control = {
                                                    is_disable: true ,
                                                    show_result: true,
                                                    show_exec_btn: false,
                                                    is_task_author: true,
                                                };
                                                $scope.sub_tab.task_id = data.pend_work_seq;
                                                $scope.sub_tab.workflow_state = data.workflow_state;
                                            }
                                        };
                                        if (data.exe_msg && data.exe_msg.error_message) {
                                            $scope.sub_tab.control = {
                                                show_result: true,
                                                show_exec_btn: false,
                                                exec_loading: false,
                                                is_disable: true
                                            };
                                            $scope.sub_tab.error_message = data.exe_msg.error_message;
                                            $scope.sub_tab.control.show_error_message = true;
                                        }
                                        $scope.sub_tab.is_detail = true;
                                    });
                                }
                            }
                        }, 0)
                    }, function (error) {
                        Modal.alert(error.message);
                    });
                }
                if (_handle_type == 3) {
                    $scope.sub_tab.showParamList = false;
                    //获取历史记录
                    ScriptExec.viewHistoryList(_order_seq, _deal_bk_seq).then(function (data) {
                        $scope.sub_tab.script_info.execute_list = [];
                        $scope.sub_tab.script_info.execute_list = data.execute_info_list ? data.execute_info_list : [];
                        //将显示历史记录中第一个;
                        var _first_execute_info;
                        //给每条历史纪录添加标志位
                        for (var i = 0; i < $scope.sub_tab.script_info.execute_list.length; i++) {
                            $scope.sub_tab.script_info.execute_list[i].str_script = $scope.sub_tab.script_info.execute_list[i].script_content ? $scope.sub_tab.script_info.execute_list[i].script_content.join(" "):'';
                            $scope.sub_tab.script_info.execute_list[i].his_style_flag = false;
                        }
                        if ($scope.sub_tab.script_info.execute_list.length > 0) {
                            _first_execute_info = $scope.sub_tab.script_info.execute_list[0];
                            $scope.sub_tab.script_info.execute_list[0].his_style_flag = true;
                            $timeout(function () {
                                detailExeInfo(_first_execute_info.order_seq, _first_execute_info.deal_bk_seq, _first_execute_info.script_bk_seq);
                            }, 500)
                        }
                    }, function (error) {
                        Modal.alert(error.message);
                    });
                }
            }
        }, function (error) {
            Modal.alert(error.message);
        });
        //基础数据-获得工单流转信息
        Workorder.getWorkorderFlowList(wo_id).then(function (data) {
            $scope.sub_tab.flowData = data.order_flow_list ? data.order_flow_list : {};
            //合并处理时间并且转化流转状态
            for (var i = 0; i < $scope.sub_tab.flowData.length; i++) {
                if ($scope.sub_tab.flowData[i].deal_bk_date) {
                    $scope.sub_tab.flowData[i].deal_time = $scope.sub_tab.flowData[i].deal_bk_date + ' ' + $scope.sub_tab.flowData[i].deal_bk_time.substring(0, $scope.sub_tab.flowData[i].deal_bk_time.length - 3);
                }
                $scope.sub_tab.flowData[i].flow_type = CV.findValue($scope.sub_tab.flowData[i].flow_type, WoFlowType);
            }
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //固化方案-批量-下载上传的excel文件
    $scope.downloadProgramFile = function (sub_tab) {
        CV.downloadFile(sub_tab.program_file_full_path);
    };
    //固化方案-批量方案-查看授权任务信息
    $scope.viewProgramTaskAuthorDetail = function (sub_tab) {
        Modal.viewBatchImportAuthorDetail(sub_tab.task_id).then()
    };
    //固化方案-查看授权流程
    $scope.viewAuthProcess = function (sub_tab, index) {
        var _pg_work_seq = sub_tab.steps[index].pg_work_seq;
        Workorder.getPgWorkDetail(_pg_work_seq).then(function (_data) {
            if (_data) {
                Modal.viewWorkOrderFlow(_data).then(function (data) {
                }, function (error) {
                    Modal.alert(error.message);
                });
            }

        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //固化方案-步骤标题-两行出现...
    $scope.stepTitleStyle = function (index, _className) {
        var _span = $(_className).eq(index);
        while (_span.outerHeight() > 40) {
            _span.text(_span.text().replace(/(\s)*([a-zA-Z0-9]+|\W)(\.\.\.)?$/, "..."));
        }
    };
    //固化方案-单个--当前步骤线的样式
    $scope.lineStyle = function (step) {
        return {
            'width': "2px",
            'height': "100%",
            'position': "absolute",
            'background-color': step.type == 2 ? "#3D9ED8" : "rgb(224, 224, 224)",
            'left': "-32px",
            'top': "20px"
        };
    };
    //固化方案-单个-小圆样式----当前骤没数据时隐藏
    $scope.smallCircle = function (step) {
        return {
            'width': "16px",
            'height': "16px",
            'position': "relative",
            'top': "-18px",
            'left': "2px",
            'background-color': step.type > 0 ? "#3D9ED8" : "#ccc",
            'border-radius': "8px"
        };
    };
    //固化方案-单个-每一个步骤的外边框 --- 当前骤没数据时隐藏
    $scope.borderStyle = function (step) {
        return {
            'border': step.type > 0 ? "1px solid #ccc" : "",
            'padding': "10px 20px",
            'position': "relative"
        }
    };
    /*手工sql/数据导出*/
    //手工sql/数据导出--查看Sql详细步骤
    $scope.viewSqlStepDetailModal = function (sql_work_seq) {
        Modal.viewSqlDetailStep(sql_work_seq).then(function () {});
    };
    //手工sql/数据导出-查看授权任务信息
    $scope.viewTaskAuthorDetail = function (sub_tab, step) {
        var _task_id = step ? step.pend_work_seq : sub_tab.task_id;
        Modal.viewBatchImportAuthorDetail(_task_id).then()
    };
    //sql维护-批量导入-下载sql文件
    $scope.downloadImportFile = function (step) {
        CV.downloadFile(step.sql_info.script_file_path);
    };
    //sql维护-批量导入-下载执行失败信息文件
    $scope.downloadDetailFile = function (file_download_path) {
        if (file_download_path) {
            CV.downloadFile(file_download_path)
        }
    };
    //sql维护-批量导入-查看执行失败信息
    $scope.viewExeDetail = function (step, flag) {
        var _message = flag == 1 ? step.import_file_info.parse_message : step.exe_result_info.message;
        Modal.viewBatchSqlExecDetail(_message).then()
    };
    //sql维护--数据导出
    $scope.loadData = function (path) {
        CV.downloadFile(path);
    };
    /*脚本维护*/
    //计算历史纪录最大高度
    $scope.calculateMaxHeight = function () {
        var _left_height = parseInt($('.left-content').css('height'))-25;
        _left_height = _left_height <= 0 ? 309:_left_height;
        return {'height':_left_height+'px'}
    };
    //脚本维护-查看明细
    $scope.viewExeInfo = function (order_seq, deal_bk_seq, script_bk_seq) {
        Modal.viewScriptDetail(order_seq, deal_bk_seq, script_bk_seq).then();
    };
    //脚本维护-下载脚本文件
    $scope.downloadScriptFile = function (script_info) {
        CV.downloadFile(script_info.script_form.script_file_path);
    };
    //关闭查看
    $scope.backToWoList = function () {
        $state.go('wo_all_list');
    };
    init();
}]);