'use strict';
/**
 * 公共管理 HTTP 服务模块
 */
var CommHttp = angular.module('CommHttpSrv', []);
//用户服务
CommHttp.service('User', ["CallProvider", function(CallProvider) {
    //用户登陆
    this.login = function(user) {
        return CallProvider.call({
            actionName: "us_UserLoginInAction.do",
            reqData: {
                org_user_id: user.username,
                user_passwd: user.password,
                org_channel_code: '01'
            }
        });
    };
    //获取页面权限1.进入主页后，调用
    this.getPermission = function(bl_rs_code) {
        return CallProvider.call({
            actionName: "us_QueryRsPrivAction.do",
            reqData: {
                bl_rs_code: bl_rs_code
            }
        });
    };
    //客户信息
    this.getLicense = function(bl_rs_code) {
        return CallProvider.call({
            actionName: "cm_ViewLicenseActionloadLicense.do",
            reqData: {
                'submit_type': 1
            }
        });
    };
    //注册CorsLares
    this.registLicense = function(bl_rs_code) {
        return CallProvider.call({
            actionName: "cm_RegistLicenseAction.do",
            reqData: bl_rs_code
        });
    };
    //查询可执行发布用户列表
    this.getAllUserCanExec = function() {
        return CallProvider.call({
            actionName: "us_ViewUsforAppActiongetDeptUserListForWeb.do",
            reqData: {}
        });
    };
    //根据用户名获取用户信息 1.个人信息
    this.getUserByUserId = function(user_id) {
        return CallProvider.call({
            actionName: "us_QueryUserByUserIdAction.do",
            reqData: {
                user_id: user_id
            }
        });
    };
    //提交密码修改页面 1.修改密码
    this.UpdatePwd = function(pwd_info) {
        return CallProvider.call({
            actionName: "us_UpdatePwdAction.do",
            reqData: pwd_info
        })
    };
    //提交用户信息修改页面1.用户个人信息修改
    this.us_UpdateUserAction = function(user_info) {
        return CallProvider.call({
            actionName: "us_UpdateUserAction.do",
            reqData: {
                user_id       : user_info.user_name,
                user_cn_name  : user_info.user_cn_name,
                teller_no     : user_info.teller_no,
                email_add     : user_info.user_email,
                phone_no      : user_info.phone_number,
                pwdexp_bk_date: user_info.pwd_expiry_date,
                user_type     : user_info.user_type,
                bl_dept_id    : user_info.user_department,
                first_dept_id : user_info.parttime_department,
                dprl_cn_name  : user_info.department_role,
            }
        })
    };
    //通讯录 1.通讯录列表
    this.getContactsListByUserName = function(start_recd, limit_recd, user_cn_name) {
        return CallProvider.call({
            actionName: "us_PageExtUserListAction.do",
            reqData: {
                start_recd: start_recd,
                limit_recd: limit_recd,
                user_cn_name: user_cn_name
            }
        });
    };
    //查询常用联系人
    this.getCommonlyUsedConcats = function() {
        return CallProvider.call({
            actionName: "us_QueryUserContactAction.do",
            reqData: {}
        });
    };
    //新增关注联系人
    this.addAttentionContacts = function(contact_user_id) {
        return CallProvider.call({
            actionName: "us_AddUserContactAction.do",
            reqData: {
                contact_user_id: contact_user_id
            }
        });
    };
    //删除关注联系人
    this.removeAttentionContacts = function(contact_user_id) {
        return CallProvider.call({
            actionName: "us_DeleteUserContactAction.do",
            reqData: {
                contact_user_id: contact_user_id
            }
        });
    };
    //查询用户一级导航权限 1.index.js 2.login.js
    this.us_QueryFirstNavigagePrivAction = function() {
        return CallProvider.call({
            actionName: "us_QueryFirstNavigagePrivAction.do",
            reqData: {}
        });
    };
}]);
//消息服务
CommHttp.service('Message', ["CallProvider", function(CallProvider) {
    //未读消息列表1. 查询消息(名字相同)
    this.mg_PageMessageAction = function(rc_flag, start_recd, limit_recd) {
        return CallProvider.call({
            actionName: "mg_PageMessageAction.do",
            reqData: {
                rc_flag: rc_flag,
                start_recd: start_recd,
                limit_recd: limit_recd
            }
        });
    };
    //未读消息分页查看 1.消息列表（名字相同）
    this.mg_PageMessageActionPg = function(params) {
        return CallProvider.call({
            actionName: "mg_PageMessageAction.do",
            reqData: {
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'desc' ? '1' : '2')
            }
        })
    };
    //查询消息详细信息1.消息列表-查看
    this.getmessageDetail = function(work_seq) {
        return CallProvider.call({
            actionName: "mg_QueryMsgInfoAction.do",
            reqData: {
                workseq: work_seq
            }
        });
    };
    //删除消息1.消息列表-删除
    this.deleteOneMessage = function(work_seq, msg_title) {
        return CallProvider.call({
            actionName: "mg_DeleteRcMess.do",
            reqData: {
                workseq: work_seq
            }
        });
    };
}]);
//任务服务
CommHttp.service('Task',["CallProvider", "CV",function(CallProvider,CV){
    //查詢未处理的任务列表
    this.getUnhandleTaskList = function(start_recd, limit_recd) {
        return CallProvider.call({
            actionName: "wk_PageUnhandleWorkAction.do",
            reqData: {
                start_recd: start_recd,
                limit_recd: limit_recd
            }
        });
    };
    //历史任务---提交历史 1.任务列表
    this.wk_PageMineHistoryWorkAction = function(params) {
        return CallProvider.call({
            actionName: "wk_PageMineHistoryWorkAction.do",
            reqData: {
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'desc' ? '1' : '2')
            }
        });
    };
    //历史人物---复核历史 1.任务列表
    this.wk_PageMineHistoryUncheckAction = function(params) {
        return CallProvider.call({
            actionName: "wk_PageMineHistoryUncheckAction.do",
            reqData: {
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'desc' ? '1' : '2')
            }
        });
    };
    //历史人物---授权历史 1.任务列表
    this.wk_PageMineHistoryUnauthAction = function(params) {
        return CallProvider.call({
            actionName: "wk_PageMineHistoryUnauthAction.do",
            reqData: {
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'desc' ? '1' : '2')
            }
        });
    };
    //查询未处理任务数
    this.getUnhandleTaskCount = function() {
        return CallProvider.call({
            actionName: 'wk_ViewWorkActionqueryExecutoryWorkByUserId.do',
            reqData: {}
        });
    };
    //查询任务详细信息
    this.getTaskDetail = function(wrk_seq) {
        return CallProvider.call({
            actionName: 'wk_QueryWorkDetailAction.do',
            reqData: {
                'wrk_seq': wrk_seq
            }
        });
    };
    //我的任务 1.我的任务
    this.wk_QueryMineWorkListAction = function(){
        return CallProvider.call({
            actionName: "wk_QueryMineWorkListAction.do",
            reqData: {}
        });
    }
    //复核任务1.复核任务
    this.wk_QueryMineUncheckWorkAction = function(){
        return CallProvider.call({
            actionName:"wk_QueryMineUncheckWorkAction.do",
            reqData:{}
        });
    }
    //授权任务 1.我的任务
    this.wk_QueryMineUnauthWorkAction = function(){
        return CallProvider.call({
            actionName:"wk_QueryMineUnauthWorkAction.do",
            reqData:{}
        });
    }
    //故障单任务 分页
    this.wk_QueryTroubleTicketWorkAction = function(params){
        return CallProvider.call({
            actionName  : "pg_PagePgAuthWorkAction.do",
            reqData     : {
                'org_rs_code'       : CV.rscode(''),
                'start_recd'        : params.data.offset,
                'limit_recd'        : params.data.limit,
                'status_list'       :params.status_list
            }
        });
    }
    //查询用户一级导航权限
    //任务-本地授权1.本地授权
    this.LocalAuthTask = function(param) {
        return CallProvider.call({
            actionName: "wk_CheckLocalAuthAction.do",
            reqData: param
        });
    }
    //任务-复核1.任务审阅
    this.CheckPendTask = function(param) {
        return CallProvider.call({
            actionName: "wk_CheckPendWorkAction.do",
            reqData: param
        });
    };
    //任务-授权1.任务审阅
    this.AuthPendTask = function(param) {
        return CallProvider.call({
            actionName: "wk_AuthPendWorkAction.do",
            reqData: param
        });
    };
    //任务-执行1.任务审阅
    this.ExecuteTask = function(param, srvName) {
        return CallProvider.call({
            actionName: srvName + ".do",
            reqData: param,
            timeout:1800
        });
    }
    //任务-关闭1.任务审阅
    this.CloseTask = function(param) {
        return CallProvider.call({
            actionName: "wk_UpdateWkDealStateByKeyAction.do",
            reqData: param
        });
    };
    //查询方案授权任务明细
    this.getProgramAuthDetail = function(pg_work_seq) {
        return CallProvider.call({
            actionName: "pg_QueryPgWorkDetailAction.do",
            reqData: {
                'pg_work_seq':pg_work_seq
            }
        });
    };
    //方案授权
    this.authProgram = function(param){
        return CallProvider.call({
            actionName: "pg_AuthPgWorkAction.do",
            reqData: param
        });
    };
    //查看任务方案详细
    this.viewTaskProgramDetail = function(pg_work_seq){
        return CallProvider.call({
            actionName: "pg_ViewPgActionqueryPgWorkDetail.do",
            reqData: {
                'pg_work_seq':pg_work_seq
            }
        });
    };
    //查询借口附加信息
    this.getAccessoryInfo  = function(wrk_seq){
        return CallProvider.call({
            actionName  : 'wk_ViewWorkActionqueryExtraInfo.do',
            reqData     : {
                wrk_seq  :wrk_seq
            },

        });
    };
    //首页任务数获取
    this.getIndexTaskCount = function () {
        return CallProvider.call({
            actionName: 'pj_CountProjectOrderTaskAction.do',
            reqData: {}
        });
    };
}]);
//日志服务
CommHttp.service('LogSrv', ["$http", "CallProvider", "baseUrl", "Modal", "CV", function($http, CallProvider, baseUrl, Modal, CV) {
    //1.日志控制器,（红心按钮点击事件）
    this.lg_UpdateLogLabelAction = function(query_work_seq, log_label) {
        return CallProvider.call({
            actionName: "lg_UpdateLogLabelAction.do",
            reqData: {
                query_work_seq: query_work_seq,
                log_label: log_label
            }
        });
    };
    //1.查询日志分页列表
    this.getLogPageList = function(log_info) {
        return CallProvider.call({
            actionName: "lg_PageLogByDateAndLabelAction.do",
            reqData : log_info
        });
    };
    //1.下载日志
    this.downloadLog = function(start_bk_date, end_bk_date) {
        return CallProvider.call({
            actionName: "lg_DownloadLogAction.do",
            reqData: {
                start_bk_date: start_bk_date,
                end_bk_date: end_bk_date
            }
        });
    };
}]);
//业务系统服务
CommHttp.service('BusiSys', ["CallProvider", "CV", function(CallProvider, CV) {
    //查询所有业务系统(permission_flag验证责任人权限)
    this.getAllBusinessSys = function(permission_flag) {
        return CallProvider.call({
            actionName: "bs_ViewBsActiongetListAllBs.do",
            reqData: {
                'permission_flag':permission_flag,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    };
    //查询业务系统下有日志的
    this.getAllLogBysiness = function() {
        return CallProvider.call({
            actionName: "rz_ViewLogActionqueryLogSys.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    };
    //业务系统列表数据
    this.pageBusiSysTbl = function(params) {
        return CallProvider.call({
            actionName: "bs_PageBsSystemAction.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'desc' ? '1' : '2')
            }
        })
    };
    //获得单个业务系统
    this.getOneBusiSys = function(busiSysId) {
        return CallProvider.call({
            actionName: "bs_ViewBsActiongetBsSystem.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
                'business_sys_name': busiSysId
            }
        });
    };
    //新增业务系统
    this.saveOneBusiSys = function(BusiSys) {
        BusiSys.org_rs_code = CV.rscode('new_busi_sys');
        return CallProvider.call({
            actionName: "bs_AddBsSystemAction.do",
            reqData: BusiSys
        });
    };
    //修改业务系统
    this.updateOneBusiSys = function(BusiSys) {
        BusiSys.org_rs_code = CV.rscode('busi_sys_list');
        return CallProvider.call({
            actionName: "bs_UpdateBsSystemAction.do",
            reqData: BusiSys
        });
    };
    //删除业务系统
    this.deleteOneBusiSys = function(busiSysId) {
        return CallProvider.call({
            actionName: "bs_DeleteBsSystemAction.do",
            reqData: {
                'business_sys_name': busiSysId,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        });
    };
    //业务系统列表查看--查询关联项目列表
    this.projBusiSysTbl = function(params) {
        return CallProvider.call({
            actionName: "pj_PageRelatedProjAction.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'business_sys_name': params.business_sys_name,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'desc' ? '1' : '2')
            }
        })
    };
    //业务系统配置--方案发布（取消发布）
    this.publishScheme = function(prog_id, publish_state) {
        return CallProvider.call({
            actionName: "bs_PublishBsProgramAction.do",
            reqData: {
                'prog_id': prog_id,
                'publish_state': publish_state,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    };
    //业务系统配置--删除方案
    this.deleteScheme = function(prog_id) {
        return CallProvider.call({
            actionName: "bs_DeleteBsProgramAction.do",
            reqData: {
                'prog_id': prog_id,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    };
    //查看单个方案信息(废弃)
    this.getSingleProgData = function(prog_id) {
        return CallProvider.call({
            actionName: "bs_ViewBsProgramActionqueryBsProgInfo.do",
            reqData: {
                'prog_id': prog_id
            }
        });
    };
    //验证方案完整性
    this.validateProgComplete = function(prog_id) {
        return CallProvider.call({
            actionName: "bs_CheckBsProgramAction.do",
            reqData: {
                'prog_id': prog_id
            }
        })
    };
    //根据服务器和业务系统名获得数据源列表
    this.getSocListByIpAndBsys = function(business_sys_name, server_ip, impl_type) {
        return CallProvider.call({
            actionName: "bs_ViewDtSourceActionquerySoc.do",
            reqData: {
                'business_sys_name': business_sys_name,
                'soc_ip': server_ip,
                'impl_type': impl_type,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    };
    //查看节点配置信息
    this.ViewBsNodeConfigInfo = function (business_sys_name,node_name) {
        return CallProvider.call({
           // actionName: "bs_ViewBsNodeActiongetNodeBySysNameAndNodeName.do",
            actionName: "bs_ViewNodeActiongetNodeBySysNameAndNodeName.do",
            reqData: {
                node_name: node_name,
                business_sys_name: business_sys_name
            }
        })
    };
    //数据采集--组件部署
    this.startCollectCmptDeploy = function (business_sys_name,node_name,module_id,is_delete) {
        var _actionName = is_delete ? "co_DeleteDeployModuleAction.do" : 'co_DeployModuleAction.do';
        return CallProvider.call({
            actionName: _actionName,
            reqData: {
                'business_sys_name': business_sys_name,
                'node_name':node_name,
                'module_id': module_id,
                'org_rs_code': CV.rscode('busi_sys_list')
            },
            timeout: 120
        })
    };
    //数据采集--获得系统下对应节点部署组件信息
    this.cjGetAllDeployInfoBySysNameAndIp = function(business_sys_name,soc_ip) {
        return CallProvider.call({
            actionName: "co_ViewNodeModuleActiongetDeployMsgWithSysAndIp.do",
            reqData: {
                'business_sys_name': business_sys_name,
                'soc_ip': soc_ip,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    };
    //业务系统-方案列表(废弃)
    this.getProgrammeList = function(business_sys_name) {
        return CallProvider.call({
            actionName: "bs_ViewPublishProgramAction.do",
            reqData: {
                'business_sys_name': business_sys_name,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    };
    //业务系统-节点列表
    this.getNodelist=function(business_sys_name){
        return CallProvider.call({
            actionName: "bs_ViewNodeActiongetNodeMsg.do",
            reqData: {
                'business_sys_name': business_sys_name,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    }
    //业务系统 - 查看单个方案信息
    this.viewSingleProgramInfo = function (prog_id) {
        return CallProvider.call({
            actionName: "bs_ViewBsProgramActionqueryProgramInfo.do",
            reqData: {
                'prog_id': prog_id
            }
        })
    }
    //导出方案
    this.getProgExportPath = function (prog_id) {
        return CallProvider.call({
            actionName: "bs_ExportProgramAction.do",
            reqData: {
                'prog_id': prog_id
            }
        })
    }
    //业务系统--新增方案
    this.addProgram = function (program,business_sys_name) {
        return CallProvider.call({
            actionName: "bs_AddProgramAction.do",
            reqData: {
                'program': program,
                'business_sys_name': business_sys_name
            }
        });
    }
    //业务系统--修改方案
    this.updateProgram = function (program) {
        return CallProvider.call({
            actionName: "bs_UpdateProgramAction.do",
            reqData: {
                'program': program,
            },
        });
    }
    //业务系统--配置方案-获取合并参数
    this.getCombineParam = function(program,business_sys_name) {
        return CallProvider.call({
            actionName: "bs_ViewBsProgramActiongetCombineParam.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program': program,
                business_sys_name: business_sys_name
            }
        });
    };
    //业务系统--获取方案相应的方案列表
    this.getAllProgramList = function(business_sys_name,publish_state ,prog_type) {
        return CallProvider.call({
            actionName: "bs_ViewBsProgramActionqueryProgramListInBsi.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
                'business_sys_name': business_sys_name,
                'publish_state': publish_state,
                'prog_type': prog_type,

            }
        })
    };
    //业务系统-获得日志方案列表
    this.getAllLogList=function(sys_name,inspect_flag){
        return CallProvider.call({
            actionName: "rz_GetLogListBySysName.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name': sys_name,
                'inspect_flag':inspect_flag
            }
        })
    };
    //业务系统-检测日志是否存在
    this.checkLogName=function(sys_name,log_name){
        return CallProvider.call({
            actionName: "CheckLogNameValidAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name': sys_name,
                'log_name':log_name
            }
        })
    }
    //业务系统-判断日志名是否存在
    this.judgeLogNameIsExist=function(cur_log,sys_name){
        return CallProvider.call({
            actionName: "rz_CheckLogNameValid.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name': sys_name,
                'log_name':cur_log.log_name,
            }
        })
    };
    //业务系统-判断路径是否存在
    this.judgePathIsExist=function(soc_name,node_name,log_file_path){
        return CallProvider.call({
            actionName: "rz_CheckRemotePathExists.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name': node_name,
                'soc_name':soc_name,
                'log_file_path':log_file_path,
            }
        })
    };
    //业务系统-新增日志
    this.saveLogBaseMessage=function(log,sys_name){
        return CallProvider.call({
            actionName: "rz_SaveLog.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name': sys_name,
                'log_name':log.log_name,
                'log_cn_name':log.log_cn_name,
                'log_desc':log.log_desc,
                'log_type':log.log_type,
                'log_format_type':log.log_format_type,
                'file_encoding':log.file_encoding,
                'newline_type':log.newline_type,
                 'compress_mode':log.compress_mode,
                 'timestamp_exp':log.timestamp_exp,
                'timestamp_format':log.timestamp_format,
                'log_configs':log.log_configs,
                'keywords':log.keywords,
                'date_exp':log.date_exp,
                'log_id':log.log_id

            }
        })
    };
    //业务系统-删除日志
    this.deleteLog=function(sys_name,log_name,log_id){
        return CallProvider.call({
            actionName: "rz_DeleteLog.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name':sys_name,
                'log_name':log_name,
                'log_id':log_id
            }
        })
    };
    //业务系统-得到日志列表
    this.viewLogList=function(params,sys_name,log_name,log_id){
        return CallProvider.call({
            actionName: "rz_GetLogFileList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'key_word': params.key_word,
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'sys_name':sys_name,
                'log_name':log_name,
                'log_id':log_id
            }
        })
    }
    //业务系统-得到日志报告
    this.viewLogReportViewList=function(params){
        return CallProvider.call({
            actionName: "rz_PageLogReport.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'offset': params.data.offset,
                'size': params.data.limit,
            }
        })
    }
    //业务系统-启动定时获取
    this.startTimePull=function(sys_name,log_name,log_id){
        return CallProvider.call({
            actionName: "rz_StartTimingPull.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name':sys_name,
                'log_name':log_name,
                'log_id':log_id
            }
        })
    };
    this.stopTimePlee=function(sys_name,log_name,log_id){
        return CallProvider.call({
            actionName: "rz_StopTimingPull.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name':sys_name,
                'log_name':log_name,
                'log_id':log_id
            }
        })
    };
    //业务系统-日志上传-得到上传路径
    this.getLogUploadPath=function(node_name,sys_name,file_date,log_id){
        return CallProvider.call({
            actionName: "rz_GetUploadPath.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name':node_name,
                'sys_name':sys_name,
                'file_date':file_date,
                'log_id':log_id
            }
        })
    }
    //业务系统-日志上传-日志提交
    this.saveLogUploadBase=function(Log_info){
        return CallProvider.call({
            actionName: "rz_UploadLogFile.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                 'sys_name':Log_info.sys_name,
                'log_name':Log_info.log_name,
                'node_name':Log_info.node_name,
                'file_date':Log_info.file_date,
                'file_name':Log_info.file_name,
                'log_id':Log_info.log_id,
                'node_ip':Log_info.node_ip
            }
        })
    }
    //业务系统-日志上传-日志删除
    this.logUploadBaseDelete=function(id,local_file_name,local_dir){
        return CallProvider.call({
            actionName: "rz_DeleteLogFileAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'id':id,
                'local_file_name':local_file_name,
                'local_dir':local_dir
            }
        })
    }
    //业务系统-Agent-启停
        this.modifyAgent=function(flag,one_node){
            return CallProvider.call({
                actionName: "bs_StartAndStopAgentAction.do",
                reqData: {
                    'org_rs_code': CV.rscode(''),
                    'operate':flag,
                    'ip':one_node.ip,
                    'node_name':one_node.node_name
                },
                timeout : 600,
            })
        };
    //业务系统-得到所有的agent
    this.getAllAgentMsg=function( business_sys_name){
        return CallProvider.call({
            actionName: "bs_GetAgentMonitorInfoAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'business_sys_name':business_sys_name
            }
        })
    };
    //业务系统-修改-通过数据源名字，得到数据源信息
    this.getMessageBysocName=function(soc_name){
        return CallProvider.call({
            actionName: "dt_QuerySocBySocNameAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'soc_name':soc_name
            }
        })
    };
    //系统节点配置-检查项-查询数据源
    this.getSocListBySocIpAndSys=function (sys,soc_ip,impl_type) {
        return CallProvider.call({
            actionName: "bs_ViewDtSourceActiongetNodeSoc.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                business_sys_name:sys,
                impl_type:impl_type,
                soc_ip:soc_ip
            }
        })
    };
    //系统节点配置-检查项-保存检查项数据
    this.saveMonitorItemData=function (sys,soc_ip,monitor_item_list) {
        return CallProvider.call({
            actionName: "bs_ModifyBsNodeMonitorAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                business_sys_name:sys,
                monitor_item_list:monitor_item_list,
                soc_ip:soc_ip
            }
        })
    };
    //系统节点配置-检查项-查看检查项数据
    this.viewMonitorItemData=function (sys,soc_ip) {
        return CallProvider.call({
            actionName: "bs_ViewNodeActionqueryNodeMonitor.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                business_sys_name:sys,
                soc_ip:soc_ip
            }
        })
    };
}]);
//系统服务
CommHttp.service('Sys', ["CallProvider", "CV", function(CallProvider, CV) {
    //获得单个系统
    this.getSysInfo = function(sysId) {
        return CallProvider.call({
            actionName: "bs_ViewBsActiongetBsSystem.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
                'business_sys_name': sysId
            }
        });
    };
    //新增系统
    this.saveSysInfo = function(sys) {
        sys.org_rs_code = CV.rscode('new_busi_sys');
        return CallProvider.call({
            actionName: "bs_AddBsSystemAction.do",
            reqData: sys
        });
    };
    //修改系统
    this.updateSysInfo = function(sys) {
        sys.org_rs_code = CV.rscode('busi_sys_list');
        return CallProvider.call({
            actionName: "bs_UpdateBsSystemAction.do",
            reqData: sys
        });
    };
    //删除系统
    this.deleteSys = function(sysId) {
        return CallProvider.call({
            actionName: "bs_DeleteBsSystemAction.do",
            reqData: {
                'business_sys_name': sysId,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        });
    };
    //系统列表数据
    this.pageSysTbl = function(params) {
        return CallProvider.call({
            actionName: "bs_PageBsSystemAction.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'desc' ? '1' : '2')
            }
        })
    };
    //系统-节点列表
    this.getNodelist=function(sys_id){
        return CallProvider.call({
            actionName: "bs_ViewNodeActiongetNodeMsg.do",
            reqData: {
                'business_sys_name': sys_id,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    }
    //系统-查看节点配置信息
    this.ViewSysNodeConfigInfo = function (sys_id,node_name) {
        return CallProvider.call({
            actionName: "bs_ViewNodeActiongetNodeBySysNameAndNodeName.do",
            reqData: {
                node_name: node_name,
                business_sys_name: sys_id
            }
        })
    };
    //系统-节点配置-检查项-查看检查项数据
    this.viewMonitorItemData=function (sys_id,soc_ip) {
        return CallProvider.call({
            actionName: "bs_ViewNodeActionqueryNodeMonitor.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                business_sys_name:sys_id,
                soc_ip:soc_ip
            }
        })
    };
    //系统-节点配置-检查项-保存检查项数据
    this.saveMonitorItemData=function (sys_id,soc_ip,monitor_item_list) {
        return CallProvider.call({
            actionName: "bs_ModifyBsNodeMonitorAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                business_sys_name:sys_id,
                monitor_item_list:monitor_item_list,
                soc_ip:soc_ip
            }
        })
    };
    //系统-查看节点配置信息
    this.ViewBsNodeConfigInfo = function (sys_id,node_name) {
        return CallProvider.call({
            actionName: "bs_ViewNodeActiongetNodeBySysNameAndNodeName.do",
            reqData: {
                node_name: node_name,
                business_sys_name: sys_id
            }
        })
    };
    //系统-导出方案
    this.getProgExportPath = function (prog_id) {
        return CallProvider.call({
            actionName: "bs_ExportProgramAction.do",
            reqData: {
                'prog_id': prog_id
            }
        })
    }
    //系统 - 查看单个方案信息
    this.viewSingleProgramInfo = function (prog_id) {
        return CallProvider.call({
            actionName: "bs_ViewBsProgramActionqueryProgramInfo.do",
            reqData: {
                'prog_id': prog_id
            }
        })
    }
    //系统--获取方案相应的方案列表
    this.getAllProgramList = function(sys_id,publish_state ,prog_type) {
        return CallProvider.call({
            actionName: "bs_ViewBsProgramActionqueryProgramListInBsi.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
                'business_sys_name': sys_id,
                'publish_state': publish_state,
                'prog_type': prog_type,

            }
        })
    };
    //系统--配置方案-获取合并参数
    this.getCombineParam = function(program,business_sys_name) {
        return CallProvider.call({
            actionName: "bs_ViewBsProgramActiongetCombineParam.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'program': program,
                business_sys_name: business_sys_name
            }
        });
    };
    //系统--修改方案
    this.updateProgram = function (program) {
        return CallProvider.call({
            actionName: "bs_UpdateProgramAction.do",
            reqData: {
                'program': program,
            },
        });
    };
    //系统--新增方案
    this.addProgram = function (program,sys_id) {
        return CallProvider.call({
            actionName: "bs_AddProgramAction.do",
            reqData: {
                'program': program,
                'business_sys_name': sys_id
            }
        });
    }
    //系统配置--删除方案
    this.deleteProgram = function(prog_id) {
        return CallProvider.call({
            actionName: "bs_DeleteBsProgramAction.do",
            reqData: {
                'prog_id': prog_id,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    };
    //系统-获得日志列表
    this.getAllLogList=function(sys_name,inspect_flag){
        return CallProvider.call({
            actionName: "rz_GetLogListBySysName.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name': sys_name,
                'inspect_flag':inspect_flag
            }
        })
    };
    //系统-启动定时获取
    this.startTimePull=function(sys_name,log_name,log_id){
        return CallProvider.call({
            actionName: "rz_StartTimingPull.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name':sys_name,
                'log_name':log_name,
                'log_id':log_id
            }
        })
    };
    this.stopTimePull=function(sys_name,log_name,log_id){
        return CallProvider.call({
            actionName: "rz_StopTimingPull.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name':sys_name,
                'log_name':log_name,
                'log_id':log_id
            }
        })
    };
    //系统-删除日志
    this.deleteLog=function(sys_name,log_name,log_id){
        return CallProvider.call({
            actionName: "rz_DeleteLog.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name':sys_name,
                'log_name':log_name,
                'log_id':log_id
            }
        })
    };
    //系统-判断路径是否存在
    this.judgePathIsExist=function(soc_name,node_name,log_file_path){
        return CallProvider.call({
            actionName: "rz_CheckRemotePathExists.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name': node_name,
                'soc_name':soc_name,
                'log_file_path':log_file_path,
            }
        })
    };
    //系统-判断日志名是否存在
    this.judgeLogNameIsExist=function(cur_log,sys_name){
        return CallProvider.call({
            actionName: "rz_CheckLogNameValid.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name': sys_name,
                'log_name':cur_log.log_name,
            }
        })
    };
    //系统-新增日志
    this.saveLogBaseMessage=function(log,sys_name){
        return CallProvider.call({
            actionName: "rz_SaveLog.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_name': sys_name,
                'log_name':log.log_name,
                'log_cn_name':log.log_cn_name,
                'log_desc':log.log_desc,
                'log_type':log.log_type,
                'log_format_type':log.log_format_type,
                'file_encoding':log.file_encoding,
                'newline_type':log.newline_type,
                'compress_mode':log.compress_mode,
                'timestamp_exp':log.timestamp_exp,
                'timestamp_format':log.timestamp_format,
                'log_configs':log.log_configs,
                'keywords':log.keywords,
                'date_exp':log.date_exp,
                'log_id':log.log_id

            }
        })
    };
    //根据服务器和业务系统名获得数据源列表
    this.getSocListByIpAndBsys = function(sys_id, server_ip, impl_type) {
        return CallProvider.call({
            actionName: "bs_ViewDtSourceActionquerySoc.do",
            reqData: {
                'business_sys_name': sys_id,
                'soc_ip': server_ip,
                'impl_type': impl_type,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    };
    //系统-得到所有的agent
    this.getAllAgentMsg=function( business_sys_name){
        return CallProvider.call({
            actionName: "bs_GetAgentMonitorInfoAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'business_sys_name':business_sys_name
            }
        })
    };
    //系统-Agent-启停
    this.modifyAgent=function(flag,one_node){
        return CallProvider.call({
            actionName: "bs_StartAndStopAgentAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'operate':flag,
                'ip':one_node.ip,
                'node_name':one_node.node_name
            },
            timeout : 600,
        })
    };

    //系统-方案配置-查询逻辑节点及包参数
    this.getLogicNodeAndPacParam = function (sys) {
        return CallProvider.call({
            actionName: "bs_ViewBsProgramActionqueryLogicNodeInfo.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                business_sys_name :sys
            }
        })
    };
    //系统-固化配置-获取远程目录文件
    this.getRemoteDirectory = function (business_sys_name,logic_node_id,root_bk_dir) {
        return CallProvider.call({
            actionName: "bs_ShowRemoteDirectoryAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'business_sys_name':business_sys_name,
                'logic_node_id'  : logic_node_id,
                'root_bk_dir':root_bk_dir,
            }
        });
    }
}]);
//业务系统配置-节点服务
CommHttp.service('NodeReform', ["CallProvider", "CV", function(CallProvider, CV) {
    //根据Ip获得数据源列表
    this.queryProtocolAndSocNameByIp = function(soc_ip ,node_name) {
        return CallProvider.call({
            actionName: "dt_ViewDtActionqueryProtocolAndSocNameByIP.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
                'soc_ip': soc_ip,
                'node_name': node_name,
            }
        });
    };
    //保存节点信息
    this.addBsNode = function(node_info) {
        return CallProvider.call({
            actionName: "bs_AddBsNodeAction.do",
            reqData: node_info
        });
    };
    //获得节点信息
    this.getNodeByBusi = function(business_sys_name) {
        return CallProvider.call({
            actionName: "bs_ViewBsActiongetNodeMsg.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
                'business_sys_name': business_sys_name
            }
        });
    };
    //获得去重后的ip
    this.getIpByNone = function(){
        return CallProvider.call({
            actionName: "dt_ViewDtActionqueryAllIp.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
            }
        });
    }
    this.getIpWithProtocolAndSoc = function(business_sys_name, impl_type){
        return CallProvider.call({
            actionName: "bs_ViewDtSourceActionqueryNodeList.do",
            reqData: {
                'business_sys_name': business_sys_name,
                'impl_type'       : impl_type
            }
        });
    };
    //修改
    this.updateBsNode = function(node_info) {
        return CallProvider.call({
            actionName: "bs_UpdateBsNodeAction.do",
            reqData: node_info
        });
    };
    //获得单个节点信息
    this.getNodeForUpdat = function(node_name) {
        return CallProvider.call({
            actionName: "bs_ViewBsActiongetNodeForUpdate.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
                node_name: node_name
            }
        });
    };

    //新增节点
    this.addNode = function(business_sys_name,node_soc_ip){
        return CallProvider.call({
            actionName: "bs_AddBsNodeIpAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'business_sys_name': business_sys_name,
                'node_soc_ip' : node_soc_ip
            }
        });
    };
    //删除节点
    this.deleteNode = function(business_sys_name,node_soc_ip){
        return CallProvider.call({
            actionName: "bs_DeleteBsNodeIpAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'business_sys_name': business_sys_name,
                'node_soc_ip' : node_soc_ip
            }
        });
    };
    //配置节点类型
    this.configNodeType = function(node_name,node_type){
        return CallProvider.call({
            actionName: "bs_UpdateNodeTypeAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name': node_name,
                'node_type': node_type
            },
        });
    }
    //编辑数据源配置信息
    this.setDataSourceConfigInfo = function(config_info){
        return CallProvider.call({
            actionName: "bs_ModifyBsNodeSocAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name': config_info.node_name,
                'soc_list' : config_info.soc_list,
                'ftp_config_soc':config_info.ftp_config_soc,
                'shell_config_soc':config_info.shell_config_soc,
                'exist_agent_yn_falg':config_info.exist_agent_yn_falg,
                'agent_config_yn_falg':config_info.agent_config_yn_falg,
            }
        });
    };
    //获取节点基本信息
    this.getNodeBasicInfo = function(node_name){
        return CallProvider.call({
            actionName: "bs_ViewBsActiongetNodeBaseConfigMsg.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name': node_name
            },
            timeout:300,
        });
    };
    //保存节点基本信息
    this.saveNodeBasicInfo = function(basic_info,_business_sys_name){
        return CallProvider.call({
            actionName: "bs_AddBsNodeConfigAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name': basic_info.node_name,
                'business_sys_name' : _business_sys_name,
                'node_basic_msg':basic_info.node_basic_msg
            }
        });
    };

    //插件部署-查询所有运行环境
    this.getAllRunEnvname = function(basic_info){
        return CallProvider.call({
            actionName: "bs_ViewBsNodeActiongetAllRunEnvName.do",
            reqData: {
                'org_rs_code': CV.rscode('')
            }
        });
    };
    //插件部署-根据运行环境和包类型获取库
    this.getLibraryListByRunEnv = function(library_type,run_env){
        return CallProvider.call({
            actionName: "bs_ViewRunEnvActionquerryLibByEnvAndType.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'library_type': library_type,
                'env_type':run_env
            }
        });
    };
    //插件部署-根据节点和库名获得插件远程的默认安装目录
    this.getRouteUrlByNodeAndLib = function (library_bk_name,node_name) {
        return CallProvider.call({
            actionName: "bs_ViewRunEnvActiongetDefaultInstallDirectory.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'library_bk_name': library_bk_name,
                'node_name':node_name
            }
        });
    }
    //插件部署-删除运行环境
    this.deleteRunEnv = function(node_name,library_bk_name){
        return CallProvider.call({
            actionName: "bs_DeleteRunEnvAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'node_name':node_name,
                'library_bk_name':library_bk_name
            }
        });
    };
    //插件部署-部署/删除插件
    this.deployOrDeletePlugin = function(deploy_info,is_delete){
        var _actionName = is_delete==1 ? "bs_PluginUninstallAction.do" : 'bs_PluginInstallAction.do';
        return CallProvider.call({
            actionName: _actionName,
            reqData: deploy_info,
            timeout: 1800 //超时时间为30分钟
        });
    }
    //agent部署
    this.deployAgent = function(soc_name,node_name){
        return CallProvider.call({
            actionName: "bs_DeployAgentAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'soc_name':soc_name,
                'node_name':node_name
            },
            timeout: 300 //超时时间为5分钟
        });
    }

}]);
//业务系统数据源服务
CommHttp.service('DataSource', ["CallProvider", "CV", function(CallProvider, CV) {
    //新增修改 1.业务系统-修改2.业务系统-新增
    /*获取所有版本机数据源*/
    this.getVerDataSources = function() {
        return CallProvider.call({
            actionName: "dt_ViewDtActionqueryVersionSoc.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
            }
        })
    };
    /*获取所有数据源服务（备用）*/
    this.getAllDataSources = function() {
        return CallProvider.call({
            actionName: "bs_ViewDtSourceActionquerySoc.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
            }
        })
    };
}]);
//插件库服务
CommHttp.service('Plugin',["CallProvider", "CV",function(CallProvider,CV){
    /*旧版服务（可删除）*/
    //新增/修改插件
    this.addPlugin = function(data) {
        return CallProvider.call({
            actionName: "bs_ModifyEnvPluginAction.do",
            reqData: data
        });
    };
    //查看环境信息
    this.getLiblistByEnvname = function(library_bk_name) {
        return CallProvider.call({
            actionName: "bs_ViewRunEnvActiongetEnvLibDetail.do",
            reqData: {
                library_bk_name: library_bk_name,
            }
        });
    };
    //获取库上传路径
    this.getLibUploadPath = function() {
        return CallProvider.call({
            actionName: "bs_ViewRunEnvActiongetLibUploadTempDir.do",
            reqData: {}
        });
    };
    //删除运行环境
    this.deleteRunEnv = function(library_bk_name) {
        return CallProvider.call({
            actionName: "bs_DeleteEnvLibraryAction.do",
            reqData: {
                library_bk_name:library_bk_name
            }
        });
    };
    //插件列表
    this.getPluginList = function(run_env) {
        return CallProvider.call({
            actionName: "bs_ViewRunEnvActiongetAllEnvLib.do",
            reqData: {}
        });
    };

    /*插件服务新版*/
    //插件列表
    this.getAllPluginList = function(impl_type) {
        return CallProvider.call({
            actionName: "pl_ViewPluginActionqueryPlugin.do",
            reqData: {
                impl_type: impl_type,
            }
        });
    };
    //新增插件
    this.addNewPlugin = function(data) {
        return CallProvider.call({
            actionName: "pl_AddPluginAction.do",
            reqData: data
        });
    };
    //修改插件
    this.updateNewPlugin = function(data) {
        return CallProvider.call({
            actionName: "pl_UpdatePluginAction.do",
            reqData: data
        });
    };
    //查看插件信息
    this.viewPluginInfo = function(plugin_name) {
        return CallProvider.call({
            actionName: "pl_ViewPluginActiongetPlugin.do",
            reqData: {
                plugin_name: plugin_name,
            }
        });
    };
    //删除插件
    this.deleteSinglePlugin = function(plugin_name) {
        return CallProvider.call({
            actionName: "pl_DeletePluginAction.do",
            reqData: {
                plugin_name:plugin_name
            },
            timeout: 300 //超时时间为5分钟
        });
    };
}]);
//公共资源服务
CommHttp.service('CommonResources',["CallProvider", "CV",function(CallProvider,CV){

    //公共资源列表
    this.getAllResourcesList = function() {
        return CallProvider.call({
            actionName: "cm_ViewResourcesActionQueryResources.do",
            reqData: {
            }
        });
    };
    //新增公共资源
    this.addResources = function(data) {
        return CallProvider.call({
            actionName: "cm_AddResourcesAction.do",
            reqData: data
        });
    };
    //修改公共资源
    this.updateResources = function(data) {
        return CallProvider.call({
            actionName: "cm_UpdateResourcesAction.do",
            reqData: data
        });
    };
    //查看公共资源
    this.viewResources = function(resources_name) {
        return CallProvider.call({
            actionName: "cm_ViewResourcesActionGetResources.do",
            reqData: {
                resources_name: resources_name,
            }
        });
    };
    //删除公共资源
    this.deleteResources = function(resources_name) {
        return CallProvider.call({
            actionName: "cm_DeleteResourcesAction.do",
            reqData: {
                resources_name:resources_name
            },
        });
    };
}]);
//语言环境管理
CommHttp.service('envManage',["CallProvider", "CV",function(CallProvider,CV){
    //新增环境
    this.addEnv= function(add_env) {
        return CallProvider.call({
            actionName: "en_AddLanguageEnvAction.do",
            reqData: add_env
        });
    };
    //修改环境
    this.updateEnv= function(add_env) {
        return CallProvider.call({
            actionName: "en_UpdateLanguageEnvAction.do",
            reqData: add_env
        });
    };
    //删除环境
    this.deleteEnv= function(add_env) {
        return CallProvider.call({
            actionName: "en_DeleteLanguageEnvAction.do",
            reqData: add_env
        });
    };
    //上传路径
    this.getUploadPath= function() {
        return CallProvider.call({
            actionName: "cm_ViewCommonActiongetTempUploadDir.do",
            reqData: {}
        });
    };
    //环境列表
    this.queryEnvList= function(language_name,language_version) {
        return CallProvider.call({
            actionName: "en_ViewLanguageEnvActionqueryLanguageEnv.do",
            reqData: {
                language_name:language_name,
                language_version:language_version
            }
        });
    };
    //查询版本
    this.selectLanguageVersionByName= function(language_name) {
        return CallProvider.call({
            actionName: "en_ViewLanguageEnvActionqueryVersionByLanguage.do",
            reqData: {
                language_name:language_name
            }
        });
    };

    //查询-节点下部署的插件列表
    this.getPluginListInNode= function(server_id,node_ip) {
        return CallProvider.call({
            actionName: "bs_ViewNodeActionqueryNodePlugin.do",
            reqData:{
                server_id:server_id,
                soc_ip:node_ip
            }
        });
    };
    //插件部署
    this.exeDeployPlugin= function(env_info) {
        return CallProvider.call({
            actionName: "bs_DeployPluginAction.do",
            reqData:env_info,
            timeout: 1800 //超时时间为半小时
        });
    };
}]);
//组件服务
CommHttp.service('Cmpt', ["CallProvider", "CV", function(CallProvider, CV) {
    //组件-新增组件
    this.addModule = function(module) {
        module.org_rs_code = CV.rscode('');
        return CallProvider.call({
           // actionName: "mo_AddModuleAction.do",
            actionName:"mo_AddComponentAction.do",
            reqData: {
                component: module
               // module: module
            }
        });
    }
    //组件-更新组件
    this.updateModule = function(module_info) {
        return CallProvider.call({
            //actionName: "mo_UpdateModuleAction.do",
            actionName: "mo_UpdateComponentAction.do",
            reqData: {
                org_rs_code: CV.rscode(''),
               // module: module_info
                component:module_info
            }
        });
    };
    //组件-获取导入组件信息
    this.importModule = function(file_path) {
        return CallProvider.call({
            //actionName: "mo_ImportModuleAction.do",
            actionName: "mo_ViewComponentActiongetImportComponentDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                file_path: file_path
            }
        });
    };
    //组件-删除组件
    this.deleteModule = function(id) {
        return CallProvider.call({
            //actionName: "mo_DeleteModuleAction.do",
            actionName: "mo_DeleteComponentAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                id: id
            }
        });
    };
    //组件-组件列表
    this.getCmptList = function(params) {
        return CallProvider.call({
            //actionName: "mo_ViewModuleActionqueryModuleList.do",
            actionName: "mo_ViewComponentActionqueryComponentList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                key_word: params.key_word,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'asc' ? '1' : '2')
            }
        });
    };
    //组件-组件分页列表
    this.getCmptPageList = function(params) {
        return CallProvider.call({
            actionName: "mo_PageComponentAction.do",
            reqData: {
                org_rs_code: CV.rscode(''),
                order_col_name: params.data.sort,
                order_type: (params.data.order == 'asc' ? '1' : '2'),
                cn_name: params.cn_name,
                tag_list:params.tag_list,
                impl_types:params.impl_types,
                start_modify_date:params.start_modify_date,
                end_modify_date:params.end_modify_date,
                crt_user_id  :params.crt_user_id,
                publish_state  :params.publish_state,
                component_purpose:params.component_purpose,
                start_recd: params.data.offset,
                limit_recd: params.data.limit
            }
        });
    };
    //组件-查看组件
    this.viewModulegetModuleDetail = function(id) {
        return CallProvider.call({
            //actionName: "mo_ViewModuleActiongetModuleDetail.do",
            actionName: "mo_ViewComponentActiongetComponentDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                id: id
            }
        });
    };
    //组件&组件组-获取文件上传路径
    this.getCmptFilePath = function(type) {
        return CallProvider.call({
           // actionName: "mo_ViewModuleActiongetModuleFileDirectory.do",
            actionName: "mo_ViewComponentActiongetUploadDirectory.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                type: type
            }
        });
    };
    //组件&组件组 -发布
    this.publishCmpt = function(id, _type) {
        return CallProvider.call({
            //actionName: "mo_PublishModuleAction.do",
            actionName: "mo_PublishCompAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                id: id,
                type: _type
            }
        });
    };
    //组件-上传脚本文件
    this.uploadScriptFile = function(file_path) {
        return CallProvider.call({
           // actionName: "mo_UploadScriptFileAction.do",
            actionName: "mo_ViewComponentActiongetFileContent.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                file_path: file_path
            }
        });
    };

    //组件组-新增组件组
    this.addCmptGroup = function(group) {
        return CallProvider.call({
            //actionName: "mo_AddGroupAction.do",
            actionName: "mo_AddComponentGroupAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                group: group
            }
        });
    };
    //组件组-修改组件组
    this.updateSingleCmptGroup = function(group) {
        return CallProvider.call({
           // actionName: "mo_UpdateGroupAction.do",
            actionName: "mo_UpdateComponentGroupAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                group: group
            }
        });
    };
    //组件组-查看组件组
    this.viewSingleCmptGroup = function(id) {
        return CallProvider.call({
           // actionName: "mo_ViewModuleActiongetGroupDetail.do",
            actionName: "mo_ViewComponentActiongetGroupDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                id: id
            }
        });
    };
    //组件组-获取已发布的组件/组件组
    this.getPublishedCmpt = function(comp_type, component_purpose) {
        return CallProvider.call({
           // actionName: "mo_ViewModuleActionqueryPublishedModuleByType.do",
            actionName: "mo_ViewComponentActionqueryPublishedCompByType.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                type: comp_type,
              //  module_purpose: module_purpose
                component_purpose:component_purpose
            }
        });
    };

    //查询所有用户
    this.getAllUser = function () {
        return CallProvider.call({
            actionName: "mo_ViewComponentActionqueryAllCrtUser.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };

    //组件组-删除组件组
    this.deleteSingleCmptGroup = function(id) {
        return CallProvider.call({
            //actionName: "mo_DeleteGroupAction.do",
            actionName: "mo_DeleteComponentGroupAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                id: id
            }
        });
    };
    //组件组-获取导入组件组文件信息newmodify
    this.getImportCmptGroupInfo = function(file_path) {
        return CallProvider.call({
           // actionName: "mo_ImportGroupAction.do",
            actionName: "mo_ViewComponentActiongetImportGroupDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                file_path: file_path
            }
        });
    };
    //组件组-组件组列表
    this.getCmptGroupList = function(params) {
        return CallProvider.call({
           // actionName: "mo_ViewModuleActionqueryGroupList.do",
            actionName: "mo_ViewComponentActionqueryGroupList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                key_word: params.key_word,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'asc' ? '1' : '2')
            }
        });
    };
    //组件组-（添加组件）获取组件详情
    this.getCmptGroupDetail = function(id_list,phase_flag) {
        return CallProvider.call({
            actionName: "mo_ViewComponentActiongetComponentListDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                id_list: id_list,
                phase_flag:phase_flag
            }
        });
    };
    //（添加组件组）获取组件组详情
    this.getCmptGroupsDetail = function(id_list) {
        return CallProvider.call({
            //actionName: "mo_ViewModuleActiongetGroupListDetail.do",
            actionName: "mo_ViewComponentActiongetGroupListDetail.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                id_list: id_list
            }
        });
    };
    //组件组-获取合并参数（废弃）
    this.getCombineParam = function(module_list, params) {
        return CallProvider.call({
            actionName: "mo_ViewModuleActiongetCombineParam.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                groups: module_list,
                params: params
            }
        });
    };
    //组件&组件组-组件组是否被引用
    this.checkCmptGroupReference = function(comp_id, comp_type) {
        return CallProvider.call({
            actionName: "mo_ViewModuleActioncheckModuleReference.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                id: comp_id,
                type: comp_type
            }
        });
    };

    this.savePublishProgram = function(reqData){
        return CallProvider.call({
            actionName: "bs_SavePublishProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                prog_source: reqData.prog_source,
                business_sys_name : reqData.business_sys_name,
                prog_cn_name        : reqData.prog_cn_name,
                prog_bk_desc        : reqData.prog_bk_desc,
                pub_info            : reqData.pub_info,
                rol_info            : reqData.rol_info,
                package_types       : reqData.package_types,
                prog_id             : reqData.prog_id,
            }
        });
    };
    //获取合适数据源列表
    this.getAllSocList = function(server_ip, impl_type) {
        return CallProvider.call({
            //actionName: "mo_ViewModuleActionQuerySocByType.do",
            actionName:"bs_ViewDtSourceActionquerySoc.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                soc_ip: server_ip,
                impl_type: impl_type,
            }
        });
    };
    //组件&组件组-获取测试发布包临时上传目录
    this.getPacakageDir = function(comp_type) {
        return CallProvider.call({
            actionName: "mo_ViewModuleActiongetTestPacakageDirectory.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                comp_type: comp_type
            }
        });
    }
    //组件-上传测试信息最新测试执行
    this.getCmptTestInfo = function(cmpt_test_info) {
        cmpt_test_info.org_rs_code = CV.rscode('');
        return CallProvider.call({
           // actionName: "mo_DppModuleTestAction.do",
            actionName: "mo_ComponentTestAction.do",
            //reqData: cmpt_test_info,
            reqData: {
                'org_rs_code': CV.rscode(''),
                phase:cmpt_test_info.phase,
                params:cmpt_test_info.param_list,
                id:cmpt_test_info.id,
                //languageEnvInfo:cmpt_test_info.languageEnvInfo,
                deploy_soc:cmpt_test_info.deploy_soc,
            },
            timeout: 3600 //执行步骤超时时间为1小时
        });
    };
    //组件-监控测试
    this.monitorSubgroupTest = function(id) {
        return CallProvider.call({
            actionName: "mo_ViewMonitorModuleActionmoitorModuleTestMsg.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                id: id,
            }
        });
    };
    //流程模板-导入（新增）
    this.importProgram = function(file_path) {
        return CallProvider.call({
            actionName: "bs_ImportProgramAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                file_name: file_path
            }
        });
    };

    //组件-查询分类标签
    this.selectAllTas = function () {
        return CallProvider.call({
            actionName: "mo_ViewComponentActionqueryAllCompnentTags.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    };
    //组件-语法提示列表
    this.grammarBytype=function(impl_type){
        return CallProvider.call({
            actionName: "mo_ViewComponentActionqueryGrammarHint.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'impl_type':impl_type
            }
        });
    }
}]);

//服务器
CommHttp.service('Server', ["CallProvider", "CV", function(CallProvider, CV) {
    //新增服务器
    this.addServer = function(server_ip) {
        return CallProvider.call({
            actionName:"se_AddServerAction.do",
            reqData: {
                server_bean:{
                    server_ip: server_ip
                }
            }
        });
    };
    //查询数据源
    this.getDataSource = function (server_ip) {
        return CallProvider.call({
            actionName:"se_ViewServerActionquerySocListByIP.do",
            reqData: {
                server_ip: server_ip
            }
        });
    };
    //获取服务器基本信息
    this.getServerBasicInfo = function (server_ip) {
        return CallProvider.call({
            actionName:"se_ViewServerActiongetServerConfigMsg.do",
            reqData: {
                server_ip: server_ip,
            },
            timeout: 600 //超时时间为10分钟
        });
    };
    //修改服务器
    this.saveServerInfo = function (server_info,agent_status) {
        return CallProvider.call({
            actionName:"se_UpdateServerAction.do",
            reqData : {
                server_bean : {
                    server_id : server_info.server_id,
                    server_ip :  server_info.server_ip,
                    server_desc : server_info.server_desc,
                    agent_status : agent_status
                },
                machine_basic_bean : server_info.machine_basic_bean
            }
        });
    };
    //查看服务器
    this.viewServerInfo = function (server_ip) {
        return CallProvider.call({
            actionName:"se_ViewServerActiongetServerDetail.do",
            reqData : {
                server_ip : server_ip
            },
            timeout: 600 //超时时间为10分钟
        });
    };
    //服务器列表
    this.pageServerList = function (param) {
        return CallProvider.call({
            actionName:"se_PageServerAction.do",
            reqData : {
                server_ip : param.server_ip,
                server_desc : param.server_desc,
                order_col_name : param.data.sort,
                order_type : param.data.order === 'asc' ? '1' : '2',
                start_recd: param.data.offset,
                limit_recd: param.data.limit
            }
        });
    };
    //删除服务器
    this.deleteServer = function (server_ip) {
        return CallProvider.call({
            actionName:"se_DeleteServerAction.do",
            reqData : {
                server_ip : server_ip
            }
        });
    };
    //获取用户列表
    this.getUserList = function(server_ip){
        return CallProvider.call({
            actionName:"se_ViewServerActionquerySocUserList.do",
            reqData : {
                server_ip : server_ip
            }
        });
    }
    //部署agent se_DeployAgentAction
    this.deployAgentBySoc = function (server_ip,server_user) {
        return CallProvider.call({
            actionName:"se_DeployAgentAction.do",
            reqData : {
                server_ip : server_ip,
                server_user : server_user
            },
            timeout:3600
        });
    };
    //卸载agent se_DeployAgentAction
    this.uninstallAgentByIp = function (server_ip) {
        return CallProvider.call({
            actionName:"se_UnInstallAgentAction.do",
            reqData : {
                server_ip : server_ip
            }
        });
    };
    //查询ip列表
    this.getAllIpList = function () {
        return CallProvider.call({
            actionName:"mo_ViewModuleActiongetExeSocIpList.do",
            reqData : {}
        });
    }
    //根据实现类别查询数据源
    this.getDataSopcByImplType = function (server_ip, impl_types) {
        return CallProvider.call({
            actionName:"mo_ViewModuleActiongetExeSocWithModule.do",
            reqData : {
                impl_types :  impl_types,
                server_ip   : server_ip
            }
        });
    }
    //查询-部署的插件列表
    this.getPluginListInNode= function(server_id,server_ip) {
        return CallProvider.call({
            actionName: "pl_ViewPluginActionqueryDeployedPlugin.do",
            reqData:{
                server_id:server_id,
                server_ip:server_ip
            }
        });
    };
    //插件部署
    this.exeDeployPlugin= function(env_info) {
        return CallProvider.call({
            actionName: "pl_DeployPluginAction.do",
            reqData:env_info,
            timeout: 1800 //超时时间为半小时
        });
    };

    //校验文件传输协议
    this.testFileTransform = function(server_ip,server_user){
        return CallProvider.call({
            actionName:"se_ViewAgentActioncheckFileTransfer.do",
            reqData : {
                server_ip : server_ip,
                server_user : server_user
            },
            timeout:3600
        });
    };
    //检测运行环境
    this.testRunEnv = function(soc_list){
        return CallProvider.call({
            actionName:"se_ViewAgentActioncheckAgentRunEnv.do",
            reqData : {
                soc_list : soc_list
            },
            timeout:3600
        });
    };
    //安装运行环境
    this.deployRunEnv = function(soc_list,sys_type,sys_bit,agent_run_env_flag){
        return CallProvider.call({
            actionName:"se_ViewAgentActiondeployAgentRunEnv.do",
            reqData : {
                soc_list : soc_list,
                sys_type : sys_type,
                sys_bit : sys_bit,
                agent_run_env_flag : agent_run_env_flag,
            },
            timeout:3600
        });
    };
    //安装Agent
    this.deployAgent = function(soc_list){
        return CallProvider.call({
            actionName:"se_ViewAgentActiondeployAgent.do",
            reqData : {
                soc_list : soc_list,
            },
            timeout:3600
        });
    };
    //启动Agent
    this.startAgent = function(soc_list,deploy_path,agent_run_env_flag){
        return CallProvider.call({
            actionName:"se_ViewAgentActionstartAgent.do",
            reqData : {
                soc_list : soc_list,
                deploy_path : deploy_path,
                agent_run_env_flag : agent_run_env_flag,
            },
            timeout:3600
        });
    };
    //检测agent端口连接
    this.testAgentPort = function(soc_list){
        return CallProvider.call({
            actionName:"se_ViewAgentActioncheckAgentExist.do",
            reqData : {
                soc_list : soc_list,
            },
            timeout:3600
        });
    };
    //节点监控 -- 查询所有节点信息服务
    this.getAllNodeList = function (key_word) {
        return CallProvider.call({
            actionName:"bj_QueryAllServerMachineBasicMsgAction.do",
            reqData : {
                key_word : key_word
            }
        });
    };
    //节点监控 -- 监控单个ip状态
    this.monitorNodeStatus = function (server_ip) {
        return CallProvider.call({
            actionName:"bj_MonitorServerMachineAction.do",
            reqData : {
                server_ip : server_ip
            }
        });
    };
}]);
//架构配置相关
CommHttp.service('Struct', ["CallProvider", "CV", function(CallProvider, CV) {
    //保存架构信息
    this.saveStructMsg = function(struct_bean){
        return CallProvider.call({
            actionName: "bs_AddStructureAction.do",
            reqData: {
                struct_bean : struct_bean,
            }
        });
    };
    //查看架构配置
    this.getStructMsg = function(sys_id){
        return CallProvider.call({
            actionName: "bs_ViewBsActionngetStructureBySys.do",
            reqData: {
                sys_id : sys_id,
            }
        });
    };
    //架构配置校检服务
    this.checkStructModify = function(sys_id,struct_bean){
        return CallProvider.call({
            actionName: "bs_ViewStructActioncheckStructModify.do",
            reqData: {
                'sys_id'        : sys_id,
                'struct_bean'   : struct_bean,
            }
        });
    };
    //获取架构下的固话参数列表
    this.getStructParamsByType = function(logical_node_type,sys_id){
        return CallProvider.call({
            actionName: "bs_ViewStructActionqueryNodeFixedParamList.do",
            reqData: {
                'logical_node_type'   : logical_node_type,
                'sys_id'              : sys_id
            }
        });
    }
}]);
//环境配置
CommHttp.service('EnvConfig', ["CallProvider", "CV", function(CallProvider, CV) {
    //获取环境列表
    this.getEnvList  = function(sys_id){
        return CallProvider.call({
            actionName: "bs_ViewBsActionqueryEnvironmentListBySys.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                sys_id :    sys_id,
            }
        });
    };
    //发布环境
    this.publishEnv = function(sys_id,env_id,pub_flag){
        return CallProvider.call({
            actionName: "bs_PublishEnvironmentAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_id': sys_id,
                'env_id': env_id,
                'pub_flag':pub_flag,
            }
        });
    };
    //环境删除
    this.deleteEnv = function(sys_id,env_id){
        return CallProvider.call({
            actionName: "bs_DeleteEnvironmentAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'sys_id': sys_id,
                'env_id': env_id,
            }
        });
    };
    //新增环境
    this.addEnvMsg = function(env_bean,struct_info){
        return CallProvider.call({
            actionName: "bs_AddEnvironmentAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                env_bean : env_bean,
                struct_node_list : struct_info.nodeDataArray
            }
        });
    };
    //获取环境信息
    this.getEnvMsg = function(env_id,sys_id){
        return CallProvider.call({
            actionName: "bs_ViewBsActiongetEnvironmentCfg.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                env_id : env_id,
                sys_id : sys_id,
            }
        });
    };
    //获取逻辑节点下的参数信息
    this.getLogicalParamListByEnvId = function(logical_node_id,sys_id){
        return CallProvider.call({
            actionName: "bs_ViewBsActionqueryOtherParamList.do",
            reqData: {
                'org_rs_code'       : CV.rscode(''),
                'sys_id'            : sys_id,
                'logical_node_id'   : logical_node_id,
            }
        });
    };
    //获取agent机器下的所有用户名
    this.getAgentUserName = function(server_ip){
        return CallProvider.call({
            actionName: "bs_ViewBsActionqueryAgentUsersByIP.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'server_ip': server_ip,
            }
        });
    };
    //根据ip查询文件数据源和执行数据源
    this.getFileAndExecSocList = function(ip,logical_node_type){
        return CallProvider.call({
            actionName: "bs_ViewBsActionqueryFileAndExecDtSocList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                server_ip : ip,
                logical_node_type : logical_node_type
            }
        });
    };
    //查询所有服务器信息
    this.getAllServerIp = function(){
        return CallProvider.call({
            actionName: "se_ViewServerActionqueryServerList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    }
}]);
