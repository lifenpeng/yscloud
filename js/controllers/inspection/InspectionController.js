'use strict';

//自动巡检控制器
var inspectionCtrl = angular.module('InspectionController',["highcharts-ng"]);

/**
 * 日志提取**/
inspectionCtrl.controller('logPickCtrl',["$scope", "$timeout", "CodeMirrorOption","NodeReform", "LogXJ", "Dispatch", "Modal","BusiSys", "CV",function($scope, $timeout, CodeMirrorOption,NodeReform, LogXJ, Dispatch, Modal,BusiSys, CV){
    var _log_flag = 0; //日志标志(0:全部日志 1:只有日期的日志)
    var _curr_date = new Date();  //当前日期

    //页面信息
    $scope.info = {
        datepicker:{},         //日期插件
        max_date : _curr_date, //最大日期
        log_pick_info : {      //日志提取信息
            sys_name  : '',    //系统名
            log_name  : '',    //日志名
            node_names: [],    //选择的节点名
            log_id    : '',    //日志id
            begin_date: "",    //开始时间
            end_date  : "",    //结束时间
        },
    };
    //页面控制
    $scope.control = {
        save_base_info    : false,  //保存日志提取基本信息
        save_loading      : false,  //保存按钮加载
        log_batch_loading : false,  //批量下载加载
        choose_all_log    : false,  //选择需所有日志
        check_one_log     : false,  //是否选择一个日志文件
        loading_file      : false,  //加载日志文件信息
        loading_node      : false,  //加载节点信息
    };
    //页面列表数据
    $scope.data={
        sys_list:[],           //系统列表
        log_file_list:[],      //根据系统获取的日志文件列表
        node_ip_list:[],       //节点列表
        pick_log_list:[],      //提取的日志列表
        node_msg_list:[]       //节点信息列表
    };

    //获取选中的节点名
    var getCheckedNodeName = function () {
        var _node_name_list=[];
        angular.forEach($scope.data.node_ip_list,function (item) {
            if(item.checked){
                _node_name_list.push(item.node_name);
            }
        });
        return _node_name_list;
    };
    //处理系统已配的日志节点
    var handleLogNodeList = function (single_log) {
        var _node_name_list = [],_real_node_name_list =[];
        angular.forEach($scope.data.log_file_list,function(item){
            item.checked = false;
        });
        single_log.checked = true;
        if(single_log.logSyncInfos){
            for(var j = 0; j < single_log.logSyncInfos.length; j++){
                var _log_info = single_log.logSyncInfos[j];
                _node_name_list.push(_log_info.node_name);
            }
        }
        if(single_log.log_configs){
            for(var k = 0; k < single_log.log_configs.length; k++){
                var _log_confg = single_log.log_configs[k];
                _node_name_list.push(_log_confg.node_name);
            }
        }
        _real_node_name_list = deleteRepeate(_node_name_list);
        if($scope.data.node_msg_list.length>0){
            for(var p = 0; p < _real_node_name_list.length; p++){
                var _single_node_name = _real_node_name_list[p];
                for(var r = 0; r < $scope.data.node_msg_list.length; r++){
                    var _temp_node_name = $scope.data.node_msg_list[r];
                    if(_single_node_name ==_temp_node_name.node_name){
                        $scope.data.node_ip_list.push(_temp_node_name);
                    }
                }
            }
        }

    };
    //数组去重
    var deleteRepeate=function(node_list){
        var _new_list = [];
        for(var i = 0; i < node_list.length; i++){
            var _node = node_list[i];
            var _repeat = false;
            for(var j = 0; j < _new_list.length; j++){
                var _new = _new_list[j];
                if(_node == _new){
                    _repeat=true;
                    break;
                }
            }
            if(!_repeat){
                _new_list.push(_node);
            }
        }
        return _new_list;
    }
    //格式化日志文件大小
    var formatLogSize = function () {
        angular.forEach($scope.data.pick_log_list,function(item){
            if(parseInt(item.file_length) == 0){
                item.size_str = 0 +"M";
            }else{
                if(parseInt(item.file_length) < 1024){
                    item.size_str = item.file_length + "b";
                }else if(parseInt(item.file_length) > 1024){
                    if(parseInt(item.file_length) < 1024*1024){
                        item.size_str = Math.floor(parseInt(item.file_length) / (1024)) + "kb"
                    }else{
                        item.size_str = Math.floor(parseInt(item.file_length) / (1024 * 1024)) + "M"
                    }
                }
            }
        })
    };
    //初始化
    var init = function(){
        //查询系统列表
        BusiSys.getAllLogBysiness().then(function (data) {
            $timeout(function() {
                $scope.data.sys_list = data.list_bs ||  [];
            }, 0);
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //打开日期插件
    $scope.openDate = function ($event) {
        //同时打开日期选择
        $event.preventDefault();
        $event.stopPropagation();
        $scope.info.datepicker.opened = true;
    };
    //根据系统名获取日志文件列表
    $scope.getFileListBysys = function(sys_name){
        $scope.info.log_pick_info.sys_name = sys_name;
        $scope.data.log_file_list =[];
        $scope.data.node_ip_list = [];
        $scope.data.pick_log_list = [];
        $scope.control.choose_all_log = false;
        $scope.info.log_pick_info.log_name ="";
        $scope.control.loading_file =true;
        BusiSys.getAllLogList(sys_name,_log_flag).then(function (data){
            $timeout(function() {
                $scope.data.log_file_list = data.logBeanList ? data.logBeanList : [];
                $scope.control.loading_file=false;
            }, 0);
        }, function (error) {
            Modal.alert(error.message);
            $scope.control.loading_file=false;
        });
    };
    //选择节点
    $scope.chooseIp=function(curr){
        curr.checked = !curr.checked;
    };
    //选择日志文件
    $scope.chooseLogFile=function(curr){
        if(!$scope.info.log_pick_info.sys_name){
            return false;
        }
        $scope.control.loading_node=true;
        $scope.data.pick_log_list = [];
        //获取节点列表
        NodeReform.getNodeByBusi($scope.info.log_pick_info.sys_name).then(function (data){
            $timeout(function() {
                $scope.data.node_msg_list = data.node_msg_list || [];
                $scope.data.node_ip_list  = [];
                $scope.control.loading_node = false;
                $scope.control.save_base_info = false;
                $scope.info.log_pick_info.log_name = curr.log_name;
                $scope.info.log_pick_info.log_id = curr.log_id;
                handleLogNodeList(curr);
            }, 0);
        }, function (error) {
            Modal.alert(error.message);
            $scope.control.loading_node=false;
        });
    }
    //全选所有的日志文件
    $scope.chooseAllLog = function(flag){
        angular.forEach($scope.data.pick_log_list,function(item){
            item.choose_log = flag;
        });
        if($scope.data.pick_log_list.length > 0){
            $scope.control.check_one_log = flag;
        }
    };
    //选择单个已提取的日志文件
    $scope.choosePickedLog = function(cur){
        var _choose_flag = true,_choose_one_flag = false;
        angular.forEach($scope.data.pick_log_list,function(item){
            if(!item.choose_log){
                _choose_flag = false;
            }else{
                _choose_one_flag=true;
            }
        });
        $scope.control.choose_all_log = _choose_flag;
        $scope.control.check_one_log  = _choose_one_flag;
    };
    //批量下载日志
    $scope.batchDownloadLog=function(){
        if(!CV.valiForm($scope.log_pick_form)){
            return false;
        }
        if($scope.data.pick_log_list.length > 0){
            var _flag = false; //是否选择日志
            for(var i = 0; i < $scope.data.pick_log_list.length; i++){
                var _single_log = $scope.data.pick_log_list[i];
                if(_single_log.choose_log){
                    _flag = true;
                    break;
                }
            }
            if(!_flag){
                Modal.alert("请选择日志");
                return false;
            }
        }
        Modal.confirm("是否批量下载").then(function (data) {
            if (data) {
                var _checked_log_list = [];
                angular.forEach($scope.data.pick_log_list,function(item){
                    if(item.choose_log){
                        _checked_log_list.push(item);
                    }
                });
                $scope.control.log_batch_loading = true;
                LogXJ.combinePickLog(_checked_log_list).then(function (data){
                    $timeout(function() {
                        CV.downloadFile(data.download_url);
                        $scope.control.log_batch_loading = false;
                    },3000);
                }, function (error) {
                    $scope.control.log_batch_loading=false;
                    Modal.alert(error.message);
                });
            }
        });
    };
    //表单提交-获取日志列表
    $scope.formSubmit = function(){
        //表单验证
        if(!CV.valiForm($scope.log_pick_form)){
            return false;
        }
        $scope.info.log_pick_info.node_names = getCheckedNodeName();
        //处理时间数据
        $scope.info.log_pick_info.begin_date = CV.dtFormat($scope.info.log_pick_info.begin_date);
        $scope.info.log_pick_info.end_date = CV.dtFormat($scope.info.log_pick_info.end_date);
        //验证
        if($scope.info.log_pick_info.begin_date > $scope.info.log_pick_info.end_date){
            Modal.alert("开始时间大于结束时间，请重新选择");
            return false;
        }else if(!$scope.info.log_pick_info.log_name){
            Modal.alert("请选择日志文件");
            return false;
        }
        $scope.info.log_pick_info.business_sys_name = $scope.info.log_pick_info.sys_name;
        $scope.control.save_loading = true;
        //获取提取日志文件列表
        LogXJ.savePickTogetFileList($scope.info.log_pick_info).then(function (data){
            $timeout(function() {
                $scope.control.choose_all_log = false;
                $scope.control.save_base_info = true;
                $scope.control.totalItems = data.all_recd;
                $scope.data.pick_log_list = data.logSyncInfoList || [];
                $scope.control.save_loading = false;
                formatLogSize();
            }, 0);
        }, function (error) {
            Modal.alert(error.message);
            $scope.control.save_loading=false;
        });
    };
    //下载日志
    $scope.downLoadLog = function(log){
        var _path = log.download_url;
        Modal.confirm("确认下载?").then(function (data) {
            if(data) {
                CV.downloadFile(_path);
            }
        });
    };
    init();
}]);

/**
 * 日志分析*/
inspectionCtrl.controller('logAnalysisCtrl',["$scope","$cookieStore", "$state", "$window","$location","$interval", "$timeout", "CodeMirrorOption", "LogXJ", "Dispatch", "Modal", "BusiSys", "NodeReform", "CmptFunc", "ScrollBarConfig", "Charts", "newLogTimeStampType", "CV",function($scope,$cookieStore, $state,$window,$location, $interval, $timeout, CodeMirrorOption, LogXJ, Dispatch, Modal, BusiSys, NodeReform, CmptFunc, ScrollBarConfig, Charts, newLogTimeStampType, CV){
    var _cur_keyword_index = 0;     //当前关键字的下标
    var _tem_node_files    = [];    //临时节点文件
    var _old_size          = 500;   //默认页数
    var _old_file          = "";    //记录上次点击的日志文件
    var _screen_log_num    = 0;     //筛选的日志总页数（一页四个）
    var _tem_screen_info   =  {      //日志筛选默认条件
        start_hour:'00',
        start_minutes:'00',
        end_hour:'23',
        end_minutes:'59',
        keywords:"",
        key_line:"",
    };
    var _line_num_ele      = $(".line-num-container");  //行号DOM元素
    //页面信息
    var _tem_log_list      = [];//临时日志对象
    var _log_content_topoffset = 0;//日志内容滚动偏移量
    $scope.info = {
        log_analysis_info : {
            sys_name      : '',     //系统名
            startDate     : '',     //开始日期
            endDate       : '',     //结束日期
            start_hour    : '0',    //开始时间
            start_minutes : '0',    //开始分钟
            end_hour      : '23',   //结束时间
            end_minutes   : '59',   //结束分钟
            log_name      : '',     //日志名
            node_names    : [],     //节点名列表
            is_regular    : false,  //是否是正则
            offset        : 1,      //分页偏移量
            size          : 500,    //数据大小
            page_size     : 500,    // 数据大小
            search_key_word :'',    //关键字
            keywords      : "",     //关键字列表
            keyword       : '',
            context_line  : 1,      //关键行
            is_regular_exps : [],   //是否是正则列表
            choose_ip_list  : [],   //节点下日志文件列表
            log_detail      : [],   //日志详细信息
            file_index      : -1,    //日志下标
            timestamp_exp   : '',    //日期格式
            result_state    : "",    //显示下载情况
            show_result     : false, //显示结果
            error_message   : "",    //显示当前报错信息
            screen_info     : angular.copy(_tem_screen_info),   //条件筛选
        },
        page_info : {
            total_page : 0,   //总页数
            page       : {},  //当前页
        }
    };
    //页面控制
    $scope.control = {
        show_hide_view     : true,         //展示匹配信息
        time_input_err_msg : '',           //日期错误提示
        result_dynamic     : '',           //下载进度
        file_loading       : false,        //切换文件或ip 进行文件内容加载
        page_show          : false,        //分页
        is_pie             : true,         //是否生成饼图
        no_move            : false,        //是否允许点击
        show_keyword_chart : false,        //是否显示关键字图表
        log_search_result_loading : false, //查询下载结果
    };
    //页面配置
    $scope.config = {
        scroll_y_config: ScrollBarConfig.Y(),   //滚动条y轴配置
        scroll_xy_config:ScrollBarConfig.XY()   //滚动条xy轴配置
    };
    //滚动条内容滚动
    $scope.scollbar_callbacks = {
        setLeft: 0,
        setTop:0,
        whileScrolling: function() {
             _log_content_topoffset = Math.abs(this.mcs.top);
            if(_log_content_topoffset){
                _line_num_ele.css({marginTop:-_log_content_topoffset,height: _line_num_ele.height() + _log_content_topoffset});
            }
        }
    };
    //页面数据
    $scope.data = {
        node_ip_list        : [],  //所有的节点列表
        search_key_list     : [],  //关键字列表
        wordCountBeanList   : [],  //生成图标的数据
        log_tab_list        : [],  //所有的日志文件列表
        log_tab_show_list   : [],  //展示的日志文件列表
        ip_file_list        : [],  //储存所有的节点下日志信息
        log_time_stamp_type : newLogTimeStampType, //时间格式
    };
    //将日志条件信息赋值给coookie
    var configLogCondition = function(log_conditions){
        var _tem_log={
            tem_file:log_conditions.tem_file,
            log_condition:log_conditions,
        };
        //替换下标
        var _replace_index=-1;
        if(log_conditions.tem_file){
            for(var i=0;i<_tem_log_list.length;i++){
                var _cur_log=_tem_log_list[i];
                if(_cur_log.tem_file == _tem_log.tem_file){
                    _replace_index=i;
                    break;
                }
            }
            if(_replace_index > -1){
                _tem_log_list.splice(_replace_index,1)
            }
                _tem_log_list.push(_tem_log);
            $cookieStore.put('log_list',_tem_log_list);
        }
    };
    //清空分页信息
    var cancelPage = function () {
        $scope.info.page_info = {};
        $scope.info.log_analysis_info.log_detail=[];
    };
    //配置日志的分页数
    var configPageCount = function (cur_log,cur_show_log,total_line) {
        //当前日志
        cur_log.total_line = total_line;
        //存储环境的日志
        cur_show_log.total_line = total_line;
    };
    //配置筛选取消后数据（log：当前日志，old_index：上一个文件，one_ip_file：存储当前的数据，node_index：节点下标）
    var configCancelScreenInfo = function (event,log,old_index,one_ip_file,node_index) {
        log.checked=false;
        if(old_index > -1){
            //重置选中标志
            if($scope.data.log_tab_list[old_index].modify_option){
                for(var q = 0; q < one_ip_file.length; q++){
                    if(q == old_index){
                        one_ip_file[q].checked=true;
                    }else{
                        one_ip_file[q].checked=false;
                    }
                }
                $scope.changeContentBylog(event,$scope.data.log_tab_list[old_index],old_index);
            }else{
                for(var k = 0; k < one_ip_file.length; k++){
                    one_ip_file[k].checked=false;
                }
            }
        }else{
            //初始化日志文件选中标志
            for(var r = 0; r < $scope.data.ip_file_list[node_index].tem_files.length; r++){
                var _one_file= $scope.data.ip_file_list[node_index].tem_files[r];
                _one_file.checked = false;
            }
        }
    };
    //配置日志下载进度
    var configLogDownloadProcess = function (log,tem_node_index,tem_file_index) {
        log.log_search_result_loading = true;
        log.result_dynamic = 0;
        log.log_search_result_error = "";
        log.error_message = "";
        log.error_mesag = "";
        log.timer=$interval(function () {
            if(log.result_dynamic < 90){
                log.result_dynamic = log.result_dynamic+10;
            }
        }, 1200);
        $scope.info.log_analysis_info.error_message = "";
        $scope.data.ip_file_list[tem_node_index].tem_files[tem_file_index].log_search_result_error = false;
        $scope.data.ip_file_list[tem_node_index].tem_files[tem_file_index].log_search_result_loading = true;
        $scope.data.ip_file_list[tem_node_index].tem_files[tem_file_index].error_message = "";
        $scope.data.ip_file_list[tem_node_index].tem_files[tem_file_index].error_mesag = "";
    };
    //配置进度错误信息
    var configProcessErrorMsg = function (log,tem_node_index,tem_file_index,error) {
        $scope.control.no_move = false;
        $scope.info.log_analysis_info.show_result = true;
        $scope.data.log_tab_list[tem_file_index].error_mesag = error.message;
        $scope.info.log_analysis_info.error_message = error.message;
        $scope.data.ip_file_list[tem_node_index].tem_files[tem_file_index].error_mesag = error.message;
        log.log_search_result_loading = false;
        log.log_search_result_error = true;
        cleanAllShowMessage();
        $interval.cancel(log.timer);
    };
    //关键字搜索
    var keywordSearch = function (key_word) {
        //将关键字高亮
        if(!key_word){
            return false;
        }
        var _row_element_list = $('.log-data-row');
        for(var k = 0; k < _row_element_list.length; k++){
            var _row = $(_row_element_list[k]).children(":last");
            var _regexp = new RegExp(key_word,"g");
            var _reg_new_html= _row.text().replace(_regexp,function(word){
                return '<strong  id="keyword-'+k+'" class="log-keyword-high-light keyword-mark">' +word+ "</strong>";
            });
            _row.html(_reg_new_html);
        }
    };
    //关键字滚动控制
    var keywordScrollToView = function (keyword_ele) {
        $timeout(function () {
            $scope.scrollToView(keyword_ele);
        },50);
    };
    //重置行号滚动高度
    var resetLineNumContainerHeight = function () {
        _log_content_topoffset = 0;
        _line_num_ele.css({marginTop:0,height: 'auto'})
    };
    //清空所有的信息
    var cleanAllShowMessage = function () {
        $scope.info.log_analysis_info.log_detail = [];
        $scope.data.search_key_list = [];
    }
    //数组转字符串
    var listToString = function (obj, keys){
        var n = keys.length, key = [];
        while(n--){
            key.push(obj[keys[n]]);
        }
        return key.join('|');
    };
    //数组去重
    var listNoRepeat = function (array,keys){
        var arr = [];
        var hash = {};
        for (var i = 0, j = array.length; i < j; i++) {
            var k = listToString(array[i],keys);
            if (!(k in hash)) {
                hash[k] = true;
                arr.push(array[i]);
            }
        }
        return arr;
    };
    //匹配时间格式枚举
    var equalIsInStamp = function(time_format_str){
        var _flag = false;
        for(var i = 0; i < $scope.data.log_time_stamp_type.length; i++){
            var _time = $scope.data.log_time_stamp_type[i];
            var _value =_time.value.substring(0,_time.value.indexOf('('));
            if(time_format_str ==_value){
                _flag=true;
                break;
            }
        }
        return _flag;
    }
    //获取关键字所在的行号
    var getAllSearchLineByKey = function (key_word) {
        var _keyword_element_list = $('.keyword-mark');
        var _key_list = key_word.split("|");
        var _list = [];
        for(var k = 0; k < _key_list.length; k++){
            for(var i = 0; i < _keyword_element_list.length; i++){
                var _row = $(_keyword_element_list[i]);
                var _regexp = new RegExp(_key_list[k],"g");
                if(_regexp.test(_row.text())){
                    var _number = $(_row).parent().siblings('.inner-row-num').text();
                    var _count = $(_row).parent().siblings('.inner-row-num').attr("dataid");
                    var _show_one = {
                        line_count:_number,
                        key_word:_key_list[k],
                        index_count:_count,
                        checked:false,
                    };
                    _list.push(_show_one);
                }
            }
        }
        return listNoRepeat(_list, ['line_count','key_word']);
    };
    //根据数据生成分页查询
    var createPageNumber = function (page_info,total_page) {
        var _length = total_page < 5 ? total_page:5;
        if( $scope.info.log_analysis_info.offset > total_page){
            $scope.info.log_analysis_info.offset=1;
        }
        page_info.page = {
            numbers:total_page,
            current_page: $scope.info.log_analysis_info.offset ? $scope.info.log_analysis_info.offset : 1,
            show_page:[],
        };
        for(var i = 1; i <= _length; i++){
            page_info.page.show_page.push({key:i,value:i})
        }
        $timeout(function(){
            page_info.page_number_show = true;
        },1000);
    };
    //初始化分页数
    var initCreatePageNumber = function (page_info,total_page,cur_page) {
        cur_page = parseInt(cur_page);
        var _length = ( total_page-cur_page) < 4 ? ( total_page-cur_page) : 4;
        if( $scope.info.log_analysis_info.offset > total_page){
            $scope.info.log_analysis_info.offset=1;
        }
        page_info.page = {
            numbers:total_page,
            current_page: cur_page ? cur_page: 1,
            show_page:[],
        };
        for(var i = cur_page; i <= cur_page + _length; i++){
            page_info.page.show_page.push({key:i,value:i})
        }
        //加上前面的数据
        var _tem_list_length = page_info.page.show_page.length;
        var _real_judege = 5 - _tem_list_length;
        if(cur_page - _tem_list_length >= -2){
            var _tem_count = 0;
            for(var j = cur_page; j < cur_page + _real_judege; j++){
                _tem_count = _tem_count + 1;
                if(cur_page - _tem_count > 0){
                    page_info.page.show_page.unshift({key:cur_page-_tem_count,value:cur_page-_tem_count})
                }
            }
        }
        $timeout(function(){
            page_info.page_number_show = true;
        },1000);
    };
    //查询对应的分页信息
    var getInfoByPage = function (obj) {
        //分页数据生成
        $scope.info.log_analysis_info.offset = obj.page.current_page;
        cleanAllShowMessage();
        if($scope.info.log_analysis_info.log_name){
            $scope.control.file_loading = true;
            var _submit_info = configLogPageCondition();
            var _tem_log = $scope.data.log_tab_list[$scope.info.log_analysis_info.file_index];
            $timeout(function(){
                getContentByCondition(_submit_info,_tem_log,1,1,"");
            },1500)
        }
    };
    //列表每项加index
    var configIndexToList = function (list,attr) {
        for(var i = 0; i < list.length; i++){
            var _list = list[i];
            _list[attr] = i;
        }
    };
    //格式化时间字符串
    var formatTimeStr = function (time) {
        var _time = "";
        if(time.length == 0){
            _time="";
        }else if(time.length == 1){
            _time ="0" + time;
        }else if(time.length==2){
            _time = time;
        }
        return _time;
    };
    //配置筛选条件
    var configScreen = function () {
        var _file_index=$scope.info.log_analysis_info.file_index != -1 ? $scope.info.log_analysis_info.file_index : 0;
        var _node_index= $scope.info.log_analysis_info.node_index != -1 ? $scope.info.log_analysis_info.node_index :0;
        var _screen_info = {}; //筛选对象
        if($scope.data.log_tab_list.length > 0){
            var _config_info=$scope.data.ip_file_list[_node_index].tem_files[_file_index];
            var _separator = ":"; //分隔符
            if(_config_info.start_time.charAt(2) ==":"){
                _separator = ":";
            }else{
                _separator = "-";
            }
            _screen_info = {
                start_hour:_config_info.start_time.split(_separator)[0] ? _config_info.start_time.split(_separator)[0] :'00',
                start_minutes:_config_info.start_time.split(_separator)[1] ? _config_info.start_time.split(_separator)[1] :'00',
                end_hour:_config_info.end_time.split(_separator)[0] ? _config_info.end_time.split(_separator)[0] :'23',
                end_minutes:_config_info.end_time.split(_separator)[1] ? _config_info.end_time.split(_separator)[1] :'59',
                keywords:_config_info.keywords ? _config_info.keywords:"",
                key_line: _config_info.context_line ? _config_info.context_line : "",
            };
        }else{
            _screen_info= _tem_screen_info;
        }
        return _screen_info;
    };
    //处理单个日志文件的筛选信息
    var handleSingleFileScreenInfo = function (single_log_screen) {
        var _file_index=$scope.info.log_analysis_info.file_index != -1 ? $scope.info.log_analysis_info.file_index : 0;
        var _node_index= $scope.info.log_analysis_info.node_index != -1 ? $scope.info.log_analysis_info.node_index :0;
        if($scope.data.log_tab_list.length > 0){
            var _config_info = $scope.data.ip_file_list[_node_index].tem_files[_file_index];
            if($scope.data.ip_file_list[_node_index].tem_files.length > 0){
                for(var k = 0; k < $scope.data.ip_file_list[_node_index].tem_files.length; k++){
                    $scope.data.ip_file_list[_node_index].tem_files[k].checked=false;
                }
            }
            _config_info.start_time = single_log_screen.start_time ?  single_log_screen.start_time : "";
            _config_info.end_time   = single_log_screen.end_time ?  single_log_screen.end_time : "";
            _config_info.keywords   = single_log_screen.keywords ?  single_log_screen.keywords : "";
            _config_info.context_line = single_log_screen.context_line ?  single_log_screen.context_line : 0;
            _config_info.checked = true;
            _config_info.modify_option = true;
        }
        if($scope.data.log_tab_list.length > 0){
            for(var i = 0; i < $scope.data.log_tab_list.length; i++){
                $scope.data.log_tab_list[i].checked=false;
            }
            $scope.data.log_tab_list[_file_index].checked=true;
        }
    };
    //改变日志文件的选中属性
    var changeIpFileListChecked = function (node_index,one) {
        var _one_ip_list = $scope.data.ip_file_list[node_index];
        for(var i = 0; i < _one_ip_list.tem_files.length; i++){
            var _one_file = _one_ip_list.tem_files[i];
            if(one.tem_file == _one_file.tem_file){
                _one_file.checked=true;
            }else{
                _one_ip_list.tem_files[i].checked=false;
            }
        }
    };
    //调取服务-查询数据
    var configCondition = function (event,log,_old_index,one_ip_file,node_index) {
        //不允许点击其他文件
        $scope.control.no_move = true;
        var _tem_node_index = angular.copy($scope.info.log_analysis_info.node_index);
        var _tem_file_index = angular.copy($scope.info.log_analysis_info.file_index);
        var _tem_ip_file    = angular.copy($scope.data.ip_file_list[_tem_node_index]);
        var _tem_new_obj    = angular.copy($scope.data.ip_file_list[_tem_node_index].tem_files[_tem_file_index]);
        _tem_new_obj.node_name = _tem_ip_file.node_name;
        _tem_new_obj.sys_name  = $scope.info.log_analysis_info.sys_name;
        _tem_new_obj.node_ip   = _tem_ip_file.soc_ip;
        _tem_new_obj.lines     = _tem_new_obj.context_line;
        if(_tem_new_obj.timestamp.charAt(11)){
            if(_tem_new_obj.timestamp.charAt(11) == '-'){
                _tem_new_obj.start_time = _tem_new_obj.start_time.replace(/:/g,"-");
                _tem_new_obj.end_time   = _tem_new_obj.end_time.replace(/:/g,"-");
                _tem_new_obj.finish_time = '23-59-59';
            }else{
                _tem_new_obj.finish_time = '23:59:59';
            }
        }
        //在线分析服务
        var _one_show = $scope.data.log_tab_list[$scope.info.log_analysis_info.file_index];
        //当前显示
        for(var i = 0; i < $scope.data.log_tab_list.length; i++){
            $scope.data.log_tab_list[i].log_search_result_loading=false;
        }
        configLogDownloadProcess(_one_show,_tem_node_index,_tem_file_index);
        $timeout(function(){
            //显示当前分页数为0;
            $scope.info.log_analysis_info.offset = 1;
            _tem_new_obj.offset   = 1;
            _tem_new_obj.size     = $scope.info.log_analysis_info.page_size;
            _tem_new_obj.log_name = _tem_new_obj.file;
            LogXJ.getAnalysisByNodeFiles(_tem_new_obj).then(function(data) {
                $scope.control.no_move = false;
                _tem_new_obj.local_path = data.local_path;
                _tem_new_obj.remote_path = data.remote_path;
                _tem_new_obj.server_flag = 1;
                var _show_msg = data.result.msg ? data.result.msg :"";
                var _is_exist = _show_msg.indexOf("exist") >= 0;
                var _is_big_file = _show_msg.indexOf("G") >= 0;
                _one_show.result_dynamic = 100;
                _one_show.log_search_result_loading = false;
                one_ip_file[_tem_file_index].log_search_result_loading = false;
                _one_show.log_search_result_error = false;
                if(!_is_exist){
                    //大文件需要提示下载
                    if(_is_big_file){
                        Modal.confirm("[" + data.result.msg + "]是否下载文件？").then(function () {
                            configLogDownloadProcess(_one_show,_tem_node_index,_tem_file_index);
                            $scope.control.no_move = true;
                            LogXJ.OnlineScreen(_tem_new_obj).then(function(data){
                                //状态为2，表明下载错误
                                _one_show.result_dynamic = 100;
                                $timeout(function(){
                                    _one_show.log_search_result_loading=false;
                                    one_ip_file[_tem_file_index].log_search_result_loading=false;
                                },1000);
                                //成功状态
                                if(data.log_status!=2){
                                    $scope.info.log_analysis_info.result_state=data.log_status;
                                    _one_show.log_search_result_error=false;
                                    $scope.control.file_loading=true;
                                    getContentByCondition(_tem_new_obj,log,2,2,one_ip_file);
                                }else{
                                    configLogCondition(_tem_new_obj);
                                    var _error={
                                        message:data.log_message ? data.log_message  :"下载失败" ,
                                    };
                                    //下载错误
                                    configProcessErrorMsg(_one_show,_tem_node_index,_tem_file_index,_error);
                                }
                            },function(error){
                                $scope.control.no_move=false;
                                configProcessErrorMsg(_one_show,_tem_node_index,_tem_file_index,error);
                            });
                        },function(data){
                            //点击取消
                            configCancelScreenInfo(event,log,_old_index,one_ip_file,node_index);
                            //将是否筛选改为false
                            log.modify_option=false;
                            one_ip_file[_tem_file_index].modify_option=false;
                            one_ip_file[_tem_file_index].log_search_result_loading=false;
                        })
                    }else{
                        configLogDownloadProcess(_one_show,_tem_node_index,_tem_file_index);
                        $scope.control.no_move=true;
                        LogXJ.OnlineScreen(_tem_new_obj).then(function(data){
                            //状态为2，表明下载错误
                            _one_show.result_dynamic=100;
                            $timeout(function(){
                                _one_show.log_search_result_loading=false;
                                one_ip_file[_tem_file_index].log_search_result_loading=false;
                            },1000);
                            if(data.log_status!=2){
                                // $scope.control.no_move=false;
                                $scope.info.log_analysis_info.result_state=data.log_status;
                                _one_show.log_search_result_error=false;
                                $scope.control.file_loading=true;
                                cleanAllShowMessage();
                                //查询
                                getContentByCondition(_tem_new_obj,log,2,2,one_ip_file);
                            }else{
                                var _error={
                                    message:data.log_message ? data.log_message  :"下载失败" ,
                                };
                                //下载错误
                                configProcessErrorMsg(_one_show,_tem_node_index,_tem_file_index,_error);
                            }
                        },function(error){
                            $scope.control.no_move = false;
                            configProcessErrorMsg(_one_show,_tem_node_index,_tem_file_index,error);
                        });
                    }
                }else{
                    $scope.control.file_loading = true;
                    cleanAllShowMessage();
                    getContentByCondition(_tem_new_obj,log,2,2,one_ip_file);
                }
                $interval.cancel(_one_show.timer);
            }, function(error) {
                configLogCondition(_tem_new_obj);
                configProcessErrorMsg(_one_show,_tem_node_index,_tem_file_index,error)
            });
        },1000)
    };
    //初始化文件条件信息
    var initIpFileList = function (list) {
        var _tem_list = [];
        //筛选
        var _tem_screen = {
            start_hour:'00',
            start_minutes:'00',
            end_hour:'23',
            end_minutes:'59',
            keywords:"",
            key_line:0,
        };
        var _start_time = formatTimeStr(_tem_screen.start_hour)+":"+formatTimeStr(_tem_screen.start_minutes)+":00";
        var _end_time = formatTimeStr(_tem_screen.end_hour)+":"+formatTimeStr(_tem_screen.end_minutes)+":59";
        for(var i = 0; i < list.length; i++){
            var _tem_node = {
                node_name:'',
                tem_files:[],
                node_index:0,
                soc_ip:"",
            };
            var _one_file = list[i];
            _tem_node.node_name = _one_file.node_name;
            _tem_node.soc_ip = _one_file.soc_ip;
            for(var k = 0; k <_one_file.checked_files.length; k++){
                var _tem_file = _one_file.checked_files[k];
                var _tem_path = _tem_file.path+"/"+_tem_file.file;
                var _tem_format = "";
                if(equalIsInStamp(_tem_file.date_format_show)){
                    _tem_format=_tem_file.date_format;
                }else{
                    _tem_format=_tem_file.date_format_show;
                }
                var _file_obj = {
                    tem_file : _tem_file.file || "",
                    encoding : _tem_file.word_coding || "",
                    file     : _tem_path || "",
                    lines    : _tem_screen.key_line,
                    key_word : _tem_screen.keywords,
                    start_time : _start_time,
                    timestamp  : _tem_format ? _tem_format :"",
                    end_time   : _end_time,
                    result_dynamic : 0,
                    log_search_result_loading:false,
                };
                _tem_node.tem_files.push(_file_obj);
            };
            _tem_list.push(_tem_node);
        }
        configIndexToList(_tem_node_files,'node_index');
        return _tem_list;
    };
    //配置日志分页条件
    var configLogPageCondition = function () {
        var _submit_log_analysis = angular.copy($scope.info.log_analysis_info);
        var _file_index = $scope.info.log_analysis_info.file_index != -1 ? $scope.info.log_analysis_info.file_index : 0;
        var _node_index = $scope.info.log_analysis_info.node_index != -1 ? $scope.info.log_analysis_info.node_index :0;
        var _config_info = $scope.data.ip_file_list[_node_index].tem_files[_file_index];
        if(_config_info.timestamp.charAt(11)){
            if(_config_info.timestamp.charAt(11) == '-'){
                _config_info.start_time = _config_info.start_time.replace(/:/g,"-");
                _config_info.end_time = _config_info.end_time.replace(/:/g,"-");
            }else{

            }
        }
        _submit_log_analysis.start_time = _config_info.start_time || "";
        _submit_log_analysis.end_time   = _config_info.end_time || "";
        _submit_log_analysis.keywords   = _config_info.keywords || "";
        _submit_log_analysis.context_line = _config_info.context_line || 0;
        _submit_log_analysis.node_name    = $scope.data.ip_file_list[_node_index].node_name;
        _submit_log_analysis.log_name     = _config_info.file;
        _submit_log_analysis.size         = $scope.info.log_analysis_info.page_size;
        return _submit_log_analysis;
    };
    //配置当前展示日志的信息
    var configCurLogInfo = function (data) {
        $scope.info.log_analysis_info.log_name = "";
        $scope.info.log_analysis_info.search_key_word = "";
        $scope.info.log_analysis_info.show_result = false;
        $scope.info.log_analysis_info.log_name = "";
        $scope.info.log_analysis_info.choose_ip_list = data.choose_ip_list || [];
        $scope.info.log_analysis_info.sys_name = data.sys_name;
        if($scope.info.log_analysis_info.choose_ip_list.length > 0){
            $scope.info.log_analysis_info.soc_ip = data.choose_ip_list[0].soc_ip;
            $scope.selectLogIp($scope.info.log_analysis_info.soc_ip);
            var _temp_time_format = "";
            if($scope.info.log_analysis_info.choose_ip_list[0].checked_files.length>0){
                var _tem_file_sec=$scope.info.log_analysis_info.choose_ip_list[0].checked_files[0];
                if(equalIsInStamp(_tem_file_sec.date_format_show)){
                    _temp_time_format = _tem_file_sec.date_format;
                }else{
                    _temp_time_format = _tem_file_sec.date_format_show;
                }
            }
            $scope.info.log_analysis_info.timestamp_exp = _temp_time_format;
        }
    };
    //根据筛选条件获取数据(log_line_flag:1:没有总行数2：有总行数   log_page_flag:是否重刷分页1不刷，2：刷)
    var getContentByCondition = function (submit_log_analysis,log,log_line_flag,log_page_flag,one_ip_file) {
        $scope.control.file_loading = true;
        configLogCondition(submit_log_analysis);
        LogXJ.getLogBypage(submit_log_analysis).then(function(data){
            $scope.control.file_loading = false;
            $scope.data.search_key_list = [];
            $scope.control.no_move      = false;
            $scope.control.page_show    = true;
            $scope.info.log_analysis_info.search_key_word  = '';
            $scope.info.log_analysis_info.error_message = "";
            if(log_line_flag == 1){
                if(data){
                    $scope.info.log_analysis_info.log_detail = data.beanList || [];
                    var _page_count_one = Math.ceil(parseInt(log.total_line)/parseInt($scope.info.log_analysis_info.page_size));
                    $scope.data.total_line = log.total_line;
                    $scope.info.page_info.total_page = _page_count_one;
                    //分页
                    if(log_page_flag==2){
                        createPageNumber($scope.info.page_info,_page_count_one);
                    }
                }
            }else if(log_line_flag == 2){
                var _tem_file_index = angular.copy($scope.info.log_analysis_info.file_index);
                var _one_show = $scope.data.log_tab_list[$scope.info.log_analysis_info.file_index];
                //只允许显示和当前所选日志一直的筛选信息
                if(data && ($scope.info.log_analysis_info.log_name == submit_log_analysis.file)){
                    cleanAllShowMessage();
                    $scope.info.log_analysis_info.show_result = true;
                    $scope.info.log_analysis_info.log_detail  = data.beanList || [];
                    $scope.data.total_line  = parseInt(data.page_numeber);
                    configPageCount(one_ip_file[_tem_file_index],_one_show,data.page_numeber);
                    var _page_count = Math.ceil(parseInt(data.page_numeber)/parseInt($scope.info.log_analysis_info.page_size));
                    $scope.info.page_info.total_page = _page_count;
                    //分页
                    createPageNumber($scope.info.page_info,_page_count);
                    $scope.control.page_show = true;
                }
            }
            /*初始化滚动条*/
            if(data.beanList){
                $scope.scollbar_callbacks.setLeft = 0;
                $scope.scollbar_callbacks.setTop = 0;
                resetLineNumContainerHeight();
            }
        },function(error){
            $scope.control.no_move = false;
            $scope.control.file_loading = false;
            cleanAllShowMessage();
        });
    };
    var init = function () {
        //$cookieStore.put('log_list',[]);
        //清除日志文件
        LogXJ.deleteLogAnalysisFile().then(function (data){

        }, function (error) {
        });
        //查询业务系统
        BusiSys.getAllBusinessSys().then(function (data){
            $timeout(function() {
                $scope.data.busys_list = data.list_bs ? data.list_bs : [];
                if(data.list_bs){
                    angular.forEach($scope.data.busys_list,function(data){
                        data.checked = false;
                    })
                }
            }, 0);

        }, function (error) {

        });
        $scope.changeHeight(1);
        $scope.changeHeight(2);
    };
    //日志选择
    $scope.selectLog = function () {
        Modal.configLogBase($scope.info.log_analysis_info.sys_name,$scope.info.log_analysis_info.choose_ip_list).then(function(data){
            if(data){
                cancelPage();
                //配置节点文件信息列表
                $scope.data.ip_file_list = initIpFileList(data.choose_ip_list);
                //清空展示日志信息
                cleanAllShowMessage();
                //配置当前展示日志的信息
                configCurLogInfo(data);
            }
        });
    };
    //打开日志筛选条件模态框
    $scope.showScreenModal = function(event,index,log){
        event.stopPropagation();
        //上一个文件下标
        var _old_index = $scope.info.log_analysis_info.file_index;
        if($scope.control.no_move){
            return false;
        }else{
            $scope.info.log_analysis_info.show_result = false;
            angular.forEach($scope.data.log_tab_list,function (item) {
                item.checked = false;
            });
            log.checked = true;
            $scope.info.log_analysis_info.error_message = log.error_mesag || "";
            $scope.info.log_analysis_info.file_index = index;
            $scope.info.log_analysis_info.log_name = log.file;
            var _tem_node_index = angular.copy($scope.info.log_analysis_info.node_index);
            var _tem_file_index = angular.copy($scope.info.log_analysis_info.file_index);
            var one_ip_file=$scope.data.ip_file_list[_tem_node_index].tem_files;
            for(var m=0;m<one_ip_file.length;m++){
                if(m==_tem_file_index){
                    one_ip_file[m].checked=true;
                }else{
                    one_ip_file[m].checked=false;
                }
            }
            if(_old_file != log.file){
                cleanAllShowMessage();
            }
            _old_file = log.file;
            $scope.info.log_analysis_info.screen_info = configScreen();
            Modal.configScreenBase($scope.info.log_analysis_info.screen_info).then(function(data){
                if(data){
                    $scope.control.no_move = false;
                    _old_file = log.file;
                    $scope.info.log_analysis_info.log_name=log.file;
                    $scope.info.log_analysis_info.screen_info=data;
                    _tem_screen_info=data;
                    //筛选保存info
                    var _start_time = formatTimeStr(data.start_hour)+":"+formatTimeStr(data.start_minutes)+":00";
                    var _end_time = formatTimeStr(data.end_hour)+":"+formatTimeStr(data.end_minutes)+":59";
                    $scope.info.log_analysis_info.start_time=_start_time;
                    $scope.info.log_analysis_info.end_time=_end_time;
                    $scope.info.log_analysis_info.keywords=data.keywords ? data.keywords: "";
                    $scope.info.log_analysis_info.context_line=data.key_line ? data.key_line : 0;
                    //赋值当前
                    handleSingleFileScreenInfo($scope.info.log_analysis_info);
                    log.modify_option=true;
                    //判断是否调取服务
                    if($scope.data.log_tab_list.length > 0){
                        //调取服务
                        configCondition(event,log,_old_index,one_ip_file,_tem_node_index);
                    }
                }
            },function(data){
                $scope.control.no_move = false;
                //配置取消后数据（log：当前日志，old_index：上一个文件，one_ip_file：存储当前的数据，_tem_node_index：节点下标）
                configCancelScreenInfo(event,log,_old_index,one_ip_file,_tem_node_index);
            })
        }
    };
    //切换筛选的日志-上页
    $scope.changeScreenLogPrev = function (length) {
        if(length - _screen_log_num <= 4){
            return false;
        }
        _screen_log_num ++;
        $('#log_tab').animate({'margin-left':-(_screen_log_num*100)+'px'});
    };
    //切换筛选的日志-下页
    $scope.changeScreenLogNext = function (length) {
        if(_screen_log_num == 0){
            return false;
        }
        _screen_log_num--;
        $('#log_tab').animate({'margin-left':-(_screen_log_num*100)+'px'});
    };
    //根据日志筛选条件改变内容
    $scope.changeContentBylog = function (event,log,index) {
            //控制日志下载，只有一个在下载
            if($scope.control.no_move){
                return false;
            }else{
                //初始日志tab选中状态
                angular.forEach($scope.data.log_tab_list,function (item) {
                    item.checked = false;
                    item.log_search_result_loading = false;
                });
                log.checked = true;
                if(!log.modify_option){
                    $scope.showScreenModal(event,index,log);
                }else{
                    //切换tab切换不同的日志，赋值文件下标，当前日志名字
                    $scope.info.log_analysis_info.file_index = index;
                    $scope.info.log_analysis_info.log_name = log.file;
                    //显示日志下载情况
                    if(log.result_dynamic>0 && log.result_dynamic<100){
                        log.log_search_result_loading = true;
                    }
                    //存储日志文件信息
                    changeIpFileListChecked($scope.info.log_analysis_info.node_index,log);
                    //如果重复点击就是当前不调取服务
                    if(_old_file == log.file){
                        return false;
                    }
                    //控制当前分页页数为0
                    $scope.info.log_analysis_info.offset = 1;
                    cleanAllShowMessage();
                    _cur_keyword_index = 0;
                    $scope.control.file_loading = true;
                    $scope.control.no_move = true;
                    var _submit_log_analysis = configLogPageCondition();
                    //保存当前选中的数值
                    _old_file = log.file;
                    //只有下载成功的，才可以再次切换
                    if($scope.info.log_analysis_info.result_state && !log.error_mesag){
                        $scope.control.page_show = false;
                        getContentByCondition(_submit_log_analysis,log,1,2,"");
                    }else{
                        $scope.control.no_move=false;
                        $scope.control.error_loading = true;
                        $timeout(function(){
                            $scope.info.log_analysis_info.error_message= $scope.data.log_tab_list[index].error_mesag;
                            $scope.control.error_loading = false;
                        },1000);
                        $scope.control.file_loading = false;
                    }
                }
            }
    };
    //右击事件
    $scope.anotherPageLog=function(log,index){
        var _real_log=false;
            for(var i = 0;i < _tem_log_list.length;i++) {
                var _tem_single_log = _tem_log_list[i];
                if (_tem_single_log.tem_file == log.tem_file) {
                    _real_log=true;
                    break;
                }
            }
        if(_real_log){
            var userName = $location.absUrl().substring($location.absUrl().indexOf("?")+1);
            var realName=userName.substring(0,userName.indexOf("#"));
            $window.open ("views/inspection/log/log_monitor.html?userName="+realName+"&log_name="+log.tem_file +"=true", "_blank", "height=700, width=900, toolbar=no, menubar=no, scrollbars=yes, resizable=no," + " location=no," + " status=no")
        }else{
            Modal.alert("请先下载日志");
            return false;
        }
    };
    //选择日志节点-切换日志列表
    $scope.selectLogIp = function (selectKey) {
        $scope.control.page_show = false;
        $scope.info.log_analysis_info.error_message ="";
        $scope.info.log_analysis_info.show_result = false;
        $scope.data.log_tab_list = [];
        $scope.data.log_tab_show_list = [];
        cancelPage(); cleanAllShowMessage();

        var _tem_ip_log,_curr_log,_curr_errmg,_find_log_flag = false;
        for(var i = 0; i < $scope.data.ip_file_list.length; i++){
            var _one_log = $scope.data.ip_file_list[i];
            if(_one_log.soc_ip == selectKey){
                _tem_ip_log = _one_log;
                $scope.info.log_analysis_info.node_index = i;
                break;
            }
        }
        $scope.data.log_tab_list = angular.copy(_tem_ip_log.tem_files) || [];
        for(var k = 0; k < $scope.data.log_tab_list.length; k++){
            var _log = $scope.data.log_tab_list[k];
            _log.log_search_result_loading = false;
            if(_log.checked && _log.modify_option){
                _find_log_flag = true;
                _log.log_search_result_loading = false;
                _curr_errmg = _log.error_mesag || "";
                $scope.info.log_analysis_info.file_index = k;
                _old_file = _log.file;
                _curr_log  = _log;
            }
        }
        if(_curr_errmg){
            $scope.info.log_analysis_info.error_message = _curr_errmg;
        }
        $timeout(function(){
            if($scope.info.log_analysis_info.log_name && _find_log_flag && !_curr_errmg){
                $scope.control.file_loading = true;
                $scope.info.log_analysis_info.offset = 1;
                var _submit_info = configLogPageCondition();
                $timeout(function(){
                    cleanAllShowMessage();
                    getContentByCondition(_submit_info,_curr_log,1,2,"");
                },1500)
            }
        },200)
    };
    //切换关键字表格(显示隐藏)
    $scope.toggleKeywordTable = function () {
        $scope.control.show_hide_view = !$scope.control.show_hide_view;
    };
    //清除搜索关键字
    $scope.clearKeyword = function () {
        $scope.info.log_analysis_info.search_key_word='';
    };
    //改变搜多关键字每页显示的个数(flag：1，直接调取服务2.判断页数)
    $scope.changeSinglePageKeywordContent = function (page_size,flag) {
        if(flag == 2){
            if(!page_size){
                $scope.info.log_analysis_info.page_size = _old_size;
                page_size=_old_size;
                return false;
            }else{
                if(isNaN(page_size)){
                    Modal.alert("输入不合法");
                    $scope.info.log_analysis_info.page_size = _old_size;
                    page_size=_old_size;
                    return false
                }
                if(parseInt(page_size) == 0){
                    Modal.alert("每页显示至少为1行");
                    $scope.info.log_analysis_info.page_size = _old_size;
                    page_size=_old_size;
                    return false
                }
                if(page_size>1000){
                    Modal.alert("每页最多1000行");
                    $scope.info.log_analysis_info.page_size = _old_size;
                    page_size=_old_size;
                    return false;
                }
            }
            if(_old_size==page_size){
                return false;
            }else{
                _old_size=page_size;
            }
        }
        $scope.info.log_analysis_info.size = page_size;
        //当前文件是否下载标志
        var _is_down_load = false;
        if($scope.data.log_tab_list.length>0){
            _is_down_load=$scope.data.log_tab_list[$scope.info.log_analysis_info.file_index].modify_option;
        }
        if($scope.info.log_analysis_info.log_name && _is_down_load){
            $scope.control.file_loading = true;
            $scope.control.page_show = false;
            $scope.info.log_analysis_info.offset = 1;
            var _submit_info=configLogPageCondition();
            cleanAllShowMessage();
            $timeout(function(){
                var _tem_log = $scope.data.log_tab_list[$scope.info.log_analysis_info.file_index];
                getContentByCondition(_submit_info,_tem_log,1,2,"");
            },1500);
        }
    };
    //生成图表报告
    $scope.generateReportChart = function () {
        //表单验证
        if(!CV.valiForm($scope.log_analysis_form)){
            return false;
        }
        if(!$scope.info.log_analysis_info.result_state){
            Modal.alert("请完善条件信息");
            return false;
        } else if(!$scope.info.log_analysis_info.search_key_word){
            Modal.alert("请完善关键字信息");
            return false;
        }
        var _curr_keyword_info = {}, _submit_file;;
        if($scope.data.ip_file_list.length > 0){
            var _file_index = $scope.info.log_analysis_info.file_index != -1 ? $scope.info.log_analysis_info.file_index : 0;
            var _node_index = $scope.info.log_analysis_info.node_index != -1 ? $scope.info.log_analysis_info.node_index :0;
            var _config_info = $scope.data.ip_file_list[_node_index].tem_files[_file_index];
            var _node_name = $scope.data.ip_file_list[_node_index].node_name;
            var _start_time = _config_info.start_time;
            var _end_time = _config_info.end_time;
            var _key_word = _config_info.keywords;
            var _context_line = _config_info.context_line;
            var tem_file = _config_info.file;
            if(_start_time.indexOf(':')>0){
                _submit_file=_node_name.replace(/\./g,'')+_start_time.replace(new RegExp(/(:)/g),'')+_end_time.replace(new RegExp(/(:)/g),'')+_key_word+_context_line+tem_file;
            }else{
                _submit_file=_node_name.replace(/\./g,'')+_start_time.replace(new RegExp(/(-)/g),'')+_end_time.replace(new RegExp(/(-)/g),'')+_key_word+_context_line+tem_file;
            }
            //切换日志文件
            _curr_keyword_info = {
                log_name:tem_file,
                encoding:"",
                node_file:_submit_file || "",
                timestamps:_config_info.timestamp,
                keywords:$scope.info.log_analysis_info.search_key_word,
                is_regular_exp:$scope.info.log_analysis_info.is_regular
            }
        };
        if(!_curr_keyword_info.node_file){
            Modal.alert("请完善日志选择信息");
            return false;
        }
        $scope.control.show_keyword_chart = true;
        $state.go('inspection_log_analysis.keyword_chart',{keyword_info:_curr_keyword_info});
    };
    //分页切换-到固定的页
    $scope.switchPageToPageNum = function (page,obj) {
        obj.page.current_page = page.value;
        switch (page.key){
            case 1:
                if(page.value>0 && page.value < (obj.page.numbers-1)){
                    obj.page.show_page = [
                        {key:1,value:page.value},{key:2,value:page.value+1},{key:3,value:page.value+2},{key:4,value:page.value+3}
                    ];
                }
                break;
            case 4:
                if(page.value>2 && page.value < obj.page.numbers-1){
                    obj.page.show_page = [
                        {key:1,value:page.value-2},{key:2,value:page.value-1},{key:3,value:page.value},{key:4,value:page.value+1}
                    ];
                }
                break;
            default:;
        };
        getInfoByPage(obj);
    };
    //上下页切换
    $scope.nextPage = function (flag,obj) {
        if(!flag){
            if(obj.page.current_page == 1){
                Modal.alert("已是最前一页");
                return ;
            }else{
                for(var i = 0; i < obj.page.show_page.length; i++){
                    var _page = obj.page.show_page[i];
                    if(obj.page.current_page == _page.value){
                        getInfoByPage(obj);
                        return ;
                    }
                }
                angular.forEach(obj.page.show_page, function(data,index,array){
                    data.value --;
                })
            }
        }else{
            if(obj.page.current_page == obj.page.numbers){
                Modal.alert("已是最后一页");
                return ;
            }else{
                for(var i = 0; i < obj.page.show_page.length; i++){
                    var _page = obj.page.show_page[i];
                    if(obj.page.current_page == _page.value){
                        getInfoByPage(obj);
                        return ;
                    }
                }
                angular.forEach(obj.page.show_page, function(data,index,array){
                    data.value ++;
                });
            }
        }
        getInfoByPage(obj);
    };
    //搜索关键字高亮显示
    $scope.searchByKeyword = function (key_word) {
        //将关键字高亮
        if(!key_word){
            return false;
        }
        var _demo_list_te = $('.log-data-row');
        for(var k = 0; k < _demo_list_te.length; k++){
            var _one_te = $(_demo_list_te[k]).children(":last");
            var Reg = new RegExp(key_word,"g");
            var _reg_new_html=_one_te.text().replace(Reg,function(word){
                return '<strong id="keyword-'+k+'" class="log-keyword-high-light keyword-mark">' +word+ "</strong>";
            });
            _one_te.html(_reg_new_html);
        }
        $timeout(function(){
            $scope.data.search_key_list = [];
            $scope.data.search_key_list = getAllSearchLineByKey(key_word);
            if($scope.data.search_key_list.length === 0){
                Modal.alert('暂无搜索数据');
            }
        },300)
    };
    //高亮显示第一行(关键字)
    $scope.firstHighLight = function () {
        if(!$scope.info.log_analysis_info.search_key_word){
            Modal.alert("请先输入关键字！");
            return false;
        }
        if($scope.data.search_key_list.length > 0){
            var _first = $scope.data.search_key_list[0];
            $scope.scrollByLineCount(_first.key_word,_first.line_count,_first.index_count,_first,0);
        }
    };
    //高亮显示前一行(关键字)
    $scope.preHighLight = function () {
        if(!$scope.info.log_analysis_info.search_key_word){
            Modal.alert("请先输入关键字！");
            return false;
        }
        var _length = $scope.data.search_key_list.length;
        if(_length > 0){
            if(_cur_keyword_index==0){
                $scope.firstHighLight($scope.info.log_analysis_info.search_key_word);
            }else{
                var before=parseInt(_cur_keyword_index)-1;
                var _cur_key=$scope.data.search_key_list[before];
                if(_cur_key){
                    $scope.scrollByLineCount(_cur_key.key_word,_cur_key.line_count,_cur_key.index_count,_cur_key,before);
                }
            }
        }
    };
    //高亮显示下一行(关键字)
    $scope.nextHighLight = function () {
        if(!$scope.info.log_analysis_info.search_key_word){
            Modal.alert("请先输入关键字！");
            return false;
        }
        var _length = $scope.data.search_key_list.length;
        if(_length > 0){
            if(_cur_keyword_index==_length){

            }else{
                var next = parseInt(_cur_keyword_index) + 1;
                var _cur_key= $scope.data.search_key_list[next];
                if(_cur_key){
                    $scope.scrollByLineCount(_cur_key.key_word,_cur_key.line_count,_cur_key.index_count,_cur_key,next);
                }
            }
        }
    };
    //高亮显示最后一行(关键字)
    $scope.lastHighLight = function () {
        if(!$scope.info.log_analysis_info.search_key_word){
            Modal.alert("请先输入关键字！");
            return false;
        }
        if($scope.data.search_key_list.length>0){
            var _length=$scope.data.search_key_list.length-1;
            var _final=$scope.data.search_key_list[_length];
            $scope.scrollByLineCount(_final.key_word,_final.line_count,_final.index_count,_final,_length);
        }
    };
    //滚动到对应的关键字
    $scope.scrollByLineCount = function(key_word,line_count,index_count,key_obj,index){
        //当前关键字出现次数
        var _curr_keyword_times = 0;
        _cur_keyword_index = index;
        angular.forEach($scope.data.search_key_list,function (item) {
            item.checked = false;
        });
        key_obj.checked = true;
        keywordSearch($scope.info.log_analysis_info.search_key_word);
        var _hight_keyword_ele_list = $(".log-data-row").eq(index_count).children('span').eq(1).children('.log-keyword-high-light');
        for(var i = 0; i < _hight_keyword_ele_list.length; i++){
            var _high_keyword = _hight_keyword_ele_list[i];
            if(_high_keyword.textContent === key_word){
                _curr_keyword_times++;
                if(_curr_keyword_times === 1) keywordScrollToView($(_high_keyword));
                $(_high_keyword).removeClass('log-keyword-high-light').addClass('log-keyword-high-light-checked');
            }
        }
    };
    //改变日志内容高度
    $scope.changeHeight = function (flag) {
        var _init_height,_height={},_window_height = $(window).height();
        if(flag==1){
            _init_height = _window_height -255;
            if(_init_height > 463){
                _height.height = _init_height + 7;
            }else{
                _height.height = 464;
            }
        }else if(flag == 2){
            //右侧关键字列表高度
            _height.height = _window_height - 255 -18;
        }
        return _height;
    };
    //删除下载进度
    $scope.deleteDownLoadProcess = function (process){
        process.log_search_result_loading = false;
        if(process.timer){
            $interval.cancel(process.timer);
        }
    };
    //修改日志分页
    $scope.changeCurPage = function (page_size,flag,offset) {
        if(offset > $scope.info.page_info.total_page){
            Modal.alert("输入页数不允许超过总页数");
            return false;
        }else if(offset==0){
            Modal.alert("输入页数不可以为0");
            return false;
        }
        $scope.info.log_analysis_info.size=page_size;
        if($scope.info.log_analysis_info.log_name){
            $scope.control.file_loading = true;
            $scope.control.page_show = false;
            var _submit_info = configLogPageCondition();
            cleanAllShowMessage();
            $scope.control.file_loading = true;
            $timeout(function(){
                LogXJ.getLogBypage(_submit_info).then(function(data){
                    $scope.control.file_loading = false;
                    $scope.info.log_analysis_info.search_key_word = '';
                    if(data){
                        $scope.info.log_analysis_info.show_result = true;
                        $scope.info.log_analysis_info.log_detail  = data.beanList || [];
                        var _page_count = Math.ceil(parseInt($scope.data.total_line)/parseInt($scope.info.log_analysis_info.page_size));
                        $scope.info.page_info.total_page=_page_count;
                        initCreatePageNumber($scope.info.page_info,_page_count,offset);
                        $scope.control.page_show=true;
                        $timeout(function(){
                            $scope.searchByKeyword($scope.info.log_analysis_info.search_key_word);
                        },500);
                    }
                },function(error){
                    $scope.control.file_loading = false;
                    cleanAllShowMessage();
                });
            },1000);
        }
    };
    init();
}]);

/**
 * 日志分析-日志关键字分析图表
 * */
inspectionCtrl.controller('logAnalysisKeywordChartCtrl', ["$scope", "$state", "$stateParams", "LogXJ", "Charts", "Modal", "CV", function($scope, $state, $stateParams, LogXJ, Charts, Modal, CV) {
    var _keyword_info = $stateParams.keyword_info;
    //页面控制
    $scope.control = {
        genetate_pie : false, //是否生成饼图
    };
    //页面列表数据
    $scope.data = {
        keyword_report_list : []
    };
    //配置图表(折线/柱状)
    var configChart = function (cur) {
        //0折线图，1,2柱状图
        var _chart = {
            title:cur.time_interval_type==0 ? '关键字出现次数' :'关键字走势',
            subtitle:cur.time_interval_type==0 ? cur.start_date : cur.start_date+"至"+cur.end_date,
            chart_type:cur.time_interval_type,
            yAxis_name:'出现次数',
            xAxis_type:'5',
            columns:[{
                name:'关键字',
                data:cur.count_by_units,
            }],
            units:cur.units,
        };
        return Charts.getLogColumnConfig(_chart,260);
    };
    //配置错误日志-饼图
    var configPieChart = function(cur){
        $scope.control.genetate_pie = true;
        var _error_table = [],_tem_length = 0,_pie_list = [];
        for(var i = 0; i < cur.keywords.length; i++){
            var _one_error = {
                key_word:cur.keywords[i],
                error_count:'',
                scale:'',
            };
            _error_table.push(_one_error);
        }
        if(cur.counts.length > 0){
            for(var k = 0; k < cur.counts.length; k++){
                _tem_length = _tem_length + cur.counts[k];
            }
        }
        if(_tem_length == 0){
            $scope.control.genetate_pie = false;
            return ;
        }
        for(var j = 0; j < cur.counts.length; j++){
            _error_table[j].error_count = cur.counts[j];
            if(_tem_length == 0){
                _error_table[j].scale = 0;
            }else{
                _error_table[j].scale=(cur.counts[j]/_tem_length)*100;
            }
        }
        for(var m = 0; m < _error_table.length; m++){
            var _tem = [_error_table[m].key_word,_error_table[m].scale];
            _pie_list.push(_tem)
        }
        var  _pie_data = {
            title: '关键字分析图表',
            dataname: '关键字占比',
            name:'关键字占比',
            data: _pie_list
        };
        return Charts.getPieConfig(_pie_data,260);
    };
    var init = function () {
        if(!_keyword_info){
            $scope.backLogAnalysis();
            return;
        }
        //获取日志关键字-报告信息
        LogXJ.analysisKeyToChart(_keyword_info).then(function(data){
            if(data){
                $scope.data.keyword_report_list = data.wordCountBeanList || [];
                angular.forEach($scope.data.keyword_report_list,function(item){
                    item.chart_config = configChart(item);
                    item.err_table = configPieChart(item);
                });
            }
        },function(error){
            Modal.alert(error.message);
        });
    };
    //返回日志分析
    $scope.backLogAnalysis = function () {
        $scope.$parent.control.show_keyword_chart = false;
        $state.go('inspection_log_analysis');
    };
    init();
}]);

/**
 * 新增日志报告*/
inspectionCtrl.controller('logReportNewCtrl',["$scope", "$state", "$stateParams", "$window", "$timeout", "LogXJ", "BusiSys", "ReportTemplateDateType", "Charts", "Modal", "CV",function($scope, $state, $stateParams, $window, $timeout, LogXJ, BusiSys, ReportTemplateDateType, Charts, Modal, CV){
    var _log_flag = 0; //日志标志(0:全部日志 1:只有日期的日志)
    //页面信息
    $scope.info = {
        choosed_cyclic_log  : {},   //选择的周期日志
        log_report_info:{
            report_name     : '',   //报告名称
            sys_name        : '',   //系统名
            log_names       : [],   //日志名称列表
            log_ids         : [],   //日志编号列表
            start_date      : '',   //日志开始日期
            end_date        : '',   //日志结束日期
            is_regular      : false,//是否用正则
            time_interval_type: '', //报告模板时间类型
        }
    };
    //页面列表
    $scope.data = {
        log_file_list     : [],                 //日志文件列表
        sys_list          : [],                 //系统列表
        report_template   : ReportTemplateDateType,  //报告模板列表
    };
    //页面控制
    $scope.control = {
        is_preview    : false,  //是否预览报告
        save_loading  : false,  //保存按钮加载
        is_add_log    : false,  //是否已添加日志
    };
    //处理错误识别码
    var getErrorCodeList = function () {
        var _error_code = {
               error_code_list : [], //错误识别码（列表结构）
               regexp_list     : [],  //每个识别码是否用正则表达式（true or false）
               use_reg         : $scope.info.log_report_info.is_regular //是否使用用正则标志
        };
         _error_code.error_code_list  = $scope.info.log_report_info.error_release.split('|');
        for(var i = 0; i <  _error_code.error_code_list .length; i++){
            _error_code.regexp_list .push(_error_code.use_reg);
        }
        return _error_code;
    };
    var init = function () {
        //查询系统名列表
        BusiSys.getAllLogBysiness().then(function (data) {
            $timeout(function() {
                $scope.data.sys_list = data.list_bs || [];
            }, 0);
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //选择日志
    $scope.chooseLogFile=function(){
        if(!$scope.info.log_report_info.sys_name){
            Modal.alert("请先选择系统");
            return false;
        }
        Modal.reportLogChoose($scope.info.choosed_cyclic_log,$scope.info.log_report_info.sys_name).then(function(data){
            if(data){
                var _log_list = [],_log_ids = [];
                $scope.control.is_add_log = true;
                $scope.info.choosed_cyclic_log = data;
                if(data.choose_log_list){
                    for(var i = 0; i < data.choose_log_list.length; i++){
                        var _tem_log = data.choose_log_list[i];
                        _log_list.push(_tem_log.log_name);
                        _log_ids.push(_tem_log.log_id);
                    }
                }
                $scope.info.log_report_info.start_date = data.start_date;
                $scope.info.log_report_info.end_date   = data.end_date;
                $scope.info.log_report_info.log_names  = _log_list;
                $scope.info.log_report_info.log_ids    = _log_ids;
            }
        });
    };
   //选择系统
    $scope.selectSys = function(sys){
        //根据业务系统得到文件
        BusiSys.getAllLogList(sys,_log_flag).then(function (data){
            $timeout(function() {
                $scope.data.log_file_list = data.logBeanList || [];
                //清空已选的日志
                $scope.info.log_report_info.log_names = [];
                $scope.info.log_report_info.log_ids = [];
                $scope.info.choosed_cyclic_log = {};
            }, 0);
        }, function (error) {
            Modal.alert(error.message);
        });
    };
    //提交(flag:1保存2预览)
    $scope.formSubmit = function(flag){
        //表单验证
        if(!CV.valiForm($scope.log_report_form)){
            return false;
        }
        if($scope.info.log_report_info.log_names.length==0){
            Modal.alert("日志文件为空");
            return false;
        }
        var _error_code_info = getErrorCodeList();
        var _submit_inspect_info = {
            report_name : $scope.info.log_report_info.report_name,
            sys_name    : $scope.info.log_report_info.sys_name,
            log_names   : $scope.info.log_report_info.log_names,
            log_ids     : $scope.info.log_report_info.log_ids,
            start_date  : $scope.info.log_report_info.start_date,
            end_date    : $scope.info.log_report_info.end_date,
            time_interval_type : $scope.info.log_report_info.time_interval_type,
            keywords           : _error_code_info.error_code_list,
            is_regular_exps    : _error_code_info.regexp_list,
            save_flag          : flag,
        };
        if(flag == 1){
            $scope.control.save_loading = true;
            LogXJ.getInspectContent(_submit_inspect_info).then(function (data){
                $state.go("inspection_log_report_list");
            }, function (error) {
                $scope.control.save_loading = false;
                Modal.alert(error.message);
            });
        }else{
            $scope.control.is_preview = true;
            var _basic_info = {
                time_interval_type_cn : CV.findValue($scope.info.log_report_info.time_interval_type,ReportTemplateDateType), //报告模板-时间中文名
                error_release: $scope.info.log_report_info.error_release                                                //错误识别码
            };
            $state.go('inspection_log_report_new.log_preview',{submit_info:angular.extend(_submit_inspect_info,_basic_info)});
        }
    };
    //取消
    $scope.cancel=function(){
        $state.go("inspection_log_report_list");
    };
    init();
}]);

/**
 * 新增日志报告-报告预览*/
inspectionCtrl.controller('logReportReviewCtrl',["$scope", "$timeout", "$state" ,"$stateParams", "LogXJ", "Charts", "Modal",function ($scope, $timeout, $state, $stateParams, LogXJ, Charts, Modal) {
    var _submit_info = $stateParams.submit_info;
    //页面数据
    $scope.info = {
        basic_info  : _submit_info || {}, //报告基本信息
        report_info : {}                  //报告信息/图表
    };
    //页面控制
    $scope.control = {
        loading:false,             //页面加载
        curr_page : 0,             //初始报告页
        toggle_basic_info : false, //展开收起基本信息
    };
    //配置
    $scope.config = {
       chart_config : {}
    };
    //页面列表数据
    $scope.data = {
        report_preview_list : [], //预览报告列表
        error_list          : []  //预览错误日志列表
    };
    //图表配置
    var configChart = function(log){
        //0折线图，1,2柱状图
        var _chart = {
            title:log.time_interval_type==0 ? '错误时间分布' :'错误数走势',
            subtitle:log.time_interval_type==0 ? log.start_date : log.start_date+"至"+log.end_date,
            chart_type:log.time_interval_type,
            yAxis_name:'错误数',
            xAxis_type:'5',
            columns:[{
                name:'错误数',
                data:log.count_by_units,
            }],
            units:log.units,
        };
        return Charts.getLogColumnConfig(_chart,260);
    };
    //处理出错日志列表
    var handleErrorLogList = function (log){
        var _error_table = [],_tem_length = 0;
        for(var i = 0; i < log.keywords.length; i++){
            var _one_error = {
                key_word:log.keywords[i],
                error_count:'',
                scale:'',
            };
            _error_table.push(_one_error);
        }
        if(log.counts.length > 0){
            for(var k = 0; k < log.counts.length; k++){
                _tem_length +=  log.counts[k];
            }
        }
        for(var j = 0; j < log.counts.length; j++){
            _error_table[j].error_count = log.counts[j];
            if(log.total_count == 0){
                _error_table[j].scale = '无';
            }else{
                _error_table[j].scale = (log.counts[j]/_tem_length)*100 +'%';
            }
        }
        return _error_table;
    };
    var init = function () {
        if(!_submit_info){
            $scope.backReportNew();
            return;
        }
        //获取报告预览内容
        $scope.control.loading = true;
        LogXJ.getInspectContent(_submit_info).then(function (data){
            $timeout(function() {
                $scope.control.loading = false;
                $scope.data.report_preview_list = data.wordCountBeanList || [];
                if($scope.data.report_preview_list.length > 0){
                    //初始化第一页数据
                    $scope.info.report_info = $scope.data.report_preview_list[0];
                    $scope.config.chart_config = configChart($scope.info.report_info );
                    $scope.data.error_list = handleErrorLogList($scope.info.report_info );
                }
            }, 0);
        }, function (error) {
            $timeout(function () {
                $scope.control.loading = false;
                $scope.backReportNew();
                Modal.alert(error.message);
            },1000);
        });
    };
    //展开收起报告基本信息
    $scope.toggleBasicInfo = function () {
        $scope.control.toggle_basic_info = !$scope.control.toggle_basic_info;
    };
    //上一页报告
    $scope.getPreReport = function(){
        $("#mainLog").fadeOut("fast");
        $timeout(function(){
            $("#mainLog").fadeIn("slow");
            var _length = $scope.data.report_preview_list.length;
            var _real_next = ($scope.control.curr_page +_length-1)%_length;
            $scope.info.report_info = $scope.data.report_preview_list[_real_next];
            $scope.config.chart_config = configChart($scope.info.report_info );
            $scope.data.error_list = handleErrorLogList($scope.info.report_info );
            $scope.control.curr_page = _real_next;
        },500)
    };
    //下一页报告
    $scope.getNextReport = function () {
        $("#mainLog").fadeOut("fast");
        $timeout(function(){
            $("#mainLog").fadeIn("slow");
            var _next = $scope.control.curr_page + 1;
            var _length = $scope.data.report_preview_list.length;
            var _real_next = _next%_length;
            $scope.info.report_info = $scope.data.report_preview_list[_real_next];
            $scope.config.chart_config = configChart($scope.info.report_info );
            $scope.data.error_list = handleErrorLogList($scope.info.report_info );
            $scope.control.curr_page = _real_next;
        },500)
    };
    //返回报告新增
    $scope.backReportNew = function(){
        $scope.$parent.control.is_preview = false;
        $state.go('inspection_log_report_new');
    };
    init();
}]);
