'use strict';
var CvService = angular.module("CvService", []);
//公共服务
CvService.service('CV', ["$modal","$rootScope","$timeout","$window","baseUrl",function($modal, $rootScope, $timeout, $window, baseUrl) {
    /**
     * 根据页面查询资源码
     */
    this.rscode = function(page) {
        var _rs_code = "00";
        if($rootScope.rslist && page) {
            for(var i = 0 ; i < $rootScope.rslist.length; i ++) {
                var rsi = $rootScope.rslist[i];
                if(rsi.rs_url == page) {
                    _rs_code = rsi.rs_code;
                    break;
                }
            }
        }
        return _rs_code;
    };
    /**
     * 日期对象转yyyy-mm-dd字符串
     */
    this.dtFormat = function (date, tag) {
        if(!date || typeof(date) == "string") {
            return date;
        }
        var _tag = tag ? tag : "-";
        var toPaddedString = function (num, length) {
            var string = num.toString(10),
                paddings = length - string.length;

            while (paddings-- > 0) {
                string = '0' + string;
            }
            return string;
        };
        return date.getFullYear() + _tag + toPaddedString((date.getMonth() + 1), 2) + _tag + toPaddedString(date.getDate(), 2);
    };
    /**
     * 日期对象转yyyy年mm月dd日字符串
     */
    this.dtFormatCn = function (date, tag) {
        if(!date || typeof(date) == "string") {
            return date;
        }
        var toPaddedString = function (num, length) {
            var string = num.toString(10),
                paddings = length - string.length;

            while (paddings-- > 0) {
                string = '0' + string;
            }
            return string;
        };
        return date.getFullYear() + '年' + toPaddedString((date.getMonth() + 1), 2) + '月' + toPaddedString(date.getDate(), 2) + '日';
    };
    /**
     * 日期对象转yyyy-mm-dd hh:MM:ss字符串
     */
    this.dttFormat = function(datetime) {
        var toPaddedString = function (num, length) {
            var string = num.toString(10),
                paddings = length - string.length;

            while (paddings-- > 0) {
                string = '0' + string;
            }
            return string;
        };
        return toPaddedString((datetime.getHours()), 2) + ":" + toPaddedString((datetime.getMinutes()), 2) + ":" + toPaddedString((datetime.getSeconds()), 2);
    };
    /**
     * yyyy-mm-dd hh:MM:ss字符串转日期对象
     */
    this.toDate = function(str) {
        if(str.length != 19) {
            return null;
        } else {
            var resDate = new Date(Date.parse(str.replace(/-/g, "/")));
            if(resDate.toString() == 'Invalid Date') {
                return null;
            } else {
                return resDate;
            }
        }
    };
    /**
     * 日期加减(日，小时，分钟，秒)
        date:       原始日期对象
        dimension:  加减的维度(支持：dd(天), hh(小时), mm(分), ss(秒))
        size:       加减的数量(可以是负数)
    **/
    this.dateCalculate = function(date, dimension, size) {
        var _dimensions = {
            dd : 1*1000*60*60*24,
            hh : 1*1000*60*60,
            mm : 1*1000*60,
            ss : 1*1000
        };
        if(!_dimensions[dimension]) throw new Error("parameter [dimension] is illegal");
        if(!angular.isNumber(size)) throw new Error("parameter [size] is illegal");
        var _date_l = date.valueOf();
        return new Date(_date_l + (size * _dimensions[dimension]));
    }
    /**
     * 计算日期差（x天之后，x小时之后，x分钟之后）
     */
    this.dateCD = function(before, after) {
        var beforeSecond = before.getTime();
        var afterSecond= after.getTime();
        var between = afterSecond - beforeSecond;
        var _day    = 1*1000*60*60*24;
        var _hour   = 1*1000*60*60;
        var _minute = 1*1000*60;
        var _second = 1*1000;
        if(between <= 0) {
            return null;
        } else {
            var cd_day = Math.floor(between / _day);
            if(cd_day  == 0) {      //一天之内
                var cd_hour = Math.floor(between / _hour);
                if(cd_hour == 0) {      //一小时之内
                    var cd_minute = Math.floor(between / _minute);
                    if(cd_minute == 0) {    //一分钟之内
                        return Math.floor(between / _second) + "秒之后";
                    } else {
                        return cd_minute + "分钟后";
                    }
                } else {
                    return cd_hour + "小时后";
                }
            } else {                //多天
                return cd_day + "天后";
            }
        }
    }
    /**
     * 秒耗时转中文
     */
    this.usedCnTime = function(used_time) {
        if(!used_time) return "";
        var _formatedTimeStr = "";
        var dd = Math.floor(used_time / (24 * 3600));
        var hh = Math.floor(used_time % (24 * 3600) / 3600);
        var mm = Math.floor(used_time % 3600 / 60);
        var ss = used_time % 3600 % 60;
        if(dd >= 1){
            _formatedTimeStr += dd + "天";
        }
        if(hh >= 1){
            _formatedTimeStr += hh + "小时";
        }
        if(mm != 0) {
            _formatedTimeStr += mm + "分钟";
        }
        if(ss != 0) {
            _formatedTimeStr += ss + "秒";
        }
        return  _formatedTimeStr;
    };
    /**
     * 表单验证通用服务
     */
    this.valiForm = function(form) {
        console.log(form)
        var key, isOk = true;
        for(key in form.$error) {
            var errorTags = form.$error[key];
            for(var i = 0; i < errorTags.length; i++) {
                var tag = errorTags[i];
                if(tag.$invalid) {
                    tag.$dirty = true;
                }
            }
            isOk = false;
        }
        return isOk;
    };
    /**
     * 根据key找List<Map>的value
     */
    this.findValue = function(field,sdata){
        var value = "";
        for(var i=0;i<sdata.length;i++){
            var item = sdata[i];
            if(item.key==field){
                value=item.value;
            }
        }
        return value;
    }
    /**
     * 根据value找List<Map>的key
     */
    this.findKey = function(value,sdata){
        var key;
        for(var i=0;i<sdata.length;i++){
            var item = sdata[i];
            if(item.value == value){
                key = item.key;
            }
        }
        return key;
    }
    /**
     * 文件下载服务
     */
    this.downloadFile = function(filePath) {
        var url = baseUrl + "filedownload?isdel=false&filename=" + filePath;
        $window.open(url, "_new");
    }
    /**
     * json数组转二维数组
     */
    this.jsonArrToStrArr = function(jsonArr, keys) {
        var tArr = new Array();
        for(var i = 0; i < jsonArr.length; i ++) {
            tArr[i]=new Array();
            tArr[i][0] = jsonArr[i][keys[0]];
            tArr[i][1] = jsonArr[i][keys[1]];
        }
        return tArr;
    };
    /**
     * Linux匹配空字符正则式
     */
    this.nullWord = function() {
        return new RegExp("[(\x00-\x1F)]+\g", "g");
    };
    /**
     * 匹配tab符正则式
     */
    this.nullReg = function () {
        return new RegExp("\t","g")
    };
    /**
     * 判断浏览器是否支持canvas
     */
    this.isCanvasSupported = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };
    //处理面包屑数据
    this.dealBreadCrumbData = function(toState,breadcrumb,toParams){
        if(toState.ncyBreadcrumb && toState.ncyBreadcrumb.floor == 0){
            breadcrumb = [];
        }else if(toState.ncyBreadcrumb){
            var _exsit_flag = false;
            var _index = 0;
            var _breadcrumb = {
                label:toState.ncyBreadcrumb.label,
                stateName:toState.name,
                params:toParams,
                replace_flag:toState.ncyBreadcrumb.replace_flag,
                floor:toState.ncyBreadcrumb.floor,
                menu_name:toState.menu_name,
            }
            if(toState.ncyBreadcrumb.floor == 1){
                breadcrumb = [];
            }
            for(var i = 0 ; i < breadcrumb.length; i++){
                if(breadcrumb[i].replace_flag){
                    _exsit_flag = true;
                    _index = 1;
                }
                if(breadcrumb[i].label == toState.ncyBreadcrumb.label){
                    _exsit_flag = true;
                    _index = i;
                }
            }
            if(_exsit_flag){
                breadcrumb.splice(_index,breadcrumb.length-_index,_breadcrumb);
            }else{
                breadcrumb.push(_breadcrumb);
            }
        }
        return breadcrumb;
    };
}]);
//HTTP服务
CvService.provider("CallProvider", function() {
    this.$get = ["$http", "$q", "baseUrl", "CommData", "Modal", "CV", function($http, $q, baseUrl, CommData, Modal, CV) {
        return {
            call: function(reqParam) {
                var deferred = $q.defer();
                var reqData = angular.extend({}, CommData, reqParam.reqData, {org_srv_name: reqParam.actionName.split(".")[0]});
                $http({
                    method  : "POST",
                    url     : baseUrl + reqParam.actionName,
                    data    : reqData,
                    timeout : (reqParam.timeout ? reqParam.timeout : 30) * 1000,
                    //过滤返回报文中的特殊字符（控制字符）
                    transformResponse: [function (data, headersGetter) {
                        if(data){
                            if(reqParam.actionName == 'rp_ViewInTaskActiongetReportJson.do'  || reqParam.actionName == 'sl_ExportBatchSqlAction.do' || reqParam.actionName == 'sl_BatchExecuteSqlAction.do'|| reqParam.actionName == 'sl_ViewSqlActionqueryBatchSql.do' || reqParam.actionName == 'mo_ViewModuleActiongetModuleDetail.do' || reqParam.actionName == 'in2_QueryReportDataAction.do' || reqParam.actionName == 'sc_ViewScriptActiongetListByOrderSeq.do' || reqParam.actionName =='sc_UploadScriptFileAction.do' || reqParam.actionName =='pj_MonitorLogMsgAction.do' || reqParam.actionName == 'tk_ViewSingleJobDetailAction.do' || reqParam.actionName == 'fw_SdFlowDetailViewAction.do' || reqParam.actionName == 'tk_ViewSdTaskDetailAction.do'){
                                var _newData = data.replace(/\s+/g, " "); //去除空格
                                return angular.fromJson(_newData);
                            }else if(reqParam.actionName == 'sp_ReadConfigFileAction.do' || reqParam.actionName =='pj_MonitorPjLogAction.do') {  //读取配置文件取特殊字符
                                var newData = data.replace(CV.nullWord(), "");
                                return angular.fromJson(newData);
                            }else if (reqParam.actionName =='mo_ViewComponentActiongetComponentDetail.do'|| reqParam.actionName == 'bs_ImportProgramAction.do' || reqParam.actionName =='mo_ViewComponentActiongetImportGroupDetail.do' || reqParam.actionName =='mo_ViewComponentActiongetGroupDetail.do' || reqParam.actionName =='mo_ViewComponentActiongetImportComponentDetail.do'||reqParam.actionName =='pj_ViewPjActionqueryPreparePacList.do' || reqParam.actionName =='pj_ViewPjActionqueryPjPublishInfo.do'|| reqParam.actionName =='bs_ViewBsProgramActionqueryProgramInfo.do' || reqParam.actionName == 'mo_ViewComponentActiongetComponentListDetail.do' || reqParam.actionName == 'mo_ViewComponentActiongetGroupListDetail.do' || reqParam.actionName == 'sc_ViewScriptActiongetDetail.do' ||reqParam.actionName=='pj_ViewPrepareActiongetPrepareMsg.do'|| reqParam.actionName=='sp_ViewSystemPrepareActiongetRollBackMsg.do' ||reqParam.actionName == 'sp_ViewMonitorActiongetConsole.do' || reqParam.actionName == 'sp_MonitorPhaseAction.do' || reqParam.actionName == 'rz_OnlineAnalyzePageLog.do' || reqParam.actionName =='mo_ComponentTestAction.do' || reqParam.actionName =='pj_ViewPjProgramActiongetProgramForPrepare.do' || reqParam.actionName =='pj_ViewPjProgramActiongetOldPrepareInfo.do' || reqParam.actionName =='sp_ViewSysPublishActiongetSysPubExeDetail.do' || reqParam.actionName =='sp_ViewPjProgramActiongetProgramForPrepare.do'){
                                var newData = data.replace(CV.nullReg(), "\\t");
                                return angular.fromJson(newData);
                            } else{
                                return data;
                            }
                        }
                    }].concat($http.defaults.transformResponse)
                }).success(function(data, status, headers, config) {
                    if(data) {
                        var dh = data.sys_header;
                        if(dh.status == 'fail') {
                            deferred.reject(dh);
                        } else if(dh.status == 'except') {
                            deferred.reject({status: 'system', message: '请求服务异常\r\n'+dh.scode});
                        } else {
                            var res = data.appdata;
                            //原服务请求数据
                            var _real_req_data = res.req_data ? res.req_data : reqData;
                            //需要本地授权
                            if(res.svdeal_type == 2) {
                                Modal.localauth(res, _real_req_data).then(function(data) {
                                    deferred.resolve(data);
                                    CommData.org_srv_name ='';
                                }, function(error) {
                                    deferred.reject(error);
                                });
                                //需要复核/远程授权
                            } else if(res.svdeal_type == 3) {
                                Modal.remoteauth(res, _real_req_data).then(function(data) {
                                    deferred.reject(data);
                                }, function(error) {
                                    deferred.reject(error);
                                });
                            } else if(res.svdeal_type == 4) {
                                deferred.resolve(data);
                            } else {
                                deferred.resolve(res);
                            }
                        }
                    }
                }).error(function(data, status, headers, config) {
                    if(status == 0) {
                        deferred.reject({status: 'system', message: '服务请求超时!'});
                    } else {
                        deferred.reject({status: 'system', message: '发生未知错误!'});
                    }
                });
                return deferred.promise;
            }
        }
    }];
});
//Websocket服务
CvService.service('WS',["$websocket",function ($websocket) {
    this.creatWebSocket = function (url) {
        var _methods = {
            readyState : 0,
            lastestdata : '',
            collection : _collection,
            sendData: function (data) {
                _dataStream.send(JSON.stringify(data));
            },
            closeForce : function () {
                _dataStream.reconnectIfNotNormalClose = false;
                _dataStream.close(true);
            }
        };
        var _collection = [];
        var _dataStream;
        _dataStream = $websocket(url);
        _dataStream.reconnectIfNotNormalClose = true;
        _dataStream.onMessage(function (message) {
            console.log(message);
            _methods.readyState = _dataStream.readyState;
            _methods.lastestdata = message.data;
            _collection.push(message.data);
        });
        _dataStream.onError(function (message) {
            console.log('连接出错');
            //监控状态变化，实时跟进连接状态
            _methods.readyState = _dataStream.readyState;
        });
        _dataStream.onOpen(function (message) {
            console.log('连接成功');
            _methods.readyState = _dataStream.readyState;
        });
        _dataStream.onClose(function (message) {
            console.log('关闭成功');
            _methods.readyState = _dataStream.readyState;
        });
        return _methods;
    }
}]);
//表格事件对象
CvService.factory("TabEventMouserEnter",["$timeout",function($timeout){
    var timer;
    return function () {
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
    };
}]);
CvService.factory("TabEventMouserLeave",["$timeout",function($timeout){
    var timer;
    return function(){
        var configDiv = $(this).children().eq(0).children();
        var _this = $(this).children().eq(1).children();
        if(timer) $timeout.cancel(timer);
        timer = $timeout(function(){
            configDiv.animate({right: '-222px'}, 200,function (){
                _this.parent().siblings().children().each(function() {
                    _this.css("background", _this.attr("name") % 2 == 0 ? "#FFF" : "#F6F7FC");
                })
            });
        },2);
    };
}]);
//模态框服务
CvService.factory("Modal", ["$modal", "$timeout", "baseUrl", function($modal, $timeout, baseUrl) {
    var modal = {};
    //对open方法进行的一层封装
    var getOption = function(page, ctrl, size, data, backdrop, keyboard) {
        return {
            templateUrl: baseUrl+'app/templates/modal/'+page,
            controller: ctrl,
            size: size,
            backdrop: backdrop ? backdrop : 'static',
            keyboard: angular.isUndefined(keyboard) ? true : keyboard,//esc 退出
            resolve: data ? data : {}
        }
    };

    //---------------公共模态框----------------

    //loading弹窗
    modal.loading = function(message) {
        return $modal.open(getOption(
            "loading_modal.html", "LoadingCtrl", "md", {
                Message : function() {return message;}
            }
        ));
    };
    //错误信息弹窗status :0 错误，1 提示 ，2 成功
    modal.error = function(message) {
        return $modal.open(getOption(
            "alert_modal.html", "AlertCtrl", "sm", {
                Message : function() {return message;},
                status : function() {return 0;}
            }
        )).result;
    }
    //alert弹窗
    modal.alert = function(message,status) {
        return $modal.open(getOption(
            "alert_info_modal.html", "AlertCtrl", "sm", {
                Message : function() {return message;},
                status : function() {return status || 1;}
            },true
        )).result;
    };
    //success弹窗
    modal.success = function(message) {
        return $modal.open(getOption(
            "alert_modal.html", "AlertCtrl", "sm", {
                Message : function() {return message;},
                status : function() {return 2;}
            }
        )).result;
    };
    //confirm弹窗
    modal.confirm = function(message) {
        return $modal.open(getOption(
            "confirm_modal.html", "ConfirmCtrl", "sm", {
                Message : function() {return message;}
            }
        )).result;
    };
    //本地授权
    modal.localauth = function(auth_data, srv_req_data) {
        return $modal.open(getOption(
            "auth_local_modal.html", "localAuthCtrl", "md", {
                modalParam : function () {
                    return {
                        auth_data : auth_data,
                        srv_req_data : srv_req_data
                    }
                }
            }
        )).result;
    };
    //远程授权
    modal.remoteauth = function(auth_data, srv_req_data) {
        return $modal.open(getOption(
            "auth_remote_modal.html", "remoteAuthCtrl", "md", {
                modalParam : function () {
                    return {
                        auth_data : auth_data,
                        srv_req_data : srv_req_data
                    }
                }
            }
        )).result;
    };
    //文件对比
    modal.compare = function(busi_sys_id, sys_publish_id, node_name, file_path, check_soc_name, download_soc_name,download_soc_ip, is_edit,phase_type,phase_no,quick_publish) {
        //return $modal.open(getOption(
        //    "compare_modal.html", "CompareFileCtrl", "lg", {
        //        modalParam : function () {
        //            return {
        //                busi_sys_id : busi_sys_id,
        //                proj_name : proj_name,
        //                node_name : node_name,
        //                file_path : file_path,
        //                check_soc_name:check_soc_name,
        //                download_soc_name : download_soc_name,
        //                download_soc_ip:download_soc_ip,
        //                is_edit :is_edit,
        //                phase_type :phase_type,
        //                phase_no :phase_no
        //            }
        //        }
        //    }
        //)).result;
        return $modal.open({
            templateUrl: baseUrl+'app/templates/modal/compare_modal.html',
            controller: 'CompareFileCtrl',
            size: 'lg',
            backdrop:'static',
            keyboard:false,//esc 退出
            resolve: {
                modalParam : function () {
                    return {
                        busi_sys_id : busi_sys_id,
                        sys_publish_id : sys_publish_id,
                        node_name : node_name,
                        file_path : file_path,
                        check_soc_name:check_soc_name,
                        download_soc_name : download_soc_name,
                        download_soc_ip:download_soc_ip,
                        is_edit :is_edit,
                        phase_type :phase_type,
                        phase_no :phase_no,
                        quick_publish:quick_publish
                    }
                }
            }
        }).result;
    };

    //---------------发布管理模态框----------------
    //回退评价模态框
    modal.preLoading = function(_repData) {
        return $modal.open(getOption(
            "loading_modal.html", "submitModalCtrl", "md", {
                modalParam : function () {
                    return {
                        req_data : _repData
                    }
                }
            }
        )).result;
    };
    //回退评价模态框
    modal.rollbackSummary = function(publish_id, busi_sys, rollback_flag) {
        return $modal.open(getOption(
            "rollback_summary_modal.html", "RollbackSummaryCtrl", "md", {
                modalParam : function () {
                    return {
                        publish_id : publish_id,
                        busi_sys : busi_sys,
                        rollback_flag:rollback_flag
                    }
                }
            }
        )).result;
    };
    //总结评价
    modal.summary = function(publish_id, busi_sys){
        return $modal.open(getOption(
            "proj_summary_modal.html", "SummaryCtrl", "md", {
                modalParam : function () {
                    return {
                        publish_id : publish_id,
                        busi_sys : busi_sys
                    }
                }
            }
        )).result;
    };
    //发布管理-新增分组模态框
    modal.newGroup = function(){
        return $modal.open(getOption(
            "plan_new_group_modal.html", "planNewGroupCtrl", "lg", {}
        )).result;
    };
    //发布管理-修改分组模态框
    modal.editGroup = function(group_id,group_cn_name,group_date){
        return $modal.open(getOption(
            "plan_edit_group_modal.html", "planEditGroupCtrl", "lg", {
                modalParam : function(){
                    return {
                        group_id : group_id,
                        group_cn_name :group_cn_name,
                        group_date:group_date
                    }
                }
            }
        )).result;
    };
    //发布准备-添加发布包
    modal.prodPreAddProdPac = function(propackage_bk_path, fileupload_path ,prolist_bk_path, pac_index, pac_flag, is_prod_list, pre_info){
        return $modal.open(getOption(
            "pre_add_package_modal.html", "addPordPacModalCtrl", "md", {
                modalParam : function() {
                    return {
                        propackage_bk_path : propackage_bk_path,
                        prolist_bk_path    : prolist_bk_path,
                        fileupload_path    : fileupload_path,
                        pac_index          : pac_index,
                        pac_flag           : pac_flag,
                        is_prod_list       : is_prod_list,
                        pre_info           : pre_info
                    }
                }
            }
        )).result;
    };
    //发布准备-添加发布包--从平台获取
    modal.prodPreAddProdPacFromPlatform = function(dir_names,pac_index,sys_publish_id, pre_info){
        return $modal.open(getOption(
            "pre_add_platform_package.html", "addPlatformPackageModalCtrl", "md", {
                modalParam : function() {
                    return {
                        dir_names : dir_names,
                        pac_index :pac_index,
                        sys_publish_id:sys_publish_id,
                        pre_info  : pre_info
                    }
                }
            }
        )).result;
    }
    //发布执行--人机交互弹出框
    modal.interactOperation = function (execute_id, phaseId ,steps) {
        return $modal.open(getOption(
            "interact_operation_modal.html", "showHumanInteractCtrl", "md", {
                modalParam : function() {
                    return {
                        execute_id         : execute_id,
                        phaseId            : phaseId,
                        steps              : steps,
                    }
                }
            }
        )).result;
    };
    //发布回退--选择回退方案及生成实例弹出框
    modal.chooseRollbackProg = function (business_sys_name , publish_id) {
        return $modal.open(getOption(
            "choose_rollback_prog_modal.html", "chooseRollbackProgCtrl", "lg", {
                modalParam : function() {
                    return {
                        business_sys_name : business_sys_name,
                        publish_id      : publish_id
                    }
                }
            }
        )).result;
    };
    //发布监控--添加监控节点信息弹出框
    modal.addMonitorModal = function (business_sys_name,project_name,node,environment_id) {
        return $modal.open(getOption(
            "add_monitor_log_modal.html", "addMonitorLogCtrl", "lg", {
                modalParam : function() {
                    return {
                        business_sys_name : business_sys_name,
                        project_name : project_name,
                        environment_id:environment_id,
                        node : node,
                    }
                }
            }
        )).result;
    };
    //发布执行--配置可执行节点弹出框
    modal.configExeNode = function (phase_info,quick_publish) {
        return $modal.open(getOption(
            "config_exe_node_modal.html", "configExecNodeCtrl", "md", {
                modalParam : function() {
                    return {
                        phase_info     : phase_info,
                        quick_publish  : quick_publish,
                    }
                }
            }
        )).result;
    };
    //发布执行--结果变更弹出框
    modal.execResultChange = function (node_info) {
        return $modal.open(getOption(
            "exec_result_change_modal.html", "changeExecResultCtrl", "md", {
                modalParam : function() {
                    return {
                        node_info  : node_info,
                    }
                }
            }
        )).result;
    };
    //版本管理-全屏查看文件内容
    modal.fileContentFullScreen = function (file_info,file_post_header,business_sys_name) {
        return $modal.open(getOption(
            "file_fullscreen_detail_modal.html", "viewfileFullScreenCtrl", "lg", {
                modalParam : function() {
                    return {
                        file_info  : file_info,
                        file_post_header:file_post_header,
                        business_sys_name : business_sys_name
                    }
                }
            }
        )).result;
    };
    //发布窗口设置--例行窗口
    modal.setNormalWindow = function(){
        return $modal.open(getOption(
            "set_normal_window.html", "setNormalWindowTimeCtrl", "lg", {}
        )).result;
    };
    //发布窗口设置--特殊窗口
    modal.setSpecialWindow = function(){
        return $modal.open(getOption(
            "set_special_window.html", "setSpecialWindowTimeCtrl", "lg", {}
        )).result;
    };
    //发布窗口设置--特殊日窗口
    modal.setBlackWindow = function(){
        return $modal.open(getOption(
            "set_black_window.html", "setBlackWindowTimeCtrl", "lg", {}
        )).result;
    };
    //发布窗口详情
    modal.viewWindowDetail = function(event){
        return $modal.open(getOption(
            "view_window_detail.html", "viewWindowDetailCtrl", "md", {
                modalParam : function() {
                    return {
                        event  : event,
                    }
                }
            }
        )).result;
    };
    //关闭发布窗口
    modal.closePubWindow = function (window) {
        return $modal.open(getOption(
            "pub_window_close_reason.html", "closeWindowCtrl", "md", {
                modalParam : function() {
                    return {
                        window   :  window,
                    }
                }
            }
        )).result;
    };
    //发布准备--选择回列表还是直接到执行页面
    modal.prepareChoose = function(syspublish_id,business_sys_name){
        return $modal.open(getOption(
            "prepare_choose_modal.html", "prepareChooseCtrl", "md", {
                modalParam : function(){
                    return {
                        syspublish_id : syspublish_id,
                        business_sys_name :business_sys_name,
                    }
                }
            }
        )).result;
    };
    //发布执行--sql交互式执行弹窗
    modal.interactiveExecute = function(execute_id,phase_desc){
        return $modal.open(getOption(
            "interactive_execute_modal.html", "interactiveExecuteCtrl", "lg", {
                modalParam : function(){
                    return {
                        execute_id : execute_id,
                        phase_desc : phase_desc
                    }
                }
            },false,false
        )).result;
    };
    //---------------故障管理模态框----------------

    //工单处理--导入方案
    modal.importProgram = function () {
        return $modal.open(getOption(
            "import_new_program.html", "importProgramCtrl", "sm", {
                modalParam : function() {
                    return {}
                }
            }
        )).result;
    };
    //工单处理--方案预览
    modal.previewProgram = function (programSeq) {
        return $modal.open(getOption(
            "scheme_preview.html", "schemePreviewCtrl", "lg", {
                modalParam : function() {
                    return {
                        programSeq : programSeq
                    }
                }
            }
        )).result;
    };
    //工单处理--生成方案--导入sql
    modal.importSqlInCreateProgram= function (handleData) {
        return $modal.open(getOption(
            "import_sql.html", "importProgramSqlCtrl", "lg", {
                modalParam : function() {
                    return {
                        handleData: handleData,
                    }
                }
            }
        )).result;
    };
    //工单处理-SQL维护-添加SQL
    modal.addSQL = function(program_seq,db_list,sub_tab,flag) {
        return $modal.open(getOption(
            "workorder_sqlhandle_addsql.html", "workorderAddSQLModalCtrl", "lg", {
                modalParam : function() {
                    return {
                        program_seq:program_seq,
                        db_list  : db_list,
                        sub_tab : sub_tab,
                        flag    : flag,
                    }
                }
            }
        )).result;
    };

    //工单处理-SQL维护-批量sql--上传文件弹出框
    modal.showAddBatchSqlFile = function(sub_tab){
        return $modal.open(getOption(
            "import_batch_sql_modal.html", "importBatchSQLCtrl", "lg", {
                modalParam : function() {
                    return {
                        sub_tab  : sub_tab
                    }
                }
            }
        )).result;
    }
    //工单处理-SQL维护-查看SQL详细步骤
    modal.viewSqlDetailStep = function(sql_work_seq){
        return $modal.open(getOption(
            "program_sqlDetailStep_modal.html", "ProgramDetailSqlStepCtrl", "lg", {
                modalParam : function() {
                    return {
                        sql_work_seq  : sql_work_seq
                    }
                }
            }
        )).result;
    };
    //工单处理-SQL维护-批量导入-查看执行失败信息
    modal.viewBatchSqlExecDetail= function(message) {
        return $modal.open(getOption(
            "wo_sqlhandle_view_exe_info.html", "viewExeInfoCtrl", "lg", {
                modalParam : function() {
                    return {
                        message  : message
                    }
                }
            }
        )).result;
    };
    //工单处理-执行脚本-查看执行明细
    modal.viewScriptDetail = function(order_seq,deal_bk_seq,script_bk_seq){
        return $modal.open(getOption(
            "view_exec_detail.html", "viewScriptInfoCtrl", "lg", {
                modalParam : function() {
                    return {
                        order_seq  : order_seq,
                        deal_bk_seq:deal_bk_seq,
                        script_bk_seq :script_bk_seq
                    }
                }
            }
        )).result;
    };
    //工单-sql维护批量导入-查看授权任务
    modal.viewBatchImportAuthorDetail = function(task_id) {
        return $modal.open(getOption(
            "wo_batch_import_author_detail_modal.html", "viewTaskDetailCtrl", "md", {
                modalParam : function() {
                    return {
                        task_id  : task_id
                    }
                }
            }
        )).result;
    };
    //sql维护--提交SQL步骤--确认模态框
    modal.confirmSqlStatement = function(sql_step,un_submit_sql_steps) {
        return $modal.open(getOption(
            "program_confirm_sqlStatement_modal.html", "ProgramConfirmSqlStatementCtrl", "md", {
                modalParam : function() {
                    return {
                        sql_step  : sql_step,
                        un_submit_sql_steps:un_submit_sql_steps
                    }
                }
            }
        )).result;
    };
    //故障方案-查看sql详细
    modal.viewSqlDetail = function(program_seq,step_seq,sql_seq,sql_index){
        return $modal.open(getOption(
            "fault_program_detail_sql.html", "faultProgramSqlDetailCtrl", "lg", {
                modalParam : function() {
                    return {
                        program_seq  : program_seq,
                        step_seq:step_seq,
                        sql_seq :sql_seq,
                        sql_index :sql_index
                    }
                }
            }
        )).result;
    };
    //查看故障单审批流程
    modal.viewWorkOrderFlow = function(data){
        return $modal.open(getOption(
            "view_workorder_modal.html", "viewWorkOrderFlowCtrl", "md", {
                modalParam : function() {
                    return {
                        data  : data
                    }
                }
            }
        )).result;
    };
    //智能方案本地授权
    modal.pglocalauth = function(data,srv_req){
        return $modal.open(getOption(
            "pglocal_auth_modal.html", "pgLocalauthCtrl", "md", {
                modalParam : function() {
                    return {
                        data  : data,
                        srv_req : srv_req
                    }
                }
            }
        )).result;
    };
    //远程任务提交
    modal.pgremoteauth = function(data,srv_req){
        return $modal.open(getOption(
            "pgremote_auth_modal.html", "pgRemoteauthCtrl", "md", {
                modalParam : function() {
                    return {
                        data  : data,
                        srv_req : srv_req
                    }
                }
            }
        )).result;
    };
    //故障管理-参数配置-高峰时段模态框
    modal.faultPeakData = function(time_work_seq){
        return $modal.open(getOption(
            "peak_date_modal.html","faultPeakDateModalCtrl","lg",{
                modalParam : function() {
                    return {
                        time_work_seq  : time_work_seq
                    }
                }
            }
        )).result;
    };
    //故障管理-参数配置-故障类型模态框
    modal.faultTroubleType = function(trouble_key){
        return $modal.open(getOption(
            "trouble_type_modal.html","faultTroubleTypeCtrl","md",{
                modalParam : function() {
                    return {
                        trouble_key  : trouble_key
                    }
                }
            }
        )).result;
    };
    //工单处理--工单回退
    modal.workorderRollBack = function(order_seq){
        return $modal.open(getOption(
            "workorder_rollback.html","workOrderRollbackCtrl","md",{
                modalParam : function() {
                    return {
                        order_seq  : order_seq
                    }
                }
            }
        )).result;
    };
    //工单处理--工单指派
    modal.workOrderAppoint = function(order_seq){
        return $modal.open(getOption(
            "workorder_appoint_modal.html","workOrderAppointCtrl","md",{
                modalParam : function() {
                    return {
                        order_seq  : order_seq
                    }
                }
            }
        )).result;
    };
    //工单处理--工单变更
    modal.workOrderChange = function(order_seq){
        return $modal.open(getOption(
            "workorder_change_modal.html","workOrderChangeCtrl","md",{
                modalParam : function() {
                    return {
                        order_seq  : order_seq
                    }
                }
            }
        )).result;
    };
    //----------------------系统巡检模块----------------------

    //采集方案--新增采集项
    modal.addCjCollectItem = function(item,is_update,business_sys_name) {
        return $modal.open(getOption(
            "add_cj_items_modal.html", "newCjProgramItemsModalCtrl", "lg",{
                modalParam : function() {
                    return {
                        item              :item,
                        is_update         :is_update,
                        business_sys_name : business_sys_name
                    }
                }
            }
        )).result;
    };
    //任务采集-修改方案流程
    modal.modifyCJProg = function(_module_index, _business_sys_name, _modal_info, _node_list){
        return $modal.open(getOption(
            "cj_task_modal.html", "cjTaskCtrl", "lg", {
                modalParam : function() {
                    return {
                        module_index:_module_index,
                        modal_info  : _modal_info,
                        node_list   :_node_list,
                        business_sys_name : _business_sys_name
                    }
                }
            }
        )).result;
    };
    //指标模型-报告模板-新增指标模型
    modal.addTargetModel = function(model_list){
        return $modal.open(getOption(
            "add_target_model.html", "addTargetModelCtrl", "md", {
                modalParam : function() {
                    return {
                        model_list  : model_list
                    }
                }
            }
        )).result;
    };
    //巡检任务-配置图表
    modal.modifyXJConfig = function(model_info,model_list){
        return $modal.open(getOption(
            "xjtask_config_chart_modal.html", "xjtaskConfigModalCtrl", "lg", {
                modalParam : function() {
                    return {
                        model_info  : model_info,
                        model_list  : model_list
                    }
                }
            }
        )).result;
    };
    //固化方案--批量导入步骤
    modal.importAllStep = function (modal_info) {
        return $modal.open(getOption(
            "import_program_step_modal.html", "importProgramStepCtrl", "sm",{
                modalParam : function() {
                    return {
                        modal_info  : modal_info
                    }
                }
            }
        )).result;
    };
    //故障单任务--查看方案
    modal.viewTroubleTicketProgram = function (task_id) {
        return $modal.open(getOption(
            "trouble_ticket_task_detail_modal.html", "viewTroubleTicketProgramCtrl", "md",{
                modalParam : function() {
                    return {
                        task_id  : task_id
                    }
                }
            }
        )).result;
    };
    //处理工单--选择工单处理方式
    modal.chooseHandleType = function(work_id){
        return $modal.open(getOption(
            "pgchange_handletype_modal.html","pgChangeHandleTypeCtrl","md",{
                modalParam : function() {
                    return {
                        workId  : work_id
                    }
                }
            }
        )).result;
    };

    //------------------公共管理模块----------------

    //组件-查看组件详细
    modal.cmptDetail = function(type,id) {
        return $modal.open(getOption(
            "cmpt_detail_modal.html", "viewCmptDetailModalCtrl", "lg", {
                modalParam : function() {
                    return {
                        type  : type,
                        id    : id
                    }
                }
            }
        )).result;
    };
    //组件-添加分类标签
    modal.addCmptLabel = function (data) {
        return $modal.open(getOption(
            "cmpt_classify_label_modal.html", "CmptClassifyLabelCtrl", "md", {
                modalParam : function() {
                    return {
                        data    : data
                    }
                }
            }
        )).result;
    };
    //组件-添加组件
    modal.cmptEdit = function(cmpt_type,cmpt_flag) {
        return $modal.open(getOption(
            "cmpt_edit_modal.html", "addCmptModalCtrl", "lg", {
                modalParam : function() {
                    return {
                        cmpt_type  : cmpt_type,
                        cmpt_flag  : cmpt_flag
                    }
                }
            }
        )).result;
    };
    //组件--组件系统类型
    modal.addCmptSysType = function (data) {
        return $modal.open(getOption(
            "cmpt_sys_type_modal.html", "CmptSysCtrl", "md", {
                modalParam : function() {
                    return {
                        data    : data
                    }
                }
            }
        )).result;
    };
    //组件组-查看组件组详情
    modal.cmptGroupDetail = function(id) {
        return $modal.open(getOption(
            "cmpt_group_detail_modal.html", "cmptGroupDetailModalCtrl", "lg", {
                modalParam : function() {
                    return {
                        id  : id
                    }
                }
            }
        )).result;
    };
    //修改阶段(is_update=1新增，2是修改)
    modal.cmptPhaseEdit = function(cn_name,impl_type,language_version, exec_script,plugin_list,ref_param_list,annex_file,is_update,command) {
        return $modal.open(getOption(
            "phase_edit_modal.html", "modifyPhaseCtrl","lg", {
                modalParam : function() {
                    return {
                        cn_name            :cn_name,
                        impl_type          :impl_type,
                        language_version   :language_version,
                        exec_script        :exec_script,
                        // srv_soc            :srv_soc,
                        plugin_list        :plugin_list,
                        ref_param_list     :ref_param_list,
                        annex_file         :annex_file,
                        is_update          :is_update,
                        command            :command
                    }
                }
            }
        )).result;
    };

    //组件组测试配置模态框(发布准备)
    modal.cmptGroupPhaseSoc = function(step, flag, preStepSoc,package_list,testPreObj){
        return $modal.open(getOption(
            "cmpt_group_phase_soc_modal.html", "cmptGroupPublishPhaseSocModalCtrl", "lg", {
                modalParam : function() {
                    return {
                        step        : step,
                        flag        : flag,
                        preStepSoc  : preStepSoc,
                        package_list: package_list,
                        testPreObj  : testPreObj
                    }
                }
            }
        )).result;
    };
    //系统配置新增方案
    modal.addPlanInSysConfig = function(business_sys_name,sys_ip_list,prog_id,node_ip_name_list){
        return $modal.open(getOption(
            "new_plan_modal.html","newPlanInSysConfigCtrl","lg",{
                modalParam : function(){
                    return {
                        business_sys_name : business_sys_name,
                        sys_ip_list       : sys_ip_list,
                        prog_id           : prog_id,
                        node_ip_name_list : node_ip_name_list,
                    }
                }
            }
        )).result;
    };
    //系统配置查看方案
    modal.viweSchemeDetail = function(prog_id){
        return $modal.open(getOption(
            "scheme_detail_modal.html","schemeDetailCtrl","lg",{
                modalParam : function(){
                    return {
                        prog_id : prog_id,
                    }
                }
            }
        )).result;
    };
    //业务系统-节点新增，修改（1.新增2.修改）
    modal.addBusiSysNode = function(flag, business_sys_name,node_name) {
        return $modal.open(getOption(
            "add_node_modal.html", "busiSysAddNodeModalCtrl", "lg", {
                modalParam : function() {
                    return {
                        flag         :flag,
                        business_sys_name:business_sys_name,
                        node_name:node_name
                    }
                }
            }
        )).result;
    };
    //系统配置采集组件部署--新增采集组件
    modal.addCollectModule = function(business_sys_name,cj_cmpt_list) {
        return $modal.open(getOption("add_collect_module_modal.html", "addCollectCmptCtrl", "md", {
                modalParam : function() {
                return {
                    business_sys_name  :business_sys_name,
                    cj_cmpt_list       : cj_cmpt_list,
                }
            }
            }
        )).result;
    };
    //插件库--新增插件
    modal.addPlugin = function(plugin_name,is_update) {
        return $modal.open(getOption(
            "add_plugin_modal.html", "addPluginCtrl", "md", {
                modalParam : function() {
                    return {
                        plugin_name : plugin_name,
                        is_update : is_update
                    }
                }
            }
        )).result;
    };
    //资源-新增资源
    modal.addResource = function(resources_name,is_update) {
        return $modal.open(getOption(
            "add_resource_modal.html", "addResourceCtrl", "md", {
                modalParam : function() {
                    return {
                        resources_name : resources_name,
                        is_update : is_update
                    }
                }
            }
        )).result;
    };
    //节点配置--添加插件
    modal.plusePlugin = function (plugin_list) {
        return $modal.open(getOption(
            "config_node_add_plugin.html", "plusePluginCtrl", "md", {
                modalParam : function() {
                    return {
                        /*language_name:language_name,*/
                        plugin_list:plugin_list,
                        // flag :flag
                    }
                }
            }
        )).result;
    };
    //服务器部署插件
    //新增服务器--添加插件
    modal.SrvPlusePlugin = function (plugin_list,user_info) {
        return $modal.open(getOption(
            "config_node_add_plugin.html", "plusePluginCtrl", "md", {
                modalParam : function() {
                    return {
                        plugin_list :    plugin_list,
                        user_info   :    user_info
                    }
                }
            }
        )).result;
    };
    //系统配置--环境部署
    modal.envPlugin = function() {
        return $modal.open(getOption(
            "env_deploy_modal.html", "envDeployCtrl", "md", {
                modalParam : function() {
                    return {
                    }
                }
            }
        )).result;
    };
    //业务系统-配置-日志管理-上传文件
    modal.uploadLogFile=function(sys_name,log_name,log_id){
        return $modal.open(getOption(
            "upload_logFile_modal.html", "uploadLogFileCtrl", "md", {
                modalParam : function() {
                    return {
                        sys_name:sys_name,
                        log_name:log_name,
                        log_id:log_id
                    }
                }
            }
        )).result;
    };
    //业务系统--配置节点--部署agent弹窗
    modal.deployAgent = function (protocol_soc_list,node_name) {
        return $modal.open(getOption(
            "deploy_agent_modal.html", "deployAgentCtrl", "xl", {
                modalParam : function() {
                    return {
                        protocol_soc_list :protocol_soc_list,
                        node_name : node_name
                    }
                }
            }
        )).result;
    };
    //服务器--部署agent模态框
    modal.srvDeployAgent = function (server_ip, agent_status, user_info) {
        return $modal.open(getOption(
            "server_agent_deploy_modal.html", "ServerAgentDeployCtrl", "md", {
                modalParam : function() {
                    return {
                        server_ip    : server_ip,
                        agent_status : agent_status,
                        user_info    : user_info
                    }
                }
            }
        )).result;
    };
    //业务系统-配置版本机生产包路径（或配置版本机清单路径）
    modal.configVersionDir=function(_flag,soc_version){
        return $modal.open(getOption(
            "config_dir_modal.html", "configDirCtrl", "lg", {
                modalParam : function() {
                    return {
                        _flag :_flag,
                        soc_version : soc_version,
                    }
                }
            }
        )).result;
    };
    //节点配置---配置检查项
    modal.addCheckItem =function (user_info,_soc_ip,info) {
        return $modal.open(getOption(
            "config_check_item_modal.html", "configCheckItemCtrl", "lg", {
                modalParam : function() {
                    return {
                        phase:info,
                        user_info : user_info,
                        soc_ip:_soc_ip,
                    }
                }
            }
        )).result;
    };
    //方案-固化配置
    modal.addCurPhase= function (business_sys_name,logic_node_list,node_soc_list) {
        return $modal.open(getOption(
            "program_add_cur_modal.html", "programCurConfigCtrl", "md", {
                modalParam : function() {
                    return {
                        business_sys_name : business_sys_name,
                        logic_node_list : logic_node_list,
                        node_soc_list : node_soc_list
                    }
                }
            }
        )).result;
    };
    //方案-人工阶段
    modal.addManualPhase = function (script) {
        return $modal.open(getOption(
            "program_add_manual.html", "programManualPhaseCtrl", "md", {
                modalParam : function() {
                    return {
                        script : script
                    }
                }
            }
        )).result;
    };
    //方案-批量操作
    modal.programBacthConfig = function (group_list,business_sys_name,control) {
        return $modal.open(getOption(
            "program_batch_config_modal.html", "programBatchConfigCtrl", "md", {
                modalParam : function() {
                    return {
                        group_list:group_list,
                        business_sys_name:business_sys_name,
                        control:control
                    }
                }
            }
        )).result;
    };
    //------------------日志模块

    //日志巡检-日志分析-日志选择(传递系统，节点列表,新增还是修改1.新增2.修改)
    modal.configLogBase = function (sys_name,choose_ip_list) {
        return $modal.open(getOption(
            "config_log_modal.html", "configLogCtrl", "lg", {
                modalParam : function() {
                    return {
                        sys_name :sys_name,
                        choose_ip_list : choose_ip_list,
                    }
                }
            }
        )).result;
    };
    //日志巡检-日志分析-日志筛选
    modal.configScreenBase = function (log_screen) {
        return $modal.open(getOption(
            "config_log_screen_modal.html", "configLogScreenCtrl", "md", {
                modalParam : function() {
                    return {
                        log_screen :log_screen,
                    }
                }
            }
        )).result;
    };
    //日志巡检-新建巡检报告-日志选择
    modal.reportLogChoose = function (report_choose,sys_name) {
        return $modal.open(getOption(
            "report_log_modal.html", "reportLogChooseCtrl", "lg", {
                modalParam : function() {
                    return {
                        report_choose :report_choose,
                        sys_name:sys_name
                    }
                }
            }
        )).result;
    };
    //------------------其他模块-------------------
    //业务系统-配置模块
    modal.showPluginOrProtocolList = function(list,ip,flag){
        return $modal.open(getOption("view_plugin_protocol_modal.html", "viewPluginProtocolCtrl", "sm", {
                modalParam : function() {
                    return {
                        list       :list,
                        ip         :ip,
                        flag       : flag,
                    }
                }
            }
        )).result;
    }
    //初始化修改密码
    modal.initModifyPwd = function(userid) {
        return $modal.open(getOption(
            "password_modify.html", "InitModifyPwd", "md", {
                modalParam : function() {
                    return {
                        userid    : userid
                    }
                }
            }
        )).result;
    }
    //我的任务  接口信息查看
    modal.jsonList = function(data,url,aprov_type,task_seq){
        return $modal.open(getOption(
            "json_list.html", "JsonListCtrl", "md", {
                modalParam : function() {
                    return {
                        data       : data,
                        url        : url,
                        aprov_type : aprov_type,
                        task_seq   : task_seq
                    }
                }
            }
        )).result;
    };
    //巡检--信息提示框
    modal.xjInfoTips = function(data){
        return $modal.open(getOption(
            "xj_message_tips.html", "xjMessageTipsCtrl", "sm", {
                modalParam : function() {
                    return {
                       data:data
                    }
                }
            }
        )).result;
    };
    //巡检--配置数据集
    modal.confDataCollection = function (data,task_id,indi_model_name) {
        return $modal.open(getOption(
            "xj_data_gather.html", "configDataCollectionCtrl", "md", {
                modalParam : function() {
                    return {
                        data    : data,
                        task_id : task_id,
                        indi_model_name:indi_model_name
                    }
                }
            }
        )).result;
    };
    //巡检--数据集导入明细
    modal.dataGatherDetail = function (config_item,task_id) {
        return $modal.open(getOption(
            "xj_data_gather_detail.html", "dataGatherDetailCtrl", "md", {
                modalParam : function() {
                    return {
                        data    : config_item,
                        task_id : task_id
                    }
                }
            }
        )).result;
    };
    //数据采集-自动采集-文件浏览
    modal.viewFileDirList = function(content,init_path){
        return $modal.open(getOption(
            "view_file_dir_list.html", "ViewFileDirListCtrl", "md", {
                modalParam : function() {
                    return {
                        content    : content,
                        init_path  :init_path
                    }
                }
            }
        )).result;
    };

    /**
     * 调度模块
     * **/
    //调度-流程列表-流程复制
    modal.repeatFlowModal = function(flow_id){
        return $modal.open(getOption(
            "Repeat_flow_modal.html", "RepeatFlowCtrl", "md", {
                modalParam : function() {
                    return {
                        flow_id    : flow_id,
                    }
                }
            }
        )).result;
    };
    //调度发布原因模态框
    modal.publishReasonModal = function(){
        return $modal.open(getOption(
            "publish_reason_modal.html", "FlowPubReasonCtrl", "md", {
                modalParam : function() {
                    return {

                    }
                }
            }
        )).result;
    };
    //调度流程时间配置
    modal.configFlowTime = function(data){
        return $modal.open(getOption(
            "flow_time_config.html", "configFlowTimeCtrl", "lg", {
                modalParam : function() {
                    return {
                        data    : data
                    }
                }
            }
        )).result;
    };
    //调度流程设置时间条件
    modal.configFlowTimeCondition = function(data){
        return $modal.open(getOption(
            "flow_set_timecondition_modal.html", "configFlowTimeConditionCtrl", "sm", {
                modalParam : function() {
                    return {
                        data    : data
                    }
                }
            }
        )).result;
    };
    //调度流程-设置作业方式（组件，自定义）
    modal.setFlowJobMethod = function(job_type,job_data,is_detail,special_element){
        return $modal.open(getOption(
            "flow_set_jobmethod_modal.html", "configFlowJobMethodCtrl", "lg", {
                modalParam : function() {
                    return {
                        job_type : job_type,
                        job_data : job_data,
                        is_detail: is_detail,
                        is_special_element : special_element
                    }
                }
            }
        )).result;
    };
    //调度流程-选择引用节点
    modal.selectFlowRefNode = function(source_list,ref_node_list){
        return $modal.open(getOption(
            "flow_select_ref_node_modal.html", "configRefNodeCtrl", "md", {
                modalParam : function() {
                    return {
                        source_list:source_list,
                        ref_node_list:ref_node_list
                    }
                }
            }
        )).result;
    };
    //调度流程-添加场景
    modal.addScene = function(scene_palette_list){
        return $modal.open(getOption(
            "flow_add_scene_modal.html", "addSceneCtrl", "md", {
                modalParam : function() {
                    return {
                        scene_list : scene_palette_list
                    }
                }
            }
        )).result;
    };
    //调度流程-转化私有元素
    modal.convertPrivateEle = function(element_info){
        return $modal.open(getOption(
            "flow_add_private_ele_modal.html", "addPrivateElementCtrl", "md", {
                modalParam : function() {
                    return {
                        element : element_info
                    }
                }
            }
        )).result;
    };

    //查看单个作业执行信息
    modal.viewSingleWorkInfo = function(task_id,flow_job_list,job,task_status,is_detail){
        return $modal.open(getOption(
            "dtask_view_single_job_modal.html", "viewSingleWorkCtrl", "md", {
                modalParam : function() {
                    return {
                        task_id       : task_id,
                        flow_job_list : flow_job_list,
                        job           : job,
                        task_status   : task_status,
                        is_detail     : is_detail
                    }
                }
            }
        )).result;
    };
    //查看任务进程信息
    modal.viewTaskProgressInfo = function(){
        return $modal.open(getOption(
            "dtask_progress_modal.html", "viewTaskProgressInfoCtrl", "md", {
                modalParam : function() {
                    return {}
                }
            }
        )).result;
    };
    //添加跳过作业组件参数
    modal.addSkipWorkParams = function(output_param){
        return $modal.open(getOption(
            "add_skipwork_param_modal.html", "addSkipWorkParamsCtrl", "md", {
                modalParam : function() {
                    return {
                        output_param : output_param
                    }
                }
            }
        )).result;
    };
    //调度任务执行-输入开始作业参数
    modal.inputStartJobParams = function(input_param){
        return $modal.open(getOption(
            "input_startjob_param_modal.html", "inputStartJobParamsCtrl", "md", {
                modalParam : function() {
                    return {
                        input_param : input_param
                    }
                }
            }
        )).result;
    };
    //调度任务执行-强制完成作业
    modal.completeJob = function(task_id,job_id_list){
        return $modal.open(getOption(
            "complete_job_modal.html", "completeJobCtrl", "md", {
                modalParam : function() {
                    return {
                        task_id : task_id,
                        job_id_list:job_id_list
                    }
                }
            }
        )).result;
    };
    //数据源配置
    modal.configDataSource = function(output_param,business_sys_name,srv_soc,flag){
        return $modal.open(getOption(
            "config_data_source.html", "configDataSourceCtrl", "md", {
                modalParam : function() {
                    return {
                        dataSource_type : output_param,
                        business_sys_name:business_sys_name,
                        srv_soc         : srv_soc,
                        flag            : flag,
                    }
                }
            }
        )).result;
    };
    //任务概览--选择节点
    modal.chooseNodes = function(selected_node_list){
        return $modal.open(getOption(
            "ywtask_choose_nodes.html", "ywtaskChooseNodeCtrl", "lg", {
                modalParam : function() {
                    return {
                        node_list:selected_node_list
                    }
                }
            }
        )).result;
    };
    //调度场景--添加场景元素
    modal.addSceneElement = function(scene_info,is_update){
        return $modal.open(getOption(
            "add_scene_element_modal.html", "addSceneElementCtrl", "md", {
                modalParam : function() {
                    return {
                        scene_info:scene_info,
                        is_update : is_update
                    }
                }
            }
        )).result;
    };
    //调度策略--新增策略组
    modal.newStrategyGroup = function(){
        return $modal.open(getOption(
            "add_strategy_group_modal.html", "newStrategyGroupCtrl", "md", {
                modalParam : function() {
                    return {}
                }
            }
        )).result;
    };
    //调度策略--新增策略组
    modal.viewPhaseSoc = function(data){
        return $modal.open(getOption(
            "node_soc_detail_modal.html", "nodeSocDetailCtrl", "md", {
                modalParam : function() {
                    return {
                        data:data
                    }
                }
            }
        )).result;
    };

    //发布申请--添加项目
    modal.releaseAddProject= function(data){
        return $modal.open(getOption(
            "release_add_project_modal.html", "releaseAppAddProjectCtrl", "md", {
                modalParam : function() {
                    return {
                        data: data
                    }
                }
            }
        )).result;
    };

    return modal;
}]);
//解决调度复制流程传值问题
CvService.factory("Params",function () {
    var _obj = {};
    _obj.setParams = function (params) {
        _obj = angular.extend(_obj,params)
    };
    _obj.getParams = function () {
        return _obj;
    };
    _obj.init = function () {
        _obj = {};
    };
    return _obj;
});
