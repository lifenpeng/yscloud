
'use strict';

//项目计划控制器
var planCtrl = angular.module('PlanController', []);

/**
 *计划列表-编列
 * */
planCtrl.controller('projPlanListCtrl', ["$scope", "$timeout", "$state", "$modal", "Plan",  "Modal", "CV", function($scope, $timeout, $state, $modal, Plan, Modal, CV) {
    //数据对象
    $scope.info = {
        items : []//计划数据
    };
    //控制对象
    $scope.control = {
        tab_type : 0,//表格类型（区分前置，分组，历史计划）0:计划，1:前置，2:分组，无:历史
    };
    //获得计划列表信息
    $scope.getPlanData = function() {
        var _time = CV.dtFormat(CV.dateCalculate(new Date(), "dd", -1));
        Plan.getPlan(_time).then(function (data) {
            $timeout(function(){
                $scope.info.items = data.list_pjplancal ? data.list_pjplancal : [];
                for(var j =0;j<$scope.info.items.length;j++){
                    $scope.info.items[j].total_plan_list =[];
                    $scope.info.items[j].number_plan = ($scope.info.items[j].number_manual)*100/($scope.info.items[j].number_manual+$scope.info.items[j].number_auto);
                    $scope.info.items[j].show = false;
                }
                if($scope.info.items.length != 0) {
                    $scope.info.items[0].show = true;
                }
            },0);
        }, function (error) {
            Modal.alert(error.message,3);
        });
    };
    //初始化
    var init = function(){
        $scope.getPlanData();
    };
    //切换tab页
    $scope.changeTabState = function (path) {
        $state.go(path);
    }
    init();
}]);
/**
 *计划列表-前置
 * */
planCtrl.controller('projPreListCtrl', ["$scope", "$timeout", "$state",  "$modal", "Plan", "Modal", "CV", function($scope, $timeout, $state, $modal, Plan,  Modal, CV) {
    //页面数据
    $scope.info = {
        pre_items : [],
    };
    //控制对象
    $scope.control = {
        tab_type : 1,//表格类型（区分前置，分组，历史计划）0:计划，1:前置，2:分组，无:历史
    };
    //获得前置列表
    var getPrePlanData = function(){
        Plan.getPreGroupNumberList().then(function (data) {
            $timeout(function(){
                $scope.info.pre_items = data.group_number_list ? data.group_number_list : [];
                if($scope.info.pre_items.length != 0) {
                    $scope.info.pre_items[0].show = true;
                }
                for(var i = 1; i < $scope.info.pre_items.length; i ++) {
                    $scope.info.pre_items[i].show = false;
                }
            },0);
        }, function (error) {
            Modal.alert(error.message,3);
        });
    };
    //初始化
    var init = function(){
        getPrePlanData();
    };
    //切换tab页
    $scope.changeTabState = function (path) {
        $state.go(path);
    }
    init();

}]);
/**
 *计划列表-分组
 * */
planCtrl.controller('projGroupListCtrl', ["$scope", "$timeout", "$state", "$stateParams", "$modal", "Plan", "Monitor", "Modal", "CV", function($scope, $timeout, $state, $stateParams, $modal, Plan, Monitor, Modal, CV) {
    var _group_id;//当前操作的分组组号
    var _date = CV.dtFormat(new Date());//根据日期查询分组数据
    $scope.info = {
        group_items : [],   //分组数据
        group_date  : _date,//当前日期
    };
    $scope.control = {
        read_only : false,  //流程图只读属性
        tab_type  : 2,      //表格类型（区分前置，分组，历史计划）0:计划，1:前置，2:分组，无:历史
    };
    //修改分组模态框
    var showEditGroupModel = function(group_id,groupCnName,_date) {
        Modal.editGroup(group_id,groupCnName,_date).then(function(data) {
            //刷新分组列表
            getPlanGroupData();
        });
    };
    //新增分组模态框
    var showNewGroupModel = function() {
        Modal.newGroup().then(function() {
            //刷新分组列表
            getPlanGroupData();
        });
    };
    //获得分组列表信息
    var getPlanGroupData = function() {
        Plan.getGroupList().then(function (data) {
            $timeout(function(){
                $scope.info.group_items = data.group_id_list ? data.group_id_list : [];
                for(var i = 1; i < $scope.info.group_items.length; i ++) {
                    $scope.info.group_items[i].show = false;
                }
                if($scope.info.group_items.length != 0){
                    $scope.info.group_items[0].show = true;
                }
            },0);
        }, function (error) {
            Modal.alert(error.message,3);
        });
    };
    //处理流程定制的数据
    var dealLinkAndNode = function(group,item){
        var _key = 1;
        var _interline_relation = [];
        for(var i = 0 ; i < group.proj_list.length; i++){
            var _proj = group.proj_list[i];
            var _row_node = {
                category:'OfNodes',
                isGroup:true,
                key:_key
            }
            _key++;
            item.nodeLinkData.nodeDataArray.push(_row_node);
            var _pre_key = undefined;
            for(var j = 0 ; j < _proj.phase_list.length; j++){
                item.node_length = item.node_length > j+1 ? item.node_length : j+1;
                var _phase = _proj.phase_list[j];
                var _date_string = '';
                if(new Date(new Date().toLocaleDateString()).getTime() < new Date(_proj.start_date).getTime()){
                    _date_string = '今日'
                }else{
                    _date_string = '昨天'
                }
                var _col_node = {
                    key: _key ,
                    test:_phase.phase_cn_name,
                    isGroup:true,
                    category:'OfGroups',
                    time:j == 0 ? _proj.start_time : (j == _proj.phase_list.length-1 ? _proj.end_time:''),
                    date_flag:j == 0 ? _date_string : '',
                    group:_row_node.key
                }
                _key++;
                if(_phase.phase_status == 2){
                    var _node = {
                        key: _key ,
                        group:_col_node.key,
                        category:'executing',
                        slices: [
                            { start:-90, sweep: 360, color: "#CCC",radius:20,center:20 },
                            { start:-90, sweep: 360*0.01*_phase.phase_dynamic, color:"#2196f3",radius:20,center:20 },
                            { start:-90, sweep: 360, color: "#fafafa" ,radius:16,center:20 },
                        ],
                        row:i+1,
                        col:j+1,
                    }
                    _key++;
                }else{
                    var _node = {
                        key: _key ,
                        group:_col_node.key,
                        category:'noExecute',
                        row:i+1,
                        col:j+1,
                        status:_phase.phase_status
                    }
                    _key++;
                }
                if(_phase.rely_list && _phase.rely_list.length != 0){
                    for(var p = 0 ; p < _phase.rely_list.length; p++){
                        var _one_pre = _phase.rely_list[p];
                        _interline_relation.push({to:_node.key,proj_name:_one_pre.pre_proj_name,phase_id:_one_pre.pre_phase_name,to_row:p+1,to_col:j+1});
                    }
                }
                item.nodeLinkData.nodeDataArray.push(_col_node);
                item.nodeLinkData.nodeDataArray.push(_node);
                if(j != 0){
                    item.nodeLinkData.linkDataArray.push({from:_pre_key,to:_node.key,statue:_phase.phase_status,extra_flag:false});
                }
                _pre_key = _node.key;
            }
        }
        for(var i = 0 ; i < _interline_relation.length; i++){
            var key = 0;
            for(var j = 0 ; j < group.proj_list.length; j++){
                key++;
                var _proj = group.proj_list[j];
                for(var k = 0 ; k < _proj.phase_list.length; k++){
                    key = key+2;
                    if(_proj.proj_name == _interline_relation[i].proj_name && _proj.phase_list[k].phase_id == _interline_relation[i].phase_id){
                        item.nodeLinkData.linkDataArray.push({to:_interline_relation[i].to,
                            from:key,
                            statue:_proj.phase_list[k].phase_status,
                            extra_flag:true,
                            to_row:_interline_relation[i].to_row,
                            to_col:_interline_relation[i].to_col,
                            from_row:j+1,
                            from_col:k+1,
                        });
                    }
                }
            }
        }
        item.old_linkData = angular.copy(item.nodeLinkData.linkDataArray);
        item.loadingData = true;
    };
    //获取流程定制项目阶段数据
    var getOneItemGroupData = function(item){
        Monitor.getPjGroupToProcessMsg(_group_id).then(function(data){
            item.group = data.process_list[0];
            dealLinkAndNode(item.group,item);
        },function(error){
            item.loading_error =  true;
        });
    };
    //页面初始化
    var init = function () {
        getPlanGroupData();
    }
    //切换tab页
    $scope.changeTabState = function (path) {
        $state.go(path);
    }
    //修改分组
    $scope.editGroup = function(event,group_id,groupCnName){
        //阻止点击事件传递
        event.stopPropagation();
        //修改模态框
        showEditGroupModel(group_id,groupCnName,_date);
    };
    //新增分组
    $scope.newGroup = function(){
        showNewGroupModel();
    };
    //编辑查询当前的流程定制
    $scope.editProcess = function(event, group_id, index, item) {
        item.node_length = 0;
        item.nodeLinkData = {
            nodeDataArray:[],
            linkDataArray:[]
        };
        item.phase = {};
        item.loadingData = false;
        item.group = {};
        _group_id = group_id;
        getOneItemGroupData(item);
        //阻止点击事件传递
        if(item.show){
            event.stopPropagation();
        }
    };
    //保存流程定制
    $scope.saveProcess = function(item, index) {
        var _rebuild = [];
        for(var i = 0 ; i < item.nodeLinkData.linkDataArray.length; i++){
            if(!item.nodeLinkData.linkDataArray[i].statue || item.nodeLinkData.linkDataArray[i].extra_flag){
                var _node = {};
                for(var j = 0; j < item.nodeLinkData.nodeDataArray.length; j++) {
                    if(item.nodeLinkData.linkDataArray[i].from == item.nodeLinkData.nodeDataArray[j].key){
                        _node.row_from = item.nodeLinkData.nodeDataArray[j].row;
                        _node.col_from = item.nodeLinkData.nodeDataArray[j].col;
                    }
                    if(item.nodeLinkData.linkDataArray[i].to == item.nodeLinkData.nodeDataArray[j].key){
                        _node.row_to = item.nodeLinkData.nodeDataArray[j].row;
                        _node.col_to = item.nodeLinkData.nodeDataArray[j].col;
                    }
                }
                if(_node.row_from && _node.row_to){
                    _rebuild.push(_node);
                }
            }
        }
        //重置所有阶段的前后置关系
        for(var m=0;m<item.group.proj_list.length;m++){
            for(var n=0;n<item.group.proj_list[m].phase_list.length;n++){
                if(item.group.proj_list[m].phase_list[n].rely_list){
                    item.group.proj_list[m].phase_list[n].rely_list = [];
                }
            }
        }
        //处理新画的
        for(var l = 0 ; l < _rebuild.length; l++){
            var _pre_proj_name = item.group.proj_list[_rebuild[l].row_from-1].proj_name;
            var _pre_sys_name = item.group.proj_list[_rebuild[l].row_from-1].business_sys_name;
            var _pre_phase_name = item.group.proj_list[_rebuild[l].row_from-1].phase_list[_rebuild[l].col_from-1].phase_id;
            if(!item.group.proj_list[_rebuild[l].row_to-1].phase_list[_rebuild[l].col_to-1].rely_list){
                item.group.proj_list[_rebuild[l].row_to-1].phase_list[_rebuild[l].col_to-1].rely_list = [];
            }
            item.group.proj_list[_rebuild[l].row_to-1].phase_list[_rebuild[l].col_to-1].rely_list.push({pre_proj_name:_pre_proj_name,pre_phase_name:_pre_phase_name,pre_sys_name:_pre_sys_name});
        }
        item.process_loading = true;
        Monitor.savePjToProcess(item.group).then(function(data){
            item.process_loading = false;
            Modal.alert('流程保存成功！',2);

        },function(error){
            item.process_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //流程图左侧样式
    $scope.projStyle = function(index){
        return {
            'position': "absolute",
            'width':"124px",
            'top':index*145 +"px"
        }
    };
    init();
}]);
/**
 *历史计划列表
 **/
planCtrl.controller('projPlanHistoryCtrl', ["$scope", "$timeout", "Plan", "Modal", "CV", function($scope, $timeout, Plan, Modal, CV) {
    $scope.info = {
        his_plan_items : {}
    };
    //获得历史计划列表信息
    var getHisPlanData = function() {
        Plan.getHistoryplan(CV.dtFormat(new Date())).then(function (data) {
            $timeout(function(){
                $scope.info.his_plan_items = data.query_plan_list ? data.query_plan_list : [];
                if($scope.info.his_plan_items.length != 0) $scope.info.his_plan_items[0].show = true;
                for(var i = 1; i < $scope.info.his_plan_items.length; i ++) {
                    $scope.info.his_plan_items[i].show = false;
                }
            },0);
        }, function (error) {
            Modal.alert(error.message,3);
        });
    };
    //历史计划页面初始加载
    getHisPlanData();
}]);
/**
 * 计划编列&修改
 * */
planCtrl.controller('planModalCtrl', ["$scope", "$modalInstance", "Plan", "TabParams", "Modal", "CV", function($scope, $modalInstance, Plan, TabParams, Modal, CV) {
    var _proj_name = TabParams.project_name;
    var _sys_name = TabParams.business_sys_name;
    var _behind_proj_list = [];//后置项目
    var _curr_front_proj_list = []; //当前前置项目列表(对象列表)
    var _is_init = true;//是否是初始化
    var _now_date_time;//从后台获取的当前日期
    $scope.info = {
        curr_proj   : {}, //当前项目
        front_proj  : {  //前置项目
            proj_list:[]
        }
    }
    $scope.control = {
        show_front : false ,//根据是否有分组id决定是否展示前置
        hasFrontProj : 1,//是否有前置项目标记
        datepicker : {
            minDate : new Date()
        }, //可计划的最小日期
    }
    //重新加载前置项目列表
    var _reloadFrontProjList = function(pj_plan_list) {
        var _frontProjList = [];
        var _pj_plan_list = pj_plan_list ? pj_plan_list : [];
        for(var i = 0; i < _pj_plan_list.length; i ++) {
            var _pj_plan = _pj_plan_list[i];
            _frontProjList.push({key: _pj_plan.project_name+"|"+_pj_plan.business_sys_name, value: _pj_plan.project_short_name});
            var _hhmmss = _pj_plan.start_bk_time.split(":");
            _pj_plan.time_hour = _hhmmss[0];
            _pj_plan.time_minute = _hhmmss[1];
            _pj_plan.plan_date_time = CV.toDate(_pj_plan.pro_bk_date + " " + _pj_plan.start_bk_time);
            _pj_plan.project_busisys = _pj_plan.project_name+"|"+_pj_plan.business_sys_name;
        }
        $scope.info.front_proj.proj_list = _frontProjList;  //下拉菜单专用
        _curr_front_proj_list = _pj_plan_list;  //完整的前置项目对象列表
    }
    var init = function() {
        Plan.queryPlanData(_sys_name, _proj_name).then(function(data) {
            //当前项目
            $scope.info.curr_proj = data.pj_web_plan.pj_plan_info;
            //根据是否有分组id决定是否显示前置
            if(!$scope.info.curr_proj.group_id){
                $scope.control.show_front = true;
            }
            _now_date_time =CV.toDate(data.dtbs_bk_date + " " + data.dtbs_bk_time);            //今天
            $scope.info.curr_proj.plan_date_time = CV.toDate($scope.info.curr_proj.pro_bk_date + " " + $scope.info.curr_proj.start_bk_time);
            //后置项目列表
            _behind_proj_list = data.pj_web_plan.behind_plan_list ? data.pj_web_plan.behind_plan_list : [];
            if(_behind_proj_list.length > 0) {
                //最近的一个后置项目日期时间
                _behind_proj_list[0].plan_date_time = CV.toDate(_behind_proj_list[0].pro_bk_date + " " + _behind_proj_list[0].start_bk_time);
            }
            //前置项目
            $scope.info.front_proj = data.pj_web_plan.front_plan_info ? data.pj_web_plan.front_plan_info : {};
            $scope.control.hasFrontProj = data.pj_web_plan.front_plan_info ? 1 : 2;
            if($scope.info.front_proj.project_name) {
                var _hhmmss = $scope.info.front_proj.start_bk_time.split(":");
                $scope.info.front_proj.time_hour = _hhmmss[0];
                $scope.info.front_proj.time_minute = _hhmmss[1];
                $scope.info.front_proj.project_busisys = $scope.info.front_proj.project_name +"|"+ $scope.info.front_proj.business_sys_name;
                $scope.info.front_proj.plan_date_time = CV.toDate($scope.info.front_proj.pro_bk_date + " " + $scope.info.front_proj.start_bk_time);//需要初始化的时间
                //有前置，才调服务,查列表
               return Plan.getPreProjListByDate(_proj_name, _sys_name,$scope.info.front_proj.pro_bk_date);
            }else{
                return false;
            }
        }, function(error) {
            Modal.alert(error.message,3);
        }).then(function(data) {
            if(data){
                _reloadFrontProjList(data.pj_plan_list);
            }
            _is_init = false;
        }, function(error) {
            Modal.alert(error.message,3);
        });
    };
    //选择计划发布时间
    $scope.changeCurrPlanTime = function() {
        var temporaryTime;
         if(($scope.info.curr_proj.pro_bk_date instanceof Date)==false){
             temporaryTime=new Date($scope.info.curr_proj.pro_bk_date);
         }else{
             temporaryTime=$scope.info.curr_proj.pro_bk_date;
         }
        temporaryTime.setHours($scope.info.curr_proj.plan_date_time.getHours());
        temporaryTime.setMinutes($scope.info.curr_proj.plan_date_time.getMinutes());
        $scope.info.curr_proj.plan_date_time=temporaryTime;
        if($scope.info.curr_proj.plan_date_time < _now_date_time) {
            Modal.alert("计划时间不可小于当前时间！",3);
            $scope.info.curr_proj.plan_date_time = _now_date_time;
        }
        $scope.info.curr_proj.start_bk_time = CV.dttFormat($scope.info.curr_proj.plan_date_time);
    }
    //选择是否有前置项目
    $scope.changeFrontProj = function(frontShowFlag) {
        if(frontShowFlag ==  1) {
            if(!$scope.info.front_proj.project_name) {
                $scope.info.front_proj.pro_bk_date = CV.dtFormat($scope.info.curr_proj.pro_bk_date);
            }
        } else {
            $scope.info.front_proj = {};
        }
        $scope.control.hasFrontProj = frontShowFlag;
    }
    //选择前置项目计划日期
    $scope.$watch('info.front_proj.pro_bk_date', function(newValue) {
        if(!_is_init && newValue) {
            $scope.info.front_proj.project_busisys = "";
            $scope.info.front_proj.start_bk_time="";    //变换日期之后，time需要消失
            $scope.info.front_proj.project_name="";//前置名字变为空；
            Plan.getPreProjListByDate(_proj_name, _sys_name, newValue).then(function(data) {
                //如果不返回list数据
                if(data.pj_plan_list){
                    _reloadFrontProjList(data.pj_plan_list);
                }else{
                    $scope.info.front_proj.proj_list=[];
                }

            }, function(error) {
                Modal.alert(error.message,3);
            });
        }
    });
    //选择前置项目
    $scope.selectPreProj = function (project_busisys) {
        for(var i = 0; i < _curr_front_proj_list.length; i ++) {
            var _curr_front_proj = _curr_front_proj_list[i];
            if(_curr_front_proj.project_busisys == project_busisys) {
                $scope.info.front_proj.project_name = _curr_front_proj.project_name;
                $scope.info.front_proj.business_sys_name = _curr_front_proj.business_sys_name;
                $scope.info.front_proj.start_bk_time = _curr_front_proj.start_bk_time;
                $scope.info.front_proj.plan_date_time = _curr_front_proj.plan_date_time;//解决了赋值前置时间；
                var _hhmmss = _curr_front_proj.start_bk_time.split(":");
                $scope.info.front_proj.time_hour = _hhmmss[0];
                $scope.info.front_proj.time_minute = _hhmmss[1];
                $scope.info.front_proj.project_busisys = _curr_front_proj.project_busisys;
            }
        }
    }
    //提交计划编排
    $scope.formSubmit = function () {
        //如果列表只有一个，那就默认选择第一个;
        if($scope.control.hasFrontProj == 1 && !$scope.info.front_proj.project_name) {
            Modal.alert("请设置前置项目",3);
            return false;
        }
        //如果有前置-计划不能早于前置
        if($scope.info.front_proj.project_name) {
            if($scope.info.curr_proj.plan_date_time < $scope.info.front_proj.plan_date_time) {
                Modal.alert("计划时间早于前置项目，请重新设置！",3);
                return false;
            }
        }
        //如果有后置-计划不能晚于后置
        if(_behind_proj_list.length > 0) {
            if($scope.info.curr_proj.plan_date_time > _behind_proj_list[0].plan_date_time) {
                Modal.alert("计划时间晚于后置项目时间["+CV.dtFormat(_behind_proj_list[0].plan_date_time) + " " + CV.dttFormat(_behind_proj_list[0].plan_date_time)+"]，请重新设置！");
                return false;
            }
        }
        $scope.btnBus_loading = true;
        Plan.updatePlan({
            sysName     :$scope.info.curr_proj.business_sys_name,
            projName    :$scope.info.curr_proj.project_name,
            plandate    :CV.dtFormat($scope.info.curr_proj.pro_bk_date),
            plantime    :$scope.info.curr_proj.start_bk_time,
            preSysName  :$scope.info.front_proj.business_sys_name,
            preProjName :$scope.info.front_proj.project_name,
            autoYnFlag  :$scope.info.curr_proj.auto_yn_flag     //手动/自动执行标志
        }).then(function (data) {
            $modalInstance.close(true);
        }, function (error) {
            $scope.btnBus_loading = false;
            Modal.alert(error.message,3);
        });
    };
    //取消计划编排
    $scope.formCancel = function () {
        $modalInstance.dismiss(false);
    };
    init();
}]);

/**
 *计划编列--新
 * */
planCtrl.controller('planSysSetCtrl', ["$scope", "$timeout", "$state", "$stateParams", "$modal", "Plan", "Monitor", "Modal", "CV", function($scope, $timeout, $state, $stateParams, $modal, Plan, Monitor, Modal, CV) {
    var _publish_id = $stateParams.publish_id;
    console.log(_publish_id);
    $scope.info = {
        item : {
            node_length : 0,
            nodeLinkData:{
                nodeDataArray:[],
                linkDataArray:[]
            },
            phase:{},
            group:{},
        },   //单个数据
        group_date  : '',//当前日期
    };
    $scope.control = {
        read_only : false,  //流程图只读属性
        data_loading:false,//加载数据loading
        process_loading: false,
    };
    $scope.data = {
        publish_list : [], //发布系统列表
    };
    //处理流程定制的数据
    var dealLinkAndNode = function(group,item){
        var _key = 1;
        var _interline_relation = [];
        for(var i = 0 ; i < group.proj_list.length; i++){
            var _proj = group.proj_list[i];
            var _row_node = {
                category:'OfNodes',
                isGroup:true,
                key:_key
            }
            _key++;
            item.nodeLinkData.nodeDataArray.push(_row_node);
            var _pre_key = undefined;
            for(var j = 0 ; j < _proj.phase_list.length; j++){
                item.node_length = item.node_length > j+1 ? item.node_length : j+1;
                var _phase = _proj.phase_list[j];
                var _col_node = {
                    key: _key ,
                    test:_phase.phase_cn_name,
                    isGroup:true,
                    category:'OfGroups',
                    time:j == 0 ? _proj.start_time : (j == _proj.phase_list.length-1 ? _proj.end_time:''),
                    group:_row_node.key
                }
                _key++;
                if(_phase.phase_status == 2){
                    var _node = {
                        key: _key ,
                        group:_col_node.key,
                        category:'executing',
                        slices: [
                            { start:-90, sweep: 360, color: "#CCC",radius:20,center:20 },
                            { start:-90, sweep: 360*0.01*_phase.phase_dynamic, color:"#2196f3",radius:20,center:20 },
                            { start:-90, sweep: 360, color: "#fafafa" ,radius:16,center:20 },
                        ],
                        row:i+1,
                        col:j+1,
                    }
                    _key++;
                }else{
                    var _node = {
                        key: _key ,
                        group:_col_node.key,
                        category:'noExecute',
                        row:i+1,
                        col:j+1,
                        status:_phase.phase_status
                    }
                    _key++;
                }
                if(_phase.rely_list && _phase.rely_list.length != 0){
                    for(var p = 0 ; p < _phase.rely_list.length; p++){
                        var _one_pre = _phase.rely_list[p];
                        _interline_relation.push({to:_node.key,business_sys_name:_one_pre.pre_sys_name,phase_id:_one_pre.pre_phase_id,to_row:p+1,to_col:j+1});
                    }
                }
                item.nodeLinkData.nodeDataArray.push(_col_node);
                item.nodeLinkData.nodeDataArray.push(_node);
                if(j != 0){
                    item.nodeLinkData.linkDataArray.push({from:_pre_key,to:_node.key,statue:_phase.phase_status,extra_flag:false});
                }
                _pre_key = _node.key;
            }
        }
        for(var i = 0 ; i < _interline_relation.length; i++){
            var key = 0;
            for(var j = 0 ; j < group.proj_list.length; j++){
                key++;
                var _proj = group.proj_list[j];
                for(var k = 0 ; k < _proj.phase_list.length; k++){
                    key = key+2;
                    if(_proj.business_sys_name == _interline_relation[i].business_sys_name && _proj.phase_list[k].phase_id == _interline_relation[i].phase_id){
                        item.nodeLinkData.linkDataArray.push({to:_interline_relation[i].to,
                            from:key,
                            statue:_proj.phase_list[k].phase_status,
                            extra_flag:true,
                            to_row:_interline_relation[i].to_row,
                            to_col:_interline_relation[i].to_col,
                            from_row:j+1,
                            from_col:k+1,
                        });
                    }
                }
            }
        }
        item.old_linkData = angular.copy(item.nodeLinkData.linkDataArray);
    };
    //获取流程定制项目阶段数据
    var getOneItemGroupData = function(item){
        $scope.control.data_loading = true;
        //获取计划编列基础信息
        Plan.getProjectPlanInfo(_publish_id).then(function (data) {
            if(data){
                console.log(data);
                item.group = {
                    proj_list : data.pubProSys_list ? data.pubProSys_list : []
                };
                dealLinkAndNode(item.group,item);
                $scope.control.data_loading = false;
            }
        },function (error) {
            $scope.control.data_loading = false;
            $scope.control.data_loading_error = true;
            Modal.alert(error.message,3);
        })
    };
    //页面初始化
    var init = function () {
        getOneItemGroupData($scope.info.item);
    };
    //保存流程定制
    $scope.saveProcess = function(item) {
        var _rebuild = [];
        for(var i = 0 ; i < item.nodeLinkData.linkDataArray.length; i++){
            if(!item.nodeLinkData.linkDataArray[i].statue || item.nodeLinkData.linkDataArray[i].extra_flag){
                var _node = {};
                for(var j = 0; j < item.nodeLinkData.nodeDataArray.length; j++) {
                    if(item.nodeLinkData.linkDataArray[i].from == item.nodeLinkData.nodeDataArray[j].key){
                        _node.row_from = item.nodeLinkData.nodeDataArray[j].row;
                        _node.col_from = item.nodeLinkData.nodeDataArray[j].col;
                    }
                    if(item.nodeLinkData.linkDataArray[i].to == item.nodeLinkData.nodeDataArray[j].key){
                        _node.row_to = item.nodeLinkData.nodeDataArray[j].row;
                        _node.col_to = item.nodeLinkData.nodeDataArray[j].col;
                    }
                }
                if(_node.row_from && _node.row_to){
                    _rebuild.push(_node);
                }
            }
        }
        //重置所有阶段的前后置关系
        for(var m=0;m<item.group.proj_list.length;m++){
            for(var n=0;n<item.group.proj_list[m].phase_list.length;n++){
                if(item.group.proj_list[m].phase_list[n].rely_list){
                    item.group.proj_list[m].phase_list[n].rely_list = [];
                }
            }
        }
        //处理新画的
        for(var l = 0 ; l < _rebuild.length; l++){
            var _pre_program_id = item.group.proj_list[_rebuild[l].row_from-1].publish_program_id;
            var _pre_sys_name = item.group.proj_list[_rebuild[l].row_from-1].business_sys_name;
            var _pre_phase_name = item.group.proj_list[_rebuild[l].row_from-1].phase_list[_rebuild[l].col_from-1].phase_cn_name;
            var _pre_phase_id = item.group.proj_list[_rebuild[l].row_from-1].phase_list[_rebuild[l].col_from-1].phase_id;
            if(!item.group.proj_list[_rebuild[l].row_to-1].phase_list[_rebuild[l].col_to-1].rely_list){
                item.group.proj_list[_rebuild[l].row_to-1].phase_list[_rebuild[l].col_to-1].rely_list = [];
            }
            item.group.proj_list[_rebuild[l].row_to-1].phase_list[_rebuild[l].col_to-1].rely_list.push({pre_phase_id:_pre_phase_id,pre_phase_name:_pre_phase_name,pre_sys_name:_pre_sys_name,pre_program_id:_pre_program_id});
        }
        $scope.control.process_loading = true;
        Plan.saveProjectPlanInfo(_publish_id,item.group.proj_list).then(function (data) {
            $scope.control.process_loading = false;
            Modal.alert("编排保存成功！",2);
            $state.go('proj_alive');
        },function (error) {
            $scope.control.process_loading = false;
            Modal.alert(error.message,3);
        })
    };
    //流程图左侧样式
    $scope.projStyle = function(index){
        return {
            'position': "absolute",
            'width':"124px",
            'top':index*145 +"px"
        }
    };

    init();
}]);

/**
 * 发布日历
 * */
planCtrl.controller('releaseCalendarCtrl', ["$scope","$timeout", "Plan","PubWindow", "Modal", "CV", function($scope,$timeout, Plan,PubWindow, Modal, CV) {
    //页面信息
    $scope.info = {
        eventSources:[]
    };
    //数据
    $scope.data = {
        pub_window_list :[]
    };
    //页面控制
    $scope.control = {

    };
    /*日历配置*/
    $scope.uiConfig = {
        calendar:{
            editable: false,
            selectable:false,
            eventLimit:3,
            firstDay: 1,
            showNonCurrentDates:false,
            aspectRatio:2.35,
            header:{
                left: 'title',
                right: 'today prev,next'
            },
            buttonText:{
                today: '今日',
            },
            events : function(start, end, timezone, callback){
                PubWindow.getPublishProjectByDate(CV.dtFormat(start._d),CV.dtFormat(end._d)).then(function (data) {
                    if(data.publish_window_list){
                        $scope.data.pub_window_list = data.publish_window_list ? processDate(data.publish_window_list) : [] ;
                        var _aTd = $(".fc-bg td[data-date]");
                        for(var i = 0; i < _aTd.length; i++) {
                            for (var m = 0; m < data.publish_window_list.length; m++) {
                                var _pub = data.publish_window_list[m];
                                if ($(_aTd[i]).attr("data-date").toString() == _pub.open_date) {
                                    if(_pub.window_status == 2){
                                        $(_aTd[i]).css({'background-color':'#46505e','color':'#fff'});
                                    }else{
                                        if(_pub.window_type == 1 ){
                                            $(_aTd[i]).css({'background-color':'#3bb8d5','color':'#fff'});
                                        }else if(_pub.window_type == 2){
                                            $(_aTd[i]).css({'background-color':'#E9416E','color':'#fff'});
                                        }
                                    }
                                }
                            }
                        };
                        callback($scope.data.pub_window_list);
                    }
                },function (error) {
                    Modal.alert(error.message,3)
                });
            },
            eventRender: function( event, element, view ) {
                element.attr({'title': event.title});
            },
            eventClick: function(event, jsEvent, view) {
                viewEventDetail(event);
            },
            loading : function (isLoading,view) {

            }
        }
    };

    //转化处理数据
    var processDate = function (list) {
        var _event = [];
        for(var j=0;j < list.length;j++){
            var _pub = list[j];
            var _y = new Date(_pub.open_date).getFullYear();
            var _m = new Date(_pub.open_date).getMonth();
            var _d = new Date(_pub.open_date).getDate();
            if(_pub.sys_publish_list){
                for(var k=0;k<_pub.sys_publish_list.length;k++){
                    var _proj =_pub.sys_publish_list[k];
                    _event.push({
                        title:_proj.pjpublish_name,
                        allDay:true,
                        start:new Date(_y,_m,_d),
                        className:'default-event-style',
                        pjpublish_id:_proj.pjpublish_id,
                        close_reason : _pub.close_reason});
                }
            }
        }
        return _event;
    };
    //日历事件弹窗
    var viewEventDetail = function (event) {
        Modal.viewWindowDetail(event)
    };
}]);

/**
 * 发布窗口设置
 * */
planCtrl.controller('pubWindowSetCtrl', ["$scope", "PubWindow", "Modal", "CV", function($scope, PubWindow, Modal, CV) {
    //页面信息
    $scope.info = {

    };
    //页面控制
    $scope.control = {

    };

    var init = function(){

    };

    init();
}]);
