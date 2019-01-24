'use strict';
/**
 * 故障维护 HTTP 服务模块
 */
var FaultHttp = angular.module('FaultHttpSrv', []);
//工单
FaultHttp.service('Workorder', ["CallProvider", "CV", function(CallProvider, CV) {
    //获得可指派的部门列表
    this.getAppointDepartmentList = function() {
        return CallProvider.call({
            actionName: "dp_ViewDeptActionqueryDeptList.do",
            reqData: {
                'org_rs_code': CV.rscode('')
            }
        });
    };
    //根据选择部门获得可指派人员列表
    this.getAppointStaffList = function(dept_id) {
        return CallProvider.call({
            actionName: "us_ViewUsforAppActiongetUserListByDept.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'dept_id': dept_id
            }
        });
    };
    //获取可选的故障类型列表
    this.getTroubleTypeList = function() {
        return CallProvider.call({
            //actionName  : "wo_ViewOrderActionqueryTroubleList.do",
            actionName: "wo_ViewOrderActionqueryTroubleTypeList.do",
            reqData: {
                'org_rs_code': CV.rscode('')
            }
        });
    };
    //保存工单
    this.saveWorkorderInfo = function(workorder) {
        workorder.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "wo_AddOrderAction.do",
            reqData: workorder
        });
    };
    //根据编号查询工单信息
    this.getWorkorder = function(workorderId) {
        return CallProvider.call({
            actionName: "wo_ViewOrderActiongetOrderBasicMsg.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': workorderId
            }
        });
    };
    //查询工单流转信息
    this.getWorkorderFlowList = function(workorderId) {
        return CallProvider.call({
            actionName: "wo_ViewOrderActiongetOrderFlowMsg.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': workorderId
            }
        });
    };
    //修改工单
    this.updateWorkorder = function(workorder) {
        workorder.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "wo_UpdateOrderAction.do",
            reqData: workorder
        });
    };
    //删除工单
    this.deleteWorkorder = function(order_seq) {
        return CallProvider.call({
            actionName: "wo_DeleteOrderAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq
            }
        });
    };
    //指派工单
    this.appiontWorkorder = function(appiontObj) {
        appiontObj.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "wo_AssignOrderAction.do",
            reqData: appiontObj
        });
    };
    //变更工单
    this.changeWorkorder = function(changeObj) {
        changeObj.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "wo_AlterOrderAction.do",
            reqData: changeObj
        });
    }
    //退回工单
    this.rollbackWorkorder = function(rollbackObj) {
        rollbackObj.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "wo_ReturnBackOrderAction.do",
            reqData: rollbackObj
        });
    }
    //获取导入的EXCEL的工单列表
    this.getAllExcelWorkorder = function(order_file_name) {
        return CallProvider.call({
            actionName: "wo_ViewOrderActionqueryListByOrderExcel.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_file_name': order_file_name
            }
        });
    };
    //从EXCEL批量导入工单
    this.importExcelWorkorder = function(order_file_name) {
        return CallProvider.call({
            actionName: "wo_ImportOrderByExcelAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_file_name': order_file_name
            }
        });
    };
    //我创建的工单列表-分页
    this.pageCreateWorkorder = function(params) {
        return CallProvider.call({
            actionName: "wo_PageOrderCreateByMeAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit
            }
        });
    };
    //我待处理的工单列表-分页
    this.pagePendingWorkorder = function(params) {
        return CallProvider.call({
            actionName: "wo_PageProcessOrderAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit
            }
        });
    };
    //我已处理的工单列表-分页
    this.pageProcessedWorkorder = function(params) {
        return CallProvider.call({
            actionName: "wo_PageProcessedOrderAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit
            }
        });
    };
    //所有工单列表-分页
    this.pageAllWorkorder = function(params) {
        return CallProvider.call({
            actionName: "wo_PageAllOrderAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'key_word': params.moreParams.key_word,
                'system_key_list': params.moreParams.system_key_list,
                'order_type_list': params.moreParams.order_type_list,
                'order_state_list': params.moreParams.order_state_list,
                'crt_user_id': params.moreParams.crt_user_id,
                'deal_user_id': params.moreParams.deal_user_id,
                'crt_start_date': params.moreParams.crt_start_date,
                'crt_end_date': params.moreParams.crt_end_date,
                'deal_start_date': params.moreParams.deal_start_date,
                'deal_end_date': params.moreParams.deal_end_date
            }
        });
    };
    //查询所有创建人列表
    this.getAllCreaterList = function() {
        return CallProvider.call({
            actionName: "wo_ViewOrderActionqueryCrtUserList.do",
            reqData: {
                'org_rs_code': CV.rscode('')
            }
        });
    }
    //查询所有处理人列表
    this.getAllHandlerList = function() {
        return CallProvider.call({
            actionName: "wo_ViewOrderActionqueryDealUserList.do",
            reqData: {
                'org_rs_code': CV.rscode('')
            }
        });
    };
    //工单处理
    this.getHandlerType = function(order_seq,handle_type,sqlexe_type) {
        return CallProvider.call({
            actionName: "wo_HandleOrderAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'handle_type': handle_type,
                'sqlexe_type':sqlexe_type,
            }
        });
    };
    //工单处理-最终完成处理
    this.complateOrder = function(order_seq) {
        return CallProvider.call({
            actionName: "wo_ComplateOrderAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
            }
        });
    };
    //工单处理--查询待处理工单数
    this.queryWoOrderNumber = function() {
        return CallProvider.call({
            actionName: 'wo_ViewOrderActionqueryWoOrderNumber.do',
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //获得工单导入路径
    this.getOrderUploadPath = function() {
        return CallProvider.call({
            actionName: 'wo_ViewOrderActionqueryOrderUploadPath.do',
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //检查方案本地授权权限
    this.checkPgLocalAuth = function(params) {
        return CallProvider.call({
            actionName: 'pg_CheckPgLocalAuthAction.do',
            reqData: {
                'org_rs_code': CV.rscode(''),
                auth_user_id    : params.auth_user_id,
                user_passwd     : params.user_passed,
                auth_key        : params.auth_key,
                auth_dprl_code  : params.auth_dprl_code,
            }
        });
    };
    //固化方案--查看授权流程
    this.getPgWorkDetail = function(pg_work_seq){
        return CallProvider.call({
            actionName: 'pg_QueryPgWorkDetailAction.do',
            reqData: {
                'org_rs_code': CV.rscode(''),
                pg_work_seq    : pg_work_seq,
            }
        });
    };
    //方案授权拒绝后关闭方案
    this.closePgWorkAction = function(pg_work_seq,deal_bk_desc){
        return CallProvider.call({
            actionName: 'pg_ClosePgWorkAction.do',
            reqData: {
                'org_rs_code': CV.rscode(''),
                pg_work_seq    : pg_work_seq,
                'deal_bk_desc' : deal_bk_desc ? deal_bk_desc :''
            }
        });
    };
    //终止方案
    this.wo_StopOrderAction = function(handle_type,order_seq,deal_bk_seq){
        return CallProvider.call({
            actionName: 'wo_StopOrderAction.do',
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq'     : order_seq,
                'deal_bk_seq'   : deal_bk_seq,
                'handle_type'   : handle_type,
            }
        });
    };
    //获取固化方案定制审批流程信息
    this.getApprovalExecuteProgramStep = function(pend_work_seq){
        return CallProvider.call({
            actionName: 'wk_ApprovalCompleteOrderAction.do',
            reqData: {
                'org_rs_code': CV.rscode(''),
                'pend_work_seq'     : pend_work_seq,
            }
        });
    };

}]);
//SQL维护
FaultHttp.service('SqlExec', ["CallProvider", "CV", function(CallProvider, CV) {
    //工单处理-SQL维护-开始使用
    this.useSql = function(order_seq, deal_bk_seq,sqlexe_type) {
        return CallProvider.call({
            actionName: "sl_SqlStartAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq': deal_bk_seq,
                'sqlexe_type': sqlexe_type
            }
        });
    };
    //工单处理-SQL维护-添加并解析SQL
    this.addSql = function(order_seq, deal_bk_seq, sys_name, sql_txt,soc_name) {
        return CallProvider.call({
            actionName: "sl_AddSqlAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq': deal_bk_seq,
                'sys_name': sys_name,
                'soc_name':soc_name,
                'sql_txt': sql_txt
            }
        });
    };
    this.addSelectSql = function(order_seq, deal_bk_seq, sys_name, sql_txt,soc_name) {
        return CallProvider.call({
            actionName: "sl_AddSelectSqlAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq': deal_bk_seq,
                'sys_name': sys_name,
                'soc_name':soc_name,
                'sql_txt': sql_txt
            }
        });
    };
    //工单处理-SQL维护-删除单个SQL
    this.deleteSql = function(sql_work_seq) {
        return CallProvider.call({
            actionName: "sl_DeleteSingleSqlAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sql_work_seq': sql_work_seq
            }
        });
    };
    //工单处理-SQL维护-获得已提交的SQL列表
    this.submitedSqlList = function(order_seq, deal_bk_seq) {
        return CallProvider.call({
            actionName: "sl_ViewSqlActionGetSqlList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq': deal_bk_seq
            }
        });
    };
    //工单处理-SQL维护-获得SQL解析详细
    this.getSqlSchemeResult = function(sql_work_seq) {
        return CallProvider.call({
            actionName: "sl_ViewSqlActionGetSqlMsg.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sql_work_seq': sql_work_seq
            }
        });
    };
    //工单处理-手工SQL-执行批量查询
    this.execSelectSqlList = function(sql_info_list,start_num,end_num) {
        return CallProvider.call({
            actionName: "sl_ExecuteQuerySqlAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'query_sql_list': sql_info_list,
                'start_num':start_num,
                'end_num':end_num
            },
            timeout:300
        });
    };
    //工单处理-手工SQL-执行批量变更
    this.execModifySqlList = function(sql_info_list,execute_sql) {
        return CallProvider.call({
            actionName: "sl_ExecuteModifySqlAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'modify_sql_list': sql_info_list,
                'execute_sql' : execute_sql,
            }
        });
    };
    //工单处理-手工SQL-根据表格修改生成SQL语句列表
    this.generateSqlByTable = function(modifyInfo) {
        return CallProvider.call({
            actionName: "sl_SelectModifyGenerateSqlAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sql_work_seq': modifyInfo.sql_work_seq,
                'theads': modifyInfo.theads,
                'modify_string': modifyInfo.modify_string
            }
        });
    };

    //工单处理--手工SQL--清空生成sql列表
    this.clearSqlList = function(sl_msg_list){
        return CallProvider.call({
            actionName: "sl_DeleteGenerateSqlAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sl_msg_list': sl_msg_list
            }
        });
    };
    //sql维护--合并重复的sql语句
    this.mergRepeatSql = function(modify_sql_list){
        return CallProvider.call({
            actionName: "sl_DeleteSurplusSqlAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'modify_sql_list': modify_sql_list
            }
        });
    };

    //sql维护-批量sql-获取文件上传路径
    this.getImportFileUploadPath = function(order_seq){
        return CallProvider.call({
            actionName: "pg_ViewPgActiongetProgramUploadPath.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq' : order_seq
            }
        });
    };
    //sql维护-批量sql-解析文件
    this.parseImportFile = function(order_seq,deal_bk_seq,file_name,sys_name,soc_name,step_seq){
        return CallProvider.call({
            actionName: "sl_ExportBatchSqlAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'file_name':file_name,
                'sys_name':sys_name,
                'soc_name':soc_name,
                'step_seq':step_seq,
                'order_seq':order_seq,
                'deal_bk_seq':deal_bk_seq
            }
        });
    };
    //sql维护-批量sql-批量执行
    this.batchExeSql = function(order_seq,deal_bk_seq,sys_name,soc_name,import_sql_filename,step_seq,tran_flag){
        return CallProvider.call({
            actionName: "sl_BatchExecuteSqlAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'deal_bk_seq': deal_bk_seq,
                'order_seq': order_seq,
                'sys_name' :sys_name,
                'soc_name' : soc_name,
                'file_name' :import_sql_filename,
                'step_seq':step_seq,
                'tran_flag':tran_flag,
            }
        })};
    //sql维护-批量sql-查看导入信息
    this.submitedImportSqlList = function(order_seq,deal_bk_seq){
        return CallProvider.call({
            actionName: "sl_ViewSqlActionqueryBatchSql.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'deal_bk_seq': deal_bk_seq,
                'order_seq': order_seq,
            }
        })};
    //sql维护-批量sql-重置操作
    this.resetImportSql = function(order_seq,deal_bk_seq,step_seq){
        return CallProvider.call({
            actionName: "sl_ResetExecuteSqlAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq': deal_bk_seq,
                'step_seq': step_seq
            }
        })};

    //数据导出--查询类SQL执行信息
    this.exportQueryData = function(query_sql_list,sql_text,sensite_list){
        return CallProvider.call({
            actionName: "sl_ExportSelectDataAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'query_sql_list': query_sql_list,
                'sql_text' : sql_text,
                'sensite_list': sensite_list
            },
            timeout:300
        })
    };
}]);
//工单处理-脚本处理
FaultHttp.service('ScriptExec', ["CallProvider", "CV", function(CallProvider, CV) {
    //脚本处理--获取脚本上传路径
    this.getScriptUploadPath = function(order_seq,deal_bk_seq) {
        return CallProvider.call({
            actionName: "sc_ViewScriptActiongetUploadPath.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq':order_seq,
                'deal_bk_seq':deal_bk_seq
            }
        });
    };
    //脚本处理--解析脚本文件
    this.parseScriptFile = function(script_file_path) {
        return CallProvider.call({
            actionName: "sc_UploadScriptFileAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'script_file_path': script_file_path
            }
        });
    };
    //脚本处理--根据节点ip获取数据源
    this.getSocByNodeIp = function(node_ip,impl_type) {
        return CallProvider.call({
            actionName:"bs_ViewDtSourceActionquerySoc.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                soc_ip: node_ip,
                impl_type: impl_type,
            }
        });
    };
    //脚本处理--执行
    this.execute = function(script_form) {
        return CallProvider.call({
            actionName: "sc_ExecuteScriptAction.do",
            reqData: script_form,
            timeout: 600
        });
    };
    //脚本处理--查看
    this.viewStepDetail = function(order_seq,deal_bk_seq,script_bk_seq){
        return CallProvider.call({
            actionName: "sc_ViewScriptActiongetDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq':deal_bk_seq,
                'script_bk_seq':script_bk_seq
            }
        });
    };
    //脚本处理--获取当前授权信息的脚本信息
    this.viewAuthStepDetail = function(order_seq,deal_bk_seq){
        return CallProvider.call({
            actionName: "sc_ViewScriptActiongetScriptAuthorMsg.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq':deal_bk_seq,
            }
        });
    };
    //查看历史列表
    this.viewHistoryList = function (order_seq,deal_bk_seq) {
        return CallProvider.call({
            actionName: "sc_ViewScriptActiongetListByOrderSeq.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq':deal_bk_seq
            }
        });
    };
    //脚本处理--删除脚本文件
    this.deleteFile = function(script_file_path){
        return CallProvider.call({
            actionName: "sc_DeleteUploadFileAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'script_file_path': script_file_path
            }
        });
    }
    //脚本处理--停止脚本执行
    this.stopScriptExec = function(order_seq,deal_bk_seq,script_bk_seq){
        return CallProvider.call({
            actionName: "sc_StopExecuteScriptAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq':deal_bk_seq,
                'script_bk_seq':script_bk_seq
            }
        });
    };
}]);
//方案
FaultHttp.service('Program', ["CallProvider", "CV", function(CallProvider, CV) {
    //根据关键字查询方案列表分页
    this.pageProgramList = function(params) {
        return CallProvider.call({
            actionName: "pg_PageProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'key_word'   : params.key_word,
                'start_recd' : params.data.offset,
                'limit_recd' : params.data.limit
            }
        });
    };
    //删除单个方案
    this.deleteFaultProgram = function(program_seq, confirm_flag) {
        return CallProvider.call({
            actionName: "pg_DeleteProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'confirm_flag': confirm_flag ? confirm_flag : 1
            },
            timeout:600
        });
    };
    //查询方案的基本和步骤信息
    this.getProgramInfoAndStepList = function(program_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActiongetPgInfo.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq
            }
        });
    }
    //查询方案的所有步骤信息
    this.getProgramAllInfoAndStepList = function(program_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActionqueryPgAllSteps.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq
            }
        });
    }
    //批量查询方案的所有信息
    this.getSelectProgramAllInfo = function(program_seq,order_seq,deal_bk_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActiongetPgSelStageMsg.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'order_seq': order_seq,
                'deal_bk_seq' : deal_bk_seq,
            }
        });
    }
    //固化方案--方案预览
    this.previewProgram = function(program_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActionpreviewProgram.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
            }
        });
    }
    //新建方案
    this.saveFaultProgram = function(program_name, program_bk_desc) {
        return CallProvider.call({
            actionName: "pg_AddProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_name': program_name,
                'program_bk_desc': program_bk_desc
            }
        });
    }
    //修改方案
    this.editProgram = function(program_seq, program_name, program_bk_desc) {
        return CallProvider.call({
            actionName: "pg_UpdateProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'program_name': program_name,
                'program_bk_desc': program_bk_desc
            }
        });
    }
    //保存方案
    this.saveProgram = function(program_seq) {
        return CallProvider.call({
            actionName: "pg_CheckProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq
            }
        });
    }
    //检验方案是否可用
    this.checkProgram = function(program_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActionresetProgramFlag.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq
            }
        });
    }
    //新建方案步骤
    this.addProgramStep = function(program_seq, step_seq, step_bk_title, pg_source) {
        return CallProvider.call({
            actionName: "pg_EditProgramStepAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'step_seq': step_seq,
                'step_bk_title': step_bk_title,
                'pg_source' : pg_source
            }
        });
    }
    //拖动时改变方案步骤序号
    this.slideProgramStep = function(program_seq, start_step_seq, end_step_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActionstepSlide.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'start_step_seq': start_step_seq,
                'end_step_seq': end_step_seq
            }
        });
    }
    //删除方案步骤
    this.deleteProgramStep = function(program_seq, step_seq) {
        return CallProvider.call({
            actionName: "pg_DeleteProgramStepAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'step_seq': step_seq
            }
        });
    }
    //新建方案步骤Sql
    this.addProgramStepSql = function(program_seq, step_seq, sql_text, sys_name,soc_name) {
        return CallProvider.call({
            actionName: "pg_ViewPgActionparsesql.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'step_seq': step_seq,
                'sql_text': sql_text,
                'sys_name': sys_name,
                'soc_name': soc_name
            }
        });
    }
    //删除方案步骤Sql
    this.deleteProgramStepSql = function(program_seq, step_seq, sql_seq) {
        return CallProvider.call({
            actionName: "pg_DeletePgSqlParamAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'step_seq': step_seq,
                'sql_seq': sql_seq
            }
        });
    }
    //保存方案步骤Sql参数
    this.addProgramStepSqlParam = function(program_seq, step_seq, sql_seq, pg_sql_bean) {
        return CallProvider.call({
            actionName: "pg_EditPgSqlParamAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'step_seq': step_seq,
                'sql_seq': sql_seq,
                'pg_sql_bean': pg_sql_bean
            },
            timeout: 120 //两分钟
        });
    }
    //查看sql解析详情
    this.viewProgramStepSqlDetail = function(program_seq, step_seq, sql_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActiongetSqlParseDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'step_seq': step_seq,
                'sql_seq': sql_seq,
            },
            timeout: 60
        });
    }
    //根据部门查询方案SQL参数可授权角色列表
    this.getSqlParamAuthRoleByDept = function(dept_id) {
        return CallProvider.call({
            actionName: "us_ViewUsforAppActionqueryRoleByDept.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'dept_id': dept_id
            }
        });
    }
    //导入方案
    this.importUsableProgram = function(file_name) {
        return CallProvider.call({
            actionName: "pg_ImportPgAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'file_name': file_name
            }
        });
    }
    //导入方案上传路径
    this.getimportProgramUploadPath = function() {
        return CallProvider.call({
            actionName: "pg_ViewPgActiongetProgramUploadPath.do",
            reqData: {
                'org_rs_code': CV.rscode('')
            }
        });
    }
    //导出方案
    this.exportUsableProgram = function(program_seq) {
        return CallProvider.call({
            actionName: "pg_ExportPgAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq
            }
        });
    }
    //批量导入方案步骤
    this.importBatchProgramStep = function (file_name,pg_source) {
        return CallProvider.call({
            actionName: "pg_ImportBatchPgAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'file_name': file_name,
                'pg_source': pg_source
            }
        });
    };
    //保存批量导入的方案
    this.saveImportProgram = function (program_seq,program_name,program_bk_desc,pg_stage_msg,tran_flag,pg_source) {
        return CallProvider.call({
            actionName: "pg_AddBatchProgramAction.do",
            reqData: {
                'org_rs_code'    : CV.rscode(''),
                'program_seq'    :program_seq,
                'program_name'   : program_name,
                'program_bk_desc': program_bk_desc,
                'pg_stage_msg'   : pg_stage_msg,
                'tran_flag'      : tran_flag,
                'pg_source'      : pg_source
            }
        });
    };
    //查看批量导入的方案
    this.viewImportProgram = function(program_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActiongetProgramDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq
            }
        });
    };
    //导出批量方案Excel
    this.exportBatchProgram = function(program_seq) {
        return CallProvider.call({
            actionName: "pg_ExportBatchPgAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq
            }
        });
    };
    //根据业务系统获取数据源
    this.getSocByBusy = function(business_sys_name,protocol_type) {
        return CallProvider.call({
            //actionName: "bs_ViewBsNodeActiongetSocBySysNameAndType.do",
            actionName: "bs_ViewDtSourceActionquerySoc.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'business_sys_name': business_sys_name,
                'protocol_type': protocol_type
            }
        });
    };

    //添加SQL-获取服务器列表
    this.selectSrv = function(data_type){
        return CallProvider.call({
            actionName: "bs_ViewBsActionqueryServerListByType.do",
            reqData: {
                protocol_type : data_type
            }
        })
    }
}]);
//智能方案维护
FaultHttp.service('ProgramExec', ["CallProvider", "CV", function(CallProvider, CV) {
    //工单处理--固化方案--使用方案
    this.useProgram = function(order_seq, deal_bk_seq, program_seq) {
        return CallProvider.call({
            actionName: "pg_ExecuteProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'order_seq': order_seq,
                'deal_bk_seq': deal_bk_seq
            }
        });
    };
    //工单处理-固化方案-查询方案单个步骤信息
    this.getStepByProgramStepId = function(program_seq, step_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActiongetPgStepDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program_seq': program_seq,
                'step_seq': step_seq
            }
        });
    };
    //工单处理-固化方案-执行单个方案步骤
    this.execProgramStep = function(data,start_num,end_num) {
        return CallProvider.call({
            actionName: "pg_ExecuteProgramStepAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': data.order_seq,
                'deal_bk_seq': data.deal_bk_seq,
                'step_seq': data.step_seq,
                'sql_list': data.sql_list,
                'pgsubmit_type': data.pgsubmit_type,
                'pg_work_seq' : data.pg_work_seq ,
                'start_num':start_num,
                'end_num'   :end_num
            }
        });
    };
    //工单处理-智能方案维护-查询已执行的方案步骤列表
    this.getExedProgramStep = function(order_seq, deal_bk_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActionqueryExecutedSteps.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq': deal_bk_seq
            }
        });
    };
    //工单处理-固化方案-全部重置
    this.resetAllExedStep = function(order_seq, deal_bk_seq, program_seq) {
        return CallProvider.call({
            actionName: "pg_ResetProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq': deal_bk_seq,
                'program_seq': program_seq
            }
        });
    };
    //工单处理-智能方案维护-重新选择
    this.reSelect = function(order_seq, deal_bk_seq) {
        return CallProvider.call({
            actionName: "pg_ReselectProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq': deal_bk_seq
            }
        });
    };
    //工单处理-固化方案-重置方案步骤
    this.resetProgramStep = function(order_seq, deal_bk_seq, step_seq) {
        return CallProvider.call({
            actionName: "pg_ResetProgramStepAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq': order_seq,
                'deal_bk_seq': deal_bk_seq,
                'step_seq': step_seq
            }
        });
    }
    //工单处理--固化方案--获取批量方案上传路径
    this.getImportPath = function (order_seq, program_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActiongetPgExcelFilePath.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq'  : order_seq,
                'program_seq': program_seq
            }
        });
    }
    //工单处理--固化方案--获取执行后信息
    this.getExecdMsg = function (order_seq, program_seq,deal_bk_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActiongetBatchPgExcuteMsg.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'order_seq'  : order_seq,
                'program_seq': program_seq,
                'deal_bk_seq' : deal_bk_seq,
            }
        });
    }
    //工单处理--固化方案--执行excel
    this.startExecProgram = function (order_seq, program_seq,file_name,deal_bk_seq) {
        return CallProvider.call({
            actionName: "pg_ExcuteBatchPgAction.do",
            reqData: {
                'org_rs_code' : CV.rscode(''),
                'order_seq'   : order_seq,
                'program_seq' : program_seq,
                'file_name'   : file_name,
                'deal_bk_seq' : deal_bk_seq,
            },
            timeout : 3600 //执行延时1小时
        });
    }
    //工单处理--固化方案--执行select方案(现版本在使用)
    this.startSelectExecProgram = function (order_seq, program_seq,deal_bk_seq,sql_list) {
        return CallProvider.call({
            actionName: "pg_ExcuteSelpgAction.do",
            reqData: {
                'org_rs_code' : CV.rscode(''),
                'order_seq'   : order_seq,
                'program_seq' : program_seq,
                'deal_bk_seq' : deal_bk_seq,
                'sql_list'    : sql_list
            },
            timeout : 3600 //执行延时1小时
        });
    }
    //工单处理--判断固化方案类型
    this.getProgramType = function (order_seq,deal_bk_seq) {
        return CallProvider.call({
            actionName: "pg_ViewPgActiongetPgSourceForBatch.do",
            reqData: {
                'org_rs_code' : CV.rscode(''),
                'order_seq'   : order_seq,
                'deal_bk_seq' : deal_bk_seq,
            },
        });
    }
    //工单处理--固化方案--执行查询sql方案
    this.startSelectProgram = function (order_seq, program_seq,file_name,deal_bk_seq) {
        return CallProvider.call({
            actionName: "pg_ExecuteSelectBatchPgAction.do",
            reqData: {
                'org_rs_code' : CV.rscode(''),
                'order_seq'   : order_seq,
                'program_seq' : program_seq,
                'file_name'   : file_name,
                'deal_bk_seq' : deal_bk_seq,
            },
            timeout : 3600 //执行延时1小时
        });
    }
}]);
//参数配置服务
FaultHttp.service('TroubleConfig', ["CallProvider", "CV", function(CallProvider, CV) {
    //新增故障类型
    this.addTroubleType = function(troubletype) {
        troubletype.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "wo_AddTroubleTypeAction.do",
            reqData: troubletype
        });
    };
    //删除故障类型
    this.deleteTroubleType = function(trouble_key) {
        return CallProvider.call({
            actionName: "wo_DeleteTroubleTypeAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'trouble_key': trouble_key
            }
        });
    };
    //修改故障类型
    this.updateTroubleType = function(troubletype) {
        troubletype.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "wo_UpdateTroubleTypeAction.do",
            reqData: troubletype
        });
    };
    //查看单个故障类型
    this.viewTroubleTypeInfo = function(trouble_key) {
        return CallProvider.call({
            actionName: "wo_ViewOrderActiongetTroubleTypeInfo.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'trouble_key': trouble_key
            }
        });
    };
    //查询故障类型列表
    this.getTroubleTypeList = function() {
        return CallProvider.call({
            actionName: "wo_ViewOrderActionqueryTroubleTypeList.do",
            reqData: {
                'org_rs_code': CV.rscode('')
            }
        });
    };
    //新增高峰时段
    this.addPeakTimeInterval = function(peaktimeinterval) {
        peaktimeinterval.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "wo_AddTimeIntervalAction.do",
            reqData: peaktimeinterval
        });
    };
    //获取高峰时段列表
    this.getPeakTimeIntervalList = function(params) {
        return CallProvider.call({
            actionName: "wo_PageTimeIntervalAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit
            }
        });
    };
    //查看高峰时段详细信息
    this.viewPeakTimeIntervalInfo = function(time_work_seq) {
        return CallProvider.call({
            actionName: "wo_ViewTimeIntervalActionGetDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'time_work_seq': time_work_seq
            }
        });
    };
    //修改高峰时段
    this.modifyPeakTimeInterval = function(peaktimeinterval) {
        peaktimeinterval.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "wo_ModifyTimeIntervalAction.do",
            reqData: peaktimeinterval
        });
    };
    //删除高峰时段
    this.deletePeakTimeInterval = function(time_work_seq) {
        return CallProvider.call({
            actionName: "wo_DeleteTimeIntervalAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'time_work_seq': time_work_seq
            }
        });
    };
}]);