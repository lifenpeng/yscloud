'use strict';

//发布监控控制器
var versionCtrl = angular.module('VersionController', []);

/**
 * 新增初始版本
 * **/
versionCtrl.controller('versionNewCtrl',["$scope", "$timeout", "$stateParams", "$cookieStore", "$rootScope", "$state", "Version", "DataSource", "ScriptExec", "Collection", "VersionEncodingData", "Modal", "CV", function($scope, $timeout, $stateParams, $cookieStore, $rootScope, $state, Version, DataSource, ScriptExec, Collection, VersionEncodingData, Modal, CV) {
    var _sys_name = $stateParams.sys_name    || '';    //系统名
    var _sys_cn_name = $stateParams.sys_cn_name || ''; //系统中文名
    var _version_container = $('.version-new'); //容器DOM元素
    var _app_package_path = "";    //应用包路径
    var _config_package_path = ""; //配置包路径
    var _version_info = {
        upload_path   :  "",        //上传路径
        soc_name      :  "",        //数据源名称
        root_bk_dir   :  "",        //根目录
        init_path     :  "",        //初始化目录
        full_path     :  "",        //文件全路径
        checked_files :  [],        //选中的文件
        encoding      : "UTF-8",    //编码方式
        add_type      :  1,         //新增版本方式
        business_cn_name : _sys_cn_name, //系统中文名
    };
    //页面信息
    $scope.info = {
        //应用包-文件目录配置对象
        version_app_info : angular.extend(_version_info),
        //应用包-列表数据
        app_data:{
            ver_soc_list:[],
            encoding_list:VersionEncodingData,
        },
        //应用包上传
        app_fileupload:{
            suffixs:'tar,zip,gz',
            filetype: "",
            filename: "",
            uploadpath: _app_package_path
        },
        //配置包-文件目录配置对象
        version_config_info : angular.extend(_version_info),
        //配置包-列表数据
        config_data:{
            ver_soc_list:[],
            encoding_list:VersionEncodingData,
        },
        //配置包包上传
        config_fileupload : {
            suffixs  : 'tar,zip,gz',
            filetype : "",
            filename : "",
            uploadpath: _config_package_path
        },
    };
    //页面控制
    $scope.control = {
        show_add_type   : false, //新增初始版本
        show_Ftp        : false, //展示应用目录-数据源信息
        show_config_ftp : false, //展示配置目录-数据源信息
        layers_loading  : false, //遮罩层加载
    };
    //提交数据信息
    $scope.submit_info = {
        business_cn_name:_sys_cn_name,
        app_base : {
            soc_name:'',
            add_type:1,
            business_sys_name:_sys_name,
            upload_url:'',
            ver_soc_list:[],
            upload_path:'',
        },
        config_base:{
            add_type:1,
            ver_soc_list:[],
            soc_name:'',
            file_list:[],
        }
    };
    //处理选择的文件列表(flag: 1本地 2FTP服务器)
    var handleSelectedFileList = function(flag,from_list,soc_name){
        var _list=[];
        if(flag==1){
            for(var i = 0; i < from_list.length; i++){
                var one = {
                    soc_name:'',
                    add_type:1,
                    business_sys_name:_sys_name,
                    upload_url:from_list[i].file_path,
                    encoding:from_list[i].encoding ? from_list[i].encoding  : "UTF-8",
                };
                _list.push(one);
            }
        }else if(flag==2){
            for(var j = 0; j < from_list.length; j++){
                var file={
                    soc_name:soc_name,
                    add_type:2,
                    business_sys_name:_sys_name,
                    upload_url:from_list[j].path+"/"+from_list[j].file,
                    encoding:from_list[j].encoding ? from_list[j].encoding : "UTF-8",
                };
                _list.push(file);
            }
        }
        return _list
    };
    //初始化应用包节点路径
    var initAppPckNodePath = function() {
        $scope.info.version_app_info.checked_files=[];
        $scope.info.version_app_info.paths = [];
        $scope.info.version_app_info.active = false;
    };
    //初始化配置包节点路径
    var initConfigPckNodePath = function() {
        $scope.info.version_config_info.checked_files=[];
        $scope.info.version_config_info.paths = [];
        $scope.info.version_config_info.active = false;
    };
    //改变应用包数据源名
    var changeAppSocName = function() {
        $scope.info.version_app_info.init_path="";
        if($scope.info.version_app_info.soc_name){
            Collection.getFileListBySoc($scope.info.version_app_info.soc_name, $scope.info.version_app_info.init_path).then(function(data) {
                initAppPckNodePath();
                $scope.info.version_app_info.path_files = data.file_bean_list || [];
                $scope.info.version_app_info.init_path  = data.root_bk_dir || "";
                $scope.info.version_app_info.full_path  = data.root_bk_dir || "";
                $scope.control.show_Ftp=true;
            }, function(error) {
                $scope.control.show_Ftp=true;
                Modal.alert(error.message);
            });
        }
    };
    //改变配置包数据源名
    var changeConfigSocName = function () {
        //得到数据源下所有信息
        $scope.info.version_config_info.init_path = "";
        if($scope.info.version_config_info.soc_name){
            Collection.getFileListBySoc($scope.info.version_config_info.soc_name, $scope.info.version_config_info.init_path).then(function(data) {
                initConfigPckNodePath();
                $scope.info.version_config_info.path_files = data.file_bean_list || [];
                $scope.info.version_config_info.init_path  = data.root_bk_dir || "";
                $scope.info.version_config_info.full_path  = data.root_bk_dir || "";
                $scope.control.show_config_ftp = true;
            }, function(error) {
                $scope.control.show_config_ftp = true;
                Modal.alert(error.message);
            });
        }
    };
    //处理提交信息
    var handleSubmitInfo = function () {
        //上传的信息
        var _upload_info={
            app_bean:{
                soc_name:'',
                add_type:"",
                business_sys_name:_sys_name,
                upload_url: '',
                encoding:'',
            },
            config_list:[],
            other_list:[],
            business_sys_name:_sys_name,
        };
        //应用包
        if( $scope.info.version_app_info.add_type==1){
            _upload_info.app_bean.upload_url= $scope.info.app_fileupload.uploadpath+$scope.info.app_fileupload.filename;
            _upload_info.app_bean.add_type=1;
            _upload_info.app_bean.encoding=$scope.info.version_app_info.encoding
            
        }else{
            _upload_info.app_bean.add_type=2;
            _upload_info.app_bean.soc_name=$scope.info.version_app_info.soc_name;
            if($scope.info.version_app_info.checked_files.length>0){
                _upload_info.app_bean.upload_url=$scope.info.version_app_info.checked_files[0].path+"/"+$scope.info.version_app_info.checked_files[0].file;
                _upload_info.app_bean.encoding=$scope.info.version_app_info.checked_files[0].encoding ? $scope.info.version_app_info.checked_files[0].encoding : "UTF-8";
            }
        }
        //配置包
        if($scope.info.version_config_info.add_type==1){
            if($scope.submit_info.config_base.file_list.length>0){
                _upload_info.config_list=handleSelectedFileList(1,$scope.submit_info.config_base.file_list,"");
            }
        }else{
            if($scope.info.version_config_info.checked_files.length>0){
                _upload_info.config_list=handleSelectedFileList(2,$scope.info.version_config_info.checked_files,$scope.info.version_config_info.soc_name);
            }
        }
        return _upload_info;
    };
    var init = function () {
        //获取初始化版本上传路径
        Version.getInitializeUploadPath(_sys_name).then(function (data) {
            $timeout(function () {
                if(data){
                    $scope.info.app_fileupload.uploadpath = data.app_path;
                    $scope.info.config_fileupload.uploadpath = data.config_path;
                    _app_package_path = data.app_path;
                    _config_package_path = data.config_path;
                }
            },0)
        },function (error) {
            Modal.alert(error.message)
        });
        //获取数据源列表
        ScriptExec.getSocByNodeIp("",1).then(function (data) {
            $scope.info.app_data.ver_soc_list = data.source_list ? data.source_list : [];
            $scope.info.config_data.ver_soc_list=data.source_list ? data.source_list : [];
        }, function (error) {
            Modal.alert(error.message);
        });
    };

    //切换应用包上传类型
    $scope.changeAppPackUploadType = function (flag) {
        if(flag==1){
            $scope.info.version_app_info={
                business_cn_name:$stateParams.business_cn_name ? $stateParams.business_cn_name :'',
                upload_path:'',
                soc_name:'',
                root_bk_dir:"",
                init_path:"",
                full_path:"",
                checked_files:[],
                add_type:1,
                encoding:"UTF-8",
            };
            $scope.control.show_Ftp=false;
        }else{
            $scope.info.app_fileupload = {
                suffixs:'tar,zip,gz',
                filetype: "",
                filename: "",
                uploadpath: _app_package_path
            };
            changeAppSocName();
        }
    };
    //切换配置包上传类型
    $scope.changeConfigPackUploadType = function (flag) {
        if(flag==1){
            $scope.info.version_config_info={
                business_cn_name:$stateParams.business_cn_name ? $stateParams.business_cn_name :'',
                upload_path:'',
                soc_name:'',
                root_bk_dir:"",
                init_path:"",
                full_path:"",
                checked_files:[],
                add_type:1,
                encoding:"UTF-8",
            };
            $scope.control.show_config_ftp=false;
        }else{
            $scope.info.config_fileupload={
                suffixs:'tar,zip,gz',
                filetype: "",
                filename: "",
                uploadpath: _config_package_path
            };
            $scope.submit_info.config_base.file_list = [];
            changeConfigSocName();
        }
    };
    //切换应用包数据源
    $scope.changeAppSoc = function () {
        $scope.control.show_Ftp = false;
        changeAppSocName();
    };
    //切换配置包数据源
    $scope.changeConfigSoc = function () {
        $scope.control.show_config_ftp=false;
        changeConfigSocName();
    };
    //切换应用包目录文件路径
    $scope.changeFilePath = function(node) {
        if(node.soc_name){
            node.loading = true;
            Collection.getFileListBySoc(node.soc_name,node.full_path).then(function(data) {
                node.loading = false;
                node.path_files = data.file_bean_list || [];
            }, function(error) {
                node.loading = false;
                node.err_msg = error.message;
            });
        }
    };
    //下载应用包
    $scope.downloadAppPackFile = function(){
        if($scope.submit_info.app_base.upload_path) {
            CV.downloadFile($scope.submit_info.app_base.upload_path);
        }else{
            Modal.alert("文件找不到");
        }
    };
    //删除应用包
    $scope.removeVersionFile = function () {
        $scope.info.app_fileupload.filename="";
    };
    //文件上传成功
    $scope.fileUploadSuccessThen = function (flag) {
        if(flag == 1){
            $scope.submit_info.app_base.upload_path= $scope.info.app_fileupload.uploadpath+$scope.info.app_fileupload.filename;
        }else if(flag == 2){
            var _file = {
                file_name:$scope.info.config_fileupload.filename,
                file_path:$scope.info.config_fileupload.uploadpath+$scope.info.config_fileupload.filename,
            };
            $scope.submit_info.config_base.file_list.push(_file);
            $scope.info.config_fileupload = {
                suffixs:'tar,zip,gz',
                filetype: "",
                filename: "",
                uploadpath:_config_package_path
            };
        }
    };
    //下载配置包
    $scope.downloadConfigPackage = function (package_file) {
        if(package_file){
            CV.downloadFile(package_file.file_path);
        }else{
            Modal.alert("文件找不到");
        }
    };
    //删除配置包
    $scope.removeConfigPackage = function (index) {
        $scope.submit_info.config_base.file_list.splice(index, 1);
    };
    //计算遮罩层高度
    $scope.calculateLayerHeight = function () {
        if($scope.control.layers_loading){
            var _left_offset = _version_container.offset().left - 5;
            var _top_offset =  _version_container.offset().top - 5;
            var _height = $(window).height() - _top_offset - 15;
            var _width = _version_container.width() + 40;
            return {
                'top' :_top_offset,
                'left':_left_offset,
                'height': _height,
                'width' : _width,
            };
        }
    };
    //保存
    $scope.save = function () {
        var _submit_info = handleSubmitInfo();
        var submitFunc = function () {
            $scope.control.layers_loading=true;
            Version.addOneVersion(_submit_info).then(function(data) {
                $scope.control.layers_loading = false;
                Modal.confirm("初始化成功，是否进入全量流列表").then(function () {
                    $scope.cancel();
                })
            }, function(error) {
                Modal.alert(error.message);
                $scope.control.layers_loading = false;
            });
        };
        if(($scope.info.version_app_info.add_type==1 && !$scope.info.app_fileupload.filename) || ($scope.info.version_app_info.add_type==2 && $scope.info.version_app_info.checked_files.length==0)){
            Modal.confirm("当前不存在目录信息，是否继续初始化？").then(function () {
                _submit_info.app_bean = null;
                submitFunc();
            });
        }else {
            submitFunc();
        }
    };
    //取消
    $scope.cancel = function () {
        $state.go('version_full_stream_list');
    };
    $(window).resize(function(){
        $timeout(function(){
            if($scope.control.layers_loading){
                $scope.calculateLayerHeight();
            }
        },100);
    });
    init();
}]);

/**
 * 发布流列表
 * */
versionCtrl.controller('pubStreamListCtrl',["$scope", "$timeout", "$state", "Version", "Modal", function($scope, $timeout, $state, Version, Modal) {
    //页面信息
    $scope.info = {
        search_key_word : '', //搜索关键字
        pub_stream_list : []  //发布流列表
    };
    //页面控制
    $scope.control = {
        loading : false //页面加载
    };
    var init = function () {
        $scope.control.loading = true;
        //查询发布流列表
        Version.getStreamListByKey($scope.info.search_key_word,2).then(function (data) {
            if(data){
                $timeout(function () {
                    $scope.control.loading = false;
                    $scope.info.pub_stream_list = data.vsVersion_list || [];
                },0)
            }
        },function (error) {
            $scope.control.loading=false;
            Modal.alert(error.message);
        })
    };
    //清除搜索关键字
    $scope.clearKeyWord = function () {
        $scope.info.search_key_word = "";
    };
    //关键字搜索
    $scope.searchByKeyword = function () {
        $scope.control.loading = true;
        Version.getStreamListByKey($scope.info.search_key_word, 2).then(function (data) {
            if (data) {
                $timeout(function () {
                    $scope.control.loading = false;
                    $scope.version.pub_stream_list = data.vsVersion_list || [];
                }, 0)
            }
        }, function (error) {
            $scope.control.loading = false;
            Modal.alert(error.message);
        })
    };
    //跳转发布流页面
    $scope.goPubVersion = function (version){
        if(version.vsversion_id){
            $state.go('version_pub_stream_detail',{sys_name:version.business_sys_name,version_id: version.vsversion_id});
        } else{
            Modal.alert("当前系统暂无发布流");
        }
    };
    //阻止默认事件
    $scope.stopPrevent =function (event) {
        event.stopPropagation();
    };
    init();
}]);

/**
 * 发布流查看
 * */
versionCtrl.controller('pubStreamDetailCtrl', ["$scope", "$timeout", "$stateParams", "$rootScope", "$state", "$interval", "Monitor", "Plan","Version","VersionStatus", "ReleaseFileType", "CodeMirrorOption", "TempCompareData", "ScrollBarConfig", "Modal", "CV","$filter", function($scope, $timeout, $stateParams, $rootScope, $state, $interval, Monitor, Plan,Version,VersionStatus,ReleaseFileType, CodeMirrorOption, TempCompareData, ScrollBarConfig, Modal, CV,$filter) {
    var _curr_checked_tab = 1; //当前tab页
    var _origin_package_list = []; //原始包列表
    var _version_id = $stateParams.version_id; //版本号
    var _business_sys_name = $stateParams.sys_name; //系统名
    var _encoding = "";    //记录上次的编码
    var _absolute_path;    //投产包比对路径1（到.tar）
    var _pac_root_path;    //包根路径
    var _compare_type = 1; //对比类型
    var _curr_scroll_bar;  //0 左侧 1右侧
    //页面配置
    $scope.config = {
        //滚动条y轴配置(默认配置)
        scroll_y_config : ScrollBarConfig.Y(),
        //滚动条xy轴配置
        scroll_xy_config : ScrollBarConfig.XY(),
        //比对模式-左侧配置
        compare_left_config : {
            status:'left',
            compare_mode:true
        },
        //比对模式-右侧配置
        compare_right_config : {
            status:'right',
            compare_mode:true
        },
        //投产包树加载配置
        pkg_loading_config:{
            disabled_control:false //加载中不能点击
        },
        //配置文件树加载配置
        configfile_loading_config:{
            disabled_control:false //加载中不能点击
        }
    };
    //比对模式-左侧滚动条
    $scope.compare_left_scroll = {
        whileScrolling: function() {
            var _top_offset = Math.abs(this.mcs.top);
            var _left_offset = Math.abs(this.mcs.left);
            synCompareContainerScroll(0,_top_offset,_left_offset);
        }
    };
    //比对模式-右侧滚动条
    $scope.compare_right_scroll = {
        whileScrolling: function() {
            var _top_offset = Math.abs(this.mcs.top);
            var _left_offset = Math.abs(this.mcs.left);
            synCompareContainerScroll(1,_top_offset,_left_offset);
        }
    };
    $scope.tabs = [];
    //版本流控制
    $scope.flow_control = {
        curr_index : 0,
        curr_project_index:0,
        show_broken_line:true,
    };
    //文件查看配置
    $scope.detailFileOptions = CodeMirrorOption.Properties(true);
    //初始化数据
    var initData = function(is_switch_mode){
        //版本信息
        if(!is_switch_mode){
            $scope.version = {
                version_list       : [], //版本列表数据
                full_version_list  : [], //全量流版本列表（与全量流比对）
                compare_ver_num    : '', //比对版本号
                compare_path       : '', //比对路径
                file_absolute_path : '', //版本绝对路径
                version_type       : 2,  //1全量文件 2发布包 3:配置文件
            };
        }
        //投产包关键字搜索
        $scope.package_input = {
            key_word:""
        };
        //文件搜索
        $scope.search_info = {
            search_list: []
        };
        //投产包-包文件树（解压前）
        $scope.file_nodes = {
            loading :false,     //目录加载
            nodes   :[],        //文件节点树结构
            curr_fold_path:'',  //当前点击文件夹路径
            curr_file:{}        //当前点击文件对象
        };
        //投产包-文件树（解压后）
        $scope.pack_file_tree = {
            loading:false,
            nodes:[],
            no_init_flag:true,  //不需要触发初始化方法
            curr_fold_path:'',  //当前点击文件夹路径
            curr_file:{}        //当前点击文件
        };
        //配置文件树
        $scope.config_files_tree = {
            loading :false,
            nodes   :[],
            no_init_flag   :true, //是否触发初始化方法
            curr_fold_path :'',   //当前点击文件夹路径
            curr_file      :{}    //当前点击文件
        };
        //清单文件树
        $scope.manifest_files_tree = {
            loading  : false,
            nodes    : [],
            no_init_flag   : true, //是否触发初始化方法
            curr_fold_path : '',   //当前点击文件夹路径
            curr_file      : {}    //当前点击文件
        };
        //页面控制
        $scope.control={
            show_version_pop  : false,   //显示头部比对列表
            loading           : false,    //页面加载
            btn_list_show     : false,   //按钮组显示(发布，备份，比对)
            curr_btn_index    : 1,       //当前页面按钮（默认发布）
            fold_tree_control : false,   //文件夹树控制
            show_fold_compare : false,   //显示目录比对
            view_compare_mode : false,   //浏览和对比模式切换
            fold_flag         : false ,  //投产包目录切换
            go_to_compare     : false,   //目录比对标志
            pub_fold_flag     : false,   //比对模式包比对
            compare_pac_flag  : false,   //是否是一般目录比对（不是投产包的比对）
            compare_full_flag : true,    //投产包比比对与发布比对标志（true与全量比对）
            compare_tar_flag  : 1,       //发布备份目录比对是否是tar包标志
            publish_back_btn  : false,   //发布备份按钮切换，默认发布
            download_loading  : false ,  //下载loading
            pre_pub_flag      : false    //预发布标志
        };
        //文件查看控制
        $scope.file_control = {
            refresh              : false, //刷新codemirror标志
            file_loading         : false, //文件数据加载
            show_file_history    : false, //显示/隐藏文件历史页面
            codemethod_loading   : false, //切换编码方式加载
            show_file_compare    : false, //显示/隐藏文件比对页面
            pack_file            : {},    //投产包文件控制对象
            config_file          : {},    //配置文件控制对象
            manifest_file        : {},    //清单文件控制对象
        };
        //节点IP列表数据
        $scope.ip_data = {
            pub_config_ip       : '', //发布包ip
            back_config_ip      : '', //备份包ip
            back_manifet_ip     : '', //备份清单ip
            back_config_ip_list : [], //备份配置文件ip列表
            pub_config_ip_list  : [], //发布配置文件ip列表
            manifet_ip_list     : [], //清单文件ip列表
        };
        //包文件信息
        $scope.file_info = {
            file_content     : '', //文件内容
            file_type        : '', //文件类型
            file_size        : '', //文件大小
            file_name        : '', //文件名
            file_update_time : '', //文件更新时间
            error_msg        : '', //文件出错信息
            version_num      : '', //版本号
        };
        //配置文件信息
        $scope.config_file_info = {
            file_content     : '',
            file_type        : '',
            file_size        : '',
            file_name        : '',
            file_update_time : '',
            error_msg        : '',
        };
        //清单文件信息
        $scope.manifest_file_info = {
            file_type        : '',
            file_size        : '',
            file_name        : '',
            file_update_time : '',
            error_msg        : '',
        };
        //配置文件比对树
        $scope.pub_bak_list_compare = {
            loading : false,
            nodes   : [],
            compare_path2  : '', //对比路径
            compare_path1  : '', //当前文件路径
            curr_fold_path : '', //当前点击文件夹路径
            curr_file      : {}  //当前点击文件
        };
        //查看文件内容-请求头
        $scope.file_post_header = {
            version_num      : $scope.one_pub ? $scope.one_pub.version_num ? $scope.one_pub.version_num : '':'',
            business_sys_name: _business_sys_name,
            absolute_path : '',
            encoding_type : 'UTF-8',
            file_path     : '',
            version_type  : 2 //1全量文件 2发布包 3:配置文件
        };
    };
    //同步比对容器滚动 mcs_mark(0:左侧容器 1右侧容器)
    var synCompareContainerScroll = function(mcs_mark,y,x){
        var mCSContainer = [$('#left_scroll_container' + _curr_checked_tab),$('#right_scroll_container' + _curr_checked_tab)];
        var scroll_position = [y,x];
        _curr_scroll_bar = _curr_scroll_bar || 0;
        for(var i = 0; i < mCSContainer.length; i++){
            if(_curr_scroll_bar !== i && mcs_mark !== i){
                mCSContainer[i].mCustomScrollbar("scrollTo", scroll_position, {scrollInertia:10});
            }
        }
    };
    //获取发布包以及清单
    var getPackageAndList = function (_path,pkg_type) {
        Version.getPubStreamFileList($scope.version.file_absolute_path+_path,pkg_type).then(function (data) {
            $timeout(function () {
                $scope.config_files_tree.nodes = data.config_file_list || [];
                $scope.pack_file_tree.nodes    = data.package_list || [];
                _origin_package_list = angular.copy($scope.pack_file_tree.nodes);
                $scope.manifest_files_tree.nodes = data.manifest_list || [];
                $scope.pub_or_back_path = data.version_base_path || '';
                $scope.control.change_version_loading = false;
            },0)
        },function (error) {
            $scope.control.change_version_loading = false;
            Modal.alert(error.message);
        })
    };
    //根据路径获取ip列表（back_or_pub 1 发布 2备份）
    var getIpByPath = function (back_or_pub){
        var _path = back_or_pub === 1 ? "update" : "backup";
        var _absolute_path = $scope.version.file_absolute_path + _path;
        if(_curr_checked_tab === 2 && back_or_pub===1) _absolute_path+="/config";
        Version.getIpBypath(_absolute_path).then(function (data) {
            $scope.compare_view_info.bak_pac_ip_list = [];
            $scope.ip_data.pub_config_ip_list = [];
            $scope.ip_data.manifet_ip_list = [];
            //_curr_checked_tab（1 投产包 2配置文件 3清单）
            if(_curr_checked_tab === 1 || _curr_checked_tab === 0){
                var _pac_ip_list = data.ip_list || [];
                for(var i = 0; i < _pac_ip_list.length; i++){
                    var _temp_obj = {
                        key   : _pac_ip_list[i],
                        value : _pac_ip_list[i]
                    };
                    $scope.compare_view_info.bak_pac_ip_list.push(_temp_obj)
                }
                $scope.compare_view_info.bak_ip = $scope.compare_view_info.bak_pac_ip_list.length > 1 ? $scope.compare_view_info.bak_pac_ip_list[0].key : '';
                $scope.compare_view_info.bak_pac_ip_list.length > 1 && $scope.selectBakPacIp($scope.compare_view_info.bak_ip);
            }else if(_curr_checked_tab === 2){
                $scope.ip_data.pub_config_ip_list = data.ip_list ||  [];
                $scope.ip_data.pub_config_ip = data.ip_list ? data.ip_list[0] : '';
                $scope.ip_data.pub_config_ip_list.length > 1 && $scope.selectConfigOrListIp($scope.ip_data.pub_config_ip,back_or_pub);
            }else{
                if(back_or_pub===2){
                    $scope.ip_data.manifet_ip_list = data.ip_list || [];
                    $scope.ip_data.back_manifet_ip = data.ip_list ? data.ip_list[0] : '';
                    $scope.ip_data.manifet_ip_list.length > 1 && $scope.selectConfigOrListIp($scope.ip_data.back_manifet_ip,back_or_pub);
                }
            }
        })
    };
    //处理对比版本号
    var configVersionList = function(version_list,curr_index){
        version_list = version_list || [];
        var _new_ver_list = [];
        //处理版本号
        angular.forEach(version_list,function(item,index){
            if(curr_index !== index){
                if(index === curr_index +1){
                    _new_ver_list.unshift({
                        version_num:item.version_num,
                        version_view: "与前版本比对",
                    })
                }else if((index === curr_index -1) && index !== 0){
                    _new_ver_list.unshift({
                        version_num:item.version_num,
                        version_view: "与后版本比对",
                    })
                }else if(index !==0){
                    _new_ver_list.push({
                        version_num:item.version_num,
                        version_view: item.version_num,
                    });
                }
            }
        });
       //最新版本放最前面
        if(version_list.length && curr_index !==0){
            _new_ver_list.unshift({
                version_num:version_list[0].version_num,
                version_view: "与最新版本比对",
            })
        }
        return _new_ver_list;
    };
    //根据文件类型切换代码高亮
    var changeCodeHighlight = function(file_type){
        if(!file_type) return;
        $scope.detailFileOptions = CodeMirrorOption.Properties(true);
        if(file_type === 5) $scope.detailFileOptions = CodeMirrorOption.Sh(true);
        if(file_type === 14) $scope.detailFileOptions = CodeMirrorOption.Sql(true);
        if(file_type === 15) $scope.detailFileOptions = CodeMirrorOption.Python(true);
        if(file_type === 16) $scope.detailFileOptions = CodeMirrorOption.Java(true);
    };
    //刷新codemirror
    var refreshCodeMirror = function(){
        $scope.file_control.refresh = false;
        $timeout(function(){
            $scope.file_control.refresh = false;
        },50);
    };
    //获取当前文件信息
    var getCurrFileInfo = function(){
        var _curr_file_info;
        switch (_curr_checked_tab){
            case 1: _curr_file_info = $scope.control.fold_flag ? $scope.file_nodes.curr_file : $scope.pack_file_tree.curr_file; break;
            case 2: _curr_file_info =  $scope.config_files_tree.curr_file; break;
            case 3: _curr_file_info =  $scope.manifest_files_tree.curr_file; break;
            default: _curr_file_info =  $scope.file_nodes.curr_file; break;
        }
        return _curr_file_info;
    };
    //格式化文件信息
    var formatFileInfo = function(file_info,data){
        file_info.error_msg = '';
        file_info.file_content = data.file_content ? Base64.decode(data.file_content).trim() : '';
        file_info.file_size = data.file_size || '';
        file_info.file_update_time = data.file_update_time || '';
    };
    //查询文件信息(flag:1投产包里的文件 2配置文件 3清单文件 4投产包文件)
    var getFileContent = function(flag){
        var _content_loading = $scope.file_control.codemethod_loading;
        $scope.file_control.file_loading = !_content_loading;
        if(!_content_loading){
            if(_curr_checked_tab === 1){
                $scope.file_info.file_content = "";
            }
            if(_curr_checked_tab === 2){
                $scope.config_file_info.file_content = "";
            }
        }
        //投产包里的文件路径
        $scope.file_post_header.file_path = flag === 1 ? $scope.file_nodes.curr_file.relate_path :'';
        //包文件或普通文件
        $scope.file_post_header.version_type =  flag === 1 ? 2 : 3;
        //预发布-临时版本
        if($scope.control.pre_pub_flag) $scope.file_post_header.version_num = $scope.version.pre_pub_ver;
        //当前文件路径(绝对路径)
        switch(flag){
            case 1: $scope.file_post_header.absolute_path =  $scope.file_nodes.curr_file.file_path + "/"; break;
            case 2: $scope.file_post_header.absolute_path =  $scope.config_files_tree.curr_file.file_path + "/" + $scope.config_files_tree.curr_file.file; break;
            case 3:  $scope.file_post_header.absolute_path =  $scope.manifest_files_tree.curr_file.file_path + "/" + $scope.manifest_files_tree.curr_file.file; break;
            case 4:  $scope.file_post_header.absolute_path =  $scope.pack_file_tree.curr_file.file_path + "/" + $scope.pack_file_tree.curr_file.file; break;
            default: $scope.file_post_header.absolute_path =  $scope.file_nodes.curr_file.file_path + "/"; break;
        }
        //获取文件内容
        Version.viewfileContent($scope.file_post_header).then(function(data){
            if(data){
                $timeout(function(){
                    switch(flag){
                        case 1: //1 4 共用
                        case 4:formatFileInfo($scope.file_info,data); break;
                        case 2: formatFileInfo($scope.config_file_info,data); break;
                        case 3: formatFileInfo($scope.manifest_file_info,data); break;
                        default: formatFileInfo($scope.file_info,data); break;
                    }
                    $scope.file_control.file_loading = false;
                    $scope.file_control.codemethod_loading = false;
                    $scope.file_control.refresh = true;
                },0);
            }
        },function (error) {
            $scope.file_control.file_loading = false;
            $scope.file_control.codemethod_loading = false;
            $scope.file_info.error_msg = error.message;
            $scope.config_file_info.error_msg = error.message;
            $scope.manifest_file_info.error_msg = error.message;
        });
    };
    var init = function(){
        initData();
        //获取单个发布流信息
        $scope.control.loading = true;
        Version.getOnePub(_version_id).then(function (data) {
            if(data){
                $timeout(function () {
                    $scope.control.loading = false;
                    $scope.one_pub = data.vsInfoDetailbean || {};
                    $scope.version.file_absolute_path = data.vsInfoDetailbean.remote_path || "";
                    $scope.one_pub.v_status_cn = CV.findValue(data.vsInfoDetailbean.version_status,VersionStatus);
                    //文件查看
                    $scope.file_info.version_num = data.vsInfoDetailbean.version_num;
                    $scope.file_post_header.version_num = data.vsInfoDetailbean.version_num;
                    //版本比对列表数据
                    $scope.version.version_list = configVersionList(data.compare_version_list,0);
                    getPackageAndList('update',1);
                    //获取全量流版本号列表
                    Version.getfileVersionNum({busisys_name : _business_sys_name, version_type : 1}).then(function(data){
                        $timeout(function(){
                            $scope.version.full_version_list = data.version_list || [];
                        },0);
                    },function(error){
                        Modal.alert(error.message)
                    });
                },0)
            }
        },function (error) {
            Modal.alert(error.message);
            $scope.control.loading=false;
            $scope.control.version_view=false;
        });
        //流程数据
        $scope.goData = {
            project_data:[],
            publish_data:[],
            real_project_data:[]
        };
        //获取发布流-版本流程数据
        Version.getPubData(_business_sys_name).then(function(data){
            $scope.goData.project_data = data.project_data || [];
            $scope.goData.publish_data = data.publish_data || [];
            if($scope.goData.publish_data.length){
                $scope.goData.publish_data[0].is_checked = true;
            }
            //控制是否显示折线(显示待执行和执行中的项目)
            var _show_project_count = 0;
            for(var i = 0; i < $scope.goData.project_data.length; i++){
                var _project_data = $scope.goData.project_data[i];
                if(_project_data.sys_publish_status > 1 && _project_data.sys_publish_status < 4){
                    _show_project_count++;
                    $scope.goData.real_project_data.push(_project_data);
                }
            }
            if(_show_project_count === 0){
                $scope.flow_control.show_broken_line = false;
            }
        },function(error){
            Modal.alert(error.message);
        });
    };

    //左侧发布流虚线高度
    $scope.projLineStyle = function(){
        return {
            height:(($filter('getProjStateGreaterThanThree')($scope.goData.project_data)).length)*50+90+'px'
        };
    };
    //左侧发布流-结束虚点的位置
    $scope.endHollowLind = function(){
        return {
            top:(($filter('getProjStateGreaterThanThree')($scope.goData.project_data)).length)*50+62+44+'px',
            position: "absolute",
            left: "-10px",
        };
    };
    //左侧发布流-项目条高度
    $scope.hollowHeight = function(){
        return {
            height: (($filter('getProjStateGreaterThanThree')($scope.goData.project_data)).length)*50+62+"px",
        };
    };
    //左侧发布流-项目小圆样式
    $scope.projCircleStyle = function(index){
        return {
            position: "absolute",
            left: "-7px",
            cursor:'pointer',
            bottom: 50*(index+1) +"px",
        }
    };
    //左侧发布流-实线版本大圆样式
    $scope.publishCircleStyle = function(index){
        return {
            position: "absolute",
            height:"70px",
            width:"4px",
            background:"#44dcfd",
            left:"-2px",
            top:(($filter('getProjStateGreaterThanThree')($scope.goData.project_data)).length)*50+127+index*70 +"px"
        }
    };
    //显示按钮组列表(发布，比对，备份)
    $scope.showBtnList = function () {
        $scope.control.btn_list_show = !$scope.control.btn_list_show;
    };
    //返回发布流列表
    $scope.backPubStreamList = function(){
        $state.go('version_pub_stream_list');
        //清空文件对比的临时数据
        TempCompareData.clearList();
    };
    //显示版本比对弹窗
    $scope.showVersionPop = function(){
        $scope.control.show_version_pop = !$scope.control.show_version_pop;
    };
    //版本比对
    $scope.comparePubVersion = function (is_compare,_version) {
        $scope.control.show_version_pop = false;
        $scope.control.version_flag = true;  //版本比对标志
        if(is_compare){
            $scope.version.compare_ver_num =_version.version_num;
            $scope.version.compare_path =$scope.version.file_absolute_path.replace($scope.one_pub.version_num,_version.version_num);
            $scope.control.show_full_compare_flag=false;
            $scope.control.show_pub_compare_flag=false;
        }
        $scope.control.show_fold_compare = is_compare;
    };
    //切换发布版本
    $scope.changeVersion = function(index){
        $scope.control.pre_pub_flag =false;
		if($scope.goData.real_project_data.length){
			$scope.goData.real_project_data[$scope.flow_control.curr_project_index].is_checked = false;	
		}
        var _last_index = $scope.flow_control.curr_index;
        if(index === _last_index && $scope.control.pre_pub_flag) return;
        $scope.goData.publish_data[_last_index].is_checked = false;
        $scope.goData.publish_data[index].is_checked = true;        //激活当前
        $scope.flow_control.curr_index = index;                     //赋当前TAB下标
        //清空文件比对临时数据
        TempCompareData.clearList();

        //根据版本号 获取基本信息
        var _version_id = $scope.goData.publish_data[index].vsversion_id;
        $scope.control.change_version_loading = true;
        Version.getOnePub(_version_id).then(function (data) {
            if (data) {
                $timeout(function () {
                    initData();
                    _origin_package_list = [];//原始包列表
                     _encoding = "";
                    $scope.tabs[0] = true;
                    $scope.changeFileMethod(1);
                    $scope.control.loading = false;
                    $scope.control.version_view = true;
                    $scope.one_pub = data.vsInfoDetailbean || {};
                    $scope.version.file_absolute_path = data.vsInfoDetailbean.remote_path || "";
                    $scope.one_pub.v_status_cn = CV.findValue(data.vsInfoDetailbean.version_status,VersionStatus);
                    //文件查看
                    $scope.file_info.version_num = data.vsInfoDetailbean.version_num;
                    $scope.file_post_header.version_num = data.vsInfoDetailbean.version_num;
                    //版本比对列表数据
                    $scope.version.version_list = configVersionList(data.compare_version_list,index);
                    getPackageAndList('update',1);
                    //获取全量流版本列表
                    Version.getfileVersionNum({busisys_name : _business_sys_name, version_type:1}).then(function(data){
                        $timeout(function(){
                            $scope.version.full_version_list = data.version_list || [];
                        },0);
                    },function(error){
                        Modal.alert(error.message)
                    });
                }, 0)
            }
        }, function (error) {
            $scope.control.change_version_loading = false;
            Modal.alert(error.message);
        })
    };
    //切换备份和发布(is_backup true:备份 false:发布)
    $scope.switchBackAndpub = function (is_backup,flag) {
        $scope.control.btn_list_show = false;
        if($scope.control.curr_btn_index ==flag){
            return false;
        }
        initData(true);
        $scope.control.view_compare_mode = false;
        $scope.control.fold_tree_control = false;
        $scope.control.publish_back_btn = is_backup;
        $scope.control.fold_flag = false;
        var _pkg_type = is_backup ? 2 :1;
        var _path = is_backup ? 'backup' :'update';
        $scope.control.curr_btn_index = _pkg_type;
        getPackageAndList(_path,_pkg_type);
    };
    //过滤投产包
    $scope.filterPackage = function () {
        $scope.pack_file_tree.nodes = [];
        $timeout(function () {
            $scope.pack_file_tree.nodes = $filter('filter')(angular.copy(_origin_package_list),{ file:$scope.package_input.key_word});
        },50);
    };
    //过滤投产包文件
    $scope.filterFile = function () {
        $scope.search_info.search_list = [];
        if($scope.package_input.key_word){
            $scope.control.search_mode_flag = true;
            $scope.search_info.loading = true;
            Version.searchFile(_absolute_path,$scope.package_input.key_word,$scope.package_input.relate_path,true).then(function (data) {
                $scope.search_info.search_list=data.file_list ? data.file_list :[];
                $scope.search_info.loading = false;
            },function (error) {
                Modal.alert(error.message);
            })
        }else {
            $scope.control.search_mode_flag = false;
            $scope.file_nodes.curr_file.relate_path= $scope.package_input.relate_path;
        }
    };
    //获取更多文件夹数据
    $scope.getDetailFold = function (path) {
        $scope.search_info.search_list = [];
        $scope.control.search_mode_flag = false;
        $scope.file_nodes.curr_file.relate_path = path.substring(0,path.lastIndexOf('/')+1);
    };
    //查看-投产包文件-信息
    $scope.packageDetail = function (obj,flag) {
        if(!obj.curr_file.dir){
            if(obj.curr_file.file_type>=9 && obj.curr_file.file_type<=13){
                $scope.file_info = {
                    file_content :"",
                    file_type    :"",
                    file_size    :"",
                    file_name    :'',
                    file_update_time:'',
                    error_msg    :'',
                    version_num  :'',
                };
                $scope.control[flag] = true;
            }else {
                var _file_tree  = obj.curr_file;
                var _file_type = _file_tree.file_type;
                $scope.file_info.file_type = _file_type;
                $scope.file_control.pack_file.has_file_icon = _file_type >= 1 && _file_type < 4;
                $scope.file_control.pack_file.is_excel = (_file_type == 2 || _file_type == 3);
                $scope.file_control.pack_file.un_view = (_file_type > 8 && _file_type < 14) || $scope.file_control.pack_file.is_excel;
                $scope.file_control.pack_file.show_file = (!_file_type || (_file_type && !(_file_type > 8 && _file_type < 14 ))) && (_file_tree.hasOwnProperty('dir') && !_file_tree.dir);
                changeCodeHighlight(_file_type);
                if(!_file_tree.dir && ( _file_type < 9 || _file_type > 13 || angular.isUndefined(_file_type))){
                    $scope.file_info.file_name = _file_tree.file || '';
                    getFileContent(4);
                }
            }
        }
    };
    //获取版本根目录文件
    $scope.getRootFile = function (obj1,obj2,control) {
        if(!$scope.control[control]){
            _absolute_path=obj1.curr_file.file_path+'/'+obj1.curr_file.file;
            return   Version.getPubStreamFold(obj1.curr_file.file_path+'/'+obj1.curr_file.file,$scope.one_pub.business_sys_name).then(function (data) {
                        $scope.control[control] = true;
                        obj2.curr_file = data.file_bean || {};
                        var _file_type = obj2.curr_file.file ? obj2.curr_file.file.lastIndexOf('.')==-1 ? 0 :CV.findKey(obj2.curr_file.file.substring(obj2.curr_file.file.lastIndexOf('.')+1),ReleaseFileType):'';
                        obj2.curr_file.file_type = _file_type;
                        var _temp_obj = angular.copy( obj2.curr_file);
                        _temp_obj.dir = true;
                        _temp_obj.nodes = data.file_list || [];
                        $scope.package_input.relate_path = data.file_list && data.file_list.length!=0 ? data.file_list[0].relate_path:'';
                        return  [_temp_obj];
                    },function (error) {
                        Modal.alert(error.message);
                    })
        }else {
            return   Version.getFoldInTarPac(_absolute_path,obj2.curr_file.relate_path,$scope.one_pub.business_sys_name).then(function (data) {
                        obj2.curr_file = data.file_bean|| {};
                        obj2.curr_file.file_path = obj2.curr_file.tar_path;
                        $scope.control.down_btn = true;  //包里下载按钮切换
                        return  data.file_list || [];
                    },function (error) {
                        Modal.alert(error.message);
                    })
        }
    };
    //获取文件目录(str：投产包，配置文件，清单)
    $scope.getPacConfigListFold = function (obj,str) {
        return   Version.getFoldTree(obj.curr_fold_path,false).then(function (data) {
                    obj.curr_file= data.file_bean || {};
                    var _path_arr = data.version_base_path.split('/');
                    if(_path_arr.length == 7){
                        data.file_list = data.file_list || [];
                        for(var i = 0; i < data.file_list.length; i++){
                            var _file = data.file_list[i];
                            if(_file.file == str){
                                return [_file];
                            }
                        }
                        return  data.file_list || [];
                    }
                    return  data.file_list || [];
                },function (error) {
                    Modal.alert(error.message);
                })
    };
    //展开收起投产包
    $scope.expandPkgfold = function () {
        if(!$scope.control.fold_flag) return;
        $scope.control.fold_flag = false;
        $scope.control.fold_tree_control = false;
        $scope.control.down_btn = false;
        $scope.package_input.key_word = '';
        //文件树
        $scope.file_nodes = {
            loading:false,
            nodes:[],
            curr_fold_path:'',     //当前点击文件夹路径
            curr_file:{}          //当前点击文件
        };
        //文件信息
        $scope.file_info = {
            file_content :"",
            file_type    :"",
            file_size    :"",
            file_name    :'',
            file_update_time:'',
            error_msg    :'',
            version_num  :''
        };
    };
    //根据Ip路径获取配置文件
    $scope.getPubConfigFileByIp = function (obj,str) {
        var _path = $scope.control.publish_back_btn ? obj.curr_fold_path+'/'+str :obj.curr_fold_path;
        return   Version.getConfigFileByIp(_path).then(function (data) {
                    obj.curr_file = data.file_bean || {};
                    return  data.file_list || [];
                },function (error) {
                    Modal.alert(error.message);
                })
    };
    //选择备份包ip
    $scope.selectBakPacIp = function (ip) {
        var _path = $scope.version.file_absolute_path+'backup/'+ip;
        $scope.pub_bak_nodes.compare_path1 = _pac_root_path;
        $scope.pub_bak_nodes.nodes = [];
        $scope.pub_bak_nodes.compare_path2 = _path;
        $scope.control.pub_fold_flag = false;
        $scope.control.compare_tar_flag = 1;
        $timeout(function () {
            if($scope.pub_bak_nodes.compare_path1 && $scope.pub_bak_nodes.compare_path2){
                $scope.pub_bak_nodes.nodes=[];
                $scope.control.pub_fold_flag =true;
                _compare_type=1;
            }
        },500)
    };
    //切换比对模式
    $scope.switchViewToCompare = function (bool,flag) {
        $scope.control.btn_list_show = false;
        if($scope.control.curr_btn_index ==flag){
            return false;
        }
        $scope.control.curr_btn_index = 0;
        $scope.control.pub_fold_flag = false;
        $scope.control.config_control = false;
        $scope.control.list_control = false;
        //发布清单文件树
        $scope.pub_manifest_tree = {
            loading:false,
            nodes:[],
            no_init_flag:true,
            curr_fold_path:'',     //当前点击文件夹路径
            curr_file:{}          //当前点击文件
        };
        //备份清单树
        $scope.bak_manifest_tree = {
            loading:false,
            nodes:[],
            curr_fold_path:'',     //当前点击文件夹路径
            curr_file:{}          //当前点击文件
        };
        //发布/备份包文件树
        $scope.pub_bak_nodes = {
            loading:false,
            nodes:[],
            compare_path2:'',
            compare_path1:'',
            curr_fold_path:'',     //当前点击文件夹路径
            curr_file:{}          //当前点击文件
        };
        //比对模式-包ip信息
        $scope.compare_view_info ={
            bak_ip:'',
            pack_list:[],
            bak_pac_ip_list:[],
            back_package_list:[]
        };
        //配置文件-对比树
        $scope.pub_bak_list_compare = {
            loading:false,
            nodes:[],
            compare_path2:'',
            compare_path1:'',
            curr_fold_path:'',     //当前点击文件夹路径
            curr_file:{}          //当前点击文件
        };
        $scope.control.view_compare_mode = bool;
        if($scope.control.view_compare_mode){
            _curr_checked_tab = 0; //初始化tab
            Version.getPubStreamFileList($scope.version.file_absolute_path+'update',1).then(function (data) {
                $timeout(function () {
                    $scope.compare_view_info.package_list=data.package_list ? data.package_list:[];
                   $scope.pub_bak_nodes.compare_path1= _pac_root_path= data.package_list ? $scope.version.file_absolute_path+'update/pkg':'';
                    $scope.pub_manifest_tree.nodes=data.manifest_list ? data.manifest_list :[];
                },0)
            },function (error) {
                Modal.alert(error.message);
            });
           /* $timeout(function(){
                $('.left-block .content').mCustomScrollbar("scrollTo", {y:'500',left:null}, option);
            },3000);*/

        }
    };
    //发布备份比对
    $scope.pubBakTreeCompare =function () {
        return   Version.pubAndBakTreeCompare($scope.pub_bak_nodes.compare_path1,$scope.pub_bak_nodes.compare_path2,_compare_type,1,$scope.one_pub.business_sys_name).then(function (data) {
                    $scope.control.compare_tar_flag = 2;
                    _compare_type = 3;
                    $scope.pub_bak_nodes.curr_file = data.file_bean || {};
                    return  data.diff_list || [];
                },function (error) {
                    Modal.alert(error.message);
                })
    };
    //投产包目录-比对
    $scope.goCompare = function () {
        var _temp = angular.copy($scope.pub_bak_nodes.temp);
        $scope.$broadcast($scope.pub_bak_nodes.curr_fold_path,_temp);
    };
    //配置文件目录-比对
    $scope.goCompareList = function () {
        var _temp = angular.copy($scope.pub_bak_list_compare.temp);
        $scope.$broadcast($scope.pub_bak_list_compare.curr_fold_path,_temp);
    };
    //查看预发布
    $scope.viewPrePubVersion = function (index) {
        initData();
        $scope.control.loading=false;
        $scope.goData.publish_data[ $scope.flow_control.curr_index].is_checked = false;
        var _last_index = $scope.flow_control.curr_project_index;
        $scope.control.pre_pub_flag=true;
        if(index === _last_index && !$scope.control.pre_pub_flag) return;
        if(_last_index>=0) $scope.goData.real_project_data[_last_index].is_checked = false;
        $scope.goData.real_project_data[index].is_checked = true;  //激活当前;
        $scope.flow_control.curr_project_index = index;            //赋当前TAB下标
        TempCompareData.clearList(); //清空文件比对临时数据
        Version.getPubVersionList($scope.one_pub.business_sys_name).then(function (data) {
            $scope.version.version_list = data.pub_num_list || [];
            $scope.version.full_version_list = data.full_num_list || [];
        },function (error) {
            Modal.alert(error.message)
        });
        //根据版本号 获取基本信息
        $scope.version.pre_pub_path = '/bank/'+$scope.one_pub.business_sys_name+'/pretags/'+$scope.one_pub.business_sys_name+$scope.goData.real_project_data[index].project_name+'/update';
        $scope.version.pre_project_name = $scope.goData.real_project_data[index].project_name;
        //预发布版本号
        $scope.version.pre_pub_ver = $scope.one_pub.business_sys_name+$scope.goData.real_project_data[index].project_name;
        $scope.control.change_version_loading = true;
        Version.getPubStreamFileList($scope.version.pre_pub_path,1).then(function (data) {
            $timeout(function () {
                $scope.config_files_tree.nodes = data.config_file_list || [];
                $scope.pack_file_tree.nodes = data.package_list || [];
                _origin_package_list = angular.copy($scope.pack_file_tree.nodes);
                $scope.manifest_files_tree.nodes = data.manifest_list || [];
                $scope.pub_or_back_path = data.version_base_path|| '';
                $scope.control.change_version_loading = false;
            },0)
        },function (error) {
            $scope.control.change_version_loading = false;
            Modal.alert(error.message);
        })
    };
    //预览模式-显示比对版本列表（type：1发布比对 2全量比对）
    $scope.showFoldCompareList = function (type) {
        if(type==1){
            $scope.control.show_full_compare_flag=false;
            $scope.control.show_pub_compare_flag=!$scope.control.show_pub_compare_flag;
        }else {
            $scope.control.show_pub_compare_flag=false;
            $scope.control.show_full_compare_flag=!$scope.control.show_full_compare_flag;
        }
    };
    //选择比对版本-开始目录比对
    $scope.startFoldCompare = function (bool,_version,_type,e) {
        if(bool){
            $scope.control.compare_full_flag = _type==1 ? false :true;
            $scope.version.compare_path1 = _absolute_path;
            $scope.version.compare_ver_num =_version.version_num;
            $scope.version.compare_path = _type==1 ? _absolute_path : '/bank/'+$scope.one_pub.business_sys_name+'/fulltags/'+$scope.one_pub.version_num+'/app';
            $scope.control.compare_pac_flag =true;
            e.stopPropagation();
        }else {
            $scope.control.compare_pac_flag=false;
        }
        $scope.control.show_fold_compare = bool;
        $scope.control.show_full_compare_flag=false;
        $scope.control.show_pub_compare_flag=false;
    };
    //获取配置文件/清单比对目录
    $scope.pubListTreeCompare = function () {
        return   Version.foldTreeCompare($scope.pub_bak_list_compare.compare_path1,$scope.pub_bak_list_compare.compare_path2).then(function (data) {
            $scope.pub_bak_list_compare.curr_file = data.file_bean || {};
            return  data.diff_list ? data.diff_list :[];
        },function (error) {
            Modal.alert(error.message);
        })
    };
    //切换tab页
    $scope.changeFileMethod = function(tab_flag,is_compare_mode){
        if(_curr_checked_tab === tab_flag) return;
        _curr_checked_tab = tab_flag;
        $scope.file_post_header.encoding_type = "UTF-8";
        switch(tab_flag){
            case 1: $scope.file_post_header.version_type = 2; break;
            case 2: //2 3 都是普通文件
            case 3: $scope.file_post_header.version_type = 3; break;
        }
        if(is_compare_mode) {
            if(_curr_checked_tab === 2) {
                getIpByPath(1);
            }else{
                getIpByPath(2);
            }
        }
        //刷新codemirror
        refreshCodeMirror();
    };
    //格式化文件图标
    $scope.formatFileIconStyle = function(){
        var class_name = '',_file_type = $scope.file_info.file_type;
        if(_curr_checked_tab == 2){
            _file_type = $scope.config_file_info.file_type;
        }else if(_curr_checked_tab == 3){
            _file_type = $scope.manifest_file_info.file_type;
        }
        if(_file_type== 1){
            class_name = 'txt-icon';
        }else if(_file_type == 2 || _file_type == 3){
            class_name = 'excel-icon';
        }else if(_file_type == 9){
            class_name = 'tar-icon';
        }
        return class_name;
    };
    //获取文件内容(1:包解压后的文件 2配置文件 3清单文件 4投产包文件)
    $scope.getFileContent = function(file_tree_obj,file_info,file_ctrl,file_flag,search_info){
        if(search_info){
            var _search_file_type = search_info.file.lastIndexOf('.')==-1 ? 0 :CV.findKey(search_info.file.substring(search_info.file.lastIndexOf('.')+1),ReleaseFileType);
            $scope.file_nodes.curr_file ={
                file_path:search_info.file_path,
                relate_path:search_info.relate_path,
                file:search_info.file,
                file_type:_search_file_type,
                dir:false,
                modify_time:''
            };
        }
        var _file_tree  = file_tree_obj.curr_file;
        var _file_type = _file_tree.file_type;
        file_info.file_type = _file_type;
        $scope.file_control[file_ctrl] = {
            has_file_icon : _file_type >= 1 && _file_type < 4,
            is_excel:(_file_type == 2 || _file_type == 3),
            un_view:(_file_type > 8 && _file_type < 14) || (_file_type == 2 || _file_type == 3),
            show_file: (!_file_type || (_file_type && !(_file_type > 8 && _file_type < 14 ))) && (_file_tree.hasOwnProperty('dir') && !_file_tree.dir),
        };
        changeCodeHighlight(_file_type);
        if(!_file_tree.dir && ( _file_type < 9 || _file_type > 13 || angular.isUndefined(_file_type))){
            file_info.file_name = _file_tree.file || '';
            getFileContent(file_flag);
        }
    };
    //选择配置文件或者清单Ip(pub_or_back:1 发布版 2:备份版本)
    $scope.selectConfigOrListIp = function(select_ip){
        if(_curr_checked_tab === 2){
            $scope.pub_bak_list_compare.compare_path1 = $scope.version.file_absolute_path + "update" + "/config/" + select_ip;
            $scope.pub_bak_list_compare.compare_path2 = $scope.version.file_absolute_path + "backup" + "/" + select_ip + "/config";
        }
        //备份的清单
        if(_curr_checked_tab === 3){
            $scope.bak_manifest_tree.curr_fold_path = $scope.version.file_absolute_path +"backup/" + $scope.ip_data.back_manifet_ip +'/list';
        }
        $scope.control.config_control=false;
        $scope.control.list_control = false;
        $timeout(function () {
            if($scope.pub_bak_list_compare.compare_path1 && $scope.pub_bak_list_compare.compare_path2 && _curr_checked_tab === 2){
                $scope.pub_bak_list_compare.nodes=[];
                $scope.control.config_control=true;
            }
            if($scope.bak_manifest_tree.curr_fold_path && _curr_checked_tab === 3) $scope.control.list_control = true;
        },200)
    };
    //双击对比文件
    $scope.dbClickCompareFile = function(){
        $scope.curr_file_info = {
            file_size: "",
            file_update_time:  "",
            file_absolute_path:_curr_checked_tab === 1 ? $scope.pub_bak_nodes.compare_path1 : $scope.pub_bak_list_compare.compare_path1, // 发布路径
            compare_path:_curr_checked_tab === 1 ? $scope.pub_bak_nodes.compare_path2 : $scope.pub_bak_list_compare.compare_path2,  //备份路径
            curr_version_num : $scope.one_pub.version_num,
            compare_version_num:$scope.one_pub.version_num,
            is_pub_compare:true, //发布或备份比对
        };
        //显示文件比对页面
        $scope.file_control.show_file_compare = true;
    };
    //切换编码方式
    $scope.changeCodeMethod = function(flag){
        _encoding = $scope.file_post_header.encoding_type;
        if(_encoding === 'UTF-8'){
            $scope.file_post_header.encoding_type = 'GBK';
        }else{
            $scope.file_post_header.encoding_type = 'UTF-8';
        }
        $scope.file_control.codemethod_loading = true;
        getFileContent(flag);
    };
    //全屏查看
    $scope.fullScreen = function(){
        var _file_info = {
            "1": $scope.file_info,
            "2": $scope.config_file_info,
            "3": $scope.manifest_file_info,
        };
        Modal.fileContentFullScreen(_file_info[_curr_checked_tab],$scope.file_post_header,_business_sys_name);
    };
    //查看文件历史信息
    $scope.viewHistory = function (){
        var _curr_file_info = getCurrFileInfo();
        if(!_curr_file_info) return;
        //构造数据(子控制器使用)
        $scope.file_header = {
            file_path: _curr_file_info.file_path,
            file_name: _curr_file_info.file,
            file_type:  _curr_file_info.file_type,
            pkg_file_path: $scope.file_post_header.file_path,
            version_num:  $scope.file_post_header.version_num,
            busisys_name: $scope.one_pub.business_sys_name,
            version_type: 2,
            view_file_flag: _curr_checked_tab === 1 && $scope.control.fold_flag ? 2 : 1, //2压缩包里面的文件 1普通文件
        };
        $scope.file_control.show_file_history = true;
    };
    //选择单个对比版本
    $scope.selectSingleVersion = function(version_num){
        var _curr_file_info = getCurrFileInfo();
        if(!_curr_file_info) return;
        $scope.curr_file_info = {
            file_size: _curr_file_info.file_size,
            file_update_time:  _curr_file_info.file_update_time,
            file_absolute_path: _curr_checked_tab === 1 ? _absolute_path : $scope.file_post_header.absolute_path,
            pkg_file_path:$scope.file_post_header.file_path,
            curr_version_num : $scope.file_post_header.version_num,
            compare_version_num: version_num
        };
        $scope.file_control.show_file_compare = true;
    };
    //文件比对-返回
    $scope.fileCompareReturn = function (is_add_file) {
        if($scope.curr_file_info.is_fold_compare){
            //返回到目录比对页面
            $("#fold-compare").removeClass('ng-hide').addClass('ng-show');
            //隐藏文件比对页面
            $scope.file_control.show_file_compare = false;
        }else{
            //返回全量流页面
            $scope.file_control.show_file_compare = false;
        }
        //单个历史查看
        if($scope.curr_file_info.is_single_detail){
            //隐藏文件比对页面
            $scope.file_control.show_file_compare = false;
            //单个历史查看
            $("#file-history").removeClass('ng-hide').addClass('ng-show');
        }
        if(!is_add_file){
            TempCompareData.clearList();
        }
    };
    //文件下载(download_type:1版本根目录 2目录 3 单个文件, 4批量下载, 5 包里的目录下载, 6包里的文件 7投产包文件)
    $scope.downloadFile = function (download_type) {
        if(!download_type) return;
        var _download_info,_batch_path;

        if(download_type === 1){
            _download_info = {
                file_absolute_path:$scope.version.file_absolute_path,
                is_dir:true,
            }
        }else if(download_type === 4){
            switch(_curr_checked_tab){
                case 1: _batch_path = $scope.pub_or_back_path ; break; /*+ "/pkg"*/
                case 2: _batch_path = $scope.pub_or_back_path; break;  /*+ "/config"*/
                case 3: _batch_path = $scope.pub_or_back_path; break;   /*+ "/list"*/
            }
            _download_info = {
                file_absolute_path:_batch_path,
                is_dir:true,
            }
        } else{
            var _curr_file_info = getCurrFileInfo();
            if(!_curr_file_info) return;
            if(download_type === 5 || download_type === 6){
                _download_info = {
                    file_absolute_path: _curr_file_info.file_path,  //包路径
                    is_dir: _curr_file_info.dir,
                    file_path:_curr_file_info.relate_path       //包里的路径
                };
            }else {
                _download_info = {
                    file_absolute_path: _curr_file_info.file_path + "/" + _curr_file_info.file,
                    is_dir: _curr_file_info.dir,
                };
            }
        }

        angular.extend(_download_info,{version_num: $scope.one_pub.version_num},{business_sys_name:_business_sys_name});
        $scope.control.download_loading = true;
        Version.downloadFile(_download_info).then(function(data){
            $timeout(function(){
                $scope.control.download_loading = false;
                if(data.download_url) CV.downloadFile(data.download_url);
            },0);
        },function(error){
            $scope.control.download_loading = false;
            Modal.alert(error.message)
        });
    };
    //下载包
    $scope.pacDownloadFile = function () {
        var _obj={
            file_absolute_path: _absolute_path,
            is_dir: false,
            version_num: $scope.one_pub.version_num,
            business_sys_name:_business_sys_name
        }
        $scope.control.download_loading = true;
        Version.downloadFile(_obj).then(function(data){
            $timeout(function(){
                $scope.control.download_loading = false;
                if(data.download_url) CV.downloadFile(data.download_url);
            },0);
        },function(error){
            $scope.control.download_loading = false;
            Modal.alert(error.message)
        });
    };
    //对比模式-批量下载(pub_flag,1 发布 2备份)
    $scope.batchDownloadFile = function(pub_flag){
        if(!pub_flag) return;
        var _down_info = {
            version_num: $scope.one_pub.version_num,
            business_sys_name:_business_sys_name,
            file_absolute_path:'',
            is_dir:true,
        };
        //投产包
        if(_curr_checked_tab === 1){
            if(pub_flag === 1){
                _down_info.file_absolute_path = $scope.version.file_absolute_path+'update/pkg/';
            }else{
                _down_info.file_absolute_path = $scope.version.file_absolute_path+'backup/'+$scope.compare_view_info.bak_ip+'/pkg/';
            }
        }
        //配置文件
        if(_curr_checked_tab === 2){
            if(pub_flag === 1){
                _down_info.file_absolute_path = $scope.version.file_absolute_path + "update" + "/config/" + $scope.ip_data.pub_config_ip;
            }else{
                _down_info.file_absolute_path = $scope.version.file_absolute_path + "backup" + "/" + $scope.ip_data.pub_config_ip + "/config";
            }
        }
        //清单
        if(_curr_checked_tab === 3){
            if(pub_flag === 1){
                _down_info.file_absolute_path = $scope.version.file_absolute_path + "update" + "/list";
            }else{
                _down_info.file_absolute_path = $scope.version.file_absolute_path + "backup" + "/" + $scope.ip_data.back_manifet_ip + "/list";
            }
        }
        Version.downloadFile(_down_info).then(function(data){
            $timeout(function(){
                if(data.download_url) CV.downloadFile(data.download_url);
            },0);
        },function(error){
            Modal.alert(error.message)
        });
    };
    //文件历史查看-返回
    $scope.fileHistoryReturn = function () {
        $scope.file_control.show_file_history = false;
    };
    //左侧滚动条鼠标事件
    $scope.leftScrollBarMouseover = function(){
        _curr_scroll_bar = 0;
    };
    //右侧滚动条鼠标事件
    $scope.rightScrollBarMouseover = function(){
        _curr_scroll_bar = 1;
    };
    //单个历史查看-文件数据
    $scope.$on("compareFile", function(e, m) {
        $scope.curr_file_info = m;
    });
    //状态改变清除文件比对临时数据
    $rootScope.$on('$stateChangeSuccess',function(){
        TempCompareData.clearList();
    });
    init();
}]);

/**
 * 全量流列表
 * **/
versionCtrl.controller('fullStreamListCtrl',["$scope", "$timeout", "$state", "$rootScope", "$interval", "Version", "Modal", function($scope, $timeout, $state, $rootScope, $interval, Version, Modal) {
   var _timer; //监控定时
    //页面信息
    $scope.info = {
        search_key_word: '', //搜索关键字
        full_stream_list: [] //全量流列表
    };
    //页面控制
    $scope.control = {
        loading : false, //页面加载
        refresh : false, //是否刷新列表
    };
    //是否刷新列表
    var judgeRefreshList = function(list){
        var _update = false;
        for(var i = 0; i < list.length; i++){
            if(list[i].version_status == 4){
                _update = true;
               break;
            }
        }
        return _update;
    };
    //获取全量流列表
    var getFullStreamList = function(){
        Version.getStreamListByKey($scope.info.search_key_word, 1).then(function (data) {
            if (data) {
                $timeout(function () {
                    $scope.control.loading = false;
                    $scope.info.full_stream_list = data.vsVersion_list || [];
                    $scope.control.refresh=judgeRefreshList($scope.info.full_stream_list);
                }, 0)
            }
        }, function (error) {
            Modal.alert(error.message);
            $scope.control.loading = false;
        });
        $scope.control.refresh = judgeRefreshList($scope.info.full_stream_list);
    };
    var init = function () {
        $scope.control.loading = true;
        getFullStreamList();
        //定时监控
        _timer = $interval(function () {
            if($scope.control.refresh){
                getFullStreamList();
            }
        }, 5000);
    };
    //清除搜索关键字
    $scope.clearKeyWord = function () {
        $scope.info.search_key_word = "";
    };
    //根据关键字搜索相应数据
    $scope.searchByKeyword = function () {
        $scope.control.loading = true;
        Version.getStreamListByKey($scope.info.search_key_word, 1).then(function (data) {
            $timeout(function () {
                $scope.control.loading = false;
                $scope.info.full_stream_list = data.vsVersion_list || [];
            }, 0)
        }, function (error) {
            $scope.control.loading = false;
            Modal.alert(error.message);
        })
    };
    //跳转到全量流查看
    $scope.goFullStreamDetail = function (version){
        if(version.vsversion_id){
            $state.go('version_full_stream_detail',{sys_name: version.business_sys_name,version_id: version.vsversion_id});
        } else{
            $state.go('version_new',{sys_name: version.business_sys_name,sys_cn_name: version.business_cn_name});
        }
    };
    //阻止默认事件
    $scope.stopPrevent =function (event) {
        event.stopPropagation();
    };
    $rootScope.$on('$stateChangeSuccess',function(){
        $timeout(function(){
            $interval.cancel(_timer);
        },1000);
    });
    init();
}]);

/**
 *  全量流查看
 *  **/
versionCtrl.controller('fullStreamDetailCtrl',["$scope", "$timeout", "$stateParams", "$rootScope", "$cookieStore", "$state", "$interval", "Monitor", "Plan","Version","VersionStatus", "CodeMirrorOption", "ReleaseFileType", "TempCompareData", "ScrollBarConfig", "Modal", "CV", function($scope, $timeout, $stateParams, $rootScope, $cookieStore, $state, $interval, Monitor, Plan,Version,VersionStatus, CodeMirrorOption, ReleaseFileType, TempCompareData, ScrollBarConfig, Modal, CV) {
    var _version_id = $stateParams.version_id;      //版本号
    var _business_sys_name = $stateParams.sys_name; //系统名
    var _encoding = "";//文件编码方式
    var _full_flow_data = []; //全量流数据
    //页面配置
    $scope.config = {
        scroll_config: ScrollBarConfig.Y(),
        scroll_xy_config: ScrollBarConfig.XY()
    };
    //查看文件配置
    $scope.detailFileOptions = CodeMirrorOption.Properties(true);

    //初始化数据
    var initData = function(){
       //版本信息
        $scope.version =  {
            compare_path: '',      //比对路径
            compare_ver_num:'',    //比对版本号
            one_pub: {},           //当前版本基本信息
            version_list: [],      //版本数据
            search_file_word: '',  //搜索文件关键字
            file_absolute_path: '',//文件根路径,
            version_type:1,        //版本类型（1全量 2发布）
        };
        //目录文件搜索
        $scope.search_info = {
            search_list: []       //搜索出的文件列表
        };
        //文件树节点
        $scope.file_nodes = {
            loading: false,
            nodes: [],
            curr_fold_path: '',   //当前点击文件夹路径
            curr_file: {}         //当前点击文件
        };
        //页面控制
        $scope.control = {
            show_version_flag: false,      //显示版本比对列表标志
            loading: false,                //加载
            show_fold_compare: false,      //显示目录比对
            fold_show_compare_flag: false, //显示目录比对的版本列表
            search_mode_flag: false,       //目录文件搜索（true显示搜索列表）
            download_loading : false       //文件下载加载
        };
       //文件查看控制
        $scope.file_control = {
            refresh : false,
            un_view : false,
            show_file:false,
            file_loading:false,
            show_file_history:false,
            codemethod_loading:false,
            show_file_compare:false,
        };
        //当前文件的信息
        $scope.curr_file_info = {
            file_size: "",
            file_update_time:  "",
            file_absolute_path:"",
            curr_version_num :"",
            compare_version_num: ""
        };
        //查看文件信息
        $scope.file_info = {
            file_content :"",
            file_type    :"",
            file_size    :"",
            file_name    :'',
            file_update_time:'',
            error_msg    :'',
            version_num  :''
        };
        //查看文件内容-请求头
        $scope.file_post_header = {
            business_sys_name: _business_sys_name,
            version_num:'',
            version_soc_name:'',
            absolute_path:'',
            encoding_type:'UTF-8',
            version_type:1 //1全量 2发布
        };
    };
    //查找版本索引
    var findVersionIndex = function(version_id){
        var _index = 0;
        for(var i = 0; i < _full_flow_data.length; i++){
            if(version_id === _full_flow_data[i].vsversion_id){
                _index = i;
                break;
            }
        }
        return _index;
    };
    //处理版本号列表
    var configVersionList = function (version_list,curr_index) {
        version_list = version_list || [];
        var _new_ver_list = [];
        //处理版本号
        angular.forEach(version_list,function(item,index){
            if(curr_index !== index){
                if(index === curr_index +1){
                    _new_ver_list.unshift({
                        version_num:item.version_num,
                        version_view: "与前版本比对",
                    })
                }else if((index === curr_index -1) && index !== 0){
                    _new_ver_list.unshift({
                        version_num:item.version_num,
                        version_view: "与后版本比对",
                    })
                }else if (index !==0){
                    _new_ver_list.push({
                        version_num:item.version_num,
                        version_view:item.version_num,
                    });
                }
            }
        });
        //最新版本
        if(version_list.length && curr_index !==0){
            _new_ver_list.unshift({
                version_num:version_list[0].version_num,
                version_view: "与最新版本比对",
            })
        }
        return _new_ver_list;
    };
    //根据文件类型切换代码高亮
    var changeCodeHighlight = function(file_type){
        if(!file_type) return;
        if(file_type === 5) $scope.detailFileOptions = CodeMirrorOption.Sh(true);
        if(file_type === 14) $scope.detailFileOptions = CodeMirrorOption.Sql(true);
        if(file_type === 15) $scope.detailFileOptions = CodeMirrorOption.Python(true);
        if(file_type === 16) $scope.detailFileOptions = CodeMirrorOption.Java(true);
    };
    //查询文件信息
    var getFileContent = function(){
        var _content_loading = $scope.file_control.codemethod_loading;
        $scope.file_control.file_loading = !_content_loading;
        if(!_content_loading) $scope.file_info.file_content = "";
        //当前文件路径(绝对路径)
        $scope.file_post_header.absolute_path =  $scope.file_nodes.curr_file.file_path + "/" + $scope.file_nodes.curr_file.file;
        Version.viewfileContent($scope.file_post_header).then(function(data){
            $scope.file_info.file_content = data.file_content ? Base64.decode(data.file_content).trim() : '';
            $scope.file_info.file_size = data.file_size ? data.file_size : '';
            $scope.file_info.file_update_time = data.file_update_time ? data.file_update_time : '';
            $scope.file_control.file_loading = false;
            $scope.file_control.codemethod_loading = false;
            $scope.file_control.refresh = true;
            $scope.file_info.error_msg = '';
        },function (error) {
            $scope.file_control.file_loading = false;
            $scope.file_control.codemethod_loading = false;
            $scope.file_info.error_msg = error.message;
        });
    };
    var init = function () {
        initData();
        Version.getOnePub(_version_id).then(function (data) {
            if (data) {
                $timeout(function () {
                    $scope.control.loading = false;
                    $scope.one_pub = data.vsInfoDetailbean;
                    $scope.version.file_absolute_path = data.vsInfoDetailbean.remote_path ? data.vsInfoDetailbean.remote_path.substring(0, data.vsInfoDetailbean.remote_path.lastIndexOf('/')) : "";
                    $scope.one_pub.v_status_cn = CV.findValue(data.vsInfoDetailbean.version_status, VersionStatus);
                    //版本数据
                    $scope.version.version_list = configVersionList(data.compare_version_list,0);
                    //文件查看
                    $scope.file_info.version_num = data.vsInfoDetailbean.version_num;
                    $scope.file_post_header.version_num = data.vsInfoDetailbean.version_num;
                }, 0)
            }
        }, function (error) {
            $state.go('version_full_stream_list');
            Modal.alert(error.message);
        });
        //左侧全量流-流程数据
        $scope.goData = {
            nodeDataArray: [],
            linkDataArray: []
        };
        Version.getflowData(_business_sys_name).then(function (data) {
            var _goNodeKey = 0;
            var _linkMidDataFull = [];
            var _linkMidDataPub = [];
            _full_flow_data = data.full_data ? data.full_data : [];
            $scope.goData.nodeDataArray.push({
                key: -1,
                isGroup: true,
                category: "OfGroups",
                color: "#FC9E22",
                data: "全量流",
            });
            $scope.goData.nodeDataArray.push({
                key: -2,
                isGroup: true,
                category: "OfGroups",
                color: "#44dcfd",
                data: "发布流",
            });
            var _pub_length = data.publish_data ? data.publish_data.length : 0;
            var _full_length = data.full_data ? data.full_data.length : 0;
            var _length = _full_length > _pub_length ? _full_length : _pub_length;
            $scope.linkLength = _length * 120 + 80;
            for (var i = 0; i < _full_length; i++) {
                var _node = data.full_data[i];
                $scope.goData.nodeDataArray.push({
                    key: _goNodeKey,
                    isGroup: true,
                    category: "OfNodes",
                    group: -1,
                    date_time: _node.date_time.replace(/-/g, '.').substring(0, 16),
                    version_number: _node.full_version_number,
                    proj_cn_name: '',
                });
                _goNodeKey++;
                $scope.goData.nodeDataArray.push({
                    key: _goNodeKey,
                    isGroup: false,
                    category: "node",
                    group: _goNodeKey - 1,
                    color: "#FC9E22",
                    select: i == 0 ? true : false,
                    pid: _node.pid,
                    vsversion_id: _node.vsversion_id,
                });
                _linkMidDataFull.push({
                    key: _goNodeKey, pid: _node.pid, vsversion_id: _node.vsversion_id
                })
                _goNodeKey++;

            };
            for (var k = 0; k < _pub_length; k++) {
                var _pub_node = data.publish_data[k];
                $scope.goData.nodeDataArray.push({
                    key: _goNodeKey,
                    isGroup: true,
                    category: "OfNodes",
                    group: -2,
                    date_time: _pub_node.date_time.replace(/-/g, '.').substring(0, 16),
                    version_number: _pub_node.publish_version_number,
                    proj_cn_name: _pub_node.proj_cn_name,
                });
                _goNodeKey++;
                $scope.goData.nodeDataArray.push({
                    key: _goNodeKey,
                    isGroup: false,
                    category: "node",
                    group: _goNodeKey - 1,
                    color: "#44dcfd",
                    select: false,
                    pid: _pub_node.pid,
                    operasion_user_name: _pub_node.operasion_user_name,
                    proj_cn_name: _pub_node.proj_cn_name,
                    date_time: _pub_node.date_time.replace(/-/g, '.').substring(0, 16),
                    vsversion_id: _pub_node.vsversion_id,

                });
                _linkMidDataPub.push({
                    key: _goNodeKey, pid: _pub_node.pid, vsversion_id: _pub_node.vsversion_id
                });
                _goNodeKey++;
            }
            //连线
            for (var l = 0; l < _linkMidDataPub.length; l++) {
                var _pub_stream = _linkMidDataPub[l];
                for (var m = 0; m < _linkMidDataFull.length; m++) {
                    var _full_stream = _linkMidDataFull[m];
                    if (_pub_stream.pid == _full_stream.vsversion_id) {
                        $scope.goData.linkDataArray.push({from: _pub_stream.key, to: _full_stream.key});
                    }
                    if (_pub_stream.vsversion_id == _full_stream.pid) {
                        $scope.goData.linkDataArray.push({to: _pub_stream.key, from: _full_stream.key});
                    }
                }
            }
        }, function (error) {
            Modal.alert(error.message);
        })
    };

    //返回全量流列表
    $scope.backFullStreamList = function () {
        $state.go('version_full_stream_list');
        //清空文件对比的临时数据
        TempCompareData.clearList();
    };
    //显示版本比对列表
    $scope.showVersionList = function () {
        $scope.control.show_version_flag = !$scope.control.show_version_flag;
    };
    //切换版本
    $scope.changeVersion =function (versionId) {
        var _index = findVersionIndex(versionId);

        $scope.control.change_version_loading = true;
        TempCompareData.clearList(); //清空文件比对临时数据

        Version.getOnePub(versionId).then(function (data) {
            if (data) {
                $timeout(function () {
                    initData();
                    $scope.one_pub = data.vsInfoDetailbean;
                    $scope.version.file_absolute_path = data.vsInfoDetailbean.remote_path ? data.vsInfoDetailbean.remote_path.substring(0, data.vsInfoDetailbean.remote_path.lastIndexOf('/')) : "";
                    $scope.one_pub.v_status_cn = CV.findValue(data.vsInfoDetailbean.version_status, VersionStatus);
                    //版本数据
                    $scope.version.version_list = configVersionList(data.compare_version_list,_index);
                    //文件查看
                    $scope.file_info.version_num = data.vsInfoDetailbean.version_num;
                    $scope.file_post_header.version_num = data.vsInfoDetailbean.version_num;
                    $scope.control.change_version_loading = false;
                }, 0)
            }
        }, function (error) {
            $scope.control.change_version_loading = false;
            Modal.alert(error.message);
        })
    }
    //获取根目录文件
    $scope.getRootFile =function () {
            $scope.file_nodes.curr_fold_path = $scope.file_nodes.curr_fold_path ? $scope.file_nodes.curr_fold_path : $scope.version.file_absolute_path;
            return   Version.getFoldTree($scope.file_nodes.curr_fold_path).then(function (data) {
                        $scope.file_nodes.curr_file= data.file_bean ? data.file_bean :{};
                        return  data.file_list ? data.file_list :[];
                    },function (error) {
                        return error;
                    })
    };
    //搜索目录中文件
    $scope.searchFile = function (){
        $scope.search_info.search_list=[];
        //有关键字进行搜索
        if($scope.version.search_file_word){
            $scope.control.search_mode_flag=true;
            $scope.search_info.loading = true;
            Version.searchFile($scope.version.file_absolute_path,$scope.version.search_file_word).then(function (data) {
                $scope.search_info.search_list=data.file_list ? data.file_list :[];
                $scope.search_info.loading = false;
            },function (error) {
                Modal.alert(error.message);
            })
        }else {//没有关键字返回目录
            $scope.control.search_mode_flag = true;
            $timeout(function () {
                $scope.control.search_mode_flag=false;
            },0);
            $scope.file_nodes.curr_fold_path = $scope.version.file_absolute_path;
        }
    };
    //搜索出文件，点击文件路径显示所在目录
    $scope.getDetailFold = function (path) {
        $scope.search_info.search_list=[];
        $scope.control.search_mode_flag=false;
        $scope.file_nodes.curr_fold_path = path;
    };
    //显示目录对比列表
    $scope.showFoldCompareList = function () {
       $scope.control.fold_show_compare_flag=!$scope.control.fold_show_compare_flag;
    };
    //目录比对
    $scope.startFoldCompare = function (bool,_version) {
        $scope.control.version_flag =false;     //版本比对标志
        if(bool){
            $scope.version.compare_ver_num =_version.version_num;//比对版本号
            $scope.version.compare_path =$scope.file_nodes.curr_fold_path.replace($scope.file_info.version_num,_version.version_num);   //比对路径
            $scope.control.show_version_flag = false;   //版本比对列表隐藏
        }
        $scope.control.show_fold_compare = bool;        //显示比对
        $scope.control.fold_show_compare_flag=false;    //目录比对版本列表隐藏
    };
    //版本之间比对
    $scope.comparePubVersion = function (bool,_version) {
        $scope.control.version_flag =true; //版本比对标志
        if(bool){
            $scope.version.compare_ver_num =_version.version_num;
            $scope.version.compare_path =$scope.version.file_absolute_path.replace($scope.file_info.version_num,_version.version_num);
        }
        $scope.control.show_fold_compare = bool;
        $scope.control.show_version_flag=false;
        $scope.control.fold_show_compare_flag=false;
    };
    //格式化文件图标
    $scope.formatFileIconStyle = function(){
        var class_name = '';
        if($scope.file_info.file_type == 1){
            class_name = 'txt-icon';
        }else if($scope.file_info.file_type == 2 || $scope.file_info.file_type == 3){
            class_name = 'excel-icon';
        }
        return class_name;
    };
    //获取文件内容(点击单个文件)
    $scope.getFileContent = function(search_info){
        if(search_info){
            var _search_file_type = search_info.file.lastIndexOf('.')==-1 ? 0 :CV.findKey(search_info.file.substring(search_info.file.lastIndexOf('.')+1),ReleaseFileType);
            $scope.file_nodes.curr_file ={
                file_path:search_info.file_path,
                relate_path:search_info.relate_path,
                file:search_info.file,
                file_type:_search_file_type,
                dir:false,
                modify_time:''
            };
        }
        var _file_type = $scope.file_nodes.curr_file.file_type;
        $scope.file_info.file_type = _file_type;
        $scope.file_control.has_file_icon = _file_type >= 1 && _file_type < 4;
        $scope.file_control.is_excel = (_file_type == 2 || _file_type == 3);
        $scope.file_control.un_view = (_file_type > 8 && _file_type < 14) || $scope.file_control.is_excel;
        $scope.file_control.show_file = (!_file_type || (_file_type && !(_file_type > 8 && _file_type < 14 ))) && ($scope.file_nodes.curr_file && !$scope.file_nodes.curr_file.dir);
        changeCodeHighlight(_file_type);
        if(!$scope.file_nodes.curr_file.dir && ( _file_type < 9 || _file_type > 13 || angular.isUndefined(_file_type))){
            $scope.file_info.file_name = $scope.file_nodes.curr_file.file || '';
            getFileContent();
        }
    };
    //全屏查看
    $scope.fullScreen = function(){
        Modal.fileContentFullScreen($scope.file_info,$scope.file_post_header,_business_sys_name);
    };
    //查看文件历史信息
    $scope.viewHistory = function (version_type){
        $scope.file_control.show_file_history = true;
        //构造数据(子控制器使用)
        $scope.file_header = {
                file_path: $scope.file_nodes.curr_file.file_path,
                file_name: $scope.file_nodes.curr_file.file,
                file_type:  $scope.file_info.file_type,
                version_soc_name: $scope.file_post_header.version_soc_name,
                version_num:  $scope.file_post_header.version_num,
                busisys_name: $scope.one_pub.business_sys_name,
                version_type:  version_type,
        };
    };
    //切换编码方式
    $scope.changeCodeMethod = function(){
        _encoding = $scope.file_post_header.encoding_type;
        if(_encoding === 'UTF-8'){
            $scope.file_post_header.encoding_type = 'GBK';
        }else{
            $scope.file_post_header.encoding_type = 'UTF-8';
        }
        $scope.file_control.codemethod_loading = true;
        getFileContent();
    };
    //选择单个对比版本
    $scope.selectSingleVersion = function(version_num){
        $scope.file_control.show_file_compare = true;
        $scope.curr_file_info = {
            file_size: $scope.file_info.file_size,
            file_update_time:  $scope.file_info.file_update_time,
            file_absolute_path:$scope.file_post_header.absolute_path,
            curr_version_num : $scope.file_post_header.version_num,
            compare_version_num: version_num
        }
    };
    //文件比对-返回
    $scope.fileCompareReturn = function (is_add_file) {
        if($scope.curr_file_info.is_fold_compare){
            //返回到目录比对页面
            $("#fold-compare").removeClass('ng-hide').addClass('ng-show');
            //隐藏文件比对页面
            $scope.file_control.show_file_compare = false;
        }else{
            //返回全量流页面
            $scope.file_control.show_file_compare = false;
        }
        //单个历史查看
        if($scope.curr_file_info.is_single_detail){
            //隐藏文件比对页面
            $scope.file_control.show_file_compare = false;
            //单个历史查看
            $("#file-history").removeClass('ng-hide').addClass('ng-show');
        }
        if(!is_add_file){
            TempCompareData.clearList();
        }
    };
    //文件下载(download_type:1版本根目录 2目录 3 文件)
    $scope.downloadFile = function (download_type) {
        if(!download_type) return;
        var _download_info = null;
        if(download_type === 1){
            _download_info = {
                file_absolute_path:$scope.version.file_absolute_path,
                is_dir:true,
            }
        }else{
            _download_info = {
                file_absolute_path: $scope.file_nodes.curr_file.file_path + "/" +$scope.file_nodes.curr_file.file,
                is_dir:$scope.file_nodes.curr_file.dir,
            }
        }
        angular.extend(_download_info,{version_num: $scope.one_pub.version_num},{business_sys_name:_business_sys_name});
        $scope.control.download_loading = true;
        Version.downloadFile(_download_info).then(function(data){
            $timeout(function(){
                $scope.control.download_loading = false;
                if(data.download_url) CV.downloadFile(data.download_url);
            },0);
        },function(error){
            $scope.control.download_loading = false;
            Modal.alert(error.message)
        });
    };
    //文件历史查看-返回
    $scope.fileHistoryReturn = function () {
        $scope.file_control.show_file_history = false;
    };
    //目录比对-文件数据
    $scope.$on("compareFile", function(e, m) {
        $scope.curr_file_info = m;
    });
    //路由改变清除文件比对临时数据
    $rootScope.$on('$stateChangeSuccess',function(){
        TempCompareData.clearList();
    });
    //阻止冒泡事件
    $scope.stopPrevent =function (event) {
        event.stopPropagation();
    };
    init();
}]);

/**
 * 单个文件历史查看
 * **/
versionCtrl.controller('viewFileHistoryCtrl',["$scope", "$timeout", "$stateParams", "$cookieStore", "$rootScope", "$state", "$interval", "CodeMirrorOption", "Version", "Modal", "CV", function($scope, $timeout, $stateParams, $cookieStore, $rootScope, $state, $interval, CodeMirrorOption, Version, Modal, CV) {
    var _encoding; //编码方式
    var _post_header  = $scope.file_header ? $scope.file_header : {}; //父控制器数据
    var _version_num  = _post_header.version_num ? _post_header.version_num : 1; //当前版本号
    var _business_sys_name = _post_header.busisys_name ? _post_header.busisys_name : ''; //系统名
    $scope.detailFileOptions = CodeMirrorOption.Properties(true); //文件查看配置

    //文件控制
    $scope.file_control = {
        refresh : false,
        codemethod_loading:false,
        has_file_icon:_post_header.file_type >= 1 && _post_header.file_type < 4,
        version_loading:true,
        version_err_msg:'',
        version_loading_msg:'',
        curr_index:0, //查看版本的当前索引
    };
    //文件信息
    $scope.file_info = {
        file_content :"",
        file_size    :"",
        file_update_time:'',
        file_type    :_post_header.file_type,
        file_name    :_post_header.file_name,
        version_num  :_post_header.version_num,
        error_msg    :'',
    };
    //版本信息
    $scope.version_info = {
        version_type: _post_header.version_type, //1全量 2发布
        business_sys_name: _post_header.busisys_name, //应用系统名
        version_num:_post_header.version_num,
        file_path: _post_header.pkg_file_path ? _post_header.file_path : _post_header.file_path + "/" + _post_header.file_name,
        file_name:_post_header.file_name,
    };
    //页面表格数据
    $scope.data = {
        version_list:[],
        compare_version_list:[]
    };
    //查看文件请求参数
    $scope.file_post_header = {
        version_num: _post_header.version_num,
        business_sys_name: _business_sys_name,
        absolute_path: _post_header.pkg_file_path ? _post_header.file_path : _post_header.file_path + "/" + _post_header.file_name,
        encoding_type:'UTF-8',
        version_type: _post_header.view_file_flag, //查看文件的标志(2压缩包里面的文件 1普通文件)
        file_path:_post_header.pkg_file_path ? _post_header.pkg_file_path : '', //压缩包里面的文件路径
    };

    //处理比对版本号列表
    var handleCompareVersionList = function(curr_index){
        //处理版本号
        $scope.data.compare_version_list = [];
        angular.forEach($scope.data.version_list,function(item,index){
            if(curr_index !== index){
                if(index === curr_index +1){
                    $scope.data.compare_version_list.unshift({
                        version_num:item.version_num,
                        version_cn: "与前版本比对",
                    })
                }else if((index === curr_index -1) && index !== 0){
                    $scope.data.compare_version_list.unshift({
                        version_num:item.version_num,
                        version_cn: "与后版本比对",
                    })
                }else if(index !==0){
                    $scope.data.compare_version_list.push({
                        version_num:item.version_num,
                        version_cn: item.version_num,
                    });
                }
            }
        });
        //最新版本
        if($scope.data.version_list.length && curr_index !==0){
            $scope.data.compare_version_list.unshift({
                version_num:$scope.data.version_list[0].version_num,
                version_cn: "与最新版本比对",
            })
        }
    };
    //查询文件变更的信息
    var getFileContentByVersion = function(old_index,is_init){
        var _old_version = $scope.data.version_list[old_index].version_num;
        $scope.file_post_header.absolute_path = $scope.file_post_header.absolute_path.replace(_old_version,_version_num);
        $scope.file_post_header.version_num = _version_num;
        $scope.file_info.error_msg = "";
        $scope.file_control.codemethod_loading = true;
        Version.viewfileContent($scope.file_post_header).then(function(data){
            $scope.file_info.file_content  = data.file_content ? Base64.decode(data.file_content).trim() : '';
            $scope.file_info.file_size = data.file_size ? data.file_size : '';
            $scope.file_info.file_update_time = data.file_update_time ? data.file_update_time : '';
            $scope.file_control.refresh = true;
            $scope.file_control.codemethod_loading = false;
            if(is_init) resizeCodeHeight();
        },function (error) {
            $scope.file_control.codemethod_loading = false;
            $scope.file_info.error_msg = error.message;
        });
    };
    //重置左侧版本区域高度
    var resizeVersionHeight = function () {
        var _version_ele = $(".file-history .left");
        if(_version_ele.is(":visible")){
            var _version_height = $(window).height() - parseInt(_version_ele.offset().top) - 15;
            _version_ele.height(_version_height);
        }
    };
    //重置codemirror高度
    var resizeCodeHeight = function () {
        var _code_ele = $(".file-history .CodeMirror");
        if(_code_ele.is(':visible') && _code_ele.offset()){
            var _codemirror_height = $(window).height() - parseInt(_code_ele.offset().top) - 15;
            _code_ele.height(_codemirror_height);
        }
    };
    var init = function () {
        var _file_name = _post_header.file_name ? _post_header.file_name : '';
        $scope.file_control.version_loading_msg =_file_name ? "正在获取文件 [" + _file_name + "] 历史版本 ..." : '正在获取文件历史版本 ...';
        //查询所有文件变更的版本号
        Version.getUpdatefileVersionNum($scope.version_info).then(function(data){
            $timeout(function(){
                $scope.file_control.version_loading = false;
                $scope.data.version_list = data.version_list ? data.version_list : [];
                if($scope.data.version_list.length !== 0){
                    $scope.data.version_list[0].active = true;
                    handleCompareVersionList(0);
                    getFileContentByVersion(0,true);
                    resizeVersionHeight();
                }
            },0)
        },function (error) {
            $scope.file_control.version_loading = false;
            $scope.file_control.version_err_msg = error.message;
        });
    };
    //选择单个(历史)比对版本
    $scope.selectHisVersion = function(version_num){
        var _curr_file_info = {
            file_size: $scope.file_info.file_size,
            file_update_time:  $scope.file_info.file_update_time,
            file_absolute_path:$scope.file_post_header.absolute_path,
            pkg_file_path:$scope.file_post_header.file_path,
            curr_version_num : $scope.file_post_header.version_num,
            compare_version_num: version_num,
            is_single_detail:true,
        };
        $scope.$emit("compareFile", _curr_file_info);

        //隐藏当前页面
        $("#file-history").addClass('ng-hide').removeClass('ng-show');
        //显示文件比对页面
        $scope.$parent.file_control.show_file_compare = true;
    };
    //切换版本类型
    $scope.changeVersion = function(index){
        var _last_index = $scope.file_control.curr_index;
        if(index === _last_index) return;
        $scope.data.version_list[_last_index].active = false;       //关闭上一个TAB(第一次不关闭)
        $scope.data.version_list[index].active = true;              //激活当前
        $scope.file_control.curr_index = index;                     //赋当前TAB下标
        _version_num = $scope.data.version_list[index].version_num; //赋当前版本号
        getFileContentByVersion(_last_index);
        handleCompareVersionList(index);
    };
    //切换编码方式
    $scope.changeCodeMethod = function(){
        _encoding = $scope.file_post_header.encoding_type;
        if(_encoding === 'UTF-8'){
            $scope.file_post_header.encoding_type = 'GBK';
        }
        if(_encoding === 'GBK'){
            $scope.file_post_header.encoding_type = 'UTF-8';
        }
        getFileContentByVersion($scope.file_control.curr_index);
    };
    //全屏查看
    $scope.fullScreen = function(){
        Modal.fileContentFullScreen($scope.file_info,$scope.file_post_header,_business_sys_name);
    };
    //文件下载
    $scope.downloadSingleFile = function () {
        var _download_info = {
            file_absolute_path: $scope.file_post_header.absolute_path.replace(_post_header.version_num,_version_num),
            business_sys_name:_business_sys_name,
            version_num:_version_num,
            is_dir:false,
        };
        Version.downloadFile(_download_info).then(function(data){
            $timeout(function(){
                if(data.download_url) CV.downloadFile(data.download_url);
            },0);
        },function(error){
            Modal.alert(error.message)
        });
    };
    //窗口变化
    $(window).resize(function(){
        $timeout(function(){
            resizeCodeHeight();
            resizeVersionHeight();
        },100);
    });
    init();
}]);

/**
 * 文件比对
 * **/
versionCtrl.controller('viewFileCompareCtrl',["$scope", "$timeout", "$stateParams", "$rootScope", "$state", "$interval", "CodeMirrorOption", "Version", "ReleaseFileType", "TempCompareData", "Modal", "CV", function($scope, $timeout, $stateParams, $rootScope, $state, $interval, CodeMirrorOption, Version, ReleaseFileType, TempCompareData, Modal, CV) {
    var _exist_index = -1,_curr_active_index = -1;
    var _left_editor,_right_editor;
    var _encoding=$scope.curr_file_info.encoding_type;
    var _old_version_num = $scope.curr_file_info.compare_version_num;

    //匹配<td></td>之间的内容
    var _reg_td = /<td.*?>(.*?)<\/td>/g;
    //过滤行号(匹配比对内容)
    var _reg_data_td = /<td nowrap="nowrap">(.*?)<\/td>/g;
    //匹配不同的行
    var _diff_reg = /("diff_next")|("diff_header")/g;

    //获取父控制器数据
    $scope.compare_info ={
        file_name:"", //文件名
        file_size: $scope.curr_file_info.file_size, //文件大小
        file_update_time:  $scope.curr_file_info.file_update_time,   //文件更新时间
        file_absolute_path:$scope.curr_file_info.file_absolute_path, //发布流-文件绝对路径
        full_absolute_path:$scope.curr_file_info.full_absolute_path ? $scope.curr_file_info.full_absolute_path : '', //全量流文件-绝对路径
        compare_full_type: $scope.curr_file_info.compare_full_type  ? $scope.curr_file_info.compare_full_type : 1, //1发布和发布比对 2发布与全量比对
        encoding_type:$scope.curr_file_info.encoding_type ? $scope.curr_file_info.encoding_type : 'UTF-8', //编码方式
        compare_file_path:$scope.curr_file_info.compare_path, //备份版本-路径
        inner_file_path:$scope.curr_file_info.pkg_file_path,  //压缩包里的文件路径
        curr_version_num : $scope.curr_file_info.curr_version_num, //当前版本号
        compare_version_num:$scope.curr_file_info.compare_version_num, //比对版本号
        is_pre_pub_ver : $scope.$parent.control.pre_pub_flag, //预发布版本标志
        pre_pub_project : $scope.$parent.version.pre_project_name, //预发布项目名
        compare_path1 : $scope.curr_file_info.compare_path1 || '', //目录比对左侧路径
        compare_path2 : $scope.curr_file_info.compare_path2 || '', //目录比对右侧路径
        real_file_path:'',         //页面显示的实际文件路径
        compare_content_list: [],  //对比文件内容
        compare_update_time:'',   //对比文件变更时间
        compare_file_size:'',     //对比文件大小,
        compare_type:1,           //1全部 2变更,
        left_file_path:'',        //左侧文件路径
        right_file_path:''        //右侧文件路径
    };
    //文件内容字符串
    $scope.file_str = {
        left_str       : '',   //左侧文件内容字符串
        right_str      : '',   //右侧文件内容字符串
        left_all_str   : '',   //左侧比对内容字符串
        right_all_str  : '',   //右侧比对内容字符串
        left_chg_str   : '',   //左侧变更数据字符串
        right_chg_str  : '',   //右侧变革数据字符串
        left_table     : [],   //左侧临时数据列表
        right_table    : [],   //右侧临时数据列表
        left_chg_table : [],   //左侧变更临时数据列表
        right_chg_table: [],   //右侧变更临时数据列表
    };
    //所有版本号
    $scope.version_data = {
        version_list : [] //版本号列表
    };
    //临时数据
    $scope.temp_data = {
        compare_tab_list:[] //临时tab页比对数据
    };
    //获取所有版本号-请求信息
    $scope.get_all_version_header = {
        busisys_name : $scope.$parent.one_pub.business_sys_name,
        version_type:$scope.$parent.version.version_type,
    };
    //页面控制
    $scope.control = {
          left_loading   : false, //左侧数据加载
          right_loading  : false, //右侧数据加载
          has_file_icon  : false, //是否有文件图标(大图)
          is_init        : true,  //是否为初始化
          is_error       : false, //是否出错
          is_new_version : false, //最新版本
          left_error     : '',    //左侧文件出错信息
          right_error    : '',    //右侧文件出错信息
    };
    //Tab页控制
    $scope.tab_control = {
        cm_refresh : false
    };

    //处理对比信息
    var handleCompareInfo = function(tab){
        var compare_info;
        if(tab.is_pub_compare){
            //处理发布流-备份与发布对比
            compare_info = {
                file_path:tab.compare_info.file_absolute_path,
                compare_file_path:tab.compare_info.compare_file_path,
                inner_file_path:tab.compare_info.inner_file_path,
                encoding_type:tab.compare_info.encoding_type ? tab.compare_info.encoding_type : 'UTF-8',
            };
        }else{
            if(tab.compare_info.full_absolute_path){
                //处理发布与全量比对
                compare_info = {
                    file_path:tab.compare_info.file_absolute_path,
                    compare_file_path:tab.compare_info.full_absolute_path.replace(_old_version_num,tab.compare_info.compare_version_num).replace("pretags","fulltags"),
                    inner_file_path:tab.compare_info.inner_file_path,
                    compare_full_type:tab.compare_info.compare_full_type,
                    encoding_type:tab.compare_info.encoding_type ? tab.compare_info.encoding_type : 'UTF-8',
                };
            }else{
                //处理版本对比路径
                compare_info = {
                    file_path:tab.compare_info.file_absolute_path || tab.compare_info.compare_path1,
                    compare_full_type:tab.compare_info.compare_full_type,
                    compare_file_path: tab.compare_info.file_absolute_path ? tab.compare_info.file_absolute_path.replace(tab.compare_info.curr_version_num,tab.compare_info.compare_version_num).replace("pretags","pubtags") :
                                       tab.compare_info.compare_path2 ? tab.compare_info.compare_path2.replace(tab.compare_info.curr_version_num,tab.compare_info.compare_version_num).replace("pretags","pubtags") : '',
                    inner_file_path:tab.compare_info.inner_file_path,
                    encoding_type:tab.compare_info.encoding_type ? tab.compare_info.encoding_type : 'UTF-8',
                };
            }
        }

        tab.compare_info.left_file_path = compare_info.file_path ? compare_info.file_path : tab.compare_info.compare_path1;
        tab.compare_info.right_file_path = compare_info.compare_file_path ? compare_info.compare_file_path : tab.compare_info.compare_path2;

        return compare_info;
    };
    //获取文件比对内容
    var getFileCompareContent = function(init,tab){
        var compare_info = handleCompareInfo(tab);
        if(compare_info && (!compare_info.file_path || !compare_info.compare_file_path)){
            tab.control.left_loading = true;
            tab.control.right_loading = true;
            getSingleFileContent(tab,!compare_info.file_path,!compare_info.compare_file_path);
            return false;
        }

        tab.control.is_error = false;
        tab.control.right_error = "";

        tab.control.left_loading = true;
        tab.control.right_loading = true;
        Version.getFileCompareContent(compare_info).then(function(data){
            $timeout(function(){
                tab.compare_info.file_size = data.file_size ? data.file_size : '';
                tab.compare_info.file_update_time = data.file_update_time ? data.file_update_time : '';
                tab.compare_info.compare_file_size = data.compare_file_size ? data.compare_file_size : '';
                tab.compare_info.compare_update_time = data.compare_file_update_time ? data.compare_file_update_time : '';
                $scope.control.is_init = false;
                tab.file_str.left_table = [];
                tab.file_str.right_table = [];

                var _file_compare_str = data.diff_txt ? htmlDecode(Base64.decode(data.diff_txt)) : '';

                //分割一行
                tab.compare_info.compare_content_list = _file_compare_str ? _file_compare_str.split("\n") : [];

                //处理每一行
                tab.compare_info.compare_content_list.map(function(item,index,arr){
                    //不同行
                    if(_diff_reg.test(item)){
                        var _diff_text_list = item.match(_reg_data_td);
                        var _left_text = _diff_text_list[0] && _diff_text_list[0].replace(_reg_data_td,function(word){
                            return word.substring(word.indexOf(">")+1,word.lastIndexOf("<"));
                        });
                        var _right_text = _diff_text_list[1] && _diff_text_list[1].replace(_reg_data_td,function(word){
                            return word.substring(word.indexOf(">")+1,word.lastIndexOf("<"));
                        });
                        //处理左右数据
                        formatChangeData(_left_text,"left",tab);
                        formatChangeData(_right_text,"right",tab);
                    }else{
                        //相同的只有一个(取出,<td></td>之间的内容)
                        if(!_diff_reg.test(item)){
                            var _same_text_list = item.match(_reg_td);
                            var _text = _same_text_list[1] && _same_text_list[1].replace(_reg_td,function(word){
                                return  word.substring(word.indexOf(">")+1,word.lastIndexOf("<"));
                            }) + "\n";
                            tab.file_str.left_table.push(_text);
                            tab.file_str.right_table.push(_text);
                        }
                    }
                });
                $timeout(function(){
                    tab.file_str.left_all_str = tab.file_str.left_table.join("");
                    tab.file_str.left_str = tab.file_str.left_all_str.substring(0,tab.file_str.left_all_str.length-1);
                    tab.control.left_loading = false;
                },1000);
                $timeout(function(){
                    tab.file_str.right_all_str = tab.file_str.right_table.join("");
                    tab.file_str.right_str = tab.file_str.right_all_str.substring(0,tab.file_str.right_all_str.length-1);
                    tab.control.right_loading = false;
                },1500);
            },0);
        },function(error){
            $timeout(function(){
                tab.control.right_loading = false;
                tab.control.is_error = true;
                $scope.control.is_init = false;

                if(error.message.indexOf("不存在") > -1){
                    tab.file_str.right_str = "";
                    tab.control.right_error =  tab.compare_info.file_name ? "对比文件" + tab.compare_info.file_name + "不存在": '对比文件不存在' ;
                }else{
                    tab.control.right_error =  error.message;
                }

                //查看左侧文件内容
                tab.control.left_loading = true;
                getSingleFileContent(tab,false,true);
            },500);
        });
    };
    //初始版本数据
    var getVersionData = function(curr_tab){
        if(!curr_tab) return;
        if(curr_tab.compare_info.compare_full_type === 2){
            $scope.get_all_version_header.version_type = 1;//全量
        }
        //获取所有版本号
        Version.getfileVersionNum($scope.get_all_version_header).then(function(data){
            $timeout(function(){
                curr_tab.version_list = data.version_list ? data.version_list : [];
                for(var i = 0; i < curr_tab.version_list.length; i++){
                    var _version = curr_tab.version_list[i];
                    if(curr_tab.compare_info.curr_version_num === _version.version_num){
                        curr_tab.version_list.splice(i,1);
                        break;
                    }
                }
                if(curr_tab.version_list.length > 0){
                    curr_tab.control.is_new_version = curr_tab.compare_info.curr_version_num === curr_tab.version_list[0].version_num;
                }
            },0);
        },function(error){
            Modal.alert(error.message)
        });
        //获取文件比对内容
        getFileCompareContent(true,curr_tab);
    };

    //处理文件路径
    var handleFilePath = function(){
        var _file_name;

        //处理真实文件路径
        if($scope.compare_info.inner_file_path){
            $scope.compare_info.file_absolute_path = $scope.compare_info.file_absolute_path.endsWith("/") ?  $scope.compare_info.file_absolute_path :  $scope.compare_info.file_absolute_path + "/";
            $scope.compare_info.real_file_path = $scope.compare_info.file_absolute_path +  $scope.compare_info.inner_file_path;
            _file_name = $scope.compare_info.inner_file_path.substring($scope.compare_info.inner_file_path.lastIndexOf("/")+1,$scope.compare_info.inner_file_path.length);
        }else{
            $scope.compare_info.real_file_path = $scope.compare_info.file_absolute_path ? $scope.compare_info.file_absolute_path : $scope.compare_info.full_absolute_path ? $scope.compare_info.full_absolute_path : ($scope.compare_info.compare_file_path || $scope.compare_info.compare_path2);
            _file_name =  $scope.compare_info.real_file_path.substring($scope.compare_info.real_file_path.lastIndexOf("/")+1,$scope.compare_info.real_file_path.length);
        }

        $scope.compare_info.file_name = _file_name;
        $scope.compare_info.file_type = _file_name.lastIndexOf('.')==-1 ? 0 : CV.findKey(_file_name.substring(_file_name.lastIndexOf('.')+1),ReleaseFileType);
    };
    // html字符串反转义
    var htmlDecode = function(str){
        var new_str = "";
        if (str.length === 0) return "";
        new_str = str.replace(/&lt;/g, "<");
        new_str = new_str.replace(/&gt;/g, ">");
        new_str = new_str.replace(/&nbsp;/g, " ");
        new_str = new_str.replace(/&#39;/g, "\'");
        new_str = new_str.replace(/&quot;/g, "\"");
        new_str = new_str.replace(/<br>/g, "\n");
        return new_str;
    };
    //格式化变更数据
    var formatChangeData  = function(text,flag,tab){
        var _text = "";
        _text = text.replace(/<span class="diff_sub">(.*?)<\/span>/g,function(word){
            var _word = word.substring(word.indexOf(">")+1,word.lastIndexOf("<"));
            return _word !==" " ?  "ì" + _word + "ì" : "";
        }).replace(/<span class="diff_add">(.*?)<\/span>/g,function(word){
            var _word = word.substring(word.indexOf(">")+1,word.lastIndexOf("<"));
            return _word !==" " ? "í" + _word + "í" : "";
        }).replace(/<span class="diff_chg">(.*?)<\/span>/g,function(word){
            var _word = word.substring(word.indexOf(">")+1,word.lastIndexOf("<"));
            return _word !==" " ? "ī" + _word + "ī" : "";
        });
        if(flag === "left"){
            tab.file_str.left_table.push(_text +"\n");
        }
        if(flag === "right"){
            tab.file_str.right_table.push(_text + "\n");
        }
        if(flag === "left_chg"){
            tab.file_str.left_chg_table.push(_text +"\n");
        }
        if(flag === "right_chg"){
            tab.file_str.right_chg_table.push(_text + "\n");
        }
    };
    //文件比对背景处理
    var showBgHightlight = function(ele_id,timeout){
        if(!ele_id) return;
        timeout = timeout || 200;
        var _span_delete = $(ele_id + ' span.cm-compare-delete');
        var _span_add = $(ele_id + ' span.cm-compare-add');
        var _span_change = $(ele_id + ' span.cm-compare-change');
        $timeout(function(){
            if(_span_delete.length && _span_delete.is(":visible")){
                angular.forEach(_span_delete,function(item,index,array){
                    (/ì/g.test(item.innerHTML)) && (item.innerHTML = item.innerHTML.replace(/ì/g,""));
                });
            }
            if(_span_add.length && _span_add.is(":visible")){
                angular.forEach(_span_add,function(item,index,array){
                    (/í/g.test(item.innerHTML)) && (item.innerHTML = item.innerHTML.replace(/í/g,""));
                });
            }

            if(_span_change.length && _span_change.is(":visible")){
                angular.forEach(_span_change,function(item,index,array){
                    (/ī/g.test(item.innerHTML)) && (item.innerHTML = item.innerHTML.replace(/ī/g,""));
                });
            }
        },timeout);
    };
    //初始化对比背景
    var initBgHightlight = function(ele_id,timeout){
        timeout = timeout || 600;
        if(!ele_id) return;
        $timeout(function(){
            var _span_delete = $(ele_id + ' span.cm-compare-delete');
            var _span_add = $(ele_id + ' span.cm-compare-add');
            var _span_change = $(ele_id + ' span.cm-compare-change');

            angular.forEach(_span_delete,function(item,index,array){
                (/ì/g.test(item.innerHTML)) && (item.innerHTML = item.innerHTML.replace(/ì/g,""));
            });

            angular.forEach(_span_add,function(item,index,array){
                (/í/g.test(item.innerHTML)) && (item.innerHTML = item.innerHTML.replace(/í/g,""));
            });

            angular.forEach(_span_change,function(item,index,array){
                (/ī/g.test(item.innerHTML)) && (item.innerHTML = item.innerHTML.replace(/ī/g,""));
            });
        },timeout)
    };
    //文件比对滚动同步
    var syncScroll  = function(editor,cm_flag) {
        var cm = [_left_editor, _right_editor], scroll = [];

        for (var i = 0; i < cm.length; i++){
            var _scroll_info = cm[i].getScrollInfo();
            if(_scroll_info){
                scroll.push(cm[i].getScrollInfo().top);
            }
        }

        if(cm_flag === "left"){
            _right_editor.scrollTo(0, scroll[0]);
        }else{
            _left_editor.scrollTo(0, scroll[1]);
        }
    };
    //处理变更的数据
    var filterChangeData = function(tab){
        tab.control.left_loading = true;
        tab.control.right_loading = true;
        tab.file_str.right_str = "";
        tab.file_str.left_str = "";

        if(!tab.file_str.left_chg_str || !tab.file_str.right_chg_str){
            //处理不同的每一行
            tab.compare_info.compare_content_list.map(function(item,index,arr){
                //不同行
                if(_diff_reg.test(item)){
                    var _diff_text_list = item.match(_reg_data_td);
                    var _left_text = _diff_text_list[0] && _diff_text_list[0].replace(_reg_data_td,function(word){
                        return word.substring(word.indexOf(">")+1,word.lastIndexOf("<"));
                    });
                    var _right_text = _diff_text_list[1] && _diff_text_list[1].replace(_reg_data_td,function(word){
                        return word.substring(word.indexOf(">")+1,word.lastIndexOf("<"));
                    });
                    //处理左右数据
                    formatChangeData(_left_text,"left_chg",tab);
                    formatChangeData(_right_text,"right_chg",tab);
                }
            });
        }

        $timeout(function(){
            !tab.file_str.left_chg_str && (tab.file_str.left_chg_str = tab.file_str.left_chg_table.join(""));
            tab.file_str.left_str = tab.file_str.left_chg_str.substring(0,tab.file_str.left_chg_str.length-1);
            tab.control.left_loading = false;
            if(tab.file_str.left_str) initBgHightlight("#file-left");
        },500);
        $timeout(function(){
            !tab.file_str.right_chg_str && (tab.file_str.right_chg_str = tab.file_str.right_chg_table.join(""));
            tab.file_str.right_str = tab.file_str.right_chg_str.substring(0,tab.file_str.right_chg_str.length-1);
            tab.control.right_loading = false;
            if(tab.file_str.right_str) initBgHightlight("#file-right");
        },600);
    };
    //处理全部数据
    var filterAllData = function(tab){
        tab.control.left_loading = true;
        tab.control.right_loading = true;
        tab.file_str.right_str = "";
        tab.file_str.left_str = "";

        $timeout(function(){
            tab.file_str.left_str = tab.file_str.left_all_str.substring(0,tab.file_str.left_all_str.length-1);
            tab.control.left_loading = false;
        },500);
        $timeout(function(){
            tab.file_str.right_str = tab.file_str.right_all_str.substring(0,tab.file_str.right_all_str.length-1);
            tab.control.right_loading = false;
        },600);
    };
    //刷新codemirror
    var refreshCodeMirror = function(tab,tab_change){
        $scope.tab_control.cm_refresh = false;
        if(!$scope.control.is_init && tab_change) tab.control.tab_change = true;
        $timeout(function(){
            $scope.tab_control.cm_refresh = true;
            if(!$scope.control.is_init && tab_change) tab.control.tab_change = false;
            if(tab.compare_info.compare_type == 2){
                if(tab.file_str.left_str) initBgHightlight("#file-left",5);
                if(tab.file_str.right_str) initBgHightlight("#file-right",5);
            }
        },50)
    };
    //重置codemirror高度
    var resizeCMHeight = function (ele_id) {
        var _code_ele = ele_id ? $(ele_id + ' .CodeMirror') : $('#file-compare-view' + ' .CodeMirror');
        if(_code_ele.is(':visible') && _code_ele.offset()){
            var _codemirror_height = $(window).height() - parseInt(_code_ele.offset().top) - 40;
            _code_ele.height(_codemirror_height);
        }
    };
    //获取单个文件内容
    var getSingleFileContent = function(tab,left_unexist,right_unexist){
        tab.control.is_error = false;
        tab.control.left_error = "";
        tab.control.right_error = "";

        var _post_header = {
            version_num:right_unexist ? tab.compare_info.curr_version_num : tab.compare_info.compare_version_num,
            business_sys_name:$scope.$parent.one_pub.business_sys_name,
            absolute_path: right_unexist ? tab.compare_info.left_file_path : tab.compare_info.right_file_path.replace(_old_version_num,tab.compare_info.compare_version_num),
            encoding_type:tab.compare_info.encoding_type,
            file_path:tab.compare_info.inner_file_path,
            version_type:tab.compare_info.inner_file_path ? 2 : 1,  //1，3普通文件 2发布包文件
        };
        Version.viewfileContent(_post_header).then(function(data){
            if(data){
                $timeout(function(){
                    tab.file_str.left_str  = data.file_content && right_unexist ? Base64.decode(data.file_content).trim() : '';
                    tab.file_str.right_str  = data.file_content && left_unexist ? Base64.decode(data.file_content).trim() : '';
                    tab.compare_info.file_size = data.file_size ? data.file_size : '';
                    tab.compare_info.file_update_time = data.file_update_time ? data.file_update_time : '';
                    tab.control.left_loading = false;
                    tab.control.right_loading = false;
                    tab.control.is_error = true;
                    $scope.control.is_init = false;

                    tab.control.left_error = left_unexist ? "文件" + tab.compare_info.file_name + "不存在":'';
                    tab.control.right_error = right_unexist ? "对比文件" + tab.compare_info.file_name + "不存在":'';

                    refreshCodeMirror(tab);
                },0);
            }
        },function (error) {
            tab.control.left_loading = false;
            tab.control.right_loading = false;
            tab.control.is_error = !tab.file_str.left_str || !tab.file_str.right_str;
            tab.control.left_error = tab.file_str.left_str ? "" : error.message;
            tab.control.right_error = tab.file_str.right_str ? "" : error.message;
        });
    };
    var init = function(){
        //处理文件路径
        handleFilePath();
        //比对临时数据存放
        var _temp_compare_data = TempCompareData.getList();
        for(var i = 0; i < _temp_compare_data.length; i++){
            var _tem_data = _temp_compare_data[i];
            if(_tem_data.compare_info.real_file_path === $scope.compare_info.real_file_path){
                _exist_index = i;
                break;
            }
        }
        if(_exist_index === -1){
            TempCompareData.addItem({
                active:true,
                left_editor    : $scope.detailLeftOptions,
                right_editor   : $scope.detailRightOptions,
                is_pub_compare : $scope.curr_file_info.is_pub_compare,
                compare_info   : $scope.compare_info,
                file_str       : $scope.file_str,
                control        : $scope.control,
                version_list   : $scope.version_data.version_list,
            });
            //临时数据
            $scope.temp_data.compare_tab_list = TempCompareData.getList();
            $scope.curr_control = $scope.temp_data.compare_tab_list[0].control;
            getVersionData($scope.temp_data.compare_tab_list[$scope.temp_data.compare_tab_list.length - 1]);
        }else{
            //临时数据
            $scope.temp_data.compare_tab_list = TempCompareData.getList();
            angular.forEach($scope.temp_data.compare_tab_list,function(item,index,array){
                item.active = false;
            });
            $scope.temp_data.compare_tab_list[_exist_index].active = true;
            $scope.curr_control = $scope.temp_data.compare_tab_list[_exist_index].control;
            $scope.control.is_init = false;
            //同一文件不同版本
            if($scope.curr_file_info.compare_version_num !== $scope.temp_data.compare_tab_list[_exist_index].compare_info.compare_version_num){
                $scope.temp_data.compare_tab_list[_exist_index].compare_info.compare_version_num = $scope.curr_file_info.compare_version_num;
                $scope.control.is_init = true;
                getVersionData($scope.temp_data.compare_tab_list[_exist_index]);
            }
        }
    };

    //切换tab页
    $scope.changeCompareTab = function(index){
        if(_curr_active_index === index) return;
        $scope.temp_data.compare_tab_list[index].active = true;
        _curr_active_index = index; _left_editor = {}; _right_editor={};
        refreshCodeMirror($scope.temp_data.compare_tab_list[index],true);
    };
    //左侧文件配置
    $scope.detailLeftOptions = function(_editor){
        _left_editor = _editor;
        CodeMirrorOption.setFileCompareBg(_editor);
        _editor.on("scroll", function(CodeMirror,changeObj){
            if(timer) $timeout.cancel(timer);
            var timer = $timeout(function(){
                syncScroll(_editor,"left");
            },50);
        });
        _editor.on("viewportChange", function(CodeMirror,from,to){
            if(to){
                showBgHightlight('#file-left',50);
            }
        });
    };
    //右侧文件配置
    $scope.detailRightOptions = function(_editor){
        _right_editor = _editor;
        CodeMirrorOption.setFileCompareBg(_editor);
        _editor.on("scroll", function(CodeMirror,changeObj){
            if(timer) $timeout.cancel(timer);
            var timer = $timeout(function(){
                syncScroll(_editor,"right");
            },50);
        });
        _editor.on("viewportChange", function(CodeMirror,from,to){
            if(to){
                showBgHightlight('#file-right',50);
            }
        });
    };
    //选择对比版本
    $scope.selectCompareVersion = function(version_num,tab){
        if((_old_version_num === version_num) || $scope.control.is_init) return;
        tab.compare_info.compare_type = 1; //切换为全部
        getFileCompareContent(false,tab);
        _old_version_num= tab.compare_info.compare_version_num;
    };
    //改变文件比对类型(1 全部 2变更)
    $scope.changeCompareType = function(flag,tab){
        if(tab.compare_info.compare_type == flag) return;
        flag === 2 ? filterChangeData(tab) : filterAllData(tab);
        tab.compare_info.compare_type = flag;
    };
    //切换编码方式
    $scope.changeCompareCodeMethod = function (tab) {
        _encoding = tab.compare_info.encoding_type;
        if(_encoding === 'UTF-8'){
            tab.compare_info.encoding_type  = 'GBK';
        }else{
            tab.compare_info.encoding_type  = 'UTF-8';
        }
        //切换为全部
        tab.compare_info.compare_type = 1;
        //获取比对文件内容
        getFileCompareContent(false,tab);
    };
    //格式化文件图标
    $scope.formatFileIconStyle = function(tab){
        var class_name = '';
        if(tab.compare_info.file_type == 1){
            class_name = 'txt-icon';
        }else if(tab.compare_info.file_type == 2 || tab.compare_info.file_type == 3){
            class_name = 'excel-icon';
        }
        return class_name;
    };
    init();
}]);

/**
 * 目录比对控制器
 * **/
versionCtrl.controller('foldController',['$scope', '$timeout', 'Version', "ScrollBarConfig", "Modal", 'CV', function ($scope, $timeout, Version, ScrollBarConfig, Modal, CV) {
    var _curr_compare_num = $scope.version.compare_ver_num; //比对版本号
    var _old_compare_verm = $scope.version.compare_ver_num; //上次比对版本号
    var _compare_type = $scope.control.compare_full_flag ? 2 :4;   //(与全量比对标志)2:发布与全量比对，发布与发布比对4
    var _full_backup_flag = $scope.control.compare_full_flag ? 2 :1;
    var _curr_scroll_bar;  //0 左侧 1右侧
    //目录比对信息
    $scope.compare_data_info = {
        fold_name:$scope.control.version_flag ?  $scope.one_pub.version_num:$scope.file_nodes.curr_file.file,  //目录名称
        fold_path:$scope.control.version_flag ? $scope.version.file_absolute_path:$scope.file_nodes.curr_file.file_path, //目录路径
        compare_version_num:$scope.version.compare_ver_num,  //比对版本号
        relate_path:$scope.file_nodes.curr_file.relate_path, //tar包相对路径
        diff_version_num:$scope.version.compare_ver_num,     //变更页面版本号
        version_list:$scope.control.compare_pac_flag && $scope.control.compare_full_flag ? $scope.version.full_version_list: $scope.version.version_list //compare_pac_flag(投产包之间比对标志)
    };
    //目录比对控制
    $scope.fold_compare_control = {
        fold_load_flag:true,    //数据加载
        show_differ_flag:false  //变更标志
    };
    //全部比对-控制
    $scope.common_control = {
        disabled_control:false//加载中不能点击
    };
    //变更比对-控制
    $scope.diff_common_control={
        disabled_control:false//加载中不能点击
    };
    //左侧目录-页面配置
    $scope.leftConfig = {
        status:'left',
        compare_mode:true
    };
    //左侧目录-页面配置
    $scope.rightConfig = {
        status:'right',
        compare_mode:true
    };
    //变更树
    $scope.differ_compare_nodes = {};
    //页面配置
    $scope.config = {
        scroll_xy_config : ScrollBarConfig.XY()
    };
    //目录比对-左侧滚动条
    $scope.compare_left_scroll = {
        whileScrolling: function() {
            var _top_offset = Math.abs(this.mcs.top);
            var _left_offset = Math.abs(this.mcs.left);
            synCompareContainerScroll(0,_top_offset,_left_offset);
        }
    };
    //目录比对-右侧滚动条
    $scope.compare_right_scroll = {
        whileScrolling: function() {
            var _top_offset = Math.abs(this.mcs.top);
            var _left_offset = Math.abs(this.mcs.left);
            synCompareContainerScroll(1,_top_offset,_left_offset);
        }
    };

    //同步比对容器滚动 mcs_mark(0:左侧容器 1右侧容器)
    var synCompareContainerScroll = function(mcs_mark,y,x){
        var _curr_checked_tab_ = $scope.fold_compare_control.show_differ_flag ? 2:1;
        var mCSContainer = [$('#left_scroll_container' + _curr_checked_tab),$('#right_scroll_container' + _curr_checked_tab)];
        var scroll_position = [y,x];
        _curr_scroll_bar = _curr_scroll_bar || 0;
        for(var i = 0; i < mCSContainer.length; i++){
            if(_curr_scroll_bar !== i && mcs_mark !== i){
                mCSContainer[i].mCustomScrollbar("scrollTo", scroll_position, {scrollInertia:10});
            }
        }
    };
    var init = function () {
        //文件树
        if($scope.control.compare_pac_flag){    //发布流目录版本比较（包比较）
            $scope.compare_info_nodes = {
                loading:false,
                nodes:[],
                compare_path2:$scope.control.pre_pub_flag ? $scope.control.compare_full_flag ?  $scope.version.compare_path.replace($scope.one_pub.version_num,$scope.version.compare_ver_num).replace('pretags',$scope.control.compare_full_flag ? 'fulltags':'pubtags'):$scope.version.compare_path.replace($scope.version.pre_pub_ver,$scope.version.compare_ver_num).replace('pretags',$scope.control.compare_full_flag ? 'fulltags':'pubtags'):$scope.version.compare_path.replace($scope.one_pub.version_num,$scope.version.compare_ver_num),        //对比路径
                compare_path1:$scope.version.compare_path1,
                curr_fold_path:'',      //当前点击文件夹路径
                curr_file:{
                    relate_path:$scope.file_nodes.curr_file.relate_path
                }
            };
        }else {
            $scope.compare_info_nodes = {
                loading:false,
                nodes:[],
                compare_path2:$scope.version.compare_path,   //对比路径
                compare_path1:$scope.control.version_flag ?$scope.version.file_absolute_path : $scope.file_nodes.curr_fold_path,
                curr_fold_path:'',      //当前点击文件夹路径
                curr_file:{}          //当前点击文件
            };
        }
    };

    //左侧滚动条鼠标事件
    $scope.leftScrollBarMouseover = function(){
        _curr_scroll_bar = 0;
    };
    //右侧滚动条鼠标事件
    $scope.rightScrollBarMouseover = function(){
        _curr_scroll_bar = 1;
    };
    //比对两边共享数据
    $scope.compareData = function () {
        var _temp = angular.copy($scope.compare_info_nodes.temp);
        $scope.$broadcast($scope.compare_info_nodes.curr_fold_path,_temp);
    };
    //变更左右两边共享数据
    $scope.goDiff = function () {
        var _temp = angular.copy($scope.differ_compare_nodes.temp);
        $scope.$broadcast($scope.differ_compare_nodes.curr_fold_path,_temp);
    };
    //获取根目录文件
    $scope.getRootFile =function (obj) {
        obj = obj ? obj : $scope.compare_info_nodes;
        if($scope.control.compare_pac_flag){
            return   Version.pubAndBakTreeCompare(obj.compare_path1,obj.compare_path2,_compare_type,_full_backup_flag,$scope.one_pub.business_sys_name,$scope.compare_data_info.relate_path,$scope.compare_data_info.relate_path).then(function (data) {
                obj.curr_file= data.file_bean ? data.file_bean :{};
                _compare_type=3;
                return  data.diff_list ? data.diff_list :[];
            },function (error) {
                    Modal.alert(error.message);
                })
        }else {
            return   Version.foldTreeCompare(obj.compare_path1,obj.compare_path2).then(function (data) {
                obj.curr_file= data.file_bean ? data.file_bean :{};
                return  data.diff_list ? data.diff_list :[];
            },function (error) {
                Modal.alert(error.message);
            })
        }
    };
    //双击比对文件
    $scope.dbClickCompareFile = function(obj){
        obj = obj ? obj :$scope.compare_info_nodes;
        //传到控制器
        var _curr_file_info = {
            file_size: "",
            file_update_time: "",
            file_absolute_path : obj.compare_path1,
            full_absolute_path : $scope.control.compare_full_flag ? obj.compare_path2 : '',
            compare_full_type  : $scope.control.compare_full_flag ? 2 : 1, //(全量对比类型)1发布和发布比对 2发布与全量比对
            curr_version_num   : $scope.control.pre_pub_flag ? $scope.version.pre_pub_ver : $scope.one_pub.version_num,
            compare_version_num: $scope.control.compare_full_flag ? $scope.compare_data_info.compare_version_num : _curr_compare_num,
            compare_path1 : obj.compare_path1 || '', //左侧
            compare_path2 : obj.compare_path2 || '', //右侧
            is_fold_compare : true, //是否目录比对
        };
        $scope.$emit("compareFile", _curr_file_info);

        //隐藏当前目录比对页面
        $("#fold-compare").addClass('ng-hide').removeClass('ng-show');
        //显示文件比对页面
        $scope.file_control.show_file_compare = true;
    };
    //切换版本
    $scope.selectCompareVersion =function (ver_num) {
        if(_old_compare_verm ==ver_num){
            return;
        }
        _curr_compare_num =ver_num;
        $scope.compare_info_nodes.nodes=[];
        $scope.differ_compare_nodes.nodes=[];
        if($scope.fold_compare_control.show_differ_flag){
            $scope.fold_compare_control.diff_load_flag =false;
        }else {
            $scope.fold_compare_control.fold_load_flag =false;
        }
        if($scope.control.compare_pac_flag){
            _compare_type=$scope.control.compare_full_flag ? 2 :4;
            $scope.compare_info_nodes.compare_path1 = $scope.version.compare_path1;
            $scope.compare_info_nodes.compare_path2 = $scope.control.pre_pub_flag ? $scope.control.compare_full_flag ?  $scope.version.compare_path.replace($scope.one_pub.version_num,ver_num).replace('pretags',$scope.control.compare_full_flag ? 'fulltags':'pubtags'):$scope.version.compare_path.replace($scope.version.pre_pub_ver,ver_num).replace('pretags',$scope.control.compare_full_flag ? 'fulltags':'pubtags'):$scope.version.compare_path.replace($scope.one_pub.version_num,ver_num);
        }else {
            $scope.compare_info_nodes.compare_path1 =$scope.control.version_flag ? $scope.compare_data_info.fold_path: $scope.compare_data_info.fold_path+'/'+$scope.compare_data_info.fold_name;
            $scope.compare_info_nodes.compare_path2 = $scope.compare_info_nodes.compare_path1.replace($scope.one_pub.version_num,ver_num);
        }
        if($scope.fold_compare_control.show_differ_flag){
            $scope.differ_compare_nodes.no_init_flag=false;
            $scope.differ_compare_nodes.compare_path1=$scope.compare_info_nodes.compare_path1;
            $scope.differ_compare_nodes.compare_path2=$scope.compare_info_nodes.compare_path2;
            $timeout(function () {
                $scope.fold_compare_control.diff_load_flag =true;
            },200)
        }else {
            $scope.compare_info_nodes.no_init_flag=false;
            $timeout(function () {
                $scope.fold_compare_control.fold_load_flag =true;
            },200)
        }
        _old_compare_verm =ver_num;
    };
   //变更
    $scope.showDifference = function (flag) {
        if($scope.fold_compare_control.show_differ_flag==flag){
            return;
        }
        if(flag){
            $scope.fold_compare_control.diff_load_flag =false;
            $scope.compare_data_info.diff_version_num=$scope.compare_data_info.compare_version_num;
            $scope.differ_compare_nodes=angular.copy($scope.compare_info_nodes);
            $scope.differ_compare_nodes.no_init_flag=true;
            $timeout(function () {
                $scope.fold_compare_control.diff_load_flag =true;
            },200)
        }else {
            $scope.fold_compare_control.fold_load_flag=false;
            $scope.compare_data_info.compare_version_num=$scope.compare_data_info.diff_version_num;
            $scope.compare_info_nodes=angular.copy($scope.differ_compare_nodes);
            $scope.compare_info_nodes.no_init_flag=true;
            $timeout(function () {
                $scope.fold_compare_control.fold_load_flag =true;
            },200)
        }
        $scope.fold_compare_control.show_differ_flag=flag;
    };
    init();
}]);
