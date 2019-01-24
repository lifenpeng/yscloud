//组件模块控制器
var cmpt_m = angular.module('CmptCtrl', []);
//组件父控制器
cmpt_m.controller('cmptCtrl', ['$scope', '$state', function ($scope, $state) {
    $scope.info = {
        current_route_name : 'cmpt.cmpt_new' //当前路由是组件还是组件组
    };
    //改变切换按钮样式
    $scope.changeTabStyle = function (param) {
        $scope.info.current_route_name = param;
    };
}]);
//新增组件控制器
cmpt_m.controller('cmptNewCtrl',['$scope', '$timeout', '$state', 'CodeMirrorOption', 'IML_TYPE','CmptType','CmptSysType', 'Cmpt', 'envManage', 'CmptFunc', 'Plugin', 'pluginType', 'jdkVersion', 'Modal', 'CV', function ($scope, $timeout, $state, CodeMirrorOption, IML_TYPE, CmptType, CmptSysType, Cmpt ,envManage ,CmptFunc, Plugin, pluginType, jdkVersion, Modal, CV) {
    var _old_exe_script = [];            //保存上一次的执行脚本(判断脚本有没有修改)
    var _old_command_exe_script = [];    //组件命令-上次命令脚本
    var _curr_code_type = 1;             //默认1 为shell语言 2 为python语言 3 为java语言 4 为SQL
    var _tem_edit = {};                  //执行脚本输入框配置参数(只读)
    var _init_cmpt_info = {              //组件对象
        component_purposes:[],           //组件类型
        component_source:1,              //组件来源
        file_path:'',                    //文件路径
        file_param :'',                  //命令行参数
        id : '',                         //组件id
        cn_name:"",                      //组件中文名
        bk_desc:"",                      //组件描述
        impl_type : "",                  //组件执行类别
        param_list:[],                   //组件参数列表
        command_param_list:[],           //组件命令参数
        out_param_list:[],               //组件输出参数
        exec_script :'',                 //上传脚本文件中的脚本
        cmds :[],                        //上传组件执行脚本（数组）
        script_list  : [                 //组件执行脚本命令列表
            {
                script_type : 'default',    //脚本类型
                active: true,
                cmds  :[],                  //组件执行脚本（数组）
                code_mirror_control:false,  //解决codemirror加载显示不出来
                exec_script :''             //组件执行脚本（字符串）
            }
        ],
        tag_list :[] ,                   //分类数组
        annex_file:'',                   //附件下载路径
        plugin_list :[],                 //插件列表
        command:{                        //命令
            cmds  :[],                   //组件执行命令（数组）
            code_mirror_control : false, //解决codemirror加载显示不出来
            exec_script :'',             //组件执行命令（字符串）
            script_type : 'default',     //脚本类型
        }
    };
    //配置
    $scope.config = {
        cmpt_accessory_fileupload : { //C/C++附件上传配置
            suffixs:'',
            filetype: "",
            filename: "",
            uploadpath: ""
        },
        cmpt_fileupload : {           //组件上传配置
            suffixs:'xml',
            filetype: "XML",
            filename: "",
            uploadpath: ""
        },
        cmpt_script_fileupload : {    //脚本上传配置
            suffixs:'',/*sh*/
            filetype: "",/*SHELL*/
            filename: "",
            uploadpath: ""
        }
    };
    //页面控制
    $scope.control={                        //组件控制对象
        new_cmpt_flag : true,              //新增组件标志
        cmpt_save_disabled : false,         //组件保存按钮是否禁用
        cmpt_btn_loading :false,            //组件保存中
        nav_show_flag   : 0 ,               //导航条显示标志
        cmpt_get_param_loading : false,     //组件获取参数loading
        cmpt_command_param_loading : false, //组件命令获取参数loading
        expand_flag     :false,             //组件全部展开标志
        import_loading : false,             //组件导入loading
        cmpt_type_disabled :false,          //组件类型控制是否可点击（控制除数据采集以外的类型）
        cmpt_type_collect :false,           //组件类型控制是否可点击（控制除数据采集类型）
        show_codemirror : true,             //执行脚本codemirror刷新标志
        show_check_comp : false             //是否显示校验组件
    };
    //页面对象
    $scope.info = {
        cmpt_info : {}
    };
    //页面data
    $scope.data = {
        cmpt_type_list : [],                    //组件类型
        certificate_cmpt_list : [] ,            //组件--验证组件列表
        jdk_version_list : jdkVersion,          //语言版本
        plugin_list : [],                       //可用插件列表
        plugin_hint_list : [],                  //转换后提示的插件列表
        auto_param_list : [],                   //自动补全参数列表
        execute_type_list: IML_TYPE,            //执行类型
        label_init_list : []                    //标签列表
    };
    //根据返回组件类型转化成页面绑定格式（cmpt_type_choose_list：选中的组件类型列表，cmpt_type_list：组件类型列表）
    var chooseCheckBox = function (cmpt_type_choose_list,cmpt_type_list) {
        var _cmpt_type_list = cmpt_type_list;
        var _controls= $scope.control;
        for(var i = 0; i < cmpt_type_choose_list.length; i++){
            for(var j = 0; j < _cmpt_type_list.length; j++){
                if(_cmpt_type_list[j].key == cmpt_type_choose_list[i]){
                    _cmpt_type_list[j].state = true;
                    if(cmpt_type_choose_list[i] == 2){
                        $scope.config.cmpt_script_fileupload.filename = $scope.info.cmpt_info.file_path.substring($scope.info.cmpt_info.file_path .lastIndexOf("/")+1,$scope.info.cmpt_info.file_path .length);
                        $scope.info.cmpt_info.file_path  =  $scope.config.cmpt_script_fileupload.uploadpath + $scope.config.cmpt_script_fileupload.filename;
                    }
                }
            }
        }
    };
    //获取执行类别对应的可用插件列表（impl_type:执行类别）
    var getPluginListByImplType = function (impl_type) {
        //获取对应实现类型的插件列表
        Plugin.getAllPluginList(impl_type).then(function(data) {
            if(data){
                $scope.data.plugin_list = data.plugin_list ? data.plugin_list : [];
            }
        }, function(error) {
            // Modal.alert(error.message);
        });
    };
    //通过类型获取提示文字列表（impl_type:执行类别）
    var getAutoParamByImplType = function(impl_type){
        //通过类型得到提示文字列表
        Cmpt.grammarBytype(impl_type).then(function(data) {
            if(data){
                var _tem_grammer_list = data.grammar_list ? data.grammar_list : [];
                $scope.data.auto_param_list = CmptFunc.translateGrammarHint(_tem_grammer_list);
                $scope.shellLoaded(_tem_edit);
            }
        }, function(error) {
            // Modal.alert(error.message);
        });
    };
    //获取导入组件文件上传路径(1，组件)
    var getCmptFilePath = function(){
        Cmpt.getCmptFilePath(1).then(function(data){
            $timeout(function(){
                if(data){
                    $scope.config.cmpt_fileupload.uploadpath = data.file_path ? data.file_path : "";
                    $scope.config.cmpt_script_fileupload.uploadpath = data.file_path ? data.file_path : "";
                }
            },0);
        },function(error){
            Modal.alert(error.message,3);
        });
    };
    //获取插件字符串列表（为了不刷到参数列表中）（list:插件列表）
    var getHidePluginList = function (list) {
        var arr = [];
        for(var i = 0; i < list.length; i++){
            if(list[i].plugin_name){
                arr.push(list[i].plugin_name)
            }
        }
        return arr;
    };
    //获取附件上传路径
    var getAccessaryUploadPath = function () {
        envManage.getUploadPath().then(function(data) {
            if(data){
                $scope.config.cmpt_accessory_fileupload.uploadpath = data.upload_path ? data.upload_path : '';
            }
        }, function(error) {
            // Modal.alert(error.message);
        });
    };
    //执行脚本失去焦点获得参数
    var init = function(){
        //初始化组件类型
        angular.forEach(CmptType,function (data) {
            //state选中标志
            $scope.data.cmpt_type_list.push(angular.extend({state:false},data));
        });
        //获取组件上传文件路径
        getCmptFilePath();
        //新增组件对象
        $scope.info.cmpt_info = angular.copy(_init_cmpt_info);
        //查询所有组件标签
        Cmpt.selectAllTas().then(function (data) {
            if(data){
                $timeout(function () {
                    var _tag_list = data.tag_list ? data.tag_list :[];
                    for(var i = 0; i <_tag_list.length; i++){
                        $scope.data.label_init_list.push({
                            value: _tag_list[i],
                            flag:false
                        })
                    }
                },0)
            }
        },function (error) {
            Modal.alert(error.message,3);
        });
        //查询所有验证组件
        Cmpt.getPublishedCmpt(1,5).then(function (data) {
            if(data){
                $timeout(function () {
                    var _comp_list = data.comp_list ? data.comp_list :[];
                    for(var i = 0; i < _comp_list.length; i++){
                        $scope.data.certificate_cmpt_list.push({
                            check_comp_name:_comp_list[i].cn_name,
                            check_comp_id  :_comp_list[i].id
                        })
                    }
                },0)
            }
        },function (error) {
            Modal.alert(error.message,3);
        });
        getAccessaryUploadPath();
    };
    //选择组件类型()
    $scope.selectCmptType = function(){
        //解决切换后codemirror加载问题
        for(var j = 0; j < $scope.info.cmpt_info.script_list.length; j++){
            $scope.info.cmpt_info.script_list[j].code_mirror_control = false;
        }
        $scope.info.cmpt_info.component_purposes =[];
        var _cmpt_type_list = $scope.data.cmpt_type_list;
        for(var i = 0; i < _cmpt_type_list.length; i++){
            if(_cmpt_type_list[i].state){
                $scope.info.cmpt_info.component_purposes.push(_cmpt_type_list[i].key);
            }
        }
        _old_exe_script = [];
        //判断是否显示校验组件
        $scope.control.show_check_comp = CmptFunc.judgeShowCheckCmpt($scope.info.cmpt_info.component_purposes);
        if(!$scope.control.show_check_comp){
            if($scope.info.cmpt_info.check_comp_id) {
                $scope.info.cmpt_info.check_comp_id = ''
            }
        }
    };
    //选择实现类型来切换codemirror的代码高亮类型（impl_type：执行类别）
    $scope.chooseImplType = function (impl_type) {
        $scope.data.plugin_list = [];
        $scope.data.auto_param_list = [];
        _curr_code_type = (impl_type < 6) ? 1 : (impl_type == 6) ? 4 : (impl_type == 7 || impl_type == 8) ? 2 :(impl_type == 14) ? 3 : 1;
        $scope.control.show_codemirror = false;
        $timeout(function () {
            $scope.control.show_codemirror = true;
        },20);
        getAutoParamByImplType(impl_type);
        getPluginListByImplType(impl_type);
    };
    //添加分类标签
    $scope.addClassifyLabel = function () {
        Modal.addCmptLabel($scope.data.label_init_list).then(function (data) {
            $scope.data.label_init_list = data;
            var _cmp_label_list = [];     //临时选中的标签列表
            for(var i = 0;i < data.length; i++){
                var _label = data[i];
                if(_label.flag){
                    _cmp_label_list.push(_label.value);
                }
            }
            $scope.info.cmpt_info.tag_list = _cmp_label_list;
        })
    };
    //新增执行脚本
    $scope.addScript = function () {
        Modal.addCmptSysType({}).then(function (ret) {
            var _script_info = {
                script_type : ret.toLowerCase(),   //脚本类型
                code_mirror_control:false,
                active: true,
                cmds : [],           //脚本（数组）
                exec_script:''      //脚本（字符串）
            };
            $scope.info.cmpt_info.script_list.push(_script_info);
        });
    };
    //解决codemirror加载显示不出来问题（index：当前选中的select）
    $scope.selectScript = function(index){
        $scope.control.show_codemirror = false;
        $timeout(function () {
            $scope.control.show_codemirror = true;
            if($scope.info.cmpt_info.script_list[index]){
                $scope.info.cmpt_info.script_list[index].code_mirror_control = true;
            }
        },20)
    };
    //删除执行脚本
    $scope.deleteScript = function (index) {
        Modal.confirm("确认删除当前脚本？").then(function (choose) {
            if(choose){
                $scope.info.cmpt_info.script_list.splice(index,1);
            }
        });
    };
    //删除导入文件
    $scope.removeCmptFile = function () {
        //初始化上传文件名
        $scope.config.cmpt_fileupload.filename = '';
        //新增组件对象
        $scope.info.cmpt_info = angular.copy(_init_cmpt_info);
        angular.forEach($scope.data.cmpt_type_list,function (data) {
            data.state = false;
        });
    };
    //文件-导入文件成功后
    $scope.ImportSuccessThen = function() {
        //文件路径
        var _file_path =  $scope.config.cmpt_fileupload.uploadpath +"/"+ $scope.config.cmpt_fileupload.filename;
        $scope.control.import_loading = true;
        //查询导入组件文件信息
        Cmpt.importModule(_file_path).then(function(data){
            $timeout(function(){
                if(data){
                    $scope.info.cmpt_info.id =data.component.id || '';
                    $scope.info.cmpt_info.cn_name = data.component.cn_name;
                    $scope.info.cmpt_info.bk_desc = data.component.bk_desc;
                    $scope.info.cmpt_info.command = data.component.command || '';
                    $scope.info.cmpt_info.impl_type = data.component.impl_type;
                    $scope.info.cmpt_info.param_list = data.component.param_list || [];
                    $scope.info.cmpt_info.command_param_list = data.component.command_param_list || [];
                    $scope.info.cmpt_info.out_param_list = data.component.out_param_list || [];
                    $scope.info.cmpt_info.script_list = data.component.script_list || [];
                    $scope.info.cmpt_info.plugin_list  = data.component.plugin_list || [];
                    if($scope.info.cmpt_info.script_list.length > 0){
                        angular.forEach($scope.info.cmpt_info.script_list,function(one_script){
                            if(one_script.cmds){
                                one_script.exec_script=CmptFunc.cmdsToString(one_script.cmds);
                            }
                            data.active = data.script_type =='default' ? true : false;
                            data.code_mirror_control = false;
                        });
                    }
                    $scope.info.cmpt_info.check_comp_id = data.component.check_comp_id;
                    $scope.info.cmpt_info.tag_list   = data.component.tag_list || [];
                    $scope.info.cmpt_info.language_version = data.component.language_version;
                    $scope.info.cmpt_info.component_purposes = data.component.component_purposes || [];
                    chooseCheckBox($scope.info.cmpt_info.component_purposes,$scope.data.cmpt_type_list);
                    $scope.info.cmpt_info.component_source =  data.component.component_source || 1;
                    $scope.control.import_loading = false;
                    if(data.component.command){
                        $scope.info.cmpt_info.command={
                            exec_script : CmptFunc.cmdsToString(data.component.command.cmds),
                            cmds : data.component.command.cmds
                        }
                    }
                    $scope.control.show_check_comp = CmptFunc.judgeShowCheckCmpt($scope.info.cmpt_info.component_purposes);
                    getPluginListByImplType($scope.info.cmpt_info.impl_type);
                    for(var k = 0;k < $scope.data.label_init_list.length; k++){
                        var  _label = $scope.data.label_init_list[k];
                        if($scope.info.cmpt_info.tag_list.indexOf(_label.value) > -1){
                            _label.flag=true;
                        }
                    }
                }
            },0);
            //获得上传文件
            if(data.component.annex_file){
                $scope.config.cmpt_accessory_fileupload.filename = data.component.annex_file.substring(data.component.annex_file.lastIndexOf('/')+1);
                $scope.info.cmpt_info.annex_file = data.component.annex_file;
            }
        },function(error){
            $scope.control.import_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //附件上传成功
    $scope.ImportAccessorySuccessThen = function () {
        $scope.info.cmpt_info.annex_file = $scope.config.cmpt_accessory_fileupload.uploadpath+'/'+$scope.config.cmpt_accessory_fileupload.filename;
        var _file_type = $scope.config.cmpt_accessory_fileupload.filename.substring($scope.config.cmpt_accessory_fileupload.filename.lastIndexOf('.')+1)
        $scope.config.cmpt_accessory_fileupload.filetype = CmptFunc.judgeFileType(_file_type);
    };
    //删除附件
    $scope.removeAccessoryFile = function () {
        $scope.config.cmpt_accessory_fileupload.filename = '';
        $scope.info.cmpt_info.annex_file = '';
        $scope.config.cmpt_accessory_fileupload.filetype = '';
    };
    //下载附件
    $scope.downloadAccessoryFile = function(){
        CV.downloadFile($scope.info.cmpt_info.annex_file);
    };
    //参数默认值输入框智能提示
    $scope.paramShellLoaded = function(_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };
    //添加插件
    $scope.addAvailablePlugin = function () {
        if($scope.info.cmpt_info.plugin_list.length !=0){
            for(var i=0;i < $scope.info.cmpt_info.plugin_list.length; i++){
                if(!$scope.info.cmpt_info.plugin_list[i].plugin_name){
                    Modal.alert("请选择插件名",3);
                    return false;
                }
            }
            //无可用插件
            if($scope.data.plugin_list.length == $scope.info.cmpt_info.plugin_list.length){
                Modal.alert("无可再添加的插件！",3);
                return false
            }
        }
        $scope.info.cmpt_info.plugin_list.push({
            plugin_name : "",
            plugin_type : "",
            plugin_file_name : "",
            plugin_bk_desc : ""
        });
    };
    //绑定选择的插件的基本信息及刷新codemirror提示信息（插件名，index，当前行对象）
    $scope.bindPluginInfo = function (selectKey,index, tr) {
        var plugin_name_info = {};
        for(var j=0;j< $scope.info.cmpt_info.plugin_list.length; j++){
            var _plugin_name = $scope.info.cmpt_info.plugin_list[j].plugin_name;
            //去重
            if(!plugin_name_info[_plugin_name]){
                plugin_name_info[_plugin_name] = 1;
            }else{
                Modal.alert("插件已经添加！",3);
                $scope.info.cmpt_info.plugin_list.splice(index,1);
                return false;
            }
        }
        for(var i=0;i < $scope.data.plugin_list.length;i++){
            var _plugin = $scope.data.plugin_list[i];
            if( selectKey == _plugin.plugin_name ){
                tr.plugin_type =_plugin.plugin_type;
                tr.plugin_file_name =_plugin.plugin_file_name;
                tr.plugin_bk_desc = _plugin.plugin_bk_desc;
                break;
            }
        }
        $scope.data.plugin_hint_list = CmptFunc.translatePluginHint($scope.info.cmpt_info.plugin_list);
        $scope.control.show_codemirror = false;
        $timeout(function () {
            $scope.control.show_codemirror = true;
        },20);
    };
    //插件类型转化中文名（插件类型）
    $scope.getPluginTypeCnName = function(plugin_type){
        return CV.findValue(plugin_type,pluginType);
    };
    // 删除已经选择的插件
    $scope.deleteSinglePlugin = function (index) {
        var _plugin_name = $scope.info.cmpt_info.plugin_list[index].plugin_name;
        if(_plugin_name){
            Modal.confirm("确认是否要删除[ " + _plugin_name + " ]插件?").then(function () {
                $scope.info.cmpt_info.plugin_list.splice(index,1);
                $scope.data.plugin_hint_list = CmptFunc.translatePluginHint($scope.info.cmpt_info.plugin_list);
                $scope.control.show_codemirror = false;
                $timeout(function () {
                    $scope.control.show_codemirror = true;
                },20);
            })
        }else{
            $scope.info.cmpt_info.plugin_list.splice(index,1);
            $scope.data.plugin_hint_list = CmptFunc.translatePluginHint($scope.info.cmpt_info.plugin_list);
            $scope.control.show_codemirror = false;
            $timeout(function () {
                $scope.control.show_codemirror = true;
            },20);
        }
    };
    //脚本输入框智能提示
    $scope.mentionParam = function (_editor) {
        CodeMirrorOption.setEditor(_editor ,_curr_code_type,$scope.data.plugin_hint_list,$scope.data.auto_param_list);
    };
    //脚本输入框智能提示
    $scope.shellLoaded = function(_editor) {
        var current_blur_timeout;
        CodeMirrorOption.setEditor(_editor ,_curr_code_type ,$scope.data.plugin_hint_list);
        _editor.on('blur', function() {
            current_blur_timeout = $timeout(function() {
                var _hide_plugin_list = getHidePluginList($scope.info.cmpt_info.plugin_list);
                //可以提交组件信息
                $scope.info.cmpt_info.script_list[0].cmds = $scope.info.cmpt_info.script_list[0].exec_script ? $scope.info.cmpt_info.script_list[0].exec_script.split("\n") : [];
                var _total_script=$scope.info.cmpt_info.script_list[0].exec_script +""+$scope.info.cmpt_info.command.exec_script;
                var _cmpt_func = CmptFunc.getParamsByScript(_total_script ? _total_script :"" , _hide_plugin_list);
                if(_cmpt_func.list.length == 0){
                    $scope.info.cmpt_info.param_list = [];
                }
                //参数不变不刷新参数表
                if(_old_exe_script.length == _cmpt_func.list.length){
                    $scope.info.cmpt_info.script_msg = _cmpt_func.msg;
                    $scope.control.cmpt_save_disabled = false;
                    if(_old_exe_script.length == 0){
                        return false;
                    }
                    for(var k= 0; k<_cmpt_func.list.length; k++){
                        var _param_is_equal = false;
                        for(var j=0; j<_old_exe_script.length; j++){
                            if(_cmpt_func.list[k].param_name == _old_exe_script[j].param_name && _cmpt_func.list[k].param_group == _old_exe_script[j].param_group){
                                _param_is_equal = true;
                                break;
                            }
                        }
                        if(!_param_is_equal){
                            CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control,_old_exe_script);
                            _old_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                        }
                    }
                }else{
                    CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control,_old_exe_script);
                    _old_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                }
            }, 500);
        });
        _editor.on('focus', function() {
            //在修改脚本的时候不显示按钮提交
            $scope.control.cmpt_save_disabled = true;
            if(current_blur_timeout) {
                $timeout.cancel(current_blur_timeout);
                current_blur_timeout = null;
            }
        });
        _tem_edit=_editor;
    };
    //命令输入
    $scope.commandShellLoaded=function(_editor){
        var current_blur_timeout;
        CodeMirrorOption.setUniqueParamsEditor(_editor,_curr_code_type,$scope.data.plugin_hint_list);
        _editor.on('blur', function() {
            current_blur_timeout = $timeout(function() {
                var _hide_plugin_list = getHidePluginList($scope.info.cmpt_info.plugin_list);
                //可以提交组件信息
                $scope.info.cmpt_info.command.cmds = $scope.info.cmpt_info.command.exec_script ? $scope.info.cmpt_info.command.exec_script.split("\n") : [];
                var _total_script=$scope.info.cmpt_info.command.exec_script+""+$scope.info.cmpt_info.script_list[0].exec_script;
                var _cmpt_func = CmptFunc.getParamsByScript(_total_script ? _total_script:"" ,_hide_plugin_list);
                if(_cmpt_func.list.length == 0){
                    $scope.info.cmpt_info.param_list = [];
                }
                //参数不变不刷新参数表
                if(_old_command_exe_script.length == _cmpt_func.list.length){
                    $scope.info.cmpt_info.script_msg = _cmpt_func.msg;
                    $scope.control.cmpt_save_disabled = false;
                    if(_old_command_exe_script.length == 0){
                        return false;
                    }
                    for(var k= 0; k<_cmpt_func.list.length; k++){
                        var _param_is_equal = false;
                        for(var j=0; j<_old_command_exe_script.length; j++){
                            if(_cmpt_func.list[k].param_name == _old_command_exe_script[j].param_name && _cmpt_func.list[k].param_group == _old_command_exe_script[j].param_group){
                                _param_is_equal = true;
                                break;
                            }
                        }
                        if(!_param_is_equal){
                            CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control,_old_command_exe_script);
                            _old_command_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                        }
                    }
                }else{
                    CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control);
                    _old_command_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                }
            }, 500);
        });
        _editor.on('focus', function() {
            //在修改脚本的时候不显示按钮提交
            $scope.control.cmpt_save_disabled = true;
            if(current_blur_timeout) {
                $timeout.cancel(current_blur_timeout);
                current_blur_timeout = null;
            }
        });
    };
    //命令输入无提示
    $scope.commandNoneShellLoaded=function(_editor){
        var current_blur_timeout;
        CodeMirrorOption.setNoneParamsEditor(_editor,_curr_code_type,$scope.data.plugin_hint_list);
        _editor.on('blur', function() {
            current_blur_timeout = $timeout(function() {
                var _hide_plugin_list = getHidePluginList($scope.info.cmpt_info.plugin_list);
                //可以提交组件信息
                $scope.info.cmpt_info.command.cmds = $scope.info.cmpt_info.command.exec_script ? $scope.info.cmpt_info.command.exec_script.split("\n") : [];
                var _total_script=$scope.info.cmpt_info.command.exec_script +""+$scope.info.cmpt_info.script_list[0].exec_script;
                var _cmpt_func = CmptFunc.getParamsByScript(_total_script ? _total_script:"" ,_hide_plugin_list);
                if(_cmpt_func.list.length == 0){
                    $scope.info.cmpt_info.param_list = [];
                }
                //参数不变不刷新参数表
                if(_old_command_exe_script.length == _cmpt_func.list.length){
                    $scope.info.cmpt_info.script_msg = _cmpt_func.msg;
                    $scope.control.cmpt_save_disabled = false;
                    if(_old_command_exe_script.length == 0){
                        return false;
                    }
                    for(var k= 0; k<_cmpt_func.list.length; k++){
                        var _param_is_equal = false;
                        for(var j=0; j<_old_command_exe_script.length; j++){
                            if(_cmpt_func.list[k].param_name == _old_command_exe_script[j].param_name && _cmpt_func.list[k].param_group == _old_command_exe_script[j].param_group){
                                _param_is_equal = true;
                                break;
                            }
                        }
                        if(!_param_is_equal){
                            CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control,_old_command_exe_script);
                            _old_command_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                        }
                    }
                }else{
                    CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control);
                    _old_command_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                }
            }, 500);
        });
        _editor.on('focus', function() {
            //在修改脚本的时候不显示按钮提交
            $scope.control.cmpt_save_disabled = true;
            if(current_blur_timeout) {
                $timeout.cancel(current_blur_timeout);
                current_blur_timeout = null;
            }
        });
    }
    //脚本文件上传成功
    $scope.uploadScriptFileSuccessThen = function(){
        $scope.info.cmpt_info.file_path  = $scope.config.cmpt_script_fileupload.uploadpath + "/"+$scope.config.cmpt_script_fileupload.filename;
    };
    //删除脚本文件
    $scope.removeScriptFile = function(){
        $scope.config.cmpt_script_fileupload.filename = '';
        $scope.config.info.cmpt_info.file_path = '';
        $scope.config.info.cmpt_info.exec_script = '';
    };
    //下载脚本文件
    $scope.downloadScriptFile = function(){
        CV.downloadFile($scope.info.cmpt_info.file_path);
    };
    //下载插件
    $scope.downLoadPlugin = function (path) {
        CV.downloadFile(path);
    };
    //增加输出参数
    $scope.addOutputParam = function(){
        if($scope.info.cmpt_info.out_param_list.length !=0){
            for(var i = 0;i < $scope.info.cmpt_info.out_param_list.length; i++){
                if(!$scope.info.cmpt_info.out_param_list[i].param_name){
                    Modal.alert("参数名不能为空",3);
                    return false;
                }
            };
        }
        $scope.info.cmpt_info.out_param_list.push({
            type_name :"",
            type_cn_name:"",
            param_name:"",
        });
    };
    //增加输入参数
    $scope.addFileParam=function(){
        if($scope.info.cmpt_info.param_list.length !=0){
            for(var i = 0;i < $scope.info.cmpt_info.param_list.length; i++){
                if(!$scope.info.cmpt_info.param_list[i].param_name){
                    Modal.alert("参数名不能为空",3);
                    return false;
                }
            }
        }
        $scope.info.cmpt_info.param_list.push({
            type_name :"",
            type_cn_name:"",
            param_name:""
        });
    };
    //删除输出参数
    $scope.deleteOutputParam = function (index,tr) {
        var _type_name = tr.type_name ? tr.type_name : "";
        Modal.confirm("确认删除 "+ _type_name +" ?").then(function(){
            $scope.info.cmpt_info.out_param_list.splice(index,1);
        })
    };
    //删除文件参数
    $scope.deleteFileParam = function (index,tr) {
        var _type_name = tr.type_name ? tr.type_name :"";
        Modal.confirm("确认删除 "+ _type_name +" ?").then(function(){
            $scope.info.cmpt_info.param_list.splice(index,1);
        })
    };
    //提交新增组件信息
    $scope.cmptSubmit = function(){
        if(!CV.valiForm($scope.cmpt_form)){
            return false;
        }
        //判断不同脚本参数是否一致
        var script = $scope.info.cmpt_info.script_list[0].exec_script ? $scope.info.cmpt_info.script_list[0].exec_script : '';
        var reg = new RegExp("\\$\\{\\s*\\w+\\s*\\.?\\w+\\s*\\}+", "g");
        var _default_param = script.match(reg)!= null ? CmptFunc.arrayRemoveRepeat(script.match(reg)).sort().toString() :'';
        for(var n = 1;n < $scope.info.cmpt_info.script_list.length; n++){
            var _exec_script = $scope.info.cmpt_info.script_list[n].exec_script.match(reg);
            var _exec_script_param = _exec_script!=null ? CmptFunc.arrayRemoveRepeat(_exec_script).sort().toString() :'';
            if(_exec_script_param != _default_param){
                Modal.alert($scope.info.cmpt_info.script_list[n].script_type+"应与default脚本参数应保持一致！",3);
                return false;
            }else {
                $scope.info.cmpt_info.script_list[n].cmds = $scope.info.cmpt_info.script_list[n].exec_script ? $scope.info.cmpt_info.script_list[n].exec_script.split("\n") : [];
            }
        }
        if($scope.info.cmpt_info.component_source ==2 && !$scope.info.cmpt_info.file_path){
            Modal.alert("请上传脚本文件",3);
            return false;
        }
        $scope.control.cmpt_btn_loading = true;
        if($scope.info.cmpt_info.command &&  $scope.info.cmpt_info.command.cmds){
            $scope.info.cmpt_info.command.cmds = $scope.info.cmpt_info.command.exec_script ? $scope.info.cmpt_info.command.exec_script.split("\n") : [];
        }
        if($scope.info.cmpt_info.impl_type == 19){
            $scope.info.cmpt_info.component_source = 3;
        }
        //保存组件
        Cmpt.addModule($scope.info.cmpt_info).then(function(data){
            $timeout(function(){
                if(data.override_flag) {
                    $scope.control.cmpt_btn_loading = false;
                    Modal.confirm("组件["+ $scope.info.cmpt_info.id +"]已存在，是否覆盖?").then(function(){
                        //保存导入组件文件
                        Cmpt.updateModule($scope.info.cmpt_info).then(function(data){
                            $timeout(function(){
                                if(data){
                                    Modal.alert("组件保存成功！",2);
                                    $state.go("cmpt_list");
                                }
                            },0)
                        },function(error){
                            Modal.alert(error.message,3);
                        });
                    });
                }else{
                    Modal.alert("组件保存成功！",2);
                    $state.go("cmpt_list");
                }
            },0);
        },function(error){
            Modal.alert(error.message,3);
            $scope.control.cmpt_btn_loading = false;
        });
    };
    //组件-取消表单
    $scope.cmptFormCancel = function(){
        $state.go("cmpt_list");
    };
    init();
}]);
//修改组件
cmpt_m.controller('cmptModifyCtrl',['$scope', '$timeout', '$state', '$stateParams', 'CodeMirrorOption', 'IML_TYPE','CmptType','CmptSysType', 'Cmpt', 'envManage', 'CmptFunc', 'Plugin', 'pluginType', 'jdkVersion', 'Modal', 'CV', function ($scope, $timeout, $state, $stateParams, CodeMirrorOption, IML_TYPE, CmptType, CmptSysType, Cmpt ,envManage ,CmptFunc, Plugin, pluginType, jdkVersion, Modal, CV) {
    var _cmpt_id = $stateParams.cmpt_id;
    var _old_exe_script = [];           //保存上一次的执行脚本(判断脚本有没有修改)
    var _old_command_exe_script = [];   //组件命令-上次命令脚本
    var _curr_code_type = 1;            //默认1 为shell语言 2 为python语言 3 为java语言 4 为SQL
    var _tem_edit = {};   //执行脚本输入框配置参数(只读)
    //配置
    $scope.config = {
        cmpt_accessory_fileupload : { //C/C++附件上传配置
            suffixs:'',
            filetype: "",
            filename: "",
            uploadpath: ""
        },
        cmpt_fileupload : {           //组件上传配置
            suffixs:'xml',
            filetype: "XML",
            filename: "",
            uploadpath: ""
        },
        cmpt_script_fileupload : {    //脚本上传配置
            suffixs:'',/*sh*/
            filetype: "",/*SHELL*/
            filename: "",
            uploadpath: ""
        }
    };
    //页面控制
    $scope.control={                  //组件控制对象
        cmpt_save_disabled: false,        //组件保存按钮是否禁用
        cmpt_btn_loading :false,          //组件保存中
        nav_show_flag   : 0 ,             //导航条显示标志
        cmpt_get_param_loading : false,     //组件获取参数loading
        cmpt_command_param_loading : false,//组件命令获取参数loading
        expand_flag     :false,           //组件全部展开标志
        import_loading : false,            //组件导入loading
        cmpt_type_disabled :false,         //组件类型控制是否可点击（控制除数据采集以外的类型）
        cmpt_type_collect :false,         //组件类型控制是否可点击（控制除数据采集类型）
        show_codemirror : true,           //执行脚本codemirror刷新标志
        show_check_comp : false           //是否显示校验组件
    };
    //页面对象
    $scope.info = {
        cmpt_info : {}
    };
    //页面data
    $scope.data = {
        cmpt_type_list : [],                  //组件类型
        certificate_cmpt_list : [] ,         //组件--验证组件列表
        jdk_version_list : jdkVersion,           //语言版本
        plugin_list : [],                   //可用插件列表
        plugin_hint_list : [],               //转换后提示的插件列表
        auto_param_list : [],
        execute_type_list: IML_TYPE,       //执行类型
        label_init_list : []
    };
    //根据返回组件类型转化成页面绑定格式（cmpt_type_choose_list：选中的组件类型列表）
    var chooseCheckBox = function (cmpt_type_choose_list) {
        var _cmpt_type_list =$scope.data.cmpt_type_list;
        for(var i=0;i<cmpt_type_choose_list.length;i++){
            for(var j=0;j<_cmpt_type_list.length;j++){
                if(_cmpt_type_list[j].key == cmpt_type_choose_list[i]){
                    _cmpt_type_list[j].state=true;
                }
            }
        }
    };
    //获取执行类别对应的可用插件列表（impl_type:执行类别）
    var getPluginListByImplType = function (impl_type) {
        //获取对应实现类型的插件列表
        Plugin.getAllPluginList(impl_type).then(function(data) {
            if(data){
                $scope.data.plugin_list = data.plugin_list ? data.plugin_list : [];
            }
        }, function(error) {
            // Modal.alert(error.message);
        });
    };
    //通过类型获取提示文字列表（impl_type:执行类别）
    var getAutoParamByImplType = function(impl_type){
        //通过类型得到提示文字列表
        Cmpt.grammarBytype(impl_type).then(function(data) {
            if(data){
                var _tem_grammer_list = data.grammar_list ? data.grammar_list : [];
                $scope.data.auto_param_list = CmptFunc.translateGrammarHint(_tem_grammer_list);
                $scope.shellLoaded(_tem_edit);
            }
        }, function(error) {
            // Modal.alert(error.message);
        });
    };
    //获取插件字符串列表（为了不刷到参数列表中）（list:插件列表）
    var getHidePluginList = function (list) {
        var arr = [];
        for(var i = 0; i < list.length; i++){
            if(list[i].plugin_name){
                arr.push(list[i].plugin_name)
            }
        }
        return arr;
    };
    //获取附件上传路径
    var getAccessaryUploadPath = function () {
        envManage.getUploadPath().then(function(data) {
            if(data){
                $scope.config.cmpt_accessory_fileupload.uploadpath = data.upload_path ? data.upload_path : '';
            }
        }, function(error) {
            // Modal.alert(error.message);
        });
    };
    //执行脚本失去焦点获得参数
    var init = function(){
        //初始化组件类型
        angular.forEach(CmptType,function (data) {
            $scope.data.cmpt_type_list.push(angular.extend({state:false},data));
        });
        //初始化组件信息对象
        Cmpt.viewModulegetModuleDetail(_cmpt_id).then(function(data){
            $timeout(function () {
                if(data){
                    _old_exe_script = data.component.param_list || [];
                    var _cmpt_info= {
                        id          : data.component.id,
                        cn_name     : data.component.cn_name.substring(0,2) == '/*' ? data.component.cn_name.substring(2,data.component.cn_name.length-2) : data.component.cn_name,
                        old_cn_name : data.component.cn_name.substring(0,2) == '/*' ? data.component.cn_name.substring(2,data.component.cn_name.length-2) : data.component.cn_name,
                        bk_desc     : data.component.bk_desc,
                        command     : data.component.command || "",
                        impl_type   : data.component.impl_type,
                        param_list  : data.component.param_list || [],
                        command_param_list : data.component.command_param_list || [],
                        out_param_list : data.component.out_param_list || [],          //组件输出参数
                        ref_flag    : data.ref_flag ? data.ref_flag:false,
                        cmds : data.component.cmds || [],                  //上传组件执行脚本（数组）
                        component_purposes : data.component.component_purposes || [],
                        component_source   : data.component.component_source ? data.component.component_source : 1,
                        file_param         : data.component.file_param || '',
                        file_path     :  data.component.file_path  || '',
                        check_comp_id : data.component.check_comp_id,
                        tag_list      :data.component.tag_list || [],
                        language_version   : data.component.language_version,
                        script_list   : data.component.script_list ? data.component.script_list:[{script_type : 'default', active: true, cmds  :[], code_mirror_control:false, exec_script :''}],
                        plugin_list   : data.component.plugin_list || [],
                        lib_name      : data.component.lib_name || "",
                        pgm_name	  : data.component.pgm_name || "",
                        annex_file    :data.component.annex_file
                    };
                    $scope.config.cmpt_accessory_fileupload.filename = _cmpt_info.annex_file ? _cmpt_info.annex_file.substring(_cmpt_info.annex_file.lastIndexOf('/')+1):'';
                    $scope.config.cmpt_script_fileupload.filename = _cmpt_info.file_path ? _cmpt_info.file_path.substring(_cmpt_info.file_path.lastIndexOf('/')+1):'';
                    var _file_type = $scope.config.cmpt_accessory_fileupload.filename.substring($scope.config.cmpt_accessory_fileupload.filename.lastIndexOf('.')+1);
                    $scope.config.cmpt_accessory_fileupload.filetype = CmptFunc.judgeFileType(_file_type);
                    $scope.control.show_check_comp = CmptFunc.judgeShowCheckCmpt(_cmpt_info.component_purposes);
                    _curr_code_type = (_cmpt_info.impl_type <6) ? 1 : (_cmpt_info.impl_type == 6) ? 4 : (_cmpt_info.impl_type == 7 || _cmpt_info.impl_type == 8) ? 2 :(_cmpt_info.impl_type == 14) ? 3 : 1;
                    $scope.info.cmpt_info = angular.extend($scope.info.cmpt_info,_cmpt_info);
                    getPluginListByImplType(_cmpt_info.impl_type);
                    $scope.data.plugin_hint_list = CmptFunc.translatePluginHint($scope.info.cmpt_info.plugin_list);
                    angular.forEach($scope.info.cmpt_info.script_list,function (data) {
                        if(data.cmds){
                            data.exec_script = CmptFunc.cmdsToString(data.cmds);
                        }
                        data.active = data.script_type=='default' ? true :false;
                        data.code_mirror_control = false;
                    });
                    if(data.component.command && data.component.command.cmds){
                        $scope.info.cmpt_info.command={
                            exec_script: CmptFunc.cmdsToString(data.component.command.cmds),
                            cmds:data.component.command.cmds
                        }
                    }
                    //根据返回组件类型转化成页面绑定格式
                    chooseCheckBox($scope.info.cmpt_info.component_purposes);
                    //查询所有组件标签
                    Cmpt.selectAllTas().then(function (data) {
                        if(data){
                            $timeout(function () {
                                var _total_label_list=data.tag_list ? data.tag_list :[];
                                for(var i=0;i<_total_label_list.length;i++){
                                    var _obj={
                                        value:_total_label_list[i],
                                        flag:false
                                    };
                                    if($scope.info.cmpt_info.tag_list.indexOf(_total_label_list[i])>-1){
                                        _obj.flag=true;
                                    }
                                    $scope.data.label_init_list.push(_obj);
                                }
                            },0)
                        }
                    },function (error) {
                        Modal.alert(error.message,3);
                    });
                    //查询所有验证组件
                    Cmpt.getPublishedCmpt(1,5).then(function (data) {
                        if(data){
                            $timeout(function () {
                                var _comp_list = data.comp_list ? data.comp_list :[];
                                for(var i=0;i<_comp_list.length;i++){
                                    $scope.data.certificate_cmpt_list.push({
                                        check_comp_name:_comp_list[i].cn_name,
                                        check_comp_id  :_comp_list[i].id
                                    })
                                }
                            },0)
                        }
                    },function (error) {
                        Modal.alert(error.message,3);
                    })
                }
            },0);
        },function(error){
            Modal.alert(error.message,3);
            $state.go("cmpt_list");
        });
        getAccessaryUploadPath();
    };
    //选择组件类型()
    $scope.selectCmptType = function(){
        //解决切换后codemirror加载问题
        for(var j = 0; j < $scope.info.cmpt_info.script_list.length; j++){
            $scope.info.cmpt_info.script_list[j].code_mirror_control = false;
        }
        $scope.info.cmpt_info.component_purposes =[];
        var _cmpt_type_list = $scope.data.cmpt_type_list;
        for(var i = 0; i < _cmpt_type_list.length; i++){
            if(_cmpt_type_list[i].state){
                $scope.info.cmpt_info.component_purposes.push(_cmpt_type_list[i].key);
            }
        }
        _old_exe_script = [];
        //判断是否显示校验组件
        $scope.control.show_check_comp = CmptFunc.judgeShowCheckCmpt($scope.info.cmpt_info.component_purposes);
        if(!$scope.control.show_check_comp){
            if($scope.info.cmpt_info.check_comp_id) {
                $scope.info.cmpt_info.check_comp_id = ''
            }
        }
    };
    //选择实现类型来切换codemirror的代码高亮类型（impl_type：执行类别）
    $scope.chooseImplType = function (impl_type) {
        $scope.data.jdk_version_list = [];
        $scope.data.plugin_list = [];
        $scope.data.auto_param_list = [];
        _curr_code_type = (impl_type < 6) ? 1 : (impl_type == 6) ? 4 : (impl_type == 7 || impl_type == 8) ? 2 :(impl_type == 14) ? 3 : 1;
        $scope.control.show_codemirror = false;
        $timeout(function () {
            $scope.control.show_codemirror = true;
        },20);
        getAutoParamByImplType(impl_type);
        getPluginListByImplType(impl_type);
    };
    //添加分类标签
    $scope.addClassifyLabel = function () {
        Modal.addCmptLabel($scope.data.label_init_list).then(function (data) {
            $scope.data.label_init_list = data;
            var _cmp_label_list = [];     //临时选中的标签列表
            for(var i = 0;i < data.length; i++){
                var _label = data[i];
                if(_label.flag){
                    _cmp_label_list.push(_label.value);
                }
            }
            $scope.info.cmpt_info.tag_list = _cmp_label_list;
        })
    };
    //新增执行脚本
    $scope.addScript = function () {
        Modal.addCmptSysType({}).then(function (ret) {
            var _script_info = {
                script_type : ret.toLowerCase(),   //脚本类型
                code_mirror_control:false,
                active: true,
                cmds : [],           //脚本（数组）
                exec_script:''      //脚本（字符串）
            };
            $scope.info.cmpt_info.script_list.push(_script_info);
        });
    };
    //解决codemirror加载显示不出来问题（index：当前选中的select）
    $scope.selectScript = function(index){
        $scope.control.show_codemirror = false;
        $timeout(function () {
            $scope.control.show_codemirror = true;
            if($scope.info.cmpt_info.script_list[index]){
                $scope.info.cmpt_info.script_list[index].code_mirror_control = true;
            }
        },20)
    };
    //删除执行脚本
    $scope.deleteScript = function (index) {
        Modal.confirm("确认删除当前脚本？").then(function (choose) {
            if(choose){
                $scope.info.cmpt_info.script_list.splice(index,1);
            }
        });
    };
    //附件上传成功
    $scope.ImportAccessorySuccessThen = function () {
        $scope.info.cmpt_info.annex_file = $scope.config.config.cmpt_accessory_fileupload.uploadpath+'/'+$scope.config.config.cmpt_accessory_fileupload.filename;
        var _file_type = $scope.config.config.cmpt_accessory_fileupload.filename.substring($scope.config.config.cmpt_accessory_fileupload.filename.lastIndexOf('.')+1)
        $scope.config.config.cmpt_accessory_fileupload.filetype = CmptFunc.judgeFileType(_file_type);
    };
    //删除附件
    $scope.removeAccessoryFile = function () {
        $scope.config.config.cmpt_accessory_fileupload.filename = '';
        $scope.info.cmpt_info.annex_file = '';
        $scope.config.cmpt_accessory_fileupload.filetype = '';
    };
    //下载附件
    $scope.downloadAccessoryFile = function(){
        CV.downloadFile($scope.info.cmpt_info.annex_file);
    };
    //参数默认值输入框智能提示
    $scope.paramShellLoaded = function(_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };
    //添加插件
    $scope.addAvailablePlugin = function () {
        if($scope.info.cmpt_info.plugin_list.length !=0){
            for(var i=0;i < $scope.info.cmpt_info.plugin_list.length; i++){
                if(!$scope.info.cmpt_info.plugin_list[i].plugin_name){
                    Modal.alert("请选择插件名",3);
                    return false;
                }
            }
            //无可用插件
            if($scope.data.plugin_list.length == $scope.info.cmpt_info.plugin_list.length){
                Modal.alert("无可再添加的插件！",3);
                return false
            }
        }
        $scope.info.cmpt_info.plugin_list.push({
            plugin_name : "",
            plugin_type : "",
            plugin_file_name : "",
            plugin_bk_desc : ""
        });
    };
    //绑定选择的插件的基本信息及刷新codemirror提示信息（插件名，index，当前行对象）
    $scope.bindPluginInfo = function (selectKey,index, tr) {
        var plugin_name_info = {};
        for(var j=0;j< $scope.info.cmpt_info.plugin_list.length; j++){
            var _plugin_name = $scope.info.cmpt_info.plugin_list[j].plugin_name;
            //去重
            if(!plugin_name_info[_plugin_name]){
                plugin_name_info[_plugin_name] = 1;
            }else{
                Modal.alert("插件已经添加！",3);
                $scope.info.cmpt_info.plugin_list.splice(index,1);
                return false;
            }
        }
        for(var i=0;i < $scope.data.plugin_list.length;i++){
            var _plugin = $scope.data.plugin_list[i];
            if( selectKey == _plugin.plugin_name ){
                tr.plugin_type =_plugin.plugin_type;
                tr.plugin_file_name =_plugin.plugin_file_name;
                tr.plugin_bk_desc = _plugin.plugin_bk_desc;
                break;
            }
        }
        $scope.data.plugin_hint_list = CmptFunc.translatePluginHint($scope.info.cmpt_info.plugin_list);
        $scope.control.show_codemirror = false;
        $timeout(function () {
            $scope.control.show_codemirror = true;
        },20);
    };
    //插件类型转化中文名（插件类型）
    $scope.getPluginTypeCnName = function(plugin_type){
        return CV.findValue(plugin_type,pluginType);
    };
    // 删除已经选择的插件
    $scope.deleteSinglePlugin = function (index) {
        var _plugin_name = $scope.info.cmpt_info.plugin_list[index].plugin_name;
        if(_plugin_name){
            Modal.confirm("确认是否要删除[ " + _plugin_name + " ]插件?").then(function () {
                $scope.info.cmpt_info.plugin_list.splice(index,1);
                $scope.data.plugin_hint_list = CmptFunc.translatePluginHint($scope.info.cmpt_info.plugin_list);
                $scope.control.show_codemirror = false;
                $timeout(function () {
                    $scope.control.show_codemirror = true;
                },20);
            })
        }else{
            $scope.info.cmpt_info.plugin_list.splice(index,1);
            $scope.data.plugin_hint_list = CmptFunc.translatePluginHint($scope.info.cmpt_info.plugin_list);
            $scope.control.show_codemirror = false;
            $timeout(function () {
                $scope.control.show_codemirror = true;
            },20);
        }
    };
    //脚本输入框智能提示
    $scope.mentionParam = function (_editor) {
        CodeMirrorOption.setEditor(_editor ,_curr_code_type,$scope.data.plugin_hint_list,$scope.data.auto_param_list);
    };
    //脚本输入框智能提示
    $scope.shellLoaded = function(_editor) {
        var current_blur_timeout;
        CodeMirrorOption.setEditor(_editor ,_curr_code_type ,$scope.data.plugin_hint_list);
        _editor.on('blur', function() {
            current_blur_timeout = $timeout(function() {
                var _hide_plugin_list = getHidePluginList($scope.info.cmpt_info.plugin_list);
                //可以提交组件信息
                $scope.info.cmpt_info.script_list[0].cmds = $scope.info.cmpt_info.script_list[0].exec_script ? $scope.info.cmpt_info.script_list[0].exec_script.split("\n") : [];
                var _total_script=$scope.info.cmpt_info.script_list[0].exec_script +""+$scope.info.cmpt_info.command.exec_script;
                var _cmpt_func = CmptFunc.getParamsByScript(_total_script ? _total_script :"" , _hide_plugin_list);
                if(_cmpt_func.list.length == 0){
                    $scope.info.cmpt_info.param_list = [];
                }
                //参数不变不刷新参数表
                if(_old_exe_script.length == _cmpt_func.list.length){
                    $scope.info.cmpt_info.script_msg = _cmpt_func.msg;
                    $scope.control.cmpt_save_disabled = false;
                    if(_old_exe_script.length == 0){
                        return false;
                    }
                    for(var k= 0; k<_cmpt_func.list.length; k++){
                        var _param_is_equal = false;
                        for(var j=0; j<_old_exe_script.length; j++){
                            if(_cmpt_func.list[k].param_name == _old_exe_script[j].param_name && _cmpt_func.list[k].param_group == _old_exe_script[j].param_group){
                                _param_is_equal = true;
                                break;
                            }
                        }
                        if(!_param_is_equal){
                            CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control,_old_exe_script);
                            _old_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                        }
                    }
                }else{
                    CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control,_old_exe_script);
                    _old_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                }
            }, 500);
        });
        _editor.on('focus', function() {
            //在修改脚本的时候不显示按钮提交
            $scope.control.cmpt_save_disabled = true;
            if(current_blur_timeout) {
                $timeout.cancel(current_blur_timeout);
                current_blur_timeout = null;
            }
        });
        _tem_edit=_editor;
    };
    //命令输入
    $scope.commandShellLoaded=function(_editor){
        var current_blur_timeout;
        CodeMirrorOption.setUniqueParamsEditor(_editor,_curr_code_type,$scope.data.plugin_hint_list);
        _editor.on('blur', function() {
            current_blur_timeout = $timeout(function() {
                var _hide_plugin_list = getHidePluginList($scope.info.cmpt_info.plugin_list);
                //可以提交组件信息
                $scope.info.cmpt_info.command.cmds = $scope.info.cmpt_info.command.exec_script ? $scope.info.cmpt_info.command.exec_script.split("\n") : [];
                var _total_script=$scope.info.cmpt_info.command.exec_script+""+$scope.info.cmpt_info.script_list[0].exec_script;
                var _cmpt_func = CmptFunc.getParamsByScript(_total_script ? _total_script:"" ,_hide_plugin_list);
                if(_cmpt_func.list.length == 0){
                    $scope.info.cmpt_info.param_list = [];
                }
                //参数不变不刷新参数表
                if(_old_command_exe_script.length == _cmpt_func.list.length){
                    $scope.info.cmpt_info.script_msg = _cmpt_func.msg;
                    $scope.control.cmpt_save_disabled = false;
                    if(_old_command_exe_script.length == 0){
                        return false;
                    }
                    for(var k= 0; k<_cmpt_func.list.length; k++){
                        var _param_is_equal = false;
                        for(var j=0; j<_old_command_exe_script.length; j++){
                            if(_cmpt_func.list[k].param_name == _old_command_exe_script[j].param_name && _cmpt_func.list[k].param_group == _old_command_exe_script[j].param_group){
                                _param_is_equal = true;
                                break;
                            }
                        }
                        if(!_param_is_equal){
                            CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control,_old_command_exe_script);
                            _old_command_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                        }
                    }
                }else{
                    CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control);
                    _old_command_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                }
            }, 500);
        });
        _editor.on('focus', function() {
            //在修改脚本的时候不显示按钮提交
            $scope.control.cmpt_save_disabled = true;
            if(current_blur_timeout) {
                $timeout.cancel(current_blur_timeout);
                current_blur_timeout = null;
            }
        });
    };
    //命令输入无提示
    $scope.commandNoneShellLoaded=function(_editor){
        var current_blur_timeout;
        CodeMirrorOption.setNoneParamsEditor(_editor,_curr_code_type,$scope.data.plugin_hint_list);
        _editor.on('blur', function() {
            current_blur_timeout = $timeout(function() {
                var _hide_plugin_list = getHidePluginList($scope.info.cmpt_info.plugin_list);
                //可以提交组件信息
                $scope.info.cmpt_info.command.cmds = $scope.info.cmpt_info.command.exec_script ? $scope.info.cmpt_info.command.exec_script.split("\n") : [];
                var _total_script=$scope.info.cmpt_info.command.exec_script + $scope.info.cmpt_info.script_list[0].exec_script;
                var _cmpt_func = CmptFunc.getParamsByScript(_total_script ? _total_script:"" ,_hide_plugin_list);
                if(_cmpt_func.list.length == 0){
                    $scope.info.cmpt_info.param_list = [];
                }
                //参数不变不刷新参数表
                if(_old_command_exe_script.length == _cmpt_func.list.length){
                    $scope.info.cmpt_info.script_msg = _cmpt_func.msg;
                    $scope.control.cmpt_save_disabled = false;
                    if(_old_command_exe_script.length == 0){
                        return false;
                    }
                    for(var k= 0; k<_cmpt_func.list.length; k++){
                        var _param_is_equal = false;
                        for(var j=0; j<_old_command_exe_script.length; j++){
                            if(_cmpt_func.list[k].param_name == _old_command_exe_script[j].param_name && _cmpt_func.list[k].param_group == _old_command_exe_script[j].param_group){
                                _param_is_equal = true;
                                break;
                            }
                        }
                        if(!_param_is_equal){
                            CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control,_old_command_exe_script);
                            _old_command_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                        }
                    }
                }else{
                    CmptFunc.blurGetParams(_cmpt_func, $scope.info.cmpt_info,$scope.control);
                    _old_command_exe_script = CmptFunc.getOldExecParamList(_cmpt_func);
                }
            }, 500);
        });
        _editor.on('focus', function() {
            //在修改脚本的时候不显示按钮提交
            $scope.control.cmpt_save_disabled = true;
            if(current_blur_timeout) {
                $timeout.cancel(current_blur_timeout);
                current_blur_timeout = null;
            }
        });
    }
    //脚本文件上传成功
    $scope.uploadScriptFileSuccessThen = function(){
        $scope.info.cmpt_info.file_path  = $scope.config.cmpt_script_fileupload.uploadpath + "/"+$scope.config.cmpt_script_fileupload.filename;
    };
    //删除脚本文件
    $scope.removeScriptFile = function(){
        $scope.config.cmpt_script_fileupload.filename = '';
        $scope.config.info.cmpt_info.file_path = '';
        $scope.config.info.cmpt_info.exec_script = '';
    };
    //下载脚本文件
    $scope.downloadScriptFile = function(){
        CV.downloadFile($scope.info.cmpt_info.file_path);
    };
    //下载插件
    $scope.downLoadPlugin = function (path) {
        CV.downloadFile(path);
    };
    //增加输出参数
    $scope.addOutputParam = function(){
        if($scope.info.cmpt_info.out_param_list.length !=0){
            for(var i = 0;i < $scope.info.cmpt_info.out_param_list.length; i++){
                if(!$scope.info.cmpt_info.out_param_list[i].param_name){
                    Modal.alert("参数名不能为空",3);
                    return false;
                }
            };
        }
        $scope.info.cmpt_info.out_param_list.push({
            type_name :"",
            type_cn_name:"",
            param_name:"",
        });
    };
    //增加输入参数
    $scope.addFileParam=function(){
        if($scope.info.cmpt_info.param_list.length !=0){
            for(var i = 0;i < $scope.info.cmpt_info.param_list.length; i++){
                if(!$scope.info.cmpt_info.param_list[i].param_name){
                    Modal.alert("参数名不能为空",3);
                    return false;
                }
            }
        }
        $scope.info.cmpt_info.param_list.push({
            type_name :"",
            type_cn_name:"",
            param_name:""
        });
    };
    //删除输出参数
    $scope.deleteOutputParam = function (index,tr) {
        var _type_name = tr.type_name ? tr.type_name : "";
        Modal.confirm("确认删除 "+ _type_name +" ?").then(function(){
            $scope.info.cmpt_info.out_param_list.splice(index,1);
        })
    };
    //删除文件参数
    $scope.deleteFileParam = function (index,tr) {
        var _type_name = tr.type_name ? tr.type_name :"";
        Modal.confirm("确认删除 "+ _type_name +" ?").then(function(){
            $scope.info.cmpt_info.param_list.splice(index,1);
        })
    };
    //提交新增组件信息
    $scope.cmptSubmit = function(){
        //表单验证
        if(!CV.valiForm($scope.cmpt_form)){
            return false;
        }
        var script = $scope.info.cmpt_info.script_list[0].exec_script ? $scope.info.cmpt_info.script_list[0].exec_script : '';
        var reg = new RegExp("\\$\\{\\s*\\w+\\s*\\.?\\w+\\s*\\}+", "g");
        var _default_param = script.match(reg)!=null ? CmptFunc.arrayRemoveRepeat(script.match(reg)).sort().toString() :'';
        for(var n=1; n < $scope.info.cmpt_info.script_list.length; n++){
            var _exec_script = $scope.info.cmpt_info.script_list[n].exec_script.match(reg);
            var _exec_script_param = _exec_script!=null ? CmptFunc.arrayRemoveRepeat(_exec_script).sort().toString() :'';
            if(_exec_script_param != _default_param){
                Modal.alert($scope.info.cmpt_info.script_list[n].script_type+"应与default脚本参数应保持一致！",3);
                return false;
            }else {
                $scope.info.cmpt_info.script_list[n].cmds = $scope.info.cmpt_info.script_list[n].exec_script ? $scope.info.cmpt_info.script_list[n].exec_script.split("\n") : [];
            }
        }
        if($scope.info.cmpt_info.module_purpose == 2 && !$scope.info.cmpt_info.file_path){
            Modal.alert("请上传脚本文件",3);
            return false;
        }
        $scope.control.cmpt_btn_loading = true;
        if( $scope.info.cmpt_info.command &&  $scope.info.cmpt_info.command.cmds){
            $scope.info.cmpt_info.command.cmds=$scope.info.cmpt_info.command.exec_script ? $scope.info.cmpt_info.command.exec_script.split("\n") : [];
        }
        //提交表单服务
        Cmpt.updateModule($scope.info.cmpt_info).then(function(data){
            $timeout(function(){
                if(data){
                    $scope.control.cmpt_btn_loading = false;
                    Modal.alert("组件信息修改成功",2);
                    $state.go("cmpt_list");
                }
            },1000);
        },function(error){
            $scope.control.cmpt_btn_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //组件-取消表单
    $scope.cmptFormCancel = function(){
        $state.go("cmpt_list");
    };
    init();
}]);
//查看组件
cmpt_m.controller('cmptDetailCtrl', ["$scope", "$stateParams", "$state", "$timeout", "IML_TYPE", "CmptType", "Cmpt", "CmptFunc", "CodeMirrorOption","pluginType", "Modal", "CV", function ($scope, $stateParams, $state, $timeout, IML_TYPE, CmptType, Cmpt, CmptFunc, CodeMirrorOption,pluginType, Modal, CV) {
    var _cmpt_id = $stateParams.cmpt_id;    //组件ID
    var _curr_code_type = 1;                //默认1 为shell语言 2 为python语言 3 为java语言 4 为SQL
    //页面信息
    $scope.info = {
        cmpt_info : {
            module_purpose:[],              //组件类型
            component_source:1,             //脚本来源
            file_path:'',                   //脚本文件路
            file_param:'',                  //命令行参数
            id       : _cmpt_id,                 //组件id
            publish_state : 2 ,             //发布状态默认未发布
            cn_name  : "",                  //组件中文名
            bk_desc  : "",                  //组件描述
            type        : "",               //组件类型
            impl_type   :   "",             //组件实现类型
            ref_flag    :   false,          //引用标志
            file_path_export     : "",      //组件导出路径
            param_list   : [],              //组件参数列表
            command_param_list:[],          //命令参数列表
            out_param_list:[],              //组件输出参数
            cmds          : [],             //组件执行脚本命令
            script_list :[],                //脚本列表
            can_export:false,               //是否可以导出
            tag_list:[],                    //分类标签列表
            plugin_list : [],               //插件列表
            command:{
                cmds  :[],                  //组件执行命令（数组）
                code_mirror_control:false,  //解决codemirror加载显示不出来
                exec_script :''             //组件执行命令（字符串）
            },
            lib_name:"",
            pgm_name:""
        }
    };
    //页面配置
    $scope.config = {
        cmpt_script_fileupload : {          //上传脚本文件参数
            suffixs:'sh',
            filetype: "SHELL",
            filename: "",
            uploadpath: ""
        },
        cmpt_accessory_fileupload : {       //C/C++附件
            suffixs:'',
            filetype: "",
            filename: "",
            uploadpath: ""
        },
        code_mirror_config : {}             //codemirror配置
    };
    //页面数据
    $scope.data = {
        cmpt_type_list:[]                  //组件类型列表
    };
    //页面控制
    $scope.control = {
        show_codemirror : false            //解决codemirror加载问题
    };
    //根据返回组件类型转化成页面绑定格式
    var chooseCheckBox = function (cmpt_type_choose_list) {
        var _cmpt_type_list =$scope.data.cmpt_type_list;
        for(var i=0;i<cmpt_type_choose_list.length;i++){
            for(var j=0;j<_cmpt_type_list.length;j++){
                if(_cmpt_type_list[j].key == cmpt_type_choose_list[i]){
                    _cmpt_type_list[j].state=true;
                }
            }
        }
    };

    var init = function(){
        //初始化组件类型
        angular.forEach(CmptType,function (data) {
            $scope.data.cmpt_type_list.push(angular.extend({state:false},data));
        });
        $scope.control.show_codemirror = false;
        //初始化组件信息对象
        Cmpt.viewModulegetModuleDetail(_cmpt_id).then(function(data){
            $timeout(function () {
                if(data){
                    var _cmpt_info = {
                        id                  : _cmpt_id,               //组件id
                        publish_state       : data.publish_state ? data.publish_state :2 ,
                        cn_name             : data.component.cn_name,
                        bk_desc             : data.component.bk_desc,
                        impl_type           : data.component.impl_type,
                        command             : data.component.command || '',
                        impl_type_cn        : CV.findValue(data.component.impl_type,IML_TYPE),
                        ref_flag            : data.ref_flag,
                        file_path_export    : data.file_path,
                        param_list          : data.component.param_list || [],
                        command_param_list:   data.component.command_param_list || [],
                        out_param_list      : data.component.out_param_list || [],         //组件输出参数
                        component_purposes  : data.component.component_purposes || [],
                        component_source    : data.component.component_source || 1,
                        file_param          : data.component.file_param || '',
                        script_list         : data.component.script_list || [],
                        file_path           : data.component.file_path,
                        check_comp_name     : data.component.check_comp_name,
                        language_version    : data.component.language_version,
                        tag_list            : data.component.tag_list || [],
                        plugin_list         : data.component.plugin_list || [],
                        annex_file          : data.component.annex_file,
                        lib_name			: data.component.lib_name || '',
                        pgm_name			: data.component.pgm_name || '',
                    };
                    $scope.config.cmpt_accessory_fileupload.filename = _cmpt_info.annex_file ? _cmpt_info.annex_file.substring(_cmpt_info.annex_file.lastIndexOf('/')+1) : '';
                    var _file_type = $scope.config.cmpt_accessory_fileupload.filename.substring($scope.config.cmpt_accessory_fileupload.filename.lastIndexOf('.')+1);
                    $scope.config.cmpt_accessory_fileupload.filetype = CmptFunc.judgeFileType(_file_type);
                    _curr_code_type = (_cmpt_info.impl_type <6) ? 1 : (_cmpt_info.impl_type == 6) ? 4 : (_cmpt_info.impl_type == 7 || _cmpt_info.impl_type == 8) ? 2 :(_cmpt_info.impl_type == 14) ? 3 : 1;
                    //执行脚本输入框配置参数
                    $scope.config.code_mirror_config = (_curr_code_type == 4) ? CodeMirrorOption.Sql(true) : (_curr_code_type == 3) ? CodeMirrorOption.Java(true) :(_curr_code_type == 2) ? CodeMirrorOption.Python(true) : CodeMirrorOption.Sh(true) ;
                    angular.forEach(_cmpt_info.component_purposes,function(purpose){
                        if(purpose==1){
                            _cmpt_info.can_export=true;
                        }
                    });
                    $scope.info.cmpt_info = angular.extend($scope.info.cmpt_info,_cmpt_info);
                    angular.forEach($scope.info.cmpt_info.script_list,function (data) {
                        if(data.cmds){
                            data.exec_script = CmptFunc.cmdsToString(data.cmds);
                        }
                        data.active = data.script_type=='default' ? true :false;    //当前默认'default'tab上
                        data.code_mirror_control = false;
                    });
                    if(data.component.command && data.component.command.cmds){
                        $scope.info.cmpt_info.command = {
                            exec_script: CmptFunc.cmdsToString(data.component.command.cmds)
                        }
                    }
                    $scope.info.cmpt_info.exec_script = CmptFunc.cmdsToString($scope.info.cmpt_info.cmds);
                    //根据返回组件类型转化成页面绑定格式
                    chooseCheckBox($scope.info.cmpt_info.component_purposes);
                    if($scope.info.cmpt_info.script_list[0].cmds){
                        $scope.info.cmpt_info.exec_script = CmptFunc.cmdsToString($scope.info.cmpt_info.script_list[0].cmds);
                    }
                    if(data.component.file_path){
                        $scope.config.cmpt_script_fileupload.uploadpath = data.component.file_path.substring(0,data.component.file_path.lastIndexOf("/")+1);
                        $scope.config.cmpt_script_fileupload.filename = data.component.file_path.substring(data.component.file_path.lastIndexOf("/")+1,data.component.file_path.length);
                    }
                    $scope.control.show_codemirror = true;
                }
            },0)
        },function(error){
            Modal.alert(error.message,3);
            $state.go("cmpt_list");
        })
    };
    //插件类型转化中文名
    $scope.getPluginTypeCnName = function(plugin_type){
        return CV.findValue(plugin_type,pluginType);
    };
    //解决codemirror加载显示不出来问题
    $scope.selectScript = function(index){
        $scope.control.show_codemirror = false;
        $timeout(function () {
            $scope.control.show_codemirror = true;
            if($scope.info.cmpt_info.script_list[index]){
                $scope.info.cmpt_info.script_list[index].code_mirror_control = true;
            }
        },20)
    };
    //下载脚本文件
    $scope.downloadScriptFile = function(){
        CV.downloadFile($scope.info.cmpt_info.file_path);
    };
    //导出组件按钮
    $scope.exportCmpt = function(){
        Modal.confirm("确认导出[" + $scope.info.cmpt_info.id + "]组件？").then(function(choose){
            if(choose) {
                CV.downloadFile($scope.info.cmpt_info.file_path_export);
            }
        });
    };
    //下载附件
    $scope.downloadAccessoryFile = function(){
        CV.downloadFile($scope.info.cmpt_info.annex_file);
    };
    //组件 -下载插件
    $scope.downLoadPlugin = function (path) {
        CV.downloadFile(path);
    };
    //返回按钮
    $scope.back = function(){
        $state.go('cmpt_list');
    };
    init();
}]);
//组件列表
cmpt_m.controller('cmptListCtrl', ['$scope', '$timeout', 'CmptType', 'Cmpt', 'Proj', 'IML_TYPE', 'ScrollConfig', 'Modal', 'CV', function ($scope, $timeout, CmptType, Cmpt, Proj, IML_TYPE, ScrollConfig, Modal, CV) {
    //下拉列表备选数据
    $scope.data = {
        cmpt_type_list : angular.copy(CmptType),    //组件类型列表
        user_list : [],                             //创建人列表
        publish_status_list : [],                   //发布状态列表
    };
    //发布状态列表
    $scope.data.publish_status_list = [
        {
            value:'全部',
            key:0,
            flag:false
        },
        {
            value:'已发布',
            key:1,
            flag:false
        },{
            value:'未发布',
            key:2,
            flag:false
        }];
    //页面控制
    $scope.control = {
        start_opened : false ,      //开始时间
        end_opened : false ,        //结束时间
        search_flag : true ,        //搜索方式标识
        tags_more_flag : false,     //标签更多标志切换
        classify_flag   :false      //控制显示分类分类标签是否显示“更多”
    };
    //页面配置
    $scope.config = {
        search_form_scroll_config : ScrollConfig ,   //高级搜索框滚动条配置
        data_picker_max_date : new Date()            //日期控件最大日期
    };
    //高级搜索参数对象
    $scope.info ={
        high_search_obj : {
            classify_list: [],
            exec_type_list : angular.copy(IML_TYPE),
            key_word:'',
            component_purpose : 0,
            start_modify_date : '',
            end_modify_date : '',
            crt_user_id : '',
            publish_state : 0
        }
    };
    /*初始化数据*/
    var initData=function () {
        for(var i=0;i<arguments.length;i++){
            for(var j=0;j<arguments[i].length;j++){
                arguments[i][j]= angular.extend(arguments[i][j],{flag:false})
            }
        }
    };
    //初始化方法
    var init = function () {
        //查询所有组件标签
        Cmpt.selectAllTas().then(function (data) {
            if(data){
                $timeout(function () {
                    var _tag_list=data.tag_list ? data.tag_list :[];
                    for (var i = 0; i < _tag_list.length; i++) {
                        $scope.info.high_search_obj.classify_list.push({
                            value:_tag_list[i],
                            flag: false
                        })
                    }
                },0)
            }
        },function (error) {
            Modal.alert(error.message,3);
        })
        //查询所有用户集合
        Cmpt.getAllUser().then(function (data) {
            if(data){
                $timeout(function () {
                    $scope.data.user_list = data.user_list ? data.user_list :[];
                },0)
            }
        },function (error) {
            Modal.alert(error.message,3);
        })
    };
    //显示日期控件
    $scope.open = function (flag,e) {
        $scope.control.start_opened = (flag==1) ? true : false;
        $scope.control.end_opened = (flag==2) ? true : false;
        e.stopPropagation();
    };
    //切换搜索方式
    $scope.changeSearchFlag = function (index,e) {
        $scope.control.search_flag = false;
        e.stopPropagation();
    };
    //高级搜索--删除搜索条件
    $scope.clearData= function () {
        initData($scope.info.high_search_obj.classify_list,$scope.info.high_search_obj.exec_type_list);
        $scope.info.high_search_obj.key_word='';
        $scope.info.high_search_obj.component_purpose=0;
        $scope.info.high_search_obj.publish_state =0;
        $scope.info.high_search_obj. crt_user_id='';
        $scope.info.high_search_obj.start_modify_date='';
        $scope.info.high_search_obj.end_modify_date='';
    };
    //取消
    $scope.cancelSeniorSearch = function () {
        $scope.control.search_flag = true
    };
    //关闭日期插件显示
    $scope.closeDatePlugin = function (e) {
        $scope.control.start_opened =false;
        $scope.control.end_opened =false;
    };
    $scope.countTagDivHeight= function () {
        $timeout(function () {
            var _height= $('.classify-tag-id').height();
            _height >48 ? $scope.control.classify_flag=true : $scope.control.classify_flag=false;
        },500)
    };
    //加载
    init();
}]);
//新增组件组控制器
cmpt_m.controller('cmptsNewCtrl',['$scope', '$timeout', '$state', 'CmptType', 'Cmpt', 'CmptFunc', 'IML_TYPE', 'CodeMirrorOption', 'Modal', 'CV', function ($scope, $timeout, $state, CmptType, Cmpt, CmptFunc, IML_TYPE, CodeMirrorOption ,Modal, CV) {
    var _down_time;             //鼠标按下时间(用在判断是拖拽还是展开)
    //组件组对象
    var _init_cmpts_info = {
        id : '',                 //组件组id
        cn_name : '',            //组件组中文名
        bk_desc : '',            //组件组描述
        modules : [],            //组件模块
        component_purposes : [], //组件组类型
        component_list : []      //组件列表
    };
    //组件组控制
    $scope.control = {
        new_cmpts_flag : true,              //新增组件组标志
        import_loading : false,             //导入组件组loading
        expand_flag    : false,             //全部展开收起标志
        cmpts_save_loading : false          //表单提交loading
    };
    //页面数据
    $scope.data = {
        cmpts_type_list   : [],        //组件组类型
        execute_type_list : IML_TYPE   //组件组执行类别
    };
    //信息
    $scope.info = {
        cmpts_info:{}
    };
    //配置
    $scope.config = {
        view_sh_options   : CodeMirrorOption.Sh(true),         //shell脚本配置
        view_sql_options  : CodeMirrorOption.Sql(true),        //sql脚本配置
        view_py_options : CodeMirrorOption.Python(true),   //python脚本配置
        view_java_options : CodeMirrorOption.Java(true),       //java脚本配置
        cmpts_fileupload  : {                                 //组件组上传配置
            suffixs:'xml',
            filetype: "XML",
            filename: "",
            uploadpath: ""
        }
    };
    //获取导入组件组文件上传路径(2，组件组)
    var getCmptFilePath = function(){
        Cmpt.getCmptFilePath(2).then(function(data){
            $timeout(function(){
                if(data){
                    $scope.config.cmpts_fileupload.uploadpath  = data.file_path  ? data.file_path:"";
                }
            },0);
        },function(error){
            Modal.alert(error.message,3);
        });
    };
    //根据返回组件类型转化成页面绑定格式（cmpt_type_choose_list：选中的组件类型列表，cmpt_type_list：组件类型列表）
    var chooseCheckBox = function (cmpt_type_choose_list,cmpt_type_list) {
        var _cmpt_type_list = cmpt_type_list;
        for(var i = 0; i < cmpt_type_choose_list.length; i++){
            for(var j = 0; j < _cmpt_type_list.length; j++){
                if(_cmpt_type_list[j].key == cmpt_type_choose_list[i]){
                    _cmpt_type_list[j].state = true;
                    if(cmpt_type_choose_list[i] == 2){
                        $scope.config.cmpt_script_fileupload.filename = $scope.info.cmpts_info.file_path.substring($scope.info.cmpts_info.file_path .lastIndexOf("/")+1,$scope.info.cmpts_info.file_path .length);
                        $scope.info.cmpts_info.file_path  =  $scope.config.cmpt_script_fileupload.uploadpath + $scope.config.cmpt_script_fileupload.filename;
                    }
                }
            }
        }
    };
    //初始化
    var init=function () {
        //初始化组件类型
        angular.forEach(CmptType,function (data) {
            $scope.data.cmpts_type_list.push(angular.extend({state:false},data));
        });
        $scope.info.cmpts_info = angular.copy(_init_cmpts_info);
        getCmptFilePath();
    };
    //删除导入文件
    $scope.removeCmptFile = function () {
        //初始化上传文件名
        $scope.config.cmpts_fileupload.filename = '';
        //新增组件组对象
        $scope.info.cmpts_info = angular.copy(_init_cmpts_info);
        angular.forEach($scope.data.cmpts_type_list,function (data) {
            data.state=false;
        });
    };
    //文件-导入文件成功后
    $scope.ImportSuccessThen = function() {
        //文件路径
        var _file_path =  $scope.config.cmpt_fileupload.uploadpath +"/"+ $scope.config.cmpt_fileupload.filename;
        $scope.control.import_loading = true;
        //查询导入组件组文件信息
        Cmpt.getImportCmptGroupInfo(_file_path).then(function(data){
            $timeout(function(){
                if(data.group){
                    $scope.info.cmpts_info.cn_name = data.group.cn_name;
                    $scope.info.cmpts_info.id       = data.group.id;
                    $scope.info.cmpts_info.bk_desc = data.group.bk_desc;
                    $scope.info.cmpts_info.component_list = data.group.component_list ? data.group.component_list:[];
                    $scope.info.cmpts_info.component_purposes = data.group.component_purposes;
                    //组件模块
                    angular.forEach($scope.info.cmpts_info.component_list, function(data){
                        if(data.script_list){
                            data.exec_script = CmptFunc.cmdsToString(data.script_list[0].cmds);
                        }
                        if(data.impl_type){
                            data.impl_type_formcat = CV.findValue(data.impl_type,IML_TYPE);
                        }
                    });
                    //根据返回组件组类型转化成页面绑定格式
                    chooseCheckBox($scope.info.cmpts_info.component_purposes,$scope.data.cmpts_type_list);
                    $scope.control.import_loading = false;
                }
            },0);
        },function(error){
            $scope.control.import_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //选择组件组类型
    $scope.selectCmptsType=function(item){
        $scope.info.cmpts_info.component_purposes = [];
        var _cmpt_type_list = $scope.data.cmpts_type_list;
        for(var i = 0;i < _cmpt_type_list.length; i++){
            if(_cmpt_type_list[i].state){
                $scope.info.cmpts_info.component_purposes.push(_cmpt_type_list[i].key);
            }
        }
    };
    //添加组件
    $scope.addCmpt = function(){
        var _comp_type = 1;   //组件类型
        var _comp_flag = 1;   //组件标志（1：发布组件，2：采集组件）
        //添加组件模态框
        Modal.cmptEdit(_comp_type,_comp_flag).then(function(compid_list){
            if(compid_list){
                Cmpt.getCmptGroupDetail(compid_list).then(function (data) {
                    $timeout(function () {
                        if (data.component_list) {
                            var cmpt_group_list = data.component_list ? data.component_list : [];
                            for (var i = 0; i < cmpt_group_list.length; i++) {
                                var _cmpt = cmpt_group_list[i];
                                _cmpt.param_list = _cmpt.param_list || [];
                                if(_cmpt.script_list){
                                    _cmpt.exec_script = CmptFunc.cmdsToString(_cmpt.script_list[0].cmds);
                                }
                                _cmpt.ref_params = [];  //组件的引用参数列表
                                _cmpt.cn_name = _cmpt.cn_name.substring(0,2) == '/*' ? _cmpt.cn_name.substring(2,_cmpt.cn_name.length-2)  : _cmpt.cn_name;
                                _cmpt.show_detail = false;
                                _cmpt.phase_type_cn = CV.findValue(_cmpt.impl_type,$scope.data.execute_type_list);
                                $scope.info.cmpts_info.component_list.push(_cmpt);
                            }
                            $scope.control.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.cmpts_info.component_list);
                        }
                    }, 0);
                }, function (error) {
                    Modal.alert(error.message,3);
                });
            }
        });
    };
    //删除单个组件
    $scope.removeSingleCmpt = function(e,step,index){
        e.stopPropagation();
        var _cn_name= step.cn_name || '';
        var _comp_type_cn = step.type == 1 ? "组件" : step.type == 4 ? "阶段" : " 组件组";
        Modal.confirm("确认删除"+ " ["+ _cn_name +"] "+ _comp_type_cn +"?").then(function() {
            $scope.info.cmpts_info.component_list.splice(index,1);
            Modal.alert(_cn_name + " 删除成功!",2);
            $scope.control.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.cmpts_info.component_list);
        })
    };
    //组件模块展开收起操作
    //获取鼠标按下时间
    $scope.getDownTime=function(){
        _down_time=new Date().getTime()
    };
    //展开收起
    $scope.toggleModulesDetail = function (step) {
        var _up_time=new Date().getTime();
        if(_up_time-_down_time > 300){
            return;
        }
        step.show_detail = !step.show_detail;
        $scope.control.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.cmpts_info.component_list);
        $scope.control.expand_flag = $scope.control.nav_show_flag == 2 ? true : false;
    };
    //组件模块全部收起
    $scope.collapseAll = function(){
        $scope.control.nav_show_flag = CmptFunc.closeAllModules($scope.info.cmpts_info.component_list);
    };
    //组件模块全部展开
    $scope.expandAll = function(){
        $scope.control.nav_show_flag = CmptFunc.expandAllModules($scope.info.cmpts_info.component_list);
    };
    //阻止冒泡
    $scope.stopPrevent = function(e){
        e.stopPropagation();
    };
    //保存表单
    $scope.cmptsSubmit = function(){
        if(!CV.valiForm($scope.cmpts_form)){
            return false;
        }
        $scope.control.cmpts_save_loading = true;
        //保存组件组
        Cmpt.addCmptGroup($scope.info.cmpts_info).then(function(data){
            $timeout(function(){
                if(data.override_flag){
                    Modal.confirm("组件已存在，是否覆盖?").then(function(){
                        //保存导入组件组文件
                        Cmpt.updateSingleCmptGroup($scope.info.cmpts_info).then(function(data){
                            $timeout(function(){
                                Modal.alert("组件组保存成功！",2);
                                $state.go("cmpts_list");
                            },0)
                        },function(error){
                            Modal.alert(error.message,3);
                        });
                    });
                }else{
                    Modal.alert("组件组保存成功!",2);
                    $state.go("cmpts_list");
                }
                $scope.control.cmpts_save_loading = false;
            },0);
        },function(error){
            $scope.control.cmpts_save_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //取消表单
    $scope.cmptsCancel = function(){
        $state.go("cmpts_list");
    };
    init();
}]);
//组件组列表
cmpt_m.controller('cmptsListCtrl', ["$scope", "CV", function ($scope, CV) {
    //清空搜索框
    $scope.clear=function(){
        $scope.search_key_word='';
    };
}]);
//修改组件组
cmpt_m.controller('cmptsModifyCtrl', ["$scope", "CmptType", "$stateParams", "$state", "$timeout", "IML_TYPE",  "Cmpt", "CmptFunc", "CodeMirrorOption", "Modal", "CV",function ($scope, CmptType, $stateParams, $state, $timeout, IML_TYPE, Cmpt, CmptFunc, CodeMirrorOption, Modal, CV) {
    var _cmpts_id = $stateParams.cmpts_id;        //组件组ID
    var _down_time;                         //鼠标按下时间（用来判断是展开还是拖拽）
    //页面控制对象
    $scope.control = {
        loading:false,
        param_list_show:false,              //控制全局参数显示
        ref_flag   : false,                 //组件组是否被引用标志
        nav_show_flag   : 0,                //导航条显示标志
        no_ref_param  : false,              //组件组无可配引用参数提示
        modules_loading : false,            //模组信息加载标志
        expand_flag     :false,             //模组全部展开标志
    };
    //组件执行类型/参数组件名--下拉菜单数据
    $scope.data = {
        cmpts_type_list : [],                //组件类型列表
        execute_type_list: IML_TYPE         //执行类型
    };
    //执行脚本输入框配置参数(只读)
    $scope.config = {
        view_sh_options  : CodeMirrorOption.Sh(true),
        view_sql_options : CodeMirrorOption.Sql(true),
        view_py_options  : CodeMirrorOption.Python(true),
        view_java_options: CodeMirrorOption.Java(true)
    };
    //页面对象
    $scope.info = {
        cmpts_info : {
            id:'',                      //组件组id
            cn_name  :'',               //组件组中文名
            bk_desc  :'',               //描述
            component_list:[]           //组件列表
        }
    };
    //根据返回组件类型转化成页面绑定格式
    var chooseCheckBox = function (cmpt_type_choose_list) {
        var _cmpt_type_list = $scope.data.cmpts_type_list;
        for(var i = 0; i < cmpt_type_choose_list.length; i++){
            for(var j = 0; j < _cmpt_type_list.length; j++){
                if(_cmpt_type_list[j].key == cmpt_type_choose_list[i]){
                    _cmpt_type_list[j].state=true;
                }
            }
        }
    };
    //计算添加组件按钮位置
    var fixPosition = function(){
        if($(document).scrollTop()>=420){
            var _left;
            if($scope.left_flag){
                _left = '197px';
            }else{
                _left = '344px';
            }
            $('.fixedGroup').css({
                'position':'fixed',
                'top':'100px',
                'left':_left,
                'z-index':'999'
            }).removeClass('col-sm-6').find('button').addClass('btn-vertical');
        }else {
            $('.fixedGroup').css({
                'position':'static'
            }).addClass('col-sm-6').find('button').removeClass('btn-vertical');
        }
    };
    var init = function(){
        //初始化组件类型
        angular.forEach(CmptType,function (data) {
            $scope.data.cmpts_type_list.push(angular.extend({state:false},data));
        });
        //查询组件组信息
        Cmpt.viewSingleCmptGroup(_cmpts_id).then(function(data){
            $timeout(function(){
                if(data.group){
                    $scope.info.cmpts_info.cn_name              = data.group.cn_name;
                    $scope.info.cmpts_info.old_cn_name          = data.group.cn_name;
                    $scope.info.cmpts_info.id                   = data.group.id;
                    $scope.info.cmpts_info.bk_desc              = data.group.bk_desc;
                    $scope.info.cmpts_info.component_list       = data.group.component_list || [];
                    $scope.info.cmpts_info.component_purposes   = data.group.component_purposes;
                    angular.forEach($scope.info.cmpts_info.component_list, function(data,index,array){
                        data.show_detail=false;               //控制模板展开收起
                        if(data.script_list){
                            data.exec_script = CmptFunc.cmdsToString(data.script_list[0].cmds);
                        }
                        if(data.impl_type){
                            data.impl_type_formcat = CV.findValue(data.impl_type,IML_TYPE);
                        }
                    });
                    //根据返回组件类型转化成页面绑定格式
                    chooseCheckBox($scope.info.cmpts_info.component_purposes);
                    $scope.control.modules_loading = true;
                }
            },0);
        },function(error){
            Modal.alert(error.message,3);
            $state.go("cmpts_list");
        });
    };
    //组件组-选择组件组类型（）
    $scope.selectCmptsType = function(){
        var _cmpt_type_list =$scope.data.cmpts_type_list;
        $scope.info.cmpts_info.component_purposes = [];
        for(var i = 0; i < _cmpt_type_list.length; i++){
            if(_cmpt_type_list[i].state){
                $scope.info.cmpts_info.component_purposes.push(_cmpt_type_list[i].key);
            }
        }
    };
    //参数默认值输入框智能提示
    $scope.paramShellLoaded = function(_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };
    //组件组-添加组件(_module_list：组件模块列表)
    $scope.addCmpt = function(_module_list){
        var _comp_type = 1; //组件类型
        var _comp_flag = 1;//组件标志（1：发布组件，2：采集组件）
        //添加组件模态框
        Modal.cmptEdit(_comp_type,_comp_flag).then(function(compid_list){
            if(compid_list){
                Cmpt.getCmptGroupDetail(compid_list).then(function (data) {
                    $timeout(function () {
                        if (data.component_list) {
                            var _cmpt_group_list = data.component_list || [];
                            for (var i = 0; i < _cmpt_group_list.length; i++) {
                                var _cmpt = _cmpt_group_list[i];
                                _cmpt.show_detail = false;               //控制模板展开收起
                                _cmpt.param_list = _cmpt.param_list || [];
                                if(_cmpt.script_list){
                                    _cmpt.exec_script = CmptFunc.cmdsToString(_cmpt.script_list[0].cmds);
                                }
                                if(_cmpt.impl_type){
                                    _cmpt.impl_type_formcat = CV.findValue(_cmpt.impl_type,IML_TYPE);
                                }
                                $scope.info.cmpts_info.component_list.push(_cmpt);
                            }
                            $scope.control.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.cmpts_info.component_list);
                        }
                    }, 0);
                }, function (error) {
                    Modal.alert(error.message,3);
                });
            }
            //滚动到底部
            $('html,body').animate({scrollTop:9999});
        });
    };
    //组件组-删除单个组件
    $scope.removeSingleCmpt = function(e,step,index){
        e.stopPropagation();
        e.preventDefault();
        var _cn_name = step.cn_name ? step.cn_name :"";
        var _comp_type_cn = step.type == 1 ? "组件" : step.type == 4 ? "阶段" : " 组件组";
        Modal.confirm("确认删除"+ _cn_name +_comp_type_cn +"?").then(function() {
            $scope.info.cmpts_info.component_list.splice(index,1);
            Modal.alert(_cn_name + " 删除成功!",2);
            $scope.control.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.cmpts_info.component_list);
        });
    };
    //模组展开收起操作
    $scope.getDownTime=function(){
        _down_time=new Date().getTime()
    };
    $scope.toggleModulesDetail = function (step) {
        var _up_time=new Date().getTime();
        if(_up_time-_down_time>300){
            return;
        }
        step.show_detail = !step.show_detail;
        //判断导航条是否显示标志
        $scope.control.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.cmpts_info.component_list);
        if($scope.control.nav_show_flag == 2){
            $scope.control.expand_flag = true;
        }else{
            $scope.control.expand_flag = false;
        }
    };
    //收起所有参数和阶段
    $scope.collapseAll=function(){
        $scope.control.nav_show_flag=CmptFunc.closeAllModules($scope.info.cmpts_info.component_list);
    };
    //展开所有参数和阶段
    $scope.expandAll=function(){
        $scope.control.nav_show_flag=CmptFunc.expandAllModules($scope.info.cmpts_info.component_list);
    };
    //阻止展开收起
    $scope.stopPrevent =function (event) {
        event.stopPropagation();
    };
    //组件组-保存表单
    $scope.cmptsSubmit = function(){
        if(!CV.valiForm($scope.cmpts_form)){
            return false;
        }
        $scope.control.loading = true;
        Cmpt.updateSingleCmptGroup($scope.info.cmpts_info).then(function(data){
            Modal.alert("组件组保存成功！",2);
            $state.go("cmpts_list");
        },function(error){
            $scope.control.loading=false;
            Modal.alert(error.message,3);
        });
    };
    //组件组-取消表单
    $scope.cmptsCancel = function(){
        $state.go("cmpts_list");
    };
    //吸顶效果
    $(window).scroll(function(){
        fixPosition();
    });
    init();
}]);
//查看组件组
cmpt_m.controller('cmptsDetailCtrl', ["$scope","CmptType", "$stateParams", "$state","$timeout", "IML_TYPE", "Cmpt", "CmptFunc", "CodeMirrorOption", "Modal", "CV",function ($scope, CmptType, $stateParams, $state, $timeout, IML_TYPE, Cmpt, CmptFunc, CodeMirrorOption, Modal, CV) {
    //组件组ID
    var _cmpts_id = $stateParams.cmpts_id;
    //页面控制对象
    $scope.control={
        nav_show_flag   : 0 ,       //导航条显示标志
        expand_flag     : false      //模组全部展开标志
    };
    $scope.data={
        cmpt_type_list:[]                  //组件类型
    };
    //页面对象
    $scope.info = {
        cmpts_info : {
            id:'',                      //组件组id
            cn_name  :'',               //组件组中文名
            bk_desc  :'',               //描述
            component_list:[],          //组件列表
            publish_state:'',           //发布状态
            ref_flag :'',               //引用标志
            file_path_export:''        //导出路径
        }
    };
    //执行脚本输入框配置参数(只读)
    $scope.config = {
        view_sh_options  : CodeMirrorOption.Sh(true),
        view_sql_options : CodeMirrorOption.Sql(true),
        view_py_options  : CodeMirrorOption.Python(true),
        view_java_options: CodeMirrorOption.Java(true)
    };
    //根据返回组件类型转化成页面绑定格式
    var chooseCheckBox = function (cmpt_type_choose_list) {
        var _cmpt_type_list = $scope.data.cmpt_type_list;
        for(var i = 0; i < cmpt_type_choose_list.length; i++){
            for(var j = 0; j < _cmpt_type_list.length; j++){
                if(_cmpt_type_list[j].key == cmpt_type_choose_list[i]){
                    _cmpt_type_list[j].state = true;
                }
            }
        }
    };
    var init=function(){
        //初始化组件类型
        angular.forEach(CmptType,function (data) {
            $scope.data.cmpt_type_list.push(angular.extend({state:false},data));
        });
        //查询组件组信息
        Cmpt.viewSingleCmptGroup(_cmpts_id).then(function(data){
            $timeout(function(){
                if(data.group){
                    $scope.info.cmpts_info.cn_name              =   data.group.cn_name;
                    $scope.info.cmpts_info.id                   =   data.group.id;
                    $scope.info.cmpts_info.bk_desc              =   data.group.bk_desc;
                    $scope.info.cmpts_info.publish_state        =   data.publish_state;
                    $scope.info.cmpts_info.component_list       =   data.group.component_list || [];
                    $scope.info.cmpts_info.file_path_export     =   data.file_path;
                    $scope.info.cmpts_info.component_purposes   =   data.group.component_purposes;
                    angular.forEach($scope.info.cmpts_info.component_list, function(data,index,array){
                        data.alias_name = data.alias_name ? data.alias_name : data.cn_name; //别名
                        data.show_detail=false;               //控制模板展开收起
                        if(data.script_list){
                            data.exec_script = CmptFunc.cmdsToString(data.script_list[0].cmds);
                        }
                        if(data.impl_type){
                            data.impl_type_formcat=CV.findValue(data.impl_type,IML_TYPE);
                        }
                    });
                    //根据返回组件类型转化成页面绑定格式
                    chooseCheckBox($scope.info.cmpts_info.component_purposes);
                }
            },0);
        },function(error){
            Modal.alert(error.message,3);
            $state.go("cmpts_list");
        });
    };
    //导出组件组
    $scope.exportCmpts=function(){
        Modal.confirm("确认导出[" + _cmpts_id + "]组件组？").then(function(choose){
            if(choose) {
                CV.downloadFile($scope.info.cmpts_info.file_path_export);
            }
        })
    };
    //模组展开收起操作
    $scope.toggleModulesDetail = function (step) {
        step.show_detail = !step.show_detail;
        //判断导航条是否显示标志
        $scope.control.nav_show_flag = CmptFunc.judgeShowDetail($scope.info.cmpts_info.component_list);
        if($scope.control.nav_show_flag == 2){
            $scope.control.expand_flag = true;
        }else{
            $scope.control.expand_flag = false;
        }
    };
    //收起所有参数和阶段
    $scope.collapseAll=function(){
        $scope.control.nav_show_flag = CmptFunc.closeAllModules($scope.info.cmpts_info.component_list);
    };
    //展开所有参数和阶段
    $scope.expandAll=function(){
        $scope.control.nav_show_flag = CmptFunc.expandAllModules($scope.info.cmpts_info.component_list);
    };
    //阻止展开收起
    $scope.stopPrevent =function (event) {
        event.stopPropagation();
    };
    //返回
    $scope.back=function(){
        $state.go("cmpts_list");
    };
    init();
}]);
//组件测试
cmpt_m.controller('cmptTestCtrl', ["$scope", "$stateParams", "$state", "$timeout", "$interval", "Cmpt", "CmptFunc","ProtocolType", "jdkVersion", "CodeMirrorOption","pluginType","envManage","NodeReform","BusiSys","LanguageName","pluginExeEnv","operateSysBit", "Modal", "CV", function ($scope, $stateParams, $state, $timeout, $interval, Cmpt, CmptFunc, ProtocolType, jdkVersion, CodeMirrorOption,pluginType,envManage,NodeReform,BusiSys,LanguageName,pluginExeEnv, operateSysBit,Modal, CV) {
    var cn_name = $stateParams.cmpt_name;       //获取组件中文名
    var _cmpt_id = $stateParams.cmpt_id;        //获取组件id
    var _curr_code_type = 1;                    //默认1 为shell语言 2 为python语言 3 为java语言 4 为SQL
    //页面控制
    $scope.control = {
        exec_flag : false,              //执行状态默认false
        items : {                         //组件执行状态
            dynamic:0,
            type:"info"
        },
        exec_loading : false,           //正在执行
        get_soc_loading : false,        //获取数据源loading
        get_support_soc_loading : false //部署数据源loading
    };
    //页面数据
    $scope.data = {
        ip_data_list : [],              //部署节点ip列表
        exec_soc_list : [],             //执行数据源
        support_soc_list:[],            //部署数据源
        jdk_version_list : jdkVersion   //语言版本列表
    };
    //页面信息
    $scope.info = {
        cmpt_test_info : {
            id : _cmpt_id,                  //组件id
            impl_type : "",                   //组件实现类型
            param_list : [],                  //组件参数列表
            phase : {
                impl_type : "",               //组件实现类型
                node_soc_list :[],           //节点配置信息
                plugin_list : [],           //插件列表
            },
            script_list : [],                 //执行脚本列表
            deploy_soc : {
                execute_ip : '',            //执行节点ip
                execute_soc_name :'',        //执行节点数据源
                support_ip : '',              //部署节点ip
                support_soc_name : ''         //部署节点数据源

            }       //部署数据源对象
        },
        cmpt_basic_info : {                 //组件基本信息
            cn_name : cn_name,              //中文名
            log_file_path:""                //日志文件路径
        }
    };
    //页面配置
    $scope.config = {
        cmpt_accessory_fileupload : {       //上传附件配置
            suffixs:'',
            filetype: "",
            filename: "",
            uploadpath: ""
        },
        view_options :{}
    };
    var init = function() {
        //根据组件id获取组件详细信息
        Cmpt.viewModulegetModuleDetail(_cmpt_id).then(function(data){
                $timeout(function () {
                    if(data){
                        $scope.info.cmpt_test_info.param_list = data.component.param_list || [];
                        $scope.info.cmpt_test_info.phase.plugin_list = data.component.plugin_list || [];
                        for(var i = 0; i < $scope.info.cmpt_test_info.param_list.length; i++){
                            var _param = $scope.info.cmpt_test_info.param_list[i];
                            _param.show_input = true;
                        }
                        $scope.info.cmpt_test_info.script_list = data.component.script_list || [];
                        for(var j = 0; j < $scope.info.cmpt_test_info.script_list.length; j++){
                            if($scope.info.cmpt_test_info.script_list[j].cmds){
                                $scope.info.cmpt_test_info.script_list[j].exec_script = CmptFunc.cmdsToString($scope.info.cmpt_test_info.script_list[j].cmds) ? CmptFunc.cmdsToString($scope.info.cmpt_test_info.script_list[j].cmds) : '';
                                $scope.info.cmpt_test_info.script_list[j].script_type_cn = $scope.info.cmpt_test_info.script_list[j].script_type =='default' ? '缺省': $scope.info.cmpt_test_info.script_list[j].script_type;
                            }
                        }
                        $scope.info.cmpt_test_info.script_type = data.component.script_list[0].script_type;
                        $scope.info.cmpt_test_info.exec_script = data.component.script_list[0].exec_script ;
                        $scope.info.cmpt_test_info.impl_type = data.component.impl_type || '';
                        $scope.info.cmpt_test_info.phase.component_source = data.component.component_source || 1;
                        $scope.info.cmpt_test_info.phase.file_path = data.component.file_path || '';
                        $scope.info.cmpt_test_info.phase.impl_type = data.component.impl_type || '';
                        if(data.component.language_version){
                            $scope.info.cmpt_test_info.language_version = data.component.language_version;
                            $scope.info.cmpt_test_info.phase.language_version = data.component.language_version;
                        }
                        if(data.component.annex_file){
                            $scope.info.cmpt_test_info.phase.annex_file = data.component.annex_file;
                            $scope.info.cmpt_test_info.annex_file = data.component.annex_file;
                            $scope.config.cmpt_accessory_fileupload.filename = data.component.annex_file ? data.component.annex_file.substring(data.component.annex_file.lastIndexOf('/')+1):'';
                        }
                        if(data.component.impl_type ==15 || data.component.impl_type==17){
                            if(data.component.command && data.component.command.cmds) {
                                $scope.info.cmpt_test_info.phase.command = data.component.command;
                                $scope.info.cmpt_test_info.command = {
                                    exec_script: CmptFunc.cmdsToString(data.component.command.cmds),
                                    cmds:data.component.command.cmds
                                }
                            }
                        }
                        _curr_code_type = ($scope.info.cmpt_test_info.impl_type <6) ? 1 : ($scope.info.cmpt_test_info.impl_type == 6) ? 4 : ($scope.info.cmpt_test_info.impl_type == 7 || $scope.info.cmpt_test_info.impl_type == 8) ? 2 :($scope.info.cmpt_test_info.impl_type == 14) ? 3 : 1;
                        //执行脚本输入框配置参数
                        $scope.config.view_options = (_curr_code_type == 4) ? CodeMirrorOption.Sql(true) : (_curr_code_type == 3) ? CodeMirrorOption.Java(true) :(_curr_code_type == 2) ? CodeMirrorOption.Python(true) : CodeMirrorOption.Sh(true) ;
                        //当存在插件时获取部署数据源的节点ip
                        if(data.component.plugin_list ||  $scope.info.cmpt_test_info.impl_type == 14 || $scope.info.cmpt_test_info.impl_type == 7 || $scope.info.cmpt_test_info.impl_type == 8 || $scope.info.cmpt_test_info.impl_type == 15 || $scope.info.cmpt_test_info.impl_type == 17){
                            NodeReform.getIpByNone().then(function(data){
                                $scope.data.ip_data_list = data.ip_list ? data.ip_list : [];
                            },function(error){
                            });
                        }
                    }
                },0)
            },function(error){
                Modal.alert(error.message,3);
                $state.go('cmpt_list');
            })
    };
    //协议类型转化中文名
    $scope.getProtocolTypeCnName = function(protocol_type){
        return CV.findValue(protocol_type,ProtocolType).substring(0,5).toLowerCase();
    };
    //插件类型转化中文名
    $scope.getPluginTypeCnName = function(plugin_type){
        return CV.findValue(plugin_type,pluginType);
    };
    //配置数据源
    $scope.configSoc = function(imply_type){
        Modal.configDataSource(imply_type,'', $scope.info.cmpt_test_info.phase.node_soc_list,2).then(function(ret){
            var _list = [];
            for(var i = 0; i < ret.length; i++){
                if(imply_type > 2 && imply_type < 6){
                    if(ret[i].exe_soc_name && ret[i].ver_soc_name){
                        ret[i].execute_soc_name = ret[i].exe_soc_name;
                        ret[i].execute_ip = ret[i].exe_ip;
                        ret[i].execute_protocol_type = ret[i].exe_protocol_type;
                        ret[i].support_soc_name = ret[i].ver_soc_name;
                        ret[i].support_ip = ret[i].ver_ip;
                        ret[i].support_protocol_type = ret[i].ver_protocol_type;
                        _list.push(ret[i]);
                    }
                }else{
                    if(ret[i].exe_soc_name){
                        ret[i].execute_soc_name = ret[i].exe_soc_name;
                        ret[i].execute_ip = ret[i].exe_ip;
                        ret[i].execute_protocol_type = ret[i].exe_protocol_type;
                        _list.push(ret[i]);
                    }
                }
            }
            $scope.info.cmpt_test_info.phase.node_soc_list = _list;
            $scope.info.cmpt_test_info.phase.impl_type = imply_type;
        });
    };
    //删除单个数据源
    $scope.deleteSingleSoc = function (index,srv_soc) {
        Modal.confirm("是否要删除此条数据源?").then(function () {
            $scope.info.cmpt_test_info.phase.node_soc_list.splice(index, 1);
        });
    };
    //根据节点获取执行数据源
    $scope.getExecuteSoc = function (selectKey) {
        $scope.info.cmpt_test_info.deploy_soc.support_ip = selectKey;
        //这里获取执行数据源
        $scope.control.get_soc_loading = true;
        BusiSys.getSocListBySocIpAndSys('',selectKey, 2).then(function (data) {
            $scope.data.exec_soc_list = data.node.exe_soc_list ? data.node.exe_soc_list : [];
            $scope.control.get_soc_loading = false;
        }, function (error) {
            $scope.control.get_soc_loading = false;
            Modal.alert(error.message,3);
        });
        //这里获取辅助数据源
        $scope.control.get_support_soc_loading = true;
        BusiSys.getSocListBySocIpAndSys('',selectKey, 14).then(function (data) {
            $scope.data.support_soc_list = data.node.ver_soc_list ? data.node.ver_soc_list : [];
            $scope.control.get_support_soc_loading = false;
        }, function (error) {
            $scope.control.get_support_soc_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //通过脚本类型找到对应脚本
    $scope.selectScriptByScriptType = function (script_type,step) {
        for (var i = 0; i < step.script_list.length; i++){
            if(step.script_list[i].script_type == script_type){
                step.exec_script = step.script_list[i].exec_script;
                break;
            }
        }

    };
    //公共-参数默认值输入框智能提示
    $scope.paramShellLoaded = function(_editor) {
        CodeMirrorOption.setParamsEditor(_editor);
    };
    //组件-展示组件详细
    $scope.showCmptDetail = function(){
        Modal.cmptDetail(1,_cmpt_id).then(function(){});
    };
    //下载日志
    $scope.downloadTestMessage =function () {
        CV.downloadFile($scope.info.cmpt_basic_info.log_file_path);
    };
    //组件测试执行
    $scope.cmptExec= function () {
        if(!CV.valiForm($scope.cmpt_test_form)){
            return false;
        }
        if($scope.info.cmpt_test_info.phase.plugin_list.length ==0 &&  $scope.info.cmpt_test_info.impl_type != 14 && $scope.info.cmpt_test_info.impl_type != 7 && $scope.info.cmpt_test_info.impl_type != 8 && $scope.info.cmpt_test_info.impl_type != 15 &&$scope.info.cmpt_test_info.impl_type != 17){
            if($scope.info.cmpt_test_info.phase.node_soc_list.length==0){
                Modal.alert("请配置运行节点！",3);
                return false;
            }
        }
        $scope.control.exec_flag = true;
        $scope.control.items.dynamic =0;
        $scope.control.items.type = "info";
        for(var j = 0; j < $scope.info.cmpt_test_info.param_list.length; j++){
            $scope.info.cmpt_test_info.param_list[j].show_input = false;
        }
        $scope.control.is_saved=true;
        var bartimer = $interval(function() {
            $scope.control.items.dynamic +=5 ;
            $scope.control.items.type = "info";
            if($scope.control.items.dynamic >=90){
                $scope.control.items.dynamic = 90;
                $interval.cancel(bartimer);
            }
        }, 1000);
        $scope.control.exec_loading = true;
        //配置新的信息
        if($scope.info.cmpt_test_info.impl_type != 15){
            for(var i = 0 ; i < $scope.info.cmpt_test_info.script_list.length; i++){
                if($scope.info.cmpt_test_info.script_list[i].script_type == $scope.info.cmpt_test_info.script_type){
                    $scope.info.cmpt_test_info.phase.script = $scope.info.cmpt_test_info.script_list[i];
                }
            }
        }
        Cmpt.getCmptTestInfo($scope.info.cmpt_test_info).then(function (data) {
            $timeout(function () {
                if(data){
                    $interval.cancel(bartimer);
                    $scope.control.exec_flag = false;
                    if(data.result){
                        var _length=data.result.length ? data.result.length : 1;
                        $scope.control.items.exec_status = data.result[_length-1].status;
                    }
                    $scope.control.exec_loading = false;
                    $scope.info.cmpt_basic_info.log_file_path = data.log_file_path;
                    if($scope.control.items.exec_status ==3 || $scope.control.items.exec_status ==4){
                        $scope.control.items.type = "danger";
                        $scope.control.items.dynamic =100;
                    }
                    if($scope.control.items.exec_status ==5){
                        $scope.control.items.type = "success";
                        $scope.control.items.dynamic =100;
                    }
                    for(var j=0;j<$scope.info.cmpt_test_info.param_list.length;j++){
                        $scope.info.cmpt_test_info.param_list[j].show_input = true;
                    }
                }
            },0)
        },function (error) {
            $interval.cancel(bartimer);
            $scope.control.exec_flag = false;
            $scope.control.items.exec_status =6;
            $scope.control.items.type = "danger";
            $scope.control.items.dynamic=100;
            $scope.control.exec_loading = false;
            for(var j = 0; j < $scope.info.cmpt_test_info.param_list.length; j++){
                $scope.info.cmpt_test_info.param_list[j].show_input = true;
            }
            Modal.alert(error.message,3);
        });
    };
    //下载附件
    $scope.downloadAccessoryFile = function(){
        CV.downloadFile($scope.info.cmpt_test_info.annex_file);
    };
    //关闭
    $scope.cancel = function () {
        $state.go('cmpt_list');
    };
    init();
}]);
