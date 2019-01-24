'use strict';
/**
 * 发布管理 HTTP 服务模块
 */
var ReleaseHttp = angular.module('ReleaseHttpSrv', []);
//项目服务
ReleaseHttp.service('Proj', ["CallProvider", "CV", function(CallProvider, CV) {
    //项目--查询发布项目
    this.getNotFinishProjTblData = function(params) {
        return CallProvider.call({
            actionName: "pj_PageNotExecutePjProjectAction.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'asc' ? '1' : '2')
            }
        });
    };
    //项目--查询历史项目
    this.getFinishProjTblData = function(params) {
        return CallProvider.call({
            actionName: "pj_PageHistoryPjProjectAction.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'start_date': params.data.startDate,
                'end_date': params.data.endDate,
                'business_sys_name': params.data.busiSys,
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': params.data.order == 'asc' ? '1' : '2'
            }
        });
    };
    //新增项目
    this.saveProj = function(proj) {
        proj.org_rs_code = CV.rscode('new_proj');
        return CallProvider.call({
            actionName: "pj_AddPjProjectBasicAction.do",
            reqData: proj
        });
    };
    //修改项目
    this.updateProj = function(proj) {
        proj.org_rs_code = CV.rscode('proj_list');
        return CallProvider.call({
            actionName: "pj_UpdatePjProjectBasicAction.do",
            reqData: proj
        });
    };
    //获得单个项目
    this.getOnePjProj = function(busiSysId, projName) {
        return CallProvider.call({
            actionName: "pj_ViewPjActiongetPjProjInfo.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': busiSysId,
                'project_name': projName
            }
        });
    };
    //获得项目详细信息（相同--旧版）
  /*  this.getProjDetail = function(busiSysId, projName) {
        return CallProvider.call({
            actionName: "pj_ViewPjActiongetPjInfoDetail.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': busiSysId,
                'project_name': projName
            }
        });
    };*/
    this.getProjDetail = function(busiSysId, projName) {
        return CallProvider.call({
            actionName: "sp_ViewPjActiongetPjInfoDetail.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': busiSysId,
                'syspublish_id': projName
            }
        });
    }
    //删除项目 1.项目-项目列表-发布项目-删除
    this.deleteOneProj = function(bn, pn, cn_name) {
        return CallProvider.call({
            actionName: "pj_DeletePjProjectAction.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': bn,
                'project_name': pn
            }
        });
    };
    //验证项目是否唯一 项目-项目登记，验证项目编号是否存在
    this.uniqueProj = function(projName, busiName) {
        return CallProvider.call({
            actionName: "pj_ViewPjActioncheckProjectName.do",
            reqData: {
                business_sys_name: busiName,
                project_name: projName
            }
        });
    };
    //重启历史项目 项目-项目列表-历史列表-重启
    this.reloadProj = function(proj) {
        proj.org_rs_code = CV.rscode('proj_list');
        return CallProvider.call({
            actionName: "pj_ResetHistoryProjectAction.do",
            reqData: proj
        });
    }
    //项目查看-公共信息(相同)
    this.getPublicData = function(business_sys_name, project_name) {
        return CallProvider.call({
            actionName: "sp_ViewPjActiongetPjInfoDetail.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': business_sys_name,
                'syspublish_id': project_name
            }
        });
    }
    //项目查看-项目信息
    this.getProjectData = function(business_sys_name, project_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjActionqueryPjProjInfo.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': business_sys_name,
                'project_name': project_name
            }
        });
    }
    //项目查看-业务系统信息
    this.getBusisysData = function(business_sys_name, project_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjActiongetPjDetailBsSysInfo.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': business_sys_name,
                'project_name': project_name
            }
        });
    }
    //项目查看-发布信息
    this.getProjPublishData = function(business_sys_name, project_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjActionqueryPjPublishInfo.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': business_sys_name,
                'project_name': project_name
            }
        });
    }
    //项目查看-计划信息
    this.getPlanData = function(business_sys_name, project_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionviewPlanInfo.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': business_sys_name,
                'project_name': project_name
            }
        });
    };
    //根据业务名获取已发布的方案(废弃)
    this.getPublishedProgByBusiSysName = function(business_sys_name) {
        return CallProvider.call({
            actionName: "bs_ViewBsProgramActionqueryPublishProgList.do",
            reqData: {
                'business_sys_name': business_sys_name
            }
        });
    };
    //项目登记--查询所有用户集合
    this.getAllExcutedUser = function() {
        return CallProvider.call({
            actionName: "pj_QueryDeptAndUserListAction.do",
            reqData: {}
        });
    };
    //项目登记--根据系统查询所有可执行用户集合
    this.getAllExcutedUserByBusi = function(business_sys_name) {
        return CallProvider.call({
            actionName: "pj_QueryDeptAndUserByBusNameAction.do",
            reqData: {
                'business_sys_name':business_sys_name
            }
        });
    };
 /*   //敏捷发布--查询敏捷发布的项目及步骤信息
    this.queryQuickProj = function() {
        return CallProvider.call({
            actionName: "pj_ViewPjActiongetQuickProject.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
            }
        });
    }*/
    //项目--查询敏捷项目
    this.getQuickProjTblData = function(params) {
        return CallProvider.call({
            actionName: "sp_PageQuickProjectAction.do",
            reqData: {
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'asc' ? '1' : '2')
            }
        });
    };
}]);
//项目服务(改版后)
ReleaseHttp.service('Project', ["CallProvider", "CV", function(CallProvider, CV) {
    //项目登记--查询所有用户集合
    this.getAllExcutedUser = function() {
        return CallProvider.call({
            actionName: "pj_QueryDeptAndUserListAction.do",
            reqData: {}
        });
    };
    //新增项目
    this.addProj = function(proj) {
        proj.org_rs_code = CV.rscode('new_proj');
        return CallProvider.call({
            actionName: "pj_SaveProjectAction.do",
            reqData: proj
        });
    };
    //项目列表
    this.getProjList = function(project_name,project_status,is_history,page_info) {
        if(is_history){
            return CallProvider.call({
                actionName: "pj_PageHistoyProjectAction.do",
                reqData: {
                    project_name : project_name,
                    start_recd: page_info.start_recd,
                    limit_recd: page_info.limit_recd,
                }
            });
        }else{
            return CallProvider.call({
                actionName: "pj_ViewProjectActiongetProjectList.do",
                reqData: {
                    project_name : project_name,
                }
            });
        }
    };
    //根据系统查询所有可执行用户集合
    this.getAllExcutedUserByBusi = function(business_sys_name) {
        return CallProvider.call({
            actionName: "pj_QueryDeptAndUserByBusNameAction.do",
            reqData: {
                'business_sys_name':business_sys_name
            }
        });
    };
    //项目查看-项目信息
    this.getProjectData = function(project_id) {
        return CallProvider.call({
            actionName: "pj_ViewProjectActiongetProjectInfo.do",
            reqData: {
                project_id : project_id
            }
        });
    };

    //发布申请-查询系统责任人以及方案列表
    this.getSysProgram = function(business_sys_name) {
        return CallProvider.call({
            actionName: "pj_ViewProjectActiongetBusinessProgramList.do",
            reqData: {
                business_sys_name : business_sys_name
            }
        });
    };
    //发布申请
    this.applyRelease = function(proj) {
        return CallProvider.call({
            actionName: "pj_SavePublishProjectAction.do",
            reqData: proj
        });
    };
    //发布申请列表
    this.getApplyReleaseList = function(project_id) {
        if(project_id){
            return CallProvider.call({
                actionName: "pj_ViewProjectActionqueryPublishListByProjectId.do",
                reqData: {
                    project_id : project_id
                }
            });
        }else{
            return CallProvider.call({
                actionName: "pj_ViewPublishActiongetPublishList.do",
                reqData: {}
            });
        }
    };
    //发布申请历史列表
    this.getApplyReleaseHistoryList = function(info) {
        return CallProvider.call({
            actionName: "pj_PageHistoyPublishAction.do",
            reqData: info
        });
    };
    //发布申请里项目列表
    this.applyProjectList = function() {
        return CallProvider.call({
            actionName: "pj_ViewProjectActionqueryAllProjectSysList.do",
            reqData: {}
        });
    };
    //项目列表界面获取发布申请中的系统列表
    this.getReleaseProjSysList = function(pjpublish_id) {
        return CallProvider.call({
            actionName: "pj_ViewProjectActiongetPublishBusinessList.do",
            reqData: {
                pjpublish_id : pjpublish_id
            }
        });
    };
    //查看发布申请
    this.viewReleaseApply = function(pjpublish_id) {
        return CallProvider.call({
            actionName: "pj_ViewPublishActiongetPublishInfo.do",
            reqData: {
                pjpublish_id : pjpublish_id
            }
        });
    };
    //撤销发布申请
    this.deleteReleaseApply = function(pjpublish_id) {
        return CallProvider.call({
            actionName: "pj_DeletePublishProjectAction.do",
            reqData: {
                pjpublish_id : pjpublish_id
            }
        });
    };
    //审核发布申请
    this.checkApply = function (pjpublish_id) {
        return CallProvider.call({
            actionName: "pj_AuditedPublishProjectAction.do",
            reqData: {
                pjpublish_id : pjpublish_id
            }
        });
    };
    //重启发布申请
    this.reBootPjpublish = function (pjpublish_id) {
        return CallProvider.call({
            actionName: "pj_RebootPjPublishAction.do",
            reqData: {
                pjpublish_id : pjpublish_id
            }
        });
    };
    //关闭项目
    this.handleCloseProject = function (project_id) {
        return CallProvider.call({
            actionName: "pj_CloseProjectAction.do",
            reqData: {
                project_id : project_id
            }
        });
    };
    //重启项目
    this.reBootProject = function (project_id) {
        return CallProvider.call({
            actionName: "pj_RebootProjectAction.do",
            reqData: {
                project_id : project_id
            }
        });
    };
    //查询前置项目列表
    this.viewPreProject = function (project_id) {
        return CallProvider.call({
            actionName: "pj_ViewProjectActiongetProjectIdList.do",
            reqData: {
                project_id : project_id
            }
        });
    };
    //项目查看-业务系统信息
    this.getBusisysData = function(business_sys_name, project_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjActiongetPjDetailBsSysInfo.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': business_sys_name,
                'project_name': project_name
            }
        });
    }
    //项目查看-发布信息
    this.getProjPublishData = function(business_sys_name, project_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjActionqueryPjPublishInfo.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': business_sys_name,
                'project_name': project_name
            }
        });
    }
    //项目查看-计划信息
    this.getPlanData = function(business_sys_name, project_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionviewPlanInfo.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': business_sys_name,
                'project_name': project_name
            }
        });
    };

    //发布--例行列表
    this.getPrepareList = function(pjpublish_name,pjpublish_status) {
        return CallProvider.call({
            actionName: "pj_ViewPublishActiongetPrepareProjectList.do",
            reqData: {
                pjpublish_name : pjpublish_name,
                pjpublish_status : pjpublish_status
            }
        });
    };
    //发布--合并
    this.getCombinePubList = function (business_sys_name, syspublish_status) {
        return CallProvider.call({
            actionName: "pj_ViewProjectActionqueryAllSysPublishList.do",
            reqData: {
                business_sys_name : business_sys_name,
                syspublish_status : syspublish_status
            }
        });
    };
    //系统发布查看基本信息
    this.viewSysPublishDetail = function (syspublish_id) {
        return CallProvider.call({
            actionName: "sp_ViewSysPublishActiongetSysPublishDetail.do",
            reqData: {
                syspublish_id : syspublish_id,
            }
        });
    };
    //系统发布查看准备信息
    this.viewSysReadyDetail = function (syspublish_id) {
        return CallProvider.call({
            actionName: "sp_ViewSysPublishActiongetSysPubExeDetail.do",
            reqData: {
                syspublish_id : syspublish_id,
            }
        });
    };
}]);

//发布执行 & 发布准备服务
ReleaseHttp.service('Exec', ["CallProvider", "CV", function(CallProvider, CV) {
    //获得系统发布详细信息（新）
    this.getSysPubDetail = function(busiSysId, syspublish_id) {
        return CallProvider.call({
            actionName: "sp_ViewExecuteActiongetSpInfoDetail.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': busiSysId,
                'syspublish_id': syspublish_id,
            }
        });
    }
    //项目发布--导出实例
    this.getInstanceFullPath = function(execute_id) {
        return CallProvider.call({
            actionName: "sp_ViewPjActiongetInstanceFullPath.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'execute_id': execute_id,
            }
        });
    };
    //项目发布--导入实例
    this.importInstance = function(execute_id,  import_file_path) {
        return CallProvider.call({
            actionName: "sp_ImportInstanceAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'execute_id': execute_id,
                'import_file_path': import_file_path,
            }
        });
    };
    //项目发布--判断是否能执行
    this.canExec = function(busiSysId, syspublish_id) {
        return CallProvider.call({
            actionName: "sp_CheckExecuteAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'business_sys_name': busiSysId,
                'syspublish_id': syspublish_id
            }
        });
    }
    //导入实例目录
    this.getInstanceImportPath = function() {
        return CallProvider.call({
            actionName: "sp_ViewPjActiongetInstanceImportPath.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
            }
        });
    };
    //项目发布--按阶段执行
    this.execByPhase = function(execute_id, phaseId, skip_flag) {
        return CallProvider.call({
            actionName: "sp_ExecutePjPhaseAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'phase_no': phaseId,
                'skip_flag': skip_flag,
                'execute_id': execute_id,
            },
            timeout: 3600 //执行阶段超时时间为1小时
        });
    };
    //项目发布--一键执行
    this.autoExecByphase = function(execute_id, phaseId) {
        return CallProvider.call({
            actionName: "sp_ExecutePjOneButtonAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'execute_id': execute_id,
                'phaseId': phaseId,
            },
            timeout: 3600 //执行阶段超时时间为1小时
        });
    };
    //项目发布--执行暂停
    this.execPauseRunning = function(execute_id) {
        return CallProvider.call({
            actionName: "sp_ExecutePauseAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'execute_id': execute_id
            },
            timeout: 3600 //执行阶段超时时间为1小时
        });
    };
    //项目发布--阶段重置
    this.resetPhase = function(phaseId, execute_id) {
        return CallProvider.call({
            actionName: "sp_ResetExecutePhaseAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'phase_no': phaseId,
                'execute_id': execute_id,
            },
            timeout: 3600 //重置阶段超时时间为1小时
        });
    };
    //项目发布-停止执行
    this.stopByStep = function(execute_id){
        return CallProvider.call({
            actionName: "sp_ExecutePjStepStopAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'execute_id': execute_id,
            }
        });
    }
    //发布总结评    1.项目发布--手动/自动结束--评价
    this.summaryProd = function(summary) {
        summary.org_rs_code = CV.rscode('prod_exec_list');
        return CallProvider.call({
            actionName: "pj_EditPjEvaluateAction.do",
            reqData: summary
        });
    }
    //查询发布总结评价
    /**
     * 1.项目发布--执行结束后查看--修改
     2.发布监控-执行结束后查看-修改
     3.发布-历史发布-查看-修改**/
    this.showSummaryProd = function(bussSysId,syspublish_id) {
        return CallProvider.call({
            actionName: "sp_ViewPjActionqueryPjEvaluate.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'business_sys_name': bussSysId,
                'syspublish_id': syspublish_id,
            }
        });
    }
    //发布执行重置
    this.reSet = function(syspublish_id) {
        return CallProvider.call({
            actionName: "sp_ResetExecuteAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'syspublish_id': syspublish_id,
            }
        });
    }
    //查询单个项目发布详细信息
    /**
     * 1.项目发布--结束的项目查看
     2.发布回退*/
    this.getOneProdExecInfo = function(business_sys_name, project_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjActiongetHistoryProjectDetails.do",
            reqData: {
                'org_rs_code': CV.rscode('his_prod_do'),
                'business_sys_name': business_sys_name,
                'project_name': project_name
            }
        });
    };
    //发布准备-根据节点类别查询发布包参数
    this.getOneProdPacParam = function(business_sys_name, project_name, node_type) {
        return CallProvider.call({
            actionName: "pj_ViewPjActionqueryPropackageParam.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'business_sys_name': business_sys_name,
                'project_name': project_name,
                'node_type': node_type
            }
        });
    }
    //发布准备-查询项目准备信息（含配置文件信息）
    this.getALLProjReadyInfo = function(busiSysId, projName) {
        return CallProvider.call({
            actionName: "pj_ViewPjActionqueryPreparePacList.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                business_sys_name: busiSysId,
                project_name: projName
            }
        });
    }
    //查询项目准备的配置文件及节点信息
    this.getProjNodeCfgFileInfo = function(busiSysId, projName) {
        return CallProvider.call({
            actionName: "pj_ViewPjActionqueryConfigList.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                business_sys_name: busiSysId,
                project_name: projName
            }
        });
    }
    //发布准备-配置文件获取
    this.getConfigFile = function(busiSysId, syspublish_id,soc_ip, path, download_soc_name, encoding_type) {
        return CallProvider.call({
            actionName: "sp_ReadConfigFileAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                business_sys_name: busiSysId,
                syspublish_id: syspublish_id,
                soc_ip: soc_ip,
                relative_path: path,
                download_soc_name: download_soc_name,
                encoding: encoding_type,
            }
        });
    };
    //发布准备-获取目录文件列表
    this.getFilesByPath = function(business_sys_name, projectName, path, nodeName, check_soc_name, download_soc_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjActionshowDirectory.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                business_sys_name: business_sys_name,
                project_name: projectName,
                root_bk_dir: path,
                node_name: nodeName,
                check_soc_name: check_soc_name,
                download_soc_name: download_soc_name
            }
        });
    }
    //发布准备-获取已经修改过的配置文件
    this.getModifyFileList = function(reqInfo) {
        reqInfo.org_rs_code = CV.rscode('prod_exec_list');
        return CallProvider.call({
            actionName: "pj_ViewPjActionqueryModifyFilePath.do",
            reqData: reqInfo
        });
    };
    //发布准备-保存修改后的配置文件
    this.saveConfigFile = function(fileInfo) {
        fileInfo.org_rs_code = CV.rscode('prod_exec_list');
        return CallProvider.call({
            actionName: "pj_WriteConfigFileAction.do",
            reqData: fileInfo
        });
    };
    //发布准备-删除修改后的自定义配置文件
    this.deleteConfigModifyFile = function(business_sys_name,sys_publish_id,soc_ip,download_soc_name,node_file_path,quick_publish) {
        return CallProvider.call({
            actionName: "pj_ViewPjActiondeleteModifyFile.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                business_sys_name: business_sys_name,
                syspublish_id: sys_publish_id,
                soc_ip:soc_ip,
                download_soc_name: download_soc_name,
                node_file_path: node_file_path,
                quick_publish:quick_publish
            }
        });
    }
    //发布准备-验证发布包
    this.validPropac = function(version_soc_name, propackage_full_path) {
        return CallProvider.call({
            actionName: "pj_ViewPjActionqueryPropacExist.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                version_soc_name: version_soc_name,
                propackage_full_path: propackage_full_path
            }
        });
    }
    //发布准备-验证发布清单
    this.validProlist = function(version_soc_name, prolist_full_path) {
        return CallProvider.call({
            actionName: "pj_ViewPjActionqueryProlistExist.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                version_soc_name: version_soc_name,
                prolist_full_path: prolist_full_path
            }
        });
    }
    //从版本机上传清单后下载现在
    this.downloadProdListFile = function(business_sys_name, project_name, version_soc_name, prolist_full_path) {
        return CallProvider.call({
            actionName: "pj_DownloadRemoteFileAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                business_sys_name: business_sys_name,
                project_name: project_name,
                version_soc_name: version_soc_name,
                file_full_path: prolist_full_path
            }
        });
    }
    //发布准备- 查询项目准备列表
    this.getListPreParedPj = function() {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActiongetListPreParedPj.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
            }
        });
    }
    //查询发布执行--日志信息(舍弃)
    this.getExecLogMsg = function(business_sys_name, project_name ,prog_type) {
        return CallProvider.call({
            actionName: "pj_ViewMonitorActiongetCurrentNodeMsg.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'business_sys_name': business_sys_name,
                'project_name': project_name,
                'prog_type' : prog_type
            }
        });
    };
    //查询发布执行--历史日志信息(舍弃)
    this.getHisLogMsg = function(business_sys_name, project_name) {
        return CallProvider.call({
            actionName: "pj_ViewMonitorActiongetHistoryNodeMsg.do",
            reqData: {
                'org_rs_code': CV.rscode('his_prod_do'),
                'business_sys_name': business_sys_name,
                'project_name': project_name
            }
        });
    };
    //发布回退
    this.rollback = function(project_name, business_sys_name, node_list) {
        return CallProvider.call({
            actionName: "pj_ExecutePjRollbackAction.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_list'),
                'business_sys_name': business_sys_name,
                'project_name' : project_name,
                'node_names'   : node_list
            },
            timeout: 3600
        });
    };
    //查询项目回退信息
    this.getRollbackSteps = function(busiSysId, projName) {
        return CallProvider.call({
            actionName: "pj_MonitorRollbackStepAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'business_sys_name': busiSysId,
                'project_name': projName
            }
        });
    };
    //编辑回退评价
    this.editRollbackSummary = function(rollback_summary) {
        return CallProvider.call({
            actionName: "pj_EditRollbackEvaluateAction.do",
            reqData: rollback_summary,
            timeout: 600
        });
    };
    //查询回退评价
    this.getRollbackSummary = function(syspublish_id, bussSysId) {
        return CallProvider.call({
            actionName: "pj_ViewPjActionqueryRollbackEvaluate.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'business_sys_name': bussSysId,
                'syspublish_id': syspublish_id,
            }
        });
    }
    //发布准备--查看清单/发布包类别(新) 旧服务sp_ViewSystemPrepareActionGetPublishMsg 新服务 pj_ViewPrepareActiongetPrepareMsg
    this.getReadyPacParamInfo = function(syspublish_id,program_id) {
        return CallProvider.call({
            actionName: "pj_ViewPrepareActiongetPrepareMsg.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'syspublish_id': syspublish_id,
                'program_id'  : program_id,
            }
        });
    };
    //回退准备--查看清单/发布包类别
    this.getRollbackReadyPacParamInfo = function(business_sys_name, syspublish_id,roll_prog_id) {
        return CallProvider.call({
            actionName: "sp_ViewSystemPrepareActiongetRollBackMsg.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                business_sys_name: business_sys_name,
                syspublish_id: syspublish_id,
                roll_prog_id:roll_prog_id
            }
        });
    };
    //发布准备--保存(新)
    this.saveReadyInfo = function(ready_info) {
        ready_info.org_rs_code = CV.rscode('prod_exec_list');
        return CallProvider.call({
            actionName: "sp_SystemPrepareAction.do",
            reqData: ready_info,
            timeout: 3600,
        });

    };
    //发布准备--从平台对接
    this.savePlatFilePath = function (syspublish_id, dir_names) {
        return CallProvider.call({
            actionName: "sp_DealPlatformPackageAction.do",
            reqData: {
                syspublish_id : syspublish_id,
                dir_names : dir_names
            },
            timeout: 3600,
        });
    };
    //发布准备--从平台对接--删除
    this.deletePlatTempFile = function (dir_names) {
        return CallProvider.call({
            actionName: "bj_DeletePlatformPackageAction.do",
            reqData: {
                dir_names : dir_names
            },
            timeout: 3600,
        });
    };
    //发布回退-获取系统节点列表
    this.getNodeslist=function(business_sys_name ,project_name ,prog_id){
        return CallProvider.call({
            actionName: "bs_ViewBsActiongetListNode.do",
            reqData: {
                'business_sys_name': business_sys_name,
                'project_name': project_name,
                'prog_id': prog_id,
                'org_rs_code': CV.rscode('busi_sys_list')
            }
        })
    };
    //发布回退-获取系统历史回退信息
    this.getHistroyRollbackInfo=function(business_sys_name,projName){
        return CallProvider.call({
            actionName: "pj_ViewPjActiongetRollBack.do",
            reqData: {
                'org_rs_code': CV.rscode('busi_sys_list'),
                'business_sys_name': business_sys_name,
                'project_name': projName
            }
        })
    };
    //查询发布执行--获取监控日志信息
    this.getMonitorExecLogMsg = function(execute_id) {
        return CallProvider.call({
            actionName: "sp_ViewMonitorActiongetConsole.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'execute_id': execute_id,
            }
        });
    };
    //发布执行--获取交互式组件的日志信息
    this.getMonitorInteractLogMsg = function(execute_id , phase_no) {
        return CallProvider.call({
            actionName: "pj_InteractMonitorAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'execute_id': execute_id,
                'phase_no': phase_no,
            }
        });
    };
    //发布执行--发送交互命令
    this.sendInteractCmdMsg = function(execute_id , phase_no ,cmd ,sensitive_flag) {
        return CallProvider.call({
            actionName: "pj_InteractMidCmdAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'execute_id': execute_id,
                'phase_no': phase_no,
                'cmd' : cmd,
                'sensitive_flag' : sensitive_flag
            }
        });
    };
    //发布执行--交互式Sql-获取节点文件信息
    this.interactiveSqlGetNode = function(execute_id) {
        return CallProvider.call({
            actionName: "sp_InitInteractSQLAction.do",
            reqData: {
                'execute_id': execute_id,
            }
        });
    };
    //发布执行--交互式Sql-执行Sql
    this.interactiveSqlExeSql = function(execute_id,node_ip,delimiter,sql_text) {
        return CallProvider.call({
            actionName: "sp_ExecuteInteractSQLAction.do",
            reqData: {
                'execute_id': execute_id,
                'sql_text': sql_text,
                'node_ip': node_ip,
                'delimiter': delimiter
            }
        });
    };
    //发布执行--交互式Sql-执行监控
    this.interactiveSqlExeMonitor = function(execute_id) {
        return CallProvider.call({
            actionName: "sp_ViewMonitorActionmonitorSqlExecuteMsg.do",
            reqData: {
                'execute_id': execute_id,
            },
            timeout : 3600
        });
    };
    //发布执行--交互式Sql-提交/回滚
    this.interactiveSqlSubmitOrRollback = function(execute_id,op_type,sql_exe_id) {
        return CallProvider.call({
            actionName: "sp_DoInteractSQLTranAction.do",
            reqData: {
                'execute_id': execute_id,
                'tran_type':op_type,
                'exe_id':sql_exe_id
            }
        });
    };
     //发布执行--交互式Sql-关闭操作
     this.interactiveSqlClose = function(execute_id) {
        return CallProvider.call({
            actionName: "sp_EndInteractSQLAction.do",
            reqData: {
                'execute_id': execute_id,
            }
        });
    };
    //发布执行--交互式Sql-切换文件编码方式
    this.interactiveSqlChangeEncoding = function(execute_id) {
        return CallProvider.call({
            actionName: "sp_InteractExecuteSQLAction.do",
            reqData: {
                'execute_id': execute_id,
            }
        });
    };
    //发布监控-获取节点下log文件列表
    this.getLogsFilesByPath = function(business_sys_name, projectName, path, nodeName, check_soc_name, download_soc_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjActionshowLogDirectory.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                business_sys_name: business_sys_name,
                project_name: projectName,
                root_bk_dir: path,
                node_name: nodeName,
                check_soc_name: check_soc_name,
                download_soc_name: download_soc_name
            }
        });
    }
    //发布监控-开始监控节点日志
    this.startMonitorNode = function(log_files) {
        return CallProvider.call({
            actionName: "sp_StartMonitorLogAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                log_file : log_files,
            }
        });
    };
    //发布监控-结束监控节点日志
    this.endMonitorNode = function(log_tasks) {
        return CallProvider.call({
            actionName: "sp_StopMonitorLogAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                 log_task :  log_tasks,
            }
        });
    };
    //发布监控-监控应用日志信息
    this.getMonitorLogInfo = function(log_tasks) {
        return CallProvider.call({
            actionName: "sp_MonitorLogMsgAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                log_file : log_tasks,
            }
        });
    };
    //发布执行-本地授权
    this.excuteLocalAuthor = function(syspublish_id){
        return CallProvider.call({
            actionName: "sp_PjExecuteAuthorityAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'syspublish_id': syspublish_id,
            }
        });
    };
    //发布执行-保存阶段执行节点信息
    this.savePhaseExecNodeInfo = function(execute_id, phase_no, soc_list ,parallel_flag){
        return CallProvider.call({
            actionName: "pj_ModifyExecuteNodeAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'execute_id': execute_id,
                'phase_no': phase_no,
                'soc_list' : soc_list,
                'parallel_flag' : parallel_flag
            }
        });
    };
    //发布执行-手动修改执行节点信息
    this.handEditExecNodeInfo = function(execute_id, phase_id, ip ,reason){
        return CallProvider.call({
            actionName: "sp_ModifyExecuteMsgAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'execute_id': execute_id,
                'phase_no': phase_id,
                'ip' : ip,
                'reason' : reason
            }
        });
    };
    //发布执行--监控节点端口信息
    this.monitorNodeMsg = function(business_sys_name, soc_ip) {
        return CallProvider.call({
            actionName: "bs_ViewNodeActionmonitorNode.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                'business_sys_name': business_sys_name,
                'soc_ip': soc_ip,
            }
        });
    };
    //敏捷发布--获取敏捷发布系统发布编号服务
    this.getQuickProjectName = function() {
        return CallProvider.call({
            actionName: "sp_ViewSysPublishActiongenerateSysPublishId.do",
            reqData: {}
        });
    };
    //敏捷发布--获取方案的发布包及配置文件信息服务
    this.getQuickProjectPac = function(business_sys_name,syspublish_id,environment_id,prog_id) {
        return CallProvider.call({
            actionName: "sp_ViewPjProgramActiongetProgramForPrepare.do",
            reqData: {
                'business_sys_name': business_sys_name,
                'syspublish_id': syspublish_id,
                'environment_id': environment_id,
                'prog_id': prog_id,
            }
        });
    };
    //发布准备--查看清单/发布包类别
    this.getReadyOldPacParamInfo = function(business_sys_name, project_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjProgramActiongetOldPrepareInfo.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
                business_sys_name: business_sys_name,
                project_name: project_name
            }
        });
    };
    //敏捷发布准备
    this.saveQuickReadyInfo = function(ready_info) {
        ready_info.org_rs_code = CV.rscode('prod_exec_list');
        return CallProvider.call({
            actionName: "sp_PrepareQuickProjectAction.do",
            reqData: ready_info,
            timeout: 3600,
        });
    };
    //敏捷发布项目关闭
    this.shutDownQuickProj = function(business_sys_name,syspublish_id,prod_flag) {
        return CallProvider.call({
            actionName: "pj_EndQuickPublishAction.do",
            reqData: {
                business_sys_name: business_sys_name,
                syspublish_id: syspublish_id,
                prod_flag: prod_flag
            },
        });
    };
    //获取配置文件物理节点数据源信息
    this.getDefinePhyInfo = function (sys_id,env_id) {
        return CallProvider.call({
            actionName: "bs_ViewStructActionqueryPhyNodeList.do",
            reqData: {
                sys_id: sys_id,
                env_id: env_id,
            },
        });
    };
}]);
//发布监控服务
ReleaseHttp.service('Monitor', ["CallProvider", "CV", function(CallProvider, CV) {
    //获得监控发布项目列表
    this.getprojplanTbl1 = function(pro_bk_date) {
        return CallProvider.call({
            //actionName: "pj_ViewMonitorActiongetProductionMonitorInfo.do",
            actionName: "pj_ViewPjMonitorActiongetSingleMonitor.do",
            reqData: {
                'org_rs_code': CV.rscode('exec_monitor_list'),
                'pro_bk_date': pro_bk_date
            }
        })
    };
  /*  //监控单个项目执行信息（原来的要废弃）
    this.monitorPjProject = function(busiSysId, projName ,prog_type) {
        return CallProvider.call({
            actionName: "pj_MonitorAllStepAction.do",
            reqData: {
                'org_rs_code': CV.rscode('exec_monitor_list'),
                'business_sys_name': busiSysId,
                'project_name': projName,
                'prog_type' : prog_type
            }
        });
    };*/
    //监控项目执行信息--单个阶段
    this.monitorPjProjectByOnePhase = function(busiSysId, projName) {
        return CallProvider.call({
            actionName: "pj_MonitorExePhaseAction.do",
            reqData: {
                'org_rs_code': CV.rscode('exec_monitor_list'),
                'business_sys_name': busiSysId,
                'project_name': projName
            }
        });
    };
    //监控单个项目执行信息（新的）
    /*
    * 1.项目执行发布回退页面获取执行步骤信息
    * 2.监控页面获取步骤信息
    * */
    this.monitorPjProject = function(execute_id) {
        return CallProvider.call({
            actionName: "sp_MonitorPhaseAction.do",
            reqData: {
                'org_rs_code': CV.rscode('exec_monitor_list'),
                'execute_id': execute_id,
            }
        });
    };

    //新版--获得监控发布项目列表所有信息
    this.getAllMonitorInfomation = function() {
        return CallProvider.call({
            actionName: "pj_ViewProjectActiongetAllPjMonitorInfo.do",
            reqData: {
                'org_rs_code': CV.rscode('exec_monitor_list'),
            }
        })
    };
    //新版--获得动态改变的项目信息
    this.getchangedMonitorInfomation = function(pro_bk_date) {
        return CallProvider.call({
            actionName: "pj_ViewPjMonitorActionqueryMonitor.do",
            reqData: {
                'org_rs_code': CV.rscode('exec_monitor_list'),
                'pro_bk_date': pro_bk_date
            }
        })
    };
    //新版--获得单个分组信息列表
    this.getPjGroupToProcessMsg = function(group_id) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActiongetPjToProcessMsg.do",
            reqData: {
                'org_rs_code': CV.rscode('exec_monitor_list'),
                'group_id': group_id
            }
        })
    };
    //新版--保存节点信息
    this.savePjToProcess = function(data){
        return CallProvider.call({
            actionName: "pj_MakePjToProcessAction.do",
            reqData: {
                'org_rs_code': CV.rscode('exec_monitor_list'),
                'dynamic': data.dynamic,
                'group_id':data.group_id,
                'group_name':data.group_name,
                'proj_list':data.proj_list,
            }
        })
    };
}]);
//发布计划服务
ReleaseHttp.service('Plan', ["$q", "CallProvider", "CV", function($q, CallProvider, CV) {
    //查询计划项目列表
    this.getPlan = function(pro_bk_date) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionqueryListPlanCal.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'pro_bk_date': pro_bk_date
            }
        })
    };
    //更新计划
    this.updatePlan = function(updateParam) {
        return CallProvider.call({
            actionName: "pj_UpdatePjProjectPlanAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'business_sys_name': updateParam.sysName,
                'project_name': updateParam.projName,
                'start_bk_time': updateParam.plantime,
                'prebs_sys_name': updateParam.preSysName,
                'pre_project_name': updateParam.preProjName,
                'pro_bk_date': updateParam.plandate,
                'auto_yn_flag': updateParam.autoYnFlag  //手动/自动执行标志
            }
        })
    };
    //获得历史计划--列表表头数据（显示日期，项目数）
    this.getHistoryplan = function() {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionqueryProdPlanDate.do",
            reqData: {
                'org_rs_code': CV.rscode('history_plan_list')
            }
        })
    };
    //根据计划日期获得当日发布项目列表
    this.getPlanProjTbl = function(params) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionqueryProdPlanList2.do",
            reqData: {
                'org_rs_code': CV.rscode('history_plan_list'),
                'pro_bk_date': params.pro_bk_date
            }
        });
    }
    //获得发布项目列表
    this.getProdProjTbl = function(params) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionqueryProdPlanList.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_exec_list'),
            }
        });
    }
    //根据日期获得当日可选前置项目列表
    this.getPreProjListByDate = function(project_name, business_sys_name, pro_bk_date) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionqueryPjPlanByDate.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'project_name': project_name,
                'business_sys_name': business_sys_name,
                'pro_bk_date': pro_bk_date
            }
        });
    }
    //根据项目名，系统名获取编列信息
    this.queryPlanData = function(sys_name, project_name) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionqueryRelatedPlanInfo.do",
            reqData: {
                'business_sys_name': sys_name,
                'project_name': project_name
            }
        });
    }
    //查询分组列表
    this.getGroupList = function() {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionqueryGroupInfo.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list')
            }
        });
    };
    //根据分组组号与日期查询项目列表
    this.getProjListByGroup = function(params) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionqueryPjListByGroup.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'group_id': params.group_id,
                'pro_bk_date': params.pro_bk_date
            }
        });
    }
    //查询所有未编入分组的项目列表
    this.getCanGroupProjList = function() {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionqueryNoGroupPjList.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list')
            }
        });
    }
    //查询前置关联号列表
    this.getPreGroupNumberList = function() {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionqueryGroupNumberList.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list')
            }
        });
    }
    //根据分组编号查询所有前后置关系项目列表
    this.getPreProjListByGroupNumber = function(params) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActionqueryPjWebInfoByGroupNumber.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'group_number': params.group_number
            }
        });
    }
    //保存&修改分组
    this.saveOrUpdateGroup = function(group_info) {
        return CallProvider.call({
            actionName: "pj_EditGroupAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'group_id': group_info.group_id,
                'proj_list': group_info.proj_list,
                'group_cn_name': group_info.group_cn_name
            }
        });
    }

    //查询单个分组下的监控数据
    this.getProjListByGroupMonitor = function(group_id) {
        return CallProvider.call({
            //modify
          //  actionName: "pj_ViewMonitorActionqueryMonitorInfoByGroup.do",
                actionName: "pj_ViewPjMonitorActionqueryGroupMonitor.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'group_id': group_id
            }
        });
    }
    //查询单个分组前置监控信息
    this.getPreProjListByGroupMonitor = function(group_number) {
        return CallProvider.call({
            //modify
           // actionName: "pj_ViewMonitorActionqueryMonitorInfoByGroupNumber.do",
            actionName: "pj_ViewPjMonitorActionqueryPreMonitor.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'group_number': group_number
            }
        });
    }
    //获取流程定制信息
    this.getProcessByGroup = function(group_id) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActiongetPjProcessMsg.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'group_id': group_id
            }
        });
    }
    //修改流程定制信息
    this.updateProcessByGroup = function(group_id, process_msg) {
        return CallProvider.call({
            actionName: "pj_PjMakeProcessAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'group_id': group_id,
                'process_msg': process_msg
            }
        });
    };
    //刷新流程定制的阶段状态信息
    this.getDiagramPhaseStatus = function(group_id) {
        return CallProvider.call({
            actionName: "pj_ViewPjPlanActiongetMonitorPjProcessMsg.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'group_id': group_id
            }
        });
    }

    //查看发布申请的编列信息
    this.getProjectPlanInfo = function(pjpublish_id) {
        return CallProvider.call({
            actionName: "pj_ViewProjectActiongetBusinessPhaseList.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'pjpublish_id': pjpublish_id
            }
        });
    }
    //保存发布申请的编列信息
    this.saveProjectPlanInfo = function(pjpublish_id,publishBusinesslist) {
        return CallProvider.call({
            actionName: "pj_PlanPjPublishAction.do",
            reqData: {
                'org_rs_code': CV.rscode('prod_plan_list'),
                'pjpublish_id': pjpublish_id,
                'publishBusinesslist': publishBusinesslist
            }
        });
    }


}]);
//统计分析服务
ReleaseHttp.service('Analysis', ["CallProvider", "CV", function(CallProvider, CV) {
    //获取方案图表数据
    this.getProgramData = function() {
        return CallProvider.call({
            actionName: "st_QueryProgramLineAction.do",
            reqData: {
                'org_rs_code': CV.rscode('regular_prod_analysis'),
            }
        });
    };
    //根据年份获取图表分组数据
    this.getYearDataGroupMonth = function(year) {
        return CallProvider.call({
            actionName: "st_QueryRegonLineAction.do",
            reqData: {
                'org_rs_code': CV.rscode('regular_prod_analysis'),
                'prod_year': year
            }
        });
    };
    //获取(一般&大型)项目表格数据
    this.getProdTblData = function(params, projType) {
        return CallProvider.call({
            actionName: "st_QueryProjectLineAction.do",
            reqData: {
                'org_rs_code': CV.rscode('proj_prod_analysis'),
                'prod_year': params.year,
                'project_nature': projType,
                'start_recd': params.data.offset,
                'limit_recd': params.data.limit,
                'order_col_name': params.data.sort,
                'order_type': (params.data.order == 'desc' ? '1' : '2')
            }
        });
    };
    //获取紧急项目表格数据
    this.getUnGentTabData = function(params) {
        return CallProvider.call({
            actionName: "st_QueryEmgonLineAction.do",
            reqData: {
                'org_rs_code': CV.rscode('urgent_prod_analysis'),
                'prod_year': params.prod_year
            }
        })
    }
}]);
//发布窗口服务
ReleaseHttp.service('PubWindow', ["CallProvider", "CV", function(CallProvider, CV) {
    //查询发布窗口列表
    this.getPubWindowList = function(window_status) {
        return CallProvider.call({
            actionName: "pj_ViewPublishWindowActionqueryWindow.do",
            reqData: {
                'org_rs_code': CV.rscode('pub_window_list'),
                window_status : window_status
            }
        })
    };
    //保存例行窗口配置
    this.saveRoutineWindow = function(start_date,end_date,cycle_list) {
        return CallProvider.call({
            actionName: "pj_AddRoutineWindowAction.do",
            reqData: {
                'org_rs_code': CV.rscode('pub_window_list'),
                'start_date': start_date,
                'end_date': end_date,
                'cycle_list': cycle_list
            }
        })
    };
    //保存特殊窗口配置
    this.saveSpecialWindow = function(window_list) {
        return CallProvider.call({
            actionName: "pj_AddSpecialWindowAction.do",
            reqData: {
                'org_rs_code': CV.rscode('pub_window_list'),
                'window_list': window_list
            }
        })
    };
    //保存特殊日配置
    this.saveSpecialDayWindow = function(close_reason,date_list) {
        return CallProvider.call({
            actionName: "pj_CloseBatchWindowAction.do",
            reqData: {
                'org_rs_code': CV.rscode('pub_window_list'),
                'date_list': date_list,
                'close_reason': close_reason,
            }
        })
    };
    //查询发布的项目根据发布窗口
    this.getPublishProjectByWindow = function(window_id) {
        return CallProvider.call({
            actionName: "pj_ViewPublishWindowActionqueryProjectByWindow.do",
            reqData: {
                'org_rs_code': CV.rscode('pub_window_list'),
                window_id : window_id
            }
        })
    };
    //查询发布的项目根据发布窗口及时间
    this.getPublishProjectByDate = function(start_date,end_date) {
        return CallProvider.call({
            actionName: "pj_ViewPublishWindowActionquerySystemByDate.do",
            reqData: {
                'org_rs_code': CV.rscode('pub_window_list'),
                start_date : start_date,
                end_date : end_date
            }
        })
    };
    //关闭窗口
    this.closePubWindow = function(window) {
        return CallProvider.call({
            actionName: "pj_CloseWindowAction.do",
            reqData: {
                'org_rs_code': CV.rscode('pub_window_list'),
                'window': window,
            }
        })
    };

}]);
//版本管理
ReleaseHttp.service('Version', ["CallProvider", "CV", function(CallProvider, CV) {
    //获取版本数据列表
    this.getStreamListByKey = function(key_word,version_type,sdflow_type){
        return CallProvider.call({
            actionName: "vs_ViewVsVersionActiongetVsVersionList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'business_cn_name': key_word,
                'version_type':version_type,
                'sdflow_type':sdflow_type
            }
        });
    }
    //获取版本详细（根据vsid）
    this.getOnePub = function(vsversion_id){
        return CallProvider.call({
            actionName: "vs_ViewVsVersionActiongetVsInfoDetailByVsId.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'vsversion_id':  vsversion_id
            }
        });
    }
    //新增版本
    this.addOneVersion=function(upload_info){
        return CallProvider.call({
            actionName: "vs_UpdateVersionFileAction.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'app_bean':upload_info.app_bean,
                'config_list':upload_info.config_list,
                'other_list':upload_info.other_list,
                'business_sys_name':upload_info.business_sys_name,
            },
            timeout: 3600,
        });
    }
    //获取全量版本流程数据
    this.getflowData =  function(sys_name){
        return CallProvider.call({
            actionName: "vs_ViewVsVersionActiongetFullFlowBySysName.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'business_sys_name':  sys_name
            }
        });
    }
    this.getPubData = function(sys_name){
        return CallProvider.call({
            actionName: "vs_ViewVsVersionActiongetPubFlowBySysName.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'business_sys_name':  sys_name
            }
        });
    }
    //获取初始版本上传路径
    this.getInitializeUploadPath = function(_business_sys_name){
        return CallProvider.call({
            actionName: "vs_ViewVsVersionActiongetVersionUploadPath.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'business_sys_name':_business_sys_name
            }
        });
    }
    //初始化获取文件
    this.getFoldTree = function (file_absolute_path) {
        return CallProvider.call({
            actionName: "vs_ViewVersionStreamActiongetFileListByDir.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'file_absolute_path':file_absolute_path,
            }
        });
    }
    //根据路径获取ip
    this.getIpBypath = function (file_absolute_path) {
        return CallProvider.call({
            actionName: "vs_ViewVersionStreamActiongetIpByPath.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'file_absolute_path':file_absolute_path ? file_absolute_path : ''
            }
        });
    }
    //发布流备份发布文件比对
    this.pubAndBakTreeCompare = function (dir,compare_dir,compare_type,full_backup_flag,business_sys_name,dir_relate_path,compare_relate_path) {
        return CallProvider.call({
            actionName: "vs_ViewVersionStreamActioncompareTarDirectory.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'dir':dir ? dir : '',
                'compare_dir'   :compare_dir ? compare_dir :'',
                'dir_relate_path':dir_relate_path ? dir_relate_path :'',
                'compare_relate_path' :compare_relate_path ? compare_relate_path :'',
                'compare_type':compare_type,
                'full_backup_flag':full_backup_flag,
                'business_sys_name':business_sys_name
            },
            timeout: 1800
        });
    }
    //根据ip获取配置文件
    this.getConfigFileByIp = function (file_absolute_path) {
        return CallProvider.call({
            actionName: "vs_ViewVersionStreamActiongetConfigByIp.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'file_absolute_path':file_absolute_path ? file_absolute_path : '',
            }
        });
    }
    //目录比对
    this.foldTreeCompare = function (dir,compare_dir,full_backup_flag) {
        return CallProvider.call({
            actionName: "vs_ViewVersionStreamActioncompareDirectory.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'dir':dir ? dir : '',
                'compare_dir'   :compare_dir ? compare_dir :''
            },
            timeout: 1800
        });
    }
    //搜索文件
    this.searchFile = function (file_absolute_path,key_word,tar_relate_path,pub_flag) {
        return CallProvider.call({
            actionName: "vs_ViewVersionStreamActiongetFileListByName.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'file_absolute_path':file_absolute_path,
                'key_word'    :     key_word,
                'tar_relate_path': tar_relate_path,
                'pub_flag'  :pub_flag
            }
        });
    }
    //查询投产包清单配置文件
    this.getPubStreamFileList = function (file_absolute_path,pkg_type) {
        return CallProvider.call({
            actionName: "vs_ViewVersionStreamActiongetPubFileList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'file_absolute_path':file_absolute_path,
                'pkg_type':pkg_type
            }
        });
    }
    //查询版本列表
    this.getPubVersionList = function (sys_name) {
        return CallProvider.call({
            actionName: "vs_ViewVsVersionActiongetFlowBySysName.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'business_sys_name':  sys_name
            }
        });
    }
    //发布流查看目录
    this.getPubStreamFold = function (file_absolute_path,business_sys_name) {
        return CallProvider.call({
            actionName: "vs_ViewVersionStreamActiongetTarFileList.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'file_absolute_path': file_absolute_path,
                'business_sys_name': business_sys_name
            }
        });
    };
    //查看tar下目录
    this.getFoldInTarPac = function (file_absolute_path,tar_relative_path,business_sys_name) {
        return CallProvider.call({
            actionName: "vs_ViewVersionStreamActiongetTarFileListByDir.do",
            reqData: {
                'org_rs_code': CV.rscode(''),
                'file_absolute_path': file_absolute_path,
                'tar_relate_path' : tar_relative_path,
                'business_sys_name': business_sys_name
            }
        });
    };
    //查看文件信息
    this.viewfileContent = function(file_info) {
        return CallProvider.call({
            actionName: "vs_ViewVsVersionActionviewFileContext.do",
            reqData: file_info
        });
    };
    //查询所有版本号
    this.getfileVersionNum = function(version_info) {
        return CallProvider.call({
            actionName: "vs_ViewVsVersionActiongetVersionHistory.do",
            reqData: version_info
        });
    };
    //查询所有文件变更的版本号
    this.getUpdatefileVersionNum = function(version_info) {
        return CallProvider.call({
            actionName: "vs_ViewVsVersionActiongetHistoryFlow.do",
            reqData: version_info,
            timeout:1800 //超时半小时
        });
    };
    //文件比对
    this.getFileCompareContent = function(file_info) {
        return CallProvider.call({
            actionName: "vs_ViewVsVersionActiondiffFileByPath.do",
            reqData: file_info,
            timeout:600 //超时10分钟
        });
    };
    //文件下载
    this.downloadFile = function(file_info) {
        return CallProvider.call({
            actionName: "vs_ViewVsVersionActiondownloadVsFileByPath.do",
            reqData: file_info,
            timeout:3600 //超时1个小时
        });
    };


}]);
//大屏监控服务--独立模块
ReleaseHttp.service('LargeMonitor', ["CallProvider","$location","$cookieStore","CommData","CV", function(CallProvider,$location,$cookieStore,CommData,CV) {
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
    //获取待发布的系统数量
    this.getUnpublishSys = function (){
        return CallProvider.call({
            actionName: "sp_ViewSysPublishActionqueryReadyPublishList.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode('')
            })
        });
    };
    //getPublishedSys
    //获取已发布的系统数量
    this.getPublishedSys = function (){
        return CallProvider.call({
            actionName: "sp_ViewSysPublishActionqueryAlreadyPublishList.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode('')
            })
        });
    };
    //获取所有系统列表(旋转项目用)
    this.getAllSys = function (){
        return CallProvider.call({
            actionName: "sp_ViewSysPublishActionqueryCirclePublishList.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode('')
            })
        });
    };
    //获取执行中的项目
    this.getRunningPublishSys = function (){
        return CallProvider.call({
            actionName: "sp_ViewSysPublishActionqueryRunningPublishList.do",
            reqData: angular.extend(reqdata,{
                'org_rs_code': CV.rscode('')
            })
        });
    };
}]);



