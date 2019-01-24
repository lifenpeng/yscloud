'use strict';

//项目发布控制器
var prodCtrl = angular.module('ProdController', []);

/**
 *项目准备
 * */
prodCtrl.controller('pubPreCtrl', ["$scope", "$stateParams", "$state", "$timeout", "$modal","$sce", "Exec", "BusiSys","Collection", "CmptFunc", "ProtocolType","BsysFunc", "CodeMirrorOption","ProdFunc","Project", "Modal", "CV", function($scope, $stateParams, $state, $timeout, $modal,$sce, Exec, BusiSys, Collection,CmptFunc, ProtocolType,BsysFunc, CodeMirrorOption,ProdFunc, Project,Modal, CV) {
    var _sys_name = $stateParams.sys_id, //业务系统名
        _sys_publish_id = $stateParams.sys_publish_id, //系统发布id
        _prolist_bk_path = "", //清单根路径
        _propackage_bk_path = "", //发布包根路径
        _fileupload_path = ''; //上传路径
    var _free_config_phase_list = [];   //自定义配置阶段列表


    $scope.data = {
        node_list : [], //节点列表
        solid_config_list:[], //固化配置文件列表
        sub_tabs:[],//自定义配置文件列表
        program_list_publish:[],//发布方案列表
        program_list_rollback:[],//回退方案列表
        env_list : [],//环境列表
    };//data对象
    $scope.control = {
        validate_flag:false,             //验证提示信息
        prolist_exsit_flag:false,         //验证清单存在提示信息
        package_exsit_flag:false,   //发布包存在信息提示
        valid_prolist_loading:false,    //验证清单loading
        config_info_flag:false,   //配置文件获取异常参数
        pre_info_loading:false, //准备信息加载标志loading
        node_list_loading : false,   //配置文件节点列表加载标志loading
        custom_config_flag: false,  //自定义配置标志
        code_reflash:false,//参数输入框codemirror 刷新
        publish_param_list_flag : false,//发布方案参数列表全为节点参数判断标志
        rollback_param_list_flag : false,//回退方案参数列表全为节点参数判断标志
        expand_prog : false,//方案展开收起操作
        get_list_loading:false,//获取方案列表loading
        publish_loading: false,//发布方案loading
        rollback_loading: false,//回退方案loading
    }; //表单控制
    $scope.info = {
        pre_info : { //准备信息
            business_sys_name : _sys_name,//系统名
            syspublish_id : _sys_publish_id,//项目名
            upload_flag:1,//投产包，投产清单上传方式
            version_soc_name:"",//版本数据源
            prolist_full_path:"",//投产包投产清单根路径
            propackage_list :[],//投产包列表
            publish_program_list:[],//发布方案阶段列表
            publish_param_list:[],//发布方案参数列表
            rollback_program_list:[],  //回退方案阶段
            rollback_param_list:[],//发布方案参数列表
            publish_prog_id:'',//发布方案id
            publish_program_cn_name:'',//发布方案中文名
            rollback_prog_id:'',//回退方案id
            rollback_program_cn_name:'',//发布方案中文名
            env_id:'',//环境id
        },
        dir_names :{},
        prepare_msg:{},//准备信息对象
    };//info对象
    $scope.config = {
        config_tabs : [{active:true},{active:false}],//自定义配置、固化配置tab页切换
        prog_tabs:[{active:true},{active:false}],//方案tab
        viewOptions:CodeMirrorOption.Sh(true),//执行脚本codemirror配置
    };//配置对象
    //绑定发布包信息
    var bindPropackageList = function(pac_list) {
        //获取发布包类型列表
        var _propackage_list = pac_list ? pac_list :[];
        for(var i = 0; i < _propackage_list.length; i ++) {
            var _package =  _propackage_list[i];
            _package.package_name_list = [];
            _package.package_list = [];
            _package.propackage_full_path =  _package.propackage_full_path ?  _package.propackage_full_path :[];
            for(var j = 0;j < _package.propackage_full_path.length;j++){
                _package.package_name_list.push({propackage_full_path: _package.propackage_full_path[j]});
            }
        }
        $scope.info.pre_info.propackage_list = _propackage_list;

    };
    //new验证发布包添加完整性
    var valiProdPacComplete = function(){
        for(var i=0 ; i< $scope.info.pre_info.propackage_list.length ; i++ ){
            var _propackage = $scope.info.pre_info.propackage_list[i];
            if(_propackage.required_flag){
                if(_propackage.package_list.length == 0){
                    $scope.control.package_exsit_flag = true;
                    break;
                }
            }
        }
        return  !$scope.control.package_exsit_flag;
    };
    //验证发布包是不是存在（验证重名加下载）
    var validateProdPacExist = function(prod_pac){
        for(var i =0; i <  prod_pac.package_name_list.length; i++){
            var _prodpackage =  prod_pac.package_name_list[i];
            prod_pac.add_pac_btn_disable = true;
            _prodpackage.is_exsit_loading = true;
            _prodpackage.no_exsit = false;
            Exec.downloadProdListFile(_sys_name,'',$scope.info.pre_info.version_soc_name, _prodpackage.propackage_full_path).then(function(data){
                _prodpackage.is_exsit_loading = false;
                prod_pac.add_pac_btn_disable = false;
            },function(error){
                prod_pac.add_pac_btn_disable = false;
                _prodpackage.is_exsit_loading = false;
                _prodpackage.no_exsit = true;
                Modal.alert(error.message,3);
            });
        }
    };
    //获取配置文件物理节点数据源信息
    var getNodeConfigList = function (env_id) {
        $scope.control.node_list_loading =true;
        Exec.getDefinePhyInfo(_sys_name,env_id).then(function (data) {
            if(data){
                $scope.control.node_list_loading = false;
                $scope.data.node_list = data.phy_node_list ? data.phy_node_list : [];
                ProdFunc.dealSocList($scope.data.node_list)
            }
        },function (error) {
            Modal.alert(error.message,3);
            $scope.control.node_list_loading = false;
        })
    };
    //获取文件路径
    var getNodePath = function (path,node) {
        var _init_path = path;
        //去掉路径最后的'/'
        _init_path = _init_path.length > 1 && _init_path.lastIndexOf("/") == _init_path.length -1 ? _init_path.slice(0, _init_path.length-1) : _init_path;
        var _last_slash_index = _init_path.lastIndexOf("/");
        // /, /a, a, /a/b, a/b, a/
        if(!_init_path) {           //''
            node.paths = [];
        } else if(_last_slash_index == -1) {   //没有'/'或''
            node.paths = [_init_path];
        } else if(_init_path.length == 1 && _last_slash_index == 0) {   //只有'/'
            node.paths = ['/'];
        } else if(_last_slash_index == 0) {     // '/x'
            node.paths = [_init_path.slice(1)];
        } else {
            node.paths = _init_path.slice(1).split("/");
        }
    };
    //判断参数列表是否都是节点参数
    var judgeParamListFlag = function (list,prog) {
        var _flag = 0;
        for(var i = 0; i < list.length; i++){
            var _param = list[i];
            if(_param.param_type != 3){
                _flag++;
            }
        }
        if(_flag == 0){
            $scope.control[prog+'_param_list_flag'] = true;
        }
    };
    //初始化方法
    var init = function() {
        $scope.control.get_list_loading = true;
        //根据系统id获取发布方案和回退方案列表
        Project.getSysProgram(_sys_name).then(function (data) {
            if(data){
                $scope.data.program_list_publish = data.program_list_publish ? data.program_list_publish : [];
                $scope.data.program_list_rollback = data.program_list_rollback ? data.program_list_rollback : [];
                $scope.data.env_list = data.env_list ? data.env_list : [];
                $scope.control.get_list_loading = false;
            }
        },function (error) {
            $scope.control.get_list_loading = false;
            Modal.alert(error.message,3)
        })
         /*   $scope.control.pre_info_loading = true;
            //获取清单和发布包信息
            Exec.getReadyPacParamInfo(_sys_publish_id).then(function(data){
                $timeout(function(){
                    if(data){
                        var _config_phase_list = [];        //固化配置阶段列表
                        $scope.info.prepare_msg = data.prepare_msg;
                        _env_id = data.prepare_msg.environment_id ? data.prepare_msg.environment_id : '';
                        var _dir_names = data.dir_names || [];
                        var _package_path = data.package_path || '';
                        for(var n = 0; n < _dir_names.length;n++){
                            var _dir_obj = {
                                file_name: _dir_names[n],
                                file_path : _package_path + '/'+ _dir_names[n],
                                flag: false
                            }
                            $scope.info.dir_names.push(_dir_obj);
                        }
                        $scope.info.publish_type = data.publish_type;
                        $scope.info.pre_info.version_soc_name = data.version_soc_name ?  data.version_soc_name : '';
                        $scope.info.pre_info.upload_flag = (data.publish_type == 3)  ?  3 :  data.version_soc_name ?  2 : 1;
                        $scope.info.pre_info.channel_name = data.channel_name || '';
                        _prolist_bk_path = data.dftprolst_bk_dir;//版本机清单上传路径
                        _propackage_bk_path = data.dftpropac_bk_dir;//版本机包上传路径
                         _fileupload_path = data.file_upload_path;//本地上传路径
                        $scope.info.pre_info.prolist_full_path = data.prolist_full_path ? data.prolist_full_path : '';
                        bindPropackageList(data.prepare_msg.pac_type_list);
                        $scope.info.pre_info.param_list = data.prepare_msg.param_list ? data.prepare_msg.param_list : [];
                        judgeParamListFlag($scope.info.pre_info.param_list);
                        $scope.info.pre_info.group_list = data.prepare_msg.group_list ? data.prepare_msg.group_list :[];
                        BsysFunc.processProgDate($scope.info.pre_info.group_list,data.prepare_msg.pac_type_list);
                        $scope.info.pre_info.prog_id = data.prepare_msg.prog_id ? data.prepare_msg.prog_id : "";
                        $scope.info.pre_info.prog_cn_name = data.prepare_msg.prog_cn_name ? data.prepare_msg.prog_cn_name : "";

                        $scope.data.sub_tabs = [];
                        for(var i = 0; i< $scope.info.pre_info.group_list.length; i ++ ){
                            var _group = $scope.info.pre_info.group_list[i];
                            for (var j =0; j< _group.phase_list.length; j++){
                                var _phase = _group.phase_list[j];
                                if(_phase.phase_type==5){
                                    var _obj = {
                                        soc_index  :'',
                                        node       : {
                                            path_files : [], //节点目录列表
                                            checked_files: [],//选中的文件列表
                                            paths : [],//路径集合
                                            init_path: '',//初始路径
                                        },
                                        impl_type  : _phase.impl_type,
                                        phase_type : _phase.phase_type,
                                        phase_name : _phase.phase_name,
                                        phase_no   : _phase.phase_no,
                                        modify_define_file_list: [],
                                        active     :false
                                    };
                                    $scope.data.sub_tabs.push(_obj);
                                    _free_config_phase_list.push(_phase);
                                }else if (_phase.phase_type==4){
                                    _config_phase_list.push(_phase);
                                }
                            }
                        }
                        if($scope.data.sub_tabs.length !=0){
                            $scope.control.custom_config_flag = true;
                            $scope.data.sub_tabs[0].active = true;
                            getNodeConfigList();
                        }
                        if(_config_phase_list.length!=0){
                            $scope.data.solid_config_list = ProdFunc.processConfigData(_config_phase_list);
                        }
                        $scope.control.pre_info_loading = false;
                    }
                },0);
            },function(error){
                $scope.control.pre_info_loading = false;
                Modal.alert(error.message,3);
                $state.go("routine_release");
            });*/
    };
    //选择方案
    $scope.chooseProgram = function(prog_id,prog_cn_name,prog){
        if(!prog) return;
        $scope.control[prog+'_param_list_flag'] = false;
        if(!prog_id || !$scope.info.pre_info.env_id){
            $scope.info.pre_info[prog+'_program_list'] = [];
            $scope.info.pre_info[prog+'_param_list'] = [];
            $scope.info.pre_info[prog+'_program_cn_name'] = '';
            return
        }
        $scope.control[prog+'_loading'] = true;
        if(prog == 'publish'){
            $scope.control.custom_config_flag = false;
            $scope.data.solid_config_list = [];
            $scope.data.modify_define_file_list = [];
            $scope.info.pre_info.propackage_list = [];
            $scope.info.pre_info.config_file_list = [];
            //获取清单和发布包信息
            Exec.getQuickProjectPac(_sys_name,_sys_publish_id,$scope.info.pre_info.env_id,prog_id).then(function(data){
                $timeout(function(){
                    if(data){
                        var _config_phase_list = [];        //固化配置阶段列表
                        $scope.info.prepare_msg = data.prepare_msg;
                        $scope.info.dir_names = data.dir_names || {
                            "size":4096,
                            "file":"InterfaceDir",
                            "dir":true,
                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir",
                            "nodes":[{
                                "size":1124,
                                "file":"XQ2018-1994_ebank.sql",
                                "dir":false,
                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/XQ2018-1994_ebank.sql"
                            },{
                                "size":4096,
                                "file":"uibs",
                                "dir":true,
                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/uibs",
                                "nodes":[{
                                    "size":4096,
                                    "file":"ibslib",
                                    "dir":true,
                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/uibs/ibslib",
                                    "nodes":[{
                                        "size":4096,
                                        "file":"lib",
                                        "dir":true,
                                        "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/uibs/ibslib/lib",
                                        "nodes":[{
                                            "size":4096,
                                            "file":"uibs",
                                            "dir":true,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/uibs/ibslib/lib/uibs",
                                            "nodes":[{
                                                "size":4096,
                                                "file":"router",
                                                "dir":true,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/uibs/ibslib/lib/uibs/router",
                                                "nodes":[{
                                                    "size":254408,
                                                    "file":"i2bRouter-o-pcreditcard.jar",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/uibs/ibslib/lib/uibs/router/i2bRouter-o-pcreditcard.jar"
                                                },{
                                                    "size":552384,
                                                    "file":"i2bRouter-setting.jar",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/uibs/ibslib/lib/uibs/router/i2bRouter-setting.jar"
                                                },{
                                                    "size":16570,
                                                    "file":"i2bRouter-o-ppayment.jar",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/uibs/ibslib/lib/uibs/router/i2bRouter-o-ppayment.jar"
                                                },{
                                                    "size":18633,
                                                    "file":"i2bRouter-o-epayment.jar",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/uibs/ibslib/lib/uibs/router/i2bRouter-o-epayment.jar"
                                                },{
                                                    "size":579236,
                                                    "file":"i2bRouter.jar",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/uibs/ibslib/lib/uibs/router/i2bRouter.jar"
                                                },{
                                                    "size":573466,
                                                    "file":"i2bRouter-i-csxml.jar",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/uibs/ibslib/lib/uibs/router/i2bRouter-i-csxml.jar"
                                                }]
                                            }]
                                        }]
                                    }]
                                }]
                            },{
                                "size":4096,
                                "file":"pweb",
                                "dir":true,
                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb",
                                "nodes":[{
                                    "size":4096,
                                    "file":"WEB-INF",
                                    "dir":true,
                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF",
                                    "nodes":[{
                                        "size":4096,
                                        "file":"classes",
                                        "dir":true,
                                        "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/classes",
                                        "nodes":[{
                                            "size":4096,
                                            "file":"config",
                                            "dir":true,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/classes/config",
                                            "nodes":[{
                                                "size":50827,
                                                "file":"http.xml",
                                                "dir":false,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/classes/config/http.xml"
                                            }]
                                        }]
                                    },{
                                        "size":4096,
                                        "file":"zh_CN",
                                        "dir":true,
                                        "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN",
                                        "nodes":[{
                                            "size":4096,
                                            "file":"payment",
                                            "dir":true,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/payment",
                                            "nodes":[{
                                                "size":4096,
                                                "file":"PayGateWayESB",
                                                "dir":true,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/payment/PayGateWayESB",
                                                "nodes":[{
                                                    "size":10317,
                                                    "file":"Paylogin.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/payment/PayGateWayESB/Paylogin.jsp"
                                                }]
                                            },{
                                                "size":4096,
                                                "file":"EntrustSign",
                                                "dir":true,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/payment/EntrustSign",
                                                "nodes":[{
                                                    "size":7291,
                                                    "file":"EntrustSign.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/payment/EntrustSign/EntrustSign.jsp"
                                                },{
                                                    "size":10027,
                                                    "file":"EntrustSignPre.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/payment/EntrustSign/EntrustSignPre.jsp"
                                                },{
                                                    "size":9393,
                                                    "file":"EntrustSignLogin.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/payment/EntrustSign/EntrustSignLogin.jsp"
                                                },{
                                                    "size":7533,
                                                    "file":"EntrustSignConfirm.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/payment/EntrustSign/EntrustSignConfirm.jsp"
                                                }]
                                            }]
                                        },{
                                            "size":4096,
                                            "file":"query",
                                            "dir":true,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/query",
                                            "nodes":[{
                                                "size":4096,
                                                "file":"TransJnlQry",
                                                "dir":true,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/query/TransJnlQry",
                                                "nodes":[{
                                                    "size":5253,
                                                    "file":"EntrustSign.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/query/TransJnlQry/EntrustSign.jsp"
                                                },{
                                                    "size":6976,
                                                    "file":"PayGateTransfer.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/zh_CN/query/TransJnlQry/PayGateTransfer.jsp"
                                                }]
                                            }]
                                        }]
                                    },{
                                        "size":4096,
                                        "file":"lib",
                                        "dir":true,
                                        "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/lib",
                                        "nodes":[{
                                            "size":126464,
                                            "file":"pquery.jar",
                                            "dir":false,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/lib/pquery.jar"
                                        },{
                                            "size":204252,
                                            "file":"pcreditcard.jar",
                                            "dir":false,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/lib/pcreditcard.jar"
                                        },{
                                            "size":72692,
                                            "file":"ppayment.jar",
                                            "dir":false,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/lib/ppayment.jar"
                                        },{
                                            "size":967447,
                                            "file":"pcommon.jar",
                                            "dir":false,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/pweb/WEB-INF/lib/pcommon.jar"
                                        }]
                                    }]
                                }]
                            },{
                                "size":5150720,
                                "file":"T_ebank_dev37_20181119_1_206.tar",
                                "dir":false,
                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/T_ebank_dev37_20181119_1_206.tar"
                            },{
                                "size":4096,
                                "file":"eweb",
                                "dir":true,
                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb",
                                "nodes":[{
                                    "size":4096,
                                    "file":"WEB-INF",
                                    "dir":true,
                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF",
                                    "nodes":[{
                                        "size":4096,
                                        "file":"zh_CN",
                                        "dir":true,
                                        "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN",
                                        "nodes":[{
                                            "size":4096,
                                            "file":"epayment",
                                            "dir":true,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/epayment",
                                            "nodes":[{
                                                "size":4096,
                                                "file":"EPayGate",
                                                "dir":true,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/epayment/EPayGate",
                                                "nodes":[{
                                                    "size":7469,
                                                    "file":"EPayGatelogin.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/epayment/EPayGate/EPayGatelogin.jsp"
                                                }]
                                            },{
                                                "size":4096,
                                                "file":"EEntrustSign",
                                                "dir":true,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/epayment/EEntrustSign",
                                                "nodes":[{
                                                    "size":6685,
                                                    "file":"EEntrustSign.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/epayment/EEntrustSign/EEntrustSign.jsp"
                                                },{
                                                    "size":10682,
                                                    "file":"EEntrustSignPre.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/epayment/EEntrustSign/EEntrustSignPre.jsp"
                                                },{
                                                    "size":7406,
                                                    "file":"EEntrustSignConfirm.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/epayment/EEntrustSign/EEntrustSignConfirm.jsp"
                                                }]
                                            }]
                                        },{
                                            "size":4096,
                                            "file":"auth",
                                            "dir":true,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/auth",
                                            "nodes":[{
                                                "size":4096,
                                                "file":"Auth",
                                                "dir":true,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/auth/Auth",
                                                "nodes":[{
                                                    "size":25734,
                                                    "file":"AuthResult.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/auth/Auth/AuthResult.jsp"
                                                },{
                                                    "size":25764,
                                                    "file":"AuthList.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/auth/Auth/AuthList.jsp"
                                                }]
                                            },{
                                                "size":4096,
                                                "file":"AuthDetail",
                                                "dir":true,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/auth/AuthDetail",
                                                "nodes":[{
                                                    "size":1113,
                                                    "file":"EEntrustSign.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/auth/AuthDetail/EEntrustSign.jsp"
                                                }]
                                            },{
                                                "size":4096,
                                                "file":"Authed",
                                                "dir":true,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/auth/Authed",
                                                "nodes":[{
                                                    "size":4096,
                                                    "file":"AuthedDetail",
                                                    "dir":true,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/auth/Authed/AuthedDetail",
                                                    "nodes":[{
                                                        "size":5744,
                                                        "file":"EEntrustSign.jsp",
                                                        "dir":false,
                                                        "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/auth/Authed/AuthedDetail/EEntrustSign.jsp"
                                                    }]
                                                },{
                                                    "size":3324,
                                                    "file":"AuthHisQry.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/auth/Authed/AuthHisQry.jsp"
                                                }]
                                            }]
                                        },{
                                            "size":4096,
                                            "file":"query",
                                            "dir":true,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/query",
                                            "nodes":[{
                                                "size":4096,
                                                "file":"TransJnlQry",
                                                "dir":true,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/query/TransJnlQry",
                                                "nodes":[{
                                                    "size":6221,
                                                    "file":"EEntrustSign.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/query/TransJnlQry/EEntrustSign.jsp"
                                                },{
                                                    "size":5489,
                                                    "file":"PayGatePay.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/query/TransJnlQry/PayGatePay.jsp"
                                                },{
                                                    "size":19673,
                                                    "file":"TransJnlsQry.jsp",
                                                    "dir":false,
                                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/zh_CN/query/TransJnlQry/TransJnlsQry.jsp"
                                                }]
                                            }]
                                        }]
                                    },{
                                        "size":4096,
                                        "file":"lib",
                                        "dir":true,
                                        "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/lib",
                                        "nodes":[{
                                            "size":458064,
                                            "file":"ecustom.jar",
                                            "dir":false,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/lib/ecustom.jar"
                                        },{
                                            "size":119317,
                                            "file":"equery.jar",
                                            "dir":false,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/lib/equery.jar"
                                        },{
                                            "size":26860,
                                            "file":"eauth.jar",
                                            "dir":false,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/lib/eauth.jar"
                                        },{
                                            "size":736818,
                                            "file":"ecommon.jar",
                                            "dir":false,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/lib/ecommon.jar"
                                        },{
                                            "size":150910,
                                            "file":"epayment.jar",
                                            "dir":false,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/WEB-INF/lib/epayment.jar"
                                        }]
                                    }]
                                },{
                                    "size":4096,
                                    "file":"zh_CN",
                                    "dir":true,
                                    "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/zh_CN",
                                    "nodes":[{
                                        "size":4096,
                                        "file":"jnrcb",
                                        "dir":true,
                                        "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/zh_CN/jnrcb",
                                        "nodes":[{
                                            "size":4096,
                                            "file":"css",
                                            "dir":true,
                                            "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/zh_CN/jnrcb/css",
                                            "nodes":[{
                                                "size":4340,
                                                "file":"login2.css",
                                                "dir":false,
                                                "file_path":"/home/jnapp/cl_jnbk/clWeb/cldoc/EBANK/SP201811190000205/InterfaceDir/eweb/zh_CN/jnrcb/css/login2.css"
                                            }]
                                        }]
                                    }]
                                }]
                            }]
                        };
                        $scope.info.publish_type = data.publish_type;
                        $scope.info.pre_info.version_soc_name = data.version_soc_name ?  data.version_soc_name : '';
                        // $scope.info.pre_info.upload_flag = (data.publish_type == 3)  ?  3 :  data.version_soc_name ?  2 : 1;
                        $scope.info.pre_info.upload_flag = 3;
                        $scope.info.pre_info.channel_name = data.channel_name || '';
                        _propackage_bk_path = data.dftpropac_bk_dir;//版本机包上传路径
                        _fileupload_path = data.file_upload_path;//本地上传路径
                        $scope.info.pre_info.prolist_full_path = data.prolist_full_path ? data.prolist_full_path : '';
                        bindPropackageList(data.prepare_msg.pac_type_list);
                        $scope.info.pre_info[prog+'_param_list'] = data.prepare_msg.param_list ? data.prepare_msg.param_list : [];
                        judgeParamListFlag($scope.info.pre_info[prog+'_param_list'],prog);
                        $scope.info.pre_info[prog+'_program_list'] = data.prepare_msg.group_list ? data.prepare_msg.group_list :[];
                        BsysFunc.processProgDate($scope.info.pre_info[prog+'_program_list'],data.prepare_msg.pac_type_list,data.prepare_msg.config_file_list);
                        $scope.info.pre_info.publish_prog_id = data.prepare_msg.prog_id ? data.prepare_msg.prog_id : "";
                        $scope.info.pre_info.publish_program_cn_name = data.prepare_msg.prog_cn_name ? data.prepare_msg.prog_cn_name : "";
                        $scope.data.sub_tabs = [];
                        for(var i = 0; i< $scope.info.pre_info[prog+'_program_list'].length; i ++ ){
                            var _group = $scope.info.pre_info[prog+'_program_list'][i];
                            for (var j =0; j< _group.phase_list.length; j++){
                                var _phase = _group.phase_list[j];
                                if(_phase.phase_type==5){
                                    var _obj = {
                                        soc_index  :'',
                                        node       : {
                                            path_files : [], //节点目录列表
                                            checked_files: [],//选中的文件列表
                                            paths : [],//路径集合
                                            init_path: '',//初始路径
                                        },
                                        impl_type  : _phase.impl_type,
                                        phase_type : _phase.phase_type,
                                        phase_name : _phase.phase_name,
                                        phase_no   : _phase.phase_no,
                                        modify_define_file_list: [],
                                        active     :false
                                    };
                                    $scope.data.sub_tabs.push(_obj);
                                    _free_config_phase_list.push(_phase);
                                }else if (_phase.phase_type==4){
                                    _config_phase_list.push(_phase);
                                }
                            }
                        }
                        if($scope.data.sub_tabs.length !=0){
                            $scope.control.custom_config_flag = true;
                            $scope.data.sub_tabs[0].active = true;
                            getNodeConfigList($scope.info.pre_info.env_id,_sys_name);
                        }
                        if(_config_phase_list.length!=0){
                            $scope.data.solid_config_list = ProdFunc.processConfigData(_config_phase_list);
                        }
                        $timeout(function(){
                            $scope.control.code_refresh = true;
                        },10);
                        $scope.control[prog+'_loading'] = false;
                    }
                },0);
            },function(error){
                $scope.control[prog+'_loading'] = false;
                Modal.alert(error.message,3);
            });
        }else{
            BusiSys.viewSingleProgramInfo(prog_id).then(function (data) {
            $scope.control[prog+'_loading']  = false;
            $scope.info.pre_info[prog+'_program_list'] = data.program.group_list || [];
            $scope.info.pre_info[prog+'_param_list'] = data.program.param_list || [];
            judgeParamListFlag($scope.info.pre_info[prog+'_param_list'],prog);
            $scope.info.pre_info[prog+'_program_cn_name'] = prog_cn_name;
            BsysFunc.processProgDate($scope.info.pre_info[prog+'_program_list'],data.program.pac_type_list,data.program.config_file_list);
            $timeout(function(){
                $scope.control.code_refresh = true;
            },10)
        },function (error) {
            $scope.control[prog+'_error_msg'] = error.message;
            $scope.control[prog+'_loading'] = false;
        })
        }
    };
    //获取准备信息
    $scope.getPrepareInfo = function(selectKey,selectValue,prog){
        if(!$scope.info.pre_info.env_id || !$scope.info.pre_info.publish_prog_id){
            return false;
        }
    };
    //展开收起系统
    $scope.expandCollapse = function (e) {
        if(e.target.tagName.toLowerCase()=='div'){
            $scope.control.expand_prog = !$scope.control.expand_prog ;
        }
    };
    //选择tab页
    $scope.chooseTab = function(){
        $scope.control.code_refresh = false;
        $timeout(function () {
            $scope.control.code_refresh = true;
        },10)
    };
    //公共-参数默认值输入框智能提示
    $scope.paramShellLoaded = function(_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
        $timeout(function(){
            $scope.control.code_refresh = true;
        },0);
    };
    //改变清单获取方式清单/包获取方式
    $scope.changeFileFlag = function(flag) {
        $scope.info.pre_info.upload_flag = flag;
        $scope.control.validate_flag  = false;
        $scope.info.pre_info.prolist_full_path = '';
        //清空发布包列表
        angular.forEach($scope.info.pre_info.propackage_list,function(data){
            data.propackage_full_path = data.propackage_full_path ? [] : [];
            data.package_name_list =  data.package_name_list ? [] : [];
            data.package_list =  data.package_list ? [] : [];
        });

    };
    //new添加发布包
    $scope.addProdPackage = function(index,pac_flag){
        $scope.control.validate_flag = false ;
         if(pac_flag != 3){//从本地 和版本机
            Modal.prodPreAddProdPac(_propackage_bk_path,_fileupload_path,_prolist_bk_path,index,pac_flag,false,$scope.info.pre_info).then(function(data){
                if(data){
                    if(pac_flag == 1){
                        //添加发布包
                        $scope.info.pre_info.propackage_list[index].package_name_list = data.dpp_param_info.propackage_list[index].package_name_list;
                        $scope.info.pre_info.propackage_list[index].propackage_full_path = data.dpp_param_info.propackage_list[index].propackage_full_path;
                        $scope.info.pre_info.propackage_list[index].package_list = data.dpp_param_info.propackage_list[index].package_list;
                    }
                    //检验版本机包是否存在
                    if(pac_flag == 2){
                        $scope.info.pre_info.propackage_list[index] = data.dpp_param_info.propackage_list[index];
                        validateProdPacExist($scope.info.pre_info.propackage_list[index]);
                    }
                    $scope.control.package_exsit_flag = false;
                }
            });
         }else{ //从平台
            Modal.prodPreAddProdPacFromPlatform($scope.info.dir_names,index,_sys_publish_id,$scope.info.pre_info).then(function (data) {
                $scope.info.pre_info.propackage_list[index].package_list = data.package_list;
                $scope.info.pre_info.propackage_list[index].propackage_full_path = data.propackage_full_path;
                $scope.control.package_exsit_flag = false;
            })
        }
    };
    //new发布包-移除发布包
    $scope.removeProdPackage = function(propackage_list,prodpac,propackage){
        var _tar_name = propackage.propackage_full_path.substring(propackage.propackage_full_path.lastIndexOf('/')+1, propackage.propackage_full_path.length);
        for(var i = 0;i < propackage_list.length;i++) {
            var _pac_type = propackage_list[i];
            if(_pac_type.package_type == prodpac.package_type){
                //删除临时发布包
                for(var j = 0; j < _pac_type.package_name_list.length; j++){
                    var _pac_path =  _pac_type.package_name_list[j];
                    if(_pac_path.propackage_full_path == propackage.propackage_full_path) {
                        propackage_list[i].package_name_list.splice(j, 1);
                        break;
                    }
                }
                //删除提交的发布包
                for(var j = 0; j < _pac_type.package_list.length; j++){
                    var _package =  _pac_type.package_list[j];
                    if(_package == _tar_name) {
                        propackage_list[i].package_list.splice(j, 1);
                        break;
                    }
                }
                //删除发布包
                for(var k = 0; k < _pac_type.propackage_full_path.length; k++){
                    var _package_path =  _pac_type.propackage_full_path[k];
                    if(_package_path == propackage.propackage_full_path) {
                        propackage_list[i].propackage_full_path.splice(k, 1);
                        break;
                    }
                }
            }
        }
    };
    //移除从平台获取的发布包
    $scope.deletePlatformPackage = function(index,propackage_list,propackage_full_path){
        var _dir_names = [];
        _dir_names = [propackage_full_path[index]];
        Exec.deletePlatTempFile(_dir_names).then(function (data) {
            if(data){
                propackage_list.splice(index,1);
                propackage_full_path.splice(index,1);
            }
        },function (error) {
            Modal.alert(error.message,3)
        })
    };
    //new发布包-下载发布包
    $scope.downloadPackage = function(propackage){
        // var _path = $scope.config.prodlist_fileupload.uploadpath + propackage.propackage_full_path.substring(propackage.propackage_full_path.lastIndexOf("/")+1,propackage.propackage_full_path.length);
        if($scope.info.pre_info.upload_flag == 2){
            CV.downloadFile(_path);
        }else{
            CV.downloadFile(_path);
        }
    };
    //动态获取发布清单高度
    $scope.changeHeight = function(){
        var _height = $('.left_content').css('height');
        return {
            height  : _height
        }
    };
    //new清单-添加清单
    $scope.addProdList = function(){
        $scope.control.validate_flag = false;
        Modal.prodPreAddProdPac("",_fileupload_path,_prolist_bk_path,"","",true,$scope.info.pre_info).then(function(data){
            if(data){
                $scope.info.pre_info.prolist_full_path = data.prolist_full_path;
                //检验版本机包是否存在
                if($scope.info.pre_info.upload_flag == 2){
                    $scope.control.valid_prolist_loading = true;
                    //验证清单下载清单到cl目录是否存在
                    Exec.downloadProdListFile(_sys_name,_proj_name,$scope.info.pre_info.version_soc_name,data).then(function(data){
                        $scope.control.valid_prolist_loading = false;
                        $scope.control.prolist_exsit_flag = true;
                    },function(error){
                        $scope.control.valid_prolist_loading = false;
                        $scope.control.prolist_exsit_flag = false;
                    });
                }
            }
        });
    };
    //new清单--清单下载
    $scope.downloadProdListFile = function() {
       var _path = $scope.info.pre_info.prolist_full_path;
       CV.downloadFile(_path);
    };
    //new清单-删除清单
    $scope.removeProdList = function() {
        $scope.info.pre_info.prolist_full_path = '';
    };
    //模组展开收起操作
    $scope.toggleModulesDetail = function (step, group) {
        step.show_detail = !step.show_detail;
        //判断导航条是否显示标志
        group.nav_show_flag = CmptFunc.judgeShowDetail(group.phase_list);
        group.expand_flag = (group.nav_show_flag == 2) ? true : false;
        $scope.control.code_refresh = false;
        $timeout(function(){
            $scope.control.code_refresh = true;
        },10)
    };
    //模组全部展开
    $scope.expandCollapseAll = function (group) {
        group.nav_show_flag = CmptFunc.expandAllModules(group.phase_list);
        //重新刷新codemirror
        if(group.nav_show_flag == 2){
            $scope.control.code_refresh = false;
            $timeout(function(){
                $scope.control.code_refresh = true;
            },10)
        }
    };
    //模组全部收起
    $scope.colseCollapseAll = function (group) {
        group.nav_show_flag = CmptFunc.closeAllModules(group.phase_list);
    };
    //协议类型转化中文名
    $scope.getProtocolTypeCnName = function(protocol_type){
        return CV.findValue(protocol_type,ProtocolType).substring(0,5).toLowerCase();
    };
    //获取数据源下的文件列表
    $scope.getFileList = function (selectKey,index,sub_tab) {
        sub_tab.file_soc_name = $scope.data.node_list[selectKey].file_soc_name;
        sub_tab.execute_soc_name = $scope.data.node_list[selectKey].execute_soc_name;
        sub_tab.execute_ip = $scope.data.node_list[selectKey].ip;
        sub_tab.agent_user = $scope.data.node_list[selectKey].agent_user ? $scope.data.node_list[selectKey].agent_user  : '';
        sub_tab.init_temp = '';
        sub_tab.node.paths = [];
        sub_tab.node.loading = true;
        sub_tab.node.err_msg ='';
        sub_tab.node.init_path = '';
        Collection.getFileListBySoc(sub_tab.file_soc_name, sub_tab.node.init_path , sub_tab.execute_ip,sub_tab.agent_user).then(function(data) {
            sub_tab.node.loading = false;
            sub_tab.init_temp = data.root_bk_dir;
            sub_tab.node.init_path = sub_tab.init_temp;
            getNodePath(sub_tab.init_temp,sub_tab.node);
            sub_tab.node.path_files = data.file_bean_list ? data.file_bean_list : [];
        }, function(error) {
            sub_tab.node.paths = [];
            sub_tab.node.init_path = '';
            sub_tab.node.path_files = [];
            sub_tab.init_temp = '';
            sub_tab.node.loading = false;
            sub_tab.node.err_msg = error.message;
        });
    };
    //展示目录文件列表
    $scope.changePath = function(sub_tab,index) {
        if(sub_tab.node.is_dir) {
            sub_tab.node.loading = true;
            $timeout(function() {
                Collection.getFileListBySoc(sub_tab.file_soc_name, sub_tab.node.full_path , sub_tab.execute_ip,sub_tab.agent_user).then(function(data) {
                    sub_tab.node.loading = false;
                    sub_tab.node.path_files = data.file_bean_list ? data.file_bean_list : [];
                }, function(error) {
                    sub_tab.node.paths = [];
                    sub_tab.node.loading = false;
                    sub_tab.node.err_msg = error.message;
                });
            });
        } else {
            var _node_name = (sub_tab.execute_ip +_sys_name).replace(/\./g,'');
            var _download_soc_ip = sub_tab.execute_ip;
            Modal.compare(_sys_name, _sys_publish_id,_node_name, sub_tab.node.full_path, sub_tab.execute_soc_name, sub_tab.file_soc_name,_download_soc_ip, true , 5).then(function(data) {
                if(data){
                    var _index = sub_tab.soc_index;
                    var _node_list = $scope.data.node_list;
                    var _phy_node = angular.copy(_node_list[_index]);
                    var _phase = _free_config_phase_list[index];
                    var _path = sub_tab.node.full_path;
                    _phase.phy_nodes = _phase.phy_nodes || [];
                    for(var k =0; k< _phase.phy_nodes.length; k++){
                        if(_phase.phy_nodes[k].ip === _phy_node.ip){
                           if(_phase.phy_nodes[k].file_list.indexOf(_path)<0){
                               _phase.phy_nodes[k].file_list.push(_path);
                           }
                            _path = null;
                           break;
                        }
                    }
                    if(_path){
                            var _obj = angular.extend(_phy_node,{
                                file_list:[_path]
                            });
                            _phase.phy_nodes.push(_obj);
                        }
                    sub_tab.phy_nodes = _phase.phy_nodes;
                }
            });
        }
    };

    //固化配置文件修改弹窗
    $scope.showModifyFile = function(file,node,phase) {
        var _check_soc_name = node.execute_soc_name;
        var _node_name = (node.ip +_sys_name).replace(/\./g,'');
        var _download_soc_name = node.file_soc_name;
        var _download_soc_ip = node.ip;
        Modal.compare(_sys_name, _sys_publish_id, _node_name,file.file,  _check_soc_name, _download_soc_name,_download_soc_ip, true ,phase.phase_type,phase.phase_no).then(function(data) {
            if(data){
                file.is_modify = true;
            }
        });
    };
    //自定义配置文件修改弹窗
    $scope.showModifyDefineFile = function(soc,file_path) {
        var _check_soc_name = soc.execute_soc_name;
        var _download_soc_name = soc.file_soc_name;
        var _node_name = (soc.ip +_sys_name).replace(/\./g,'');
        var _download_soc_ip = soc.ip;
        Modal.compare(_sys_name, _sys_publish_id,_node_name, file_path, _check_soc_name, _download_soc_name,_download_soc_ip, true).then(function(data) {});
    };
    //删除自定义修改过的配置文件
    $scope.deleteDefineConfigModify = function (event ,soc,index,out_index,sub_tab) {
        event.stopPropagation();
        Modal.confirm('是否要删除已经修改的配置文件？').then(function () {
            if(soc.file_list.length > 1){
                soc.file_list.splice(index,1);
            }else {
                sub_tab.phy_nodes.splice(out_index,1);
            }

        });
    };
    //提交准备信息表单
    $scope.submitReadyForm = function() {
        var _pre_info = angular.copy($scope.info.pre_info);
        $scope.info.prepare_msg.pac_type_list =  _pre_info.propackage_list;
        $scope.info.prepare_msg.group_list = _pre_info.publish_program_list;
        $scope.info.prepare_msg.param_list = _pre_info.publish_param_list;
        $scope.info.prepare_msg.rollback_prog_id = _pre_info.rollback_prog_id;
        $scope.info.prepare_msg.list_name =  _pre_info.prolist_full_path ?  _pre_info.prolist_full_path.substring(_pre_info.prolist_full_path.lastIndexOf("/")+1,_pre_info.prolist_full_path.length) : '';
        var _repData = {
            syspublish_id:_sys_publish_id,
            sys_id :_sys_name ,
            prepare_msg: $scope.info.prepare_msg,
        };
        if(!CV.valiForm($scope.saveDppForm)){
            return false;
        }
        if($scope.info.pre_info.propackage_list.length != 0){
            //发布包不可为空
            if(!valiProdPacComplete()){
                return false;
            }
            if($scope.control.validate_flag){
                return false;
            }
        }
        //打开加载模态框
        $modal.open({
            templateUrl: 'templates/modal/loading_modal.html',
            controller: 'submitModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                Message: function () {
                    return _repData
                }
            }
        })
    };
    //取消准备表单
    $scope.cancelReadyForm = function() {
        $state.go("routine_release");
    };
    init();
}]);
/**
 *项目执行
 * */
prodCtrl.controller('prodExecDoCtrl', ["$scope", "$stateParams", "$state", "$rootScope", "$timeout", "$interval","$sce", "Proj", "Monitor", "Exec", "ProjState", "ProdNodeState", "ProdCmdState","CodeMirrorOption","ProdFunc","CmptFunc", "ProtocolType", "Modal","ProdFlag", "ScrollConfig", "CV", function($scope, $stateParams, $state, $rootScope, $timeout, $interval,$sce, Proj, Monitor, Exec, ProjState, ProdNodeState, ProdCmdState, CodeMirrorOption, ProdFunc, CmptFunc, ProtocolType,Modal,ProdFlag, ScrollConfig, CV) {
    var _sys_id    = $stateParams.sys_id; // 系统id
    var _proj_id  = $stateParams.sys_publish_id;  //系统发布id
    var _path_flag = $stateParams.path_flag; // path_flag (跳转标志) 1 从例行发布而来 2 从合并发布而来
    var _execute_id ; // 执行id
    var _auto_yn_flag = $stateParams.auto_yn_flag; // 自动执行标志 1 定时自定执行 2 手动
    var _codeDiv = $('#codePanel');//内同dome对象
    var _refresh_log_interval;//日志刷新监听对象
    var _exec_interval ;//内容刷新监听对象
    var _time_interval;//倒计时 时间监控
    var _has_author = "";//是否已经授权过
    var _has_check = true; //判断当前的执行是否跟随选中的阶段标志(默认跟随)
    var _exec_success_flag = 0;//项目执行成功标志位（用于弹出框只显示一次）
    var _interact_flag = 0;//交互式弹窗标志位（用于弹出框只显示一次）
    var _scroll_flag = false; //滚动条控制标志
    $scope.info = {
        exec_type : $stateParams.exec_type, //执行类别 1 发布 2 回退
        reset_phases : [],//重置阶段列表
        proj_info : {},//项目信息
        instance_info : {//执行步骤信息
            steps : []
        },
        phase_node_info : {//阶段配置节点信息
            nodes_info : {
                node_list :[],
                parallel_flag : false
            },
            nodes_flag : false,
            expand_flag : false,
            phase_status: 1,
            phase_id : 1,
            nav_show_flag : 0
        },
        remainTime :'',//距离发布还剩多少时间
        nowDate : '',//当前日期
        nowTime : '',//当前时间
    };
    $scope.control = {
        is_Exec : true, //是否是可以执行的用户
        show_prod_error : false,//方案执行出错（头部样式）
        reset_id : 0,//重置阶段
        code_mirror_control:false,//codecirror加载不显示问题
        get_nodes_loading : false,
        is_quick_publish : $stateParams.quick_pub_flag ? $stateParams.quick_pub_flag : 2, // 是否是敏捷项目
        curr : {_phase: 0,  _phaseDesc: '', _load: false,_node:0 },//执行当前对象 当前阶段，阶段描述，执行中，当前节点
        exec_btn : {phase: true, auto:true, skip : true},
        can_exec:false,//可执行标志
        is_log_minisize:false,
    };
    $scope.config = {
        scroll_code_info : ScrollConfig, //内容滚动条配置
        scroll_node_info : ScrollConfig, //节点栏滚动条配置
        import_fileupload : { //实例导入导出
            suffixs:'xls,xlsx,xml',
            filetype:"EXCEL",
            filename:"",
            uploadpath:""
        },
        view_options : CodeMirrorOption.Sh(true),//阶段信息codemirror显示
    }
    //获取所有执行节点
    var getAllExecNodes = function (list) {
        var _arr_temp = [];
        var _arr = [];
        var _nodes_list =[];
        for(var i=0;i<list.length;i++){
            var _group = list[i];
            for(var j=0;j<_group.phase_list.length;j++){
                var _phase = _group.phase_list[j];
                if(_phase.node_list){
                    for(var k=0;k<_phase.node_list.length;k++){
                        _arr.push(_phase.node_list[k].exec_node_ip)
                    }
                }
            }
        }
        _arr_temp = Array.from(new Set(_arr));
        for(var l=0;l<_arr_temp.length;l++){
            _nodes_list.push({exec_ip : _arr_temp[l],is_show : false});
        }
        return _nodes_list;
    };
    //阶段内容初始化滚动控制
    var initScollHeights = function(phase_id) {
        $timeout(function () {
            var _phase = '#phase_'+phase_id;
            $scope.inscrollTo($(_phase));
        },100);
    };
    //回退评价模态框
    var showRollbackSummaryModel = function(publishId, busiSys, rollbackFlag) {
        Modal.rollbackSummary(publishId, busiSys, rollbackFlag).then(function(data){
        });
    };
    //处理项目开始剩余时间和项目可否执行标记
    var dealAvaiableTime = function (data) {
        var _now_date = new Date((data.dtbs_bk_date).replace(/-/g,"/")+' '+data.dtbs_bk_time);
        var _year = _now_date.getFullYear();
        var _month = _now_date.getMonth()+1 < 10 ? '0' + (_now_date.getMonth()+1) : _now_date.getMonth()+1;
        var _date = _now_date.getDate() < 10 ? '0' +_now_date.getDate() : _now_date.getDate();
        var _hours = _now_date.getHours() < 10 ? '0' +_now_date.getHours() : _now_date.getHours();
        var _minutes = _now_date.getMinutes() < 10 ? '0' +_now_date.getMinutes() : _now_date.getMinutes();
        var _seconds = _now_date.getSeconds() < 10 ? '0' +_now_date.getSeconds() : _now_date.getSeconds();
        var _remain_date =new Date((data.pj_info_detail.pro_bk_date).replace(/-/g,"/")+' '+data.pj_info_detail.pro_bk_time);
        var _remain_seconds = _remain_date.getTime();
        var _now_seconds =_now_date.getTime();
        $scope.info.nowDate=_year+"-"+_month+"-"+_date;
        $scope.info.nowTime=_hours+':'+_minutes+':'+_seconds;
        $scope.SetTimer=function(){
            _now_seconds+=1000;
            _now_date = new Date(_now_seconds);
            _date = _now_date.getDate() < 10 ? '0' +_now_date.getDate() : _now_date.getDate();
            _hours = _now_date.getHours() < 10 ? '0' +_now_date.getHours() : _now_date.getHours();
            _minutes = _now_date.getMinutes() < 10 ? '0' +_now_date.getMinutes() : _now_date.getMinutes();
            _seconds = _now_date.getSeconds() < 10 ? '0' +_now_date.getSeconds() : _now_date.getSeconds();
            $scope.info.nowDate=_year+"-"+_month+"-"+_date;
            $scope.info.nowTime=_hours+':'+_minutes+':'+_seconds;
            var t=_remain_seconds-_now_seconds;
            var d=0,h=0,m=0,s=0;
            if(t>=0){
                d=Math.floor(t/1000/60/60/24);
                h=Math.floor(t/1000/60/60%24)<10 ? '0'+Math.floor(t/1000/60/60%24) : Math.floor(t/1000/60/60%24);
                m=Math.floor(t/1000/60%60) <10 ? '0'+Math.floor(t/1000/60%60) : Math.floor(t/1000/60%60);
                s=Math.floor(t/1000%60) <10 ? '0'+Math.floor(t/1000%60) : Math.floor(t/1000%60);
                if(d>0){
                    h=d*24+parseInt(h);
                }
                $scope.info.remainTime =h+'时'+m+'分'+s+'秒';
            }else{
                $scope.control.can_exec = true;
            }
            $scope.$applyAsync();
        };
         _time_interval = $interval($scope.SetTimer,1000);
    };
    //获取项目详细信息
    var getProj = function() {
        Exec.getSysPubDetail(_sys_id, _proj_id).then(function(data) {
            if(data.pj_info_detail){
                $scope.info.proj_info = data.pj_info_detail;
                $scope.info.proj_info.project_status = data.pj_info_detail.syspublish_status ? data.pj_info_detail.syspublish_status : 1;
                if(data.pj_info_detail.syspublish_status == 1) {//防止第三方重置后任然刷新
                    $state.go("routine_release");
                };
                $scope.info.proj_info.project_status_cn = CV.findValue($scope.info.proj_info.project_status, ProjState);
            }
        }, function(error) {
            Modal.alert("获取系统发布信息异常："+error.message,3);
            $state.go("routine_release");
        });
    };
    //第一次进入获取相应的信息
    var getFirstProj =function () {
        Exec.getSysPubDetail(_sys_id, _proj_id).then(function(data) {
            if(data.pj_info_detail){
                _execute_id = data.pj_info_detail.execute_id;
                if($scope.control.is_quick_publish != 2){
                    $state.go('agile_pub_exe.console',{execute_id:_execute_id,stop_flag:1});
                }else{
                    $state.go('pub_exec.console',{execute_id:_execute_id,stop_flag:1});
                }
                $scope.info.proj_info = data.pj_info_detail;
                $scope.info.proj_info.project_status = data.pj_info_detail.syspublish_status ? data.pj_info_detail.syspublish_status : 1;
                if($scope.info.exec_type == 1){
                    dealAvaiableTime(data);
                    /*if( $scope.control.is_quick_publish == 1){
                        $scope.control.can_exec = true;
                    }*/
                }else{
                    $scope.control.can_exec = true;
                }
                if(data.pj_info_detail.syspublish_status == 1) {//防止第三方重置后任然刷新
                    $state.go("routine_release");
                };
                $scope.info.proj_info.project_status_cn = CV.findValue($scope.info.proj_info.project_status, ProjState);
                //第一次获取各阶段信息
                Monitor.monitorPjProject(_execute_id).then(function (data) {
                    if(data.group_list){
                        $scope.info.reset_phases = [];
                        $scope.info.instance_info.steps = data.group_list ? data.group_list : [];
                        $scope.info.phase_node_info.nodes_info.node_list = getAllExecNodes($scope.info.instance_info.steps);
                        $scope.control.curr._phase = data.current_phase_no ? data.current_phase_no : 1;
                        $scope.control.curr._node = data.current_phase_ip;
                        for(var i=0;i<$scope.info.instance_info.steps.length;i++){
                            var _group = $scope.info.instance_info.steps[i];
                            _group.expand_flag = true;
                            for(var j=0;j<_group.phase_list.length;j++){
                                var _phase = _group.phase_list[j];
                                _phase.is_check = false;
                                _phase.time_used = _phase.time_used ? _phase.time_used : 0;
                                if(_phase.phase_type <= 3){
                                    if(_phase.node_list){
                                        for( var m = 0; m< _phase.node_list.length; m++){
                                            if($scope.control.curr._node == _phase.node_list[m].exec_node_ip){
                                                _phase.exe_script = CmptFunc.cmdsToString(_phase.node_list[m].cmds);
                                            }else{
                                                _phase.exe_script = CmptFunc.cmdsToString(_phase.node_list[0].cmds);
                                            }
                                        }
                                    }
                                }
                                if(_phase.phase_type == 6){
                                    if(_phase.cmds){
                                        _phase.url_detail = $sce.trustAsHtml(_phase.cmds[0])
                                    }
                                }
                                if($scope.control.curr._phase == _phase.phase_no){
                                    if(_has_check){
                                        _phase.is_check = true;
                                        $scope.info.phase_node_info.phase_no = _phase.phase_no;
                                        $scope.info.phase_node_info.phase_status = _phase.phase_status;
                                        $scope.info.phase_node_info.nodes_info.parallel_flag = _phase.parallel_flag;
                                        if(_phase.node_list){
                                            $scope.info.phase_node_info.nodes_flag = false;
                                            dealPhaseNodeData(_phase.node_list);
                                        }else{
                                            $scope.info.phase_node_info.nodes_flag = true;
                                        }
                                        if($scope.info.phase_node_info.nodes_info.node_list){
                                            $scope.info.phase_node_info.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.phase_node_info.nodes_info.node_list);
                                            $scope.info.phase_node_info.expand_flag = ($scope.info.phase_node_info.nav_show_flag == 2) ? true : false;
                                        }
                                    }
                                }
                            }
                        }
                        if(data.current_phase_status == 3) {
                            $scope.control.curr._load = false;
                            $scope.control.show_prod_error = true;
                            $scope.control.exec_btn = {phase: false, auto: false,skip: true};
                            $interval.cancel(_exec_interval);
                            if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);
                        }
                        if(data.current_phase_status == 2) {
                            $scope.control.curr._load = true;
                            $scope.control.exec_btn = {phase: true, auto: true,skip: true};
                            //刷新日志服务
                            _refresh_log_interval = $interval(function () {
                                getSteps();
                            }, 2000);
                        }
                        if(data.current_phase_status == 1 && _auto_yn_flag == 1 && $scope.info.proj_info.project_status == 3) {
                            $scope.control.curr._load = false;
                            $scope.control.exec_btn = {phase: true, auto: true,skip: true};
                            $interval.cancel(_exec_interval);
                            if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);
                        }
                        if(data.current_phase_no == -1){
                            _exec_success_flag ++;
                            $scope.control.curr._load = false;
                            $scope.control.exec_btn = {phase: false, auto: false ,skip : false};
                            if($scope.info.exec_type == 1){
                                $scope.info.proj_info.project_status = 4;
                                if(_exec_success_flag < 2){
                                    Modal.alert("恭喜！项目发布成功！").then(function(data) {
                                        if(data){
                                            if($scope.control.is_quick_publish == 1){
                                                Exec.shutDownQuickProj(_sys_id,_proj_id ,1).then(function (data) {
                                                },function (error) {
                                                    Modal.alert(error.message,3)
                                                });
                                            }else{
                                               /* showSummaryModel(_proj_id, _sys_id);*/
                                                var _summary = {
                                                    business_sys_name       : _sys_id,
                                                    syspublish_id            : _proj_id,
                                                    prod_flag               : $scope.control.show_prod_error ? 2:1,
                                                    problem_type_list       : [],
                                                    project_evaluate_list   : [],
                                                    project_bk_evaluate     : '未评价',
                                                    project_evaluate        : {},
                                                    notice_type             : 1, //1 为邮件 2 为短信
                                                    notice_users            : [], // 所要发送人email的列表
                                                    user_cn_name            : '', //单个发送人
                                                    feedback_msg            : '',//反馈信息
                                                };
                                                Exec.summaryProd(_summary).then(function(data) {
                                                    getProj();
                                                    $scope.control.exec_btn = {phase: false, step: false, reset: false};
                                                }, function(error) {
                                                });
                                            }
                                        }
                                    });
                                }
                            }else{
                                $scope.info.proj_info.project_status = 7;
                                if(_exec_success_flag < 2){
                                    Modal.alert("恭喜！项目回退成功！").then(function(data) {
                                        /*showRollbackSummaryModel(_proj_id, _sys_id ,$scope.info.proj_info.project_status);*/
                                       var _rollback_summary = {
                                           business_sys_name       : _sys_id,
                                           syspublish_id            : _proj_id,
                                           project_bk_evaluate     : '未评价',           //发布评价
                                           rollback_flag           : $scope.info.proj_info.project_status,  //回退结果
                                           evaluate_user_cn_name   : '', //评价人
                                           notice_type             : 1, //1 为邮件 2 为短信
                                           notice_users            : [], // 所要发送人email的列表
                                           user_cn_name            : '', //单个发送人
                                           feedback_msg            : '',//反馈信息
                                       };
                                        Exec.editRollbackSummary(_rollback_summary).then(function(data) {

                                        }, function(error) {

                                        });
                                    });
                                }
                            }
                            if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);
                        }
                        if($scope.control.curr._phase == -1){
                            var _last_group =  $scope.info.instance_info.steps[$scope.info.instance_info.steps.length-1];
                            var _last_phase =  _last_group.phase_list[_last_group.phase_list.length-1];
                            $scope.info.phase_node_info.phase_no = _last_phase.phase_no;
                            $scope.info.phase_node_info.phase_status = _last_phase.phase_status;
                            $scope.info.phase_node_info.nodes_info.parallel_flag = _last_phase.parallel_flag;
                            if($scope.info.phase_node_info.nodes_info.node_list){
                                for(var k=0;k<$scope.info.phase_node_info.nodes_info.node_list.length;k++){
                                    $scope.info.phase_node_info.nodes_info.node_list[k].is_show = false;
                                }
                            }
                            if(_last_phase.node_list){
                                $scope.info.phase_node_info.nodes_flag = false;
                                dealPhaseNodeData(_last_phase.node_list);
                            }else{
                                $scope.info.phase_node_info.nodes_flag = true;
                            }
                            _last_phase.is_check = true;
                        }
                        //绑定当前阶段和步骤
                        ProdFunc.bindCurrPhaseAndStep($scope.control.curr._phase,$scope.info.instance_info.steps,$scope.control.curr);
                        //可重置阶段列表
                        ProdFunc.pushAllCanResetPhase($scope.info.instance_info.steps,$scope.info.reset_phases);
                        //初始化所有阶段步骤的滚动高度和codemirror加载问题
                        $timeout(function () {
                            $scope.control.code_mirror_control = true;
                            if($scope.control.curr._phase != -1){
                                initScollHeights($scope.control.curr._phase);
                            }
                        },200)
                    }
                }, function (error) {
                    Modal.alert(error.message,3);
                    //初始化数据错误，直接返回列表
                    if($scope.control.is_quick_publish == 1){
                        // $location.url("/quick_prod_list");
                    }else{
                        // $location.url("/prod_exec_list/prod_do_list");
                    }
                });
            }
        }, function(error) {
            Modal.alert("获取系统发布信息异常："+error.message,3);
            $state.go("routine_release");
        });
    };
    //获取执行步骤信息列表
    var getSteps = function() {
        Monitor.monitorPjProject(_execute_id).then(function (data) {
            if(data.group_list){
                var _temp_steps = data.group_list ? data.group_list : [];
                $scope.info.reset_phases = [];
                $scope.control.curr._phase = data.current_phase_no ? data.current_phase_no : 1;
                $scope.control.curr._node = data.current_phase_ip;
                for(var i=0;i<_temp_steps.length;i++){
                    var _group = _temp_steps[i];
                    for(var j=0;j<_group.phase_list.length;j++){
                        var _new_phase = _group.phase_list[j];
                        var _phase = $scope.info.instance_info.steps[i].phase_list[j];
                        if(_phase){
                            _phase.time_used = _new_phase.time_used ? _new_phase.time_used : 0;
                            _phase.exe_msg = _new_phase.exe_msg ? _new_phase.exe_msg : '';
                            _phase.phase_status = _new_phase.phase_status;
                            _phase.end_bk_tm = _new_phase.end_bk_tm ? _new_phase.end_bk_tm  : '';
                            _phase.start_bk_tm = _new_phase.start_bk_tm ? _new_phase.start_bk_tm  : '';
                            _phase.parallel_flag = _new_phase.parallel_flag;
                            _phase.is_check = false;
                            if(_new_phase.node_list){
                                for(var k=0;k<_new_phase.node_list.length;k++){
                                    var _node = _phase.node_list[k];
                                    if(_phase.exe_script && _node.cmds){
                                        if($scope.control.curr._node == _node.exec_node_ip){
                                            _phase.exe_script = CmptFunc.cmdsToString(_node.cmds);
                                        }else{
                                            _phase.exe_script = CmptFunc.cmdsToString( _phase.node_list[0].cmds);
                                        }
                                    }
                                    _node.node_status = _new_phase.node_list[k].node_status;
                                    _node.exe_msg = _new_phase.exe_msg
                                }
                            }
                            if($scope.control.curr._phase == _new_phase.phase_no){
                                if(_has_check){
                                    _phase.is_check = true;
                                    $scope.info.phase_node_info.phase_no = _phase.phase_no;
                                    $scope.info.phase_node_info.phase_status = _phase.phase_status;
                                    $scope.info.phase_node_info.nodes_info.parallel_flag = _phase.parallel_flag;
                                    if($scope.info.phase_node_info.nodes_info.node_list){
                                        for(var k=0; k< $scope.info.phase_node_info.nodes_info.node_list.length;k++){
                                            $scope.info.phase_node_info.nodes_info.node_list[k].is_show = false;
                                        }
                                    }
                                    if(_phase.node_list){
                                        $scope.info.phase_node_info.nodes_flag = false;
                                        dealPhaseNodeData(_phase.node_list);//处理阶段节点数据信息
                                    }else{
                                        $scope.info.phase_node_info.nodes_flag = true;
                                    }
                                    if($scope.info.phase_node_info.nodes_info.node_list){
                                        $scope.info.phase_node_info.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.phase_node_info.nodes_info.node_list);
                                        $scope.info.phase_node_info.expand_flag = ($scope.info.phase_node_info.nav_show_flag == 2) ? true : false;
                                    }
                                }
                            }
                        }
                    }
                };
                cancelMonitorNodeMsg($scope.info.phase_node_info.nodes_info.node_list,false);
                if(data.current_phase_status == 3) {
                    $scope.control.curr._load = false;
                    $scope.control.show_prod_error = true;
                    $scope.control.exec_btn = {phase: false, auto: false,skip: true};
                    $interval.cancel(_exec_interval);
                }
                if(data.current_phase_status == 2) {
                    $scope.control.curr._load = true;
                    $scope.control.exec_btn = {phase: true, auto: true,skip: true};
                }
                if(data.current_phase_status == 1  && $scope.info.proj_info.project_status == 3) {
                    $scope.control.curr._load = false;
                    $scope.control.exec_btn = {phase: true, auto: true,skip: true};
                    $interval.cancel(_exec_interval);
                }
                if(data.current_phase_no == -1){
                    _exec_success_flag ++;
                    $scope.control.curr._load = false;
                    $scope.control.exec_btn = {phase: false, auto: false ,skip : false};
                    if($scope.info.exec_type == 1){
                        $scope.info.proj_info.project_status = 4;
                        if(_exec_success_flag < 2){
                            Modal.alert("恭喜！项目发布成功！").then(function(data) {
                                if(data){
                                    if($scope.control.is_quick_publish == 1){
                                        Exec.shutDownQuickProj(_sys_id,_proj_id ,1).then(function (data) {
                                        },function (error) {
                                            Modal.alert(error.message,3)
                                        });
                                    }else{
                                        /*showSummaryModel(_proj_id, _sys_id);*/
                                        var _summary = {
                                            business_sys_name       : _sys_id,
                                            syspublish_id            : _proj_id,
                                            prod_flag               : $scope.control.show_prod_error ? 2:1,
                                            problem_type_list       : [],
                                            project_evaluate_list   : [],
                                            project_bk_evaluate     : '未评价',
                                            project_evaluate        : {},
                                            notice_type             : 1, //1 为邮件 2 为短信
                                            notice_users            : [], // 所要发送人email的列表
                                            user_cn_name            : '', //单个发送人
                                            feedback_msg            : '',//反馈信息
                                        };
                                        Exec.summaryProd(_summary).then(function(data) {
                                            getProj();
                                            $scope.control.exec_btn = {phase: false, step: false, reset: false};
                                        }, function(error) {
                                        });
                                    }
                                }
                            });
                        }
                    }else{
                        $scope.info.proj_info.project_status = 7;
                        if(_exec_success_flag < 2){
                            Modal.alert("恭喜！项目回退成功！").then(function(data) {
                                /*showRollbackSummaryModel(_proj_id, _sys_id ,$scope.info.proj_info.project_status);*/
                                var _rollback_summary = {
                                    business_sys_name       : _sys_id,
                                    syspublish_id            : _proj_id,
                                    project_bk_evaluate     : '未评价',           //发布评价
                                    rollback_flag           : $scope.info.proj_info.project_status,  //回退结果
                                    evaluate_user_cn_name   : '', //评价人
                                    notice_type             : 1, //1 为邮件 2 为短信
                                    notice_users            : [], // 所要发送人email的列表
                                    user_cn_name            : '', //单个发送人
                                    feedback_msg            : '',//反馈信息
                                };
                                Exec.editRollbackSummary(_rollback_summary).then(function(data) {

                                }, function(error) {

                                });
                            });
                        }
                    }
                }
                if($scope.control.curr._phase == -1){
                    var _last_group =  $scope.info.instance_info.steps[$scope.info.instance_info.steps.length-1];
                    var _last_phase =  _last_group.phase_list[_last_group.phase_list.length-1];
                    $scope.info.phase_node_info.phase_no = _last_phase.phase_no;
                    $scope.info.phase_node_info.phase_status = _last_phase.phase_status;
                    $scope.info.phase_node_info.nodes_info.parallel_flag = _last_phase.parallel_flag;
                    if($scope.info.phase_node_info.nodes_info.node_list){
                        for(var k=0; k < $scope.info.phase_node_info.nodes_info.node_list.length; k++){
                            $scope.info.phase_node_info.nodes_info.node_list[k].is_show = false;
                        }
                    }
                    if(_last_phase.node_list){
                        $scope.info.phase_node_info.nodes_flag = false;
                        dealPhaseNodeData(_last_phase.node_list);//处理阶段节点数据信息
                    }else{
                        $scope.info.phase_node_info.nodes_flag = true;
                    }
                    _last_phase.is_check = true;
                }
                //绑定当前阶段和步骤
                ProdFunc.bindCurrPhaseAndStep($scope.control.curr._phase,$scope.info.instance_info.steps,$scope.control.curr);
                //可重置阶段列表
                ProdFunc.pushAllCanResetPhase($scope.info.instance_info.steps,$scope.info.reset_phases);
                //初始化所有阶段步骤的滚动高度和codemirror加载问题
                $timeout(function () {
                    $scope.control.code_mirror_control = true;
                    if($scope.control.curr._phase != -1){
                        if(_scroll_flag){
                            initScollHeights($scope.control.curr._phase);
                        }
                    }
                },200);
                //此处为交互式弹窗
                if(data.interact_flag && data.current_phase_status == 2){
                    if(_exec_interval) $interval.cancel(_exec_interval);
                    if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);
                    if(_interact_flag == 0){
                        if(data.impl_type === 6){
                            //SQL交互式
                            Modal.interactiveExecute(_execute_id,data.phase_bk_desc).then(function (result) {
                                if(result){
                                    $scope.control.curr._load = false;
                                    $scope.control.exec_btn = {phase: true,auto: true ,skip : true};
                                    getSteps();
                                    _interact_flag = 0;
                                    _scroll_flag = true; //阶段成功自动滚动到下一阶段
                                }
                            })
                        }else {
                            //非SQL交互
                            Modal.interactOperation(_execute_id , $scope.control.curr._phase ,$scope.info.instance_info.steps).then(function (data) {
                                if(data){
                                    $scope.control.curr._load = false;
                                    $scope.control.exec_btn = {phase: true,auto: true ,skip : true};
                                    getSteps();
                                }else{
                                    //这里调执行停止的服务
                                    Exec.stopByStep(_execute_id).then(function(data) {
                                        if(data){
                                            $scope.control.curr._load = false;
                                            $scope.control.exec_btn = {phase: false, auto:false, skip : true};
                                            getSteps();
                                            Modal.alert("停止成功",2);
                                            if(_exec_interval) $interval.cancel(_exec_interval);
                                            if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);
                                        }
                                    },function (error) {
                                        Modal.alert(error.message,3);
                                        //补齐页面日志内容和节点状态
                                        getSteps();
                                        if(_exec_interval) $interval.cancel(_exec_interval);
                                        if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);
                                    });
                                }
                                _interact_flag = 0;
                                _scroll_flag = true; //阶段成功自动滚动到下一阶段
                            });
                        }
                    }
                    _interact_flag++;
                }
            }
        }, function (error) {
            // $location.url("/prod_exec_list/prod_do_list");
        });
    };
    //处理单个阶段节点数据
    var dealPhaseNodeData = function(node_list){
        for(var m=0; m< node_list.length; m++){
            var _node = node_list[m];
            for(var n=0; n < $scope.info.phase_node_info.nodes_info.node_list.length; n++){
                var _exec_node = $scope.info.phase_node_info.nodes_info.node_list[n];
                if(_node.exec_node_ip == _exec_node.exec_ip){
                    _exec_node.is_show = true;
                    _exec_node.exec_node_ip =_node.exec_node_ip;
                    _exec_node.exec_protocol_type = _node.exec_protocol_type;
                    _exec_node.exec_soc_name = _node.exec_soc_name;
                    _exec_node.exe_msg = _node.exe_msg;
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
    //监控节点端口等信息
    var getMonitorNodeMsg = function (soc_ip , node) {
        Exec.monitorNodeMsg(_sys_id, soc_ip).then(function (data) {
            if(data){
                node.node_monitor_msg = data.monitor_result_list ? data.monitor_result_list : [];
                if(node.show_detail){
                    $timeout(function () {
                        getMonitorNodeMsg(soc_ip , node)
                    },5000)
                }
            }
        },function (error) {
            if(node.show_detail){
                $timeout(function () {
                    getMonitorNodeMsg(soc_ip , node)
                },5000)
            }
        });
    };
    //清除各阶段节点端口的监控服务
    var cancelMonitorNodeMsg = function (node_list ,flag) {
        for(var i=0;i<node_list.length;i++){
            var _node = node_list[i];
            if(flag){
                _node.show_detail = false;
            }else {
                if(!_node.is_show){
                    _node.show_detail = false;
                }
            }
        }
    };
    //判断当前用户是否是可执行的用户
    var canExec = function() {
        Exec.canExec(_sys_id, _proj_id).then(function(data){
            $scope.control.is_Exec=true;
        }, function(error) {
            $scope.control.is_Exec=false;
            Modal.confirm(error.message+" 是否离开当前界面").then(function(){
                if($scope.control.is_quick_publish == 1){
                    $state.go("agile_pub_list");
                }else{
                    $state.go("routine_release");
                }
            });
        });
    };
    //总结评价框
    var showSummaryModel = function(projectName, busiSys) {
        Modal.summary(projectName, busiSys).then(function(data) {
            getProj();
            $scope.control.exec_btn = {phase: false, step: false, reset: false};
        });
    };
    //阶段执行
    var execPhaseFunc = function (phaseId, skip_flag) {
        isExecuteAuthor(isNeedAuthor(),function(){
            $scope.control.curr._load = true;
            _scroll_flag = false;//每次按阶段执行时滚动条不跟随
            if(skip_flag){
                $scope.control.exec_btn = {phase: true, auto:true,skip : false};
            }else{
                $scope.control.exec_btn = {phase: false, auto:true,skip: true};
            }
            if($scope.info.exec_type == 1){
                $scope.info.proj_info.project_status = 3;    //点击执行后直接改状态到“执行中”
                $scope.info.proj_info.project_status_cn = CV.findValue(3, ProjState);
            }else{
                $scope.info.proj_info.project_status = 6;    //点击执行后直接改状态到“回退中”
                $scope.info.proj_info.project_status_cn = CV.findValue(6, ProjState);
            }
            //刷新阶段服务
            _refresh_log_interval = $interval(function () {
                getSteps();
            }, 2000);
            Exec.execByPhase(_execute_id, phaseId, skip_flag).then(function(data) {
                if(data){
                    if(data.interact_flag){
                        /*Modal.interactOperation(_execute_id , phaseId ,$scope.info.instance_info.steps).then(function (data) {
                            if(data){
                                $scope.control.curr._load = false;
                                $scope.control.exec_btn = {phase: true,auto: true ,skip : true};
                                getSteps();
                            }else{
                                Exec.stopByStep(_execute_id).then(function(data) {
                                    if(data){
                                        //这里调执行停止的服务
                                        $scope.control.curr._load = false;
                                        $scope.control.exec_btn = {phase: false, auto:false, skip : true};
                                        getSteps();
                                        Modal.alert("停止成功",2);
                                        if(_exec_interval) $interval.cancel(_exec_interval);
                                        if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);
                                    }
                                },function (error) {
                                    Modal.alert(error.message,3);
                                    //补齐页面日志内容和节点状态
                                    getSteps();
                                    if(_exec_interval) $interval.cancel(_exec_interval);
                                    if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);
                                });
                            }
                        });*/
                        //停止刷新日志
                        $interval.cancel(_refresh_log_interval);
                    }else{
                        getSteps();
                        $scope.control.curr._load = false;
                        _scroll_flag = true; //阶段成功自动滚动到下一阶段
                        //停止刷新日志
                        $interval.cancel(_refresh_log_interval);
                        //判断是否存在日志
                        if(!$scope.info.proj_info.prolog_path){
                            getProj();
                        }
                    }
                }
            }, function (error) {
                $scope.control.curr._load = false;
                Modal.alert(error.message,3);
                $scope.control.exec_btn = {phase: true,auto: true ,skip : true};
                //补齐页面日志内容和节点状态
                getSteps();
                //清楚日志服务刷新
                $interval.cancel(_refresh_log_interval);
            });
        });
    };
    //判断是否需要授权
    var isNeedAuthor = function(){
        _has_author = ($scope.info.proj_info.project_status == 3 || $scope.info.proj_info.project_status == 6) ? true:false;            //是否已经授权过
        //是否授权过
        if(_has_author){
            return false;
        }
        //是否到指定的执行时间
        if(!$scope.control.can_exec){
            return false;
        }
        return true;
    }
    //判断是否授权执行
    var isExecuteAuthor = function(flag,executeFunc){
        if(flag){
            //授权执行
            Exec.excuteLocalAuthor(_proj_id).then(function(data){
                _has_author = true;
                executeFunc();
            },function(error){
                Modal.alert(error.message,3)
            });
        }else{
            executeFunc();
        }
    };
    //重置各个阶段的选中状态
    var resetPhaseStatus = function (steps_list) {
        for(var i=0;i<steps_list.length;i++){
            var _step = steps_list[i];
            for(var j=0;j<_step.phase_list.length;j++){
                _step.phase_list[j].is_check = false;
            }
        }
    };
    //页面初始化
    var init = function() {
        if(_auto_yn_flag == 1){
            $scope.control.curr._load = true;
            _exec_interval = $interval(function() {
                getProj();
                getSteps();
            }, 5000);
            getProj();
            getSteps();
            $scope.$watch('info.proj_info', function(newValue, oldValue) {
                var _project_status = newValue.project_status;
                if(_project_status > 3 && _project_status != 6){
                    if(_exec_interval) $interval.cancel(_exec_interval);
                }
            }, true);
        }
        getFirstProj(); //获取项目信息
        if($scope.info.exec_type == 1){
            canExec();      //判断是否可执行
        }else{
            $scope.control.is_Exec=true;
        }
        //验证导出实例目录存不存在
        Exec.getInstanceImportPath().then(function(data){
            $scope.config.import_fileupload.uploadpath = data.instance_import_dir ? data.instance_import_dir : '';
        },function(error){
            Modal.alert(error.message,3);
        });
        $('body').addClass("over_flow_y");
    };
    //返回敏捷发布页面
    $scope.backToQuickProj = function(){
        Modal.confirm("确定要关闭敏捷发布项目并返回发布页？").then(function() {
            if($scope.info.exec_type == 1){
                $scope.control.curr._load = false;
                Exec.shutDownQuickProj(_sys_id,_proj_id ,2).then(function (data) {
                    if(data){
                        $state.go('agile_pub_pre',{modify_flag:2,proj_name:_proj_id,sys_name:_sys_id});
                    }
                },function (error) {
                    Modal.alert(error.message,3)
                });
            }
        });
    };
    //下载文件
    $scope.downloadFile = function(path){
        CV.downloadFile(path);
    };
    //按阶段执行
    $scope.execByPhase = function(phaseId, phaseName, _skip_flag) {
        _has_check = true;
        var skip_flag = (_skip_flag == 1) ? false : true;
        if(skip_flag){
            Modal.confirm("是否要跳过"+"["+"#"+$scope.control.curr._phaseDesc+"]"+"阶段").then(function () {
                execPhaseFunc(phaseId,skip_flag);
            })
        }else{
            execPhaseFunc(phaseId,skip_flag);
        }
    };
    //一键执行
    $scope.execAuto = function (phaseId) {
        isExecuteAuthor(isNeedAuthor(),function(){
            _has_check = true;
            $scope.control.curr._load = true;
            _scroll_flag = true;//每次按阶段执行时滚动条不跟随
            $scope.control.exec_btn = {phase: true, auto:false,skip: true};
            if($scope.info.exec_type == 1){
                $scope.info.proj_info.project_status = 3;    //点击执行后直接改状态到“执行中”
                $scope.info.proj_info.project_status_cn = CV.findValue(3, ProjState);
            }else{
                $scope.info.proj_info.project_status = 6;    //点击执行后直接改状态到“回退中”
                $scope.info.proj_info.project_status_cn = CV.findValue(6, ProjState);
            }
            //刷新阶段服务
            _refresh_log_interval = $interval(function () {
                getSteps();
            }, 3000);

            Exec.autoExecByphase(_execute_id, phaseId).then(function (data) {
                if(data){
                    $scope.control.curr._load = false;
                    getSteps();
                    $interval.cancel(_refresh_log_interval);
                    //判断是否存在日志
                    if(!$scope.info.proj_info.prolog_path){
                        getProj();
                    }
                }
            },function (error) {
                $scope.control.curr._load = false;
                Modal.alert(error.message,3);
                $scope.control.exec_btn = {phase: true,auto: true ,skip : true};
                //补齐页面日志内容和节点状态
                getSteps();
                $interval.cancel(_refresh_log_interval);
            });
        });
    };
    //滚动到重置的阶段
    $scope.scollToResetPhase = function(phaseId) {
        $scope.control.reset_id = phaseId;
        initScollHeights(phaseId);
    };
    //取消阶段重置
    $scope.cancelResetPhase = function() {
        $scope.control.reset_id = 0;
        initScollHeights($scope.control.curr._phase);
    };
    //阶段重置
    $scope.resetPhase = function(phase) {
        Modal.confirm("确定要重置到阶段["+phase.phase_bk_desc+"]?").then(function() {
             Exec.resetPhase(phase.phase_no, _execute_id).then(function(data) {
                 $timeout(function () {
                     _has_check = true;
                     _exec_success_flag = 0;//重置后恢复初始状态
                     _scroll_flag = true;
                     $scope.control.show_prod_error = false;
                     $scope.control.exec_btn = {phase: true, auto: true ,skip : true};
                     getSteps();
                 },0)
             }, function(error) {
                 Modal.alert(error.message,3);
             });
        });
    };
    //暂停
    $scope.pauseRunning=function(){
        Modal.confirm("是否要暂停正在执行的阶段?").then(function () {
            Exec.execPauseRunning(_execute_id).then(function (data) {
                if(data){
                    getSteps();
                    Modal.alert("暂停成功",2);
                    //这里调执行暂停的服务
                    $scope.control.curr._load = false;
                    $scope.control.exec_btn = {phase: true, auto:true, skip : true};
                    if(_exec_interval) $interval.cancel(_exec_interval);
                    if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);

                }
            },function (error) {
                Modal.alert(error.message,3);
                //补齐页面日志内容和节点状态
                getSteps();
                if(_exec_interval) $interval.cancel(_exec_interval);
                if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);
            });
        });
    };
    //停止
    $scope.stopRunning = function () {
        Modal.confirm("是否要停止" +$scope.control.curr._phaseDesc +"的阶段?").then(function () {
            Exec.stopByStep(_execute_id).then(function(data) {
                if(data){
                    //这里调执行停止的服务
                    $scope.control.curr._load = false;
                    $scope.control.exec_btn = {phase: false, auto:false, skip : true};
                    getSteps();
                    Modal.alert("停止成功",2);

                    if(_exec_interval) $interval.cancel(_exec_interval);
                    if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);
                }
            },function (error) {
                Modal.alert(error.message,3);
                //补齐页面日志内容和节点状态
                getSteps();
                if(_exec_interval) $interval.cancel(_exec_interval);
                if(_refresh_log_interval) $interval.cancel(_refresh_log_interval);
            });
        });
    };
    //发布总结评价
    $scope.showSummary = function() {
        showSummaryModel(_proj_id, _sys_id);
    };
    //回退评价
    $scope.showRollbackSummary = function() {
        showRollbackSummaryModel(_proj_id, _sys_id,$scope.info.proj_info.project_status);
    };
    //手动关闭
    $scope.shutDown = function() {
        Modal.confirm("确定要手动结束当前执行项目？").then(function() {
            if($scope.info.exec_type == 1){
                $scope.control.curr._load = false;
                if($scope.control.is_quick_publish == 1){
                    Exec.shutDownQuickProj(_sys_id,_proj_id ,2).then(function (data) {
                        if(data){
                            getProj();
                            $scope.control.exec_btn = {phase: false, step: false, reset: false};
                        }
                    },function (error) {
                        Modal.alert(error.message,3)
                    });
                }else{
                    //手动结束的项目状态
                    /*showSummaryModel(_proj_id, _sys_id);*/
                   var _summary = {
                        business_sys_name       : _sys_id,
                        syspublish_id            : _proj_id,
                        prod_flag               : $scope.control.show_prod_error ? 2:1,
                        problem_type_list       : [],
                        project_evaluate_list   : [],
                        project_bk_evaluate     : '未评价',
                        project_evaluate        : {},
                        notice_type             : 1, //1 为邮件 2 为短信
                        notice_users            : [], // 所要发送人email的列表
                        user_cn_name            : '', //单个发送人
                        feedback_msg            : '',//反馈信息
                    };
                    Exec.summaryProd(_summary).then(function(data) {
                        getProj();
                        $scope.control.exec_btn = {phase: false, step: false, reset: false};
                    }, function(error) {
                    });
                }
            }else{
                $scope.info.proj_info.project_status = 8;
                $scope.control.exec_btn = {phase: false, auto: false ,skip : false};
                $scope.control.curr._load = false;
                //手动结束的项目状态
                /*showRollbackSummaryModel(_proj_id, _sys_id,$scope.info.proj_info.project_status);*/
                var _rollback_summary = {
                    business_sys_name       : _sys_id,
                    syspublish_id            : _proj_id,
                    project_bk_evaluate     : '未评价',           //发布评价
                    rollback_flag           : $scope.info.proj_info.project_status,  //回退结果
                    evaluate_user_cn_name   : '', //评价人
                    notice_type             : 1, //1 为邮件 2 为短信
                    notice_users            : [], // 所要发送人email的列表
                    user_cn_name            : '', //单个发送人
                    feedback_msg            : '',//反馈信息
                };
                Exec.editRollbackSummary(_rollback_summary).then(function(data) {

                }, function(error) {

                });
            }

        });
    };
    //控制台缩放效果
    $scope.toggleMinimize = function() {
        $timeout(function () {
            var _height = _codeDiv.height();
            var _console_desk_div = $('#consoleDesk');//控制台dome对象
            $scope.control.is_log_minisize = !$scope.control.is_log_minisize;
            _console_desk_div.css('height', _console_desk_div.height() == 25 ? '200' : '25');
            if($scope.control.is_log_minisize){
                _codeDiv.css('height',_height + 180);
            }else{
                _codeDiv.css('height',_height - 200 + 20);
            }
        },10)
    };
    //导入实例
    $scope.importInstance = function(){
        var _path = $scope.config.import_fileupload.uploadpath+ $scope.config.import_fileupload.filename;
        Exec.importInstance(_execute_id, _path).then(function(data){
            init();
            $scope.control.exec_btn = {phase: true,auto: true ,skip : true};
            $scope.control.show_prod_error = false;
        },function(error){
            Modal.alert(error.message,3);
        });
    };
    //导出实例
    $scope.exportInstance = function(){
        Exec.getInstanceFullPath(_execute_id).then(function(data){
            if(data.instance_full_path){
                var _path = data.instance_full_path;
                CV.downloadFile(_path);
            }
        },function(error){
            Modal.alert(error.message,3);
        });
    };
    //鼠标移入显示倒计时
    $scope.changeTime = function () {
        $scope.control.show_plan_time = true;
    };
    //鼠标离开还原服务器时间
    $scope.resetTime = function () {
        $scope.control.show_plan_time = false;
    };
    //选择对应阶段显示节点信息
    $scope.chooseNodeConfig = function (group_no,phase_no,phase,steps_list) {
        _has_check = false;
        resetPhaseStatus(steps_list);
        phase.is_check = true;
        $scope.control.get_nodes_loading = true;
        $timeout(function () {
            if($scope.info.phase_node_info.nodes_info.node_list){
                for(var k=0;k<$scope.info.phase_node_info.nodes_info.node_list.length;k++){
                    $scope.info.phase_node_info.nodes_info.node_list[k].is_show = false;
                }
            }
            if(steps_list[group_no].phase_list[phase_no].node_list){
                $scope.info.phase_node_info.nodes_flag = false;
                dealPhaseNodeData(steps_list[group_no].phase_list[phase_no].node_list);
                cancelMonitorNodeMsg($scope.info.phase_node_info.nodes_info.node_list,false)
            }else{
                $scope.info.phase_node_info.nodes_flag = true;
                cancelMonitorNodeMsg($scope.info.phase_node_info.nodes_info.node_list,true)
            }
            $scope.info.phase_node_info.phase_no = steps_list[group_no].phase_list[phase_no].phase_no;
            $scope.info.phase_node_info.phase_status = steps_list[group_no].phase_list[phase_no].phase_status;
            $scope.info.phase_node_info.nodes_info.parallel_flag = steps_list[group_no].phase_list[phase_no].parallel_flag;
            if($scope.info.phase_node_info.nodes_info.node_list){
                $scope.info.phase_node_info.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.phase_node_info.nodes_info.node_list);
                $scope.info.phase_node_info.expand_flag = ($scope.info.phase_node_info.nav_show_flag == 2) ? true : false;
            }
            $scope.control.get_nodes_loading = false;
        },500)
    };
    //对应阶段配置节点
    $scope.configNode = function (phase_info,phase) {
        Modal.configExeNode(phase_info,$scope.control.is_quick_publish).then(function (ret) {
            $scope.info.phase_node_info.nodes_info = ret;
            $scope.info.phase_node_info.phase_no = phase.phase_no;
            Exec.savePhaseExecNodeInfo(_execute_id, phase.phase_no,ret.node_list ,ret.parallel_flag).then(function (data) {
                for(var i=0;i<$scope.info.instance_info.steps.length;i++){
                    var _group = $scope.info.instance_info.steps[i];
                    for(var j=0;j<_group.phase_list.length;j++){
                        if(ret.phase_no == _group.phase[j].phase_no){
                            _group.phase[j] = $scope.info.phase_node_info.nodes_info;
                        }
                    }
                }
            },function (error) {
                Modal.alert(error.message,3);
            })
        });
    };
    //展开收起节点执行信息
    $scope.toggleNodeExecInfo = function (node ,info) {
        node.show_detail = !node.show_detail;
        //判断导航条是否显示标志
        info.nav_show_flag = CmptFunc.judgeShowDetail(info.nodes_info.node_list);
        info.expand_flag = (info.nav_show_flag == 2) ? true : false;
        if(node.show_detail){
            getMonitorNodeMsg(node.exec_node_ip , node);
        }
    };
    //展开所有节点
    $scope.expandAllNode = function (info) {
        info.nav_show_flag = CmptFunc.expandAllModules(info.nodes_info.node_list);
        for(var i=0;i<info.nodes_info.node_list.length;i++){
            var _node = info.nodes_info.node_list[i];
            if(_node.show_detail && _node.is_show){
                (function (ip , node) {
                    getMonitorNodeMsg(ip ,node);
               }(_node.exec_node_ip , _node))
            }
        }
    };
    //收起所有节点
    $scope.closeAllNode = function (info) {
        info.nav_show_flag = CmptFunc.closeAllModules(info.nodes_info.node_list);
    };
    //协议类型转化中文名
    $scope.getProtocolTypeCnName = function(protocol_type){
        return CV.findValue(protocol_type,ProtocolType).substring(0,5).toLowerCase();
    };
    //结果变更
    $scope.changeResult = function (node_info,phase_info) {
      Modal.execResultChange(node_info).then(function (ret) {
          Exec.handEditExecNodeInfo(_execute_id, phase_info.nodes_info.phase_no ,node_info.exec_node_ip,ret.msg ).then(function (data) {
              getSteps();
              $scope.control.exec_btn = {phase: true,auto: true ,skip : true};
              $scope.control.show_prod_error = false;
          },function (error) {
              Modal.alert(error.message,3)
          });

      });
    };
    //路由改变移除class
    $rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
        //清楚日志服务刷新
        $interval.cancel(_refresh_log_interval);
        if($scope.control.is_quick_publish == 1){
            if(fromState.name != 'agile_pub_exe'){
                $interval.cancel(_time_interval);
            }
        }else{
            if(fromState.name != 'pub_exec'){
                $interval.cancel(_time_interval);
            }
        }
        //清除每个阶段中的监控刷新
        cancelMonitorNodeMsg($scope.info.phase_node_info.nodes_info.node_list,true);
        $('body').removeClass("over_flow_y");
    });
    init();
    //计算内容的高度
    $scope.caculateHeight = function () {
        var _height = 0;
        if(!$scope.control.is_log_minisize){
            _height = $(window).height()-250-110;
        }else{
            _height = $(window).height()-250-110 + 180;
        }
        return {
            height :   _height + 'px',
        }
    };
    //计算控制台的宽度
    $scope.caculateConsoleWidth = function () {
        var _width = $('#codePanel').width();
        return {
            width :   _width + 'px',
        }
    };
    //计算控制台的宽度
    $scope.caculateConsoleWidth = function () {
        var _width = $('#codePanel').width();
        return {
            width :   _width + 'px',
        }
    };
}]);
 /**项目执行控制台信息**/
prodCtrl.controller('execConsoleCtrl', ["$scope", "$stateParams", "$rootScope", "$timeout", "$interval", "ProdFunc", "Exec","ScrollConfig", function($scope, $stateParams, $rootScope, $timeout, $interval, ProdFunc, Exec, ScrollConfig) {
    var _execute_id    = $stateParams.execute_id; //执行id
    var _stop_flag = $stateParams.stop_flag;//停止刷新

    var _exec_interval ;//内容刷新监听对象
    $scope.info = {
        console_msg : [],//控制台信息phases_msg_s
    };
    $scope.config = {
        scroll_console_info:ScrollConfig,
    };
    //控制台滚动
    var scrollText = function() {
        $timeout(function () {
            $scope.inscrollToBottom('bottom', {
                scrollEasing:"linear"
            });
        },1000);
    };
    //监控节点状态和执行日志
    var getMonitorExecLog = function() {
        Exec.getMonitorExecLogMsg(_execute_id).then(function(data){
            if(data){
                $scope.info.console_msg = data.phase ? data.phase : [];
            }
            ProdFunc.formatCmdStatus($scope.info.console_msg);
            //控制台滚动文字
            scrollText();
        });
    };
    //页面初始化
    var init = function() {
        // _exec_interval = $interval(function() {
        //     getMonitorExecLog();
        // }, 5000);
        getMonitorExecLog();//获取已执行日志
        if(_stop_flag != 1){
            $interval.cancel(_exec_interval);
        }
    };
    $rootScope.$on('$stateChangeSuccess',function(){
        //清楚日志服务刷新
        $interval.cancel(_exec_interval);
    });
    init();
}]);
/**
 * 项目准备提交模态框
 * */
prodCtrl.controller('submitModalCtrl', ["$scope", "$modalInstance", "$state", "Message", "Exec", "Modal", function ($scope, $modalInstance, $state,  Message, Exec, Modal) {
    $scope.message ='正在提交准备信息...';
    //项目准备
    Exec.saveReadyInfo(Message).then(function(data) {
        if(data){
            $modalInstance.close(true);
            Modal.prepareChoose(Message.syspublish_id,Message.sys_id).then(function (data) {
                if(data == 1){
                    $state.go('pub_exec',{sys_publish_id:Message.syspublish_id,sys_id:Message.sys_id,exec_type:1,quick_pub_flag:2,auto_yn_flag:2,path_flag: 1});
                }else{
                    $state.go("routine_release");
                }
            });
            // Modal.alert("项目准备成功，项目待执行！",2);
        }
    }, function(error) {
        Modal.alert(error.message,3);
        $modalInstance.close(false);
    });
}]);
/**
 *敏捷发布项目列表
 * */
pCtrl.controller('agileReleaseListCtrl', ["$scope", "$state","$timeout",  "Modal", "CV", function($scope, $state, $timeout, Modal, CV) {
    $scope.goToQuickProd = function () {
        $state.go('agile_pub_pre',{modify_flag:1,proj_name:'',sys_name:''});
    };
}]);
/**
 *敏捷发布-新建、准备
 * */
prodCtrl.controller('agilePubPreCtrl', ["$scope", "$state", "$stateParams","$timeout","$sce","$modal", "BusiSys", "Proj", "Exec", "ProjectNature","ProtocolType","CodeMirrorOption","CmptFunc","BsysFunc","ProdFunc","Collection","Project","Modal", "CV", function($scope, $state, $stateParams, $timeout,$sce,$modal, BusiSys, Proj, Exec, ProjectNature,ProtocolType,CodeMirrorOption,CmptFunc,BsysFunc,ProdFunc,Collection,Project, Modal, CV)  {
    var _qucik_back = $stateParams.modify_flag;
    var _sys_publish_id ;//系统发布编号（后台自动生成）
    var _sys_name ; //系统名
    var _project_name = '';//返回的项目编号
    var _propackage_bk_path="", //发布包根路径
        _fileupload_path = ''; //上传根路径
    var _free_config_phase_list = [];

    $scope.info = {
        pre_info : {
            register_flag:2,//项目类型，登记并执行
            business_sys_name:'',//系统名
            project_id : '', //项目id
            environment_id:'',//环境id
            upload_flag:2,  //包获得方式 1，版本机，2 从本地
            version_soc_name:'',//版本机数据源
            propackage_list:[],//包列表
            group_list :[],
            param_list:[],//参数列表
            config_file_list:[],//配置文件列表
            prog_id:'',//方案编号
            prog_info:{},//方案实例
        },
        dir_names:{}
    };
    //data数据对象
    $scope.data = {
        sys_list:[],            //系统列表
        project_list:[],        //项目列表
        program_list:[],        //方案列表
        env_list : [],          //环境列表
        node_list : [],         //节点列表
        ver_soc_list:[],        //版本数据源
        exe_soc_list :[],       //执行数据源
        solid_config_list:[],   //固化配置文件列表
        sub_tabs:[],//自定义配置文件列表
    };
    //按钮控制对象
    $scope.control = {
        is_selected_busisys : false, //判断是否选择了系统
        prog_list_loading   : false, //获取方案列表loading
        prog_loading        : false, //查看方案loading
        detail_prog_flag    : false, //查看方案标志
        valid_prog_complete : false, //验证方案完整性
        valid_prog_loading  : false, // 验证方案完整性loading
        get_business_loading: false, //获取业务系统loading
        node_list_loading : false, //有自定义配置文件时加载节点loading
        show_define_config: false, //显示有无自定义配置的标志
        package_exsit_flag: false,//包验证标志
        param_list_flag : false,//参数标志
        pre_info_loading:false,//获取准备信息loading
        form : {},
    };
    $scope.config = {
        config_tabs : [{active:true},{active:false}], //配置文件tabs
        viewOptions : CodeMirrorOption.Sh(true),//执行脚本codemirror配置
    };
    //new验证发布包添加完整性
    var valiProdPacComplete = function(){
        for(var i=0 ; i< $scope.info.pre_info.propackage_list.length ; i++ ){
            var _propackage = $scope.info.pre_info.propackage_list[i];
            if(_propackage.required_flag){
                if(_propackage.package_list.length == 0){
                    $scope.control.package_exsit_flag = true;
                    break;
                }
            }
        }
        return  !$scope.control.package_exsit_flag;
    };
    //绑定发布包信息
    var bindPropackageList = function(pac_list,pac_flag) {
        //获取发布包类型列表
        var _propackage_list = pac_list ? pac_list :[];
        for(var i = 0; i < _propackage_list.length; i ++) {
            var _package_list =  _propackage_list[i];
            _package_list.package_name_list = [];
            _package_list.package_list = [];
            _package_list.propackage_full_path =  _package_list.propackage_full_path ?  _package_list.propackage_full_path :[];
            for(var j = 0;j < _package_list.propackage_full_path.length;j++){
                _package_list.package_name_list.push({propackage_full_path: _package_list.propackage_full_path[j]});
            }
        }
        $scope.info.pre_info.propackage_list = _propackage_list;

    };
    //验证发布包是不是存在
    var validateProdPacExist = function(prod_pac,data){
        for(var i =0; i <  prod_pac.package_name_list.length; i++){
            var _prodpackage =  prod_pac.package_name_list[i];
            //修改后
            validPropac(_prodpackage,data,prod_pac);
        }
    };
    //验证单个发布包（验证重名加下载）
    var validPropac = function(prodpackage,data,prod_pac){
        prod_pac.add_pac_btn_disable = true;
        prodpackage.is_exsit_loading = true;
        prodpackage.no_exsit = false;
        Exec.downloadProdListFile($scope.info.pre_info.business_sys_name,$scope.info.pre_info.project_name,$scope.info.package_info.version_soc_name, prodpackage.propackage_full_path).then(function(data){
            prodpackage.is_exsit_loading = false;
            prod_pac.add_pac_btn_disable = false;
        },function(error){
            prod_pac.add_pac_btn_disable = false;
            prodpackage.is_exsit_loading = false;
            prodpackage.no_exsit = true;
            Modal.alert(error.message,3);
        });
    };
    //获取配置文件物理节点数据源信息
    var getNodeConfigList = function (evn_id,sys_name) {
        $scope.control.node_list_loading =true;
        Exec.getDefinePhyInfo(sys_name,evn_id).then(function (data) {
            if(data){
                $scope.control.node_list_loading = false;
                $scope.data.node_list = data.phy_node_list ? data.phy_node_list : [];
                ProdFunc.dealSocList($scope.data.node_list);
            }
        },function (error) {
            Modal.alert(error.message,3);
            $scope.control.node_list_loading = false;
        })
    };
    //判断参数列表是否都是节点参数
    var judgeParamListFlag = function (list) {
        var _flag = 0;
        for(var i = 0; i < list.length; i++){
            var _param = list[i];
            if(_param.param_type != 3){
                _flag++;
            }
        }
        if(_flag == 0){
            $scope.control.param_list_flag = true;
        }
    };

    //获取文件路径
    var getNodePath = function (path,node) {
        var _init_path = path;
        //去掉路径最后的'/'
        _init_path = _init_path.length > 1 && _init_path.lastIndexOf("/") == _init_path.length -1 ? _init_path.slice(0, _init_path.length-1) : _init_path;
        var _last_slash_index = _init_path.lastIndexOf("/");
        // /, /a, a, /a/b, a/b, a/
        if(!_init_path) {           //''
            node.paths = [];
        } else if(_last_slash_index == -1) {   //没有'/'或''
            node.paths = [_init_path];
        } else if(_init_path.length == 1 && _last_slash_index == 0) {   //只有'/'
            node.paths = ['/'];
        } else if(_last_slash_index == 0) {     // '/x'
            node.paths = [_init_path.slice(1)];
        } else {
            node.paths = _init_path.slice(1).split("/");
        }
    };
    var init = function () {
        $scope.control.get_business_loading = true;
        //查询当前用户有权限的所有业务系统
        BusiSys.getAllBusinessSys(true).then(function (data){
            $timeout(function() {
                if(data){
                    $scope.control.get_business_loading = false;
                    $scope.data.sys_list = data.list_bs ? data.list_bs : [];
                }
            }, 0);
        }, function (error) {
            $scope.control.get_business_loading = false;
            Modal.alert(error.message,3);
        });
        //获取项目列表(先注释掉 暂时不绑定项目编号)
       /* Project.viewPreProject().then(function (data) {
            $scope.data.project_list = data.project_name_list ? data.project_name_list : [];
        },function (error) {
            Modal.alert(error.message,3);
        });*/
        //获取敏捷发布项目编号
        Exec.getQuickProjectName().then(function (data) {
            $timeout(function () {
               if(data){
                   _sys_publish_id = data.syspublish_id;
               }
            },0)
        },function (error) {
            Modal.alert(error.message,3);
        });
  /*      //敏捷项目返回
        if(_qucik_back == 2){
            var _business_sys_name = $stateParams.sys_name;
             _project_name = $stateParams.proj_name;
            $scope.info.pre_info.business_sys_name = _business_sys_name;
            $scope.control.is_selected_busisys = true;
            //根据业务系统获取发布方案信息
            BusiSys.getAllProgramList(_business_sys_name,1,1).then(function (data) {
                $timeout(function () {
                    if(data){
                        $scope.data.program_list = data.program_list ? data.program_list : [];
                        $scope.control.prog_list_loading = false;
                    }
                },0);
            },function (error) {
                Modal.alert(error.message,3)
            });
            //获取清单和发布包信息
            Exec.getReadyOldPacParamInfo(_business_sys_name, _project_name).then(function(data){
                $timeout(function(){
                    if(data){
                        $scope.info.pre_info.upload_flag = data.upload_flag ? data.upload_flag : 1;
                        $scope.info.pre_info.version_soc_name = data.version_soc_name;
                        bindPropackageList(data.propackage_list,1);
                        $scope.info.pre_info.prog_info.param_list = data.param_list ? data.param_list : [];
                        $scope.info.pre_info.param_list = data.param_list ? data.param_list : [];
                        $scope.info.pre_info.prog_info.group_list = data.group_list ? data.group_list :[];
                        $scope.info.pre_info.group_list = data.group_list ? data.group_list :[];
                        $scope.info.pre_info.prog_id = data.prog_id;
                        $state.go('agile_pub_pre.pub_pgm',{prog_id:data.prog_id,pre_flag:true});
                        if(data.edit_config_flag){
                            $scope.control.show_define_config = true;
                            getNodeConfigList();
                            getModifyFileList(5,_business_sys_name,_project_name)
                        }
                        if(data.phase_list){
                            $scope.data.solid_config_list = processConfigData(data.phase_list,true);
                            for(var k=0;k<$scope.data.solid_config_list.length;k++){
                                var _config = $scope.data.solid_config_list[k];
                                for(var l=0;l<_config.file_list.length;l++){
                                    var _config_file = {
                                        relative_path :_config.file_list[l].file,
                                        check_soc_name:_config.support_soc_name,
                                        download_soc_name:_config.execute_soc_name,
                                        download_soc_ip:_config.node_ip,
                                        phase_type:_config.phase_type,
                                        phase_no:_config.phase_no
                                    };
                                    $scope.info.pre_info.config_file_list.push(_config_file);
                                }
                            };
                        }
                        _propackage_bk_path = data.dftpropac_bk_dir;
                        _fileupload_path = data.file_upload_path;
                    }
                },0);
            },function(error){
                Modal.alert(error.message,3);
            });
        }*/
    };
    //选择业务系统后获取方案列表
    $scope.loadPlusFormData = function(selectKey) {
        _sys_name = selectKey;
        $scope.control.is_selected_busisys = true;
        //清空方案列表
        $scope.data.program_list = [];
        $scope.data.env_list  =  [];
        $scope.control.prog_list_loading = true;
        $scope.control.detail_prog_flag = false;
        $scope.info.pre_info.prog_id = "";
        $scope.info.pre_info.prog_cn_name = "";
        $scope.info.pre_info.environment_id = "";
        //根据业务系统获取发布方案,发布环境信息
        Project.getSysProgram(_sys_name).then(function (data) {
            $scope.data.program_list = data.program_list_publish || [];
            $scope.data.env_list = data.env_list || [];
            $scope.control.prog_list_loading = false;
        },function (error) {
            $scope.control.prog_list_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //选择方案
    $scope.selectProgram = function(prog_id){
        if(_qucik_back == 2 && $scope.data.program_list.length==1){
            return false;
        }
        $scope.info.pre_info.prog_id = prog_id;
        //重选方案清空状态及数据
        $scope.control.show_define_config = false;
        $scope.data.solid_config_list = [];
        $scope.data.modify_define_file_list = [];
        $scope.info.pre_info.propackage_list = [];
        $scope.info.pre_info.config_file_list = [];
        $scope.control.pre_info_loading = true;
        //获取清单和发布包信息
        Exec.getQuickProjectPac(_sys_name,_sys_publish_id,$scope.info.pre_info.environment_id,prog_id).then(function(data){
            $timeout(function(){
                if(data){
                    var _config_phase_list = [];        //固化配置阶段列表
                    $scope.info.prepare_msg = data.prepare_msg;
                    $scope.info.dir_names = data.dir_names || {};
                    $scope.info.publish_type = data.publish_type;
                    $scope.info.pre_info.version_soc_name = data.version_soc_name ?  data.version_soc_name : '';
                    $scope.info.pre_info.upload_flag = (data.publish_type == 3)  ?  3 :  data.version_soc_name ?  2 : 1;
                    $scope.info.pre_info.channel_name = data.channel_name || '';
                    _propackage_bk_path = data.dftpropac_bk_dir;//版本机包上传路径
                    _fileupload_path = data.file_upload_path;//本地上传路径
                    $scope.info.pre_info.prolist_full_path = data.prolist_full_path ? data.prolist_full_path : '';
                    bindPropackageList(data.prepare_msg.pac_type_list);
                    $scope.info.pre_info.param_list = data.prepare_msg.param_list ? data.prepare_msg.param_list : [];
                    judgeParamListFlag($scope.info.pre_info.param_list);
                    $scope.info.pre_info.group_list = data.prepare_msg.group_list ? data.prepare_msg.group_list :[];
                    BsysFunc.processProgDate($scope.info.pre_info.group_list,data.prepare_msg.pac_type_list,data.prepare_msg.config_file_list);
                    $scope.info.pre_info.prog_id = data.prepare_msg.prog_id ? data.prepare_msg.prog_id : "";
                    $scope.info.pre_info.prog_cn_name = data.prepare_msg.prog_cn_name ? data.prepare_msg.prog_cn_name : "";
                    $scope.data.sub_tabs = [];
                    for(var i = 0; i< $scope.info.pre_info.group_list.length; i ++ ){
                        var _group = $scope.info.pre_info.group_list[i];
                        for (var j =0; j< _group.phase_list.length; j++){
                            var _phase = _group.phase_list[j];
                            if(_phase.phase_type==5){
                                var _obj = {
                                    soc_index  :'',
                                    node       : {
                                        path_files : [], //节点目录列表
                                        checked_files: [],//选中的文件列表
                                        paths : [],//路径集合
                                        init_path: '',//初始路径
                                    },
                                    impl_type  : _phase.impl_type,
                                    phase_type : _phase.phase_type,
                                    phase_name : _phase.phase_name,
                                    phase_no   : _phase.phase_no,
                                    modify_define_file_list: [],
                                    active     :false
                                };
                                $scope.data.sub_tabs.push(_obj);
                                _free_config_phase_list.push(_phase);
                            }else if (_phase.phase_type==4){
                                _config_phase_list.push(_phase);
                            }
                        }
                    }
                    if($scope.data.sub_tabs.length !=0){
                        $scope.control.custom_config_flag = true;
                        $scope.data.sub_tabs[0].active = true;
                        getNodeConfigList($scope.info.pre_info.environment_id,_sys_name);
                    }
                    if(_config_phase_list.length!=0){
                        $scope.data.solid_config_list = ProdFunc.processConfigData(_config_phase_list);
                    }
                    $scope.control.pre_info_loading = false;
                }
            },0);
        },function(error){
            $scope.control.pre_info_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //清单/包获取方式
    $scope.changeFileFlag = function(flag) {
        $scope.info.pre_info.upload_flag = flag;
        $scope.control.validate_pac  =  false ;
        if(flag == 2){
            $scope.control.is_prolist_add = false;
        }
        //清空发布包列表
        angular.forEach($scope.info.pre_info.propackage_list,function(data){
            data.propackage_full_path = data.propackage_full_path ? [] : [];
            data.package_name_list =  data.package_name_list ? [] : [];
        });

    };
    //new添加发布包
    $scope.addProdPackage = function(index,pac_flag){
        $scope.control.validate_pac  =  false ;
        if(pac_flag != 3){ //从本地
            Modal.prodPreAddProdPac(_propackage_bk_path,_fileupload_path,'',index,pac_flag,false,$scope.info.pre_info).then(function(data){
                if(data){
                    if(pac_flag == 1){
                        //添加发布包
                        $scope.info.pre_info.propackage_list[index].package_name_list = data.dpp_param_info.propackage_list[index].package_name_list;
                        $scope.info.pre_info.propackage_list[index].propackage_full_path = data.dpp_param_info.propackage_list[index].propackage_full_path;
                        $scope.info.pre_info.propackage_list[index].package_list = data.dpp_param_info.propackage_list[index].package_list;
                    }
                    //检验版本机包是否存在
                    if(pac_flag == 2){
                        validateProdPacExist($scope.info.pre_info.propackage_list[index],data);
                    }
                    $scope.control.package_exsit_flag = false;
                }
            });
        }else{
            Modal.prodPreAddProdPacFromPlatform($scope.info.dir_names,index,_sys_publish_id,$scope.info.pre_info).then(function (data) {
                $scope.info.pre_info.propackage_list[index].package_list = data;
                $scope.control.package_exsit_flag = false;
            })

        }
    };
    //new发布包-移除发布包
    $scope.removeProdPackage = function(propackage_list,prodpac,propackage){
        for(var i = 0;i < propackage_list.length;i++) {
            var _pac_type = propackage_list[i];
            if(_pac_type.package_type == prodpac.package_type){
                //删除临时发布包
                for(var j = 0; j < _pac_type.package_name_list.length; j++){
                    var _pac_path =  _pac_type.package_name_list[j];
                    if(_pac_path.propackage_full_path == propackage.propackage_full_path) {
                        propackage_list[i].package_name_list.splice(j, 1);
                        break;
                    }
                }
                //删除提交的发布包
                for(var j = 0; j < _pac_type.package_list.length; j++){
                    var _package =  _pac_type.package_list[j];
                    if(_package == _tar_name) {
                        propackage_list[i].package_list.splice(j, 1);
                        break;
                    }
                }
                //删除发布包
                for(var k = 0; k < _pac_type.propackage_full_path.length; k++){
                    var _package_path =  _pac_type.propackage_full_path[k];
                    if(_package_path == propackage.propackage_full_path) {
                        propackage_list[i].propackage_full_path.splice(k, 1);
                        break;
                    }
                }
            }
        }
    };
    //移除从平台获取的发布包
    $scope.deletePlatformPackage = function(index,propackage_list,propackage_full_path){
        var _dir_names = [];
        _dir_names = [propackage_full_path[index]];
        Exec.deletePlatTempFile(_dir_names).then(function (data) {
            if(data){
                propackage_list.splice(index,1);
                propackage_full_path.splice(index,1);
            }
        },function (error) {
            Modal.alert(error.message,3)
        })
    };
    //new发布包-下载发布包
    $scope.downloadPackage = function(propackage){
        var _path = _fileupload_path + propackage.propackage_full_path.substring(propackage.propackage_full_path.lastIndexOf("/")+1,propackage.propackage_full_path.length);
        if($scope.info.pre_info.upload_flag == 2){
            CV.downloadFile(_path);
        }else{
            CV.downloadFile(_path);
        }
    };

    //获取数据源下的文件列表
    $scope.getFileList = function (selectKey,index,sub_tab) {
        sub_tab.file_soc_name = $scope.data.node_list[selectKey].file_soc_name;
        sub_tab.execute_soc_name = $scope.data.node_list[selectKey].execute_soc_name;
        sub_tab.execute_ip = $scope.data.node_list[selectKey].ip;
        sub_tab.agent_user = $scope.data.node_list[selectKey].agent_user ? $scope.data.node_list[selectKey].agent_user  : '';
        sub_tab.init_temp = '';
        sub_tab.node.paths = [];
        sub_tab.node.loading = true;
        sub_tab.node.err_msg ='';
        sub_tab.node.init_path = '';
        Collection.getFileListBySoc(sub_tab.file_soc_name, sub_tab.node.init_path , sub_tab.execute_ip,sub_tab.agent_user).then(function(data) {
            sub_tab.node.loading = false;
            sub_tab.init_temp = data.root_bk_dir;
            sub_tab.node.init_path = sub_tab.init_temp;
            getNodePath(sub_tab.init_temp,sub_tab.node);
            sub_tab.node.path_files = data.file_bean_list ? data.file_bean_list : [];
        }, function(error) {
            sub_tab.node.paths = [];
            sub_tab.node.init_path = '';
            sub_tab.node.path_files = [];
            sub_tab.init_temp = '';
            sub_tab.node.loading = false;
            sub_tab.node.err_msg = error.message;
        });
    };
    //展示目录文件列表
    $scope.changePath = function(sub_tab,index) {
        if(sub_tab.node.is_dir) {
            sub_tab.node.loading = true;
            $timeout(function() {
                Collection.getFileListBySoc(sub_tab.file_soc_name, sub_tab.node.full_path , sub_tab.execute_ip,sub_tab.agent_user).then(function(data) {
                    sub_tab.node.loading = false;
                    sub_tab.node.path_files = data.file_bean_list ? data.file_bean_list : [];
                }, function(error) {
                    sub_tab.node.paths = [];
                    sub_tab.node.loading = false;
                    sub_tab.node.err_msg = error.message;
                });
            });
        } else {
            var _node_name = (sub_tab.execute_ip +_sys_name).replace(/\./g,'');
            var _download_soc_ip = sub_tab.execute_ip;
            Modal.compare(_sys_name, _sys_publish_id,_node_name, sub_tab.node.full_path, sub_tab.execute_soc_name, sub_tab.file_soc_name,_download_soc_ip, true , 5).then(function(data) {
                if(data){
                    var _index = sub_tab.soc_index;
                    var _node_list = $scope.data.node_list;
                    var _phy_node = angular.copy(_node_list[_index]);
                    var _phase = _free_config_phase_list[index];
                    var _path = sub_tab.node.full_path;
                    _phase.phy_nodes = _phase.phy_nodes || [];
                    for(var k =0; k< _phase.phy_nodes.length; k++){
                        if(_phase.phy_nodes[k].ip === _phy_node.ip){
                            if(_phase.phy_nodes[k].file_list.indexOf(_path)<0){
                                _phase.phy_nodes[k].file_list.push(_path);
                            }
                            _path = null;
                            break;
                        }
                    }
                    if(_path){
                        var _obj = angular.extend(_phy_node,{
                            file_list:[_path]
                        });
                        _phase.phy_nodes.push(_obj);
                    }
                    sub_tab.phy_nodes = _phase.phy_nodes;
                }
            });
        }
    };

    //固化配置文件修改弹窗
    $scope.showModifyFile = function(file,node,phase) {
        var _check_soc_name = node.execute_soc_name;
        var _node_name = (node.ip +_sys_name).replace(/\./g,'');
        var _download_soc_name = node.file_soc_name;
        var _download_soc_ip = node.ip;
        Modal.compare($scope.info.pre_info.business_sys_name, _sys_publish_id, _node_name,file.file,  _check_soc_name, _download_soc_name,_download_soc_ip, true ,phase.phase_type,phase.phase_no).then(function(data) {
            if(data){
                file.is_modify = true;
                 /*       var _config = {
                            check_soc_name : _check_soc_name,
                            download_soc_ip : _download_soc_ip,
                            download_soc_name : _download_soc_name,
                            phase_no : phase.phase_no,
                            phase_type : phase.phase_type,
                            node_file_path : file.file,
                            type : 1
                        };
                        var _flag = false;
                        for(var i=0;i<_config_list.length;i++){
                            var _file = _config_list[i];
                            if( (_download_soc_name ==_file.download_soc_name) && file.file == _file.node_file_path ){
                                _flag = true;
                            }
                        }
                        if(!_flag){
                            _config_list.push(_config)
                        }*/
            }
        });
    };
    //自定义配置文件修改弹窗
    $scope.showModifyDefineFile = function(soc,file_path) {
        var _check_soc_name = soc.execute_soc_name;
        var _download_soc_name = soc.file_soc_name;
        var _node_name = (soc.ip +_sys_name).replace(/\./g,'');
        var _download_soc_ip = soc.ip;
        Modal.compare(_sys_name, _sys_publish_id,_node_name, file_path, _check_soc_name, _download_soc_name,_download_soc_ip, true).then(function(data) {});
    };
    //删除自定义修改过的配置文件
    $scope.deleteDefineConfigModify = function (event ,soc,index,out_index,sub_tab) {
        event.stopPropagation();
        Modal.confirm('是否要删除已经修改的配置文件？').then(function () {
            if(soc.file_list.length > 1){
                soc.file_list.splice(index,1);
            }else {
                sub_tab.phy_nodes.splice(out_index,1);
            }

        });
    };

    //模组展开收起操作
    $scope.toggleModulesDetail = function (step, group) {
        step.show_detail = !step.show_detail;
        //判断导航条是否显示标志
        group.nav_show_flag = CmptFunc.judgeShowDetail(group.phase_list);
        group.expand_flag = (group.nav_show_flag == 2) ? true : false;
        $scope.control.code_refresh = false;
        $timeout(function(){
            $scope.control.code_refresh = true;
        },10)
    };
    //模组全部展开
    $scope.expandCollapseAll = function (group) {
        group.nav_show_flag = CmptFunc.expandAllModules(group.phase_list);
        //重新刷新codemirror
        if(group.nav_show_flag == 2){
            $scope.control.code_refresh = false;
            $timeout(function(){
                $scope.control.code_refresh = true;
            },10)
        }
    };
    //模组全部收起
    $scope.colseCollapseAll = function (group) {
        group.nav_show_flag = CmptFunc.closeAllModules(group.phase_list);
    };
    //协议类型转化中文名
    $scope.getProtocolTypeCnName = function(protocol_type){
        return CV.findValue(protocol_type,ProtocolType).substring(0,5).toLowerCase();
    };
    //敏捷发布准备 提交准备信息表单
    $scope.submitReadyForm = function() {
        var _pre_info = angular.copy($scope.info.pre_info);
        $scope.info.prepare_msg.pac_type_list =  _pre_info.propackage_list;
        $scope.info.prepare_msg.group_list = _pre_info.group_list;
        $scope.info.prepare_msg.param_list = _pre_info.param_list;
        var _repData = {
            syspublish_id:_sys_publish_id,
            business_sys_name:_sys_name,
            prepare_msg: $scope.info.prepare_msg,
        };
        if(!CV.valiForm($scope.control.form)){
            return false;
        }
        if($scope.info.pre_info.propackage_list.length != 0){
            //发布包不可为空
            if(!valiProdPacComplete()){
                Modal.alert("发布包不能为空！",3);
                return false;
            }
        }
        //打开加载模态框
        $modal.open({
            templateUrl: 'templates/modal/loading_modal.html',
            controller: 'submitQuickModalCtrl',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                Message: function () {
                    return _repData
                }
            }
        })
    };
    //取消敏捷发布
    $scope.quickCancel = function () {
        $state.go("agile_pub_list");
    };
    //公共-参数默认值输入框智能提示
    $scope.paramShellLoaded = function(_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
        $timeout(function(){
            $scope.control.code_reflash = true;
        },0);
    };
    init();
}]);
/**
 * 敏捷发布准备提交模态框
 * */
prodCtrl.controller('submitQuickModalCtrl', ["$scope", "$modalInstance", "$state", "$timeout", "Message", "Exec", "Modal", "CV", function ($scope, $modalInstance, $state, $timeout, Message, Exec, Modal, CV) {
    $scope.message ='正在提交准备信息...';
    //项目准备
    Exec.saveQuickReadyInfo(Message).then(function(data) {
        if(data){
            Modal.alert("项目准备成功，项目待执行！",2);
            $modalInstance.close(true);
        }
        $state.go('agile_pub_exe',{sys_publish_id:Message.syspublish_id,sys_id:Message.business_sys_name,exec_type:1,quick_pub_flag:1,auto_yn_flag:2,path_flag:1});
    }, function(error) {
        Modal.alert(error.message,3);
        $modalInstance.close(false);
    });
}]);
/**
 *例行发布列表
 * */
pCtrl.controller('routineReleaseCtrl', ["$scope", "$state","$location", "$timeout","Project","Exec", "Modal", "CV", function($scope, $state, $location, $timeout,Project, Exec, Modal, CV) {
    var _status_list = [];
    var url = $location.absUrl();
    var _curr_user_id = url.indexOf('#') == -1 ? url.substring(url.indexOf("?")+1) : url.substring(url.indexOf("?")+1, url.indexOf("#"));

    //页面对象
    $scope.info = {
        key_word : '', //搜索关键字
        error_msg : '', //获取列表错误信息
    };
    //页面数据
    $scope.data = {
        prepare_list : [], //项目准备列表
    };
    //页面控制
    $scope.control = {
        get_list_loading : false,//获取列表loading
        wait_pub_choose_flag:true,
        pub_exec_choose_flag:true,
        pub_finish_choose_flag:false,
    };
    //获取列表
    var getPrepareList = function (key_word,status_list) {
        var _key_word = key_word ? key_word : '';
        $scope.info.error_msg = '';
        $scope.control.get_list_loading = true;
        Project.getPrepareList(_key_word,status_list).then(function (data) {
            if(data){
                $scope.data.prepare_list = data.publish_list ? data.publish_list : [];
                $scope.control.get_list_loading = false;
                if($scope.data.prepare_list.length > 1){
                    var _publish_date = $scope.data.prepare_list[0].publish_date;
                    for(var i=1;i< $scope.data.prepare_list.length;i++){
                        if(_publish_date == $scope.data.prepare_list[i].publish_date){
                            $scope.data.prepare_list[i].publish_date = '';
                        }else{
                            _publish_date = $scope.data.prepare_list[i].publish_date;
                        }
                    }
                }

                //临时添加权限--过滤非当前用户的
                for (var j =0; j < $scope.data.prepare_list.length; j++) {
                    var _prepare_list = $scope.data.prepare_list[j];
                    _prepare_list.business_sys_list = _prepare_list.business_sys_list || [];
                    _prepare_list.show = false;
                    for (var k = 0; k < _prepare_list.business_sys_list.length; k++){
                        var  _sys = _prepare_list.business_sys_list[k];
                        _sys.has_priv = false;
                        if(_curr_user_id === 'admin'){
                            _sys.has_priv = true;
                        } else {
                            if(_sys.manager_user_id){
                                _sys.manager_user_ids = _sys.manager_user_id.split(",");
                                for(var m =0; m < _sys.manager_user_ids.length; m++){
                                    var _user_id = _sys.manager_user_ids[m];
                                    if(_user_id === _curr_user_id){
                                       _sys.has_priv = true;
                                       break;
                                    }
                                }
                            }
                        }
                        if(_sys.has_priv) _prepare_list.show = true;
                    }
                }

            }
        },function (error) {
            Modal.alert(error.message,3);
            $scope.control.get_list_loading = false;
            $scope.info.error_msg = error.message;
        })
    };

    var init = function () {
        _status_list = [1,2];
        getPrepareList('',_status_list);
    };
    //根据状态搜索发布窗口
    $scope.getListByStatus = function(flag){
        var _new_status_list = [];
        if(flag == 1){
            $scope.control.wait_pub_choose_flag = !$scope.control.wait_pub_choose_flag;
        }
        if(flag == 2){
            $scope.control.pub_exec_choose_flag = !$scope.control.pub_exec_choose_flag;
        }
        if(flag == 3){
            $scope.control.pub_finish_choose_flag = !$scope.control.pub_finish_choose_flag;
        }
        if($scope.control.wait_pub_choose_flag){
            _new_status_list.push(1)
        }
        if($scope.control.pub_exec_choose_flag){
            _new_status_list.push(2)
        }
        if($scope.control.pub_finish_choose_flag){
            _new_status_list.push(3)
        }
        _status_list = _new_status_list.length!=0 ? _new_status_list : [1,2,3];
        getPrepareList($scope.info.key_word,_status_list);
    };
    //根据关键字搜索发布窗口
    $scope.searchPrepareListByKeyword = function(key_word){
        getPrepareList(key_word,_status_list);
    };
    //跳转查看单个发布申请
    $scope.viewPublishApplication = function(item){
        $state.go('view_application',{ application_id : item.pjpublish_id});
    };
    //显示辅助操作
    $scope.showSecondaryOperation = function(sys,list){
        for(var i = 0 ;i< list.length; i++){
            var _sys = list[i];
            if(_sys.sys_publish_list){
                for(var j = 0 ; j < _sys.sys_publish_list.length; j++){
                    _sys.sys_publish_list[j].operation_flag = false ;
                }
            }
        }
        sys.operation_flag = true;
    };
    //跳转监控单个发布系统
    $scope.goToSingleMonitor = function(sys){
        $state.go('monitor_detail',{sys_publish_id:sys.syspublish_id,sys_id:sys.business_sys_name,sys_status:sys.sys_publish_status,quick_pub_flag:2});
    };
    //跳转发布准备页面
    $scope.goPrepare = function(sys){
        $state.go('pub_pre',{sys_publish_id:sys.syspublish_id,sys_id:sys.business_sys_name,path_flag:1});
    };
    //跳转执行页面
    $scope.goToExec = function(sys){
        var _exe_type = (sys.sys_publish_status == 6 || sys.sys_publish_status == 9) ? 2 : 1;
        // $state.go('pub_exec',{sys_publish_id:sys.syspublish_id,sys_id:sys.business_sys_name,exec_type:_exe_type,quick_pub_flag:2,auto_yn_flag:2,path_flag: 1});
        $state.go('release_exec',{sys_publish_id:sys.syspublish_id,sys_id:sys.business_sys_name,quick_pub_flag:2,auto_yn_flag:2});
    };
    //回退准备页面
    $scope.goToRollback = function(sys){
        Modal.chooseRollbackProg(sys.business_sys_name,sys.syspublish_id).then(function (ret) {
                $state.go('pub_exec',{sys_publish_id:sys.syspublish_id,sys_id:sys.business_sys_name,exec_type:2,quick_pub_flag:2,auto_yn_flag:2,path_flag: 1});
            });
    };
    //跳转发布查看页面
    $scope.goToPubDetail = function(sys){
        $state.go('proj_detail_pre',{publish_id:sys.syspublish_id,sys_id:sys.business_sys_name})
    };
    //重置发布系统
    $scope.resetPublish = function(sys){
        Exec.reSet(sys.syspublish_id).then(function (data) {
            getPrepareList('',_status_list);
        },function (error) {
            Modal.alert(error.message,3);
        })
    };
    init();
}]);
/**
 *查看单个发布申请
 * */
pCtrl.controller('viewPubApplicationCtrl', ["$scope", "$state", "$stateParams", "$timeout","Project", "Modal", "CV", function($scope, $state,$stateParams, $timeout, Project, Modal, CV) {
    var _application_id = $stateParams.application_id;
    //页面对象
    $scope.info = {
        apply_info:{}
    };
    //页面数据
    $scope.data = {

    };
    //页面控制
    $scope.control = {

    };
    //初始化方法
    var init = function () {
        //查看申请信息
        Project.viewReleaseApply(_application_id).then(function (data) {
            $timeout(function () {
                $scope.info.apply_info.pjpublish_name = data.publish_bean.pjpublish_name;
                $scope.info.apply_info.pjpublish_desc = data.publish_bean.pjpublish_desc;
                $scope.info.apply_info.execute_type = data.publish_bean.execute_type;
                $scope.info.apply_info.pjpublish_id = data.publish_bean.pjpublish_id;
                $scope.info.apply_info.pjpublish_date = data.publish_bean.pjpublish_date;
                $scope.info.apply_info.pjpublish_time = data.publish_bean.pjpublish_time;      //申请发布时间
                $scope.info.apply_info.publish_proj_list = data.publish_bean.pjpublish_project_list || [];
            },0)
        },function (error) {
            Modal.alert(error.message,3);
        })
    };
    init();
}]);
/**项目执行改版**/
prodCtrl.controller('releaseExecCtrl', ["$scope", "$stateParams", "$state", "$timeout", "$interval","$sce","Modal", "CV", function($scope, $stateParams, $state, $timeout, $interval,$sce, Modal, CV) {
    var _sys_id    = $stateParams.sys_id; // 系统id
    var _sys_publish_id  = $stateParams.sys_publish_id;  //系统发布id

    $scope.info = {
        sys_id : _sys_id,
        sys_publish_id : _sys_publish_id
    };

    $scope.control = {
        show_view_flag : true, //显示视图标志 默认 1 监控视图 2 终端视图
    };

    var init = function () {
        $state.go('release_exec.monitor_view')
    };
    //切换视图
    $scope.changeView = function(){
        $scope.control.show_view_flag = !$scope.control.show_view_flag;
        if($scope.control.show_view_flag){
            $state.go('release_exec.monitor_view')
        }else{
            $state.go('release_exec.terminal_view')
        }
    };
    //返回列表
    $scope.backToList = function(){
        $state.go("routine_release");
    };
    init();

}]);
/**项目执行--监控视图**/
prodCtrl.controller('releaseMonitorCtrl', ["$scope", "$stateParams", "$state", "$timeout", "$interval","$sce","Modal", "CV", function($scope, $stateParams, $state, $timeout, $interval,$sce, Modal, CV) {
    console.log($scope.info)

}]);
/**项目执行--终端视图**/
prodCtrl.controller('releaseTerminalCtrl', ["$scope", "$stateParams", "$state", "$timeout", "$interval","$sce","Modal", "CV", function($scope, $stateParams, $state, $timeout, $interval,$sce, Modal, CV) {


}]);
