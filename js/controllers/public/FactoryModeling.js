
/**
 * Created by admin on 2018/6/2.
 * 工厂建模控制器
 */
var factiryCtrl = angular.module('FactoryController', []);
factiryCtrl.controller('factmodeDevzoneCtrl',['$scope', '$stateParams', '$timeout', '$state', 'Flow', 'FlowType', 'Scene', 'Strategy', 'ElementCategory', 'User', 'ScrollConfig','Params', 'Modal', 'CV',"$rootScope","IML_TYPE","dataBaseType","JobErrorType","ParamValueSource","FlowJobType","RequestMethod","Cmpt",function($scope, $stateParams, $timeout, $state, Flow, FlowType, Scene, Strategy, ElementCategory, User, ScrollConfig,Params, Modal, CV,$rootScope,IML_TYPE,dataBaseType,JobErrorType,ParamValueSource,FlowJobType,RequestMethod,Cmpt){
    // var initElementInfo = function(element){
    //     element = element || {};
    //     $scope.data.element_data = {
    //         exec_script         :  element.exec_script        || '',
    //         script_source       :  element.script_source      || 1,
    //         sql_source          :  element.sql_source         || 1,
    //         dataBase_type       :  element.dataBase_type      || 1,
    //         service_name        :  element.service_name       || '',
    //         service_comm_info   :  element.service_comm_info  || '',
    //         config              :  element.config             || false,
    //         comp_cn_name        :  element.comp_cn_name       || '',
    //         sdwork_cn_name      :  element.sdwork_cn_name     || '',	//元素中文名(暂使用作业字段)
    //         job_bk_desc         :  element.job_bk_desc        || '',	//元素描述(暂使用作业字段)
    //         comp_id             :  element.comp_id            || '',    //组件ID
    //         input               :  element.input              || [],    //输入参数
    //         output              :  element.output             || [],    //输出参数
    //         comp_impl_type      :  element.comp_impl_type     || '',    //实现类型
    //         datetime_condition  :  element.datetime_condition || '',	//日期条件
    //         date_condition      :  element.date_condition     || '',
    //         h_condition         :  element.h_condition        || "",
    //         m_condition         :  element.m_condition        || "",
    //         timeused            :  element.timeused           || '',     //执行预时
    //         pre_job_list        :  element.pre_job_list       || [],     //前置
    //         timeout             :  element.timeout            || "",	 //超时时间
    //         error_handle        :  element.error_handle       || 1,		 //出错处理方式（1等待,2跳过,3重试）
    //         retry_interval      :  element.retry_interval     || '',	 //重试间隔（单位秒）
    //         retry_times         :  element.retry_times        || '',	 //重试次数（默认三次）
    //         polling_interval    :  element.polling_interval   || '',     //轮询间隔
    //         polling_max_times   :  element.polling_max_times  || '',	 //轮询最大次数
    //         result_judge        :  element.result_judge       || '',     //结果判定
    //         job_method          :  element.job_method         || 0,      //作业类型 1择组件 2自定义
    //         env_name            :  element.env_name           || '',     // 语言环境名（由以下四个组成）
    //         language_name       :  element.language_name      || '',     // 语言名称
    //         language_version    :  element.language_version   || '',     // 语言版本
    //         operating_system    :  element.operating_system   || '',     // 操作系统
    //         bit_number          :  element.bit_number         || '',     // 操作位数
    //         annex_file          :  element.annex_file         || '',     //c/c++附件
    //         plugin_list         :  element.plugin_list        || [],     // 插件列表(shell/python/java)
    //         request_method      :  element.request_method     || 1,      // 服务作业请求方式(1: Post 2:Get)
    //     };
    // };
    // var convertTempEleList = function(){
    //     $scope.control.tem_element_list = [];
    //     for(var k = 0; k < $scope.info.category_list.length; k++){
    //         var _ele_category = $scope.info.category_list[k];
    //         _ele_category.element_list = _ele_category.element_list ? _ele_category.element_list : [];
    //         for(var m = 0; m < _ele_category.element_list.length; m++){
    //             var _element = _ele_category.element_list[m];
    //             _element.category = _element.category ? _element.category : _ele_category.category;
    //             _element.element_id  = _ele_category.category + '_' + m;   //自定义元素id(分类-索引)
    //             _element.element_info = _element.element_info ? _element.element_info : {};
    //             _element.element_info.config = !!_element.element_info.sdwork_cn_name;
    //             $scope.control.tem_element_list.push(_element);
    //         }
    //     }
    // };
    // //添加元素
    // var findTempEleListIndex = function(ele_type,ele_id){
    //     var _index = 0;
    //     for(var i = 0; i <  $scope.control.tem_element_list.length; i++){
    //         var _tem_ele =  $scope.control.tem_element_list[i];
    //         if(_tem_ele.type === ele_type && _tem_ele.element_id === ele_id){
    //             _index = i;
    //             break;
    //         }
    //     }
    //     return _index;
    // };
    // var isElementConfigComplete = function(){
    //     var is_complete = true;
    //     for(var i = 0; i < $scope.info.category_list.length; i++){
    //         var _category = $scope.info.category_list[i];
    //         _category.element_list = _category.element_list || [];
    //         for(var j =0; j < _category.element_list.length; j++){
    //             var _ele = _category.element_list[j];
    //             if(!_ele.element_info.sdwork_cn_name){
    //                 is_complete = false;
    //             }
    //         }
    //     }
    //     return is_complete;
    // };
    // $scope.addElement = function () {
    //     Modal.addSceneElement().then(function (checked_ele) {
    //         if(checked_ele){
    //             var _element_len =  $scope.info.category_list.length;
    //             if(_element_len === 0){
    //                 $scope.info.category_list[0] = checked_ele;
    //             }else{
    //                 var _is_new_category = true;
    //                 for(var i = 0; i < _element_len; i++){
    //                     var _ele = $scope.info.category_list[i];
    //                     if(_ele.category === checked_ele.category){
    //                         _is_new_category = false;
    //                         for(var j = 0; j < checked_ele.element_list.length; j++){
    //                             var _checked_ele = checked_ele.element_list[j];
    //                             _ele.element_list.push(_checked_ele);
    //                         }
    //                         break;
    //                     }
    //                     if(!_is_new_category) break;
    //                 }
    //                 _is_new_category && $scope.info.category_list.push(checked_ele);
    //                 console.log(checked_ele)
    //             }
    //             convertTempEleList(); //转化临时元素列表
    //         }
    //     })
    // };
    // $scope.configElement = function (category,element,index) {
    //     element.element_info  = element.element_info || {};
    //     $scope.control.config_element = true;
    //     var _ele_type = element.type;
    //     var _element_id   = element.element_id || category + '_' + index;
    //     var _tem_index = findTempEleListIndex(_ele_type,_element_id);
    //     $scope.tabOne(_tem_index);
    // };



    console.log(2);
    $rootScope.tiHuan_obj = []
    $rootScope.what_page = 1
    $scope.data_arr = {
        error_handle_list:[{key: 1, value: "等待"}, {key: 2, value: "跳过"}, {key:2,value:'重试'}],
        error_name : '',
        select_name : ''
    }
	$scope.tab_no = 1;
    //初始化属性数据
    var inite_data = function (obj) {
        obj = obj || {};
        if ($scope.jobForm) $scope.jobForm.$setPristine(); //初始化表单
        $scope.info.attr_data = {
            is_special_element: obj.is_special_element || false,
            exec_script: obj.exec_script || '',
            business_sys_name: obj.business_sys_name || '',
            script_source: obj.script_source || 1,
            sql_source: obj.sql_source || 1,
            script_file_name: obj.script_file_name || '',
            dataBase_type: obj.dataBase_type || 1,
            service_name: obj.service_name || '',
            service_ip: obj.service_ip || '',
            service_url: obj.service_url || '',
            service_port: obj.service_port || '',
            service_comm_info: obj.service_comm_info || {},
            config: obj.config || false,
            comp_cn_name: obj.comp_cn_name || '',
            sdwork_cn_name: obj.sdwork_cn_name || '',			// 作业中文名
            job_bk_desc: obj.job_bk_desc || '',			// 作业描述
            over_type: obj.over_type || 1,               // 手动结束，自动结束
            comp_id: obj.comp_id || '',  			    // 组件ID
            input: obj.input || [],
            comp_impl_type: obj.comp_impl_type || '',         // 参数实现类型
            datetime_condition: obj.datetime_condition || '',		// 日期条件
            date_condition: obj.date_condition || '',
            h_condition: obj.h_condition || "",
            m_condition: obj.m_condition || "",
            timeused: obj.timeused || '',               // 执行预时
            pre_job_list: obj.pre_job_list || [],
            timeout: obj.timeout || "",				// 超时时间
            error_handle: obj.error_handle || 1,		    // 出错处理方式（1等待， 2跳过，3重试）
            retry_interval: obj.retry_interval || '',	        // 重试间隔（单位秒）
            retry_times: obj.retry_times || '',		    // 重试次数（默认三次）
            source_list: obj.source_list || [],            // 数据源
            pre_job_basic_data: obj.pre_job_basic_data || [],     // 前置作业列表
            ref_job_list: obj.ref_job_list || [],           // 引用作业列表 前端选择用
            ref_job_param_list: obj.ref_job_param_list || [],     // 引用参数列表 前端选择用
            polling_interval: obj.polling_interval || '',       // 轮询次数
            polling_max_times: obj.polling_max_times || '',       // 最大间隔
            output: obj.output || [],
            expr: obj.expr || '',				    // 表达式
            result_judge: obj.result_judge || '',           // 结果判定
            job_method: obj.job_method || 0,              // 作业类型 1是选择组件 2是自定义
            env_name: obj.env_name || '',               // 语言环境名（由以下四个组成）
            language_name: obj.language_name || '',          // 语言名称
            language_version: obj.language_version || '',       // 语言版本
            operating_system: obj.operating_system || '',       // 操作系统
            bit_number: obj.bit_number || '',             // 操作位数
            annex_file: obj.annex_file || '',              //c/c++附件
            plugin_list: obj.plugin_list || [],            // 插件列表(shell/python/java/c,c++)
            command: obj.command || {},            // 插件列表(shell/python/java/c,c++)
            request_method      : obj.request_method ||  1,  // 服务作业请求方式(1: Post 2:Get)
        }
    };


    $scope.info = {

    }
    $scope.tab = '';
    $scope.init = {
        input_name_mode : '',
        font_style:'',
        tab_switch_dev:true,
        tab_switch_dev2:false,
        dev_color:'',
        param_list:[
            {param_cn_name:true,param_name:'参数1',param_bk_desc:'默认1'},
            {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            {param_cn_name:'qwe',param_name:'参数3',param_bk_desc:'默认3'},
            {param_cn_name:'q23',param_name:'参数4',param_bk_desc:'默认4'}
        ],
        out_param_list:[{param_name:'qqqqqqq'}],
        left_title_name:'工厂模型库'
    }

    var _sdflow_id = Params.getParams().flow_id ? Params.getParams().flow_id : $stateParams.flow_id;
    var _sdversion_id = Params.getParams().version_id ? Params.getParams().version_id : $stateParams.version_id;
    // $scope.info.sdflow_id = $stateParams.flow_id;
    // $scope.info.sdversion_id = $stateParams.version_id;
    //将父控制中的基本信息缓存起来
    console.log(123)
    console.log(Params)
    console.log($scope)
    $scope.control={
        modify_flag: $stateParams.modify_flag || false,   //判断是否是修改
        job_config: false,    //控制右侧属性配置显示
        reflash_node: false,    //节点刷新控制
        load_flow: false,  //控制指令的加载
        selectKeyFromIns: 0,
        user_config_show: false,    //控制执行人的显示隐藏
        basic_ele: true,     //基础元素默认展开
        basic_ele1: true,
        basic_ele2: false,
        basic_ele3: false,
        basic_ele4: false,
	    basic_ele5: true,
        basic_ele6: false,
        basic_ele7: true,
        private_ele: false,    //私有元素默认展开
        palette0: false,    //条件展开收起
        palette1: true,     //轮询展开收起
        palette2: true,     //文件展开收起
        palette3: true,     //数据库展开收起
        palette4: true,     //网络展开收起
        palette5: true,     //应用展开收起
        palette6: true,     //脚本展开收起
        palette7: true,     //服务展开收起
        palette8: true,     //其他展开收起
        palette9: false
    };

    $scope.modev = {
        element_name:'',
        describe : '',
        exceeding_time : '',
        execution_time : '',
        result_judgement : '',
        isclick : ''
    }
    $scope.data = {
        execute_type_list:IML_TYPE,
        database_type_list:dataBaseType,
        error_handle_list:JobErrorType,
        param_source_list:ParamValueSource,
        request_method_list:RequestMethod,
        element_data : {},  //单个元素信息
        list_stu:false,
        tab_stu:0,
        tab_stus:0,
        right_tab:0,
        right_tab_show:false,
        submit_arr:[],
        judge_bool : true,
        pro_save_list:[],
        user_list: [],   //可选用户列表
        s95:[],
        hf:[],
        paperma:[],
        tobacco:[],
        Product:[],
        tab_num:1,
	Process:[],
        treeStu:{
            num:0,
            name:""
        },
        treeOneStu:{
            num:0,
            name:""
        },
        treeTwoStu:{
            num:0,
            name:""
        },
        treeInfo:{
            num:0,
            name:""
        },
        palette_list: {      //模板数据
            condition_list: [],  //条件下的数据
            polling_list: [  //轮询模块下的数据
                {category: "7", text: "轮询", type: 6, sd_job_bean: {}},
                {category: "7", text: "11", type: 5, sd_job_bean: {}},
            ],
            file_list: [     //文件模块下的数据
                {category: "7", text: "ftp文件", type: 7, sd_job_bean: {}},
                {category: "7", text: "ftp文件", type: 8, sd_job_bean: {}},
                {category: "7", text: "sftp文件", type: 9, sd_job_bean: {}},
                {category: "7", text: "sftp文件", type: 10, sd_job_bean: {}},
                {category: "7", text: "agent文件", type: 11, sd_job_bean: {}},
                {category: "7", text: "agent文件", type: 12, sd_job_bean: {}},
                {category: "7", text: "拷贝文件", type: 13, sd_job_bean: {}}
            ],
            db_list: [       //数据库模块下的数据
                {category: "7", text: "数据库", type: 14, sd_job_bean: {}},
                {category: "7", text: "数据库脚本", type: 15, sd_job_bean: {}},
            ],
            web_list: [      //网络模块下的数据
                {category: "7", text: "网络配置", type: 16, sd_job_bean: {}},
            ],
            apply_list: [    //应用模块下的数据
                {category: "7", text: "应用启动", type: 17, sd_job_bean: {}},
                {category: "7", text: "应用停止", type: 18, sd_job_bean: {}},
            ],
            shell_list: [    //脚本模块下的数据
                {category: "7", text: "Python", type: 19, sd_job_bean: {}},
                {category: "7", text: "Shell", type: 20, sd_job_bean: {}},
                {category: "7", text: "Bat", type: 21, sd_job_bean: {}},
                {category: "7", text: "Java", type: 30, sd_job_bean: {}},
                {category: "7", text: "C", type: 31, sd_job_bean: {}},
                {category: "7", text: "C++", type: 32, sd_job_bean: {}},
            ],
            webS_list: [     //服务模块下的数据
                {category: "7", text: "WebService", type: 24, sd_job_bean: {}},
                {category: "7", text: "Tcp", type: 25, sd_job_bean: {}},
                {category: "7", text: "HTTP", type: 26, sd_job_bean: {}},
            ],
            other_list: [    //其他模块下的数据
                {category: "7", text: "CL", type: 28, sd_job_bean: {}},
                {category: "7", text: "RPG", type: 29, sd_job_bean: {}},
            ],
            hf_list_one: [    //其他模块下的数据
                {category: "7", text: "array1", parent: "Alpha", type: 30, sd_job_bean: {}},
            ],
            hf_list_two: [    //其他模块下的数据
                {category: "7", text: "cell1", parent: "Alpha", type: 30, sd_job_bean: {}},
            ],
            hf_list: [    //其他模块下的数据
                {category: "7", text: "site1", type: 30, sd_job_bean: {}},
            ],
            hf_list_one: [    //其他模块下的数据
                {category: "7", text: "array1", parent: "Alpha", type: 30, sd_job_bean: {}},
            ],
            hf_list_two: [    //其他模块下的数据
                {category: "7", text: "cell1", parent: "Alpha", type: 30, sd_job_bean: {}},
            ],
            hf_list_info: [    //其他模块下的数据
                {category: "7", text: "unt1", parent: "Alpha", type: 30, sd_job_bean: {}},
                {category: "7", text: "unt2", parent: "Alpha", type: 30, sd_job_bean: {}},
                {category: "7", text: "unt3", parent: "Alpha", type: 30, sd_job_bean: {}},
            ],
            s95data:[
                {category: "7", text: "enterprise", type: 37, sd_job_bean: {}},
                {category: "7", text: "site", type: 33, sd_job_bean: {}},
                {category: "7", text: "area", type: 34, sd_job_bean: {}},
                {category: "7", text: "cell", type: 35, sd_job_bean: {}},
                {category: "7", text: "unit", type: 36, sd_job_bean: {}},
            ],
            yancao:[
                {category: "7", text: "加料机", type: 47, sd_job_bean: {}},
                {category: "7", text: "电子称", type: 48, sd_job_bean: {}},
                {category: "7", text: "回潮机", type: 49, sd_job_bean: {}},
                {category: "7", text: "切丝机", type: 50, sd_job_bean: {}},
                {category: "7", text: "烘丝机", type: 51, sd_job_bean: {}},
                {category: "7", text: "储柜", type: 52, sd_job_bean: {}},
                {category: "7", text: "卷接机", type: 53, sd_job_bean: {}},
                {category: "7", text: "包装机", type: 54, sd_job_bean: {}},
                {category: "7", text: "封箱机", type: 55, sd_job_bean: {}},
                {category: "7", text: "喂丝机", type: 56, sd_job_bean: {}},
            ],
            zaozhi:[
                {category: "7", text: "打浆机", type: 38, sd_job_bean: {}},
                {category: "7", text: "贮浆罐", type: 39, sd_job_bean: {}},
                {category: "7", text: "混浆机", type: 40, sd_job_bean: {}},
                {category: "7", text: "压榨机", type: 41, sd_job_bean: {}},
                {category: "7", text: "干燥机", type: 42, sd_job_bean: {}},
                {category: "7", text: "卷取机", type: 43, sd_job_bean: {}},
                {category: "7", text: "复卷机", type: 44, sd_job_bean: {}},
                {category: "7", text: "分切机", type: 45, sd_job_bean: {}},
                {category: "7", text: "包装机", type: 46, sd_job_bean: {}},
],
            Modeling:[
                {category: "7", text: "开始", type: 63, sd_job_bean: {}},
                {category: "7", text: "工段", type:64, sd_job_bean: {}},
                {category: "7", text: "工序", type: 65, sd_job_bean: {}},
                {category: "7", text: "终止", type: 66, sd_job_bean: {}},
                {category: "7", text: "工艺文件", type: 67, sd_job_bean: {}},
                {category: "7", text: "设备", type: 68, sd_job_bean: {}},
                {category: "7", text: "人员", type: 69, sd_job_bean: {}},
            ]

        },
        private_palette_list: [],    //私有元素模板
        scene_palette_list: [],      //场景元素模板
        attr_data: {               //属性配置需要的数据
            pre_job_basic_data: [], //前置作业列表
            ref_job_list: [],        //引用作业列表 前端选择用
        }
    };
    $scope.code = [{key:0,value:'自检'},{key:1,value:'专检'},{key:2,value:'无'}];
    $scope.code_info = '自检';
$scope.tab_show = function(v){
	$scope.data.tab_num = v;
    $scope.tab_no = v;
    $scope.data.right_tab =v;
        if(v==2){
            $scope.data.tab_stu++;
        }
        if(v == 3){
            $scope.data.tab_stus++
        }

    }


    $scope.creat_alert = false;
    $scope.Section_alert = false;
$scope.material_list = [];
    $scope.Station_list = [];
    $scope.test_list = [];
    $scope.file_path = {           //组件上传配置
        suffixs:'',
        filetype: "",
        filename: "",
        uploadpath: ""
    };
    $scope.tab_chose = 1;
Cmpt.getCmptFilePath(1).then(function(data){
        $timeout(function(){
            if(data){
                $scope.file_path.uploadpath = data.file_path ? data.file_path : "";
            }
        },0);
    },function(error){
        Modal.alert(error.message,3);
    });
$scope.addList = function (num) {
        if (num == 1) {
            $scope.material_list.push({
                no: '',
                name: '',
                code: '',
                company: '',
                basic_consumption: '',
                actual_consumption: ''
            })
        }else if(num==2){
            $scope.Station_list.push({
                no: '',
                name: '',
                code: '',
                company: '',
                basic_consumption: '',
                actual_consumption: ''
            })
        }else if(num==3){
            $scope.test_list.push({
                no: '',
                name: '',
                code: '',
                company: '',
                basic_consumption: '',
                actual_consumption: ''
            })
        }
    }
$scope.deletList = function (index,tr,num,no) {
        if(no == 1){
            $scope.material_list.splice(index,1);
        }else if(no == 2){
            $scope.Station_list.splice(index,1);
        }else if(no == 3){
            $scope.test_list.splice(index,1);
        }
    };

    $scope.creat = function(str){
        if(str=='open'){
            $scope.creat_alert = true;
        }else if(str=='close'){
            $scope.creat_alert = false;
        }
    }

    $scope.Section = function(str){
        if(str=='open'){
            $scope.Section_alert = true;
        }else if(str=='close'){
            $scope.Section_alert = false;
        }
}

    $scope.creact_suc = function(msg){
        $scope.creat_alert = false;
        $scope.Section_alert = false;
        Modal.alert(msg)
    }

    //流程插件配置
    $scope.configs = {
        drag_left_scroll: ScrollConfig,//左侧滚动条配置
        undoOpreation: {},   //撤销obj
        redoOpreation: {},   //前进obj
        layoutArray: {       //自动排列
            autoArrang: false,
        },
    };
    $scope.flow_info = {    //流程图信息
        nodeDataArray: [],   //节点列表
        linkDataArray: [],   //关系列表
    }

    $scope.data.list_stu = true;

    console.log($scope.flow_info)
    //根据编排方式返回基础元素的数据
    var initDataByArrangMethod = function () {
        if ($scope.info.sdarrange_method == 1) {
            $scope.data.palette_list.condition_list = [
                {category: "1", text: "开始", type: 1, sd_job_bean: {}},
                {category: "2", text: "结束", type: 2, sd_job_bean: {}},
                {category: "6", text: "作业分组", "isGroup": true, type: 3, grid: 0},
                {category: "3", text: "条件", type: 4, sd_job_bean: {}},
                {category: "5", text: "中断", type: 5, sd_job_bean: {}},
            ]
        } else {
            $scope.data.palette_list.condition_list = [
                {category: "1", text: "开始", type: 1, sd_job_bean: {}},
                {category: "2", text: "结束", type: 2, sd_job_bean: {}},
                {category: "3", text: "条件", type: 4, sd_job_bean: {}},
                {category: "5", text: "中断", type: 5, sd_job_bean: {}},
            ]
        }
        //拿到数据后再加载指令
        $scope.control.load_flow = true;
    }
    initDataByArrangMethod();
    $scope.initTree = function(name){
        for(var i=0;i<$scope.data[name].length;i++){
            $scope.data[name][i].stu = false;
            $scope.data[name][i].re = false;
        }
    }

    $scope.treeData = {
        s95:{
            cen:[{name:'s95',iden:'s95'}],
            site:[
                {
                    category: "7",
                    text: "site",
                    type: 33,
                    sd_job_bean: {},
                    area:[
                        {
                            category: "7",
                            text: "area",
                            type: 34,
                            sd_job_bean: {},
                            cell:[
                                {
                                    category: "7",
                                    text: "cell",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "unit", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "unit", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "unit", type: 33, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "cell",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "unit", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "unit", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "unit", type: 33, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "cell",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "unit", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "unit", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "unit", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "unit", type: 33, sd_job_bean: {}},
                                    ]
                                }
                            ]
                        },
                    ]
                }
            ],
        },
        hf:{
            cen:[{name:'恒丰纸业工厂模型',iden:'hf'}],
            site:[
                {
                    category: "7",
                    text: "一分厂",
                    type: 33,
                    sd_job_bean: {},
                    area:[
                        {
                            category: "7",
                            text: "造纸车间",
                            type: 34,
                            sd_job_bean: {},
                            cell:[
                                {
                                    category: "7",
                                    text: "打浆段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "打浆机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "贮浆罐", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "混浆机", type: 33, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "造纸段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "压榨机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "干燥机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "卷取机", type: 33, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "成品段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "复卷机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "分切机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "包装机", type: 33, sd_job_bean: {}},
                                    ]
                                }
                            ]
                        },
                        {
                            category: "7",
                            text: "印刷车间",
                            type: 34,
                            sd_job_bean: {},
                            cell:[]
                        }
                    ]
                },
                {category: "7", text: "二分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "三分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "四分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "五分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "六分厂", type: 33, sd_job_bean: {},area:[]}
                ],
        },
        paperma:{
            cen:[{name:'恒丰纸业工厂模型',iden:'paperma'}],
            site:[
                {
                    category: "7",
                    text: "一分厂",
                    type: 33,
                    sd_job_bean: {},
                    area:[
                        {
                            category: "7",
                            text: "造纸车间",
                            type: 34,
                            sd_job_bean: {},
                            cell:[
                                {
                                    category: "7",
                                    text: "打浆段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "打浆机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "贮浆罐", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "混浆机", type: 33, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "造纸段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "压榨机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "干燥机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "卷取机", type: 33, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "成品段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "复卷机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "分切机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "包装机", type: 33, sd_job_bean: {}},
                                    ]
                                }
                            ]
                        },
                        {
                            category: "7",
                            text: "印刷车间",
                            type: 34,
                            sd_job_bean: {},
                            cell:[]
                        }
                    ]
                },
                {category: "7", text: "二分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "三分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "四分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "五分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "六分厂", type: 33, sd_job_bean: {},area:[]}
            ],
        },
        tobacco:{
            cen:[{name:'恒丰纸业工厂模型',iden:'tobacco'}],
            site:[
                {
                    category: "7",
                    text: "一分厂",
                    type: 33,
                    sd_job_bean: {},
                    area:[
                        {
                            category: "7",
                            text: "造纸车间",
                            type: 34,
                            sd_job_bean: {},
                            cell:[
                                {
                                    category: "7",
                                    text: "打浆段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "加料机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "电子称", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "回潮机", type: 33, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "造纸段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "切丝机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "烘丝机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "储柜", type: 33, sd_job_bean: {}},
                                    ]
                                },
                                {
                                    category: "7",
                                    text: "成品段",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[
                                        {category: "7", text: "卷接机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "包装机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "封箱机", type: 33, sd_job_bean: {}},
                                        {category: "7", text: "喂丝机", type: 33, sd_job_bean: {}},
                                    ]
                                }
                            ]
                        },
                        {
                            category: "7",
                            text: "印刷车间",
                            type: 34,
                            sd_job_bean: {},
                            cell:[]
                        }
                    ]
                },
                {category: "7", text: "二分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "三分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "四分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "五分厂", type: 33, sd_job_bean: {},area:[]},
                {category: "7", text: "六分厂", type: 33, sd_job_bean: {},area:[]}
            ],
},
        Process:{
            cen:[{name:'工艺建模',iden:'Process'}],
            site:[
                {
                    category: "7",
                    text: "盘纸线",
                    type: 70,
                    sd_job_bean: {},
                    area:[
                        {
                            category: "7",
                            text: "010打浆",
                            type: 74,
                            sd_job_bean: {},
                            cell:[]
                        },
                        {
                            category: "7",
                            text: "020造纸",
                            type: 75,
                            sd_job_bean: {},
                            cell:[]
                        },
                        {
                            category: "7",
                            text: "030组装",
                            type: 76,
                            sd_job_bean: {},
                            cell:[
                                {
                                    category: "7",
                                    text: "元件1",
                                    type: 77,
                                    sd_job_bean: {},
                                    unit:[]
                                },
                                {
                                    category: "7",
                                    text: "元件2",
                                    type: 77,
                                    sd_job_bean: {},
                                    unit:[]
                                },
                            ]
                        },
                    ]
                },
                {
                    category: "7",
                    text: "辊纸线",
                    type: 71,
                    sd_job_bean: {},
                    area:[]
                },
                {
                    category: "7",
                    text: "接装线",
                    type: 72,
                    sd_job_bean: {},
                    area:[]
                },
                {
                    category: "7",
                    text: "印刷线",
                    type: 73,
                    sd_job_bean: {},
                    area:[]
                }
            ],
        },
        Product:{
            cen:[{name:'产品建模',iden:'Product'}],
            site:[
                {
                    category: "7",
                    text: "CNJH050107",
                    type: 33,
                    sd_job_bean: {},
                    area:[
                        {
                            category: "7",
                            text: "包装材料",
                            type: 34,
                            sd_job_bean: {},
                            cell:[]
                        },
                        {
                            category: "7",
                            text: "施剂",
                            type: 34,
                            sd_job_bean: {},
                            cell:[]
                        },
                        {
                            category: "7",
                            text: "原料",
                            type: 34,
                            sd_job_bean: {},
                            cell:[
                                {
                                    category: "7",
                                    text: "设备",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[]
                                },
                                {
                                    category: "7",
                                    text: "工艺",
                                    type: 35,
                                    sd_job_bean: {},
                                    unit:[]
                                },
                            ]
                        },
                    ]
                },
                {
                    category: "7",
                    text: "CNLH016402",
                    type: 33,
                    sd_job_bean: {},
                    area:[]
                },
                {
                    category: "7",
                    text: "CNJF050822",
                    type: 33,
                    sd_job_bean: {},
                    area:[]
                },
                {
                    category: "7",
                    text: "CNPA050102",
                    type: 33,
                    sd_job_bean: {},
                    area:[]
                },
                {
                    category: "7",
                    text: "CNLH0111F0",
                    type: 33,
                    sd_job_bean: {},
                    area:[]
                }
            ],
        }

    }

    console.log($scope.treeData);

    for(var v in $scope.treeData){
        console.log($scope.treeData[v],$scope.treeData[v].cen[0].iden);
        treeInit($scope.treeData[v],$scope.treeData[v].cen[0].iden);
    }

    function treeInit(data,name){
        for(var i=0;i<data.site.length;i++){
            $scope.data[name].push({
                num:name+i.toString(),
                stu:false,
                re:false,
                child:[],
                data:[data.site[i]],
                name:name
            });
            for(var v=0;v<data.site[i].area.length;v++){
                $scope.data[name][i].child.push({
                    num:name+i.toString()+v.toString(),
                    stu:false,
                    re:false,
                    child:[],
                    data:[data.site[i].area[v]]
                });
                for(var k=0;k<data.site[i].area[v].cell.length;k++){
                    $scope.data[name][i].child[v].child.push({
                        num:name+i.toString()+v.toString()+k.toString(),
                        stu:false,
                        re:false,
                        child:[],
                        data:[data.site[i].area[v].cell[k]]
                    });
                    for(var j=0;j<data.site[i].area[v].cell[k].unit.length;j++){
                        $scope.data[name][i].child[v].child[k].child.push(
                            {
                            num:name+i.toString()+v.toString()+k.toString()+j.toString(),
                            data:[data.site[i].area[v].cell[k].unit[j]]
                        })
                    }
                }
            }
        }
    }


    $scope.$on('reLoad',function(even,data){
            $scope.data.treeStu.num++;
            $scope.data.treeStu.name = data.name;
    })
    $scope.$on('reLoadOne',function(even,data){
        $scope.data.treeOneStu.num++;
        $scope.data.treeOneStu.name = data.name;
    })
    $scope.$on('reLoadTwo',function(even,data){
        $scope.data.treeTwoStu.num++;
        $scope.data.treeTwoStu.name = data.name;
    })
    $scope.$on('reLoadInfo',function(even,data){
        $scope.data.treeInfo.num++;
        $scope.data.treeInfo.name = data.name;
    })


    $scope.treeOne = function(v,name){
        $scope.data[name][v].stu = !$scope.data[name][v].stu;
        if(!$scope.data[name][v].stu){
            $scope.data[name][v].re = false;
        }
        for(var i=0;i<$scope.data[name][v].child.length;i++){
            $scope.data[name][v].child[i].stu = false;
            $scope.data[name][v].child[i].re = false;
            for(var k=0;k<$scope.data[name][v].child[i].child.length;k++){
                $scope.data[name][v].child[i].child[k].stu = false;
                $scope.data[name][v].child[i].child[k].re = false;
            }
        }
    }

    $scope.treeTwo = function(v1,v2,name){
        $scope.data[name][v1].child[v2].stu = !$scope.data[name][v1].child[v2].stu;
        if(!$scope.data[name][v1].child[v2].stu){
            $scope.data[name][v1].child[v2].re = false;
        }
        for(var i=0;i<$scope.data[name][v1].child[v2].child.length;i++){
            $scope.data[name][v1].child[v2].child[i].stu = false;
            $scope.data[name][v1].child[v2].child[i].re = false;
        }
    }
    $scope.treeInfo = function(v1,v2,v3,name){
        $scope.data[name][v1].child[v2].child[v3].stu = !$scope.data[name][v1].child[v2].child[v3].stu;
        if(!$scope.data[name][v1].child[v2].child[v3].stu){
            $scope.data[name][v1].child[v2].child[v3].re = false;
        }
    }

    //设置流程画布各容器高度
    var set_div_height = function (timeout, reset_canvas) {
        var _timeout = timeout || 5;
        $timeout(function () {
            if ($('.header_bg').offset()) {
                var _height = $(window).height() - $('.header_bg').offset().top - 75;
                $('.dragLeft').css('height', _height);
                $('.dragMid').css('height', _height);
                $('.grid_bg').css('height', _height);
                $('.job_div').css('height', _height - 31 -58); //31 头部标题高度 58底部按钮高度
                $('.jobno_div').css('height', _height - 1);
                if (reset_canvas) $scope.autoArray();
            }
        }, _timeout);
    }

    $scope.autoArray = function () {
        $scope.configs.layoutArray.autoArrang = !$scope.configs.layoutArray.autoArrang;
    };




    $scope.title_arr = ['恒丰模型(01.00)','编辑']
    $scope.title_name = $scope.title_arr[0]
    $rootScope.dirtitle_name =  $scope.title_name
    $scope.title_zhuangt = $scope.title_arr[1]
    $scope.is_showtable = true
    $scope.tabs = [];
    $scope.tabs['handle'] = {type: 1, dispatch: true};
    $scope.tabs['auto'] = {type: 2, dispatch: true};
    $scope.tabs['attention'] = {type: '', dispatch: false};
    $scope.control.active_tab = 'handle'
    // $scope.flow_list_scroll = ScrollBarConfig.Y();
    $scope.switchTab = function (tab) {
        $scope.control.active_tab = tab;
        if(tab == 'handle'){
            $scope.is_showtable = true
            $scope.title_name = $scope.title_arr[0]
            $scope.title_zhuangt = $scope.title_arr[1]
        }else{
            $scope.is_showtable = false
            $scope.title_name = '暂无'
            $scope.title_zhuangt = '暂无'
        }
        // $state.go('dispatch_flow_list', {active_name: tab});
    }




    // $scope.dev_color = true
    // $scope.dev_color2 = false
    // $scope.switchTab = function(tab){
    //     console.log(tab)
    //     if(tab == "1") {
    //         $scope.init.tab_switch_dev = true
    //         $scope.init.tab_switch_dev2 = false
    //         $scope.dev_color = true
    //         $scope.dev_color2 = false
    //     }else if(tab == "2"){
    //         $scope.init.tab_switch_dev2 = true
    //         $scope.init.tab_switch_dev = false
    //         $scope.dev_color = false
    //         $scope.dev_color2 = true
    //     }
    // }

    //删除输出参数
    $scope.deleteOutputParam = function (index,tr) {
        var _type_name = tr.type_name ? tr.type_name : "";
            $scope.init.param_list.splice(index,1);
    };

    //增加输出参数
    $scope.addOutputParam = function(){
        $scope.init.param_list.push({
            param_cn_name :"",
            param_name:"",
            param_bk_desc:"",
        });
    }

    $scope.save_sishow = false
    $scope.releaseBtn = function (){
        Modal.alert('发布成功！')
    }
    $scope.saveBtn = function (){
        console.log(1)
        $scope.save_sishow = true
    }
    $scope.hideBtn = function () {
        console.log(1)
        $scope.save_sishow = false
    }
    $scope.sureBtn = function () {
        $rootScope.dirtitle_name = $scope.init.input_name_mode
        $scope.title_name = $rootScope.dirtitle_name
        Modal.alert('保存成功！')
        $scope.save_sishow = false
    }
    $scope.formSubmit = function (num) {
        console.log($rootScope)
        if(num == 2){
            // $scope.data.element_name = $scope.modev.element_name
            $scope.data.submit_arr.push({
                draw_name : $rootScope.elem_name,
                name : $scope.modev.element_name,
                describe : $scope.modev.describe,
                exceeding_time : $scope.modev.exceeding_time,
                execution_time : $scope.modev.execution_time,
                result_judgement : $scope.modev.result_judgement,
                error_name : $scope.data_arr.error_name
                // isclick : 2
            })

        }
    }
    $scope.error_handle_list = [1,2,3,4,5]
    $scope.show_tabl_form = false
    $scope.$on('tiHuan_obj',function (even,data) {
        console.log($rootScope)
        console.log(1)
        $scope.show_tabl_form = true
        // $scope.init.param_list = [
        //     {param_cn_name:true,param_name:'参数1',param_bk_desc:'默认1'},
        //     {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
        //     {param_cn_name:'qwe',param_name:'参数3',param_bk_desc:'默认3'},
        //     {param_cn_name:'q23',param_name:'参数4',param_bk_desc:'默认4'}
        // ]
        console.log(data);
        $scope.modev.element_name = data.data.name
        console.log($scope.modev.name)
        $scope.modev.describe = data.data.describe
        $scope.modev.exceeding_time = data.data.exceeding_time
        $scope.modev.execution_time = data.data.execution_time
        $scope.modev.result_judgement = data.data.result_judgement
        $scope.data_arr.select_name = data.data.error_name
        if($rootScope.elem_name == '一分厂'){
            $scope.init.param_list = [
                    {param_cn_name:true,param_name:'参数1',param_bk_desc:'默认1'},
                    {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '造纸车间'){
            $scope.init.param_list = [
                {param_cn_name:true,param_name:'参数1',param_bk_desc:'默认1'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '印刷车间'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '打浆机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '贮浆罐'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '混浆机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '压榨机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '干燥机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '卷取机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '复卷机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '分切机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '包装机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '加料机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '电子秤'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '回潮机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '切丝机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '烘丝机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '储柜'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '卷接机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '封箱机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }else if($rootScope.elem_name == '喂丝机'){
            $scope.init.param_list = [
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
                {param_cn_name:false,param_name:'参数2',param_bk_desc:'默认2'},
            ]
        }
        $scope.$apply()
    })
    // //设置作业方式
    // $scope.setJobMethod = function () {
    //     var special_element = $scope.info.attr_data.is_special_element || false;
    //     console.log($scope.info.attr_data)
    //     console.log(special_element)
    //     Modal.setFlowJobMethod(33, $scope.info.attr_data, false, special_element).then(function (result) {
    //         console.log('------------------------------')
    //         console.log(result)
    //         console.log('------------------------------')
    //         $scope.info.attr_data.job_method = result.job_method;
    //         if (result.job_method == 1) {
    //             $scope.info.attr_data.comp_id = result.comp_id;
    //             $scope.info.attr_data.comp_impl_type = result.impl_type;
    //             $scope.info.attr_data.comp_cn_name = result.comp_cn_name;
    //             $scope.info.attr_data.input = result.input || [];
    //             $scope.info.attr_data.output = result.output || [];
    //             $scope.info.attr_data.exec_script = result.exec_script;
    //             $scope.info.attr_data.script_source = result.script_source;
    //             $scope.info.attr_data.env_name = result.env_name;
    //             $scope.info.attr_data.language_name = result.language_name;
    //             $scope.info.attr_data.language_version = result.language_version;
    //             $scope.info.attr_data.operating_system = result.operating_system;
    //             $scope.info.attr_data.bit_number = result.bit_number;
    //             $scope.info.attr_data.plugin_list = result.plugin_list;
    //             $scope.info.attr_data.annex_file = result.annex_file;
    //         } else {
    //             $scope.info.attr_data.comp_id = '';
    //             $scope.info.attr_data.comp_impl_type = result.impl_type;
    //             $scope.info.attr_data.output = result.output ? result.output : [];
    //             $scope.info.attr_data.input = result.param_list;
    //             $scope.info.attr_data.exec_script = result.exec_script;
    //             $scope.info.attr_data.business_sys_name = result.business_sys_name;
    //             $scope.info.attr_data.script_source = result.script_source;
    //             $scope.info.attr_data.sql_source = result.sql_source;
    //             $scope.info.attr_data.script_file_name = result.script_file_name;
    //             $scope.info.attr_data.dataBase_type = result.dataBase_type;
    //             $scope.info.attr_data.service_name = result.service_name;
    //             $scope.info.attr_data.service_port = result.service_port;
    //             $scope.info.attr_data.service_ip = result.service_ip;
    //             $scope.info.attr_data.service_url = result.service_url;
    //             $scope.info.attr_data.env_name = result.env_name;
    //             $scope.info.attr_data.language_name = result.language_name;
    //             $scope.info.attr_data.language_version = result.language_version;
    //             $scope.info.attr_data.operating_system = result.operating_system;
    //             $scope.info.attr_data.bit_number = result.bit_number;
    //             $scope.info.attr_data.plugin_list = result.plugin_list;
    //             $scope.info.attr_data.annex_file = result.annex_file;
    //             $scope.info.attr_data.request_method = result.request_method || 1;
    //             if (result.command && result.command.cmds) {
    //                 $scope.info.attr_data.command.exec_script = CmptFunc.cmdsToString(result.command.cmds);
    //             }
    //             for (var i = 0; i < $scope.info.attr_data.input.length; i++)  $scope.info.attr_data.input[i].param_source = 1;
    //         }
    //     })
    // };
    // inite_data()
    // $scope.formSubmit = function (submit_flag) {
    //     console.log(1)
    //     // if(!CV.valiForm($scope.new_element_form)){
    //     //     return false;
    //     // }
    //     if(submit_flag === 1){
    //         if($scope.info.category_list.length === 0){
    //             Modal.alert('请添加元素');
    //             return false;
    //         }
    //         if(!isElementConfigComplete()){
    //             Modal.alert('元素配置不完整');
    //             return false;
    //         }
    //
    //         //新增
    //         $scope.control.btn_loading = true;
    //         console.log($scope.info)
    //         Scene.addScene($scope.info,false).then(function(data){
    //             $scope.control.btn_loading = false;
    //             Modal.alert('新增成功');
    //             $scope.formCancel();
    //         },function (error) {
    //             $scope.control.btn_loading = false;
    //             Modal.alert(error.message);
    //         })
    //     }else{
    //         //保存单个元素配置信息
    //         var  _index = $scope.control.active_element_i;
    //         var _curr_element =  $scope.control.tem_element_list[_index];
    //
    //         if(!$scope.data.element_data.job_method){
    //             Modal.alert('请设置内容类型');
    //             return false;
    //         }
    //
    //         //组件方式-组件名不可为空
    //         if($scope.data.element_data.job_method === 1 && !$scope.data.element_data.comp_cn_name){
    //             Modal.alert('请重配内容类型');
    //             return false;
    //         }
    //
    //         //同步配置信息
    //         $scope.data.element_data.config = true;
    //         for(var i = 0; i < $scope.info.category_list.length; i++){
    //             var _category = $scope.info.category_list[i];
    //             if(_category.category !== _curr_element.category) continue;
    //             for(var j = 0; j < _category.element_list.length; j++){
    //                 var  _element = _category.element_list[j];
    //                 if(_element.type === _curr_element.type && _element.element_id === _curr_element.element_id){
    //                     _element.element_info =  $scope.data.element_data;
    //                     break;
    //                 }
    //             }
    //         }
    //
    //         //清空单个元素数据
    //         $scope.control.config_element = false;
    //         initElementInfo();
    //     }
    // };

    // $scope.formSubmit = function (submit_flag) {
    //     console.log(1)
    //     // if(!CV.valiForm($scope.new_element_form)){
    //     //     return false;
    //     // }
    //     if(submit_flag === 1){
    //         // if($scope.info.category_list.length === 0){
    //         //     Modal.alert('请添加元素');
    //         //     return false;
    //         // }
    //         // if(!isElementConfigComplete()){
    //         //     Modal.alert('元素配置不完整');
    //         //     return false;
    //         // }
    //
    //         //新增
    //         $scope.control.btn_loading = true;
    //         Scene.addScene($scope.info,false).then(function(data){
    //             $scope.control.btn_loading = false;
    //             Modal.alert('新增成功');
    //             $scope.formCancel();
    //         },function (error) {
    //             $scope.control.btn_loading = false;
    //             Modal.alert(error.message);
    //         })
    //     }else{
    //         //保存单个元素配置信息
    //         var  _index = $scope.control.active_element_i;
    //         var _curr_element =  $scope.control.tem_element_list[_index];
    //
    //         if(!$scope.data.element_data.job_method){
    //             Modal.alert('请设置内容类型');
    //             return false;
    //         }
    //
    //         //组件方式-组件名不可为空
    //         if($scope.data.element_data.job_method === 1 && !$scope.data.element_data.comp_cn_name){
    //             Modal.alert('请重配内容类型');
    //             return false;
    //         }
    //
    //         //同步配置信息
    //         $scope.data.element_data.config = true;
    //         for(var i = 0; i < $scope.info.category_list.length; i++){
    //             var _category = $scope.info.category_list[i];
    //             if(_category.category !== _curr_element.category) continue;
    //             for(var j = 0; j < _category.element_list.length; j++){
    //                 var  _element = _category.element_list[j];
    //                 if(_element.type === _curr_element.type && _element.element_id === _curr_element.element_id){
    //                     _element.element_info =  $scope.data.element_data;
    //                     break;
    //                 }
    //             }
    //         }
    //
    //         //清空单个元素数据
    //         $scope.control.config_element = false;
    //         initElementInfo();
    //     }
    // };
    // $scope.$watch($rootScope.tiHuan_obj,function(now){
    //     console.log(now);
    //     console.log(1)
    // },true)
    $scope.product = {
        pro_list_isshow : false,
        create_time:'2018/12/10',
        serial_no:'',
        pro_name:'',
        pro_edition:'',
        pro_num:'',
        pro_company:'',
        pro_rote:[{key: 1, value: "等待"}, {key: 2, value: "跳过"}, {key:2,value:'重试'}],
        pro_factory:[{key: 1, value: "1"}, {key: 2, value: "2"}, {key:2,value:'3'}],
        pro_rote_selected:'',
        pro_factory_selected:'',
        material_infor_list:[
            // {no:true,name:'参数1',code:'默认1',company:'单位',basic_consumption:'基本用量',actual_consumption:'实际用量'},
            // {no:true,name:'参数2',code:'默认2',company:'单位',basic_consumption:'基本用量',actual_consumption:'实际用量'},
            // {no:true,name:'参数3',code:'默认3',company:'单位',basic_consumption:'基本用量',actual_consumption:'实际用量'},
        ],
        substitute_list:[
            // {no:true,name:'参数3',code:'默认3',company:'单位',basic_consumption:'基本用量',actual_consumption:'实际用量'},
        ],
        virtual_parts_list:[
            // {no:true,name:'参数3',code:'默认3',company:'单位',basic_consumption:'基本用量',actual_consumption:'实际用量'},
            // {no:true,name:'参数3',code:'默认3',company:'单位',basic_consumption:'基本用量',actual_consumption:'实际用量'},
            // {no:true,name:'参数3',code:'默认3',company:'单位',basic_consumption:'基本用量',actual_consumption:'实际用量'},
        ],
        tab_isShow:1
    }
    $scope.tabBtnTable = function (num) {
        $scope.product.tab_isShow = num
    }
    $scope.addOutputParamList = function (num) {
        console.log($scope.product)
        if(num == 1){
            $scope.product.material_infor_list.push({
                no:'',
                name:'',
                code:'',
                company:'',
                basic_consumption:'',
                actual_consumption:''
            })
        }else if(num == 2){
            $scope.product.substitute_list.push({
                no:'',
                name:'',
                code:'',
                company:'',
                basic_consumption:'',
                actual_consumption:''
            })
        }else if(num == 3){
            $scope.product.virtual_parts_list.push({
                no:'',
                name:'',
                code:'',
                company:'',
                basic_consumption:'',
                actual_consumption:''
            })
        }
    }
    $scope.deleteOutputParamA = function (index,tr,num,no) {
        if(no == 1){
            $scope.product.material_infor_list.splice(index,1);
        }else if(no == 2){
            $scope.product.substitute_list.splice(index,1)
        }else if(no == 3){
            $scope.product.virtual_parts_list.splice(index,1)
        }
    };
    $scope.ProsaveBtn = function () {
        console.log(1)
        $scope.data.pro_save_list.push({
            element_name:$rootScope.pro_elem_name,
            pro_serial_no:$scope.product.serial_no,
            pro_pro_name:$scope.product.pro_name,
            pro_pro_edition:$scope.product.pro_edition,
            pro_pro_num:$scope.product.pro_num,
            pro_pro_company:$scope.product.pro_company,
            material_infor_list:$scope.product.material_infor_list,
            substitute_list:$scope.product.substitute_list,
            virtual_parts_list:$scope.product.virtual_parts_list
        })
                $rootScope.element_name = '',
                $scope.product.serial_no = '',
                $scope.product.pro_name = '',
                $scope.product.pro_edition = '',
                $scope.product.pro_num = '',
                $scope.product.pro_company = '',
                $scope.product.material_infor_list = [],
                $scope.product.substitute_list = [],
                $scope.product.virtual_parts_list = []
        console.log($scope.data.pro_save_list)
        console.log($rootScope)
    }
    $rootScope.pro_tiHuan = []
    $scope.$on('pro_tiHuan',function (even,data) {
        var arr = []
        console.log(1)
        $scope.product.pro_list_isshow = true
        console.log($rootScope.pro_tiHuan)
        arr.push($rootScope.pro_tiHuan)
        console.log(arr);
        console.log($rootScope)
        if(arr[0].element_name != ''){
                $scope.product.serial_no = $rootScope.pro_tiHuan.pro_serial_no
                $scope.product.pro_name = $rootScope.pro_tiHuan.pro_pro_name
                $scope.product.pro_edition = $rootScope.pro_tiHuan.pro_pro_edition
                $scope.product.pro_num = $rootScope.pro_tiHuan.pro_pro_num
                $scope.product.pro_company = $rootScope.pro_tiHuan.pro_pro_company
                $scope.product.material_infor_list = $rootScope.pro_tiHuan.material_infor_list
                $scope.product.substitute_list = $rootScope.pro_tiHuan.substitute_list
                $scope.product.virtual_parts_list = $rootScope.pro_tiHuan.virtual_parts_list
        }else{
            $rootScope.element_name = '',
                $scope.product.serial_no = '',
                $scope.product.pro_name = '',
                $scope.product.pro_edition = '',
                $scope.product.pro_num = '',
                $scope.product.pro_company = '',
                $scope.product.material_infor_list = [],
                $scope.product.substitute_list = [],
                $scope.product.virtual_parts_list = []
        }
        console.log(arr[0].element_name)
    })
    $scope.saveAlert = function () {
        Modal.alert('保存成功！')
    }
    $scope.hideDiv = function () {
        $scope.product.pro_list_isshow = false
    }
}])