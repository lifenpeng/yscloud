/**
 * Created by admin on 2018/6/2.
 */
var scene = angular.module('dispatchSceneController',[]);
//新增场景控制器
scene.controller('sceneNewCtrl',["$rootScope",'$scope', '$stateParams', '$timeout', '$state', 'IML_TYPE', 'dataBaseType', 'JobErrorType', 'ParamValueSource', 'ElementCategory', 'FlowJobType', 'Scene', 'RequestMethod', 'Modal', 'CV', function($rootScope,$scope,$stateParams,$timeout,$state,IML_TYPE,dataBaseType,JobErrorType,ParamValueSource,ElementCategory,FlowJobType,Scene,RequestMethod,Modal,CV){
    $scope.info = {
        scene_id  : '',
        scene_name: '',
        scene_desc: '',
        category_list:[]
    };
    $scope.control = {
        is_update : false,
        btn_loading: false,
        active_element_i: -1,
        config_element: false,
        tem_element_list:[],
    };
    $scope.data = {
        execute_type_list:IML_TYPE,
        database_type_list:dataBaseType,
        error_handle_list:JobErrorType,
        param_source_list:ParamValueSource,
        request_method_list:RequestMethod,
        element_data : {
            sdwork_cn_name : ''
        },  
    };
    $scope.boom = {
        sdwork_cn_name : $scope.data.element_data.sdwork_cn_name,
        job_bk_desc : $scope.data.element_data.job_bk_desc,
        timeout : $scope.data.element_data.timeout,
        timeused : $scope.data.element_data.timeused,
        result_judge : $scope.data.element_data.result_judge,
        exec_script : '',
        sql_source : '',
        input : ''
    }

    //初始化单个元素信息
    var initElementInfo = function(element){
        element = element || {};
        $scope.data.element_data = {
            exec_script         :  element.exec_script        || '',
            script_source       :  element.script_source      || 1,
            sql_source          :  element.sql_source         || 1,
            dataBase_type       :  element.dataBase_type      || 1,
            service_name        :  element.service_name       || '',
            service_comm_info   :  element.service_comm_info  || '',
            config              :  element.config             || false,
            comp_cn_name        :  element.comp_cn_name       || '',
            sdwork_cn_name      :  element.sdwork_cn_name     || '',	//元素中文名(暂使用作业字段)
            job_bk_desc         :  element.job_bk_desc        || '',	//元素描述(暂使用作业字段)
            comp_id             :  element.comp_id            || '',    //组件ID
            input               :  element.input              || [],    //输入参数
            output              :  element.output             || [],    //输出参数
            comp_impl_type      :  element.comp_impl_type     || '',    //实现类型
            datetime_condition  :  element.datetime_condition || '',	//日期条件
            date_condition      :  element.date_condition     || '',
            h_condition         :  element.h_condition        || "",
            m_condition         :  element.m_condition        || "",
            timeused            :  element.timeused           || '',     //执行预时
            pre_job_list        :  element.pre_job_list       || [],     //前置
            timeout             :  element.timeout            || "",	 //超时时间
            error_handle        :  element.error_handle       || 1,		 //出错处理方式（1等待,2跳过,3重试）
            retry_interval      :  element.retry_interval     || '',	 //重试间隔（单位秒）
            retry_times         :  element.retry_times        || '',	 //重试次数（默认三次）
            polling_interval    :  element.polling_interval   || '',     //轮询间隔
            polling_max_times   :  element.polling_max_times  || '',	 //轮询最大次数
            result_judge        :  element.result_judge       || '',     //结果判定
            job_method          :  element.job_method         || 0,      //作业类型 1择组件 2自定义
            env_name            :  element.env_name           || '',     // 语言环境名（由以下四个组成）
            language_name       :  element.language_name      || '',     // 语言名称
            language_version    :  element.language_version   || '',     // 语言版本
            operating_system    :  element.operating_system   || '',     // 操作系统
            bit_number          :  element.bit_number         || '',     // 操作位数
            annex_file          :  element.annex_file         || '',     //c/c++附件
            plugin_list         :  element.plugin_list        || [],     // 插件列表(shell/python/java)
            request_method      :  element.request_method     || 1,      // 服务作业请求方式(1: Post 2:Get)
        };

    };
    //转化临时元素列表
    var convertTempEleList = function(){
        $scope.control.tem_element_list = [];
        for(var k = 0; k < $scope.info.category_list.length; k++){
            var _ele_category = $scope.info.category_list[k];
            _ele_category.element_list = _ele_category.element_list ? _ele_category.element_list : [];
            for(var m = 0; m < _ele_category.element_list.length; m++){
                var _element = _ele_category.element_list[m];
                _element.category = _element.category ? _element.category : _ele_category.category;
                _element.element_id  = _ele_category.category + '_' + m;   //自定义元素id(分类-索引)
                _element.element_info = _element.element_info ? _element.element_info : {};
                _element.element_info.config = !!_element.element_info.sdwork_cn_name;
                $scope.control.tem_element_list.push(_element);
            }
        }
    };
    //切换TAB时状态和控制字段的转化
    var changeTab = function(index) {
        var _last_index = $scope.control.active_element_i;
        if(index === _last_index) return;
        if($scope.control.tem_element_list[_last_index]){
            $scope.control.tem_element_list[_last_index].active = false;  //关闭上一个TAB(第一次不关闭)
        }
        $scope.control.tem_element_list[index].active = true;              //激活当前
        $scope.control.active_element_i = index;                           //赋当前TAB下标
    };
    //查找元素临时元素列表下标
    var findTempEleListIndex = function(ele_type,ele_id){
        var _index = 0;
        for(var i = 0; i <  $scope.control.tem_element_list.length; i++){
            var _tem_ele =  $scope.control.tem_element_list[i];
            if(_tem_ele.type === ele_type && _tem_ele.element_id === ele_id){
                _index = i;
                break;
            }
        }
        return _index;
    };
    //验证场景元素配置完整性
    var isElementConfigComplete = function(){
        var is_complete = true;
        for(var i = 0; i < $scope.info.category_list.length; i++){
            var _category = $scope.info.category_list[i];
            _category.element_list = _category.element_list || [];
            for(var j =0; j < _category.element_list.length; j++){
                var _ele = _category.element_list[j];
                if(!_ele.element_info.sdwork_cn_name){
                    is_complete = false;
                }
            }
        }
        return is_complete;
    };
    var init = function () {

    };

    //添加元素
    $scope.addElement = function () {
        Modal.addSceneElement().then(function (checked_ele) {
            if(checked_ele){
                var _element_len =  $scope.info.category_list.length;
                if(_element_len === 0){
                    $scope.info.category_list[0] = checked_ele;
                }else{
                    var _is_new_category = true;
                    for(var i = 0; i < _element_len; i++){
                        var _ele = $scope.info.category_list[i];
                        if(_ele.category === checked_ele.category){
                            _is_new_category = false;
                            for(var j = 0; j < checked_ele.element_list.length; j++){
                                var _checked_ele = checked_ele.element_list[j];
                                _ele.element_list.push(_checked_ele);
                            }
                            break;
                        }
                        if(!_is_new_category) break;
                    }
                    _is_new_category && $scope.info.category_list.push(checked_ele);
                }
                convertTempEleList(); //转化临时元素列表
            }
        })
    };
    //删除元素
    $scope.removeElement = function (ele_data,index,ele,event) {
        event.stopPropagation();
        var _prompt = ele.text ? '删除[ ' + ele.text + ' ] ?' : '确认删除 ?';
        Modal.confirm(_prompt).then(function(){
            ele_data.splice(index,1);
            //删除临时列表
            for(var i = 0; i < $scope.control.tem_element_list.length; i++){
                var _tem_ele = $scope.control.tem_element_list[i];
                if(_tem_ele.type === ele.type && _tem_ele.element_id === ele.element_id){
                    $scope.control.tem_element_list.splice(i,1);
                    break;
                }
            }
        })
    };
    //配置元素
    $scope.configElement = function (category,element,index) {
        element.element_info  = element.element_info || {};
        $scope.control.config_element = true;
        var _ele_type = element.type;
        var _element_id   = element.element_id || category + '_' + index;
        var _tem_index = findTempEleListIndex(_ele_type||35,_element_id);
        $scope.tabOne(_tem_index);
    };
    //删除当前配置元素
    $scope.removeCurrConfigElement = function(){
        var _curr_ele_name = $scope.data.element_data.sdwork_cn_name ? "删除 [ " + $scope.data.element_data.sdwork_cn_name + " ] 元素 ?" : '删除元素 ?';
        Modal.confirm(_curr_ele_name).then(function(){
            $scope.curr_ele_index =  $scope.curr_ele_index || 0;  //当前元素索引
            var _curr_ele_id = $scope.control.tem_element_list[$scope.curr_ele_index].element_id;
            var _is_delete;
            for(var i = 0; i < $scope.info.category_list.length; i++){
                var _ele_category = $scope.info.category_list[i];
                _ele_category.element_list = _ele_category.element_list || [];
                for(var j = 0; j < _ele_category.element_list.length; j++){
                    var _element = _ele_category.element_list[j];
                    _element.element_id  = _element.element_id || _ele_category.category + '_' + j;   //自定义元素id(分类-索引)
                    if(_element.element_id === _curr_ele_id){
                        _ele_category.element_list.splice(j,1);
                        _is_delete = true;
                        break;
                    }
                }
                if(_is_delete) break;
            }
            $scope.control.tem_element_list.splice($scope.curr_ele_index,1);
            $scope.closeElementConfig(); //关闭配置
        });
    };

    //点击单个tab
    $scope.tabOne = function(index) {
        changeTab(index);
        var _curr_element =  $scope.control.tem_element_list[index];  //当前元素
        $scope.curr_ele_category = _curr_element.category;             //当前元素分类
        $scope.curr_ele_type =  _curr_element.type;                    //当前元素类型
        $scope.curr_ele_index = index;                                 //当前元素索引
        initElementInfo(_curr_element.element_info);
        if($scope.curr_ele_category  === 8) $scope.data.error_handle_list.pop(); //轮询作业
    };
    //元素高亮图标
    $scope.elementHightIcon = function (type) {
        var _bg_url = '',_bg_size = '/40px';
        switch(type){
            case 1: _bg_url='url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url='url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url='url(img/dispatch/fl/palette/condition.png)'; break;
            case 5: _bg_url='url(img/dispatch/fl/palette/stop.png)'; break;
            case 6: _bg_url='url(img/dispatch/fl/palette/rep.png)'; break;
            case 7:  _bg_url='url(img/dispatch/fl/palette/ftp_u.png)'; break;
            case 8:  _bg_url='url(img/dispatch/fl/palette/ftp_d.png)'; break;
            case 9:  _bg_url='url(img/dispatch/fl/palette/sftp_u.png)'; break;
            case 10: _bg_url='url(img/dispatch/fl/palette/sftp_d.png)'; break;
            case 11: _bg_url='url(img/dispatch/fl/palette/agnt_u.png)'; break;
            case 12: _bg_url='url(img/dispatch/fl/palette/agnt_d.png)'; break;
            case 13: _bg_url='url(img/dispatch/fl/palette/copy.png)'; break;
            case 14: _bg_url='url(img/dispatch/fl/palette/sql.png)'; break;
            case 15: _bg_url='url(img/dispatch/fl/palette/sql_s.png)'; break;
            case 16: _bg_url='url(img/dispatch/fl/palette/net.png)'; break;
            case 17: _bg_url='url(img/dispatch/fl/palette/sys_start.png)'; break;
            case 18: _bg_url='url(img/dispatch/fl/palette/sys_end.png)'; break;
            case 19: _bg_url='url(img/dispatch/fl/palette/python.png)'; break;
            case 20: _bg_url='url(img/dispatch/fl/palette/shell.png)'; break;
            case 21: _bg_url='url(img/dispatch/fl/palette/bat.png)'; break;
            case 22: _bg_url='url(img/dispatch/fl/palette/ruby.png)'; break;
            case 23: _bg_url='url(img/dispatch/fl/palette/perl.png)'; break;
            case 24: _bg_url='url(img/dispatch/fl/palette/web.png)'; break;
            case 25: _bg_url='url(img/dispatch/fl/palette/tcp.png)'; break;
            case 26: _bg_url='url(img/dispatch/fl/palette/http.png)'; break;
            case 27: _bg_url='url(img/dispatch/fl/palette/tux.png)'; break;
            case 28: _bg_url='url(img/dispatch/fl/palette/cl.png)'; break;
            case 29: _bg_url='url(img/dispatch/fl/palette/rpg.png)'; break;
            case 30: _bg_url='url(img/dispatch/fl/palette/java.png)'; break;
            case 31: _bg_url='url(img/dispatch/fl/palette/c.png)'; break;
            case 32: _bg_url='url(img/dispatch/fl/palette/c++.png)'; break;
	    case 33: _bg_url='url(img/dispatch/fl/context/site.png)'; break;
            case 34: _bg_url='url(img/dispatch/fl/context/area.png)'; break;
            case 35: _bg_url='url(img/dispatch/fl/context/cell.png)'; break;
            case 36: _bg_url='url(img/dispatch/fl/context/unit.png)'; break;
            case 37: _bg_url='url(img/dispatch/fl/context/enterprise.png)'; break;
            case 38: _bg_url='url(img/dispatch/fl/context/t38.png)'; break;
            case 39: _bg_url='url(img/dispatch/fl/context/t39.png)'; break;
            case 40: _bg_url='url(img/dispatch/fl/context/t40.png)'; break;
            case 41: _bg_url='url(img/dispatch/fl/context/t41.png)'; break;
            case 42: _bg_url='url(img/dispatch/fl/context/t42.png)'; break;
            case 43: _bg_url='url(img/dispatch/fl/context/t43.png)'; break;
            case 44: _bg_url='url(img/dispatch/fl/context/t44.png)'; break;
            case 45: _bg_url='url(img/dispatch/fl/context/t45.png)'; break;
            case 46: _bg_url='url(img/dispatch/fl/context/t46.png)'; break;
            case 47: _bg_url='url(img/dispatch/fl/context/t47.png)'; break;
            case 48: _bg_url='url(img/dispatch/fl/context/t48.png)'; break;
            case 49: _bg_url='url(img/dispatch/fl/context/t49.png)'; break;
            case 50: _bg_url='url(img/dispatch/fl/context/t50.png)'; break;
            case 51: _bg_url='url(img/dispatch/fl/context/t51.png)'; break;
            case 52: _bg_url='url(img/dispatch/fl/context/t52.png)'; break;
            case 53: _bg_url='url(img/dispatch/fl/context/t53.png)'; break;
            case 54: _bg_url='url(img/dispatch/fl/context/t54.png)'; break;
            case 55: _bg_url='url(img/dispatch/fl/context/t55.png)'; break;
            case 56: _bg_url='url(img/dispatch/fl/context/t56.png)'; break;
            default: _bg_url='url(img/dispatch/fl/palette/ftp_u.png)'; break;
        }
        return {"background": _bg_url + 'no-repeat center' + _bg_size};
    };
    //元素原始图标
    $scope.elementOriginalIcon = function (type) {
        var _bg_url = '',_bg_size = '/40px';
        switch(type){
            case 1: _bg_url='url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url='url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url='url(img/dispatch/fl/palette/condition.png)'; break;
            case 5: _bg_url='url(img/dispatch/fl/palette/stop.png)'; break;
            case 6: _bg_url='url(img/dispatch/fl/palette_original/rep.png)'; break;
            case 7:  _bg_url='url(img/dispatch/fl/palette_original/ftp_u.png)'; break;
            case 8:  _bg_url='url(img/dispatch/fl/palette_original/ftp_d.png)'; break;
            case 9:  _bg_url='url(img/dispatch/fl/palette_original/sftp_u.png)'; break;
            case 10: _bg_url='url(img/dispatch/fl/palette_original/sftp_d.png)'; break;
            case 11: _bg_url='url(img/dispatch/fl/palette_original/agnt_u.png)'; break;
            case 12: _bg_url='url(img/dispatch/fl/palette_original/agnt_d.png)'; break;
            case 13: _bg_url='url(img/dispatch/fl/palette_original/copy.png)'; break;
            case 14: _bg_url='url(img/dispatch/fl/palette_original/sql.png)'; break;
            case 15: _bg_url='url(img/dispatch/fl/palette_original/sql_s.png)'; break;
            case 16: _bg_url='url(img/dispatch/fl/palette_original/net.png)'; break;
            case 17: _bg_url='url(img/dispatch/fl/palette_original/sys_start.png)'; break;
            case 18: _bg_url='url(img/dispatch/fl/palette_original/sys_end.png)'; break;
            case 19: _bg_url='url(img/dispatch/fl/palette_original/python.png)'; break;
            case 20: _bg_url='url(img/dispatch/fl/palette_original/shell.png)'; break;
            case 21: _bg_url='url(img/dispatch/fl/palette_original/bat.png)'; break;
            case 22: _bg_url='url(img/dispatch/fl/palette_original/ruby.png)'; break;
            case 23: _bg_url='url(img/dispatch/fl/palette_original/perl.png)'; break;
            case 24: _bg_url='url(img/dispatch/fl/palette_original/web.png)'; break;
            case 25: _bg_url='url(img/dispatch/fl/palette_original/tcp.png)'; break;
            case 26: _bg_url='url(img/dispatch/fl/palette_original/http.png)'; break;
            case 27: _bg_url='url(img/dispatch/fl/palette_original/tux.png)'; break;
            case 28: _bg_url='url(img/dispatch/fl/palette_original/cl.png)'; break;
            case 29: _bg_url='url(img/dispatch/fl/palette_original/rpg.png)'; break;
            case 30: _bg_url='url(img/dispatch/fl/palette_original/java.png)'; break;
            case 31: _bg_url='url(img/dispatch/fl/palette_original/c.png)'; break;
            case 32: _bg_url='url(img/dispatch/fl/palette_original/c++.png)'; break;
            case 33: _bg_url='url(img/dispatch/fl/context/site.png)'; break;
            case 34: _bg_url='url(img/dispatch/fl/context/area.png)'; break;
            case 35: _bg_url='url(img/dispatch/fl/context/cell.png)'; break;
            case 36: _bg_url='url(img/dispatch/fl/context/unit.png)'; break;
            case 37: _bg_url='url(img/dispatch/fl/context/enterprise.png)'; break;
            case 38: _bg_url='url(img/dispatch/fl/context/t38.png)'; break;
            case 39: _bg_url='url(img/dispatch/fl/context/t39.png)'; break;
            case 40: _bg_url='url(img/dispatch/fl/context/t40.png)'; break;
            case 41: _bg_url='url(img/dispatch/fl/context/t41.png)'; break;
            case 42: _bg_url='url(img/dispatch/fl/context/t42.png)'; break;
            case 43: _bg_url='url(img/dispatch/fl/context/t43.png)'; break;
            case 44: _bg_url='url(img/dispatch/fl/context/t44.png)'; break;
            case 45: _bg_url='url(img/dispatch/fl/context/t45.png)'; break;
            case 46: _bg_url='url(img/dispatch/fl/context/t46.png)'; break;
            case 47: _bg_url='url(img/dispatch/fl/context/t47.png)'; break;
            case 48: _bg_url='url(img/dispatch/fl/context/t48.png)'; break;
            case 49: _bg_url='url(img/dispatch/fl/context/t49.png)'; break;
            case 50: _bg_url='url(img/dispatch/fl/context/t50.png)'; break;
            case 51: _bg_url='url(img/dispatch/fl/context/t51.png)'; break;
            case 52: _bg_url='url(img/dispatch/fl/context/t52.png)'; break;
            case 53: _bg_url='url(img/dispatch/fl/context/t53.png)'; break;
            case 54: _bg_url='url(img/dispatch/fl/context/t54.png)'; break;
            case 55: _bg_url='url(img/dispatch/fl/context/t55.png)'; break;
            case 56: _bg_url='url(img/dispatch/fl/context/t56.png)'; break;
            default: _bg_url='url(img/dispatch/fl/palette_original/ftp_u.png)'; break;
        }
        return {"background": _bg_url + 'no-repeat center' + _bg_size};
    };
    //单个元素类型图标
    $scope.elementIcon = function(){
        var _bg_url = '',_bg_size = '/45px';
        switch($scope.curr_ele_type){
            case 1: _bg_url='url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url='url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url='url(img/dispatch/fl/context/condition.png)'; break;
            case 5: _bg_url='url(img/dispatch/fl/context/stop.png)'; break;
            case 6: _bg_url='url(img/dispatch/fl/context/rep.png)'; break;
            case 7:  _bg_url='url(img/dispatch/fl/context/ftpU.png)'; break;
            case 8:  _bg_url='url(img/dispatch/fl/context/ftpD.png)'; break;
            case 9:  _bg_url='url(img/dispatch/fl/context/sftpU.png)'; break;
            case 10: _bg_url='url(img/dispatch/fl/context/sftpD.png)'; break;
            case 11: _bg_url='url(img/dispatch/fl/context/zngtU.png)'; break;
            case 12: _bg_url='url(img/dispatch/fl/context/zngtD.png)'; break;
            case 13: _bg_url='url(img/dispatch/fl/context/copy.png)'; break;
            case 14: _bg_url='url(img/dispatch/fl/context/sql.png)'; break;
            case 15: _bg_url='url(img/dispatch/fl/context/sqlS.png)'; break;
            case 16: _bg_url='url(img/dispatch/fl/context/web.png)'; break;
            case 17: _bg_url='url(img/dispatch/fl/context/sysSt.png)'; break;
            case 18: _bg_url='url(img/dispatch/fl/context/sysE.png)'; break;
            case 19: _bg_url='url(img/dispatch/fl/context/python.png)'; break;
            case 20: _bg_url='url(img/dispatch/fl/context/shell.png)'; break;
            case 21: _bg_url='url(img/dispatch/fl/context/bat.png)'; break;
            case 22: _bg_url='url(img/dispatch/fl/context/rb.png)'; break;
            case 23: _bg_url='url(img/dispatch/fl/context/perl.png)'; break;
            case 24: _bg_url='url(img/dispatch/fl/context/webs.png)'; break;
            case 25: _bg_url='url(img/dispatch/fl/context/tcp.png)'; break;
            case 26: _bg_url='url(img/dispatch/fl/context/http.png)'; break;
            case 27: _bg_url='url(img/dispatch/fl/context/tux.png)'; break;
            case 28: _bg_url='url(img/dispatch/fl/context/cl.png)'; break;
            case 29: _bg_url='url(img/dispatch/fl/context/rpg.png)'; break;
            case 30: _bg_url='url(img/dispatch/fl/context/java.png)'; break;
            case 31: _bg_url='url(img/dispatch/fl/context/c.png)'; break;
            case 32: _bg_url='url(img/dispatch/fl/context/c++.png)'; break;
            case 33: _bg_url='url(img/dispatch/fl/context/site.png)'; break;
            case 34: _bg_url='url(img/dispatch/fl/context/area.png)'; break;
            case 35: _bg_url='url(img/dispatch/fl/context/cell.png)'; break;
            case 36: _bg_url='url(img/dispatch/fl/context/unit.png)'; break;
            case 37: _bg_url='url(img/dispatch/fl/context/enterprise.png)'; break;
	    case 38: _bg_url='url(img/dispatch/fl/context/t38.png)'; break;
            case 39: _bg_url='url(img/dispatch/fl/context/t39.png)'; break;
            case 40: _bg_url='url(img/dispatch/fl/context/t40.png)'; break;
            case 41: _bg_url='url(img/dispatch/fl/context/t41.png)'; break;
            case 42: _bg_url='url(img/dispatch/fl/context/t42.png)'; break;
            case 43: _bg_url='url(img/dispatch/fl/context/t43.png)'; break;
            case 44: _bg_url='url(img/dispatch/fl/context/t44.png)'; break;
            case 45: _bg_url='url(img/dispatch/fl/context/t45.png)'; break;
            case 46: _bg_url='url(img/dispatch/fl/context/t46.png)'; break;
            case 47: _bg_url='url(img/dispatch/fl/context/t47.png)'; break;
            case 48: _bg_url='url(img/dispatch/fl/context/t48.png)'; break;
            case 49: _bg_url='url(img/dispatch/fl/context/t49.png)'; break;
            case 50: _bg_url='url(img/dispatch/fl/context/t50.png)'; break;
            case 51: _bg_url='url(img/dispatch/fl/context/t51.png)'; break;
            case 52: _bg_url='url(img/dispatch/fl/context/t52.png)'; break;
            case 53: _bg_url='url(img/dispatch/fl/context/t53.png)'; break;
            case 54: _bg_url='url(img/dispatch/fl/context/t54.png)'; break;
            case 55: _bg_url='url(img/dispatch/fl/context/t55.png)'; break;
            case 56: _bg_url='url(img/dispatch/fl/context/t56.png)'; break;
            default: _bg_url='url(img/dispatch/fl/context/t38.png)'; break;
           
        }
        return {"background": _bg_url + 'no-repeat center' + _bg_size};
    };
    //元素类别转换
    $scope.categoryTOCn = function(category){
        return CV.findValue(category,ElementCategory)
    };
    //元素类型转换
    $scope.eleTypeTOCn = function(type){
        return type ? CV.findValue(type,FlowJobType) : '--';
    };
    //关闭元素配置
    $scope.closeElementConfig = function(){
        $scope.control.config_element = false;
        $scope.control.active_element_i = -1; //关闭恢复默认
        angular.forEach($scope.control.tem_element_list,function(item){
            item.active = false;
        });
        window.scroll({top:0})
    };
    //设置作业方式
    $scope.setJobMethod = function(){
        //单个元素配置信息
        var  _index = $scope.control.active_element_i;
        var _curr_element =  $scope.control.tem_element_list[_index];



        Modal.setFlowJobMethod($rootScope.elem_type || _curr_element.type,$scope.data.element_data,false).then(function(result){
            $scope.data.element_data.job_method = result.job_method;
            if(result.job_method === 1){
                $scope.data.element_data.comp_id = result.comp_id;
                $scope.data.element_data.comp_impl_type = result.impl_type;
                $scope.data.element_data.comp_cn_name = result.comp_cn_name;
                $scope.data.element_data.input = result.input || [];
                $scope.data.element_data.output = result.output || [];
                $scope.data.element_data.exec_script = result.exec_script;
                $scope.data.element_data.script_source = result.script_source;
                $scope.data.element_data.env_name = result.env_name;
                $scope.data.element_data.language_name     = result.language_name;
                $scope.data.element_data.language_version  = result.language_version;
                $scope.data.element_data.operating_system  = result.operating_system;
                $scope.data.element_data.bit_number        = result.bit_number;
                $scope.data.element_data.plugin_list       = result.plugin_list;
                $scope.data.element_data.annex_file        = result.annex_file;
            }else{
                $scope.data.element_data.comp_id = '';
                $scope.data.element_data.comp_impl_type = result.impl_type;
                $scope.data.element_data.output = result.output ? result.output : [];
                $scope.data.element_data.input = result.param_list;
                $scope.data.element_data.exec_script = result.exec_script;
                $scope.data.element_data.business_sys_name = result.business_sys_name;
                $scope.data.element_data.script_source = result.script_source;
                $scope.data.element_data.sql_source = result.sql_source;
                $scope.data.element_data.script_file_name = result.script_file_name;
                $scope.data.element_data.dataBase_type = result.dataBase_type;
                $scope.data.element_data.service_name = result.service_name;
                $scope.data.element_data.env_name = result.env_name;
                $scope.data.element_data.language_name     = result.language_name;
                $scope.data.element_data.language_version  = result.language_version;
                $scope.data.element_data.operating_system  = result.operating_system;
                $scope.data.element_data.bit_number        = result.bit_number;
                $scope.data.element_data.plugin_list       = result.plugin_list;
                $scope.data.element_data.annex_file        = result.annex_file;
                for(var i = 0 ; i < $scope.data.element_data.input.length; i++) $scope.data.element_data.input[i].param_source = 1;
            }
        })
    };
    //选择出错处理方式
    $scope.selectErrorHandle = function(error_hadle){
        $scope.data.element_data.retry_times = error_hadle === 3 ? 3 : '';
        $scope.data.element_data.retry_interval = error_hadle === 3 ? 4 : '';
    };
    $scope.$watch('info.category_list',function () {
        console.log($scope.info.category_list)
    })
    $scope.element_list= []
    //表单提交(submit_flag:1基本信息 2配置信息)
    $scope.formSubmit = function (submit_flag) {
        console.log(1)
        // if(!CV.valiForm($scope.new_element_form)){
        //     return false;
        // }
        if(submit_flag === 1){
            console.log($scope.info.category_list)
            // if($scope.info.category_list.length === 0){
            //     Modal.alert('请添加元素');
            //     return false;
            // }
            // if(!isElementConfigComplete()){
            //     Modal.alert('元素配置不完整');
            //     return false;
            // }

            //新增
            $scope.control.btn_loading = true;
            $scope.category = []
            $scope.category.push({
                category : $rootScope.elem_category,
                element_list : $scope.element_list
            })
            var scene_info = {
                scene_id : '',
                scene_name : $rootScope.dirtitle_name || '恒丰纸业(01.00)',
                scene_desc : '测试',
                category_list : $scope.category
            }
            $scope.info = scene_info
            console.log($scope.info)
            Scene.addScene($scope.info,false).then(function(data){
                $scope.control.btn_loading = false;
                Modal.alert('新增成功');
                $scope.formCancel();
            },function (error) {
                $scope.control.btn_loading = false;
                Modal.alert(error.message);
            })
        }else{
            //保存单个元素配置信息
            var  _index = $scope.control.active_element_i;
            var _curr_element =  $scope.control.tem_element_list[_index];

            if(!$scope.data.element_data.job_method){
                Modal.alert('请设置内容类型');
                return false;
            }

            //组件方式-组件名不可为空
            if($scope.data.element_data.job_method === 1 && !$scope.data.element_data.comp_cn_name){
                Modal.alert('请重配内容类型');
                return false;
            }
            var element_info = {
                exec_script:'${'+ $scope.data.element_data.input[0].param_name +'}',
                input : $scope.data.element_data.input,
                job_bk_desc : $scope.data.element_data.job_bk_desc,
                job_method : '',
                result_judge : $scope.data.element_data.result_judge,
                sdwork_cn_name : $scope.data.element_data.sdwork_cn_name,
                sql_source : 1 ,
                comp_impl_type:1,
                error_handle : 1,
                request_method:1,
                script_source : 1,
                timeout : $scope.data.element_data.timeout,
                timeused : $scope.data.element_data.timeused
            }

            $scope.element_list.push({
                category : $rootScope.elem_category,
                element_info : element_info,
                text : $rootScope.elem_name,
                type : $rootScope.elem_type
            })
            console.log($scope.element_list)




            //同步配置信息
            $scope.data.element_data.config = true;
            for(var i = 0; i < $scope.info.category_list.length; i++){
                var _category = $scope.info.category_list[i];
                if(_category.category !== _curr_element.category) continue;
                for(var j = 0; j < _category.element_list.length; j++){
                    var  _element = _category.element_list[j];
                    if(_element.type === _curr_element.type && _element.element_id === _curr_element.element_id){
                        _element.element_info =  $scope.data.element_data;
                        break;
                    }
                }
            }

            //清空单个元素数据
            $scope.control.config_element = false;
            initElementInfo();
        }
    };
    $scope.formCancel = function () {
        $state.go('dispatch_scene_list');
    };
    init();
}]);
//修改场景控制器
scene.controller('sceneModifyCtrl',['$scope', '$stateParams', '$timeout', '$state', 'IML_TYPE', 'dataBaseType', 'JobErrorType', 'ParamValueSource', 'ElementCategory', 'FlowJobType', 'Scene', 'RequestMethod', 'Modal', 'CV', function($scope,$stateParams,$timeout,$state,IML_TYPE,dataBaseType,JobErrorType,ParamValueSource,ElementCategory,FlowJobType,Scene,RequestMethod,Modal,CV){
    var _scene_id  =  $stateParams.scene_id ? $stateParams.scene_id : '';

    $scope.info = {
        scene_id  : _scene_id,
        scene_name: '',
        scene_desc: '',
        category_list:[]
    };
    $scope.control = {
        is_update : true,
        btn_loading: false,
        active_element_i: -1,
        config_element: false,
        tem_element_list:[],
        element_data : {}   //单个元素信息
    };
    $scope.data = {
        execute_type_list:IML_TYPE,
        database_type_list:dataBaseType,
        error_handle_list:JobErrorType,
        param_source_list:ParamValueSource,
        request_method_list:RequestMethod,
    };
    //初始化单个元素信息
    var initElementInfo = function(element){
        element = element || {};
        $scope.data.element_data = {
            exec_script         :  element.exec_script        || '',
            script_source       :  element.script_source      || 1,
            sql_source          :  element.sql_source         || 1,
            dataBase_type       :  element.dataBase_type      || 1,
            service_name        :  element.service_name       || '',
            service_comm_info   :  element.service_comm_info  || '',
            config              :  element.config             || false,
            comp_cn_name        :  element.comp_cn_name       || '',
            sdwork_cn_name      :  element.sdwork_cn_name     || '',	//元素中文名(暂使用作业字段)
            job_bk_desc         :  element.job_bk_desc        || '',	//元素描述(暂使用作业字段)
            comp_id             :  element.comp_id            || '',    //组件ID
            input               :  element.input              || [],    //输入参数
            output              :  element.output             || [],    //输出参数
            comp_impl_type      :  element.comp_impl_type     || '',    //实现类型
            datetime_condition  :  element.datetime_condition || '',	//日期条件
            date_condition      :  element.date_condition     || '',
            h_condition         :  element.h_condition        || "",
            m_condition         :  element.m_condition        || "",
            timeused            :  element.timeused           || '',     //执行预时
            pre_job_list        :  element.pre_job_list       || [],     //前置
            timeout             :  element.timeout            || "",	 //超时时间
            error_handle        :  element.error_handle       || 1,		 //出错处理方式（1等待,2跳过,3重试）
            retry_interval      :  element.retry_interval     || '',	 //重试间隔（单位秒）
            retry_times         :  element.retry_times        || '',	 //重试次数（默认三次）
            polling_interval    :  element.polling_interval   || '',     //轮询间隔
            polling_max_times   :  element.polling_max_times  || '',	 //轮询最大次数
            result_judge        :  element.result_judge       || '',     //结果判定
            job_method          :  element.job_method         || 0,      //作业类型 1择组件 2自定义
            env_name            :  element.env_name           || '',     // 语言环境名（由以下四个组成）
            language_name       :  element.language_name      || '',     // 语言名称
            language_version    :  element.language_version   || '',     // 语言版本
            operating_system    :  element.operating_system   || '',     // 操作系统
            bit_number          :  element.bit_number         || '',     // 操作位数
            annex_file          :  element.annex_file         || '',     //c/c++附件
            plugin_list         :  element.plugin_list        || [],     // 插件列表(shell/python/java)
            request_method      :  element.request_method     || 1,      // 服务作业请求方式(1: Post 2:Get)
        };
    };
    //转化临时元素列表
    var convertTempEleList = function(){
        $scope.control.tem_element_list = [];
        for(var k = 0; k < $scope.info.category_list.length; k++){
            var _ele_category = $scope.info.category_list[k];
            _ele_category.element_list = _ele_category.element_list ? _ele_category.element_list : [];
            for(var m = 0; m < _ele_category.element_list.length; m++){
                var _element = _ele_category.element_list[m];
                _element.category = _element.category ? _element.category : _ele_category.category;
                _element.element_id  = _ele_category.category + '_' + m;   //自定义元素id(分类-索引)
                _element.element_info = _element.element_info ? _element.element_info : {};
                _element.element_info.config = !!_element.element_info.sdwork_cn_name;
                $scope.control.tem_element_list.push(_element);
            }
        }
    };
    //切换TAB时状态和控制字段的转化
    var changeTab = function(index) {
        var _last_index = $scope.control.active_element_i;
        if(index === _last_index) return;
        if($scope.control.tem_element_list[_last_index]){
            $scope.control.tem_element_list[_last_index].active = false;  //关闭上一个TAB(第一次不关闭)
        }
        $scope.control.tem_element_list[index].active = true;              //激活当前
        $scope.control.active_element_i = index;                           //赋当前TAB下标
    };
    //查找元素临时元素列表下标
    var findTempEleListIndex = function(ele_type,ele_id){
        var _index = 0;
        for(var i = 0; i <  $scope.control.tem_element_list.length; i++){
            var _tem_ele =  $scope.control.tem_element_list[i];
            if(_tem_ele.type === ele_type && _tem_ele.element_id === ele_id){
                _index = i;
                break;
            }
        }
        return _index;
    };
    //验证场景元素配置完整性
    var isElementConfigComplete = function(){
        var is_complete = true;
        for(var i = 0; i < $scope.info.category_list.length; i++){
            var _category = $scope.info.category_list[i];
            _category.element_list = _category.element_list || [];
            for(var j =0; j < _category.element_list.length; j++){
                var _ele = _category.element_list[j];
                if(!_ele.element_info.sdwork_cn_name){
                    is_complete = false;
                }
            }
        }
        return is_complete;
    };
    var init = function () {
        Scene.getSingleSceneDetail(_scene_id).then(function(data){
            $timeout(function () {
                $scope.info.scene_name = data.scene_info ? data.scene_info.scene_name ? data.scene_info.scene_name : '' : '';
                $scope.info.scene_desc = data.scene_info ? data.scene_info.scene_desc  ? data.scene_info.scene_desc : '' : '';
                $scope.info.category_list = data.scene_bean ? data.scene_bean.category_list ? data.scene_bean.category_list : [] : [];
                convertTempEleList();
            },0)
        },function (error) {
            Modal.alert(error.message);
            $state.go('dispatch_scene_list');
        });
    };

    //添加元素
    $scope.addElement = function () {
        Modal.addSceneElement().then(function (checked_ele) {
            if(checked_ele){
                var _element_len =  $scope.info.category_list.length;
                if(_element_len === 0){
                    $scope.info.category_list[0] = checked_ele;
                }else{
                    var _is_new_category = true;
                    for(var i = 0; i < _element_len; i++){
                        var _ele = $scope.info.category_list[i];
                        if(_ele.category === checked_ele.category){
                            _is_new_category = false;
                            for(var j = 0; j < checked_ele.element_list.length; j++){
                                var _checked_ele = checked_ele.element_list[j];
                                _ele.element_list.push(_checked_ele);
                            }
                            break;
                        }
                        if(!_is_new_category) break;
                    }
                    _is_new_category && $scope.info.category_list.push(checked_ele);
                }
                convertTempEleList(); //转化临时元素列表
            }
        })
    };
    //删除元素
    $scope.removeElement = function (ele_data,index,ele,event) {
        event.stopPropagation();
        var _prompt = ele.text ? '删除[ ' + ele.text + ' ] ?' : '确认删除 ?';
        Modal.confirm(_prompt).then(function(){
            ele_data.splice(index,1);
            //删除临时列表
            for(var i = 0; i < $scope.control.tem_element_list.length; i++){
                var _tem_ele = $scope.control.tem_element_list[i];
                if(_tem_ele.type === ele.type && _tem_ele.element_id === ele.element_id){
                    $scope.control.tem_element_list.splice(i,1);
                    break;
                }
            }
        })
    };
    //配置元素
    $scope.configElement = function (category,element,index) {
        element.element_info  = element.element_info || {};
        $scope.control.config_element = true;
        var _ele_type = element.type;
        var _element_id   = element.element_id || category + '_' + index;
        var _tem_index = findTempEleListIndex(_ele_type,_element_id);
        $scope.tabOne(_tem_index);
    };
    //删除当前配置元素
    $scope.removeCurrConfigElement = function(){
        var _curr_ele_name = $scope.data.element_data.sdwork_cn_name ? "删除 [ " + $scope.data.element_data.sdwork_cn_name + " ] 元素 ?" : '删除元素 ?';
        Modal.confirm(_curr_ele_name).then(function(){
            $scope.curr_ele_index =  $scope.curr_ele_index || 0;  //当前元素索引
            var _curr_ele_id = $scope.control.tem_element_list[$scope.curr_ele_index].element_id;
            var _is_delete;
            for(var i = 0; i < $scope.info.category_list.length; i++){
                var _ele_category = $scope.info.category_list[i];
                _ele_category.element_list = _ele_category.element_list || [];
                for(var j = 0; j < _ele_category.element_list.length; j++){
                    var _element = _ele_category.element_list[j];
                    _element.element_id  = _element.element_id || _ele_category.category + '_' + j;   //自定义元素id(分类-索引)
                    if(_element.element_id === _curr_ele_id){
                        _ele_category.element_list.splice(j,1);
                        _is_delete = true;
                        break;
                    }
                }
                if(_is_delete) break;
            }
            $scope.control.tem_element_list.splice($scope.curr_ele_index,1);
            $scope.closeElementConfig(); //关闭配置
        });
    };
    //点击单个tab
    $scope.tabOne = function(index) {
        changeTab(index);
        var _curr_element =  $scope.control.tem_element_list[index];  //当前元素
        $scope.curr_ele_category = _curr_element.category;             //当前元素分类
        $scope.curr_ele_type =  _curr_element.type;                    //当前元素类型
        $scope.curr_ele_index = index;                                 //当前元素索引
        initElementInfo(_curr_element.element_info);
        if($scope.curr_ele_category  === 8) $scope.data.error_handle_list.pop(); //轮询作业
    };
    //元素高亮图标
    $scope.elementHightIcon = function (type) {
        var _bg_url = '',_bg_size = '/40px';
        switch(type){
            case 1: _bg_url='url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url='url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url='url(img/dispatch/fl/palette/condition.png)'; break;
            case 5: _bg_url='url(img/dispatch/fl/palette/stop.png)'; break;
            case 6: _bg_url='url(img/dispatch/fl/palette/rep.png)'; break;
            case 7:  _bg_url='url(img/dispatch/fl/palette/ftp_u.png)'; break;
            case 8:  _bg_url='url(img/dispatch/fl/palette/ftp_d.png)'; break;
            case 9:  _bg_url='url(img/dispatch/fl/palette/sftp_u.png)'; break;
            case 10: _bg_url='url(img/dispatch/fl/palette/sftp_d.png)'; break;
            case 11: _bg_url='url(img/dispatch/fl/palette/agnt_u.png)'; break;
            case 12: _bg_url='url(img/dispatch/fl/palette/agnt_d.png)'; break;
            case 13: _bg_url='url(img/dispatch/fl/palette/copy.png)'; break;
            case 14: _bg_url='url(img/dispatch/fl/palette/sql.png)'; break;
            case 15: _bg_url='url(img/dispatch/fl/palette/sql_s.png)'; break;
            case 16: _bg_url='url(img/dispatch/fl/palette/net.png)'; break;
            case 17: _bg_url='url(img/dispatch/fl/palette/sys_start.png)'; break;
            case 18: _bg_url='url(img/dispatch/fl/palette/sys_end.png)'; break;
            case 19: _bg_url='url(img/dispatch/fl/palette/python.png)'; break;
            case 20: _bg_url='url(img/dispatch/fl/palette/shell.png)'; break;
            case 21: _bg_url='url(img/dispatch/fl/palette/bat.png)'; break;
            case 22: _bg_url='url(img/dispatch/fl/palette/ruby.png)'; break;
            case 23: _bg_url='url(img/dispatch/fl/palette/perl.png)'; break;
            case 24: _bg_url='url(img/dispatch/fl/palette/web.png)'; break;
            case 25: _bg_url='url(img/dispatch/fl/palette/tcp.png)'; break;
            case 26: _bg_url='url(img/dispatch/fl/palette/http.png)'; break;
            case 27: _bg_url='url(img/dispatch/fl/palette/tux.png)'; break;
            case 28: _bg_url='url(img/dispatch/fl/palette/cl.png)'; break;
            case 29: _bg_url='url(img/dispatch/fl/palette/rpg.png)'; break;
            case 30: _bg_url='url(img/dispatch/fl/palette/java.png)'; break;
            case 31: _bg_url='url(img/dispatch/fl/palette/c.png)'; break;
            case 32: _bg_url='url(img/dispatch/fl/palette/c++.png)'; break;
            case 33: _bg_url='url(img/dispatch/fl/context/site.png)'; break;
            case 34: _bg_url='url(img/dispatch/fl/context/area.png)'; break;
            case 35: _bg_url='url(img/dispatch/fl/context/cell.png)'; break;
            case 36: _bg_url='url(img/dispatch/fl/context/unit.png)'; break;
            case 37: _bg_url='url(img/dispatch/fl/context/enterprise.png)'; break;
            case 38: _bg_url='url(img/dispatch/fl/context/t38.png)'; break;
            case 39: _bg_url='url(img/dispatch/fl/context/t39.png)'; break;
            case 40: _bg_url='url(img/dispatch/fl/context/t40.png)'; break;
            case 41: _bg_url='url(img/dispatch/fl/context/t41.png)'; break;
            case 42: _bg_url='url(img/dispatch/fl/context/t42.png)'; break;
            case 43: _bg_url='url(img/dispatch/fl/context/t43.png)'; break;
            case 44: _bg_url='url(img/dispatch/fl/context/t44.png)'; break;
            case 45: _bg_url='url(img/dispatch/fl/context/t45.png)'; break;
            case 46: _bg_url='url(img/dispatch/fl/context/t46.png)'; break;
            case 47: _bg_url='url(img/dispatch/fl/context/t47.png)'; break;
            case 48: _bg_url='url(img/dispatch/fl/context/t48.png)'; break;
            case 49: _bg_url='url(img/dispatch/fl/context/t49.png)'; break;
            case 50: _bg_url='url(img/dispatch/fl/context/t50.png)'; break;
            case 51: _bg_url='url(img/dispatch/fl/context/t51.png)'; break;
            case 52: _bg_url='url(img/dispatch/fl/context/t52.png)'; break;
            case 53: _bg_url='url(img/dispatch/fl/context/t53.png)'; break;
            case 54: _bg_url='url(img/dispatch/fl/context/t54.png)'; break;
            case 55: _bg_url='url(img/dispatch/fl/context/t55.png)'; break;
            case 56: _bg_url='url(img/dispatch/fl/context/t56.png)'; break;
            default: _bg_url='url(img/dispatch/fl/palette/ftp_u.png)'; break;
        }
        return {"background": _bg_url + 'no-repeat center' + _bg_size};
    };
    //元素原始图标
    $scope.elementOriginalIcon = function (type) {
        var _bg_url = '',_bg_size = '/40px';
        switch(type){
            case 1: _bg_url='url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url='url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url='url(img/dispatch/fl/palette/condition.png)'; break;
            case 5: _bg_url='url(img/dispatch/fl/palette/stop.png)'; break;
            case 6: _bg_url='url(img/dispatch/fl/palette_original/rep.png)'; break;
            case 7:  _bg_url='url(img/dispatch/fl/palette_original/ftp_u.png)'; break;
            case 8:  _bg_url='url(img/dispatch/fl/palette_original/ftp_d.png)'; break;
            case 9:  _bg_url='url(img/dispatch/fl/palette_original/sftp_u.png)'; break;
            case 10: _bg_url='url(img/dispatch/fl/palette_original/sftp_d.png)'; break;
            case 11: _bg_url='url(img/dispatch/fl/palette_original/agnt_u.png)'; break;
            case 12: _bg_url='url(img/dispatch/fl/palette_original/agnt_d.png)'; break;
            case 13: _bg_url='url(img/dispatch/fl/palette_original/copy.png)'; break;
            case 14: _bg_url='url(img/dispatch/fl/palette_original/sql.png)'; break;
            case 15: _bg_url='url(img/dispatch/fl/palette_original/sql_s.png)'; break;
            case 16: _bg_url='url(img/dispatch/fl/palette_original/net.png)'; break;
            case 17: _bg_url='url(img/dispatch/fl/palette_original/sys_start.png)'; break;
            case 18: _bg_url='url(img/dispatch/fl/palette_original/sys_end.png)'; break;
            case 19: _bg_url='url(img/dispatch/fl/palette_original/python.png)'; break;
            case 20: _bg_url='url(img/dispatch/fl/palette_original/shell.png)'; break;
            case 21: _bg_url='url(img/dispatch/fl/palette_original/bat.png)'; break;
            case 22: _bg_url='url(img/dispatch/fl/palette_original/ruby.png)'; break;
            case 23: _bg_url='url(img/dispatch/fl/palette_original/perl.png)'; break;
            case 24: _bg_url='url(img/dispatch/fl/palette_original/web.png)'; break;
            case 25: _bg_url='url(img/dispatch/fl/palette_original/tcp.png)'; break;
            case 26: _bg_url='url(img/dispatch/fl/palette_original/http.png)'; break;
            case 27: _bg_url='url(img/dispatch/fl/palette_original/tux.png)'; break;
            case 28: _bg_url='url(img/dispatch/fl/palette_original/cl.png)'; break;
            case 29: _bg_url='url(img/dispatch/l/palette_original/rpg.png)'; break;
            case 30: _bg_url='url(img/dispatch/fl/palette_original/java.png)'; break;
            case 31: _bg_url='url(img/dispatch/fl/palette_original/c.png)'; break;
            case 32: _bg_url='url(img/dispatch/fl/palette_original/c++.png)'; break;
            case 33: _bg_url='url(img/dispatch/fl/context/site.png)'; break;
            case 34: _bg_url='url(img/dispatch/fl/context/area.png)'; break;
            case 35: _bg_url='url(img/dispatch/fl/context/cell.png)'; break;
            case 36: _bg_url='url(img/dispatch/fl/context/unit.png)'; break;
            case 37: _bg_url='url(img/dispatch/fl/context/enterprise.png)'; break;
            case 38: _bg_url='url(img/dispatch/fl/context/t38.png)'; break;
            case 39: _bg_url='url(img/dispatch/fl/context/t39.png)'; break;
            case 40: _bg_url='url(img/dispatch/fl/context/t40.png)'; break;
            case 41: _bg_url='url(img/dispatch/fl/context/t41.png)'; break;
            case 42: _bg_url='url(img/dispatch/fl/context/t42.png)'; break;
            case 43: _bg_url='url(img/dispatch/fl/context/t43.png)'; break;
            case 44: _bg_url='url(img/dispatch/fl/context/t44.png)'; break;
            case 45: _bg_url='url(img/dispatch/fl/context/t45.png)'; break;
            case 46: _bg_url='url(img/dispatch/fl/context/t46.png)'; break;
            case 47: _bg_url='url(img/dispatch/fl/context/t47.png)'; break;
            case 48: _bg_url='url(img/dispatch/fl/context/t48.png)'; break;
            case 49: _bg_url='url(img/dispatch/fl/context/t49.png)'; break;
            case 50: _bg_url='url(img/dispatch/fl/context/t50.png)'; break;
            case 51: _bg_url='url(img/dispatch/fl/context/t51.png)'; break;
            case 52: _bg_url='url(img/dispatch/fl/context/t52.png)'; break;
            case 53: _bg_url='url(img/dispatch/fl/context/t53.png)'; break;
            case 54: _bg_url='url(img/dispatch/fl/context/t54.png)'; break;
            case 55: _bg_url='url(img/dispatch/fl/context/t55.png)'; break;
            case 56: _bg_url='url(img/dispatch/fl/context/t56.png)'; break;
            default: _bg_url='url(img/dispatch/fl/palette_original/ftp_u.png)'; break;
        }
        return {"background": _bg_url + 'no-repeat center' + _bg_size};
    };
    //单个元素类型图标
    $scope.elementIcon = function(){
        var _bg_url = '',_bg_size = '/45px';
        switch($scope.curr_ele_type){
            case 1: _bg_url='url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url='url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url='url(img/dispatch/fl/context/condition.png)'; break;
            case 5: _bg_url='url(img/dispatch/fl/context/stop.png)'; break;
            case 6: _bg_url='url(img/dispatch/fl/context/rep.png)'; break;
            case 7:  _bg_url='url(img/dispatch/fl/context/ftpU.png)'; break;
            case 8:  _bg_url='url(img/dispatch/fl/context/ftpD.png)'; break;
            case 9:  _bg_url='url(img/dispatch/fl/context/sftpU.png)'; break;
            case 10: _bg_url='url(img/dispatch/fl/context/sftpD.png)'; break;
            case 11: _bg_url='url(img/dispatch/fl/context/zngtU.png)'; break;
            case 12: _bg_url='url(img/dispatch/fl/context/zngtD.png)'; break;
            case 13: _bg_url='url(img/dispatch/fl/context/copy.png)'; break;
            case 14: _bg_url='url(img/dispatch/fl/context/sql.png)'; break;
            case 15: _bg_url='url(img/dispatch/fl/context/sqlS.png)'; break;
            case 16: _bg_url='url(img/dispatch/fl/context/web.png)'; break;
            case 17: _bg_url='url(img/dispatch/fl/context/sysSt.png)'; break;
            case 18: _bg_url='url(img/dispatch/fl/context/sysE.png)'; break;
            case 19: _bg_url='url(img/dispatch/fl/context/python.png)'; break;
            case 20: _bg_url='url(img/dispatch/fl/context/shell.png)'; break;
            case 21: _bg_url='url(img/dispatch/fl/context/bat.png)'; break;
            case 22: _bg_url='url(img/dispatch/fl/context/rb.png)'; break;
            case 23: _bg_url='url(img/dispatch/fl/context/perl.png)'; break;
            case 24: _bg_url='url(img/dispatch/fl/context/webs.png)'; break;
            case 25: _bg_url='url(img/dispatch/fl/context/tcp.png)'; break;
            case 26: _bg_url='url(img/dispatch/fl/context/http.png)'; break;
            case 27: _bg_url='url(img/dispatch/fl/context/tux.png)'; break;
            case 28: _bg_url='url(img/dispatch/fl/context/cl.png)'; break;
            case 29: _bg_url='url(img/dispatch/fl/context/rpg.png)'; break;
            case 30: _bg_url='url(img/dispatch/fl/context/java.png)'; break;
            case 31: _bg_url='url(img/dispatch/fl/context/c.png)'; break;
            case 32: _bg_url='url(img/dispatch/fl/context/c++.png)'; break;
            case 33: _bg_url='url(img/dispatch/fl/context/site.png)'; break;
            case 34: _bg_url='url(img/dispatch/fl/context/area.png)'; break;
            case 35: _bg_url='url(img/dispatch/fl/context/cell.png)'; break;
            case 36: _bg_url='url(img/dispatch/fl/context/unit.png)'; break;
            case 37: _bg_url='url(img/dispatch/fl/context/enterprise.png)'; break;
            case 38: _bg_url='url(img/dispatch/fl/context/t38.png)'; break;
            case 39: _bg_url='url(img/dispatch/fl/context/t39.png)'; break;
            case 40: _bg_url='url(img/dispatch/fl/context/t40.png)'; break;
            case 41: _bg_url='url(img/dispatch/fl/context/t41.png)'; break;
            case 42: _bg_url='url(img/dispatch/fl/context/t42.png)'; break;
            case 43: _bg_url='url(img/dispatch/fl/context/t43.png)'; break;
            case 44: _bg_url='url(img/dispatch/fl/context/t44.png)'; break;
            case 45: _bg_url='url(img/dispatch/fl/context/t45.png)'; break;
            case 46: _bg_url='url(img/dispatch/fl/context/t46.png)'; break;
            case 47: _bg_url='url(img/dispatch/fl/context/t47.png)'; break;
            case 48: _bg_url='url(img/dispatch/fl/context/t48.png)'; break;
            case 49: _bg_url='url(img/dispatch/fl/context/t49.png)'; break;
            case 50: _bg_url='url(img/dispatch/fl/context/t50.png)'; break;
            case 51: _bg_url='url(img/dispatch/fl/context/t51.png)'; break;
            case 52: _bg_url='url(img/dispatch/fl/context/t52.png)'; break;
            case 53: _bg_url='url(img/dispatch/fl/context/t53.png)'; break;
            case 54: _bg_url='url(img/dispatch/fl/context/t54.png)'; break;
            case 55: _bg_url='url(img/dispatch/fl/context/t55.png)'; break;
            case 56: _bg_url='url(img/dispatch/fl/context/t56.png)'; break;
            default: _bg_url='url(img/dispatch/fl/context/ftpU.png)'; break;
        }
        return {"background": _bg_url + 'no-repeat center' + _bg_size};
    };
    //元素类别转换
    $scope.categoryTOCn = function(category){
        return CV.findValue(category,ElementCategory)
    };
    //元素类型转换
    $scope.eleTypeTOCn = function(type){
        return type ? CV.findValue(type,FlowJobType) : '--';
    };
    //关闭元素配置
    $scope.closeElementConfig = function(){
        $scope.control.config_element = false;
        $scope.control.active_element_i = -1; //关闭恢复默认
        angular.forEach($scope.control.tem_element_list,function(item){
            item.active = false;
        });
        window.scroll({top:0})
    };
    //设置作业方式
    $scope.setJobMethod = function(){
        //单个元素配置信息
        var  _index = $scope.control.active_element_i;
        var _curr_element =  $scope.control.tem_element_list[_index];

        Modal.setFlowJobMethod(_curr_element.type,$scope.data.element_data,false).then(function(result){
            $scope.data.element_data.job_method = result.job_method;
            if(result.job_method === 1){
                $scope.data.element_data.comp_id = result.comp_id;
                $scope.data.element_data.comp_impl_type = result.impl_type;
                $scope.data.element_data.comp_cn_name = result.comp_cn_name;
                $scope.data.element_data.input = result.input || [];
                $scope.data.element_data.output = result.output || [];
                $scope.data.element_data.exec_script = result.exec_script;
                $scope.data.element_data.script_source = result.script_source;
                $scope.data.element_data.env_name = result.env_name;
                $scope.data.element_data.language_name     = result.language_name;
                $scope.data.element_data.language_version  = result.language_version;
                $scope.data.element_data.operating_system  = result.operating_system;
                $scope.data.element_data.bit_number        = result.bit_number;
                $scope.data.element_data.plugin_list       = result.plugin_list;
                $scope.data.element_data.annex_file        = result.annex_file;
            }else{
                $scope.data.element_data.comp_id = '';
                $scope.data.element_data.comp_impl_type = result.impl_type;
                $scope.data.element_data.output = result.output ? result.output : [];
                $scope.data.element_data.input = result.param_list;
                $scope.data.element_data.exec_script = result.exec_script;
                $scope.data.element_data.business_sys_name = result.business_sys_name;
                $scope.data.element_data.script_source = result.script_source;
                $scope.data.element_data.sql_source = result.sql_source;
                $scope.data.element_data.script_file_name = result.script_file_name;
                $scope.data.element_data.dataBase_type = result.dataBase_type;
                $scope.data.element_data.service_name = result.service_name;
                $scope.data.element_data.env_name = result.env_name;
                $scope.data.element_data.language_name     = result.language_name;
                $scope.data.element_data.language_version  = result.language_version;
                $scope.data.element_data.operating_system  = result.operating_system;
                $scope.data.element_data.bit_number        = result.bit_number;
                $scope.data.element_data.plugin_list       = result.plugin_list;
                $scope.data.element_data.annex_file        = result.annex_file;
                for(var i = 0 ; i < $scope.data.element_data.input.length; i++) $scope.data.element_data.input[i].param_source = 1;
            }
        })
    };
    //选择出错处理方式
    $scope.selectErrorHandle = function(error_hadle){
        $scope.data.element_data.retry_times = error_hadle === 3 ? 3 : '';
        $scope.data.element_data.retry_interval = error_hadle === 3 ? 4 : '';
    };

    //表单提交(submit_flag:1基本信息 2配置信息)
    $scope.formSubmit = function (submit_flag) {
        if(!CV.valiForm($scope.new_element_form)){
            return false;
        }
        if(submit_flag === 1){
            if($scope.info.category_list.length === 0){
                Modal.alert('请添加元素');
                return false;
            }
            if(!isElementConfigComplete()){
                Modal.alert('元素配置不完整');
                return false;
            }

            //修改
            $scope.control.btn_loading = true;
            Scene.addScene($scope.info,true).then(function(data){
                $scope.control.btn_loading = false;
                Modal.alert("修改成功");
                $scope.formCancel();
            },function (error) {
                $scope.control.btn_loading = false;
                Modal.alert(error.message)
            })
        }else{
            //保存单个元素配置信息
            var  _index = $scope.control.active_element_i;
            var _curr_element =  $scope.control.tem_element_list[_index];

            if(!$scope.data.element_data.job_method){
                Modal.alert('请设置内容类型');
                return false;
            }

            //组件方式-组件名不可为空
            if($scope.data.element_data.job_method === 1 && !$scope.data.element_data.comp_cn_name){
                Modal.alert('请重配内容类型');
                return false;
            }

            //同步配置信息
            $scope.data.element_data.config = true;
            for(var i = 0; i < $scope.info.category_list.length; i++){
                var _category = $scope.info.category_list[i];
                if(_category.category !== _curr_element.category) continue;
                for(var j = 0; j < _category.element_list.length; j++){
                    var  _element = _category.element_list[j];
                    if(_element.type === _curr_element.type && _element.element_id === _curr_element.element_id){
                        _element.element_info =  $scope.data.element_data;
                        break;
                    }
                }
            }

            //清空单个元素数据
            $scope.control.config_element = false;
            initElementInfo();
        }
    };
    $scope.formCancel = function () {
        $state.go('dispatch_scene_list');
    };
    init();
}]);
//查看场景控制器
scene.controller('sceneDetailCtrl', ["$scope", "$stateParams", "$location", "$timeout", "$state", "Scene", "ElementCategory", "FlowJobType", "dataBaseType", "JobErrorType", "RequestMethod", "Modal", "CV", function($scope, $stateParams, $location, $timeout, $state, Scene, ElementCategory, FlowJobType, dataBaseType, JobErrorType, RequestMethod, Modal, CV) {
    var _scene_id = $stateParams.scene_id ? $stateParams.scene_id : '';
    $scope.info = {
        basic_info:{},
        category_list:[]
    };
    $scope.control = {
        active_element_i: -1,
        config_element: false,
        tem_element_list:[],
    };
    $scope.data = {
        element_data : {}
    }

    //初始化单个元素信息
    var initElementInfo = function(element){
        element = element || {};
        $scope.data.element_data = {
            exec_script         :  element.exec_script        ?  element.exec_script : '',
            script_source       :  element.script_source      ?  element.script_source : 1,
            sql_source          :  element.sql_source         ?  element.sql_source : 1,
            dataBase_type       :  element.dataBase_type      ?  element.dataBase_type : 1,
            service_name        :  element.service_name       ?  element.service_name : '',
            service_comm_info   :  element.service_comm_info  ?  element.service_comm_info : '',
            config              :  element.config             ?  element.config : false,
            comp_cn_name        :  element.comp_cn_name       ?  element.comp_cn_name : '',
            sdwork_cn_name      :  element.sdwork_cn_name     ?  element.sdwork_cn_name : '',		//元素中文名(暂使用作业字段)
            job_bk_desc         :  element.job_bk_desc        ?  element.job_bk_desc : '',	        //元素描述(暂使用作业字段)
            comp_id             :  element.comp_id            ?  element.comp_id : '',  			//组件ID
            input               :  element.input              ?  element.input : [],                //输入参数
            output              :  element.output             ?  element.output : [],               //输出参数
            comp_impl_type      :  element.comp_impl_type     ?  element.comp_impl_type : '',       //实现类型
            datetime_condition  :  element.datetime_condition ?  element.datetime_condition : '',	//日期条件
            date_condition      :  element.date_condition     ?  element.date_condition : '',
            h_condition         :  element.h_condition        ?  element.h_condition : "",
            m_condition         :  element.m_condition        ?  element.m_condition : "",
            timeused            :  element.timeused           ?  element.timeused : '',              //执行预时
            pre_job_list        :  element.pre_job_list       ?  element.pre_job_list : [],          //前置
            timeout             :  element.timeout            ?  element.timeout : "",				 //超时时间
            error_handle        :  element.error_handle       ?  element.error_handle : 1,		     //出错处理方式（1等待,2跳过,3重试）
            retry_interval      :  element.retry_interval     ?  element.retry_interval : '',	     //重试间隔（单位秒）
            retry_times         :  element.retry_times        ?  element.retry_times : '',			 //重试次数（默认三次）
            result_judge        :  element.result_judge       ?  element.result_judge : '',          //结果判定
            job_method          :  element.job_method         ?  element.job_method : 0,             //作业类型 1择组件 2自定义
            env_name            :  element.env_name           ?  element.env_name :'',               //环境名称(由以下四个组合而来)
            language_name       :  element.language_name      ?  element.language_name :'',          //语言名称
            language_version    :  element.language_version   ?  element.language_version :'',       //语言版本
            operating_system    :  element.operating_system   ?  element.operating_system :'',       //操作系统
            bit_number          :  element.bit_number         ?  element.bit_number :'',             //操作位数
            annex_file          :  element.annex_file         ?  element.annex_file :'',             //c/c++附件
            plugin_list         :  element.plugin_list        ?  element.plugin_list :[],            //插件列表(shell/python/java/c,c++)
            request_method      :  element.request_method     ?  element.request_method : 1,         // 服务作业请求方式(1: Post 2:Get)
        };
    };
    //转化临时元素列表
    var convertTempEleList = function(){
        $scope.control.tem_element_list = [];
        for(var k = 0; k < $scope.info.category_list.length; k++){
            var _ele_category = $scope.info.category_list[k];
            _ele_category.element_list = _ele_category.element_list ? _ele_category.element_list : [];
            for(var m = 0; m < _ele_category.element_list.length; m++){
                var _element = _ele_category.element_list[m];
                _element.category = _element.category ? _element.category : _ele_category.category;
                _element.element_id  = _ele_category.category + '_' + m;   //自定义元素id(分类-索引)
                _element.element_info = _element.element_info ? _element.element_info : {};
                $scope.control.tem_element_list.push(_element);
            }
        }
    };
    //切换TAB时状态和控制字段的转化
    var changeTab = function(index) {
        var _last_index = $scope.control.active_element_i;
        if(index === _last_index) return;
        if( _last_index !== -1 && $scope.control.tem_element_list[_last_index]){
            $scope.control.tem_element_list[_last_index].active = false;  //关闭上一个TAB(第一次不关闭)
        }
        $scope.control.tem_element_list[index].active = true;              //激活当前
        $scope.control.active_element_i = index;                           //赋当前TAB下标
    };
    //查找元素临时元素列表下标
    var findTempEleListIndex = function(ele_type,ele_id){
        var _index;
        for(var i = 0; i <  $scope.control.tem_element_list.length; i++){
            var _tem_ele =  $scope.control.tem_element_list[i];
            if(_tem_ele.type === ele_type && _tem_ele.element_id === ele_id){
                _index = i;
                break;
            }
        }
        return _index;
    };
    var init = function(){
        //查看场景服务
        Scene.getSingleSceneDetail(_scene_id).then(function(data){
            $timeout(function(){
                if(data.scene_info){
                    data.scene_info.crt_bk_time = data.scene_info.crt_bk_date +" "+ data.scene_info.crt_bk_time;
                    $scope.info.basic_info = data.scene_info ? data.scene_info : {};
                    $scope.info.category_list = data.scene_bean.category_list ?  data.scene_bean.category_list : [];
                    convertTempEleList();
                }
            },0)
        },function(error){
            $state.go('dispatch_scene_list');
            Modal.alert(error.message)
        });
    }

    //配置元素
    $scope.configElement = function (category,element,index) {
        element.element_info  = element.element_info || {};
        $scope.control.config_element = true;
        var _ele_type = element.type;
        var _ele_id   = category +'_' + index;
        var _tem_index = findTempEleListIndex(_ele_type,_ele_id);
        $scope.tabOne(_tem_index);
    };
    //点击单个tab
    $scope.tabOne = function(index) {
        changeTab(index);
        var _curr_element =  $scope.control.tem_element_list[index];  //当前元素
        $scope.curr_ele_category = _curr_element.category;             //当前元素分类
        $scope.curr_ele_type =  _curr_element.type;                    //当前元素类型
        initElementInfo(_curr_element.element_info);
    };
    //元素高亮图标
    $scope.elementHightIcon = function (type) {
        var _bg_url = '',_bg_size = '/40px';
        switch(type){
            case 1: _bg_url='url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url='url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url='url(img/dispatch/fl/palette/condition.png)'; break;
            case 5: _bg_url='url(img/dispatch/fl/palette/stop.png)'; break;
            case 6: _bg_url='url(img/dispatch/fl/palette/rep.png)'; break;
            case 7:  _bg_url='url(img/dispatch/fl/palette/ftp_u.png)'; break;
            case 8:  _bg_url='url(img/dispatch/fl/palette/ftp_d.png)'; break;
            case 9:  _bg_url='url(img/dispatch/fl/palette/sftp_u.png)'; break;
            case 10: _bg_url='url(img/dispatch/fl/palette/sftp_d.png)'; break;
            case 11: _bg_url='url(img/dispatch/fl/palette/agnt_u.png)'; break;
            case 12: _bg_url='url(img/dispatch/fl/palette/agnt_d.png)'; break;
            case 13: _bg_url='url(img/dispatch/fl/palette/copy.png)'; break;
            case 14: _bg_url='url(img/dispatch/fl/palette/sql.png)'; break;
            case 15: _bg_url='url(img/dispatch/fl/palette/sql_s.png)'; break;
            case 16: _bg_url='url(img/dispatch/fl/palette/net.png)'; break;
            case 17: _bg_url='url(img/dispatch/fl/palette/sys_start.png)'; break;
            case 18: _bg_url='url(img/dispatch/fl/palette/sys_end.png)'; break;
            case 19: _bg_url='url(img/dispatch/fl/palette/python.png)'; break;
            case 20: _bg_url='url(img/dispatch/fl/palette/shell.png)'; break;
            case 21: _bg_url='url(img/dispatch/fl/palette/bat.png)'; break;
            case 22: _bg_url='url(img/dispatch/fl/palette/ruby.png)'; break;
            case 23: _bg_url='url(img/dispatch/fl/palette/perl.png)'; break;
            case 24: _bg_url='url(img/dispatch/fl/palette/web.png)'; break;
            case 25: _bg_url='url(img/dispatch/fl/palette/tcp.png)'; break;
            case 26: _bg_url='url(img/dispatch/fl/palette/http.png)'; break;
            case 27: _bg_url='url(img/dispatch/fl/palette/tux.png)'; break;
            case 28: _bg_url='url(img/dispatch/fl/palette/cl.png)'; break;
            case 29: _bg_url='url(img/dispatch/fl/palette/rpg.png)'; break;
            case 30: _bg_url='url(img/dispatch/fl/palette/java.png)'; break;
            case 31: _bg_url='url(img/dispatch/fl/palette/c.png)'; break;
            case 32: _bg_url='url(img/dispatch/fl/palette/c++.png)'; break;
            case 33: _bg_url='url(img/dispatch/fl/context/site.png)'; break;
            case 34: _bg_url='url(img/dispatch/fl/context/area.png)'; break;
            case 35: _bg_url='url(img/dispatch/fl/context/cell.png)'; break;
            case 36: _bg_url='url(img/dispatch/fl/context/unit.png)'; break;
            case 37: _bg_url='url(img/dispatch/fl/context/enterprise.png)'; break;
            case 38: _bg_url='url(img/dispatch/fl/context/t38.png)'; break;
            case 39: _bg_url='url(img/dispatch/fl/context/t39.png)'; break;
            case 40: _bg_url='url(img/dispatch/fl/context/t40.png)'; break;
            case 41: _bg_url='url(img/dispatch/fl/context/t41.png)'; break;
            case 42: _bg_url='url(img/dispatch/fl/context/t42.png)'; break;
            case 43: _bg_url='url(img/dispatch/fl/context/t43.png)'; break;
            case 44: _bg_url='url(img/dispatch/fl/context/t44.png)'; break;
            case 45: _bg_url='url(img/dispatch/fl/context/t45.png)'; break;
            case 46: _bg_url='url(img/dispatch/fl/context/t46.png)'; break;
            case 47: _bg_url='url(img/dispatch/fl/context/t47.png)'; break;
            case 48: _bg_url='url(img/dispatch/fl/context/t48.png)'; break;
            case 49: _bg_url='url(img/dispatch/fl/context/t49.png)'; break;
            case 50: _bg_url='url(img/dispatch/fl/context/t50.png)'; break;
            case 51: _bg_url='url(img/dispatch/fl/context/t51.png)'; break;
            case 52: _bg_url='url(img/dispatch/fl/context/t52.png)'; break;
            case 53: _bg_url='url(img/dispatch/fl/context/t53.png)'; break;
            case 54: _bg_url='url(img/dispatch/fl/context/t54.png)'; break;
            case 55: _bg_url='url(img/dispatch/fl/context/t55.png)'; break;
            case 56: _bg_url='url(img/dispatch/fl/context/t56.png)'; break;
            default: _bg_url='url(img/dispatch/fl/palette/ftp_u.png)'; break;
        }
        return {"background": _bg_url + 'no-repeat center' + _bg_size};
    };
    //单个元素类型图标
    $scope.elementIcon = function(){
        var _bg_url = '',_bg_size = '/45px';
        switch($scope.curr_ele_type){
            case 1: _bg_url='url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url='url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url='url(img/dispatch/fl/context/condition.png)'; break;
            case 5: _bg_url='url(img/dispatch/fl/context/stop.png)'; break;
            case 6: _bg_url='url(img/dispatch/fl/context/rep.png)'; break;
            case 7:  _bg_url='url(img/dispatch/fl/context/ftpU.png)'; break;
            case 8:  _bg_url='url(img/dispatch/fl/context/ftpD.png)'; break;
            case 9:  _bg_url='url(img/dispatch/fl/context/sftpU.png)'; break;
            case 10: _bg_url='url(img/dispatch/fl/context/sftpD.png)'; break;
            case 11: _bg_url='url(img/dispatch/fl/context/zngtU.png)'; break;
            case 12: _bg_url='url(img/dispatch/fl/context/zngtD.png)'; break;
            case 13: _bg_url='url(img/dispatch/fl/context/copy.png)'; break;
            case 14: _bg_url='url(img/dispatch/fl/context/sql.png)'; break;
            case 15: _bg_url='url(img/dispatch/fl/context/sqlS.png)'; break;
            case 16: _bg_url='url(img/dispatch/fl/context/web.png)'; break;
            case 17: _bg_url='url(img/dispatch/fl/context/sysSt.png)'; break;
            case 18: _bg_url='url(img/dispatch/fl/context/sysE.png)'; break;
            case 19: _bg_url='url(img/dispatch/fl/context/python.png)'; break;
            case 20: _bg_url='url(img/dispatch/fl/context/shell.png)'; break;
            case 21: _bg_url='url(img/dispatch/fl/context/bat.png)'; break;
            case 22: _bg_url='url(img/dispatch/fl/context/rb.png)'; break;
            case 23: _bg_url='url(img/dispatch/fl/context/perl.png)'; break;
            case 24: _bg_url='url(img/dispatch/fl/context/webs.png)'; break;
            case 25: _bg_url='url(img/dispatch/fl/context/tcp.png)'; break;
            case 26: _bg_url='url(img/dispatch/fl/context/http.png)'; break;
            case 27: _bg_url='url(img/dispatch/fl/context/tux.png)'; break;
            case 28: _bg_url='url(img/dispatch/fl/context/cl.png)'; break;
            case 29: _bg_url='url(img/dispatch/fl/context/rpg.png)'; break;
            case 30: _bg_url='url(img/dispatch/fl/context/java.png)'; break;
            case 31: _bg_url='url(img/dispatch/fl/context/c.png)'; break;
            case 32: _bg_url='url(img/dispatch/fl/context/c++.png)'; break;
            case 33: _bg_url='url(img/dispatch/fl/context/site.png)'; break;
            case 34: _bg_url='url(img/dispatch/fl/context/area.png)'; break;
            case 35: _bg_url='url(img/dispatch/fl/context/cell.png)'; break;
            case 36: _bg_url='url(img/dispatch/fl/context/unit.png)'; break;
            case 37: _bg_url='url(img/dispatch/fl/context/enterprise.png)'; break;
            case 38: _bg_url='url(img/dispatch/fl/context/t38.png)'; break;
            case 39: _bg_url='url(img/dispatch/fl/context/t39.png)'; break;
            case 40: _bg_url='url(img/dispatch/fl/context/t40.png)'; break;
            case 41: _bg_url='url(img/dispatch/fl/context/t41.png)'; break;
            case 42: _bg_url='url(img/dispatch/fl/context/t42.png)'; break;
            case 43: _bg_url='url(img/dispatch/fl/context/t43.png)'; break;
            case 44: _bg_url='url(img/dispatch/fl/context/t44.png)'; break;
            case 45: _bg_url='url(img/dispatch/fl/context/t45.png)'; break;
            case 46: _bg_url='url(img/dispatch/fl/context/t46.png)'; break;
            case 47: _bg_url='url(img/dispatch/fl/context/t47.png)'; break;
            case 48: _bg_url='url(img/dispatch/fl/context/t48.png)'; break;
            case 49: _bg_url='url(img/dispatch/fl/context/t49.png)'; break;
            case 50: _bg_url='url(img/dispatch/fl/context/t50.png)'; break;
            case 51: _bg_url='url(img/dispatch/fl/context/t51.png)'; break;
            case 52: _bg_url='url(img/dispatch/fl/context/t52.png)'; break;
            case 53: _bg_url='url(img/dispatch/fl/context/t53.png)'; break;
            case 54: _bg_url='url(img/dispatch/fl/context/t54.png)'; break;
            case 55: _bg_url='url(img/dispatch/fl/context/t55.png)'; break;
            case 56: _bg_url='url(img/dispatch/fl/context/t56.png)'; break;
            default: _bg_url='url(img/dispatch/fl/context/ftpU.png)'; break;
        }
        return {"background": _bg_url + 'no-repeat center' + _bg_size};
    };
    //元素类别转换
    $scope.categoryTOCn = function(category){
        return CV.findValue(category,ElementCategory)
    };
    //元素类型转换
    $scope.eleTypeTOCn = function(type){
        return type ? CV.findValue(type,FlowJobType) : '--';
    };
    //元素类别转换
    $scope.categoryTOCn = function(category){
        return CV.findValue(category,ElementCategory)
    };
    //数据库类型转换
    $scope.databaseTypeTOCn = function(type){
        return CV.findValue(type,dataBaseType)
    };
    //出错处理转换
    $scope.errorHandleTOCn = function(type){
        return CV.findValue(type,JobErrorType)
    };
    //服务作业请求方式转换
    $scope.requestMethodTOCn = function(method){
        return CV.findValue(method,RequestMethod)
    };
    //关闭元素配置
    $scope.closeElementConfig = function(){
        $scope.control.config_element = false;
        window.scroll({top:0})
    };
    //查看脚本
    $scope.viewScript = function(){
        Modal.setFlowJobMethod($scope.curr_ele_type,$scope.data.element_data,true)
    };
    //返回场景列表
    $scope.backToSceneList = function(){
        $state.go('dispatch_scene_list');
    };
    init();
}]);
//场景列表控制器
scene.controller('sceneListCtrl', ["$scope", "$stateParams", "$timeout", "$state", "ScrollBarConfig", function($scope, $stateParams, $timeout, $state, ScrollBarConfig) {
    $scope.viewSingleScene = function(scene_id,private_flag){
        $state.go('dispatch_scene_list.single_scene',{
            scene_id : scene_id,
            private_flag : private_flag
        });
    };
    $scope.scene_list_scroll = ScrollBarConfig.Y();
    //计算右侧流程信息容器高度
    $scope.calculateSceneInfoHeight = function(){
        return {
            'height' : $('.ui-view-content').height() - 94 //(94：容器距离顶部的高度)
        }
    };
    //计算左侧流程列表容器高度
    $scope.calculateSceneListHeight = function(){
        return {
            'height' : $('.ui-view-content').height() - 30 //(30：容器距离顶部的高度)
        }
    };
    $(window).resize(function () {
        $timeout(function () {
            $scope.calculateSceneInfoHeight();
            $scope.calculateSceneListHeight();
        },50);
    });
}]);
//查看单个场景信息
scene.controller('singleSceneInfoCtrl', ["$scope", "$stateParams", "$timeout", "ElementCategory", "FlowJobType", "Scene", "Modal", "CV", function($scope, $stateParams, $timeout, ElementCategory, FlowJobType, Scene, Modal, CV) {
    var _scene_id = $stateParams.scene_id || '';
    var _private_flag = $stateParams.private_flag || false; //是否查看私有场景
    $scope.info = {
        basic_info:{},
        scene_ele_list:[]
    };
    $scope.control = {
        single_scene_loading : false
    };
    var init = function(){
        if(_scene_id && _private_flag){
            $scope.control.single_scene_loading = true;
            Scene.getSingleSceneDetail(_scene_id,_private_flag).then(function (data) {
                $timeout(function() {
                    $scope.control.single_scene_loading = false;
                    $scope.info.basic_info = data.scene_info;
                    if(data.scene_bean){
                        $scope.info.scene_ele_list = data.scene_bean.category_list ? data.scene_bean.category_list : [];
                    }
                }, 0);
            }, function (error) {
                $scope.control.single_scene_loading = false;
                $scope.info.scene_ele_list = [];
                Modal.alert(error.message);
            });
        }
    }
    //元素高亮图标
    $scope.elementHightIcon = function (type) {
        var _bg_url = '',_bg_size = '/40px';
        switch(type){
            case 1: _bg_url='url(img/dispatch/fl/palette/start.png)'; break;
            case 2: _bg_url='url(img/dispatch/fl/palette/end.png)'; break;
            case 4: _bg_url='url(img/dispatch/fl/palette/condition.png)'; break;
            case 5: _bg_url='url(img/dispatch/fl/palette/stop.png)'; break;
            case 6: _bg_url='url(img/dispatch/fl/palette/rep.png)'; break;
            case 7:  _bg_url='url(img/dispatch/fl/palette/ftp_u.png)'; break;
            case 8:  _bg_url='url(img/dispatch/fl/palette/ftp_d.png)'; break;
            case 9:  _bg_url='url(img/dispatch/fl/palette/sftp_u.png)'; break;
            case 10: _bg_url='url(img/dispatch/fl/palette/sftp_d.png)'; break;
            case 11: _bg_url='url(img/dispatch/fl/palette/agnt_u.png)'; break;
            case 12: _bg_url='url(img/dispatch/fl/palette/agnt_d.png)'; break;
            case 13: _bg_url='url(img/dispatch/fl/palette/copy.png)'; break;
            case 14: _bg_url='url(img/dispatch/fl/palette/sql.png)'; break;
            case 15: _bg_url='url(img/dispatch/fl/palette/sql_s.png)'; break;
            case 16: _bg_url='url(img/dispatch/fl/palette/net.png)'; break;
            case 17: _bg_url='url(img/dispatch/fl/palette/sys_start.png)'; break;
            case 18: _bg_url='url(img/dispatch/fl/palette/sys_end.png)'; break;
            case 19: _bg_url='url(img/dispatch/fl/palette/python.png)'; break;
            case 20: _bg_url='url(img/dispatch/fl/palette/shell.png)'; break;
            case 21: _bg_url='url(img/dispatch/fl/palette/bat.png)'; break;
            case 22: _bg_url='url(img/dispatch/fl/palette/ruby.png)'; break;
            case 23: _bg_url='url(img/dispatch/fl/palette/perl.png)'; break;
            case 24: _bg_url='url(img/dispatch/fl/palette/web.png)'; break;
            case 25: _bg_url='url(img/dispatch/fl/palette/tcp.png)'; break;
            case 26: _bg_url='url(img/dispatch/fl/palette/http.png)'; break;
            case 27: _bg_url='url(img/dispatch/fl/palette/tux.png)'; break;
            case 28: _bg_url='url(img/dispatch/fl/palette/cl.png)'; break;
            case 29: _bg_url='url(img/dispatch/fl/palette/rpg.png)'; break;
            case 30: _bg_url='url(img/dispatch/fl/palette/java.png)'; break;
            case 31: _bg_url='url(img/dispatch/fl/palette/c.png)'; break;
            case 32: _bg_url='url(img/dispatch/fl/palette/c++.png)'; break;
            case 33: _bg_url='url(img/dispatch/fl/context/site.png)'; break;
            case 34: _bg_url='url(img/dispatch/fl/context/area.png)'; break;
            case 35: _bg_url='url(img/dispatch/fl/context/cell.png)'; break;
            case 36: _bg_url='url(img/dispatch/fl/context/unit.png)'; break;
            case 37: _bg_url='url(img/dispatch/fl/context/enterprise.png)'; break;
            case 38: _bg_url='url(img/dispatch/fl/context/t38.png)'; break;
            case 39: _bg_url='url(img/dispatch/fl/context/t39.png)'; break;
            case 40: _bg_url='url(img/dispatch/fl/context/t40.png)'; break;
            case 41: _bg_url='url(img/dispatch/fl/context/t41.png)'; break;
            case 42: _bg_url='url(img/dispatch/fl/context/t42.png)'; break;
            case 43: _bg_url='url(img/dispatch/fl/context/t43.png)'; break;
            case 44: _bg_url='url(img/dispatch/fl/context/t44.png)'; break;
            case 45: _bg_url='url(img/dispatch/fl/context/t45.png)'; break;
            case 46: _bg_url='url(img/dispatch/fl/context/t46.png)'; break;
            case 47: _bg_url='url(img/dispatch/fl/context/t47.png)'; break;
            case 48: _bg_url='url(img/dispatch/fl/context/t48.png)'; break;
            case 49: _bg_url='url(img/dispatch/fl/context/t49.png)'; break;
            case 50: _bg_url='url(img/dispatch/fl/context/t50.png)'; break;
            case 51: _bg_url='url(img/dispatch/fl/context/t51.png)'; break;
            case 52: _bg_url='url(img/dispatch/fl/context/t52.png)'; break;
            case 53: _bg_url='url(img/dispatch/fl/context/t53.png)'; break;
            case 54: _bg_url='url(img/dispatch/fl/context/t54.png)'; break;
            case 55: _bg_url='url(img/dispatch/fl/context/t55.png)'; break;
            case 56: _bg_url='url(img/dispatch/fl/context/t56.png)'; break;
            default: _bg_url='url(img/dispatch/fl/palette/ftp_u.png)'; break;
        }
        return {"background": _bg_url + 'no-repeat center' + _bg_size};
    };
    //元素类型转换
    $scope.eleTypeTOCn = function(type){
        return type ? CV.findValue(type,FlowJobType) : '--';
    };
    //元素类别转换
    $scope.categoryTOCn = function(category){
        return CV.findValue(category,ElementCategory)
    };
    init();
}]);
