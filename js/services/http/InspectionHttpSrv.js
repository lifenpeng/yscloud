'use strict';
/**
 * 自动巡检 HTTP 服务模块
 */
var InspectionHttp = angular.module('InspectionHttpSrv', []);
//系统巡检-信息采集
InspectionHttp.service('Collection', ["CallProvider", "CV", function(CallProvider, CV) {
    //根据关键字查询方案列表分页
    this.pageInspectProgramList = function(params) {
        return CallProvider.call({
            actionName: "co_PageCoProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'key_word': params.key_word,
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit
            }
        });
    };
    //分页查询运行中任务列表
    this.pageRunTaskList = function(params) {
        return CallProvider.call({
            actionName: "co_PageRunningTaskListAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'key_word': params.key_word,
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit
            }
        });
    };
    //分页查询自动任务列表
    this.pageAutomaticList = function(params) {
        return CallProvider.call({
            actionName: "co_PageAutoTaskListAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'key_word': params.key_word,
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit
            }
        });
    };
    //删除采集方案
    this.deleteSingleCollectProgram = function(prog_id) {
        return CallProvider.call({
            actionName: "co_DeleteCoProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                prog_id: prog_id
            }
        });
    }
    //根据业务系统获取方案列表
    this.getProgramListByBusiSys = function(business_sys_name) {
        return CallProvider.call({
            actionName: "co_ViewCoProgramActionqueryPublishProgList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                business_sys_name: business_sys_name
            }
        });
    }
    //根据方案id获得方案信息
    this.getProgramInfoByProgId = function(prog_id) {
        return CallProvider.call({
            actionName: "co_ViewCoTaskActiongetCoTaskBeanByProgId.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                prog_id: prog_id
            }
        });
    }
    //根据组件获得该组件所有部署的节点
    this.getNodesByCmptId = function(business_sys_name, module_id) {
        return CallProvider.call({
            actionName: "co_ViewNodeModuleActiongetCompDisposeNode.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                business_sys_name: business_sys_name,
                module_id: module_id
            }
        });
    }
    //自动采集任务执行
    this.newAutoCjTask = function(_task_cn_name, _task_bk_desc, _prog_id, _business_sys_name, bean) {
        return CallProvider.call({
            actionName: "co_CreateAutoTaskAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                task_cn_name: _task_cn_name,
                task_bk_desc: _task_bk_desc,
                prog_id: _prog_id,
                business_sys_name: _business_sys_name,
                bean: bean
            }
        });
    }
    //通过节点得到初始化路径
    this.getInitpath=function(node_name){
        return CallProvider.call({
            actionName: "co_ViewCoTaskActiongetInitPath.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                node_name: node_name,
            }
        });
    }
    //新增采集方案
    this.addCollectProg = function(collect_prog_info) {
        collect_prog_info.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "co_AddCoProgramAction.do",
            reqData: collect_prog_info
        });
    };
    //修改采集方案
    this.editCollectProg = function(collect_prog_info) {
        collect_prog_info.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "co_EditCoProgramAction.do",
            reqData: collect_prog_info
        });
    };
    //新增采集方案--新增采集项
    this.addCollectItem = function(prog_id, prog_cn_name, prog_bk_desc, business_sys_name, is_parallel, collect_item) {
        return CallProvider.call({
            actionName: "co_AddCoItemAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'prog_id': prog_id,
                'prog_cn_name': prog_cn_name,
                'prog_bk_desc': prog_bk_desc,
                'business_sys_name': business_sys_name,
                'is_parallel': is_parallel,
                'collect_item': collect_item
            }
        });
    };
    //新增采集方案--修改采集项
    this.updateCollectItem = function(prog_id, seq, collect_item) {
        return CallProvider.call({
            actionName: "co_UpdateCoItemAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'prog_id': prog_id,
                'seq': seq,
                'collect_item': collect_item
            }
        });
    };
    //新增采集方案--删除采集项
    this.deleteCollectItem = function(prog_id, seq, collect_item) {
        return CallProvider.call({
            actionName: "co_DeleteCoItemAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'prog_id': prog_id,
                'seq': seq,
                'collect_item': collect_item
            }
        });
    };
    //新增采集方案--获取采集组件信息列表
    this.getCollectItemList = function(business_sys_name) {
        return CallProvider.call({
            actionName: "co_ViewCoProgramActionqueryCollectComps.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                business_sys_name: business_sys_name,
            }
        });
    };
    //查看采集方案信息
    this.getCollectProgDetail = function(prog_id) {
        return CallProvider.call({
            actionName: "co_ViewCoProgramActiongetCoProgramDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'prog_id': prog_id
            }
        });
    };
    //查看任务信息
    this.getCoTaskDetail = function(work_id) {
        return CallProvider.call({
            actionName: "co_ViewCoTaskActiongetCoTaskDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'work_id': work_id
            }
        });
    };
    //发布方案
    this.PublishCoProgram = function(prog_id) {
        return CallProvider.call({
            actionName: "co_PublishCoProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'prog_id': prog_id
            }
        });
    };
    //得到文件列表
    this.getFileList=function(node_name,relative_path){
        return CallProvider.call({
            actionName: "co_ViewCoTaskActionshowDirectory.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name'  : node_name,
                'root_bk_dir':relative_path
            }
        });
    };
    //通过数据源名字得到文件列表
    this.getFileListBySoc=function(soc_name,root_bk_dir,node_ip,exec_user){
        return CallProvider.call({
            actionName: "bs_ShowVersionDirectoryAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'soc_name'  : soc_name,
                'root_bk_dir':root_bk_dir,
                'ip':node_ip,
                'exec_user':exec_user
            }
        });
    };
    //关闭-任务信息
    this.closeTask = function(work_id) {
        return CallProvider.call({
            actionName: "co_CloseTaskAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'work_id': work_id
            }
        });
    };
    //删除-任务信息
    this.deleteTask = function(work_id) {
        return CallProvider.call({
            actionName: "co_DeleteTaskAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'work_id': work_id
            }
        });
    };
    //监控获取采集项信息
    this.getCollectItemInfoByWorkId = function(work_id){
        return CallProvider.call({
            actionName: "co_ViewCoTaskActionmonitorBody.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'work_id': work_id
            }
        });
    }
    //监控获取数据文件信息
    this.getDataFileInfoByWorkId = function(work_id){
        return CallProvider.call({
            actionName: "co_ViewCoTaskActionmonitorTail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'work_id': work_id
            }
        });
    }
    //停止采集任务
    this.closeCollectTask = function(work_id){
        return CallProvider.call({
            actionName: "co_CloseTaskAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'work_id': work_id
            }
        });
    }
    //停止节点下的全部采集组件
    this.closeAllCollectCmptByNode = function(work_id,node_name){
        return CallProvider.call({
            actionName: "co_CloseTaskByNodeAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'work_id': work_id,
                'node_name':node_name
            }
        });
    }
    //停止节点下的单个采集组件
    this.closeSingleCollectCmptByModule = function(work_id,node_name,module_id){
        return CallProvider.call({
            actionName: "co_CloseSingleModuleAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'work_id': work_id,
                'node_name':node_name,
                'module_id':module_id
            }
        });
    }
    //数据文件下载全部
    this.downLoadAllDataFile = function(_work_id){
        return CallProvider.call({
            actionName: "co_DownloadCollectFilesAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'work_id': _work_id,
            }
        });
    }
}]);
//系统巡检-自动巡检
InspectionHttp.service('Inspection', ["CallProvider","CommData" ,"CV", function(CallProvider,CommData ,CV) {

    /*指标模型-报告模板*/
    //报告模板列表
    this.getAllReportMould = function() {
        return CallProvider.call({
            actionName: "rp_ViewReportMouldActiongetAllReportMould.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //新增报告模板
    this.addReportMould = function(report_base_message) {
        return CallProvider.call({
            actionName: "rp_AddReportMouldAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                chapter_list:report_base_message.chapter_list,
                model_list:report_base_message.model_list,
                report_template_bk_desc:report_base_message.report_template_bk_desc,
                report_template_cn_name:report_base_message.report_template_cn_name,
                report_template_name:report_base_message.report_template_name,
                save:report_base_message.save
            }
        });
    };
    //删除报告模板
    this.deleteReportMould = function(report_template_name) {
        return CallProvider.call({
            actionName: "rp_DeleteReportMouldAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                report_template_name:report_template_name
            }
        });
    };
    //修改报告模板
    this.modifyReportMould=function(report_base_message){
        return CallProvider.call({
            actionName: "rp_UpdateReportMouldAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                chapter_list:report_base_message.chapter_list,
                model_list:report_base_message.model_list,
                report_template_bk_desc:report_base_message.report_template_bk_desc,
                report_template_cn_name:report_base_message.report_template_cn_name,
                report_template_name:report_base_message.report_template_name,
                save:report_base_message.save
            }
        });
    };
    //查看报告模板详情
    this.viewReportDetail=function(report_template_name){
        return CallProvider.call({
            actionName: "rp_ViewReportMouldActiongetReportMouldDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                report_template_name:report_template_name
            }
        });
    };
    //查询报表定义表-得到所有的对应的图标
    this.getAllIndexModel = function(model_list) {
        return CallProvider.call({
            actionName: "rp_ViewReportMouldActiongetAllIndiModel.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                model_list:model_list
            }
        });
    };
    //获得解析文件列表(00)需要确认
    this.getScriptTaskFile = function() {
        return CallProvider.call({
            actionName: "in_ViewModelActiongetScriptTaskFile.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //导出PDF
    this.exportIndiPDF = function(url, indi_task_id, paper_size) {
        return CallProvider.call({
            actionName: "cm_IndiExportPDFActiongetReportJson.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'url': url,
                'indi_task_id': indi_task_id,
                'paper_size': paper_size,
            }
        });
    };
    //根据巡检任务编号获取报告数据
    this.getReportDataById = function(indi_task_id) {
        return CallProvider.call({
            actionName: 'in2_ViewModelActiongetReportJson.do',
            reqData: {
                'org_rs_code': CV.rscode(''),
                'indi_task_id': indi_task_id,
            }
        });
    };
    //验证生成报告文件唯一性(00)被注释掉
    this.validReportFile = function(file_path) {
        return CallProvider.call({
            actionName: "rp_ViewInTaskActioncheckLocalFile.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'file_path': file_path
            }
        });
    };
  /*  //根据报告编号获取报告数据（00）被注释掉
    this.getReportDataById = function(report_id) {
        return CallProvider.call({
            actionName: 'rp_ViewInTaskActiongetReportJson.do',
            reqData: {
                'org_rs_code': CV.rscode(''),
                'report_id': report_id
            }
        });
    };*/


    //根据指标模型获取图表列表
    this.getChartListByModelList = function(model_list) {
        return CallProvider.call({
            actionName: "rp_ViewReportMouldActiongetIndiModelNodeList.do",
            reqData: {
                model_list: model_list
            }
        });
    };
    //查看巡检任务（00）被注释掉，应该有用
    this.getXjtaskDetail = function(work_id) {
        return CallProvider.call({
            actionName: "rp_ViewInTaskActiongetInTaskDetail.do",
            reqData: {
                'work_id': work_id
            }
        });
    };
    //巡检任务列表
    this.inTaskList = function(params) {
        return CallProvider.call({
            actionName: "in2_PageInTaskAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'key_word': params.key_word,
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit
            }
        });
    };
    //巡检任务-删除任务
    this.deleteIntask = function(work_id) {
        return CallProvider.call({
            actionName: "in2_DeleteIndiTaskAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                work_id: work_id,
            }
        });
    };
    //自动巡检-巡检报告列表
    this.pageTaskReportList = function(params) {
        return CallProvider.call({
            actionName: "in2_PageIndiTaskReportAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'key_word': params.key_word,
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit
            }
        });
    };
    //自动巡检-删除巡检报告
    this.deleteTaskReport = function(report_id) {
        return CallProvider.call({
            actionName: "in2_DeleteIndiTaskReportAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                indi_pdf_id: report_id
            }
        });
    };



    /*自动巡检任务修改后服务*/
    //保存巡检任务基本信息
    this.saveXjTaskBasicInfo = function (task_basic_info) {
        return CallProvider.call({
            actionName: "in2_AddInTaskAction.do",
            reqData: task_basic_info
        });
    };

    //获得采集任务列表
    this.getCotTaskList = function() {
        return CallProvider.call({
            actionName: "in2_ViewModelActiongetCotTaskList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //根据文件格式获得文件列表
    this.getFileListByFileType = function(file_type, task_no) {
        return CallProvider.call({
            actionName: "in2_ViewModelActiongetFileListByFileType.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                file_type: file_type,
                task_no: task_no
            }
        });
    };
    //导入配置信息
    this.importXJConfigInfo = function (_task_id,taskImportBean) {
        return CallProvider.call({
            actionName: "in2_IndiTaskImportAction.do",
            reqData:{
                indi_task_id:_task_id,
                taskImportBean:taskImportBean
            }
        });
    };
    //自动巡检-监控导入
    this.watchXJImportInfo = function(monitor_list){
        return CallProvider.call({
            actionName: "in2_IndiTaskImportMonitorAction.do",
            reqData:{
                monitor_list : monitor_list,
            }
        });
    };
    //自动巡检-查看导入历史
    this.viewXJImportHis = function(indi_task_id,indi_model_name,indi_node_name){
        return CallProvider.call({
            actionName: "in2_IndiTaskImportHistoryAction.do",
            reqData:{
                indi_task_id : indi_task_id,
                indi_model_name : indi_model_name,
                indi_node_name : indi_node_name
            }
        });
    };
    //自动巡检-获取文件上传路径
    this.getUploadFilePath = function(){
        return CallProvider.call({
            actionName: "in2_ViewModelActiongetFilePath.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //自动巡检-下一步(执行)
    this.executeNextStep = function (_indi_task_id) {
        return CallProvider.call({
            actionName: "im_ExecuteIndiModelAction.do",
            reqData:{
                indi_task_id : _indi_task_id
            }
        });
    };
    //自动巡检-第二步--根据指标模型获取对应的报告模板
    this.getReportTemplateByModel = function (indimodel_list) {
        return CallProvider.call({
            actionName: "rp_ViewReportMouldActiongetReportMouldList.do",
            reqData:{
                indimodel_list : indimodel_list
            }
        });
    };
    //自动巡检-第二步--根据报告模板预览图表信息
    this.viewReportTemplateInfo = function (business_sys_name,report_name,indi_task_id) {
        return CallProvider.call({
            actionName: "in2_QueryReportDataAction.do",
            reqData:{
                business_sys_name : business_sys_name,
                report_name : report_name,
                indi_task_id : indi_task_id
            }
        });
    };
    //自动巡检-第二步--保存单个图表信息
    this.saveSingleChartInfo = function (indi_task_id,report_list,report_name) {
        return CallProvider.call({
            actionName: "in2_SaveReportDataAction.do",
            reqData:{
                indi_task_id : indi_task_id,
                report_list : report_list,
                report_name : report_name,
            }
        });
    };

    /*自动巡检指标模型服务*/
    //获取所有指标模型列表
    this.getAllIndiList = function() {
        return CallProvider.call({
            actionName: "im_QueryAllIndiModelAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //查看单个指标模型基本信息
    this.getSingleIndiDetail = function(model_name) {
        return CallProvider.call({
            actionName: "im_GetIndiModelAction.do",
            reqData: {
                'model_name': model_name
            }
        });
    };
    //保存指标模型基本信息
    this.saveIndiBasicInfo = function(model_name, model_cn_name, desc) {
        return CallProvider.call({
            actionName: "im_SaveIndiModelAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'model_name': model_name,
                'model_cn_name': model_cn_name,
                'desc': desc,
            }
        });
    };
    //保存指标模型所有信息
    this.saveIndiAllInfo = function(indi_model_info) {
        indi_model_info.org_rs_code = CV.rscode('');
        return CallProvider.call({
            actionName: "im_SaveIndiModelNodeAction.do",
            reqData: indi_model_info
        });
    };
    //删除单个指标模型
    this.deleteSingleIndiModel = function (model_name) {
        return CallProvider.call({
            actionName: "im_DeleteIndiModelAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'model_name': model_name,
            }
        });
    };
    //发布单个指标模型
    this.publishSingleIndiModel = function (model_name) {
        return CallProvider.call({
            actionName: "im_PublishIndiModelAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'model_name': model_name,
            }
        });
    };
    //new查看巡检任务
    this.getXjtaskDetailInfo = function(indi_task_id) {
        return CallProvider.call({
            actionName: "in2_IndiTaskImportMsgAction.do",
            reqData: {
                'indi_task_id': indi_task_id
            }
        });
    };


}]);
//日志巡检
InspectionHttp.service('LogXJ', ["CallProvider","CV", function(CallProvider,CV) {
    //获取节点列表
    this.getAllNodesList = function() {
        return CallProvider.call({
            actionName: "bs_ViewNodeActiongetAllBsNode.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //根据节点获取数据源列表
    this.getSocListByNode = function(node_name){
        return CallProvider.call({
            actionName: "bs_ViewNodeActiongetAllSocWithNodeName.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name': node_name,
            }
        });
    }
    //根据数据源获取文件列表
    this.getFileListBySoc = function(node_name,download_soc_name,root_bk_dir){
        return CallProvider.call({
            actionName: "bs_ViewNodeActionshowNodeDirectory.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name': node_name,
                'download_soc_name':download_soc_name,
                'root_bk_dir':root_bk_dir
            }
        });
    }
    //获取指定log文件的信息
    this.getLogInfo = function(xj_info){
        return CallProvider.call({
            actionName: "bs_ReadNodeConfigFileAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name': xj_info.node_name,
                'download_soc_name':xj_info.download_soc_name,
                'relative_path':xj_info.node.full_path,
                'encoding':'GBK',
                'search_key':xj_info.search_key,
                'search_num':xj_info.search_num
            },
            timeout: 300
        });
    }

    //日志归档_获取日志文件
    this.getLogFile = function(sys_name,date){
        return CallProvider.call({
            actionName: "lg_ViewOpLogActionqueryLogFileList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name': sys_name,
                'date':date
            }
        });
    }
    //日志归档-根据iP获取归档路径
    this.getArchivePath = function(soc_ip){
        return CallProvider.call({
            actionName: "dt_ViewDtActionqueryFTPSocListByIp.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'soc_ip': soc_ip,
            }
        });
    }
    //日志归档-归档
    this.archiveLog = function(log_file_list,soc_name,archive_path){
        return CallProvider.call({
            actionName: "lg_ArchiveLogAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'log_file_list': log_file_list,
                'soc_name':soc_name,
                'archive_path':archive_path
            }
        });
    };





    //new-log
    this.getLogId=function(){
        return CallProvider.call({
            actionName: "rz_OpenQuerySession.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //日志巡检-日志分析-分析图表
    this.analysisKeyToChart=function(analysis_info){
        return CallProvider.call({
            actionName: "rz_AnalysisKeyword.do",
            reqData:analysis_info
        });
    }
    //分页查询功能
    //分页查询功能
    this.getLogBypage=function(log_info){
        return CallProvider.call({
            actionName: "rz_OnlineAnalyzePageLog.do",
            reqData:{
                'org_rs_code': CV.rscode(''),
                'sid':log_info.sid,
                'offset':log_info.offset==0 ?  log_info.offset : log_info.offset-1,
                'size':log_info.size,
                'sys_name':log_info.sys_name,
                'log_name':log_info.log_name,
                'begin_date':log_info.start_date,
                'end_date':log_info.end_date,
                'node_name':log_info.node_name,
                'node_index':log_info.node_index,
                'file_index':log_info.file_index,
                'start_time':log_info.start_time,
                'end_time':log_info.end_time,
                'keywords':log_info.keywords,
                'context_line':log_info.context_line,
                'timestamp_exp':log_info.timestamp_exp,
                'server_flag':log_info.server_flag
            },
            timeout: 300
        });
    };
    //删除分析的文件
    this.deleteLogAnalysisFile=function(){
        return CallProvider.call({
            actionName: "rz_DeleteLogAnalysisOldFile.do",
            reqData: {

            }
        });
    }
    //日志巡检-提交巡检内容-得到图标
    this.getInspectContent=function(inspect_info){
        return CallProvider.call({
            actionName: "rz_AddLogReport.do",
            reqData: inspect_info
        });
    }
    //日志巡检-通过报告名得到图标
    this.getReportChartByName=function(report_name){
        return CallProvider.call({
            actionName: "rz_ViewLogActiongetReportChartMsg.do",
            reqData: {
                report_name:report_name
            }
        });
    }
    //日志巡检-生成pdf
    this.getInspectPdf=function(report_name,report_url,paper_size){
        return CallProvider.call({
            actionName: "rz_LogExportPdfActiongetLogPdf.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'report_name': report_name,
                'report_url':report_url,
                'paper_size':paper_size
            }
        });
    };
    //日志巡检报告-删除报告
    this.deleteReportByName=function(report_name,log_id){
        return CallProvider.call({
            actionName: "rz_DeleteLogReport.do",
            reqData: {
                report_name:report_name,
                log_id:log_id
            }
        });
    }
    //日志提取-日志提取表格
    this.savePickTogetFileList=function(pick_info){
        return CallProvider.call({
            actionName: "rz_QueryLogFileList.do",
            reqData:pick_info
        });
    }
    //日志提取-日志提取submti
    this.combinePickLog=function(logSyncinfos){
        return CallProvider.call({
            actionName: "rz_CombineLogFile.do",
            reqData:{
                logSyncinfos:logSyncinfos
            },
            timeout: 300
        });
    }
    //日志巡检-日志分析-得到所有的节点（带路径）
    this.getAllNodeListBySys=function(sys_name){
        return CallProvider.call({
            actionName: "rz_ViewLogActionqueryConfigList.do",
            reqData:{
                sys_name:sys_name
            }
        });
    };
    //日志巡检-日志分析-在线分析文件下载服务
    this.getAnalysisByNodeFiles=function(node_file){
        return CallProvider.call({
            actionName: "rz_OnlineScreenFile.do",
            reqData:{
                sys_name:node_file.sys_name,
                node_name:node_file.node_name,
                file:node_file.file,
                encoding:node_file.encoding,
                start_time:node_file.start_time,
                end_time:node_file.end_time,
                key_word:node_file.keywords,
                lines:node_file.lines,
                node_ip:node_file.node_ip,
                finish_time:node_file.finish_time,
                timestamp:node_file.timestamp
            },
            timeout: 1200,
        });
    };
    //下载前查询服务
    this.OnlineScreen=function(node_file){
        return CallProvider.call({
            actionName: "rz_OnlineAnalyzsisDownloadFile.do",
            reqData:{
                sys_name:node_file.sys_name,
                node_name:node_file.node_name,
                file:node_file.file,
                encoding:node_file.encoding,
                start_time:node_file.start_time,
                end_time:node_file.end_time,
                key_word:node_file.keywords,
                lines:node_file.lines,
                node_ip:node_file.node_ip,
                finish_time:node_file.finish_time,
                timestamp:node_file.timestamp,
                local_path:node_file.local_path,
                remote_path:node_file.remote_path
            },
            timeout: 300,
        });
    };
    //查询下载结果
    this.getDownDynamic=function(sid){
        return CallProvider.call({
            actionName: "rz_OnlineAnalyzeQueryDownload.do",
            reqData:{
                sid:sid,
            }
        });
    };
    //通过报告名得到报告信息
    this.getReportMessage=function(report_name){
        return CallProvider.call({
            actionName: "rz_ViewReportActiongetReportByRepName.do",
            reqData:{
                report_name:report_name,
            }
        });
    }
}]);
//日志监控
InspectionHttp.service('LogMonitor', ["CallProvider","$location", "$cookieStore","CommData", "CV", function(CallProvider,$location, $cookieStore, CommData, CV) {
    var userName = $location.absUrl().substring($location.absUrl().indexOf("=")+1);
    var realName=userName.substring(0,userName.indexOf("&"));
    console.log(realName);
    var login_data = $cookieStore.get(realName + '_data');
    var _comdata = login_data ? login_data.cp : CommData;
    console.log(_comdata)
    var reqdata = {
        'org_user_id'    : _comdata.org_user_id,
        'org_dept_id'    : _comdata.org_dept_id,
        'orguser_cn_name': _comdata.orguser_cn_name,
        'orgdept_cn_name': _comdata.orgdept_cn_name,
        'org_term_no'    : _comdata.org_term_no
    };
    //日志查询-其他页面
    this.getLogMonitorBypage=function(log_info){
        return CallProvider.call({
            actionName: "rz_OnlineAnalyzePageLog.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode(''),
                'sid':log_info.sid,
                'offset':log_info.offset==0 ?  log_info.offset : log_info.offset-1,
                'size':log_info.size,
                'sys_name':log_info.sys_name,
                'log_name':log_info.log_name,
                'begin_date':log_info.start_date,
                'end_date':log_info.end_date,
                'node_name':log_info.node_name,
                'node_index':log_info.node_index,
                'file_index':log_info.file_index,
                'start_time':log_info.start_time,
                'end_time':log_info.end_time,
                'keywords':log_info.keywords,
                'context_line':log_info.context_line,
                'timestamp_exp':log_info.timestamp_exp,
                'server_flag':log_info.server_flag
            })
        });
    };
}]);
