'use strict';
/**
 * 作业调度 HTTP 服务模块
 */
var DispatchSrv = angular.module('DispatchHttpSrv', []);
DispatchSrv.service('Dispatch', ["CallProvider", "CV", function(CallProvider, CV) {
    //查询日志系统
    this.getAllLogSys = function() {
        return CallProvider.call({
            actionName: "lg_FindSysOperationLogAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //日志提取
    this.pickLog = function(log_pick_info) {
        return CallProvider.call({
            actionName: "op_GetContentAction.do",
            reqData: log_pick_info
        });
    };
    //日志监控
    this.logMonitor = function(log_monitor_info) {
        return CallProvider.call({
            actionName: "op_LogAutoMonitorAction.do",
            reqData: log_monitor_info,
            timeout: 60
        });
    };
    //获取监控日志内容
    this.getLogMonitorContent = function(monitor_info) {
        return CallProvider.call({
            actionName: "op_ReadLogContentAction.do",
            reqData: monitor_info
        });
    };
}]);
//流程
DispatchSrv.service('Flow', ["CallProvider", "CV", function(CallProvider, CV) {
    //流程定制-基本信息保存
    this.saveFlowBasicData = function(data,is_update) {
        return CallProvider.call({
            actionName: is_update ? "fw_UpdateFlowBasicAction.do" : "fw_EditSdFlowBasicAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sdflow_id'         :   data.sdflow_id,
                'sdversion_id'      :   data.sdversion_id,
                'sdflow_cn_name'    :   data.sdflow_cn_name,
                'sdflow_bk_desc'    :   data.sdflow_bk_desc,
                'sdflow_types'      :   data.sdflow_types,
                'sddispatch_type'   :   data.sddispatch_type,
                'sdparallel_task'   :   data.sdparallel_task,
                'sdarrang_method'   :   data.sdarrange_method,
                'sd_strategy_id'    :   data.sd_strategy_id,
                'sd_priority'       :   data.sd_priority,
                'scene_main_id'     :   data.scene_main_id,
            }
        });
    };
    //流程定制-保存执行人
    this.editFLowExeUser = function(data) {
        return CallProvider.call({
            actionName: "fw_UpdateExeUserAction.do",
            reqData: {
                'org_rs_code'  :  CV.rscode(''),
                'sdflow_id'    :  data.sdflow_id,
                'sdversion_id' :  data.sdversion_id,
                'exe_user_ids' :  data.exe_user_list
            }
        });
    };
    //流程定制-查询十条时间信息
    this.caculatorExeTime = function(data){
        return CallProvider.call({
            actionName: "fw_CaculatorExeTimeBatchAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                start_bk_datetime         :   data.start_bk_datetime,
                end_bk_datetime    :   data.end_bk_datetime,
                cycle_info    :   data.cycle_info,

            }
        });
    };
    //查询当前任务列表(不分页)
    this.getCurrentTaskList = function (params) {
        return CallProvider.call({
            actionName: "tk_QuerySdCurTaskAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                key_word : params.key_word,
                sdtask_cn_name: params.sdtask_cn_name,
                sdtask_types:params.sdflow_type,
                sddispatch_type: params.sddispatch_type,
                exe_user_id: params.exe_user_id,
                start_bk_datetime: params.start_bk_datetime,
                end_bk_datetime: params.end_bk_datetime
            }
        });
    };
    //分页查询历史任务列表
    this.pageHistoryTaskList =function (params) {
        return CallProvider.call({
            actionName: "tk_PageSdHistoryTaskAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                key_word : params.key_word,
                start_recd: params.data.offset,
                limit_recd: params.data.limit,
                sdtask_cn_name: params.sdtask_cn_name,
                sdtask_types:params.sdflow_type,
                sddispatch_type: params.sddispatch_type,
                exe_user_id: params.exe_user_id,
                start_bk_datetime: params.start_bk_datetime,
                end_bk_datetime: params.end_bk_datetime
            }
        });
    };

    //任务-干预任务执行
    this.meddleTaskExecute = function (task_id,meddle_type) {
        return CallProvider.call({
            actionName: "tk_MeddleSdTaskAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                task_id : task_id,
                meddle_type : meddle_type
            }
        });
    };
    //任务-干预作业执行
    this.meddleJobExecute = function (task_id,meddle_type,job_id_list,meddle_reason) {
        return CallProvider.call({
            actionName: "tk_MeddleSdJobAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                task_id : task_id,
                job_id_list : job_id_list,
                meddle_type : meddle_type,
                meddle_reason:meddle_reason
            }
        });
    };
    //任务-保存任务输入参数
    this.saveTaskInputParam = function (task_id,job_id,param_list) {
        return CallProvider.call({
            actionName: "jb_SaveStartNodeAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                task_id    : task_id,
                job_id     : job_id,
                param_list : param_list
            }
        });
    };
    //任务-单个跳过作业
    this.skipOneStepJob = function (task_id,step_list) {
        return CallProvider.call({
            actionName: "jb_SkipJobAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                dptask_id : task_id,
                step_list : step_list
            }
        });
    };
    //任务-查询作业输出参数
    this.getJobOutput = function (task_id,flow_id,version_id,job_id_list) {
        return CallProvider.call({
            actionName: "jb_QuerySkipJobAction.do",
            reqData: {
                'org_rs_code':  CV.rscode(''),
                'flow_id'    :  flow_id,
                'version_id' :  version_id,
                'dptask_id'  :  task_id,
                'step_list'  :  job_id_list
            }
        });
    };
    //任务-查看任务详细
    this.viewTaskDetail =function (task_id) {
        return CallProvider.call({
            actionName: "tk_ViewSdTaskDetailAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sdtask_id' : task_id
            }
        });
    };
    //任务-根据作业id查看单个作业信息
    this.viewSingleJobInfo =function (task_id,job_id) {
        return CallProvider.call({
            actionName: "tk_ViewSingleJobDetailAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sdtask_id' : task_id,
                'job_id'    : job_id
            }
        });
    };
    //任务-监控作业状态
    this.monitorJobStatus =function (task_id,job_list) {
        return CallProvider.call({
            actionName: "tk_ViewTaskAllStatusAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sdtask_id' : task_id,
                'job_list'    : job_list
            }
        });
    };
    //任务-根据作业id查看单个作业操作信息
    this.viewSingleJobOpInfo =function (task_id,job_id) {
        return CallProvider.call({
            actionName: "tk_ViewSingleJobOperateAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sdtask_id' : task_id,
                'job_id'    : job_id
            }
        });
    };

    //流程列表
    this.pageOpFlowList = function(params){
        return CallProvider.call({
            actionName: "fw_PageSdFlowAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                key_word : params.key_word,
                start_recd: params.data.offset,
                limit_recd: params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'desc' ? '1' : '2'),
                sddispatch_type   : params.exe_types,
            }
        });
    };
    //我关注的列表
    this.pageAttentionFlowList = function(params){
        return CallProvider.call({
            actionName: "fw_PageSdFocusFlowAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                key_word : params.key_word,
                start_recd: params.data.offset,
                limit_recd: params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'desc' ? '1' : '2'),
            }
        });
    };
    //关注流程
    this.attentionFlow = function(flow_id,focus_flag,sdversion_id){
        return CallProvider.call({
            actionName: "fw_AddSdFocusFlowAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                focus_flag          :focus_flag,
                sdflow_id           :flow_id,
                sdversion_id        : sdversion_id
            }
        });
    };
    //流程挂起、解挂
    this.handleUpOrDownflow = function(flow_id,flag,sdversion_id){
        return CallProvider.call({
            actionName: "fw_HangUpOrEnableSdFlowAction.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
                sdflow_id             : flow_id,
                sdversion_id          : sdversion_id,
                hang_up                : flag,
            }
        });
    };
    //流程列表
    this.getIpList = function(params){
        return CallProvider.call({
            actionName: "dt_ViewDtActionqueryAllIp.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //编辑流程扩展信息
    this.saveFlowExtendData = function(data){
        return CallProvider.call({
            actionName: "fw_EditSdFlowExtendAction.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
                sdflow_id             : data.sdflow_id,
                sdversion_id          : data.sdversion_id,
                start_bk_datetime   : data.start_bk_datetime_val,
                end_bk_datetime     : data.end_bk_datetime_val,
                cycle_info          : data.cycle_info,
                sd_node_list        : data.nodeDataArray,
                link_list           : data.linkDataArray,
                exe_user_ids        : data.exe_user_list,
            }
        });
    };
    //查看流程基本信息
    this.viewFlowBasicInfo = function(flow_id,sdversion_id){
        return CallProvider.call({
            actionName: "fw_SdFlowDetailViewActiongetSdFlowBasicInfo.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
                sdflow_id             : flow_id,
                sdversion_id          : sdversion_id
            }
        });
    };
    //查看流程详细
    this.viewFlowDetailData = function(flow_id,sdversion_id){
        return CallProvider.call({
            actionName: "fw_SdFlowDetailViewActiongetFlowDetail.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
                sdflow_id             : flow_id,
                sdversion_id          : sdversion_id
            }
        });
    };
    //得到任务id
    this.getOptaskId = function(flow_id,sdversion_id){
        return CallProvider.call({
            actionName: "fw_ExeSdFlowAction.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
                sdflow_id           : flow_id,
                sdversion_id        : sdversion_id
            }
        });
    };
    //发布流程
    this.publishFlow = function(flow_id,sdversion_id,data){
        return CallProvider.call({
            actionName: "fw_PublishSdFlowAction.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
                sdflow_id             : flow_id,
                sdversion_id        : sdversion_id,
                publish_reason      : data,
            }
        })
    };
    //删除流程
    this.deleteOpFlow = function(flow_id,sdversion_id){
        return CallProvider.call({
            actionName: "fw_DeleteSdFlowAction.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
                sdflow_id           : flow_id,
                sdversion_id        : sdversion_id,
            }
        })
    };
    /**
     * 任务概览
     * **/
        //全行、关注--根据日期获取任务列表
    this.getTaskListByDate = function(is_attention,run_date){
        return CallProvider.call({
            actionName: "tk_ViewSdTaskAction.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
                'is_attention': is_attention,
                'run_date':run_date
            }
        });
    }
    //节点--获取所有节点
    this.getAllNodesInfo = function(){
        return CallProvider.call({
            actionName: "tk_ViewAllNodeAction.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
            }
        });
    }
    //节点--根据节点和日期获取任务列表信息
    this.getTaskListByDateAndNode = function(node_ip,run_date){
        return CallProvider.call({
            actionName: "tk_ViewTaskInfoByDateAction.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
                'node_ip': node_ip,
                'run_date':run_date
            }
        });
    }

    /*任务报告*/
    this.getReportInfoByDate = function(chart){
        return CallProvider.call({
            actionName: "tk_ViewFlowAndTaskNumDetail.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
                'start_time':chart.begin_date_fmt,
                'end_time':chart.end_date_fmt
            }
        });
    }
}]);

//调度场景
DispatchSrv.service('Scene', ["CallProvider", "CV", function(CallProvider, CV) {
    //新增/修改场景
    this.addScene = function(scene_info,is_update) {
        return CallProvider.call({
            actionName: is_update ? "se_EditSeSceneAction.do" : "se_AddSeSceneAction.do",
            reqData: {
                scene_info : scene_info
            }
        });
    };
    //场景列表
    this.getSceneListByType = function(params) {
        return CallProvider.call({
            actionName: "se_PageSeSceneAction.do",
            reqData: {
                'key_word' : params.key_word,
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit
            }
        });
    };
    //删除场景
    this.removeSingleScene = function(scene_id) {
        return CallProvider.call({
            actionName: "se_DeleteSeSceneAction.do",
            reqData: {
                scene_id : scene_id
            }
        });
    };
    //查看单个场景
    this.getSingleSceneDetail = function(scene_id,private_flag) {
        return CallProvider.call({
            actionName: "se_ViewSeSceneAction.do",
            reqData: {
                scene_id : scene_id,
                private_flag : private_flag ? private_flag : false, //是否查看私有场景
            }
        });
    };
    //获取多个场景元素信息
    this.getMultipleSceneElementDetail = function(scene_id_list) {
        return CallProvider.call({
            actionName: "se_ViewSceneElementAction.do",
            reqData: {
                scene_id_list: scene_id_list
            }
        });
    };
    //添加私有场景
    this.addPrivateScene = function(private_info) {
        return CallProvider.call({
            actionName: "se_AddPrivateSceneAction.do",
            reqData: private_info
        });
    };
}]);

//调度策略
DispatchSrv.service('Strategy', ["CallProvider", "CV", function(CallProvider, CV) {
    //新增策略组
    this.addStrategyGroup = function(strategy_info) {
        return CallProvider.call({
            actionName: "sg_AddStrategyGroupAction.do",
            reqData:    strategy_info
        });
    };
    //策略组列表
    this.getStrategyGroupList = function() {
        return CallProvider.call({
            actionName: "sg_PageStrategyGroupAction.do",
            reqData: {}
        });
    };
    //删除策略组
    this.removeStrategyGroup = function(strategy_id) {
        return CallProvider.call({
            actionName: "sg_DeleteStrategyGroupAction.do",
            reqData: {
                sdstrategy_id : strategy_id
            }
        });
    };
    //查看策略组
    this.viewSingleStrategyGroup = function(strategy_id) {
        return CallProvider.call({
            actionName: "sg_ViewStrategyAction.do",
            reqData: {
                sdstrategy_id : strategy_id
            }
        });
    };
    //查询策略组流程
    this.getFlowListByStrategyId = function(params) {
        return CallProvider.call({
            actionName: "sg_PageFlowInStrategyGroupAction.do",
            reqData: {
                start_recd: params.offset,
                limit_recd: params.limit,
                sdstrategy_id : params.sdstrategy_id
            }
        });
    };

}]);

//调度任务监控-独立模块
DispatchSrv.service('DispatchTaskMonitor', ["CallProvider", "CommData", "$location", "$cookieStore", "CV", function(CallProvider, CommData, $location, $cookieStore, CV) {
    var userName = $location.absUrl().substring($location.absUrl().indexOf("?")+1);
    var login_data = $cookieStore.get(userName + '_data');
    var _comdata = login_data ? login_data.cp : CommData;
    var reqdata = {
        'org_user_id'    : _comdata.org_user_id,
        'org_dept_id'    : _comdata.org_dept_id,
        'orguser_cn_name': _comdata.orguser_cn_name,
        'orgdept_cn_name': _comdata.orgdept_cn_name,
        'org_term_no'    : _comdata.org_term_no
    };
    //获取任务统计信息
    this.getTaskStatisticsInfo = function (){
        return CallProvider.call({
            actionName: "tk_MonitorStatisticsAction.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode('')
            })
        });
    };
    //根据操作类型获取任务基本信息
    this.getTaskBasicInfoByOptype = function (op_type){
        return CallProvider.call({
            actionName: "tk_QueryAllTaskAction.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode(''),
                'sdmonitor_type'    : op_type
            })
        });
    };
    //查看任务运行信息
    this.runingInfo =function (query_type) {
        return CallProvider.call({
            actionName: "ct_MonitorRunningMsgAction.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode(''),
                'query_type':query_type
            })
        });
    };
    //干预任务
    this.meddleTask =function (task_id,meddle_type) {
        return CallProvider.call({
            actionName: "tk_MeddleSdTaskAction.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode(''),
                task_id : task_id,
                meddle_type : meddle_type
            })
        });
    };
    //干预作业
    this.meddleJob =function (task_id,meddle_type,job_id_list) {
        return CallProvider.call({
            actionName: "tk_MeddleSdJobAction.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode(''),
                task_id : task_id,
                meddle_type : meddle_type,
                job_id_list : job_id_list
            })
        });
    };
    //获取所有节点基本信息
    this.gatAllNodeBasicInfo = function (key_word){
        return CallProvider.call({
            actionName: "tk_QueryAllNodeMsgAction.do",
            reqData:angular.extend(reqdata,{
                'org_rs_code': CV.rscode(''),
                'key_word'   : key_word
            })
        });
    };
    //监控所有节点硬件使用情况
    this.monitorAllNodeUsedInfo = function (key_word){
        return CallProvider.call({
            actionName: "tk_MonitorAllNodeHardAction.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode(''),
                'key_word'   : key_word
            })
        });
    };
    //监控单个节点系统信息
    this.monitorOneNodeSysInfo = function (node_ip){
        return CallProvider.call({
            actionName: "tk_MonitorSingleNodeSysInfoAction.do",
            reqData: angular.extend(reqdata, {
                'org_rs_code': CV.rscode(''),
                'node_ip': node_ip
            })
        });
    };
    //监控单个节点进程信息
    this.monitorOneNodeProgressInfo = function (node_ip){
        return CallProvider.call({
            actionName: "tk_MonitorSingleNodeProcessAction.do",
            reqData: angular.extend(reqdata, {
                'org_rs_code': CV.rscode(''),
                'node_ip': node_ip
            })
        });
    };
    //根据关键字搜索任务或节点
    this.searchByKeywords = function (keywords){
        return CallProvider.call({
            actionName: "tk_MonitorStatisticsAction.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode(''),
                'keywords': keywords
            })
        });
    };
}]);