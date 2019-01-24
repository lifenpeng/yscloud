'use strict';

//方案控制器
var pCtrl = angular.module('ProgramController', []);

/**
 *新增方案
 * */
pCtrl.controller("faultProgramNewCtrl", ["$scope", "$stateParams", "$state", "$timeout", "$modal", "Program", "SparamType", "Workorder", "SparamAuthType", "SqlExec", "WoFlowType", "transactionType", "IssuFunc", "BusiSys", "Modal", "CV", function($scope, $stateParams, $state, $timeout, $modal, Program, SparamType, Workorder, SparamAuthType, SqlExec, WoFlowType, transactionType, IssuFunc, BusiSys, Modal, CV) {
    var _down_time; //鼠标按下时间
    var _delete_sql_list = []; //全局删除的sql语句（生成方案用）
    //页面控制对象
    $scope.control = {
        program_basic_save_loading : false,              //方案基本信息保存按钮Loading
        show_detail_flag           : false,              //保存基本信息后显示详情和步骤按钮标志
        add_step_by_hand_flag      : false,              //手动添加步骤按钮显示标志
        import_flag                : false,              //批量导入方案步骤标志
        batch_import_btn_flag      : false,              //批量导入按钮显示标志
        batch_select_add_btn_flag  : false,              //批量查询步骤标志
        import_program_type        : 2,                  //批量导入方案的类型 2 为update类型 3 为select类型
        program_save_btn_loading   : false,              //方案完成按钮
        program_preview_btn        : false,              //方案预览按钮
        by_handleData_btn          : $stateParams.flag   //是否是工单导出成方案
    };
    //页面信息交互对象
    $scope.info = {
        program_info : {  //方案基础信息对象
            tran_flag       : 1,   //独立事物整体事物标志，1：独立事物，2：整体事物
            program_name    : "",  //方案名称
            program_bk_desc : ""   //方案描述
        },
        import_program_info : { //批量导入步骤方案对象
            step_list :[]   //批量导入步骤列表
        },
        form:{ //表单对象
            new_fault_program_form :{}
        },
        workorderData : { //工单信息对象
            show_all_detail : false, //展开收起标志
            basicData : {}, //工单基本信息
            flowData : [] //工单流转信息
        },
        handleData : { //工单处理数据信息
            show_all_detail: false, //展开收起标志
            sql_msg_list: [], //sql执行列表
            sql_msg_detail_list:[] //sql详细列表
        }
    };
    //页面数据list对象
    $scope.data = {
        param_type_list       : SparamType,        //Sql参数类型
        busy_sys_list         : [],                //应用系统列表
        soc_list              : [] ,               //数据源列表
        transaction_type_list : transactionType,   //事务处理列表
        auth_type             : SparamAuthType,    //授权类型（指令中用）
        param_type            : SparamType,        //参数类型（指令中用）
        auth_dept_list        : [],                //授权部门（指令中使用）
    };
    //删除时将sql语句重新添加到未删除的原列表（工单生成方案）
    var addDeleteSql = function(obj){
        if(_delete_sql_list.length!=0){
          if(obj.flag == 1){
                for(var i = 0; i < _delete_sql_list.length; i++){
                    if(obj.sql_info.curr_index == _delete_sql_list[i].curr_index){
                        $scope.info.handleData.sql_msg_list.push(_delete_sql_list[i]);
                        _delete_sql_list.splice(i,1);
                        break;
                    }
                }
            }else{
                for(var i = 0; i < _delete_sql_list.length; i++){
                    var _has_deleted_sql = _delete_sql_list[i];
                    for(var j=0;j<obj.sql_info.sql_list.length;j++){
                        var _step_deleted_sql = obj.sql_info.sql_list[j];
                        if(_has_deleted_sql.curr_index == _step_deleted_sql.curr_index){
                            $scope.info.handleData.sql_msg_list.push(_step_deleted_sql);
                            _delete_sql_list.splice(i,1);
                            break;
                        }
                    }
                }
            }
        }
    };
    var init = function() {
        //获取业务系统列表
        BusiSys.getAllBusinessSys().then(function (data) {
            $scope.data.busy_sys_list = data.list_bs ? data.list_bs : [];
        },function (error) {
            Modal.alert(error.message);
        });
        //获取授权部门
        Workorder.getAppointDepartmentList().then(function(data){
            $scope.data.auth_dept_list = data.dept_list ? data.dept_list : [];
        },function(error){
            Modal.alert(error.message);
        });
        //生成方案
        if($scope.control.by_handleData_btn){
            var _order_seq = $stateParams.order_seq;
            var _deal_bk_seq = $stateParams.deal_bk_seq;
            //导入sql
            $scope.importSql = function (step ,step_index) {
                //验证数据
                var _step = $scope.info.program_info.step_list[step_index];
                if(!CV.valiForm(_step.new_step_form)) {
                    return false;
                }
                Modal.importSqlInCreateProgram($scope.info.handleData).then(function (ret) {
                    if(ret){
                        var _program_seq = $scope.info.program_info.program_seq;
                        Program.addProgramStepSql(_program_seq, step.step_seq, ret.sql_txt, ret.sys_name).then(function(data) {
                            _step.sql_list.push({
                                editable : true,
                                sql_text : ret.sql_txt,
                                sys_name : ret.sys_name,
                                soc_name : ret.soc_name,
                                curr_index :ret.curr_index,
                                sys_name_text:IssuFunc.getNameBySysName(ret.sys_name,$scope.data.busy_sys_list),
                                sql_param_list : data.sql_param_list ? data.sql_param_list: [],
                                param_list : data.sql_param_list ? data.sql_param_list: [],
                                pg_source : $scope.info.program_info.pg_source
                            });
                            step.new_sql_btn = false;
                            step.show_detail = false;
                        }, function(error) {
                            Modal.alert("请填写正确的SQL语句");
                        });
                        var _index=$scope.info.handleData.checkFlag;
                        _delete_sql_list.push($scope.info.handleData.sql_msg_list[_index]);
                        $scope.info.handleData.sql_msg_list.splice(_index,1);
                    }
                });
            };
            //获取工单基本信息
            Workorder.getWorkorder(_order_seq).then(function (data) {
                $scope.info.workorderData.basicData = data.woorderbean ? data.woorderbean : {};
            }, function (error) {
                Modal.alert(error.message);
            });
            //查询已执行SQL信息
            SqlExec.submitedSqlList(_order_seq, _deal_bk_seq).then(function (data) {
                $scope.info.handleData.sql_msg_list = data.sql_msg_list ? data.sql_msg_list : [];
                angular.forEach($scope.info.handleData.sql_msg_list,function (_data,index) {
                    _data.curr_index = index;
                    _data.sys_name_text =_data.sys_cn_name
                });
                $scope.info.handleData.sql_msg_detail_list = angular.copy($scope.info.handleData.sql_msg_list);
            }, function (error) {
                Modal.alert(error.message);
            });
            //获得工单流转信息
            Workorder.getWorkorderFlowList(_order_seq).then(function (data) {
                $scope.info.workorderData.flowData = data.order_flow_list ? data.order_flow_list : [];
                //合并处理时间并且转化流转状态
                for (var i = 0; i < $scope.info.workorderData.flowData.length; i++) {
                    var _flow = $scope.info.workorderData.flowData[i];
                    if (_flow.deal_bk_date) {
                        _flow.deal_time = _flow.deal_bk_date + ' ' + _flow.deal_bk_time.substring(0, _flow.deal_bk_time.length - 3);
                    }
                    _flow.flow_type = CV.findValue(_flow.flow_type, WoFlowType);
                }
            }, function (error) {
                Modal.alert(error.message);
            });
        };
    };
    //导入方案
    $scope.importFaultProgram = function () {
        Modal.importProgram().then(function (data) {
            if(data){
                $state.go("fault_program_list");
            }
        })
    };
    //保存方案的基本信息
    $scope.programSaveBasicInfo = function(){
        //方案loading按钮
        $scope.control.program_basic_save_loading = true;
        //验证方案表单
        if(!CV.valiForm($scope.info.form.new_fault_program_form)) {
            $scope.control.program_basic_save_loading =false;
            return false;
        }
        //保存方案基本信息表单
        Program.saveFaultProgram($scope.info.program_info.program_name, $scope.info.program_info.program_bk_desc).then(function(data) {
            if(data) {
                //方案保存中
                $scope.control.program_basic_save_loading =false;
                //基本信息锁住，显示方案步骤
                $scope.control.show_detail_flag = true;
                //方案存在初始化步骤列表为空
                $scope.info.program_info.step_list = [];
                $scope.info.program_info.program_seq = data.program_seq;
                $scope.info.program_info.work_seq = data.work_seq;
            }
        }, function(error) {
            $scope.control.program_basic_save_loading =false;
            Modal.alert(error.message);
        });
    };
    //添加方案步骤 flag 1 手动新增步骤 2 批量导入的步骤 3 批量查询的步骤
    $scope.addNewProgramStep = function(flag) {
        IssuFunc.addNewFaultProgramStep($scope.info.program_info,$scope.control,flag);
    };
    //批量导入方案步骤
    $scope.importProgramStep =function (flag) {
        $scope.info.import_program_info.step_list = [];
        Modal.importAllStep().then(function (ret) {
            //获取解析数据
            $scope.control.get_excel_data = true;
            Program.importBatchProgramStep(ret,flag).then(function (data) {
                if(data){
                    $scope.info.import_program_info.step_list = data.pg_stage_msg ? data.pg_stage_msg : [];
                    $scope.control.get_excel_data = false;
                }
            },function (error) {
                $scope.info.import_program_info.step_list = [];
                $scope.control.add_step_by_hand_flag = false;
                $scope.control.batch_import_btn_flag = false;
                $scope.control.batch_select_add_btn_flag = false;
                $scope.control.get_excel_data = false;
                Modal.alert(error.message);
            });
            //批量导入成功后不可再添加步骤和导入
            $scope.control.import_flag = true;
            $scope.control.import_program_type = flag;
        });
    };
    //保存方案步骤
    $scope.stepFormSubmit = function(step_index) {
        IssuFunc.saveFaultProgramStep($scope.info.program_info,step_index,$scope.control);
    };
    //删除方案步骤(已经保存的)
    $scope.deleteProgramStep = function(program_seq, step_index,e) {
        e.stopPropagation();
        Modal.confirm("请确定是否要删除当前步骤及步骤下的SQL?").then(function () {
            Program.deleteProgramStep(program_seq,step_index).then(function(data) {
                if(data) {
                    addDeleteSql({flag:2,sql_info:$scope.info.program_info.step_list[step_index-1]});
                    $scope.info.program_info.step_list.splice(step_index-1, 1);
                    //删除完步骤重新刷新步骤列表
                    IssuFunc.refreshFaultProgramStep(program_seq,$scope.info.program_info,$scope.control,$scope.data.busy_sys_list);
                    $scope.info.program_info.next_step = $scope.info.program_info.step_list.length+1;
                    //判断方案预览按钮显示
                    IssuFunc.showFaultProgramPreviewBtn($scope.info.program_info,$scope.control);
                }
            }, function(error) {
                Modal.alert(error.message);
            });
        });
    };
    //删除未完成方案步骤(未保存的)
    $scope.deleteUnFinStep = function (step_index,e) {
        IssuFunc.deleteUnSaveProgramStep($scope.info.program_info,step_index,$scope.control,e)
    };
    //添加SQL按钮
    $scope.addSqlForm = function (step,step_index) {
        IssuFunc.addStepSqlForm($scope.info.program_info,step_index,$scope.data.busy_sys_list,step);
    };
    //提交sql参数
    $scope.sqlParamFormSubmit = function (step_index, sql_index,sql) {
        IssuFunc.saveFaultProgramStepSqlParam($scope.info.program_info,step_index,sql_index,sql,$scope.control);
    };
    //获取授权角色（指令里用的方法）
    $scope.getSqlParamAuthRoleByDept = function(dept_id, index, parent_index, sql_param_list){
        Program.getSqlParamAuthRoleByDept(dept_id).then(function(data){
            sql_param_list.authRole = data.dept_role_list ? data.dept_role_list : [];
        },function(error){
            Modal.alert(error.message);
        });
    };
    //查看sql详细
    $scope.viewSqlDetailInfo = function (program_seq, step_seq ,sql_seq,sql_index) {
        Modal.viewSqlDetail(program_seq, step_seq ,sql_seq,sql_index);
    };
    //修改sql参数按钮
    $scope.editSqlParam = function (step_index, sql_index,sql) {
        sql.sql_param_btn = false;
        sql.editable = true;
    };
    //删除SQL
    $scope.deleteSql = function(step_index, sql_index) {
        addDeleteSql({flag:1,sql_info:$scope.info.program_info.step_list[step_index].sql_list[sql_index]});
        IssuFunc.deleteSqlInProgramStep($scope.info.program_info,step_index,sql_index,$scope.control);
    };
    //方案预览
    $scope.programPreview = function (program_seq) {
        Modal.previewProgram(program_seq);
    };
    //保存方案按钮
    $scope.submitProgram = function (program_seq) {
        var _validate_num = IssuFunc.validFaultProgramAllSqlSubmit($scope.info.program_info);
        if($scope.control.import_flag){
            //验证方案表单
            if(!CV.valiForm($scope.info.form.new_fault_program_form)) {
                return false;
            }
            $scope.control.btn_program_save_loading = true;
            Program.saveImportProgram(program_seq,$scope.info.program_info.program_name,$scope.info.program_info.program_bk_desc,$scope.info.import_program_info.step_list,$scope.info.program_info.tran_flag,$scope.control.import_program_type).then(function (data) {
                $scope.control.btn_program_save_loading = false;
                Modal.alert("新建批量方案保存成功");
                $state.go("fault_program_list");
            },function (error) {
                $scope.control.btn_program_save_loading = false;
                Modal.alert(error.message);
            });
        }else{
            if($scope.info.program_info.step_list.length==0){
                Modal.alert("请至少添加一个步骤");
                return false;
            }
            if(_validate_num ==2){
                Modal.alert("存在未提交的sql");
                return false;
            } else if(_validate_num ==1){
                Modal.alert("步骤中至少添加一条sql");
                return false;
            }
            $scope.control.btn_program_save_loading = true;
            Program.saveProgram(program_seq).then(function (data) {
                Modal.alert("新建方案保存成功");
                $scope.control.btn_program_save_loading = false;
                $state.go("fault_program_list");
            },function (error) {
                $scope.control.btn_program_save_loading =false;
                Modal.alert(error.message);
            });
        }
    };
    //获取鼠标按下时间
    $scope.getDownTime=function(){
        _down_time=new Date().getTime()
    };
    //收起展开
    $scope.toggleDetail = function (step) {
        var _up_time = new Date().getTime();
        if(_up_time - _down_time > 300){
            return;
        }
        step.show_detail = !step.show_detail;
    };
    //ui-sortable配置回调
    $scope.sortableOptions = {
        start : function (e,ui) {
            if(!ui.item.sortable.model.show_detail){
                ui.item.sortable.cancel();
            }
        },
        update: function (e,ui) {
            //拖动重新刷新列表
            Program.slideProgramStep($scope.info.program_info.program_seq,ui.item.sortable.index+1,ui.item.sortable.dropindex+1).then(function () {
                IssuFunc.refreshFaultProgramStep($scope.info.program_info.program_seq,$scope.info.program_info,$scope.control,$scope.data.busy_sys_list);
            },function (error) {
                Modal.alert(error.message);
            });
        }
    };
    //取消按钮
    $scope.cancel =function () {
        $state.go("fault_program_list");
    };
    //阻止展开收起(阻止冒泡事件)
    $scope.stopPrevent =function (event) {
        event.stopPropagation();
    };
    init();
}]);
 /**
  * 修改方案
  **/
pCtrl.controller("faultProgramModifyCtrl", ["$scope", "$state", "$stateParams", "$timeout", "$modal", "Program", "SparamType", "Workorder", "transactionType", "SparamAuthType","IssuFunc", "BusiSys", "Modal", "CV", function($scope,$state, $stateParams, $timeout, $modal, Program, SparamType, Workorder, transactionType, SparamAuthType,IssuFunc, BusiSys, Modal, CV) {
    var _program_seq = $stateParams.program_id; //方案编号
    var _down_time; //鼠标按下时间
    //页面交互对象
    $scope.info = {
        program_info : {  //方案基础信息对象
            tran_flag       : 1,   //独立事物整体事物标志，1：独立事物，2：整体事物
            program_name    : "",  //方案名称
            program_bk_desc : ""   //方案描述
        },
        import_program_info : { //批量导入步骤方案对象
            step_list :[]   //批量导入步骤列表
        },
        form:{ //表单对象
            modify_fault_program_form :{}
        }
    };
    //页面控制
    $scope.control = {
        program_info_loading          : false, //方案加载loading
        program_is_ok                 : true,  //方案默认状态下是可用的
        add_step_by_hand_flag         : false, //添加按钮显示标志
        batch_import_btn_flag         : false, //批量导入按钮
        batch_select_add_btn_flag     : false, //批量查询步骤标志
        program_edit_save_btn_loading : false, //修改保存方案按钮
        program_preview_btn           : false, //方案预览按钮
    };
    //data对象
    $scope.data = {
        busy_sys_list         : [],                //应用系统列表
        transaction_type_list : transactionType ,  //事务处理列表
        auth_type             : SparamAuthType,    //授权类型（指令中用）
        param_type            : SparamType,        //参数类型（指令中用）
        auth_dept_list        : [],                //授权部门（指令中使用）
    };
    var init = function() {
        $scope.control.program_info_loading = true;
        //获取业务系统列表
        BusiSys.getAllBusinessSys().then(function (data) {
            $scope.data.busy_sys_list = data.list_bs ? data.list_bs : [];
        },function (error) {
            $scope.control.program_info_loading = false;
            Modal.alert(error.message);
            $state.go('fault_program_list');
        }).then(function () {
            //获取方案信息
            IssuFunc.refreshFaultProgramStep(_program_seq,$scope.info.program_info,$scope.control,$scope.data.busy_sys_list);
        });
        //获得授权部门
        Workorder.getAppointDepartmentList().then(function(data){
            $scope.data.auth_dept_list = data.dept_list ? data.dept_list : [];
        },function(error){
            Modal.alert(error.message);
        });
    };
    //批量导入方案步骤
    $scope.importProgramStep =function (flag) {
        $scope.info.import_program_info.step_list = [];
        Modal.importAllStep().then(function (ret) {
            //获取解析数据
            $scope.control.get_excel_data = true;
            Program.importBatchProgramStep(ret,flag).then(function (data) {
                if(data){
                    $scope.info.import_program_info.step_list = data.pg_stage_msg ? data.pg_stage_msg : [];
                    $scope.control.get_excel_data = false;
                }
            },function (error) {
                $scope.info.import_program_info.step_list = [];
                $scope.control.add_step_by_hand_flag = false;
                $scope.control.batch_import_btn_flag = false;
                $scope.control.batch_select_add_btn_flag = false;
                $scope.control.get_excel_data = false;
                Modal.alert(error.message);
            })
            //批量导入成功后不可再添加步骤和导入
            $scope.control.import_flag = true;
            $scope.control.import_program_type = flag;
        });
    };
    //方案预览
    $scope.programPreview = function (program_seq) {
        Modal.previewProgram(program_seq);
    };
    //添加方案步骤（手动添加步骤）
    $scope.addNewProgramStep = function(flag) {
        IssuFunc.addNewFaultProgramStep($scope.info.program_info,$scope.control,flag);
    };
    //保存方案步骤(步骤名)
    $scope.stepFormSubmit = function(step_index) {
        IssuFunc.saveFaultProgramStep($scope.info.program_info,step_index,$scope.control);
    };
    //删除未完成方案步骤
    $scope.deleteUnFinStep = function (step_index,e) {
        IssuFunc.deleteUnSaveProgramStep($scope.info.program_info,step_index,$scope.control,e)
    };
    //删除方案步骤
    $scope.deleteStep = function(_program_seq, step_index,e) {
        e.stopPropagation();
        Modal.confirm("请确定是否要删除当前步骤及步骤下的SQL?").then(function () {
            Program.deleteProgramStep(_program_seq,step_index).then(function(data) {
                if(data) {
                    $scope.info.program_info.step_list.splice(step_index-1, 1);
                    // refreshProgramStep(_program_seq);
                    IssuFunc.refreshFaultProgramStep(_program_seq,$scope.info.program_info,$scope.control,$scope.data.busy_sys_list);
                    $scope.info.program_info.next_step =$scope.info.program_info.step_list.length+1;
                }
                //与后端交互方案不可用
                $scope.control.program_is_ok = false;
            }, function(error) {
                Modal.alert(error.message);
            });
        })
    };
    //添加SQL按钮
    $scope.initSqlForm = function (step,step_index) {
        IssuFunc.addStepSqlForm($scope.info.program_info,step_index,$scope.data.busy_sys_list,step);
    };
    //保存sql参数
    $scope.sqlParamFormSubmit = function (step_index, sql_index,sql) {
        IssuFunc.saveFaultProgramStepSqlParam($scope.info.program_info,step_index,sql_index,sql,$scope.control);
    };
    //查看sql详细
    $scope.viewSqlDetailInfo = function (_program_seq, step_seq ,sql_seq, sql_index) {
        Modal.viewSqlDetail(_program_seq, step_seq ,sql_seq ,sql_index);
    };
    //修改sql参数按钮
    $scope.editSqlParam = function (step_index, sql_index,sql) {
        sql.sql_param_btn = false;
        sql.editable = true;
    };
    //删除SQL
    $scope.deleteSql = function(step_index, sql_index) {
        IssuFunc.deleteSqlInProgramStep($scope.info.program_info,step_index,sql_index,$scope.control);
    };
    //获得授权角色
    $scope.getSqlParamAuthRoleByDept = function(dept_id, index, parent_index, sql_param_list){
        Program.getSqlParamAuthRoleByDept(dept_id).then(function(data){
            sql_param_list.authRole = data.dept_role_list ? data.dept_role_list : [];
        },function(error){
            Modal.alert(error.message);
        });
    };
    //获取鼠标按下当前时间
    $scope.getDownTime = function(){
        _down_time=new Date().getTime()
    };
    //收起展开
    $scope.toggleDetail = function (step) {
        var _up_time = new Date().getTime();
        if(_up_time-_down_time > 300){
            return;
        }
        step.show_detail = !step.show_detail;
    };
    //ui-sortable配置回调
    $scope.sortableOptions = {
        start : function (e,ui) {
            if(!ui.item.sortable.model.step_bk_title || !ui.item.sortable.model.show_detail){
                ui.item.sortable.cancel();
            }
        },
        update: function (e,ui) {
            Program.slideProgramStep(_program_seq,ui.item.sortable.index+1,ui.item.sortable.dropindex+1).then(function () {
                IssuFunc.refreshFaultProgramStep(_program_seq,$scope.info.program_info,$scope.control,$scope.data.busy_sys_list);
                //与后端交互方案不可用
                $scope.control.program_is_ok = false;
            },function (error) {
                Modal.alert(error.message);
            });
        }
    };
    //保存方案按钮
    $scope.submitProgram = function (_program_seq) {
        var _validate_num = IssuFunc.validFaultProgramAllSqlSubmit($scope.info.program_info);
        $scope.control.program_edit_save_btn_loading = true;
        if(!CV.valiForm($scope.info.form.modify_fault_program_form)) {
            $scope.control.program_edit_save_btn_loading =false;
            return false;
        }
        if($scope.control.import_flag){
            Program.saveImportProgram(_program_seq,$scope.info.program_info.program_name,$scope.info.program_info.program_bk_desc,$scope.info.import_program_info.step_list,$scope.info.program_info.tran_flag,$scope.control.import_program_type).then(function (data) {
                Modal.alert("批量方案保存成功");
                $state.go('fault_program_list');
            },function (error) {
                $scope.control.program_edit_save_btn_loading =false;
                Modal.alert(error.message);
            });
        }else{
            if(_validate_num ==2){
                Modal.alert("存在未提交的sql");
                $scope.control.program_edit_save_btn_loading = false;
                return false;
            } else if(_validate_num ==1){
                Modal.alert("步骤中至少添加一条sql");
                $scope.control.program_edit_save_btn_loading = false;
                return false;
            }
            Program.editProgram(_program_seq,$scope.info.program_info.program_name, $scope.info.program_info.program_bk_desc).then(function(data) {
                if(data) {
                    angular.extend($scope.info.program_info, data);
                    if($scope.info.program_info.step_list && $scope.info.program_info.step_list.length!=0){
                        Program.saveProgram(_program_seq).then(function (data) {
                            Modal.alert("修改方案成功");
                            $state.go('fault_program_list');
                        },function (error) {
                            $scope.control.btn_program_edit_loading =false;
                            Modal.alert(error.message);
                        });
                    }
                }
            }, function(error) {
                $scope.control.program_edit_save_btn_loading =false;
                Modal.alert(error.message);
            });
        }
    };
    //取消按钮
    $scope.cancel =function () {
        $state.go('fault_program_list');
    };
    //监控方案是否可用
    $scope.$watch("control.program_is_ok",function () {
        if(!$scope.program_is_ok){
            Program.checkProgram(_program_seq).then(function (data) {
                $scope.control.program_is_ok = true;
            },function (error) {
                Modal.alert(error.message);
            })
        }
    });
    //阻止展开收起
    $scope.stopPrevent =function (event) {
        event.stopPropagation();
    };
    init();
}]);
/**
 *查看方案
 * */
pCtrl.controller("faultProgramDetailCtrl", ["$scope", "$stateParams", "$state", "$timeout", "$modal", "Program", "SparamType", "Workorder","IssuFunc", "SparamAuthType","BusiSys","transactionType", "Modal", "CV", function($scope, $stateParams,$state, $timeout, $modal, Program, SparamType, Workorder,IssuFunc, SparamAuthType, BusiSys,transactionType, Modal, CV) {
    var _program_seq = $stateParams.program_id;         //获取方案编号
    var _program_source = $stateParams.program_source;  //获取方案新增类型
    //页面信息对象
    $scope.info = {
        program_info        : {}, //方案信息对象
        import_program_info : {}  //批量方案信息对象
    };
    //页面控制对象
    $scope.control = {
        program_info_loading : false , //方案信息加载Loading
        input_disabled : true,         //输入框为不可用标志
    };
    //页面数据列表对象
    $scope.data = {
        database_list         : [],               //数据库列表
        param_type_list       : SparamType,       //Sql参数类型
        transaction_type_list : transactionType,   //事务处理列表
        auth_type             : SparamAuthType,    //授权类型（指令中用）
        param_type            : SparamType,        //参数类型（指令中用）
        auth_dept_list        : []                 //授权部门列表（指令中用）
    };
    var init = function() {
        $scope.info.program_info.pg_source = _program_source;
        $scope.control.program_info_loading = true;
        if(_program_source == 1 || _program_source == 3){
            //获取业务系统列表
            BusiSys.getAllBusinessSys().then(function (data) {
                $scope.data.busy_sys_list = data.list_bs ? data.list_bs : [];
            },function (error) {
                Modal.alert(error.message);
                //服务出错，返回方案列表
                $state.go('fault_program_list')
            }).then(function () {
                Program.getProgramAllInfoAndStepList(_program_seq).then(function(data){
                    $timeout(function () {
                        if(data){
                            $scope.info.program_info.program_bk_desc = data.program_bk_desc;
                            $scope.info.program_info.program_seq  = _program_seq;
                            $scope.info.program_info.program_name = data.program_name;
                            $scope.info.program_info.pg_yn_flag   = data.pg_yn_flag;
                            $scope.info.program_info.step_list = data.program_step_list ? data.program_step_list :[];
                            for(var i = 0;i < $scope.info.program_info.step_list.length; i++){
                                var _curr_step_list = $scope.info.program_info.step_list[i];
                                _curr_step_list.program_sql_list = _curr_step_list.program_sql_list || [];
                                _curr_step_list.sql_list = _curr_step_list.program_sql_list;
                                for(var j = 0; j < _curr_step_list.sql_list.length; j++){
                                    var _curr_sql_list = _curr_step_list.sql_list[j]
                                    _curr_sql_list.editable = false;
                                    _curr_sql_list.pg_source = data.pg_source ? data.pg_source : 1;
                                    _curr_sql_list.sys_name_text = IssuFunc.getNameBySysName(_curr_sql_list.sys_name,$scope.data.busy_sys_list);
                                    _curr_sql_list.sql_param_list = _curr_sql_list.sql_param_list ? _curr_sql_list.sql_param_list :[];
                                    _curr_sql_list.param_list = _curr_sql_list.sql_param_list;
                                    for(var k = 0;k < _curr_sql_list.param_list.length; k++){
                                        var _sql_param = _curr_sql_list.param_list[k];
                                        _sql_param.param_auth_list = _sql_param.param_auth_list ? _sql_param.param_auth_list : [];
                                        for(var l = 0; l < _sql_param.param_auth_list.length; l++){
                                            _sql_param.param_auth_list[l].sparam_auth_list = SparamAuthType;
                                        }
                                    }
                                }
                            };
                            $scope.control.program_info_loading = false;
                        }
                    },0);
                },function (error) {
                    Modal.alert(error.message);
                    //服务出错，返回方案列表
                    $state.go('fault_program_list');

                });
            });
            //获得授权部门
            Workorder.getAppointDepartmentList().then(function(data){
                $scope.data.auth_dept_list = data.dept_list ? data.dept_list : [];
            },function(error){
                Modal.alert(error.message);
            });
        }else{
            Program.viewImportProgram(_program_seq).then(function (data) {
                $timeout(function () {
                   if(data){
                       $scope.info.program_info.program_bk_desc = data.program_bk_desc;
                       $scope.info.program_info.program_name = data.program_name;
                       $scope.info.program_info.program_seq  = _program_seq;
                       $scope.info.program_info.pg_yn_flag   = data.pg_yn_flag;
                       $scope.info.program_info.tran_flag   = data.tran_flag;
                       $scope.info.import_program_info.step_list = data.pg_stage_msg ? data.pg_stage_msg : [];
                       $scope.control.program_info_loading = false;
                   }
                },0);
            },function (error) {
                Modal.alert(error.message);
                //服务出错，返回方案列表
                $state.go('fault_program_list');
            });
        }
    };
    //方案预览
    $scope.programPreview = function (program_seq) {
        Modal.previewProgram(program_seq);
    };
    //方案导出
    $scope.exportProgram = function (program_seq) {
        Program.exportUsableProgram(program_seq).then(function (data) {
            CV.downloadFile(data.file_full_path);
        },function (error) {
            Modal.alert(error.message);
        })
    };
    //查看sql详细
    $scope.sqlDetail = function (_program_seq, step_seq ,sql_seq,sql_index) {
        Modal.viewSqlDetail(_program_seq, step_seq ,sql_seq,sql_index);
    };
    //获得授权角色
    $scope.getSqlParamAuthRoleByDept = function(dept_id, index, parent_index, sql_param_list){
        Program.getSqlParamAuthRoleByDept(dept_id).then(function(data){
            sql_param_list.authRole = data.dept_role_list ? data.dept_role_list : [];
        },function(error){
            Modal.alert(error.message);
        });
    };
    //返回方案列表
    $scope.back =function () {
        $state.go('fault_program_list');
    };
    init();
}]);