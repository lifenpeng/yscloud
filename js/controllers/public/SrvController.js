var server_m = angular.module('serverCtrl',[]);

//新增服务器控制器-保存ip
server_m.controller('serverNewCtrl', ["$scope", "$state", "Modal", "Server", "CV",  function ($scope, $state, Modal, Server, CV) {
    //页面信息
    $scope.info = {
        srv_info : {     //服务器信息
            server_ip : ''  //服务器ip
        }
    };
    //页面控制
    $scope.control = {
        save_ip_loading : false //保存loading
    };
    $scope.saveSrvIp = function () {
        if(!CV.valiForm($scope.server_form)){
            return;
        }
        $scope.control.save_ip_loading = true;
        Server.addServer($scope.info.srv_info.server_ip).then(function (data) {
            $scope.control.save_ip_loading = false;
            $state.go('srv_new.srv_new_basic',{server_ip : $scope.info.srv_info.server_ip,agent_status : data.agent_status, server_id : data.server_id});
        },function (error) {
            Modal.alert(error.message,3);
            $scope.control.save_ip_loading = false;
        });
    }
}]);
//新增服务器控制器-基础信息
server_m.controller('serverNewBasicInfoCtrl', ["$scope", "$rootScope", "$stateParams", "$state", "$timeout", "Modal", "Server", "ProtocolType", "CV", function ($scope, $rootScope, $stateParams, $state, $timeout, Modal, Server, ProtocolType, CV) {
    //页面信息
    $scope.info = {
        srv_info : {     //服务器信息
            server_ip : $stateParams.server_ip,  //服务器ip
            server_id : $stateParams.server_id, //服务器id
            machine_basic_bean : {
                machine_hard_bean:{
                    server_name:'',
                    machine_cfg:'',
                    cpu: '',
                    mem:'',
                    disk:'',
                    network:''
                },
                machine_soft_bean:{
                    op_system:'',
                    jre:'',
                    middleware:'',
                    database:''
                }
            },
        },
        agent_status : $stateParams.agent_status,
        data_soc_list : [], //数据源列表
        node : {
            plugin_list : [],
            monitor_item_list: []
        },
    };
    //页面控制
    $scope.control = {
        basic_info_btn_loading : false, //获取基本信息标志
        save_btn_loading : false ,  //保存信息loading
        config_info_empty_flag : true   //配置信息暂无
    };
    //页面数据
    $scope.data = {
        machine_hard_bean : {
            server_name:'',
            machine_cfg:'',
            cpu: '',
            mem:'',
            disk:'',
            network:''
        }, //备份服务器硬件信息（判断是否修改）
        machine_soft_bean : {
            op_system:'',
            jre:'',
            middleware:'',
            database:''
        }  //备份服务器软件信息 （判断是否修改）
    };
    $scope.config = {
        form:{}
    };
    //部署agent用户信息
    $rootScope.user_info = {
        user_list:[],
        user_loading:true,
        user_msg:''
    };
    var init = function () {
        //获取数据源
        Server.getDataSource($scope.info.srv_info.server_ip).then(function (data) {
            $scope.info.data_soc_list = data.soc_bean_list || [];
            //转换格式
            var _data_soc_list = $scope.info.data_soc_list;
            for (var i=0;i< _data_soc_list.length; i++){
                _data_soc_list[i].protocol_type_cn = CV.findValue(_data_soc_list[i].protocol_type,ProtocolType)
            }
        },function (error) {
            Modal.alert(error.message,3);
        });
        //获取基本信息
        $scope.getBasicInfo();
        //获取用户列表
        Server.getUserList($scope.info.srv_info.server_ip).then(function (data) {
            $rootScope.user_info.user_loading = false;
            $rootScope.user_info.user_msg = "";
            $rootScope.user_info.user_list = data.user_list || [];
        },function (error) {
            $rootScope.user_info.user_loading = false;
            $rootScope.user_info.user_msg = error.message;
        });

    };
    //根据状态删除插件
    var deletePluginByDeployStatus = function(deploy_status){
        for(var i = 0; i < $scope.info.node.plugin_list.length; i++){
            var _plugin = $scope.info.node.plugin_list[i];
            if(_plugin.deploy_status == deploy_status){
                $scope.info.node.plugin_list.splice(i--,1);
            }
        }
    };
    //获取基本信息
    $scope.getBasicInfo = function () {
        $scope.control.basic_info_btn_loading = true;
        //获取基本信息
        Server.getServerBasicInfo($scope.info.srv_info.server_ip).then(function (data) {
            $timeout(function () {
                $scope.control.basic_info_btn_loading = false;
                $scope.info.srv_info.machine_basic_bean = data.machine_basic_bean || {};
                $scope.data.machine_hard_bean = angular.copy(data.machine_basic_bean.machine_hard_bean || {});
                $scope.data.machine_soft_bean = angular.copy(data.machine_basic_bean.machine_soft_bean || {});
                $scope.control.config_info_empty_flag = false;
            },0);
        },function (error) {
            Modal.alert(error.message,3);
            $scope.control.basic_info_btn_loading = false;
        })
    };
    //失去焦点判断基本信息是否改动
    $scope.testIsChange = function(msg,info_name,flag_name,old_msg){
        if(!msg[flag_name]){
            if(msg[info_name].replace(/^\s+|\s+$/g,'')!=old_msg[info_name].replace(/^\s+|\s+$/g,'')){
                msg[flag_name] = 1;
            }
        }
    };
    //agent部署
    $scope.startDeployAgent = function () {
        Modal.srvDeployAgent($scope.info.srv_info.server_ip,$scope.info.agent_status,$rootScope.user_info).then(function (data) {
            $scope.info.agent_status = data;
        })
    };
    //部署-选择插件
    $scope.chooseDeployPlugin = function () {
        $scope.info.node.plugin_list = $scope.info.node.plugin_list || [];
        Modal.SrvPlusePlugin($scope.info.node.plugin_list,$scope.info.srv_info.server_ip,$scope.info.srv_info.server_id).then(function (data) {
            var _deploy_list = [],_delete_plugin_list=[];
            var plugin_info = {
                server_ip            : $scope.info.srv_info.server_ip,
                server_id            : $scope.info.srv_info.server_id,
                server_user          : data.server_user,
                plugin_list       : [],
            };
            //删除所有部署失败的
            deletePluginByDeployStatus(3);
            //deploy_status 0未部署 1 部署中 2成功 3失败 4 删除中
            //处理全部反部署
            if(data.selected_plugin.length === 0){
                angular.forEach($scope.info.node.plugin_list,function(item,index,array){
                    item.deploy_status = 4;  //删除中
                });
            }
            //处理-部分部署,部分反部署
            if(data.selected_plugin.length !== 0){
                //需要删除的插件(求差集(A-B) plugin_list(A) - data.selected_plugin(B))
                for(var i=0; i < $scope.info.node.plugin_list.length; i++){
                    var _all_plugin = $scope.info.node.plugin_list[i];
                    var flag = true;
                    for(var j = 0; j < data.selected_plugin.length; j++){
                        if(_all_plugin.plugin_name === data.selected_plugin[j].plugin_name){
                            flag = false;
                        }
                    }
                    if(flag){
                        _delete_plugin_list.push(_all_plugin.plugin_name);
                    }
                }
                //处理部分反部署
                if(_delete_plugin_list.length){
                    for(var m = 0; m < $scope.info.node.plugin_list.length; m++){
                        var _plugin_item = $scope.info.node.plugin_list[m];
                        for(var n = 0; n < _delete_plugin_list.length; n++){
                            if(_delete_plugin_list[n] === _plugin_item.plugin_name){
                                if(_plugin_item.deploy_status === 2){
                                    _plugin_item.deploy_status = 4; //删除中
                                }
                            }
                        }
                    }
                }
                //处理部分部署
                for(var k = 0; k < data.selected_plugin.length; k++){
                    if(!data.selected_plugin[k].deploy_status){
                        _deploy_list.push({
                            plugin_name : data.selected_plugin[k].plugin_name,
                            error_message:'',
                            deploy_status:1, //部署中
                        });
                    }
                }
                //所有插件列表(包含部署中和删除中的临时数据)
                $scope.info.node.plugin_list = $scope.info.node.plugin_list.concat(_deploy_list);
            }
            //处理真正部署的插件集合
            angular.forEach($scope.info.node.plugin_list,function (item,index,array) {
                if(item.deploy_status === 1 || item.deploy_status === 2){
                    plugin_info.plugin_list.push(item.plugin_name);
                }
            });
            //开始部署/反部署
            $scope.control.plugin_deploy_loading = true;
            Server.exeDeployPlugin(plugin_info).then(function (data) {
                $timeout(function(){
                    $scope.control.plugin_deploy_loading = false;
                    //删除(即：反部署)
                    deletePluginByDeployStatus(4);
                    //出错的插件列表
                    var _error_plugin = data.plugin_list ? data.plugin_list : [];
                    for(var j = 0; j < $scope.info.node.plugin_list.length; j++){
                        var _plugin = $scope.info.node.plugin_list[j];
                        if(_error_plugin.length){
                            for(var i = 0; i < _error_plugin.length; i++){
                                if(_error_plugin[i] === _plugin.plugin_name){
                                    _plugin.error_message = data.error_msg ? data.error_msg : '';
                                    _plugin.deploy_status = 3;
                                }else{
                                    _plugin.deploy_status = 2;
                                }
                            }
                        }else{
                            _plugin.deploy_status = 2;
                        }
                    }
                },0);
            },function (error) {
                $scope.control.plugin_deploy_loading = false;
                //处理正在部署的插件
                for(var i = 0; i < _deploy_list.length; i++){
                    for(var j = 0; j < $scope.info.node.plugin_list.length; j++){
                        var _plugin_j = $scope.info.node.plugin_list[j];
                        if(_deploy_list[i].plugin_name === _plugin_j.plugin_name){
                            _plugin_j.error_message = error.message;
                            _plugin_j.deploy_status = 3;
                        }
                    }
                }
            })
        })
    };
    //配置-状态检查
    $scope.statusCheckConfig = function (step) {
        Modal.addCheckItem($rootScope.user_info,$scope.info.node.node_ip,step.phase).then(function (data) {
            step.phase = data;
        })
    };
    //状态检查
    $scope.addCheckItem = function () {
        /*if(!CV.valiForm($scope.config.form.status_monitor)){
            return false;
        }*/
        if($scope.info.node.monitor_item_list.length != 0 && !$scope.info.node.monitor_item_list[$scope.info.node.monitor_item_list.length-1].phase.phase_name){
            Modal.alert("请选择检查项组件！",3);
            $scope.control.un_save_check_flag = false;
            return;
        }
        var _obj = {
            monitor_item_name:'',
            phase:{}
        };
        $scope.info.node.monitor_item_list.push(_obj);
    };
    //删除状态检查
    $scope.deleteStatusCheck = function (index) {
        Modal.confirm("确认删除当前检查项？").then(function () {
            $scope.info.node.monitor_item_list.splice(index,1);
        })
    };
    //保存状态检查
    $scope.saveMonitorItem = function () {
        if(!CV.valiForm($scope.config.form.status_monitor)){
            return false;
        }
        if($scope.info.node.monitor_item_list.length != 0 && !$scope.info.node.monitor_item_list[$scope.info.node.monitor_item_list.length-1].phase.phase_name){
            Modal.alert("请选择检查项组件！",3);
            return;
        }
        $scope.control.start_check_save_loading = true;
        Sys.saveMonitorItemData(_sys_id,$scope.info.node.node_ip,$scope.info.node.monitor_item_list).then(function (data) {
            if(data){
                $scope.control.start_check_save_loading = false;
                Modal.alert("保存成功",2);
            }
        },function (error) {
            $scope.control.start_check_save_loading = false;
            Modal.alert(error.message,3);
        })
    };
    //保存
    $scope.saveSrvInfo = function () {
        $scope.control.save_btn_loading = true;
        Server.saveServerInfo($scope.info.srv_info,$scope.info.agent_status).then(function (data) {
            $scope.control.save_btn_loading = false;
            $state.go('srv_list');
        },function (error) {
            $scope.control.save_btn_loading = false;
            Modal.alert(error.message,3);
        })
    };
    //取消
    $scope.back = function () {
        $state.go('srv_list');
    };
    init();
}]);
//服务器列表
server_m.controller('serverListCtrl',["$scope", "$timeout", "$location", "CV", function($scope, $timeout, $location, CV){
    $scope.srv = {};
    //清除服务器地址
    $scope.clearIp = function() {
        $scope.srv.server_ip = "";
    };
}]);
//修改控制器
server_m.controller('serverModifyCtrl', ["$scope", "$rootScope", "$stateParams", "$state", "$timeout", "Modal", "Server", "ProtocolType", "CV", function ($scope, $rootScope, $stateParams, $state, $timeout, Modal, Server, ProtocolType, CV) {
    //页面信息
    $scope.info = {
        srv_info : {     //服务器信息
            server_ip : $stateParams.server_ip,  //服务器ip
            server_id : '',
            machine_basic_bean : {
                machine_hard_bean:{
                    server_name:'',
                    machine_cfg:'',
                    cpu: '',
                    mem:'',
                    disk:'',
                    network:''
                },
                machine_soft_bean:{
                    op_system:'',
                    jre:'',
                    middleware:'',
                    database:''
                }
            },
        },
        agent_status : '',
        node : {
            plugin_list : [],
            monitor_item_list: []
        },
        data_soc_list : [] //数据源列表
    };
    //页面控制
    $scope.control = {
        basic_info_btn_loading : false, //保存ip标志
        save_btn_loading : false,
        basic_update_flag : true   //配置信息暂无
    };
    $scope.data = {
        machine_hard_bean : {
            server_name:'',
            machine_cfg:'',
            cpu: '',
            mem:'',
            disk:'',
            network:''
        }, //备份服务器硬件信息（判断是否修改）
        machine_soft_bean : {
            op_system:'',
            jre:'',
            middleware:'',
            database:''
        }  //备份服务器软件信息 （判断是否修改）
    };
    //部署agent用户信息
    $rootScope.user_info = {
        user_list:[],
        user_loading:true,
        user_msg:''
    }
    //根据状态删除插件
    var deletePluginByDeployStatus = function(deploy_status){
        for(var i = 0; i < $scope.info.node.plugin_list.length; i++){
            var _plugin = $scope.info.node.plugin_list[i];
            if(_plugin.deploy_status == deploy_status){
                $scope.info.node.plugin_list.splice(i--,1);
            }
        }
    };
    //获取节点插件列表
    var initEnvList = function (server_id,server_ip) {
        $scope.info.node.plugin_list = [];
        if(!server_id) return;
        Server.getPluginListInNode(server_id,server_ip).then(function (data) {
            var _plugin_list = data.deploy_plugin_names ? data.deploy_plugin_names :[];
            angular.forEach(_plugin_list,function (item) {
                $scope.info.node.plugin_list.push({
                    deploy_status : 2,
                    plugin_name   : item,
                });
            })
        });
    };
    var init = function () {
        //获取数据源
        Server.getDataSource($scope.info.srv_info.server_ip).then(function (data) {
            $scope.info.data_soc_list = data.soc_bean_list || [];
            //转换格式
            var _data_soc_list = $scope.info.data_soc_list;
            for (var i=0;i< _data_soc_list.length; i++){
                _data_soc_list[i].protocol_type_cn = CV.findValue(_data_soc_list[i].protocol_type,ProtocolType)
            }
        },function (error) {
            Modal.alert(error.message,3);
        });
        $scope.control.basic_info_btn_loading = true;
        //获取服务器信息
        Server.viewServerInfo($scope.info.srv_info.server_ip).then(function (data) {
            $scope.control.basic_info_btn_loading = false;
            $scope.info.srv_info.server_desc =  data.server_bean.server_desc;
            $scope.info.agent_status = data.server_bean.agent_status;
            $scope.info.srv_info.server_id = data.server_bean.server_id || '';
            $scope.info.srv_info.machine_basic_bean = data.machine_basic_bean || $scope.info.srv_info.machine_basic_bean;
            $scope.control.config_info_empty_flag = !data.machine_basic_bean;
            $scope.data.machine_hard_bean = data.machine_basic_bean ? angular.copy(data.machine_basic_bean.machine_hard_bean) : $scope.data.machine_hard_bean;
            $scope.data.machine_soft_bean = data.machine_basic_bean ? angular.copy(data.machine_basic_bean.machine_soft_bean) : $scope.data.machine_soft_bean;
            initEnvList($scope.info.srv_info.server_id,$scope.info.srv_info.server_ip);
        },function (error) {
            $scope.control.basic_info_btn_loading = false;
            Modal.alert(error.message,3);
        });
        //获取用户列表
        Server.getUserList($scope.info.srv_info.server_ip).then(function (data) {
            $rootScope.user_info.user_loading = false;
            $rootScope.user_info.user_msg = "";
            $rootScope.user_info.user_list = data.user_list || [];
        },function (error) {
            $rootScope.user_info.user_loading = false;
            $rootScope.user_info.user_msg = error.message;
        });
    };
    //失去焦点判断基本信息是否改动
    $scope.testIsChange = function(msg,info_name,flag_name,old_msg){
        if(!msg[flag_name]){
            if(msg[info_name].replace(/^\s+|\s+$/g,'')!=old_msg[info_name].replace(/^\s+|\s+$/g,'')){
                msg[flag_name] = 1;
            }
        }
    };
    //agent部署
    $scope.startDeployAgent = function () {
        Modal.srvDeployAgent($scope.info.srv_info.server_ip,$scope.info.agent_status,$rootScope.user_info).then(function (data) {
            $scope.info.agent_status = data;
        })
    };
    //部署-选择插件
    $scope.chooseDeployPlugin = function () {
        $scope.info.node.plugin_list = $scope.info.node.plugin_list || [];
        Modal.SrvPlusePlugin($scope.info.node.plugin_list,$rootScope.user_info).then(function (data) {
            var _deploy_list = [],_delete_plugin_list=[];
            var plugin_info = {
                server_ip            : $scope.info.srv_info.server_ip,
                server_id            : $scope.info.srv_info.server_id,
                server_user          : data.server_user,
                plugin_list       : [],
            };
            //删除所有部署失败的
            deletePluginByDeployStatus(3);
            //deploy_status 0未部署 1 部署中 2成功 3失败 4 删除中
            //处理全部反部署
            if(data.selected_plugin.length === 0){
                angular.forEach($scope.info.node.plugin_list,function(item,index,array){
                    item.deploy_status = 4;  //删除中
                });
            }
            //处理-部分部署,部分反部署
            if(data.selected_plugin.length !== 0){
                //需要删除的插件(求差集(A-B) plugin_list(A) - data.selected_plugin(B))
                for(var i=0; i < $scope.info.node.plugin_list.length; i++){
                    var _all_plugin = $scope.info.node.plugin_list[i];
                    var flag = true;
                    for(var j = 0; j < data.selected_plugin.length; j++){
                        if(_all_plugin.plugin_name === data.selected_plugin[j].plugin_name){
                            flag = false;
                        }
                    }
                    if(flag){
                        _delete_plugin_list.push(_all_plugin.plugin_name);
                    }
                }
                //处理部分反部署
                if(_delete_plugin_list.length){
                    for(var m = 0; m < $scope.info.node.plugin_list.length; m++){
                        var _plugin_item = $scope.info.node.plugin_list[m];
                        for(var n = 0; n < _delete_plugin_list.length; n++){
                            if(_delete_plugin_list[n] === _plugin_item.plugin_name){
                                if(_plugin_item.deploy_status === 2){
                                    _plugin_item.deploy_status = 4; //删除中
                                }
                            }
                        }
                    }
                }
                //处理部分部署
                for(var k = 0; k < data.selected_plugin.length; k++){
                    if(!data.selected_plugin[k].deploy_status){
                        _deploy_list.push({
                            plugin_name : data.selected_plugin[k].plugin_name,
                            error_message:'',
                            deploy_status:1, //部署中
                        });
                    }
                }
                //所有插件列表(包含部署中和删除中的临时数据)
                $scope.info.node.plugin_list = $scope.info.node.plugin_list.concat(_deploy_list);
            }
            //处理真正部署的插件集合
            angular.forEach($scope.info.node.plugin_list,function (item,index,array) {
                if(item.deploy_status === 1 || item.deploy_status === 2){
                    plugin_info.plugin_list.push(item.plugin_name);
                }
            });
            //开始部署/反部署
            $scope.control.plugin_deploy_loading = true;
            Server.exeDeployPlugin(plugin_info).then(function (data) {
                $timeout(function(){
                    $scope.control.plugin_deploy_loading = false;
                    //删除(即：反部署)
                    deletePluginByDeployStatus(4);
                    //出错的插件列表
                    var _error_plugin = data.plugin_list ? data.plugin_list : [];
                    for(var j = 0; j < $scope.info.node.plugin_list.length; j++){
                        var _plugin = $scope.info.node.plugin_list[j];
                        if(_error_plugin.length){
                            for(var i = 0; i < _error_plugin.length; i++){
                                if(_error_plugin[i] === _plugin.plugin_name){
                                    _plugin.error_message = data.error_msg ? data.error_msg : '';
                                    _plugin.deploy_status = 3;
                                }else{
                                    _plugin.deploy_status = 2;
                                }
                            }
                        }else{
                            _plugin.deploy_status = 2;
                        }
                    }
                },0);
            },function (error) {
                $scope.control.plugin_deploy_loading = false;
                //处理正在部署的插件
                for(var i = 0; i < _deploy_list.length; i++){
                    for(var j = 0; j < $scope.info.node.plugin_list.length; j++){
                        var _plugin_j = $scope.info.node.plugin_list[j];
                        if(_deploy_list[i].plugin_name === _plugin_j.plugin_name){
                            _plugin_j.error_message = error.message;
                            _plugin_j.deploy_status = 3;
                        }
                    }
                }
            })
        })
    };
    //配置-状态检查
    $scope.statusCheckConfig = function (step) {
        Modal.addCheckItem($rootScope.user_info,$scope.info.node.node_ip,step.phase).then(function (data) {
            step.phase = data;
        })
    };
    //状态检查
    $scope.addCheckItem = function () {
        /*if(!CV.valiForm($scope.config.form.status_monitor)){
            return false;
        }*/
        if($scope.info.node.monitor_item_list.length != 0 && !$scope.info.node.monitor_item_list[$scope.info.node.monitor_item_list.length-1].phase.phase_name){
            Modal.alert("请选择检查项组件！",3);
            $scope.control.un_save_check_flag = false;
            return;
        }
        var _obj = {
            monitor_item_name:'',
            phase:{}
        };
        $scope.info.node.monitor_item_list.push(_obj);
    };
    //删除状态检查
    $scope.deleteStatusCheck = function (index) {
        Modal.confirm("确认删除当前检查项？").then(function () {
            $scope.info.node.monitor_item_list.splice(index,1);
        })
    };
    //保存状态检查
    $scope.saveMonitorItem = function () {
        if(!CV.valiForm($scope.config.form.status_monitor)){
            return false;
        }
        if($scope.info.node.monitor_item_list.length != 0 && !$scope.info.node.monitor_item_list[$scope.info.node.monitor_item_list.length-1].phase.phase_name){
            Modal.alert("请选择检查项组件！",3);
            return;
        }
        $scope.control.start_check_save_loading = true;
        Sys.saveMonitorItemData(_sys_id,$scope.info.node.node_ip,$scope.info.node.monitor_item_list).then(function (data) {
            if(data){
                $scope.control.start_check_save_loading = false;
                Modal.alert("保存成功",2);
            }
        },function (error) {
            $scope.control.start_check_save_loading = false;
            Modal.alert(error.message,3);
        })
    };
    //保存
    $scope.saveSrvInfo = function () {
        $scope.control.save_btn_loading = true;
        Server.saveServerInfo($scope.info.srv_info,$scope.info.agent_status).then(function (data) {
            $scope.control.save_btn_loading = false;
            $state.go('srv_list');
        },function (error) {
            $scope.control.save_btn_loading = false;
            Modal.alert(error.message,3);
        })
    };
    //取消
    $scope.back = function () {
        $state.go('srv_list');
    };
    init();
}]);
//服务器查看
server_m.controller('serverDetailCtrl', ["$scope", "$stateParams", "$state", "Modal", "Server", "ProtocolType", "CV", function ($scope, $stateParams, $state, Modal, Server, ProtocolType, CV) {
    //页面信息
    $scope.info = {
        srv_info : {     //服务器信息
            server_ip : $stateParams.server_ip,  //服务器ip
            server_id : ''
        },
        agent_status : '',
        data_soc_list : [], //数据源列表
        node : {
            plugin_list : []
        },
    };
    //页面控制
    $scope.control = {
        basic_info_btn_loading : false, //保存ip标志
        basic_update_flag : true   //配置信息暂无
    };
    $scope.data = {
    };
    var init = function () {
        //获取数据源
        Server.getDataSource($scope.info.srv_info.server_ip).then(function (data) {
            $scope.info.data_soc_list = data.soc_bean_list || [];
            //转换格式
            var _data_soc_list = $scope.info.data_soc_list;
            for (var i=0;i< _data_soc_list.length; i++){
                _data_soc_list[i].protocol_type_cn = CV.findValue(_data_soc_list[i].protocol_type,ProtocolType)
            }
        },function (error) {
            Modal.alert(error.message,3);
        });
        //获取服务器信息
        Server.viewServerInfo($scope.info.srv_info.server_ip).then(function (data) {
            $scope.info.srv_info.server_desc =  data.server_bean.server_desc;
            $scope.info.agent_status = data.server_bean.agent_status;
            $scope.info.srv_info.server_id = data.server_bean.server_id || '';
            $scope.info.srv_info.machine_basic_bean = data.machine_basic_bean;
            $scope.control.config_info_empty_flag = !data.machine_basic_bean;
            initEnvList($scope.info.srv_info.server_id,$scope.info.srv_info.server_ip);
        },function (error) {
            Modal.alert(error.message,3)
        })
    };
    //获取节点插件列表
    var initEnvList = function (server_id,server_ip) {
        $scope.info.node.plugin_list = [];
        if(!server_id) return;
        Server.getPluginListInNode(server_id,server_ip).then(function (data) {
            var _plugin_list = data.deploy_plugin_names ? data.deploy_plugin_names :[];
            angular.forEach(_plugin_list,function (item) {
                $scope.info.node.plugin_list.push({
                    deploy_status : 2,
                    plugin_name   : item,
                });
            })
        });
    };
    //返回
    $scope.back = function () {
        $state.go('srv_list');
    };
    init();
}]);

//agnet监控
server_m.controller('agentMonitorCtrl',["$scope","$rootScope","$stateParams","$interval","$timeout","Server","Modal",function ($scope,$rootScope,$stateParams,$interval,$timeout,Server,Modal) {

    //页面信息
    $scope.info = {
        node_info:{
            basic_info:{},
        },
        search_key_word : ''
    };
    //页面控制
    $scope.control = {
        view_node : false,
        active_node_i:-1, //节点tab选中
    };
    //页面数据
    $scope.data = {
        node_basic_list : [],
        choosed_node_list :[],
    }
    //切换TAB时状态和控制字段的转化
    var changeTab = function(index) {
        var _last_index = $scope.control.active_node_i;
        if(index == _last_index) return;
        if(_last_index != -1){
            $scope.data.choosed_node_list[_last_index].active = false;  //关闭上一个TAB(第一次不关闭)
            if($scope.data.choosed_node_list[_last_index].one_node_timer){
                $interval.cancel($scope.data.choosed_node_list[_last_index].one_node_timer);
            }
        }
        $scope.data.choosed_node_list[index].active = true;  //激活当前
        $scope.control.active_node_i = index;                               //赋当前TAB下标
    };
    //查询所有节点信息
    var getAllNodeInfo = function (key_word) {
        var _key_word =  key_word || '';
        //模拟数据
        //获取所有节点列表服务
        Server.getAllNodeList(_key_word).then(function (data) {
            if(data){
                $scope.data.node_basic_list = data.machines ? data.machines :[];
            }
        },function (error) {
            Modal.alert(error.message,3)
        });
    };
    //监控单个节点信息
    var getNodeMonitorInfo  = function (server_ip,node_info) {
        //获取单个节点数据
        Server.monitorNodeStatus(server_ip).then(function (data) {
            if(data.server_msg){
                node_info.sys_info = data.server_msg;
                node_info.err_msg = '';
            }
        },function (error) {
            // Modal.alert(error.message,3)
            node_info.err_msg = error.message;
            //关闭单个节点监控
            var _active_index = $scope.control.active_node_i;
            console.log(_active_index);
            if($scope.data.choosed_node_list[_active_index].one_node_timer){
                $interval.cancel($scope.data.choosed_node_list[_active_index].one_node_timer);
            }
        })
    };

    var init = function () {
        //获取所有节点信息
        getAllNodeInfo();
    };
    //根据关键字查询节点
    $scope.searchNode = function(key_word){
        getAllNodeInfo(key_word)
    };
    //点击单个tab
    $scope.tabOne = function(index) {
        changeTab(index);
        $scope.info.node_info.err_msg = '';
        //当前节点对象
        var _curr_node = $scope.data.choosed_node_list[index];
        var _curr_ip = _curr_node.ip;
        //监控单个节点信息
        $scope.info.node_info.basic_info = _curr_node;
        getNodeMonitorInfo(_curr_ip,$scope.info.node_info);
        _curr_node.one_node_timer = $interval(function(){
            getNodeMonitorInfo(_curr_ip,$scope.info.node_info)
        },8000);
    };

    //系统类型图标
    $scope.operationSysIcon = function(opsys_type,bgSize){
        var _bg_position = {
            'background-size':bgSize,
            'background-position-x':'0px'
        };
        switch (opsys_type){
            case 1 : _bg_position['background-position-y'] = '0px'; break;   //linux
            case 2 : _bg_position['background-position-y'] = '-140px'; break; //windows
            case 3 : _bg_position['background-position-y'] = '-120px'; break; //ios
            case 4 : _bg_position['background-position-y'] = '-159px'; break; //未知
            case 5 : _bg_position['background-position-y'] = '-80px'; break;  //aix
            case 6 : _bg_position['background-position-y'] = '-100px'; break; //hp-ux
            case 7 : _bg_position['background-position-y'] = '-20px'; break;  //freebsd
            case 8 : _bg_position['background-position-y'] = '-60px'; break;  //sco
            case 9 : _bg_position['background-position-y'] = '-40px'; break;  //solaris
            default:_bg_position['background-position-y'] = '0px'; break;  //未知
            // default:_bg_position['background-position-y'] = '-160px'; break;  //未知
        }
        return _bg_position;
    };
    //点击查看
    $scope.viewNode = function(index){
        $scope.control.view_node = true;
        if($scope.data.choosed_node_list.length == 0 ){
            $scope.data.choosed_node_list.push($scope.data.node_basic_list[index]);
            $scope.tabOne($scope.data.choosed_node_list.length-1)
        }else{
            var _flag = 0;
            for(var i=0;i<$scope.data.choosed_node_list.length;i++){
                var _node = $scope.data.choosed_node_list[i];
                if(_node.ip == $scope.data.node_basic_list[index].ip){
                    _flag++;
                    break;
                }
            }
            if(_flag == 0){
                $scope.data.choosed_node_list.push($scope.data.node_basic_list[index]);
                $scope.tabOne($scope.data.choosed_node_list.length-1)
            }else{
                for(var j=0;j<$scope.data.choosed_node_list.length;j++){
                    var _node = $scope.data.choosed_node_list[j];
                    if(_node.ip == $scope.data.node_basic_list[index].ip){
                        $scope.tabOne(j);
                        break;
                    }
                }
            }
        }
        // $scope.tabOne(index);
    };
    //关闭
    $scope.closeNodeView = function(){
        $scope.control.view_node = false;
        //关闭单个节点监控
        var _active_index = $scope.control.active_node_i;
        if($scope.data.choosed_node_list[_active_index].one_node_timer){
            $interval.cancel($scope.data.choosed_node_list[_active_index].one_node_timer);
        }
        getAllNodeInfo();
        $scope.info.search_key_word = '';
    };

    //路由改变移除class
    $scope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
        if(toState.name != 'agent_monitor'){
            //关闭监控
            var _actived_index = $scope.control.active_node_i;
            if($scope.data.choosed_node_list[_actived_index].one_node_timer){
                $interval.cancel($scope.data.choosed_node_list[_actived_index].one_node_timer);
            }
        }
    });
    init()

}]);
