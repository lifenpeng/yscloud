'use strict';

var comSrv = angular.module('FuncService', []);

/**
 * 发布管理静态服务
 */
comSrv.service("ProdFunc", ["$timeout","$sce","ProdNodeState", "ProdCmdState", "IssueType", "Modal", "CV", function($timeout,$sce,ProdNodeState, ProdCmdState, IssueType, Modal, CV) {
    var that = this;
    //发布执行--节点状态转中文显示
    this.formatNodeStatus = function(list){
        for(var i=0;i<list.length;i++) {
            list[i].node_status_cn = CV.findValue(list[i].node_status,ProdNodeState);
        }
    };
    //发布执行--命令状态转中文显示
    this.formatCmdStatus = function(msg_list){
        for(var i=0;i< msg_list.length;i++) {
            msg_list[i].node_list = msg_list[i].node_list ? msg_list[i].node_list :[];
            for(var j=0;j<msg_list[i].node_list.length;j++){
                msg_list[i].node_list[j].cmd_status_cn = CV.findValue(msg_list[i].node_list[j].node_status,ProdCmdState);
                msg_list[i].node_list[j].exec_msg_detail = msg_list[i].node_list[j].exe_msg ? $sce.trustAsHtml(msg_list[i].node_list[j].exe_msg.replace(/\n/g,"<br>")) : '';
                // msg_list[i].node_list[j].exe_msg_list =  msg_list[i].node_list[j].exe_msg ? msg_list[i].node_list[j].exe_msg.split('\n') : [];
            }
        }
        return msg_list;
    };
    //发布执行--获得可重置的阶段
    this.pushAllCanResetPhase = function(steps,reset_phase) {
        for(var i = 0; i < steps.length; i++) {
            var _temp_step = steps[i];
            for(var j=0;j<_temp_step.phase_list.length;j++){
                if (_temp_step.phase_list[j].phase_status > 1) {
                    that.pushResetPhase(_temp_step.phase_list[j].phase_no,reset_phase,steps);
                }
            }

        }
    };
    //发布执行--追加可重置的阶段
    this.pushResetPhase = function(phase_id,reset_phase,steps) {
        var _is_exist_phase = false;
        for(var i = 0; i < reset_phase.length; i ++) {
            if(phase_id == reset_phase[i].phase_no) {
                _is_exist_phase = true;
                break;
            }
        }
        if(!_is_exist_phase) {
            for(var j = 0; j < steps.length; j++) {
                var _temp_step = steps[j];
                for(var k=0;k<_temp_step.phase_list.length;k++){
                    if(phase_id == _temp_step.phase_list[k].phase_no) {
                        reset_phase.push(_temp_step.phase_list[k]);
                    }
                }

            }
        }
    };
    //发布执行--评价信息问题类型转中文显示
    this.formatProblemType = function(problem_type_list) {
        var _problem_type_list_cn = "";
        for (var i = 0; i < problem_type_list.length; i++) {
            _problem_type_list_cn += CV.findValue(problem_type_list[i], IssueType) + " ";
        }
        return _problem_type_list_cn;
    };
    //发布执行--绑定当前阶段描述
    this.bindCurrPhaseAndStep = function(phase_id,steps,curr_info) {
        for(var i = 0; i < steps.length; i++) {
            var _temp_step = steps[i];
            for(var j=0;j<_temp_step.phase_list.length;j++){
                //绑定当前阶段描述
                if(phase_id == _temp_step.phase_list[j].phase_no) {
                    curr_info._phaseDesc = _temp_step.phase_list[j].phase_bk_desc;
                }
            }

        }
    };
    //得到页面的耗时
    this.getTimeUsed=function(list,param){
        var _total_time=0;
        angular.forEach(list,function(one){
            _total_time=_total_time+one[param];
        });
        return Math.round(_total_time);
    };
    //处理阶段对应节点信息
    this.dealPhaseNode = function(phase_list,node_list){
        for(var m=0; m < phase_list.length; m++){
            var _node = phase_list[m];
            for(var n=0;n< node_list.length;n++){
                var _exec_node = node_list[n];
                if(_node.exec_node_ip == _exec_node.exec_ip){
                    _exec_node.is_show = true;
                    _exec_node.exec_node_ip =_node.exec_node_ip;
                    _exec_node.exec_protocol_type = _node.exec_protocol_type;
                    _exec_node.exec_soc_name = _node.exec_soc_name;
                    _exec_node.executeNodeMsgBean = _node.executeNodeMsgBean;
                    _exec_node.impl_type = _node.impl_type;
                    _exec_node.is_exec = _node.is_exec;
                    _exec_node.node_status = _node.node_status;
                    _exec_node.node_exec_seq = _node.node_exec_seq;
                    _exec_node.reset_flag = _node.reset_flag;
                    _exec_node.support_node_ip = _node.support_node_ip ? _node.support_node_ip : '';
                    _exec_node.support_protocol_type = _node.support_protocol_type ? _node.support_protocol_type : '';
                    _exec_node.support_soc_name = _node.support_soc_name ? _node.support_soc_name : '';
                    _exec_node.file_list = _node.file_list ? _node.file_list :[];
                }
            }
        }
    };
    //倒计时时间和服务器时间计算
    this.getTime = function(data){
        var _now_date = new Date(data);
        var data = {};
        data._year = _now_date.getFullYear();
        data._month = _now_date.getMonth()+1 < 10 ? '0' + (_now_date.getMonth()+1) : _now_date.getMonth()+1;
        data._date = _now_date.getDate() < 10 ? '0' +_now_date.getDate() : _now_date.getDate();
        data._hours = _now_date.getHours() < 10 ? '0' +_now_date.getHours() : _now_date.getHours();
        data._minutes = _now_date.getMinutes() < 10 ? '0' +_now_date.getMinutes() : _now_date.getMinutes();
        data._seconds = _now_date.getSeconds() < 10 ? '0' +_now_date.getSeconds() : _now_date.getSeconds();
        return data;
    };
    //处理自定义配置文件获取到的物理节点数据源
    this.dealSocList = function(soc_list){
        for(var i = 0 ; i < soc_list.length; i++){
            var _soc_info = soc_list[i];
            _soc_info.lable = _soc_info.file_soc_username+"@"+_soc_info.ip;
            _soc_info.index = i;
        }
    };
    //处理固化配置阶段的数据
    this.processConfigData = function (phase_list) {
        for(var i=0;i<phase_list.length;i++){
            var _phase = phase_list[i];
            if(_phase.phy_nodes && _phase.logical_node){
                for(var j=0;j<_phase.phy_nodes.length;j++){
                    var _phy_node = _phase.phy_nodes[j];
                    _phy_node.files_list = [];
                    if(_phase.logical_node.file_list){
                        for(var k=0;k<_phase.logical_node.file_list.length;k++){
                            _phy_node.files_list.push({file:_phase.logical_node.file_list[k],is_modify: false})
                        }
                    }
                }
            }
        }
        return phase_list;
    };
}]);

/**
 * 故障管理静态服务
 */
comSrv.service("IssuFunc", ["$timeout","Program","SparamAuthType","Workorder","BusiSys","SqlExec", "BucketType","ScrollBarConfig", "Modal","CV", function($timeout,Program,SparamAuthType,Workorder,BusiSys, SqlExec, BucketType,ScrollBarConfig, Modal ,CV) {
    var _that = this;
    //方案--获取应用系统中文名
    this.getNameBySysName = function (sys_name,busy_sys_list) {
        var _busy_sys_name_text = '';
        for(var i = 0; i < busy_sys_list.length; i ++) {
            var _sys = busy_sys_list[i];
            if(_sys.business_sys_name == sys_name) {
                _busy_sys_name_text = _sys.business_cn_name;
                break;
            }
        }
        return _busy_sys_name_text;
    };
    //故障方案新增步骤方法
    this.addNewFaultProgramStep = function (program_info,control,flag) {
        //步骤列表至少有一个的情况下触发上一步骤信息完整性验证
        if(program_info.step_list.length != 0){
            for(var i = 0; i < program_info.step_list.length; i++){
                var _step = program_info.step_list[i];
                if(!_step.step_bk_title || !_step.sql_list || _step.sql_list.length == 0){
                    Modal.alert("步骤信息不完整，无法添加步骤。");
                    return ;
                }
                for(var j = 0; j < _step.sql_list.length; j++){
                    if(_step.sql_list[j].editable){
                        Modal.alert("存在未提交的SQL，无法添加步骤。");
                        return ;
                    }
                }
            }
        }
        //存在方案编号下添加每一步骤信息
        if(program_info.program_seq){
            //添加步骤是push每一步信息
            program_info.step_list.push({
                step_seq :  program_info.step_list.length+1, //方案步骤号
                step_bk_title: '', //方案步骤名
                pg_source:flag, //方案的新增类别 1 手动新增步骤 2 批量导入的步骤 3 批量查询的步骤
                sql_list: [],  //方案步骤SQL列表
                step_exist : false, //方案是否存在
            });
            program_info.pg_source = flag; //方案新增来源
            //添加完一条步骤时根据新增类型隐藏相应的其他按钮
            //隐藏手动添加步骤按钮
            control.add_step_by_hand_flag  = ( flag == 1 ) ? false : true;
            //隐藏批量查询步骤按钮
            control.batch_select_add_btn_flag = ( flag == 3 ) ? false:true;
        }
        control.batch_import_btn_flag  = true;
    };
    //故障方案保存方案步骤内容
    this.saveFaultProgramStep = function (program_info,step_index,control) {
        //验证数据
        var _step = program_info.step_list[step_index];
        if(!CV.valiForm(_step.new_step_form)) {
            return false;
        }
        _step.step_valid = true;//每一步骤验证标志
        Program.addProgramStep(program_info.program_seq, _step.step_seq, _step.step_bk_title, _step.pg_source).then(function(data) {
            if(data) {
                if(_step.sql_list.length == 0){
                    _step.sql_list = []; //初始化每一步骤的列表
                    _step.step_exist = true; //步骤存在标志
                    _step.sql_form_show = false; //sql表单显示标志
                    _step.new_sql_btn = true; //新增sql按钮
                    _step.step_save_btn=false;//步骤保存标志
                }
                _step.old_step_bk_title = _step.step_bk_title;//临时定义了旧标题
                control.program_is_ok = false;
            }
        }, function(error) {
            Modal.alert(error.message);
        });
        program_info.next_step = program_info.step_list.length+1;//下一步骤号
    };
    //故障方案--刷新方案步骤列表
    this.refreshFaultProgramStep = function (program_seq,program_info,control,busy_sys_list) {
        //删除完步骤重新刷新步骤列表
        Program.getProgramAllInfoAndStepList(program_seq).then(function(data){
            $timeout(function () {
                if(data){
                    program_info.program_bk_desc = data.program_bk_desc;
                    program_info.program_seq  = program_seq;
                    program_info.program_name = data.program_name;
                    program_info.tran_flag = 1;
                    program_info.pg_source = data.pg_source;
                    program_info.step_list = data.program_step_list ? data.program_step_list :[];
                    program_info.next_step = program_info.step_list.length+1;
                    for(var i = 0; i < program_info.step_list.length; i++){
                        var _curr_step_list =  program_info.step_list[i];
                        _curr_step_list.pg_source = program_info.pg_source;
                        _curr_step_list.show_detail = false;
                        _curr_step_list.step_exist = true;
                        _curr_step_list.step_btn_save = true;
                        _curr_step_list.new_sql_btn= true;
                        _curr_step_list.old_step_bk_title = _curr_step_list.step_bk_title;
                        _curr_step_list.program_sql_list = _curr_step_list.program_sql_list || [];
                        _curr_step_list.sql_list = _curr_step_list.program_sql_list;
                        for(var j = 0; j < _curr_step_list.sql_list.length; j++){
                            var _curr_sql_list = _curr_step_list.sql_list[j];
                            _curr_sql_list.sql_param_btn = true;
                            _curr_sql_list.editable = false;
                            _curr_sql_list.sql_seq = parseInt(_curr_sql_list.sql_seq);
                            _curr_sql_list.pg_source =data.pg_source ? data.pg_source : 1 ;
                            _curr_sql_list.sys_name_text = _that.getNameBySysName(_curr_sql_list.sys_name,busy_sys_list);
                            _curr_sql_list.sql_param_list = _curr_sql_list.sql_param_list ? _curr_sql_list.sql_param_list :[];
                            _curr_sql_list.param_list = _curr_sql_list.sql_param_list;
                            for(var k = 0;k < _curr_sql_list.param_list.length; k++){
                                var _sql_param = _curr_sql_list.param_list[k];
                                _sql_param.param_auth_list = _sql_param.param_auth_list ? _sql_param.param_auth_list : [];
                                for(var l = 0;l < _sql_param.param_auth_list.length; l++){
                                    _sql_param.param_auth_list[l].sparam_auth_list = SparamAuthType;
                                }
                            }
                        }
                    }
                    if(program_info.pg_source == 1){
                        control.add_step_by_hand_flag = false;
                        control.batch_import_btn_flag = true;
                        control.batch_select_add_btn_flag = true;
                    }else if(program_info.pg_source == 3){
                        control.batch_select_add_btn_flag = false;
                        control.add_step_by_hand_flag = true;
                        control.batch_import_btn_flag = true;
                    }else{
                        control.add_step_by_hand_flag = false;
                        control.batch_import_btn_flag = false;
                        control.batch_select_add_btn_flag = false;
                    }
                    control.program_info_loading = false;
                }
            },0);
        },function (error) {
            Modal.alert(error.message);
        });
    };
    //故障方案--判断预览方案显示按钮
    this.showFaultProgramPreviewBtn = function (program_info,control) {
        if(program_info.step_list.length != 0){
            var _first_step = program_info.step_list[0];
            if(_first_step.sql_list){
                control.program_preview_btn = true;
            }
        }else {
            control.program_preview_btn = false;
        }
    };
    //故障方案--删除未完成的方案步骤
    this.deleteUnSaveProgramStep = function (program_info,step_index,control,e) {
        e.stopPropagation();
        program_info.step_list.splice(step_index-1, 1);
        //删除未保存的步骤时
        if(!program_info.step_list || program_info.step_list.length == 0){
            control.add_step_by_hand_flag = false;
            control.batch_import_btn_flag = false;
            control.batch_select_add_btn_flag = false;
        }else{
            control.add_step_by_hand_flag = program_info.pg_source == 1 ? false : true;
            control.batch_select_add_btn_flag = program_info.pg_source == 3 ? false : true;
        }
    };
    //故障方案--添加sql按钮
    this.addStepSqlForm = function (program_info,step_index,busy_sys_list,step) {
        //验证数据
        var _step = program_info.step_list[step_index];
        if(!CV.valiForm(_step.new_step_form)) {
            return false;
        }
        //新增sql语句
        Modal.addSQL(program_info.program_seq,busy_sys_list,'',2).then(function (ret) {
            if(ret){
                //每一步骤里添加sql语句
                _step.sql_list.push({
                    editable : true, //可编辑属性
                    sql_text : ret.sql_txt,//sql内容
                    sys_name : ret.sys_name,//系统名
                    soc_name : ret.soc_name,//数据源名
                    sys_name_text:_that.getNameBySysName(ret.sys_name,busy_sys_list),//系统中文名
                    sql_param_list : ret.sql_param_list,//sql 参数列表
                    param_list : ret.sql_param_list,
                    pg_source : program_info.pg_source //来源类型
                });
                step.sql_form_show = false; //sql添加完成收起sql表单
                step.new_sql_btn = false;
                step.show_detail = false;
            }
        });
    };
    //故障方案--方案步骤sql参数提交
    this.saveFaultProgramStepSqlParam = function (program_info,step_index,sql_index,sql,control) {
        var _validate_table_ok = true;
        var _step= program_info.step_list[step_index];
        var _sql = _step.sql_list[sql_index];
        //参数表单验证
        for(var i = 0, len = _sql.param_list.length; i < len;i++){
            var _param = _sql.param_list[i];
            if(!_param.sparam_cn_name){
                Modal.alert("请填写"+_param.sparam_name +"参数中文名");
                _sql.btn_program_step_sql_param_loading = false;
                _validate_table_ok = false;
                break;
            }
            if(!_param.sparam_type){
                Modal.alert("请选择"+_param.sparam_name +"参数类型");
                _sql.btn_program_step_sql_param_loading = false;
                _validate_table_ok = false;
                break;
            }
            if(_param.sparam_type!==1){
                if(!_param.sparam_scope) {
                    Modal.alert("请配置"+_param.sparam_name +"参数");
                    _sql.btn_program_step_sql_param_loading = false;
                    _validate_table_ok = false;
                    break;
                }
            }
        }
        //提交参数表单
        if(_validate_table_ok) {
            _sql.btn_program_step_sql_param_loading = true;
            Program.addProgramStepSqlParam(program_info.program_seq, _step.step_seq, _sql.sql_seq, _sql).then(function (data) {
                _sql.btn_program_step_sql_param_loading = false;
                if(data){
                    _step.new_sql_btn = true;
                    _sql.sql_seq = data.sql_seq;
                    sql.sql_param_btn = true;
                    sql.editable = false;
                    //判断方案预览按钮显示
                    _that.showFaultProgramPreviewBtn(program_info,control);
                }
            },function (error) {
                _sql.btn_program_step_sql_param_loading = false;
                Modal.alert(error.message);
            });
        }
    };
    //故障方案--删除步骤中的sql
    this.deleteSqlInProgramStep = function (program_info,step_index,sql_index,control) {
        var _step = program_info.step_list[step_index];
        var _sql  = _step.sql_list[sql_index];
        if(!_sql.sql_seq){
            _step.sql_list.splice(sql_index, 1);
            _step.new_sql_btn = true;
        }else{
            Modal.confirm("请确定是否要删除当前的SQL?").then(function () {
                Program.deleteProgramStepSql(program_info.program_seq, _step.step_seq, _sql.sql_seq).then(function(data) {
                    if(data) {
                        _step.sql_list.splice(sql_index, 1);
                        //与后端交互方案不可用
                        control.program_is_ok = false;
                    }
                }, function(error) {
                    Modal.alert(error.message);
                });
            });
        }
    }
    //故障方案-- 方案保存验证所有的sql是否都提交成功
    this.validFaultProgramAllSqlSubmit = function (program_info) {
        var _error_msg;
        for(var i = 0; i < program_info.step_list.length ;i++){
            var _step_list = program_info.step_list[i];
            if(_step_list.sql_list.length==0) return _error_msg = 1;//1,表示存在未添加sql 的步骤
            for(var j = 0;j < _step_list.sql_list.length;j++){
                if(!_step_list.sql_list[j].sql_param_btn)  return _error_msg = 2 ;//2,表示存在未提交sql 的步骤
            }
        }
    }
    //故障工单--录入工单--工单信息初始化
    this.initWorkOrderInfo = function (work_order_info,user_cur_dept_id,flag) {
        work_order_info = {
            workorder_type: flag ? flag : 1, //工单类型
            order_bk_title: '', //标题
            order_seq: '', //工单编号
            urgency_level: 1, //紧急程度
            urgency_state: false,
            trouble_key: '', //故障类型
            sys_name: '', //系统
            order_bk_desc: '', //描述
        };
        if(user_cur_dept_id){
            work_order_info.deal_dept_id = user_cur_dept_id;
            work_order_info.deal_user_id = '';
        }
        return work_order_info;
    };


    //故障工单--放弃处理按钮显示/隐藏
    this.quitHandleBtnControl = function (sub_tab) {
        var _no_handle_flag = 0;
        for (var i = 0, len = sub_tab.sql_steps.length; i < len; i++) {
            var _sql_step = sub_tab.sql_steps[i];
            if (sub_tab.basicData.sqlexe_type == 1) {
                if ((_sql_step.pend_work_seq && _sql_step.sql_state < 2) || _sql_step.is_generate_sql_author) {
                    _no_handle_flag++;
                    break;
                }
            } else {
                if (_sql_step.pend_work_seq && !_sql_step.exe_success) {
                    _no_handle_flag++;
                    break;
                }
            }
        }
        sub_tab.hide_no_handle_btn = (_no_handle_flag != 0) ? true : false;
    };
    //故障工单--完成处理按钮显示/隐藏
    this.finishHandleBtnControl = function (sub_tab) {
        var _finish_handle_flag = 0;
        for (var i = 0; i < sub_tab.sql_steps.length; i++) {
            var _sql_step = sub_tab.sql_steps[i];
            if (sub_tab.basicData.sqlexe_type == 1) {
                //存在sql_state不为（2：执行成功）或存在生成sql授权--隐藏完成处理按钮
                if (_sql_step.sql_state == 1 || _sql_step.is_generate_sql_author) {
                    _finish_handle_flag = 1;
                    break;
                }
            } else if (sub_tab.basicData.sqlexe_type == 2) {
                if (_sql_step.exe_success) {
                    _finish_handle_flag++;
                }
            } else {
                for (var i = 0; i < sub_tab.sql_steps.length; i++) {
                    if (sub_tab.sql_steps[i].act_exec_time) {
                        _finish_handle_flag++;
                    }
                }
            }
        }
        //全部为（sql_state：2执行成功）状态--显示完成处理按钮
        if (sub_tab.basicData.sqlexe_type == 1) {
            sub_tab.finish_handle_btn = (_finish_handle_flag != 1 && sub_tab.sql_steps.length != 0) ? true : false;
        } else {
            sub_tab.finish_handle_btn = (_finish_handle_flag == sub_tab.sql_steps.length && sub_tab.sql_steps.length != 0) ? true : false;
        }
    };
    //故障工单--处理工单--手工sql处理--全部提交--按钮隐藏/显示
    this.sqlHandleAllSubmitBtnControl = function (sub_tab) {
        //sql维护--sql未执行标志
        var _sql_unexecuted_flag = 0;
        //sql维护--sql权限标志
        var _priv_flag = 0;
        for (var i = 0; i < sub_tab.sql_steps.length; i++) {
            var _sql_step = sub_tab.sql_steps[i];
            if (_sql_step.priv_yn_flag != 1) {
                _priv_flag++;
            }
            //存在sql_state不为（1：待执行）--隐藏全部提交按钮
            if (_sql_step.sql_state != 1) {
                _sql_unexecuted_flag = 0;
                sub_tab.show_all_submit_btn = false;
                break;
            } else {
                _sql_unexecuted_flag++;
            }
        }
        //全部为（sql_state：1待执行）状态--显示全部提交按钮
        if (_sql_unexecuted_flag != 0) {
            sub_tab.show_all_submit_btn = true;
        }
        //所有sql无权限-隐藏全部提交按钮
        if (_priv_flag == sub_tab.sql_steps.length) {
            sub_tab.show_all_submit_btn = false;
        }
    }
    //故障工单--处理工单--手工sql/数据导出--sql时段类型转中文
    this.sqlBucketTranslateCnType = function (sql_step_list) {
        for (var i = 0; i < sql_step_list.length; i++) {
            var _sql_step = sql_step_list[i];
            _sql_step.bucket_cn_type = CV.findValue(_sql_step.bucket_type, BucketType);
        }
    }
    //故障工单--处理工单--手工sql/数据导出--添加sql语句方法
    this.addSqlText = function (sub_tab) {
        Modal.addSQL('',[], sub_tab, 1).then(function (sub_tab_info) {
            var _sub_tab = {
                sql_steps: sub_tab_info.sql_steps ? sub_tab_info.sql_steps : [],
            };
            angular.forEach(_sub_tab.sql_steps, function (data) {
                data.generate_sql = {
                    generate_sql_list:[]
                };
                data.scroll_config_info = ScrollBarConfig.X();
                sub_tab.sql_steps.push(data);
            });
            sub_tab.is_import = false;
            sub_tab.basicData.sqlexe_type = 1;
            //sql时段类型转中文
            _that.sqlBucketTranslateCnType(_sub_tab.sql_steps);
            //全部提交按钮--隐藏/显示
            _that.sqlHandleAllSubmitBtnControl(_sub_tab);
            //放弃处理按钮--隐藏/显示
            _that.quitHandleBtnControl(sub_tab);
            //完成处理按钮--隐藏/显示
            _that.finishHandleBtnControl(sub_tab);
        })
    };
    //故障工单--处理工单--手工sql/数据导出--删除单条sql语句
    this.deleteHandleSqlText = function (sql_text,sql_work_seq,sub_tab,index) {
        Modal.confirm("确认删除sql语句[" + sql_text + "]?").then(function (choose) {
            if (choose) {
                SqlExec.deleteSql(sql_work_seq).then(function (data) {
                    $timeout(function () {
                        if (data) {
                            Modal.alert(sql_text + " 删除成功！");
                            sub_tab.sql_steps.splice(index, 1);
                            //删除成功后--全部提交按钮--显示/隐藏
                            _that.sqlHandleAllSubmitBtnControl(sub_tab);
                            //放弃处理按钮--隐藏/显示
                            _that.quitHandleBtnControl(sub_tab);
                            //完成处理按钮--隐藏/显示
                            _that.finishHandleBtnControl(sub_tab);
                        }
                    }, 0);
                }, function (error) {
                    Modal.alert(error.message)
                });
            }
        });
    };
    //故障工单--处理工单--手工sql/数据导出--获取sql执行信息
    this.getSqlMsgList = function (sql_msg_list, sql_step_list) {
        for (var i = 0; i < sql_msg_list.length; i++) {
            var _sql_msg = sql_msg_list[i];
            if (_sql_msg.success_flag) {
                var _submit_table_data = {
                    theads: _sql_msg.theads ? _sql_msg.theads : [],
                    tbodys: _sql_msg.tbodys,
                    sql_type: _sql_msg.sql_type
                };
                for (var j = 0; j < sql_step_list.length; j++) {
                    var _sql_step = sql_step_list[j];
                    if (_sql_msg.sql_work_seq == _sql_step.sql_work_seq) {
                        _sql_step.submit_table_data = _sql_msg.sql_type == 1 ? _submit_table_data : {};
                        _sql_step.sql_state = _sql_msg.sql_state;
                        _sql_step.sql_type = _sql_msg.sql_type;
                        _sql_step.act_bk_num = _sql_msg.act_bk_num;
                        _sql_step.act_exec_time = _sql_msg.act_exec_time;
                        _sql_step.read_only = _sql_step.read_only ? _sql_step.read_only:false;
                        _sql_step.can_insert = _sql_msg.can_insert;
                    }
                }
            } else {
                for (var k = 0; k < sql_step_list.length; k++) {
                    var _sql_step = sql_step_list[k];
                    if (_sql_msg.sql_work_seq == _sql_step.sql_work_seq) {
                        _sql_step.sql_state = _sql_msg.sql_state;
                        _sql_step.error_message = _sql_msg.error_message;
                        _sql_step.act_exec_time = _sql_msg.act_exec_time;
                    }
                }
            }
        }
    };
    //sql维护--批量导入时间格式化
    this.sqlExeTimeUsedFmt = function (time_used) {
        var _times = '';
        if (time_used < 1000) {
            _times = time_used + 'ms'
        } else {
            _times = Math.floor(time_used / 1000) + 's';
            if (_times > 60) {
                _times = Math.floor(time_used / 1000) / 60 + 'min'
            }
        }
        return _times;
    };
    //故障工单--处理工单--手工sql--主键数据显示在靠前的列转换方法
    this.setPrimaryKeySort = function (list) {
        for (var i = 0, j = 0; i < list.length; i++) {
            if (list[i].primary_key) {
                list[i] = [list[j], list[j] = list[i]][0]
                j++;
            }
        }
        return list;
    };
    //故障工单--处理工单--根据数据生成分页查询
    this.createPageNumberByData = function (_sql_step, query_msg) {
        var _numbers = Math.ceil(query_msg[0].total_page / 10);
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
}]);

/**
 * 系统巡检静态服务
 */
comSrv.service("InspFunc", [function() {

}]);

/**
 * 组件管理静态服务
 */
comSrv.service('CmptFunc', ["$timeout",function ($timeout) {
    var that = this;
    var scriptParamReg = function(has_group) {
        if(has_group) {
            return new RegExp("\\$\\{\\s*\\w+\\.\\w+\\s*\\}+", "g");
        } else {
            return new RegExp("\\$\\{\\s*\\w+\\s*\\}+", "g");
        }
    };
    //数组去重
    this.arrayRemoveRepeat = function(list){
        if(list.length>0){
            for(var i=0,hash={};i<list.length;i++){
                hash[list[i]]===undefined && (hash[list[i]]=1);
            }
            list=[];
            for(var key in hash){
                list.push(key);
            }
        }
        return list;
    };
    //根据单个组件脚本获得参数列表（含分组）
    this.getParamsByScript = function(script ,hide_plugin_list) {
        var _no_group_list =that.arrayRemoveRepeat(script.match(scriptParamReg(false)) ? script.match(scriptParamReg(false)) : []);
        /*var _has_group_list = that.arrayRemoveRepeat(script.match(scriptParamReg(true)) ? script.match(scriptParamReg(true)) : []);*/
        var no_group_re_match_list = [];
        for(var i = 0 ; i < _no_group_list.length; i ++) {
            //不显示的参数列表
            var _hide_param = ['node_config_file','backup_file_name','node_config_local','project_name','update_local_dir','script_file','script_str'];
            _hide_param = hide_plugin_list ? _hide_param.concat(hide_plugin_list) : _hide_param;
            var _match = _no_group_list[i].substring(2, _no_group_list[i].length-1);
            if(_hide_param.indexOf(_match)==-1){
                no_group_re_match_list.push({param_group: '', param_name: _match});
            }
        }
        /*var has_group_re_match_list = [];
        for(var i = 0 ; i < _has_group_list.length; i ++) {
            var _match = _has_group_list[i];
            has_group_re_match_list.push({param_group: _match.substring(2, _match.indexOf(".")), param_name: _match.substring(_match.indexOf(".")+1, _match.length-1)});
        }
        var _err_msg = "";
        for(var i = 0; i < has_group_re_match_list.length; i ++) {
            var _param = has_group_re_match_list[i].param_name;
            var _group = has_group_re_match_list[i].param_group;
            for(var j = 0; j < no_group_re_match_list.length; j ++) {
                if(_param === no_group_re_match_list[j].param_name) {
                    _err_msg = "参数${"+_param+"}存在分组，需统一参数风格";
                    break;
                }
            }
            for(var k=0; k<has_group_re_match_list.length; k ++){
                if(_param == has_group_re_match_list[k].param_name && _group != has_group_re_match_list[k].param_group){
                    _err_msg = "参数${"+_param+"}存在分组，无法进行分组";
                    break;
                }
            }
        }*/
        var res_list = [];
        res_list = res_list.concat(no_group_re_match_list);
        return {list: res_list};
    };
    //公共-脚本数组转化成字符串
    this.cmdsToString = function(arr){
        var str = "";
        if(arr.length>0){
            for(var i=0; i < arr.length-1; i++){
                str += (arr[i]+"\n"); //脚本换行显示
            }
            str += arr[arr.length-1];
        }
        return str;
    };
    //公共-脚本字符串转数组
    this.stringToCmds = function(string){
        return string.split("\n");
    };
    //组件-根据脚本命令获取参数列表
    this.refreshParamList = function(_new_param_list,cmpt_params) {
        for(var i = 0; i < _new_param_list.length; i ++) {
            for(var j = 0; j < cmpt_params.length; j ++) {
                var _old_param = cmpt_params[j];
                if(_old_param.param_name === _new_param_list[i].param_name)
                {
                    _old_param.param_group = _new_param_list[i].param_group;
                    _new_param_list[i] = _old_param;
                }
            }
        }
        return _new_param_list;
    };
    //组件组-初始化时绑定引用参数中文名/描述
    this.bindRefParamDesc= function(ref_params,hand_param_list){
        //私有参数表初始化
        if(ref_params.length != 0 ){
            for(var i=0;i<ref_params.length;i++){
                var _ref_params = ref_params[i];
                for (var j=0;j< hand_param_list.length;j++){
                    var _hand_param = hand_param_list[j].param_name;
                    if(_ref_params.ref == _hand_param){
                        _ref_params.ref_index = j;
                    }
                }
            }
        }
    };
    //组件/组测试-数据源列表处理
    this.handleSourceList = function (array) {
        var _array = [];
        for(var i =0;i<array.length;i++){
            var _one=array[i];
            _array.push({phase_no:i+1,gen_flag:1,impl_type:_one.impl_type,srv_soc:_one.srv_soc,package_names:_one.package_names});
        }
        return _array;
    };
    //流程模板--初始化选中状态（操作系统）
    this.initOpeSysState = function (list) {
        for(var i=0;i<list.length;i++){
            list[i].state=false;
        }
    };
    //判断模组是否全部展开或收起
    this.judgeShowDetail = function (modules) {
        /*返回值
        * 0 全部收起
        * 1 既有收起又有展开
        * 2 全部展开
        * */
        var _number = 0;
        if(modules.length>0){
            if(modules.length == 1){
                if(modules[0].show_detail){
                    _number = 2;
                }else{
                    _number = 0;
                }
            }else{
                for(var i=1;i<modules.length;i++){
                    var _temp = modules[i-1].show_detail;
                    if(_temp != modules[i].show_detail){
                        _number = 1;
                        return _number ;
                    }
                }
                if(modules[modules.length-1].show_detail){
                    _number = 2;
                }else{
                    _number = 0;
                }
            }
        }
        return _number;
    };
    //模组全部展开
    this.expandAllModules =function (modules) {
        var _number = 2;
        for(var i=0;i<modules.length;i++){
            modules[i].show_detail = true;
        }
        return  _number;
    };
    //模组全部收起
    this.closeAllModules =function (modules) {
        var _number = 0;
        for(var i=0;i<modules.length;i++){
            modules[i].show_detail = false;
        }
        /*  $('html,body').animate({scrollTop:0});*/
        return  _number;
    }
    //执行脚本失去焦点获得参数(组件：新增，修改)
    this.blurGetParams = function(list,cmpt_info,cmpt_control){
        if(list.msg){
            cmpt_info.script_msg = list.msg;
            //$scope.cmpt_info.params=[];
            //如果出错不可以提交组件信息
            cmpt_control.cmpt_save_disabled = true;
            return false;
        }
        cmpt_control.cmpt_get_param_loading=true;
        $timeout(function(){
            cmpt_info.script_msg = "";
            cmpt_control.cmpt_save_disabled = false;
            //组件参数列表
            //cmpt_info.params = that.refreshParamList(list.list,cmpt_info.params);
            //cmpt_info.param_list = that.refreshParamList(list.list,cmpt_info.params);
            cmpt_info.param_list = that.refreshParamList(list.list,cmpt_info.param_list);
            cmpt_control.cmpt_get_param_loading=false;
        },500)
    };
    //执行命令失去脚本获得参数
    this.CommandBlurGetParams = function(list,cmpt_info,cmpt_control){
        if(list.msg){
            cmpt_info.script_msg = list.msg;
            //$scope.cmpt_info.params=[];
            //如果出错不可以提交组件信息
            cmpt_control.cmpt_save_disabled = true;
            return false;
        }
        cmpt_control.cmpt_command_param_loading=true;
        $timeout(function(){
            cmpt_info.script_msg = "";
            cmpt_control.cmpt_save_disabled = false;
            //组件参数列表
            //cmpt_info.params = that.refreshParamList(list.list,cmpt_info.params);
            //cmpt_info.param_list = that.refreshParamList(list.list,cmpt_info.params);
            cmpt_info.command_param_list = that.refreshParamList(list.list,cmpt_info.command_param_list);
            cmpt_control.cmpt_command_param_loading=false;
        },500)
    };
    //执行脚本获取上一次的参数列表
    this.getOldExecParamList = function (list) {
        var arr = [];
        //保存上次的参数列表
        for(var i=0; i<list.list.length; i++){
            arr.push({param_group:list.list[i].param_group,param_name:list.list[i].param_name});
        }
        return arr;
    };
    //组件类型的数据采集与其他类型互斥，选中时其他的不能点
    this.changeCheckBoxDisabled = function (item,cmpt_control,cmpt_type_list) {
        if(item.key==2){
            if(item.state){
                cmpt_control.cmpt_type_disabled = true;
                cmpt_control.cmpt_group_type_disabled = true;
            }else {
                cmpt_control.cmpt_type_disabled = false;
                cmpt_control.cmpt_group_type_disabled = true;
            }
        }else {
            cmpt_control.cmpt_type_collect = false;
            cmpt_control.cmpt_group_type_collect = false;
            var _cmpt_type_list =cmpt_type_list;
            for(var i=0;i<_cmpt_type_list.length;i++){
                if(_cmpt_type_list[i].state){
                    cmpt_control.cmpt_type_collect = true;
                    cmpt_control.cmpt_group_type_collect = true;
                    break;
                }
            }
        }
    };
    //组件 -- 判断组件类型如果是发布类型则显示校验组件反之不显示
    this.judgeShowCheckCmpt = function (list) {
        var _flag = false;
        //判断是否显示校验组件
        for(var j=0;j<list.length;j++){
            if(list[j] === 1){
                _flag = true;
                break;
            }
        }
        return _flag;
    }
    //组件 -- 转换可添加插件的智能提示列表
    this.translatePluginHint = function (list) {
        var arr = [];
        for(var i=0;i<list.length;i++){
            if(list[i].plugin_name){
                arr.push({key: '${'+ list[i].plugin_name +'}',text: '${' + list[i].plugin_name+ '} [插件]'})
            }
        }
        return arr;
    }
    //組件--转换提示列表
    this.translateGrammarHint = function (list) {
        var arr = [];
        for(var i=0;i<list.length;i++){
            if(list[i].grammar){
                arr.push({key:list[i].grammar,text:list[i].grammar+ '['+list[i].explain+']'})
            }
        }
        return arr;
    }
    //脚本 -- 全局参数转换可添加插件的智能提示列表
    this.translateAllParam = function (list) {
        var arr = [];
        for(var i=0;i<list.length;i++){
            if(list[i].flag == 0){
                arr.push({key: '${'+ list[i].key +'}',text: '${' + list[i].key+ '} [发布包参数]'})
            }else{
                arr.push({key: '${'+ list[i].key +'}',text: '${' + list[i].key+ '} [全局参数]'})
            }
        }
        return arr;
    }
    //组件 -- 判断上传包文件的类型
    this.judgeFileType = function (fileType) {
        var str = '';
        if(fileType == 'sh'){
            str = 'SHELL';
        }else if(fileType == 'py'){
            str = 'PYTHON';
        }else if(fileType == 'xml'){
            str = 'XML';
        }else if(fileType == 'tar'){
            str = 'TAR';
        }else if(fileType == 'xlsx' || fileType == 'xls'){
            str = 'EXCEL';
        }else{
            return str;
        }
        return str;
    };
}]);

/**
 * 应用系统静态服务
 */
comSrv.service("BsysFunc", ["$sce","CmptFunc", function($sce,CmptFunc) {
    var that = this;
    //系统配置--节点配置--将选中的数据源状态转为提交的数据
    this.stateTransformData = function(curr_node,protocol_soc_list){
        curr_node.soc_list = [];
        angular.forEach(protocol_soc_list,function(data){
            if(data.checked){
                curr_node.soc_list.push(data.soc_name);
            }
        });
    };
    //系统配置--节点配置--配置数据源--查找对象中指定值，返回下标
    this.getObjIndex = function(list,value){
        for(var i=0; i<list.length; i++){
            if(list[i].soc_name == value){
                return i;
            }
        }
    };
    //系统配置--配置方案--提取所有参数名(为了验证参数和类型包不能重复填写)
    this.getAllParam = function (param_list,package_list) {
        var _param_list = [];
        var _package_list = [];
        for(var i=0;i<package_list.length;i++){
            _package_list.push(package_list[i].type_name)
        };
        for(var i=0;i<param_list.length;i++){
            _param_list.push(param_list[i].param_name)
        };
        return _param_list.concat(_package_list);
    };
    //系统配置--配置方案--判断引用参数来自全局参数还是模板类型包
    this.judgeRefParam = function (ref,list) {
        for(var i=0;i<list.length;i++){
            if(ref == list[i].param_name){
                return true;
            }
        }
    };
    //系统配置--配置方案--处理阶段
    this.dealPhase = function(phase_list){
        for(var j=0;j< phase_list.length;j++){
            phase_list[j].logical_node = phase_list[j].logical_node ? phase_list[j].logical_node : {};
            // phase_list[j].node_soc_list = phase_list[j].node_soc_list ? phase_list[j].node_soc_list : [];
            // phase_list[j].node_soc_list = that.dealSoc(phase_list[j].node_soc_list);
        }
        return phase_list;
    };
    //系统配置--配置方案数据源处理
    this.dealSoc = function (list) {
        for(var i=0;i<list.length;i++){
            var  _soc=list[i];
            _soc.ver_soc_name = _soc.support_soc_name;
            _soc.exe_soc_name = _soc.execute_soc_name;
            _soc.exe_ip =  _soc.execute_ip;
            _soc.ver_ip=_soc.support_ip;
            _soc.exe_protocol_type=_soc.execute_protocol_type;
            _soc.ver_protocol_type=_soc.support_protocol_type;
            if(list[i].exe_soc_list){
                for(var j=0;j<list[i].exe_soc_list.length;j++){
                    if(list[i].exe_soc_list[j].soc_name == list[i].exe_soc_name){
                        list[i].exe_protocol_type = list[i].exe_soc_list[j].protocol_type;
                    }
                }
            }
            if(list[i].ver_soc_list){
                for(var j=0;j<list[i].ver_soc_list.length;j++){
                    if(list[i].ver_soc_list[j].soc_name == list[i].ver_soc_name){
                        list[i].ver_protocol_type = list[i].ver_soc_list[j].protocol_type;
                    }
                }
            }
        };
        return list;
    }
    //系统配置--配置方案--绑定引用参数值的参数名和描述
    this.bindRefParam = function (list,global_list,package_types) {
        for(var j=0;j<list.length;j++){
            for(var i=0;i<list[j].phase_list.length;i++){
                    var _phase = list[j].phase_list[i];
                if(_phase.phase_type == 1 || _phase.phase_type == 2){
                    for(var m=0;m<global_list.length;m++){
                        if(_phase.ref_param_list.length!=0){
                            for(var n=0;n<_phase.ref_param_list.length;n++){
                                if(_phase.ref_param_list[n].ref == global_list[m].param_name){
                                    _phase.ref_param_list[n].ref_index = m;
                                }
                            }
                        }
                    };
                    for(var m=0;m<package_types.length;m++){
                        if(_phase.ref_param_list.length!=0){
                            for(var n=0;n<_phase.ref_param_list.length;n++){
                                if(_phase.ref_param_list[n].ref == package_types[m].type_name){
                                    _phase.ref_param_list[n].ref_index = m;
                                }
                            }
                        }
                    };
                }
            }
        }
    };
    //系统配置--配置方案--获取节点数据源中有agent的默认选中
    this.chooseAgentSoc = function (list) {
        var reg = new RegExp('agent');
        var soc_name = '';
        for(var i=0;i<list.length;i++){
            if(reg.test(list[i])){
                soc_name = list[i];
            }
        }
        return soc_name;
    };
    //系统配置--配置方案--切换方案类型是重置引用参数列表
    this.resetRefParamsList = function (package_list,phase_list) {
        for(var k=0;k<phase_list.length;k++){
            var _phase = phase_list[k];
            for(var l=0;l<package_list.length;l++){
                if(_phase.ref_param_list){
                    for(var m=0;m<_phase.ref_param_list.length;m++){
                        if(_phase.ref_param_list[m].ref == package_list[l].type_name) {
                            _phase.ref_param_list[m].ref = "";
                        }
                    }
                }
            }
        }
    }
    //反选包
    this.invertSelectionPac = function (select_list,all_list) {
        select_list = select_list || [];
        all_list = all_list ||[];
        for(var i = select_list.length-1; i >= 0; i--){
            for (var j = 0; j < all_list.length; j++){
                if(select_list[i] == all_list[j].type_name){
                    all_list[j].state = true;
                    // select_list.splice(i,1);
                    break;
                }
            }
        }
    };
    //反选配置文件
    this.invertSelectionConfig = function (select_list,all_list) {
        select_list = select_list || [];
        all_list = all_list ||[];
        for(var i = select_list.length-1; i >= 0; i--){
            for (var j = 0; j < all_list.length; j++){
                if(select_list[i] == all_list[j].file_name){
                    all_list[j].state = true;
                    // select_list.splice(i,1);
                    break;
                }
            }
        }
    };
    //系统配置--方案查看--过滤全局参数列表
    this.filterGobalParam = function (list) {
        list = list || [];
        var _list = [];
        for(var i = 0; i< list.length; i++){
            var _param = list[i];
            if(_param.param_type !=3){
                _list.push(_param);
            }
        }
        return _list;
    }
    //方案数据逻辑处理--查看通用
    this.processProgDate = function (list ,all_pac_type_list,all_config_file_list) {
        for(var i=0;i<list.length;i++){
            var _group = list[i];
            _group.nav_show_flag = 0;// //默认方案阶段全部收起
            _group.expand_flag = false;// //默认阶段收起
            // _group.phase_list = BsysFunc.dealPhase(_group.phase_list);
            var _pac_type_list = _group.pac_type_list || [];
            var _config_file_list = _group.config_file_list || [];
            if(_group.group_type == 3){
                _group.temp_pac_type_list = all_pac_type_list ? angular.copy(all_pac_type_list) : [];
                _group.temp_config_file_list = all_config_file_list ? angular.copy(all_config_file_list) : [];
            }
            //反选包
            that.invertSelectionPac(_pac_type_list,_group.temp_pac_type_list);
            that.invertSelectionConfig(_config_file_list,_group.temp_config_file_list);
            for(var j=0;j<_group.phase_list.length;j++){
                if(_group.phase_list[j].script && _group.phase_list[j].script.cmds){
                    _group.phase_list[j].exec_script = CmptFunc.cmdsToString(_group.phase_list[j].script.cmds);
                }
                if(_group.phase_list[j].logical_node){
                    _group.phase_list[j].logical_node_id = _group.phase_list[j].logical_node.logical_node_id
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
    }
}]);

