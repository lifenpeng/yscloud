//巡检任务查看报表模块
var logModule = angular.module('LogModule', ['ui.bootstrap', 'CvService',
    'InspectionHttpSrv',
    'ngCookies',
    'CommHttpSrv',
    'CvDirectives',
    'ModalCtrl',
    'GlobalData']);

logModule.value('baseUrl', '/clWeb/');
logModule.controller("LogViewCtrl", ["$scope", "$rootScope","$cookieStore", "$location","$timeout" ,"$window" ,"LogMonitor","Inspection","ScrollBarConfig","ScrollConfig","Modal", function($scope, $rootScope,$cookieStore, $location,$timeout, $window,LogMonitor, Inspection,ScrollBarConfig,ScrollConfig,Modal) {
    var _log_list=$cookieStore.get('log_list');
    var _url = $location.absUrl();
    var _log_file=_url.split("=")[2] ? _url.split("=")[2] : "";
    var _submit_log_analysis = {};
    var _cur_keyword_index = 0;     //当前关键字的下标
    var _old_size          = 500;   //默认页数
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
    $scope.info = {
        log_analysis_info : {
            sys_name      : '',     //系统名
            startDate     : '',     //开始日期
            endDate       : '',     //结束日期
            start_hour    : '0',    //开始时间
            start_minutes : '0',    //开始分钟
            end_hour      : '23',   //结束时间
            end_minutes   : '59',   //结束分钟
            log_name      : _log_file,     //日志名
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
        scroll_xy_config:ScrollBarConfig.XY(),   //滚动条xy轴配置
        scroll_config:ScrollConfig               //滚动配置
    };
    //滚动条内容滚动
    $scope.scollbar_callbacks = {
        whileScrolling: function() {
            var _log_content_topoffset = Math.abs(this.mcs.top);
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
    };
    //重置行号滚动高度
    var resetLineNumContainerHeight = function () {
        _line_num_ele.css({marginTop:0,height: 'auto'})
    };
    //配置日志的分页数
    var configPageCount = function (cur_log,cur_show_log,total_line) {
        //当前日志
        cur_log.total_line = total_line;
        //存储环境的日志
        cur_show_log.total_line = total_line;
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
            //var _submit_info = configLogPageCondition();
            _submit_log_analysis.offset=obj.page.current_page;
            var _submit_info=_submit_log_analysis;
            $timeout(function(){
                getContentByCondition(_submit_info,_submit_log_analysis,1,1,"");
            },1500)
        }
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
    //根据筛选条件获取数据(log_line_flag:1:没有总行数2：有总行数   log_page_flag:是否重刷分页1不刷，2：刷)
    var getContentByCondition = function (submit_log_analysis,log,log_line_flag,log_page_flag,one_ip_file) {
        $scope.control.file_loading = true;
        LogMonitor.getLogMonitorBypage(submit_log_analysis).then(function(data){
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
                //var _one_show = $scope.data.log_tab_list[$scope.info.log_analysis_info.file_index];
                var _one_show = _submit_log_analysis;
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
    var init = function(){
        for(var i = 0;i < _log_list.length;i++) {
            var _tem_single_log = _log_list[i];
            if (_tem_single_log.tem_file == _log_file) {
                _submit_log_analysis=_tem_single_log.log_condition;
                break;
            }
        }
        $scope.control.file_loading = true;
        LogMonitor.getLogMonitorBypage(_submit_log_analysis).then(function(data){
            if(data){
                $scope.control.file_loading = false;
                $scope.control.no_move      = false;
                $scope.control.page_show    = true;
                $scope.info.log_analysis_info.log_detail = data.beanList || [];
                $scope.data.total_line  = parseInt(data.page_numeber);
                var _page_count_one = Math.ceil(parseInt($scope.data.total_line)/parseInt($scope.info.log_analysis_info.page_size));
                _submit_log_analysis.total_line=$scope.data.total_line;
                $scope.info.page_info.total_page = _page_count_one;
                createPageNumber($scope.info.page_info,_page_count_one);
            }
        },function(error){
            Modal.alert(error.message);
            $scope.control.file_loading = false;
        });
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
        var _is_down_load = true;
/*        if($scope.data.log_tab_list.length>0){
            _is_down_load=$scope.data.log_tab_list[$scope.info.log_analysis_info.file_index].modify_option;
        }*/
        if($scope.info.log_analysis_info.log_name && _is_down_load){
            $scope.control.file_loading = true;
            $scope.control.page_show = false;
            $scope.info.log_analysis_info.offset = 1;
            //var _submit_info=configLogPageCondition();
            _submit_log_analysis.size=page_size;
            _submit_log_analysis.offset=1;
            cleanAllShowMessage();
            $timeout(function(){
                //var _tem_log = $scope.data.log_tab_list[$scope.info.log_analysis_info.file_index];
                getContentByCondition(_submit_log_analysis,_submit_log_analysis,1,2,"");
            },1500);
        }
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
            _init_height = _window_height -190;
            if(_init_height > 463){
                _height.height = _init_height + 7;
            }else{
                _height.height = 464;
            }
        }else if(flag == 2){
            //右侧关键字列表高度
            _height.height = _window_height - 190 -18;
        }
        return _height;
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
            cleanAllShowMessage();
            $scope.control.file_loading = true;
            var _submit_info=_submit_log_analysis;
            _submit_info.size=page_size;
            _submit_info.offset=offset;
            $timeout(function(){
                LogMonitor.getLogMonitorBypage(_submit_info).then(function(data){
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
    $(window).resize(function(){
        $timeout(function () {
            $scope.changeHeight(1);
            $scope.changeHeight(2);
        },50);
    })
}]);