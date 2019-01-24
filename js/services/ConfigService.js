'use strict';
var configSrv = angular.module('ConfigService', []);

//各模块下的表单与列表样式
configSrv.service('config',function() {
    //绑定列表样式
    this.buildTblConfigCol = function(config_word, row_index, width) {
        return [
            '<div class="tbl_config">',
            '<div class="tbl-config-menu">',
            '<div class="pp" style="width: '+ (width || 220) +'px;right:-362px;">',
            config_word,
            '</div>',
            '</div>',
            '<div class="tbl-config-cls">',
            row_index % 2 == 0 ? '<div class="cog" name="'+row_index+'" style="background-color: #FFF; cursor: pointer;">' : '<div class="cog" name="'+row_index+'" style="background-color: #F6F7FC; cursor: pointer;">',
            '<i class="glyphicon glyphicon-cog" style="cursor: pointer;"></i>',
            '</div>',
            '</div>',
            '</div>'
        ].join("");
    }
    //发布项目列表-操作列
    this.getProjTblConfigCol = function(value, row, index) {
        var _tabpath,back_flag;
        _tabpath='proj_info';
        back_flag = 'proj_list';
        var _config_word = [
            //'<a class="search" title="查看项目" href=#/proj_detail/'+row.project_short_name+'/'+row.business_sys_name+'/'+row.project_name+'>',
            //    '<i class="glyphicon glyphicon-search"></i>',' 查看 ',
            //'</a>',
            '<a class="search" title="查看项目" href=#/pro_proj_detail/'+row.project_name+'/'+row.business_sys_name+'/'+_tabpath+'/'+back_flag+'>',
            '<i class="glyphicon glyphicon-search"></i>',' 查看 ',
            '</a>',
            row.project_status > 2? '' : ' | <a class="tasks" title="修改项目信息" href=#/edit_proj/'+row.project_short_name+'/'+row.business_sys_name+'/'+row.project_name+'><i class="glyphicon glyphicon-edit"></i> 修改 </a> ',
            row.project_status > 2? '' : '| <a class="trash" title="删除项目" href="javascript:void(0)" id='+row.project_name+' value='+row.business_sys_name+'><i class="glyphicon glyphicon-trash"></i> 删除 </a>',
        ].join('');
        return this.buildTblConfigCol(_config_word, index);
    };
    //历史项目列表-操作列
    this.getHistoryProjTblConfigCol = function(value, row, index) {
        var _tabpath,back_flag;
        _tabpath='proj_info';
        back_flag = "his_proj_list";
        /*var _config_word = '<a class="search" title="查看项目" href=#/history_proj_detail/'+row.project_short_name+'/'+row.business_sys_name+'/'+row.project_name+'><i class="glyphicon glyphicon-search"></i> 查看 </a>';*/
        var _config_word = '<a class="search" title="查看项目" href=#/his_proj_detail/'+row.project_name+'/'+row.business_sys_name+'/'+_tabpath+'/'+back_flag+'><i class="glyphicon glyphicon-search"></i> 查看 </a>';
        if(row.register_flag==2  && row.project_status < 3) {
            _config_word += '  |  <a class="reply" title="重启项目" style="cursor: pointer;" id='+row.project_name+'|'+row.business_sys_name+'|'+row.project_short_name+'><i  class="fa fa-reply-all"></i> 重启 </a>';
        }
        if(row.register_flag==2 && row.project_status == 3) {
            _config_word += '  |  <a class="end" title="结束项目" href=#/finish_proj/'+row.project_short_name+'/'+row.business_sys_name+'/'+row.project_name+'><i  class="glyphicon glyphicon-off"></i> 结束 </a>';
        }
        return this.buildTblConfigCol(_config_word, index);
    };
    //准备项目列表-操作列
    this.getProjReadyTblConfigCol = function(value, row, index) {
        var _tabpath ='ready_info';
        var _config_word = [
                '<a class="search" title="查看准备信息" href=#/pre_proj_detail/'+row.project_name+'/'+row.business_sys_name+'/'+_tabpath+'/'+'pre_proj'+'>',
                '<i class="glyphicon glyphicon-search"></i>',' 查看',
                '</a>'+'   |  <a class="search" title="发布准备" href=#/prod_pre_new_detail/'+row.project_short_name+'/'+row.project_name+'/'+row.business_sys_name+'>',
                '<i class="fa fa-ellipsis-h"></i>',' 准备 ',
                '</a>'
            ].join('');
        return this.buildTblConfigCol(_config_word, index);
    };
    //发布项目列表-操作列
    this.getprojexecTblConfigCol =function(value, row, index) {
        var _tabpath ='prod_info';
        var _config_word='';
        _config_word += '<a class="see" href=#/pre_exec_proj_detail/'+row.project_name+'/'+row.business_sys_name+'/'+_tabpath+'/'+'pre_exec'+' title="查看发布步骤"><i class="glyphicon glyphicon-search"></i> 查看 </a>';
        if(row.project_status <= 3 ) {
            //_config_word += '  |  <a class="exec" href=#/prod_exec_do/'+row.project_short_name+'/'+row.project_name+'/'+row.business_sys_name+' title="执行项目发布"><i class="glyphicon glyphicon-play"></i> 执行</a>'
            _config_word += '  |  <a class="exec" style="cursor: pointer;" id='+row.project_name+'|'+row.business_sys_name+'|'+row.project_short_name+'|'+row.cmd_error_flag+'|'+row.auto_yn_flag+'|'+row.project_status+' title="执行项目发布"><i class="glyphicon glyphicon-play"></i> 执行</a>'
        } else if(row.project_rollback == 2) {
            _config_word += '  |  <a class="see" href=#/prod_exec_rollback/'+row.project_short_name+'/'+row.project_name+'/'+row.business_sys_name+'/'+row.project_status+' title="发布回退"><i class="fa fa-undo"></i> 回退</a>';
        }
        if(!row.prod_flag){
            _config_word += '  |  <a class="reply" style="cursor: pointer;" id='+row.project_name+'|'+row.business_sys_name+'|'+row.project_short_name+' title="重置"><i  class="fa fa-reply-all"></i> 重置 </a>'
        }
        return this.buildTblConfigCol(_config_word, index);

    };
    //历史发布项目列表-操作列-暂未使用
    this.getTblConfigCol = function(value, row, index) {
        var _tabpath ='prod_info';
        var _config_word = '<a class="see" title="查看项目" href=#/his_pre_proj_detail/'+row.project_name+'/'+row.business_sys_name+'/'+_tabpath+'/'+'his_pre_exec'+'><i class="glyphicon glyphicon-search"></i> 查看 </a>';
        return this.buildTblConfigCol(_config_word, index);
    };
    //历史计划列表-操作列
    this.getHistoryprojplanTblConfigCol = function(value, row, index) {
        var _tabpath ='plan_info';
        var _config_word = [
            '<a class="search" title="查看项目" href=#/his_plan_proj_detail/'+row.project_name+'/'+row.business_sys_name+'/'+_tabpath+'/'+'his_plan'+'>',
            '<i class="glyphicon glyphicon-search"></i>',' 查看 ',
            '</a>'
        ].join('');
        return this.buildTblConfigCol(_config_word, index);
    };
    //计划编列列表-操作列
    this.getprojplanTblConfigCol =function(value, row, index, day, tabState){
        var _tabpath ='plan_info';
        var _config_word ;
        if(tabState == 0){
            _config_word = '<a class="search" title="查看编列信息" href=#/plan_proj_detail/'+row.project_name+'/'+row.business_sys_name+'/'+_tabpath+'/'+'plan_detail'+'><i class="glyphicon glyphicon-search"></i> 查看 </a>';
            if(row.project_status < 3){
                if(row.planset_type ==1){
                    _config_word +='  |  <a title="编列计划" class="edit"    href="javascript:void(0)" id='+row.project_name+'|'+row.business_sys_name+'><i class="glyphicon glyphicon-edit"></i> 编列计划</a>';
                }else{
                  _config_word += '  |  <a title="编列计划" class="listalt" href="javascript:void(0)" id='+row.project_name+'|'+row.business_sys_name+'><i class="glyphicon glyphicon-list-alt"></i> 编列计划</a>';
                }
            }
        }else if(tabState == 1){
            _config_word = '<a class="search" title="查看编列信息" href=#/plan_pre_detail/'+row.project_name+'/'+row.business_sys_name+'/'+_tabpath+'/'+'plan_pre_detail'+'><i class="glyphicon glyphicon-search"></i> 查看 </a>';
        }else{
            _config_word = '<a class="search" title="查看编列信息" href=#/plan_group_detail/'+row.project_name+'/'+row.business_sys_name+'/'+_tabpath+'/'+'plan_group_detail'+'><i class="glyphicon glyphicon-search"></i> 查看 </a>';
        }
        return this.buildTblConfigCol(_config_word, index);
    };
    //业务系统列表-操作列
    this.getBusiSysTblConfigCol = function(value, row, index) {
        var _config_word = [
            '<a class="edit" title="修改系统" href=#/edit_busi_sys/'+row.business_cn_name+'/'+row.business_sys_name+'>',
            '<i class="glyphicon glyphicon-edit"></i>',' 修改 ',
            '</a>| ',
            '<a class="tasks" title="配置系统目录/节点/模板/参数等" href=#/config_busi_sys/'+row.business_sys_name+'/'+'node'+'>',
            '<i class="fa fa-wrench"></i>',' 配置 ',
            '</a>| ',
            '<a class="trash" title="删除系统" href="javascript:void(0)" id='+row.business_sys_name+'>',
            '<i class="glyphicon glyphicon-trash"></i>',' 删除',
            '</a>'
        ].join('');
        return this.buildTblConfigCol(_config_word, index, 250);
    };
    ////模板列表-操作列
    //this.getTemplateTblConfigCol = function(value, row, index) {
    //    var _config_word = [
    //        '<a title="查看" class="search"  href=#/template_detail/'+row.template_name+'>',
    //        '<i class="glyphicon glyphicon-search"></i>',' 查看 ',
    //        '</a>| ',
    //        '<a title="修改" class="edit"  href=#/template_modify/'+row.template_name+'>',
    //        '<i class="glyphicon glyphicon-edit"></i>',' 修改 ',
    //        '</a>| ',
    //        '<a title="配置修改" class="edit"  href=#/modify_template_config/'+row.template_name+'>',
    //        '<i class="glyphicon glyphicon-edit"></i>',' 配置修改 ',
    //        '</a>| ',
    //        '<a title="配置查看" class="search"  href=#/template_config_detail/'+row.template_name+'>',
    //        '<i class="glyphicon glyphicon-edit"></i>',' 配置查看 ',
    //        '</a>| ',
    //        '<a title="删除" class="trash"  href="javascript:void(0)" id='+row.template_name+'>',
    //        '<i class="glyphicon glyphicon-trash"></i>',' 删除',
    //        '</a>',
    //    ].join('');
    //    return this.buildTblConfigCol(_config_word,index,400);
    //};
    //模板列表--操作列
    this.getTemplateTblConfigCol = function(value, row, index) {
        if(row.template_formate == 1){
            var _config_word = [
                '<a title="查看" class="search"  href=#/template_detail/'+row.template_name+'>',
                '<i class="glyphicon glyphicon-search"></i>',' 查看 ',
                '</a>| ',
                '<a title="修改" class="edit"  href=#/template_modify/'+row.template_name+'>',
                '<i class="glyphicon glyphicon-edit"></i>',' 修改 ',
                '</a>| ',
                '<a title="删除" class="trash"  href="javascript:void(0)" id='+row.template_name+'>',
                '<i class="glyphicon glyphicon-trash"></i>',' 删除',
                '</a>',
            ].join('');
        }else{
            var _config_word = [
                '<a title="查看" class="search"  href=#/tmpl_detail/'+row.template_name+'>',
                '<i class="glyphicon glyphicon-search"></i>',' 查看 ',
                '</a>| ',
                '<a title="修改" class="edit"  href=#/edit_tmpl/'+row.template_name+'>',
                '<i class="glyphicon glyphicon-edit"></i>',' 修改 ',
                '</a>| ',
                '<a title="删除" class="trash"  href="javascript:void(0)" id='+row.template_name+'>',
                '<i class="glyphicon glyphicon-trash"></i>',' 删除',
                '</a>',
            ].join('');
        }
        return this.buildTblConfigCol(_config_word,index,200);
    };


    //用户-消息列表-操作列
    this.getmg_PageTblConfigCol = function(value, row, index) {
        var _config_word = [
            "<a class='search' title='查看消息' href='#/mes_detail/"+row.work_seq+"'>",
            '<i class="glyphicon glyphicon-search"></i>',' 查看 ',
            '</a>| ',
            '<a class="trash" title="删除消息" href="javascript:void(0)" id='+row.work_seq+'>',
            '<i class="glyphicon glyphicon-trash"></i>',' 删除',
            '</a>'
        ].join('');
        return this.buildTblConfigCol(_config_word, index);
    };
    //用户-我的任务列表-操作列
    this.getMineTblConfigCol = function(value, row, index) {
        var _config_word = [
            row.workflow_state == 1 || row.workflow_state == 3 ? ' <a class="search" title="查看" href=#/task_check_mine/'+row.pend_work_seq+'/'+row.workflow_state+'><i class="glyphicon glyphicon-search"></i> 查看 </a> ' : '<a class="search" title="处理" href=#/task_handle/'+row.pend_work_seq+'/'+row.workflow_state+'><i class="glyphicon glyphicon-edit"></i> 处理 </a>',
            '</a>'
        ].join('');
        return this.buildTblConfigCol(_config_word, index);
    };
    //用户-复核任务列表-操作列
    this.gettaskeViewTblConfigCol = function(value, row, index) {
        var _config_word = [
            row.unhandle == 0 ? '<a class="search" title="复核" href=#/task_examine_view/'+row.pend_work_seq+'/'+row.workflow_state+'><i class="glyphicon glyphicon-edit"></i> 复核 </a> ' :' <a class="search" title="查看" href=#/task_check_view/'+row.pend_work_seq+'/'+row.workflow_state+'><i class="glyphicon glyphicon-search"></i> 查看 </a> ',
            '</a>'
        ].join('');
        return this.buildTblConfigCol(_config_word, index);
    };
    //用户-授权任务列表-操作列
    this.gettaskAuthTblConfigCol = function(value, row, index) {
        var _config_word = [
            row.unhandle == 0 ?'<a class="search" title="授权" href=#/task_examine_auth/'+row.pend_work_seq+'/'+row.workflow_state+'><i class="glyphicon glyphicon-edit"></i> 授权 </a> ' :'<a class="search" title="查看" href=#/task_check_auth/'+row.pend_work_seq+'/'+row.workflow_state+'><i class="glyphicon glyphicon-search"></i> 查看 </a> ',
            '</a>'
        ].join('');
        return this.buildTblConfigCol(_config_word, index);
    };
    //用户-故障单任务列表-操作列
    this.gettaskTroubleTblConfigCol = function(value, row, index){
        var _config_word = [
            '<a class="search" title="查看" href=#/trouble_ticket_task/'+row.pg_work_seq+'><i class="glyphicon glyphicon-search"></i>'+((row.pgwork_status ==4 || row.pgwork_status ==5) ? '查看':'处理')+' </a> '
        ].join('');
        return this.buildTblConfigCol(_config_word, index);
    };
    //用户-历史任务列表-操作列
    this.gettaskHTblConfigCol = function(value, row, index, tabState) {
        var _config_word = [
            tabState == 1 ? '<a class="search" title="查看任务" href=#/his_task_check_mine/'+row.pend_work_seq+'/'+row.workflow_state+'>' : tabState == 2 ? '<a class="search" title="查看任务" href=#/his_task_check_view/'+row.pend_work_seq+'/'+row.workflow_state+'>' :'<a class="search" title="查看任务" href=#/his_task_check_auth/'+row.pend_work_seq+'/'+row.workflow_state+'>',
            '<i class="glyphicon glyphicon-search"></i>',' 查看 ',
            '</a>'
        ].join('');
        return this.buildTblConfigCol(_config_word, index);
    };
    //用户-通讯录列表整理
    this.rebuildContactsList = function(userList) {
        var resList =[];
        for(var i = 0; i < 5; i ++) {
            var resOne = [];
            for(var j = 0; j < 4; j ++) {
                if(userList[(i*4)+j]) {
                    resOne.push(userList[(i*4)+j]);
                }
            }
            resList.push(resOne);
        }
        return resList;
    };
    //处理工单---方案操作列
    this.getPromgramConfigCol = function(value, row, index){
        /*返回的1是可用,2是不可用*/
        if(row.pg_yn_flag == 2){
            return [
                '<div class="tbl_config" style="width: 100px;">',
                '<i  title="不可使用" style="font-size: 12px;color:#CCC;margin-top: 6px;cursor: pointer;font-style:normal;">不可使用</i>',
                '</div>',
            ].join('');
        }else{
            return [
                '<div class="tbl_config" style="width: 100px;">',
                '<i class="fa fa-edit user" title="使用" style="font-size: 14px;margin-top: 6px;cursor: pointer;"></i>', ,
                (row.pg_source == 1 || row.pg_source == 3) ? '<i style="font-size: 14px;margin-left:20px;cursor: pointer;" title="预览" class="fa fa-eye preview"></i>' : '<i style="font-size: 14px;margin-left:20px;cursor: pointer;" title="下载" class="fa fa-download download"></i>',
                '</div>',
            ].join('');
        }
    }
    //组件列表--操作列-new
    this.getCmptListTblConfigCol = function(value, row, index) {
        var type=1;
        var _module_purpose = row.module_purposes.indexOf(2)!=-1 ? false: true;
        var _config_word = [
            '<a title="删除" class="trash"  href="javascript:void(0)"><i class="fa fa-trash-o"></i> 删除</a> | ',
            row.publish_state == 2 || !row.publish_state ? '<a title="发布" class="publish"  href="javascript:void(0)"><i class="fa fa-check"></i> 发布</a> | ' :'',
            _module_purpose ? '<a title="测试" class="test" href=#/cmpt_test/'+row.id+'/'+row.cn_name+'/'+type+'><i' + ' class="fa fa-map-marker"></i> 测试</a> | ':'',
            '<a title="修改" class="edit" href=#/edit_cmpt/'+row.id+'><i class="fa fa-pencil-square-o"></i> 修改</a> | ',
            '<a title="查看" class="search" href=#/detail_cmpt/'+row.id+'><i class="fa fa-search"></i> 查看</a>'
        ].join('');

        return this.buildTblConfigCol(_config_word, index,310);
    };
    //组件组列表--操作列-new
    this.getCmptsListTblConfigCol = function(value, row, index) {
        var type=2;
        if(row.publish_state == 2 || !row.publish_state ){
            var _config_word = [
                '<a title="删除" class="trash"  href="javascript:void(0)"><i class="fa fa-trash-o"></i> 删除</a> | ',
                '<a title="发布" class="publish"  href="javascript:void(0)"><i class="fa fa-check"></i> 发布</a> | ',
                '<a title="测试" class="test" href=#/cmpts_test/'+row.id+'/'+row.cn_name+'/'+type+'><i' + ' class="fa fa-map-marker"></i>测试</a> | ',
                '<a title="修改" class="edit" href=#/edit_cmpts/'+row.id+'><i class="fa fa-pencil-square-o"></i> 修改</a> | ',
                '<a title="查看" class="search" href=#/detail_cmpts/'+row.id+'><i class="fa fa-search"></i> 查看</a>'
            ].join('');
        }else{
            var _config_word = [
                '<a title="删除" class="trash"  href="javascript:void(0)"><i class="fa fa-trash-o"></i> 删除</a> | ',
                '<a title="测试" class="test" href=#/cmpts_test/'+row.id+'/'+row.cn_name+'/'+type+'><i' + ' class="fa fa-map-marker"></i> 测试</a> | ',
                '<a title="修改" class="edit" href=#/edit_cmpts/'+row.id+'><i class="fa fa-pencil-square-o"></i> 修改</a> | ',
                '<a title="查看" class="search" href=#/detail_cmpts/'+row.id+'><i class="fa fa-search"></i> 查看</a>'
            ].join('');
        }
        return this.buildTblConfigCol(_config_word, index,310);
    }
    this.getMyTaskTblConfigCol = function(value, row, index, tabState){
        var _config_word="";
        //
        if(tabState == 'running'){
            var run_common_word=[
                '<a class="close_stop" title="停止" href="javascript:void(0)"><i class="glyphicon glyphicon-record"></i> 停止 </a>',
                ' <a title="删除" class="trash"  href="javascript:void(0)"><i class="glyphicon glyphicon-trash"></i> 删除 </a>',
                ' <a class="search" title="监控" href=#/cj_pend_task_watch/'+row.work_id+'><i class="fa fa-eye"></i> 监控 </a>',
                ' <a class="monitor" title="查看" href=#/cj_run_task_detail/'+row.work_id+'><i class="glyphicon glyphicon-search"></i> 查看 </a> ',
            ].join('|');
            return this.buildTblConfigCol(run_common_word, index,250);
        } else if(tabState == 'automatic'){
            var auto_common_word = [
                '<a class="search" title="查看" href=#/cj_pend_task_detail/'+row.work_id+'><i class="glyphicon glyphicon-search"></i> 查看 </a>',
            ].join('|');
            var delete_word=  ' | <a class="delete" title="删除" href="javascript:void(0)"><i class="glyphicon glyphicon-trash"></i> 删除 </a> ';
            var watch_word = ' | <a class="search" title="监控" href=#/cj_pend_task_watch/'+row.work_id+'><i class="fa fa-eye"></i> 监控 </a>';
            if(row.status==0 ||row.status==1){
                _config_word=auto_common_word+watch_word;
            }else if(row.status==2||row.status==3 ||row.status==4){
                _config_word=auto_common_word+delete_word;
            }
            return this.buildTblConfigCol(_config_word, index);
        }else{
            var _config_word = [
                '<a class="search" title="查看" href=#/edit_workorder/'+row.order_seq+'><i class="glyphicon glyphicon-search"></i> 查看 </a>',
            ].join('|');
            return this.buildTblConfigCol(_config_word, index);
        }
    };
    //自动采集--采集方案库列表--操作列
    this.getFangAnTblConfigCol = function(value, row, index){
        //1.发布成功2.未发布3.未通过校验
        var _common;
        var _config_word = [
            '<a class="trash" title="删除" href="javascript:void(0)"><i class="glyphicon glyphicon-trash"></i> 删除 </a>| ',
            '<a class="edit" title="修改" href=#/edit_cjprog/'+row.prog_id+'><i class="glyphicon glyphicon-edit"></i> 修改 </a>| ',
            '<a class="search" title="查看" href=#/detail_cj_prog/'+row.prog_id+'><i class="glyphicon glyphicon-search"></i> 查看 </a>',
        ].join('');
        var _publish= '<a class="publish" title="发布" href="javascript:void(0)">|<i  class="fa fa-check"></i> 发布 </a>';
        if(row.publish_state==2){
            _common=_config_word+_publish;
        }else{
            _common=_config_word;
        }
        return this.buildTblConfigCol(_common, index,250);
    };
    //自动巡检-数据库列表
    this.getDataBaseTblConfigCol=function(value,row,index){
        var _config_word = [
            '<a class="trash" title="删除" href="javascript:void(0)"><i class="glyphicon glyphicon-trash"></i> 删除 </a>| ',
            '<a class="edit" title="导入" href=#/edit_xjdatabase/'+row.data_name+'><i class="glyphicon glyphicon-edit"></i> 导入 </a>| ',
            '<a class="search" title="查看" href=#/xjdatabase_detail/'+row.data_name+'><i class="glyphicon glyphicon-search"></i> 查看 </a>',
        ].join('');
        return this.buildTblConfigCol(_config_word, index,250);
    }
    //自动巡检-巡检任务列表
    this.getXjTaskTblConfigCol=function(value,row,index){
        var _config_word = [
            (row.intask_status == 1 || row.intask_status == 5) ? '<a class="trash" title="删除" href="javascript:void(0)"><i class="fa fa-trash-o"></i> 删除 </a>| ' : '',
            '<a class="search" title="查看" href=#/new_detail_xjtask/'+row.work_id+'><i class="fa fa-search"></i> 查看 </a>',
        ].join('');
        return this.buildTblConfigCol(_config_word, index,250);
    }
    //自动巡检-巡检报告列表
    this.getXjReprotTblConfigCol=function(value,row,index){
        var _config_word = [
            '<a class="trash" title="删除" href="javascript:void(0)"><i class="glyphicon glyphicon-trash"></i> 删除 </a>| ',
            '<a class="search" title="查看" href="javascript:void(0)"><i class="glyphicon glyphicon-search"></i> 查看 </a>| ',
            '<a class="export" title="导出" href="javascript:void(0)"><i class="glyphicon glyphicon-new-window"></i> 导出 </a>',
        ].join('');
        return this.buildTblConfigCol(_config_word, index,250);
    }
    //自动巡检-指标模型列表
    this.getIndexModuleTblConfigCol=function(value,row,index){
        var _config_word = [
            '<a class="trash" title="删除" href="javascript:void(0)"><i class="glyphicon glyphicon-trash"></i> 删除 </a>| ',
            '<a class="edit" title="修改" href=#/edit_indexmodule/'+row.index_module_name+'/'+index+'><i class="glyphicon glyphicon-edit"></i> 修改 </a>| ',
            '<a class="search" title="查看" href=#/index_module_detail/'+row.index_module_name+'/'+index+'><i class="glyphicon glyphicon-search"></i> 查看 </a>',
        ].join('');
        return this.buildTblConfigCol(_config_word, index,250);
    }
    //插件库列表-操作列
    this.getPluginTblConfigCol = function(value, row, index) {
        var _config_word = [
            '<a class="edit" title="修改运行环境" href="javascript:void(0)">',
            '<i class="glyphicon glyphicon-edit"></i>',' 修改 ',
            '</a>| ',
            '<a class="trash" title="删除运行环境" href="javascript:void(0)">',
            '<i class="glyphicon glyphicon-trash"></i>',' 删除',
            '</a>'
        ].join('');
        return this.buildTblConfigCol(_config_word, index, 150);
    };



    //运维当前任务列表-操作列
    this.getywTaskTblConfigCol = function(value, row, index) {
        var _config_word = [];
        if(row.sddispatch_type ==2){
            _config_word = [
                '<a class="search" title="查看" href=#/yw_task_exec/'+row.sdtask_id+'>',
                '<i class="glyphicon glyphicon-search"></i>',' 查看 ',
                '</a>'
            ].join('');
        }else {
             _config_word = [
                '<a class="search" title="查看" href=#/yw_task_detail/'+row.sdtask_id+'>',
                '<i class="glyphicon glyphicon-search"></i>',' 查看 ',
                '</a>| ',
                '<a class="search" title="执行" href=#/yw_task_exec/'+row.sdtask_id+'>',
                '<i class="glyphicon glyphicon-play"></i>',' 执行 ',
                '</a>'
            ].join('');
        }
        return this.buildTblConfigCol(_config_word, index);
    };
    //运维历史任务列表-操作列
    this.getywHisTaskTblConfigCol = function(value, row, index) {
        var _config_word = [
            '<a class="search" title="查看" href=#/yw_task_detail/'+row.sdtask_id+'>',
            '<i class="glyphicon glyphicon-search"></i>',' 查看 ',
            '</a>'
        ].join('');
        return this.buildTblConfigCol(_config_word, index);
    };
});
//业务系统-配置节点共享关系
configSrv.service('DirNodeShare', function() {
    //根据返回数据重构补全目录和节点的共享关系
    this.reBuildDirNodeShareData = function(_dir_nodes, _dirs, _nodes) {
        var ret_dn = [];
        //生成原始的
        for(var i = 0; i < _dirs.length; i ++) {
            var _tds = [];  //一行
            var _dir = _dirs[i];
            for(var j = 0; j < _nodes.length; j ++) {
                var _node = _nodes[j];
                if(_dir.dirshare_type == 1) {           //全共享
                    _tds.push({node_soc_ip: _node.node_soc_ip, share_flag: 1});
                } else if (_dir.dirshare_type == 3) {   //非共享
                    _tds.push({node_soc_ip: _node.node_soc_ip, share_flag: 2});
                } else {
                    _tds.push({node_soc_ip: _node.node_soc_ip, share_flag: function(_dirId, _node_soc_ip, dirNodeList) {
                        var type = 2;
                        for(var k = 0; k < dirNodeList.length; k ++) {
                            var dirNode = dirNodeList[k];
                            if(dirNode.dir_id == _dirId) {
                                var nodes = dirNode.list_dirnode ? dirNode.list_dirnode : [];
                                for(var x = 0; x < nodes.length; x ++) {
                                    var nodex = nodes[x];
                                    if(nodex.node_soc_ip == _node_soc_ip) {
                                        type = nodex.share_flag;
                                        break;
                                    }
                                }
                            }
                        }
                        return type;
                    }(_dir.dir_id, _node.node_soc_ip, _dir_nodes)});
                }
            }
            ret_dn.push({'dir_id': _dir.dir_id, 'dir_cn_name':_dir.bk_dir, 'dirshare_type': _dir.dirshare_type, 'list_dirnode': _tds});
        }
        return ret_dn;
    }
});
//表格操作服务
configSrv.service('Col_Fmt',["ProjState","ProjGroupColor", "WorkorderType", "WoStatusType", "IML_TYPE", "PublishState","CmptType","intaskState","coTaskState", "TaskState","FlowType", "OpTaskExeStatus", "StrategyGroupType", "pluginType","uploadType", "CV",function(ProjState, ProjGroupColor, WorkorderType, WoStatusType, IML_TYPE, PublishState, CmptType,intaskState,coTaskState,TaskState,FlowType,OpTaskExeStatus, StrategyGroupType, pluginType,uploadType, CV) {
    this.px100Fmt = function(value) {
        if(!value) {
            return '<div title="未定义！" style="min-height: 24px; width: 100px;">--</div>';
        } else {
            return '<div title='+value+' style="min-height: 24px; width: 100px;word-break:break-all;">'+value+'</span>';
        }
    };
    this.px130Fmt = function(value) {
        if(!value) {
            return '<div title="未定义！" style="min-height: 24px; width:130px;">--</div>';
        } else {
            return '<div title='+value+' style="min-height: 24px; width:130px;word-break:break-all;">'+value+'</div>';
        }
    };
    this.px140Fmt = function(value) {
        return '<div title='+value+' style="width:140px; min-height: 24px;word-break:break-all;">'+value+'</div>';
    };
    this.px160Fmt = function(value) {
        return '<div title='+value+' style="width:160px; min-height: 24px;word-break: break-all; ">'+value+'</div>';
    };
    this.px170Fmt = function(value) {
        if(!value) {
            return '<div title="未定义！" style="min-height: 24px; width: 170px;">--</div>';
        } else {
            return '<div title='+value+' style="min-height: 24px; width: 170px;word-break:break-all;">'+value+'</div>';
        }
    };
    this.px250Fmt = function(value) {
        return '<div title='+value+' style="min-height: 24px; width:250px;word-break:break-all;">'+value+'</div>';
    };
    this.percent80Fmt = function(value){
        return '<div title='+value+' style="min-height: 24px; width:80%;word-break:break-all;">'+value+'</div>';
    };
    this.andCnName = function(value, row) {
        if(value) {
            return '<span title='+row.business_cn_name+' style="width:160px;">'+row.business_cn_name+ '</span>';
        } else {
            return '<span style="width:160px;">&nbsp;&nbsp;<span style="color: #999;">系统不存在！</span></span>';
        }
    };
    this.padding20Fmt = function(value, row, index) {
        if(!value){
            return '<div title="未定义！" style="color: #999">--</div>';
        }else{
            return '<div title='+value+' style="word-break: break-all; ">'+value+'</div>';
        }
    };
    this.dataTimeFmt = function(value,row,index){
        return '<div title='+value+' style="word-break: break-all;">'+row.create_bk_date +' '+row.create_bk_time+'</div>';
    };
    //服务器列表--是否配置agent
    this.isConfigAgent = function(value, row, index){
        if(value == 3){ //存在且已配置
            return '<div><span style="display: inline-block" class="status-img status-img-succ"></div>';
        }else{
            return '<div title="未定义！" style=" color: #999">--</div>';
        }
    };
    this.noZeroFmt = function(value) {
        return value == 0 ? "" : value;
    };
    this.downListFmt = function(value){
        var str ='';
        for(var i=0;i<value.length;i++){
            str = str + '<span class="download_text"><a class="'+i+'" style="cursor: pointer;color: #44dcfd;word-break:break-all;">'+value[i]+'</a></span> ';
        }
        return str;
    };
    this.downOneFmt = function(value){
        return '<span class="download_text" style="padding:2px;"><a  style="cursor: pointer;color: #44dcfd;word-break:break-all;">'+value+'</a></span>'
    };
    this.projNatureFmt = function(value) {
        if (value == 1) {
            return '<span>'+"例行发布"+'</span>';
        } else if (value == 2) {
            return '<span>'+"紧急发布"+'</span>';
        } else if (value == 3) {
            return '<span>'+"一般项目发布"+'</span>';
        } else if (value == 4) {
            return '<span>'+"大型项目发布"+'</span>';
        } else if (value == 5) {
            return '<span>'+"特大型项目发布"+'</span>';
        }
    };
    this.projExecAutoFmt = function(value, row) {
        if(row.auto_yn_flag == 1) { //自动
            return "<span><i class='fa fa-clock-o' style='font-size: 16px; color: #1D9C72;' title='定时自动执行'></i>"+row.start_bk_time+"</span>";
        } else {
            return "<span>"+row.start_bk_time+"</span>";
        }
    };
    this.projStatusFmt = function(value, row) {
        var _proj_status_cn = CV.findValue(value, ProjState);
        if(value == 1) {    //待准备
            if(row.register_flag == 1) {
                return '<span">--</span>';
            }else{
                return '<div style="color:#FFF; width: 16px; height: 16px;display:inline-block; background: url(img/publish/new_img/pre_exe.png) no-repeat;background-size: 16px auto; margin: 0;margin-top:2px;"></div> <span style="display: inline-block;vertical-align: top;margin-top: 2px;">'+_proj_status_cn+'</span>';
            }
        } else if(value == 2) { //待执行
            return '<div style="color:#FFF; width: 16px; height: 16px;display:inline-block; background: url(img/publish/new_img/wait_exe.png) no-repeat; background-size: 16px auto;  margin: 0;margin-top:2px;"></div> <span style="display: inline-block;vertical-align: top;margin-top: 2px;">'+_proj_status_cn+'</span>';
        } else if(value == 3) { //执行中
            return '<div  class="rotate-pub-list" style="color:#FFF; width: 16px; height: 16px;display:inline-block; background: url(img/publish/new_img/exec.png) no-repeat; background-size: 16px auto;  margin: 0;margin-top:2px;"></div> <span style="display: inline-block;vertical-align: top;margin-top: 2px;">'+_proj_status_cn+'</span>';
        } else if(value == 4) { //自动结束
            return '<div style="color:#FFF; width: 16px; height: 16px;display:inline-block; background-image: url(img/publish/new_img/exe_finish.png);background-repeat: no-repeat; background-size: 16px auto;   margin: 0;margin-top:2px;"></div> <span style="display: inline-block;vertical-align: top;margin-top: 2px;">'+_proj_status_cn+'</span>';
        } else if(value == 5) { //手动结束
            return '<div style="color:#FFF; width: 16px; height: 16px;display:inline-block; background-image: url(img/publish/new_img/hand_fail.png);background-repeat: no-repeat; background-size: 16px auto;  margin: 0;margin-top:2px;"></div> <span style="display: inline-block;vertical-align: top;margin-top: 2px;">'+_proj_status_cn+'</span>';
        } else if(value == 6) { //回退中
            return '<div class="rotate-pub-list" style="color:#FFF; width: 16px; height: 16px;display:inline-block; background-image: url(img/publish/new_img/exec.png);background-repeat: no-repeat; background-size: 16px auto;  margin: 0;margin-top:2px;"></div> <span style="display: inline-block;vertical-align: top;margin-top: 2px;">'+_proj_status_cn+'</span>';
        } else if(value == 7) { //回退成功
            return '<div style="color:#FFF; width: 16px; height: 16px;display:inline-block; background-image: url(img/publish/new_img/back_suc.png);background-repeat: no-repeat; background-size: 16px auto;  margin: 0;margin-top:2px;"></div> <span style="display: inline-block;vertical-align: top;margin-top: 2px;">'+_proj_status_cn+'</span>';
        } else if(value == 8) { //回退失败
            return '<div style="color:#FFF; width: 16px; height: 16px;display:inline-block; background-image: url(img/publish/new_img/back_fail.png);background-repeat: no-repeat; background-size: 16px auto;  margin: 0;margin-top:2px;"></div> <span style="display: inline-block;vertical-align: top;margin-top: 2px;">'+_proj_status_cn+'</span>';
        } else if(value == 9) { //待回退
            return '<div style="color:#FFF; width: 16px; height: 16px;display:inline-block; background-image: url(img/publish/new_img/wait_back.png);background-repeat: no-repeat; background-size: 16px auto;  margin: 0;margin-top:2px;"></div> <span style="display: inline-block;vertical-align: top;margin-top: 2px;">'+_proj_status_cn+'</span>';
        } else {
            return '<span>无效状态</span>';
        }
    };
    this.prodFlagFmt = function(value) {
        if (value == 1) {
            return '<div class="prod_list_status_img prod_success_position"></div>';
        } else if (value == 2) {
            return '<div class="prod_list_status_img prod_fail_position"></div>';
        } else {
            return '<div style="width: 24px;padding-left: 6px; ">--</div>';
        }
    };
    this.workOrderFlagFmt = function(value,row){
        if(row.urgency_level == 2){
            return '<div style=" width: 130px; word-break:break-all;color:#E9416E;cursor: default" title="紧急">'+value+'</div>';
        }else{
            return '<div style="width: 130px;word-break:break-all;cursor: default">'+value+'</div>';
        }

    };
    this.workOrderFmt = function(value, row){
        return '<div style="word-break:break-all;cursor: default">'+value+'</div>';
    };
    this.workOrderTypeFmt = function(value, row){
        var _type = CV.findValue(value, WorkorderType)
        return '<div style="cursor: default">'+_type+'</div>';
    };
    this.workOrderStateFmt = function(value, row){
        var _state = CV.findValue(value, WoStatusType)
        return '<div style="cursor: default">'+_state+'</div>';
    };
    this.workOrderTimeFmt = function(value, row){
        var _time =value.substring(0,value.length-3);
        return '<div style="word-break:break-all;width:120px;cursor: default">'+_time+'</div>';
    };
    this.complete_FlagFmt =function(value){
        if(value){
            return '已完成';
        }else{
            return '未完成';
        }
    };
    //敏捷发布项目名称格式化
    this.projectNameFmt = function(value , row){
        var _quick_html = '';
        if(row.quick_publish && row.quick_publish == 1 ){
            _quick_html = '<span class="quick-project-icon" title="敏捷发布项目"></span>'
        }
        if(!value){
            return '<div  style="min-height: 24px;white-space:nowrap;overflow: hidden;color: #D2F1FE;">--</div>';
        }else{
            return '<div style="white-space:nowrap;overflow: hidden;min-height: 24px;position: relative;padding-left: 15px;" title="'+value+'">'+ _quick_html+value+'</div>';
        }
    };
    //单元格内容过长隐藏
    this.hideDetailFmt = function(value){
        if(!value){
            return '<div  style="min-height: 24px;white-space:nowrap;overflow: hidden;color: #D2F1FE;">--</div>';
        }else{
            return '<div style="white-space:nowrap;overflow: hidden;min-height: 24px;" title="'+value+'">'+value+'</div>';
        }
    };
    this.hideLogDetailFmt = function(value){
        var real_str="";
        if(!value){
            return '<div title="日志已经被删除!" style="min-height: 24px;white-space:nowrap;overflow: hidden;color: #D2F1FE;">日志已经被删除</div>';
        }else{
            real_str=value.replace(/null/g,"--");
            return '<div style="white-space:nowrap;overflow: hidden;min-height: 24px;" title="'+real_str+'">'+real_str+'</div>';
        }
    };
    this.showDownMsg = function(value){
        if(!value){
            return '<div title="下载成功" style="min-height: 24px;white-space:nowrap;overflow: hidden;color:#43FC8C;">下载成功</div>';
        }else{
            return '<div style="white-space:nowrap;overflow: hidden;min-height: 24px;color:#D2F1FE;" title="'+value+'">'+value+'</div>';
        }
    }
    //日期状态装换
    this.timeTypeFomat = function(value){
        var _real="";
        if(value==0){
            _real="日";
        } else if(value==1){
            _real="周";
        }else if(value==2){
            _real="月";
        }
        return _real;
    }
    //发布窗口列表窗口状态
    this.pubWindowStatusFmt = function (value, row) {
        var _value = row.window_status == 1 ? '开启':'关闭';
        return '<span>'+_value+'</span>'
    };
    //发布窗口列表窗口状态
    this.pubWindowTypeFmt = function (value, row) {
        var _value = row.window_type == 1 ? '例行窗口':'特殊窗口';
        return '<span>'+_value+'</span>'
    };
    //全选
    this.checkAllFmt=function(value){
        return '<input type="checkbox" name="cmpt_type" i-check  ng-model="value.choose"/>'
/*        return '<div style="white-space:nowrap;overflow: hidden;min-height: 24px;" title="'+value+'">'+value+'</div>';*/
    };
    this.formByteToM=function(value){
        var real=""
        if(parseInt(value)==0){
            return 0+"M";
        }else {
            if (parseInt(value) < 1024) {
                real = value + "b"
            } else if (1024 < parseInt(value)) {
                if (parseInt(value) < 1048576) {
                    real = Math.floor(parseInt(value) / (1024)) + "kb"
                } else {
                    real = Math.floor(parseInt(value) / (1024 * 1024)) + "M"
                }
            }
        }
            return real;
    };
    //设置上传方式
    this.formByUploadType=function(value){
        var _real_value=CV.findValue(value,uploadType);
        if(!value){
            return '<div title="未定义！" style="min-height: 24px;white-space:nowrap;overflow: hidden;">--</div>';
        }else{
            return '<div style="white-space:nowrap;overflow: hidden;min-height: 24px;" title="'+_real_value+'">'+_real_value+'</div>';
        }
    }
    this.flowEditFmt = function(value,row){
        if(row.sddispatch_type){
            return '<a class="edit_flow" style="white-space: nowrap; overflow: hidden; min-height: 24px; word-break: break-all; min-width: 84px;" href="javascript:void(0);" title="'+value+'">'+value+'</a>';
        }
    };
    //固化方案列表--方案名称列格式
    this.programFmt = function(value,row){
        if(!value){
            return '<div title="未定义！" style="min-height: 24px;white-space:nowrap;overflow: hidden;cursor: default;">--</div>';
        }else if(row.pg_source ==2){
            return '<div style="white-space:nowrap;overflow: hidden;cursor: default;min-height: 24px;" title="'+value+'"><span style="display: inline-block; font-size: 12px; border: 1px solid red; border-radius: 4px; color: red; margin-right: 5px; padding: 0px 2px; width: 18px; height: 20px;line-height: 18px;">批</span>'+value+'</div>';
        }else if(row.pg_source ==3){
            return '<div style="white-space:nowrap;overflow: hidden;cursor: default;min-height: 24px;" title="'+value+'"><span style="display: inline-block; font-size: 12px; border: 1px solid red; border-radius: 4px; color: red; margin-right: 5px; padding: 0px 2px; width: 18px; height: 20px;line-height: 18px;">导</span>'+value+'</div>';
        }else{
            return '<div style="white-space:nowrap;overflow: hidden;cursor: default;min-height: 24px;" title="'+value+'">'+value+'</div>';
        }
    };
    //方案单元格内容过长隐藏
    this.hideContentFmt = function(value){
        if(!value){
            return '<div title="未定义！" style=";white-space:nowrap;overflow: hidden;cursor: default;">--</div>';
        }else{
            return '<div style="white-space:nowrap;overflow: hidden;cursor: default;" title="'+value+'">'+value+'</div>';
        }
    };
    //方案创建时间格式化
    this.programTimeFmt = function(value, row){
        var _time =value.substring(0,value.length-3);
        return '<div style="word-break:break-all;width:120px;cursor: default">'+_time+'</div>';
    };
    //发布-发布项目-发布时间格式
    this.proBkTimeFmt = function(value, row){
        return '<div style="word-break:break-all;width:140px;">'+value+'&nbsp;<span>'+row.start_bk_time+'</span></div>';
    };
    //前置项目组的标记
    this.groupFmt = function(value, row) {
        //计划列表
        //if (!row.group_number) {
        //    return '<span title='+value+' style="padding-left: 14px;width:130px;word-break:break-all;">'+value+'</span>';
        //} else {
        //    if(row.ungroup_state) {
        //        return '<span title='+value+' style="padding-left: 14px;width:130px;word-break:break-all;">'+value+'</span>';
        //    }else{
        //        return '<span style="word-break:break-all;display:block;min-width:100px" title='+value+'><i class="glyphicon glyphicon-stop" style= "word-break:break-all;color:' + ProjGroupColor[(row.group_number -1)%6] + '"></i>'+value+'</span>'
        //    }
        //}
    };
    //项目执行倒计时
    this.timeCDFormat = function(value, row) {
        var today = new Date();
        if(row.project_status < 3) {   //尚未执行的项目
            var _run_time = CV.toDate(row.pro_bk_date +" "+ row.start_bk_time);
            if(_run_time <= today) {
                return "--";
            } else {
                if(row.auto_yn_flag == 1) {
                    return "<span><i class='fa fa-clock-o' style='font-size: 16px; color: #1D9C72;' title='定时自动执行'></i>"+CV.dateCD(today, _run_time)+"</span>";
                } else {
                    return "<span>"+CV.dateCD(today, _run_time)+"</span>";
                }
            }
        } else {
            return "--";
        }
    };
    //计划时间格式化
    this.planTimeFmt = function(value, row) {
        if(row.planset_type == 1 || row.project_status >= 3) {
            if(row.auto_yn_flag == 1) {
                return "<span><i class='fa fa-clock-o' style='font-size: 16px; color: #1D9C72;' title='定时自动执行'></i>"+row.start_bk_time+"</span>";
            } else {
                return row.start_bk_time;
            }
        } else {
            return '<span style="color:#2AB1FF">待列入计划</span>';
        }
    };
    //项目列表-执行人显示
    this.executeUserFmt = function(value, row, index){
        var _html = "";
        var _user_all_list = "";
        if(value){
            var _user_list = value.split(',');
            for(var i=0;i<_user_list.length;i++){
                _user_all_list += '<div class="node_list_hover_style" style="padding:5px 14px;word-break: break-all;">'+_user_list[i]+'</div>'
            }
            _html = [
                '<div style="position: relative">',
                '<div  style="padding-left: 25px;">'+_user_list[0]+'</div>',
                _user_list.length <= 1 ?  '': '<div class="animate_active" style="position: absolute;top:0;left: 0px;color: #ddd"><i class="fa fa-users" style="vertical-align: middle;margin-left: 5px;"></i></div>',
                '<div class="user_modal" style="position: absolute;color: #333; margin-top: -51px; margin-left: -134px; display: none;font-size: 12px;z-index: 9;">',
                '<div style="position: absolute;top:24px;left: 120px;z-index: 10;width: 17px;height: 30px;transform:rotate(180deg);overflow: hidden;">',
                '<div style="height: 17px;width: 17px; transform: rotate(30deg) skewX(-18deg) translateX(10px);position: absolute; left:0px;background-color: #fff;border: 1px solid #ebebeb;"></div>',
                '</div>',
                '<div style="border-radius: 5px;background-color: #fff;box-shadow: 1px 1px 6px #999;border: 1px solid #ebebeb;">',
                '<div style="background-color: #f7f7f7;border-bottom: 1px solid #ebebeb;border-radius: 5px 5px 0 0;padding: 5px 14px;width: 120px;">执行人列表</div>',
                _user_all_list,
                '</div>',
                '</div>',
                '</div>'];
        }else{
            _html = ['<div title="未定义！" style="min-height: 24px; width: 120px;padding-left: 25px;">--</div>'];
        }
        return _html.join("");
    };
    //前置项目格式化
    //this.preProjFmt = function(value) {
    //    if(!value){
    //        value = '-';
    //    }
    //    return '<span title='+value+' style="min-width:66px;word-break:break-all;display:block">'+value+'</span>';
    //}
    //特大型项目名称标记
    this.majorBigProjFmt = function(value, row) {
        var majorBigFlag = '';
        if(row.project_nature == 5){
            majorBigFlag = '<i class="glyphicon glyphicon-flag" style="color:red;" title='+row.project_name+'></i>';
        }
        return '<span title='+row.project_name+' style=" width:140px;">'+ majorBigFlag + row.project_name+'</span>';
    };
    //任务状态
    this.taskStatusFmt = function(value) {
        if (value == 1) {
            return '待复核';
        } else if (value == 3) {
            return '待授权';
        } else if (value == 5) {
            return '待执行';
        } else if(value == 4){
            return '授权拒绝';
        }else if(value == 2){
            return '复核拒绝';
        }else if(value == 6){
            return '执行完毕';
        }else if(value == 7){
            return '关闭任务';
        } else {
            return '';
        }
    };
    //待执行任务列表-任务进度明细
    this.taskProgressFmt = function(value,row,index) {
        var readlypoint =0;
        var past = 0,state = true;
        var total = row.work_detail_list.length;
        for(var i=0;i< total;i++){
            if(row.work_detail_list[i].work_state == 1){
                past = past +1;
            }
            if(row.work_detail_list[i].work_state == 2){
                state = false;
            }
        }
        var str ='<div class="event" style="cursor:pointer;position:absolute;width:'+(total-1)*50+'px;margin-top: -18px;height: 36px;padding-top: 18px;">';
        str = str +'<div style="position:absolute;border:1px solid #CCCCCC;width:'+(total-1)*50+'px;"></div>';
        for(var i=1;i<=past;i++){
            readlypoint = readlypoint +1;
            str = str+'<div style="position:relative;width:9px;height:9px;border-radius:100%;background-color: #0095A5;top:'+-((readlypoint -1) * 9 + 4)+'px;left:'+((readlypoint -1) * 50 -4)+'px;"></div>';
        }
        if(!state){
            str = str +'<div style="position:relative;width:9px;height: 9px;border-radius: 100%;background-color:#F72B44;top:'+-(readlypoint * 9  + 4)+'px;left:'+(readlypoint * 50  - 4)+'px;cursor: pointer;"></div>';
        }else{
            str = str +'<div style="position:relative;width:21px;height: 21px;border-radius: 100%;background-color:#0095A5;top:'+-(readlypoint * 9  + 10 + 1)+'px;left:'+(readlypoint * 50  - 10)+'px;cursor: pointer;"></div>';
        }
        for(var j= 1,count=0;j< total-past ;j++){
            count =count +1;
            if(!state){
                if(j == total-past-1){
                    str = str +'<div style="position:relative;width:21px;height: 21px;border-radius: 100%;background-color:#0095A5;top:'+-((readlypoint + count -1) * 9 + 19)+'px;left:'+((readlypoint+count) * 50  - 10)+'px;"></div>';
                }else{
                    str = str +'<div style="position:relative;width:9px;height: 9px;border-radius: 100%;background-color:#CCCCCC;top:'+-((readlypoint + count -1) * 9 + 9 + 4)+'px;left:'+((readlypoint+count) * 50  - 4)+'px;"></div>';
                }

            }else{
                str = str +'<div style="position:relative;width:13px;height: 13px;border-radius: 100%;background-color:white;border:1px solid #0095A5;top:'+-(readlypoint * 9 + 21 + 6 + (count-1) * 13)+'px;left:'+(((readlypoint+count) * 50  - 6))+'px;"></div>';
            }
        }
        str = str +'</div>';
        str = str +'<div class="displayNone leave" style="color:#D2F1FE;z-index:10000;background-color: #091016;width: 450px;height:auto;position: absolute;right: 260px;margin-top:18px;padding:6px 0px;">';

        for(var k =1;k<=total;k++){
            str = str+'<div style="padding:2px 10px;">';
            str =str +'<span style="color:#d2f1fe;padding:8px;background-color:#253549;display:inline-block;width:160px;text-align:center;margin-left: 8px;">--</span>';
            str =str +'<span style="color:#d2f1fe;padding:8px;background-color:#253549;display:inline-block;width:220px;text-align:center;margin-left:4px;">--</span>';
            if(k < past+1){
                str =str +'<div style="padding:8px;display:inline-block;width:30px;text-align:center;margin-left:4px;background: #253549 url(img/header/task_state1.png) no-repeat center;height: 39px;margin-bottom: -15px;"></div>';
            }else if(k == past+1){
                if(!state){
                    str =str +'<div style="padding:8px;display:inline-block;width:30px;text-align:center;margin-left:4px;background: #253549 url(img/header/task_state3.png) no-repeat center;height: 39px;margin-bottom: -15px;"></div>';
                }else{
                    str =str +'<div style="padding:8px;display:inline-block;width:30px;text-align:center;margin-left:4px;background: #253549 url(img/header/task_state2.png) no-repeat center;height: 39px;margin-bottom: -15px;"></div>';
                }
            }else if(k != total){
                str =str +'<span style="color:#d2f1fe; padding:8px;background-color:#253549;display:inline-block;width:30px;text-align:center;margin-left:4px;">--</span>';
            }else{
                if(!state){
                    str =str +'<div style="padding:8px;display:inline-block;width:30px;text-align:center;margin-left:4px;background: #253549 url(img/header/task_state2.png) no-repeat center;height: 36px;margin-bottom: -12px;"></div>';
                }else{
                    str =str +'<span style="color:#d2f1fe; padding:8px;background-color:#253549;display:inline-block;width:30px;text-align:center;margin-left:4px;">--</span>';
                }
            }
            str = str + '</div>';
        }
        str =str +'</div>';
        return str;
    };
    //故障单任务列表-任务进度明细
    this.taskTroubleProgressFmt = function(value,row,index) {
        var color_list = [
            "#0095A5",  //执行完毕
            "#D6D6D6",  //关闭
            "#74D86A",  //待执行，待授权
            "#FF7A8A",  //授权拒绝
        ];
        var _title = "";
        var element_list = [];
        switch (value)
        {
            //待授权
            case 1:
                element_list = [color_list[0],color_list[0],color_list[2],color_list[1],color_list[1]];
                _title = "待授权";
                break;
            //授权拒绝
            case 2:
                element_list = [color_list[0],color_list[0],color_list[3],color_list[1],color_list[1]];
                _title = "授权拒绝";
                break;
            //待执行
            case 3:
                element_list = [color_list[0],color_list[0],color_list[0],color_list[0],color_list[2]];
                _title = "待执行";
                break;
            //执行完毕
            case 4:
                element_list = [color_list[0],color_list[0],color_list[0],color_list[0],color_list[0]];
                _title = "执行完毕";
                break;
            //关闭任务
            case 5:
                element_list = [color_list[1],color_list[1],color_list[1],color_list[1],color_list[1]];
                _title = "关闭任务";
                break;
        }

        var str ='<div class="event_state" title="'+_title+'" style="cursor:pointer;position:absolute;width:120px;margin-top: -18px;height: 36px;padding-top: 7px;">';
        str = str+'<div style="position:relative;width:9px;height:9px;border-radius:100%;background-color: '+element_list[0]+';top:6px;left:-4px;"></div>';
        for(var i=0; i<3; i++){
            str = str+'<div style="position:relative;width:4px;height:4px;border-radius:100%;background-color: '+element_list[1]+';top:'+(-4*i)+'px;left:'+(10+i*9)+'px;"></div>';
        }
        str = str+'<div style="position:relative;width:9px;height:9px;border-radius:100%;background-color: '+element_list[2]+';top:-15px;left:38px;"></div>';
        for(var i=0; i<3; i++){
            str = str+'<div style="position:relative;width:4px;height:4px;border-radius:100%;background-color: '+element_list[3]+';top:'+(-21-i*4)+'px;left:'+(52+i*9)+'px;"></div>';
        }
        str = str+'<div style="position:relative;width:9px;height:9px;border-radius:100%;background-color: '+element_list[4]+';top:-36px;left:80px;"></div>';
        str = str+'</div>';
        str = str +'<div class="displayNone leave_state" style="color:#d2f1fe;z-index:10000;background-color: #091016;box-shadow: #091016 0px 0px 4px;width: 450px;min-height:30px;height:auto;position: absolute; right: 75px;padding:6px 0">';
        str = str +'</div>';
        return str;
    };
    //历史任务列表-任务进度明细
    this.taskHistoryProgressFmt = function(value, row, index) {
        var past = 0,state = true;
        var total = row.work_detail_list.length;
        var str ='<div class="event" style="cursor:pointer;position:absolute;width:'+(total-1)*50+'px;margin-top: -18px;height: 36px;padding-top: 18px;">';
        str = str +'<div style="position:absolute;border:1px solid #CCCCCC;width:'+(total-1)*50+'px;"></div>';
        for(var i= 0,readlypoint = 0;i< total ;i++){
            readlypoint = readlypoint +1;
            if(row.work_detail_list[i].work_state == 1){
                if(state){
                    if(row.work_detail_list[i].pend_type == 5){
                        str = str+'<div style="position:relative;width:9px;height:9px;border-radius:100%;background-color: black;top:'+-((readlypoint -1) * 9 + 3)+'px;left:'+((readlypoint -1) * 50 -4)+'px;"></div>';
                    }else{
                        str = str+'<div style="position:relative;width:9px;height:9px;border-radius:100%;background-color: #0095A5;top:'+-((readlypoint -1) * 9 + 4)+'px;left:'+((readlypoint -1) * 50 -4)+'px;"></div>';
                    }
                }else{
                    if(row.work_detail_list[i].pend_type == 5){
                        str = str+'<div style="position:relative;width:9px;height:9px;border-radius:100%;background-color: black;top:'+-((readlypoint -1) * 9 + 8)+'px;left:'+((readlypoint -1) * 50 -4)+'px;"></div>';
                    }else{
                        str = str+'<div style="position:relative;width:9px;height:9px;border-radius:100%;background-color: #0095A5;top:'+-((readlypoint -1) * 9 + 9)+'px;left:'+((readlypoint -1) * 50 -4)+'px;"></div>';
                    }
                }

            }else if(row.work_detail_list[i].work_state == 2){
                state = false;
                str = str+'<div style="position:relative;width:13px;height:13px;border-radius:100%;background-color: #F72B44;top:'+-((readlypoint -1) * 9 + 6)+'px;left:'+((readlypoint -1) * 50 -4)+'px;"></div>';
            }else if(row.work_detail_list[i].work_state == 4){
                str = str+'<div style="position:relative;width:9px;height:9px;border-radius:100%;background-color: #CCCCCC;top:'+-((readlypoint -1) * 9 + 8)+'px;left:'+((readlypoint -1) * 50 -4)+'px;"></div>';
            }
        }

        str = str +'</div>';
        str = str +'<div class="displayNone leave" style="color:#D2F1FE;z-index:10000;background-color: #091016;width: 450px;height:auto;position: absolute;right: 260px;padding:6px 0">';

        for(var k =0;k< total;k++){
            str = str+'<div style="padding:2px 10px;">';
            str =str +'<span style="color:#d2f1fe;padding:8px;background-color:#253549;display:inline-block;width:160px;text-align:center;margin-left: 8px;">--</span>';
            str =str +'<span style="color:#d2f1fe;padding:8px;background-color:#253549;display:inline-block;width:220px;text-align:center;margin-left:4px;">--</span>';
            if(row.work_detail_list[k].work_state == 2){
                str =str +'<div style="padding:8px;display:inline-block;width:30px;text-align:center;margin-left:4px;background: #253549 url(img/header/task_state3.png) no-repeat center;height: 39px;margin-bottom: -15px;"></div>';
            }else if(row.work_detail_list[k].work_state == 1){
                str =str +'<div style="padding:8px;display:inline-block;width:30px;text-align:center;margin-left:4px;background: #253549 url(img/header/task_state1.png) no-repeat center;height: 39px;margin-bottom: -15px;"></div>';
            }else{
                str =str +'<span style="color:#d2f1fe;padding:8px;background-color:#253549;display:inline-block;width:30px;text-align:center;margin-left:4px;">--</span>';
            }
            str = str + '</div>';
        }
        str =str +'</div>';
        return str;
    };
    //模板列表-模板类型转换
    this.templateTypeFmt = function(value){
        if (value == 1) {
            return '发布模板';
        } else if (value == 2) {
            return '回退模板';
        } else if (value == 3) {
            return '构建模板';
        }
    };
    this.templateOpeSysFmt = function(value){
        var OpeSysList=value.split('|');
        var _sysList = [
        ].join('');
        for(var i=0;i<OpeSysList.length;i++){
            if(OpeSysList[i]==1){
                _sysList += '<span style="background:#EFEFEF;color:#333; padding: 0 10px;display: inline-block;text-align: center;margin-right: 5px;margin-bottom: 5px;">';
                _sysList += "Linux";
                _sysList += '</span>';
            }
            if(OpeSysList[i]==2){
                _sysList += '<span style="background:#EFEFEF;color:#333; padding: 0 10px;display: inline-block;text-align: center;margin-right: 5px;margin-bottom: 5px;">';
                _sysList += "AIX";
                _sysList += '</span>';
            }
            if(OpeSysList[i]==3){
                _sysList += '<span style="background:#EFEFEF;color:#333; padding: 0 10px;display: inline-block;text-align: center;margin-right: 5px;margin-bottom: 5px;">';
                _sysList += "AS400";
                _sysList += '</span>';
            }

        }
        return _sysList;
    };
    this.pxMin160Fmt = function(value) {
        if(!value) value = '-';
        return '<div title='+value+' style="min-width:160px;word-break:break-all; ">'+value+'</div>';
    };
    //参数配置-高峰时段-工作日类型
    this.wdayTypeFmt = function(value){
        if (value == 1) {
            return '普通工作日';
        } else if (value == 2) {
            return '普通周末';
        } else if (value == 3) {
            return '调休工作日';
        }else if(value==4){
            return '节假日';
        }
    };
    //参数配置-高峰时段-开始结束时间组
    this.peakDateListFmt = function(value){
        if(value){
            var time_list=value;
            var _timeList = [
            ].join('');
            for(var i=0;i<time_list.length;i++){
                var one_time=time_list[i];
                _timeList += '<span style="; padding: 0 10px;display: inline-block;text-align: center;margin-right: 5px;margin-bottom: 5px;">['+one_time.start_time+'-'+one_time.end_time+']</span>'
            }
            return _timeList;
        }
    };
    //组件列表-发布状态
    this.subgroupListPublishFmt=function(value){
        // if(!value) {
        //     return '<div title="未定义！" style="min-height: 24px; width: 170px;">--</div>';
        // } else {
        //     var _publish_state = CV.findValue(value,PublishState);
        //     return '<div title='+value+' style="min-height: 24px; width: 170px;word-break:break-all;">'+_publish_state+'</div>';
        // }
        if(!value || value == 2){
            return '<div title='+value+' style="min-height: 24px;word-break:break-all;">'+'未发布'+'</div>';
        }else{
            return '<div title='+value+' style="min-height: 24px;word-break:break-all;">'+'已发布'+'</div>';
        }
    };
    //环境方案--列表-(组件列表的发布状态-新增)
    this.envIsPublishFmt = function(value, row, index){
        if(value){
            if(value == 1){
                return '<div style="margin-left: 1px;"><span class="status-img list-success-img"></div>';
            }else if(value == 2){
                return '<div title="未定义！" style="min-height: 24px;color: #999">--</div>'
            }
        }else{
            return '<div title="未定义！" style="min-height: 24px;color: #999">--</div>';
        }
    };
    //组件列表-修改时间-新增
    this.combineModifyTimeDate=function(value,row){
        var _value="";
        if(row.modify_bk_date){
            _value=row.modify_bk_date+" "+row.modify_bk_time;
        }else{
            _value='<div title="未定义！" style="color:#999">--</div>'
        }
        return _value;
    };
    //组件列表-执行类别
    this.subgroupListExecuteTypeFmt=function(value){
        var _execute_type_state = CV.findValue(value,IML_TYPE);
        return '<span>'+_execute_type_state+'</span>';
    };
    //组件列表-组件类型
    this.cmptListCmptType=function(value){
        if(value.length!=0){
            var _cmpt_type='';
            for(var i=0;i<value.length;i++){
               _cmpt_type += i==(value.length-1) ? CV.findValue(value[i],CmptType) :CV.findValue(value[i],CmptType)+'/';
            }
            return '<span>'+_cmpt_type+'</span>';
        }else{
            return '--';
        }
    };
    //组件/组名格式
    this.subgroupFmt =function (value) {
        return '<div style="margin-left: 20px;word-break: break-all;">'+value+'</div>'
    };
    //组件/组件列表分类
    this.classifyTag =function (value) {
        var _tags= value ? value :[];
        var _html='';
        if(_tags.length!=0){
            _html += '<div style="height: 32px;word-break: break-all;text-overflow: ellipsis;white-space: nowrap;overflow:hidden;line-height: 30px;width: 66px;display:inline-block;margin-right: 5px;border: 1px solid #ccc" title="'+_tags[0]+'">'+_tags[0]+'</div>';
        }else {
            _html = '<div>--</div>'
        }
        if(_tags.length>1) _html +='<div class="tags-classify" style="display: inline-block;width: 14px;vertical-align: top;margin-top:4px"><i class="fa fa-ellipsis-h"></i></div>';
        return _html;
    };
    //组件 组件组创建时间拼接-新增
    this.combineTimeDate = function(value,row){
        var _value = row.crt_bk_date+" "+row.crt_bk_time;
        return _value;
    };
    //系统列表-系统方案
    this.sysListPublishState = function(value, row, index){
        var _html = "";
        var _publish_program_list = "";
        if(value){
            for(var i=0;i<value.length;i++){
                _publish_program_list += '<div class="program_list_hover_style" style="padding:5px 14px;width: 120px;text-align: left;word-break: break-all;background: #0b1016;">'+value[i].prog_cn_name+'</div>'
            }
            _html = [
                '<div style="">',
                    '<div class="publish_program_animate_active" style="">'+value.length+'</div>',
                    '<div class="publish_program_name_list" style="position: absolute;color: #333; margin-top: -51px; margin-left: -134px; display: none;font-size: 12px;z-index: 5;">',
                        '<div style="position: absolute;top:24px;left: 121px;z-index: 10;width: 17px;height: 30px;transform:rotate(180deg);overflow: hidden;">',
                            '<div style="height: 17px;width: 17px; transform: rotate(30deg) skewX(-18deg) translateX(10px);position: absolute; left:0px;background-color: #fff;border: 1px solid #D9EDF7;"></div>',
                        '</div>',
                        '<div style="color: #fff;border-radius: 5px;background-color: #61a1b8;border: 1px solid #61a1b8;">',
                            '<div style="background-color: #61a1b8;border-bottom: 1px solid #D9EDF7;border-radius: 5px 5px 0 0;padding: 5px 14px;width: 120px;text-align: center;"><i class="fa fa-cubes" style="font-size: 14px;vertical-align: -1px;margin-right: 5px;"></i>方案列表</div>',
                            _publish_program_list,
                        '</div>',
                    '</div>',
                '</div>'];
        }else{
            _html = ['<div style="height: 30px;width: 80px"></div>'];
        }
        return _html.join("");
    };
    //系统列表-节点数
    this.sysListNodeCount = function(value, row, index){
        var _html = "";
        var _ip_list = "";
        if(value){
            for(var i=0;i<value.length;i++){
                _ip_list += '<div class="node_list_hover_style" style="background: #0b1016;padding:5px 14px;word-break: break-all;">'+value[i].soc_ip+'</div>'
            }
            _html = [
                '<div>',
                    '<div class="animate_active" style="">'+value.length+'</div>',
                    '<div class="node_list" style="position: absolute;color: #333; margin-top: -51px; margin-left: -134px; display: none;font-size: 12px;z-index: 5;">',
                        '<div style="position: absolute;top:24px;left: 120px;z-index: 10;width: 17px;height: 30px;transform:rotate(180deg);overflow: hidden;">',
                            '<div style="height: 17px;width: 17px; transform: rotate(30deg) skewX(-18deg) translateX(10px);position: absolute; left:0px;background-color: #fff;border: 1px solid #ebebeb;"></div>',
                        '</div>',
                        '<div style="color: #fff;border-radius: 5px;background-color: #61a1b8;border: 1px solid #61a1b8;">',
                            '<div style="background-color: #61a1b8;border-bottom: 1px solid #61a1b8;border-radius: 5px 5px 0 0;padding: 5px 14px;width: 120px;text-align: center;"><i class="fa fa-server" style="font-size: 14px;vertical-align: -1px;margin-right: 5px;"></i>节点列表</div>',
                            _ip_list,
                        '</div>',
                    '</div>',
                '</div>'];
        }else{
            _html = ['<div style="height: 30px;width: 80px"></div>'];
        }
        return _html.join("");
    };
    //系统列表-系统用户
    this.sysListUser = function(value, row, index){
        var _html = "";
        var _user_list = "";
        if(value){
            for(var i=0;i<value.length;i++){
                _user_list += '<div class="node_list_hover_style" style="background: #0b1016;padding:5px 14px;word-break: break-all;">'+value[i]+'</div>'
            }
            _html = [
                '<div>',
                '<div class="user_animate_active" style="">'+value.length+'</div>',
                '<div class="node_list" style="position: absolute;color: #333; margin-top: -51px; margin-left: -134px; display: none;font-size: 12px;z-index: 5;">',
                '<div style="position: absolute;top:24px;left: 120px;z-index: 10;width: 17px;height: 30px;transform:rotate(180deg);overflow: hidden;">',
                '<div style="height: 17px;width: 17px; transform: rotate(30deg) skewX(-18deg) translateX(10px);position: absolute; left:0px;background-color: #fff;border: 1px solid #ebebeb;"></div>',
                '</div>',
                '<div style="color: #fff;border-radius: 5px;background-color: #61a1b8;border: 1px solid #61a1b8;">',
                '<div style="background-color: #61a1b8;border-bottom: 1px solid #61a1b8;border-radius: 5px 5px 0 0;padding: 5px 14px;width: 120px;text-align: center;"><i class="fa fa-users" style="font-size: 14px;vertical-align: -1px;margin-right: 5px;color:#fff"></i>责任人列表</div>',
                _user_list,
                '</div>',
                '</div>',
                '</div>'];
        }else{
            _html = ['<div style="height: 30px;width: 80px"></div>'];
        }
        return _html.join("");
    };
    //系统列表-日志数目
    this.sysListLogCount=function(value, row, index){
        var _html = "";
        var _ip_list = "";
        if(value){
            for(var i=0;i<value.length;i++){
                _ip_list += '<div class="node_list_hover_style" style="background: #0b1016;padding:5px 14px;word-break: break-all;">'+value[i].log_name+'</div>'
            }
            _html = [
                '<div>',
                '<div class="animate_active" style="">'+value.length+'</div>',
                '<div class="node_list" style="position: absolute;color: #333; margin-top: -51px; margin-left: -134px; display: none;font-size: 12px;z-index: 5;">',
                '<div style="position: absolute;top:24px;left: 120px;z-index: 10;width: 17px;height: 30px;transform:rotate(180deg);overflow: hidden;">',
                '<div style="height: 17px;width: 17px; transform: rotate(30deg) skewX(-18deg) translateX(10px);position: absolute; left:0px;background-color: #fff;border: 1px solid #D9EDF7;"></div>',
                '</div>',
                '<div style="color:#fff;border-radius: 5px;background-color: #61a1b8;border: 1px solid #61a1b8;">',
                '<div style="background-color: #61a1b8;border-bottom: 1px solid #D9EDF7;border-radius: 5px 5px 0 0;padding: 5px 14px;width: 120px;text-align: center;"><i class="fa fa-server" style="font-size: 14px;vertical-align: -1px;margin-right: 5px;"></i>日志列表</div>',
                _ip_list,
                '</div>',
                '</div>',
                '</div>'];
        }else{
            _html = ['<div style="height: 30px;width: 80px"></div>'];
        }
        return _html.join("");
    };
    //系统列表-agent部署标志
    this.agentUseFmt=function(value){
        var _agent_flag = value == 1 ? '是' : '否';
        return '<span>'+_agent_flag+'</span>';
    };
    //自动巡检-数据库列表-指标模型
    this.DataModelFmt = function(value){
        var _sysList = [
        ].join('');
        if(value){
            var OpeSysList=value;
            var _index=OpeSysList.length;
            for(var i=0;i<OpeSysList.length;i++){
                if(i<_index){
                    _sysList+=OpeSysList[i]+",";
                }else{
                    _sysList+=OpeSysList[i]+"";
                }
            }
        }
        return _sysList;

    };
    //自动巡检-任务状态转化为中文名
    this.inTaskStateFmt=function(value){
       return CV.findValue(value,intaskState);
    };
    //自动巡检-创建时间格式化
    this.xjProgramTimeFmt = function(value, row){
        var _time =value.substring(0,value.length-3);
        return '<div style="width: 150px;word-break:break-all;">'+_time+'</div>';
    };
    //自动巡检-任务列表状态
    this.xjRunState=function(value, row){
        //return CV.findValue(row.cotask_status,coTaskState);
        if(row.status==0){
            return '<span title="待执行" class="glyphicon glyphicon-play-circle" style="font-size:16px;color:#F0DB4F;width: 50px;word-break:break-all;cursor:default"></span>';
        }else if(row.status==1){
            return '<span title="执行中" class="fa fa-spinner fa-pulse" style="font-size:16px;color:#3399CC;width: 50px;word-break:break-all;cursor:default"></span>';
        }else if(row.status==2){
            return '<span title="执行成功" class="glyphicon glyphicon-ok-circle" style="font-size:16px;color:#4CAF50;width: 50px;word-break:break-all;cursor:default"></span>';
        }else if(row.status==3){
            return '<span title="待执失败" class="glyphicon glyphicon-remove-circle" style="font-size:16px;color:#CF4646;width: 50px;word-break:break-all;cursor:default"></span>';
        }else if(row.status==4){
            return '<i title="手动停止" class="fa fa-stop-circle-o" style="font-size:18px;color:#FEA04D;width: 50px;word-break:break-all;cursor:default"></i>';
        }
    };

    //数据采集-方案列表-发布列
    this.publishState=function(value, row){
        //未发布
     if(row.publish_state==2){
         return '<div title="未发布！" style="min-height: 24px;color: #999">--</div>'
     }else if(row.publish_state==1){
         return '<span title="发布成功" class="glyphicon glyphicon-ok-circle" style="font-size:16px;color:#4CAF50;width: 50px;word-break:break-all;"></span>';
     }

    };
   //插件库-插件类型
    this.pluginTypeFormat = function (value, row) {
        var _plugin_type = CV.findValue(value,pluginType);
        return '<span>'+_plugin_type+'</span>';
    };
    //插件库-插件文件名格式化
    this.pluginFileFormat = function (value, row) {
        var _file_path = value ? value : '--';
        return '<span>'+_file_path.substring(_file_path.lastIndexOf('/')+1)+'</span>';
    };
    //流程列表-发布时间
    this.flowPublishTime = function(value,row){
        return value && row.publish_bk_time ? value + " " + row.publish_bk_time :'--';
    };
    //调度任务列表任务类型
    this.ywTaskType = function (value, row, index) {
        var _html = "",_type_list = "";
        var len = value.length;
        if(len != 0){
            for(var  i= 0; i < len; i++){
                _type_list += '<div class="node_list_hover_style" style="padding:5px 14px;word-break: break-all;">'+CV.findValue(value[i],FlowType)+'</div>'
            }
            _html = [
                '<div>',
                    '<div class="animate_active">'+'<i class="fa fa-tasks" style="font-size: 14px;color: #ace6fe"></i>&nbsp;'+CV.findValue(value[0],FlowType)+'</div>',
                        '<div class="node_list" style="position: absolute;color: #ace6fe; margin-top: -51px; margin-left: -134px; display: none;font-size: 12px;z-index: 5;">',
                        '<div style="position: absolute;top:24px;left: 120px;z-index: 10;width: 17px;height: 30px;transform:rotate(180deg);overflow: hidden;">',
                        '<div style="height: 17px;width: 17px; transform: rotate(30deg) skewX(-18deg) translateX(10px);position: absolute; left:0px;top: -4px;background-color: #131E2A;border: 1px solid #056879;"></div>',
                        '</div>',
                        '<div style="border-radius: 5px;background-color: #131E2A;border: 1px solid #056879;">',
                        '<div style="background-color: #07131E;border-bottom: 1px solid #056879;border-radius: 5px 5px 0 0;padding: 5px 14px;width: 120px;text-align: center;">任务类型列表</div>',
                        _type_list,
                        '</div>',
                    '</div>',
                '</div>'];
            if(len == 1){
                _html[1] =  '<div style="padding-left: 14px"> &nbsp;'+CV.findValue(value[0],FlowType)+'</div>';
            }
        }else{
            _html = ['<div style="height: 30px;width: 80px">--</div>'];
        }
        return _html.join("");
    };
    //调度任务列表执行状态
    this.taskExecStaus = function (value, row) {
        //1,执行中，2，--，3，异常，4 正常完成 5.异常完成 6重试中 7暂停 8手动等待，9暂停等待，10失败 11排队中
        if(!value) return "<span title='未定义！'>--</span>";
        var _task_cn_status = CV.findValue(value,OpTaskExeStatus),_imgclass = '';
        switch(value){
            case 3:  //3，10共用
            case 10: _imgclass = "dis_exception"; break;
            case 4:  _imgclass = "dis_finish"; break;
            case 5:  _imgclass = "dis_exce_finish"; break;
            case 7:  _imgclass = "dis_pause"; break;
            case 8:  _imgclass = "dis_handle_wait"; break;
            case 9: //9，11共用
            case 11:_imgclass = "dis_auto_wait"; break;
            default :  _imgclass = ''; break;
        }
        if(value == 1 || value == 6){
            return "<span title='执行中' class='fa fa-pulse fa-spinner' style='font-size: 17px;color:#5EB8FA'></span>" + "<span style='vertical-align:bottom;padding-left:8px'>"+ _task_cn_status + "</span>";
        }
        return "<div title='" + _task_cn_status + "'>" + "<span class='dispatch_task_icon "+ _imgclass +"'>" + "</span><span style='vertical-align: bottom'>"+ _task_cn_status + "</span></div>";
    };
    //调度任务列表执行方式
    this.ywExecType = function (value, row) {
        var _value = value==1 ? '手动':'自动';
        return '<span>'+_value+'</span>'
    };
    this.ywTasktimeFmt = function(value, row){
        if(value){
            var _date_fmt = value.substring(value.lastIndexOf('.'),-1);
            return '<span>'+_date_fmt+'</span>';
        }
    };
    this.flowIsPublishFmt = function(value,row){
        if(!value) return '<div title="未定义！" style="min-height: 24px;color: #999">--</div>';
        if(value == 1){
            return '<div title="未发布" class="dispatch_flow_icon dis_no_publish_icon"><span style="vertical-align: middle;display:inline-block;text-align:center;width: 60px;margin-left:15px">未发布</span></div>';
        }
        if(value == 2){
            return '<div title="已发布" class="dispatch_flow_icon dis_published_icon"><span style="vertical-align: middle;display:inline-block;text-align:center;width:60px;margin-left:15px">已发布</span></div>';
        }
        if(value == 3){
            return '<div title="挂起" class="dispatch_task_icon dis_hangup_icon"><span style="vertical-align: middle;display:inline-block;text-align:center;width:60px;margin-left:15px">挂起</span></div>';
        }
    };
    //调度场景列表-创建时间
    this.sceneNameFmt= function(value,row){
        var _html;
        if(!value){
            _html= '<div title="未定义！" style="min-height: 24px;white-space:nowrap;overflow: hidden;">--</div>';
        }else{
            if(row.scene_type === 3){
                _html= '<div style="white-space:nowrap;overflow: hidden;min-height: 24px;color: #a40000" title="'+value+'">'+value+'</div>';
            }else{
                _html= '<div style="white-space:nowrap;overflow: hidden;min-height: 24px;" title="'+value+'">'+value+'</div>';
            }
        }
        return _html;
    };
    //调度场景列表-创建时间
    this.sceneCrtTime = function(value,row){
        return value && row.crt_bk_time ? value + " " + row.crt_bk_time :'--';
    };
    //调度策略类型转中文
    this.strategyTypeCnFmt = function(value, row){
        var _type_cn = CV.findValue(value, StrategyGroupType);
        return _type_cn ? '<div style="cursor: default">'+_type_cn+'</div>' : '--';
    };

    //日志巡检
    this.formTimeLimit = function(value,row){
        if(value){
            var _date_time=row.start_date+"~"+row.end_date;
            return '<span>'+_date_time+'</span>';
        }
    };
    //日志巡检-日志内容
    this.logFilesFormat=function(value,row){
        if(value){
            var _list_string="";
            var _list_names=row.log_names.split(',') ? row.log_names.split(','):[];
            for(var i=0;i<_list_names.length;i++){
                var one=_list_names[i];
                _list_string=_list_string+one+"/";
            }
            return '<span>'+_list_string+'</span>';
        }
    }
}]);
//表格公共配置信息
configSrv.factory('TblOption', function() {
    return {
        //ajax: notFinishData,
        search: false,
        pagination: true,
        pageSize:20,
        pageNumber:1,
        sidePagination: 'server',
        showColumns: false,
        showRefresh: false,
        //sortName: 'pro_bk_date',
        //sortOrder: 'd',
        rowStyle: function (row, index) {
            index == 0 ? $('.pagination-detail').hide() : '';
            //if (index % 2 == 0) {
            //    return {classes : 'tbl-odd'};
            //} else {
            //    return {classes : 'tbl-even'};
            //}
            return {classes : 'tbl-odd'};
        },
        classes: "table table-no-bordered table-hover"
    }
});
//表格鼠标移动事件配置
configSrv.factory('MouseMoveEvent', ["$timeout", "Col_Fmt", function($timeout, Col_Fmt) {
    var timer;
    return {
        'mouseenter .tbl_config': function () {
            var configDiv = $(this).children().eq(0).children();
            var otherDiv = $(this).parent().parent().siblings().find('.pp');
            var _this = $(this);
            otherDiv.animate({right: '-222px'},200,function(){
                otherDiv.parent().siblings().children().each(function() {
                    _this.css("background", _this.attr("name") % 2 == 0 ? "#FFF" : "#F6F7FC");
                });
            });
            if(timer) $timeout.cancel(timer);
            timer = $timeout(function(){
                //划出
                _this.css("background", "#5A72A3");
                configDiv.animate({right: '30px'}, 500);
            },200);
        },
        'mouseleave .tbl_config':function(){
            var configDiv = $(this).children().eq(0).children();
            var _this = $(this).children().eq(1).children();
            if(timer) $timeout.cancel(timer);
            timer = $timeout(function(){
                configDiv.animate({right: '-222px'}, 200,function (){
                    _this.parent().siblings().children().each(function() {
                        _this.css("background", _this.attr("name") % 2 == 0 ? "#FFF" : "#F6F7FC");
                    })
                });
            },200);
        }
    };
}]);
//表格操作列配置
configSrv.factory('OptionCol', function() {
    return {
        field: 'operate',
        width: '50px',
        title: '',
        align: 'center',
        valign: 'middle',
    };
});
//表格操作列配置
configSrv.factory('OptionColWidth', function() {
    return {
        field: 'operate',
        width: '100px',
        title: '',
        align: 'right',
        valign: 'middle',
    };
});
//表格列集合
configSrv.factory('ColMap', function() {
    return {
        'pro_bk_date': {
            field: 'pro_bk_date',
            title: '发布日期',
            align: 'center',
            valign: 'middle',
            sortable: true,
            formatter: Col_Fmt.px100Fmt
        },
        'project_short_name':{
            field: 'project_short_name',
            title: '发布项目',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.px100Fmt
        },
        'business_cn_name':{
            field: 'business_cn_name',
            title: '业务系统',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.px100Fmt
        },
        'project_nature':{
            field: 'project_nature',
            title: '发布类型',
            align: 'center',
            valign: 'middle',
            formatter: Col_Fmt.projNatureFmt
        },
        'user_cn_name':{
            field: 'user_cn_name',
            title: '执行人',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.px100Fmt
        },
        'project_status':{
            field: 'project_status',
            title: '执行状态',
            align: 'center',
            valign: 'middle',
            sortable: true,
            formatter: Col_Fmt.projStatusFmt,
        },
        'prod_flag':{
            field: 'prod_flag',
            title: '发布结果',
            align: 'center',
            valign: 'middle',
            formatter: Col_Fmt.prodFlagFmt
        },
        'start_bk_time':{
            field: 'start_bk_time',
            title: '计划发布时间',
            align: 'center',
            valign: 'middle',
        },
        'pre_project_short_name':{
            field: 'pre_project_short_name',
            title: '前置项目',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter:Col_Fmt.preProjFmt
        },
        'project_name':{
            field: 'project_name',
            title: '项目编号',
            align: 'left',
            valign: 'middle',
            formatter: Col_Fmt.px140Fmt
        },
        'project_bk_desc':{
            field: 'project_bk_desc',
            title: '项目描述',
            align: 'left',
            valign: 'middle',
            formatter: Col_Fmt.px160Fmt
        },
        'business_sys_name':{
            field: 'business_sys_name',
            title: '业务系统',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            width: '200px',
            formatter: Col_Fmt.px170Fmt
        },
        'count_dir':{
            field: 'count_dir',
            title: '目录数',
            align: 'left',
            halign: 'left',
            valign: 'middle',
            formatter: Col_Fmt.noZeroFmt
        },
        'count_node':{
            field: 'count_node',
            title: '节点数',
            align: 'left',
            halign: 'left',
            valign: 'middle',
            formatter: Col_Fmt.noZeroFmt
        },
        'count_template':{
            field: 'count_template',
            title: '模板数',
            align: 'left',
            halign: 'left',
            valign: 'middle',
            formatter: Col_Fmt.noZeroFmt
        },
        'version_num':{
            field: 'version_num',
            title: '版本号',
            align: 'center',
            halign: 'center',
            valign: 'middle',
            width: '100px',
            sortable:true,
            formatter: Col_Fmt.noZeroFmt
        },
        'prolist_name':{
            field: 'prolist_name',
            title: '清单',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            events: {
                'click .download_text': function () {
                    var _prolist_name = $(this).children().text();
                    for(var i = 0; i < _table_data.length; i ++) {
                        if(_table_data[i].prolist_name == _prolist_name){
                            CV.downloadFile(_table_data[i].prolist_path);
                        }
                    }
                },
            },
            formatter: Col_Fmt.downOneFmt
        },
        'propackage_name_list':{
            field: 'propackage_name_list',
            title: '发布包',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            events: {
                'click .download_text': function () {
                    var _propackage_name = $(this).children().text();
                    var _index = $(this).children().attr('class');
                    for(var i = 0; i < _table_data.length; i ++) {
                        if(_table_data[i].propackage_name_list[_index] == _propackage_name) {
                            CV.downloadFile(_table_data[i].propackage_path_list[_index]);
                        }
                    }
                },
            },
            formatter: Col_Fmt.downListFmt
        },
        'project_complete_flag':{
            field: 'project_complete_flag',
            title: '完成状态',
            align: 'center',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.complete_FlagFmt
        },
        'template_name':{
            field: 'template_name',
            title: '模板名',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.pxMin160Fmt
        },
        'template_type':{
            field: 'template_type',
            title: '模板类别',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.templateTypeFmt
        },
        'operating_system':{
            field: 'operating_system',
            title: '操作系统',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.templateOpeSysFmt
        },
        'crt_bk_date':{
            field: 'crt_bk_date',
            title: '创建时间',
            align: 'center',
            halign: 'center',
            valign: 'middle'
        },
        'tp_class_name':{
            field: 'tp_class_name',
            title: '模板类名',
            align: 'left',
            halign: 'center',
            valign: 'middle'
        },
        'script_file_path':{
            field: 'script_file_path',
            title: '模板脚本文件',
            align: 'left',
            halign: 'center',
            valign: 'middle'
        },
        'order_seq':{
            field: 'order_seq',
            title: '编号',
            align: 'left',
            halign: 'center',
            width:  '165px',
            valign: 'middle',
            formatter: Col_Fmt.workOrderFlagFmt
        },
        'sys_cn_name':{
            field: 'sys_cn_name',
            title: '系统',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.workOrderFmt
        },
        'order_bk_title':{
            field: 'order_bk_title',
            title: '标题',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.workOrderFmt
        },
        'workorder_type':{
            field: 'workorder_type',
            title: '工单类型',
            align: 'center',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.workOrderTypeFmt
        },
        'order_state':{
            field: 'order_state',
            title: '状态',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.workOrderStateFmt
        },
        'deal_user_name':{
            field: 'deal_user_name',
            title: '责任人',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.workOrderFmt
        },
        'closed_bk_date':{
            field: 'closed_bk_date',
            title: '关闭时间',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.workOrderTimeFmt
        },
        'crt_user_name':{
            field: 'crt_user_name',
            title: '创建人',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.workOrderFmt
        },
        'row_number':{
            field: 'row_number',
            title: '行号',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.workOrderFmt
        },
        'order_bk_desc':{
            field: 'order_bk_desc',
            title: '工单描述',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.workOrderFmt
        },
        'trouble_bk_desc':{
            field: 'trouble_bk_desc',
            title: '故障描述',
            align: 'center',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.workOrderFmt
        },
        'problem_desc':{
            field: 'problem_desc',
            title: '问题描述',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.workOrderFmt
        },
        'pend_work_seq':{
            field: 'pend_work_seq',
            title: '任务流水号',
            align: 'left',
            valign: 'middle'
        },
        'pendwk_bk_expl':{
            field: 'pendwk_bk_expl',
            title: '任务说明',
            align: 'left',
            valign: 'middle',
        },
        'workflow_state':{
            field: 'workflow_state',
            title: '任务状态',
            align: 'left',
            valign: 'middle',
            formatter: Col_Fmt.taskStatusFmt,
        },
        'pend_cn_name':{
            field: 'pend_cn_name',
            title: '处理人',
            align: 'left',
            valign: 'middle',
        },
        'crt_dept_time':{
            field: 'crt_dept_time',
            title: '提交时间',
            align: 'left',
            valign: 'middle',
        },
        'deal_bk_dt':{
            field: 'deal_bk_dt',
            title: '结束日期',
            align: 'center',
            valign: 'middle',
        },
        'crt_bk_time':{
            field: 'crt_bk_time',
            title: '时间',
            align: 'center',
            valign: 'middle'
        },
        'msg_title':{
            field: 'msg_title',
            title: '主题',
            align: 'center',
            valign: 'middle',
        },
        'crt_user_id':{
            field: 'crt_user_id',
            title: '发布人',
            align: 'center',
            valign: 'middle',
        },
        'program_seq':{
            field: 'program_seq',
            title: '编号',
            align: 'center',
            valign: 'middle'
        },
        'program_name':{
            field: 'program_name',
            title: '方案名称',
            align: 'center',
            valign: 'middle',
        },
        'program_bk_desc':{
            field: 'program_bk_desc',
            title: '方案描述',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.px160Fmt
        },
        'sys_name':{
            field: 'sys_name',
            title: '系统名',
            align: 'left',
            halign: 'center',
            valign: 'middle'
        },
        'sys_bk_desc':{
            field: 'sys_bk_desc',
            title: '系统中文描述',
            align: 'left',
            halign: 'center',
            valign: 'middle',
            width: '300px',
            formatter: Col_Fmt.px250Fmt
        },
        'sys_type':{
            field: 'sys_type',
            title: '系统类型 ',
            align: 'left',
            valign: 'middle',
            formatter: Col_Fmt.troubleSysFmt
        },
        'soc_name':{
            field: 'soc_name',
            title: '系统数据源',
            align: 'left',
            valign: 'middle'
        },
        'trouble_key':{
            field: 'trouble_key',
            title: '故障编号',
            align: 'center',
            valign: 'middle',
            formatter: Col_Fmt.pxMin160Fmt
        },
        'trouble_code':{
            field: 'trouble_code',
            title: '故障代码',
            align: 'center',
            halign: 'center',
            valign: 'middle',
            formatter: Col_Fmt.pxMin160Fmt
        },
        'time_cn_name':{
            field: 'time_cn_name',
            title: '时段中文名',
            align: 'left',
            halign: 'center',
            valign: 'middle',
        },
        'time_bk_desc':{
            field: 'time_bk_desc',
            title: '时段描述',
            align: 'left',
            halign: 'left',
            valign: 'middle',
        },
        'wday_type':{
            field: 'wday_type',
            title: '工作日类型',
            align: 'left',
            halign: 'left',
            valign: 'middle',
            width: '150px',
            formatter: Col_Fmt.wdayTypeFmt
        },
        'start_bk_date':{
            field: 'start_bk_date',
            title: '开始日期',
            align: 'left',
            halign: 'left',
            valign: 'middle',
            width: '100px',
            formatter: Col_Fmt.noZeroFmt
        },
        'end_bk_date':{
            field: 'end_bk_date',
            title: '结束日期',
            align: 'left',
            halign: 'left',
            valign: 'middle',
            width: '100px',
            formatter: Col_Fmt.noZeroFmt
        },
        'times':{
            field: 'times',
            title: '开始结束时间组',
            align: 'left',
            halign: 'left',
            valign: 'middle',
            width: '200px',
            formatter: Col_Fmt.peakDateListFmt
        }
        //TODO:数量 61
    };
});

