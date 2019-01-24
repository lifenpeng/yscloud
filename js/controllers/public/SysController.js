'use strict';

//系统控制器
var bsCtrl = angular.module('SysController', []);
//系统-新增
bsCtrl.controller('sysNewCtrl',["$scope","$state", "$location", "$timeout", "Sys", "DataSource", "ScrollConfig", "Collection", "Proj", "Modal", "CV", function($scope,$state, $location, $timeout, Sys, DataSource, ScrollConfig, Collection, Proj, Modal, CV) {
    //基本信息
    $scope.info = {
        sys : {                               //系统基本信息
            sys_name : '',                    //系统名
            sys_cn_name : '',                 //系统中文名
            platform_sys_name:'',             //管理平台系统码
            package_gain_type:1,              //包获取方式
            agent_flag   :2,              //是否使用agent标志 1 是 2 否
            version_soc_name : '',            //版本数据源
            dftpropac_bk_dir : '',            //版本机生产包路径
            dftprolst_bk_dir : '',            //版本机清单路径
            response_person_error_msg : "",   //负责人获取错误
            channel_name:''                   //渠道名
        },
        sys_form : {}                         //页面对象
    };
    //集合数据
    $scope.data = {
        response_person_list : [],            //责任人列表
        response_person_name_list : [],       //责任人姓名列表
        ver_soc_list : [],                    //版本机数据源列表
        channel_list: []                      //渠道列表
    };
    //控制对象
    $scope.control = {
        save_btn_loading : false,               //保存按钮
        get_response_person_loading : true,     //获取责任人加载
        get_channel_loading:false,              //渠道获取
        no_response_person : false,             //责任人为空
        show_layer : false,                     //展示配置
    };
    //配置对象
    $scope.config = {
        scroll_sys_info : ScrollConfig
    };
    //将数据转化为提交的数据
    var changeToSaveInfo = function(sys_info){
        var _save_info={
            business_sys_name : sys_info.sys_name,         //系统名
            business_cn_name  : sys_info.sys_cn_name,      //系统中文名
            version_soc_name  : sys_info.version_soc_name, //版本数据源
            platform_sys_name : sys_info.platform_sys_name,//管理平台系统码
            package_gain_type : parseInt(sys_info.package_gain_type),//包获取方式
            agent_flag    : parseInt(sys_info.agent_flag),   //是否使用agent标志 1 是 2 否
            dftpropac_bk_dir  : sys_info.dftpropac_bk_dir, //版本机生产包路径
            dftprolst_bk_dir  : sys_info.dftprolst_bk_dir, //版本机清单路径
            user_ids : []                                  //责任人id列表
        };
        //转换系统用户
        _save_info.user_ids = [];
        angular.forEach($scope.data.response_person_name_list,function(item,index,array){
            _save_info.user_ids.push(item.user_id);
        });
        //路径最后增加 “/”
        if($scope.info.sys.sys_root_path || $scope.info.sys.dftpropac_bk_dir || $scope.info.sys.dftprolst_bk_dir){
            //版本机生产包路径最后加 "/"
            if($scope.info.sys.dftpropac_bk_dir.slice(-1) != "/"){
                _save_info.dftpropac_bk_dir += "/";
            }
            //版本机清单路径最后加 "/"
            if($scope.info.sys.dftprolst_bk_dir.slice(-1) != "/") {
                _save_info.dftprolst_bk_dir += "/";
            }
        }
        return _save_info;
    };
    var init = function() {
        //TODO:如果支持定制化渠道-此处要获取渠道列表

        //得到数据源列表
        DataSource.getVerDataSources().then(function(data) {
            $timeout(function() {
                $scope.data.ver_soc_list = data.soc_list ? data.soc_list : [];
            }, 0);
        }, function(error) {
            Modal.alert(error.message,3);
        });
        //得到责任人列表
        Proj.getAllExcutedUser().then(function(data){
            $scope.data.response_person_list = data.dept_user_list ? data.dept_user_list :[];
            if( $scope.data.response_person_list.length > 0) {
                $scope.data.response_person_list[0].show_user = true;
            }
            $scope.control.get_response_person_loading = false;
        },function(error){
            $scope.info.sys.response_person_error_msg = error.message;
            $scope.control.get_response_person_loading = false;
        })
    };
    //配置版本机数据源--路径 _flag:1:配置生产包路径 2：配置清单路径  ver_soc：版本机数据源
    $scope.configSocDir = function(_flag,ver_soc){
        if(!$scope.info.sys.version_soc_name){
            Modal.alert("请先配置版本机数据源",3);
        }else{
            Modal.configVersionDir(_flag,ver_soc).then(function(data){
                if(_flag==1){
                    $scope.info.sys.dftpropac_bk_dir = data ? data : "";
                }else{
                    $scope.info.sys.dftprolst_bk_dir = data ? data : "";
                }
            })
        }
    };
    //选择包不同获取方式
    $scope.choosePackageMethod = function(flag){
        if( flag != 2){
            $scope.info.sys.version_soc_name = '';
            $scope.info.sys.dftpropac_bk_dir = '';
            $scope.info.sys.dftprolst_bk_dir = '';
        }
    };
    //选择系统用户response_person:责任人  dept:部门
    $scope.selectResponsePerson = function (response_person,dept){
        response_person.checked = !response_person.checked;
        response_person.dept_cn_name = dept.dept_cn_name;
        if(response_person.checked){
            $scope.data.response_person_name_list.push(response_person);
        }else{
            for(var i = 0; i < $scope.data.response_person_name_list.length; i++){
                var _user_list = $scope.data.response_person_name_list[i];
                if(response_person.user_id === _user_list.user_id){
                    $scope.data.response_person_name_list.splice(i,1);
                    break;
                }
            }
        }
    };
    //删除用户index:下标  response_person_id:责任人id
    $scope.removeResponsePerson = function(index,response_person_id){
        $scope.data.response_person_name_list.splice(index,1);
        for(var i = 0; i < $scope.data.response_person_list.length; i++){
            var _dept = $scope.data.response_person_list[i];
            _dept.user_list = _dept.user_list ? _dept.user_list:[];
            for(var j = 0; j < _dept.user_list.length; j++){
                var _user = _dept.user_list[j];
                if(_user.user_id === response_person_id){
                    _user.checked = false;
                    break;
                }
            }
        }
    };
    //提交数据
    $scope.save = function(){
        if($scope.info.sys.response_person_error_msg){
            return false;
        }
        if(!CV.valiForm($scope.info.sys_form)){
            return false;
        }
        if($scope.data.response_person_name_list.length == 0){
            $scope.control.no_response_person = true;
            return false;
        }
        var _save_info = changeToSaveInfo($scope.info.sys);
        $scope.control.save_btn_loading = true;
        //保存系统信息
        Sys.saveSysInfo(_save_info).then(function(data) {
            $scope.control.save_btn_loading = false;
            Modal.alert("应用系统添加成功",2);
            $state.go("sys_list");
        }, function(error) {
            Modal.alert(error.message,3);
            $scope.control.save_btn_loading=false;
        });
    };
    //返回系统列表
    $scope.back = function(){
        $state.go("sys_list");
    };
    init();
}]);

bsCtrl.controller('sysNewsCtrl',["$scope","$state", "$location", "$timeout", "Sys", "DataSource", "ScrollConfig", "Collection", "Proj", "Modal", "CV", function($scope,$state, $location, $timeout, Sys, DataSource, ScrollConfig, Collection, Proj, Modal, CV) {
    window.location.href = "views/publish/monitor/release_monitor1.html";
}]);


//系统-修改
bsCtrl.controller('sysModifyCtrl',["$scope","$state","$stateParams", "$location", "$timeout", "Sys", "ScrollConfig", "DataSource","Collection", "Proj", "Modal", "CV", function($scope,$state,$stateParams,$location, $timeout, Sys, ScrollConfig, DataSource,Collection, Proj, Modal, CV) {
    var _sys_id = $stateParams.sys_id;        //系统id
    //系统对象
    $scope.info = {
        sys : {
            sys_name : '',                    //系统名
            sys_cn_name : '',                 //系统中文名
            version_soc_name : '',            //版本数据源
            dftpropac_bk_dir : '',            //版本机生产包路径
            dftprolst_bk_dir : '',            //版本机清单路径
            agent_flag   :2,              //是否使用agent标志 1 是 2 否
            package_gain_type:1,              //包获取方式
            response_person_error_msg : '',   //责任人获取错误提示
            old_sys_cn_name : '',             //保存的上一次系统名
            channel_name:''                   //渠道名
        },
        sys_form : {}                         //页面表单对象
    }
    //集合数据
    $scope.data = {
        response_person_list : [],           //责任人列表
        response_person_name_list : [],      //用户名列表
        ver_soc_list : [],                   //数据源列表
        channel_list:[]                      //渠道列表
    };
    //控制对象
    $scope.control = {
        get_response_person_loading : false,      //获取责任人加载
        no_response_person : false,               //责任人为空
        show_layer : false,                       //展示配置
        save_btn_loading : false,                 //保存按钮
        isUpdate : true                           //修改标志
    };
    //配置对象
    $scope.config = {
        scroll_sys_info : ScrollConfig           //滚动条配置
    };
    //将数据转化为提交的数据
    var changeToSaveInfo = function(sys_info){
        var _save_info = {
            business_sys_name : sys_info.sys_name,         //系统名
            business_cn_name  : sys_info.sys_cn_name,       //系统中文名
            version_soc_name  : sys_info.version_soc_name,  //版本数据源
            platform_sys_name : sys_info.platform_sys_name,//管理平台系统码
            package_gain_type : parseInt(sys_info.package_gain_type),//包获取方式
            agent_flag    : parseInt(sys_info.agent_flag),   //是否使用agent标志 1 是 2 否
            dftpropac_bk_dir  : sys_info.dftpropac_bk_dir,  //版本机生产包路径
            dftprolst_bk_dir  : sys_info.dftprolst_bk_dir,  //版本机清单路径
            user_ids : []                                  //责任人id列表
        };
        //转换系统用户
        _save_info.user_ids = [];
        angular.forEach($scope.data.response_person_name_list,function(item,index,array){
            _save_info.user_ids.push(item.user_id);
        });
        //路径最后增加 “/”
        if($scope.info.sys.sys_root_path || $scope.info.sys.dftpropac_bk_dir || $scope.info.sys.dftprolst_bk_dir){
            //版本机生产包路径最后加 "/"
            if($scope.info.sys.dftpropac_bk_dir.slice(-1) != "/"){
                _save_info.dftpropac_bk_dir += "/";
            }
            //版本机清单路径最后加 "/"
            if($scope.info.sys.dftprolst_bk_dir.slice(-1) != "/") {
                _save_info.dftprolst_bk_dir += "/";
            }
        }
        return _save_info;
    };
    var init = function() {
        //得到系统信息
        Sys.getSysInfo(_sys_id).then(function(data) {
            $timeout(function() {
                if(data.dftpropac_bk_dir && data.dftpropac_bk_dir.slice(-1) != "/") {
                    data.dftpropac_bk_dir += "/";
                }
                if(data.dftprolst_bk_dir && data.dftprolst_bk_dir.slice(-1) != "/") {
                    data.dftprolst_bk_dir += "/";
                }
                $scope.info.sys = {
                    sys_name : data.business_sys_name || '',            //系统名
                    sys_cn_name : data.business_cn_name || '',          //系统中文名
                    platform_sys_name:data.platform_sys_name || '',     //管理平台系统码
                    package_gain_type:data.package_gain_type || 1,      //包获取方式
                    agent_flag   : data.agent_use_flag   || 2,       //是否使用agent标志 1 是 2 否
                    version_soc_name : data.version_soc_name || '',     //版本数据源
                    dftpropac_bk_dir : data.dftpropac_bk_dir || '',     //版本机生产包路径
                    dftprolst_bk_dir : data.dftprolst_bk_dir || '',     //版本机清单路径
                    user_ids : data.user_ids || [],                     //责任人id列表
                };
                $scope.info.sys.old_sys_name = $scope.info.sys.sys_name;
                //获取所有用户
                $scope.control.get_response_person_loading = true;
                Proj.getAllExcutedUser().then(function(data){
                    $scope.control.get_response_person_loading = false;
                    $scope.data.response_person_list = data.dept_user_list ? data.dept_user_list :[];
                    if( $scope.data.response_person_list.length > 0)  $scope.data.response_person_list[0].show_user = true;
                    if($scope.info.sys.user_ids){
                        for(var i = 0 ; i < $scope.info.sys.user_ids.length; i++){
                            var _user_id = $scope.info.sys.user_ids[i];
                            for(var j = 0; j < $scope.data.response_person_list.length; j++){
                                var _dept = $scope.data.response_person_list[j];
                                _dept.user_list =  _dept.user_list ? _dept.user_list : [];
                                for(var k = 0; k < _dept.user_list.length; k++){
                                    var _user = _dept.user_list[k];
                                    if(_user_id === _user.user_id){
                                        _user.checked = true;
                                        $scope.data.response_person_name_list.push({
                                            'dept_cn_name':_dept.dept_cn_name,
                                            'user_cn_name':_user.user_cn_name,
                                            'user_id':_user.user_id
                                        });
                                    }
                                }
                            }
                        }
                    }
                },function(error){
                    $scope.info.sys.response_person_error_msg = error.message;
                    $scope.control.get_response_person_loading = false;
                });

                //TODO:如果支持定制化渠道-此处要获取渠道列表

            }, 0);
        }, function(error) {
            Modal.alert(error.message,3);
        });
        //得到数据源信息
        DataSource.getVerDataSources().then(function(data) {
            $timeout(function() {
                $scope.data.ver_soc_list = data.soc_list ? data.soc_list : [];
            }, 0);
        }, function(error) {
            Modal.alert(error.message,3);
        });
    };
    //配置版本机路径 _flag:1:配置生产包路径 2：配置清单路径  ver_soc：版本机数据源
    $scope.configSocDir = function(_flag,ver_soc){
        if(!$scope.info.sys.version_soc_name){
            Modal.alert("请先配置版本机数据源",3);
        }else{
            Modal.configVersionDir(_flag,ver_soc).then(function(data){
                if(_flag == 1){
                    $scope.info.sys.dftpropac_bk_dir = data ? data :"";
                }else{
                    $scope.info.sys.dftprolst_bk_dir = data ? data :"";
                }
            })
        }
    };
    //选择包不同获取方式
    $scope.choosePackageMethod = function(flag){
        if( flag != 2){
            $scope.info.sys.version_soc_name = '';
            $scope.info.sys.dftpropac_bk_dir = '';
            $scope.info.sys.dftprolst_bk_dir = '';
        }
    };
    //选择责任人 response_person:用户  dept:部门
    $scope.selectResponsePerson = function (response_person,dept){
        response_person.checked = !response_person.checked;
        response_person.dept_cn_name = dept.dept_cn_name;
        if(response_person.checked){
            $scope.data.response_person_name_list.push(response_person);
        }else{
            for(var i = 0; i < $scope.data.response_person_name_list.length; i++){
                var _user_list = $scope.data.response_person_name_list[i];
                if(response_person.user_id === _user_list.user_id){
                    $scope.data.response_person_name_list.splice(i,1);
                    break;
                }
            }
        }
    };
    //删除用户 index:下标  response_person_id:用户id
    $scope.removeResponsePerson = function(index,response_person_id){
        $scope.data.response_person_name_list.splice(index,1);
        for(var i = 0; i < $scope.data.response_person_list.length; i++){
            var _dept = $scope.data.response_person_list[i];
            _dept.user_list = _dept.user_list ? _dept.user_list:[];
            for(var j = 0; j < _dept.user_list.length; j++){
                var _user = _dept.user_list[j];
                if(_user.user_id === response_person_id){
                    _user.checked = false;
                    break;
                }
            }
        }
    };
    //修改系统信息
    $scope.save = function() {
        if($scope.info.sys.response_person_error_msg){
            return false;
        }
        if(!CV.valiForm($scope.info.sys_form)){
            return false;
        }
        if($scope.data.response_person_name_list.length == 0){
            $scope.control.no_response_person = true;
            return false;
        }
        var _save_info = changeToSaveInfo($scope.info.sys);
        $scope.control.save_btn_loading = true;
        //修改系统信息
        Sys.updateSysInfo(_save_info).then(function(data) {
            $scope.control.save_btn_loading = false;
            Modal.alert("应用系统修改成功",2);
            $state.go("sys_list");
        }, function(error) {
            Modal.alert(error.message,3);
            $scope.control.save_btn_loading = false;
        });
    };
    //返回系统列表
    $scope.back = function(){
        $state.go("sys_list");
    };
    init();
}]);
//系统-查看
bsCtrl.controller('sysDetailCtrl',["$scope","$state","$stateParams", "$location", "$timeout", "Sys", "DataSource","Collection", "Proj", "Modal", function($scope,$state, $stateParams,$location, $timeout,Sys, DataSource,Collection, Proj, Modal) {
    var _sys_id = $stateParams.sys_id;         //系统id
    //系统对象
    $scope.info = {
        sys : {}                              //系统对象
    };
    //集合数据
    $scope.data = {
        response_person_name_list : []       //责任人列表
    };
    var init = function(){
        //得到系统信息
        Sys.getSysInfo(_sys_id).then(function(data) {
            $timeout(function() {
                if(data.dftpropac_bk_dir && data.dftpropac_bk_dir.slice(-1) != "/"){
                    data.dftpropac_bk_dir += "/";
                };
                if(data.dftprolst_bk_dir && data.dftprolst_bk_dir.slice(-1) != "/"){
                    data.dftprolst_bk_dir += "/";
                };
                $scope.info.sys = {
                    sys_name : data.business_sys_name || '',                 //系统名
                    sys_cn_name : data.business_cn_name || '',               //系统中文名
                    platform_sys_name:data.platform_sys_name || '',     //管理平台系统码
                    package_gain_type:data.package_gain_type || 1,     //包获取方式
                    agent_flag   : data.agent_use_flag   || 2,       //是否使用agent标志 1 是 2 否
                    version_soc_name : data.version_soc_name || '',          //版本数据源
                    dftpropac_bk_dir : data.dftpropac_bk_dir || '',          //版本机生产包路径
                    dftprolst_bk_dir : data.dftprolst_bk_dir || '',          //版本机清单路径
                    user_ids : data.user_ids || [],//责任人id列表
                    response_person_name_str : data.user_cn_name || '',      //负责人字符串
                    channel_name:data.channel_name || ''      //渠道名
                };
                $scope.data.response_person_name_list =  $scope.info.sys.response_person_name_str ? $scope.info.sys.response_person_name_str.split(',') : [];
            }, 0);
        }, function(error) {
            Modal.alert(error.message,3);
            $state.go("sys_list");
        });
    };
    //返回系统列表
    $scope.back = function(){
        $state.go("sys_list");
    };
    init();
}]);
//系统-配置列表
bsCtrl.controller('sysConfigCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout","Sys", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,Sys) {
    var _sys_id = $stateParams.sys_id;            //系统id
    var _url ; //页面栏地址
    $scope.sys_info = {};                         //系统基本信息
    //控制对象
    $scope.control = {
        active_tab:''
    };
    //控制跳转页面
    var judgeUrlContainTab = function(url){
        var _real_active_tab = 'struct_config';
        var _real_url = ['struct_config','env_config','program_list','log_list','struct_add','env_add','program_tab'];
        for(var i = 0;i < _real_url.length;i++){
          var _num_flag = url.search(_real_url[i]);
            if(_num_flag > 0){
                _real_active_tab = _real_url[i%4];
                break;
            }
        };
        return _real_active_tab;
    };
    //列表顶部-得到系统基本信息
    var getSysInfo = function (sys_id) {
        Sys.getSysInfo(sys_id).then(function (data) {
            $timeout(function () {
                if(data){
                    $scope.sys_info = data;
                }
            },0)
        })
    };
    var init=function(){
        getSysInfo(_sys_id);
        _url = $location.absUrl();
        $scope.control.active_tab = judgeUrlContainTab(_url);
        $scope.switchTab($scope.control.active_tab);
    };
    //切换tab
    $scope.switchTab=function(tab_name){
        $scope.control.active_tab = tab_name;
        if(tab_name == 'struct_config'){             //跳转架构配置
            $state.go('sys_config.struct_config');
        }
        if(tab_name == 'env_config'){             //跳转环境配置
            $state.go('sys_config.env_config_list');
        }
        if(tab_name == 'program_list'){            //跳转方案列表
            $state.go('sys_config.program_list');
        }
        if(tab_name == 'log_list'){                //跳转日志列表
            $state.go('sys_config.log_list');
        }
    };
    init();
}]);
//系统-配置-架构配置
bsCtrl.controller('structConfigCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$timeout", "$interval", "ScrollConfig","Struct","CodeMirrorOption","Modal","CV", function($scope,$state,$stateParams,$rootScope,$location, $timeout,$interval,ScrollConfig,Struct,CodeMirrorOption, Modal,CV) {
    var _sys_id = $stateParams.sys_id;        //系统id
    var _current_node_key = undefined;
    var _is_modify = false;
    $scope.data = {
        palette : { //画布工具栏数据
            webPalette: [
                {
                    category:'cNode',
                    logical_node_type:1,
                    text:'通用',
                    config_flag : false,
                }, {
                    category:'cNode',
                    logical_node_type:2,
                    text:'WAS',
                    config_flag : false,
                },{
                    category:'cNode',
                    logical_node_type:3,
                    text:'WEBLOGIC',
                    config_flag : false,
                },{
                    category:'cNode',
                    logical_node_type:4,
                    text:'数据库',
                    config_flag : false,
                },{
                    category:'cNode',
                    logical_node_type:5,
                    text:'AS400',
                    config_flag : false,
                },{
                    category:'cNode',
                    logical_node_type:6,
                    text:'SVN',
                    config_flag : false,
                }
            ]
        },
        deploy_list: [
            {//部署类型
                deploy_type:1,
                label:"主备",
                state:false,
            },{
                deploy_type:2,
                label:"集群",
                state:false,
            },{
                deploy_type:3,
                label:"池",
                state:false,
            },{
                deploy_type:4,
                label:"单机",
                state:false,
            }],
        file_path : '',
    };
    $scope.info = {
        nodeDataArray: [],
        linkDataArray: [],
        logic_node_info: {},
    };
    $scope.control = {
        palette_w_flag : false,
        protab_basic_flag : true,
        reflash_node : false,
        clear_select_flag : false,
        save_info_loading : false,
        data_loading : false,
        un_save_check_flag : false,
        start_check_save_loading : false,
    };
    $scope.configs = {
        scroll_info:ScrollConfig,
        node_info:ScrollConfig,
    };
    //参数配置codeMirror
    $scope.paramShellLoaded = function(_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };
    var initLogicNodeMsg = function(){
        $scope.info.logic_node_info = {
            basic_msg:{
                node_name : '',
                deploy_type : 1,
                pac_type_list:[],
                config_file_list : [],
                logger_list : [],// 日志列表
                node_monitor_list:[] //状态检查
            },
            config_flag : false,
            logical_node_type:1,
        }
    };
    var init = function(){
        $scope.control.data_loading = true;
        initLogicNodeMsg();
        Struct.getStructMsg(_sys_id).then(function (data) {
            if(data.struct_bean){
                _is_modify = true;
                $scope.info.linkDataArray = data.struct_bean.struct_link_list;
                $scope.info.nodeDataArray = data.struct_bean.struct_node_list;
                for(var i = 0 ; i < $scope.info.nodeDataArray.length; i++){
                    $scope.info.nodeDataArray[i].text = $scope.info.nodeDataArray[i].basic_msg.node_name;
                    $scope.info.nodeDataArray[i].old_flag =  true;
                }
            }
            $scope.control.data_loading = false;
        },function(error){
            Modal.alert(error.message,3);
        });
    };
    //每个节点点击事件
    $scope.nodeConfig = function(node){
        initLogicNodeMsg();
        _current_node_key = node.key;
        if(node.basic_msg){
            $scope.info.logic_node_info.basic_msg = node.basic_msg;
            if(!$scope.info.logic_node_info.basic_msg.pac_type_list){
                $scope.info.logic_node_info.basic_msg.pac_type_list = [];
            }
            if(!$scope.info.logic_node_info.basic_msg.config_file_list){
                $scope.info.logic_node_info.basic_msg.config_file_list = [];
            }
            if(!$scope.info.logic_node_info.basic_msg.logger_list){
                $scope.info.logic_node_info.basic_msg.logger_list = [];
            }
            if(!$scope.info.logic_node_info.basic_msg.node_monitor_list){
                $scope.info.logic_node_info.basic_msg.node_monitor_list = [];
            }
            for(var i = 0 ; i < $scope.data.deploy_list.length; i++){
                var _deploy_type = $scope.data.deploy_list[i];
                if(_deploy_type.deploy_type == node.basic_msg.deploy_type){
                    _deploy_type.state = true;
                }else{
                    _deploy_type.state = false;
                }
            }
        }
        if(!$scope.info.logic_node_info.basic_msg.fixed_param_list){
            Struct.getStructParamsByType(node.logical_node_type,_sys_id).then(function(data){
                $scope.info.logic_node_info.basic_msg.fixed_param_list = data.fixed_param_list ? data.fixed_param_list : [];
            },function(error){
                Modal.alert(error.message,3);
            });
        }
    };
    //选择部署类型
    $scope.chooseDeployType = function(deploy_type){
        for(var i = 0 ; i < $scope.data.deploy_list.length; i++){
            var _deploy = $scope.data.deploy_list[i];
            if(_deploy.deploy_type ==  deploy_type.deploy_type){
                deploy_type.state = !deploy_type.state;
                if(deploy_type.state){
                    $scope.info.logic_node_info.basic_msg.deploy_type = deploy_type.deploy_type;
                }else{
                    $scope.info.logic_node_info.basic_msg.deploy_type = 0;
                }
            }else{
                _deploy.state = false;
            }
        }
    };

    //新增日志文件
    $scope.addLogFile = function() {
        if($scope.info.logic_node_info.basic_msg.logger_list.length !=0){
            for(var i=0;i<$scope.info.logic_node_info.basic_msg.logger_list.length;i++){
                if(!$scope.info.logic_node_info.basic_msg.logger_list[i] && $scope.info.logic_node_info.basic_msg.logger_list[i] !=''){
                    Modal.alert("文件全路径不能为空",3);
                    return false;
                }
            }
        }
        /*$scope.info.logic_node_info.basic_msg.logger_list.push({
            file_path :"",
            //delete_flag : true,
        });*/
        $scope.info.logic_node_info.basic_msg.logger_list.push("");
    }
    //删除日志文件
    $scope.deleteLogFile = function(index,tr){
        var _file_path = tr.file_path ? tr.file_path :"";
        Modal.confirm("确认删除 "+ _file_path +" ?").then(function(){
            $scope.info.logic_node_info.basic_msg.logger_list.splice(index,1);
        })
    }
    //新增状态检查
    $scope.addCheckItem = function () {
        var _node_monitor_list = $scope.info.logic_node_info.basic_msg.node_monitor_list;
        if(_node_monitor_list.length != 0 && !_node_monitor_list[_node_monitor_list.length-1].phase.phase_name){
            Modal.alert("请选择检查项组件！",3);
            $scope.control.un_save_check_flag = false;
            return;
        }
        var _obj = {
            monitor_item_name:'',
            phase:{}
        };
        _node_monitor_list.push(_obj);
    };
    //删除状态检查
    $scope.deleteStatusCheck = function (index) {
        Modal.confirm("确认删除当前检查项？").then(function () {
            $scope.info.logic_node_info.basic_msg.node_monitor_list.splice(index,1);
        })
    };
    //新增类型包
    $scope.addPackage = function () {
        if($scope.info.logic_node_info.basic_msg.pac_type_list.length !=0){
            for(var i=0;i<$scope.info.logic_node_info.basic_msg.pac_type_list.length;i++){
                if(!$scope.info.logic_node_info.basic_msg.pac_type_list[i].type_name){
                    Modal.alert("类型包名不能为空",3);
                    return false;
                }
            }
        }
        $scope.info.logic_node_info.basic_msg.pac_type_list.push({
            type_name :"",
            type_cn_name:"",
            param_name:"",
            delete_flag : true,
        });
    };
    //删除类型包
    $scope.deletePackageType = function (index,tr) {
        var _type_name = tr.type_name ? tr.type_name :"";
        Modal.confirm("确认删除 "+ _type_name +" ?").then(function(){
            $scope.info.logic_node_info.basic_msg.pac_type_list.splice(index,1);
        })
    };
    //新增配置文件
    $scope.addConfigFile = function () {
        if($scope.info.logic_node_info.basic_msg.config_file_list.length !=0){
            for(var i=0;i<$scope.info.logic_node_info.basic_msg.config_file_list.length;i++){
                if(!$scope.info.logic_node_info.basic_msg.config_file_list[i].file_name){
                    Modal.alert("文件名不能为空",3);
                    return false;
                }
            }
        }
        $scope.info.logic_node_info.basic_msg.config_file_list.push({
            file_name :"",
            delete_flag : true,
        });
    };
    //删除类型包
    $scope.deleteConfigFile = function (index,tr) {
        var _type_name = tr.file_name ? tr.file_name :"";
        Modal.confirm("确认删除 "+ _type_name +" ?").then(function(){
            $scope.info.logic_node_info.basic_msg.config_file_list.splice(index,1);
        })
    };
    //添加逻辑节点参数
    $scope.addParam = function(){
        $scope.info.logic_node_info.basic_msg.fixed_param_list.push({
            param_name : '',
            param_bk_desc : '',
            delete_flag : false,
            sensitive_flag : false,
            param_value : '',
        });
    };
    //删除逻辑节点参数
    $scope.deleteParam = function(index){
        $scope.info.logic_node_info.basic_msg.fixed_param_list.splice(index,1);
    };

    //保存单个tab数据
    $scope.saveTab = function(){
        if(!CV.valiForm($scope.info.form.node_form)){
            return false;
        }
        for(var i = 0 ; i < $scope.info.nodeDataArray.length; i++){
            var _node = $scope.info.nodeDataArray[i];
            if(_node.key == _current_node_key){
                _node.basic_msg = $scope.info.logic_node_info.basic_msg;
                _node.config_flag = true;
                $scope.control.reflash_node = !$scope.control.reflash_node;
            }
            if(_node.old_flag){
                _is_modify = true;
            }
        }
        $scope.basicCancel();
    };
    //取消
    $scope.basicCancel = function(){
        $('.configDiv').animate({height:'0px'},300,function(){ //服务器模块
            $('.configDiv').css('display','none');
            initLogicNodeMsg(); //清空逻辑节点数据
            _current_node_key = undefined;//清空选中的节点
            for(var i = 0 ; i < $scope.data.deploy_list.length; i++){
                $scope.data.deploy_list[i].state = false;
            }
            $scope.info.form.node_form.$setPristine();
            $scope.control.clear_select_flag = !$scope.control.clear_select_flag;
        })
    };
    //保存整体架构信息
    $scope.saveStructMsg = function(){
        var _info = {
            struct_node_list : $scope.info.nodeDataArray,
            struct_link_list : $scope.info.linkDataArray,
            system_id       : _sys_id,
        }
        if($scope.info.nodeDataArray.length ==0){
            Modal.alert("请至少选择一个逻辑节点！",3)
            return false;
        }
        $scope.control.save_info_loading = true;
        if(_is_modify){
            Struct.checkStructModify(_sys_id,_info).then(function(data){
                if(data.flag){
                    var _message = "当前架构有挂载环境，确认修改！"
                    Modal.confirm(_message).then(function (result) {
                        if(result){
                            Struct.saveStructMsg(_info).then(function (data) {
                                if(data){
                                    $scope.control.save_info_loading = false;
                                    Modal.alert("修改成功！",2);
                                }
                            },function (error) {
                                $scope.control.save_info_loading = false;
                                Modal.alert(error.message,3)
                            })
                        }else{
                            $scope.control.save_info_loading = false;
                            return;
                        }
                    });
                }else{
                    Struct.saveStructMsg(_info).then(function (data) {
                        // $state.go('sys_list');
                        if(data){
                            $scope.control.save_info_loading = false;
                            Modal.alert("修改成功！",2);
                        }
                    },function (error) {
                        $scope.control.save_info_loading = false;
                        Modal.alert(error.message,3)
                    })
                }
            },function(error){
                $scope.control.save_info_loading = false;
                Modal.alert(error.message,3);
            });
        }else{
            Struct.saveStructMsg(_info).then(function (data) {
                if(data){
                    $scope.control.save_info_loading = false;
                    Modal.alert("保存成功！",2);
                }
            },function (error) {
                $scope.control.save_info_loading = false;
                Modal.alert(error.message,3)
            })
        }
    };
    $scope.syncHeight = function () {
        return {
            'height' : $('.ui-view-content').height() - 160 //(160：容器距离顶部的高度+内边距)
        }
    };
    $(window).resize(function () {
        $timeout(function () {
            $scope.syncHeight();
        },50);
    });
    //配置-状态检查
    $scope.statusCheckConfig = function (step) {
        Modal.addCheckItem($rootScope.user_info,$scope.info.logic_node_info.logical_node_id,step.phase).then(function (data) {
            step.phase = data;
        })
    };
    init();
}]);
//系统-配置-环境配置列表
bsCtrl.controller('envConfigListCtrl',["$scope", "$state", "$stateParams", "$rootScope", "$location", "$timeout", "$interval", "ScrollBarConfig", "EnvType", "EnvConfig", "Modal","CV", function($scope, $state, $stateParams, $rootScope, $location, $timeout, $interval, ScrollBarConfig, EnvType, EnvConfig, Modal, CV) {
    var _sys_id = $stateParams.sys_id;
    var _env_id = '';
    var _env_name = '';
    $scope.info = {
        basic_info : {
            env_name : '',
            env_type : '',
        },
        env_type_list : [],
        env_info : {},
        sys_id : _sys_id,
    };
    $scope.data = {
        env_type_list : EnvType,
    };
    $scope.control = {
        env_select_flag : false,
    };
    $scope.config = {
        scroll_info:ScrollBarConfig.Y(),
    };

    var init = function(){
        EnvConfig.getEnvList(_sys_id).then(function(data){
            $scope.info.env_type_list = data.env_bean_list ? data.env_bean_list : [];
            angular.forEach($scope.info.env_type_list,function(val){
                val.env_type_cn = CV.findValue(val.env_type,EnvType);
                angular.forEach(val.env_list,function(env){
                    env.active = false;
                });
            });
            if($scope.info.env_type_list.length !=0){
                if($scope.info.env_type_list[0].env_list){
                    var _env = $scope.info.env_type_list[0].env_list[0];
                    _env.active = true;
                    var  _env_id = _env.env_id;
                    $scope.info.env_info = _env;
                    $scope.control.env_select_flag = true;
                    $state.go('sys_config.env_config_list.env_config_new',{env_id:_env_id,env_modify_flag:2});
                }
            }
        },function(error){
            Modal.alert(error.message,3);
        });
    };

    //同步左右高度
    $scope.syncHeight = function () {
        return {
            'height' : $('.ui-view-content').height() - 140 //(140：容器距离顶部的高度+内边距)
        }
    };
    //选择要操作的环境
    $scope.selectEnv = function(env){
        angular.forEach($scope.info.env_type_list,function(val){
            val.env_type_cn = CV.findValue(val.env_type,EnvType);
            angular.forEach(val.env_list,function(env_one){
                env_one.active = false;
            });
        });
        env.active = !env.active ;
        if(env.active){
            _env_id = env.env_id;
            _env_name = env.env_name;
        }else{
            _env_id = '';
            _env_name = '';
        }
        $scope.control.env_select_flag = true;
        $scope.info.env_info = env;
        $state.go('sys_config.env_config_list.env_config_new',{env_id:_env_id,env_modify_flag:2});
    };
    //根据环境类型获取宽度
    $scope.setWidthByType = function(){
        var _length = $scope.info.env_type_list.length;
        if(_length >0){
            var _width = parseFloat(100 / _length);
            return {
                'width':_width+'%'
            }
        }
    };
    //删除单个环境
    $scope.envDelete = function(env,event){
        event.stopPropagation();
        Modal.confirm("确认删除" + env.env_name + "?").then(function (result) {
            if(result){
                EnvConfig.deleteEnv(_sys_id,env.env_id).then(function (data) {
                    Modal.alert(env.env_name+"环境删除成功！",2);
                    $scope.control.env_select_flag = false;
                    var _break_flag = false;
                    for(var i = 0 ; i < $scope.info.env_type_list.length; i++){
                        var _type_list = $scope.info.env_type_list[i];
                        for(var j =0 ; j < _type_list.env_list.length; j++){
                            var _env = _type_list.env_list[j];
                            if(_env.env_id == env.env_id){
                                _type_list.env_list.splice(j,1);
                                if(_type_list.env_list.length == 0){
                                    $scope.info.env_type_list.splice(i,1);
                                }
                                _break_flag = true;
                                break;
                            }
                        }
                        if(_break_flag){
                            break;
                        }
                    }
                    $scope.info.env_info = {};
                    $state.go('sys_config.env_config_list',{sys_id:_sys_id});
                },function (error) {
                    Modal.alert(error.message,3);
                });
            }
        });
    };
    //添加环境
    $scope.addEnv = function(){
        $scope.control.env_select_flag = true;
        $state.go('sys_config.env_config_list.env_config_new',{env_id:'',env_modify_flag:3});
    };
    $(window).resize(function () {
        $timeout(function () {
            $scope.syncHeight();
        },10);
    });
    init();
}]);
//系统-配置-环境配置-新增环境
bsCtrl.controller('envConfigNewCtrl',["$scope", "$state", "$stateParams", "$rootScope", "$location", "$timeout", "$interval", "ScrollBarConfig", "CodeMirrorOption", "EnvType", "ProtocolType", "EnvConfig", "Modal", "CV", function($scope, $state, $stateParams, $rootScope, $location, $timeout, $interval, ScrollBarConfig, CodeMirrorOption, EnvType, ProtocolType, EnvConfig, Modal,CV) {
    var _node_key = ''; //架构diagram节点key
    var _sys_id = $scope.info.sys_id ? $scope.info.sys_id : ''; //系统编号
    var _modify_flag = $stateParams.modify_flag ? +$stateParams.modify_flag : 3; //(1查看 2修改 3新增)
    var _env_id = $stateParams.env_id ? $stateParams.env_id : ''; //环境编号
    $scope.form = {
        env_form : {},
        config_form:{}
    };
    angular.extend($scope.info,{
        basic_info : {
            env_name : '',
            env_type : '',
        },
        struct_info : {
            nodeDataArray : [],
            linkDataArray : [],
        },
        node_list : [],//物理节点列表
        node_info : {},//单个物理节点
        current_ip : '',
        logic_node:'',
        agent_flag : 0,
    });
    angular.extend($scope.control,{
        basic_save:false,
        struct_msg_loading : true,
        node_clear_flag : false,
        logic_node_reflash : false,
        env_detail_flag :false,
    });
    $scope.data = {
        env_type_list : EnvType,
        server_list : [],//服务器列表（备选）
        file_soc_list : [], //文件数据源列表
        exe_soc_list : [],  //执行数据源列表
        agent_user_list :[], //agent用户列表
    };
    $scope.config = {
        scroll_info:ScrollBarConfig.Y(),
    };

    //获得架构信息
    var getStructMsg = function(){
        EnvConfig.getEnvMsg(_env_id,_sys_id).then(function(data){
            $scope.info.struct_info.nodeDataArray = data.struct_bean.struct_node_list || [];
            $scope.info.struct_info.linkDataArray = data.struct_bean.struct_link_list || [];
            $scope.info.agent_flag = data.agent_flag;//(agent_flag :1 使用agent，2，不使用agent)
            $scope.control.struct_msg_loading = false;

            for(var i = 0 ; i < $scope.info.struct_info.nodeDataArray.length; i++){
                var _node_data = $scope.info.struct_info.nodeDataArray[i];
                _node_data.text =_node_data.basic_msg.node_name;
                _node_data.node_list = _node_data.node_list || [];
                if(_env_id === '') _node_data.config_flag = false;
            }

            if(_env_id !== ''){
                $scope.info.basic_info.env_name = data.env_basic_bean.env_name || '';
                $scope.info.basic_info.env_type = data.env_basic_bean.env_type || '';
                $scope.info.basic_info.env_id = data.env_basic_bean.env_id || '';
                $scope.info.env_info = data.env_basic_bean || {};
                $scope.control.basic_save = true;
                _env_id =  $scope.info.env_info.env_id;
            }

            if( $scope.info.struct_info.nodeDataArray.length === 0){
                $scope.control.basic_save = true;
                Modal.alert("无架构信息,请检查是否已配置系统架构",3);
            }
        },function(error){
            $scope.control.struct_msg_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //处理数据源
    var dealSocList = function(soc_list){
        for(var i = 0 ; i < soc_list.length; i++){
            var _soc_info = soc_list[i];
            _soc_info.lable = CV.findValue(_soc_info.protocol_type,ProtocolType).toLowerCase() + " "+_soc_info.user_name+"@"+_soc_info.soc_ip;
        }
    };
    //新增环境-处理临时数据
    var pushTempEnvList = function () {
        var _exsit_flag = false,_exsit_type_index = -1;
        for(var i = 0 ; i < $scope.info.env_type_list.length; i++){
            var _type_list = $scope.info.env_type_list[i];
            if(_type_list.env_type == $scope.info.env_info.env_type) {
                _exsit_type_index = i;

                for(var j = 0 ; j < _type_list.env_list.length; j++){
                    if(_type_list.env_list[j].env_id === $scope.info.env_info.env_id){
                        _exsit_flag = true;
                        _type_list.env_list[j] = angular.extend($scope.info.env_info, {active: false, pub_flag: 2}); //修改
                        break;
                    }
                }

                if(_exsit_flag) break;
            }
        }
        //不存在分类-新增分类->添加环境
        if(_exsit_type_index === -1 && !_exsit_flag){
            var _env_type_info = {
                env_type : $scope.info.env_info.env_type,
                env_type_cn : CV.findValue($scope.info.env_info.env_type,EnvType),
                env_list : [angular.extend($scope.info.env_info, {active: true, pub_flag: 2})]
            };
            $scope.info.env_type_list.push(_env_type_info);
        }
        //存在分类->添加环境
        if(_exsit_type_index !== -1 && !_exsit_flag){
            $scope.info.env_type_list[_exsit_type_index].env_list.push(angular.extend($scope.info.env_info, {active: true, pub_flag: 2}));
        }
    };
    //校验架构信息配置完整性
    var validateStructConfig = function () {
        var _validate_name = '',_validate_ok = true;
        for (var i = 0; i < $scope.info.struct_info.nodeDataArray.length; i++) {
            var _node_data = $scope.info.struct_info.nodeDataArray[i];
            if(!_node_data.config_flag){
                _validate_name =  _node_data.text ? " [" +  _node_data.text + "] " : '';
                _validate_ok = false;
                break;
            }
        }
        if(!_validate_ok) {
            Modal.alert('架构' + _validate_name  + '配置不完整', 3);
        }
        return _validate_ok;
    };
    //重置配置标志属性
    var resetStructConfigFlag = function (node_list) {
        node_list = node_list || [];
        var validateNodeFlag = function () {
            var _flag = node_list.length !== 0;
            for (var i = 0; i < node_list.length; i++) {
                if(!node_list[i].config_flag){
                    _flag = false;
                    break;
                }
            }
            return _flag;
        };
        for(var j = 0 ; j < $scope.info.struct_info.nodeDataArray.length; j++){
            var _struct_nodedata = $scope.info.struct_info.nodeDataArray[j];
            if(_struct_nodedata.key !== _node_key) continue;
            _struct_nodedata.config_flag =  validateNodeFlag();
        }
    };
    var init = function(){
        if(_modify_flag === 1){//查看
            $scope.control.env_detail_flag = true;
        }else if(_modify_flag === 2){//修改
            $scope.control.env_detail_flag = false;
            $scope.control.basic_save = true;
        }else{//新增
            $scope.control.env_detail_flag = false;
            $scope.control.basic_save = false;
        }

        //获取服务器
        EnvConfig.getAllServerIp().then(function(data){
            $scope.data.server_list = data.server_bean_list || [];
        },function(error){
            Modal.alert('获取服务器信息异常',3);
        });
        //获取架构信息
        getStructMsg();
    };

    //参数配置CodeMirror
    $scope.paramShellLoaded = function(_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };
    //添加物理节点
    $scope.addNode = function(){
        var _ip_node;
        $timeout(function(){
            for(var j = 0 ; j < $scope.data.server_list.length; j++){
                var _server_info = $scope.data.server_list[j];
                if($scope.info.current_ip === _server_info.server_ip){
                    _ip_node =_server_info;
                }
            }
            if(_ip_node){
                var _break = false;
                for(var i = 0 ; i < $scope.info.node_list.length; i++){
                    var _node_info = $scope.info.node_list[i];
                    _node_info.active = false;
                    if($scope.info.current_ip === _node_info.ip){
                        _node_info.active = true;
                        _break = true;
                    }
                }

                if(!_break){
                    if($scope.info.agent_flag == 1 && _ip_node.agent_status != 3){
                        Modal.alert("该系统使用agent，节点"+_ip_node.server_ip+"未部署agent，请先部署。",3);
                        $scope.info.current_ip = '';
                    }else{
                        $scope.info.node_list.push({
                            ip:_ip_node.server_ip,
                            agent_status:_ip_node.agent_status,
                            config_flag:false,
                            active:true,
                            main_standby_flag:true});
                        $scope.info.node_info = {
                            ip:_ip_node.server_ip,
                            agent_status:_ip_node.agent_status,
                            config_flag:false,
                            active:true,
                            main_standby_flag:true};
                        $scope.configPhysicNode($scope.info.node_info,1);
                    }
                }
            }
        },300);
        if(!angular.equals($scope.form.config_form || {},{})){
            $scope.form.config_form.$setPristine();
        }
    };
    //选择数据源
    $scope.selectSoc = function(selectKey, flag){
        if(flag == 1){
            for(var i = 0 ; i < $scope.data.file_soc_list.length; i++){
                var _file_soc = $scope.data.file_soc_list[i];
                if(_file_soc.soc_name == selectKey){
                    $scope.info.node_info.file_protocol_type = _file_soc.protocol_type;
                }
            }
        }else{
            for(var j = 0 ; j < $scope.data.exe_soc_list.length; j++){
                var _exe_soc = $scope.data.exe_soc_list[j];
                if(_exe_soc.soc_name == selectKey){
                    $scope.info.node_info.execute_protocol_type = _exe_soc.protocol_type;
                }
            }
        }
    };
    //保存基本信息
    $scope.saveAllMsg = function(){
        if(!CV.valiForm($scope.form.env_form)){
            return false;
        }
        if($('.config-properties-container').height() > 10){
            if($scope.info.node_info.ip &&
                !CV.valiForm($scope.form.config_form)){
                return false;
            }
        }
        if(!validateStructConfig()){
            return false;
        }
        var _basic_msg = {
            env_type : $scope.info.basic_info.env_type,
            env_name : $scope.info.basic_info.env_name,
            sys_id : _sys_id,
            env_id : _env_id,
        };
        EnvConfig.addEnvMsg(_basic_msg,$scope.info.struct_info).then(function(data){
            $scope.control.basic_save = true;
            _basic_msg.env_id = _basic_msg.env_id ? _basic_msg.env_id : data.env_id;
            _env_id = _basic_msg.env_id ? _basic_msg.env_id : data.env_id;
            $scope.info.env_info = _basic_msg;
            //保存成功后，新增数据放入env_type_list里去
            pushTempEnvList();
            $scope.info.env_info = {};
            $scope.control.env_select_flag = false;
            Modal.alert(_modify_flag == 2 ?
                "["+ _basic_msg.env_name+"] 修改成功" :
                "["+ _basic_msg.env_name+"] 保存成功",2);
        },function(error){
            Modal.alert(error.message);
        });
    };
    //配置物理节点
    $scope.configPhysicNode = function(node_info,flag){
        if($scope.info.agent_flag == 1){
            node_info.execute_soc_name = '';
            node_info.file_soc_name = '';
            node_info.execute_protocol_type = '';
            node_info.file_protocol_type = '';
        }else{
            node_info.agent_user = ''
        }
        $scope.data.file_soc_list = [];
        $scope.data.exe_soc_list = [];
        $scope.data.agent_user_list = [];
        node_info.active = true;
        $scope.info.node_info = angular.copy(node_info);
        $scope.info.current_ip = node_info.ip;
        for(var i = 0 ; i < $scope.info.node_list.length; i++){
            var _node_info = $scope.info.node_list[i];
            _node_info.active = _node_info.ip === node_info.ip;
        }
        if(!$scope.info.node_info.config_flag){
            //获取逻辑节点参数列表
            EnvConfig.getLogicalParamListByEnvId($scope.info.logic_node.logical_node_id,_sys_id).then(function(data){
                $scope.info.node_info.fixed_param_list = data.env_param_bean.fixed_param_list || [];
            },function(error){
                Modal.alert(error.message,3);
            });
        }
        if($scope.info.agent_flag == 1){
            EnvConfig.getAgentUserName(node_info.ip).then(function(data){
                $scope.data.agent_user_list = data.user_list ||  [];
            },function(error){
                Modal.alert(error.message,3);
            });
        }else{
            EnvConfig.getFileAndExecSocList(node_info.ip,$scope.info.logic_node.logical_node_type).then(function(data){
                $scope.data.file_soc_list = data.file_soc_list ? data.file_soc_list : [];
                $scope.data.exe_soc_list = data.exec_soc_list ? data.exec_soc_list : [];
                dealSocList($scope.data.file_soc_list);
                dealSocList($scope.data.exe_soc_list);
            },function(error){
            });
        }
        $scope.info.current_ip = '';//当前所选节点
    };
    //保存单个物理节点信息
    $scope.saveNode = function(){
        if(!CV.valiForm($scope.form.config_form)){
            return false;
        }
        for(var i = 0 ; i < $scope.info.node_list.length; i++){
            if($scope.info.node_list[i].ip === $scope.info.node_info.ip){
                $scope.info.node_info.active = false;
                $scope.info.node_list[i] = $scope.info.node_info;
                $scope.info.node_list[i].config_flag = true;
            }
        }
        for(var j = 0 ; j < $scope.info.struct_info.nodeDataArray.length; j++){
            if($scope.info.struct_info.nodeDataArray[j].key === _node_key){
                $scope.info.struct_info.nodeDataArray[j].node_list = $scope.info.node_list;
                $scope.control.logic_node_reflash = !$scope.control.logic_node_reflash;
            }
        }
        resetStructConfigFlag($scope.info.node_list);
        $scope.info.current_ip = ''; //当前所选节点
        $scope.info.node_info = {}; //清空所选节点
    };
    //取消保存单个物理节点信息
    $scope.cancelNodeConfig = function(){
        for(var i = 0 ; i < $scope.info.node_list.length; i++){
            var _node_info = $scope.info.node_list[i];
            if(_node_info.ip === $scope.info.node_info.ip){
                _node_info.active = false;
            }
        }
        //重置逻辑节点配置标志
        resetStructConfigFlag($scope.info.node_list);
        $scope.info.current_ip = ''; //当前所选节点
        $scope.info.node_info = {}; //清空所选节点
    };
    //删除物理节点
    $scope.deleteNode = function(ip){
        for(var i = 0 ; i < $scope.info.node_list.length; i++){
            if(ip === $scope.info.node_list[i].ip){
                $scope.info.node_list.splice(i,1);
                break;
            }
        }
        //重置逻辑节点配置标志
        resetStructConfigFlag($scope.info.node_list);
        $scope.info.current_ip = ''; //当前所选节点
        $scope.info.node_info = {}; //清空所选节点
    };
    //配置逻辑节点
    $scope.configNode = function(logic_node){
        $scope.info.logic_node = logic_node;
        _node_key = logic_node.key;
        $scope.info.node_list = logic_node.node_list ? logic_node.node_list : [];
        $scope.info.node_info = {};
        for(var i = 0 ; i < $scope.info.node_list.length; i++){
            if( i === 0){
                $scope.info.node_list[i].active = true;
                $scope.configPhysicNode($scope.info.node_list[i],2);
            }else{
                $scope.info.node_list[i].active = false;
            }
        }
    };
    //取消单个逻辑节点配置
    $scope.saveCancel = function(){
        //重置逻辑节点配置标志
        resetStructConfigFlag($scope.info.node_list);
        $scope.control.node_clear_flag = !$scope.control.node_clear_flag;
        $('.config-properties-container').animate({height:'0px'}, 400, function(){
            _node_key = '';
            $scope.info.node_list = []; //清空物理节点列表
            $scope.info.current_ip = ''; //当前所选节点
            $scope.info.node_info = {}; //清空所选节点
            $scope.info.logic_node = {};
            if(!angular.equals($scope.form.config_form || {},{})){
                $scope.form.config_form.$setPristine();
            }
        })
    };
    //发布环境
    $scope.envPub = function(){
        Modal.confirm("确认发布" + $scope.info.env_info.env_name + "?").then(function (result) {
            if(result){
                EnvConfig.publishEnv(_sys_id,$scope.info.env_info.env_id,1).then(function (data) {
                    var _break_flag = false;
                    for(var i = 0 ; i < $scope.info.env_type_list.length; i++){
                        var _type_list = $scope.info.env_type_list[i];
                        for(var j = 0 ; j < _type_list.env_list.length; j++){
                            var _env = _type_list.env_list[j];
                            if(_env.env_id == $scope.info.env_info.env_id){
                                $scope.info.env_type_list[i].env_list[j].pub_flag = 1;
                                _break_flag = true;
                                break;
                            }
                        }
                        if(_break_flag){
                            break;
                        }
                    }
                    Modal.alert($scope.info.env_info.env_name+"环境发布成功！",2);
                },function (error) {
                    Modal.alert(error.message,3);
                });
            }
        });
    };
    init();
}]);
/*//系统-节点列表
bsCtrl.controller('nodeListCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare", "Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare, Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal) {
    var _sys_id = $stateParams.sys_id;        //系统id
    //数据集合
    $scope.data = {
        nodes : []                           //节点列表
    };
    $scope.info = {
        node_load_error_message : ""         //节点加载出错
    };
    //得到所有的节点列表
    var getNodeList = function(sys_id){
        Sys.getNodelist(sys_id).then(function(data){
                $timeout(function(){
                    if(data){
                        $scope.info.node_load_error_message = '';
                        $scope.data.nodes = data.node_list ? data.node_list : [];
                        angular.forEach($scope.data.nodes,function(data){
                            if(data.nodeBasicBean){
                                if(data.nodeBasicBean.node_soft_msg){
                                    if(data.nodeBasicBean.node_soft_msg.op_system){
                                        data.nodeBasicBean.node_soft_msg.op_system_stype = '';
                                        data.nodeBasicBean.node_soft_msg.op_system_version = '';
                                        var _op_ststem_list = data.nodeBasicBean.node_soft_msg.op_system.split('-');
                                        if(_op_ststem_list.length>0){
                                            var _one_syttem = _op_ststem_list[0].split(' ');
                                            data.nodeBasicBean.node_soft_msg.op_system_stype = _one_syttem[0];
                                            data.nodeBasicBean.node_soft_msg.op_system_version = _one_syttem[1]+" "+ _one_syttem[2];
                                        }
                                    }
                                }
                            }
                        });
                    }
                },0)
            },function(error){
                $scope.info.node_load_error_message = error.message;
            }
        )
    };
    //节点列表
    var init = function(){
        getNodeList(_sys_id);
    };
    //跳转其他节点页面 status:1新增 2: 修改 3：查看
    $scope.judgeOtherNode = function(status,node){
        if(status == 1){           //新增
            $state.go("sys_config.node_tab",{node_id:"",modify_type:1,node_name:""});
        }
        if(status == 2){           //修改
            $state.go("sys_config.node_tab",{node_id:node.node_soc_ip,node_name:node.node_name,modify_type:2});
        }
        if(status == 3){           //查看
            $state.go("sys_config.node_tab",{node_id:node.node_soc_ip,node_name:node.node_name,modify_type:3});
        }
    };
    //展示协议列表/插件列表
    $scope.showPluginOrProtocolList = function(list,ip,flag){
        //flag:1,插件  2.协议
        Modal.showPluginOrProtocolList(list,ip,flag).then(function(){});
    };
    //节点-删除节点
    $scope.deleteCurrentNode = function(node_soc_ip,e){
        var _curr_delete;
        _curr_delete = angular.element(e.target).parents('.delete-style');
        _curr_delete.addClass('delete_stop_style');
        Modal.confirm("确认删除当前节点吗？").then(function(choose){
            NodeReform.deleteNode(_sys_id,node_soc_ip).then(function(data){
                if(data){
                    init();
                    _curr_delete.removeClass('delete_stop_style');
                }
            },function(error){
                Modal.alert(error.message,3);
                _curr_delete.removeClass('delete_stop_style');
            });
        },function(data){
            _curr_delete.removeClass('delete_stop_style');
        });
    };
    init();
}]);
//系统-节点配置
bsCtrl.controller('nodeTabCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare", "Sys", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare, Sys) {
    var _modify_type = $stateParams.modify_type;                              //修改类型1.新增 2：修改3：查看
    var _sys_id = $stateParams.sys_id;                                        //系统id
    var _soc_ip = $stateParams.node_id ? $stateParams.node_id : "";           //传入的ip
    var _node_name = $stateParams.node_name ? $stateParams.node_name : "";    //节点名
    //数据集合
    $scope.data = {
        nodes : []     //节点列表
    };
    //控制对象
    $scope.control = {
        modify_type : _modify_type     //修改类型
    };
    //修改高亮属性
    var changeHighClass = function(list,soc_ip){
        if(soc_ip){
            for(var i = 0;i < list.length;i++){
                var _cur_node = list[i];
                if(_cur_node.node_soc_ip == soc_ip){
                    _cur_node.active = true;
                }else{
                    _cur_node.active = false;
                }
            }
        }else{
            for(var j = 0;j < list.length;j++){
                var _node = list[j];
                _node.active = false;
            }
        }
        return list;
    };
    //得到节点列表
    var getNodeList = function(sys_id){
        Sys.getNodelist(sys_id).then(function(data){
                $timeout(function(){
                    if(data){
                        $scope.data.nodes = data.node_list || [];
                        angular.forEach($scope.data.nodes,function(data){
                            if(data.nodeBasicBean){
                                if(data.nodeBasicBean.node_soft_msg){
                                    if(data.nodeBasicBean.node_soft_msg.op_system){
                                        data.nodeBasicBean.node_soft_msg.op_system_stype = '';
                                        data.nodeBasicBean.node_soft_msg.op_system_version = '';
                                        var _op_ststem_list = data.nodeBasicBean.node_soft_msg.op_system.split('-');
                                        if(_op_ststem_list.length > 0){
                                            var _one_syttem=_op_ststem_list[0].split(' ');
                                            data.nodeBasicBean.node_soft_msg.op_system_stype = _one_syttem[0];
                                            data.nodeBasicBean.node_soft_msg.op_system_version = _one_syttem[1]+" "+ _one_syttem[2];
                                        }
                                    }
                                }
                            }
                        });
                        if(_soc_ip){
                            $scope.data.nodes = changeHighClass($scope.data.nodes,_soc_ip);
                        }
                    }
                },0)
            },function(error){}
        )
    };
    var init = function(){
        getNodeList(_sys_id);
        if(_modify_type == 1 && !_soc_ip){       //新增
            $state.go("sys_config.node_tab.node_add_modify",{judge_id:"",judge_name:"",judge_modify:1});
        }else if(_modify_type == 2 && _soc_ip){   //修改
            $state.go("sys_config.node_tab.node_add_modify",{judge_id:_soc_ip,judge_name:_node_name,judge_modify:2});
        }else if(_modify_type == 3 && _soc_ip){  //查看
            $state.go("sys_config.node_tab.node_detail",{judge_id:_soc_ip,judge_name:_node_name,judge_modify:3});
        }
    };
    //切换其他节点
    $scope.changeCurNode = function(from_flag,node){
        if(node){
            $scope.data.nodes = changeHighClass($scope.data.nodes,node.node_soc_ip);
        }else{
            $scope.data.nodes = changeHighClass($scope.data.nodes);
        }
         if(!node && from_flag == 1){    //新增进入,点击新增
             $state.go("sys_config.node_tab.node_add_modify",{judge_id:"",judge_name:'',judge_modify:1});
         }
         if(node && from_flag == 1){     //新增进入，点击修改
             $state.go("sys_config.node_tab.node_add_modify",{judge_id:node.node_soc_ip,judge_name:node.node_name,judge_modify:2});
         }
         if(!node && from_flag == 2){    //修改进入，点击新增
             $state.go("sys_config.node_tab.node_add_modify",{judge_id:node.node_soc_ip,judge_name:node.node_name,judge_modify:1});
         }
        if(node && from_flag == 2){      //修改进入，点击修改
             $state.go("sys_config.node_tab.node_add_modify",{judge_id:node.node_soc_ip,judge_name:node.node_name,judge_modify:2});
         }
        if(node && from_flag == 3){      //查看进入，点击查看
            $state.go("sys_config.node_tab.node_detail",{judge_id:node.node_soc_ip,judge_name:node.node_name,judge_modify:3});
        }
    };
    init();
}]);
//系统-节点列表-节点新增-修改
bsCtrl.controller('nodeTabAddOrModifyCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare","Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal","LogFormat","logCharacterEncod","logWrapStyle","logTimeStampType","LogType","logDateFormat","logTimeFormat","newLogDateStampType","newLogTimeStampType", "pluginExeEnv", "LanguageName", "operateSysBit", "envManage", "pluginLibType", "CV", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare,Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal,LogFormat,logCharacterEncod,logWrapStyle,logTimeStampType,LogType,logDateFormat,logTimeFormat,newLogDateStampType,newLogTimeStampType, pluginExeEnv, LanguageName, operateSysBit, envManage, pluginLibType,CV) {
    var _modify_type = $stateParams.judge_modify;                              //修改类型
    var _sys_id = $stateParams.sys_id;                                        //系统id
    var _node_ip = $stateParams.judge_id ? $stateParams.judge_id : "";        //跳转节点ip
    var _node_name = $stateParams.judge_name ? $stateParams.judge_name : "";  //跳转节点中文名
    var _can_be_config_protocol = [2, 9];                                     //能够对数据源进行配置的协议列表
    var _can_be_test_protocol = [5,10,15];                                    //能够作为校验数据源的协议列表
    var _timeout_promise = "";                                                //定时器
    var _previous_node_type = [];                                             //保存上次的节点类型
    //配置
    $scope.config = {
        form:{},    //页面对象
    };
    //控制
    $scope.control = {
        show_add:false,                   //展示新增
        node_ip_loading:false,            //节点加载
        save_info:false,                  //保存基本信息
        show_modify:false,                //展示修改内容
        get_data_soc_loading:true,        //获得数据源配置
        start_check_save_loading:false   //检查项loading
    };
    //数据
    $scope.data = {
        ftp_config_soc_list:[],                     //ftp数据源
        shell_config_soc_list:[],                  //配置数据源
        basic_info_error_message:"",               //获得基本信息错误信息
        node_type_list:angular.copy(NodeType),     //节点类型列表
        protocol_soc_list:[],                      //协议列表
    };
    //基本信息
    $scope.info = {
        node:{
            node_soc_ip : _node_ip,       //节点IP
            node_name : _node_name,       //节点名
            exist_agent_yn_falg : 2,      //该节点下是否部署了agent标志 1 是 2 否
            agent_config_yn_falg : 2,     //该节点是否使用agent标志 1 是 2 否
            ftp_config_soc : '',          //配置数据源
            shell_config_soc : '',        //校验数据源
            soc_list : [],                //数据源列表
            node_type : '',               //节点类型
            node_basic_msg : '',          //节点基本信息
            monitor_item_list : [],       //检查项列表
            plugin_list : [],             //插件列表
            ctrl_scope : {                //保存后节点名
                soc_ip_name : "",
            }
        }
    };
    //将节点类型配置恢复到上次的状态
    var recoveryPreviousState = function(){
        angular.forEach(_previous_node_type,function(data){
            $scope.data.node_type_list[data-1].state = true;
        })
    };
    //将数据转为状态has_config_soc_list：已配置数据源列表，basic_info：基础信息，shell_soc：shell数据源，ftp_soc：ftp数据源
    var dataTransformState = function(has_config_soc_list,basic_info,shell_soc,ftp_soc){
        //已配置的数据源
        for(var i=0; i<has_config_soc_list.length; i++){
            //能够进行校验的数据源列表
            if(_can_be_test_protocol.indexOf(has_config_soc_list[i].protocol_type) !=-1){
                angular.forEach(has_config_soc_list[i].soc_name_list,function(data){
                    $scope.data.shell_config_soc_list.push({'soc_name':data,'protocol_cn_name':CV.findValue(has_config_soc_list[i].protocol_type,ProtocolType)});
                });
            }
            //能够进行配置的数据源
            if(_can_be_config_protocol.indexOf(has_config_soc_list[i].protocol_type) !=-1){
                angular.forEach(has_config_soc_list[i].soc_name_list,function(data){
                    $scope.data.ftp_config_soc_list.push({'soc_name':data,'protocol_cn_name':CV.findValue(has_config_soc_list[i].protocol_type,ProtocolType)});
                });
            }
            //同步页面数据源配置效果
            for(var j=0; j<has_config_soc_list[i].soc_name_list.length; j++){
                var _config_soc = has_config_soc_list[i].soc_name_list[j];
                for(var k=0; k<$scope.data.protocol_soc_list.length; k++){
                    var _page_soc = $scope.data.protocol_soc_list[k];
                    if(_config_soc == _page_soc.soc_name){
                        _page_soc.checked = true;
                        break;
                    }
                }
            }
        }
        //获取基本信息
        $scope.info.node.node_basic_msg = basic_info;
        $scope.data.node_basic_msg = angular.copy(basic_info);
        //获取配置和校验数据源
        $scope.info.node.shell_config_soc = shell_soc ? shell_soc.soc_name : "";
        $scope.info.node.ftp_config_soc = ftp_soc ? ftp_soc.soc_name : "";
    };
    //获取节点插件列表sys_id:系统名,node_ip:节点ip
    var initEnvList = function (sys_id,node_ip) {
        $scope.info.node.plugin_list = [];
        envManage.getPluginListInNode(sys_id,node_ip).then(function (data) {
            var _plugin_list = data.node_plugin_list ? data.node_plugin_list :[];
            angular.forEach(_plugin_list,function (item) {
                $scope.info.node.plugin_list.push({
                    deploy_status : 2,
                    plugin_name   : item,
                });
            })
        });
    };
    //查看节点配置信息sys_id:系统名,node_name:节点名
    var viewNodeConfigInfo = function (sys_id,node_name) {
        Sys.ViewSysNodeConfigInfo(sys_id,node_name).then(function (data) {
            $timeout(function () {
                if(data){
                    if(!$scope.info.node){
                        return false;
                    }
                    $scope.info.node.node_ip = data.node_soc_ip;                                           //节点IP
                    $scope.info.node.node_soc_ip = data.node_soc_ip;                                       //节点IP
                    $scope.info.node.check_soc = data.shell_config_soc ? data.shell_config_soc : {};       //校验数据源
                    if(data.shell_config_soc){
                        $scope.info.node.check_soc.protocol_type = CV.findValue(data.shell_config_soc.protocol_type,ProtocolType);
                    }
                    $scope.info.node.node_type = [];
                    $scope.info.node.config_soc = data.ftp_config_soc ? data.ftp_config_soc : {};          //配置数据源
                    $scope.info.node.node_type = data.node_type ? data.node_type.split(',') : [];          //节点类型
                    $scope.info.node.node_basic_info = data.nodeBasicBean;                                 //节点基本信息
                    $scope.info.node.comp_deploy_list = data.comp_deploy_list ? data.comp_deploy_list :[]; //组件部署列表
                    var _protocol_list = data.protocol_soc_list ? data.protocol_soc_list :[];
                    _previous_node_type = $scope.info.node.node_type;
                    $scope.info.node.protocol_soc_list =[];                                                //数据源列表
                    if(data.ftp_config_soc){
                        $scope.info.node.config_soc.protocol_type = CV.findValue(data.ftp_config_soc.protocol_type,ProtocolType);
                    }
                    $scope.info.node.node_type_list = [];                                                  //查看页面节点类型
                    for(var j=0;j< NodeType.length;j++){
                        var _node_type_info = {value:NodeType[j].value,state:false};
                        for(var k=0;k<$scope.info.node.node_type.length;k++){
                            if($scope.info.node.node_type[k] == j+1){
                                _node_type_info.state=true;
                            }
                        }
                        $scope.info.node.node_type_list.push(_node_type_info);
                    }
                }
                for(var i=0; i<_protocol_list.length; i++){
                    for(var j=0; j<_protocol_list[i].soc_name_list.length; j++){
                        $scope.info.node.protocol_soc_list.push({
                            'protocol_type':_protocol_list[i].protocol_type,
                            'protocol_cn_name':CV.findValue(_protocol_list[i].protocol_type,ProtocolType),
                            'soc_name':_protocol_list[i].soc_name_list[j],
                        });
                    }
                }
                //设置节点类型的状态
                recoveryPreviousState();
                //将数据转为状态
                dataTransformState(_protocol_list, $scope.info.node.node_basic_info, data.shell_config_soc, data.ftp_config_soc);
                //查看检查项配置信息
                viewCheckItemInfo(_sys_id,$scope.info.node.node_ip);
                //获得节点下环境列表
                initEnvList(_sys_id,$scope.info.node.node_ip);
            },0)
        },function (error) {
            Modal.alert(error.message,3);
        })
    };
    //查看检查项配置信息
    var viewCheckItemInfo =function (sys_name,soc_ip) {
        Sys.viewMonitorItemData(sys_name,soc_ip).then(function (data) {
            if(data){
                $timeout(function () {
                    $scope.info.node.monitor_item_list = data.monitor_item_list ? data.monitor_item_list:[];
                },0)
            }
        })
    };
    //获取数据源
    var getAllSoc = function (status) {
        NodeReform.queryProtocolAndSocNameByIp($scope.info.node.node_soc_ip,$scope.info.node.node_name).then(function(data){
            if(data){
                $scope.control.get_data_soc_loading = false;
                if(!$scope.info.node){
                    return false;
                }
                var _protocol_list = data.protocol_soc_list ? data.protocol_soc_list:[];
                $scope.info.node.exist_agent_yn_falg = data.exist_agent_yn_falg ? data.exist_agent_yn_falg : 2;
                $scope.info.node.agent_config_yn_falg = data.agent_config_yn_falg ? data.agent_config_yn_falg : 2;
                //对数据进行封装
                for(var i=0; i<_protocol_list.length; i++){
                    for(var j=0; j<_protocol_list[i].soc_name_list.length; j++){
                        $scope.data.protocol_soc_list.push({
                            'protocol_type' : _protocol_list[i].protocol_type,
                            'protocol_cn_name' : CV.findValue(_protocol_list[i].protocol_type,ProtocolType),
                            'soc_name' : _protocol_list[i].soc_name_list[j],
                            'checked' : false
                        });
                    }
                }
                if(status){
                    //获取配置数据源信息
                    viewNodeConfigInfo(_sys_id,$scope.info.node.node_name);
                }
            }
        },function(error){
            Modal.alert(error.message);
            $scope.control.get_data_soc_loading = false;
        });
    };
    //初始化及获取数据源列表
    var initAndGetSocList = function(status){
        //获取所有的数据源列表
        getAllSoc(status);
    };
    //取消之前定时
    var cancelPreviousTimeout = function() {
        if (_timeout_promise) {
            $timeout.cancel(_timeout_promise);
        }
    };
    //4s内未配置节点类型自动保存
    var configNodeTypeTimeout = function(node_type) {
        var _node_name = $scope.info.node.node_name;
        _timeout_promise = $timeout(function () {
            NodeReform.configNodeType(_node_name,node_type.join(',')).then(function(data){
                _previous_node_type = node_type;
            },function(error){
                recoveryPreviousState();
            });
        }, 3000);
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
    var init = function(){
        if(_modify_type==1){//只有状态为新增，才显示 ;从配置为修改的进入
            $scope.control.show_add = true;
        }
        if( _modify_type == 2){
            $scope.control.show_modify = true;
            initAndGetSocList(2);
        }
    };
    //失去焦点判断基本信息是否改动
    $scope.testIsChange = function(msg,info_name,flag_name,old_msg){
        if(!msg[info_name+'_changed']){
            if(msg[info_name].replace(/^\s+|\s+$/g,'')!=old_msg[info_name].replace(/^\s+|\s+$/g,'')){
                msg[flag_name] = 1;
                msg[info_name+'_changed'] = true;
            }
        }
    };
    //操作节点类型
    $scope.selectItem = function(node){
        var _node_list = [];
        angular.forEach($scope.data.node_type_list,function(data){
            if(data.state){
                _node_list.push(data.key);
            }
        });
        cancelPreviousTimeout();
        configNodeTypeTimeout(_node_list);
    };
    //新增节点
    $scope.addNodeSocIp = function(){
        //表单验证
        if(!CV.valiForm($scope.config.form.add_node_form)){
            return false;
        }
        $scope.control.node_ip_loading = true;
              NodeReform.addNode(_sys_id,$scope.info.node.ctrl_scope.soc_ip_name).then(function(data){
                 if(data){
                     $scope.control.save_info = true;
                     $scope.info.node.node_soc_ip = $scope.info.node.ctrl_scope.soc_ip_name;
                     $scope.info.node.node_name = data.node_name;
                     initAndGetSocList();
                 }
         },function(error){
             $scope.control.node_ip_loading = false;
             Modal.alert(error.message,3);
         });
    };
    //配置数据源
    $scope.configDataSource = function(soc){
        soc.checked = !soc.checked;
        if(_can_be_config_protocol.indexOf(soc.protocol_type) != -1){
            if(soc.checked){
                $scope.data.ftp_config_soc_list.push({'soc_name':soc.soc_name,'protocol_cn_name':soc.protocol_cn_name});
            }else{
                if(soc.soc_name == $scope.info.node.ftp_config_soc){
                    $scope.info.node.ftp_config_soc = "";
                }
                $scope.data.ftp_config_soc_list.splice(BsysFunc.getObjIndex($scope.data.ftp_config_soc_list,soc.soc_name),1);
            }
        }
        if(_can_be_test_protocol.indexOf(soc.protocol_type)!=-1){
            if(soc.checked){
                $scope.data.shell_config_soc_list.push({'soc_name':soc.soc_name,'protocol_cn_name':soc.protocol_cn_name});
            }else{
                if(soc.soc_name == $scope.info.node.shell_config_soc){
                    $scope.info.node.shell_config_soc = "";
                }
                $scope.data.shell_config_soc_list.splice(BsysFunc.getObjIndex($scope.data.shell_config_soc_list,soc.soc_name),1);
            }
        }
    };
    //部署Agent
    $scope.startDeployAgent = function () {
        Modal.deployAgent($scope.data.protocol_soc_list,$scope.info.node.node_name).then(function () {
            $scope.data.protocol_soc_list = [];
            $scope.data.ftp_config_soc_list = [];
            $scope.data.shell_config_soc_list = [];
            //获取所有的数据源列表
            getAllSoc();
        })
    };
    //保存配置数据源
    $scope.nodeConfigFormSubmit = function(){
        BsysFunc.stateTransformData($scope.info.node,$scope.data.protocol_soc_list);
        $timeout(function(){
            if(!CV.valiForm($scope.config.form.node_config)){
                return false;
            }
            $scope.control.save_soc_loading = true;
            NodeReform.setDataSourceConfigInfo($scope.info.node).then(function(data){
                if(data){
                    $scope.control.save_soc_loading = false;
                    $scope.info.node.node_ip = $scope.info.node.node_soc_ip;
                    Modal.alert("数据源配置信息保存成功",2);
                    //获取基本信息
                    if(!$scope.info.node.node_basic_msg){
                        $scope.getBasicInfo($scope.basicInfoFormSubmit);
                    }
                }
            },function(error){
                $scope.control.save_soc_loading = false;
                Modal.alert(error.message,3);
            });
        },0);
    };
    //获取基本信息
    $scope.getBasicInfo = function(func){
        $scope.control.get_btn_loading = true;
        NodeReform.getNodeBasicInfo($scope.info.node.node_name).then(function(data){
            if(data){
                $scope.control.get_btn_loading = false;
                $scope.data.basic_info_error_message = '';
                $scope.info.node.node_basic_msg = data.node_basic_msg ? data.node_basic_msg:{};
                $scope.data.node_basic_msg = angular.copy(data.node_basic_msg ? data.node_basic_msg:{});
                if(func){ func();}
                //获取系统信息后刷新系统环境列表
                initEnvList(_sys_id,$scope.info.node.node_ip);
            }
        },function(error){
            $scope.control.get_btn_loading = false;
            $scope.data.basic_info_error_message = error.message;
        });
    };
    //基本信息修改改变背景色
    $scope.changeBgColor = function(flag){
        return flag ? {'background-color':'#3e5373'}:{};
    };
    //提交基本信息
    $scope.basicInfoFormSubmit = function(flag){
        $scope.control.save_basic_info_loading = true;
        NodeReform.saveNodeBasicInfo($scope.info.node,_sys_id).then(function(data){
            if(data){
                $scope.control.save_basic_info_loading = false;
                var _save_basic_msg = flag ?'节点基本信息保存成功':'节点基本信息获取成功';
                Modal.alert(_save_basic_msg,2);
            }
        },function(error){
            $scope.control.save_basic_info_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //配置-状态检查
    $scope.statusCheckConfig = function (step) {
        Modal.addCheckItem(_sys_id,$scope.info.node.node_ip,step.phase).then(function (data) {
            step.phase = data;
        })
    };
    //状态检查
    $scope.addCheckItem = function () {
        if(!CV.valiForm($scope.config.form.status_monitor)){
            return false;
        };
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
        };
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
            Modal.alert(error.message);
        })
    };
    //部署-选择插件
    $scope.chooseDeployPlugin = function () {
        $scope.info.node.plugin_list = $scope.info.node.plugin_list || [];
        if(!$scope.info.node.node_ip){
            Modal.alert('请完善数据源配置!',3);
            return false;
        }
        Modal.plusePlugin($scope.info.node.plugin_list).then(function (selected_plugin) {
            var _deploy_list = [],_delete_plugin_list=[];
            var plugin_info = {
                business_sys_name : _sys_id,
                soc_ip            : $scope.info.node.node_ip,
                plugin_list       : [],
            };
            //删除所有部署失败的
            deletePluginByDeployStatus(3);
            //deploy_status 0未部署 1 部署中 2成功 3失败 4 删除中
            //处理全部反部署
            if(selected_plugin.length === 0){
                angular.forEach($scope.info.node.plugin_list,function(item,index,array){
                    item.deploy_status = 4;  //删除中
                });
            }
            //处理-部分部署,部分反部署
            if(selected_plugin.length !== 0){
                //需要删除的插件(求差集(A-B) plugin_list(A) - selected_plugin(B))
                for(var i=0; i < $scope.info.node.plugin_list.length; i++){
                    var _all_plugin = $scope.info.node.plugin_list[i];
                    var flag = true;
                    for(var j = 0; j < selected_plugin.length; j++){
                        if(_all_plugin.plugin_name === selected_plugin[j].plugin_name){
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
                for(var k = 0; k < selected_plugin.length; k++){
                    if(!selected_plugin[k].deploy_status){
                        _deploy_list.push({
                            plugin_name : selected_plugin[k].plugin_name,
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
            envManage.exeDeployPlugin(plugin_info).then(function (data) {
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
    //返回节点列表
    $scope.returnNodeList=function(){
        $state.go("sys_config.node_list");
    };
    init();
}]);
//系统-节点列表-节点查看
bsCtrl.controller('nodeTabDetailCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare","Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal","LogFormat","logCharacterEncod","logWrapStyle","logTimeStampType","LogType","logDateFormat","logTimeFormat","newLogDateStampType","newLogTimeStampType", "pluginExeEnv", "LanguageName", "operateSysBit", "envManage", "pluginLibType", "CV", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare,Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal,LogFormat,logCharacterEncod,logWrapStyle,logTimeStampType,LogType,logDateFormat,logTimeFormat,newLogDateStampType,newLogTimeStampType, pluginExeEnv, LanguageName, operateSysBit, envManage, pluginLibType,CV) {
    var _sys_id = $stateParams.sys_id;                                           //系统id
    var _node_ip = $stateParams.judge_id ? $stateParams.judge_id : "";           //跳转节点ip
    var _node_name = $stateParams.judge_name ? $stateParams.judge_name : "";     //跳转节点中文名
    var _can_be_config_protocol = [2, 9];                                        //能够对数据源进行配置的协议列表
    var _can_be_test_protocol = [5,10,15];                                       //能够作为校验数据源的协议列表
    var _previous_node_type = [];                                                //保存上次的节点类型
    //节点类型配置
    var recoveryPreviousState = function(){
        angular.forEach(_previous_node_type,function(data){
            $scope.data.node_type_list[data-1].state = true;
        })
    };
    //将数据转为状态has_config_soc_list：已配置数据源列表，basic_info：基础信息，shell_soc：shell数据源，ftp_soc：ftp数据源
    var dataTransformState = function(has_config_soc_list,basic_info,shell_soc,ftp_soc){
        //已配置的数据源
        for(var i = 0; i < has_config_soc_list.length; i++){
            //能够进行校验的数据源列表
            if(_can_be_test_protocol.indexOf(has_config_soc_list[i].protocol_type) != -1){
                angular.forEach(has_config_soc_list[i].soc_name_list,function(data){
                    $scope.data.shell_config_soc_list.push({'soc_name':data,'protocol_cn_name':CV.findValue(has_config_soc_list[i].protocol_type,ProtocolType)});
                });
            }
            //能够进行配置的数据源
            if(_can_be_config_protocol.indexOf(has_config_soc_list[i].protocol_type) != -1){
                angular.forEach(has_config_soc_list[i].soc_name_list,function(data){
                    $scope.data.ftp_config_soc_list.push({'soc_name':data,'protocol_cn_name':CV.findValue(has_config_soc_list[i].protocol_type,ProtocolType)});
                });
            }
            //同步页面数据源配置效果
            for(var j = 0; j < has_config_soc_list[i].soc_name_list.length; j++){
                var _config_soc = has_config_soc_list[i].soc_name_list[j];
                for(var k = 0; k < $scope.data.protocol_soc_list.length; k++){
                    var _page_soc = $scope.data.protocol_soc_list[k];
                    if(_config_soc == _page_soc.soc_name){
                        _page_soc.checked = true;
                        break;
                    }
                }
            }
        }
        //获取基本信息
        $scope.info.node.node_basic_msg = basic_info;
        $scope.data.node_basic_msg = angular.copy(basic_info);
        //获取配置和校验数据源
        $scope.info.node.shell_config_soc = shell_soc ? shell_soc.soc_name : "";
        $scope.info.node.ftp_config_soc = ftp_soc ? ftp_soc.soc_name : "";
    };
    //获取节点插件列表sys_id:系统名,node_ip:节点ip
    var initEnvList = function (sys_id,node_ip) {
        $scope.info.node.plugin_list = [];
        envManage.getPluginListInNode(sys_id,node_ip).then(function (data) {
            var _plugin_list = data.node_plugin_list ? data.node_plugin_list :[];
            angular.forEach(_plugin_list,function (item) {
                $scope.info.node.plugin_list.push({
                    deploy_status : 2,
                    plugin_name   : item,
                });
            })
        });
    };
    //查看检查项配置信息
    var viewCheckItemInfo = function (sys_id,soc_ip) {
        Sys.viewMonitorItemData(sys_id,soc_ip).then(function (data) {
            if(data){
                $timeout(function () {
                    $scope.info.node.monitor_item_list =data.monitor_item_list ? data.monitor_item_list:[];
                },0)
            }
        })
    };
    //查看节点配置信息
    var viewNodeConfigInfo = function (sys_id,node_name) {
        Sys.ViewBsNodeConfigInfo(sys_id,node_name).then(function (data) {
            $timeout(function () {
                if(data){
                    if(!$scope.info.node){
                        return false;
                    }
                    $scope.info.node.node_ip = data.node_soc_ip;         //节点IP
                    $scope.info.node.check_soc = data.shell_config_soc ? data.shell_config_soc : {};   //校验数据源
                    if(data.shell_config_soc){
                        $scope.info.node.check_soc.protocol_type = CV.findValue(data.shell_config_soc.protocol_type,ProtocolType);
                    }
                    $scope.info.node.node_type = [];
                    $scope.info.node.config_soc = data.ftp_config_soc ? data.ftp_config_soc : {};       //配置数据源
                    $scope.info.node.node_type = data.node_type ? data.node_type.split(',') : [];  //节点类型
                    $scope.info.node.node_basic_info = data.nodeBasicBean;          //节点基本信息
                    $scope.info.node.comp_deploy_list = data.comp_deploy_list ? data.comp_deploy_list :[];        //组件部署列表
                    var _protocol_list = data.protocol_soc_list ? data.protocol_soc_list :[];
                    _previous_node_type = $scope.info.node.node_type;
                    $scope.info.node.protocol_soc_list =[];//数据源列表
                    if(data.ftp_config_soc){
                        $scope.info.node.config_soc.protocol_type = CV.findValue(data.ftp_config_soc.protocol_type,ProtocolType);
                    }
                    $scope.info.node.node_type_list = [];   //查看页面节点类型
                    for(var j = 0;j < NodeType.length; j++){
                        var _node_type_info = {value:NodeType[j].value,state:false};
                        for(var k = 0;k < $scope.info.node.node_type.length; k++){
                            if($scope.info.node.node_type[k] == j+1){
                                _node_type_info.state = true;
                            }
                        }
                        $scope.info.node.node_type_list.push(_node_type_info);
                    }
                }
                for(var i=0; i<_protocol_list.length; i++){
                    for(var j = 0; j< _protocol_list[i].soc_name_list.length; j++){
                        $scope.info.node.protocol_soc_list.push({
                            'protocol_type' : _protocol_list[i].protocol_type,
                            'protocol_cn_name' : CV.findValue(_protocol_list[i].protocol_type,ProtocolType),
                            'soc_name' : _protocol_list[i].soc_name_list[j],
                        });
                    }
                }
                //设置节点类型的状态
                recoveryPreviousState();
                //将数据转为状态
                dataTransformState(_protocol_list, $scope.info.node.node_basic_info, data.shell_config_soc, data.ftp_config_soc);
                //查看检查项配置信息
                viewCheckItemInfo(_sys_id,$scope.info.node.node_ip);
                //获取节点插件列表
                initEnvList(_sys_id,$scope.info.node.node_ip);
            },0)
        },function (error) {
            Modal.alert(error.message,3);
        })
    };
    //获取数据源
    var getAllSoc = function (status) {
        NodeReform.queryProtocolAndSocNameByIp(_node_ip,_node_name).then(function(data){
            if(data){
                $scope.control.get_data_soc_loading=false;
                if(!$scope.info.node){
                    return false;
                }
                var _protocol_list = data.protocol_soc_list ? data.protocol_soc_list:[];
                $scope.info.node.exist_agent_yn_falg = data.exist_agent_yn_falg ? data.exist_agent_yn_falg : 2;
                $scope.info.node.agent_config_yn_falg = data.agent_config_yn_falg ? data.agent_config_yn_falg : 2;
                //对数据进行封装
                for(var i=0; i<_protocol_list.length; i++){
                    for(var j=0; j<_protocol_list[i].soc_name_list.length; j++){
                        $scope.data.protocol_soc_list.push({
                            'protocol_type':_protocol_list[i].protocol_type,
                            'protocol_cn_name':CV.findValue(_protocol_list[i].protocol_type,ProtocolType),
                            'soc_name':_protocol_list[i].soc_name_list[j],
                            'checked':false
                        });
                    }
                }
                if(status){
                    //获取配置数据源信息
                    viewNodeConfigInfo(_sys_id,_node_name);
                }
            }
        },function(error){
            Modal.alert(error.message,3);
            $scope.control.get_data_soc_loading=false;
        });
    };
    //初始化及获取数据源列表
    var initAndGetSocList = function(status){
        $scope.info = {
            node : {
                node_soc_ip: _node_ip,   //节点IP
                node_name:_node_name,    //节点名
                exist_agent_yn_falg: 2,  //该节点下是否部署了agent标志 1 是 2 否
                agent_config_yn_falg: 2, //该节点是否使用agent标志 1 是 2 否
                ftp_config_soc:'',       //配置数据源
                shell_config_soc:'',     //校验数据源
                soc_list:[],             //数据源列表
                node_type:'',            //节点类型
                node_basic_msg:'',       //节点基本信息
                monitor_item_list:[],    //检查项列表
                plugin_list:[],          //插件列表
                ctrl_scope:{             //新增ip
                    soc_ip_name:"",
                }
            }
        };
        $scope.control = {
            show_add:false,            //展示新增
            node_ip_loading:false,     //节点加载
            save_info:false,           //保存基本
            show_modify:false,         //展示修改
            get_data_soc_loading:true,//获得数据源配置
        };
        $scope.data={
            ftp_config_soc_list:[],               //ftp配置数据源
            shell_config_soc_list:[],             //shell数据源
            basic_info_error_message:[],          //错误信息
            node_type_list:angular.copy(NodeType),//节点类型
            protocol_soc_list:[],                 //协议类型
        };
        $scope.info.node.ctrl_scope.soc_ip_name = '';//节点ip
        //获取所有的数据源列表
        getAllSoc(status);
    };
    var init = function(){
        initAndGetSocList(3);
    };
    //跳回节点列表
    $scope.back = function(){
        $state.go("sys_config.node_list");
    };
    init();
}]);*/
//系统-方案列表
bsCtrl.controller('programListCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare", "Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal","LogFormat","logCharacterEncod","logWrapStyle","logTimeStampType","LogType","logDateFormat","logTimeFormat","newLogDateStampType","newLogTimeStampType", "pluginExeEnv", "LanguageName", "operateSysBit", "envManage", "pluginLibType","BusiSys", "CV", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare, Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal,LogFormat,logCharacterEncod,logWrapStyle,logTimeStampType,LogType,logDateFormat,logTimeFormat,newLogDateStampType,newLogTimeStampType, pluginExeEnv, LanguageName, operateSysBit, envManage, pluginLibType,BusiSys,CV) {
    var _sys_id = $stateParams.sys_id;   //系统id
    //列表
    $scope.data = {
        progs:[]                        //方案列表
    };
    //对象
    $scope.info={
        prog_load_error_message:'',    //加载方案错误信息
    };
    //得到方案列表
    var getProgramList = function(sys_id){
        Sys.getAllProgramList(sys_id).then(function (data) {
            $timeout(function () {
                if(data){
                    $scope.info.prog_load_error_message = '';
                    $scope.data.progs = data.program_list ? data.program_list : [];
                }
            },0);
        },function (error) {
            $scope.info.prog_load_error_message = error.message;
        });
    };
    //方案列表
    var init = function(){
        getProgramList(_sys_id);
    };
    //方案配置列表显示控制
    $scope.paramListPacPos = function (index) {
        $timeout(function () {
            var _pac_tar = $('.program-list'+index+' .param-list-pac');
            var _total_width = 0;
            $.each(_pac_tar,function (ind,cur) {
                _total_width += $(this).width()+28;
                if(_total_width<=224 && ind+1==_pac_tar.length){
                    $('.program-list'+index +' .param-list-fix').css({'display':'none'});
                }else if(_total_width+37>224) {
                    $('.program-list'+index +' .param-list-fix').css({'display':'inline-block'});
                    $(this).css({'display':'none'})
                }
            })
        },200)
    };
    //方案列表-copy方案
    $scope.copyProgramme = function(program){
        Modal.confirm("确认是否复制当前方案？").then(function (data) {
            //进入修改，这里传入的第repeat_flag参数表示是否为复制方案的标志 1复制 2:不复制 正常修改方案信息
            $state.go("sys_config.program_tab",{program_id:program.prog_id,program_name:program.prog_cn_name,modify_type:2,repeat_flag:1});
        });
    };
    //方案-删除方案
    $scope.deleteProgramme = function(prog_id,e,flag){
        var _curr_delete = angular.element(e.target).parents('.delete-style');
        _curr_delete.addClass('delete-stop-style');
        Modal.confirm("确认删除当前方案？").then(function (data) {
            if(data){
                Sys.deleteProgram(prog_id).then(function(data){
                        $timeout(function(){
                            if(data){
                                Modal.alert("删除成功",2);
                                getProgramList(_sys_id);
                                _curr_delete.removeClass('delete-stop-style');
                            }
                        },0)
                    },function(error){
                        Modal.alert(error.message,3);
                    }
                )
            }else{
                _curr_delete.removeClass('delete-stop-style');
            }
        },function(data){
            _curr_delete.removeClass('delete-stop-style');
        });
    };
    //方案-发布方案
    $scope.publishProgramme=function(prog_id,publish_state,e){
        Modal.confirm("确认发布当前方案？").then(function () {
            BusiSys.publishScheme(prog_id,publish_state).then(function(data){
                    $timeout(function(){
                        if(data){
                            Modal.alert("发布成功",2);
                            getProgramList(_sys_id);
                        }
                    },0)
                },function(error){
                    Modal.alert(error.message,3);

                }
            )
        },function(data){

        });
    };
    //跳转其他节点页面 status:1新增 2: 修改 3：查看
    $scope.judgeOtherProgram = function(status,program){
        if(status == 1){       //新增
            $state.go("sys_config.program_tab",{program_id:"",modify_type:1,repeat_flag:2});
        }
        if(status==2){        //修改
            $state.go("sys_config.program_tab",{program_id:program.prog_id,modify_type:2,repeat_flag:2});
        }
        if(status==3){        //查看
            $state.go("sys_config.program_tab",{program_id:program.prog_id,modify_type:3,repeat_flag:2});
        }
    };
    init();
}]);
//系统-方案配置
bsCtrl.controller('programTabCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare", "Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal","LogFormat","logCharacterEncod","logWrapStyle","logTimeStampType","LogType","logDateFormat","logTimeFormat","newLogDateStampType","newLogTimeStampType", "pluginExeEnv", "LanguageName", "operateSysBit", "envManage", "pluginLibType", "CV", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare,Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal,LogFormat,logCharacterEncod,logWrapStyle,logTimeStampType,LogType,logDateFormat,logTimeFormat,newLogDateStampType,newLogTimeStampType, pluginExeEnv, LanguageName, operateSysBit, envManage, pluginLibType,CV) {
    var _modify_type = $stateParams.modify_type;  //修改类型1.新增 2：修改3：查看
    var _repeat_flag = $stateParams.repeat_flag;  //是否是复制
    var _sys_id = $stateParams.sys_id;            //系统id
    var _program_id = $stateParams.program_id ? $stateParams.program_id : "";        //传入的id
    //数据集合
    $scope.data = {
        progs:[]      //节点列表
    };
    //控制对象
    $scope.control = {
        modify_type:_modify_type      //修改类型
    };
    //修改高亮属性
    var changeHighClass = function(list,id){
        if(id){
            for(var i=0;i<list.length;i++){
                var _cur_program=list[i];
                if(_cur_program.prog_id==id){
                    _cur_program.active=true;
                }else{
                    _cur_program.active=false;
                }
            }
        }else{
            for(var j=0;j<list.length;j++){
                var _program=list[j];
                _program.active=false;
            }
        }
        return list;
    };
    //得到方案列表
    var getProgramList = function(sys_id){
        Sys.getAllProgramList(sys_id).then(function (data) {
            $timeout(function () {
                if(data){
                    $scope.data.progs=data.program_list ? data.program_list : [];
                    if(_program_id  && _repeat_flag != 1){
                        $scope.data.nodes = changeHighClass($scope.data.progs,_program_id);
                    }
                }
            },0);
        },function (error) {
        });
    };
    var init = function(){
        getProgramList(_sys_id);
        if(_modify_type == 1 && !_program_id){      //新增进去
            $state.go("sys_config.program_tab.program_add_or_modify",{judge_id:"",judge_modify:1,judge_repeat:2});
        }else if(_modify_type == 2 && _program_id){
            if(_repeat_flag == 1){                 //复制进去，跳转复制
                $state.go("sys_config.program_tab.program_add_or_modify",{judge_id:_program_id,judge_modify:2,judge_repeat:1});
            }else{                                 //其他的进入修改
                $state.go("sys_config.program_tab.program_add_or_modify", {judge_id:_program_id,judge_modify:2,judge_repeat:2});
            }
        }else if(_modify_type == 3 && _program_id){    //查看
            $state.go("sys_config.program_tab.program_detail",{judge_id:_program_id,judge_modify:3});
        }
    };
    //切换其他方案
    $scope.changeCurProgram = function(from_flag,program){
        if(program){
            $scope.data.progs = changeHighClass($scope.data.progs,program.prog_id);
        }else{
            $scope.data.progs = changeHighClass($scope.data.progs);
        }
        if(!program && from_flag == 1){       //新增进入,点击新增
            $state.go("sys_config.program_tab.program_add_or_modify",{judge_id:'',judge_modify:1,judge_repeat:2});
        }
        if(program && from_flag == 1){        //新增进入，点击修改
            $state.go("sys_config.program_tab.program_add_or_modify",{judge_id:program.prog_id,judge_modify:2,judge_repeat:2});
        }
        if(!program && from_flag == 2){       //修改进入，点击新增
            $state.go("sys_config.program_tab.program_add_or_modify",{judge_id:program.prog_id,judge_modify:1,judge_repeat:2});
        }
        if(program && from_flag == 2){        //修改进入，点击修改
            $state.go("sys_config.program_tab.program_add_or_modify",{judge_id:program.prog_id,judge_modify:2,judge_repeat:2});
        }
        if(program && from_flag == 3){       //查看进入，点击查看
            $state.go("sys_config.program_tab.program_detail",{judge_id:program.prog_id,judge_modify:3});
        }
    };
    init();
}]);
//系统-方案列表-方案新增-修改
bsCtrl.controller('programTabAddOrModifyCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare", "Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal","LogFormat","logCharacterEncod","logWrapStyle","logTimeStampType","LogType","logDateFormat","logTimeFormat","newLogDateStampType","newLogTimeStampType", "pluginExeEnv", "LanguageName", "operateSysBit", "envManage", "pluginLibType", "CV", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare, Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal,LogFormat,logCharacterEncod,logWrapStyle,logTimeStampType,LogType,logDateFormat,logTimeFormat,newLogDateStampType,newLogTimeStampType, pluginExeEnv, LanguageName, operateSysBit, envManage, pluginLibType,CV) {
    var _repeat_flag = $stateParams.judge_repeat;                          //是否是复制
    var _sys_id = $stateParams.sys_id;                                     //系统id
    var _program_id = $stateParams.judge_id ? $stateParams.judge_id :"";   //跳转方案id
    var _xml_download_path;                                                    //下载xml方案路径
    var _excel_download_path;                                                    //下载excel方案路径
    var _down_time;                                                        //鼠标按下时间
    var initProg = function(){
        $scope.info = {
            prog : {
                group_list : [],                   //分组列表
                prog_source : 1,                   //方案来源
                prog_id : "",                      //id
                business_sys_name :  _sys_id,      //系统名
                prog_cn_name : "",                 //系统中文名
                prog_bk_desc : "",                 //系统描述
                prog_type : 1,                     //方案类型 1 发布方案 2 回退方案
                is_update : false,                 //是否是修改标志
                pac_type_list:[],                  //发布包列表
                config_file_list:[],                //配置文件列表
                ref_package_list:[],               //引用包列表
                param_list:[],                     //参数列表
            },
            prog_form : {},                       //方案页面对象
            temp_prog_data : {                    //页面临时对象
                node_ip_name_list : [],           //系统下节点ip和节点名集合
                node_ip_list:[],                  //系统下节点集合
                global_param_list:[],             //全局参数列表
                ref_param_list:[],                //引用参数列表
                ref_global_list:[],               //引用的全局参数列表
                all_param_name_list:[],           //参数名列表
                file_path:'',                     //路径
                logic_node_list : []              //逻辑节点列表
            },
            program_group:{
                curr_group_index : 0
            }
        };
        $scope.info.prog.group_list= [{
            group_name: '发布阶段1',
            choose_flag:true,
            group_type : 1,
            parallel_flag: true,
            phase_list:[]
        }];
        //集合数据
        $scope.data = {
            program_type_list : ProgType,      //方案类型
        };
        //页面控制对象
        $scope.control = {
            modules_loading : false,      //模组信息加载标志
            submit_loading : false,       //页面提交标志
            expand_flag : false,          //模组全部展开标志
            import_loading : false,       //模组导入loading
            is_modify_prog : true,        //是否修改
            owner_btn_flag:true           //自定义
        };
        $scope.config = {
            process_fileupload:{   //上传流程模板参数配置
                suffixs : 'xml,xlsx,xls',
                filetype : "",
                filename : "",
                uploadpath : "",
            },
            viewShOptions : CodeMirrorOption.Sh(true),         //shell配置
            viewSqlOptions : CodeMirrorOption.Sql(true),       //sql配置
            viewPyOptions : CodeMirrorOption.Python(true),     //python配置
            viewJavaOptions : CodeMirrorOption.Java(true),     //java配置
        };
    };
    //修改方案---处理方案信息
    var progDealPubData = function(){
        //将手动添加的参数转成引用参数列表
        for(var k = 0; k < $scope.info.temp_prog_data.global_param_list.length; k++){
            var _sub_ref_param={key:$scope.info.temp_prog_data.global_param_list[k].param_name,value:$scope.info.temp_prog_data.global_param_list[k].param_name,flag:1};
            $scope.info.temp_prog_data.ref_global_list.push(_sub_ref_param);
        }
        BsysFunc.bindRefParam($scope.info.prog.group_list,$scope.info.temp_prog_data.global_param_list,$scope.info.prog.pac_type_list);
        $scope.info.temp_prog_data.ref_param_list=$scope.info.temp_prog_data.ref_global_list.concat($scope.info.prog.ref_package_list);
        //模组信息加载完成
        $scope.control.modules_loading = false;
    };
    //修改方案---拿到方案信息后做基本处理
    var progDealBasicData = function(data,prog_id){
        $scope.control.owner_btn_flag = true;
        if(prog_id != 'upload'){
            $scope.info.prog.prog_cn_name=data.program.prog_cn_name;
            $scope.info.prog.prog_bk_desc=data.program.prog_bk_desc;
            $scope.info.prog.prog_source=1;
            $scope.info.prog.prog_type=data.program.prog_type;
            $scope.info.prog.prog_id=data.program.prog_id;
            $scope.info.prog.is_update=true;
            $scope.control.import_loading = true;
        }
        $scope.publish_state=data.publish_state;
        $scope.info.prog.group_list = data.program.group_list ? data.program.group_list : [];
        $scope.info.prog.param_list = data.program.param_list ? data.program.param_list : [];
        $scope.info.temp_prog_data.global_param_list = $scope.info.prog.param_list;
        for(var i=0;i<$scope.info.prog.group_list.length;i++){
            var _group = $scope.info.prog.group_list[i];
            var _pac_type_list = _group.pac_type_list || [];
            var _config_file_list = _group.config_file_list || [];
            $scope.info.prog.group_list[0].choose_flag =true;
            _group.temp_pac_type_list = angular.copy($scope.info.prog.pac_type_list);
            _group.temp_config_file_list = angular.copy($scope.info.prog.config_file_list);
            //反选包
            BsysFunc.invertSelectionPac(_pac_type_list,_group.temp_pac_type_list);
            //反选配置文件
            BsysFunc.invertSelectionConfig(_config_file_list,_group.temp_config_file_list);
            _group.phase_list = _group.phase_list ? _group.phase_list:[];
            for(var j = 0 ; j < _group.phase_list.length;j++){
                _group.phase_list[j].show_detail = false;
                _group.phase_list[j].logic_node_list = angular.copy($scope.info.temp_prog_data.logic_node_list);
                if(_group.phase_list[j].phase_type == 1 || _group.phase_list[j].phase_type == 2 || _group.phase_list[j].phase_type == 3){
                    _group.phase_list[j].script_list = [];
                    _group.phase_list[j].type_cn  = CV.findValue(_group.phase_list[j].impl_type,IML_TYPE);
                    if(_group.phase_list[j].script.cmds){
                        _group.phase_list[j].exec_script = CmptFunc.cmdsToString(_group.phase_list[j].script.cmds);
                    }
                    if(_group.phase_list[j].logical_node){
                        _group.phase_list[j].logical_node_id = _group.phase_list[j].logical_node.logical_node_id
                    }
                    _group.phase_list[j].ref_param_list = _group.phase_list[j].ref_param_list ? _group.phase_list[j].ref_param_list:[];
                    if(_group.phase_list[j].ref_param_list.length != 0){
                        for(var m=0;m<_group.phase_list[j].ref_param_list.length;m++){
                            _group.phase_list[j].ref_param_list[m].ref_param_flag = BsysFunc.judgeRefParam(_group.phase_list[j].ref_param_list[m].ref,$scope.info.temp_prog_data.global_param_list);
                            if(_group.phase_list[j].ref_param_list[m].ref){
                                _group.phase_list[j].ref_param_list[m].ref_param_loading=true;
                            }
                        }
                        _group.phase_list[j].show_ref_param = true;
                    }
                }else if(_group.phase_list[j].phase_type == 4){
                    if(_group.phase_list[j].logical_node){
                        var _logical_node = _group.phase_list[j].logical_node;
                        _logical_node.files_list = [];
                        for(var k =0 ;k < _logical_node.file_list.length; k++){
                            if(prog_id == 'upload'){
                                _logical_node.files_list .push({file:_logical_node.file_list[k],ready_flag:false});
                            }else{
                                _logical_node.files_list .push({file:_logical_node.file_list[k],ready_flag:true});
                            }
                        }
                    }
                } else if(_group.phase_list[j].phase_type == 5){
                    $scope.control.owner_btn_flag=false;
                }else if(_group.phase_list[j].phase_type == 6){
                    _group.phase_list[j].script_fmt=$sce.trustAsHtml(_group.phase_list[j].script.cmds[0])
                }
                //添加
                if(_group.phase_list[j].command && _group.phase_list[j].command.cmds){
                    _group.phase_list[j].command.exec_script=CmptFunc.cmdsToString(_group.phase_list[j].command.cmds);
                }
                for(var l = 0; l < _group.phase_list[j].logic_node_list.length; l++){
                    if( _group.phase_list[j].logic_node_list[l].logical_node_id ==_group.phase_list[j].logical_node_id){
                        _group.phase_list[j].logic_node_list[l].state = true;
                        break;
                    }
                }
            }
            //判断导航条是否显示标志
            _group.nav_show_flag = CmptFunc.judgeShowDetail(_group.phase_list);
            _group.expand_flag = (_group.nav_show_flag == 2) ? true : false;
        }
        if($scope.info.prog.group_list.length != 0){progDealPubData();}
    };
    //获取方案详细信息
    var viewPubProgramInfo = function(prog_id,flag){
        Sys.viewSingleProgramInfo(prog_id).then(function (data) {
            $timeout(function () {
                if (data){
                    prog_id = flag ? 'upload' : prog_id;
                    progDealBasicData(data,prog_id);
                }
            },0)
        },function (error) {
            Modal.alert(error.message,3);
        });
    };
    //获取方案导出路径
    var getProgExportPath = function (prog_id) {
        Sys.getProgExportPath(prog_id).then(function (data) {
            $timeout(function () {
                if (data){
                    _xml_download_path = data.xml_download_path;
                    _excel_download_path = data.excel_download_path;
                }
            },0)
        },function (error) {
            Modal.alert(error.message,3);
        });
    };
    //获取包参数及逻辑节点列表
    var getLogicNodeAndPackageParam = function (sys_id) {
      return  Sys.getLogicNodeAndPacParam(sys_id).then(function (data) {
            $timeout(function () {
                $scope.info.prog.pac_type_list = data.pac_type_list ? data.pac_type_list : [];
                $scope.info.prog.config_file_list = data.file_list ? data.file_list : [];
                $scope.info.temp_prog_data.logic_node_list = data.logical_node_list || [];
                $scope.info.prog.ref_package_list= [];
                for(var j=0;j< $scope.info.prog.pac_type_list.length;j++){
                    var _pac_params = $scope.info.prog.pac_type_list[j];
                    //将全局参数转换成引用全局参数列表
                    var _pac_ref_param={key:_pac_params.type_name,value:_pac_params.type_name,flag:0};
                    $scope.info.prog.ref_package_list.push(_pac_ref_param);
                }
            })
        })
    };
    var init = function(){
        initProg();
        getLogicNodeAndPackageParam(_sys_id).then(function () {
            if(_program_id){
                if(_repeat_flag == 1){
                    viewPubProgramInfo(_program_id,true);
                }else {
                    viewPubProgramInfo(_program_id,false);
                    // getProgExportPath(_program_id);
                }
            }
        });
    };
    //协议类型转化中文名
    $scope.getProtocolTypeCnName = function(protocol_type){
        return CV.findValue(protocol_type,ProtocolType).substring(0,5).toLowerCase();
    };
    //移除模板文件
    $scope.removeProcessTemplateFile = function(){
        $scope.config.process_fileupload.filename = '';
        //同时清空组件模组列表及参数列表
        $scope.info.prog.group_list = [{
            choose_flag : true,
            group_name: "发布阶段1",
            phase_list:[]
        }];
        $scope.info.prog.param_list = [];
        $scope.info.temp_prog_data.global_param_list = [];
        $scope.control.import_loading = false;
    };
    //流程模板文件上传之后
    $scope.uploadProcessSuccessThen = function(){
        //清空参数列表
        $scope.info.temp_prog_data.global_param_list = [];
        $scope.info.temp_prog_data.ref_param_list    = [];
        var file_path=$scope.config.process_fileupload.filename;
        var _type = file_path.substring(file_path.lastIndexOf('.')+1);
        if(_type == 'xml'){
            $scope.config.process_fileupload.filetype = 'XML';
        }else{
            $scope.config.process_fileupload.filetype = 'EXCEL';
        }
        //模组信息加载中
        $scope.control.modules_loading = true;
        $scope.control.import_loading = true;
        Cmpt.importProgram(file_path).then(function(data){
            progDealBasicData(data, "upload");
        },function(error){
            //模组信息加载异常
            $scope.config.process_fileupload.filename = '';
            $scope.control.modules_loading = false;
            $scope.control.import_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //得到点下时间
    $scope.getDownTime = function(){
        _down_time=new Date().getTime();
    };
    //模组展开收起操作
    $scope.toggleModulesDetail = function (step,flag,index,group) {
        if(flag == 1){
            var _up_time=new Date().getTime();
            if(_up_time-_down_time>300){
                return;
            }
        }
        step.show_detail = !step.show_detail;
        //控制展开时关联组件不显示
        if(step.relate_flag_line && step.show_detail){
            if(step.relate_flag_line==1){
                group.phase_list[index+1].expand_relate_flag =true;
            }else {
                group.phase_list[index-1].expand_relate_flag =true;
            }
            step.expand_relate_flag =true;
        }
        if(step.relate_flag_line && !step.show_detail){
            if(step.relate_flag_line==1){
                if(!group.phase_list[index+1].show_detail){
                    group.phase_list[index+1].expand_relate_flag =false;
                    step.expand_relate_flag =false;
                }
            }else {
                if(!group.phase_list[index-1].show_detail){
                    group.phase_list[index-1].expand_relate_flag =false;
                    step.expand_relate_flag =false;
                }
            }
        }
        //判断模组是否全部展开或收起
        group.nav_show_flag = CmptFunc.judgeShowDetail(group.phase_list);
        group.expand_flag = (group.nav_show_flag == 2) ? true : false;
        //重新刷新codemirror
        if(step.show_detail){
            $scope.code_refresh = false;
            $timeout(function(){
                $scope.code_refresh = true;
            },10)
        }
    };
    //模组全部展开
    $scope.expandCollapseAll = function (group) {
        group.nav_show_flag = CmptFunc.expandAllModules(group.phase_list);
        //重新刷新codemirror
        if(group.nav_show_flag == 2){
            $scope.code_refresh = false;
            $timeout(function(){
                $scope.code_refresh = true;
            },10)
        }
    };
    //模组全部收起
    $scope.colseCollapseAll = function (group) {
        for(var i=0;i<group.phase_list.length;i++){
            group.phase_list[i].show_detail = false;
            group.phase_list[i].expand_relate_flag = false;     //控制展开时关联组件不显示
        }
        group.nav_show_flag = 0;
    };
    //公共-参数默认值输入框智能提示
    $scope.paramShellLoaded = function(_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };
    //返回参数列表
    $scope.returnProgramList = function(){
        $state.go('sys_config.program_list');
    };
    //选择执行节点
    $scope.clickExcuteNode = function (step,node_list,node,index) {
        for (var i =0; i < node_list.length; i++){
            if(i!=index){
                node_list[i].state = false;
            }else {
                node_list[i].state = !node_list[i].state;
                step.logical_node = node_list[i].state ? {
                    logical_node_name : node.logical_node_name,
                    logical_node_id : node.logical_node_id
                } : null
            }
        }
    };
    init();
}]);
//系统-方案列表-方案查看
bsCtrl.controller('programTabDetailCtrl',["$scope","$state","$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare", "Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal","LogFormat","logCharacterEncod","logWrapStyle","logTimeStampType","LogType","logDateFormat","logTimeFormat","newLogDateStampType","newLogTimeStampType", "pluginExeEnv", "LanguageName", "operateSysBit", "envManage", "pluginLibType", "CV", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare, Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal,LogFormat,logCharacterEncod,logWrapStyle,logTimeStampType,LogType,logDateFormat,logTimeFormat,newLogDateStampType,newLogTimeStampType, pluginExeEnv, LanguageName, operateSysBit, envManage, pluginLibType,CV) {
    var _repeat_flag = $stateParams.judge_repeat;                           //是否是复制
    var _sys_id = $stateParams.sys_id;                                      //系统id
    var _program_id = $stateParams.judge_id ? $stateParams.judge_id :"";   //跳转方案id
    var _xml_download_path;                                                    //下载xml方案路径
    var _excel_download_path;                                                    //下载excel方案路径
    var _down_time;                                                        //鼠标按下时间
    var initProg = function(){
        $scope.info = {
            prog : {
                group_list : [],                     //分组列表
                prog_source : 1,                     //方案来源
                prog_id : "",                        //id
                business_sys_name :  _sys_id,       //系统名
                prog_cn_name : "",                  //系统中文名
                prog_bk_desc : "",                  //系统描述
                prog_type : 1,                      //方案类型 1 发布方案 2 回退方案
                is_update : false,                  //是否是修改标志
                pac_type_list:[],                   //发布包列表
                ref_package_list:[],                //引用包列表
                param_list:[],                      //参数列表
            },
            prog_form : {},                        //方案页面对象
            temp_prog_data : {                     //页面临时对象
                node_ip_name_list : [],            //系统下节点ip和节点名集合
                node_ip_list:[],                   //系统下节点集合
                global_param_list:[],              //全局参数列表
                ref_param_list:[],                 //引用参数列表
                ref_global_list:[],                //引用的全局参数列表
                all_param_name_list:[],            //参数名列表
                file_path:'',                      //路径
                logic_node_list: []                //逻辑节点列表
            },
            program_group:{
                curr_group_index : 0
            }
        };
        $scope.info.prog.group_list= [{
            group_name: '发布阶段1',
            choose_flag:true,
            phase_list:[]
        }];
        //集合数据
        $scope.data = {
            program_type_list : ProgType,    //方案类型
        };
        //页面控制对象
        $scope.control = {
            modules_loading   : false,   //模组信息加载标志
            submit_loading    : false,   //页面提交标志
            expand_flag       : false,   //模组全部展开标志
            import_loading    : false,   //模组导入loading
            is_modify_prog    : true,    //是否修改
            owner_btn_flag    : true,    //自定义
            show_download_div : false
        };
        $scope.config = {
            process_fileupload:{            //上传流程模板参数配置
                suffixs : 'xml,xlsx,xls',
                filetype : "XML",
                filename : "",
                uploadpath : "",
            },
            viewShOptions : CodeMirrorOption.Sh(true),        //shell配置
            viewSqlOptions : CodeMirrorOption.Sql(true),      //sql配置
            viewPyOptions : CodeMirrorOption.Python(true),    //python配置
            viewJavaOptions : CodeMirrorOption.Java(true),    //java配置
        };
    };
    //查看方案---处理方案信息
    var progDealPubData = function(){
        //将手动添加的参数转成引用参数列表
        for(var k=0;k<$scope.info.temp_prog_data.global_param_list.length;k++){
            var _sub_ref_param={key:$scope.info.temp_prog_data.global_param_list[k].param_name,value:$scope.info.temp_prog_data.global_param_list[k].param_name,flag:1};
            $scope.info.temp_prog_data.ref_global_list.push(_sub_ref_param);
        };
        BsysFunc.bindRefParam($scope.info.prog.group_list,$scope.info.temp_prog_data.global_param_list,$scope.info.prog.pac_type_list);
        $scope.info.temp_prog_data.ref_param_list=$scope.info.temp_prog_data.ref_global_list.concat($scope.info.prog.ref_package_list);
        //模组信息加载完成
        $scope.control.modules_loading = false;
    };
    //查看方案---拿到方案信息后做基本处理
    var progDealBasicData = function(data,prog_id){
        $scope.control.owner_btn_flag = true;
        if(prog_id != 'upload'){
            $scope.info.prog.prog_cn_name      = data.program.prog_cn_name;
            $scope.info.prog.prog_bk_desc      = data.program.prog_bk_desc;
            $scope.info.prog.prog_source       = 1;
            $scope.info.prog.prog_type         = data.program.prog_type;
            $scope.info.prog.prog_id           = data.program.prog_id;
            $scope.info.prog.is_update         =true;
            $scope.control.import_loading = true;
        }
        $scope.publish_state              = data.publish_state;
        $scope.info.prog.pac_type_list     = data.program.pac_type_list ? data.program.pac_type_list :[];
        $scope.info.prog.config_file_list     = data.program.config_file_list ? data.program.config_file_list :[];
        //将类型包参数转化成引用参数列表
        for(var p=0;p<$scope.info.prog.pac_type_list.length;p++){
            $scope.info.prog.pac_type_list[p].param_name = $scope.info.prog.pac_type_list[p].type_name;
            var _sub_ref_package = {key:$scope.info.prog.pac_type_list[p].type_name,value:$scope.info.prog.pac_type_list[p].type_name,flag:0};
            $scope.info.prog.ref_package_list.push(_sub_ref_package);
        }
        $scope.info.prog.group_list = data.program.group_list ? data.program.group_list : [];
        $scope.info.prog.param_list = data.program.param_list ? data.program.param_list : [];
        $scope.info.temp_prog_data.global_param_list = BsysFunc.filterGobalParam($scope.info.prog.param_list);
        for(var i=0;i<$scope.info.prog.group_list.length;i++){
            var _group = $scope.info.prog.group_list[i];
            var _pac_type_list = _group.pac_type_list || [];
            var _config_file_list = _group.config_file_list || [];
            $scope.info.prog.group_list[0].choose_flag =true;
            _group.temp_pac_type_list = angular.copy($scope.info.prog.pac_type_list);
            _group.temp_config_file_list = angular.copy($scope.info.prog.config_file_list);
            //反选包
            BsysFunc.invertSelectionPac(_pac_type_list,_group.temp_pac_type_list);
            //反选配置文件
            BsysFunc.invertSelectionConfig(_config_file_list,_group.temp_config_file_list);
            _group.phase_list = _group.phase_list ? _group.phase_list:[];
            // _group.phase_list= BsysFunc.dealPhase(_group.phase_list);
            for(var j = 0 ; j < _group.phase_list.length;j++){
                _group.phase_list[j].logic_node_list = angular.copy($scope.info.temp_prog_data.logic_node_list);
                _group.phase_list[j].show_detail = false;
                if(_group.phase_list[j].phase_type == 1 || _group.phase_list[j].phase_type == 2 || _group.phase_list[j].phase_type == 3){
                    _group.phase_list[j].script_list = [];
                    _group.phase_list[j].type_cn  = CV.findValue(_group.phase_list[j].impl_type,IML_TYPE);
                    if(_group.phase_list[j].script.cmds){
                        _group.phase_list[j].exec_script = CmptFunc.cmdsToString(_group.phase_list[j].script.cmds);
                    }
                    if(_group.phase_list[j].logical_node){
                        _group.phase_list[j].logical_node_id = _group.phase_list[j].logical_node.logical_node_id
                    }
                    _group.phase_list[j].ref_param_list = _group.phase_list[j].ref_param_list ? _group.phase_list[j].ref_param_list:[];
                    if(_group.phase_list[j].ref_param_list.length != 0){
                        for(var m=0;m<_group.phase_list[j].ref_param_list.length;m++){
                            _group.phase_list[j].ref_param_list[m].ref_param_flag = BsysFunc.judgeRefParam(_group.phase_list[j].ref_param_list[m].ref,$scope.info.temp_prog_data.global_param_list);
                            if(_group.phase_list[j].ref_param_list[m].ref){
                                _group.phase_list[j].ref_param_list[m].ref_param_loading=true;
                            }
                        }
                        _group.phase_list[j].show_ref_param = true;
                    }
                }else if(_group.phase_list[j].phase_type == 5){ //自定义
                    $scope.control.owner_btn_flag=false;
                }else if(_group.phase_list[j].phase_type == 6){//人工阶段
                    _group.phase_list[j].script_fmt=$sce.trustAsHtml(_group.phase_list[j].script.cmds[0])
                }
                //添加
                if(_group.phase_list[j].command && _group.phase_list[j].command.cmds){
                    _group.phase_list[j].command.exec_script=CmptFunc.cmdsToString(_group.phase_list[j].command.cmds);
                }
              /*  for(var l = 0; l < _group.phase_list[j].logic_node_list.length; l++){
                    if( _group.phase_list[j].logic_node_list[l].logical_node_id ==_group.phase_list[j].logical_node_id){
                        _group.phase_list[j].logic_node_list[l].state = true;
                        break;
                    }
                }*/
            }
            //判断导航条是否显示标志
            _group.nav_show_flag = CmptFunc.judgeShowDetail(_group.phase_list);
            _group.expand_flag = (_group.nav_show_flag == 2) ? true : false;
        }
        if($scope.info.prog.group_list.length != 0){progDealPubData();}
    };
    //获取方案详细信息
    var viewPubProgramInfo = function(prog_id,flag){
        Sys.viewSingleProgramInfo(prog_id).then(function (data) {
            $timeout(function () {
                if (data){
                    prog_id = flag ? 'upload' : prog_id;
                    progDealBasicData(data,prog_id);
                }
            },0)
        },function (error) {
            Modal.alert(error.message,3);
            $state.go('sys_config.program_list');
        });
    };
    //获取方案导出路径
    var getProgExportPath = function (prog_id) {
        Sys.getProgExportPath(prog_id).then(function (data) {
            $timeout(function () {
                if (data){
                    _xml_download_path = data.xml_download_path;
                    _excel_download_path = data.excel_download_path;
                }
            },0)
        },function (error) {
            Modal.alert(error.message,3);
        });
    };
  /*  //获取包参数及逻辑节点列表
    var getLogicNodeAndPackageParam = function (sys_id) {
       Sys.getLogicNodeAndPacParam(sys_id).then(function (data) {
            $timeout(function () {
                $scope.info.temp_prog_data.logic_node_list = data.logical_node_list || [];
            })
        })
    };*/
    var init = function(){
        initProg();
        // getLogicNodeAndPackageParam(_sys_id);
        if(_program_id){
            if(_repeat_flag == 1){
                viewPubProgramInfo(_program_id,true);
            }else {
                viewPubProgramInfo(_program_id,false);
                getProgExportPath(_program_id);
            }
        }
    };
    //判断是否需要改变头部样式
    $scope.judgeFirstPhase = function (index){
        if(index == 0){
            return {
                'padding-top': "12px",
            };
        }else {
            return {
                'padding-top': "0px",
            };
        }
    }
    //下载方案 flag 1 excel 2 xml
    $scope.downloadProgram = function(flag){
        Modal.confirm("确认导出[" + $scope.info.prog.prog_cn_name + "]方案？").then(function(choose){
            if(choose) {
                if(flag == 1){
                    CV.downloadFile(_excel_download_path);
                }else {
                    CV.downloadFile(_xml_download_path);
                }

            }
        });
    };

    //判断关联关系显示
    $scope.judgeRelate = function (arr,index) {
        //relate_flag_line,0,上下无关联关系，1，显示上线，2显示下线
        arr[index].relate_flag_line=0;
        var _relate_flag = arr[index].phase_id;
        if(!_relate_flag) return;
        if(arr[index-1] &&arr[index-1].phase_id && (arr[index-1].phase_type!=arr[index].phase_type)){
            if(arr[index-1].phase_id===_relate_flag){
                arr[index-1].relate_flag_line=1;
                arr[index].relate_flag_line=2;
            }
        }
        if(arr[index+1] && arr[index+1].phase_id && (arr[index+1].phase_type!=arr[index].phase_type)){
            if(arr[index+1].phase_id===_relate_flag){
                arr[index+1].relate_flag_line=2;
                arr[index].relate_flag_line=1;
            }
        }
    };
   /* //协议类型转化中文名
    $scope.getProtocolTypeCnName = function(protocol_type){
        return CV.findValue(protocol_type,ProtocolType).substring(0,5).toLowerCase();
    };*/
/*    //根据节点id查询节点名称
    $scope.getLogicNameById = function (_id) {
        var _logic_node_list = $scope.info.temp_prog_data.logic_node_list;
        for(var i = 0; i < _logic_node_list.length; i++){
            if(_logic_node_list[i].logical_node_id == _id){
                return _logic_node_list[i].logical_node_name;
            }
        }
    };*/
    //得到点下时间
    $scope.getDownTime = function(){
        _down_time=new Date().getTime();
    };
    //模组展开收起操作
    $scope.toggleModulesDetail = function (step,flag,index,group) {
        if(flag == 1){
            var _up_time=new Date().getTime();
            if(_up_time-_down_time>300){
                return;
            }
        }
        step.show_detail = !step.show_detail;
        //控制展开时关联组件不显示
        if(step.relate_flag_line && step.show_detail){
            if(step.relate_flag_line==1){
                group.phase_list[index+1].expand_relate_flag =true;
            }else {
                group.phase_list[index-1].expand_relate_flag =true;
            }
            step.expand_relate_flag =true;
        }
        if(step.relate_flag_line && !step.show_detail){
            if(step.relate_flag_line==1){
                if(!group.phase_list[index+1].show_detail){
                    group.phase_list[index+1].expand_relate_flag =false;
                    step.expand_relate_flag =false;
                }
            }else {
                if(!group.phase_list[index-1].show_detail){
                    group.phase_list[index-1].expand_relate_flag =false;
                    step.expand_relate_flag =false;
                }
            }
        }
        //判断模组是否全部展开或收起
        group.nav_show_flag = CmptFunc.judgeShowDetail(group.phase_list);
        group.expand_flag = (group.nav_show_flag == 2) ? true : false;
        //重新刷新codemirror
        if(step.show_detail){
            $scope.code_refresh = false;
            $timeout(function(){
                $scope.code_refresh = true;
            },10)
        }
    };
    //模组全部展开
    $scope.expandCollapseAll = function (group) {
        group.nav_show_flag = CmptFunc.expandAllModules(group.phase_list);
        //重新刷新codemirror
        if(group.nav_show_flag == 2){
            $scope.code_refresh = false;
            $timeout(function(){
                $scope.code_refresh = true;
            },10)
        }
    };
    //模组全部收起
    $scope.colseCollapseAll = function (group) {
        for(var i=0;i<group.phase_list.length;i++){
            group.phase_list[i].show_detail = false;
            group.phase_list[i].expand_relate_flag = false;     //控制展开时关联组件不显示
        }
        group.nav_show_flag = 0;
    };
    //公共-参数默认值输入框智能提示
    $scope.paramShellLoaded = function(_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };
    //返回参数列表
    $scope.returnProgramList=function(){
        $state.go('sys_config.program_list');
    };
    init();
}]);
//系统-配置--方案新增修改(抽出)
bsCtrl.controller('editProgCtrl',["$scope","$rootScope","$state","$stateParams","$sce", "$location", "$timeout", "$interval", "DirNodeShare", "Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "BsysFunc", "CmptFunc", "NodeType", "OperateSys", "NodeReform", "Modal", "CV", function($scope, $rootScope,$state,$stateParams,$sce, $location, $timeout,$interval, DirNodeShare, Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, BsysFunc, CmptFunc, NodeType, OperateSys, NodeReform, Modal, CV) {
    var _owner_config_list = [];    //自定义配置列表
    //copy数据源
    var _sys_id = $stateParams.sys_id;
    $scope.copy_soc_list = [];
    //分组拖动配置
    $scope.groupSortableOption = {
        update: function (e,ui) {
            $scope.info.program_group.curr_group_index = ui.item.sortable.dropindex;
            $timeout(function () {
                updateListIndex();
            });
        }
    };
    //阶段拖动配置
    $scope.sortableOption = {
        connectWith: ".phase-module",
        update: function (e,ui) {
            $timeout(function () {
                updateListIndex();
            })
        }
    };
    //获取合并参数列表
    var getCombineParamList = function (program,func) {
        //合并参数服务
        program.param_list = $scope.info.temp_prog_data.global_param_list;
        Sys.getCombineParam(program,_sys_id).then(function (data) {
            $timeout(function () {
                //清空列表重刷
                $scope.info.temp_prog_data.global_param_list= data.param_list ? data.param_list : [];
                $scope.info.temp_prog_data.ref_global_list= [];
                $scope.info.temp_prog_data.all_param_name_list=[];
                if(data.param_list){
                    for(var i=0;i<data.param_list.length;i++){
                        var _sub_params=data.param_list[i];
                        if(!_sub_params.param_type){
                            _sub_params.param_type = 1;//默认类型为项目参数
                        }
                        if(!_sub_params.modify_flag){
                            _sub_params.modify_flag = 1;//默认为可修改
                        }
                        _sub_params.param_type_list =ParamType;
                        //将全局参数转换成引用全局参数列表
                        var _sub_ref_param={key:_sub_params.param_name,value:_sub_params.param_name,flag:1};
                        $scope.info.temp_prog_data.ref_global_list.push(_sub_ref_param);
                    }
                }
                $scope.info.temp_prog_data.ref_param_list=$scope.info.temp_prog_data.ref_global_list.concat($scope.info.prog.ref_package_list);
                //获取所有参数名
                $scope.info.temp_prog_data.all_param_name_list = BsysFunc.getAllParam($scope.info.temp_prog_data.global_param_list,$scope.info.prog.pac_type_list);
                BsysFunc.bindRefParam($scope.info.prog.group_list,$scope.info.temp_prog_data.global_param_list,$scope.info.prog.pac_type_list);
                if(func){
                    func()
                }
            },0);
        },function (error) {
            Modal.alert(error.message,3);
        });
    };
    //更新序号
    var updateListIndex = function () {
        var _index=1;
        for(var i=0;i<$scope.info.prog.group_list.length;i++){
            var _group_list= $scope.info.prog.group_list[i];
            if(_group_list.choose_flag){
                $scope.info.program_group.curr_group_index=i;
            }
            for(var j=0;j<_group_list.phase_list.length;j++){
                _group_list.phase_list[j].phase_no= _index++;
            }
        }
    };
    //添加分组编号
    var addGroupNum = function(){
        for(var i = 0;i< $scope.info.prog.group_list.length; i++){
            var _group_list= $scope.info.prog.group_list[i];
            _group_list.group_no = i+1;
        }
    };
    //新增修改重新获取自定义配置的个数
    var getDefineNumber = function(group_list){
        _owner_config_list = [];
        for(var i = 0;i < group_list.length; i++){
            var _group =group_list[i];
            for(var j = 0; j < _group.phase_list.length; j++){
                var _phase = _group.phase_list[j];
                if(_phase.phase_type == 5){
                    _owner_config_list.push(_phase);
                }
            }
        }
    };
    //判断是否需要改变头部样式
    $scope.judgeFirstPhase = function (index){
        if(index == 0){
            return {
                'padding-top': "12px",
            };
        }else {
            return {
                'padding-top': "0px",
            };
        }
    };
    //切换方案类型更新发布包参数列表信息
    $scope.changeProgramType = function (selectKey) {
        if(selectKey == 2){
            $scope.info.temp_prog_data.ref_param_list = $scope.info.temp_prog_data.ref_global_list;
            // $scope.info.prog.pac_type_list = [];
        }
    };
    $scope.changeAddTempStyle = function(flag){
        $scope.control.prog_source = flag;
        $scope.removeProcessTemplateFile();
        if(flag == 2){
            $scope.control.import_loading = false;
            //获取模板上传文件路径
            Cmpt.getCmptFilePath(6).then(function(data){
                $timeout(function(){
                    if(data){
                        $scope.config.process_fileupload.uploadpath  = data.file_path  ? data.file_path:"";
                        var _first_char=$scope.config.process_fileupload.uploadpath.charAt(0);
                        if(_first_char=='/'){
                            $scope.config.process_fileupload.uploadpath= data.file_path.substring(1);
                        }
                        $scope.info.temp_prog_data.file_path = data.file_path  ? data.file_path:"";
                    }
                },0);
            },function(error){
                Modal.alert(error.message,3);
            });
        }
    };
    //分组选择包
    $scope.choosePacOnConditionGroup = function (group) {
        var _pac_list = group.temp_pac_type_list;
        var _file_list = group.temp_config_file_list;
        group.pac_type_list = [];
        group.config_file_list = [];
        for(var i = 0; i < _pac_list.length; i++){
            if(_pac_list[i].state){
                group.pac_type_list.push(_pac_list[i].type_name);
            }
        }
        for(var i = 0; i < _file_list.length; i++){
            if(_file_list[i].state){
                group.config_file_list.push(_file_list[i].file_name);
            }
        }
    };
    //添加分组
    $scope.addNewGroup = function (index,flag) {
        var _group = {
            group_name: '发布阶段'+(index+1),
            choose_flag:true,
            group_type:flag,
            parallel_flag: true,    //分组串并行标志，默认并行
            phase_list: [],
            temp_pac_type_list:angular.copy($scope.info.prog.pac_type_list),
            temp_config_file_list : angular.copy($scope.info.prog.config_file_list)
        };
        for(var i=0;i<$scope.info.prog.group_list.length;i++){
            $scope.info.prog.group_list[i].choose_flag = false;
        }
        $scope.info.prog.group_list.push(_group);
        $scope.info.program_group.curr_group_index = $scope.info.prog.group_list.length-1;
    };
    //删除分组
    $scope.deleteGroup = function (group,index) {
        Modal.confirm("确认删除当前分组?").then(function () {
            var _flag= group.choose_flag;
            for(var i=0;i<group.phase_list.length;i++){
                var _phase = group.phase_list[i];
                if(_phase.phase_type==5){
                    $scope.control.owner_btn_flag=true;
                    _owner_config_list.splice(0,1);
                }
            }
            $scope.info.prog.group_list.splice(index,1);
            updateListIndex();
            if(_flag){
                $scope.info.prog.group_list[0].choose_flag=true;
                $scope.info.program_group.curr_group_index =0;
            }
            getCombineParamList($scope.info.prog);
        })
    };
    //复制当前分组
    $scope.copyCurrGroup = function (_group) {
        Modal.confirm("确认复制当前分组?").then(function () {
            var _new_group = angular.copy(_group);
            _group.choose_flag = false;
            //清空数据源
            for(var i=_new_group.phase_list.length-1;i>=0;i--){
                // _new_group.phase_list[i].node_soc_list=[];
                if(_new_group.phase_list[i].phase_type==5){
                    _new_group.phase_list.splice(i,1);
                }
            }
            $scope.info.prog.group_list.push(_new_group);
            $scope.info.program_group.curr_group_index = $scope.info.prog.group_list.length-1;
            updateListIndex();
        })
    };
    //选中分组
    $scope.chooseCurrGroup = function (_group,index) {
        for(var i=0;i<$scope.info.prog.group_list.length;i++){
            $scope.info.prog.group_list[i].choose_flag = false;
        }
        _group.choose_flag = true;
        $scope.info.program_group.curr_group_index = index;
    };
    //新增组件弹出模态框（1.组件）
    $scope.newAddSubGroup = function(flag){
        var _index = $scope.info.program_group.curr_group_index;
        var _comp_flag = 1;//组件标志（1：发布组件，2：采集组件）
        Modal.cmptEdit(flag,_comp_flag).then(function(compid_list){
            if(flag == 1){
                Cmpt.getCmptGroupDetail(compid_list,true).then(function(data){
                    $timeout(function(){
                        if(data.component_list){
                            //将添加的组件显示到页面
                            for(var i=0;i<data.component_list.length;i++){
                                data.component_list[i].phase_type = 1;
                                data.component_list[i].phase_id = data.component_list[i].id;
                                if(i>0 && data.component_list[i].phase_id== data.component_list[i-1].phase_id){
                                    data.component_list[i].phase_type = 2 ;
                                }
                                data.component_list[i].script_list = data.component_list[i].script_list ? data.component_list[i].script_list :[];
                                for(var j=0;j<data.component_list[i].script_list.length;j++){
                                    data.component_list[i].script_list[j].exec_script= CmptFunc.cmdsToString(data.component_list[i].script_list[j].cmds);
                                    data.component_list[i].script_list[j].script_type_cn = data.component_list[i].script_list[j].script_type =='default' ?'缺省': data.component_list[i].script_list[j].script_type;
                                }
                                if(data.component_list[i].script_list.length!=0){
                                    data.component_list[i].script_type = data.component_list[i].script_list[0].script_type;
                                    data.component_list[i].exec_script = data.component_list[i].script_list[0].exec_script;
                                    data.component_list[i].script = {script_type :data.component_list[i].script_list[0].script_type, cmds: data.component_list[i].script_list[0].cmds};
                                }
                                data.component_list[i].ref_param_list = [];
                                data.component_list[i].type_cn = CV.findValue(data.component_list[i].impl_type,IML_TYPE);
                                data.component_list[i].show_detail = false;
                                data.component_list[i].param_names_list = [];
                                data.component_list[i].logic_node_list = angular.copy($scope.info.temp_prog_data.logic_node_list);
                                if(!data.component_list[i].phase_name){
                                    data.component_list[i].phase_name = data.component_list[i].cn_name;
                                }
                                $scope.info.prog.group_list[_index].phase_list.push(data.component_list[i]);
                                if(data.component_list[i].command){
                                    data.component_list[i].command.exec_script= CmptFunc.cmdsToString(data.component_list[i].command.cmds);
                                }
                            };
                            // $scope.info.prog.group_list[_index].phase_list = BsysFunc.dealPhase($scope.info.prog.group_list[_index].phase_list);
                            getCombineParamList($scope.info.prog);
                            //判断导航条是否显示标志
                            $scope.info.prog.group_list[_index].nav_show_flag = CmptFunc.judgeShowDetail($scope.info.prog.group_list[_index].phase_list);
                            $scope.info.prog.group_list[_index].expand_flag = ($scope.info.prog.group_list[_index].nav_show_flag == 2) ? true : false;
                            //更新序号
                            updateListIndex();
                        }
                    },0);
                },function(error){
                    Modal.alert(error.message,3);
                })
            }else{
                Cmpt.getCmptGroupsDetail(compid_list).then(function(data){
                    $timeout(function(){
                        if(data.component_list){
                            //将添加的组件显示到页面
                            for(var i=0;i<data.component_list.length;i++){
                                data.component_list[i].phase_type = 1;
                                data.component_list[i].phase_id = data.component_list[i].id;
                                if(i>0 && data.component_list[i].phase_id== data.component_list[i-1].phase_id){
                                    data.component_list[i].phase_type = 2 ;
                                }
                                data.component_list[i].script_list = data.component_list[i].script_list ? data.component_list[i].script_list :[];
                                for(var j=0;j<data.component_list[i].script_list.length;j++){
                                    data.component_list[i].script_list[j].exec_script= CmptFunc.cmdsToString(data.component_list[i].script_list[j].cmds);
                                    data.component_list[i].script_list[j].script_type_cn = data.component_list[i].script_list[j].script_type =='default' ?'缺省': data.component_list[i].script_list[j].script_type;
                                }
                                if(data.component_list[i].script_list.length!=0){
                                    data.component_list[i].script_type = data.component_list[i].script_list[0].script_type;
                                    data.component_list[i].exec_script = data.component_list[i].script_list[0].exec_script;
                                    data.component_list[i].script = {script_type :data.component_list[i].script_list[0].script_type, cmds: data.component_list[i].script_list[0].cmds};
                                }
                                data.component_list[i].ref_param_list = [];
                                data.component_list[i].type_cn = CV.findValue(data.component_list[i].impl_type,IML_TYPE);
                                data.component_list[i].show_detail = false;
                                data.component_list[i].param_names_list = [];
                                data.component_list[i].logic_node_list = angular.copy($scope.info.temp_prog_data.logic_node_list);
                                if(!data.component_list[i].phase_name){
                                    data.component_list[i].phase_name = data.component_list[i].cn_name;
                                }
                                $scope.info.prog.group_list[_index].phase_list.push(data.component_list[i]);
                            };
                            // $scope.info.prog.group_list[_index].phase_list = BsysFunc.dealPhase($scope.info.prog.group_list[_index].phase_list);
                            getCombineParamList($scope.info.prog);
                            //判断导航条是否显示标志
                            $scope.info.prog.group_list[_index].nav_show_flag = CmptFunc.judgeShowDetail($scope.info.prog.group_list[_index].phase_list);
                            $scope.info.prog.group_list[_index].expand_flag = ($scope.info.prog.group_list[_index].nav_show_flag == 2) ? true : false;
                            //更新序号
                            updateListIndex();
                        }
                    },0);
                },function(error){
                    Modal.alert(error.message,3);
                })
            }
        });
    };
    //通过脚本类型找到对应脚本
    $scope.selectScriptByScriptType = function (script_type,step) {
        for (var i=0;i<step.script_list.length;i++){
            if(step.script_list[i].script_type == script_type){
                step.exec_script = step.script_list[i].exec_script;
                step.cmds = CmptFunc.stringToCmds(step.exec_script);
                step.script = {script_type :script_type, cmds: step.cmds};
                break;
            }
        }
    };
    //交互式和并行不能同时选择
    $scope.judgeWay = function (step,flag) {
        if(flag == 1){
            if(step.parallel_flag){
                step.interactor_flag = false;
            }
        }else{
            if(step.interactor_flag){
                step.parallel_flag = false;
            }
        }
    };
    //新增脚本弹出模态框
    $scope.showPhase = function(){
        var _index = $scope.info.program_group.curr_group_index;
        Modal.cmptPhaseEdit('','','','',[],$scope.info.temp_prog_data.ref_param_list,'',1,'').then(function(ret){
            ret.type_cn = CV.findValue(ret.impl_type,IML_TYPE);
            ret.show_detail = false;
            ret.phase_type = 3;
            ret.phase_name = ret.cn_name;
            ret.script = {script_type : 'default',cmds : ret.cmds};
            ret.logic_node_list = angular.copy($scope.info.temp_prog_data.logic_node_list);
            $scope.info.prog.group_list[_index].phase_list.push(ret);
            // $scope.info.prog.group_list[_index].phase_list = BsysFunc.dealPhase($scope.info.prog.group_list[_index].phase_list);
            //刷新全局参数列表
            getCombineParamList($scope.info.prog);
            //判断导航条是否显示标志
            $scope.info.prog.group_list[_index].nav_show_flag = CmptFunc.judgeShowDetail($scope.info.prog.group_list[_index].phase_list);
            $scope.info.prog.group_list[_index].expand_flag = ($scope.info.prog.group_list[_index].nav_show_flag == 2) ? true : false;
            updateListIndex();
        });
    };
    //修改脚本
    $scope.modify_phase = function (step,index,group) {
        // step.node_soc_list = step.node_soc_list ? step.node_soc_list : [];
        step.plugin_list = step.plugin_list ? step.plugin_list : [];
        Modal.cmptPhaseEdit(step.phase_name,step.impl_type,step.language_version,step.exec_script,step.plugin_list,$scope.info.temp_prog_data.ref_param_list,step.annex_file,2,step.command).then(function(phase_info){
            if(phase_info){
                phase_info.type_cn = CV.findValue(phase_info.impl_type,IML_TYPE);
                phase_info.show_detail = step.show_detail;
                phase_info.phase_name = phase_info.cn_name;
                phase_info.interactor_flag = step.interactor_flag;
                phase_info.parallel_flag = step.parallel_flag;
                phase_info.logical_node_id = step.logical_node_id;
                phase_info.logical_node = step.logical_node ;
                phase_info.logic_node_list = step.logic_node_list ;
                // phase_info.node_soc_list = phase_info.srv_soc ? phase_info.srv_soc : [];
                phase_info.script = {script_type : 'default',cmds : phase_info.cmds};
                group.phase_list.splice(index,1,phase_info);
                // group.phase_list = BsysFunc.dealPhase(group.phase_list);
                //刷新全局参数列表
                getCombineParamList($scope.info.prog);
                group.nav_show_flag = CmptFunc.judgeShowDetail(group.phase_list);
                group.expand_flag = (group.nav_show_flag == 2) ? true : false;
                updateListIndex();
            }
        });
    };
    //组件转换为脚本
    $scope.convertToPhase = function(step,index,group){
        Modal.confirm("确定要将 [" + step.phase_name + "] 转换为脚本吗？").then(function(choose){
            if(choose){
                var _cn_name = '';
                // step.node_soc_list = step.node_soc_list ? step.node_soc_list : [];
                step.plugin_list = step.plugin_list ? step.plugin_list : [];
                Modal.cmptPhaseEdit(_cn_name,step.impl_type,step.language_version,step.exec_script,step.plugin_list,$scope.info.temp_prog_data.ref_param_list,step.annex_file).then(function(phase_info){
                    if(phase_info){
                        phase_info.type_cn = CV.findValue(phase_info.impl_type,IML_TYPE);
                        phase_info.show_detail = false;
                        phase_info.phase_name = phase_info.cn_name;
                        phase_info.interactor_flag = step.interactor_flag;
                        phase_info.parallel_flag = step.parallel_flag;
                        phase_info.logical_node_id = step.logical_node_id;
                        phase_info.logical_node = step.logical_node ;
                        phase_info.logic_node_list = step.logic_node_list ;
                        // phase_info.node_soc_list = phase_info.srv_soc ? phase_info.srv_soc : [];
                        phase_info.script = {script_type : 'default',cmds : phase_info.cmds};
                        group.phase_list.splice(index,1,phase_info);
                        // group.phase_list = BsysFunc.dealPhase(group.phase_list);
                        //刷新全局参数列表
                        getCombineParamList($scope.info.prog);
                        //判断导航条是否显示标志
                        group.nav_show_flag = CmptFunc.judgeShowDetail(group.phase_list);
                        group.expand_flag = (group.nav_show_flag == 2) ? true : false;
                        updateListIndex();
                    }
                });
            }
        });
    };
    //删除模组列表中的某一项
    $scope.remove_modules_list = function (step,index,group) {
        var _phase_name= step.phase_name ? step.phase_name :"";
        var _comp_type_cn = step.phase_type == 1 || step.phase_type == 2 ? "组件" : "脚本";
        Modal.confirm("确认删除"+ " ["+ _phase_name +"] "+ _comp_type_cn +"?").then(function() {
            if(step.phase_type == 5){
                $scope.control.owner_btn_flag=true;
                _owner_config_list.splice(0,1);
            }
            group.phase_list.splice(index,1);
            updateListIndex();
            //删除某一项后重新刷新全局参数列表刷新全局参数列表
            $scope.info.temp_prog_data.all_param_name_list = BsysFunc.getAllParam($scope.info.temp_prog_data.global_param_list,$scope.info.prog.pac_type_list);
            getCombineParamList($scope.info.prog);
            //判断导航条是否显示标志
            group.nav_show_flag = CmptFunc.judgeShowDetail(group.phase_list);
            group.expand_flag = (group.nav_show_flag == 2) ? true : false;
        });
    };
    //新增模板类型包
    $scope.addPackage = function () {
        if($scope.info.prog.pac_type_list.length !=0){
            for(var i=0;i<$scope.info.prog.pac_type_list.length;i++){
                if(!$scope.info.prog.pac_type_list[i].type_name){
                    Modal.alert("类型包名不能为空",3);
                    return false;
                }
            }
        }
        $scope.info.prog.pac_type_list.push({
            type_name :"",
            type_cn_name:"",
            param_name:"",
            delete_flag : true,
        });
    };
    //手动模板类型包--类型包名输入
    $scope.handPackageNameOnBlur = function (tr,index) {
        if(tr.type_name){
            tr.param_name = tr.type_name;
            //获取所有参数名
            $scope.info.temp_prog_data.all_param_name_list = BsysFunc.getAllParam($scope.info.temp_prog_data.global_param_list,$scope.info.prog.pac_type_list);
            /*flag 表示引用参数来源哪 0 来自模板类型包 1来自全局参数表*/
            $scope.info.prog.ref_package_list[index] = {key:tr.type_name,value:tr.type_name,flag:0};
            $scope.info.temp_prog_data.ref_param_list = $scope.info.temp_prog_data.ref_global_list.concat($scope.info.prog.ref_package_list);
            for(var j=0;j<$scope.info.prog.group_list.length;j++){
                var _group = $scope.info.prog.group_list[j];
                for(var i=0;i<_group.phase_list.length;i++){
                    if(_group.phase_list[i].phase_type==1 || _group.phase_list[i].phase_type==2){
                        if(_group.phase_list[i].ref_param_list.length ==0){
                            _group.phase_list[i].show_ref_param = false;
                        }
                    }
                };
            }
        }
    };
    //删除模板类型包
    $scope.deletePackageType = function (index,tr) {
        var _type_name = tr.type_name ? tr.type_name :"";
        Modal.confirm("确认删除 "+ _type_name +" ?").then(function(){
            $scope.info.prog.pac_type_list.splice(index,1);
            $scope.info.prog.ref_package_list.splice(index,1);
            $scope.info.temp_prog_data.ref_param_list = $scope.info.temp_prog_data.ref_global_list.concat($scope.info.prog.ref_package_list);
        })
    };
    //显示组件参数列表
    $scope.showRefParam = function (step,index) {
        step.show_ref_param = true;
    };
    //选择组件参数名
    $scope.selectCmptParamName = function(param,step,tr,index){
        tr.ref_param_loading =false;
        angular.forEach(step.ref_param_list,function(data){data.param_is_used = false;});
        tr.param_is_used = true;
        if(step.ref_param_list){
            for(var i =0; i< step.ref_param_list.length; i++){
                var _ref_param = step.ref_param_list[i];
                if(!_ref_param.param_is_used && param == _ref_param.param_name){
                    Modal.alert("参数名已存在，请重新配置",3);
                    step.ref_param_list.splice(index,1);
                    tr.param_name = '';
                    return;
                }
            }
        }
        $timeout(function () {
            getCombineParamList($scope.info.prog,function () {
                tr.ref_param_loading=true;
            });
        },400)
    };
    //获取引用参数信息
    $scope.showRefParamDetail = function (ref_name,tr) {
        tr.ref = ref_name;
        tr.ref_param_flag = BsysFunc.judgeRefParam(ref_name,$scope.info.temp_prog_data.global_param_list);
        if(tr.ref_param_flag){
            var _global_list = $scope.info.temp_prog_data.global_param_list;
            tr.param_type = 1;
            for(var i=0;i<_global_list.length;i++){
                if(ref_name == _global_list[i].param_name){
                    tr.param_cn_name = _global_list[i].param_cn_name;
                    tr.ref_index = i;
                }
            };
        }else {
            var _package_type_list = $scope.info.prog.pac_type_list;
            tr.param_type = 2;
            for (var j = 0; j < _package_type_list.length; j++) {
                if (ref_name == _package_type_list[j].type_name) {
                    tr.param_cn_name = _package_type_list[j].type_cn_name;
                    tr.ref_index = j;
                }
            }
        }
        getCombineParamList($scope.info.prog);
    };
    //新增组件阶段引用参数
    $scope.addPhaseRefParam = function (step,index) {
        if(step.ref_param_list.length!=0){
            if (step.ref_param_list[step.ref_param_list.length-1].param_name==''){
                Modal.alert("请完善当前参数表",3);
                return false;
            }
            //参数名不可重复
            if(step.param_list.length ==step.ref_param_list.length){Modal.alert("无可配参数",3); return false}
        }
        step.ref_param_list.push({param_name:"",ref:"",param_cn_name:"",param_bk_desc:"",param_type:1});
    };
    //删除阶段引用参数
    $scope.deleteRefParam = function (step,index,tr) {
        var _param_name = tr.param_name ? tr.param_name : "";
        Modal.confirm("确认删除"+_param_name+"?").then(function() {
            step.ref_param_list.splice(index,1);
            if(step.ref_param_list.length == 0){
                step.show_ref_param = false;
            };
            //获取所有参数名
            $scope.info.temp_prog_data.all_param_name_list = BsysFunc.getAllParam($scope.info.temp_prog_data.global_param_list,$scope.info.prog.pac_type_list);
            getCombineParamList($scope.info.prog);
        });
    };
    //新增手动全局参数
    $scope.addParam = function(){
        if($scope.info.temp_prog_data.global_param_list.length !=0){
            for(var i=0;i<$scope.info.temp_prog_data.global_param_list.length;i++){
                if(!$scope.info.temp_prog_data.global_param_list[i].param_name){
                    Modal.alert("参数名不能为空",3);
                    return false;
                }
            }
        }
        $scope.info.temp_prog_data.global_param_list.push({
            param_name:"",
            param_type:1,
            param_value:"",
            param_cn_name:"",
            param_bk_desc:"",
            modify_flag:1,
            param_type_list:ParamType,
            delete_flag : true,
            hand_param: true
        });
    };
    //删除手动新增的全局参数
    $scope.deleteGlobalParam = function (index,param) {
        var _param_name = param.param_name ? param.param_name :"";
        Modal.confirm("确认删除 "+ _param_name +" ?").then(function(){
            $scope.info.temp_prog_data.global_param_list.splice(index,1);
            $scope.info.temp_prog_data.ref_global_list.splice(index,1);
            $scope.info.temp_prog_data.ref_param_list = $scope.info.temp_prog_data.ref_global_list.concat($scope.info.prog.ref_package_list);
            BsysFunc.bindRefParam($scope.info.prog.group_list,$scope.info.temp_prog_data.global_param_list,$scope.info.prog.pac_type_list);
        });
    };
    //手动全局参数-参数名输入
    $scope.handParamNmaeOnBlur = function(param,index){
        if(param.param_name){
            //获取所有参数名
            $scope.info.temp_prog_data.all_param_name_list = BsysFunc.getAllParam($scope.info.temp_prog_data.global_param_list,$scope.info.prog.pac_type_list);
            /*flag 表示引用参数来源哪 0 来自模板类型包 1来自全局参数表*/
            $scope.info.temp_prog_data.ref_global_list[index] ={key:param.param_name,value:param.param_name,flag:1};
            $scope.info.temp_prog_data.ref_param_list = $scope.info.temp_prog_data.ref_global_list.concat($scope.info.prog.ref_package_list);
            for(var j=0;j< $scope.info.prog.group_list.length;j++){
                var _group=$scope.info.prog.group_list[j];
                for(var i=0;i<_group.phase_list.length;i++){
                    if(_group.phase_list[i].phase_type==1 || _group.phase_list[i].phase_type==2){
                        if(_group.phase_list[i].ref_param_list.length ==0){
                            _group.phase_list[i].show_ref_param = false;
                        }
                    }
                }
            }
        }
    };
    //绑定逻辑节点中文名
    $scope.bindLogicalName = function(selectKey,selectValue,step){
        step.logical_node = {
            logical_node_name : selectValue,
            logical_node_id : selectKey
        }
    };
/*    //配置数据源
    $scope.configSoc = function(imply_type,step){
        Modal.configDataSource(imply_type,$scope.info.prog.business_sys_name,step.node_soc_list,2).then(function(ret){
            var _list = [];
            for(var i=0;i<ret.length;i++){
                ret[i].execute_ip = ret[i].exe_ip;
                ret[i].execute_soc_name = ret[i].exe_soc_name;
                ret[i].execute_protocol_type = ret[i].exe_protocol_type;
                if((imply_type > 2 && imply_type < 6 )||  imply_type == 14 || imply_type == 15 || imply_type == 17){
                    if(ret[i].exe_soc_name && ret[i].ver_soc_name){
                        ret[i].support_soc_name = ret[i].ver_soc_name;
                        ret[i].support_ip       =  ret[i].ver_ip;
                        ret[i].support_protocol_type = ret[i].ver_protocol_type;
                        _list.push(ret[i]);
                    }
                }else{
                    if(ret[i].exe_soc_name){
                        _list.push(ret[i]);
                    }
                }
            }
            step.node_soc_list = _list;
        });
    };
    //copy数据源显示窗
    $scope.copyPhaseSoc = function (step,phases) {
        step.show_copySoc_flag = true;
        step.copy_soc_list = [];
        for(var i=0;i<phases.length;i++){
            for(var j=0;j<phases[i].phase_list.length;j++){
                var _phase=phases[i].phase_list[j];
                if(_phase.node_soc_list.length !=0){
                    if(step.impl_type == _phase.impl_type){
                        step.copy_soc_list.push({phase_name:_phase.phase_name,node_soc_list:_phase.node_soc_list,status:false,phase_type:_phase.phase_type});
                    }
                }
            }
        }
    };
    //选择要copy的数据源
    $scope.chooseCopyPhase = function (phase,copy_soc_list) {
        for(var i=0;i<copy_soc_list.length;i++){
            copy_soc_list[i].status = false;
        }
        phase.status = true;
    };
    //copy数据源弹窗取消
    $scope.cancelCopySoc = function (step) {
        step.show_copySoc_flag = false;
    };
    //copy数据源弹窗确认
    $scope.saveCopySoc = function (step) {
        step.copy_loading = true;
        $timeout(function () {
            for(var i=0;i<step.copy_soc_list.length;i++){
                if(step.copy_soc_list[i].status){
                    step.node_soc_list = angular.copy(step.copy_soc_list[i].node_soc_list);
                }
            }
            step.show_copySoc_flag = false;
            step.copy_loading = false;
        },2000);

    };
    //删除单个数据源
    $scope.deleteSingleSoc = function (index,node_soc_list) {
        Modal.confirm("是否要删除此条数据源?").then(function () {
            node_soc_list.splice(index,1);
        });
    };*/
    //阻止展开收起
    $scope.stopPrevent = function (event) {
        event.stopPropagation();
    };
    //固化配置
    $scope.addCurPhase = function () {
        Modal.addCurPhase($scope.info.prog.business_sys_name,$scope.info.temp_prog_data.logic_node_list).then(function (data) {
            var _index = $scope.info.program_group.curr_group_index;
            var _obj={
                cn_name:'固化配置',
                show_detail:false,
                phase_type:4,
                impl_type:9,
                phase_name:'固化配置',
                logical_node :{
                    logical_node_id: data[0].logical_node_id,
                    logical_node_name: data[0].logical_node_name,
                    file_list : data[0].file_list,
                    files_list: data[0].files_list
                } ,
                // node_soc_list:data
            };
            $scope.info.prog.group_list[_index].phase_list.push(_obj);
            updateListIndex();
        })
    };
    //修改固化配置
    $scope.updateCurPhase = function (step,index,group) {
        var _node_soc_list = [
            {
                logical_node_id : step.logical_node.logical_node_id,
                logical_node_name:step.logical_node.logical_node_name,
                file_list : step.logical_node.file_list ? step.logical_node.file_list : []
            }
        ];
        Modal.addCurPhase($scope.info.prog.business_sys_name,$scope.info.temp_prog_data.logic_node_list,_node_soc_list).then(function (data) {
            step.logical_node.logical_node_id = data[0].logical_node_id;
            step.logical_node.logical_node_name = data[0].logical_node_name;
            step.logical_node.file_list = data[0].file_list;
            step.logical_node.files_list = data[0].files_list;
        })
    };
    //人工阶段
    $scope.manualConfig = function () {
        Modal.addManualPhase().then(function (data) {
            var _index = $scope.info.program_group.curr_group_index;
            var _obj={
                show_detail:false,
                phase_type:6,
                impl_type:10,
                phase_name:'人工阶段',
                script:{cmds:[data]},
                script_fmt:$sce.trustAsHtml(data)
            };
            $scope.info.prog.group_list[_index].phase_list.push(_obj);
            updateListIndex();
        })
    };
    //修改人工阶段
    $scope.updateManuamConfig = function (step,index,group) {
        Modal.addManualPhase(step.script).then(function (data) {
            step.script.cmds[0]=data;
            step.script_fmt =$sce.trustAsHtml(data);
        })
    };
    //自定义
    $scope.defineByOwner = function () {
        getDefineNumber($scope.info.prog.group_list);
        var _index = $scope.info.program_group.curr_group_index;
        var _obj={
            show_detail:false,
            phase_type:5,
            impl_type:9,
            phase_name:'自定义配置',
            config_index:_owner_config_list.length+1,
            script:{cmds:['在项目准备时手工修改配置文件。']}
        };
        _owner_config_list.push(_obj);
        $scope.info.prog.group_list[_index].phase_list.push(_obj);
        $scope.control.owner_btn_flag = false;
        updateListIndex();
    };
    //判断关联关系显示
    $scope.judgeRelate = function (arr,index) {
        //relate_flag_line,0,上下无关联关系，1，显示上线，2显示下线
        arr[index].relate_flag_line=0;
        var _relate_flag = arr[index].phase_id;
        if(!_relate_flag) return;
        if(arr[index-1] &&arr[index-1].phase_id && (arr[index-1].phase_type!=arr[index].phase_type)){
            if(arr[index-1].phase_id===_relate_flag){
                arr[index-1].relate_flag_line=1;
                arr[index].relate_flag_line=2;
            }
        }
        if(arr[index+1] && arr[index+1].phase_id && (arr[index+1].phase_type!=arr[index].phase_type)){
            if(arr[index+1].phase_id===_relate_flag){
                arr[index+1].relate_flag_line=2;
                arr[index].relate_flag_line=1;
            }
        }
    };
    //批量操作
    $scope.programBatchConfig = function () {
        Modal.programBacthConfig($scope.info.prog.group_list,$scope.info.prog.business_sys_name,$scope.control).then(function (data) {
            $scope.info.prog.group_list = data;
            updateListIndex();
        })
    };
    //保存方案信息
    $scope.saveProgramAllInfo = function () {
        //获取所有参数名
        $scope.info.temp_prog_data.all_param_name_list = BsysFunc.getAllParam($scope.info.temp_prog_data.global_param_list,$scope.info.prog.pac_type_list);
        //验证方案表单
        if(!CV.valiForm($scope.info.prog_form)) {
            return false;
        }
        if($scope.config.process_fileupload.filename){
            for(var m =0 ;m<$scope.info.prog.group_list.length;m++){
                var _group = $scope.info.prog.group_list[m];
                if(_group.phase_list){
                    for(var n=0;n<_group.phase_list.length;n++){
                        var _phase = _group.phase_list[n];
                        if(_phase.phase_type == 4){
                            if(_phase.logical_node){
                                for(var l =0 ;l<_phase.logical_node.files_list.length;l++){
                                    var _file = _phase.logical_node.files_list[l];
                                    if(!_file.ready_flag){
                                        Modal.alert('配置文件未就绪！请重新选择！',3);
                                        return false
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        $scope.control.submit_loading = true;
        addGroupNum();
        if($scope.info.prog.is_update){
            $scope.info.prog.param_list = $scope.info.temp_prog_data.global_param_list;
            //修改方案服务
            Sys.updateProgram($scope.info.prog).then(function(data){
                $timeout(function() {
                    Modal.alert("修改成功",2);
                    $scope.control.submit_loading = false;
                    $state.go('sys_config.program_list');
                    $('body,html').animate({scrollTop:0},100);
                }, 0);
            },function(error){
                Modal.alert(error.message,3);
                $scope.control.submit_loading = false;
            });
        }else{
            //保存方案服务
            $scope.info.prog.param_list = $scope.info.temp_prog_data.global_param_list;
            Sys.addProgram($scope.info.prog,$scope.info.prog.business_sys_name).then(function(data){
                $timeout(function() {
                    Modal.alert("保存成功",2);
                    $scope.control.submit_loading = false;
                    $state.go('sys_config.program_list');
                    $('body,html').animate({scrollTop:0},100);
                }, 0);
            },function(error){
                Modal.alert(error.message,3);
                $scope.control.submit_loading = false;
            });
        }
    };
    //设置颜色
    $scope.setColor = function (param) {
        var _name = "config_index"+param;
        if($scope.info.prog_form[_name].$invalid){
            return {
                'border-color':'rgb(233, 65, 110)'
            }
        }
    };
}]);
//系统-配置-日志列表
bsCtrl.controller('sysLogListCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare", "Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal","LogFormat","logCharacterEncod","logWrapStyle","logTimeStampType","LogType","logDateFormat","logTimeFormat","newLogDateStampType","newLogTimeStampType", "pluginExeEnv", "LanguageName", "operateSysBit", "envManage", "pluginLibType", "CV", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare, Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal,LogFormat,logCharacterEncod,logWrapStyle,logTimeStampType,LogType,logDateFormat,logTimeFormat,newLogDateStampType,newLogTimeStampType, pluginExeEnv, LanguageName, operateSysBit, envManage, pluginLibType,CV) {
    var _sys_id = $stateParams.sys_id;   //系统id
    var _inspect_flag = 0;               //基本信息(0:全部日志1：只有日期的日志)
    //改变文件大小单位显示
    var changeFileCompany = function(file_list){
        var _log_size = {
         size : 0,
         size_str : '',
        };
         _log_size.size = 0;
        for(var i = 0;i < file_list.length;i++){
            var _one_syn = file_list[i];
            _log_size.size=_log_size.size+parseInt(_one_syn.file_length);
        };
        if(_log_size.size==0){
            _log_size.size=0;
            _log_size.size_str="0M"
        }else{
            if(_log_size.size<1024){
                _log_size.size_str=_log_size+"b";
            }else if(_log_size.size>1024){
                if(_log_size.size < 1048576){
                    _log_size.size_str = Math.floor(_log_size.size / (1024)) + "kb"
                }else{
                    _log_size.size_str = Math.floor(_log_size.size / (1024 * 1024)) + "M"
                }
            }
        }
        return _log_size;
    };
    //得到所有的日志
    var getLogList = function(){
        $timeout(function(){
            Sys.getAllLogList(_sys_id,_inspect_flag).then(function (data) {
                $timeout(function () {
                    if(data){
                        $scope.data.logs = data.logBeanList ? data.logBeanList : [];
                        angular.forEach($scope.data.logs,function(one_log){
                            one_log.log_type_cn=CV.findValue(one_log.log_type,LogType);
                            if(one_log.logSyncInfos){
                                var _size_obj=changeFileCompany(one_log.logSyncInfos);
                                one_log.size=_size_obj.size;
                                one_log.size_str=_size_obj.size_str;
                            }else{
                                one_log.size=0;
                                one_log.size_str=0+"M";
                            }
                        })
                    }
                },0);
            });
        },100);
    };
    var init = function(){
        $scope.data = {
            logs:[],              //日志列表
            node_ip_list:[],      //节点列表
            log_sort : LogType,   //日志分类列表
        };
        getLogList();
    };
    //开启/停止日志拉取
    $scope.startLog = function(index){
        var _tem_log=$scope.data.logs[index];
        if(_tem_log.log_configs[0]){
            if(_tem_log.log_configs[0].pull_flag ==0){
                //开始
                Sys.startTimePull(_tem_log.sys_name,_tem_log.log_name,_tem_log.log_id).then(function (data) {
                    $timeout(function () {
                        if (data){
                            Modal.alert("启动定时日志获取",2);
                            getLogList();
                        }
                    },0)
                },function (error) {
                    Modal.alert(error.message);
                });
            }else if(_tem_log.log_configs[0].pull_flag ==1){
                //停止
                Sys.stopTimePull(_tem_log.sys_name,_tem_log.log_name,_tem_log.log_id).then(function (data) {
                    $timeout(function () {
                        if (data){
                            Modal.alert("关闭定时日志获取",2);
                            getLogList();
                        }
                    },0)
                },function (error) {
                    Modal.alert(error.message,3);
                });
            }
        }
    };
    //日志删除
    $scope.deleteCurrentLog = function(log_name,log_id){
        Modal.confirm("是否确定删除日志?").then(function () {
            Sys.deleteLog(_sys_id,log_name,log_id).then(function (data) {
                $timeout(function () {
                    if (data){
                        Modal.alert("删除成功",2);
                        getLogList();
                    }
                },0)
            },function (error) {
                Modal.alert(error.message,3);
            });
        });

    };
    //跳转其他日志页面 status:1新增 2: 修改 3：查看
    $scope.judgeOtherLog = function(status,log){
        if(status == 1){    //新增
            $state.go("sys_config.log_tab",{log_id:"",modify_type:1,log_name:""});
        }
        if(status == 2){   //修改
            $state.go("sys_config.log_tab",{log_id:log.log_id,log_name:log.log_name,modify_type:2});
        }
        if(status == 3){   //查看
            $state.go("sys_config.log_tab",{log_id:log.log_id,log_name:log.log_name,modify_type:3});
        }
    };
    init();
}]);
//系统-配置-日志配置
bsCtrl.controller('logTabCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare", "Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal","LogFormat","logCharacterEncod","logWrapStyle","logTimeStampType","LogType","logDateFormat","logTimeFormat","newLogDateStampType","newLogTimeStampType", "pluginExeEnv", "LanguageName", "operateSysBit", "envManage", "pluginLibType", "CV", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare, Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal,LogFormat,logCharacterEncod,logWrapStyle,logTimeStampType,LogType,logDateFormat,logTimeFormat,newLogDateStampType,newLogTimeStampType, pluginExeEnv, LanguageName, operateSysBit, envManage, pluginLibType,CV) {
    var _inspect_flag = 0;                                                //基本信息(0:全部日志1：只有日期的日志)
    var _modify_type = $stateParams.modify_type;                          //修改类型1.新增 2：修改3：查看
    var _sys_id = $stateParams.sys_id;                                    //系统id
    var _log_id = $stateParams.log_id ? $stateParams.log_id : "";         //传入的日志id
    var _log_name = $stateParams.log_name ? $stateParams.log_name : "";   //日志中文名
    //数据集合
    $scope.data = {
        logs : []     //节点列表
    };
    $scope.config={
        tem_logs:[],  //临时日志文件列表
    };
    //控制对象
    $scope.control = {
        modify_type : _modify_type      //修改类型
    };
    //修改高亮属性
    var changeHighClass = function(list,log_id){
        if(log_id){
            for(var i = 0;i < list.length;i++){
                var _cur_node = list[i];
                if(_cur_node.log_id == log_id){
                    _cur_node.active = true;
                }else{
                    _cur_node.active = false;
                }
            }
        }else{
            for(var j = 0;j < list.length;j++){
                var _node = list[j];
                _node.active = false;
            }
        }
        return list;
    };
    //得到节点列表
    var getLogList = function(sys_id){
        Sys.getAllLogList(sys_id,_inspect_flag).then(function (data) {
            $timeout(function () {
                if(data){
                    $scope.data.logs = data.logBeanList ? data.logBeanList : [];
                    $scope.config.tem_logs = data.logBeanList ? data.logBeanList : [];
                    angular.forEach($scope.data.logs,function(one_log){
                        one_log.log_type_cn=CV.findValue(one_log.log_type,LogType);
                        if(one_log.logSyncInfos){
                            var _size=0;
                            for(var i=0;i<one_log.logSyncInfos.length;i++){
                                var _one_syn=one_log.logSyncInfos[i];
                                _size=_size+parseInt(_one_syn.file_length);
                            }
                            if(_size==0){
                                one_log.size=0;
                                one_log.size_str="0M"
                            }else{
                                if(_size<1024){
                                    one_log.size_str=_size+"b";
                                }else if(_size>1024){
                                    if(_size < 1048576){
                                        one_log.size_str = Math.floor(_size / (1024)) + "kb"
                                    }else{
                                        one_log.size_str = Math.floor(_size / (1024 * 1024)) + "M"
                                    }
                                }
                            }
                        }else{
                            one_log.size=0;
                            one_log.size_str=0+"M"
                        }
                    });
                    if(_log_id){
                        $scope.data.logs = changeHighClass($scope.data.logs,_log_id);
                    }
                    if(_modify_type == 1 && !_log_id){  //新增进去
                        $state.go("sys_config.log_tab.log_add_modify",{judge_id:"",judge_name:"",judge_modify:1});
                    }else if(_modify_type == 2 && _log_id){  //修改进去
                        $state.go("sys_config.log_tab.log_add_modify",{judge_id:_log_id,judge_name:_log_name,judge_modify:2});
                    }else if(_modify_type == 3 && _log_id){  //查看进去
                        $state.go("sys_config.log_tab.log_detail",{judge_id:_log_id,judge_name:_log_name,judge_modify:3});
                    }
                }
            },0);
        });
    };
    var init = function(){
        getLogList(_sys_id);
    };
    //切换其他节点
    $scope.changeCurLog = function(from_flag,log){
        if(log){
            $scope.data.logs=changeHighClass($scope.data.logs,log.log_id);
        }else{
            $scope.data.logs=changeHighClass($scope.data.logs);
        }
        if(!log && from_flag == 1){  //新增进入,点击新增
            $state.go("sys_config.log_tab.log_add_modify",{judge_id:"",judge_name:'',judge_modify:1});
        }
        if(log && from_flag == 1){  //新增进入，点击修改
            $state.go("sys_config.log_tab.log_add_modify",{judge_id:log.log_id,judge_name:log.log_name,judge_modify:2});
        }
        if(!log && from_flag == 2){  //修改进入，点击新增
            $state.go("sys_config.log_tab.log_add_modify",{judge_id:log.log_id,judge_name:log.log_name,judge_modify:1});
        }
        if(log && from_flag == 2){  //修改进入，点击修改
            $state.go("sys_config.log_tab.log_add_modify",{judge_id:log.log_id,judge_name:log.log_name,judge_modify:2});
        }
        if(log && from_flag == 3){  //查看进入，点击查看
            $state.go("sys_config.log_tab.log_detail",{judge_id:log.log_id,judge_name:log.log_name,judge_modify:3});
        }
    };
    init();
}]);
//系统-配置-日志配置-新增-修改
bsCtrl.controller('logTabAddOrModifyCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare", "Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal","LogFormat","logCharacterEncod","logWrapStyle","logTimeStampType","LogType","logDateFormat","logTimeFormat","newLogDateStampType","newLogTimeStampType", "pluginExeEnv", "LanguageName", "operateSysBit", "envManage", "pluginLibType","ScrollConfig", "CV", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare, Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal,LogFormat,logCharacterEncod,logWrapStyle,logTimeStampType,LogType,logDateFormat,logTimeFormat,newLogDateStampType,newLogTimeStampType, pluginExeEnv, LanguageName, operateSysBit, envManage, pluginLibType,ScrollConfig,CV) {
    var _pull_flag = 0;                                                 //是否拉取标志
    var _sys_id = $stateParams.sys_id;                                  //系统id
    var _log_id = $stateParams.judge_id ? $stateParams.judge_id : "";   //日志id
    //对象
    $scope.info = {
        log : {                     //日志对象
            log_configs : [],       //日志配置列表
            keywords : [],          //关键字列表
            log_pick_info : {},     //定时获取对象
        },
        log_form:{}                 //页面表单对象
    };
    //数据集合
    $scope.data = {
        node_ip_list : [],                        //节点列表
        log_sort_list : LogType,                  //日志分类列表
        log_encod_list : logCharacterEncod,       //日志字符编码列表
        data_format_list : newLogDateStampType,   //日期格式
        time_format_list : newLogTimeStampType,    //时间格式
        scroll_list:ScrollConfig
    };
    //控制对象
    $scope.control = {
        judge_path_flag:false,     //判断路径是否验证过
        log_save_loading:false      //保存loading
    };
    //改变显示类型
    var changeFileCompany = function(file_list){
        var _log_size = {
            size : 0,
            size_str : '',
        };
        _log_size.size = 0;
        for(var i = 0;i < file_list.length;i++){
            var _one_syn = file_list[i];
            _log_size.size=_log_size.size+parseInt(_one_syn.file_length);
        };
        if(_log_size.size==0){
            _log_size.size=0;
            _log_size.size_str="0M"
        }else{
            if(_log_size.size<1024){
                _log_size.size_str=_log_size+"b";
            }else if(_log_size.size>1024){
                if(_log_size.size < 1048576){
                    _log_size.size_str = Math.floor(_log_size.size / (1024)) + "kb"
                }else{
                    _log_size.size_str = Math.floor(_log_size.size / (1024 * 1024)) + "M"
                }
            }
        }
        return _log_size;
    };
    //根据日志id得到日志信息
    var getLogInfoByid = function(list,log_id){
        var curr_log = {};
        for(var i = 0;i < list.length;i++){
            var _log = list[i];
            if(_log.log_id == log_id){
                curr_log = _log;
                break;
            }
        };
        if(curr_log.log_configs){
            var  _one = curr_log.log_configs[0];
            var _tem_time = _one.pull_timing_str;
            var _tem_list = [];
            _tem_list = _tem_time.split(":");
            curr_log.log_pick_info = {};
            curr_log.log_pick_info.start_hour = _tem_list[0];
            curr_log.log_pick_info.start_minutes = _tem_list[1];
            curr_log.log_pick_info.start_second = _tem_list[2];
            curr_log.log_file_express = _one.log_file_name_exp;
            curr_log.pull_timing_str = _one.pull_timing_str;
            _pull_flag = _one.pull_flag ? _one.pull_flag :0;
        }
        //配置时间
        var _temp_time = formatLogTimeAndDate(1,curr_log);
        //根据返回的时间格式匹配时间
        if(_temp_time.indexOf('(') == -1){
            curr_log.timestamp_exp_show = _temp_time;
        }else{
            var _start = _temp_time.indexOf("(");
            var _end = _temp_time.indexOf(")");
            curr_log.timestamp_exp_show = _temp_time.substring(0,_start);
            curr_log.timestamp_show_title = _temp_time.substring(_start+1,_end);
        };
        //配置时间
        var _temp_date = formatLogTimeAndDate(2,curr_log);
        //根据返回的时间格式匹配时间
        if(_temp_date.indexOf('(')==-1){
            curr_log.date_exp_show = _temp_date;
        }else{
            var _start_time = _temp_date.indexOf("(");
            var _end_time = _temp_date.indexOf(")");
            curr_log.date_exp_show = _temp_date.substring(0,_start_time);
            curr_log.date_show_title = _temp_date.substring(_start_time+1,_end_time);
        }
        //如果是修改
        if(curr_log.log_name){
            curr_log.modify = true;
        }
        $scope.info.log = angular.copy(curr_log);
        $scope.info.log.keywords = curr_log.keywords ? curr_log.keywords :[];
    };
    //得到所有的日志
    var getLogList = function(){
        $timeout(function(){
            Sys.getAllLogList(_sys_id,0).then(function (data) {
                $timeout(function () {
                    if(data){
                        $scope.config.tem_logs = data.logBeanList ? data.logBeanList : [];
                        angular.forEach($scope.data.logs,function(one_log){
                            one_log.log_type_cn=CV.findValue(one_log.log_type,LogType);
                            if(one_log.logSyncInfos){
                                var _size_obj=changeFileCompany(one_log.logSyncInfos);
                                one_log.size=_size_obj.size;
                                one_log.size_str=_size_obj.size_str;
                            }else{
                                one_log.size=0;
                                one_log.size_str=0+"M";
                            }
                        })
                        getLogInfoByid($scope.config.tem_logs,_log_id);
                    }
                },0);
            });
        },100);
    };
    //规范日志的日期时间(falg:1.时间2.日期)
    var formatLogTimeAndDate = function(flag,curr_log){
        //规范日期
        var format_sec = "";
        if(flag == 1){
            if(equalKey(curr_log.timestamp_exp,$scope.data.time_format_list)){
                format_sec = CV.findValue(curr_log.timestamp_exp,$scope.data.time_format_list);
            }else{
                format_sec = curr_log.timestamp_exp;
            }
        }else if(flag == 2){
            if(equalKey(curr_log.date_exp,$scope.data.data_format_list)){
                format_sec = CV.findValue(curr_log.date_exp,$scope.data.data_format_list);
            }else{
                format_sec = curr_log.date_exp;
            }
        }
        return format_sec;
    };
    //隐藏选择区域
    var showAndHideByClass = function(class_name,class_tar,e){
        //flag==1显示，flag==2隐藏
        var _class = "."+class_name;
        var _class_tar = "."+class_tar;
        var _first = $(_class);
        if(_first.is(e.target) || _first.has(e.target).length != 0 ){ // Mark 1
            $(_class_tar).removeClass('show-none').addClass('show-block');
            return false;
        }
        var _con = $(_class_tar);   // 设置目标区域
        if(!_con.is(e.target) && _con.has(e.target).length === 0){ // Mark 1
            $(_class_tar).removeClass('show-block').addClass('show-none')
        }
    };
    //匹配枚举key
    var equalKey = function(one_satmp,list){
        var _flag = false;
        for(var i = 0;i < list.length;i++){
            var _one = list[i];
            if(one_satmp ==_one.key){
                _flag = true;
                break;
            }
        }
        return _flag;
    };
    //匹配字符
    var equalIsInStamp = function(one_satmp,list){
        var _flag = false;
        for(var i=0;i<list.length;i++){
            var _one = list[i];
            var _tem_value = _one.value.substring(0,_one.value.indexOf('('));
            if(one_satmp ==_tem_value){
                _flag = true;
                break;
            }
        }
        return _flag;
    };
    //判断对象,将对象元素转换成字符串以作比较
    var obj2key = function(obj, keys){
        var n = keys.length,
            key = [];
        while(n--){
            key.push(obj[keys[n]]);
        }
        return key.join('|');
    };
    //去重操作
    var judgeIsEqualObj = function(array,keys){
        var _equal = true;
        var arr = [];
        var hash = {};
        for (var i = 0, j = array.length; i < j; i++) {
            var k = obj2key(array[i], keys);
            if (!(k in hash)) {
                hash[k] = true;
                arr .push(array[i]);
            }
        }
        if(array.length != arr.length){
            _equal = false;
        }
        return _equal ;
    }
    //将单个字符串改为两个
    var changeOneChartToTwo = function(time){
        var _tem_time = "";
        if(time.length == 0){
            _tem_time = "";
        }else if(time.length == 1){
            _tem_time = "0"+time;
        }else if(time.length == 2){
            _tem_time = time;
        }
        return _tem_time;
    };
    var init = function(){
        if(_log_id){
            if(!$scope.config.tem_logs || $scope.config.tem_logs.length == 0){
                getLogList();
            }else{
                getLogInfoByid($scope.config.tem_logs,_log_id);
            }
        }else{
            $scope.info = {
                log : {
                    log_configs:[],
                    keywords:[],
                    log_pick_info:{},
                }
            };
        }
        NodeReform.getNodeByBusi(_sys_id).then(function (data) {
            $timeout(function () {
                if(data){
                    $scope.data.node_ip_list = [];
                    var _node_list = data.node_msg_list ? data.node_msg_list:[];
                    for(var i = 0;i < _node_list.length;i++){
                        var _one_node = _node_list[i];
                        var input_node = {
                            node_ip : _one_node.soc_ip,
                            node_name : _one_node.node_name
                        };
                        $scope.data.node_ip_list.push(input_node);
                    }
                }
            },0)
        });
    };
    //验证是否存在路径
    $scope.judgePath = function(tr){
        if(!tr.node_ip){
            Modal.alert("请输入ip",3);
            return false;
        }else if(!tr.soc_name){
            Modal.alert("请输入数据源",3);
            return false;
        }else if(!tr.log_file_path){
            Modal.alert("请输入存储路径",3);
            return false;
        }else{
            var _node_name;
            for(var i = 0;i < $scope.data.node_ip_list.length;i++){
                var _one = $scope.data.node_ip_list[i];
                if(tr.node_ip == _one.node_ip){
                    _node_name = _one.node_name;
                    break;
                }
            }
            $timeout(function(){
                Sys.judgePathIsExist(tr.soc_name,_node_name,tr.log_file_path).then(function (data) {
                    if(data.error_msg){
                        tr.no_save_flag = true;
                        Modal.alert(data.error_msg,3);
                        $scope.control.judge_path_flag = true;
                        return false;
                    }else{
                        tr.no_save_flag = false;
                        $scope.control.judge_path_flag = true;
                    }
                },function (error) {
                    Modal.alert(error.message,3);
                    $scope.control.judge_path_flag = true;
                });
            },500)
        }
    };
    //判断是否存在相同的日志名
    $scope.judgeLogName = function(cur_log){
        if(!cur_log.log_name){
            return false;
        }
        Sys.judgeLogNameIsExist(cur_log,_sys_id).then(function (data) {
            $timeout(function () {
                if (!data.valid){
                    Modal.alert("日志名已经存在,请重新填写",3);
                    //日志名存在标志
                    cur_log.name_exist=true;
                }else{
                    cur_log.name_exist=false;
                }
            },0)
        },function (error) {
            Modal.alert(error.message,3);
        });
    };
    //添加关键字
    $scope.addKeyWord = function(){
        var _log_name = $scope.info.log.log_name ? angular.copy($scope.info.log.log_name) : '';
        var _oneKey = {
            sys_name:_sys_id,
            log_name:_log_name,
            keyword_name:'',
            keyword_exp:'',
        };
        $scope.info.log.keywords.push(_oneKey);
    };
    //删除关键字
    $scope.deleteKeyWord = function(index){
        $scope.info.log.keywords.splice(index,1);
    };
    //选择日期
    $scope.chooseCurDateFormat = function(one,cur_log){
        cur_log.date_exp = one.key;
        //截取提示
        var _start = one.value.indexOf("(");
        var _end = one.value.indexOf(")");
        cur_log.date_exp_show = one.value.substring(0,_start);
        cur_log.date_show_title = one.value.substring(_start+1,_end);
        $(".target-log-choose").removeClass('show-block').addClass('show-none')
    };
    //选择时间
    $scope.chooseCurTimeFormat = function(one,cur_log){
        cur_log.timestamp_exp = one.key;
        cur_log.timestamp_exp_show = one.value;
        //截取提示
        var _start = one.value.indexOf("(");
        var _end = one.value.indexOf(")");
        cur_log.timestamp_exp_show = one.value.substring(0,_start);
        cur_log.timestamp_show_title = one.value.substring(_start+1,_end);
        $(".target-second-log-choose").removeClass('show-block').addClass('show-none')
    };
    //修改时间或者日期是否改变提示flag:1:日期2：时间
    $scope.showPrompt = function(cur_log,flag){
        if(flag==1){
            if(cur_log.date_exp_show){
                if(cur_log.date_exp_show.indexOf("(") == -1){
                    cur_log.date_show_title = "";
                }
            }
        }else{
            if(cur_log.timestamp_exp_show){
                if(cur_log.timestamp_exp_show.indexOf("(") == -1){
                    cur_log.timestamp_show_title = "";
                }
            }
        }
    };
    //时间间隔鼠标移出事件
    $scope.timeInputBlur = function(time_str,time_flag,total_time){
        var _time_cn_name = time_flag == 1 ? '开始时间小时' : time_flag == 2 ? '开始时间分钟': time_flag == 3 ? '开始时间秒' : '';
        if(!time_str){
            $scope.info.log.log_pick_info.show_img = _time_cn_name + '不能为空';
            return false;
        }
        var _count;
        _count=parseInt(time_str);
        if(time_flag == 1){
            if(_count > 24){
                $scope.info.log.log_pick_info.show_img = _time_cn_name + '超过24小时';
                return false;
            }
        }else if(time_flag == 2){
            if(_count>60){
                $scope.info.log.log_pick_info.show_img = _time_cn_name + '超过60分钟';
                return false;
            }
        }else if(time_flag == 3){
            if(_count>60){
                $scope.info.log.log_pick_info.show_img = _time_cn_name + '超过60秒钟';
                return false;
            }
        }
        if(total_time.start_hour && total_time.start_minutes && total_time.start_second){
            var _start_hour_count = parseInt(total_time.start_hour);
            var _start_minutes_count = parseInt(total_time.start_minutes);
            var _start_second_count = parseInt(total_time.start_second);
            if(_start_hour_count>24 || _start_minutes_count>60 || _start_second_count>60){
                $scope.info.log.log_pick_info.show_img = '时间输入不合法';
                return false;
            }

        }
        $scope.info.log.log_pick_info.show_img = "";
    };
    $scope.saveLog = function(){
        if(!$scope.info.log.log_pick_info.start_hour || !$scope.info.log.log_pick_info.start_minutes || !$scope.info.log.log_pick_info.start_second){
            $scope.info.log.log_pick_info.show_img="请完善定时获取信息";
        }
        if(!CV.valiForm($scope.info.log_form)) {
            return false;
        };
        if(!$scope.info.log.log_pick_info.start_hour || !$scope.info.log.log_pick_info.start_minutes || !$scope.info.log.log_pick_info.start_second){
            $scope.info.log.log_pick_info.show_img="请完善定时获取信息";
            return false;
        }else if(parseInt($scope.info.log.log_pick_info.start_hour) > 24 ||parseInt($scope.info.log.log_pick_info._start_minutes_count) > 60 ||parseInt($scope.info.log.log_pick_info._start_second_count) > 60){
            $scope.info.log.log_pick_info.show_img = '时间输入不合法';
            return false;
        }
        if($scope.info.log.name_exist){
            Modal.alert("日志名已经存在,请重新填写",3);
            return false;
        }
        if($scope.info.log.log_configs.length == 0){
            Modal.alert("请完善日志来源信息",3);
            return false;
        }
        //保存日志
        if($scope.info.log.log_configs.length > 0){
            var _is_equal = judgeIsEqualObj($scope.info.log.log_configs,
                ['node_ip','soc_name','log_file_path']);
            var _is_save = true;
            for(var m = 0;m < $scope.info.log.log_configs.length;m++){
                if($scope.info.log.log_configs[m].no_save_flag){
                    _is_save = false;
                    break;
                }
            }
            if(!$scope.control.judge_path_flag){
                Modal.alert("请等待验证路径是否存在",3);
                return false;
            }
            if(!_is_save){
                Modal.alert("存在日志存储路径不存在,请修改后保存",3);
                return false;
            }
            if(!_is_equal){
                Modal.alert("日志来源信息不可以重复",3);
                return false;
            }
            var _file_name_exp = $scope.info.log.log_file_express ? $scope.info.log.log_file_express :'';
            var _pull_timing_str = changeOneChartToTwo($scope.info.log.log_pick_info.start_hour)+":"+changeOneChartToTwo($scope.info.log.log_pick_info.start_minutes)+":"+changeOneChartToTwo($scope.info.log.log_pick_info.start_second);
            for(var i = 0;i < $scope.info.log.log_configs.length;i++){
                var _one_curr = $scope.info.log.log_configs[i];
                _one_curr.pull_timing_str = _pull_timing_str;
                _one_curr.log_file_name_exp = _file_name_exp;
            }
        }
        $scope.control.log_save_loading = true;
        //规范日期
        var _date_format_sec = "";
        var _time_format_sec = "";
        if($scope.info.log.date_exp_show){
            if(equalIsInStamp($scope.info.log.date_exp_show,$scope.data.data_format_list)){
                _date_format_sec = $scope.info.log.date_exp;
            }else{
                _date_format_sec = $scope.info.log.date_exp_show
            }
        }
        if($scope.info.log.timestamp_exp_show){
            if(equalIsInStamp($scope.info.log.timestamp_exp_show,$scope.data.time_format_list)){
                _time_format_sec = $scope.info.log.timestamp_exp;
            }else{
                _time_format_sec = $scope.info.log.timestamp_exp_show
            }
        }
        var _curr_submit = angular.copy($scope.info.log);
        _curr_submit.date_exp = _date_format_sec;
        _curr_submit.timestamp_exp = _time_format_sec;
        Sys.saveLogBaseMessage(_curr_submit,_sys_id).then(function(data){
            $scope.control.log_save_loading = false;
            _pull_flag = 0;
            Modal.alert("保存成功",2);
            $scope.returnLogList();
        },function(error){
            $scope.control.log_save_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //根据ip得到数据源
    $scope.getSocByip = function(selectKey,tr){
        for(var i = 0;i < $scope.data.node_ip_list.length;i++){
            var _one = $scope.data.node_ip_list[i];
            if(tr.node_ip == _one.node_ip){
                tr.node_name = _one.node_name
            }
        }
        Sys.getSocListByIpAndBsys(_sys_id,tr.node_ip,1).then(function (data) {
            $timeout(function () {
                if (data){
                    var _tem_list = [];
                    var _total_list = data.source_list ? data.source_list: [];
                    for(var i = 0;i < _total_list.length;i++){
                        var _one = _total_list[i];
                        _tem_list.push(_one.soc_name);
                    }
                    tr.exe_soc_list = _tem_list;
                }
            },0)
        },function (error) {
            Modal.alert(error.message,3);
        });
    };
    //删除存储路径
    $scope.deleteLogPath = function(tr,index){
        $scope.info.log.log_configs.splice(index,1);
    };
    //新增日志来源
    $scope.addLogSource = function(){
        var _log_name = $scope.info.log.log_name ? angular.copy($scope.info.log.log_name) : '';
        var second_pull_flag = angular.copy(_pull_flag) ? angular.copy(_pull_flag) : 0;
        var _log_save = {
            sys_name:_sys_id,
            log_name:_log_name,
            ip:'',
            node_name:'',
            log_file_path:'',
            soc_name:'',
            pull_flag:second_pull_flag ? second_pull_flag : 0,
        }
        $scope.info.log.log_configs.push(_log_save);
    };
    //修改日志来源状态
    $scope.changeSourceFlag = function(){
        $scope.control.judge_path_flag = false;
    };
    //返回日志列表
    $scope.returnLogList = function(){
        $state.go('sys_config.log_list');
    };
    init();
    //用来显示隐藏不同的内容
    $(document).mouseup(function(e){
        showAndHideByClass('first-span-choose','target-log-choose',e);
        showAndHideByClass('second-span-choose','target-second-log-choose',e);
    });
}]);
//系统-配置-日志配置-查看
bsCtrl.controller('logTabDetailCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare", "Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal","LogFormat","logCharacterEncod","logWrapStyle","logTimeStampType","LogType","logDateFormat","logTimeFormat","newLogDateStampType","newLogTimeStampType", "pluginExeEnv", "LanguageName", "operateSysBit", "envManage", "pluginLibType", "CV", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare, Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal,LogFormat,logCharacterEncod,logWrapStyle,logTimeStampType,LogType,logDateFormat,logTimeFormat,newLogDateStampType,newLogTimeStampType, pluginExeEnv, LanguageName, operateSysBit, envManage, pluginLibType,CV) {
    var _pull_flag = 0;                                                //是否拉取标志
    var _sys_id = $stateParams.sys_id;                                 //系统id
    var _log_id = $stateParams.judge_id ? $stateParams.judge_id : "";  //日志id
    //控制对象
    $scope.control = {
        show_first_base : false,        //控制第一层显示隐藏
        show_second_base : false,       //控制第二层显示隐藏
        show_third_base : false         //控制第三层显示隐藏
    };
    //对象
    $scope.info = {
        log : {                     //日志对象
            log_configs : [],       //日志配置列表
            keywords : [],          //关键字列表
            log_pick_info : {},     //定时获取对象
        }
    };
    //数据集合
    $scope.data = {
        data_format_list : newLogDateStampType,     //日期格式
        time_format_list : newLogTimeStampType      //时间格式
    };
    //改变显示类型
    var changeFileCompany = function(file_list){
        var _log_size = {
            size : 0,
            size_str : '',
        };
        _log_size.size = 0;
        for(var i = 0;i < file_list.length;i++){
            var _one_syn = file_list[i];
            _log_size.size=_log_size.size+parseInt(_one_syn.file_length);
        };
        if(_log_size.size==0){
            _log_size.size=0;
            _log_size.size_str="0M"
        }else{
            if(_log_size.size<1024){
                _log_size.size_str=_log_size+"b";
            }else if(_log_size.size>1024){
                if(_log_size.size < 1048576){
                    _log_size.size_str = Math.floor(_log_size.size / (1024)) + "kb"
                }else{
                    _log_size.size_str = Math.floor(_log_size.size / (1024 * 1024)) + "M"
                }
            }
        }
        return _log_size;
    };
    //得到所有的日志
    var getLogList = function(){
        $timeout(function(){
            Sys.getAllLogList(_sys_id,0).then(function (data) {
                $timeout(function () {
                    if(data){
                        $scope.config.tem_logs = data.logBeanList ? data.logBeanList : [];
                        angular.forEach($scope.data.logs,function(one_log){
                            one_log.log_type_cn=CV.findValue(one_log.log_type,LogType);
                            if(one_log.logSyncInfos){
                                var _size_obj=changeFileCompany(one_log.logSyncInfos);
                                one_log.size=_size_obj.size;
                                one_log.size_str=_size_obj.size_str;
                            }else{
                                one_log.size=0;
                                one_log.size_str=0+"M";
                            }
                        })
                        getLogInfoByid($scope.config.tem_logs,_log_id);
                    }
                },0);
            });
        },100);
    };
    //根据日志id得到日志信息
    var getLogInfoByid = function(list,log_id){
        var curr_log = {};
        for(var i = 0;i < list.length;i++){
            var _log = list[i];
            if(_log.log_id == log_id){
                curr_log = _log;
                break;
            }
        };
        if(curr_log.log_configs){
            var  _one = curr_log.log_configs[0];
            var _tem_time = _one.pull_timing_str;
            var _tem_list = [];
            _tem_list = _tem_time.split(":");
            curr_log.log_pick_info = {};
            curr_log.log_pick_info.start_hour = _tem_list[0];
            curr_log.log_pick_info.start_minutes = _tem_list[1];
            curr_log.log_pick_info.start_second = _tem_list[2];
            curr_log.log_file_express = _one.log_file_name_exp;
            curr_log.pull_timing_str = _one.pull_timing_str;
            _pull_flag = _one.pull_flag ? _one.pull_flag :0;
        };
        curr_log.log_type_cn = CV.findValue(curr_log.log_type,LogType);
        //配置时间
        var _temp_time = formatLogTimeAndDate(1,curr_log);
        //根据返回的时间格式匹配时间
        if(_temp_time.indexOf('(') == -1){
            curr_log.timestamp_exp_show = _temp_time;
        }else{
            var _start = _temp_time.indexOf("(");
            var _end = _temp_time.indexOf(")");
            curr_log.timestamp_exp_show = _temp_time.substring(0,_start);
            curr_log.timestamp_show_title = _temp_time.substring(_start+1,_end);
        }
        //配置时间
        var _temp_date = formatLogTimeAndDate(2,curr_log);
        //根据返回的时间格式匹配时间
        if(_temp_date.indexOf('(')==-1){
            curr_log.date_exp_show = _temp_date;
        }else{
            var _start_time = _temp_date.indexOf("(");
            var _end_time = _temp_date.indexOf(")");
            curr_log.date_exp_show = _temp_date.substring(0,_start_time);
            curr_log.date_show_title = _temp_date.substring(_start_time+1,_end_time);
        }
        $scope.info.log = angular.copy(curr_log);
        $scope.info.log.keywords = curr_log.keywords ? curr_log.keywords :[];
    };
    //规范日志的日期时间(falg:1.时间2.日期)
    var formatLogTimeAndDate = function(flag,curr_log){
        //规范日期
        var format_sec = "";
        if(flag == 1){
            if(equalKey(curr_log.timestamp_exp,$scope.data.time_format_list)){
                format_sec = CV.findValue(curr_log.timestamp_exp,$scope.data.time_format_list);
            }else{
                format_sec = curr_log.timestamp_exp;
            }
        }else if(flag == 2){
            if(equalKey(curr_log.date_exp,$scope.data.data_format_list)){
                format_sec = CV.findValue(curr_log.date_exp,$scope.data.data_format_list);
            }else{
                format_sec = curr_log.date_exp;
            }
        }
        return format_sec;
    };
    //匹配枚举key
    var equalKey = function(one_satmp,list){
        var _flag = false;
        for(var i = 0;i < list.length;i++){
            var _one = list[i];
            if(one_satmp ==_one.key){
                _flag = true;
                break;
            }
        }
        return _flag;
    };
    var init = function(){
        if(_log_id){
            if(!$scope.config.tem_logs || $scope.config.tem_logs.length == 0){
                getLogList();
            }else{
                getLogInfoByid($scope.config.tem_logs,_log_id);
            }
        }
    };
    //展开收起基础信息
    $scope.baseDownUP = function(flag){
        if(flag == 1){
            $scope.control.show_first_base =! $scope.control.show_first_base;
        }else if(flag == 2){
            $scope.control.show_second_base =! $scope.control.show_second_base;
        }else if(flag == 3){
            $scope.control.show_third_base =! $scope.control.show_third_base;
        }
    };
    //上传文件
    $scope.uploadFile = function(){
        Modal.uploadLogFile(_sys_id,$scope.info.log.log_name,$scope.info.log.log_id).then(function(){
            //调用服务,刷新列表
            $scope.info.log.flag = true;
        });
    };
    //返回日志列表
    $scope.returnLogList = function(){
        $state.go('sys_config.log_list');
    };
    init();
}]);
/*//系统-配置-agent管理
bsCtrl.controller('agentManageCtrl',["$scope","$state", "$stateParams", "$rootScope","$location", "$sce", "$timeout", "$interval", "DirNodeShare", "Sys", "ProtocolType", "ApplicateType", "Cmpt", "ParamType", "IML_TYPE", "CodeMirrorOption", "CmptFunc", "BsysFunc", "NodeType", "OperateSys", "NodeReform", "ProgType", "Modal", function($scope,$state,$stateParams,$rootScope,$location, $sce, $timeout,$interval, DirNodeShare, Sys, ProtocolType, ApplicateType, Cmpt, ParamType, IML_TYPE, CodeMirrorOption, CmptFunc, BsysFunc, NodeType, OperateSys, NodeReform, ProgType, Modal) {
    var _sys_id = $stateParams.sys_id;        //系统id
    var _timer = '';                          //定时器
    //控制
    $scope.control = {
        show_data_flag:false,                 //展示agent列表
        operation_agent:false,                //判断agent是否启动
    };
    //数据
    $scope.data = {
        agent_monitor_list:[],                //agent列表
    };
    //获得所有的Agent基本信息
    var getAgentList = function(){
        Sys.getAllAgentMsg(_sys_id).then(function (data) {
            $timeout(function () {
                if(data){
                    $scope.control.show_data_flag = true;
                    $scope.$watch('control.operation_agent',function () {
                        if(!$scope.control.operation_agent){
                            $scope.data.agent_monitor_list = data.cfg_list ? data.cfg_list:[];
                        }
                    });
                }
            },0);
        },function (error) {
            $scope.control.show_data_flag = true;
        });
    };
    //Agent控制
    $scope.AgentModify = function(flag,one_node){
        $scope.control.operation_agent = true;       //判断启动/停止agent的标志
        if(flag == 1){
            one_node.start_agent_flag = true;
            one_node.end_agent_flag = false;
        }else{
            one_node.end_agent_flag = true;
            one_node.start_agent_flag = false;
        }
        Sys.modifyAgent(flag,one_node).then(function (data) {
            if (data){
                $timeout(function () {
                    if(flag==1){
                        getAgentList();
                        if(data.success){
                            Modal.alert("启动Agent成功",2);
                        }else{
                            Modal.alert("启动Agent失败",3);
                        }
                    }else if(flag==2){
                        getAgentList();
                        if(data.success){
                            Modal.alert("停止Agent成功",2);
                        }else{
                            Modal.alert("停止Agent失败",3);
                        }
                    };
                    $scope.control.operation_agent = false;  //判断启动/停止agent的标志
                },5000);
            }
        },function (error) {
            Modal.alert(error.message,3);
            one_node.modify_loading = false;
            one_node.start_agent_flag = false;
            one_node.end_agent_flag = false;
            $scope.control.operation_agent = false;  //判断启动/停止agent的标志
        });
    };
    //离开页面之后停止所有监控
    $rootScope.$on('$stateChangeSuccess',function(){
        $timeout(function(){
            //清除单项监控刷新
            $interval.cancel(_timer);
        },1000);
    });
    var init = function(){
        getAgentList();
        _timer = $interval(function () {
            getAgentList();
        }, 5000);
    };
    init();
}]);
//系统-配置-发布版本
bsCtrl.controller('pubVersionCtrl',["$scope","$state", "$stateParams", function($scope,$state,$stateParams ) {
    //版本信息
    $scope.info = {
        pub_version : {
            sys_id : $stateParams.sys_id,                 //系统id
            sys_cn_name : $stateParams.sys_cn_name,      //系统中文名
        }
    }
}]);*/



